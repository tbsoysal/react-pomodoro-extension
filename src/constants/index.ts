/**
 * Application Constants
 * 
 * Centralized constants for default values, storage keys, and configurations.
 * Makes it easy to update values in one place.
 */

import type { Modes } from '../types';

/**
 * Default timer durations (in minutes)
 * Used in UI and converted to seconds in background script
 */
export const DEFAULT_DURATIONS: Modes = {
  focus: 25,
  short_break: 5,
  long_break: 30
};

/**
 * Chrome storage keys
 * Using constants prevents typos and makes refactoring easier
 */
export const STORAGE_KEYS = {
  TIMER_STATE: 'timerState',
  DURATIONS: 'durations',
  THEME: 'theme',
  SELECTED_MODE: 'selectedMode',
  BLOCKED_SITES: 'blockedSites',
  BLOCK_NOTIFICATIONS: 'blockNotifications'
} as const;

/**
 * Mode name translations (English -> Turkish)
 * Keeps UI in Turkish while code uses English
 */
export const MODE_LABELS: Record<string, string> = {
  focus: 'Odak',
  short_break: 'Kısa Mola',
  long_break: 'Uzun Mola'
};

/**
 * Reverse mapping (Turkish -> English)
 * Used when converting UI selections to internal values
 */
export const MODE_KEYS: Record<string, string> = {
  'Odak': 'focus',
  'Kısa Mola': 'short_break',
  'Uzun Mola': 'long_break'
};

/**
 * SVG circle circumference for circular timer view
 * Calculated once to avoid repetition
 */
export const CIRCUMFERENCE = 2 * Math.PI * 72;
