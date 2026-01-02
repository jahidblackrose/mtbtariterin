import { CheckCircle } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface Step {
  id: number;
  title: string;
  titleBengali: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-max px-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step.id === currentStep
                    ? "bg-mtb-teal text-white shadow-lg ring-4 ring-mtb-teal/20"
                    : step.id < currentStep
                    ? "bg-mtb-success text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center max-w-[80px]">
                <p className={`text-xs font-medium leading-tight ${
                  step.id <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}>
                  <BilingualText english={step.title} bengali={step.titleBengali} />
                </p>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 mx-2 transition-colors ${
                  step.id < currentStep ? "bg-mtb-success" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
