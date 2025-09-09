import { useCallback, useEffect, useRef, useState } from "react";

interface TimerState {
  minutes: number;
  seconds: number;
}

interface UseCircleTimerReturn {
  circumference: number;
  offset: number;
  isRunning: boolean;
  currentTime: TimerState;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useCircleTimer(
  duration: number,
  radius: number = 72
): UseCircleTimerReturn {

  // Constants
  const circumference = 2 * Math.PI * radius;
  const initialTime = {
    minutes: Math.floor(duration / 60000),
    seconds: Math.floor((duration / 1000) % 60)
  };

  // State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<TimerState>(initialTime);

  // Refs for persistent values
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const currOffsetRef = useRef<number>(circumference);


  /**
   * Convert milliseconds to minutes and seconds
   */
  const msToTime = useCallback((ms: number): TimerState => {
    const totalSeconds = Math.floor(ms / 1000);
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60
    };
  }, []);

  /**
   * Animation loop executed every frame
   */
  const animate = useCallback((now: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = now;
    }

    const elapsed = now - startTimeRef.current + pausedTimeRef.current;
    const remaining = Math.max(duration - elapsed, 0);

    setCurrentTime(msToTime(remaining));

    if (remaining > 0) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      reset();
    }
  }, [duration, msToTime]);

  /**
   * Start or resume the animation
   */
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      chrome.storage.local.set({ IsRunning: true });
      chrome.storage.local.get(["IsRunning"], (result) => {
        console.log("(start func)IsRunning is ", result.IsRunning)
      })
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, animate]);

  /**
   * Pause the animation
   */
  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      chrome.storage.local.set({ IsRunning: false });
      chrome.storage.local.get(["IsRunning"], (result) => {
        console.log("(pause func)IsRunning is ", result.IsRunning)
      })

      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }

      if (startTimeRef.current !== null) {
        pausedTimeRef.current += performance.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
    }
  }, [isRunning]);

  /**
   * Reset the animation to the beginning
   */
  const reset = useCallback(() => {
    setIsRunning(false);
    chrome.storage.local.set({ IsRunning: false });
    chrome.storage.local.get(["IsRunning"], (result) => {
      console.log("(reset func)IsRunning is ", result.IsRunning)
    })

    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }

    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setCurrentTime(initialTime);
    currOffsetRef.current = circumference;
  }, [initialTime]);

  // Calculate offset directly from remaining time
  const getCurrentOffset = useCallback((): number => {
    if (startTimeRef.current === null) {
      return currOffsetRef.current;
    }

    const elapsed = performance.now() - startTimeRef.current + pausedTimeRef.current;
    const remaining = Math.max(duration - elapsed, 0);
    currOffsetRef.current = ((remaining / duration) * circumference)

    return currOffsetRef.current;
  }, [duration]);

  useEffect(() => {
    setCurrentTime(initialTime);
    chrome.storage.local.get(["IsRunning"], (result) => {
      if (result.IsRunning !== undefined)
        console.log("(useEffect)IsRunning is ", result.IsRunning)
      else {
        console.log("Its undefined so i defined it as False");
        chrome.storage.local.set({ IsRunning: false })
      }
    })
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [duration]);

  return {
    circumference,
    offset: getCurrentOffset(),
    isRunning,
    currentTime,
    start,
    pause,
    reset,
  };
}
