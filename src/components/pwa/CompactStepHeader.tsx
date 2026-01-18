import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BilingualText } from "@/components/BilingualText";

interface CompactStepHeaderProps {
  title: { english: string; bengali: string };
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onClose?: () => void;
}

export const CompactStepHeader = ({
  title,
  currentStep,
  totalSteps,
  onBack,
  onClose,
}: CompactStepHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/dashboard");
    }
  };

  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;
  
  // Calculate stroke dasharray for circular progress
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-background border-b border-border/30 safe-area-top"
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 rounded-full hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Center: Title */}
          <h1 className="text-base font-semibold text-foreground">
            <BilingualText english={title.english} bengali={title.bengali} />
          </h1>

          {/* Right: Circular Progress + Close */}
          <div className="flex items-center gap-2">
            {/* Circular Progress Indicator */}
            <div className="relative flex items-center justify-center w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted/30"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="18"
                  cy="18"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-primary"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
              </svg>
              {/* Step number text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-foreground">
                  {currentStep}/{totalSteps}
                </span>
              </div>
            </div>

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-10 w-10 rounded-full hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
