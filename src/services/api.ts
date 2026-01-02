/**
 * API Service Layer for Banking Application
 * Dummy API implementation for end-to-end testing
 * Easily replaceable with real APIs
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_DUMMY_API = !import.meta.env.VITE_API_BASE_URL;

// Validation Rules
export const VALIDATION_RULES = {
  mobileNumber: {
    length: 11,
    pattern: /^01[3-9]\d{8}$/,
    message: 'Mobile number must be exactly 11 digits starting with 01',
  },
  accountNumber: {
    length: 13,
    pattern: /^\d{13}$/,
    message: 'Account number must be exactly 13 digits',
  },
  otp: {
    length: 6,
    pattern: /^\d{6}$/,
    validCode: '123456', // Dummy valid OTP
    message: 'OTP must be exactly 6 digits',
  },
};

// Validation Functions
export const validateMobileNumber = (mobile: string): { valid: boolean; error?: string } => {
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length !== VALIDATION_RULES.mobileNumber.length) {
    return { valid: false, error: `Mobile number must be exactly ${VALIDATION_RULES.mobileNumber.length} digits` };
  }
  if (!cleaned.startsWith('01')) {
    return { valid: false, error: 'Mobile number must start with 01' };
  }
  if (!VALIDATION_RULES.mobileNumber.pattern.test(cleaned)) {
    return { valid: false, error: VALIDATION_RULES.mobileNumber.message };
  }
  return { valid: true };
};

export const validateAccountNumber = (account: string): { valid: boolean; error?: string } => {
  const cleaned = account.replace(/\D/g, '');
  if (cleaned.length !== VALIDATION_RULES.accountNumber.length) {
    return { valid: false, error: `Account number must be exactly ${VALIDATION_RULES.accountNumber.length} digits` };
  }
  if (!VALIDATION_RULES.accountNumber.pattern.test(cleaned)) {
    return { valid: false, error: VALIDATION_RULES.accountNumber.message };
  }
  return { valid: true };
};

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

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  accountNumber: string;
}

export interface LoanApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  tenure: number;
  createdAt: string;
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
  INVALID_MOBILE: 'Invalid mobile number format.',
  INVALID_ACCOUNT: 'Invalid account number format.',
  LIVENESS_FAILED: 'Face liveness check failed. Please try again with a real-time selfie.',
};

// Simulate network delay
const simulateDelay = (ms: number = 800): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms + Math.random() * 400));

// Dummy API Implementation
const dummyApi = {
  auth: {
    async login(credentials: { accountNumber?: string; mobileNumber?: string }): Promise<ApiResponse<LoginResponse>> {
      await simulateDelay();
      
      // Validate inputs
      if (credentials.mobileNumber) {
        const validation = validateMobileNumber(credentials.mobileNumber);
        if (!validation.valid) {
          throw new ApiError(validation.error!, 'INVALID_MOBILE', 400);
        }
      }
      
      if (credentials.accountNumber) {
        const validation = validateAccountNumber(credentials.accountNumber);
        if (!validation.valid) {
          throw new ApiError(validation.error!, 'INVALID_ACCOUNT', 400);
        }
      }

      const maskedNumber = credentials.mobileNumber
        ? credentials.mobileNumber.replace(/(\d{4})\d{4}(\d{3})/, '$1****$2')
        : credentials.accountNumber?.replace(/(\d{4})\d{6}(\d{3})/, '$1******$2') || '****';

      return {
        success: true,
        data: {
          sessionId: `session_${Date.now()}`,
          requiresOtp: true,
          maskedNumber,
        },
      };
    },

    async logout(): Promise<ApiResponse<void>> {
      await simulateDelay(400);
      localStorage.removeItem('auth_token');
      return { success: true };
    },

    async getProfile(): Promise<ApiResponse<UserProfile>> {
      await simulateDelay();
      return {
        success: true,
        data: {
          id: 'user_123',
          name: 'Test User',
          mobile: '01712345678',
          accountNumber: '1234567890123',
        },
      };
    },
  },

  otp: {
    async send(params: { 
      accountNumber?: string; 
      mobileNumber?: string;
      purpose?: 'login' | 'verification' | 'transaction';
    }): Promise<ApiResponse<OtpSendResponse>> {
      await simulateDelay();

      // Validate inputs
      if (params.mobileNumber) {
        const validation = validateMobileNumber(params.mobileNumber);
        if (!validation.valid) {
          throw new ApiError(validation.error!, 'INVALID_MOBILE', 400);
        }
      }

      if (params.accountNumber) {
        const validation = validateAccountNumber(params.accountNumber);
        if (!validation.valid) {
          throw new ApiError(validation.error!, 'INVALID_ACCOUNT', 400);
        }
      }

      const maskedNumber = params.mobileNumber
        ? params.mobileNumber.replace(/(\d{4})\d{4}(\d{3})/, '$1****$2')
        : params.accountNumber?.replace(/(\d{4})\d{6}(\d{3})/, '$1******$2') || '****';

      return {
        success: true,
        data: {
          otpId: `otp_${Date.now()}`,
          expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
          maskedNumber,
        },
        message: 'OTP sent successfully',
      };
    },

    async verify(params: { 
      otp: string; 
      otpId?: string;
      accountNumber?: string;
      mobileNumber?: string;
    }): Promise<ApiResponse<OtpVerifyResponse>> {
      await simulateDelay();

      // Validate OTP format
      if (!VALIDATION_RULES.otp.pattern.test(params.otp)) {
        throw new ApiError('Invalid OTP format', 'INVALID_OTP', 400);
      }

      // Check if OTP matches the valid dummy code
      if (params.otp !== VALIDATION_RULES.otp.validCode) {
        throw new ApiError(ERROR_MESSAGES.INVALID_OTP, 'INVALID_OTP', 401);
      }

      return {
        success: true,
        data: {
          token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'user_123',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        message: 'OTP verified successfully',
      };
    },

    async resend(params: { 
      otpId?: string;
      accountNumber?: string; 
      mobileNumber?: string;
    }): Promise<ApiResponse<OtpSendResponse>> {
      await simulateDelay();

      const maskedNumber = params.mobileNumber
        ? params.mobileNumber.replace(/(\d{4})\d{4}(\d{3})/, '$1****$2')
        : params.accountNumber?.replace(/(\d{4})\d{6}(\d{3})/, '$1******$2') || '****';

      return {
        success: true,
        data: {
          otpId: `otp_${Date.now()}`,
          expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
          maskedNumber,
        },
        message: 'OTP resent successfully',
      };
    },
  },

  loan: {
    async getLoans(): Promise<ApiResponse<LoanApplication[]>> {
      await simulateDelay();
      return {
        success: true,
        data: [
          {
            id: 'loan_001',
            status: 'approved',
            amount: 50000,
            tenure: 12,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    },

    async apply(application: any): Promise<ApiResponse<LoanApplication>> {
      await simulateDelay(1200);
      return {
        success: true,
        data: {
          id: `loan_${Date.now()}`,
          status: 'pending',
          amount: application.amount || 50000,
          tenure: application.tenure || 12,
          createdAt: new Date().toISOString(),
        },
        message: 'Loan application submitted successfully',
      };
    },

    async getLoanDetails(loanId: string): Promise<ApiResponse<LoanApplication>> {
      await simulateDelay();
      return {
        success: true,
        data: {
          id: loanId,
          status: 'approved',
          amount: 50000,
          tenure: 12,
          createdAt: new Date().toISOString(),
        },
      };
    },

    async close(loanId: string): Promise<ApiResponse<any>> {
      await simulateDelay(1000);
      return {
        success: true,
        data: {
          loanId,
          closedAt: new Date().toISOString(),
          settlementAmount: 52500,
        },
        message: 'Loan closed successfully',
      };
    },
  },

  faceVerification: {
    async verifyLiveness(imageData: string): Promise<ApiResponse<{ verified: boolean; confidence: number }>> {
      await simulateDelay(1500);
      
      // Simulate liveness verification
      // In production, this would call actual face liveness API
      return {
        success: true,
        data: {
          verified: true,
          confidence: 0.95,
        },
        message: 'Face liveness verified',
      };
    },

    async verifyFace(imageData: string, referenceId?: string): Promise<ApiResponse<{ matched: boolean; similarity: number }>> {
      await simulateDelay(2000);
      
      return {
        success: true,
        data: {
          matched: true,
          similarity: 0.92,
        },
        message: 'Face verified successfully',
      };
    },
  },
};

// HTTP Client for real API
async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

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
  async login(credentials: { accountNumber?: string; mobileNumber?: string }): Promise<ApiResponse<LoginResponse>> {
    if (USE_DUMMY_API) {
      return dummyApi.auth.login(credentials);
    }
    return httpRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout(): Promise<ApiResponse<void>> {
    if (USE_DUMMY_API) {
      return dummyApi.auth.logout();
    }
    const result = await httpRequest<void>('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('auth_token');
    return result;
  },

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    if (USE_DUMMY_API) {
      return dummyApi.auth.getProfile();
    }
    return httpRequest<UserProfile>('/auth/profile', {
      method: 'GET',
    });
  },
};

// OTP Service
export const otpService = {
  async sendOtp(params: { 
    accountNumber?: string; 
    mobileNumber?: string;
    purpose?: 'login' | 'verification' | 'transaction';
  }): Promise<ApiResponse<OtpSendResponse>> {
    if (USE_DUMMY_API) {
      return dummyApi.otp.send(params);
    }
    return httpRequest<OtpSendResponse>('/otp/send', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async verifyOtp(params: { 
    otp: string; 
    otpId?: string;
    accountNumber?: string;
    mobileNumber?: string;
  }): Promise<ApiResponse<OtpVerifyResponse>> {
    if (USE_DUMMY_API) {
      return dummyApi.otp.verify(params);
    }
    return httpRequest<OtpVerifyResponse>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async resendOtp(params: { 
    otpId?: string;
    accountNumber?: string; 
    mobileNumber?: string;
  }): Promise<ApiResponse<OtpSendResponse>> {
    if (USE_DUMMY_API) {
      return dummyApi.otp.resend(params);
    }
    return httpRequest<OtpSendResponse>('/otp/resend', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// Loan Service
export const loanService = {
  async getLoans(): Promise<ApiResponse<LoanApplication[]>> {
    if (USE_DUMMY_API) {
      return dummyApi.loan.getLoans();
    }
    return httpRequest<LoanApplication[]>('/loans', {
      method: 'GET',
    });
  },

  async applyLoan(application: any): Promise<ApiResponse<LoanApplication>> {
    if (USE_DUMMY_API) {
      return dummyApi.loan.apply(application);
    }
    return httpRequest<LoanApplication>('/loans/apply', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  },

  async getLoanDetails(loanId: string): Promise<ApiResponse<LoanApplication>> {
    if (USE_DUMMY_API) {
      return dummyApi.loan.getLoanDetails(loanId);
    }
    return httpRequest<LoanApplication>(`/loans/${loanId}`, {
      method: 'GET',
    });
  },

  async closeLoan(loanId: string): Promise<ApiResponse<any>> {
    if (USE_DUMMY_API) {
      return dummyApi.loan.close(loanId);
    }
    return httpRequest<any>(`/loans/${loanId}/close`, {
      method: 'POST',
    });
  },
};

// Face Verification Service
export const faceVerificationService = {
  async verifyLiveness(imageData: string): Promise<ApiResponse<{ verified: boolean; confidence: number }>> {
    if (USE_DUMMY_API) {
      return dummyApi.faceVerification.verifyLiveness(imageData);
    }
    return httpRequest<{ verified: boolean; confidence: number }>('/face/liveness', {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    });
  },

  async verifyFace(imageData: string, referenceId?: string): Promise<ApiResponse<{ matched: boolean; similarity: number }>> {
    if (USE_DUMMY_API) {
      return dummyApi.faceVerification.verifyFace(imageData, referenceId);
    }
    return httpRequest<{ matched: boolean; similarity: number }>('/face/verify', {
      method: 'POST',
      body: JSON.stringify({ image: imageData, referenceId }),
    });
  },
};

export default {
  auth: authService,
  otp: otpService,
  loan: loanService,
  faceVerification: faceVerificationService,
};
