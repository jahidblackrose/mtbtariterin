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
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`step-indicator ${
                step.id === currentStep
                  ? "step-indicator-active"
                  : step.id < currentStep
                  ? "step-indicator-completed"
                  : "step-indicator-inactive"
              }`}
            >
              {step.id < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.id
              )}
            </div>
            <div className="mt-2 text-center">
              <p className={`text-xs font-medium ${
                step.id <= currentStep ? "text-foreground" : "text-muted-foreground"
              }`}>
                <BilingualText english={step.title} bengali={step.titleBengali} />
              </p>
            </div>
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`h-px w-full mx-4 ${
                step.id < currentStep ? "bg-secondary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};