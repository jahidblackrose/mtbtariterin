import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";
import { BilingualText } from "@/components/BilingualText";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (dismissedTime > oneDayAgo) {
        return; // Don't show if dismissed within last 24 hours
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS Safari (no beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isIOS && isSafari && !isStandalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto"
      >
        <div className="bg-card border border-border rounded-2xl shadow-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">
                <BilingualText english="Install Tarit Loan App" bengali="তরিৎ ঋণ অ্যাপ ইনস্টল করুন" />
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isIOS ? (
                  <BilingualText 
                    english="Tap the share button and 'Add to Home Screen'" 
                    bengali="শেয়ার বাটনে ট্যাপ করুন এবং 'Add to Home Screen' নির্বাচন করুন" 
                  />
                ) : (
                  <BilingualText 
                    english="Add to your home screen for quick access" 
                    bengali="দ্রুত অ্যাক্সেসের জন্য হোম স্ক্রিনে যোগ করুন" 
                  />
                )}
              </p>
              
              <div className="flex items-center gap-2 mt-3">
                {!isIOS && (
                  <Button 
                    size="sm" 
                    onClick={handleInstall}
                    className="bg-success hover:bg-success/90 text-white"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    <BilingualText english="Install" bengali="ইনস্টল" />
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="text-muted-foreground"
                >
                  <BilingualText english="Not now" bengali="এখন না" />
                </Button>
              </div>
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
