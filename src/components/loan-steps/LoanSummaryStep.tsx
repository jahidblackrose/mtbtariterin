import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, FileText, User, MapPin, CreditCard, DollarSign, CheckCircle } from "lucide-react";
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
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-mtb-teal/10 to-mtb-green/10 rounded-xl border border-mtb-teal/20">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mtb-teal to-mtb-green flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
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
      <Card className="border-border bg-card/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-mtb-teal/10 flex items-center justify-center">
              <User className="w-4 h-4 text-mtb-teal" />
            </div>
            <h4 className="font-semibold text-foreground">
              <BilingualText english="Personal Information" bengali="ব্যক্তিগত তথ্য" />
            </h4>
            <CheckCircle className="w-4 h-4 text-mtb-success ml-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">
                <BilingualText english="Full Name" bengali="পূর্ণ নাম" />
              </p>
              <p className="font-medium text-foreground">{data.fullName}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">
                <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
              </p>
              <p className="font-medium text-foreground">{data.mobileNumber}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">
                <BilingualText english="Email" bengali="ইমেইল" />
              </p>
              <p className="font-medium text-foreground">{data.email}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">
                <BilingualText english="Occupation" bengali="পেশা" />
              </p>
              <p className="font-medium text-foreground">{data.occupation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="border-border bg-card/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-mtb-green/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-mtb-green" />
            </div>
            <h4 className="font-semibold text-foreground">
              <BilingualText english="Address Information" bengali="ঠিকানার তথ্য" />
            </h4>
            <CheckCircle className="w-4 h-4 text-mtb-success ml-auto" />
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs mb-1">
                <BilingualText english="Present Address" bengali="বর্তমান ঠিকানা" />
              </p>
              <p className="font-medium text-foreground">{data.presentAddress}, {data.presentCity} - {data.presentPostCode}</p>
            </div>
            {!data.sameAsPresent && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground text-xs mb-1">
                  <BilingualText english="Permanent Address" bengali="স্থায়ী ঠিকানা" />
                </p>
                <p className="font-medium text-foreground">{data.permanentAddress}, {data.permanentCity} - {data.permanentPostCode}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Loans */}
      <Card className="border-border bg-card/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-mtb-orange/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-mtb-orange" />
            </div>
            <h4 className="font-semibold text-foreground">
              <BilingualText english="Existing Loans" bengali="বিদ্যমান ঋণ" />
            </h4>
            <CheckCircle className="w-4 h-4 text-mtb-success ml-auto" />
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            {data.hasExistingLoans ? (
              <p className="text-sm font-medium text-mtb-orange">
                <BilingualText english="Has existing loans with other banks" bengali="অন্যান্য ব্যাংকের সাথে বিদ্যমান ঋণ রয়েছে" />
              </p>
            ) : (
              <p className="text-sm font-medium text-mtb-success">
                <BilingualText english="No existing loans with other banks" bengali="অন্যান্য ব্যাংকের সাথে কোনো বিদ্যমান ঋণ নেই" />
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card className="bg-gradient-to-r from-mtb-teal/10 via-mtb-green/10 to-mtb-orange/10 border-mtb-teal/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-mtb-teal to-mtb-green flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-foreground">
              <BilingualText english="Loan Details" bengali="ঋণের বিবরণ" />
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Loan Purpose" bengali="ঋণের উদ্দেশ্য" />
              </p>
              <p className="font-semibold text-foreground">
                <BilingualText english={selectedPurpose?.en || "Not specified"} bengali={selectedPurpose?.bn || "উল্লেখ করা হয়নি"} />
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-card/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
              </p>
              <p className="font-bold text-2xl bg-gradient-to-r from-mtb-teal to-mtb-green bg-clip-text text-transparent">
                ৳{data.loanAmount?.[0]?.toLocaleString()}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-card/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Loan Tenure" bengali="ঋণের মেয়াদ" />
              </p>
              <p className="font-semibold text-lg text-foreground">
                {data.loanTenure?.[0]} <span className="text-muted-foreground"><BilingualText english="months" bengali="মাস" /></span>
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-card/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
              </p>
              <p className="font-bold text-2xl text-mtb-orange">
                ৳{data.emi?.toLocaleString()}
              </p>
            </div>
          </div>

          <Separator className="my-4 bg-border" />
          
          <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
            <span className="text-sm text-muted-foreground">
              <BilingualText english="Interest Rate" bengali="সুদের হার" />
            </span>
            <span className="font-semibold text-lg text-foreground">
              {data.interestRate}% <span className="text-sm text-muted-foreground">
                <BilingualText english="per annum" bengali="বার্ষিক" />
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <div className="p-4 bg-gradient-to-r from-mtb-orange/5 to-mtb-pink/5 rounded-xl border border-mtb-orange/20">
        <p className="text-sm text-foreground">
          <strong className="text-mtb-orange">
            <BilingualText english="📋 Important:" bengali="📋 গুরুত্বপূর্ণ:" />
          </strong>{" "}
          <BilingualText 
            english="Please review all information carefully. After proceeding, you will need to complete face verification and accept terms & conditions." 
            bengali="সমস্ত তথ্য সাবধানে পর্যালোচনা করুন। এগিয়ে যাওয়ার পরে, আপনাকে মুখ যাচাইকরণ সম্পূর্ণ করতে এবং শর্তাবলী গ্রহণ করতে হবে।" 
          />
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          className="bg-gradient-to-r from-mtb-teal to-mtb-green hover:from-mtb-teal/90 hover:to-mtb-green/90 text-white shadow-lg" 
          size="lg"
        >
          <BilingualText english="Continue to Verification" bengali="যাচাইকরণে চলুন" />
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
