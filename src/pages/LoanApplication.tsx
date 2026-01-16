import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { AppHeader, CircularStepIndicator, FixedBottomCTA, StepTransition } from "@/components/pwa";
import { useIsMobile } from "@/hooks/use-mobile";
import { PersonalInfoStep } from "@/components/loan-steps/PersonalInfoStep";
import { AddressStep } from "@/components/loan-steps/AddressStep";
import { ExistingLoansStep } from "@/components/loan-steps/ExistingLoansStep";
import { LoanDetailsStep } from "@/components/loan-steps/LoanDetailsStep";
import { LoanSummaryStep } from "@/components/loan-steps/LoanSummaryStep";
import { FaceVerificationStep } from "@/components/loan-steps/FaceVerificationStep";
import { TermsConditionsStep } from "@/components/loan-steps/TermsConditionsStep";
import { ApplicationConfirmationStep } from "@/components/loan-steps/ApplicationConfirmationStep";
import { loanStepService } from "@/services/loanStepApi";
import { toast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, title: "Personal", titleBengali: "ব্যক্তিগত" },
  { id: 2, title: "Address", titleBengali: "ঠিকানা" },
  { id: 3, title: "Loans", titleBengali: "ঋণ" },
  { id: 4, title: "Amount", titleBengali: "পরিমাণ" },
  { id: 5, title: "Summary", titleBengali: "সারাংশ" },
  { id: 6, title: "Face", titleBengali: "মুখ" },
  { id: 7, title: "Terms", titleBengali: "শর্ত" },
  { id: 8, title: "Done", titleBengali: "সম্পন্ন" }
];

const LoanApplication = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepDirection, setStepDirection] = useState(1);
  const [applicationData, setApplicationData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Submit step data to API
  const submitStepData = useCallback(async (step: number, data: any) => {
    setIsLoading(true);
    try {
      const response = await loanStepService.submitStep(step, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to save step data");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save data. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNext = useCallback(async (stepData?: any) => {
    if (stepData) {
      // Submit to API
      const result = await submitStepData(currentStep, stepData);
      if (!result && currentStep !== 8) {
        // API call failed, don't proceed (except for final step)
        return;
      }
      setApplicationData(prev => ({ ...prev, ...stepData, ...result }));
    }
    
    if (currentStep < STEPS.length) {
      setStepDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, submitStepData]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setStepDirection(-1);
      setCurrentStep(prev => prev - 1);
    } else {
      navigate("/dashboard");
    }
  }, [currentStep, navigate]);

  const renderStep = () => {
    const stepProps = { onNext: handleNext, data: applicationData };
    
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} />;
      case 2:
        return <AddressStep {...stepProps} />;
      case 3:
        return <ExistingLoansStep {...stepProps} />;
      case 4:
        return <LoanDetailsStep {...stepProps} />;
      case 5:
        return <LoanSummaryStep {...stepProps} />;
      case 6:
        return <FaceVerificationStep {...stepProps} />;
      case 7:
        return <TermsConditionsStep {...stepProps} />;
      case 8:
        return <ApplicationConfirmationStep data={applicationData} />;
      default:
        return <PersonalInfoStep {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* App Header - Mobile: back only, Desktop: logo + back */}
      <AppHeader
        title={{ english: "Loan Application", bengali: "ঋণের আবেদন" }}
        subtitle={{ 
          english: `Step ${currentStep} of ${STEPS.length}`, 
          bengali: `ধাপ ${currentStep} / ${STEPS.length}` 
        }}
        onBack={handlePrevious}
      />

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="max-w-lg mx-auto px-4 py-4">
          {/* Circular Step Indicator */}
          <div className="mb-4">
            <CircularStepIndicator 
              steps={STEPS} 
              currentStep={currentStep}
              variant={isMobile ? "compact" : "full"}
            />
          </div>

          {/* Step Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-2xl border-border shadow-card overflow-hidden">
              <CardHeader className="px-4 py-4 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
                    currentStep === STEPS.length 
                      ? "bg-success text-success-foreground" 
                      : "bg-primary text-primary-foreground"
                  }`}>
                    {currentStep === STEPS.length ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      currentStep
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      <BilingualText 
                        english={STEPS[currentStep - 1].title}
                        bengali={STEPS[currentStep - 1].titleBengali}
                      />
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <BilingualText 
                        english="Please fill in the required information"
                        bengali="প্রয়োজনীয় তথ্য পূরণ করুন"
                      />
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-4 py-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: stepDirection > 0 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: stepDirection > 0 ? -30 : 30 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Fixed Bottom CTA - Hidden on final step and on step 6 (Face Verification) for mobile */}
      {currentStep !== 8 && !(isMobile && currentStep === 6) && (
        <FixedBottomCTA
          primaryLabel={{ english: "Next", bengali: "পরবর্তী" }}
          onPrimaryClick={() => {
            // Trigger form submit in child component
            const form = document.querySelector("form");
            if (form) {
              form.requestSubmit();
            } else {
              // If no form, just call handleNext
              handleNext();
            }
          }}
          primaryLoading={isLoading}
          secondaryLabel={currentStep > 1 ? { english: "Back", bengali: "পিছনে" } : undefined}
          onSecondaryClick={currentStep > 1 ? handlePrevious : undefined}
        />
      )}
    </div>
  );
};

export default LoanApplication;
