import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, CreditCard, Shield, Loader2, AlertCircle } from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { 
  authService, 
  otpService, 
  ApiError, 
  ERROR_MESSAGES,
  validateMobileNumber,
  validateAccountNumber,
} from "@/services/api";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

const Login = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loginType, setLoginType] = useState<"account" | "mobile">("account");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const navigate = useNavigate();

  const accountInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on validation error
  useEffect(() => {
    if (validationError) {
      if (loginType === "mobile") {
        mobileInputRef.current?.focus();
      } else {
        accountInputRef.current?.focus();
      }
    }
  }, [validationError, loginType]);

  const handleMobileChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      setMobileNumber(cleaned);
      
      if (cleaned.length > 0) {
        if (!cleaned.startsWith('01') && cleaned.length >= 2) {
          setValidationError('Mobile number must start with 01');
        } else if (cleaned.length === 11) {
          const validation = validateMobileNumber(cleaned);
          setValidationError(validation.valid ? '' : validation.error || '');
        } else {
          setValidationError('');
        }
      } else {
        setValidationError('');
      }
    }
  }, []);

  const handleAccountChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 13) {
      setAccountNumber(cleaned);
      
      if (cleaned.length === 13) {
        const validation = validateAccountNumber(cleaned);
        setValidationError(validation.valid ? '' : validation.error || '');
      } else if (cleaned.length > 0) {
        setValidationError('');
      } else {
        setValidationError('');
      }
    }
  }, []);

  const handleLogin = async () => {
    if (loginType === "mobile") {
      const validation = validateMobileNumber(mobileNumber);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid mobile number');
        toast({
          title: "Validation Error",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
    } else {
      const validation = validateAccountNumber(accountNumber);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid account number');
        toast({
          title: "Validation Error",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    setValidationError("");

    try {
      const authResponse = await authService.login({
        accountNumber: loginType === "account" ? accountNumber : undefined,
        mobileNumber: loginType === "mobile" ? mobileNumber : undefined,
      });

      if (authResponse.success) {
        const otpResponse = await otpService.sendOtp({
          accountNumber: loginType === "account" ? accountNumber : undefined,
          mobileNumber: loginType === "mobile" ? mobileNumber : undefined,
          purpose: 'login',
        });

        if (otpResponse.success) {
          toast({
            title: "OTP Sent",
            description: `Verification code sent to ${otpResponse.data?.maskedNumber || "your registered number"}`,
          });

          navigate("/otp-verification", { 
            state: { 
              accountNumber: loginType === "account" ? accountNumber : "", 
              mobileNumber: loginType === "mobile" ? mobileNumber : "" 
            } 
          });
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setValidationError(ERROR_MESSAGES[error.code] || error.message);
        toast({
          title: "Login Failed",
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
      setIsLoading(false);
    }
  };

  const handleLoginTypeChange = (type: "account" | "mobile") => {
    setLoginType(type);
    setValidationError("");
  };

  const isSubmitDisabled = isLoading || 
    (loginType === "mobile" ? mobileNumber.length !== 11 : accountNumber.length !== 13);

  return (
    <div className="min-h-screen tech-background">
      {/* Background Effects */}
      <div className="tech-orb tech-orb-1" />
      <div className="tech-orb tech-orb-2" />
      <div className="tech-orb tech-orb-3" />
      <div className="tech-orb tech-orb-4" />
      <div className="tech-grid" />

      {/* Header */}
      <header className="relative z-10 py-4 safe-area-top">
        <div className="banking-container">
          <div className="flex justify-end items-center gap-2">
            <LanguageToggle variant="header" className="bg-white/20 text-white hover:bg-white/30" />
            <ThemeToggle variant="header" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 banking-container pb-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Logo Section with Glow */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="logo-glow-container p-4">
                <img 
                  src={mtbLogoFull} 
                  alt="Mutual Trust Bank PLC" 
                  className="h-12 sm:h-16 md:h-18 w-auto"
                />
              </div>
            </div>
            <div className="mline-separator w-20 mx-auto mb-3" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-md mb-1">
              <BilingualText english="Tarit Loan Application" bengali="তরিৎ ঋণ আবেদন" />
            </h1>
            <p className="text-white/70 text-sm">
              <BilingualText english="Quick & Easy Digital Loan" bengali="দ্রুত ও সহজ ডিজিটাল ঋণ" />
            </p>
          </div>

          {/* Login Card */}
          <Card className="banking-card-glass animate-slide-up">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl text-card-foreground">
                <BilingualText english="Log In" bengali="লগইন" />
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                <BilingualText 
                  english="Enter your credentials to access Tarit Loan services" 
                  bengali="তরিৎ ঋণ সেবা অ্যাক্সেস করতে তথ্য প্রবেশ করান" 
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-4 sm:px-6">
              {/* Login Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange("account")}
                  className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    loginType === "account" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    <BilingualText english="Account" bengali="একাউন্ট" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange("mobile")}
                  className={`flex items-center justify-center gap-2 py-3 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    loginType === "mobile" 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Smartphone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    <BilingualText english="Mobile" bengali="মোবাইল" />
                  </span>
                </button>
              </div>

              {/* Input Fields */}
              {loginType === "account" ? (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium text-sm">
                    <BilingualText english="Account Number" bengali="অ্যাকাউন্ট নম্বর" />
                  </Label>
                  <Input
                    ref={accountInputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 13-digit account number"
                    value={accountNumber}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    className="h-12 bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 text-base"
                    disabled={isLoading}
                    maxLength={13}
                  />
                  <p className="text-xs text-muted-foreground">
                    {accountNumber.length}/13 digits
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium text-sm">
                    <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
                  </Label>
                  <Input
                    ref={mobileInputRef}
                    type="tel"
                    inputMode="numeric"
                    placeholder="01XXXXXXXXX"
                    value={mobileNumber}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    className="h-12 bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 text-base"
                    disabled={isLoading}
                    maxLength={11}
                  />
                  <p className="text-xs text-muted-foreground">
                    {mobileNumber.length}/11 digits • Must start with 01
                  </p>
                </div>
              )}

              {/* Validation Error */}
              {validationError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Login Button */}
              <Button 
                onClick={handleLogin} 
                disabled={isSubmitDisabled}
                className="w-full h-12 bg-success hover:bg-success/90 text-white font-medium rounded-xl shadow-button transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <BilingualText english="Logging in..." bengali="লগইন করা হচ্ছে..." />
                  </div>
                ) : (
                  <BilingualText english="Log In" bengali="লগইন" />
                )}
              </Button>

              {/* M-Line Separator */}
              <div className="relative py-3">
                <div className="mline-separator" />
              </div>

              {/* MTB Neo App Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  <BilingualText 
                    english="Already have MTB Neo app?" 
                    bengali="ইতিমধ্যে এমটিবি নিও অ্যাপ আছে?" 
                  />
                </p>
                <Button 
                  variant="outline" 
                  className="w-full h-11 rounded-xl border-2 border-border text-foreground hover:bg-accent/50"
                >
                  <BilingualText english="Access via MTB Neo" bengali="এমটিবি নিও দিয়ে অ্যাক্সেস করুন" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-white/60 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              <BilingualText 
                english="Your information is protected with bank-grade security" 
                bengali="আপনার তথ্য ব্যাংক-মানের নিরাপত্তায় সুরক্ষিত" 
              />
            </p>
          </div>

          {/* Demo Note */}
          <div className="mt-3 text-center">
            <p className="text-xs text-white/50 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              Demo: Use any valid format. OTP: 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
