import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Plus, Trash2, Lock, CheckCircle2 } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loanApplicationApi, BankData, BranchData, LiabilityData } from "@/services/loanApplicationApi";
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
  loanAmount: string;
  outstanding: string;
  emi: string;
}

const defaultLiabilityForm: LiabilityFormData = {
  loanType: "",
  bankCode: "",
  bankName: "",
  branchCode: "",
  branchName: "",
  loanAmount: "",
  outstanding: "",
  emi: "",
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Master data state
  const [banks, setBanks] = useState<BankData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);

  // Loading states
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
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

  const handleInputChange = (field: keyof LiabilityFormData, value: string) => {
    setLiabilityForm(prev => ({ ...prev, [field]: value }));
  };

  // Save liability via API
  const handleAddOrUpdate = async () => {
    if (!liabilityForm.bankCode || !liabilityForm.branchCode || !liabilityForm.loanType || !liabilityForm.loanAmount) {
      toast.error("Please fill in all required fields (Bank, Branch, Loan Type, Amount)");
      return;
    }

    setSubmitting(true);
    try {
      const session = getSessionContext();
      
      const payload = {
        liabilityid: editingId || "",
        applicationid: session.applicationId || "",
        bankname: liabilityForm.bankCode, // API expects code in bankname field
        branchname: liabilityForm.branchCode, // API expects code in branchname field
        loantype: liabilityForm.loanType,
        loanamount: liabilityForm.loanAmount,
        outstanding: liabilityForm.outstanding || "0",
        emi: liabilityForm.emi || "0",
        liabilitytype: "L" as const,
      };

      const response = await loanApplicationApi.saveOtherBankLiability(payload);
      
      if (isSuccessResponse(response)) {
        toast.success(editingId ? "Liability updated successfully" : "Liability added successfully");
        
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
        setEditingId(null);
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
    <div className="space-y-6">
      {/* Header Card - Other Bank Liability */}
      <div className="flex items-start justify-between p-4 bg-card rounded-xl border border-border/50 shadow-sm">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            <BilingualText english="Other Bank Liability" bengali="অন্য ব্যাংকের দায়" />
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isReadOnly ? (
              <BilingualText 
                english="Your existing liabilities from bank records" 
                bengali="ব্যাংক রেকর্ড থেকে আপনার বিদ্যমান দায়" 
              />
            ) : (
              <BilingualText 
                english="Please provide details if you have any loans you have taken from others banks" 
                bengali="অন্য ব্যাংক থেকে আপনার কোনো ঋণ থাকলে বিস্তারিত প্রদান করুন" 
              />
            )}
          </p>
        </div>
        {isReadOnly ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded ml-4 flex-shrink-0">
            <Lock className="w-3 h-3" />
            <span>Read-only</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border-2 border-primary ml-4 flex-shrink-0">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>

      {/* No Liability Checkbox - Show only when no liabilities exist and not adding */}
      {liabilities.length === 0 && !showAddForm && !isReadOnly && (
        <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-xl border border-border/50">
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
                english="I do not have any other bank liability" 
                bengali="আমার অন্য কোনো ব্যাংকের দায় নেই" 
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
          <div className="bg-secondary/20 p-4 rounded-lg space-y-4 border border-primary/30">
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
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
            
            {/* Bank Name */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                <BilingualText english="Bank Name *" bengali="ব্যাংকের নাম *" />
              </Label>
              <Select
                value={liabilityForm.bankCode}
                onValueChange={handleBankChange}
              >
                <SelectTrigger className="bg-secondary/30 border-secondary">
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
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                <BilingualText english="Branch Name *" bengali="শাখার নাম *" />
              </Label>
              <Select
                value={liabilityForm.branchCode}
                onValueChange={handleBranchChange}
                disabled={!liabilityForm.bankCode}
              >
                <SelectTrigger className="bg-secondary/30 border-secondary">
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

            {/* Loan Type */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                <BilingualText english="Loan Type *" bengali="ঋণের ধরন *" />
              </Label>
              <Select
                value={liabilityForm.loanType}
                onValueChange={(value) => handleInputChange("loanType", value)}
              >
                <SelectTrigger className="bg-secondary/30 border-secondary">
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

              <div className="space-y-2">
                <Label className="text-xs font-medium">Bank Name</Label>
                <Select
                  value={liabilityForm.bankCode}
                  onValueChange={handleBankChange}
                >
                  <SelectTrigger className="bg-secondary/30 border-secondary">
                    {loadingBanks ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="--Select Bank Name--" />
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

              <div className="space-y-2">
                <Label className="text-xs font-medium">Branch Name</Label>
                <Select
                  value={liabilityForm.branchCode}
                  onValueChange={handleBranchChange}
                  disabled={!liabilityForm.bankCode}
                >
                  <SelectTrigger className="bg-secondary/30 border-secondary">
                    {loadingBranches ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder={liabilityForm.bankCode ? "--Select Branch Name--" : "Select Bank first"} />
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

              <div className="space-y-2">
                <Label className="text-xs font-medium">District</Label>
                <Select
                  value={liabilityForm.district}
                  onValueChange={(value) => handleInputChange("district", value)}
                >
                  <SelectTrigger className="bg-secondary/30 border-secondary">
                    <SelectValue placeholder="-- Select District --" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    <SelectItem value="dhaka">Dhaka</SelectItem>
                    <SelectItem value="chittagong">Chittagong</SelectItem>
                    <SelectItem value="sylhet">Sylhet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleAddOrUpdate}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editingId ? "UPDATE" : "ADD/UPDATE"}
              </Button>
            </div>
          </div>
          )}

          {/* Liabilities List - Show in read-only mode with prefilled data or in edit mode */}
          {liabilities.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-primary">
                <BilingualText english={isReadOnly ? "Existing Liabilities" : "Added Liabilities"} bengali={isReadOnly ? "বিদ্যমান দায়" : "যোগ করা দায়"} />
              </h4>
              
              {liabilities.map((liability) => (
                <div key={liability.liabilityid} className="p-4 rounded-lg border bg-card/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold">{liability.bankname}</h5>
                        <Badge variant="outline">{liability.loantype}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {liability.branchname}
                      </p>
                    </div>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(liability.liabilityid)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Loan Amount</p>
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
            <p className="text-muted-foreground">
              <BilingualText 
                english="Your existing loan information helps us assess your eligibility and determine the best loan terms for you. All information will be verified through credit bureau reports." 
                bengali="আপনার বিদ্যমান ঋণের তথ্য আমাদের আপনার যোগ্যতা মূল্যায়ন এবং আপনার জন্য সর্বোত্তম ঋণের শর্তাবলী নির্ধারণ করতে সহায়তা করে। সমস্ত তথ্য ক্রেডিট ব্যুরো রিপোর্টের মাধ্যমে যাচাই করা হবে।" 
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
