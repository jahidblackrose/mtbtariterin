import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
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
import mtbLogo from "@/assets/mtb-logo-full.png";

const STEPS = [
  { id: 1, title: "Personal Info", titleBengali: "ব্যক্তিগত তথ্য" },
  { id: 2, title: "Address Details", titleBengali: "ঠিকানার বিবরণ" },
  { id: 3, title: "Existing Loans", titleBengali: "বিদ্যমান ঋণ" },
  { id: 4, title: "Loan Details", titleBengali: "ঋণের বিবরণ" },
  { id: 5, title: "Summary", titleBengali: "সারসংক্ষেপ" },
  { id: 6, title: "Face Verification", titleBengali: "মুখ যাচাইকরণ" },
  { id: 7, title: "Terms & Conditions", titleBengali: "শর্তাবলী" },
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
    <div className="min-h-screen tech-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="banking-container py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handlePrevious}
              className="p-0 h-auto hover:bg-transparent text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <BilingualText english="Back" bengali="পিছনে" />
            </Button>
            
            <div className="text-center flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <img src={mtbLogo} alt="MTB Logo" className="h-8" />
              </div>
              <div className="mline-separator-vertical h-8"></div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  <BilingualText english="Loan Application" bengali="ঋণের আবেদন" />
                </h1>
                <p className="text-sm text-muted-foreground">
                  <BilingualText 
                    english={`Step ${currentStep} of ${STEPS.length}`}
                    bengali={`ধাপ ${currentStep} এর ${STEPS.length}`}
                  />
                </p>
              </div>
            </div>
            
            <ThemeToggle />
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2 bg-muted" />
          </div>
        </div>
      </header>

      <div className="banking-container py-6">
        <div className="max-w-4xl mx-auto">
          {/* Step Indicators - Desktop */}
          <div className="hidden lg:block mb-8">
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Current Step Card */}
          <Card className="banking-card-glass border-border/50">
            <CardHeader className="border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === STEPS.length 
                    ? 'bg-mtb-success text-white' 
                    : 'bg-gradient-to-r from-mtb-teal to-mtb-green text-white'
                }`}>
                  {currentStep === STEPS.length ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    currentStep
                  )}
                </div>
                <div>
                  <CardTitle className="text-foreground">
                    <BilingualText 
                      english={STEPS[currentStep - 1].title}
                      bengali={STEPS[currentStep - 1].titleBengali}
                    />
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    <BilingualText 
                      english="Please fill in the required information"
                      bengali="প্রয়োজনীয় তথ্য পূরণ করুন"
                    />
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {renderStep()}
            </CardContent>
          </Card>

          {/* Mobile Step Indicators */}
          <div className="lg:hidden mt-6">
            <div className="flex justify-center gap-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step.id === currentStep
                      ? "bg-mtb-teal scale-125"
                      : step.id < currentStep
                      ? "bg-mtb-green"
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
