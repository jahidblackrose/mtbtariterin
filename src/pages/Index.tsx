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
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative mline elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <img src={mlineLogo} alt="" className="w-20 h-20" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 rotate-180">
        <img src={mlineLogo} alt="" className="w-16 h-16" />
      </div>
      
      <div className="text-center z-10">
        {/* MTB Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src={mtvbLogo} 
            alt="Mutual Trust Bank PLC" 
            className="h-16 md:h-20 w-auto"
          />
        </div>
        
        {/* Title with mline separator */}
        <div className="mb-6">
          <h1 className="mb-4 text-3xl md:text-4xl font-bold text-mtb-primary">
            Tarit Loan Application
          </h1>
          <div className="flex justify-center mb-4">
            <img src={mlineLogo} alt="" className="w-24 h-6 opacity-60" />
          </div>
        </div>
        
        <p className="text-lg md:text-xl text-muted-foreground">
          Redirecting to login...
        </p>
      </div>
    </div>
  );
};

export default Index;
