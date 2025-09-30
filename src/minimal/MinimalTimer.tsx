/**
 * Minimal Timer - Compact Always-On-Top View
 * 
 * A minimal, clean timer display for the floating window.
 * Shows only essential information without extra controls.
 */

import { useTimerState } from "../hooks/useTimerState";
import { messages } from "../utils/messageUtils";
import "../main.css";

const MinimalTimer = () => {
  const { timerState, loading } = useTimerState();

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
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate progress percentage
  const progress = timerState.duration > 0 
    ? (1 - (timerState.timeLeft / timerState.duration)) * 100
    : 0;

  // Mode labels
  const modeLabels: Record<string, string> = {
    focus: 'Odaklanma',
    short_break: 'Kısa Mola',
    long_break: 'Uzun Mola'
  };

  // Handle timer controls
  const handleToggleTimer = async () => {
    if (timerState.status === "running") {
      await messages.stopTimer();
    } else {
      await messages.startTimer();
    }
  };

  const handleReset = async () => {
    await messages.resetTimer();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#0D0C0C] to-[#1D1A19] flex flex-col items-center justify-center p-6">
      {/* Mode Badge */}
      <div className="mb-4">
        <span className="text-xs text-[#9F938F] uppercase tracking-wider">
          {modeLabels[timerState.mode]}
        </span>
      </div>

      {/* Timer Display */}
      <div className="relative mb-8">
        <div className="text-7xl font-bold text-white font-mono tracking-tight">
          {timeString}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-[280px] mb-6">
        <div className="h-1 bg-[#272322] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#D84315] to-[#FF6B3D] transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleToggleTimer}
          className="px-6 py-2.5 bg-gradient-to-b from-[#D84315] to-[#BF360C] hover:from-[#FF4D1C] hover:to-[#D84315] text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {timerState.status === "running" ? "Duraklat" : "Başlat"}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-[#1D1A19] hover:bg-[#2A2625] text-white text-sm font-semibold rounded-lg transition-colors duration-200"
        >
          Sıfırla
        </button>
      </div>

      {/* Status Indicator */}
      <div className="mt-6 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          timerState.status === "running" 
            ? "bg-green-500 animate-pulse" 
            : timerState.status === "paused"
            ? "bg-yellow-500"
            : "bg-gray-500"
        }`} />
        <span className="text-xs text-[#9F938F]">
          {timerState.status === "running" ? "Çalışıyor" : timerState.status === "paused" ? "Duraklatıldı" : "Durduruldu"}
        </span>
      </div>
    </div>
  );
};

export default MinimalTimer;
