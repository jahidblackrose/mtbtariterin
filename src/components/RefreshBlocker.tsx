import { useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

const RefreshBlocker = () => {
  const showRefreshBlockedMessage = useCallback(() => {
    toast({
      title: "Refresh not allowed",
      description: "Please use the navigation buttons to move through the application.",
      variant: "destructive",
      duration: 3000,
    });
  }, []);

  useEffect(() => {
    // Handle beforeunload event (browser refresh button, address bar, right-click reload)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "Refresh not allowed";
      return "Refresh not allowed";
    };

    // Handle keyboard shortcuts (F5, Ctrl+R, Cmd+R)
    const handleKeyDown = (event: KeyboardEvent) => {
      // F5 key
      if (event.key === "F5" || event.keyCode === 116) {
        event.preventDefault();
        event.stopPropagation();
        showRefreshBlockedMessage();
        return false;
      }

      // Ctrl+R (Windows/Linux) or Cmd+R (Mac)
      if ((event.ctrlKey || event.metaKey) && (event.key === "r" || event.key === "R")) {
        event.preventDefault();
        event.stopPropagation();
        showRefreshBlockedMessage();
        return false;
      }

      // Ctrl+Shift+R or Cmd+Shift+R (Hard refresh)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === "r" || event.key === "R")) {
        event.preventDefault();
        event.stopPropagation();
        showRefreshBlockedMessage();
        return false;
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("keydown", handleKeyDown, true);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [showRefreshBlockedMessage]);

  return null;
};

export default RefreshBlocker;
