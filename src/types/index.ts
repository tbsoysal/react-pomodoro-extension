/**
 * Shared Type Definitions for Pomodoro Extension
 * 
 * This file contains all TypeScript interfaces and types used across the extension.
 * Centralizing types ensures consistency and reduces duplication.
 */

// Timer mode durations (in minutes for UI, seconds for background)
export interface Modes {
  focus: number;
  short_break: number;
  long_break: number;
}

// Valid mode keys
export type ModeKey = keyof Modes;

// Timer status states
export type TimerStatus = "running" | "stopped" | "paused";

// Complete timer state object
export interface TimerState {
  timeLeft: number;           // Remaining time in seconds
  duration: number;            // Total duration in seconds
  status: TimerStatus;         // Current timer status
  mode: ModeKey;              // Current active mode
  mode_durations: Modes;      // All mode durations
}

// Available UI themes/views
export type View = "circular" | "digital" | "segmented";

// Chrome message types for communication
export type MessageType = 
  | "GET_CURRENT_STATE"   // Request current timer state
  | "START_TIMER"         // Start/resume timer
  | "STOP_TIMER"          // Pause timer
  | "RESET_TIMER"         // Reset timer to initial state
  | "CHANGE_MODE"         // Switch timer mode
  | "CHANGE_DURATIONS"    // Update mode durations
  | "TIMER_UPDATE";       // Timer state update broadcast

// Chrome message structure
export interface ChromeMessage {
  type: MessageType;
  newMode?: ModeKey;
  newTimerState?: TimerState;
}

// Response from background script
export interface ChromeResponse<T = any> {
  success?: boolean;
  reply: T;
}
