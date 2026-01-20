import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { loanApplicationApi, DistrictData, ThanaData } from "@/services/loanApplicationApi";
import { isSuccessResponse, getSessionContext } from "@/services/apiClient";
import { useApplicationData } from "@/contexts/ApplicationDataContext";
import { toast } from "sonner";

interface AddressStepProps {
  onNext: (data: any) => void;
  data: any;
  isReadOnly?: boolean;
}

interface PostOfficeData {
  postcode: string;
  postofficename: string;
}

interface AddressSectionData {
  addressLine1: string;
  addressLine2: string;
  country: string;
  district: string;
  districtName: string;
  thana: string;
  thanaName: string;
  postCode: string;
  postOfficeName: string;
}

const defaultAddressSection: AddressSectionData = {
  addressLine1: "",
  addressLine2: "",
  country: "Bangladesh",
  district: "",
  districtName: "",
  thana: "",
  thanaName: "",
  postCode: "",
  postOfficeName: "",
};

export const AddressStep = ({ onNext, data, isReadOnly = false }: AddressStepProps) => {
  const { applicationData } = useApplicationData();
  const contactData = applicationData.contactData;

  // Initialize form data from context or props
  const getInitialFormData = () => {
    // Map from API contactData to form structure
    const presentAddress: AddressSectionData = {
      addressLine1: contactData?.presentaddr1 || data.presentAddress?.addressLine1 || "",
      addressLine2: contactData?.presentaddr2 || data.presentAddress?.addressLine2 || "",
      country: contactData?.presentcountry || data.presentAddress?.country || "Bangladesh",
      district: contactData?.presentdistrict || data.presentAddress?.district || "",
      districtName: contactData?.presentdistrictname || data.presentAddress?.districtName || "",
      thana: contactData?.presentthana || data.presentAddress?.thana || "",
      thanaName: contactData?.presentthananame || data.presentAddress?.thanaName || "",
      postCode: contactData?.presentpostcode || data.presentAddress?.postCode || "",
      postOfficeName: data.presentAddress?.postOfficeName || "",
    };

    const permanentAddress: AddressSectionData = {
      addressLine1: contactData?.permanentaddr1 || data.permanentAddress?.addressLine1 || "",
      addressLine2: contactData?.permanentaddr2 || data.permanentAddress?.addressLine2 || "",
      country: contactData?.permanentcountry || data.permanentAddress?.country || "Bangladesh",
      district: contactData?.permanentdistrict || data.permanentAddress?.district || "",
      districtName: contactData?.permanentdistrictname || data.permanentAddress?.districtName || "",
      thana: contactData?.permanentthana || data.permanentAddress?.thana || "",
      thanaName: contactData?.permanentthananame || data.permanentAddress?.thanaName || "",
      postCode: contactData?.permanentpostcode || data.permanentAddress?.postCode || "",
      postOfficeName: data.permanentAddress?.postOfficeName || "",
    };

    const professionalAddress: AddressSectionData = {
      addressLine1: contactData?.professionaddr1 || data.professionalAddress?.addressLine1 || "",
      addressLine2: contactData?.professionaddr2 || data.professionalAddress?.addressLine2 || "",
      country: contactData?.professioncountry || data.professionalAddress?.country || "Bangladesh",
      district: contactData?.professiondistrict || data.professionalAddress?.district || "",
      districtName: contactData?.professiondistrictname || data.professionalAddress?.districtName || "",
      thana: contactData?.professionthana || data.professionalAddress?.thana || "",
      thanaName: contactData?.professionthananame || data.professionalAddress?.thanaName || "",
      postCode: contactData?.professionpostcode || data.professionalAddress?.postCode || "",
      postOfficeName: data.professionalAddress?.postOfficeName || "",
    };

    return {
      presentAddress,
      permanentAddress,
      professionalAddress,
      communicationAddress: contactData?.preferredcommunication || data.communicationAddress || "present",
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  // Master data state
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [presentThanas, setPresentThanas] = useState<ThanaData[]>([]);
  const [permanentThanas, setPermanentThanas] = useState<ThanaData[]>([]);
  const [professionalThanas, setProfessionalThanas] = useState<ThanaData[]>([]);
  const [presentPostOffices, setPresentPostOffices] = useState<PostOfficeData[]>([]);
  const [permanentPostOffices, setPermanentPostOffices] = useState<PostOfficeData[]>([]);
  const [professionalPostOffices, setProfessionalPostOffices] = useState<PostOfficeData[]>([]);

  // Loading states
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingPresentThana, setLoadingPresentThana] = useState(false);
  const [loadingPermanentThana, setLoadingPermanentThana] = useState(false);
  const [loadingProfessionalThana, setLoadingProfessionalThana] = useState(false);
  const [loadingPresentPostOffice, setLoadingPresentPostOffice] = useState(false);
  const [loadingPermanentPostOffice, setLoadingPermanentPostOffice] = useState(false);
  const [loadingProfessionalPostOffice, setLoadingProfessionalPostOffice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load thanas for a section
  const loadThanasForSection = useCallback(async (
    districtCode: string,
    section: 'present' | 'permanent' | 'professional'
  ): Promise<ThanaData[]> => {
    const setLoading = section === 'present' ? setLoadingPresentThana
      : section === 'permanent' ? setLoadingPermanentThana
      : setLoadingProfessionalThana;
    
    const setThanas = section === 'present' ? setPresentThanas
      : section === 'permanent' ? setPermanentThanas
      : setProfessionalThanas;

    setLoading(true);
    try {
      const response = await loanApplicationApi.getThanaList(districtCode);
      if (isSuccessResponse(response) && response.dataList) {
        setThanas(response.dataList);
        return response.dataList;
      }
    } catch (error) {
      console.error(`Failed to load thanas for ${section}:`, error);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  // Load districts on mount and preselect from fetchalldata
  useEffect(() => {
    const loadDistrictsAndPreselect = async () => {
      setLoadingDistricts(true);
      try {
        const response = await loanApplicationApi.getDistrictList();
        if (isSuccessResponse(response) && response.dataList) {
          setDistricts(response.dataList);
          
          // After districts are loaded, preselect and load thanas for each section
          const initialFormData = getInitialFormData();
          
          // Load thanas for present address if district is set
          if (initialFormData.presentAddress.district) {
            const thanas = await loadThanasForSection(initialFormData.presentAddress.district, 'present');
            // Verify thana exists in the loaded list
            if (initialFormData.presentAddress.thana && thanas.length > 0) {
              const matchingThana = thanas.find(t => t.thanacode === initialFormData.presentAddress.thana);
              if (matchingThana) {
                setFormData(prev => ({
                  ...prev,
                  presentAddress: {
                    ...prev.presentAddress,
                    thanaName: matchingThana.thananame,
                  }
                }));
              }
            }
          }

          // Load thanas for permanent address if district is set
          if (initialFormData.permanentAddress.district) {
            const thanas = await loadThanasForSection(initialFormData.permanentAddress.district, 'permanent');
            if (initialFormData.permanentAddress.thana && thanas.length > 0) {
              const matchingThana = thanas.find(t => t.thanacode === initialFormData.permanentAddress.thana);
              if (matchingThana) {
                setFormData(prev => ({
                  ...prev,
                  permanentAddress: {
                    ...prev.permanentAddress,
                    thanaName: matchingThana.thananame,
                  }
                }));
              }
            }
          }

          // Load thanas for professional address if district is set
          if (initialFormData.professionalAddress.district) {
            const thanas = await loadThanasForSection(initialFormData.professionalAddress.district, 'professional');
            if (initialFormData.professionalAddress.thana && thanas.length > 0) {
              const matchingThana = thanas.find(t => t.thanacode === initialFormData.professionalAddress.thana);
              if (matchingThana) {
                setFormData(prev => ({
                  ...prev,
                  professionalAddress: {
                    ...prev.professionalAddress,
                    thanaName: matchingThana.thananame,
                  }
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load districts:", error);
        toast.error("Failed to load district list");
      } finally {
        setLoadingDistricts(false);
        setInitialLoadComplete(true);
      }
    };

    loadDistrictsAndPreselect();
  }, []);

  // Load thanas when district changes for each section (user interaction)
  const loadThanas = useCallback(async (
    districtCode: string,
    section: 'present' | 'permanent' | 'professional'
  ) => {
    await loadThanasForSection(districtCode, section);
  }, [loadThanasForSection]);

  // Load post offices when thana changes for each section
  const loadPostOffices = useCallback(async (
    districtCode: string,
    thanaCode: string,
    section: 'present' | 'permanent' | 'professional'
  ) => {
    const setLoading = section === 'present' ? setLoadingPresentPostOffice
      : section === 'permanent' ? setLoadingPermanentPostOffice
      : setLoadingProfessionalPostOffice;
    
    const setPostOffices = section === 'present' ? setPresentPostOffices
      : section === 'permanent' ? setPermanentPostOffices
      : setProfessionalPostOffices;

    setLoading(true);
    try {
      const response = await loanApplicationApi.getPostOfficeList(districtCode, thanaCode);
      if (isSuccessResponse(response) && response.dataList) {
        setPostOffices(response.dataList);
      }
    } catch (error) {
      console.error(`Failed to load post offices for ${section}:`, error);
      toast.error("Failed to load post office list");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save address data via API
  const saveAddressData = useCallback(async () => {
    setIsSaving(true);
    try {
      const session = getSessionContext();
      
      const payload = {
        applicationid: session.applicationId || "",
        cif: session.customerId || "",
        // Present Address
        presentaddr1: formData.presentAddress.addressLine1,
        presentaddr2: formData.presentAddress.addressLine2,
        presentdistrict: formData.presentAddress.district,
        presentthana: formData.presentAddress.thana,
        presentpostcode: formData.presentAddress.postCode,
        presentcountry: formData.presentAddress.country,
        // Permanent Address
        permanentaddr1: formData.permanentAddress.addressLine1,
        permanentaddr2: formData.permanentAddress.addressLine2,
        permanentdistrict: formData.permanentAddress.district,
        permanentthana: formData.permanentAddress.thana,
        permanentpostcode: formData.permanentAddress.postCode,
        permanentcountry: formData.permanentAddress.country,
        // Professional Address
        professionaddr1: formData.professionalAddress.addressLine1,
        professionaddr2: formData.professionalAddress.addressLine2,
        professiondistrict: formData.professionalAddress.district,
        professionthana: formData.professionalAddress.thana,
        professionpostcode: formData.professionalAddress.postCode,
        professioncountry: formData.professionalAddress.country,
        // Preferred Communication
        preferredcommunication: formData.communicationAddress,
      };

      const response = await loanApplicationApi.saveContactDetails(payload);
      
      if (isSuccessResponse(response)) {
        toast.success("Address information saved successfully");
        return true;
      } else {
        throw new Error(response.message || "Failed to save address");
      }
    } catch (error: any) {
      console.error("Failed to save address:", error);
      toast.error(error.message || "Failed to save address information");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData]);

  // Handle next - save before proceeding
  const handleNext = useCallback(async () => {
    const saved = await saveAddressData();
    if (saved) {
      onNext(formData);
    }
  }, [formData, onNext, saveAddressData]);

  // Expose handleNext for parent component
  useEffect(() => {
    // This exposes the save function for the parent's Next button
    (window as any).__addressStepSave = handleNext;
    return () => {
      delete (window as any).__addressStepSave;
    };
  }, [handleNext]);

  const handleAddressChange = (
    section: 'presentAddress' | 'permanentAddress' | 'professionalAddress',
    field: keyof AddressSectionData,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDistrictChange = (
    section: 'presentAddress' | 'permanentAddress' | 'professionalAddress',
    districtCode: string
  ) => {
    const selectedDistrict = districts.find(d => d.districtcode === districtCode);
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        district: districtCode,
        districtName: selectedDistrict?.districtname || "",
        thana: "",
        thanaName: "",
        postCode: "",
        postOfficeName: ""
      }
    }));

    // Clear thanas and post offices for this section
    const sectionKey = section.replace('Address', '') as 'present' | 'permanent' | 'professional';
    if (sectionKey === 'present') {
      setPresentThanas([]);
      setPresentPostOffices([]);
    } else if (sectionKey === 'permanent') {
      setPermanentThanas([]);
      setPermanentPostOffices([]);
    } else {
      setProfessionalThanas([]);
      setProfessionalPostOffices([]);
    }
    
    loadThanas(districtCode, sectionKey);
  };

  const handleThanaChange = (
    section: 'presentAddress' | 'permanentAddress' | 'professionalAddress',
    thanaCode: string
  ) => {
    const sectionKey = section.replace('Address', '') as 'present' | 'permanent' | 'professional';
    
    const thanas = section === 'presentAddress' ? presentThanas
      : section === 'permanentAddress' ? permanentThanas
      : professionalThanas;
    
    const selectedThana = thanas.find(t => t.thanacode === thanaCode);
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        thana: thanaCode,
        thanaName: selectedThana?.thananame || "",
        postCode: "",
        postOfficeName: ""
      }
    }));

    // Clear post offices for this section
    if (sectionKey === 'present') {
      setPresentPostOffices([]);
    } else if (sectionKey === 'permanent') {
      setPermanentPostOffices([]);
    } else {
      setProfessionalPostOffices([]);
    }

    const districtCode = formData[section].district;
    loadPostOffices(districtCode, thanaCode, sectionKey);
  };

  const handlePostCodeChange = (
    section: 'presentAddress' | 'permanentAddress' | 'professionalAddress',
    postCode: string
  ) => {
    const postOffices = section === 'presentAddress' ? presentPostOffices
      : section === 'permanentAddress' ? permanentPostOffices
      : professionalPostOffices;
    
    const selectedPostOffice = postOffices.find(p => p.postcode === postCode);
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        postCode: postCode,
        postOfficeName: selectedPostOffice?.postofficename || ""
      }
    }));
  };

  // Get display name for district
  const getDistrictDisplayName = (districtCode: string, districtName: string) => {
    if (districtName) return districtName;
    const district = districts.find(d => d.districtcode === districtCode);
    return district?.districtname || districtCode;
  };

  const renderAddressSection = (
    title: { english: string; bengali: string },
    sectionKey: 'presentAddress' | 'permanentAddress' | 'professionalAddress',
    thanas: ThanaData[],
    loadingThana: boolean,
    postOffices: PostOfficeData[],
    loadingPostOffice: boolean
  ) => {
    const sectionData = formData[sectionKey];
    
    return (
      <div className="space-y-3">
        {/* Section Header - matching PersonalInfoStep style */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm">
              <BilingualText english={title.english} bengali={title.bengali} />
            </h3>
          </div>
        </div>
        
        <div className="space-y-3 px-1">
          {/* Row 1: Address Line 1 - Full Width */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Address Line 1
              <span className="text-muted-foreground text-xs ml-1">(160 Characters)</span>
            </Label>
            <Input
              value={sectionData.addressLine1}
              onChange={(e) => handleAddressChange(sectionKey, "addressLine1", e.target.value.slice(0, 160))}
              placeholder="House/Flat, Road, Area"
              maxLength={160}
              className="bg-background border-input"
            />
          </div>
          
          {/* Row 2: Address Line 2 - Full Width */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Address Line 2
              <span className="text-muted-foreground text-xs ml-1">(60 Characters)</span>
            </Label>
            <Input
              value={sectionData.addressLine2}
              onChange={(e) => handleAddressChange(sectionKey, "addressLine2", e.target.value.slice(0, 60))}
              placeholder="Additional address details"
              maxLength={60}
              className="bg-background border-input"
            />
          </div>

          {/* Row 3: Country (Half) + District (Half) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Country</Label>
              <Input
                value={sectionData.country}
                onChange={(e) => handleAddressChange(sectionKey, "country", e.target.value)}
                placeholder="Country"
                className="bg-background border-input"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">District</Label>
              <Select
                value={sectionData.district}
                onValueChange={(value) => handleDistrictChange(sectionKey, value)}
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
          </div>

          {/* Row 4: Thana (Half) + Post Code (Half) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Thana</Label>
              <Select
                value={sectionData.thana}
                onValueChange={(value) => handleThanaChange(sectionKey, value)}
                disabled={!sectionData.district}
              >
                <SelectTrigger className="bg-background border-input">
                  {loadingThana ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder={sectionData.district ? "-- Select Thana --" : "Select District first"} />
                  )}
                </SelectTrigger>
                <SelectContent className="bg-card z-50 max-h-60">
                  {thanas.map((thana) => (
                    <SelectItem key={thana.thanacode} value={thana.thanacode}>
                      {thana.thananame}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Post Code</Label>
              <Select
                value={sectionData.postCode}
                onValueChange={(value) => handlePostCodeChange(sectionKey, value)}
                disabled={!sectionData.thana}
              >
                <SelectTrigger className="bg-background border-input">
                  {loadingPostOffice ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder={sectionData.thana ? "-- Select Post Code --" : "Select Thana first"} />
                  )}
                </SelectTrigger>
                <SelectContent className="bg-card z-50 max-h-60">
                  {postOffices.map((po) => (
                    <SelectItem key={po.postcode} value={po.postcode}>
                      {po.postcode} - {po.postofficename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header - matching PersonalInfoStep style */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm">
            <BilingualText english="Address Information" bengali="ঠিকানার তথ্য" />
          </h3>
          <p className="text-xs text-muted-foreground">
            <BilingualText 
              english="Provide your present, permanent, and professional address details" 
              bengali="আপনার বর্তমান, স্থায়ী এবং পেশাদার ঠিকানার বিবরণ প্রদান করুন" 
            />
          </p>
        </div>
      </div>

      {/* Loading indicator for initial data */}
      {!initialLoadComplete && loadingDistricts && (
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading address data...</span>
        </div>
      )}

      {/* Present Address Section */}
      {renderAddressSection(
        { english: "Present Address", bengali: "বর্তমান ঠিকানা" },
        'presentAddress',
        presentThanas,
        loadingPresentThana,
        presentPostOffices,
        loadingPresentPostOffice
      )}

      {/* Permanent Address Section */}
      {renderAddressSection(
        { english: "Permanent Address", bengali: "স্থায়ী ঠিকানা" },
        'permanentAddress',
        permanentThanas,
        loadingPermanentThana,
        permanentPostOffices,
        loadingPermanentPostOffice
      )}

      {/* Professional Address Section */}
      {renderAddressSection(
        { english: "Professional Address", bengali: "পেশাদার ঠিকানা" },
        'professionalAddress',
        professionalThanas,
        loadingProfessionalThana,
        professionalPostOffices,
        loadingProfessionalPostOffice
      )}

      {/* Preferred Communication Address */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm">
              <BilingualText english="Preferred Communication Address" bengali="যোগাযোগের পছন্দের ঠিকানা" />
            </h3>
          </div>
        </div>
        <div className="space-y-3 px-1">
          <RadioGroup
            value={formData.communicationAddress}
            onValueChange={(value) => setFormData(prev => ({ ...prev, communicationAddress: value }))}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors">
              <RadioGroupItem value="present" id="comm-present" />
              <Label htmlFor="comm-present" className="flex-1 cursor-pointer">
                <BilingualText english="Present Address" bengali="বর্তমান ঠিকানা" />
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors">
              <RadioGroupItem value="permanent" id="comm-permanent" />
              <Label htmlFor="comm-permanent" className="flex-1 cursor-pointer">
                <BilingualText english="Permanent Address" bengali="স্থায়ী ঠিকানা" />
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors">
              <RadioGroupItem value="professional" id="comm-professional" />
              <Label htmlFor="comm-professional" className="flex-1 cursor-pointer">
                <BilingualText english="Professional Address" bengali="পেশাদার ঠিকানা" />
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-primary">Saving address information...</span>
        </div>
      )}
    </div>
  );
};
