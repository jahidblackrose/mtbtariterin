import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calculator, DollarSign, Clock, TrendingUp } from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import mtbLogo from "@/assets/mtvb_logo.png";

const LoanCalculator = () => {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState([100000]);
  const [loanTenure, setLoanTenure] = useState([12]);
  const [interestRate] = useState(12); // Fixed 12% annual interest

  const loanPurposes = [
    { value: "business", labelEn: "Business Expansion", labelBn: "ব্যবসা সম্প্রসারণ" },
    { value: "education", labelEn: "Education", labelBn: "শিক্ষা" },
    { value: "medical", labelEn: "Medical Emergency", labelBn: "চিকিৎসা জরুরি" },
    { value: "home", labelEn: "Home Improvement", labelBn: "বাড়ি উন্নতি" },
    { value: "marriage", labelEn: "Marriage/Wedding", labelBn: "বিবাহ/বিয়ে" },
    { value: "other", labelEn: "Others", labelBn: "অন্যান্য" }
  ];

  const calculateEMI = () => {
    const principal = loanAmount[0];
    const tenure = loanTenure[0];
    const monthlyRate = interestRate / 12 / 100;
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    return Math.round(emi);
  };

  const calculateTotalAmount = () => {
    return calculateEMI() * loanTenure[0];
  };

  const calculateTotalInterest = () => {
    return calculateTotalAmount() - loanAmount[0];
  };

  const maxLoanAmount = 500000;
  const maxTenure = 60;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="banking-container py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="p-0 h-auto hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <BilingualText english="Back to Dashboard" bengali="ড্যাশবোর্ডে ফিরুন" />
            </Button>
            
            <div className="flex items-center gap-3">
              <img src={mtbLogo} alt="MTB Logo" className="h-6" />
              <div className="mline-separator-vertical h-6"></div>
              <h1 className="text-lg font-semibold text-mtb-primary">
                <BilingualText english="Loan Calculator" bengali="ঋণ ক্যালকুলেটর" />
              </h1>
            </div>
            
            <LanguageToggle className="bg-muted text-muted-foreground hover:bg-mtb-primary hover:text-white" />
          </div>
        </div>
      </header>

      <div className="banking-container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Info */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-8 h-8 text-mtb-primary" />
              <h2 className="text-2xl font-bold text-mtb-primary">
                <BilingualText english="EMI Calculator" bengali="ইএমআই ক্যালকুলেটর" />
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              <BilingualText 
                english="Calculate your monthly installments and plan your loan with our easy-to-use calculator"
                bengali="আমাদের সহজ-ব্যবহারযোগ্য ক্যালকুলেটর দিয়ে আপনার মাসিক কিস্তি গণনা করুন এবং আপনার ঋণের পরিকল্পনা করুন"
              />
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Inputs */}
            <Card className="banking-card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-mtb-primary" />
                  <BilingualText english="Loan Details" bengali="ঋণের বিবরণ" />
                </CardTitle>
                <CardDescription>
                  <BilingualText 
                    english="Adjust the loan parameters to see EMI calculations"
                    bengali="ইএমআই গণনা দেখতে ঋণের প্যারামিটার সামঞ্জস্য করুন"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Loan Amount */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
                    </Label>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-mtb-primary">
                        ৳{loanAmount[0].toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <BilingualText 
                          english={`Max: ৳${maxLoanAmount.toLocaleString()}`} 
                          bengali={`সর্বোচ্চ: ৳${maxLoanAmount.toLocaleString()}`} 
                        />
                      </p>
                    </div>
                  </div>
                  
                  <Slider
                    value={loanAmount}
                    onValueChange={setLoanAmount}
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
                    <Label className="text-sm font-medium">
                      <BilingualText english="Loan Tenure" bengali="ঋণের মেয়াদ" />
                    </Label>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-mtb-primary">
                        {loanTenure[0]} <span className="text-base font-medium">
                          <BilingualText english="months" bengali="মাস" />
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <BilingualText 
                          english={`Max: ${maxTenure} months`} 
                          bengali={`সর্বোচ্চ: ${maxTenure} মাস`} 
                        />
                      </p>
                    </div>
                  </div>
                  
                  <Slider
                    value={loanTenure}
                    onValueChange={setLoanTenure}
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

                {/* Interest Rate */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <Label className="text-sm font-medium">
                    <BilingualText english="Interest Rate" bengali="সুদের হার" />
                  </Label>
                  <div className="text-xl font-bold text-mtb-primary">
                    {interestRate}% <span className="text-sm font-medium">
                      <BilingualText english="per annum" bengali="বার্ষিক" />
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="banking-card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-mtb-secondary" />
                  <BilingualText english="EMI Breakdown" bengali="ইএমআই বিস্তারিত" />
                </CardTitle>
                <CardDescription>
                  <BilingualText 
                    english="Your monthly payment and total cost breakdown"
                    bengali="আপনার মাসিক পেমেন্ট এবং মোট খরচের বিস্তারিত"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Monthly EMI */}
                <div className="text-center p-6 bg-gradient-to-r from-mtb-primary/5 to-mtb-secondary/5 rounded-lg border border-mtb-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-mtb-primary" />
                    <p className="text-sm font-medium text-muted-foreground">
                      <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-mtb-primary">
                    ৳{calculateEMI().toLocaleString()}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText english="Principal Amount" bengali="মূল পরিমাণ" />
                    </span>
                    <span className="font-semibold">৳{loanAmount[0].toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText english="Total Interest" bengali="মোট সুদ" />
                    </span>
                    <span className="font-semibold text-mtb-secondary">৳{calculateTotalInterest().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg border border-mtb-primary/20">
                    <span className="text-sm font-medium text-mtb-primary">
                      <BilingualText english="Total Payable Amount" bengali="মোট পরিশোধযোগ্য পরিমাণ" />
                    </span>
                    <span className="font-bold text-mtb-primary">৳{calculateTotalAmount().toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => navigate("/loan-application")}
                  className="w-full h-12 bg-mtb-primary hover:bg-mtb-primary/90 text-white"
                  size="lg"
                >
                  <BilingualText english="Apply for This Loan" bengali="এই ঋণের জন্য আবেদন করুন" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <Card className="mt-8 bg-gradient-to-r from-mtb-secondary/5 to-mtb-accent/5 border-mtb-secondary/20">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-mtb-primary mb-2">
                  <BilingualText english="Ready to Apply?" bengali="আবেদন করার জন্য প্রস্তুত?" />
                </h3>
                <p className="text-muted-foreground mb-4">
                  <BilingualText 
                    english="Start your loan application process with MTB's quick and secure digital platform"
                    bengali="এমটিবির দ্রুত এবং নিরাপদ ডিজিটাল প্ল্যাটফর্মের সাথে আপনার ঋণের আবেদন প্রক্রিয়া শুরু করুন"
                  />
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    onClick={() => navigate("/loan-application")}
                    className="bg-mtb-primary hover:bg-mtb-primary/90 text-white"
                  >
                    <BilingualText english="Apply Now" bengali="এখনই আবেদন করুন" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    <BilingualText english="Back to Dashboard" bengali="ড্যাশবোর্ডে ফিরুন" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;