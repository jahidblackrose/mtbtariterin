/**
 * Loan Step-by-Step API Service
 * API-driven loan application flow for Flutter integration
 */

import { ApiResponse } from "./api";

// Step Data Types
export interface PersonalInfoData {
  fullName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  nidNumber: string;
  mobileNumber: string;
  email: string;
  occupation: string;
}

export interface AddressData {
  presentAddress: string;
  presentCity: string;
  presentPostCode: string;
  permanentAddress: string;
  permanentCity: string;
  permanentPostCode: string;
  sameAsPresent: boolean;
  communicationAddress: "present" | "permanent";
}

export interface ExistingLoansData {
  hasExistingLoans: boolean;
  existingLoans: Array<{
    bankName: string;
    loanType: string;
    outstandingAmount: number;
    emi: number;
  }>;
}

export interface LoanDetailsData {
  loanAmount: number;
  tenure: number;
  purpose: string;
  monthlyIncome: number;
}

export interface LoanSummaryData {
  confirmed: boolean;
}

export interface FaceVerificationData {
  imageData: string;
  livenessScore: number;
  verified: boolean;
}

export interface TermsConditionsData {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  consentGiven: boolean;
}

export interface ApplicationResult {
  applicationId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  estimatedProcessingTime: string;
}

// API Request/Response Models for Flutter Integration
export interface StepRequest<T> {
  stepNumber: number;
  data: T;
  applicationId?: string;
}

export interface StepResponse<T = any> {
  success: boolean;
  stepNumber: number;
  data?: T;
  nextStep?: number;
  message?: string;
  validationErrors?: Record<string, string>;
}

// Prefill data structure
export interface PrefillData {
  personalInfo: Partial<PersonalInfoData>;
  addressInfo: Partial<AddressData>;
}

// Simulate network delay
const simulateDelay = (ms: number = 600): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 300));

// Step APIs
const stepApis = {
  // GET /api/loan/prefill - Get prefilled data from NID/account
  async getPrefillData(): Promise<ApiResponse<PrefillData>> {
    await simulateDelay();
    return {
      success: true,
      data: {
        personalInfo: {
          fullName: "Mohammad Rahman",
          fatherName: "Abdul Rahman",
          motherName: "Fatima Begum",
          dateOfBirth: "1990-05-15",
          nidNumber: "1234567890123",
          mobileNumber: "01712345678",
        },
        addressInfo: {
          presentAddress: "House 123, Road 5, Dhanmondi",
          presentCity: "Dhaka",
          presentPostCode: "1205",
        },
      },
    };
  },

  // POST /api/loan/step-1 - Personal Information
  async submitStep1(data: PersonalInfoData): Promise<ApiResponse<StepResponse>> {
    await simulateDelay();
    return {
      success: true,
      data: {
        success: true,
        stepNumber: 1,
        nextStep: 2,
        message: "Personal information saved successfully",
      },
    };
  },

  // POST /api/loan/step-2 - Address Details
  async submitStep2(data: AddressData): Promise<ApiResponse<StepResponse>> {
    await simulateDelay();
    return {
      success: true,
      data: {
        success: true,
        stepNumber: 2,
        nextStep: 3,
        message: "Address details saved successfully",
      },
    };
  },

  // POST /api/loan/step-3 - Existing Loans
  async submitStep3(data: ExistingLoansData): Promise<ApiResponse<StepResponse>> {
    await simulateDelay();
    return {
      success: true,
      data: {
        success: true,
        stepNumber: 3,
        nextStep: 4,
        message: "Existing loan information saved",
      },
    };
  },

  // POST /api/loan/step-4 - Loan Details
  async submitStep4(data: LoanDetailsData): Promise<ApiResponse<StepResponse<{
    emi: number;
    totalPayable: number;
    interestRate: number;
  }>>> {
    await simulateDelay();
    
    // Calculate EMI
    const interestRate = 12; // 12% per annum
    const monthlyRate = interestRate / 12 / 100;
    const emi = Math.round(
      (data.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, data.tenure)) /
      (Math.pow(1 + monthlyRate, data.tenure) - 1)
    );
    const totalPayable = emi * data.tenure;

    return {
      success: true,
      data: {
        success: true,
        stepNumber: 4,
        nextStep: 5,
        data: {
          emi,
          totalPayable,
          interestRate,
        },
        message: "Loan details calculated",
      },
    };
  },

  // POST /api/loan/step-5 - Summary Confirmation
  async submitStep5(data: LoanSummaryData): Promise<ApiResponse<StepResponse>> {
    await simulateDelay();
    return {
      success: true,
      data: {
        success: true,
        stepNumber: 5,
        nextStep: 6,
        message: "Loan summary confirmed",
      },
    };
  },

  // POST /api/loan/step-6 - Face Verification
  async submitStep6(data: FaceVerificationData): Promise<ApiResponse<StepResponse<{
    verificationId: string;
    matchScore: number;
  }>>> {
    await simulateDelay(1500);
    return {
      success: true,
      data: {
        success: true,
        stepNumber: 6,
        nextStep: 7,
        data: {
          verificationId: `face_${Date.now()}`,
          matchScore: 0.95,
        },
        message: "Face verification successful",
      },
    };
  },

  // POST /api/loan/step-7 - Terms & Conditions
  async submitStep7(data: TermsConditionsData): Promise<ApiResponse<StepResponse>> {
    await simulateDelay();
    return {
      success: true,
      data: {
        success: true,
        stepNumber: 7,
        nextStep: 8,
        message: "Terms and conditions accepted",
      },
    };
  },

  // POST /api/loan/step-8 - Final Submission
  async submitStep8(): Promise<ApiResponse<StepResponse<ApplicationResult>>> {
    await simulateDelay(1200);
    return {
      success: true,
      data: {
        success: true,
        stepNumber: 8,
        data: {
          applicationId: `TL${Date.now().toString().slice(-8)}`,
          status: "pending",
          submittedAt: new Date().toISOString(),
          estimatedProcessingTime: "24-48 hours",
        },
        message: "Application submitted successfully!",
      },
    };
  },
};

// Unified service for step submission with API status validation
export const loanStepService = {
  async getPrefillData() {
    return stepApis.getPrefillData();
  },

  async submitStep(stepNumber: number, data: any): Promise<ApiResponse<StepResponse<any>>> {
    let response: ApiResponse<StepResponse<any>>;
    
    switch (stepNumber) {
      case 1:
        response = await stepApis.submitStep1(data);
        break;
      case 2:
        response = await stepApis.submitStep2(data);
        break;
      case 3:
        response = await stepApis.submitStep3(data);
        break;
      case 4:
        response = await stepApis.submitStep4(data);
        break;
      case 5:
        response = await stepApis.submitStep5(data);
        break;
      case 6:
        response = await stepApis.submitStep6(data);
        break;
      case 7:
        response = await stepApis.submitStep7(data);
        break;
      case 8:
        response = await stepApis.submitStep8();
        break;
      default:
        return {
          success: false,
          message: "Invalid step number",
        };
    }

    // Validate API response - only proceed if success (simulates status 200 check)
    if (!response.success) {
      throw new Error(response.message || "API request failed");
    }
    
    return response;
  },
};

export default loanStepService;
