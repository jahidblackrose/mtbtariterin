import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, ArrowRight, CheckCircle } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface PersonalInfoStepProps {
  onNext: (data: any) => void;
  data: any;
}

export const PersonalInfoStep = ({ onNext, data }: PersonalInfoStepProps) => {
  const [formData, setFormData] = useState({
    fullName: data.fullName || "Mohammad Rahman",
    fatherName: data.fatherName || "Abdul Rahman",
    motherName: data.motherName || "Fatima Rahman", 
    dateOfBirth: data.dateOfBirth || "1985-05-15",
    nidNumber: data.nidNumber || "1234567890123",
    mobileNumber: data.mobileNumber || "+880 1712-345678",
    email: data.email || "mohammad.rahman@email.com",
    occupation: data.occupation || "Business Owner"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-mtb-teal/10 to-mtb-green/10 rounded-xl border border-mtb-teal/20">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mtb-teal to-mtb-green flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            <BilingualText english="Personal Information Review" bengali="ব্যক্তিগত তথ্য পর্যালোচনা" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Please verify your personal details below" 
              bengali="নিচে আপনার ব্যক্তিগত বিবরণ যাচাই করুন" 
            />
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground flex items-center gap-2">
            <BilingualText english="Full Name" bengali="পূর্ণ নাম" />
            <CheckCircle className="w-4 h-4 text-mtb-success" />
          </Label>
          <Input
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className="bg-muted/50 border-border text-foreground"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground flex items-center gap-2">
            <BilingualText english="Father's Name" bengali="পিতার নাম" />
            <CheckCircle className="w-4 h-4 text-mtb-success" />
          </Label>
          <Input
            value={formData.fatherName}
            onChange={(e) => handleInputChange("fatherName", e.target.value)}
            className="bg-muted/50 border-border text-foreground"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground flex items-center gap-2">
            <BilingualText english="Mother's Name" bengali="মাতার নাম" />
            <CheckCircle className="w-4 h-4 text-mtb-success" />
          </Label>
          <Input
            value={formData.motherName}
            onChange={(e) => handleInputChange("motherName", e.target.value)}
            className="bg-muted/50 border-border text-foreground"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground flex items-center gap-2">
            <BilingualText english="Date of Birth" bengali="জন্ম তারিখ" />
            <CheckCircle className="w-4 h-4 text-mtb-success" />
          </Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="bg-muted/50 border-border text-foreground"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground flex items-center gap-2">
            <BilingualText english="NID Number" bengali="এনআইডি নম্বর" />
            <CheckCircle className="w-4 h-4 text-mtb-success" />
          </Label>
          <Input
            value={formData.nidNumber}
            onChange={(e) => handleInputChange("nidNumber", e.target.value)}
            className="bg-muted/50 border-border text-foreground"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground flex items-center gap-2">
            <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
            <CheckCircle className="w-4 h-4 text-mtb-success" />
          </Label>
          <Input
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
            className="bg-muted/50 border-border text-foreground"
            readOnly
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-foreground">
            <BilingualText english="Email Address" bengali="ইমেইল ঠিকানা" />
            <span className="text-xs text-muted-foreground ml-2">(Editable)</span>
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="bg-card border-border text-foreground focus:border-mtb-teal focus:ring-mtb-teal/20"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-foreground">
            <BilingualText english="Occupation" bengali="পেশা" />
            <span className="text-xs text-muted-foreground ml-2">(Editable)</span>
          </Label>
          <Input
            value={formData.occupation}
            onChange={(e) => handleInputChange("occupation", e.target.value)}
            className="bg-card border-border text-foreground focus:border-mtb-teal focus:ring-mtb-teal/20"
          />
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Note */}
      <div className="p-4 bg-gradient-to-r from-mtb-teal/5 to-mtb-green/5 rounded-xl border border-mtb-teal/20">
        <p className="text-sm text-foreground">
          <span className="font-medium">📝 </span>
          <BilingualText 
            english="Note: Most information is pre-filled from your account. You can update email and occupation if needed." 
            bengali="দ্রষ্টব্য: বেশিরভাগ তথ্য আপনার অ্যাকাউন্ট থেকে পূর্বেই ভরা। প্রয়োজনে আপনি ইমেইল এবং পেশা আপডেট করতে পারেন।" 
          />
        </p>
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
