import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <User className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h3 className="font-semibold text-sm">
            <BilingualText english="Personal Information Review" bengali="ব্যক্তিগত তথ্য পর্যালোচনা" />
          </h3>
          <p className="text-xs text-muted-foreground">
            <BilingualText 
              english="Please verify your personal details below" 
              bengali="নিচে আপনার ব্যক্তিগত বিবরণ যাচাই করুন" 
            />
          </p>
        </div>
      </div>

      {/* Form Fields - Mobile optimized with reduced padding */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Full Name" bengali="পূর্ণ নাম" />
          </Label>
          <Input
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Father's Name" bengali="পিতার নাম" />
          </Label>
          <Input
            value={formData.fatherName}
            onChange={(e) => handleInputChange("fatherName", e.target.value)}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Mother's Name" bengali="মাতার নাম" />
          </Label>
          <Input
            value={formData.motherName}
            onChange={(e) => handleInputChange("motherName", e.target.value)}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Date of Birth" bengali="জন্ম তারিখ" />
          </Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="NID Number" bengali="এনআইডি নম্বর" />
          </Label>
          <Input
            value={formData.nidNumber}
            onChange={(e) => handleInputChange("nidNumber", e.target.value)}
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
          </Label>
          <Input
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
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
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Occupation" bengali="পেশা" />
          </Label>
          <Input
            value={formData.occupation}
            onChange={(e) => handleInputChange("occupation", e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Note */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
        <p className="text-sm text-foreground">
          <BilingualText 
            english="📝 Note: Most information is pre-filled from your account. You can update email and occupation if needed." 
            bengali="📝 দ্রষ্টব্য: বেশিরভাগ তথ্য আপনার অ্যাকাউন্ট থেকে পূর্বেই ভরা। প্রয়োজনে আপনি ইমেইল এবং পেশা আপডেট করতে পারেন।" 
          />
        </p>
      </div>
    </div>
  );
};