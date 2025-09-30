import { useEffect, useState } from "react";
import Sidebar from "./SideBar.tsx";
import ViewSettings from "./ViewSettings.tsx";
import TimerSettings from "./TimerSettings.tsx";
import Profile from "./Profile.tsx";
import StatsSettings from "./StatsSettings.tsx";
import PermissionsSettings from "./Permissions.tsx";

function Options() {
  const [selected, setSelected] = useState("appearance");
  const [currView, setCurrView] = useState("circular");
  const [durations, setDurations] = useState({ focus: 25, short_break: 5, long_break: 30 });

  // İlk açıldığında storage'dan oku
  useEffect(() => {
    chrome.storage.local.get("theme", (data) => {
      if (data.theme) {
        setCurrView(data.theme);
      }
    });
    chrome.storage.local.get("durations", (data) => {
      if (data.durations) {
        setDurations(data.durations)
      }
    });
  }, []); // sadece bir kere çalışır

  // State değiştikçe storage'a yaz
  useEffect(() => {
    chrome.storage.local.set({ theme: currView }, () => {
    });
    chrome.storage.local.set({ durations: durations }, () => {
    });
  }, [currView, durations]);

  let currentTab;
  switch (selected) {
    case "appearance":
      currentTab = <ViewSettings currView={currView} setCurrView={setCurrView} />
      break;
    case "timer":
      currentTab = <TimerSettings durations={durations} setDurations={setDurations} />
      break;
    case "permissions":
      currentTab = <PermissionsSettings />
      break;
    case "stats":
      currentTab = <StatsSettings />
      break;
    case "profile":
      currentTab = <Profile />
      break;

  }

  return (
    <div className="flex bg-[#0D0402]">
      <Sidebar selectedId={selected} onSelect={setSelected} />
      <main className="flex-1 border-l border-[#272322]">
        <h1 className="font-semibold text-white text-2xl p-6 border-b border-[#272322]">Hoşgeldin Meryem!</h1>
        {currentTab}
      </main>
    </div>
  );
}
export default Options;

