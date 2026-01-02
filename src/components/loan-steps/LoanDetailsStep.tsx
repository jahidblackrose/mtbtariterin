import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calculator, Clock, TrendingUp, Percent, Wallet } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface LoanDetailsStepProps {
  onNext: (data: any) => void;
  data: any;
}

export const LoanDetailsStep = ({ onNext, data }: LoanDetailsStepProps) => {
  const [formData, setFormData] = useState({
    loanPurpose: data.loanPurpose || "",
    loanAmount: data.loanAmount || [100000],
    loanTenure: data.loanTenure || [12]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loanPurposes = [
    { value: "business", labelEn: "Business Expansion", labelBn: "ব্যবসা সম্প্রসারণ" },
    { value: "education", labelEn: "Education", labelBn: "শিক্ষা" },
    { value: "medical", labelEn: "Medical Emergency", labelBn: "চিকিৎসা জরুরি" },
    { value: "home", labelEn: "Home Improvement", labelBn: "বাড়ি উন্নতি" },
    { value: "marriage", labelEn: "Marriage/Wedding", labelBn: "বিবাহ/বিয়ে" },
    { value: "travel", labelEn: "Travel", labelBn: "ভ্রমণ" },
    { value: "debt", labelEn: "Debt Consolidation", labelBn: "ঋণ একীকরণ" },
    { value: "other", labelEn: "Others", labelBn: "অন্যান্য" }
  ];

  const maxLoanAmount = 500000;
  const maxTenure = 60;
  const interestRate = 12;

  const calculateEMI = () => {
    const principal = formData.loanAmount[0];
    const tenure = formData.loanTenure[0];
    const monthlyRate = interestRate / 12 / 100;
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    return Math.round(emi);
  };

  const handleNext = () => {
    if (!formData.loanPurpose) {
      setErrors({ loanPurpose: "Please select a loan purpose" });
      return;
    }
    const emi = calculateEMI();
    onNext({ ...formData, emi, interestRate });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-mtb-teal/10 to-mtb-green/10 rounded-xl border border-mtb-teal/20">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mtb-teal to-mtb-green flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            <BilingualText english="Loan Requirements" bengali="ঋণের প্রয়োজনীয়তা" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Specify your loan amount, tenure and purpose" 
              bengali="আপনার ঋণের পরিমাণ, মেয়াদ এবং উদ্দেশ্য নির্দিষ্ট করুন" 
            />
          </p>
        </div>
      </div>

      {/* Loan Purpose */}
      <div className="space-y-3">
        <Label className="text-foreground font-medium">
          <BilingualText english="Loan Purpose" bengali="ঋণের উদ্দেশ্য" />
        </Label>
        <Select 
          value={formData.loanPurpose} 
          onValueChange={(value) => {
            setFormData(prev => ({ ...prev, loanPurpose: value }));
            setErrors({});
          }}
        >
          <SelectTrigger className={`h-12 bg-card border-border text-foreground ${errors.loanPurpose ? 'border-destructive' : ''}`}>
            <SelectValue placeholder="Select loan purpose / ঋণের উদ্দেশ্য নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {loanPurposes.map((purpose) => (
              <SelectItem key={purpose.value} value={purpose.value} className="text-foreground">
                <div className="flex items-center justify-between w-full gap-4">
                  <span>{purpose.labelEn}</span>
                  <span className="text-muted-foreground">{purpose.labelBn}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.loanPurpose && (
          <p className="text-xs text-destructive">{errors.loanPurpose}</p>
        )}
      </div>

      <Separator className="bg-border" />

      {/* Loan Amount */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-mtb-teal" />
            <Label className="text-foreground font-medium">
              <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
            </Label>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-mtb-teal to-mtb-green bg-clip-text text-transparent">
              ৳{formData.loanAmount[0].toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <BilingualText english={`Max: ৳${maxLoanAmount.toLocaleString()}`} bengali={`সর্বোচ্চ: ৳${maxLoanAmount.toLocaleString()}`} />
            </p>
          </div>
        </div>
        
        <Slider
          value={formData.loanAmount}
          onValueChange={(value) => setFormData(prev => ({ ...prev, loanAmount: value }))}
          max={maxLoanAmount}
          min={10000}
          step={5000}
          className="w-full"
        />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>৳10,000</span>
          <span>৳{maxLoanAmount.toLocaleString()}</span>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Loan Tenure */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-mtb-green" />
            <Label className="text-foreground font-medium">
              <BilingualText english="Loan Tenure" bengali="ঋণের মেয়াদ" />
            </Label>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-mtb-green">
              {formData.loanTenure[0]} <span className="text-base font-medium text-muted-foreground">
                <BilingualText english="months" bengali="মাস" />
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              <BilingualText english={`Max: ${maxTenure} months`} bengali={`সর্বোচ্চ: ${maxTenure} মাস`} />
            </p>
          </div>
        </div>
        
        <Slider
          value={formData.loanTenure}
          onValueChange={(value) => setFormData(prev => ({ ...prev, loanTenure: value }))}
          max={maxTenure}
          min={6}
          step={3}
          className="w-full"
        />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>6 <BilingualText english="months" bengali="মাস" /></span>
          <span>{maxTenure} <BilingualText english="months" bengali="মাস" /></span>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* EMI Calculation */}
      <Card className="bg-gradient-to-r from-mtb-teal/10 via-mtb-green/10 to-mtb-orange/10 border-mtb-teal/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-mtb-teal to-mtb-green flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-foreground">
              <BilingualText english="EMI Calculation" bengali="ইএমআই গণনা" />
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-mtb-teal to-mtb-green bg-clip-text text-transparent">
                ৳{calculateEMI().toLocaleString()}
              </p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-1">
                <Percent className="w-4 h-4" />
                <BilingualText english="Interest Rate" bengali="সুদের হার" />
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {interestRate}% <span className="text-sm text-muted-foreground">
                  <BilingualText english="p.a." bengali="বার্ষিক" />
                </span>
              </p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">
                <BilingualText english="Total Amount" bengali="মোট পরিমাণ" />
              </p>
              <p className="text-2xl font-semibold text-mtb-orange">
                ৳{(calculateEMI() * formData.loanTenure[0]).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
