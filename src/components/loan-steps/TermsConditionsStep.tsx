import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, CheckCircle, Home } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TermsConditionsStepProps {
  onNext: () => void;
  data: any;
  isReadOnly?: boolean;
  onSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
  submissionResult?: {
    status: string;
    message: string;
    applicationId: string;
  } | null;
  onTermsChange?: (accepted: boolean) => void;
}

export const TermsConditionsStep = ({ 
  onNext, 
  data, 
  isReadOnly, 
  onSubmit, 
  isSubmitting,
  submissionResult,
  onTermsChange 
}: TermsConditionsStepProps) => {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    cibConsent: false,
  });

  const handleAgreementChange = (field: string, value: boolean) => {
    const newAgreements = { ...agreements, [field]: value };
    setAgreements(newAgreements);
    
    // Notify parent about agreement status
    const allAccepted = newAgreements.termsAccepted && newAgreements.cibConsent;
    onTermsChange?.(allAccepted);
  };

  const allAgreementsAccepted = agreements.termsAccepted && agreements.cibConsent;

  // If submission was successful, show success screen
  if (submissionResult && submissionResult.status === "200") {
    return (
      <div className="space-y-6 text-center py-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-success">
            আবেদন সফল হয়েছে!
          </h2>
          <p className="text-muted-foreground">
            Application Submitted Successfully
          </p>
        </div>

        {/* Result Card */}
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-primary/20 mx-auto max-w-sm">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Status</span>
                <span className="font-semibold text-success bg-success/10 px-3 py-1 rounded-full text-sm">
                  {submissionResult.status === "200" ? "Success" : submissionResult.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Message</span>
                <span className="font-semibold text-foreground capitalize">
                  {submissionResult.message}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground text-sm">Application ID</span>
                <span className="font-bold text-primary text-lg font-mono">
                  {submissionResult.applicationId}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Text */}
        <p className="text-sm text-muted-foreground px-4">
          অনুগ্রহ করে এই Application ID সংরক্ষণ করুন। 
          <br />
          Please save this Application ID for future reference.
        </p>

        {/* Dashboard Button */}
        <Button 
          onClick={() => navigate("/dashboard")}
          className="gradient-primary w-full max-w-xs mx-auto"
          size="lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-semibold">শর্তাবলী</h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Please read and accept all terms to proceed" 
              bengali="এগিয়ে যেতে সমস্ত শর্তাবলী পড়ুন এবং গ্রহণ করুন" 
            />
          </p>
        </div>
      </div>

      {/* Terms and Conditions Content */}
      <Card>
        <CardHeader className="pb-2">
          <h6 className="font-semibold text-lg">শর্তাবলী</h6>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80 w-full rounded border p-4">
            <div className="space-y-3 text-sm text-justify leading-relaxed">
              <p>১. এই শর্তাবলী MTB এর ঋণ মঞ্জুরি এবং পরবর্তী CIB ক্লিয়ারেন্স থেকে শুরু করে ঋণ সম্পূর্ণরূপে পরিশোধ করা পর্যন্ত বলবৎ থাকবে |</p>
              
              <p>২. এই ঋণ সুবিধাটি ২১ থেকে ৬৫ বছরের আবেদনকারীদের মধ্যে সীমাবদ্ধ |</p>
              
              <p>৩. ঋণ গ্রহীতার ঋণ গ্রহণের সক্ষমতা নির্ধারণের পূর্ণ ক্ষমতা MTB সংরক্ষন করে |</p>
              
              <p>৪. এই ঋণের প্রসেসিং ফী হবে {data?.processingFee || "1"}% এবং সুদের হার হবে বার্ষিক {data?.interestRate || "15"}% | তবে উভয় হারই বাংলাদেশ ব্যাংকের নির্ধারিত সীমার মধ্যে থাকবে |</p>
              
              <p>৫. নির্ধারিত সময়ে কিস্তি পরিশোধ করতে ব্যর্থ হলে দণ্ড সুদের হার হবে বার্ষিক ২% |</p>
              
              <p>৬. EMI পরিমান নির্ধারণের ক্ষেত্রে বছর ৩৬০ দিনে ধরা হবে |</p>
              
              <p>৭. শুধুমাত্র এই প্লাটফর্ম থেকে আবেদন করাই ঋণের মঞ্জুরি নিৰ্দেশ করবে না | ঋণ প্রাপ্তি বাংলাদেশ ব্যাংকের Credit Information Bureau (CIB) থেকে সংগৃহিত CIB রিপোর্টের উপরও নির্ভর করবে | শুধুমাত্র সন্তোষজনক রিপোর্ট পাবার পরেই ঋণ গ্রহীতার হিসাবে ঋণের অর্থ ক্রেডিট করে হবে |</p>
              
              <p>৮. এই আবেদন থেকে আবেদনকারীর নির্বাচিত মেয়াদ অনুযায়ী মাসিক কিস্তির মাধ্যমে ঋণ পরিশোধ করবেন। আবেদনকারী আবেদনে দেয়া বিকল্প থেকে ঋণের মেয়াদ নির্বাচন করতে সক্ষম হবেন। নির্বাচিত তারিখে আবেদনে দেখানো কিস্তির পরিমাণ পরিশোধ করতে হবে । নির্দিষ্ট কিস্তির তারিখের পরে কিস্তি পরিশোধ করলে দন্ড সুদ আরোপিত হবে |</p>
              
              <p>৯. ঋণের কিস্তি ঋণগ্রহীতার ঋণের সাথে সংযুক্ত CASA (Link Account) অ্যাকাউন্ট থেকে আদায় করা হবে|</p>
              
              <p>১০. আবেদনকারী এই আবেদনটি করার জন্য যে মোবাইল নম্বর ব্যবহার করেছেন তার সাথে যুক্ত অ্যাকাউন্ট নম্বর অথবা অ্যাকাউন্ট নম্বর ব্যবহার করে থাকলে সেই একাউন্ট নম্বর লিঙ্ক অ্যাকাউন্ট হিসাবে গণ্য হবে |</p>
              
              <p>১২. ঋণ গ্রহীতা কতৃক যেকোন পরিশোধিত কিস্তি নিম্নোক্ত ক্রমানুসারে আদায় করা হবে ক.সরকারী চার্জসমূহ ( যেমন : Tax , Excise duty) খ. ব্যাংক চার্জসমূহ গ. দন্ড সুদ ঘ. নিয়মিত সুদ ঙ. মূলধন</p>
              
              <p>১৩. MTB যেকোন সময় ঋণগ্রহীতার কাছে বিতরণকৃত/অনুমোদিত অর্থ ফেরত নেয়ার অধিকার সংরক্ষণ করে |</p>
              
              <p>১৪. এই শর্তাদি গ্রহণ করে ঋণগ্রহীতা নিশ্চিত করেন যে এই ঋণ কোন অবৈধ কার্যকলাপের জন্য ব্যবহার করবেন না |</p>
              
              <p>১৫. যদি লিঙ্ক করা CASA অ্যাকাউন্টটি সরকার এবং অন্য কোনো নিয়ন্ত্রক কর্তৃপক্ষের সাথে মেনে চলার জন্য ব্লক করা হয়..</p>
              
              <p>১৬. এই ঋণ চুক্তি বাংলাদেশের বলবৎ আইন দ্বারা নিয়ন্ত্রিত হবে |</p>
              
              <p>১৭. MTB নিয়ন্ত্রক সংস্থার প্রয়োজনে ব্যবহারের উদ্দেশ্যে ঋণগ্রহীতার তথ্য ব্যবহার করার অধিকার সংরক্ষণ করে |</p>
              
              <p>১৮. বাংলাদেশ ব্যাংক কর্তৃক সময়ে সময়ে নির্ধারিত ঋণের নিয়মনীতি /সীমাবদ্ধতার পরিধির মধ্যে যাবতীয় সুবিধা গ্রহণ করতে হবে।</p>
              
              <p>১৯. ঋণগ্রহীতা এতদ্বারা ব্যাংককে ঋণগ্রহীতার লিঙ্ক অ্যাকাউন্টটি থেকে সুদ , চার্জ, সময় সময় বলবৎ থাকা CIB চার্জ এবং অন্যান্য খরচ সহ সমস্ত বকেয়া অর্থ ডেবিট করার অনুমতি দিচ্ছেন |</p>
              
              <p>২০. যদি এখানকার কোন বিধান অবৈধ বা অপ্রয়োগযোগ্য হয়ে যায় তাহলে অবশিষ্ট বিধানগুলির বৈধতা এবং প্রয়োগযোগ্যতা এর দ্বারা প্রভাবিত বা ক্ষতিগ্রস্ত হবে না।</p>
              
              <p>২১. ব্যাংক ঋণগ্রহীতাকে অবহিত করে যেকোন সময় এই শর্তাবলী পরিবর্তন করার অধিকার সংরক্ষণ করে। এই শর্তাবলীর যেকোন পরিবর্তন ইমেল বা এসএমএস বা উভয়ের মাধ্যমে ঋণগ্রহীতাকে জানানো হবে |</p>
              
              <p>২২. এই ঋণ সংক্রান্ত ব্যাংক কর্তৃক প্রদত্ত যেকোন নোটিশ এসএমএস বা ইমেল বা উভয়ের মাধ্যমেই অবহিত করা হবে ৷</p>
              
              <p>২৩. MTB যেকোন সময় কোন নোটিশ ছাড়াই লিংক একাউন্ট ব্যতীত আমার অন্য একক বা যৌথ নামে থাকা একাউন্ট ডেবিট করে এই ঋণের কিস্তি বা অন্য কোন চার্জ গ্রহণ করতে পারবে |</p>
              
              <p>২৪. এই শর্তাবলী মেনে নিয়ে আবেদনকারী এমটিবি-র সাথে একটি ঋণ চুক্তিতে প্রবেশ করছেন।</p>
              
              <p>২৫. End to End ডিজিটালি ঋণ বিতরণ ও আদায় করা হলে ঋণ মঞ্জুরীপত্র (কাগজে) এবং চার্জ ডকুমেন্ট সমূহে গ্রহকের স্বাক্ষর গ্রহণের পরিবর্তে ডিজিটাল মাধ্যমেই ঋণের আবেদন, গ্রাহকের সম্মতি/স্বাক্ষর গ্রহণ করতে হবে। সুত্রঃ বিআরপিড(পিএডিএস)৮০০(৪)২০২৩-৫৪৩৫।</p>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        {/* Terms Acceptance */}
        <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card">
          <Checkbox
            id="termsAccepted"
            checked={agreements.termsAccepted}
            onCheckedChange={(checked) => handleAgreementChange("termsAccepted", checked as boolean)}
            className="mt-1 h-5 w-5"
          />
          <label htmlFor="termsAccepted" className="text-sm cursor-pointer leading-relaxed text-justify">
            আমি এতদ্বারা ঘোষণা করছি যে আমি এখানে উল্লেখিত সমস্ত শর্তাবলী পড়েছি এবং সম্পূর্ণরূপে বুঝেছি এবং এতদ্বারা সমস্ত শর্তাবলী স্বীকার ও সম্মতি জানাচ্ছি।
          </label>
        </div>

        {/* CIB Consent */}
        <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card">
          <Checkbox
            id="cibConsent"
            checked={agreements.cibConsent}
            onCheckedChange={(checked) => handleAgreementChange("cibConsent", checked as boolean)}
            className="mt-1 h-5 w-5"
          />
          <label htmlFor="cibConsent" className="text-sm cursor-pointer leading-relaxed text-justify">
            আমি ব্যাংকে কে আবেদন পত্রে উল্লিখিত আমার ব্যাক্তিগত তথ্য ব্যবহার করে CIB Report সংগ্রহ করার জন্য সজ্ঞানে অনুমতি প্রদান করছি।
          </label>
        </div>
      </div>
    </div>
  );
};
