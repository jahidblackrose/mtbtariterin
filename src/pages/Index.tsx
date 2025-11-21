import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mtvbLogo from "@/assets/mtvb_logo-2.png";
import mlineLogo from "@/assets/mlinew-2.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page as this is a banking application
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* MTB Neo Style Header */}
      <div className="mtb-neo-header w-full">
        <div className="organic-shape organic-shape-1" />
        <div className="organic-shape organic-shape-2" />
        <div className="organic-shape organic-shape-3" />
        <div className="organic-shape organic-shape-4" />
        
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="text-center">
            {/* MTB Logo */}
            <div className="mb-8 flex justify-center animate-fade-in">
              <img 
                src={mtvbLogo} 
                alt="Mutual Trust Bank PLC" 
                className="h-20 md:h-24 w-auto drop-shadow-lg"
              />
            </div>
            
            {/* Title with mline separator */}
            <div className="mb-6 animate-slide-up">
              <h1 className="mb-4 text-3xl md:text-5xl font-bold text-white drop-shadow-md">
                Tarit Loan Application
              </h1>
              <div className="flex justify-center mb-4">
                <img src={mlineLogo} alt="" className="w-28 h-7 opacity-90 drop-shadow" />
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-white/90 drop-shadow">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
