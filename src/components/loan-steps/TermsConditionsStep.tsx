import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Shield, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface TermsConditionsStepProps {
  onNext: () => void;
  data: any;
}

export const TermsConditionsStep = ({ onNext, data }: TermsConditionsStepProps) => {
  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    creditBureauConsent: false,
    dataProcessingConsent: false,
    communicationConsent: false
  });

  const handleAgreementChange = (field: string, value: boolean) => {
    setAgreements(prev => ({ ...prev, [field]: value }));
  };

  const allAgreementsAccepted = Object.values(agreements).every(Boolean);

  const handleSubmit = () => {
    if (allAgreementsAccepted) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-mtb-teal/10 to-mtb-green/10 rounded-xl border border-mtb-teal/20">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mtb-teal to-mtb-green flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            <BilingualText english="Terms & Conditions" bengali="শর্তাবলী" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Please read and accept all terms to proceed" 
              bengali="এগিয়ে যেতে সমস্ত শর্তাবলী পড়ুন এবং গ্রহণ করুন" 
            />
          </p>
        </div>
      </div>

      {/* Terms and Conditions Content */}
      <Card className="border-border bg-card/50">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-mtb-teal" />
            <BilingualText english="Loan Agreement Terms" bengali="ঋণ চুক্তির শর্তাবলী" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64 w-full p-4">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-foreground">
                  <BilingualText english="1. Loan Terms" bengali="১. ঋণের শর্তাবলী" />
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  <BilingualText 
                    english="The loan amount, interest rate, and repayment schedule as agreed upon in this application will be binding upon approval. The borrower agrees to repay the loan according to the specified EMI schedule."
                    bengali="এই আবেদনে সম্মত ঋণের পরিমাণ, সুদের হার এবং পরিশোধের তফসিল অনুমোদনের পর বাধ্যতামূলক হবে। ঋণগ্রহীতা নির্দিষ্ট EMI তফসিল অনুযায়ী ঋণ পরিশোধ করতে সম্মত।"
                  />
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-foreground">
                  <BilingualText english="2. Interest and Charges" bengali="২. সুদ ও চার্জ" />
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  <BilingualText 
                    english="Interest will be charged at the agreed rate. Additional charges may apply for late payments, processing fees, and other administrative costs as per bank policy."
                    bengali="সম্মত হারে সুদ চার্জ করা হবে। দেরিতে পরিশোধ, প্রক্রিয়াকরণ ফি এবং ব্যাংকের নীতি অনুযায়ী অন্যান্য প্রশাসনিক খরচের জন্য অতিরিক্ত চার্জ প্রয়োগ হতে পারে।"
                  />
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-foreground">
                  <BilingualText english="3. Default and Recovery" bengali="৩. ডিফল্ট ও আদায়" />
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  <BilingualText 
                    english="In case of default, the bank reserves the right to take legal action and report to credit bureaus. Recovery charges and legal fees will be borne by the borrower."
                    bengali="ডিফল্টের ক্ষেত্রে, ব্যাংক আইনি ব্যবস্থা নেওয়ার এবং ক্রেডিট ব্যুরোতে রিপোর্ট করার অধিকার সংরক্ষণ করে। আদায় চার্জ এবং আইনি ফি ঋণগ্রহীতা বহন করবেন।"
                  />
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-foreground">
                  <BilingualText english="4. Prepayment" bengali="৪. আগাম পরিশোধ" />
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  <BilingualText 
                    english="The borrower may prepay the loan in full or part subject to applicable prepayment charges as per bank policy."
                    bengali="ঋণগ্রহীতা ব্যাংকের নীতি অনুযায়ী প্রযোজ্য অগ্রিম পরিশোধ চার্জ সাপেক্ষে সম্পূর্ণ বা আংশিক ঋণ আগাম পরিশোধ করতে পারেন।"
                  />
                </p>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground">
          <BilingualText english="Required Consents" bengali="প্রয়োজনীয় সম্মতি" />
        </h4>

        <div className="space-y-3">
          {/* Terms Acceptance */}
          <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-all ${
            agreements.termsAccepted 
              ? 'border-mtb-success/50 bg-mtb-success/5' 
              : 'border-border bg-card/50'
          }`}>
            <Checkbox
              id="termsAccepted"
              checked={agreements.termsAccepted}
              onCheckedChange={(checked) => handleAgreementChange("termsAccepted", checked as boolean)}
              className="mt-0.5 border-mtb-teal data-[state=checked]:bg-mtb-teal data-[state=checked]:border-mtb-teal"
            />
            <div className="flex-1">
              <label htmlFor="termsAccepted" className="text-sm font-medium cursor-pointer text-foreground flex items-center gap-2">
                <BilingualText 
                  english="I have read and agree to the loan terms and conditions"
                  bengali="আমি ঋণের শর্তাবলী পড়েছি এবং সম্মত আছি"
                />
                {agreements.termsAccepted && <CheckCircle className="w-4 h-4 text-mtb-success" />}
              </label>
            </div>
          </div>

          {/* Credit Bureau Consent */}
          <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-all ${
            agreements.creditBureauConsent 
              ? 'border-mtb-success/50 bg-mtb-success/5' 
              : 'border-border bg-card/50'
          }`}>
            <Checkbox
              id="creditBureauConsent"
              checked={agreements.creditBureauConsent}
              onCheckedChange={(checked) => handleAgreementChange("creditBureauConsent", checked as boolean)}
              className="mt-0.5 border-mtb-teal data-[state=checked]:bg-mtb-teal data-[state=checked]:border-mtb-teal"
            />
            <div className="flex-1">
              <label htmlFor="creditBureauConsent" className="text-sm font-medium cursor-pointer text-foreground flex items-center gap-2">
                <BilingualText 
                  english="I consent to credit bureau verification and reporting"
                  bengali="আমি ক্রেডিট ব্যুরো যাচাইকরণ ও রিপোর্টিংয়ে সম্মত আছি"
                />
                {agreements.creditBureauConsent && <CheckCircle className="w-4 h-4 text-mtb-success" />}
              </label>
            </div>
          </div>

          {/* Data Processing Consent */}
          <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-all ${
            agreements.dataProcessingConsent 
              ? 'border-mtb-success/50 bg-mtb-success/5' 
              : 'border-border bg-card/50'
          }`}>
            <Checkbox
              id="dataProcessingConsent"
              checked={agreements.dataProcessingConsent}
              onCheckedChange={(checked) => handleAgreementChange("dataProcessingConsent", checked as boolean)}
              className="mt-0.5 border-mtb-teal data-[state=checked]:bg-mtb-teal data-[state=checked]:border-mtb-teal"
            />
            <div className="flex-1">
              <label htmlFor="dataProcessingConsent" className="text-sm font-medium cursor-pointer text-foreground flex items-center gap-2">
                <BilingualText 
                  english="I consent to processing of my personal data for loan evaluation"
                  bengali="আমি ঋণ মূল্যায়নের জন্য আমার ব্যক্তিগত তথ্য প্রক্রিয়াকরণে সম্মত আছি"
                />
                {agreements.dataProcessingConsent && <CheckCircle className="w-4 h-4 text-mtb-success" />}
              </label>
            </div>
          </div>

          {/* Communication Consent */}
          <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-all ${
            agreements.communicationConsent 
              ? 'border-mtb-success/50 bg-mtb-success/5' 
              : 'border-border bg-card/50'
          }`}>
            <Checkbox
              id="communicationConsent"
              checked={agreements.communicationConsent}
              onCheckedChange={(checked) => handleAgreementChange("communicationConsent", checked as boolean)}
              className="mt-0.5 border-mtb-teal data-[state=checked]:bg-mtb-teal data-[state=checked]:border-mtb-teal"
            />
            <div className="flex-1">
              <label htmlFor="communicationConsent" className="text-sm font-medium cursor-pointer text-foreground flex items-center gap-2">
                <BilingualText 
                  english="I agree to receive communications via SMS, email, and phone calls"
                  bengali="আমি SMS, ইমেইল এবং ফোন কলের মাধ্যমে যোগাযোগ গ্রহণে সম্মত আছি"
                />
                {agreements.communicationConsent && <CheckCircle className="w-4 h-4 text-mtb-success" />}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      {!allAgreementsAccepted && (
        <div className="flex items-start gap-3 p-4 bg-mtb-orange/10 rounded-xl border border-mtb-orange/20">
          <AlertTriangle className="w-5 h-5 text-mtb-orange flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <BilingualText 
              english="Please accept all terms and conditions to proceed with your loan application."
              bengali="আপনার ঋণের আবেদন এগিয়ে নিতে সমস্ত শর্তাবলী গ্রহণ করুন।"
            />
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!allAgreementsAccepted}
          className="bg-gradient-to-r from-mtb-teal to-mtb-green hover:from-mtb-teal/90 hover:to-mtb-green/90 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
          size="lg"
        >
          <BilingualText english="Submit Application" bengali="আবেদন জমা দিন" />
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
