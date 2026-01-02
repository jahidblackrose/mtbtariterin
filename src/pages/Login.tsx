import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Smartphone, CreditCard, Shield, Loader2 } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { authService, otpService, ApiError, ERROR_MESSAGES } from "@/services/api";
import mtbLogoFull from "@/assets/mtb-logo-full.png";
import mlineGradient from "@/assets/mline-gradient.png";

const Login = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loginType, setLoginType] = useState<"account" | "mobile">("account");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const identifier = loginType === "account" ? accountNumber : mobileNumber;
    
    if (!identifier.trim()) {
      toast({
        title: "Validation Error",
        description: loginType === "account" 
          ? "Please enter your account number" 
          : "Please enter your mobile number",
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    if (loginType === "mobile" && !/^(\+880|0)?1[3-9]\d{8}$/.test(mobileNumber.replace(/\s/g, ''))) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid Bangladeshi mobile number",
        variant: "destructive",
      });
      return;
    }

    if (loginType === "account" && accountNumber.length < 10) {
      toast({
        title: "Invalid Account Number",
        description: "Please enter a valid account number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, authenticate
      const authResponse = await authService.login({
        accountNumber: loginType === "account" ? accountNumber : undefined,
        mobileNumber: loginType === "mobile" ? mobileNumber : undefined,
      });

      if (authResponse.success) {
        // Send OTP
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

  return (
    <div className="min-h-screen tech-background">
      {/* Background Effects */}
      <div className="tech-orb tech-orb-1" />
      <div className="tech-orb tech-orb-2" />
      <div className="tech-orb tech-orb-3" />
      <div className="tech-orb tech-orb-4" />
      <div className="tech-grid" />

      {/* Header with Theme Toggle */}
      <header className="relative z-10 py-6">
        <div className="banking-container">
          <div className="flex justify-end">
            <ThemeToggle variant="header" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 banking-container pb-12">
        <div className="max-w-md mx-auto">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <img 
                src={mtbLogoFull} 
                alt="Mutual Trust Bank PLC" 
                className="h-16 md:h-20 w-auto drop-shadow-lg"
              />
            </div>
            <div className="flex justify-center mb-4">
              <img src={mlineGradient} alt="" className="w-24 h-auto opacity-80" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md mb-2">
              <BilingualText english="Tarit Loan Application" bengali="তরিৎ ঋণ আবেদন" />
            </h1>
            <p className="text-white/70 text-sm">
              <BilingualText english="Quick & Easy Digital Loan" bengali="দ্রুত ও সহজ ডিজিটাল ঋণ" />
            </p>
          </div>

          {/* Login Card */}
          <Card className="banking-card-glass animate-slide-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                <BilingualText english="Log In" bengali="লগইন" />
              </CardTitle>
              <CardDescription>
                <BilingualText 
                  english="Enter your credentials to access Tarit Loan services" 
                  bengali="তরিৎ ঋণ সেবা অ্যাক্সেস করতে তথ্য প্রবেশ করান" 
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted/50 rounded-xl">
                <Button
                  variant={loginType === "account" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLoginType("account")}
                  className={`rounded-lg transition-all duration-200 ${
                    loginType === "account" 
                      ? "bg-card shadow-sm" 
                      : "hover:bg-card/50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">
                    <BilingualText english="Account No." bengali="একাউন্ট নং" />
                  </span>
                </Button>
                <Button
                  variant={loginType === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLoginType("mobile")}
                  className={`rounded-lg transition-all duration-200 ${
                    loginType === "mobile" 
                      ? "bg-card shadow-sm" 
                      : "hover:bg-card/50"
                  }`}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  <span className="text-xs font-medium">
                    <BilingualText english="Mobile No." bengali="মোবাইল নং" />
                  </span>
                </Button>
              </div>

              {/* Input Fields */}
              {loginType === "account" ? (
                <div className="space-y-2">
                  <Label className="bilingual-label">
                    <BilingualText english="Account Number" bengali="অ্যাকাউন্ট নম্বর" />
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter your account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="bilingual-label">
                    <BilingualText english="Mobile Number" bengali="মোবাইল নম্বর" />
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+880 1XXX-XXXXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Login Button */}
              <Button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="w-full h-12 bg-success hover:bg-success/90 text-white font-medium rounded-xl shadow-button transition-all duration-200 hover:shadow-lg"
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
              <div className="relative py-4">
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
                  className="w-full h-11 rounded-xl border-2 hover:bg-primary/5"
                >
                  <BilingualText english="Access via MTB Neo" bengali="এমটিবি নিও দিয়ে অ্যাক্সেস করুন" />
                </Button>
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

export default Login;
