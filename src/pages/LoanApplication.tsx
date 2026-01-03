import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepIndicator } from "@/components/StepIndicator";
import { PersonalInfoStep } from "@/components/loan-steps/PersonalInfoStep";
import { AddressStep } from "@/components/loan-steps/AddressStep";
import { ExistingLoansStep } from "@/components/loan-steps/ExistingLoansStep";
import { LoanDetailsStep } from "@/components/loan-steps/LoanDetailsStep";
import { LoanSummaryStep } from "@/components/loan-steps/LoanSummaryStep";
import { FaceVerificationStep } from "@/components/loan-steps/FaceVerificationStep";
import { TermsConditionsStep } from "@/components/loan-steps/TermsConditionsStep";
import { ApplicationConfirmationStep } from "@/components/loan-steps/ApplicationConfirmationStep";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

const STEPS = [
  { id: 1, title: "Personal Info", titleBengali: "ব্যক্তিগত তথ্য" },
  { id: 2, title: "Address", titleBengali: "ঠিকানা" },
  { id: 3, title: "Existing Loans", titleBengali: "বিদ্যমান ঋণ" },
  { id: 4, title: "Loan Details", titleBengali: "ঋণের বিবরণ" },
  { id: 5, title: "Summary", titleBengali: "সারসংক্ষেপ" },
  { id: 6, title: "Face Verify", titleBengali: "মুখ যাচাই" },
  { id: 7, title: "Terms", titleBengali: "শর্তাবলী" },
  { id: 8, title: "Confirmation", titleBengali: "নিশ্চিতকরণ" }
];

const LoanApplication = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState({});
  const navigate = useNavigate();

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setApplicationData(prev => ({ ...prev, ...stepData }));
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/dashboard");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep onNext={handleNext} data={applicationData} />;
      case 2:
        return <AddressStep onNext={handleNext} data={applicationData} />;
      case 3:
        return <ExistingLoansStep onNext={handleNext} data={applicationData} />;
      case 4:
        return <LoanDetailsStep onNext={handleNext} data={applicationData} />;
      case 5:
        return <LoanSummaryStep onNext={handleNext} data={applicationData} />;
      case 6:
        return <FaceVerificationStep onNext={handleNext} data={applicationData} />;
      case 7:
        return <TermsConditionsStep onNext={handleNext} data={applicationData} />;
      case 8:
        return <ApplicationConfirmationStep data={applicationData} />;
      default:
        return <PersonalInfoStep onNext={handleNext} data={applicationData} />;
    }
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized Header */}
      <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <div className="banking-container px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handlePrevious}
              className="p-2 h-auto"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
              <div className="logo-glow-container p-1 flex-shrink-0">
                <img src={mtbLogoFull} alt="MTB Logo" className="h-6 sm:h-7 w-auto" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
                  <BilingualText english="Loan Application" bengali="ঋণের আবেদন" />
                </h1>
                <p className="text-xs text-muted-foreground">
                  <BilingualText 
                    english={`Step ${currentStep} of ${STEPS.length}`}
                    bengali={`ধাপ ${currentStep}/${STEPS.length}`}
                  />
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <LanguageToggle variant="compact" className="bg-muted text-foreground hover:bg-accent" />
              <ThemeToggle />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        </div>
      </header>

      <div className="banking-container px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Step Indicators - Desktop */}
          <div className="hidden lg:block mb-6">
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Current Step Card */}
          <Card className="banking-card-elevated">
            <CardHeader className="px-4 sm:px-6 pb-3">
              <div className="flex items-center gap-3">
                <div className="step-indicator step-indicator-active flex-shrink-0">
                  {currentStep === STEPS.length ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    currentStep
                  )}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">
                    <BilingualText 
                      english={STEPS[currentStep - 1].title}
                      bengali={STEPS[currentStep - 1].titleBengali}
                    />
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    <BilingualText 
                      english="Please fill in the required information"
                      bengali="প্রয়োজনীয় তথ্য পূরণ করুন"
                    />
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {renderStep()}
            </CardContent>
          </Card>

          {/* Mobile Step Indicators */}
          <div className="lg:hidden mt-4">
            <div className="flex justify-center gap-1.5">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step.id === currentStep
                      ? "bg-primary w-4"
                      : step.id < currentStep
                      ? "bg-success"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
