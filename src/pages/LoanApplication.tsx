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
  { id: 8, title: "Done", titleBengali: "সম্পন্ন" }
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handlePrevious}
              className="text-white hover:bg-white/20 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-sm hidden sm:inline">
                <BilingualText english="Back" bengali="পিছনে" />
              </span>
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg p-1.5 shadow-sm">
                <img src={mtbLogoFull} alt="MTB Logo" className="h-6 md:h-7 w-auto" />
              </div>
              <div className="text-white">
                <h1 className="text-sm md:text-base font-semibold leading-tight">
                  <BilingualText english="Tarit Loan" bengali="তরিৎ ঋণ" />
                </h1>
                <p className="text-xs text-white/80">
                  <BilingualText 
                    english={`Step ${currentStep}/${STEPS.length}`}
                    bengali={`ধাপ ${currentStep}/${STEPS.length}`}
                  />
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <LanguageToggle variant="compact" className="bg-white/20 text-white rounded-full" />
              <ThemeToggle variant="header" />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-1.5 bg-white/20" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Step Indicators - Desktop */}
        <div className="hidden lg:block mb-6">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Mobile Step Info */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-center gap-1.5">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  step.id === currentStep
                    ? "bg-mtb-teal w-6"
                    : step.id < currentStep
                    ? "bg-mtb-success"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Step Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                currentStep === STEPS.length 
                  ? 'bg-mtb-success' 
                  : 'bg-mtb-teal'
              }`}>
                {currentStep === STEPS.length ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  currentStep
                )}
              </div>
              <div>
                <CardTitle className="text-lg">
                  <BilingualText 
                    english={STEPS[currentStep - 1].title}
                    bengali={STEPS[currentStep - 1].titleBengali}
                  />
                </CardTitle>
                <CardDescription>
                  <BilingualText 
                    english="Complete this step to proceed"
                    bengali="এগিয়ে যেতে এই ধাপটি সম্পূর্ণ করুন"
                  />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoanApplication;
