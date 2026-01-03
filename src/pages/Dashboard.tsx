import { useState } from "react";
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
  CheckCircle
} from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [existingLoans] = useState([
    {
      id: "LN001",
      amount: 150000,
      balance: 45000,
      installmentPaid: 8,
      totalInstallments: 12,
      status: "active",
      nextDue: "2024-02-15",
      monthlyPayment: 13500
    },
    {
      id: "LN002", 
      amount: 75000,
      balance: 0,
      installmentPaid: 6,
      totalInstallments: 6,
      status: "completed",
      nextDue: null,
      monthlyPayment: 12500
    }
  ]);

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const handleCloseLoan = (loanId: string) => {
    navigate("/loan-closure", { state: { loanId } });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="status-pending">Active</Badge>;
      case "completed":
        return <Badge className="status-approved">Completed</Badge>;
      case "overdue":
        return <Badge className="status-rejected">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            {/* Quick Actions */}
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

            {/* Existing Loans */}
            <Card className="banking-card-elevated">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="w-5 h-5 text-success" />
                  <BilingualText english="My Loan Accounts" bengali="আমার ঋণ অ্যাকাউন্টসমূহ" />
                </CardTitle>
                <CardDescription className="text-sm">
                  <BilingualText 
                    english="Manage your existing loan accounts" 
                    bengali="আপনার বিদ্যমান ঋণ অ্যাকাউন্টগুলি পরিচালনা করুন" 
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3">
                  {existingLoans.map((loan) => (
                    <div key={loan.id} className="p-4 rounded-xl border-2 bg-card/50 hover:bg-card transition-all">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base">Loan #{loan.id}</h3>
                            {getStatusBadge(loan.status)}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            <BilingualText 
                              english={`৳${loan.amount.toLocaleString()} - ${loan.installmentPaid}/${loan.totalInstallments} paid`}
                              bengali={`৳${loan.amount.toLocaleString()} - ${loan.installmentPaid}/${loan.totalInstallments} পরিশোধিত`}
                            />
                          </p>
                        </div>
                        {loan.status === "active" && loan.installmentPaid > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCloseLoan(loan.id)}
                            className="text-xs flex-shrink-0"
                          >
                            <BilingualText english="Close" bengali="বন্ধ করুন" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            <BilingualText english="Balance" bengali="বকেয়া" />
                          </p>
                          <p className="font-medium">৳{loan.balance.toLocaleString()}</p>
                        </div>
                        {loan.nextDue && (
                          <div>
                            <p className="text-muted-foreground">
                              <BilingualText english="Next Due" bengali="পরবর্তী" />
                            </p>
                            <p className="font-medium">{loan.nextDue}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                      <BilingualText english="Account Number" bengali="অ্যাকাউন্ট নম্বর" />
                    </p>
                    <p className="font-medium">****1234</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      <BilingualText english="Mobile" bengali="মোবাইল" />
                    </p>
                    <p className="font-medium">+880 1***-***456</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-xs">
                      <BilingualText english="Customer Since" bengali="গ্রাহক হিসেবে" />
                    </p>
                    <p className="font-medium">Jan 2020</p>
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
                    <span className="font-bold">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="text-sm">
                        <BilingualText english="Active" bengali="সক্রিয়" />
                      </span>
                    </div>
                    <span className="font-bold">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
