// Postgres Tables
export const PROBLEMS_TABLE: string = "problems";
export const USERS_TABLE: string = "users";
export const JUDGE0_TABLE: string = "judge0_tokens";
export const AI_CONFIG_TABLE: string = "ai_configs";
export const GEMINI_CONFIG_TABLE: string = "gemini_config";

// Object Storage Buckets
export const PROBLEM_IMAGE_BUCKET: string = "problemImages";
export const MAXIMUM_IMAGE_SIZE_KB: number = 300; //kB

// error codes to rendered messages
const authErrorCodes: Record<string, string> = {
  // Authentication errors
  invalid_credentials: "Invalid email or password",
  user_not_found: "No account found with this email",
  invalid_email: "Please enter a valid email address",
  weak_password:
    "Password must be at least 8 characters long and contain at least one number",
  email_taken: "An account with this email already exists",

  // Account verification errors
  invalid_claim: "Unable to verify your account",
  email_not_confirmed: "Please verify your email address",

  // Provider errors
  provider_error: "Error connecting to authentication provider",
  auth_closed: "Authentication window was closed",

  // Technical errors
  network_error:
    "Unable to connect to the server. Please check your internet connection",
  rate_limit_exceeded: "Too many attempts. Please try again later",
  session_expired: "Your session has expired. Please sign in again",

  // MFA/OTP errors
  invalid_otp: "Invalid verification code",

  // System errors
  auth_disabled: "Authentication is currently disabled",
  password_mismatch: "Passwords do not match",
  invalid_token: "Invalid or expired token",
};

// utility function
export const displayErrorCode = (errorCode: string): string => {
  const key = errorCode;
  return (
    authErrorCodes[key] || "An unexpected error occurred. Please try again"
  );
};
