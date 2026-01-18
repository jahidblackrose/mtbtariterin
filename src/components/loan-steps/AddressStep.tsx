import { useState, useEffect } from "react";
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
import { loanApplicationApi, DistrictData, ThanaData } from "@/services/loanApplicationApi";
import { toast } from "sonner";

interface AddressStepProps {
  onNext: (data: any) => void;
  data: any;
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
};

export const AddressStep = ({ onNext, data }: AddressStepProps) => {
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

  // Loading states
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingPresentThana, setLoadingPresentThana] = useState(false);
  const [loadingPermanentThana, setLoadingPermanentThana] = useState(false);
  const [loadingProfessionalThana, setLoadingProfessionalThana] = useState(false);

  // Load districts on mount
  useEffect(() => {
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
  }, []);

  // Load thanas when district changes for each section
  const loadThanas = async (
    districtCode: string,
    section: 'present' | 'permanent' | 'professional'
  ) => {
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
        thanaName: ""
      }
    }));

    // Load thanas for the selected district
    const sectionKey = section.replace('Address', '') as 'present' | 'permanent' | 'professional';
    loadThanas(districtCode, sectionKey);
  };

  const handleThanaChange = (
    section: 'presentAddress' | 'permanentAddress' | 'professionalAddress',
    thanaCode: string
  ) => {
    const thanas = section === 'presentAddress' ? presentThanas
      : section === 'permanentAddress' ? permanentThanas
      : professionalThanas;
    
    const selectedThana = thanas.find(t => t.thanacode === thanaCode);
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        thana: thanaCode,
        thanaName: selectedThana?.thananame || ""
      }
    }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  const renderAddressSection = (
    title: { english: string; bengali: string },
    sectionKey: 'presentAddress' | 'permanentAddress' | 'professionalAddress',
    thanas: ThanaData[],
    loadingThana: boolean
  ) => {
    const sectionData = formData[sectionKey];
    
    return (
      <div className="space-y-4">
        {/* Section Header */}
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-lg font-semibold">
          <BilingualText english={title.english} bengali={title.bengali} />
        </div>
        
        <div className="bg-secondary/20 p-4 rounded-b-lg space-y-4">
          {/* Row 1: Address Line 1, Address Line 2, Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Address Line 1<span className="text-destructive">*</span>
                <span className="text-muted-foreground text-xs ml-1">(160 Characters)</span>
              </Label>
              <Input
                value={sectionData.addressLine1}
                onChange={(e) => handleAddressChange(sectionKey, "addressLine1", e.target.value.slice(0, 160))}
                placeholder="House/Flat, Road, Area"
                maxLength={160}
                className="bg-secondary/30 border-secondary"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Address Line 2<span className="text-destructive">*</span>
                <span className="text-muted-foreground text-xs ml-1">(60 Characters)</span>
              </Label>
              <Input
                value={sectionData.addressLine2}
                onChange={(e) => handleAddressChange(sectionKey, "addressLine2", e.target.value.slice(0, 60))}
                placeholder="Additional address details"
                maxLength={60}
                className="bg-secondary/30 border-secondary"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium">Country</Label>
              <Input
                value={sectionData.country}
                onChange={(e) => handleAddressChange(sectionKey, "country", e.target.value)}
                placeholder="Country"
                className="bg-secondary/30 border-secondary"
                readOnly
              />
            </div>
          </div>

          {/* Row 2: District, Thana, Post Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                District<span className="text-destructive">*</span>
              </Label>
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
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Thana<span className="text-destructive">*</span>
              </Label>
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
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Post Code<span className="text-destructive">*</span>
              </Label>
              <Input
                value={sectionData.postCode}
                onChange={(e) => handleAddressChange(sectionKey, "postCode", e.target.value)}
                placeholder="e.g., 1205"
                className="bg-secondary/30 border-secondary"
              />
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
        <div>
          <h3 className="font-semibold">
            <BilingualText english="Address Information" bengali="ঠিকানার তথ্য" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Provide your present, permanent, and professional address details" 
              bengali="আপনার বর্তমান, স্থায়ী এবং পেশাদার ঠিকানার বিবরণ প্রদান করুন" 
            />
          </p>
        </div>
      </div>

      {/* Present Address Section */}
      {renderAddressSection(
        { english: "Present Address", bengali: "বর্তমান ঠিকানা" },
        'presentAddress',
        presentThanas,
        loadingPresentThana
      )}

      {/* Permanent Address Section */}
      {renderAddressSection(
        { english: "Permanent Address", bengali: "স্থায়ী ঠিকানা" },
        'permanentAddress',
        permanentThanas,
        loadingPermanentThana
      )}

      {/* Professional Address Section */}
      {renderAddressSection(
        { english: "Professional Address", bengali: "পেশাদার ঠিকানা" },
        'professionalAddress',
        professionalThanas,
        loadingProfessionalThana
      )}

      {/* Preferred Communication Address */}
      <div className="space-y-3">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-lg font-semibold">
          <BilingualText english="Preferred Communication Address" bengali="যোগাযোগের পছন্দের ঠিকানা" />
        </div>
        <div className="bg-secondary/20 p-4 rounded-b-lg space-y-3">
          <div className="flex items-center space-x-3">
            <div 
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                formData.communicationAddress === "present" 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground"
              }`}
              onClick={() => setFormData(prev => ({ ...prev, communicationAddress: "present" }))}
            >
              {formData.communicationAddress === "present" && (
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              )}
            </div>
            <Label 
              className="cursor-pointer"
              onClick={() => setFormData(prev => ({ ...prev, communicationAddress: "present" }))}
            >
              <BilingualText english="Present Address" bengali="বর্তমান ঠিকানা" />
            </Label>
          </div>
          
          <div className="flex items-center space-x-3">
            <div 
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                formData.communicationAddress === "permanent" 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground"
              }`}
              onClick={() => setFormData(prev => ({ ...prev, communicationAddress: "permanent" }))}
            >
              {formData.communicationAddress === "permanent" && (
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              )}
            </div>
            <Label 
              className="cursor-pointer"
              onClick={() => setFormData(prev => ({ ...prev, communicationAddress: "permanent" }))}
            >
              <BilingualText english="Permanent Address" bengali="স্থায়ী ঠিকানা" />
            </Label>
          </div>
          
          <div className="flex items-center space-x-3">
            <div 
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                formData.communicationAddress === "professional" 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground"
              }`}
              onClick={() => setFormData(prev => ({ ...prev, communicationAddress: "professional" }))}
            >
              {formData.communicationAddress === "professional" && (
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              )}
            </div>
            <Label 
              className="cursor-pointer"
              onClick={() => setFormData(prev => ({ ...prev, communicationAddress: "professional" }))}
            >
              <BilingualText english="Professional Address" bengali="পেশাদার ঠিকানা" />
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
