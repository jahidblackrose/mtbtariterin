import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  labelBengali?: string;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const AppSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  label,
  disabled = false,
  className,
}: AppSelectProps) => {
  const [open, setOpen] = React.useState(false);
  
  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full h-12 px-4 rounded-xl",
          "border-2 border-input bg-background text-foreground",
          "transition-all duration-200",
          "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Bottom Sheet for mobile-style dropdown */}
      <BottomSheet open={open} onClose={() => setOpen(false)} title={label || placeholder}>
        <div className="space-y-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex items-center justify-between w-full px-4 py-3.5 rounded-xl",
                "text-left transition-colors",
                value === option.value
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <span className="font-medium">{option.label}</span>
              {value === option.value && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
};
