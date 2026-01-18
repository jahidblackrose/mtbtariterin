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
}

// Document Data structure from API
export interface DocumentData {
  documentid: string;
  documenttype: string;
  documentname: string;
  imagedata?: string; // Base64 encoded
  uploaddate?: string;
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
  isDataLoaded: boolean;
  isReadOnly: boolean;
  hasPersonalData: boolean;
  hasProfessionalData: boolean;
  hasAcMasterData: boolean;
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
  isDataLoaded: false,
  isReadOnly: true,
  hasPersonalData: false,
  hasProfessionalData: false,
  hasAcMasterData: false,
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

    // Map personalData section
    if (response.personalInfo && response.personalInfo.status !== "No record found") {
      newState.personalData = response.personalInfo;
      newState.hasPersonalData = true;
    }

    // Map contactData section
    if (response.contactInfo && response.contactInfo.status !== "No record found") {
      newState.contactData = response.contactInfo;
    }

    // Map professionalData section
    if (response.professionalInfo && response.professionalInfo.status !== "No record found") {
      newState.professionalData = response.professionalInfo;
      newState.hasProfessionalData = true;
    }

    // Map acMasterData section
    if (response.loanInfo && response.loanInfo.status !== "No record found") {
      newState.acMasterData = {
        applicationid: basicInfo.applicationId,
        ...response.loanInfo
      };
      newState.hasAcMasterData = true;
    }

    // Map liabilityData section
    if (response.liabilityInfo && Array.isArray(response.liabilityInfo) && response.liabilityInfo.length > 0) {
      newState.liabilityData = response.liabilityInfo.filter(
        (item: any) => item.status !== "No record found"
      );
    }

    // Map documentData section
    if (response.documentInfo && Array.isArray(response.documentInfo) && response.documentInfo.length > 0) {
      newState.documentData = response.documentInfo.filter(
        (item: any) => item.status !== "No record found"
      );
    }

    setApplicationDataState(newState);
  }, []);

  return (
    <ApplicationDataContext.Provider
      value={{
        applicationData,
        setApplicationData,
        clearApplicationData,
        mapFetchAllDataResponse,
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
