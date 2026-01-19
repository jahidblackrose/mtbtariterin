/**
 * API Client with Session Management
 * Handles secure request handling and session context
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

/**
 * Clear session data (for logout/session end)
 */
export function clearSession(): void {
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
 * Main HTTP request function
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, any>;
    headers?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'POST', body, headers = {} } = options;
  const baseUrl = getBaseUrl();
  
  if (!baseUrl) {
    return {
      status: '500',
      message: 'API base URL not configured. Please set VITE_API_BASE_URL.',
    };
  }

  try {
    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Make the request
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parse response
    const data = await response.json();
    return data;
  } catch (error: any) {
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
  clearSession,
  getSessionContext,
  updateSessionContext,
  isSuccessResponse,
  isApiConfigured,
};
