import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface FixedBottomCTAProps {
  primaryLabel: { english: string; bengali: string };
  onPrimaryClick: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  secondaryLabel?: { english: string; bengali: string };
  onSecondaryClick?: () => void;
  secondaryDisabled?: boolean;
  icon?: React.ReactNode;
}

export const FixedBottomCTA = ({
  primaryLabel,
  onPrimaryClick,
  primaryDisabled = false,
  primaryLoading = false,
  secondaryLabel,
  onSecondaryClick,
  secondaryDisabled = false,
  icon,
}: FixedBottomCTAProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom"
    >
      <div className="px-4 py-3 max-w-lg mx-auto">
        <div className={`flex gap-3 ${secondaryLabel ? "flex-row" : ""}`}>
          {secondaryLabel && onSecondaryClick && (
            <Button
              variant="outline"
              onClick={onSecondaryClick}
              disabled={secondaryDisabled}
              className="flex-1 h-12 rounded-xl text-base font-medium"
            >
              <BilingualText english={secondaryLabel.english} bengali={secondaryLabel.bengali} />
            </Button>
          )}

          <Button
            onClick={onPrimaryClick}
            disabled={primaryDisabled || primaryLoading}
            className="flex-1 h-12 rounded-xl bg-success hover:bg-success/90 text-white text-base font-medium shadow-button transition-all hover:shadow-lg disabled:opacity-50"
          >
            {primaryLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <BilingualText english={primaryLabel.english} bengali={primaryLabel.bengali} />
                {icon && <span className="ml-2">{icon}</span>}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
