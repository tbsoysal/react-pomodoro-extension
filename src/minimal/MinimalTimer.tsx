/**
 * Minimal Timer - Compact Always-On-Top View
 * 
 * A minimal, clean timer display for the floating window.
 * Shows only essential information without extra controls.
 */

import { } from "react";
import { useTimerState } from "../hooks/useTimerState";
import { useStorage } from "../hooks/useStorage";
import { storage } from "../utils/storageUtils";
import { messages } from "../utils/messageUtils";
import { CIRCUMFERENCE } from "../constants";
import type { View } from "../types";
import CircularTimer from "../popup/circular_timer_view/Timer";
import SegmentedTimer from "../popup/segmented_timer_view/Timer";
import "../main.css";

const MinimalTimer = () => {
  const { timerState, loading } = useTimerState();
  const { value: theme } = useStorage<View>(
    storage.getTheme,
    storage.setTheme,
    'circular'
  );
  

  if (loading || !timerState) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0D0C0C] to-[#1D1A19]">
        <p className="text-white text-sm">Yükleniyor...</p>
      </div>
    );
  }

  // Format time display
  const minutes = Math.floor(timerState.timeLeft / 60);
  const seconds = timerState.timeLeft % 60;

  // Calculate progress percentage
  const progressRatio = timerState.duration > 0 
    ? 1 - (timerState.timeLeft / timerState.duration)
    : 0;

  // Mode labels removed in mini view

  // Handle timer controls
  const handleToggleTimer = async () => {
    if (timerState.status === "running") {
      await messages.stopTimer();
    } else {
      await messages.startTimer();
    }
  };

  // Note: reset is not surfaced in the mini window per requirements

  // Mini displays per theme
  const renderMiniDisplay = () => {
    if (theme === 'circular') {
      return (
        <div className="scale-[0.9] -my-1">
          <CircularTimer
            remaining={timerState.timeLeft}
            progress={progressRatio}
            circumference={CIRCUMFERENCE}
          />
        </div>
      );
    }

    if (theme === 'segmented') {
      return (
        <div className="scale-[0.9] -my-1">
          <SegmentedTimer
            remaining={timerState.timeLeft}
          />
        </div>
      );
    }

    // digital: compact stacked numbers with right-side labels
    return (
      <div className="relative flex flex-col justify-center items-center my-1 w-full">
        <div className="flex items-baseline gap-2 leading-none">
          <p className={`text-5xl font-semibold text-white`}>{String(minutes).padStart(2, '0')}</p>
          <span className="text-xl text-[#6C6461]">min</span>
        </div>
        <div className="flex items-baseline gap-2 leading-none mt-1">
          <p className={`text-5xl font-semibold text-white`}>{String(seconds).padStart(2, '0')}</p>
          <span className="text-xl text-[#6C6461]">sec</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0D0C0C] to-[#1D1A19] flex flex-col items-center justify-between p-2">

      <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
        {renderMiniDisplay()}
      </div>

      <div className="w-full flex items-center justify-center gap-2 pb-1">
        <button
          onClick={() => { /* already mini */ }}
          className="flex items-center p-[6px] rounded-full bg-[#1D1A19]"
          title="Mini Window"
        >
          <img className="w-5 h-5" src="/icons/alwaysOnTop.svg" />
        </button>
        <button
          onClick={handleToggleTimer}
          className="px-[14px] py-[6px] bg-[#1D1A19] hover:bg-[#2A2625] text-white text-sm font-semibold rounded-full transition-colors duration-200"
        >
          {timerState.status === "running" ? "Duraklat" : "Başlat"}
        </button>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="flex items-center p-[6px] rounded-full bg-[#1D1A19]"
          title="Ayarlar"
        >
          <img className="w-5 h-5" src="/icons/options.svg" />
        </button>
      </div>
    </div>
  );
};

export default MinimalTimer;
