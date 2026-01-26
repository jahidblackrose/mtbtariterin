/**
 * Loan Application API Service
 * Maps all Postman collection endpoints to typed methods
 * Based on Torit Loan API (Lovable) Postman Collection
 */

import { apiRequest, isSuccessResponse, updateSessionContext, getSessionContext, ApiResponse } from './apiClient';

// ============ Type Definitions ============

// Registration & OTP Types
export interface ValidateCustomerRequest {
  accountnumber?: string;
  mobilenumber: string;
  employeeid?: string;
  payrollcode?: string;
}

export interface ValidateCustomerResponse {
  status: string;
  message: string;
  otpref: string;
  regiref: string;
  loginid: string;
  accountnumber?: string;
  customernumber?: string;
  mobilenumber: string;
  salaryAcno?: string;
  multipleacno?: string;
  brcod?: string;
  stafftype?: string;
  companyname?: string;
}

export interface ValidateOtpRequest {
  otp: string;
  otpref: string;
  mobilenumber: string;
  regiref: string;
  loginid: string;
}

export interface CustomerData {
  fullname: string;
  fathername: string;
  mothername: string;
  dob: string;
  maritalstatus: string;
  spousename: string;
  gender: string;
  educationstatus: string;
  tinnumber: string;
  nidnumber: string;
  countryofbirth: string;
  countryofresidence: string;
  profession: string;
  mobilenumber: string;
  email: string;
  distofbirthcode: string;
  distofbirthname: string;
}

export interface ValidateOtpResponse {
  status: string;
  message: string;
  applicationid: string;
  profilestatus: string;
  loanacno: string;
  accountnumber: string;
  customernumber: string;
  dataList: CustomerData[];
}

export interface ResendOtpRequest {
  otpmedium: string;
  email?: string;
  mobilenumber?: string;
  regiref: string;
  loginid: string;
  apicode?: string;
  modulename?: string;
}

// Personal Data Types
export interface SavePersonalDataRequest {
  applicationid: string;
  cif: string;
  fullname: string;
  casacno: string;
  mothername: string;
  fathername: string;
  dob: string;
  maritialstatus: string;
  gender: string;
  dependentno?: string;
  spousename?: string;
  spouseprofession?: string;
  spousework_addr?: string;
  spouseland_phone?: string;
  spousemobile_no?: string;
  educationlevel?: string;
  profession: string;
  tinno?: string;
  idtype: string;
  idno: string;
  countryofbirth: string;
  countryofresidence: string;
  mobilenumber: string;
  email: string;
  emergencycontactname?: string;
  emergencycontactnumber?: string;
  distofbirthcode?: string;
  distofbirthname?: string;
  spouse_coapplicant?: string;
  apicode?: string;
  userterminal?: string;
  modulename?: string;
}

// Contact/Address Types
export interface SaveContactDetailsRequest {
  applicationid: string;
  cif: string;
  permanentaddr1: string;
  permanentaddr2?: string;
  permanentdistrict: string;
  permanentthana?: string;
  permanentpostcode?: string;
  permanentcountry: string;
  residentstatus?: string;
  professionaddr1?: string;
  professionaddr2?: string;
  professiondistrict?: string;
  professionthana?: string;
  professionpostcode?: string;
  professioncountry?: string;
  presentaddr1: string;
  presentaddr2?: string;
  presentdistrict: string;
  presentthana?: string;
  presentpostcode?: string;
  presentcountry: string;
  preferredcommunication: string;
  currentaddressyear?: string;
  apicode?: string;
  userterminal?: string;
  modulename?: string;
}

// Professional Details Types
export interface SaveProfessionalDetailsRequest {
  applicationid: string;
  professiontype: string;
  presentemployername: string;
  presentemployeraddr: string;
  department: string;
  designation: string;
  employementstatus: string;
  currentprofyear: string;
  currentprofmonth: string;
  contactphoneno: string;
  contactextno?: string;
  previousemployername?: string;
  previousdesignation?: string;
  previousprofyear?: string;
  previousprofmonth?: string;
  staffno?: string;
  currentaddrbusslength?: string;
  businesstype?: string;
  otherbusinessconcern?: string;
  businessnature?: string;
  profession?: string;
  reginumber?: string;
  apicode?: string;
  userterminal?: string;
  modulename?: string;
}

