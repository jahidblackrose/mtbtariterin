import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calculator, DollarSign, Clock, TrendingUp } from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

const LoanCalculator = () => {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState([25000]);
  const [loanTenure, setLoanTenure] = useState([3]);
  const [interestRate, setInterestRate] = useState([12]);

  const calculateEMI = () => {
    const principal = loanAmount[0];
    const tenure = loanTenure[0];
    const monthlyRate = interestRate[0] / 12 / 100;

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

  const maxLoanAmount = 50000;
  const maxTenure = 6;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized Header */}
      <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <div className="banking-container px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="p-2 h-auto"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2 min-w-0">
              <div className="logo-glow-container p-1 flex-shrink-0">
                <img src={mtbLogoFull} alt="MTB Logo" className="h-6 sm:h-7 w-auto" />
              </div>
              <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
                <BilingualText english="Loan Calculator" bengali="ঋণ ক্যালকুলেটর" />
              </h1>
            </div>
            
            <div className="flex items-center gap-1">
              <LanguageToggle variant="compact" className="bg-muted text-foreground hover:bg-accent" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="banking-container px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Info */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h2 className="text-lg sm:text-2xl font-bold text-primary">
                <BilingualText english="EMI Calculator" bengali="ইএমআই ক্যালকুলেটর" />
              </h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              <BilingualText 
                english="Calculate your monthly installments"
                bengali="আপনার মাসিক কিস্তি গণনা করুন"
              />
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Calculator Inputs */}
            <Card className="banking-card-elevated">
              <CardHeader className="px-4 sm:px-6 pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <BilingualText english="Loan Details" bengali="ঋণের বিবরণ" />
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  <BilingualText 
                    english="Adjust parameters to see EMI"
                    bengali="ইএমআই দেখতে সামঞ্জস্য করুন"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-4 sm:px-6">
                {/* Loan Amount */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
                    </Label>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        ৳{loanAmount[0].toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <Slider
                    value={loanAmount}
                    onValueChange={setLoanAmount}
                    max={maxLoanAmount}
                    min={5000}
                    step={1000}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>৳5,000</span>
                    <span>৳{maxLoanAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                {/* Loan Tenure */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      <BilingualText english="Loan Tenure" bengali="ঋণের মেয়াদ" />
                    </Label>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        {loanTenure[0]} <span className="text-sm sm:text-base font-medium">
                          <BilingualText english="months" bengali="মাস" />
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Slider
                    value={loanTenure}
                    onValueChange={setLoanTenure}
                    max={maxTenure}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 <BilingualText english="mo" bengali="মাস" /></span>
                    <span>{maxTenure} <BilingualText english="mo" bengali="মাস" /></span>
                  </div>
                </div>

                <Separator />

                {/* Interest Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      <BilingualText english="Interest Rate" bengali="সুদের হার" />
                    </Label>
                    <div className="text-lg sm:text-xl font-bold text-primary">
                      {interestRate[0].toFixed(1)}% <span className="text-xs sm:text-sm font-medium">
                        <BilingualText english="p.a." bengali="বার্ষিক" />
                      </span>
                    </div>
                  </div>

                  <Slider
                    value={interestRate}
                    onValueChange={setInterestRate}
                    max={14}
                    min={7}
                    step={0.5}
                    className="w-full"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>7.0%</span>
                    <span>14.0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="banking-card-elevated">
              <CardHeader className="px-4 sm:px-6 pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <BilingualText english="EMI Breakdown" bengali="ইএমআই বিস্তারিত" />
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  <BilingualText 
                    english="Your payment breakdown"
                    bengali="আপনার পেমেন্ট বিস্তারিত"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                {/* Monthly EMI */}
                <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-primary/5 to-success/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
                    </p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    ৳{calculateEMI().toLocaleString()}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      <BilingualText english="Principal" bengali="মূল" />
                    </span>
                    <span className="font-semibold text-sm sm:text-base">৳{loanAmount[0].toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      <BilingualText english="Total Interest" bengali="মোট সুদ" />
                    </span>
                    <span className="font-semibold text-sm sm:text-base text-warning">৳{calculateTotalInterest().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-card/50 rounded-lg border border-primary/20">
                    <span className="text-xs sm:text-sm font-medium text-primary">
                      <BilingualText english="Total Payable" bengali="মোট পরিশোধযোগ্য" />
                    </span>
                    <span className="font-bold text-sm sm:text-base text-primary">৳{calculateTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back to Dashboard */}
          <div className="mt-6 text-center">
            <Button 
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="px-6"
            >
              <BilingualText english="Back to Dashboard" bengali="ড্যাশবোর্ডে ফিরুন" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
