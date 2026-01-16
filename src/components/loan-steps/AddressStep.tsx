import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { MapPin, ArrowRight } from "lucide-react";
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If "same as present" is checked, copy present address to permanent
      if (field === "sameAsPresent" && value === true) {
        newData.permanentAddress = prev.presentAddress;
        newData.permanentCity = prev.presentCity;
        newData.permanentPostCode = prev.presentPostCode;
      }
      
      return newData;
    });
  };

  const handleNext = () => {
    onNext(formData);
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
              english="Provide your present and permanent address details" 
              bengali="আপনার বর্তমান এবং স্থায়ী ঠিকানার বিবরণ প্রদান করুন" 
            />
          </p>
        </div>
      </div>

      {/* Present Address */}
      <div className="space-y-4">
        <h4 className="font-medium text-primary">
          <BilingualText english="Present Address" bengali="বর্তমান ঠিকানা" />
        </h4>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label className="bilingual-label">
              <BilingualText english="House/Flat, Road, Area" bengali="বাড়ি/ফ্ল্যাট, রাস্তা, এলাকা" />
            </Label>
            <Textarea
              value={formData.presentAddress}
              onChange={(e) => handleInputChange("presentAddress", e.target.value)}
              placeholder="Enter your present address"
              className="min-h-[80px]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="bilingual-label">
                <BilingualText english="City" bengali="শহর" />
              </Label>
              <Input
                value={formData.presentCity}
                onChange={(e) => handleInputChange("presentCity", e.target.value)}
                placeholder="e.g., Dhaka"
              />
            </div>

            <div className="space-y-2">
              <Label className="bilingual-label">
                <BilingualText english="Post Code" bengali="পোস্ট কোড" />
              </Label>
              <Input
                value={formData.presentPostCode}
                onChange={(e) => handleInputChange("presentPostCode", e.target.value)}
                placeholder="e.g., 1205"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Same as Present Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="sameAsPresent"
          checked={formData.sameAsPresent}
          onCheckedChange={(checked) => handleInputChange("sameAsPresent", checked as boolean)}
        />
        <Label htmlFor="sameAsPresent" className="text-sm font-medium">
          <BilingualText 
            english="Permanent address is same as present address" 
            bengali="স্থায়ী ঠিকানা বর্তমান ঠিকানার মতোই" 
          />
        </Label>
      </div>

      {/* Permanent Address */}
      {!formData.sameAsPresent && (
        <div className="space-y-4">
          <h4 className="font-medium text-primary">
            <BilingualText english="Permanent Address" bengali="স্থায়ী ঠিকানা" />
          </h4>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="bilingual-label">
                <BilingualText english="House/Flat, Road, Area" bengali="বাড়ি/ফ্ল্যাট, রাস্তা, এলাকা" />
              </Label>
              <Textarea
                value={formData.permanentAddress}
                onChange={(e) => handleInputChange("permanentAddress", e.target.value)}
                placeholder="Enter your permanent address"
                className="min-h-[80px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="bilingual-label">
                  <BilingualText english="City" bengali="শহর" />
                </Label>
                <Input
                  value={formData.permanentCity}
                  onChange={(e) => handleInputChange("permanentCity", e.target.value)}
                  placeholder="e.g., Dhaka"
                />
              </div>

              <div className="space-y-2">
                <Label className="bilingual-label">
                  <BilingualText english="Post Code" bengali="পোস্ট কোড" />
                </Label>
                <Input
                  value={formData.permanentPostCode}
                  onChange={(e) => handleInputChange("permanentPostCode", e.target.value)}
                  placeholder="e.g., 1205"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Communication Address Preference */}
      <div className="space-y-3">
        <Label className="bilingual-label">
          <BilingualText english="Preferred Communication Address" bengali="যোগাযোগের পছন্দের ঠিকানা" />
        </Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="present"
              name="communicationAddress"
              value="present"
              checked={formData.communicationAddress === "present"}
              onChange={(e) => handleInputChange("communicationAddress", e.target.value)}
              className="w-4 h-4 text-primary"
            />
            <Label htmlFor="present">
              <BilingualText english="Present Address" bengali="বর্তমান ঠিকানা" />
            </Label>
          </div>
          
          {!formData.sameAsPresent && (
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="permanent"
                name="communicationAddress"
                value="permanent"
                checked={formData.communicationAddress === "permanent"}
                onChange={(e) => handleInputChange("communicationAddress", e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <Label htmlFor="permanent">
                <BilingualText english="Permanent Address" bengali="স্থায়ী ঠিকানা" />
              </Label>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};