import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertTriangle, CheckCircle, CreditCard } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { toast } from "@/hooks/use-toast";
import mtbLogo from "@/assets/mtvb_logo.png";

const LoanClosure = () => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loanId } = location.state || {};

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

  const handleOtpVerification = () => {
    if (otp.length !== 6) {
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
      <header className="border-b bg-card">
        <div className="banking-container py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="p-0 h-auto hover:bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <BilingualText english="Back" bengali="পিছনে" />
            </Button>
            
            <div className="flex items-center gap-3">
              <img src={mtbLogo} alt="MTB Logo" className="h-6" />
              <div className="mline-separator-vertical h-6"></div>
              <h1 className="text-lg font-semibold text-mtb-primary">
                <BilingualText english="Loan Closure" bengali="ঋণ বন্ধ" />
              </h1>
            </div>
            
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <div className="banking-container py-8">
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <>
              {/* Loan Details */}
              <Card className="banking-card-elevated mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <BilingualText english="Loan Closure Details" bengali="ঋণ বন্ধের বিবরণ" />
                  </CardTitle>
                  <CardDescription>
                    <BilingualText 
                      english="Review the closure amount and charges" 
                      bengali="বন্ধের পরিমাণ এবং চার্জ পর্যালোচনা করুন" 
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Loan ID" bengali="ঋণ আইডি" />
                      </span>
                      <span className="font-medium">{loanDetails.id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Original Amount" bengali="মূল পরিমাণ" />
                      </span>
                      <span className="font-medium">৳{loanDetails.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Outstanding Principal" bengali="বকেয়া মূলধন" />
                      </span>
                      <span className="font-medium">৳{loanDetails.balance.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Accrued Interest" bengali="সঞ্চিত সুদ" />
                      </span>
                      <span className="font-medium">৳{loanDetails.interestDue.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Processing Charges" bengali="প্রক্রিয়াকরণ চার্জ" />
                      </span>
                      <span className="font-medium">৳{loanDetails.charges.toLocaleString()}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-primary">
                        <BilingualText english="Total Discharge Amount" bengali="মোট নিষ্পত্তির পরিমাণ" />
                      </span>
                      <span className="text-primary">৳{loanDetails.totalDischargeAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warning Note */}
              <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20 mb-6">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning mb-1">
                    <BilingualText english="Important Notice" bengali="গুরুত্বপূর্ণ বিজ্ঞপ্তি" />
                  </p>
                  <p className="text-warning-foreground">
                    <BilingualText 
                      english="Loan closure is only available after paying at least one installment. This action cannot be undone once completed."
                      bengali="কমপক্ষে একটি কিস্তি পরিশোধের পর ঋণ বন্ধ করা যায়। সম্পূর্ণ হওয়ার পর এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
                    />
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <Button onClick={handleCloseLoan} className="w-full gradient-primary" size="lg">
                <BilingualText english="Close Loan Account" bengali="ঋণ অ্যাকাউন্ট বন্ধ করুন" />
              </Button>
            </>
          )}

          {step === 2 && (
            <Card className="banking-card-elevated">
              <CardHeader className="text-center">
                <CardTitle>
                  <BilingualText english="OTP Verification" bengali="ওটিপি যাচাইকরণ" />
                </CardTitle>
                <CardDescription>
                  <BilingualText 
                    english="Enter the OTP sent to your registered mobile number to confirm loan closure"
                    bengali="ঋণ বন্ধ নিশ্চিত করতে আপনার নিবন্ধিত মোবাইল নম্বরে পাঠানো ওটিপি প্রবেশ করান"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  onClick={handleOtpVerification} 
                  disabled={isLoading || otp.length !== 6}
                  className="w-full gradient-primary"
                  size="lg"
                >
                  {isLoading ? (
                    <BilingualText english="Verifying..." bengali="যাচাই করা হচ্ছে..." />
                  ) : (
                    <BilingualText english="Verify & Close Loan" bengali="যাচাই ও ঋণ বন্ধ করুন" />
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-success mb-2">
                  <BilingualText english="Loan Closed Successfully!" bengali="ঋণ সফলভাবে বন্ধ হয়েছে!" />
                </h2>
                <p className="text-muted-foreground">
                  <BilingualText 
                    english="Your loan account has been closed and the amount has been debited from your account"
                    bengali="আপনার ঋণ অ্যাকাউন্ট বন্ধ হয়েছে এবং পরিমাণটি আপনার অ্যাকাউন্ট থেকে কেটে নেওয়া হয়েছে"
                  />
                </p>
              </div>

              <Card className="bg-gradient-to-r from-success/5 to-primary/5 border-success/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      <BilingualText english="Closure Reference ID" bengali="বন্ধের রেফারেন্স আইডি" />
                    </p>
                    <p className="text-xl font-bold text-primary font-mono">
                      CL{Date.now().toString().slice(-8)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={goToDashboard} className="gradient-primary" size="lg">
                <BilingualText english="Back to Dashboard" bengali="ড্যাশবোর্ডে ফিরে যান" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanClosure;