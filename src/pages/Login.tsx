import { useState, useCallback } from "react";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative z-10 py-4 px-4 bg-gradient-to-r from-mtb-teal to-mtb-green">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo with glow background */}
            <div className="bg-white rounded-xl p-2 shadow-lg">
              <img 
                src={mtbLogoFull} 
                alt="MTB" 
                className="h-8 w-auto"
              />
            </div>
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
          {/* Title Section */}
          <div className="text-center mb-6 animate-fade-in pt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              <BilingualText english="Tarit Loan" bengali="তরিৎ ঋণ" />
            </h1>
            <p className="text-muted-foreground text-sm">
              <BilingualText english="Quick & Easy Digital Loan" bengali="দ্রুত ও সহজ ডিজিটাল ঋণ" />
            </p>
          </div>

          {/* Login Card */}
          <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-xl animate-slide-up">
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-xl text-foreground">
                <BilingualText english="Log In" bengali="লগইন" />
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                <BilingualText 
                  english="Enter your credentials to continue" 
                  bengali="চালিয়ে যেতে তথ্য প্রবেশ করান" 
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pb-6">
              {/* Login Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange("account")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                    loginType === "account" 
                      ? "bg-mtb-teal text-white shadow-sm" 
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <BilingualText english="Account" bengali="একাউন্ট" />
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange("mobile")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                    loginType === "mobile" 
                      ? "bg-mtb-teal text-white shadow-sm" 
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <BilingualText english="Mobile" bengali="মোবাইল" />
                </button>
              </div>

              {/* Input Fields */}
              {loginType === "account" ? (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium text-sm">
                    <BilingualText english="Account Number" bengali="অ্যাকাউন্ট নম্বর" />
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 13-digit account number"
                    value={accountNumber}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    className="h-12 bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-mtb-teal focus:ring-mtb-teal/20"
                    disabled={isLoading}
                    maxLength={13}
                  />
                  <p className="text-xs text-muted-foreground">
                    {accountNumber.length}/13 <BilingualText english="digits" bengali="সংখ্যা" />
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium text-sm">
                    <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
                  </Label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="01XXXXXXXXX"
                    value={mobileNumber}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    className="h-12 bg-background text-foreground border-border placeholder:text-muted-foreground focus:border-mtb-teal focus:ring-mtb-teal/20"
                    disabled={isLoading}
                    maxLength={11}
                  />
                  <p className="text-xs text-muted-foreground">
                    {mobileNumber.length}/11 • <BilingualText english="Must start with 01" bengali="০১ দিয়ে শুরু করতে হবে" />
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
                className="w-full h-12 bg-mtb-teal hover:bg-mtb-teal/90 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <BilingualText english="Logging in..." bengali="লগইন হচ্ছে..." />
                  </div>
                ) : (
                  <BilingualText english="Log In" bengali="লগইন" />
                )}
              </Button>

              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-card text-xs text-muted-foreground">
                    <BilingualText english="OR" bengali="অথবা" />
                  </span>
                </div>
              </div>

              {/* MTB Neo App Link */}
              <Button 
                variant="outline" 
                className="w-full h-11 rounded-xl border-2 text-foreground hover:bg-accent/50"
              >
                <BilingualText english="Access via MTB Neo" bengali="এমটিবি নিও দিয়ে" />
              </Button>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" />
              <BilingualText 
                english="Secured with bank-grade encryption" 
                bengali="ব্যাংক-মানের এনক্রিপশনে সুরক্ষিত" 
              />
            </p>
          </div>

          {/* Demo Note */}
          <div className="mt-3 text-center">
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
              Demo: Any valid format • OTP: 123456
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
