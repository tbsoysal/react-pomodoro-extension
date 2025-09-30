/**
 * Time Conversion Utilities
 * 
 * Helper functions for time conversions and formatting.
 */

/**
 * Convert minutes to seconds
 * @param minutes - Time in minutes
 * @returns Time in seconds
 */
export const minutesToSeconds = (minutes: number): number => {
  return minutes * 60;
};

/**
 * Convert seconds to minutes
 * @param seconds - Time in seconds
 * @returns Time in minutes
 */
export const secondsToMinutes = (seconds: number): number => {
  return seconds / 60;
};

/**
 * Format seconds into MM:SS string
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "25:00")
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Convert Modes object from minutes to seconds
 * @param modes - Mode durations in minutes
 * @returns Mode durations in seconds
 */
export const convertModesToSeconds = (modes: { focus: number; short_break: number; long_break: number }) => {
  return {
    focus: minutesToSeconds(modes.focus),
    short_break: minutesToSeconds(modes.short_break),
    long_break: minutesToSeconds(modes.long_break)
  };
};
