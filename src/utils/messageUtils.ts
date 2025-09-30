/**
 * Chrome Messaging Utilities
 * 
 * Helper functions for communication between popup and background script.
 * Provides type-safe, Promise-based messaging.
 */

import type { ChromeMessage, ChromeResponse, TimerState, ModeKey } from '../types';

/**
 * Generic message sender
 * @param message - Message to send to background script
 * @returns Promise resolving to response
 */
const sendMessage = <T = any>(message: ChromeMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Message utility object with methods for each message type
 * Provides clean API for popup-background communication
 */
export const messages = {
  /**
   * Get current timer state from background
   * @returns Promise with timer state
   */
  getCurrentState: (): Promise<ChromeResponse<TimerState>> => {
    return sendMessage({ type: "GET_CURRENT_STATE" });
  },

  /**
   * Start/resume the timer
   * @returns Promise with success message
   */
  startTimer: (): Promise<ChromeResponse<string>> => {
    return sendMessage({ type: "START_TIMER" });
  },

  /**
   * Pause the timer
   * @returns Promise with success message
   */
  stopTimer: (): Promise<ChromeResponse<string>> => {
    return sendMessage({ type: "STOP_TIMER" });
  },

  /**
   * Reset timer to initial state
   * @returns Promise with success message
   */
  resetTimer: (): Promise<ChromeResponse<string>> => {
    return sendMessage({ type: "RESET_TIMER" });
  },

  /**
   * Change timer mode
   * @param newMode - Mode to switch to
   * @returns Promise with success message
   */
  changeMode: (newMode: ModeKey): Promise<ChromeResponse<string>> => {
    return sendMessage({ type: "CHANGE_MODE", newMode });
  },

  /**
   * Notify background to reload durations from storage
   * @returns Promise with success message
   */
  changeDurations: (): Promise<ChromeResponse<string>> => {
    return sendMessage({ type: "CHANGE_DURATIONS" });
  }
};