// Bank Liability Types
export interface SaveOtherBankLiabilityRequest {
  liabilityid?: string;
  applicationid: string;
  bankname: string;
  branchname: string;
  loantype: string;
  loanamount: string;
  liabilitytype: 'L' | 'C'; // L for Loan, C for Credit Card
  outstanding: string;
  emi: string;
  cardnumber?: string;
  expirydate?: string;
  apicode?: string;
  modulename?: string;
}

export interface LiabilityData {
  liabilityid: string;
  applicationid: string;
  bankname: string;
  bankcode: string;
  branchname: string;
  branchcode: string;
  loantype: string;
  loanamount: string;
  outstanding: string;
  emi: string;
  liabilitytype: string;
  cardnumber?: string;
  expirydate?: string;
}

export interface GetOtherBankLiabilityResponse {
  status: string;
  message: string;
  dataList: LiabilityData[];
}

// Loan Info Types
export interface GetMaxLoanAmountRequest {
  accountnumber: string;
  multipleacno?: string;
  applicationid: string;
}

export interface GetMaxLoanAmountResponse {
  status: string;
  message: string;
  maxloanamount?: string;
  rate?: string;
}

export interface GetEmiAmountRequest {
  applicationid: string;
  principalamount: string;
  rate?: string;
  tenor: string;
  apicode?: string;
  userterminal?: string;
  modulename?: string;
}

export interface GetEmiAmountResponse {
  status: string;
  message: string;
  emiamount: string;
}

export interface SaveLoanInfoRequest {
  applicationid: string;
  loannature: string;
  loanpurpose: string;
  loanamount: string;
  tenormonth: string;
  repaymentdate: string;
  maxallowedloanamount?: string;
  monthlyemi?: string;
  appliedbranch?: string;
}

// Face Verification Types
export interface FaceMatchRequest {
  applicationid: string;
  imagedata: string; // Base64 encoded image
  nidnumber?: string;
  cif?: string;
}

export interface FaceMatchResponse {
  status: string;
  message: string;
  matchscore?: number;
  verified?: boolean;
}

// Fetch All Data Types
export interface FetchAllDataRequest {
  applicationid: string;
  cif?: string;
  apicode?: string;
  modulename?: string;
}

export interface FetchAllDataResponse {
  status: string;
  message: string;
  personalInfo?: any;
  contactInfo?: any;
  professionalInfo?: any;
  loanInfo?: any;
  liabilityInfo?: any[];
}

// Submit Application Types
export interface SubmitApplicationRequest {
  applicationid: string;
  apicode?: string;
  modulename?: string;
}

export interface SubmitApplicationResponse {
  status: string;
  message: string;
  acno?: string;
  actitle?: string;
}

// Opened Loan Account Data Types
export interface GetOpenedLoanAccountRequest {
  loginid: string;
  cif: string;
  mobilenumber: string;
  apicode?: string;
  modulename?: string;
}

export interface OpenedLoanAccount {
  loanacno: string;
  productname: string;
  accountstatus: string;
  loanamount: string;
  outstanding: string;
  paidinstallments: string;
  remaininginstallments: string;
}

export interface GetOpenedLoanAccountResponse {
  status: string;
  message: string;
  newaccountopen: number;
  dataList: OpenedLoanAccount[];
}

// Master Data Types
export interface DistrictData {
  districtcode: string;
  districtname: string;
}

export interface ThanaData {
  thanacode: string;
  thananame: string;
}

export interface BankData {
  bankcode: string;
  bankname: string;
}

export interface BranchData {
  branchcode: string;
  branchname: string;
}

// ============ API Service Implementation ============

