import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Plus, Trash2, Lock } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loanApplicationApi, BankData, BranchData, LiabilityData } from "@/services/loanApplicationApi";
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
  district: string;
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
  district: "",
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
    // Pre-populate liabilities from data if available
    data.existingLoans || []
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  // Master data state
  const [banks, setBanks] = useState<BankData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);

  // Loading states
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load banks on mount (only if not read-only)
  useEffect(() => {
    if (isReadOnly) return;
    
    const loadBanks = async () => {
      setLoadingBanks(true);
      try {
        const response = await loanApplicationApi.getBankList();
        if (response.status === "S" && response.dataList) {
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
  }, [isReadOnly]);

  // Load branches when bank changes
  const loadBranches = async (bankCode: string) => {
    setLoadingBranches(true);
    setBranches([]);
    try {
      const response = await loanApplicationApi.getBankBranchList(bankCode);
      if (response.status === "S" && response.dataList) {
        setBranches(response.dataList);
      }
    } catch (error) {
      console.error("Failed to load branches:", error);
      toast.error("Failed to load branch list");
    } finally {
      setLoadingBranches(false);
    }
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

  const handleInputChange = (field: keyof LiabilityFormData, value: string) => {
    setLiabilityForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOrUpdate = async () => {
    if (!liabilityForm.bankCode || !liabilityForm.branchCode || !liabilityForm.loanType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    // For now, just add to local state (API call will be done on form submit)
    const newLiability: LiabilityData = {
      liabilityid: editingId || Date.now().toString(),
      applicationid: "",
      bankname: liabilityForm.bankName,
      bankcode: liabilityForm.bankCode,
      branchname: liabilityForm.branchName,
      branchcode: liabilityForm.branchCode,
      loantype: liabilityForm.loanType,
      loanamount: liabilityForm.loanAmount,
      outstanding: liabilityForm.outstanding,
      emi: liabilityForm.emi,
      liabilitytype: "L"
    };

    if (editingId) {
      setLiabilities(prev => prev.map(l => l.liabilityid === editingId ? newLiability : l));
      setEditingId(null);
    } else {
      setLiabilities(prev => [...prev, newLiability]);
    }

    setLiabilityForm(defaultLiabilityForm);
    setBranches([]);
    setSubmitting(false);
    toast.success(editingId ? "Liability updated" : "Liability added");
  };

  const handleDelete = (liabilityId: string) => {
    setLiabilities(prev => prev.filter(l => l.liabilityid !== liabilityId));
    toast.success("Liability removed");
  };

  const handleNext = () => {
    onNext({
      ...formData,
      liabilities
    });
  };

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

      {/* Not Applicable Checkbox - Only show if not read-only, or if it's checked */}
      {(formData.notApplicable || !isReadOnly) && (
        <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
          <Checkbox
            id="notApplicable"
            checked={formData.notApplicable}
            disabled={isReadOnly}
            onCheckedChange={(checked) => !isReadOnly && setFormData(prev => ({ 
              ...prev, 
              notApplicable: checked as boolean 
            }))}
          />
          <label htmlFor="notApplicable" className={`text-sm font-medium ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
            <BilingualText 
              english="Not Applicable" 
              bengali="প্রযোজ্য নয়" 
            />
          </label>
        </div>
      )}

      {!formData.notApplicable && (
        <>
          {/* Liability Form - Only show if not read-only */}
          {!isReadOnly && (
          <div className="bg-secondary/20 p-4 rounded-lg space-y-4">
            {/* Row 1: Loan Type, Bank Name, Branch Name, District */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Loan Type</Label>
                <Select
                  value={liabilityForm.loanType}
                  onValueChange={(value) => handleInputChange("loanType", value)}
                >
                  <SelectTrigger className="bg-secondary/30 border-secondary">
                    <SelectValue placeholder="Select Loan Type" />
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
