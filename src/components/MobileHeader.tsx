import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

interface MobileHeaderProps {
  showBack?: boolean;
  title?: { english: string; bengali: string };
  subtitle?: { english: string; bengali: string };
  variant?: "transparent" | "solid";
}

export const MobileHeader = ({ 
  showBack = true, 
  title,
  subtitle,
  variant = "solid" 
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={`sticky top-0 z-50 ${
      variant === "transparent" 
        ? "bg-transparent" 
        : "bg-card/95 backdrop-blur-md border-b border-border"
    }`}>
      <div className="banking-container py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back button or Logo */}
          {showBack ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className={`p-2 h-auto ${variant === "transparent" ? "text-white hover:bg-white/10" : ""}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="logo-glow-container">
                <img 
                  src={mtbLogoFull} 
                  alt="MTB" 
                  className="h-8 w-auto"
                />
              </div>
            </div>
          )}

          {/* Center: Title */}
          {title && (
            <div className="flex-1 text-center min-w-0">
              <h1 className={`text-sm font-semibold truncate ${
                variant === "transparent" ? "text-white" : "text-foreground"
              }`}>
                <BilingualText english={title.english} bengali={title.bengali} />
              </h1>
              {subtitle && (
                <p className={`text-xs truncate ${
                  variant === "transparent" ? "text-white/70" : "text-muted-foreground"
                }`}>
                  <BilingualText english={subtitle.english} bengali={subtitle.bengali} />
                </p>
              )}
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <LanguageToggle 
              variant="compact" 
              className={variant === "transparent" 
                ? "bg-white/20 text-white hover:bg-white/30" 
                : "bg-muted text-foreground hover:bg-accent"
              } 
            />
            <ThemeToggle variant={variant === "transparent" ? "header" : "default"} />
          </div>
        </div>
      </div>
    </header>
  );
};
