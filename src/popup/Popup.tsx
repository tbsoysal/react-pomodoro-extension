import { useEffect, useState } from "react";
import DigitalTimerView from "./digital_timer_view/DigitalTimerView";

const Popup = () => {
  type Modes = {
    focus: number,
    short_break: number,
    long_break: number
  }

  type TimerStatus = "running" | "stopped" | "paused";

  const circumference = 2 * Math.PI * 72;
  const [_modes, _setModes] = useState<Modes>({
    "focus": 25,
    "short_break": 5,
    "long_break": 30
  });
  const [currMode, setCurrMode] = useState<keyof Modes>("focus");
  const [duration, setDuration] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>("stopped");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
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
      }
    });
  }

  useEffect(() => {
    getLatestTimerState();

    // Listen for updates from background script
    const handleMessage = (message: any) => {
      if (message.type === "TIMER_UPDATE") {
        const timerState = message.newTimerState;
        setDuration(timerState.duration);
        setRemaining(timerState.timeLeft);
        setStatus(timerState.status);
        setCurrMode((prev) => {
          if (prev !== timerState.mode)
            return timerState.mode;
          return prev;
        });
      }
    }
    chrome?.runtime?.onMessage.addListener(handleMessage);

    return () => chrome?.runtime?.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    changeMode();
  }, [currMode])


  const startTime = () => chrome?.runtime?.sendMessage({ type: "START_TIMER" }, (response) => console.log(response.reply));
  const stopTime = () => chrome?.runtime?.sendMessage({ type: "STOP_TIMER" }, (response) => console.log(response.reply));
  const resetTime = () => chrome?.runtime?.sendMessage({ type: "RESET_TIMER" }, (response) => console.log(response.reply));
  const changeMode = () => chrome?.runtime?.sendMessage({ type: "CHANGE_MODE", newMode: currMode }, (response) => console.log(response.reply));

  const props = {
    isDarkMode,
    setIsDarkMode,
    currMode,
    setCurrMode,
    remaining,
    progress,
    circumference,
    status,
    startTime,
    stopTime,
    resetTime,
  }

  return (
    <>
      <DigitalTimerView {...props} />
    </>
  )
}

export default Popup;
