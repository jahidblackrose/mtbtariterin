/**
 * Custom hook for Loan Application API integration
 * Provides loading states, error handling, and API-driven form management
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  loanApplicationApi,
  ValidateCustomerRequest,
  ValidateOtpRequest,
  SavePersonalDataRequest,
  SaveContactDetailsRequest,
  SaveOtherBankLiabilityRequest,
  SaveLoanInfoRequest,
  FaceMatchRequest,
  GetEmiAmountRequest,
} from '@/services/loanApplicationApi';
import { 
  isSuccessResponse, 
  getSessionContext, 
  updateSessionContext,
  isApiConfigured,
  clearTokens,
} from '@/services/apiClient';

export interface ApiState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export function useLoanApi() {
  const [state, setState] = useState<ApiState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const resetState = useCallback(() => {
    setState({ isLoading: false, error: null, isSuccess: false });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false, isSuccess: false }));
    if (error) {
      toast.error(error);
    }
  }, []);

  const setSuccess = useCallback(() => {
    setState({ isLoading: false, error: null, isSuccess: true });
  }, []);

  // Check if API is configured
  const checkApiConfigured = useCallback((): boolean => {
    if (!isApiConfigured()) {
      setError('API not configured. Please contact support.');
      return false;
    }
    return true;
  }, [setError]);

  // ============ Registration & OTP ============\

  const validateCustomer = useCallback(async (data: ValidateCustomerRequest) => {
    if (!checkApiConfigured()) return null;
    
    setLoading(true);
    resetState();
    
    try {
      const response = await loanApplicationApi.validateCustomer(data);
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return response;
      } else {
        setError(response.message || 'Validation failed');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    }
  }, [checkApiConfigured, setLoading, resetState, setSuccess, setError]);

  const validateOtp = useCallback(async (data: ValidateOtpRequest) => {
    if (!checkApiConfigured()) return null;
    
    setLoading(true);
    
    try {
      const response = await loanApplicationApi.validateOtp(data);
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return response;
      } else {
        setError(response.message || 'OTP verification failed');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  const resendOtp = useCallback(async () => {
    if (!checkApiConfigured()) return null;
    
    const session = getSessionContext();
    if (!session.regiref || !session.loginId) {
      setError('Session expired. Please restart the application.');
      return null;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.resendOtp({
        otpmedium: 'B',
        email: '',
        mobilenumber: '',
        regiref: session.regiref,
        loginid: session.loginId,
        apicode: '',
        modulename: '',
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        toast.success('OTP sent successfully');
        return response;
      } else {
        setError(response.message || 'Failed to resend OTP');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  // ============ Personal Info ============\

  const savePersonalData = useCallback(async (data: Omit<SavePersonalDataRequest, 'applicationid' | 'cif'>) => {
    if (!checkApiConfigured()) return false;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return false;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.savePersonalData({
        ...data,
        applicationid: session.applicationId,
        cif: session.cif || '',
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return true;
      } else {
        setError(response.message || 'Failed to save personal data');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return false;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  // ============ Contact/Address ============\

  const saveContactDetails = useCallback(async (data: Omit<SaveContactDetailsRequest, 'applicationid' | 'cif'>) => {
    if (!checkApiConfigured()) return false;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return false;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.saveContactDetails({
        ...data,
        applicationid: session.applicationId,
        cif: session.cif || '',
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return true;
      } else {
        setError(response.message || 'Failed to save contact details');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return false;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  // ============ Other Bank Liability ============\

  const saveOtherBankLiability = useCallback(async (data: Omit<SaveOtherBankLiabilityRequest, 'applicationid'>) => {
    if (!checkApiConfigured()) return false;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return false;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.saveOtherBankLiability({
        ...data,
        applicationid: session.applicationId,
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        toast.success('Liability saved successfully');
        return true;
      } else {
        setError(response.message || 'Failed to save liability');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return false;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  const getOtherBankLiability = useCallback(async () => {
    if (!checkApiConfigured()) return null;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return null;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.getOtherBankLiability(session.applicationId);
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return response.dataList || [];
      } else {
        setError(response.message || 'Failed to fetch liabilities');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  const deleteOtherBankLiability = useCallback(async (liabilityid: string) => {
    if (!checkApiConfigured()) return false;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return false;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.deleteOtherBankLiability(
        liabilityid,
        session.applicationId
      );
      
      if (isSuccessResponse(response)) {
        setSuccess();
        toast.success('Liability deleted successfully');
        return true;
      } else {
        setError(response.message || 'Failed to delete liability');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return false;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  const completeLiabilityStep = useCallback(async () => {
    if (!checkApiConfigured()) return false;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return false;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.saveOtherBankLiabilityComplete(session.applicationId);
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return true;
      } else {
        setError(response.message || 'Failed to complete step');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return false;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  // ============ Loan Info ============\

  const getMaxLoanAmount = useCallback(async () => {
    if (!checkApiConfigured()) return null;
    
    const session = getSessionContext();
    if (!session.applicationId || !session.accountNumber) {
      setError('Session data missing. Please restart.');
      return null;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.getMaxLoanAmount({
        accountnumber: session.accountNumber,
        multipleacno: '',
        applicationid: session.applicationId,
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return {
          maxAmount: parseFloat(response.maxloanamount || '0'),
          rate: parseFloat(response.rate || '12'),
        };
      } else {
        setError(response.message || 'Failed to get max loan amount');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  const getEmiAmount = useCallback(async (principalamount: string, tenor: string) => {
    if (!checkApiConfigured()) return null;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return null;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.getEmiAmount({
        applicationid: session.applicationId,
        principalamount,
        rate: '',
        tenor,
        apicode: '',
        userterminal: '',
        modulename: '',
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return parseFloat(response.emiamount || '0');
      } else {
        setError(response.message || 'Failed to calculate EMI');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  const saveLoanInfo = useCallback(async (data: Omit<SaveLoanInfoRequest, 'applicationid'>) => {
    if (!checkApiConfigured()) return false;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return false;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.saveLoanInfo({
        ...data,
        applicationid: session.applicationId,
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return true;
      } else {
        setError(response.message || 'Failed to save loan info');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return false;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  // ============ Face Verification ============\

  const verifyFace = useCallback(async (imagedata: string, nidnumber?: string) => {
    if (!checkApiConfigured()) return null;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return null;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.faceMatchWithLiveImage({
        applicationid: session.applicationId,
        imagedata,
        nidnumber,
        cif: session.cif || '',
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return {
          matchScore: response.matchscore || 0,
          verified: response.verified || false,
        };
      } else {
        setError(response.message || 'Face verification failed');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  // ============ Application Submission ============\

  const fetchAllData = useCallback(async () => {
    if (!checkApiConfigured()) return null;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return null;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.fetchAllData({
        applicationid: session.applicationId,
        cif: session.cif || '',
        apicode: '',
        modulename: '',
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        return response;
      } else {
        setError(response.message || 'Failed to fetch application data');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  const submitApplication = useCallback(async () => {
    if (!checkApiConfigured()) return null;
    
    const session = getSessionContext();
    if (!session.applicationId) {
      setError('No active application. Please restart.');
      return null;
    }

    setLoading(true);
    
    try {
      const response = await loanApplicationApi.submitApplication({
        applicationid: session.applicationId,
        apicode: '',
        modulename: '',
      });
      
      if (isSuccessResponse(response)) {
        setSuccess();
        toast.success('Application submitted successfully!');
        return response;
      } else {
        setError(response.message || 'Failed to submit application');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      return null;
    }
  }, [checkApiConfigured, setLoading, setSuccess, setError]);

  // ============ Master Data ============\

  const getDistrictList = useCallback(async () => {
    if (!checkApiConfigured()) return [];
    
    try {
      const response = await loanApplicationApi.getDistrictList();
      if (isSuccessResponse(response)) {
        return response.dataList || [];
      }
      return [];
    } catch {
      return [];
    }
  }, [checkApiConfigured]);

  const getThanaList = useCallback(async (districtcode: string) => {
    if (!checkApiConfigured()) return [];
    
    try {
      const response = await loanApplicationApi.getThanaList(districtcode);
      if (isSuccessResponse(response)) {
        return response.dataList || [];
      }
      return [];
    } catch {
      return [];
    }
  }, [checkApiConfigured]);

  const getBankList = useCallback(async () => {
    if (!checkApiConfigured()) return [];
    
    try {
      const response = await loanApplicationApi.getBankList();
      if (isSuccessResponse(response)) {
        return response.dataList || [];
      }
      return [];
    } catch {
      return [];
    }
  }, [checkApiConfigured]);

  const getBankBranchList = useCallback(async (bankcode: string) => {
    if (!checkApiConfigured()) return [];
    
    try {
      const response = await loanApplicationApi.getBankBranchList(bankcode);
      if (isSuccessResponse(response)) {
        return response.dataList || [];
      }
      return [];
    } catch {
      return [];
    }
  }, [checkApiConfigured]);

  // ============ Session Management ============\

  const getSession = useCallback(() => {
    return getSessionContext();
  }, []);

  const updateSession = useCallback((updates: Partial<ReturnType<typeof getSessionContext>>) => {
    updateSessionContext(updates);
  }, []);

  const clearSession = useCallback(() => {
    clearTokens();
  }, []);

  return {
    // State
    ...state,
    resetState,

    // Registration & OTP
    validateCustomer,
    validateOtp,
    resendOtp,

    // Personal Info
    savePersonalData,

    // Contact/Address
    saveContactDetails,

    // Other Bank Liability
    saveOtherBankLiability,
    getOtherBankLiability,
    deleteOtherBankLiability,
    completeLiabilityStep,

    // Loan Info
    getMaxLoanAmount,
    getEmiAmount,
    saveLoanInfo,

    // Face Verification
    verifyFace,

    // Application
    fetchAllData,
    submitApplication,

    // Master Data
    getDistrictList,
    getThanaList,
    getBankList,
    getBankBranchList,

    // Session
    getSession,
    updateSession,
    clearSession,
  };
}

export default useLoanApi;
