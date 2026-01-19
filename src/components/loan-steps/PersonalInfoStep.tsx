import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    gender: data.gender || "",
    maritalStatus: data.maritalStatus || "",
    districtOfBirth: data.districtOfBirth || "",
    countryOfBirth: data.countryOfBirth || "Bangladesh",
    countryOfResidence: data.countryOfResidence || "Bangladesh",
    etinNumber: data.etinNumber || "",
    emergencyContactName: data.emergencyContactName || "",
    emergencyContactNumber: data.emergencyContactNumber || "",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-primary rounded-t-lg">
        <h3 className="font-semibold text-sm text-primary-foreground">
          <BilingualText english="Applicant Personal Details" bengali="আবেদনকারীর ব্যক্তিগত বিবরণ" />
        </h3>
        {isReadOnly && (
          <div className="flex items-center gap-1 text-xs text-primary-foreground/80">
            <Lock className="w-3 h-3" />
            <span>Logout</span>
          </div>
        )}
      </div>

      {/* Form Fields - 3 Column Grid */}
      <div className="p-4 bg-muted/30 rounded-b-lg space-y-4">
        {/* Row 1: Customer's Name, Date of Birth, Mobile Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Customer's Name" bengali="গ্রাহকের নাম" />
            </Label>
            <Input
              value={formData.fullName}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Date of Birth" bengali="জন্ম তারিখ" />
            </Label>
            <Input
              value={formData.dateOfBirth}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
            </Label>
            <Input
              value={formData.mobileNumber}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>
        </div>

        {/* Row 2: Email, NID, Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Email" bengali="ইমেইল" />
            </Label>
            <Input
              type="email"
              value={formData.email}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="NID" bengali="এনআইডি" />
            </Label>
            <Input
              value={formData.nidNumber}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Gender" bengali="লিঙ্গ" />
            </Label>
            <Input
              value={formData.gender}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>
        </div>

        {/* Row 3: Marital Status, District of Birth, Country of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Marital Status" bengali="বৈবাহিক অবস্থা" />
            </Label>
            <Select value={formData.maritalStatus} disabled>
              <SelectTrigger className="bg-muted/50 border-muted">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Divorced">Divorced</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-destructive">
              <BilingualText english="District of Birth" bengali="জন্ম জেলা" /> *
            </Label>
            <Select value={formData.districtOfBirth} disabled>
              <SelectTrigger className="bg-muted/50 border-muted">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dhaka">Dhaka</SelectItem>
                <SelectItem value="Faridpur">Faridpur</SelectItem>
                <SelectItem value="Chittagong">Chittagong</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Country of Birth" bengali="জন্ম দেশ" />
            </Label>
            <Input
              value={formData.countryOfBirth}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>
        </div>

        {/* Row 4: Father's Name, Mother's Name, E-TIN Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Father's Name" bengali="পিতার নাম" />
            </Label>
            <Input
              value={formData.fatherName}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Mother's Name" bengali="মাতার নাম" />
            </Label>
            <Input
              value={formData.motherName}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="E-TIN Number" bengali="ই-টিআইএন নম্বর" />
            </Label>
            <Input
              value={formData.etinNumber}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>
        </div>

        {/* Row 5: Country of Residence, Emergency Contact Name, Emergency Contact Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Country of Residence" bengali="বসবাসের দেশ" />
            </Label>
            <Input
              value={formData.countryOfResidence}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Emergency Contact Name" bengali="জরুরি যোগাযোগের নাম" />
            </Label>
            <Input
              value={formData.emergencyContactName}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-primary">
              <BilingualText english="Emergency Contact Number" bengali="জরুরি যোগাযোগ নম্বর" />
            </Label>
            <Input
              value={formData.emergencyContactNumber}
              className="bg-muted/50 border-muted"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};
