import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface BilingualTextProps {
  english: string;
  bengali: string;
  className?: string;
}

export const BilingualText = ({ english, bengali, className }: BilingualTextProps) => {
  const { language } = useLanguage();
  
  return (
    <span className={className}>
      {language === "english" ? english : bengali}
    </span>
  );
};

interface LanguageToggleProps {
  className?: string;
  variant?: "default" | "header" | "compact";
}

export const LanguageToggle = ({ className, variant = "default" }: LanguageToggleProps) => {
  const { language, toggleLanguage } = useLanguage();
  
  if (variant === "header") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${className}`}
      >
        <Languages className="w-4 h-4 mr-1.5" />
        {language === "english" ? "বাং" : "Eng"}
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={toggleLanguage}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${className}`}
      >
        {language === "english" ? "বাং" : "Eng"}
      </button>
    );
  }
  
  return (
    <button
      onClick={toggleLanguage}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${className}`}
    >
      {language === "english" ? "বাংলা" : "English"}
    </button>
  );
};
