import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { CompactStepHeader, FixedBottomCTA } from "@/components/pwa";
import { useIsMobile } from "@/hooks/use-mobile";
import { PersonalInfoStep } from "@/components/loan-steps/PersonalInfoStep";
import { AddressStep } from "@/components/loan-steps/AddressStep";
import { ExistingLoansStep } from "@/components/loan-steps/ExistingLoansStep";
import { LoanDetailsStep } from "@/components/loan-steps/LoanDetailsStep";
import { LoanSummaryStep } from "@/components/loan-steps/LoanSummaryStep";
import { FaceVerificationStep } from "@/components/loan-steps/FaceVerificationStep";
import { TermsConditionsStep } from "@/components/loan-steps/TermsConditionsStep";
import { ApplicationConfirmationStep } from "@/components/loan-steps/ApplicationConfirmationStep";
import { useApplicationData } from "@/contexts/ApplicationDataContext";
import { loanApplicationApi } from "@/services/loanApplicationApi";
import { isSuccessResponse, getSessionContext } from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, title: "Personal Info", titleBengali: "ব্যক্তিগত তথ্য" },
  { id: 2, title: "Address", titleBengali: "ঠিকানা" },
  { id: 3, title: "Other Bank Liability", titleBengali: "অন্যান্য ব্যাংক দায়" },
  { id: 4, title: "Loan Amount", titleBengali: "ঋণের পরিমাণ" },
  { id: 5, title: "Summary", titleBengali: "সারাংশ" },
  { id: 6, title: "Face Capture", titleBengali: "মুখ ক্যাপচার" },
  { id: 7, title: "Terms & Conditions", titleBengali: "শর্তাবলী" },
  { id: 8, title: "Confirmation", titleBengali: "নিশ্চিতকরণ" }
];

