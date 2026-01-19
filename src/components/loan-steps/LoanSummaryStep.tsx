import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, User, MapPin, CreditCard, DollarSign } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface LoanSummaryStepProps {
  onNext: () => void;
  data: any;
}

export const LoanSummaryStep = ({ onNext, data }: LoanSummaryStepProps) => {
  const loanPurposes = {
    business: { en: "Business Expansion", bn: "ব্যবসা সম্প্রসারণ" },
    education: { en: "Education", bn: "শিক্ষা" },
    medical: { en: "Medical Emergency", bn: "চিকিৎসা জরুরি" },
    home: { en: "Home Improvement", bn: "বাড়ি উন্নতি" },
    marriage: { en: "Marriage/Wedding", bn: "বিবাহ/বিয়ে" },
    travel: { en: "Travel", bn: "ভ্রমণ" },
    debt: { en: "Debt Consolidation", bn: "ঋণ একীকরণ" },
    other: { en: "Others", bn: "অন্যান্য" }
  };

  const selectedPurpose = loanPurposes[data.loanPurpose as keyof typeof loanPurposes];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-semibold">
            <BilingualText english="Application Summary" bengali="আবেদনের সারসংক্ষেপ" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Please review all information before proceeding" 
              bengali="এগিয়ে যাওয়ার আগে সমস্ত তথ্য পর্যালোচনা করুন" 
            />
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">
              <BilingualText english="Personal Information" bengali="ব্যক্তিগত তথ্য" />
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                <BilingualText english="Full Name" bengali="পূর্ণ নাম" />
              </p>
              <p className="font-medium">{data.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
              </p>
              <p className="font-medium">{data.mobileNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                <BilingualText english="Email" bengali="ইমেইল" />
              </p>
              <p className="font-medium">{data.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                <BilingualText english="Occupation" bengali="পেশা" />
              </p>
              <p className="font-medium">{data.occupation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">
              <BilingualText english="Address Information" bengali="ঠিকানার তথ্য" />
            </h4>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                <BilingualText english="Present Address" bengali="বর্তমান ঠিকানা" />
              </p>
              <p className="font-medium">
                {data.presentAddress?.addressLine1 || data.presentAddress || "-"}
                {data.presentAddress?.districtName && `, ${data.presentAddress.districtName}`}
                {data.presentAddress?.postCode && ` - ${data.presentAddress.postCode}`}
              </p>
            </div>
            {data.permanentAddress && (
              <div>
                <p className="text-muted-foreground">
                  <BilingualText english="Permanent Address" bengali="স্থায়ী ঠিকানা" />
                </p>
                <p className="font-medium">
                  {data.permanentAddress?.addressLine1 || data.permanentAddress || "-"}
                  {data.permanentAddress?.districtName && `, ${data.permanentAddress.districtName}`}
                  {data.permanentAddress?.postCode && ` - ${data.permanentAddress.postCode}`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Loans */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">
              <BilingualText english="Existing Loans" bengali="বিদ্যমান ঋণ" />
            </h4>
          </div>
          
          <p className="text-sm">
            {data.existingLoans && data.existingLoans.length > 0 ? (
              <span className="text-warning">
                <BilingualText english={`${data.existingLoans.length} existing loan(s) with other banks`} bengali={`অন্যান্য ব্যাংকে ${data.existingLoans.length}টি বিদ্যমান ঋণ রয়েছে`} />
              </span>
            ) : (
              <span className="text-success">
                <BilingualText english="No existing loans with other banks" bengali="অন্যান্য ব্যাংকের সাথে কোনো বিদ্যমান ঋণ নেই" />
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-primary">
              <BilingualText english="Loan Details" bengali="ঋণের বিবরণ" />
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Loan Purpose" bengali="ঋণের উদ্দেশ্য" />
              </p>
              <p className="font-semibold text-lg">
                <BilingualText english={selectedPurpose?.en || "Not specified"} bengali={selectedPurpose?.bn || "উল্লেখ করা হয়নি"} />
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
              </p>
              <p className="font-bold text-2xl text-primary">
                ৳{data.loanAmount?.[0]?.toLocaleString()}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Loan Tenure" bengali="ঋণের মেয়াদ" />
              </p>
              <p className="font-semibold text-lg">
                {data.loanTenure?.[0]} <BilingualText english="months" bengali="মাস" />
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
              </p>
              <p className="font-bold text-2xl text-accent">
                ৳{data.emi?.toLocaleString()}
              </p>
            </div>
          </div>

          <Separator className="my-4" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              <BilingualText english="Interest Rate" bengali="সুদের হার" />
            </span>
            <span className="font-semibold text-lg">
              {data.interestRate}% <span className="text-sm">
                <BilingualText english="per annum" bengali="বার্ষিক" />
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
        <p className="text-sm text-foreground">
          <strong>
            <BilingualText english="📋 Important:" bengali="📋 গুরুত্বপূর্ণ:" />
          </strong>{" "}
          <BilingualText 
            english="Please review all information carefully. After proceeding, you will need to complete face verification and accept terms & conditions." 
            bengali="সমস্ত তথ্য সাবধানে পর্যালোচনা করুন। এগিয়ে যাওয়ার পরে, আপনাকে মুখ যাচাইকরণ সম্পূর্ণ করতে এবং শর্তাবলী গ্রহণ করতে হবে।" 
          />
        </p>
      </div>
    </div>
  );
};
