import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BilingualText, LanguageToggle } from "@/components/BilingualText";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import mtbLogoFull from "@/assets/mtb-logo-full.png";

interface AppHeaderProps {
  title?: { english: string; bengali: string };
  subtitle?: { english: string; bengali: string };
  showBack?: boolean;
  onBack?: () => void;
  variant?: "default" | "transparent" | "minimal";
  rightContent?: React.ReactNode;
}

export const AppHeader = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  variant = "default",
  rightContent,
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const headerBg = {
    default: "bg-card/95 backdrop-blur-md border-b border-border",
    transparent: "bg-transparent",
    minimal: "bg-background",
  };

  const textColor = variant === "transparent" ? "text-white" : "text-foreground";
  const subtitleColor = variant === "transparent" ? "text-white/70" : "text-muted-foreground";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 safe-area-top ${headerBg[variant]}`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-3 min-w-0">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className={`shrink-0 h-10 w-10 rounded-full ${
                  variant === "transparent"
                    ? "text-white hover:bg-white/10"
                    : "hover:bg-accent"
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Title - shown on all devices */}
            {title && (
              <div className="min-w-0">
                <h1 className={`text-base font-semibold truncate ${textColor}`}>
                  <BilingualText english={title.english} bengali={title.bengali} />
                </h1>
                {subtitle && !isMobile && (
                  <p className={`text-xs truncate ${subtitleColor}`}>
                    <BilingualText english={subtitle.english} bengali={subtitle.bengali} />
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Desktop-only logo + actions */}
          <div className="flex items-center gap-2 shrink-0">
            {rightContent}
            
            {/* Desktop: Show logo and toggles */}
            {!isMobile && (
              <>
                <LanguageToggle
                  variant="compact"
                  className={
                    variant === "transparent"
                      ? "bg-white/20 text-white hover:bg-white/30"
                      : "bg-muted text-foreground hover:bg-accent"
                  }
                />
                <ThemeToggle variant={variant === "transparent" ? "header" : "default"} />
                <div className="h-6 w-px bg-border mx-1" />
                <div className="logo-glow-container p-1.5">
                  <img
                    src={mtbLogoFull}
                    alt="MTB Logo"
                    className="h-8 w-auto"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
