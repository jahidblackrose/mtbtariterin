import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Lock } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface PersonalInfoStepProps {
  onNext: (data: any) => void;
  data: any;
  isReadOnly?: boolean;
}

export const PersonalInfoStep = ({ onNext, data, isReadOnly = true }: PersonalInfoStepProps) => {
  // All fields are read-only when data is prefilled from API
  const formData = {
    fullName: data.fullName || "",
    fatherName: data.fatherName || "",
    motherName: data.motherName || "",
    dateOfBirth: data.dateOfBirth || "",
    nidNumber: data.nidNumber || "",
    mobileNumber: data.mobileNumber || "",
    email: data.email || "",
    occupation: data.occupation || "",
    gender: data.gender || "",
    maritalStatus: data.maritalStatus || "",
  };

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

      {/* Form Fields - All read-only when prefilled */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Full Name" bengali="পূর্ণ নাম" />
          </Label>
          <Input
            value={formData.fullName}
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
              value={formData.dateOfBirth}
              className="bg-muted/30"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              <BilingualText english="Gender" bengali="লিঙ্গ" />
            </Label>
            <Input
              value={formData.gender}
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
            value={formData.nidNumber}
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
            className="bg-muted/30"
            readOnly
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            <BilingualText english="Occupation" bengali="পেশা" />
          </Label>
          <Input
            value={formData.occupation}
            className="bg-muted/30"
            readOnly
          />
        </div>
      </div>

      <Separator />

      {/* Note */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
        <p className="text-sm text-foreground">
          <BilingualText 
            english="📝 This information is fetched from your bank records and cannot be modified here." 
            bengali="📝 এই তথ্য আপনার ব্যাংক রেকর্ড থেকে নেওয়া হয়েছে এবং এখানে পরিবর্তন করা যাবে না।" 
          />
        </p>
      </div>
    </div>
  );
};
