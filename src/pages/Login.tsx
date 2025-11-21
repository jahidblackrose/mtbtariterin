import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Smartphone, CreditCard, Shield } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { toast } from "@/hooks/use-toast";
import mtvbLogo from "@/assets/mtvb_logo-2.png";

const Login = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loginType, setLoginType] = useState<"account" | "mobile">("account");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!accountNumber && !mobileNumber) {
      toast({
        title: "Error",
        description: "Please enter your account number or mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate("/otp-verification", { 
        state: { 
          accountNumber: loginType === "account" ? accountNumber : "", 
          mobileNumber: loginType === "mobile" ? mobileNumber : "" 
        } 
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* MTB Neo Style Header */}
      <div className="mtb-neo-header">
        <div className="organic-shape organic-shape-1" />
        <div className="organic-shape organic-shape-2" />
        <div className="organic-shape organic-shape-3" />
        <div className="organic-shape organic-shape-4" />
        
        <div className="relative z-10 py-12">
          <div className="max-w-md mx-auto px-4">
            {/* MTB Logo */}
            <div className="text-center mb-8 animate-fade-in">
              <img 
                src={mtvbLogo} 
                alt="MTB Neo" 
                className="h-16 mx-auto mb-4 drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="banking-container -mt-20 relative z-20">
        <div className="max-w-md mx-auto px-4">

          <Card className="banking-card-elevated animate-slide-up shadow-elevated">
            <CardHeader>
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
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                <Button
                  variant={loginType === "account" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLoginType("account")}
                  className="text-xs"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  <BilingualText english="Account No." bengali="একাউন্ট নং" />
                </Button>
                <Button
                  variant={loginType === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLoginType("mobile")}
                  className="text-xs"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  <BilingualText english="Mobile No." bengali="মোবাইল নং" />
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
                    className="h-12"
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
                    className="h-12"
                  />
                </div>
              )}

              {/* Login Button */}
              <Button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="w-full h-12 bg-[#00A651] hover:bg-[#008F45] text-white"
                size="lg"
              >
                {isLoading ? (
                  <BilingualText english="Logging in..." bengali="লগইন করা হচ্ছে..." />
                ) : (
                  <BilingualText english="Log In" bengali="লগইন" />
                )}
              </Button>

              <Separator className="my-6" />

              {/* MTB Neo App Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  <BilingualText 
                    english="Already have MTB Neo app?" 
                    bengali="ইতিমধ্যে এমটিবি নিও অ্যাপ আছে?" 
                  />
                </p>
                <Button variant="outline" className="w-full">
                  <BilingualText english="Access via MTB Neo" bengali="এমটিবি নিও দিয়ে অ্যাক্সেস করুন" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="mt-6 text-center pb-8">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
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