import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ApplicationDataProvider } from "@/contexts/ApplicationDataContext";
import RefreshBlocker from "@/components/RefreshBlocker";
import Index from "./pages/Index";
import Login from "./pages/Login";
import OtpVerification from "./pages/OtpVerification";
import Dashboard from "./pages/Dashboard";
import LoanApplication from "./pages/LoanApplication";
import LoanClosure from "./pages/LoanClosure";
import LoanCalculator from "./pages/LoanCalculator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ApplicationDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RefreshBlocker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/otp-verification" element={<OtpVerification />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/loan-application" element={<LoanApplication />} />
              <Route path="/loan-closure" element={<LoanClosure />} />
              <Route path="/loan-calculator" element={<LoanCalculator />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ApplicationDataProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
