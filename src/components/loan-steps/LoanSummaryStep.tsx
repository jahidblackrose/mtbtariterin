import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  User, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  Briefcase, 
  FileCheck, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  CheckCircle,
  XCircle,
  Building2
} from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import { useApplicationData } from "@/contexts/ApplicationDataContext";
import { loanApplicationApi } from "@/services/loanApplicationApi";
import { isSuccessResponse, getSessionContext } from "@/services/apiClient";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface LoanSummaryStepProps {
  onNext: () => void;
  data: any;
}

interface CollapsibleSectionProps {
  title: string;
  titleBengali: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
}

const CollapsibleSection = ({ 
  title, 
  titleBengali, 
  icon, 
  defaultOpen = false, 
  children,
  badge
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {icon}
              </div>
              <h4 className="font-semibold text-left">
                <BilingualText english={title} bengali={titleBengali} />
              </h4>
              {badge && (
                <Badge variant="secondary" className="ml-2">{badge}</Badge>
              )}
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="p-4 pt-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const LabelValue = ({ label, labelBn, value }: { label: string; labelBn: string; value?: string | null }) => (
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground">
      <BilingualText english={label} bengali={labelBn} />
    </p>
    <p className="text-sm font-medium">{value || "-"}</p>
  </div>
);

export const LoanSummaryStep = ({ onNext, data }: LoanSummaryStepProps) => {
  const { applicationData, mapFetchAllDataResponse } = useApplicationData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on mount if not already loaded
  useEffect(() => {
    const fetchData = async () => {
      if (applicationData.isDataLoaded && applicationData.personalData) {
        return; // Already loaded
      }

      setLoading(true);
      setError(null);

      try {
        const session = getSessionContext();
        const response = await loanApplicationApi.fetchAllData({
          applicationid: session.applicationId || "",
          cif: session.cif || "",
          apicode: "",
          modulename: "",
        });

        if (isSuccessResponse(response)) {
          mapFetchAllDataResponse(response, {
            applicationId: session.applicationId || "",
            accountNumber: session.accountNumber || "",
            customerId: session.customerId || "",
            profileStatus: "",
          });
        } else {
          setError(response.message || "Failed to load application data");
        }
      } catch (err: any) {
        console.error("Failed to fetch all data:", err);
        setError(err.message || "Failed to load application data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicationData.isDataLoaded, applicationData.personalData, mapFetchAllDataResponse]);

  const { personalData, contactData, professionalData, acMasterData, liabilityData, documentData } = applicationData;

  const loanPurposes: Record<string, { en: string; bn: string }> = {
    business: { en: "Business Expansion", bn: "ব্যবসা সম্প্রসারণ" },
    education: { en: "Education", bn: "শিক্ষা" },
    medical: { en: "Medical Emergency", bn: "চিকিৎসা জরুরি" },
    home: { en: "Home Improvement", bn: "বাড়ি উন্নতি" },
    marriage: { en: "Marriage/Wedding", bn: "বিবাহ/বিয়ে" },
    travel: { en: "Travel", bn: "ভ্রমণ" },
    debt: { en: "Debt Consolidation", bn: "ঋণ একীকরণ" },
    other: { en: "Others", bn: "অন্যান্য" },
    PL: { en: "Personal Loan", bn: "ব্যক্তিগত ঋণ" },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          <BilingualText english="Loading application data..." bengali="আবেদনের তথ্য লোড হচ্ছে..." />
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <XCircle className="w-8 h-8 text-destructive" />
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-semibold">
            <BilingualText english="Application Summary" bengali="আবেদনের সারসংক্ষেপ" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Please review all information before proceeding" 
              bengali="এগিয়ে যাওয়ার আগে সমস্ত তথ্য পর্যালোচনা করুন" 
            />
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <CollapsibleSection 
        title="Personal Information" 
        titleBengali="ব্যক্তিগত তথ্য"
        icon={<User className="w-4 h-4 text-primary" />}
        defaultOpen={true}
      >
        <div className="grid grid-cols-2 gap-4">
          <LabelValue 
            label="Full Name" 
            labelBn="পূর্ণ নাম" 
            value={personalData?.fullname || data.fullName} 
          />
          <LabelValue 
            label="Mobile Number" 
            labelBn="মোবাইল নম্বর" 
            value={personalData?.mobilenumber || data.mobileNumber} 
          />
          <LabelValue 
            label="Email" 
            labelBn="ইমেইল" 
            value={personalData?.email || data.email} 
          />
          <LabelValue 
            label="Date of Birth" 
            labelBn="জন্ম তারিখ" 
            value={personalData?.dob || data.dob} 
          />
          <LabelValue 
            label="Father's Name" 
            labelBn="পিতার নাম" 
            value={personalData?.fathername} 
          />
          <LabelValue 
            label="Mother's Name" 
            labelBn="মাতার নাম" 
            value={personalData?.mothername} 
          />
          <LabelValue 
            label="Gender" 
            labelBn="লিঙ্গ" 
            value={personalData?.gender} 
          />
          <LabelValue 
            label="Marital Status" 
            labelBn="বৈবাহিক অবস্থা" 
            value={personalData?.maritalstatus} 
          />
          <LabelValue 
            label="NID Number" 
            labelBn="এনআইডি নম্বর" 
            value={personalData?.nidnumber} 
          />
          <LabelValue 
            label="Profession" 
            labelBn="পেশা" 
            value={personalData?.profession || data.occupation} 
          />
        </div>
      </CollapsibleSection>

      {/* Contact Details */}
      <CollapsibleSection 
        title="Contact Details" 
        titleBengali="যোগাযোগের বিবরণ"
        icon={<MapPin className="w-4 h-4 text-primary" />}
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              <BilingualText english="Present Address" bengali="বর্তমান ঠিকানা" />
            </p>
            <div className="grid grid-cols-2 gap-4">
              <LabelValue 
                label="Address Line 1" 
                labelBn="ঠিকানা লাইন ১" 
                value={contactData?.presentaddr1 || data.presentAddress?.addressLine1} 
              />
              <LabelValue 
                label="Address Line 2" 
                labelBn="ঠিকানা লাইন ২" 
                value={contactData?.presentaddr2 || data.presentAddress?.addressLine2} 
              />
              <LabelValue 
                label="District" 
                labelBn="জেলা" 
                value={contactData?.presentdistrictname || contactData?.presentdistrict} 
              />
              <LabelValue 
                label="Thana/Upazila" 
                labelBn="থানা/উপজেলা" 
                value={contactData?.presentthananame || contactData?.presentthana} 
              />
              <LabelValue 
                label="Post Code" 
                labelBn="পোস্ট কোড" 
                value={contactData?.presentpostcode} 
              />
              <LabelValue 
                label="Country" 
                labelBn="দেশ" 
                value={contactData?.presentcountry || "Bangladesh"} 
              />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              <BilingualText english="Permanent Address" bengali="স্থায়ী ঠিকানা" />
            </p>
            <div className="grid grid-cols-2 gap-4">
              <LabelValue 
                label="Address Line 1" 
                labelBn="ঠিকানা লাইন ১" 
                value={contactData?.permanentaddr1 || data.permanentAddress?.addressLine1} 
              />
              <LabelValue 
                label="Address Line 2" 
                labelBn="ঠিকানা লাইন ২" 
                value={contactData?.permanentaddr2 || data.permanentAddress?.addressLine2} 
              />
              <LabelValue 
                label="District" 
                labelBn="জেলা" 
                value={contactData?.permanentdistrictname || contactData?.permanentdistrict} 
              />
              <LabelValue 
                label="Thana/Upazila" 
                labelBn="থানা/উপজেলা" 
                value={contactData?.permanentthananame || contactData?.permanentthana} 
              />
              <LabelValue 
                label="Post Code" 
                labelBn="পোস্ট কোড" 
                value={contactData?.permanentpostcode} 
              />
              <LabelValue 
                label="Country" 
                labelBn="দেশ" 
                value={contactData?.permanentcountry || "Bangladesh"} 
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Employment / Income */}
      <CollapsibleSection 
        title="Employment / Income" 
        titleBengali="কর্মসংস্থান / আয়"
        icon={<Briefcase className="w-4 h-4 text-primary" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <LabelValue 
            label="Profession Type" 
            labelBn="পেশার ধরন" 
            value={professionalData?.professiontype} 
          />
          <LabelValue 
            label="Employer Name" 
            labelBn="নিয়োগকর্তার নাম" 
            value={professionalData?.presentemployername} 
          />
          <LabelValue 
            label="Designation" 
            labelBn="পদবী" 
            value={professionalData?.designation} 
          />
          <LabelValue 
            label="Department" 
            labelBn="বিভাগ" 
            value={professionalData?.department} 
          />
          <LabelValue 
            label="Employment Status" 
            labelBn="কর্মসংস্থানের অবস্থা" 
            value={professionalData?.employementstatus} 
          />
          <LabelValue 
            label="Years in Current Job" 
            labelBn="বর্তমান চাকরিতে বছর" 
            value={professionalData?.currentprofyear ? `${professionalData.currentprofyear} years` : undefined} 
          />
          <LabelValue 
            label="Contact Phone" 
            labelBn="যোগাযোগের ফোন" 
            value={professionalData?.contactphoneno} 
          />
          <LabelValue 
            label="Employer Address" 
            labelBn="নিয়োগকর্তার ঠিকানা" 
            value={professionalData?.presentemployeraddr} 
          />
        </div>
      </CollapsibleSection>

      {/* Existing Loans */}
      <CollapsibleSection 
        title="Existing Loans" 
        titleBengali="বিদ্যমান ঋণ"
        icon={<CreditCard className="w-4 h-4 text-primary" />}
        badge={liabilityData?.length ? `${liabilityData.length}` : undefined}
      >
        {liabilityData && liabilityData.length > 0 ? (
          <div className="space-y-3">
            {liabilityData.map((liability, index) => (
              <div key={liability.liabilityid || index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{liability.bankname}</span>
                  </div>
                  <Badge variant="outline">{liability.loantype}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">৳{parseFloat(liability.loanamount || "0").toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Outstanding</p>
                    <p className="font-medium">৳{parseFloat(liability.outstanding || "0").toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">EMI</p>
                    <p className="font-medium">৳{parseFloat(liability.emi || "0").toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-primary" />
            <BilingualText 
              english="No existing loans with other banks" 
              bengali="অন্যান্য ব্যাংকের সাথে কোনো বিদ্যমান ঋণ নেই" 
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Other Bank Liabilities */}
      <CollapsibleSection 
        title="Other Bank Liabilities" 
        titleBengali="অন্যান্য ব্যাংক দায়"
        icon={<Building2 className="w-4 h-4 text-primary" />}
      >
        {data.existingLoans && data.existingLoans.length > 0 ? (
          <div className="space-y-3">
            {data.existingLoans.map((loan: any, index: number) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{loan.bankname || loan.bankName}</span>
                  <Badge variant="outline">{loan.loantype || loan.loanType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{loan.branchname || loan.branchName}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-primary" />
            <BilingualText 
              english="No other bank liability declared" 
              bengali="অন্য কোনো ব্যাংক দায় ঘোষণা করা হয়নি" 
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Documents & Declarations */}
      <CollapsibleSection 
        title="Documents & Declarations" 
        titleBengali="নথি ও ঘোষণা"
        icon={<FileCheck className="w-4 h-4 text-primary" />}
        badge={documentData?.length ? `${documentData.length}` : undefined}
      >
        {documentData && documentData.length > 0 ? (
          <div className="space-y-2">
            {documentData.map((doc, index) => (
              <div key={doc.documentid || index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary" />
                  <span className="text-sm">{doc.documentname || doc.documenttype}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {doc.status || "Uploaded"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            <BilingualText 
              english="Document verification pending" 
              bengali="নথি যাচাইকরণ মুলতুবি" 
            />
          </p>
        )}
      </CollapsibleSection>

      {/* Face Verification Status */}
      <CollapsibleSection 
        title="Face Verification Status" 
        titleBengali="মুখ যাচাইকরণ অবস্থা"
        icon={<User className="w-4 h-4 text-primary" />}
      >
        <div className="flex items-center gap-2">
          {data.faceVerified ? (
            <>
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">
                <BilingualText english="Face verified successfully" bengali="মুখ সফলভাবে যাচাই করা হয়েছে" />
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                <BilingualText english="Pending verification" bengali="যাচাইকরণ মুলতুবি" />
              </span>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Loan Details - Always visible */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-semibold text-primary">
              <BilingualText english="Loan Details" bengali="ঋণের বিবরণ" />
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                <BilingualText english="Loan Purpose" bengali="ঋণের উদ্দেশ্য" />
              </p>
              <p className="font-semibold">
                {acMasterData?.loanpurpose ? (
                  <BilingualText 
                    english={loanPurposes[acMasterData.loanpurpose]?.en || acMasterData.loanpurpose} 
                    bengali={loanPurposes[acMasterData.loanpurpose]?.bn || acMasterData.loanpurpose} 
                  />
                ) : (
                  <BilingualText 
                    english={loanPurposes[data.loanPurpose]?.en || "Personal Loan"} 
                    bengali={loanPurposes[data.loanPurpose]?.bn || "ব্যক্তিগত ঋণ"} 
                  />
                )}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
              </p>
              <p className="font-bold text-xl text-primary">
                ৳{parseFloat(acMasterData?.loanamount || data.loanAmount?.[0] || "0").toLocaleString()}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                <BilingualText english="Loan Tenure" bengali="ঋণের মেয়াদ" />
              </p>
              <p className="font-semibold">
                {acMasterData?.tenormonth || data.loanTenure?.[0] || "-"} <BilingualText english="months" bengali="মাস" />
              </p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                <BilingualText english="Monthly EMI" bengali="মাসিক ইএমআই" />
              </p>
              <p className="font-bold text-xl text-accent">
                ৳{parseFloat(acMasterData?.monthlyemi || data.emi || "0").toLocaleString()}
              </p>
            </div>
          </div>

          {(acMasterData?.interestrate || data.interestRate) && (
            <>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  <BilingualText english="Interest Rate" bengali="সুদের হার" />
                </span>
                <span className="font-semibold">
                  {acMasterData?.interestrate || data.interestRate}% <span className="text-sm">
                    <BilingualText english="per annum" bengali="বার্ষিক" />
                  </span>
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Important Note */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
        <p className="text-sm text-foreground">
          <strong>
            <BilingualText english="📋 Important:" bengali="📋 গুরুত্বপূর্ণ:" />
          </strong>{" "}
          <BilingualText 
            english="Please review all information carefully. After proceeding, you will need to complete face verification and accept terms & conditions." 
            bengali="সমস্ত তথ্য সাবধানে পর্যালোচনা করুন। এগিয়ে যাওয়ার পরে, আপনাকে মুখ যাচাইকরণ সম্পূর্ণ করতে এবং শর্তাবলী গ্রহণ করতে হবে।" 
          />
        </p>
      </div>
    </div>
  );
};
