import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle, BilingualText } from "@/components/BilingualText";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page after a brief splash
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mtb-teal via-mtb-green to-mtb-teal flex items-center justify-center">
      {/* Header Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageToggle variant="header" />
        <ThemeToggle variant="header" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center px-6">
        {/* MTB Logo with white background */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <img 
              src={mtbLogoFull} 
              alt="Mutual Trust Bank PLC" 
              className="h-16 md:h-20 w-auto"
            />
          </div>
        </div>
        
        {/* Title */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md mb-2">
            <BilingualText english="Tarit Loan" bengali="তরিৎ ঋণ" />
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light mb-6">
            <BilingualText 
              english="Quick & Easy Digital Loan" 
              bengali="দ্রুত ও সহজ ডিজিটাল ঋণ" 
            />
          </p>
        </div>
        
        {/* Loading Indicator */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
