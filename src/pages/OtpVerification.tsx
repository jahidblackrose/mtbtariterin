import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Shield, RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
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
  const otpInputRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { timeRemaining, isExpired, formattedTime, resetTimer } = useOtpTimer(120);
  
  const { accountNumber, mobileNumber } = location.state || {};

  // Auto-focus OTP input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (otpInputRef.current) {
        const firstInput = otpInputRef.current.querySelector('input');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
      // Re-focus first input on error
      setTimeout(() => {
        if (otpInputRef.current) {
          const firstInput = otpInputRef.current.querySelector('input');
          if (firstInput) firstInput.focus();
        }
      }, 100);
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

        // Focus first input after resend
        setTimeout(() => {
          if (otpInputRef.current) {
            const firstInput = otpInputRef.current.querySelector('input');
            if (firstInput) firstInput.focus();
          }
        }, 100);
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
    <div className="min-h-screen bg-gradient-to-br from-mtb-teal via-mtb-green to-mtb-teal">
      {/* Header */}
      <header className="relative z-10 py-4 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white/90 hover:bg-white/10 hover:text-white -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-sm"><BilingualText english="Back" bengali="পিছনে" /></span>
            </Button>
            <div className="flex items-center gap-2">
              <LanguageToggle variant="header" />
              <ThemeToggle variant="header" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* Logo & Title - Compact for mobile */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex justify-center mb-3">
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <img 
                  src={mtbLogoFull} 
                  alt="Mutual Trust Bank PLC" 
                  className="h-10 md:h-12 w-auto"
                />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
              <BilingualText english="Tarit Loan" bengali="তরিৎ ঋণ" />
            </h1>
          </div>

          {/* OTP Verification Card */}
          <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-xl animate-slide-up">
            <CardHeader className="text-center pb-3 pt-6">
              <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                verificationStatus === 'success' 
                  ? 'bg-mtb-success/20' 
                  : verificationStatus === 'error'
                  ? 'bg-destructive/20'
                  : 'bg-mtb-teal/10'
              }`}>
                {verificationStatus === 'success' ? (
                  <CheckCircle className="w-7 h-7 text-mtb-success" />
                ) : verificationStatus === 'error' ? (
                  <AlertCircle className="w-7 h-7 text-destructive" />
                ) : (
                  <Shield className="w-7 h-7 text-mtb-teal" />
                )}
              </div>
              <CardTitle className="text-lg text-foreground">
                <BilingualText english="OTP Verification" bengali="ওটিপি যাচাইকরণ" />
              </CardTitle>
              <CardDescription className="text-center mt-1 text-muted-foreground text-sm">
                <BilingualText 
                  english={`Enter the 6-digit code sent to ${maskedNumber}`}
                  bengali={`${maskedNumber} এ পাঠানো ৬-সংখ্যার কোডটি প্রবেশ করান`}
                />
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-5 pb-6">
              {/* Timer Display */}
              <div className="flex justify-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isExpired 
                    ? 'bg-destructive/10 text-destructive' 
                    : timeRemaining <= 30 
                    ? 'bg-mtb-orange/10 text-mtb-orange'
                    : 'bg-mtb-teal/10 text-mtb-teal'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  {isExpired ? (
                    <BilingualText english="OTP Expired" bengali="ওটিপি মেয়াদোত্তীর্ণ" />
                  ) : (
                    <span>{formattedTime}</span>
                  )}
                </div>
              </div>

              {/* OTP Input - Auto-focused */}
              <div className="flex justify-center" ref={otpInputRef}>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={verificationStatus === 'verifying' || verificationStatus === 'success'}
                  autoFocus
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot 
                        key={index}
                        index={index} 
                        className={`w-11 h-12 md:w-12 md:h-14 text-lg font-semibold rounded-lg border-2 transition-all ${
                          otp[index] 
                            ? 'border-mtb-teal bg-mtb-teal/5' 
                            : 'border-border bg-background'
                        } focus:border-mtb-teal focus:ring-2 focus:ring-mtb-teal/20`}
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
                  <span className="text-sm">
                    <BilingualText english="Verifying..." bengali="যাচাই করা হচ্ছে..." />
                  </span>
                </div>
              )}

              {verificationStatus === 'success' && (
                <div className="flex items-center justify-center gap-2 text-mtb-success animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">
                    <BilingualText english="Verified!" bengali="সফল!" />
                  </span>
                </div>
              )}

              {/* Resend OTP Button */}
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={!isExpired || isResending}
                  className={`transition-all ${
                    isExpired 
                      ? 'text-mtb-teal hover:text-mtb-teal hover:bg-mtb-teal/10' 
                      : 'text-muted-foreground'
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
                      <BilingualText english="Resend OTP" bengali="পুনরায় পাঠান" />
                    </>
                  )}
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground pt-3">
                  <BilingualText 
                    english="Need help? Call 16219" 
                    bengali="সাহায্য প্রয়োজন? কল করুন ১৬২১৯" 
                  />
                </p>
              </div>

              {/* Demo Hint */}
              <div className="text-center">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                  Demo OTP: <span className="font-mono font-bold">123456</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-white/70 flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" />
              <BilingualText 
                english="Bank-grade security" 
                bengali="ব্যাংক-মানের নিরাপত্তা" 
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
