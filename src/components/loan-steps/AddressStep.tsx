import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, Lock } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loanApplicationApi, DistrictData, ThanaData } from "@/services/loanApplicationApi";
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

export const AddressStep = ({ onNext, data, isReadOnly = true }: AddressStepProps) => {
  const [formData, setFormData] = useState({
    presentAddress: { ...defaultAddressSection, ...data.presentAddress },
    permanentAddress: { ...defaultAddressSection, ...data.permanentAddress },
    professionalAddress: { ...defaultAddressSection, ...data.professionalAddress },
    communicationAddress: data.communicationAddress || "present"
  });

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

  // Load districts on mount (only if not read-only)
  useEffect(() => {
    if (isReadOnly) return;
    
    const loadDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await loanApplicationApi.getDistrictList();
        if (response.status === "S" && response.dataList) {
          setDistricts(response.dataList);
        }
      } catch (error) {
        console.error("Failed to load districts:", error);
        toast.error("Failed to load district list");
      } finally {
        setLoadingDistricts(false);
      }
    };
    loadDistricts();
  }, [isReadOnly]);

  // Load thanas when district changes for each section
  const loadThanas = async (
    districtCode: string,
    section: 'present' | 'permanent' | 'professional'
  ) => {
    if (isReadOnly) return;
    
    const setLoading = section === 'present' ? setLoadingPresentThana
      : section === 'permanent' ? setLoadingPermanentThana
      : setLoadingProfessionalThana;
    
    const setThanas = section === 'present' ? setPresentThanas
      : section === 'permanent' ? setPermanentThanas
      : setProfessionalThanas;

    setLoading(true);
    try {
      const response = await loanApplicationApi.getThanaList(districtCode);
      if (response.status === "S" && response.dataList) {
        setThanas(response.dataList);
      }
    } catch (error) {
      console.error(`Failed to load thanas for ${section}:`, error);
      toast.error("Failed to load thana list");
    } finally {
      setLoading(false);
    }
  };

  // Load post offices when thana changes for each section
  const loadPostOffices = async (
    districtCode: string,
    thanaCode: string,
    section: 'present' | 'permanent' | 'professional'
  ) => {
    if (isReadOnly) return;
    
    const setLoading = section === 'present' ? setLoadingPresentPostOffice
      : section === 'permanent' ? setLoadingPermanentPostOffice
      : setLoadingProfessionalPostOffice;
    
    const setPostOffices = section === 'present' ? setPresentPostOffices
      : section === 'permanent' ? setPermanentPostOffices
      : setProfessionalPostOffices;

    setLoading(true);
    try {
      const response = await loanApplicationApi.getPostOfficeList(districtCode, thanaCode);
      if (response.status === "S" && response.dataList) {
        setPostOffices(response.dataList);
      }
    } catch (error) {
      console.error(`Failed to load post offices for ${section}:`, error);
      toast.error("Failed to load post office list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (
    section: 'presentAddress' | 'permanentAddress' | 'professionalAddress',
    field: keyof AddressSectionData,
    value: string
  ) => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
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
    if (isReadOnly) return;
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
    if (isReadOnly) return;
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
        {/* Section Header */}
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-lg font-semibold flex items-center justify-between">
          <BilingualText english={title.english} bengali={title.bengali} />
          {isReadOnly && (
            <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3" />
              <span>Read-only</span>
            </div>
          )}
        </div>
        
        <div className="bg-secondary/20 p-4 rounded-b-lg space-y-4">
          {/* Row 1: Address Line 1 - Full Width */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Address Line 1
              <span className="text-muted-foreground text-xs ml-1">(160 Characters)</span>
            </Label>
            <Input
              value={sectionData.addressLine1}
              onChange={(e) => handleAddressChange(sectionKey, "addressLine1", e.target.value.slice(0, 160))}
              placeholder={isReadOnly ? "-" : "House/Flat, Road, Area"}
              maxLength={160}
              className="bg-secondary/30 border-secondary"
              readOnly={isReadOnly}
            />
          </div>
          
          {/* Row 2: Address Line 2 - Full Width */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Address Line 2
              <span className="text-muted-foreground text-xs ml-1">(60 Characters)</span>
            </Label>
            <Input
              value={sectionData.addressLine2}
              onChange={(e) => handleAddressChange(sectionKey, "addressLine2", e.target.value.slice(0, 60))}
              placeholder={isReadOnly ? "-" : "Additional address details"}
              maxLength={60}
              className="bg-secondary/30 border-secondary"
              readOnly={isReadOnly}
            />
          </div>

          {/* Row 3: Country (Half) + District (Half) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Country</Label>
              <Input
                value={sectionData.country}
                className="bg-secondary/30 border-secondary"
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium">District</Label>
              {isReadOnly ? (
                <Input
                  value={sectionData.districtName || sectionData.district || "-"}
                  className="bg-secondary/30 border-secondary"
                  readOnly
                />
              ) : (
                <Select
                  value={sectionData.district}
                  onValueChange={(value) => handleDistrictChange(sectionKey, value)}
                >
                  <SelectTrigger className="bg-secondary/30 border-secondary">
                    {loadingDistricts ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="-- Select District --" />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {districts.map((district) => (
                      <SelectItem key={district.districtcode} value={district.districtcode}>
                        {district.districtname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Row 4: Thana (Half) + Post Code (Half) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Thana</Label>
              {isReadOnly ? (
                <Input
                  value={sectionData.thanaName || sectionData.thana || "-"}
                  className="bg-secondary/30 border-secondary"
                  readOnly
                />
              ) : (
                <Select
                  value={sectionData.thana}
                  onValueChange={(value) => handleThanaChange(sectionKey, value)}
                  disabled={!sectionData.district}
                >
                  <SelectTrigger className="bg-secondary/30 border-secondary">
                    {loadingThana ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder={sectionData.district ? "-- Select Thana --" : "Select District first"} />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {thanas.map((thana) => (
                      <SelectItem key={thana.thanacode} value={thana.thanacode}>
                        {thana.thananame}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium">Post Code</Label>
              {isReadOnly ? (
                <Input
                  value={sectionData.postCode || "-"}
                  className="bg-secondary/30 border-secondary"
                  readOnly
                />
              ) : (
                <Select
                  value={sectionData.postCode}
                  onValueChange={(value) => handlePostCodeChange(sectionKey, value)}
                  disabled={!sectionData.thana}
                >
                  <SelectTrigger className="bg-secondary/30 border-secondary">
                    {loadingPostOffice ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder={sectionData.thana ? "-- Select Post Code --" : "Select Thana first"} />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {postOffices.map((po) => (
                      <SelectItem key={po.postcode} value={po.postcode}>
                        {po.postcode} - {po.postofficename}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <MapPin className="w-6 h-6 text-primary" />
        <div className="flex-1">
          <h3 className="font-semibold">
            <BilingualText english="Address Information" bengali="ঠিকানার তথ্য" />
          </h3>
          <p className="text-sm text-muted-foreground">
            {isReadOnly ? (
              <BilingualText 
                english="Your address details from bank records" 
                bengali="ব্যাংক রেকর্ড থেকে আপনার ঠিকানার বিবরণ" 
              />
            ) : (
              <BilingualText 
                english="Provide your present, permanent, and professional address details" 
                bengali="আপনার বর্তমান, স্থায়ী এবং পেশাদার ঠিকানার বিবরণ প্রদান করুন" 
              />
            )}
          </p>
        </div>
      </div>

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
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-lg font-semibold">
          <BilingualText english="Preferred Communication Address" bengali="যোগাযোগের পছন্দের ঠিকানা" />
        </div>
        <div className="bg-secondary/20 p-4 rounded-b-lg space-y-3">
          {["present", "permanent", "professional"].map((type) => (
            <div key={type} className="flex items-center space-x-3">
              <div 
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isReadOnly ? "cursor-default" : "cursor-pointer"
                } ${
                  formData.communicationAddress === type 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground"
                }`}
                onClick={() => !isReadOnly && setFormData(prev => ({ ...prev, communicationAddress: type }))}
              >
                {formData.communicationAddress === type && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
              <Label 
                className={isReadOnly ? "cursor-default" : "cursor-pointer"}
                onClick={() => !isReadOnly && setFormData(prev => ({ ...prev, communicationAddress: type }))}
              >
                <BilingualText 
                  english={`${type.charAt(0).toUpperCase() + type.slice(1)} Address`} 
                  bengali={type === "present" ? "বর্তমান ঠিকানা" : type === "permanent" ? "স্থায়ী ঠিকানা" : "পেশাদার ঠিকানা"} 
                />
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
