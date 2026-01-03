import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Shield, RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import { otpService, ApiError, ERROR_MESSAGES } from "@/services/api";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { timeRemaining, isExpired, formattedTime, resetTimer } = useOtpTimer(120);
  
  const { accountNumber, mobileNumber } = location.state || {};

  const maskedNumber = mobileNumber 
    ? mobileNumber.replace(/(\d{4})\d{4}(\d{3})/, "$1****$2")
    : accountNumber?.replace(/(\d{4})\d{6}(\d{3})/, "$1******$2") || "****";

  const handleVerifyOtp = useCallback(async (otpValue: string) => {
    if (otpValue.length !== 6) return;
    
    setVerificationStatus('verifying');
    setErrorMessage("");

    try {
      const response = await otpService.verifyOtp({
        otp: otpValue,
        accountNumber,
        mobileNumber,
      });

      if (response.success && response.data) {
        setVerificationStatus('success');
        localStorage.setItem('auth_token', response.data.token);
        
        toast({
          title: "OTP Verified",
          description: "Login successful. Redirecting...",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      setVerificationStatus('error');
      
      if (error instanceof ApiError) {
        setErrorMessage(ERROR_MESSAGES[error.code] || error.message);
        toast({
          title: "Verification Failed",
          description: ERROR_MESSAGES[error.code] || error.message,
          variant: "destructive",
        });
      } else {
        setErrorMessage(ERROR_MESSAGES.SERVER_ERROR);
        toast({
          title: "Error",
          description: ERROR_MESSAGES.SERVER_ERROR,
          variant: "destructive",
        });
      }
      
      setOtp("");
    }
  }, [accountNumber, mobileNumber, navigate]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setErrorMessage("");
    
    if (verificationStatus === 'error') {
      setVerificationStatus('idle');
    }
    
    if (value.length === 6) {
      handleVerifyOtp(value);
    }
  };

  const handleResendOtp = async () => {
    if (!isExpired || isResending) return;
    
    setIsResending(true);
    setErrorMessage("");
    setVerificationStatus('idle');

    try {
      const response = await otpService.resendOtp({
        accountNumber,
        mobileNumber,
      });

      if (response.success) {
        resetTimer();
        setOtp("");
        
        toast({
          title: "OTP Sent",
          description: `A new OTP has been sent to ${maskedNumber}`,
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Failed to Resend",
          description: ERROR_MESSAGES[error.code] || error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: ERROR_MESSAGES.NETWORK_ERROR,
          variant: "destructive",
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const getTimerClass = () => {
    if (isExpired) return "expired";
    if (timeRemaining <= 30) return "warning";
    return "";
  };

  return (
    <div className="min-h-screen tech-background">
      {/* Background Effects */}
      <div className="tech-orb tech-orb-1" />
      <div className="tech-orb tech-orb-2" />
      <div className="tech-orb tech-orb-3" />
      <div className="tech-orb tech-orb-4" />
      <div className="tech-grid" />
      
      {/* Header */}
      <header className="relative z-10 py-6">
        <div className="banking-container">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-white/90 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <BilingualText english="Back" bengali="পিছনে" />
            </Button>
            <ThemeToggle variant="header" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 banking-container pb-12">
        <div className="max-w-md mx-auto">
          {/* Logo & Title */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="bg-white/95 dark:bg-white/90 rounded-2xl p-3 shadow-lg backdrop-blur-sm">
                <img 
                  src={mtbLogoFull} 
                  alt="Mutual Trust Bank PLC" 
                  className="h-12 md:h-14 w-auto"
                />
              </div>
            </div>
            <div className="mline-separator w-20 mx-auto mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              <BilingualText english="Tarit Loan" bengali="তরিৎ ঋণ" />
            </h1>
          </div>

          {/* OTP Verification Card */}
          <Card className="banking-card-glass animate-slide-up">
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                verificationStatus === 'success' 
                  ? 'bg-success/20 success-pulse' 
                  : verificationStatus === 'error'
                  ? 'bg-destructive/20'
                  : 'bg-success/10'
              }`}>
                {verificationStatus === 'success' ? (
                  <CheckCircle className="w-8 h-8 text-success" />
                ) : verificationStatus === 'error' ? (
                  <AlertCircle className="w-8 h-8 text-destructive" />
                ) : (
                  <Shield className="w-8 h-8 text-success" />
                )}
              </div>
              <CardTitle className="text-xl text-card-foreground">
                <BilingualText english="OTP Verification" bengali="ওটিপি যাচাইকরণ" />
              </CardTitle>
              <CardDescription className="text-center mt-2 text-muted-foreground">
                <BilingualText 
                  english={`Enter the 6-digit code sent to ${maskedNumber}`}
                  bengali={`${maskedNumber} এ পাঠানো ৬-সংখ্যার কোডটি প্রবেশ করান`}
                />
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="flex justify-center">
                <div className={`timer-display ${getTimerClass()}`}>
                  <Clock className="w-4 h-4" />
                  {isExpired ? (
                    <BilingualText english="OTP Expired" bengali="ওটিপি মেয়াদোত্তীর্ণ" />
                  ) : (
                    <span>
                      <BilingualText 
                        english={`Resend available in ${formattedTime}`}
                        bengali={`${formattedTime} পরে পুনরায় পাঠান`}
                      />
                    </span>
                  )}
                </div>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={verificationStatus === 'verifying' || verificationStatus === 'success'}
                >
                  <InputOTPGroup className="gap-2 md:gap-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot 
                        key={index}
                        index={index} 
                        className={`otp-input-slot ${otp[index] ? 'filled' : ''}`}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="text-center animate-fade-in">
                  <p className="text-sm text-destructive flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Verification Status */}
              {verificationStatus === 'verifying' && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground animate-fade-in">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <BilingualText english="Verifying OTP..." bengali="ওটিপি যাচাই করা হচ্ছে..." />
                </div>
              )}

              {verificationStatus === 'success' && (
                <div className="flex items-center justify-center gap-2 text-success animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <BilingualText english="Verification successful!" bengali="যাচাইকরণ সফল!" />
                </div>
              )}

              {/* Resend OTP Button */}
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  onClick={handleResendOtp}
                  disabled={!isExpired || isResending}
                  className={`transition-all duration-300 ${
                    isExpired 
                      ? 'text-primary hover:text-primary hover:bg-primary/10' 
                      : 'text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      <BilingualText english="Sending..." bengali="পাঠানো হচ্ছে..." />
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      <BilingualText english="Resend OTP" bengali="ওটিপি পুনরায় পাঠান" />
                    </>
                  )}
                </Button>
              </div>

              {/* M-Line Separator */}
              <div className="mline-separator-thin mx-auto w-24" />

              {/* Help Text */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  <BilingualText 
                    english="Didn't receive the code? Check your SMS or contact customer service at 16219" 
                    bengali="কোড পাননি? আপনার এসএমএস চেক করুন অথবা ১৬২১৯ নম্বরে কল করুন" 
                  />
                </p>
              </div>

              {/* Demo Hint */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg inline-block">
                  Demo: Enter OTP <span className="font-mono font-bold">123456</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/60 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              <BilingualText 
                english="Your information is protected with bank-grade security" 
                bengali="আপনার তথ্য ব্যাংক-মানের নিরাপত্তায় সুরক্ষিত" 
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
