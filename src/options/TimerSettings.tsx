/**
 * Timer Settings Component
 * 
 * Allows users to customize timer durations and mode selection.
 * Changes are automatically synced to storage and background script.
 */

import { useState, useEffect } from "react";
import type { Modes, ModeKey } from "../types";
import { MODE_LABELS, MODE_KEYS } from "../constants";
import { storage } from "../utils/storageUtils";
import { messages } from "../utils/messageUtils";

/**
 * Component props
 */
interface TimerSettingsProps {
  durations: Modes;
  setDurations: (durations: Modes) => void;
}

const TimerSettings = ({ durations, setDurations }: TimerSettingsProps) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Selected mode (for mode switcher)
   * Uses Turkish labels for UI
   */
  const [selectedMode, setSelectedMode] = useState<string>(MODE_LABELS.focus);

  /**
   * Duration inputs (local state for form inputs)
   * Synced with parent durations prop
   */
  const [focusTime, setFocusTime] = useState<number>(durations.focus);
  const [shortBreak, setShortBreak] = useState<number>(durations.short_break);
  const [longBreak, setLongBreak] = useState<number>(durations.long_break);

  /**
   * Toggle for showing pomodoro count
   */
  const [showPomodoroCount, setShowPomodoroCount] = useState<boolean>(false);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Load saved mode selection on mount
   */
  useEffect(() => {
    const loadSavedMode = async () => {
      const savedMode = await storage.getSelectedMode();
      if (savedMode) {
        setSelectedMode(MODE_LABELS[savedMode]);
      }
    };
    loadSavedMode();
  }, []);

  /**
   * Sync local state when parent durations change
   * (e.g., when loaded from storage)
   */
  useEffect(() => {
    setFocusTime(durations.focus);
    setShortBreak(durations.short_break);
    setLongBreak(durations.long_break);
  }, [durations]);

  // ============================================================================
  // DURATION UPDATE HANDLER
  // ============================================================================

  /**
   * Update parent durations when local inputs change
   * This triggers storage save in parent component
   */
  useEffect(() => {
    const newDurations: Modes = {
      focus: focusTime,
      short_break: shortBreak,
      long_break: longBreak
    };
    
    // Only update if values actually changed
    if (
      newDurations.focus !== durations.focus ||
      newDurations.short_break !== durations.short_break ||
      newDurations.long_break !== durations.long_break
    ) {
      setDurations(newDurations);
      // Notify background script to reload durations
      messages.changeDurations();
    }
  }, [focusTime, shortBreak, longBreak]);

  // ============================================================================
  // MODE CHANGE HANDLER
  // ============================================================================

  /**
   * Handle mode selection change
   * Saves to storage and notifies background script
   */
  const handleModeChange = async (turkishMode: string) => {
    setSelectedMode(turkishMode);
    
    // Convert Turkish label to English key
    const modeKey = MODE_KEYS[turkishMode] as ModeKey;
    
    // Save to storage
    await storage.setSelectedMode(modeKey);
    
    // Notify background to change mode
    await messages.changeMode(modeKey);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-[#0D0402] text-white p-6 rounded-xl w-full mx-auto">
      {/* ========== HEADER ========== */}
      <h2 className="text-lg font-medium">Zamanlayıcı</h2>

      {/* ========== MODE SELECTION ========== */}
      <div className="flex py-6">
        <label className="block w-[344px] text-sm font-medium text-[#9F938F] mb-2">
          Zamanlayıcı modunu seçebilirsiniz
        </label>
        <div className="flex flex-col gap-1 w-[344px]">
          <span className="w-full text-[#9F938F]">Mod</span>
          <select
            value={selectedMode}
            onChange={(e) => handleModeChange(e.target.value)}
            className="bg-[#1D1A19] rounded-lg font-medium text-[#CEC8C6] py-2.5 px-3.5 text-sm w-full outline-0 cursor-pointer"
          >
            <option value={MODE_LABELS.focus}>Odak</option>
            <option value={MODE_LABELS.short_break}>Kısa Mola</option>
            <option value={MODE_LABELS.long_break}>Uzun Mola</option>
          </select>
        </div>
      </div>

      <hr className="border-neutral-800" />

      {/* ========== TIMER DURATION SETTINGS ========== */}
      <div className="flex py-6">
        <label className="block w-[344px] text-sm font-medium text-[#9F938F] mb-2">
          Zamanlayıcı ayarları
        </label>
        <div className="grid w-[712px] grid-cols-3 gap-4">
          {/* Focus duration */}
          <div>
            <label className="block text-sm text-[#9F938F] mb-1">
              Odak (dakika)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={focusTime}
              onChange={(e) => setFocusTime(Number(e.target.value))}
              className="bg-[#1D1A19] font-medium text-sm rounded-lg px-4 py-2 w-full"
            />
          </div>

          {/* Short break duration */}
          <div>
            <label className="block text-sm text-[#9F938F] mb-1">
              Kısa Mola (dakika)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              className="bg-[#1D1A19] font-medium text-sm rounded-lg px-4 py-2 w-full"
            />
          </div>

          {/* Long break duration */}
          <div>
            <label className="block text-sm text-[#9F938F] mb-1">
              Uzun Mola (dakika)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={longBreak}
              onChange={(e) => setLongBreak(Number(e.target.value))}
              className="bg-[#1D1A19] font-medium text-sm rounded-lg px-4 py-2 w-full"
            />
          </div>
        </div>
      </div>

      <hr className="border-neutral-800" />

      {/* ========== POMODORO COUNT TOGGLE ========== */}
      <div className="flex py-6 items-center">
        <label className="block w-[344px] text-sm font-medium text-[#9F938F] mb-2">
          Odak sayısı
        </label>

        <label className="flex gap-2">
          <div className="flex w-9 h-5 items-center">
            <button
              onClick={() => setShowPomodoroCount((prev) => !prev)}
              className={`
                w-full h-full flex items-center rounded-xl p-0.5 transition-colors cursor-pointer
                ${showPomodoroCount ? "bg-green-500 justify-end" : "bg-gray-700 justify-start"}
              `}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-md cursor-pointer"></div>
            </button>
          </div>
          <label className="text-sm font-medium text-[#9F938F]">
            Widget üstünde tamamladığın pomodoro sayısını göster.
          </label>
        </label>
      </div>

      <hr className="border-neutral-800" />
    </div>
  );
};

export default TimerSettings;