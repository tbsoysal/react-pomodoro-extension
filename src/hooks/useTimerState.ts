/**
 * useTimerState Hook
 * 
 * Custom React hook for managing timer state.
 * Automatically syncs with background script and listens for updates.
 */

import { useState, useEffect } from 'react';
import type { TimerState } from '../types';
import { messages } from '../utils/messageUtils';

/**
 * Hook return type
 */
interface UseTimerStateReturn {
  timerState: TimerState | null;  // Current timer state
  loading: boolean;                // Loading indicator
  refreshState: () => void;        // Manual refresh function
}

/**
 * Custom hook for timer state management
 * 
 * Features:
 * - Fetches initial state on mount
 * - Listens for real-time updates from background
 * - Provides manual refresh function
 * 
 * @returns Timer state, loading status, and refresh function
 */
export const useTimerState = (): UseTimerStateReturn => {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch latest state from background script
   */
  const refreshState = async () => {
    try {
      const response = await messages.getCurrentState();
      if (response && response.success && response.reply) {
        setTimerState(response.reply);
      }
    } catch (error) {
      // Silently handle connection errors when popup is closing
      console.log('Could not fetch timer state:', error);
    }
  };

  // Fetch initial state on mount
  useEffect(() => {
    const fetchInitialState = async () => {
      await refreshState();
      setLoading(false);
    };
    fetchInitialState();
  }, []);

  // Listen for real-time updates from background
  useEffect(() => {
    const handleMessage = (message: any) => {
      // Update state when background sends TIMER_UPDATE
      if (message.type === "TIMER_UPDATE" && message.newTimerState) {
        setTimerState(message.newTimerState);
      }
    };

    // Register listener
    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Refresh state when popup becomes visible (handles tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshState();
      }
    };

    // Only add listener if document is available (not during popup close)
    if (document && document.addEventListener) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        if (document && document.removeEventListener) {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
    }
  }, []);

  return { timerState, loading, refreshState };
};
