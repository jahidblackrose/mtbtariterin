import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Loader2 } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loanApplicationApi, DistrictData } from "@/services/loanApplicationApi";
import { isSuccessResponse, getSessionContext } from "@/services/apiClient";
import { useApplicationData } from "@/contexts/ApplicationDataContext";
import { toast } from "sonner";

interface PersonalInfoStepProps {
  onNext: (data: any) => void;
  data: any;
  isReadOnly?: boolean;
}

// Marital status options (static list)
const MARITAL_STATUS_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

// Spouse profession options
const SPOUSE_PROFESSION_OPTIONS = [
  { value: "Service", label: "Service" },
  { value: "Business", label: "Business" },
  { value: "Housewife", label: "Housewife" },
  { value: "Professional", label: "Professional" },
  { value: "Others", label: "Others" },
];

export const PersonalInfoStep = ({ onNext, data, isReadOnly = true }: PersonalInfoStepProps) => {
  const { applicationData } = useApplicationData();
  const personalData = applicationData.personalData;

  // Form state for editable fields
  const [formData, setFormData] = useState({
    maritalStatus: personalData?.maritalstatus || data.maritalStatus || "",
    tinNumber: personalData?.tinnumber || data.tinNumber || "",
    emergencyContactName: personalData?.emergencycontactname || data.emergencyContactName || "",
    emergencyContactNumber: personalData?.emergencycontactnumber || data.emergencyContactNumber || "",
    districtOfBirthCode: personalData?.distofbirthcode || data.districtOfBirthCode || "",
    districtOfBirthName: personalData?.distofbirthname || data.districtOfBirthName || "",
    // Spouse fields
    spouseName: personalData?.spousename || data.spouseName || "",
    spouseProfession: personalData?.spouseprofession || data.spouseProfession || "",
    spouseContactNumber: personalData?.spousecontactnumber || data.spouseContactNumber || "",
  });

  // District list for dropdown
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emergencyNumberError, setEmergencyNumberError] = useState("");
  
  // Spouse validation errors
  const [spouseErrors, setSpouseErrors] = useState({
    spouseName: "",
    spouseProfession: "",
    spouseContactNumber: "",
  });

  // Check if spouse fields should be shown
  const isMarried = formData.maritalStatus === "Married";

  // Read-only field values from API (fetchalldata)
  const readOnlyData = {
    fullName: personalData?.fullname || data.fullName || "",
    fatherName: personalData?.fathername || data.fatherName || "",
    motherName: personalData?.mothername || data.motherName || "",
    dateOfBirth: personalData?.dob || data.dateOfBirth || "",
    nidNumber: personalData?.nidnumber || data.nidNumber || "",
    mobileNumber: personalData?.mobilenumber || data.mobileNumber || "",
    email: personalData?.email || data.email || "",
    gender: personalData?.gender || data.gender || "",
    countryOfBirth: "Bangladesh", // Fixed text
    countryOfResidence: personalData?.countryofresidence || data.countryOfResidence || "Bangladesh",
  };

  // Load districts on mount for the District of Birth dropdown
  useEffect(() => {
    const loadDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await loanApplicationApi.getDistrictList();
        if (isSuccessResponse(response) && response.dataList) {
          setDistricts(response.dataList);
          
          // Auto-select district if distofbirthcode exists in personalData
          if (personalData?.distofbirthcode) {
            const matchingDistrict = response.dataList.find(
              (d: DistrictData) => d.districtcode === personalData.distofbirthcode
            );
            if (matchingDistrict) {
              setFormData(prev => ({
                ...prev,
                districtOfBirthCode: matchingDistrict.districtcode,
                districtOfBirthName: matchingDistrict.districtname,
              }));
            }
          }
        }
      } catch (error) {
        console.error("Failed to load districts:", error);
        toast.error("Failed to load district list");
      } finally {
        setLoadingDistricts(false);
      }
    };
    loadDistricts();
  }, [personalData?.distofbirthcode]);

  // Validate emergency contact number
  const validateEmergencyNumber = (value: string): boolean => {
    if (!value) {
      setEmergencyNumberError("");
      return true;
    }
    if (value.length !== 11) {
      setEmergencyNumberError("Must be 11 digits");
      return false;
    }
    if (!value.startsWith("01")) {
      setEmergencyNumberError("Must start with 01");
      return false;
    }
    setEmergencyNumberError("");
    return true;
  };

  const handleEmergencyNumberChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "").slice(0, 11);
    setFormData(prev => ({ ...prev, emergencyContactNumber: digitsOnly }));
    validateEmergencyNumber(digitsOnly);
  };

  const handleDistrictChange = (districtCode: string) => {
    const selectedDistrict = districts.find(d => d.districtcode === districtCode);
    setFormData(prev => ({
      ...prev,
      districtOfBirthCode: districtCode,
      districtOfBirthName: selectedDistrict?.districtname || "",
    }));
  };

  // Handle marital status change - clear spouse fields if not married
  const handleMaritalStatusChange = (value: string) => {
    if (value !== "Married") {
      setFormData(prev => ({
        ...prev,
        maritalStatus: value,
        spouseName: "",
        spouseProfession: "",
        spouseContactNumber: "",
      }));
      setSpouseErrors({ spouseName: "", spouseProfession: "", spouseContactNumber: "" });
    } else {
      setFormData(prev => ({ ...prev, maritalStatus: value }));
    }
  };

  // Validate spouse contact number
  const validateSpouseContactNumber = (value: string): boolean => {
    if (!value) {
      setSpouseErrors(prev => ({ ...prev, spouseContactNumber: "Spouse contact number is required" }));
      return false;
    }
    if (!/^\d+$/.test(value)) {
      setSpouseErrors(prev => ({ ...prev, spouseContactNumber: "Only digits allowed" }));
      return false;
    }
    if (value.length !== 11) {
      setSpouseErrors(prev => ({ ...prev, spouseContactNumber: "Must be 11 digits" }));
      return false;
    }
    if (!value.startsWith("01")) {
      setSpouseErrors(prev => ({ ...prev, spouseContactNumber: "Must start with 01" }));
      return false;
    }
    setSpouseErrors(prev => ({ ...prev, spouseContactNumber: "" }));
    return true;
  };

  const handleSpouseContactChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 11);
    setFormData(prev => ({ ...prev, spouseContactNumber: digitsOnly }));
    if (digitsOnly) {
      validateSpouseContactNumber(digitsOnly);
    } else {
      setSpouseErrors(prev => ({ ...prev, spouseContactNumber: "" }));
    }
  };

  // Validate all spouse fields
  const validateSpouseFields = (): boolean => {
    if (!isMarried) return true;

    let isValid = true;
    const errors = { spouseName: "", spouseProfession: "", spouseContactNumber: "" };

    if (!formData.spouseName.trim()) {
      errors.spouseName = "Spouse Name is required";
      isValid = false;
    }

    if (!formData.spouseProfession) {
      errors.spouseProfession = "Select spouse profession";
      isValid = false;
    }

    if (!formData.spouseContactNumber) {
      errors.spouseContactNumber = "Spouse contact number is required";
      isValid = false;
    } else if (!validateSpouseContactNumber(formData.spouseContactNumber)) {
      isValid = false;
    }

    setSpouseErrors(errors);
    return isValid;
  };

  // Save personal data via API
  const savePersonalData = useCallback(async () => {
    if (isReadOnly) return true;
    
    // Validate emergency number before saving
    if (formData.emergencyContactNumber && !validateEmergencyNumber(formData.emergencyContactNumber)) {
      toast.error("Please enter a valid emergency contact number");
      return false;
    }

    // Validate spouse fields if married
    if (!validateSpouseFields()) {
      toast.error("Please fill all spouse information correctly");
      return false;
    }

    setIsSaving(true);
    try {
      const session = getSessionContext();
      
      const payload = {
        applicationid: session.applicationId || "",
        cif: session.customerId || "",
        casacno: session.accountNumber || "",
        fullname: readOnlyData.fullName,
        mothername: readOnlyData.motherName,
        fathername: readOnlyData.fatherName,
        dob: readOnlyData.dateOfBirth,
        maritialstatus: formData.maritalStatus,
        gender: readOnlyData.gender,
        profession: personalData?.profession || "",
        tinno: formData.tinNumber,
        idtype: "NID",
        idno: readOnlyData.nidNumber,
        countryofbirth: readOnlyData.countryOfBirth,
        countryofresidence: readOnlyData.countryOfResidence,
        mobilenumber: readOnlyData.mobileNumber,
        email: readOnlyData.email,
        emergencycontactname: formData.emergencyContactName,
        emergencycontactnumber: formData.emergencyContactNumber,
        distofbirthcode: formData.districtOfBirthCode,
        distofbirthname: formData.districtOfBirthName,
      };

      const response = await loanApplicationApi.savePersonalData(payload);
      
      if (isSuccessResponse(response)) {
        toast.success("Personal information saved successfully");
        return true;
      } else {
        throw new Error(response.message || "Failed to save personal data");
      }
    } catch (error: any) {
      console.error("Failed to save personal data:", error);
      toast.error(error.message || "Failed to save personal information");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isReadOnly, formData, readOnlyData, personalData]);

  // Handle next - save before proceeding
  const handleNext = useCallback(async () => {
    if (isReadOnly) {
      onNext({ ...readOnlyData, ...formData });
      return;
    }
    
    const saved = await savePersonalData();
    if (saved) {
      onNext({ ...readOnlyData, ...formData });
    }
  }, [isReadOnly, formData, readOnlyData, onNext, savePersonalData]);

  // Expose handleNext for parent component
  useEffect(() => {
    (window as any).__personalInfoStepSave = handleNext;
    return () => {
      delete (window as any).__personalInfoStepSave;
    };
  }, [handleNext]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <User className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm">
            <BilingualText english="Personal Information" bengali="ব্যক্তিগত তথ্য" />
          </h3>
          <p className="text-xs text-muted-foreground">
            <BilingualText 
              english="Your information from bank records" 
              bengali="ব্যাংক রেকর্ড থেকে আপনার তথ্য" 
            />
          </p>
        </div>
        {isReadOnly && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            <Lock className="w-3 h-3" />
            <span>Read-only</span>
          </div>
        )}
      </div>

      {/* Read-Only Fields Section */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Customer's Name" bengali="গ্রাহকের নাম" />
          </Label>
          <Input
            value={readOnlyData.fullName}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Father's Name" bengali="পিতার নাম" />
          </Label>
          <Input
            value={readOnlyData.fatherName}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Mother's Name" bengali="মাতার নাম" />
          </Label>
          <Input
            value={readOnlyData.motherName}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              <BilingualText english="Date of Birth" bengali="জন্ম তারিখ" />
            </Label>
            <Input
              value={readOnlyData.dateOfBirth}
              className="bg-muted/30"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              <BilingualText english="Gender" bengali="লিঙ্গ" />
            </Label>
            <Input
              value={readOnlyData.gender}
              className="bg-muted/30"
              readOnly
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="NID Number" bengali="এনআইডি নম্বর" />
          </Label>
          <Input
            value={readOnlyData.nidNumber}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
          </Label>
          <Input
            value={readOnlyData.mobileNumber}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Email Address" bengali="ইমেইল ঠিকানা" />
          </Label>
          <Input
            type="email"
            value={readOnlyData.email}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              <BilingualText english="Country of Birth" bengali="জন্মের দেশ" />
            </Label>
            <Input
              value={readOnlyData.countryOfBirth}
              className="bg-muted/30"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              <BilingualText english="Country of Residence" bengali="বসবাসের দেশ" />
            </Label>
            <Input
              value={readOnlyData.countryOfResidence}
              className="bg-muted/30"
              readOnly
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Editable Fields Section */}
      <div className="space-y-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <p className="text-xs font-medium text-primary">
            <BilingualText 
              english="Editable Fields" 
              bengali="সম্পাদনাযোগ্য ক্ষেত্র" 
            />
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Marital Status" bengali="বৈবাহিক অবস্থা" />
          </Label>
          <Select
            value={formData.maritalStatus}
            onValueChange={handleMaritalStatusChange}
            disabled={isReadOnly}
          >
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="-- Select Marital Status --" />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {MARITAL_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spouse Information Section - Only shown when Married */}
        {isMarried && (
          <div className="space-y-3 p-3 bg-muted/20 rounded-xl border border-border/50">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                <BilingualText english="Spouse Information" bengali="স্বামী/স্ত্রীর তথ্য" />
              </h4>
              <span className="text-xs text-destructive">*</span>
            </div>

            {/* Spouse Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                <BilingualText english="Spouse Name" bengali="স্বামী/স্ত্রীর নাম" />
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                value={formData.spouseName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, spouseName: e.target.value }));
                  if (e.target.value.trim()) {
                    setSpouseErrors(prev => ({ ...prev, spouseName: "" }));
                  }
                }}
                placeholder="Enter spouse name"
                className={`bg-background border-input ${spouseErrors.spouseName ? 'border-destructive' : ''}`}
                readOnly={isReadOnly}
              />
              {spouseErrors.spouseName && (
                <p className="text-xs text-destructive">{spouseErrors.spouseName}</p>
              )}
            </div>

            {/* Spouse Profession */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                <BilingualText english="Spouse Profession" bengali="স্বামী/স্ত্রীর পেশা" />
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                value={formData.spouseProfession}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, spouseProfession: value }));
                  setSpouseErrors(prev => ({ ...prev, spouseProfession: "" }));
                }}
                disabled={isReadOnly}
              >
                <SelectTrigger className={`bg-background border-input ${spouseErrors.spouseProfession ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="-- Select Profession --" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {SPOUSE_PROFESSION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {spouseErrors.spouseProfession && (
                <p className="text-xs text-destructive">{spouseErrors.spouseProfession}</p>
              )}
            </div>

            {/* Spouse Contact Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                <BilingualText english="Spouse Contact Number" bengali="স্বামী/স্ত্রীর যোগাযোগ নম্বর" />
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                value={formData.spouseContactNumber}
                onChange={(e) => handleSpouseContactChange(e.target.value)}
                placeholder="01XXXXXXXXX"
                className={`bg-background border-input ${spouseErrors.spouseContactNumber ? 'border-destructive' : ''}`}
                readOnly={isReadOnly}
                maxLength={11}
              />
              {spouseErrors.spouseContactNumber && (
                <p className="text-xs text-destructive">{spouseErrors.spouseContactNumber}</p>
              )}
              <p className="text-xs text-muted-foreground">
                <BilingualText 
                  english="11 digits, must start with 01" 
                  bengali="১১ সংখ্যা, 01 দিয়ে শুরু হতে হবে" 
                />
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="E-TIN Number" bengali="ই-টিন নম্বর" />
          </Label>
          <Input
            value={formData.tinNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, tinNumber: e.target.value }))}
            placeholder="Enter E-TIN Number"
            className="bg-background border-input"
            readOnly={isReadOnly}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="District of Birth" bengali="জন্মের জেলা" />
          </Label>
          <Select
            value={formData.districtOfBirthCode}
            onValueChange={handleDistrictChange}
            disabled={isReadOnly}
          >
            <SelectTrigger className="bg-background border-input">
              {loadingDistricts ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="-- Select District --" />
              )}
            </SelectTrigger>
            <SelectContent className="bg-card z-50 max-h-60">
              {districts.map((district) => (
                <SelectItem key={district.districtcode} value={district.districtcode}>
                  {district.districtname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Emergency Contact Name" bengali="জরুরি যোগাযোগের নাম" />
          </Label>
          <Input
            value={formData.emergencyContactName}
            onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
            placeholder="Enter emergency contact name"
            className="bg-background border-input"
            readOnly={isReadOnly}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Emergency Contact Number" bengali="জরুরি যোগাযোগের নম্বর" />
          </Label>
          <Input
            value={formData.emergencyContactNumber}
            onChange={(e) => handleEmergencyNumberChange(e.target.value)}
            placeholder="01XXXXXXXXX"
            className={`bg-background border-input ${emergencyNumberError ? 'border-destructive' : ''}`}
            readOnly={isReadOnly}
            maxLength={11}
          />
          {emergencyNumberError && (
            <p className="text-xs text-destructive">{emergencyNumberError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            <BilingualText 
              english="11 digits, must start with 01" 
              bengali="১১ সংখ্যা, 01 দিয়ে শুরু হতে হবে" 
            />
          </p>
        </div>
      </div>

      <Separator />

      {/* Note */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
        <p className="text-sm text-foreground">
          <BilingualText 
            english="📝 Read-only fields are fetched from your bank records. Editable fields can be updated as needed." 
            bengali="📝 শুধুমাত্র পাঠযোগ্য ক্ষেত্রগুলি আপনার ব্যাংক রেকর্ড থেকে নেওয়া হয়েছে। সম্পাদনাযোগ্য ক্ষেত্রগুলি প্রয়োজন অনুযায়ী আপডেট করা যেতে পারে।" 
          />
        </p>
      </div>

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-primary">Saving personal information...</span>
        </div>
      )}
    </div>
  );
};
