# Server Setup Guide

Reusable guide for setting up Judge0 + API Gateway on a new instance (e.g., Oracle Cloud, DigitalOcean).

**Current target:** Oracle Cloud `VM.Standard.E5.Flex` (1 OCPU, 12GB RAM, aarch64/ARM)

---

## Prerequisites

- SSH access to the instance
- Ports 2358 (Judge0) and 5001 (API Gateway) open at both the cloud firewall and OS level
- Docker, Python 3, and git installed

---

## 1. Firewall Configuration

### Oracle Cloud VCN Security List (cloud-level)

In OCI Console: **Networking > Virtual Cloud Networks > your VCN > Subnet > Security Lists**

Add stateful TCP ingress rules:
- Port **2358**, source `0.0.0.0/0` (Judge0)
- Port **5001**, source `0.0.0.0/0` (API Gateway)

### OS-level firewall (iptables)

Oracle Cloud images block non-SSH traffic by default even after VCN rules are opened.

**Ubuntu:**
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 5001 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 2358 -j ACCEPT
sudo netfilter-persistent save
```

**Oracle Linux (uses firewalld instead of iptables):**
```bash
sudo firewall-cmd --permanent --add-port=5001/tcp
sudo firewall-cmd --permanent --add-port=2358/tcp
sudo firewall-cmd --reload
```

---

## 2. Install System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 python3 python3-pip python3-venv git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# Log out and back in for group change to take effect
```

---

## 3. QEMU Emulation (ARM instances only)

Judge0 Docker images (`judge0/judge0:1.13.1`) are AMD64-only. On ARM (aarch64) instances, enable QEMU emulation:

```bash
docker run --privileged --rm tonistiigi/binfmt --install all
```

This persists across container restarts but **not across host reboots**. To make it persistent, add to `/etc/rc.local` or create a systemd oneshot service:

```bash
sudo tee /etc/systemd/system/binfmt-qemu.service > /dev/null <<'EOF'
[Unit]
Description=Register QEMU binfmt interpreters
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/bin/docker run --privileged --rm tonistiigi/binfmt --install all
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable binfmt-qemu
```

Skip this step on x86_64/AMD64 instances.

---

## 4. Clone the Repository

```bash
cd /opt
sudo git clone https://github.com/<your-username>/mycodeweapon.git
cd /opt/mycodeweapon
```

---

## 5. Judge0 Setup

```bash
cd /opt/mycodeweapon/judge0-server

# Create config from template
cp judge0.conf.example judge0.conf

# Generate and set passwords
REDIS_PW=$(openssl rand -base64 24)
POSTGRES_PW=$(openssl rand -base64 24)
sed -i "s/CHANGE_ME_REDIS_PASSWORD/$REDIS_PW/" judge0.conf
sed -i "s/CHANGE_ME_POSTGRES_PASSWORD/$POSTGRES_PW/" judge0.conf

# Start Judge0
docker compose up -d

# Verify all 4 containers are running
docker compose ps

# Test locally
curl http://localhost:2358/languages
curl http://localhost:2358/system_info
```

Wait 30-60 seconds for workers to initialize before testing.

### Verify external access

From your local machine:
```bash
curl http://<SERVER_IP>:2358/languages
```

If this fails, revisit firewall rules (Section 1).

---

## 6. API Gateway Setup

```bash
cd /opt/mycodeweapon/judge0-apigateway

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env
cat > .env <<'EOF'
JUDGE0_HOST=http://localhost:2358
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-service-key>
EOF

# Test manually
python app.py
# In another terminal: curl http://localhost:5001/ping
# Expected: "API Gateway V2 is running!"
```

### Install systemd service

```bash
sudo cp judge0-apigateway.service /etc/systemd/system/
# Edit paths in the service file if your repo isn't at /opt/mycodeweapon/
sudo systemctl daemon-reload
sudo systemctl enable --now judge0-apigateway
sudo systemctl status judge0-apigateway
```

### Verify external access

```bash
curl http://<SERVER_IP>:5001/ping
```

---

## 7. Cronjob Setup

Resets daily Judge0 submission counters at midnight.

```bash
cd /opt/mycodeweapon/cronjobs

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env
cat > .env <<'EOF'
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-service-key>
EOF

# Test manually
python resetJudge0Usage.py
```

Add crontab entry:
```bash
crontab -e
```

```
0 0 * * * cd /opt/mycodeweapon/cronjobs && /opt/mycodeweapon/cronjobs/venv/bin/python resetJudge0Usage.py >> /var/log/judge0-reset.log 2>&1
```

---

## 8. Verification Checklist

Run these checks in order:

```bash
# 1. Judge0 direct
curl http://<SERVER_IP>:2358/languages

# 2. API Gateway health
curl http://<SERVER_IP>:5001/ping

# 3. End-to-end submission
curl -X POST "http://<SERVER_IP>:5001/judge0/submissions?wait=true" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-123" \
  -d '{"source_code": "print(\"hello\")", "language_id": 71}'
```

Expected: JSON response with `stdout` containing `hello`.

---

## 9. Frontend Environment Variables (Vercel)

After the server is verified, update in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `JUDGE0_API_GATEWAY` | `http://<SERVER_IP>:5001` |
| `JUDGE0_URL` | `http://<SERVER_IP>:2358` |

Trigger a redeployment for changes to take effect.

---

## 10. Deploying Updates

After pushing changes to `main`, SSH into the server and run:

```bash
cd /opt/mycodeweapon
./deploy.sh
```

This pulls latest code and restarts the API Gateway service.

---

## Decommissioning the Old Server

After 3-7 days of parallel operation:

1. Stop services on the old server
2. Back up any `.env` files you want to keep
3. Destroy the old instance
