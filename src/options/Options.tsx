/**
 * Options Page Component
 * 
 * Full-page settings interface for the Pomodoro extension.
 * Accessible via right-click on extension icon > Options.
 */

import { useState } from "react";
import Sidebar from "./SideBar";
import ViewSettings from "./ViewSettings";
import TimerSettings from "./TimerSettings";
import Profile from "./Profile";
import StatsSettings from "./StatsSettings";
import PermissionsSettings from "./Permissions";
import { useStorage } from "../hooks/useStorage";
import { storage } from "../utils/storageUtils";
import { DEFAULT_DURATIONS } from "../constants";
import type { View, Modes } from "../types";

/**
 * Available settings tabs
 */
type SettingsTab = "appearance" | "timer" | "permissions" | "stats" | "profile";

function Options() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Currently selected settings tab
   */
  const [selected, setSelected] = useState<SettingsTab>("appearance");

  /**
   * Timer view preference (circular, digital, segmented)
   * Synced with Chrome storage
   */
  const { value: currView, setValue: setCurrView } = useStorage<View>(
    storage.getTheme,
    storage.setTheme,
    'circular' // Default view
  );

  /**
   * Custom timer durations
   * Synced with Chrome storage
   */
  const { value: durations, setValue: setDurations } = useStorage<Modes>(
    storage.getDurations,
    storage.setDurations,
    DEFAULT_DURATIONS // Default durations
  );

  // ============================================================================
  // TAB CONTENT RENDERING
  // ============================================================================

  /**
   * Render the appropriate settings component based on selected tab
   */
  const renderCurrentTab = () => {
    switch (selected) {
      case "appearance":
        // Theme/view selection
        return <ViewSettings currView={currView} setCurrView={setCurrView} />;

      case "timer":
        // Timer duration settings
        return <TimerSettings durations={durations} setDurations={setDurations} />;

      case "permissions":
        // Extension permissions
        return <PermissionsSettings />;

      case "stats":
        // Usage statistics
        return <StatsSettings />;

      case "profile":
        // User profile
        return <Profile />;

      default:
        return <ViewSettings currView={currView} setCurrView={setCurrView} />;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex bg-[#0D0402]">
      {/* Sidebar navigation */}
      <Sidebar selectedId={selected} onSelect={(id) => setSelected(id as SettingsTab)} />

      {/* Main content area */}
      <main className="flex-1 border-l border-[#272322]">
        {/* Header */}
        <h1 className="font-semibold text-white text-2xl p-6 border-b border-[#272322]">
          Hoşgeldin!
        </h1>

        {/* Settings content */}
        {renderCurrentTab()}
      </main>
    </div>
  );
}

export default Options;
