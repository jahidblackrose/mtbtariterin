import { createContext, useContext, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

type Language = "english" | "bengali";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("english");

  const toggleLanguage = () => {
    setLanguage(prev => prev === "english" ? "bengali" : "english");
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

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
  
  if (variant === "compact") {
    return (
      <button
        onClick={toggleLanguage}
        className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${className}`}
        aria-label={`Switch to ${language === "english" ? "Bengali" : "English"}`}
      >
        {language === "english" ? "বাং" : "EN"}
      </button>
    );
  }

  if (variant === "header") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className={`gap-1.5 text-white hover:bg-white/20 ${className}`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {language === "english" ? "বাংলা" : "English"}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`gap-1.5 border-border hover:bg-accent ${className}`}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === "english" ? "বাংলা" : "English"}
      </span>
    </Button>
  );
};
