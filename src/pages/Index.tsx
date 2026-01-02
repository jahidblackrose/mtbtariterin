import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import mtbLogoFull from "@/assets/mtb-logo-full.png";
import mlineGradient from "@/assets/mline-gradient.png";

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
    <div className="min-h-screen tech-background flex items-center justify-center">
      {/* Background Effects */}
      <div className="tech-orb tech-orb-1" />
      <div className="tech-orb tech-orb-2" />
      <div className="tech-orb tech-orb-3" />
      <div className="tech-orb tech-orb-4" />
      <div className="tech-grid" />
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="header" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        {/* MTB Logo */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <img 
            src={mtbLogoFull} 
            alt="Mutual Trust Bank PLC" 
            className="h-20 md:h-28 w-auto drop-shadow-2xl"
          />
        </div>
        
        {/* M-Line Separator */}
        <div className="flex justify-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <img src={mlineGradient} alt="" className="w-32 h-auto opacity-90 drop-shadow-lg" />
        </div>
        
        {/* Title */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-md mb-4">
            Tarit Loan
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light mb-2">
            তরিৎ ঋণ
          </p>
          <div className="mline-separator w-24 mx-auto my-6" />
          <p className="text-lg text-white/70">
            Quick & Easy Digital Loan Application
          </p>
        </div>
        
        {/* Loading Indicator */}
        <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
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