export const loanApplicationApi = {
  // ============ Registration & OTP APIs ============

  /**
   * 1. User Registration - Validate customer and send OTP
   */
  async validateCustomer(data: ValidateCustomerRequest): Promise<ApiResponse<ValidateCustomerResponse>> {
    const response = await apiRequest<ValidateCustomerResponse>(
      '/loanapplication/api/v1/Application/validatestafforpayroll',
      { body: data }
    );

    // Store session context on success
    if (isSuccessResponse(response)) {
      updateSessionContext({
        otpref: response.otpref,
        regiref: response.regiref,
        loginId: response.loginid,
        mobileNumber: data.mobilenumber,
        accountNumber: response.accountnumber || null,
        customerId: response.customernumber || null,
      });
    }

    return response;
  },

  /**
   * 2. Validate OTP - Verify OTP and get customer data
   */
  async validateOtp(data: ValidateOtpRequest): Promise<ApiResponse<ValidateOtpResponse>> {
    const response = await apiRequest<ValidateOtpResponse>(
      '/loanapplication/api/v1/Application/validateotp',
      { body: data }
    );

    // Store applicationId on success
    if (isSuccessResponse(response) && response.applicationid) {
      updateSessionContext({
        applicationId: response.applicationid,
        accountNumber: response.accountnumber,
        customerId: response.customernumber,
        cif: response.customernumber,
      });
    }

    return response;
  },

  /**
   * 3. Resend OTP
   */
  async resendOtp(data: ResendOtpRequest): Promise<ApiResponse> {
    const response = await apiRequest('/loanapplication/api/v1/Application/resendotp', {
      body: data,
    });

    // Update OTP reference on success
    if (isSuccessResponse(response) && response.otpref) {
      updateSessionContext({
        otpref: response.otpref,
        regiref: response.regiref || getSessionContext().regiref,
        loginId: response.loginid || getSessionContext().loginId,
      });
    }

    return response;
  },

  // ============ Personal Info APIs ============

  /**
   * 4. Save Personal Data
   */
  async savePersonalData(data: SavePersonalDataRequest): Promise<ApiResponse> {
    return apiRequest('/loanapplication/api/v1/Application/SavePersonalData', {
      body: data,
    });
  },

  // ============ Contact/Address APIs ============

  /**
   * 10. Save Contact Details
   */
  async saveContactDetails(data: SaveContactDetailsRequest): Promise<ApiResponse> {
    return apiRequest('/loanapplication/api/v1/Application/SaveContactDetails', {
      body: data,
    });
  },

  // ============ Professional Info APIs ============

  /**
   * Save Professional Details
   */
  async saveProfessionalDetails(data: SaveProfessionalDetailsRequest): Promise<ApiResponse> {
    return apiRequest('/loanapplication/api/v1/Application/SaveProfessionalDetails', {
      body: data,
    });
  },

  // ============ Other Bank Liability APIs ============

  /**
   * 13. Save Other Bank Liability
   */
  async saveOtherBankLiability(data: SaveOtherBankLiabilityRequest): Promise<ApiResponse> {
    return apiRequest('/loanapplication/api/v1/Application/saveotherbankliability', {
      body: data,
    });
  },

  /**
   * Get Other Bank Liability List
   */
  async getOtherBankLiability(applicationid: string): Promise<ApiResponse<GetOtherBankLiabilityResponse>> {
    return apiRequest<GetOtherBankLiabilityResponse>(
      '/loanapplication/api/v1/Application/Getotherbankliability',
      {
        body: {
          applicationid,
          cif: '',
          apicode: '',
          modulename: '',
        },
      }
    );
  },

  /**
   * Delete Other Bank Liability
   */
  async deleteOtherBankLiability(liabilityid: string, applicationid: string): Promise<ApiResponse> {
    return apiRequest('/loanapplication/api/v1/Application/deleteotherbankliability', {
      body: {
        liabilityid,
        applicationid,
        modulename: '',
      },
    });
  },

  /**
   * Mark Other Bank Liability as Complete (proceed to next step)
   */
  async saveOtherBankLiabilityComplete(applicationid: string): Promise<ApiResponse> {
    return apiRequest('/loanapplication/api/v1/Application/saveotherbankliabilitycomplete', {
      body: { applicationid },
    });
  },

  // ============ Loan Info APIs ============

  /**
   * 9. Get Max Loan Amount
   */
  async getMaxLoanAmount(data: GetMaxLoanAmountRequest): Promise<ApiResponse<GetMaxLoanAmountResponse>> {
    return apiRequest<GetMaxLoanAmountResponse>(
      '/loanapplication/api/v1/Application/GetMaxLoanAmount',
      { body: data }
    );
  },

  /**
   * 14. Get EMI Amount
   */
  async getEmiAmount(data: GetEmiAmountRequest): Promise<ApiResponse<GetEmiAmountResponse>> {
    return apiRequest<GetEmiAmountResponse>(
      '/loanapplication/api/v1/Application/getemiamount',
      { body: data }
    );
  },

  /**
   * 15. Save Loan Info
   */
  async saveLoanInfo(data: SaveLoanInfoRequest): Promise<ApiResponse> {
    return apiRequest('/loanapplication/api/v1/Application/SaveLoanInfo', {
      body: data,
    });
  },

  // ============ Face Verification APIs ============

  /**
   * Face Match with Live Image
   */
  async faceMatchWithLiveImage(data: FaceMatchRequest): Promise<ApiResponse<FaceMatchResponse>> {
    return apiRequest<FaceMatchResponse>(
      '/loanapplication/api/v1/Application/facematchwithliveimage',
      { body: data }
    );
  },

  // ============ Application APIs ============

  /**
   * 5. Fetch All Data
   */
  async fetchAllData(data: FetchAllDataRequest): Promise<ApiResponse<FetchAllDataResponse>> {
    return apiRequest<FetchAllDataResponse>(
      '/loanapplication/api/v1/Application/fetchalldata',
      { body: data }
    );
  },

  /**
   * Get Application Stage
   */
  async getApplicationStage(applicationid: string): Promise<ApiResponse> {
    return apiRequest('/loanapplication/api/v1/Application/ApplicationSTAGE', {
      body: { applicationid },
    });
  },

  /**
   * Apply New Loan
   */
  async applyNewLoan(data: {
    accountnumber: string;
    customernumber: string;
    regiref: string;
    loginid: string;
    applicationid: string;
  }): Promise<ApiResponse> {
    return apiRequest('/loanapplication/api/v1/Application/applynewloan', {
      body: data,
    });
  },

  /**
   * Get Opened Loan Account Data - For users with existing loans (status -666)
   */
  async getOpenedLoanAccountData(data: GetOpenedLoanAccountRequest): Promise<ApiResponse<GetOpenedLoanAccountResponse>> {
    return apiRequest<GetOpenedLoanAccountResponse>(
      '/loanapplication/api/v1/Application/getopenedloanaccountdata',
      {
        body: {
          loginid: data.loginid,
          cif: data.cif,
          mobilenumber: data.mobilenumber,
          apicode: data.apicode || '',
          modulename: data.modulename || '',
        },
      }
    );
  },

  /**
   * Submit Application (Final Step)
   */
  async submitApplication(data: SubmitApplicationRequest): Promise<ApiResponse<SubmitApplicationResponse>> {
    return apiRequest<SubmitApplicationResponse>(
      '/loanapplication/api/v1/Application/submitapplication',
      { body: data }
    );
  },

  // ============ Master Data APIs ============

  /**
   * 6. Get District List
   */
  async getDistrictList(): Promise<ApiResponse<{ dataList: DistrictData[] }>> {
    return apiRequest('/plapplication/api/v1/CBS/getdistrictlist', {
      body: {
        districtcode: '',
        tellernumber: '',
      },
    });
  },

  /**
   * 7. Get Thana List
   */
  async getThanaList(districtcode: string): Promise<ApiResponse<{ dataList: ThanaData[] }>> {
    return apiRequest('/plapplication/api/v1/CBS/getthanalist', {
      body: {
        thanacode: '',
        districtcode,
        tellernumber: '',
      },
    });
  },

  /**
   * 8. Get Post Office List
   */
  async getPostOfficeList(districtcode: string, thanacode: string): Promise<ApiResponse<{ dataList: any[] }>> {
    return apiRequest('/plapplication/api/v1/CBS/getpostofficelist', {
      body: {
        postcode: '',
        districtcode,
        thanacode,
        tellernumber: 'string',
      },
    });
  },

  /**
   * 11. Get Bank List
   */
  async getBankList(): Promise<ApiResponse<{ dataList: BankData[] }>> {
    return apiRequest('/plapplication/api/v1/CBS/getBankList', {
      body: {
        screennumber: '',
        combofieldid: '',
        apicode: '',
        modulename: '',
      },
    });
  },

  /**
   * 12. Get Bank Branch List
   */
  async getBankBranchList(bankcode: string): Promise<ApiResponse<{ dataList: BranchData[] }>> {
    return apiRequest('/cbs/api/v1/account/getbranchlistofbank', {
      body: { bankcode },
    });
  },

  // ============ Credit Card APIs ============

  /**
   * Get Credit Card Data
   */
  async getCreditCardData(applicationid: string): Promise<ApiResponse<{ dataList: LiabilityData[] }>> {
    return apiRequest('/loanapplication/api/v1/Application/GetCreditcardData', {
      body: {
        applicationid,
        cif: '',
        apicode: '',
        modulename: '',
      },
    });
  },

  // ============ Loan Discharge APIs ============

  /**
   * Loan Discharge Enquiry - Get discharge details for a loan account
   */
  async loanDischargeEnquiry(loanacno: string): Promise<ApiResponse<LoanDischargeEnquiryResponse>> {
    return apiRequest<LoanDischargeEnquiryResponse>(
      '/loanapplication/api/v1/Application/LoanDischargeEnquiryRequestAppId',
      {
        body: {
          applicationid: '',
          loanacno,
          minbal: '',
          savingsac: '',
          minimuminstallment: '',
        },
      }
    );
  },

  /**
   * Request OTP for Loan Discharge
   */
  async loanDischargeOtpRequest(applicationid: string, regsl: string): Promise<ApiResponse<LoanDischargeOtpResponse>> {
    return apiRequest<LoanDischargeOtpResponse>(
      '/loanapplication/api/v1/Application/LoanDischargeOTPRequest',
      {
        body: {
          applicationid,
          regsl,
          modulename: '',
          apicode: '',
        },
      }
    );
  },

  /**
   * Validate OTP for Loan Discharge
   */
  async loanDischargeOtpValidate(data: LoanDischargeOtpValidateRequest): Promise<ApiResponse> {
    return apiRequest(
      '/loanapplication/api/v1/Application/LoanDischargeOTPValidate',
      {
        body: data,
      }
    );
  },
};

// Response types for Loan Discharge APIs
export interface LoanDischargeEnquiryResponse {
  status: string;
  message: string;
  loanacnum: string;
  loanacname: string;
  dischargeamt: string;
  totalinstallment: string;
  remaininginstallment: string;
  recoveryacno: string;
  recoveryacname: string;
  smsMobileNum: string;
  custName: string;
  savingac: string;
  savingsac: string;
  savingsacbal: string;
  acctTyp: string;
  minbal: string;
  minimuminstallment: string;
  errormessage: string;
  regsl: string;
  applicationid: string;
}

export interface LoanDischargeOtpResponse {
  status: string;
  message: string;
  regref: string;
  otpref: string;
  regsl: string;
}

export interface LoanDischargeOtpValidateRequest {
  applicationid: string;
  regref: string;
  otpref: string;
  regsl: string;
  otp: string;
  modulename: string;
}

export default loanApplicationApi;
