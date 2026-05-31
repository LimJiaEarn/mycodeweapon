import os
import json
from flask import Flask, request, Response
from flask_cors import CORS
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# Judge0 configuration
JUDGE0_HOST = os.getenv('JUDGE0_HOST')

# Supabase config
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
if not SUPABASE_URL or not SUPABASE_KEY or not JUDGE0_HOST:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY or JUDGE0_HOST in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SUPABASE_RATE_LIMIT_TABLE = "judge0_tokens"
DEFAULT_RATE_LIMIT = 100

@app.route('/ping', methods=['GET'])
def test():
    return Response("API Gateway V2 is running!", 200)

@app.route('/judge0/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy(path):

    # Validate the request body
    body = request.get_json(silent=True) or {}
    userId = request.headers.get('X-User-Id', '-')
    if userId == "-":
        return Response(
            json.dumps({"error": "Missing X-User-Id header"}),
            status=400,
            mimetype='application/json'
        )

    # Check rate limit for /submissions route (code execution)
    if path.startswith('submissions'):
        try:
            result = supabase.table(SUPABASE_RATE_LIMIT_TABLE).select("*").eq("userId", userId).execute()
            
            if not result.data:
                supabase.table(SUPABASE_RATE_LIMIT_TABLE).insert({
                    'userId': userId,
                    'daylimit': DEFAULT_RATE_LIMIT,
                    'usage': 1
                }).execute()
                
            else:
                # Check if user has exceeded their limit
                data = result.data[0]
                if data['usage'] >= data['daylimit']:
                    return Response(
                        json.dumps({"error": f"Daily limit of {data['daylimit']} submissions exceeded. Try again later."}),
                        status=429,
                        mimetype='application/json'
                    )
                
                # update usage
                supabase.table(SUPABASE_RATE_LIMIT_TABLE) \
                    .update({'usage': data['usage'] + 1}) \
                    .eq('userId', userId) \
                    .execute()

        except Exception as e:
            return Response(
                json.dumps({"error": f"Error checking rate limit: {str(e)}"}),
                status=500,
                mimetype='application/json'
            )

    # Forward request to Judge0
    try:

        # Get query parameters
        query_params = request.args.to_dict()
        url = f"{JUDGE0_HOST}/{path}"
        if query_params:
            query_string = "&".join(f"{k}={v}" for k, v in query_params.items())
            url = f"{url}?{query_string}"

        resp = requests.request(
            method=request.method,
            url=url,
            headers=request.headers,
            json=body,
            cookies=request.cookies,
            allow_redirects=False
        )

        # Handle submission with wait=true
        if path.startswith('submissions') and query_params.get('wait') == 'true':
            return Response(
                resp.content,
                resp.status_code,
                mimetype='application/json'
            )
        
        # exclude some headers from being forwarded
        EXCLUDED_HEADERS = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(name, value) for (name, value) in resp.raw.headers.items()
                   if name.lower() not in EXCLUDED_HEADERS]
        
        return Response(resp.content, resp.status_code, headers)

    except requests.exceptions.RequestException as e:
        app.logger.error(f"Proxy error: {str(e)}")
        return Response(
            json.dumps({"error": f"Error connecting to Judge0: {str(e)}"}),
            status=502,
            mimetype='application/json'
        )
    except Exception as e:
        app.logger.error(f"General error: {str(e)}")
        return Response(
            json.dumps({"error": f"Internal server error: {str(e)}"}),
            status=500,
            mimetype='application/json'
        )

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return Response(
        json.dumps({"error": "Not found", "exception": str(e)}),
        status=404,
        mimetype='application/json'
    )

@app.errorhandler(500)
def internal_error(e):
    return Response(
        json.dumps({"error": "Internal server error", "exception": str(e)}),
        status=500,
        mimetype='application/json'
    )

if __name__ == '__main__':
    
    # Running on port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)