/**
 * API Service Layer for Banking Application
 * Handles all API calls with proper error handling and loading states
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface OtpSendResponse {
  otpId: string;
  expiresAt: string;
  maskedNumber: string;
}

export interface OtpVerifyResponse {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface LoginResponse {
  sessionId: string;
  requiresOtp: boolean;
  maskedNumber: string;
}

// Error Types
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// Error Messages
export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_OTP: 'The OTP you entered is incorrect. Please try again.',
  EXPIRED_OTP: 'This OTP has expired. Please request a new one.',
  TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please try again later.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again.',
  ACCOUNT_NOT_FOUND: 'Account not found. Please check your details.',
  INVALID_CREDENTIALS: 'Invalid credentials. Please check and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  RATE_LIMITED: 'Too many requests. Please wait before trying again.',
};

// HTTP Client
async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || ERROR_MESSAGES.SERVER_ERROR,
        data.code || 'SERVER_ERROR',
        response.status
      );
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR', 0);
    }
    
    throw new ApiError(ERROR_MESSAGES.SERVER_ERROR, 'UNKNOWN_ERROR', 500);
  }
}

// Auth Service
export const authService = {
  /**
   * Initiate login with account number or mobile number
   */
  async login(credentials: { accountNumber?: string; mobileNumber?: string }): Promise<ApiResponse<LoginResponse>> {
    return httpRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Logout and invalidate session
   */
  async logout(): Promise<ApiResponse<void>> {
    const result = await httpRequest<void>('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('auth_token');
    return result;
  },
};

// OTP Service
export const otpService = {
  /**
   * Send OTP to registered mobile number
   */
  async sendOtp(params: { 
    accountNumber?: string; 
    mobileNumber?: string;
    purpose?: 'login' | 'verification' | 'transaction';
  }): Promise<ApiResponse<OtpSendResponse>> {
    return httpRequest<OtpSendResponse>('/otp/send', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Verify OTP
   */
  async verifyOtp(params: { 
    otp: string; 
    otpId?: string;
    accountNumber?: string;
    mobileNumber?: string;
  }): Promise<ApiResponse<OtpVerifyResponse>> {
    return httpRequest<OtpVerifyResponse>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Resend OTP
   */
  async resendOtp(params: { 
    otpId?: string;
    accountNumber?: string; 
    mobileNumber?: string;
  }): Promise<ApiResponse<OtpSendResponse>> {
    return httpRequest<OtpSendResponse>('/otp/resend', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// Loan Service
export const loanService = {
  /**
   * Get user's loan accounts
   */
  async getLoans(): Promise<ApiResponse<any[]>> {
    return httpRequest<any[]>('/loans', {
      method: 'GET',
    });
  },

  /**
   * Apply for a new loan
   */
  async applyLoan(application: any): Promise<ApiResponse<any>> {
    return httpRequest<any>('/loans/apply', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  },

  /**
   * Get loan details
   */
  async getLoanDetails(loanId: string): Promise<ApiResponse<any>> {
    return httpRequest<any>(`/loans/${loanId}`, {
      method: 'GET',
    });
  },

  /**
   * Close a loan
   */
  async closeLoan(loanId: string): Promise<ApiResponse<any>> {
    return httpRequest<any>(`/loans/${loanId}/close`, {
      method: 'POST',
    });
  },
};

export default {
  auth: authService,
  otp: otpService,
  loan: loanService,
};