const LoanApplication = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepDirection, setStepDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { applicationData } = useApplicationData();

  // Transform context data for step components
  const prefilledData = useMemo(() => {
    const data: Record<string, any> = {
      isReadOnly: applicationData.isReadOnly,
      isDataLoaded: applicationData.isDataLoaded,
    };

    // Map personal data
    if (applicationData.personalData) {
      const p = applicationData.personalData;
      data.fullName = p.fullname || "";
      data.fatherName = p.fathername || "";
      data.motherName = p.mothername || "";
      data.dateOfBirth = p.dob || "";
      data.nidNumber = p.nidnumber || "";
      data.mobileNumber = p.mobilenumber || "";
      data.email = p.email || "";
      data.occupation = p.profession || "";
      data.gender = p.gender || "";
      data.maritalStatus = p.maritalstatus || "";
      data.spouseName = p.spousename || "";
      data.tin = p.tinnumber || "";
    }

    // Map contact/address data
    if (applicationData.contactData) {
      const c = applicationData.contactData;
      data.presentAddress = {
        addressLine1: c.presentaddr1 || "",
        addressLine2: c.presentaddr2 || "",
        country: c.presentcountry || "Bangladesh",
        district: c.presentdistrict || "",
        districtName: c.presentdistrictname || "",
        thana: c.presentthana || "",
        thanaName: c.presentthananame || "",
        postCode: c.presentpostcode || "",
      };
      data.permanentAddress = {
        addressLine1: c.permanentaddr1 || "",
        addressLine2: c.permanentaddr2 || "",
        country: c.permanentcountry || "Bangladesh",
        district: c.permanentdistrict || "",
        districtName: c.permanentdistrictname || "",
        thana: c.permanentthana || "",
        thanaName: c.permanentthananame || "",
        postCode: c.permanentpostcode || "",
      };
      data.professionalAddress = {
        addressLine1: c.professionaddr1 || "",
        addressLine2: c.professionaddr2 || "",
        country: c.professioncountry || "Bangladesh",
        district: c.professiondistrict || "",
        districtName: c.professiondistrictname || "",
        thana: c.professionthana || "",
        thanaName: c.professionthananame || "",
        postCode: c.professionpostcode || "",
      };
      data.communicationAddress = c.preferredcommunication || "present";
    }

    // Map liability data with status check
    if (applicationData.liabilityData && applicationData.liabilityData.length > 0) {
      data.existingLoans = applicationData.liabilityData;
      data.hasLiabilityData = true;
    } else {
      data.liabilityStatus = applicationData.hasLiabilityData ? "" : "608";
    }

    // Map loan details from acMasterData
    if (applicationData.acMasterData) {
      const l = applicationData.acMasterData;
      data.loanPurpose = l.loanpurpose || "";
      data.loanAmount = l.loanamount ? [parseInt(l.loanamount)] : [100000];
      data.loanTenure = l.tenormonth ? [parseInt(l.tenormonth)] : [12];
      data.emi = l.monthlyemi || "";
      data.interestRate = l.interestrate || "";
      data.appliedBranch = l.appliedbranch || "";
      data.productName = l.productname || "";
    }

    // Map document data
    if (applicationData.documentData && applicationData.documentData.length > 0) {
      data.documents = applicationData.documentData;
    }

    return data;
  }, [applicationData]);

  // Handle navigation to next step
  const handleNext = useCallback(async (stepData?: any) => {
    if (currentStep < STEPS.length) {
      setStepDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  // Handle back navigation
  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setStepDirection(-1);
      setCurrentStep(prev => prev - 1);
    } else {
      navigate("/dashboard");
    }
  }, [currentStep, navigate]);

  // Handle final submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const session = getSessionContext();
      const response = await loanApplicationApi.submitApplication({
        applicationid: session.applicationId || applicationData.applicationId,
      });

      if (isSuccessResponse(response)) {
        toast({
          title: "Application Submitted",
          description: "Your loan application has been submitted successfully!",
        });
        setCurrentStep(8); // Move to confirmation
      } else {
        throw new Error(response.message || "Failed to submit application");
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [applicationData.applicationId]);

  const renderStep = () => {
    const stepProps = { 
      onNext: handleNext, 
      data: prefilledData,
      isReadOnly: applicationData.isReadOnly,
    };
    
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
        return <TermsConditionsStep {...stepProps} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      case 8:
        return <ApplicationConfirmationStep data={prefilledData} />;
      default:
        return <PersonalInfoStep {...stepProps} />;
    }
  };

  // Get current step title for header
  const currentStepTitle = STEPS[currentStep - 1];

  // Determine if we should show the bottom CTA
  const showBottomCTA = currentStep !== 8 && currentStep !== 7 && !(isMobile && currentStep === 6);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact Header with Circular Progress */}
      <CompactStepHeader
        title={{ english: currentStepTitle.title, bengali: currentStepTitle.titleBengali }}
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onBack={handlePrevious}
        onClose={() => navigate("/dashboard")}
      />

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="max-w-lg mx-auto px-4 py-4">

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
                      {applicationData.isReadOnly ? (
                        <BilingualText 
                          english="Review your information"
                          bengali="আপনার তথ্য পর্যালোচনা করুন"
                        />
                      ) : (
                        <BilingualText 
                          english="Please fill in the required information"
                          bengali="প্রয়োজনীয় তথ্য পূরণ করুন"
                        />
                      )}
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

      {/* Fixed Bottom CTA - Only for navigation steps (not Terms or Confirmation) */}
      {showBottomCTA && (
        <FixedBottomCTA
          primaryLabel={{ english: "Next", bengali: "পরবর্তী" }}
          onPrimaryClick={() => handleNext()}
          primaryLoading={isLoading}
          secondaryLabel={currentStep > 1 ? { english: "Back", bengali: "পিছনে" } : undefined}
          onSecondaryClick={currentStep > 1 ? handlePrevious : undefined}
        />
      )}
    </div>
  );
};

export default LoanApplication;
