import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertTriangle, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { toast } from "@/hooks/use-toast";
import mtbLogo from "@/assets/mtvb_logo.png";
import { loanApplicationApi, LoanDischargeEnquiryResponse } from "@/services/loanApplicationApi";

const LoanClosure = () => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dischargeData, setDischargeData] = useState<LoanDischargeEnquiryResponse | null>(null);
  const [otpData, setOtpData] = useState<{ regref: string; otpref: string; regsl: string } | null>(null);
  const [canClose, setCanClose] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loanId } = location.state || {};

  useEffect(() => {
    if (!loanId) {
      toast({
        title: "Error",
        description: "No loan account selected",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    fetchDischargeDetails();
  }, [loanId]);

  const fetchDischargeDetails = async () => {
    setIsLoading(true);
    try {
      const response = await loanApplicationApi.loanDischargeEnquiry(loanId);
      
      if (response.status === "200") {
        // Cast response to the expected type since it includes all the fields
        const data = response as unknown as LoanDischargeEnquiryResponse;
        setDischargeData(data);
        
        // Check if total installment equals remaining installment
        const totalInstallment = parseInt(data.totalinstallment) || 0;
        const remainingInstallment = parseInt(data.remaininginstallment) || 0;
        setCanClose(totalInstallment !== remainingInstallment);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch loan details",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching discharge details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch loan discharge details",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseLoan = async () => {
    if (!dischargeData) return;

    setIsSubmitting(true);
    try {
      const response = await loanApplicationApi.loanDischargeOtpRequest(
        dischargeData.applicationid,
        dischargeData.regsl
      );

      if (response.status === "200") {
        setOtpData({
          regref: response.regref,
          otpref: response.otpref,
          regsl: response.regsl,
        });
        setStep(2);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerification = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    if (!otpData || !dischargeData) return;

    setIsSubmitting(true);
    try {
      const response = await loanApplicationApi.loanDischargeOtpValidate({
        applicationid: dischargeData.applicationid,
        regref: otpData.regref,
        otpref: otpData.otpref,
        regsl: otpData.regsl,
        otp: otp,
        modulename: "LOAN",
      });

      if (response.status === "200") {
        setStep(3);
      } else {
        toast({
          title: "Error",
          description: response.message || "OTP verification failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating OTP:", error);
      toast({
        title: "Error",
        description: "OTP verification failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            <BilingualText english="Loading loan details..." bengali="ঋণের বিবরণ লোড হচ্ছে..." />
          </p>
        </div>
      </div>
    );
  }

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
          {step === 1 && dischargeData && (
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
                        <BilingualText english="Loan A/C" bengali="ঋণ হিসাব" />
                      </span>
                      <span className="font-medium">{dischargeData.loanacnum}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Discharge Amount" bengali="নিষ্পত্তির পরিমাণ" />
                      </span>
                      <span className="font-medium text-primary">৳{parseFloat(dischargeData.dischargeamt || "0").toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Total Installment" bengali="মোট কিস্তি" />
                      </span>
                      <span className="font-medium">{dischargeData.totalinstallment}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Remaining Installment" bengali="অবশিষ্ট কিস্তি" />
                      </span>
                      <span className="font-medium">{dischargeData.remaininginstallment}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Recovery A/C" bengali="আদায় হিসাব" />
                      </span>
                      <span className="font-medium">{dischargeData.recoveryacno}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Recovery A/C Title" bengali="আদায় হিসাবের নাম" />
                      </span>
                      <span className="font-medium">{dischargeData.recoveryacname}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="SMS Mobile No." bengali="এসএমএস মোবাইল নম্বর" />
                      </span>
                      <span className="font-medium">{dischargeData.smsMobileNum}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Savings A/C Balance" bengali="সেভিংস হিসাব ব্যালেন্স" />
                      </span>
                      <span className="font-medium">{dischargeData.savingsacbal}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        <BilingualText english="Account Type" bengali="হিসাবের ধরন" />
                      </span>
                      <span className="font-medium text-xs">{dischargeData.acctTyp}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message/Warning Note */}
              {dischargeData.errormessage && (
                <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20 mb-6">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warning mb-1">
                      <BilingualText english="Message" bengali="বার্তা" />
                    </p>
                    <p className="text-warning-foreground">
                      {dischargeData.errormessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Show Close Button only if canClose is true */}
              {canClose ? (
                <Button 
                  onClick={handleCloseLoan} 
                  disabled={isSubmitting}
                  className="w-full gradient-primary" 
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <BilingualText english="Processing..." bengali="প্রক্রিয়াকরণ হচ্ছে..." />
                    </>
                  ) : (
                    <BilingualText english="Close Loan Account" bengali="ঋণ অ্যাকাউন্ট বন্ধ করুন" />
                  )}
                </Button>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">
                      <BilingualText 
                        english="You have to pay a minimum of 1 installment before closing this loan." 
                        bengali="এই ঋণ বন্ধ করার আগে আপনাকে কমপক্ষে ১টি কিস্তি পরিশোধ করতে হবে।" 
                      />
                    </p>
                  </div>
                </div>
              )}
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
                  disabled={isSubmitting || otp.length !== 6}
                  className="w-full gradient-primary"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <BilingualText english="Verifying..." bengali="যাচাই করা হচ্ছে..." />
                    </>
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
                      <BilingualText english="Loan Account" bengali="ঋণ হিসাব" />
                    </p>
                    <p className="text-xl font-bold text-primary font-mono">
                      {dischargeData?.loanacnum}
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
