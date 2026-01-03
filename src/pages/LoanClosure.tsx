import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertTriangle, CheckCircle, CreditCard } from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

const LoanClosure = () => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const otpInputRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loanId } = location.state || {};

  // Auto-focus OTP input when step 2
  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(() => {
        if (otpInputRef.current) {
          const firstInput = otpInputRef.current.querySelector('input');
          if (firstInput) firstInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const loanDetails = {
    id: loanId || "LN001",
    amount: 150000,
    balance: 45000,
    interestDue: 2500,
    charges: 500,
    totalDischargeAmount: 48000,
    installmentsPaid: 8,
    totalInstallments: 12
  };

  const handleCloseLoan = () => {
    setStep(2);
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      handleOtpVerification(value);
    }
  };

  const handleOtpVerification = (otpValue?: string) => {
    const finalOtp = otpValue || otp;
    if (finalOtp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1500);
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
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
                <BilingualText english="Loan Closure" bengali="ঋণ বন্ধ" />
              </h1>
            </div>
            
            <div className="flex items-center gap-1">
              <LanguageToggle variant="compact" className="bg-white/20 text-white rounded-full" />
              <ThemeToggle variant="header" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {step === 1 && (
          <>
            {/* Loan Details */}
            <Card className="border-0 shadow-lg mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="w-5 h-5 text-mtb-teal" />
                  <BilingualText english="Closure Details" bengali="বন্ধের বিবরণ" />
                </CardTitle>
                <CardDescription className="text-sm">
                  <BilingualText 
                    english="Review amount and charges" 
                    bengali="পরিমাণ এবং চার্জ পর্যালোচনা করুন" 
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText english="Loan ID" bengali="ঋণ আইডি" />
                    </span>
                    <span className="font-medium text-foreground">{loanDetails.id}</span>
                  </div>
                  
                  <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText english="Original Amount" bengali="মূল পরিমাণ" />
                    </span>
                    <span className="font-medium text-foreground">৳{loanDetails.amount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText english="Outstanding" bengali="বকেয়া" />
                    </span>
                    <span className="font-medium text-foreground">৳{loanDetails.balance.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText english="Interest" bengali="সুদ" />
                    </span>
                    <span className="font-medium text-foreground">৳{loanDetails.interestDue.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText english="Charges" bengali="চার্জ" />
                    </span>
                    <span className="font-medium text-foreground">৳{loanDetails.charges.toLocaleString()}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between p-3 rounded-lg bg-mtb-teal/10 border border-mtb-teal/20">
                    <span className="font-medium text-foreground">
                      <BilingualText english="Total" bengali="মোট" />
                    </span>
                    <span className="font-bold text-mtb-teal text-lg">৳{loanDetails.totalDischargeAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Note */}
            <div className="flex items-start gap-3 p-4 bg-mtb-orange/10 rounded-xl border border-mtb-orange/20 mb-4">
              <AlertTriangle className="w-5 h-5 text-mtb-orange flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">
                  <BilingualText english="Important" bengali="গুরুত্বপূর্ণ" />
                </p>
                <p className="text-muted-foreground">
                  <BilingualText 
                    english="This action cannot be undone once completed."
                    bengali="সম্পূর্ণ হলে এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।"
                  />
                </p>
              </div>
            </div>

            {/* Close Button */}
            <Button 
              onClick={handleCloseLoan} 
              className="w-full h-12 bg-mtb-teal hover:bg-mtb-teal/90 text-white" 
              size="lg"
            >
              <BilingualText english="Close Loan Account" bengali="ঋণ অ্যাকাউন্ট বন্ধ করুন" />
            </Button>
          </>
        )}

        {step === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-lg">
                <BilingualText english="OTP Verification" bengali="ওটিপি যাচাইকরণ" />
              </CardTitle>
              <CardDescription className="text-sm">
                <BilingualText 
                  english="Enter OTP to confirm closure"
                  bengali="বন্ধ নিশ্চিত করতে ওটিপি প্রবেশ করান"
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pb-6">
              <div className="flex justify-center" ref={otpInputRef}>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={isLoading}
                  autoFocus
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot 
                        key={index}
                        index={index} 
                        className={`w-11 h-12 text-lg font-semibold rounded-lg border-2 transition-all ${
                          otp[index] 
                            ? 'border-mtb-teal bg-mtb-teal/5' 
                            : 'border-border bg-background'
                        }`}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {isLoading && (
                <div className="text-center text-sm text-muted-foreground">
                  <BilingualText english="Verifying..." bengali="যাচাই করা হচ্ছে..." />
                </div>
              )}

              <div className="text-center">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                  Demo OTP: <span className="font-mono font-bold">123456</span>
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-mtb-success rounded-full flex items-center justify-center animate-scale-in">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-mtb-success mb-2">
                <BilingualText english="Loan Closed!" bengali="ঋণ বন্ধ!" />
              </h2>
              <p className="text-sm text-muted-foreground">
                <BilingualText 
                  english="Your loan account has been closed successfully"
                  bengali="আপনার ঋণ অ্যাকাউন্ট সফলভাবে বন্ধ হয়েছে"
                />
              </p>
            </div>

            <Card className="bg-mtb-teal/10 border-mtb-teal/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  <BilingualText english="Reference ID" bengali="রেফারেন্স আইডি" />
                </p>
                <p className="text-lg font-bold text-mtb-teal font-mono">
                  CL{Date.now().toString().slice(-8)}
                </p>
              </CardContent>
            </Card>

            <Button 
              onClick={goToDashboard} 
              className="w-full h-12 bg-mtb-teal hover:bg-mtb-teal/90 text-white" 
              size="lg"
            >
              <BilingualText english="Back to Dashboard" bengali="ড্যাশবোর্ডে ফিরুন" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanClosure;
