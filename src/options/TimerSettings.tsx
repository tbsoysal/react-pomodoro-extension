import React, { useEffect, useState } from "react";

type Mode = "Odak" | "Kısa Mola" | "Uzun Mola";
type Durations = { focus: number, short_break: number, long_break: number };
type Props = {
  durations: Durations,
  setDurations: React.Dispatch<React.SetStateAction<Durations>>
}

const TimerSettings = ({ durations, setDurations }: Props) => {
  const [mode, setMode] = useState<Mode>("Odak");
  const [focusTime, setFocusTime] = useState<number>(durations.focus);
  const [shortBreak, setShortBreak] = useState<number>(durations.short_break);
  const [longBreak, setLongBreak] = useState<number>(durations.long_break);
  const [showPomodoroCount, setShowPomodoroCount] = useState<boolean>(false);

  useEffect(() => {
    setFocusTime(durations.focus)
    setShortBreak(durations.short_break)
    setLongBreak(durations.long_break)
  }, [durations]);

  useEffect(() => {
    const newDurations: Durations = {
      focus: focusTime,
      short_break: shortBreak,
      long_break: longBreak
    };
    setDurations(newDurations);
  }, [focusTime, shortBreak, longBreak]);

  // Load saved mode from storage
  useEffect(() => {
    chrome.storage.local.get("selectedMode", (data) => {
      if (data.selectedMode) {
        const reverseMap: { [key: string]: Mode } = {
          "focus": "Odak",
          "short_break": "Kısa Mola",
          "long_break": "Uzun Mola"
        };
        setMode(reverseMap[data.selectedMode]);
      }
    });
  }, []);

  return (
    <div className="bg-[#0D0402] text-white p-6 rounded-xl w-full mx-auto">
      {/* Header */}
      <h2 className="text-lg font-medium">Zamanlayıcı</h2>

      {/* Mode Selection */}
      <div className="flex py-6">
        <label className="block w-[344px] text-sm font-medium text-[#9F938F] mb-2">
          Zamanlayıcı modunu seçebilirsiniz
        </label>
        <div className="flex flex-col gap-1 w-[344px]">
          <span className="w-full text-[#9F938F]">Mod</span>
          <select
            value={mode}
            onChange={(e) => {
              const newMode = e.target.value as Mode;
              setMode(newMode);

              const modeMap = {
                "Odak": "focus",
                "Kısa Mola": "short_break",
                "Uzun Mola": "long_break"
              };

              chrome.storage.local.set({ selectedMode: modeMap[newMode] });

              chrome.runtime.sendMessage({
                type: "CHANGE_MODE",
                newMode: modeMap[newMode]
              });
            }}
            className="bg-[#1D1A19] rounded-lg font-medium text-[#CEC8C6] py-2.5 px-3.5 text-sm w-full outline-0 cursor-pointer"
          >
            <option value="Odak">Odak</option>
            <option value="Kısa Mola">Kısa Mola</option>
            <option value="Uzun Mola">Uzun Mola</option>
          </select>
        </div>
      </div>

      <hr className="border-neutral-800" />

      {/* Timer Settings */}
      <div className="flex py-6">
        <label className="block w-[344px] text-sm font-medium text-[#9F938F] mb-2">
          Zamanlayıcı ayarları
        </label>
        <div className="grid w-[712px] grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[#9F938F] mb-1">Odak</label>
            <input
              type="number"
              value={focusTime}
              onChange={(e) => setFocusTime(Number(e.target.value))}
              className="bg-[#1D1A19] font-medium text-sm rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9F938F] mb-1">Kısa Mola</label>
            <input
              type="number"
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              className="bg-[#1D1A19] font-medium text-sm rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-[#9F938F] mb-1">Uzun Mola</label>
            <input
              type="number"
              value={longBreak}
              onChange={(e) => setLongBreak(Number(e.target.value))}
              className="bg-[#1D1A19] font-medium text-sm rounded-lg px-4 py-2 w-full"
            />
          </div>
        </div>
      </div>

      <hr className="border-neutral-800" />

      {/* Toggle */}
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
          <label className="text-sm font-medium text-[#9F938F]">Widget üstünde tamamladığın pomodoro sayısını göster.</label>
        </label>
      </div>

      <hr className="border-neutral-800" />
    </div >
  );
}

export default TimerSettings
