import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLoginConfig, useTheme, ThemeName } from "@/contexts/ThemeContext";
import { 
  authService, 
  otpService, 
  ApiError, 
  ERROR_MESSAGES,
  validateMobileNumber,
  validateAccountNumber,
} from "@/services/api";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

const ThemeSelector = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  
  const themeLabels: Record<ThemeName, string> = {
    dark: 'Dark',
    oasis: 'Oasis',
    bloom: 'Bloom',
    azure: 'Azure',
    divine: 'Divine'
  };

  const themeColors: Record<ThemeName, string> = {
    dark: 'bg-gray-800',
    oasis: 'bg-emerald-600',
    bloom: 'bg-pink-500',
    azure: 'bg-blue-500',
    divine: 'bg-purple-600'
  };

  return (
    <div className="flex gap-1.5">
      {availableThemes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`w-6 h-6 rounded-full border-2 transition-all ${themeColors[t]} ${
            theme === t ? 'border-white scale-110 ring-2 ring-white/30' : 'border-white/30 hover:border-white/60'
          }`}
          title={themeLabels[t]}
          aria-label={`Switch to ${themeLabels[t]} theme`}
        />
      ))}
    </div>
  );
};

const Login = () => {
  const loginConfig = useLoginConfig();
  const [accountNumber, setAccountNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Determine login type from URL parameter (default: account)
  const loginType = loginConfig.loginType || 'account';

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

      {/* Header - Minimal on mobile */}
      <header className="relative z-10 py-4 safe-area-top">
        <div className="px-4 max-w-md mx-auto">
          <div className="flex justify-between items-center">
            {/* Desktop: Show logo */}
            {!isMobile && (
              <div className="logo-glow-container p-2">
                <img 
                  src={mtbLogoFull} 
                  alt="MTB" 
                  className="h-8 w-auto"
                />
              </div>
            )}
            {/* Mobile: Empty space */}
            {isMobile && <div />}
            
            <div className="flex items-center gap-3">
              <ThemeSelector />
              <LanguageToggle variant="header" className="bg-white/20 text-white hover:bg-white/30" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Logo Section - Always centered on mobile */}
          <div className="text-center mb-6">
            {isMobile && (
              <div className="flex justify-center mb-4">
                <div className="logo-glow-container p-4">
                  <img 
                    src={mtbLogoFull} 
                    alt="Mutual Trust Bank PLC" 
                    className="h-14 w-auto"
                  />
                </div>
              </div>
            )}
            <div className="mline-separator w-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-1">
              <BilingualText english="Tarit Loan" bengali="তরিৎ ঋণ" />
            </h1>
            <p className="text-white/70 text-sm">
              <BilingualText english="Quick & Easy Digital Loan" bengali="দ্রুত ও সহজ ডিজিটাল ঋণ" />
            </p>
          </div>

          {/* Login Card */}
          <Card className="rounded-3xl border-0 shadow-elevated overflow-hidden">
            <CardHeader className="pb-4 px-5 pt-6">
              <CardTitle className="text-xl text-card-foreground">
                <BilingualText english="Log In" bengali="লগইন" />
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                <BilingualText 
                  english="Enter your credentials to continue" 
                  bengali="চালিয়ে যেতে আপনার তথ্য প্রবেশ করান" 
                />
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-5 px-5 pb-6">
              {/* Input Field - Single input based on loginType */}
              <motion.div
                key={loginType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {loginType === "mobile" ? (
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
                    </Label>
                    <Input
                      ref={mobileInputRef}
                      type="tel"
                      inputMode="numeric"
                      placeholder="01XXXXXXXXX"
                      value={mobileNumber}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      className="h-14 text-lg rounded-xl"
                      disabled={isLoading}
                      maxLength={11}
                    />
                    <p className="text-xs text-muted-foreground">
                      {mobileNumber.length}/11 digits
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      <BilingualText english="Account Number" bengali="অ্যাকাউন্ট নম্বর" />
                    </Label>
                    <Input
                      ref={accountInputRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter 13-digit account number"
                      value={accountNumber}
                      onChange={(e) => handleAccountChange(e.target.value)}
                      className="h-14 text-lg rounded-xl"
                      disabled={isLoading}
                      maxLength={13}
                    />
                    <p className="text-xs text-muted-foreground">
                      {accountNumber.length}/13 digits
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Validation Error */}
              {validationError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </motion.div>
              )}

              {/* Login Button */}
              <Button 
                onClick={handleLogin} 
                disabled={isSubmitDisabled}
                className="w-full h-14 bg-success hover:bg-success/90 text-white font-semibold rounded-xl text-base shadow-button transition-all hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <BilingualText english="Logging in..." bengali="লগইন হচ্ছে..." />
                  </div>
                ) : (
                  <BilingualText english="Log In" bengali="লগইন" />
                )}
              </Button>

              {/* Separator */}
              <div className="relative py-2">
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
                  className="w-full h-12 rounded-xl border-2"
                >
                  <BilingualText english="Access via MTB Neo" bengali="এমটিবি নিও দিয়ে অ্যাক্সেস" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-white/60 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              <BilingualText 
                english="Your information is protected" 
                bengali="আপনার তথ্য সুরক্ষিত" 
              />
            </p>
          </div>

          {/* Demo Note */}
          <div className="mt-3 text-center">
            <p className="text-xs text-white/50 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
              Demo: Use any valid format. OTP: 123456
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
