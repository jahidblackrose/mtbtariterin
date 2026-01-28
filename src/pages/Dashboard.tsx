import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  DollarSign, 
  LogOut, 
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { useApplicationData } from "@/contexts/ApplicationDataContext";
import { getSessionContext, clearSession } from "@/services/apiClient";
import { loanApplicationApi } from "@/services/loanApplicationApi";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { applicationData, clearApplicationData, setDashboardData } = useApplicationData();
  const session = getSessionContext();
  
  // Fetch opened loan account data on page load
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await loanApplicationApi.getOpenedLoanAccountData({
          loginid: session.loginId || "",
          cif: session.cif || "",
          mobilenumber: session.mobileNumber || "",
          apicode: "",
          modulename: "",
        });

        if (response.status === "200" && response.dataList) {
          setDashboardData(response.dataList, response.newaccountopen === 1);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Keep UI visible with empty state on error
      }
    };

    fetchDashboardData();
  }, [session.loginId, session.cif, session.mobileNumber, setDashboardData]);
  
  // Get dashboard data from context
  const dashboardData = applicationData.dashboardData;
  const existingLoans = dashboardData?.existingLoans || [];
  const canApplyNewLoan = dashboardData?.canApplyNewLoan ?? true;

  const handleLogout = () => {
    // Clear all session data
    clearSession();
    clearApplicationData();
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const handleCloseLoan = (loanAcNo: string) => {
    navigate("/loan-closure", { state: { loanId: loanAcNo } });
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toUpperCase() || "";
    switch (normalizedStatus) {
      case "FULL":
      case "ACTIVE":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "CLOSED":
      case "COMPLETED":
        return <Badge className="bg-destructive text-destructive-foreground">Closed</Badge>;
      case "OVERDUE":
        return <Badge className="status-rejected">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return `৳${numValue.toLocaleString()}`;
  };

  // Mask account number for display
  const maskedAccountNumber = session.accountNumber 
    ? `****${session.accountNumber.slice(-4)}` 
    : "****";

  const maskedMobile = session.mobileNumber 
    ? `+880 ${session.mobileNumber.slice(0, 4)}***${session.mobileNumber.slice(-3)}` 
    : "+880 ****";

  // Calculate stats
  const activeLoans = existingLoans.filter(loan => 
    loan.accountstatus?.toUpperCase() !== 'CLOSED'
  ).length;
  const completedLoans = existingLoans.filter(loan => 
    loan.accountstatus?.toUpperCase() === 'CLOSED'
  ).length;

  return (
    <div className="min-h-screen tech-background">
      {/* Background Effects */}
      <div className="tech-orb tech-orb-1" />
      <div className="tech-orb tech-orb-2" />
      <div className="tech-orb tech-orb-3" />
      <div className="tech-orb tech-orb-4" />
      <div className="tech-grid" />
        
      <div className="relative z-10">
        {/* Mobile-optimized Header */}
        <header className="py-4 safe-area-top">
          <div className="banking-container px-4">
            <div className="flex items-center justify-between gap-2">
              {/* Logo with glow */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="logo-glow-container p-2 flex-shrink-0">
                  <img src={mtbLogoFull} alt="MTB Logo" className="h-8 sm:h-10 w-auto" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-white drop-shadow truncate">
                    <BilingualText english="Tarit Loan" bengali="তরিৎ ঋণ" />
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80 drop-shadow truncate">
                    <BilingualText english="Welcome back" bengali="স্বাগতম" />
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <LanguageToggle variant="compact" className="bg-white/20 text-white hover:bg-white/30" />
                <ThemeToggle variant="header" />
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/20 p-2">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="banking-container px-4 py-6 relative z-20">
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Quick Actions - Only show if newaccountopen = 1 */}
            {canApplyNewLoan && (
              <Card className="banking-card-elevated">
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Plus className="w-5 h-5 text-success" />
                    <BilingualText english="Loan Services" bengali="ঋণ সেবা" />
                  </CardTitle>
                  <CardDescription className="text-sm">
                    <BilingualText 
                      english="Apply for new loans or manage existing ones" 
                      bengali="নতুন ঋণের জন্য আবেদন করুন বা বিদ্যমানগুলি পরিচালনা করুন" 
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button 
                      onClick={() => navigate("/loan-application")}
                      className="h-16 sm:h-20 bg-success hover:bg-success/90 text-white text-left justify-start rounded-xl"
                      size="lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm sm:text-base truncate">
                            <BilingualText english="Apply New Loan" bengali="নতুন ঋণের আবেদন" />
                          </div>
                          <div className="text-xs text-white/80 truncate">
                            <BilingualText english="Quick & Easy" bengali="দ্রুত ও সহজ" />
                          </div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/loan-calculator")}
                      className="h-16 sm:h-20 text-left justify-start rounded-xl border-2"
                      size="lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm sm:text-base truncate">
                            <BilingualText english="Loan Calculator" bengali="ঋণ ক্যালকুলেটর" />
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            <BilingualText english="Calculate EMI" bengali="ইএমআই গণনা" />
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Existing Loans - Populated from API */}
            <Card className="banking-card-elevated">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="w-5 h-5 text-success" />
                  <BilingualText english="My Loan Accounts" bengali="আমার ঋণ অ্যাকাউন্টসমূহ" />
                </CardTitle>
                <CardDescription className="text-sm">
                  <BilingualText 
                    english="View your existing loan accounts" 
                    bengali="আপনার বিদ্যমান ঋণ অ্যাকাউন্টগুলি দেখুন" 
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3">
                  {existingLoans.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        <BilingualText 
                          english="No loan accounts found" 
                          bengali="কোনো ঋণ অ্যাকাউন্ট পাওয়া যায়নি" 
                        />
                      </p>
                    </div>
                  ) : (
                    existingLoans.map((loan, index) => (
                      <div key={loan.loanacno || index} className="p-4 rounded-xl border-2 bg-card/50 hover:bg-card transition-all">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-sm sm:text-base">
                                <BilingualText 
                                  english={`Loan ${loan.loanacno}`} 
                                  bengali={`ঋণ ${loan.loanacno}`} 
                                />
                              </h3>
                              {getStatusBadge(loan.accountstatus)}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {loan.productname || "Tarit Loan"}
                            </p>
                          </div>
                          {loan.accountstatus?.toUpperCase() !== 'CLOSED' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCloseLoan(loan.loanacno)}
                              className="text-xs flex-shrink-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <BilingualText english="Close" bengali="বন্ধ করুন" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mt-3">
                          <div>
                            <p className="text-muted-foreground">
                              <BilingualText english="Loan Amount" bengali="ঋণের পরিমাণ" />
                            </p>
                            <p className="font-medium">{formatCurrency(loan.loanamount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              <BilingualText english="Outstanding" bengali="বকেয়া" />
                            </p>
                            <p className="font-medium">{formatCurrency(loan.outstanding)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              <BilingualText english="Paid Installments" bengali="পরিশোধিত কিস্তি" />
                            </p>
                            <p className="font-medium">{loan.paidinstallments || "0"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              <BilingualText english="Remaining" bengali="অবশিষ্ট" />
                            </p>
                            <p className="font-medium">{loan.remaininginstallments || "0"}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6">
            {/* User Profile Card */}
            <Card className="banking-card-elevated">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-success" />
                  <BilingualText english="Account Info" bengali="অ্যাকাউন্ট তথ্য" />
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      <BilingualText english="Name" bengali="নাম" />
                    </p>
                    <p className="font-medium">{applicationData.personalData?.fullname || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      <BilingualText english="Mobile" bengali="মোবাইল" />
                    </p>
                    <p className="font-medium">{maskedMobile}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="banking-card-elevated">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  <BilingualText english="Quick Stats" bengali="দ্রুত পরিসংখ্যান" />
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm">
                        <BilingualText english="Completed" bengali="সম্পূর্ণ" />
                      </span>
                    </div>
                    <span className="font-bold">{completedLoans}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="text-sm">
                        <BilingualText english="Active" bengali="সক্রিয়" />
                      </span>
                    </div>
                    <span className="font-bold">{activeLoans}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      <BilingualText english="Total Loans" bengali="মোট ঋণ" />
                    </span>
                    <span className="font-bold">{existingLoans.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Loan Eligibility Notice */}
            {!canApplyNewLoan && (
              <Card className="banking-card-elevated border-warning/50">
                <CardContent className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        <BilingualText 
                          english="New Loan Not Available" 
                          bengali="নতুন ঋণ উপলব্ধ নয়" 
                        />
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <BilingualText 
                          english="You are not eligible for a new loan at this time. Please contact the bank for more information." 
                          bengali="আপনি এই মুহূর্তে নতুন ঋণের জন্য যোগ্য নন। আরও তথ্যের জন্য ব্যাংকে যোগাযোগ করুন।" 
                        />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
