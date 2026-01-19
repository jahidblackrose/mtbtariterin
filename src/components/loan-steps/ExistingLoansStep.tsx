import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, Lock } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loanApplicationApi, BankData, BranchData, LiabilityData } from "@/services/loanApplicationApi";
import { getSessionContext } from "@/services/apiClient";
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
}

const defaultLiabilityForm: LiabilityFormData = {
  loanType: "",
  bankCode: "",
  bankName: "",
  branchCode: "",
  branchName: "",
  district: "",
};

const loanTypes = [
  { code: "Personal Loan", name: "Personal Loan" },
  { code: "Home Loan", name: "Home Loan" },
  { code: "Auto Loan", name: "Auto Loan" },
  { code: "Education Loan", name: "Education Loan" },
  { code: "Credit Card", name: "Credit Card" },
  { code: "Overdraft", name: "Overdraft" },
];

const districts = [
  { code: "Dhaka", name: "Dhaka" },
  { code: "Chittagong", name: "Chittagong" },
  { code: "Sylhet", name: "Sylhet" },
  { code: "Rajshahi", name: "Rajshahi" },
  { code: "Khulna", name: "Khulna" },
  { code: "Barisal", name: "Barisal" },
  { code: "Rangpur", name: "Rangpur" },
  { code: "Mymensingh", name: "Mymensingh" },
  { code: "Bandarban", name: "Bandarban" },
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

  // Master data state
  const [banks, setBanks] = useState<BankData[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);

  // Loading states
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load banks on mount (only if not read-only)
  useEffect(() => {
    if (isReadOnly) return;
    
    const loadBanks = async () => {
      setLoadingBanks(true);
      try {
        const response = await loanApplicationApi.getBankList();
        if (response.status === "200" && response.dataList) {
          // Map ddvalue/ddtext to bankcode/bankname
          const mappedBanks = response.dataList.map((item: any) => ({
            bankcode: item.ddvalue || item.bankcode,
            bankname: item.ddtext || item.bankname
          }));
          setBanks(mappedBanks);
        } else if (response.dataList) {
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

  // Load existing liabilities on mount
  useEffect(() => {
    if (isReadOnly) return;
    
    const loadExistingLiabilities = async () => {
      const session = getSessionContext();
      if (!session.applicationId) return;
      
      try {
        const response = await loanApplicationApi.getOtherBankLiability(session.applicationId);
        if (response.status === "200" && response.dataList) {
          setLiabilities(response.dataList);
        }
      } catch (error) {
        console.error("Failed to load existing liabilities:", error);
      }
    };
    loadExistingLiabilities();
  }, [isReadOnly]);

  // Load branches when bank changes
  const loadBranches = async (bankCode: string) => {
    setLoadingBranches(true);
    setBranches([]);
    try {
      const response = await loanApplicationApi.getBankBranchList(bankCode);
      if (response.status === "200" && response.dataList) {
        setBranches(response.dataList);
      } else if (response.dataList) {
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
      toast.error("Please fill in Loan Type, Bank Name and Branch Name");
      return;
    }

    setSubmitting(true);
    
    try {
      const session = getSessionContext();
      if (!session.applicationId) {
        toast.error("Application ID not found");
        setSubmitting(false);
        return;
      }

      // Format bank name as "bankcode:bankname"
      const formattedBankName = `${liabilityForm.bankCode}:${liabilityForm.bankName}`;
      // Format branch name as "branchcode:branchname"
      const formattedBranchName = `${liabilityForm.branchCode}:${liabilityForm.branchName}`;

      const response = await loanApplicationApi.saveOtherBankLiability({
        liabilityid: editingId || "",
        applicationid: session.applicationId,
        bankname: formattedBankName,
        branchname: formattedBranchName,
        loantype: liabilityForm.loanType,
        loanamount: "0",
        liabilitytype: "L",
        outstanding: "0",
        emi: "0",
        apicode: "",
        modulename: ""
      });

      if (response.status === "200") {
        // Refresh the liabilities list
        const refreshResponse = await loanApplicationApi.getOtherBankLiability(session.applicationId);
        if (refreshResponse.status === "200" && refreshResponse.dataList) {
          setLiabilities(refreshResponse.dataList);
        }
        
        setLiabilityForm(defaultLiabilityForm);
        setBranches([]);
        setEditingId(null);
        toast.success(editingId ? "Liability updated successfully" : "Liability added successfully");
      } else {
        toast.error(response.message || "Failed to save liability");
      }
    } catch (error) {
      console.error("Failed to save liability:", error);
      toast.error("Failed to save liability");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (liability: LiabilityData) => {
    setEditingId(liability.liabilityid);
    setLiabilityForm({
      loanType: liability.loantype,
      bankCode: liability.bankcode,
      bankName: liability.bankname,
      branchCode: liability.branchcode,
      branchName: liability.branchname,
      district: ""
    });
    // Load branches for the selected bank
    loadBranches(liability.bankcode);
  };

  const handleDelete = async (liabilityId: string) => {
    setDeleting(liabilityId);
    
    try {
      const session = getSessionContext();
      if (!session.applicationId) {
        toast.error("Application ID not found");
        setDeleting(null);
        return;
      }

      const response = await loanApplicationApi.deleteOtherBankLiability(liabilityId, session.applicationId);
      
      if (response.status === "200") {
        setLiabilities(prev => prev.filter(l => l.liabilityid !== liabilityId));
        toast.success("Liability deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete liability");
      }
    } catch (error) {
      console.error("Failed to delete liability:", error);
      toast.error("Failed to delete liability");
    } finally {
      setDeleting(null);
    }
  };

  const handleNotApplicable = async (checked: boolean) => {
    setFormData(prev => ({ ...prev, notApplicable: checked }));
    
    if (checked) {
      const session = getSessionContext();
      if (session.applicationId) {
        try {
          await loanApplicationApi.saveOtherBankLiabilityComplete(session.applicationId);
        } catch (error) {
          console.error("Failed to mark liability as complete:", error);
        }
      }
    }
  };

  const handleNext = () => {
    onNext({
      ...formData,
      liabilities,
      notApplicable: formData.notApplicable
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-primary rounded-t-lg">
        <h3 className="font-semibold text-sm text-primary-foreground">
          <BilingualText english="Other Bank Liability" bengali="অন্য ব্যাংকের দায়" />
        </h3>
        {isReadOnly && (
          <div className="flex items-center gap-1 text-xs text-primary-foreground/80">
            <Lock className="w-3 h-3" />
            <span>Logout</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-muted/30 rounded-b-lg space-y-4">
        {/* Not Applicable Checkbox */}
        {(formData.notApplicable || !isReadOnly) && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notApplicable"
              checked={formData.notApplicable}
              disabled={isReadOnly}
              onCheckedChange={(checked) => !isReadOnly && handleNotApplicable(checked as boolean)}
            />
            <label htmlFor="notApplicable" className={`text-sm font-medium ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
              <BilingualText english="Not Applicable" bengali="প্রযোজ্য নয়" />
            </label>
          </div>
        )}

        {!formData.notApplicable && (
          <>
            {/* Liability Form - Only show if not read-only */}
            {!isReadOnly && (
              <div className="space-y-4">
                {/* Row 1: Loan Type, Bank Name, Branch Name, District - 4 columns */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-primary">Loan Type</label>
                    <Select
                      value={liabilityForm.loanType}
                      onValueChange={(value) => handleInputChange("loanType", value)}
                    >
                      <SelectTrigger className="bg-muted/50 border-muted">
                        <SelectValue placeholder="Credit Card" />
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-primary">Bank Name</label>
                    <Select
                      value={liabilityForm.bankCode}
                      onValueChange={handleBankChange}
                    >
                      <SelectTrigger className="bg-muted/50 border-muted">
                        {loadingBanks ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder="Al-Arafah Islami Bank Ltd." />
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-primary">Branch Name</label>
                    <Select
                      value={liabilityForm.branchCode}
                      onValueChange={handleBranchChange}
                      disabled={!liabilityForm.bankCode}
                    >
                      <SelectTrigger className="bg-muted/50 border-muted">
                        {loadingBranches ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <SelectValue placeholder={liabilityForm.bankCode ? "Agrabad" : "Select Bank first"} />
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-primary">District</label>
                    <Select
                      value={liabilityForm.district}
                      onValueChange={(value) => handleInputChange("district", value)}
                    >
                      <SelectTrigger className="bg-muted/50 border-muted">
                        <SelectValue placeholder="Bandarban" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        {districts.map((district) => (
                          <SelectItem key={district.code} value={district.code}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons: ADD/UPDATE, BACK, NEXT */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleAddOrUpdate}
                    disabled={submitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {editingId ? "UPDATE" : "ADD/UPDATE"}
                  </Button>
                </div>
              </div>
            )}

            {/* Liabilities Table */}
            {liabilities.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 text-xs font-medium text-primary border-b">
                        Loan Type <span className="text-muted-foreground">↕</span>
                      </th>
                      <th className="text-left p-2 text-xs font-medium text-primary border-b">
                        Bank Name <span className="text-muted-foreground">↕</span>
                      </th>
                      <th className="text-left p-2 text-xs font-medium text-primary border-b">
                        Branch Name <span className="text-muted-foreground">↕</span>
                      </th>
                      <th className="text-left p-2 text-xs font-medium text-primary border-b">
                        Action <span className="text-muted-foreground">↕</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {liabilities.map((liability) => (
                      <tr key={liability.liabilityid} className="border-b hover:bg-muted/20">
                        <td className="p-2 text-sm">{liability.loantype}</td>
                        <td className="p-2 text-sm">{liability.bankname}</td>
                        <td className="p-2 text-sm">{liability.branchname}</td>
                        <td className="p-2">
                          {!isReadOnly && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(liability)}
                                className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(liability.liabilityid)}
                                disabled={deleting === liability.liabilityid}
                                className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                              >
                                {deleting === liability.liabilityid ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      </div>

      <Separator />
    </div>
  );
};
