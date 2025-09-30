import { useEffect, useState } from "react";
import SegmentedTimerView from "./segmented_timer_view/SegmentedTimerView";
import CircularTimerView from "./circular_timer_view/CircularTimerView";
import DigitalTimerView from "./digital_timer_view/DigitalTimerView";

const Popup = () => {
  type Modes = {
    focus: number,
    short_break: number,
    long_break: number
  }

  type TimerStatus = "running" | "stopped" | "paused";
  type View = "circular" | "digital" | "segmented";

  const circumference = 2 * Math.PI * 72;
  const [modes, setModes] = useState<Modes>({
    "focus": 25,
    "short_break": 5,
    "long_break": 30
  });
  const [currMode, setCurrMode] = useState<keyof Modes>("focus");
  const [duration, setDuration] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>("stopped");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [theme, setTheme] = useState<View>("circular");
  const progress = duration > 0 ? 1 - (remaining / duration) : 0;


  // Get timerState from background script
  function getLatestTimerState() {
    chrome?.runtime?.sendMessage({ type: "GET_CURRENT_STATE" }, (response) => {
      if (response?.success && response.reply) {
        const timerState = response.reply;
        setCurrMode(timerState.mode);
        setDuration(timerState.duration);
        setRemaining(timerState.timeLeft);
        setStatus(timerState.status);
        setModes(timerState.mode_durations)
      }
    });
  }

  function getLatestTheme() {
    chrome.storage.sync.get("theme", (data) => {
      if (data.theme) {
        setTheme(data.theme);
        console.log("Latest theme getted from storage: ", data.theme);
      } else {
        console.log("No theme found on storage");
      }
    })
  }

  useEffect(() => {
    getLatestTheme();
    getLatestTimerState();

    // Listen for updates from background script
    const handleMessage = (message: any) => {
      if (message.type === "TIMER_UPDATE") {
        const timerState = message.newTimerState;
        setDuration(timerState.duration);
        setRemaining(timerState.timeLeft);
        setStatus(timerState.status);
        setCurrMode(timerState.mode); // Remove conditional logic
        setModes(timerState.mode_durations); // Add this line to update modes
      }
    }
    chrome?.runtime?.onMessage.addListener(handleMessage);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        getLatestTimerState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      chrome?.runtime?.onMessage.removeListener(handleMessage);
      document.removeEventListener('visibilitychange', handleVisibilityChange); // Cleanup
    };
  }, []);

  useEffect(() => {
    changeMode();
  }, [currMode])

  useEffect(() => {
    changeDurations();
  }, [modes])


  const startTime = () => chrome?.runtime?.sendMessage({ type: "START_TIMER" }, (response) => console.log(response.reply));
  const stopTime = () => chrome?.runtime?.sendMessage({ type: "STOP_TIMER" }, (response) => console.log(response.reply));
  const resetTime = () => chrome?.runtime?.sendMessage({ type: "RESET_TIMER" }, (response) => console.log(response.reply));
  const changeMode = () => chrome?.runtime?.sendMessage({ type: "CHANGE_MODE", newMode: currMode }, (response) => console.log(response.reply));
  const changeDurations = () => chrome?.runtime?.sendMessage({ type: "CHANGE_DURATIONS" }, (response) => (response.reply));

  const props = {
    isDarkMode,
    setIsDarkMode,
    currMode,
    setCurrMode,
    modes,
    setModes,
    remaining,
    progress,
    circumference,
    status,
    startTime,
    stopTime,
    resetTime,
  }

  let themeToShow;

  if (theme === "circular")
    themeToShow = <CircularTimerView {...props} />;
  else if (theme === "digital")
    themeToShow = <DigitalTimerView {...props} />;
  else
    themeToShow = <SegmentedTimerView {...props} />;

  return (
    <>
      {themeToShow}
    </>
  )
}

export default Popup;
