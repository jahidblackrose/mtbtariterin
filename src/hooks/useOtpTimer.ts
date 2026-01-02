import { useState, useEffect, useCallback } from 'react';

interface UseOtpTimerReturn {
  timeRemaining: number;
  isExpired: boolean;
  formattedTime: string;
  resetTimer: () => void;
}

/**
 * Custom hook for managing OTP countdown timer
 * @param initialSeconds - Initial countdown time in seconds (default: 120 for 2 minutes)
 */
export function useOtpTimer(initialSeconds: number = 120): UseOtpTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const resetTimer = useCallback(() => {
    setTimeRemaining(initialSeconds);
    setIsExpired(false);
  }, [initialSeconds]);

  // Format time as MM:SS
  const formattedTime = `${String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:${String(timeRemaining % 60).padStart(2, '0')}`;

  return {
    timeRemaining,
    isExpired,
    formattedTime,
    resetTimer,
  };
}

export default useOtpTimer;
