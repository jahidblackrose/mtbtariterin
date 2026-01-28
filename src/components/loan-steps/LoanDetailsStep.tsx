import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Clock, Lock } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface LoanDetailsStepProps {
  onNext: (data: any) => void;
  data: any;
  isReadOnly?: boolean;
}

export const LoanDetailsStep = ({ onNext, data, isReadOnly = true }: LoanDetailsStepProps) => {
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
  const interestRate = data.interestRate ? parseFloat(data.interestRate) : 12;
  const processingFee = data.processingFee ? parseFloat(data.processingFee) : 0.5;
  
  // Get today's day (DD)
  const todayDay = new Date().getDate();

  const calculateEMI = () => {
    if (data.emi) return parseFloat(data.emi);
    
    const P = formData.loanAmount[0]; // Principal
    const R = interestRate; // Interest Rate (percentage)
    const N = formData.loanTenure[0]; // Tenure in Months
    
    // Monthly Rate: r = R / 100 / 12
    const r = R / 100 / 12;
    
    // EMI = ((P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1)) + ((P * 0.5 / 100) / N)
    const emi = ((P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1)) + ((P * processingFee / 100) / N);
    
    return Math.round(emi);
  };

  const getPurposeLabel = (value: string) => {
    const purpose = loanPurposes.find(p => p.value === value);
    return purpose ? purpose.labelEn : value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <Calculator className="w-6 h-6 text-primary" />
        <div className="flex-1">
          <h3 className="font-semibold">
            <BilingualText english="Loan Requirements" bengali="ঋণের প্রয়োজনীয়তা" />
          </h3>
          <p className="text-sm text-muted-foreground">
            {isReadOnly ? (
              <BilingualText 
                english="Your loan details from application" 
                bengali="আবেদন থেকে আপনার ঋণের বিবরণ" 
              />
            ) : (
              <BilingualText 
                english="Specify your loan amount, tenure and purpose" 
                bengali="আপনার ঋণের পরিমাণ, মেয়াদ এবং উদ্দেশ্য নির্দিষ্ট করুন" 
              />
            )}
          </p>
        </div>
        {isReadOnly && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            <Lock className="w-3 h-3" />
            <span>Read-only</span>
          </div>
        )}
      </div>

      {/* Loan Purpose */}
      <div className="space-y-3">
        <Label className="bilingual-label">
          <BilingualText english="Loan Purpose" bengali="ঋণের উদ্দেশ্য" />
        </Label>
        {isReadOnly ? (
          <Input
            value={getPurposeLabel(formData.loanPurpose)}
            className="bg-muted/30"
            readOnly
          />
        ) : (
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
        )}
      </div>

      {/* Processing Fee - Read-only */}
      <div className="space-y-3">
        <Label className="bilingual-label">
          <BilingualText english="Processing Fee (%)" bengali="প্রসেসিং ফি (%)" />
        </Label>
        <Input
          value={`${processingFee}%`}
          className="bg-muted/30"
          readOnly
          disabled
        />
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
            {!isReadOnly && (
              <p className="text-xs text-muted-foreground">
                <BilingualText english={`Max: ৳${maxLoanAmount.toLocaleString()}`} bengali={`সর্বোচ্চ: ৳${maxLoanAmount.toLocaleString()}`} />
              </p>
            )}
          </div>
        </div>
        
        {isReadOnly ? (
          <div className="h-2 bg-primary/20 rounded-full">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${(formData.loanAmount[0] / maxLoanAmount) * 100}%` }}
            />
          </div>
        ) : (
          <Slider
            value={formData.loanAmount}
            onValueChange={(value) => setFormData(prev => ({ ...prev, loanAmount: value }))}
            max={maxLoanAmount}
            min={10000}
            step={5000}
            className="w-full"
          />
        )}
        
        {!isReadOnly && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>৳10,000</span>
            <span>৳{maxLoanAmount.toLocaleString()}</span>
          </div>
        )}
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
            {!isReadOnly && (
              <p className="text-xs text-muted-foreground">
                <BilingualText english={`Max: ${maxTenure} months`} bengali={`সর্বোচ্চ: ${maxTenure} মাস`} />
              </p>
            )}
          </div>
        </div>
        
        {isReadOnly ? (
          <div className="h-2 bg-primary/20 rounded-full">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${(formData.loanTenure[0] / maxTenure) * 100}%` }}
            />
          </div>
        ) : (
          <Slider
            value={formData.loanTenure}
            onValueChange={(value) => setFormData(prev => ({ ...prev, loanTenure: value }))}
            max={maxTenure}
            min={6}
            step={3}
            className="w-full"
          />
        )}
        
        {!isReadOnly && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>6 <BilingualText english="months" bengali="মাস" /></span>
            <span>{maxTenure} <BilingualText english="months" bengali="মাস" /></span>
          </div>
        )}
      </div>

      {/* Repayment / EMI Date - Read-only */}
      <div className="space-y-3">
        <Label className="bilingual-label">
          <BilingualText english="Repayment / EMI Date" bengali="পরিশোধ / ইএমআই তারিখ" />
        </Label>
        <Input
          value={todayDay.toString()}
          className="bg-muted/30"
          readOnly
          disabled
        />
      </div>

      <Separator />

      {/* Interest Rate - Read-only */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="bilingual-label">
            <BilingualText english="Interest Rate (%)" bengali="সুদের হার (%)" />
          </Label>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            <Lock className="w-3 h-3" />
            <span>Fixed</span>
          </div>
        </div>
        <Input
          value={`${interestRate}% per annum`}
          className="bg-muted/30"
          readOnly
          disabled
        />
      </div>

      <Separator />

      {/* EMI Calculation - Monthly EMI Only */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-primary" />
            <h4 className="font-semibold text-primary">
              <BilingualText english="EMI Details" bengali="ইএমআই বিবরণ" />
            </h4>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
            </p>
            <p className="text-3xl font-bold text-primary">
              ৳{calculateEMI().toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};