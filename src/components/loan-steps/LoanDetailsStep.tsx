import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ArrowRight, Calculator, Clock } from "lucide-react";
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
  const interestRate = 12; // 12% annual interest

  const calculateEMI = () => {
    const principal = formData.loanAmount[0];
    const tenure = formData.loanTenure[0];
    const monthlyRate = interestRate / 12 / 100;
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    return Math.round(emi);
  };

  const handleNext = () => {
    const emi = calculateEMI();
    onNext({ ...formData, emi, interestRate });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <Calculator className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-semibold">
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
        <Label className="bilingual-label">
          <BilingualText english="Loan Purpose" bengali="ঋণের উদ্দেশ্য" />
        </Label>
        <Select 
          value={formData.loanPurpose} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, loanPurpose: value }))}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select loan purpose / ঋণের উদ্দেশ্য নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            {loanPurposes.map((purpose) => (
              <SelectItem key={purpose.value} value={purpose.value}>
                <div className="flex items-center justify-between w-full">
                  <span>{purpose.labelEn}</span>
                  <span className="text-muted-foreground ml-4">{purpose.labelBn}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Loan Amount */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="bilingual-label">
            <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
          </Label>
          <div className="text-right">
            <div className="loan-amount-display">
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

      <Separator />

      {/* Loan Tenure */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="bilingual-label">
            <BilingualText english="Loan Tenure" bengali="ঋণের মেয়াদ" />
          </Label>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formData.loanTenure[0]} <span className="text-base font-medium">
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

      <Separator />

      {/* EMI Calculation */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-primary" />
            <h4 className="font-semibold text-primary">
              <BilingualText english="EMI Calculation" bengali="ইএমআই গণনা" />
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
              </p>
              <p className="text-2xl font-bold text-primary">
                ৳{calculateEMI().toLocaleString()}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Interest Rate" bengali="সুদের হার" />
              </p>
              <p className="text-xl font-semibold">
                {interestRate}% <span className="text-sm">
                  <BilingualText english="per annum" bengali="বার্ষিক" />
                </span>
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                <BilingualText english="Total Amount" bengali="মোট পরিমাণ" />
              </p>
              <p className="text-xl font-semibold">
                ৳{(calculateEMI() * formData.loanTenure[0]).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button onClick={handleNext} className="gradient-primary" size="lg">
          <BilingualText english="Save & Next" bengali="সংরক্ষণ ও পরবর্তী" />
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};