import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useApplicationData } from "@/contexts/ApplicationDataContext";
import { loanApplicationApi } from "@/services/loanApplicationApi";
import { getSessionContext, updateSessionContext, isSuccessResponse } from "@/services/apiClient";

// Session storage keys for persistence across refresh
const SESSION_KEYS = {
  APPLICATION_ID: "mtb_applicationId",
  CIF: "mtb_cif",
  LOGIN_ID: "mtb_loginId",
  MOBILE_NUMBER: "mtb_mobileNumber",
  ACCOUNT_NUMBER: "mtb_accountNumber",
  CUSTOMER_ID: "mtb_customerId",
  REFRESH_DETECTED: "mtb_refresh_detected",
};

/**
 * Persist session context to sessionStorage
 */
const persistSessionToStorage = () => {
  const session = getSessionContext();
  if (session.applicationId) {
    sessionStorage.setItem(SESSION_KEYS.APPLICATION_ID, session.applicationId);
  }
  if (session.cif) {
    sessionStorage.setItem(SESSION_KEYS.CIF, session.cif);
  }
  if (session.loginId) {
    sessionStorage.setItem(SESSION_KEYS.LOGIN_ID, session.loginId);
  }
  if (session.mobileNumber) {
    sessionStorage.setItem(SESSION_KEYS.MOBILE_NUMBER, session.mobileNumber);
  }
  if (session.accountNumber) {
    sessionStorage.setItem(SESSION_KEYS.ACCOUNT_NUMBER, session.accountNumber);
  }
  if (session.customerId) {
    sessionStorage.setItem(SESSION_KEYS.CUSTOMER_ID, session.customerId);
  }
};

/**
 * Restore session context from sessionStorage
 */
const restoreSessionFromStorage = (): boolean => {
  const applicationId = sessionStorage.getItem(SESSION_KEYS.APPLICATION_ID);
  const cif = sessionStorage.getItem(SESSION_KEYS.CIF);
  const loginId = sessionStorage.getItem(SESSION_KEYS.LOGIN_ID);
  const mobileNumber = sessionStorage.getItem(SESSION_KEYS.MOBILE_NUMBER);
  const accountNumber = sessionStorage.getItem(SESSION_KEYS.ACCOUNT_NUMBER);
  const customerId = sessionStorage.getItem(SESSION_KEYS.CUSTOMER_ID);

  if (applicationId || cif || loginId) {
    updateSessionContext({
      applicationId,
      cif,
      loginId,
      mobileNumber,
      accountNumber,
      customerId,
    });
    return true;
  }
  return false;
};

/**
 * Check if this is a refresh (page reload)
 */
const isPageRefresh = (): boolean => {
  // Check navigation type for page reload
  if (window.performance) {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0) {
      const navEntry = navEntries[0] as PerformanceNavigationTiming;
      return navEntry.type === "reload";
    }
  }
  return false;
};

const RefreshBlocker = () => {
  const location = useLocation();
  const { mapFetchAllDataResponse, applicationData } = useApplicationData();
  const hasCalledFetchAllData = useRef(false);

  const showRefreshBlockedMessage = useCallback(() => {
    toast({
      title: "Refresh not allowed",
      description: "Please use the navigation buttons to move through the application.",
      variant: "destructive",
      duration: 3000,
    });
  }, []);

  /**
   * Fetch all data from API to recover state after refresh
   */
  const fetchAllDataOnRefresh = useCallback(async () => {
    const session = getSessionContext();
    const applicationId = session.applicationId || sessionStorage.getItem(SESSION_KEYS.APPLICATION_ID);
    const cif = session.cif || sessionStorage.getItem(SESSION_KEYS.CIF);

    if (!applicationId) {
      console.log("No applicationId found, skipping fetchAllData");
      return;
    }

    try {
      const response = await loanApplicationApi.fetchAllData({
        applicationid: applicationId,
        cif: cif || "",
        apicode: "",
        modulename: "",
      });

      if (isSuccessResponse(response)) {
        // Map the response to application context
        mapFetchAllDataResponse(response, {
          applicationId: applicationId,
          accountNumber: session.accountNumber || sessionStorage.getItem(SESSION_KEYS.ACCOUNT_NUMBER) || "",
          customerId: session.customerId || sessionStorage.getItem(SESSION_KEYS.CUSTOMER_ID) || "",
          profileStatus: "",
          loanAcNo: "",
        });
        console.log("Data recovered successfully after refresh");
      }
    } catch (error) {
      console.error("Failed to fetch data on refresh:", error);
    }
  }, [mapFetchAllDataResponse]);

  // Handle refresh detection and data recovery
  useEffect(() => {
    // Restore session from storage first
    const hasStoredSession = restoreSessionFromStorage();

    // Check if this is a page refresh
    if (isPageRefresh() && hasStoredSession && !hasCalledFetchAllData.current) {
      hasCalledFetchAllData.current = true;
      console.log("Refresh detected, calling fetchAllData API");
      fetchAllDataOnRefresh();
    }
  }, [fetchAllDataOnRefresh]);

  // Persist session data whenever it changes
  useEffect(() => {
    const session = getSessionContext();
    if (session.applicationId || session.cif || session.loginId) {
      persistSessionToStorage();
    }
  }, [location.pathname]);

  // Also persist when application data changes
  useEffect(() => {
    if (applicationData.applicationId) {
      const session = getSessionContext();
      if (!session.applicationId) {
        updateSessionContext({
          applicationId: applicationData.applicationId,
          customerId: applicationData.customerId,
          accountNumber: applicationData.accountNumber,
        });
      }
      persistSessionToStorage();
    }
  }, [applicationData.applicationId, applicationData.customerId, applicationData.accountNumber]);

  useEffect(() => {
    // Handle beforeunload event (browser refresh button, address bar, right-click reload)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Persist session before unload
      persistSessionToStorage();
      
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

    // Handle context menu (right-click)
    const handleContextMenu = (event: MouseEvent) => {
      // We don't fully block context menu, but we could show a warning
      // For now, just persist session in case they click refresh
      persistSessionToStorage();
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [showRefreshBlockedMessage]);

  return null;
};

export default RefreshBlocker;
