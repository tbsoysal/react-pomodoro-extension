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

/**
 * Custom hook to animate a circle strokeDashoffset using requestAnimationFrame
 * @param duration - total time of the countdown in milliseconds
 * @param radius - radius of the circle (default: 72)
 */
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
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState<TimerState>({ minutes: 0, seconds: 0 });

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
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, animate]);

  /**
   * Pause the animation
   */
  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

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
