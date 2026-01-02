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
  const [loanAmount, setLoanAmount] = useState([100000]);
  const [loanTenure, setLoanTenure] = useState([12]);
  const [interestRate] = useState(12);

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
      <header className="sticky top-0 z-50 bg-gradient-to-r from-mtb-teal to-mtb-green">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-sm hidden sm:inline">
                <BilingualText english="Back" bengali="পিছনে" />
              </span>
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg p-1.5 shadow-sm">
                <img src={mtbLogoFull} alt="MTB Logo" className="h-6 md:h-7 w-auto" />
              </div>
              <h1 className="text-sm md:text-base font-semibold text-white">
                <BilingualText english="Loan Calculator" bengali="ঋণ ক্যালকুলেটর" />
              </h1>
            </div>
            
            <div className="flex items-center gap-1">
              <LanguageToggle variant="compact" className="bg-white/20 text-white rounded-full" />
              <ThemeToggle variant="header" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Info */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calculator className="w-6 h-6 text-mtb-teal" />
            <h2 className="text-xl font-bold text-foreground">
              <BilingualText english="EMI Calculator" bengali="ইএমআই ক্যালকুলেটর" />
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Calculate your monthly installments"
              bengali="আপনার মাসিক কিস্তি গণনা করুন"
            />
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Calculator Inputs */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5 text-mtb-teal" />
                <BilingualText english="Loan Details" bengali="ঋণের বিবরণ" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Loan Amount */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
                  </Label>
                  <div className="text-right">
                    <div className="text-xl font-bold text-mtb-teal">
                      ৳{loanAmount[0].toLocaleString()}
                    </div>
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
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>৳10,000</span>
                  <span>৳{maxLoanAmount.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              {/* Loan Tenure */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    <BilingualText english="Loan Tenure" bengali="ঋণের মেয়াদ" />
                  </Label>
                  <div className="text-right">
                    <div className="text-xl font-bold text-mtb-green">
                      {loanTenure[0]} <span className="text-sm font-medium text-muted-foreground">
                        <BilingualText english="months" bengali="মাস" />
                      </span>
                    </div>
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
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6 <BilingualText english="mo" bengali="মাস" /></span>
                  <span>{maxTenure} <BilingualText english="mo" bengali="মাস" /></span>
                </div>
              </div>

              <Separator />

              {/* Interest Rate */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium text-foreground">
                  <BilingualText english="Interest Rate" bengali="সুদের হার" />
                </Label>
                <div className="text-lg font-bold text-foreground">
                  {interestRate}% <span className="text-xs text-muted-foreground">p.a.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-mtb-orange" />
                <BilingualText english="EMI Breakdown" bengali="ইএমআই বিস্তারিত" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Monthly EMI */}
              <div className="text-center p-5 bg-gradient-to-r from-mtb-teal/10 to-mtb-green/10 rounded-xl border border-mtb-teal/20">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-mtb-teal" />
                  <p className="text-sm font-medium text-muted-foreground">
                    <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
                  </p>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-mtb-teal to-mtb-green bg-clip-text text-transparent">
                  ৳{calculateEMI().toLocaleString()}
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    <BilingualText english="Principal" bengali="মূল" />
                  </span>
                  <span className="font-semibold text-foreground">৳{loanAmount[0].toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    <BilingualText english="Interest" bengali="সুদ" />
                  </span>
                  <span className="font-semibold text-mtb-orange">৳{calculateTotalInterest().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-mtb-teal/10 rounded-lg border border-mtb-teal/20">
                  <span className="text-sm font-medium text-foreground">
                    <BilingualText english="Total Payable" bengali="মোট" />
                  </span>
                  <span className="font-bold text-mtb-teal">৳{calculateTotalAmount().toLocaleString()}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => navigate("/loan-application")}
                className="w-full h-12 bg-mtb-teal hover:bg-mtb-teal/90 text-white"
                size="lg"
              >
                <BilingualText english="Apply for This Loan" bengali="এই ঋণের জন্য আবেদন করুন" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
