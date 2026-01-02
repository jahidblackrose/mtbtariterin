import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, ArrowRight, Home, Building } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface AddressStepProps {
  onNext: (data: any) => void;
  data: any;
}

export const AddressStep = ({ onNext, data }: AddressStepProps) => {
  const [formData, setFormData] = useState({
    presentAddress: data.presentAddress || "House 123, Road 5, Dhanmondi",
    presentCity: data.presentCity || "Dhaka",
    presentPostCode: data.presentPostCode || "1205",
    permanentAddress: data.permanentAddress || "",
    permanentCity: data.permanentCity || "",
    permanentPostCode: data.permanentPostCode || "",
    sameAsPresent: data.sameAsPresent || false,
    communicationAddress: data.communicationAddress || "present"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePostCode = (value: string): boolean => {
    return /^\d{4}$/.test(value);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === "sameAsPresent" && value === true) {
        newData.permanentAddress = prev.presentAddress;
        newData.permanentCity = prev.presentCity;
        newData.permanentPostCode = prev.presentPostCode;
      }
      
      return newData;
    });

    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.presentAddress.trim()) {
      newErrors.presentAddress = "Present address is required";
    }
    if (!formData.presentCity.trim()) {
      newErrors.presentCity = "City is required";
    }
    if (!validatePostCode(formData.presentPostCode)) {
      newErrors.presentPostCode = "Post code must be 4 digits";
    }

    if (!formData.sameAsPresent) {
      if (!formData.permanentAddress.trim()) {
        newErrors.permanentAddress = "Permanent address is required";
      }
      if (!formData.permanentCity.trim()) {
        newErrors.permanentCity = "City is required";
      }
      if (!validatePostCode(formData.permanentPostCode)) {
        newErrors.permanentPostCode = "Post code must be 4 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-mtb-teal/10 to-mtb-green/10 rounded-xl border border-mtb-teal/20">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mtb-teal to-mtb-green flex items-center justify-center">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            <BilingualText english="Address Information" bengali="ঠিকানার তথ্য" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Provide your present and permanent address details" 
              bengali="আপনার বর্তমান এবং স্থায়ী ঠিকানার বিবরণ প্রদান করুন" 
            />
          </p>
        </div>
      </div>

      {/* Present Address */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-mtb-teal" />
          <h4 className="font-medium text-foreground">
            <BilingualText english="Present Address" bengali="বর্তমান ঠিকানা" />
          </h4>
        </div>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label className="text-foreground">
              <BilingualText english="House/Flat, Road, Area" bengali="বাড়ি/ফ্ল্যাট, রাস্তা, এলাকা" />
            </Label>
            <Textarea
              value={formData.presentAddress}
              onChange={(e) => handleInputChange("presentAddress", e.target.value)}
              placeholder="Enter your present address"
              className={`min-h-[80px] bg-card border-border text-foreground ${errors.presentAddress ? 'border-destructive' : ''}`}
            />
            {errors.presentAddress && (
              <p className="text-xs text-destructive">{errors.presentAddress}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">
                <BilingualText english="City" bengali="শহর" />
              </Label>
              <Input
                value={formData.presentCity}
                onChange={(e) => handleInputChange("presentCity", e.target.value)}
                placeholder="e.g., Dhaka"
                className={`bg-card border-border text-foreground ${errors.presentCity ? 'border-destructive' : ''}`}
              />
              {errors.presentCity && (
                <p className="text-xs text-destructive">{errors.presentCity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">
                <BilingualText english="Post Code" bengali="পোস্ট কোড" />
              </Label>
              <Input
                value={formData.presentPostCode}
                onChange={(e) => handleInputChange("presentPostCode", e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g., 1205"
                className={`bg-card border-border text-foreground ${errors.presentPostCode ? 'border-destructive' : ''}`}
              />
              {errors.presentPostCode && (
                <p className="text-xs text-destructive">{errors.presentPostCode}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Same as Present Checkbox */}
      <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl border border-border">
        <Checkbox
          id="sameAsPresent"
          checked={formData.sameAsPresent}
          onCheckedChange={(checked) => handleInputChange("sameAsPresent", checked as boolean)}
          className="border-mtb-teal data-[state=checked]:bg-mtb-teal data-[state=checked]:border-mtb-teal"
        />
        <Label htmlFor="sameAsPresent" className="text-sm font-medium text-foreground cursor-pointer">
          <BilingualText 
            english="Permanent address is same as present address" 
            bengali="স্থায়ী ঠিকানা বর্তমান ঠিকানার মতোই" 
          />
        </Label>
      </div>

      {/* Permanent Address */}
      {!formData.sameAsPresent && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-mtb-green" />
            <h4 className="font-medium text-foreground">
              <BilingualText english="Permanent Address" bengali="স্থায়ী ঠিকানা" />
            </h4>
          </div>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">
                <BilingualText english="House/Flat, Road, Area" bengali="বাড়ি/ফ্ল্যাট, রাস্তা, এলাকা" />
              </Label>
              <Textarea
                value={formData.permanentAddress}
                onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
                placeholder="Enter your permanent address"
                className={`min-h-[80px] bg-card border-border text-foreground ${errors.permanentAddress ? 'border-destructive' : ''}`}
              />
              {errors.permanentAddress && (
                <p className="text-xs text-destructive">{errors.permanentAddress}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">
                  <BilingualText english="City" bengali="শহর" />
                </Label>
                <Input
                  value={formData.permanentCity}
                  onChange={(e) => handleInputChange("permanentCity", e.target.value)}
                  placeholder="e.g., Dhaka"
                  className={`bg-card border-border text-foreground ${errors.permanentCity ? 'border-destructive' : ''}`}
                />
                {errors.permanentCity && (
                  <p className="text-xs text-destructive">{errors.permanentCity}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">
                  <BilingualText english="Post Code" bengali="পোস্ট কোড" />
                </Label>
                <Input
                  value={formData.permanentPostCode}
                  onChange={(e) => handleInputChange("permanentPostCode", e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="e.g., 1205"
                  className={`bg-card border-border text-foreground ${errors.permanentPostCode ? 'border-destructive' : ''}`}
                />
                {errors.permanentPostCode && (
                  <p className="text-xs text-destructive">{errors.permanentPostCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator className="bg-border" />

      {/* Communication Address Preference */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium">
          <BilingualText english="Preferred Communication Address" bengali="যোগাযোগের পছন্দের ঠিকানা" />
        </Label>
        <RadioGroup
          value={formData.communicationAddress}
          onValueChange={(value) => handleInputChange("communicationAddress", value)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-mtb-teal/50 transition-colors">
            <RadioGroupItem value="present" id="present" className="border-mtb-teal text-mtb-teal" />
            <Label htmlFor="present" className="text-foreground cursor-pointer">
              <BilingualText english="Present Address" bengali="বর্তমান ঠিকানা" />
            </Label>
          </div>
          
          {!formData.sameAsPresent && (
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-mtb-teal/50 transition-colors">
              <RadioGroupItem value="permanent" id="permanent" className="border-mtb-teal text-mtb-teal" />
              <Label htmlFor="permanent" className="text-foreground cursor-pointer">
                <BilingualText english="Permanent Address" bengali="স্থায়ী ঠিকানা" />
              </Label>
            </div>
          )}
        </RadioGroup>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button 
          onClick={handleNext} 
          className="bg-gradient-to-r from-mtb-teal to-mtb-green hover:from-mtb-teal/90 hover:to-mtb-green/90 text-white shadow-lg" 
          size="lg"
        >
          <BilingualText english="Save & Next" bengali="সংরক্ষণ ও পরবর্তী" />
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
