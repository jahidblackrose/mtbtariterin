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
        return <Badge className="bg-mtb-orange/10 text-mtb-orange border-mtb-orange/20">Active</Badge>;
      case "completed":
        return <Badge className="bg-mtb-success/10 text-mtb-success border-mtb-success/20">Completed</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mtb-teal via-mtb-green to-mtb-teal">
      {/* Header */}
      <header className="py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo with white background for visibility */}
              <div className="bg-white rounded-xl p-2 shadow-lg">
                <img src={mtbLogoFull} alt="MTB Logo" className="h-8 md:h-10 w-auto" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">
                  <BilingualText english="Tarit Loan" bengali="তরিৎ ঋণ" />
                </h1>
                <p className="text-xs text-white/80">
                  <BilingualText english="Welcome back" bengali="স্বাগতম" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageToggle variant="header" className="hidden sm:flex" />
              <LanguageToggle variant="compact" className="sm:hidden bg-white/20 text-white rounded-full" />
              <ThemeToggle variant="header" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="text-white hover:bg-white/20 px-2 sm:px-3"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  <BilingualText english="Logout" bengali="লগআউট" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {/* Quick Actions */}
              <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="w-5 h-5 text-mtb-teal" />
                    <BilingualText english="Loan Services" bengali="ঋণ সেবা" />
                  </CardTitle>
                  <CardDescription className="text-sm">
                    <BilingualText 
                      english="Apply for new loans or manage existing ones" 
                      bengali="নতুন ঋণের জন্য আবেদন বা বিদ্যমান পরিচালনা করুন" 
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button 
                      onClick={() => navigate("/loan-application")}
                      className="h-16 sm:h-20 bg-mtb-teal hover:bg-mtb-teal/90 text-white text-left justify-start rounded-xl"
                      size="lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm sm:text-base truncate">
                            <BilingualText english="Apply New Loan" bengali="নতুন ঋণ আবেদন" />
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
                      className="h-16 sm:h-20 text-left justify-start rounded-xl border-2 bg-card"
                      size="lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-mtb-teal/10 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-mtb-teal" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm sm:text-base text-foreground truncate">
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
              <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5 text-mtb-teal" />
                    <BilingualText english="My Loans" bengali="আমার ঋণসমূহ" />
                  </CardTitle>
                  <CardDescription className="text-sm">
                    <BilingualText 
                      english="Manage your existing loan accounts" 
                      bengali="বিদ্যমান ঋণ অ্যাকাউন্ট পরিচালনা করুন" 
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    {existingLoans.map((loan) => (
                      <div key={loan.id} className="p-4 rounded-xl border-2 bg-card hover:border-mtb-teal/30 transition-all">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-foreground">#{loan.id}</h3>
                              {getStatusBadge(loan.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ৳{loan.amount.toLocaleString()} • {loan.installmentPaid}/{loan.totalInstallments} <BilingualText english="paid" bengali="পরিশোধিত" />
                            </p>
                          </div>
                          {loan.status === "active" && loan.installmentPaid > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCloseLoan(loan.id)}
                              className="text-xs flex-shrink-0"
                            >
                              <BilingualText english="Close" bengali="বন্ধ" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">
                              <BilingualText english="Balance" bengali="বকেয়া" />
                            </p>
                            <p className="font-medium text-foreground">৳{loan.balance.toLocaleString()}</p>
                          </div>
                          {loan.nextDue && (
                            <div className="p-2 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground">
                                <BilingualText english="Next Due" bengali="পরবর্তী" />
                              </p>
                              <p className="font-medium text-foreground">{loan.nextDue}</p>
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
            <div className="space-y-4">
              {/* User Profile Card */}
              <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-5 h-5 text-mtb-teal" />
                    <BilingualText english="Account" bengali="অ্যাকাউন্ট" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        <BilingualText english="Account Number" bengali="অ্যাকাউন্ট নম্বর" />
                      </p>
                      <p className="font-medium text-foreground">****1234</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        <BilingualText english="Mobile" bengali="মোবাইল" />
                      </p>
                      <p className="font-medium text-foreground">+880 1***-***456</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-xs">
                        <BilingualText english="Customer Since" bengali="গ্রাহক" />
                      </p>
                      <p className="font-medium text-foreground">Jan 2020</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    <BilingualText english="Quick Stats" bengali="পরিসংখ্যান" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-mtb-success" />
                        <span className="text-sm text-foreground">
                          <BilingualText english="Completed" bengali="সম্পূর্ণ" />
                        </span>
                      </div>
                      <span className="font-bold text-foreground">1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-mtb-orange" />
                        <span className="text-sm text-foreground">
                          <BilingualText english="Active" bengali="সক্রিয়" />
                        </span>
                      </div>
                      <span className="font-bold text-foreground">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
