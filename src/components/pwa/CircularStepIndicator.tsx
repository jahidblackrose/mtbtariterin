import { motion } from "framer-motion";

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
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {steps.map((step) => (
        <motion.div
          key={step.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1,
            opacity: 1 
          }}
          transition={{ duration: 0.2, delay: step.id * 0.03 }}
          className={`rounded-full transition-all duration-300 ${
            step.id === currentStep
              ? "w-2.5 h-2.5 bg-primary"
              : step.id < currentStep
              ? "w-2 h-2 bg-primary"
              : "w-2 h-2 bg-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
};
