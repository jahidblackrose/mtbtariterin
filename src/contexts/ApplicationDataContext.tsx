/**
 * Application Data Context
 * Stores and provides access to prefilled loan application data
 * after successful OTP validation and fetchAllData API call
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Personal Data structure from API
export interface PersonalData {
  fullname: string;
  fathername: string;
  mothername: string;
  dob: string;
  maritalstatus: string;
  spousename?: string;
  spouseprofession?: string;
  spousecontactnumber?: string;
  gender: string;
  educationstatus?: string;
  tinnumber?: string;
  nidnumber: string;
  countryofbirth: string;
  countryofresidence: string;
  profession: string;
  mobilenumber: string;
  email: string;
  distofbirthcode?: string;
  distofbirthname?: string;
  emergencycontactname?: string;
  emergencycontactnumber?: string;
}

// Contact/Address Data structure from API
export interface ContactData {
  permanentaddr1: string;
  permanentaddr2?: string;
  permanentdistrict: string;
  permanentdistrictname?: string;
  permanentthana?: string;
  permanentthananame?: string;
  permanentpostcode?: string;
  permanentcountry: string;
  presentaddr1: string;
  presentaddr2?: string;
  presentdistrict: string;
  presentdistrictname?: string;
  presentthana?: string;
  presentthananame?: string;
  presentpostcode?: string;
  presentcountry: string;
  professionaddr1?: string;
  professionaddr2?: string;
  professiondistrict?: string;
  professiondistrictname?: string;
  professionthana?: string;
  professionthananame?: string;
  professionpostcode?: string;
  professioncountry?: string;
  preferredcommunication?: string;
  residentstatus?: string;
}

// Professional Data structure from API
export interface ProfessionalData {
  professiontype?: string;
  presentemployername?: string;
  presentemployeraddr?: string;
  department?: string;
  designation?: string;
  employementstatus?: string;
  currentprofyear?: string;
  currentprofmonth?: string;
  contactphoneno?: string;
  previousemployername?: string;
  previousdesignation?: string;
  businesstype?: string;
  businessnature?: string;
}

// Account/Loan Master Data structure from API
export interface AcMasterData {
  applicationid: string;
  loanacno?: string;
  productcode?: string;
  productname?: string;
  loanamount?: string;
  tenormonth?: string;
  monthlyemi?: string;
  interestrate?: string;
  appliedbranch?: string;
  appliedbranchname?: string;
  loanpurpose?: string;
  repaymentdate?: string;
  status?: string;
  stage?: string;
}

// Liability Data structure from API
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
  status?: string;
}

// Document Data structure from API
export interface DocumentData {
  documentid: string;
  documenttype: string;
  documentname: string;
  imagedata?: string; // Base64 encoded
  physicalfilebase64?: string; // Another format for base64 data
  uploaddate?: string;
  status?: string;
}

// Opened Loan Account Data (for Dashboard - existing loans)
export interface OpenedLoanAccount {
  loanacno: string;
  productname: string;
  accountstatus: string;
  loanamount: string;
  outstanding: string;
  paidinstallments: string;
  remaininginstallments: string;
}

export interface DashboardData {
  existingLoans: OpenedLoanAccount[];
  canApplyNewLoan: boolean;
}

// Complete Application Data
export interface ApplicationDataState {
  applicationId: string;
  accountNumber: string;
  customerId: string;
  profileStatus: string;
  loanAcNo?: string;
  personalData: PersonalData | null;
  contactData: ContactData | null;
  professionalData: ProfessionalData | null;
  acMasterData: AcMasterData | null;
  liabilityData: LiabilityData[];
  documentData: DocumentData[];
  dashboardData: DashboardData | null;
  isDataLoaded: boolean;
  isReadOnly: boolean;
  hasPersonalData: boolean;
  hasContactData: boolean;
  hasProfessionalData: boolean;
  hasAcMasterData: boolean;
  hasLiabilityData: boolean;
  hasDocumentData: boolean;
  hasExistingLoans: boolean;
}

interface ApplicationDataContextType {
  applicationData: ApplicationDataState;
  setApplicationData: (data: Partial<ApplicationDataState>) => void;
  clearApplicationData: () => void;
  mapFetchAllDataResponse: (response: any, basicInfo: {
    applicationId: string;
    accountNumber: string;
    customerId: string;
    profileStatus: string;
    loanAcNo?: string;
  }) => void;
  setDashboardData: (existingLoans: OpenedLoanAccount[], canApplyNewLoan: boolean) => void;
}

const defaultState: ApplicationDataState = {
  applicationId: "",
  accountNumber: "",
  customerId: "",
  profileStatus: "",
  loanAcNo: "",
  personalData: null,
  contactData: null,
  professionalData: null,
  acMasterData: null,
  liabilityData: [],
  documentData: [],
  dashboardData: null,
  isDataLoaded: false,
  isReadOnly: true,
  hasPersonalData: false,
  hasContactData: false,
  hasProfessionalData: false,
  hasAcMasterData: false,
  hasLiabilityData: false,
  hasDocumentData: false,
  hasExistingLoans: false,
};

const ApplicationDataContext = createContext<ApplicationDataContextType | undefined>(undefined);

export const ApplicationDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applicationData, setApplicationDataState] = useState<ApplicationDataState>(defaultState);

  const setApplicationData = useCallback((data: Partial<ApplicationDataState>) => {
    setApplicationDataState(prev => ({ ...prev, ...data }));
  }, []);

  const clearApplicationData = useCallback(() => {
    setApplicationDataState(defaultState);
  }, []);

  /**
   * Maps the fetchAllData API response to the application state
   */
  const mapFetchAllDataResponse = useCallback((response: any, basicInfo: {
    applicationId: string;
    accountNumber: string;
    customerId: string;
    profileStatus: string;
    loanAcNo?: string;
  }) => {
    const newState: ApplicationDataState = {
      ...defaultState,
      applicationId: basicInfo.applicationId,
      accountNumber: basicInfo.accountNumber,
      customerId: basicInfo.customerId,
      profileStatus: basicInfo.profileStatus,
      loanAcNo: basicInfo.loanAcNo || "",
      isDataLoaded: true,
      isReadOnly: true,
    };

    // Map personalData section - check for dataList or direct data
    const personalInfoData = response.personalInfo?.dataList?.[0] || response.personalInfo;
    if (personalInfoData && personalInfoData.status !== "No record found" && personalInfoData.status !== "608") {
      newState.personalData = personalInfoData;
      newState.hasPersonalData = true;
    }

    // Map contactData section - check for dataList or direct data
    const contactInfoData = response.contactInfo?.dataList?.[0] || response.contactInfo;
    if (contactInfoData && contactInfoData.status !== "No record found" && contactInfoData.status !== "608") {
      newState.contactData = contactInfoData;
      newState.hasContactData = true;
    }

    // Map professionalData section - check for dataList or direct data
    // Status 608 means "No record found" in this API
    const professionalInfoData = response.professionalInfo?.dataList?.[0] || response.professionalInfo;
    if (professionalInfoData && professionalInfoData.status !== "No record found" && professionalInfoData.status !== "608") {
      newState.professionalData = professionalInfoData;
      newState.hasProfessionalData = true;
    }

    // Map acMasterData section - check for dataList or direct data
    const loanInfoData = response.loanInfo?.dataList?.[0] || response.loanInfo;
    if (loanInfoData && loanInfoData.status !== "No record found" && loanInfoData.status !== "608") {
      newState.acMasterData = {
        applicationid: basicInfo.applicationId,
        ...loanInfoData
      };
      newState.hasAcMasterData = true;
    }

    // Map liabilityData section - check for dataList array
    const liabilityList = response.liabilityInfo?.dataList || response.liabilityInfo;
    if (liabilityList && Array.isArray(liabilityList) && liabilityList.length > 0) {
      const filteredLiabilities = liabilityList.filter(
        (item: any) => item.status !== "No record found" && item.status !== "608"
      );
      if (filteredLiabilities.length > 0) {
        newState.liabilityData = filteredLiabilities;
        newState.hasLiabilityData = true;
      }
    }

    // Map documentData section - check for dataList array
    const documentList = response.documentInfo?.dataList || response.documentInfo;
    if (documentList && Array.isArray(documentList) && documentList.length > 0) {
      const filteredDocs = documentList.filter(
        (item: any) => item.status !== "No record found" && item.status !== "608"
      );
      if (filteredDocs.length > 0) {
        newState.documentData = filteredDocs;
        newState.hasDocumentData = true;
      }
    }

    setApplicationDataState(newState);
  }, []);

  /**
   * Sets dashboard data for users with existing loans
   */
  const setDashboardData = useCallback((existingLoans: OpenedLoanAccount[], canApplyNewLoan: boolean) => {
    setApplicationDataState(prev => ({
      ...prev,
      dashboardData: {
        existingLoans,
        canApplyNewLoan,
      },
      hasExistingLoans: existingLoans.length > 0,
      isDataLoaded: true,
    }));
  }, []);

  return (
    <ApplicationDataContext.Provider
      value={{
        applicationData,
        setApplicationData,
        clearApplicationData,
        mapFetchAllDataResponse,
        setDashboardData,
      }}
    >
      {children}
    </ApplicationDataContext.Provider>
  );
};

export const useApplicationData = (): ApplicationDataContextType => {
  const context = useContext(ApplicationDataContext);
  if (!context) {
    throw new Error("useApplicationData must be used within an ApplicationDataProvider");
  }
  return context;
};

export default ApplicationDataContext;
