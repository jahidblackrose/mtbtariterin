import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/BilingualText";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen tech-background flex items-center justify-center">
      {/* Background Effects */}
      <div className="tech-orb tech-orb-1" />
      <div className="tech-orb tech-orb-2" />
      <div className="tech-orb tech-orb-3" />
      <div className="tech-orb tech-orb-4" />
      <div className="tech-grid" />
      
      {/* Header */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 safe-area-top">
        <LanguageToggle variant="header" className="bg-white/20 text-white hover:bg-white/30" />
        <ThemeToggle variant="header" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        {/* MTB Logo with Glow */}
        <div className="mb-6 flex justify-center animate-fade-in">
          <div className="logo-glow-container p-5">
            <img 
              src={mtbLogoFull} 
              alt="Mutual Trust Bank PLC" 
              className="h-16 sm:h-20 md:h-24 w-auto"
            />
          </div>
        </div>
        
        {/* M-Line Separator */}
        <div className="flex justify-center mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="mline-separator w-24 h-1" />
        </div>
        
        {/* Title */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-md mb-3">
            Tarit Loan
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-light mb-2">
            তরিৎ ঋণ
          </p>
          <div className="mline-separator w-16 mx-auto my-4" />
          <p className="text-sm sm:text-base md:text-lg text-white/70">
            Quick & Easy Digital Loan Application
          </p>
        </div>
        
        {/* Loading Indicator */}
        <div className="mt-10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-center gap-2 text-white/60">
            <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
