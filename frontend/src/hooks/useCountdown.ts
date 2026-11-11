import { useState, useEffect, useRef } from "react";

export interface UseCountdownOptions {
  expiresAt?: string | Date | null;
  onExpire?: () => void;
  enabled?: boolean;
}

export interface UseCountdownResult {
  remainingSeconds: number;
  formattedTime: string; // "MM:SS" or "HH:MM:SS"
  isExpired: boolean;
  minutes: number;
  seconds: number;
  hours: number;
}

export const useCountdown = ({
  expiresAt,
  onExpire,
  enabled = true,
}: UseCountdownOptions): UseCountdownResult => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const hasFiredExpireRef = useRef(false);

  useEffect(() => {
    hasFiredExpireRef.current = false;
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt || enabled === false) {
      return;
    }

    const calculate = (): number => {
      try {
        const target = new Date(expiresAt).getTime();
        const diff = Math.floor((target - Date.now()) / 1000);
        return Math.max(0, diff);
      } catch {
        return 0;
      }
    };

    const tick = () => {
      const remaining = calculate();
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !hasFiredExpireRef.current) {
        hasFiredExpireRef.current = true;
        onExpireRef.current?.();
      }
    };

    // Defer the initial tick asynchronously to avoid synchronous cascading renders
    const initialTimeout = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [expiresAt, enabled]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isExpired = remainingSeconds <= 0 && Boolean(expiresAt);

  return {
    remainingSeconds,
    formattedTime,
    isExpired,
    hours,
    minutes,
    seconds,
  };
};
