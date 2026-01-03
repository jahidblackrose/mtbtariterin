import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Copy, Home, FileText, Phone } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ApplicationConfirmationStepProps {
  data: any;
}

export const ApplicationConfirmationStep = ({ data }: ApplicationConfirmationStepProps) => {
  const navigate = useNavigate();
  const applicationId = "MTB" + Date.now().toString().slice(-8);

  const copyApplicationId = () => {
    navigator.clipboard.writeText(applicationId);
    toast({
      title: "Copied!",
      description: "Application ID copied to clipboard",
    });
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-2xl font-bold text-success mb-2">
          <BilingualText english="Application Submitted!" bengali="আবেদন জমা দেওয়া হয়েছে!" />
        </h2>
        <p className="text-muted-foreground">
          <BilingualText 
            english="Your loan application has been successfully submitted for review"
            bengali="আপনার ঋণের আবেদন সফলভাবে পর্যালোচনার জন্য জমা দেওয়া হয়েছে"
          />
        </p>
      </div>

      {/* Application ID Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              <BilingualText english="Application ID" bengali="আবেদনের আইডি" />
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl font-bold text-primary font-mono">
                {applicationId}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyApplicationId}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-accent-foreground">
              <BilingualText 
                english="⚠️ Please save this Application ID for future reference"
                bengali="⚠️ ভবিষ্যতের রেফারেন্সের জন্য এই আবেদনের আইডি সংরক্ষণ করুন"
              />
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Application Summary */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">
            <BilingualText english="Application Summary" bengali="আবেদনের সারসংক্ষেপ" />
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-left">
              <p className="text-muted-foreground">
                <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
              </p>
              <p className="font-semibold">৳{data.loanAmount?.[0]?.toLocaleString()}</p>
            </div>
            <div className="text-left">
              <p className="text-muted-foreground">
                <BilingualText english="Tenure" bengali="মেয়াদ" />
              </p>
              <p className="font-semibold">{data.loanTenure?.[0]} months</p>
            </div>
            <div className="text-left">
              <p className="text-muted-foreground">
                <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
              </p>
              <p className="font-semibold">৳{data.emi?.toLocaleString()}</p>
            </div>
            <div className="text-left">
              <p className="text-muted-foreground">
                <BilingualText english="Interest Rate" bengali="সুদের হার" />
              </p>
              <p className="font-semibold">{data.interestRate}% p.a.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Next Steps */}
      <div className="text-left">
        <h3 className="font-semibold mb-4 text-center">
          <BilingualText english="What happens next?" bengali="এরপর কী হবে?" />
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">1</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">
                <BilingualText english="Document Verification" bengali="ডকুমেন্ট যাচাইকরণ" />
              </h4>
              <p className="text-sm text-muted-foreground">
                <BilingualText 
                  english="Our team will verify your documents and application details"
                  bengali="আমাদের টিম আপনার ডকুমেন্ট এবং আবেদনের বিবরণ যাচাই করবে"
                />
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">
                <BilingualText english="Credit Assessment" bengali="ঋণ মূল্যায়ন" />
              </h4>
              <p className="text-sm text-muted-foreground">
                <BilingualText 
                  english="We'll assess your creditworthiness and loan eligibility"
                  bengali="আমরা আপনার ঋণযোগ্যতা এবং ঋণের যোগ্যতা মূল্যায়ন করব"
                />
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">3</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">
                <BilingualText english="Approval & Disbursement" bengali="অনুমোদন ও বিতরণ" />
              </h4>
              <p className="text-sm text-muted-foreground">
                <BilingualText 
                  english="Upon approval, loan amount will be disbursed to your account"
                  bengali="অনুমোদনের পর, ঋণের পরিমাণ আপনার অ্যাকাউন্টে পাঠানো হবে"
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <BilingualText english="Need Help?" bengali="সাহায্য প্রয়োজন?" />
          </h4>
          <div className="text-sm space-y-2">
            <p>
              <BilingualText english="Call: 16247 (24/7)" bengali="কল: ১৬২৪৭ (২৪/৭)" />
            </p>
            <p>
              <BilingualText english="Email: support@mtb.com.bd" bengali="ইমেইল: support@mtb.com.bd" />
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={goToDashboard} size="lg">
          <Home className="w-4 h-4 mr-2" />
          <BilingualText english="Go to Dashboard" bengali="ড্যাশবোর্ডে যান" />
        </Button>
        
        <Button onClick={copyApplicationId} className="gradient-primary" size="lg">
          <FileText className="w-4 h-4 mr-2" />
          <BilingualText english="Save Application ID" bengali="আবেদন আইডি সংরক্ষণ" />
        </Button>
      </div>
    </div>
  );
};