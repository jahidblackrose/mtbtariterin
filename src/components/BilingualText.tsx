import { useState } from "react";

interface BilingualTextProps {
  english: string;
  bengali: string;
  className?: string;
}

export const BilingualText = ({ english, bengali, className }: BilingualTextProps) => {
  const [language, setLanguage] = useState<"english" | "bengali">("english");
  
  return (
    <span className={className}>
      {language === "english" ? english : bengali}
    </span>
  );
};

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle = ({ className }: LanguageToggleProps) => {
  const [language, setLanguage] = useState<"english" | "bengali">("english");
  
  return (
    <button
      onClick={() => setLanguage(language === "english" ? "bengali" : "english")}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${className}`}
    >
      {language === "english" ? "বাং" : "Eng"}
    </button>
  );
};