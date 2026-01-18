/**
 * Secure API Client with Token Management
 * Handles x-api-key generation, refresh, and secure request handling
 */

// API Configuration - uses environment variable, no hardcoded URLs
const getBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    console.warn('VITE_API_BASE_URL not configured, API calls will fail');
    return '';
  }
  return baseUrl;
};

// Token storage in memory only (never in localStorage/UI/logs)
let apiKey: string | null = null;
let tokenExpiresAt: number | null = null;
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

// Session storage for application context (in-memory only)
interface SessionContext {
  applicationId: string | null;
  customerId: string | null;
  accountNumber: string | null;
  regiref: string | null;
  loginId: string | null;
  otpref: string | null;
  mobileNumber: string | null;
  cif: string | null;
}

let sessionContext: SessionContext = {
  applicationId: null,
  customerId: null,
  accountNumber: null,
  regiref: null,
  loginId: null,
  otpref: null,
  mobileNumber: null,
  cif: null,
};

// API Response Types
export interface ApiResponse<T = any> {
  status: string;
  message: string;
  data?: T;
  [key: string]: any;
}

export interface ApiError {
  status: string;
  message: string;
  code?: string;
}

// Token Response Type
interface TokenResponse {
  status: string;
  message: string;
  token?: string;
  expiresIn?: number;
}

/**
 * Generate/fetch x-api-key from the token endpoint
 * Called automatically before any API request if token is missing/expired
 */
async function fetchApiToken(): Promise<string> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error('API base URL not configured');
  }

  try {
    const response = await fetch(`${baseUrl}/ekyc/api/v1/Registration/gettoken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Token fetch failed with status: ${response.status}`);
    }

    const data: TokenResponse = await response.json();
    
    if (data.status !== '200' || !data.token) {
      throw new Error(data.message || 'Failed to obtain API token');
    }

    // Store token in memory only
    apiKey = data.token;
    
    // Set expiration (default 1 hour if not specified)
    const expiresIn = data.expiresIn || 3600;
    tokenExpiresAt = Date.now() + (expiresIn * 1000);

    return apiKey;
  } catch (error: any) {
    // Clear any stale token
    apiKey = null;
    tokenExpiresAt = null;
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

/**
 * Check if token needs refresh
 */
function isTokenExpired(): boolean {
  if (!apiKey || !tokenExpiresAt) return true;
  return Date.now() >= tokenExpiresAt - TOKEN_REFRESH_BUFFER_MS;
}

/**
 * Ensure we have a valid API token
 */
async function ensureValidToken(): Promise<string> {
  if (isTokenExpired()) {
    return await fetchApiToken();
  }
  return apiKey!;
}

/**
 * Clear all tokens (for logout/session end)
 */
export function clearTokens(): void {
  apiKey = null;
  tokenExpiresAt = null;
  sessionContext = {
    applicationId: null,
    customerId: null,
    accountNumber: null,
    regiref: null,
    loginId: null,
    otpref: null,
    mobileNumber: null,
    cif: null,
  };
}

/**
 * Get session context (read-only)
 */
export function getSessionContext(): Readonly<SessionContext> {
  return { ...sessionContext };
}

/**
 * Update session context
 */
export function updateSessionContext(updates: Partial<SessionContext>): void {
  sessionContext = { ...sessionContext, ...updates };
}

/**
 * Main HTTP request function with automatic token management
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, any>;
    headers?: Record<string, string>;
    skipAuth?: boolean;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'POST', body, headers = {}, skipAuth = false } = options;
  const baseUrl = getBaseUrl();
  
  if (!baseUrl) {
    return {
      status: '500',
      message: 'API base URL not configured. Please set VITE_API_BASE_URL.',
    };
  }

  try {
    // Get valid token unless explicitly skipped
    let token: string | undefined;
    if (!skipAuth) {
      token = await ensureValidToken();
    }

    // Build secure headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add API key header securely
    if (token) {
      requestHeaders['x-api-key'] = token;
    }

    // Make the request
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parse response
    const data = await response.json();

    // Check for token expiration errors and retry
    if (data.status === '401' || data.message?.toLowerCase().includes('token expired')) {
      // Force token refresh
      apiKey = null;
      tokenExpiresAt = null;
      
      // Retry once with new token
      const newToken = await fetchApiToken();
      requestHeaders['x-api-key'] = newToken;
      
      const retryResponse = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      return await retryResponse.json();
    }

    return data;
  } catch (error: any) {
    // Never log sensitive data
    return {
      status: '500',
      message: error.message || 'Network error occurred',
    };
  }
}

/**
 * Check if API response indicates success
 */
export function isSuccessResponse(response: ApiResponse): boolean {
  return response.status === '200' && response.message?.toLowerCase() === 'success';
}

/**
 * Check if API is configured
 */
export function isApiConfigured(): boolean {
  return !!import.meta.env.VITE_API_BASE_URL;
}

export default {
  apiRequest,
  clearTokens,
  getSessionContext,
  updateSessionContext,
  isSuccessResponse,
  isApiConfigured,
};
