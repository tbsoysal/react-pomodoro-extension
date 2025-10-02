/**
 * Chrome Storage Utilities
 * 
 * Wrapper functions for Chrome storage API.
 * Provides type-safe, Promise-based storage operations.
 */

import { STORAGE_KEYS } from '../constants';
import type { Modes, TimerState, View, ModeKey } from '../types';

/**
 * Storage utility object with get/set methods for each data type
 */
export const storage = {
  /**
   * Get timer state from storage
   * @returns Promise resolving to TimerState or null
   */
  getTimerState(): Promise<TimerState | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEYS.TIMER_STATE, (data) => {
        resolve(data[STORAGE_KEYS.TIMER_STATE] || null);
      });
    });
  },

  /**
   * Get custom durations from storage
   * @returns Promise resolving to Modes or null
   */
  getDurations(): Promise<Modes | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEYS.DURATIONS, (data) => {
        resolve(data[STORAGE_KEYS.DURATIONS] || null);
      });
    });
  },

  /**
   * Get theme/view preference from storage
   * @returns Promise resolving to View or null
   */
  getTheme(): Promise<View | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEYS.THEME, (data) => {
        resolve(data[STORAGE_KEYS.THEME] || null);
      });
    });
  },

  /**
   * Get selected mode from storage
   * @returns Promise resolving to ModeKey or null
   */
  getSelectedMode(): Promise<ModeKey | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEYS.SELECTED_MODE, (data) => {
        resolve(data[STORAGE_KEYS.SELECTED_MODE] || null);
      });
    });
  },

  /**
   * Save timer state to storage
   * @param state - TimerState to save
   */
  setTimerState(state: TimerState): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.TIMER_STATE]: state }, () => {
        resolve();
      });
    });
  },

  /**
   * Save custom durations to storage
   * @param durations - Modes object to save
   */
  setDurations(durations: Modes): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.DURATIONS]: durations }, () => {
        resolve();
      });
    });
  },

  /**
   * Save theme/view preference to storage
   * @param theme - View type to save
   */
  setTheme(theme: View): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.THEME]: theme }, () => {
        resolve();
      });
    });
  },

  /**
   * Save selected mode to storage
   * @param mode - ModeKey to save
   */
  setSelectedMode(mode: ModeKey): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.SELECTED_MODE]: mode }, () => {
        resolve();
      });
    });
  },

  /**
   * Get blocked sites from storage
   * @returns Promise resolving to array of blocked site URLs
   */
  getBlockedSites(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(STORAGE_KEYS.BLOCKED_SITES, (data) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting blocked sites:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve(data[STORAGE_KEYS.BLOCKED_SITES] || []);
        }
      });
    });
  },

  /**
   * Save blocked sites to storage
   * @param sites - Array of site URLs to block
   */
  setBlockedSites(sites: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: sites }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving blocked sites:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Get notification blocking preference from storage
   * @returns Promise resolving to boolean or null
   */
  getBlockNotifications(): Promise<boolean | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEYS.BLOCK_NOTIFICATIONS, (data) => {
        resolve(data[STORAGE_KEYS.BLOCK_NOTIFICATIONS] ?? null);
      });
    });
  },

  /**
   * Save notification blocking preference to storage
   * @param blockNotifications - Whether to block notifications during focus mode
   */
  setBlockNotifications(blockNotifications: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.BLOCK_NOTIFICATIONS]: blockNotifications }, () => {
        resolve();
      });
    });
  }
};
