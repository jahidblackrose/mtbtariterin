import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BilingualText } from "@/components/BilingualText";

interface Step {
  id: number;
  title: string;
  titleBengali: string;
}

interface CircularStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  variant?: "compact" | "full";
}

export const CircularStepIndicator = ({ 
  steps, 
  currentStep,
  variant = "compact"
}: CircularStepIndicatorProps) => {
  if (variant === "compact") {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {steps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: step.id === currentStep ? 1.2 : 1,
                opacity: 1 
              }}
              transition={{ duration: 0.2 }}
              className={`rounded-full transition-all duration-300 ${
                step.id === currentStep
                  ? "w-3 h-3 bg-primary ring-4 ring-primary/20"
                  : step.id < currentStep
                  ? "w-2.5 h-2.5 bg-success"
                  : "w-2 h-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        
        {/* Current step text */}
        <p className="text-xs text-muted-foreground">
          <BilingualText 
            english={`Step ${currentStep} of ${steps.length}`}
            bengali={`ধাপ ${currentStep} / ${steps.length}`}
          />
        </p>
      </div>
    );
  }

  // Full variant - Circular numbered indicators
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-1">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex flex-col items-center"
            >
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                  step.id === currentStep
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg"
                    : step.id < currentStep
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
                
                {/* Active indicator pulse */}
                {step.id === currentStep && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/30"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              
              {/* Step label - only show for mobile visible steps */}
              <span className={`mt-2 text-xs text-center max-w-[60px] truncate ${
                step.id === currentStep 
                  ? "text-primary font-medium" 
                  : step.id < currentStep
                  ? "text-success"
                  : "text-muted-foreground"
              }`}>
                <BilingualText english={step.title} bengali={step.titleBengali} />
              </span>
            </motion.div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`w-4 h-0.5 mx-1 transition-colors ${
                step.id < currentStep ? "bg-success" : "bg-border"
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
