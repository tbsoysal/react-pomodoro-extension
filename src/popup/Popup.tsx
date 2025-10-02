/**
 * Popup Component - Main Timer Interface
 * 
 * This is the main component shown when clicking the extension icon.
 * It displays the timer in one of three views: circular, digital, or segmented.
 */

import { } from "react";
import SegmentedTimerView from "./segmented_timer_view/SegmentedTimerView";
import CircularTimerView from "./circular_timer_view/CircularTimerView";
import DigitalTimerView from "./digital_timer_view/DigitalTimerView";
import { useTimerState } from "../hooks/useTimerState";
import { useStorage } from "../hooks/useStorage";
import { storage } from "../utils/storageUtils";
import { messages } from "../utils/messageUtils";
import { CIRCUMFERENCE } from "../constants";
import type { View } from "../types";

const Popup = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Timer state from background script
   * Automatically syncs with background and updates in real-time
   */
  const { timerState, loading: timerLoading } = useTimerState();

  /**
   * Theme/view preference from storage
   * Determines which timer view to show
   */
  const { value: theme, loading: themeLoading } = useStorage<View>(
    storage.getTheme,
    storage.setTheme,
    'circular' // Default to circular view
  );

  

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  /**
   * Show loading indicator while fetching initial data
   * Prevents rendering with incomplete data
   */
  if (timerLoading || themeLoading || !timerState) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-black text-2xl">Yükleniyor...</p>
      </div>
    );
  }

  // ============================================================================
  // TIMER CALCULATIONS
  // ============================================================================

  /**
   * Calculate progress percentage (0 to 1)
   * Used for visual progress indicators
   */
  const progress = timerState.duration > 0
    ? 1 - (timerState.timeLeft / timerState.duration)
    : 0;

  // ============================================================================
  // TIMER CONTROL HANDLERS
  // ============================================================================

  /**
   * Start/resume timer
   */
  const handleStart = async () => {
    try {
      await messages.startTimer();
    } catch (error) {
      console.log('Could not start timer:', error);
    }
  };

  /**
   * Pause timer
   */
  const handleStop = async () => {
    try {
      await messages.stopTimer();
    } catch (error) {
      console.log('Could not stop timer:', error);
    }
  };

  /**
   * Reset timer to initial state
   */
  const handleReset = async () => {
    try {
      await messages.resetTimer();
    } catch (error) {
      console.log('Could not reset timer:', error);
    }
  };

  /**
   * Change timer mode (focus, short_break, long_break)
   * @param mode - New mode to switch to
   */
  const handleModeChange = async (mode: keyof typeof timerState.mode_durations) => {
    try {
      await messages.changeMode(mode);
    } catch (error) {
      console.log('Could not change mode:', error);
    }
  };

  // ============================================================================
  // SHARED PROPS FOR ALL VIEWS
  // ============================================================================

  /**
   * Common props passed to all timer view components
   */
  const sharedProps = {
    // Current state
    currMode: timerState.mode,
    modes: timerState.mode_durations,
    remaining: timerState.timeLeft,
    status: timerState.status,

    // Progress indicators
    progress,
    circumference: CIRCUMFERENCE,

    // Control handlers
    startTime: handleStart,
    stopTime: handleStop,
    resetTime: handleReset,
    setCurrMode: handleModeChange,
  };

  // ============================================================================
  // VIEW SELECTION
  // ============================================================================

  /**
   * Render appropriate timer view based on theme preference
   */
  const renderView = () => {
    switch (theme) {
      case "circular":
        return <CircularTimerView {...sharedProps} />;
      case "digital":
        return <DigitalTimerView {...sharedProps} />;
      case "segmented":
        return <SegmentedTimerView {...sharedProps} />;
      default:
        return <CircularTimerView {...sharedProps} />;
    }
  };

  return <>{renderView()}</>;
};

export default Popup;
