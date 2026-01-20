import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Plus, Trash2, CheckCircle2, Building2 } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loanApplicationApi, BankData, BranchData, LiabilityData, DistrictData } from "@/services/loanApplicationApi";
import { isSuccessResponse, getSessionContext } from "@/services/apiClient";
import { toast } from "sonner";

interface ExistingLoansStepProps {
  onNext: (data: any) => void;
  data: any;
  isReadOnly?: boolean;
}

interface LiabilityFormData {
  loanType: string;
  bankCode: string;
  bankName: string;
  branchCode: string;
  branchName: string;
  districtCode: string;
  districtName: string;
}

const defaultLiabilityForm: LiabilityFormData = {
  loanType: "",
  bankCode: "",
  bankName: "",
  branchCode: "",
  branchName: "",
  districtCode: "",
  districtName: "",
};

const loanTypes = [
  { code: "PL", name: "Personal Loan" },
  { code: "HL", name: "Home Loan" },
  { code: "AL", name: "Auto Loan" },
  { code: "EL", name: "Education Loan" },
  { code: "CC", name: "Credit Card" },
  { code: "OD", name: "Overdraft" },
];

export const ExistingLoansStep = ({ onNext, data, isReadOnly = false }: ExistingLoansStepProps) => {
  // Check if liability data has status 608 (Not Applicable)
  const hasLiabilityStatus608 = data.liabilityStatus === "608";
  
  const [formData, setFormData] = useState({
    hasExistingLoans: data.hasExistingLoans || false,
    notApplicable: hasLiabilityStatus608 || data.notApplicable || false,
    existingLoans: data.existingLoans || []
  });

  // Liability form state
  const [liabilityForm, setLiabilityForm] = useState<LiabilityFormData>(defaultLiabilityForm);
  const [liabilities, setLiabilities] = useState<LiabilityData[]>(
    data.existingLoans || []
  );
  const [showAddForm, setShowAddForm] = useState(false);

  // Master data state
  const [banks, setBanks] = useState<BankData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [districts, setDistricts] = useState<DistrictData[]>([]);

  // Loading states
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [completingNoLiability, setCompletingNoLiability] = useState(false);

  // Load existing liabilities from API on mount
  useEffect(() => {
    const loadLiabilities = async () => {
      setLoadingInitial(true);
      try {
        const session = getSessionContext();
        const response = await loanApplicationApi.getOtherBankLiability(session.applicationId || "");
        
        if (isSuccessResponse(response) && response.dataList && response.dataList.length > 0) {
          // Filter out "No record found" entries
          const validLiabilities = response.dataList.filter(
            (item: any) => item.status !== "608" && item.status !== "No record found"
          );
          setLiabilities(validLiabilities);
          setFormData(prev => ({ ...prev, notApplicable: false }));
        } else {
          setLiabilities([]);
          // Check if status 608 means no record
          if (hasLiabilityStatus608) {
            setFormData(prev => ({ ...prev, notApplicable: true }));
          }
        }
      } catch (error) {
        console.error("Failed to load liabilities:", error);
        setLiabilities([]);
      } finally {
        setLoadingInitial(false);
      }
    };

    // Use prefilled data if available, otherwise load from API
    if (data.existingLoans && data.existingLoans.length > 0) {
      setLiabilities(data.existingLoans);
      setLoadingInitial(false);
    } else if (!isReadOnly) {
      loadLiabilities();
    } else {
      setLoadingInitial(false);
    }
  }, [data.existingLoans, hasLiabilityStatus608, isReadOnly]);

  // Load banks when showing add form
  useEffect(() => {
    const loadBanks = async () => {
      if (!showAddForm || banks.length > 0 || isReadOnly) return;
      
      setLoadingBanks(true);
      try {
        const response = await loanApplicationApi.getBankList();
        if (isSuccessResponse(response) && response.dataList) {
          setBanks(response.dataList);
        }
      } catch (error) {
        console.error("Failed to load banks:", error);
        toast.error("Failed to load bank list");
      } finally {
        setLoadingBanks(false);
      }
    };
    loadBanks();
  }, [showAddForm, banks.length, isReadOnly]);

  // Load districts when showing add form
  useEffect(() => {
    const loadDistricts = async () => {
      if (!showAddForm || districts.length > 0 || isReadOnly) return;
      
      setLoadingDistricts(true);
      try {
        const response = await loanApplicationApi.getDistrictList();
        if (isSuccessResponse(response) && response.dataList) {
          setDistricts(response.dataList);
        }
      } catch (error) {
        console.error("Failed to load districts:", error);
        toast.error("Failed to load district list");
      } finally {
        setLoadingDistricts(false);
      }
    };
    loadDistricts();
  }, [showAddForm, districts.length, isReadOnly]);

  // Load branches when bank changes
  const loadBranches = useCallback(async (bankCode: string) => {
    if (!bankCode) return;
    
    setLoadingBranches(true);
    setBranches([]);
    try {
      const response = await loanApplicationApi.getBankBranchList(bankCode);
      if (isSuccessResponse(response) && response.dataList) {
        setBranches(response.dataList);
      }
    } catch (error) {
      console.error("Failed to load branches:", error);
      toast.error("Failed to load branch list");
    } finally {
      setLoadingBranches(false);
    }
  }, []);

  const handleLoanTypeChange = (loanType: string) => {
    setLiabilityForm(prev => ({
      ...prev,
      loanType
    }));
  };

  const handleBankChange = (bankCode: string) => {
    const selectedBank = banks.find(b => b.bankcode === bankCode);
    setLiabilityForm(prev => ({
      ...prev,
      bankCode,
      bankName: selectedBank?.bankname || "",
      branchCode: "",
      branchName: ""
    }));
    loadBranches(bankCode);
  };

  const handleBranchChange = (branchCode: string) => {
    const selectedBranch = branches.find(b => b.branchcode === branchCode);
    setLiabilityForm(prev => ({
      ...prev,
      branchCode,
      branchName: selectedBranch?.branchname || ""
    }));
  };

  const handleDistrictChange = (districtCode: string) => {
    const selectedDistrict = districts.find(d => d.districtcode === districtCode);
    setLiabilityForm(prev => ({
      ...prev,
      districtCode,
      districtName: selectedDistrict?.districtname || ""
    }));
  };

  // Save liability via API
  const handleAddOrUpdate = async () => {
    if (!liabilityForm.loanType || !liabilityForm.bankCode || !liabilityForm.branchCode || !liabilityForm.districtCode) {
      toast.error("Please fill in all required fields (Loan Type, Bank, Branch, District)");
      return;
    }

    setSubmitting(true);
    try {
      const session = getSessionContext();
      
      const payload = {
        liabilityid: "",
        applicationid: session.applicationId || "",
        bankname: liabilityForm.bankCode,
        branchname: liabilityForm.branchCode,
        loantype: liabilityForm.loanType,
        loanamount: "0",
        outstanding: "0",
        emi: "0",
        liabilitytype: "L" as const,
      };

      const response = await loanApplicationApi.saveOtherBankLiability(payload);
      
      if (isSuccessResponse(response)) {
        toast.success("Liability added successfully");
        
        // Reload liabilities from API
        const refreshResponse = await loanApplicationApi.getOtherBankLiability(session.applicationId || "");
        if (isSuccessResponse(refreshResponse) && refreshResponse.dataList) {
          const validLiabilities = refreshResponse.dataList.filter(
            (item: any) => item.status !== "608" && item.status !== "No record found"
          );
          setLiabilities(validLiabilities);
        }
        
        // Reset form
        setLiabilityForm(defaultLiabilityForm);
        setShowAddForm(false);
        setBranches([]);
      } else {
        throw new Error(response.message || "Failed to save liability");
      }
    } catch (error: any) {
      console.error("Failed to save liability:", error);
      toast.error(error.message || "Failed to save liability");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete liability via API
  const handleDelete = async (liabilityId: string) => {
    setDeletingId(liabilityId);
    try {
      const session = getSessionContext();
      const response = await loanApplicationApi.deleteOtherBankLiability(liabilityId, session.applicationId || "");
      
      if (isSuccessResponse(response)) {
        toast.success("Liability deleted successfully");
        setLiabilities(prev => prev.filter(l => l.liabilityid !== liabilityId));
      } else {
        throw new Error(response.message || "Failed to delete liability");
      }
    } catch (error: any) {
      console.error("Failed to delete liability:", error);
      toast.error(error.message || "Failed to delete liability");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle no liability - call complete API
  const handleNoLiabilityComplete = async () => {
    setCompletingNoLiability(true);
    try {
      const session = getSessionContext();
      const response = await loanApplicationApi.saveOtherBankLiabilityComplete(session.applicationId || "");
      
      if (isSuccessResponse(response)) {
        toast.success("Confirmed: No other bank liability");
        onNext({ noLiability: true, liabilities: [] });
      } else {
        throw new Error(response.message || "Failed to confirm");
      }
    } catch (error: any) {
      console.error("Failed to complete no liability:", error);
      toast.error(error.message || "Failed to confirm");
    } finally {
      setCompletingNoLiability(false);
    }
  };

  const handleNext = async () => {
    if (formData.notApplicable && liabilities.length === 0) {
      await handleNoLiabilityComplete();
    } else {
      onNext({
        ...formData,
        liabilities
      });
    }
  };

  // Expose handleNext for parent component
  useEffect(() => {
    (window as any).__existingLoansStepSave = handleNext;
    return () => {
      delete (window as any).__existingLoansStepSave;
    };
  }, [handleNext]);

  if (loadingInitial) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading liabilities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm">
            <BilingualText english="Other Bank Liability" bengali="অন্য ব্যাংকের দায়" />
          </h3>
          <p className="text-xs text-muted-foreground">
            {isReadOnly ? (
              <BilingualText 
                english="Your existing liabilities from bank records" 
                bengali="ব্যাংক রেকর্ড থেকে আপনার বিদ্যমান দায়" 
              />
            ) : (
              <BilingualText 
                english="Please provide details if you have any loans from other banks" 
                bengali="অন্য ব্যাংক থেকে আপনার কোনো ঋণ থাকলে বিস্তারিত প্রদান করুন" 
              />
            )}
          </p>
        </div>
      </div>

      {/* No Liability Checkbox - Show only when no liabilities exist and not adding */}
      {liabilities.length === 0 && !showAddForm && !isReadOnly && (
        <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg border border-border/50">
          <Checkbox
            id="notApplicable"
            checked={formData.notApplicable}
            disabled={isReadOnly || completingNoLiability}
            onCheckedChange={(checked) => setFormData(prev => ({ 
              ...prev, 
              notApplicable: checked as boolean 
            }))}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <label htmlFor="notApplicable" className="text-sm font-medium cursor-pointer">
              <BilingualText 
                english="Not Applicable" 
                bengali="প্রযোজ্য নয়" 
              />
            </label>
            <p className="text-xs text-muted-foreground">
              <BilingualText 
                english="Check this if you have no existing loans from other banks" 
                bengali="অন্য ব্যাংক থেকে কোনো ঋণ না থাকলে এটি চেক করুন" 
              />
            </p>
          </div>
        </div>
      )}
      
      {/* Show Not Applicable status in read-only mode */}
      {isReadOnly && formData.notApplicable && (
        <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/30">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="text-sm font-medium text-success">
            <BilingualText 
              english="No other bank liability declared" 
              bengali="অন্য কোনো ব্যাংক দায় ঘোষণা করা হয়নি" 
            />
          </span>
        </div>
      )}

      {!formData.notApplicable && (
        <>
          {/* Add New Button - Show when not adding and has no form open */}
          {!showAddForm && !isReadOnly && (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              <BilingualText english="Add Bank Liability" bengali="ব্যাংক দায় যোগ করুন" />
            </Button>
          )}
          
          {/* Liability Form - Only show when adding */}
          {showAddForm && !isReadOnly && (
            <div className="bg-muted/30 p-4 rounded-lg space-y-4 border border-border/50">
              <div className="flex items-center justify-between pb-2 border-b border-border/30">
                <h4 className="font-medium text-sm">
                  <BilingualText english="Add New Liability" bengali="নতুন দায় যোগ করুন" />
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setLiabilityForm(defaultLiabilityForm);
                    setBranches([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
              
              {/* Loan Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  <BilingualText english="Loan Type *" bengali="ঋণের ধরন *" />
                </Label>
                <Select
                  value={liabilityForm.loanType}
                  onValueChange={handleLoanTypeChange}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="-- Select Loan Type --" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {loanTypes.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  <BilingualText english="Bank Name *" bengali="ব্যাংকের নাম *" />
                </Label>
                <Select
                  value={liabilityForm.bankCode}
                  onValueChange={handleBankChange}
                >
                  <SelectTrigger className="bg-muted/30">
                    {loadingBanks ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading banks...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="-- Select Bank --" />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50 max-h-60">
                    {banks.map((bank) => (
                      <SelectItem key={bank.bankcode} value={bank.bankcode}>
                        {bank.bankname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  <BilingualText english="Branch Name *" bengali="শাখার নাম *" />
                </Label>
                <Select
                  value={liabilityForm.branchCode}
                  onValueChange={handleBranchChange}
                  disabled={!liabilityForm.bankCode}
                >
                  <SelectTrigger className="bg-muted/30">
                    {loadingBranches ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading branches...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder={liabilityForm.bankCode ? "-- Select Branch --" : "Select Bank first"} />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50 max-h-60">
                    {branches.map((branch) => (
                      <SelectItem key={branch.branchcode} value={branch.branchcode}>
                        {branch.branchname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  <BilingualText english="District *" bengali="জেলা *" />
                </Label>
                <Select
                  value={liabilityForm.districtCode}
                  onValueChange={handleDistrictChange}
                >
                  <SelectTrigger className="bg-muted/30">
                    {loadingDistricts ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading districts...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="-- Select District --" />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50 max-h-60">
                    {districts.map((district) => (
                      <SelectItem key={district.districtcode} value={district.districtcode}>
                        {district.districtname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Button */}
              <Button
                type="button"
                onClick={handleAddOrUpdate}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Save Liability
              </Button>
            </div>
          )}

          {/* Liabilities List */}
          {liabilities.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-primary">
                <BilingualText 
                  english={isReadOnly ? "Existing Liabilities" : "Added Liabilities"} 
                  bengali={isReadOnly ? "বিদ্যমান দায়" : "যোগ করা দায়"} 
                />
              </h4>
              
              {liabilities.map((liability) => (
                <div key={liability.liabilityid} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-sm">{liability.bankname}</h5>
                        <Badge variant="outline" className="text-xs">{liability.loantype}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {liability.branchname}
                      </p>
                    </div>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(liability.liabilityid)}
                        disabled={deletingId === liability.liabilityid}
                        className="text-destructive hover:text-destructive/90 h-8 w-8"
                      >
                        {deletingId === liability.liabilityid ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Show "No Liabilities" message in read-only mode when empty */}
          {isReadOnly && liabilities.length === 0 && !formData.notApplicable && (
            <div className="p-4 bg-muted/30 rounded-lg text-center text-muted-foreground">
              <BilingualText 
                english="No existing bank liabilities found." 
                bengali="কোনো বিদ্যমান ব্যাংক দায় পাওয়া যায়নি।" 
              />
            </div>
          )}
        </>
      )}

      <Separator />

      {/* Information Note */}
      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">
              <BilingualText english="Important Information" bengali="গুরুত্বপূর্ণ তথ্য" />
            </p>
            <p className="text-xs text-muted-foreground">
              <BilingualText 
                english="Your existing loan information helps us assess your eligibility and determine the best loan terms for you." 
                bengali="আপনার বিদ্যমান ঋণের তথ্য আমাদের আপনার যোগ্যতা মূল্যায়ন এবং আপনার জন্য সর্বোত্তম ঋণের শর্তাবলী নির্ধারণ করতে সহায়তা করে।" 
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
