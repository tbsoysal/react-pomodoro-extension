import { useEffect, useState } from "react";
import Controlls from "./Controlls";
import TabMenu from "./TabMenu";
import Timer from "./Timer";

const Popup = () => {
  type Modes = {
    focus: number,
    short_break: number,
    long_break: number
  }

  type TimerStatus = "running" | "stopped" | "paused";

  const circumference = 2 * Math.PI * 72;
  const [modes, setModes] = useState<Modes>({
    "focus": 25,
    "short_break": 5,
    "long_break": 30
  });
  const [currMode, setCurrMode] = useState<keyof Modes>("focus");
  const [duration, setDuration] = useState<number>(modes[currMode] * 60 * 1000); // converting the milliseconds
  const [remaining, setRemaining] = useState<number>(modes[currMode] * 60 * 1000); // converting the milliseconds
  const [status, setStatus] = useState<TimerStatus>("stopped");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const progress = duration > 0 ? 1 - (remaining / duration) : 0;

  useEffect(() => {
    // Get default durations from background script
    chrome.runtime.sendMessage({ type: "GET_DEFAULT_DURATIONS" }, (response) => {
      if (response?.success && response.durations) {
        setModes(response.durations);
        setDuration(response.durations[currMode] * 60 * 1000);
        setRemaining(response.durations[currMode] * 60 * 1000);
      }
    })

    // Get current timer state
    chrome.runtime.sendMessage({ type: "GET_TIMER_STATE" }, (response) => {
      if (response?.success && response.state) {
        const state = response.state;
        setStatus(state.status);
        setRemaining(state.remaining);
        setDuration(state.duration);
        if (state.mode) {
          setCurrMode(state.mode);
        }
      }
    })

    // call back function for messages incoming from the script
    const messageListener = (msg: any) => {
      if (msg.type === "TIMER_UPDATE") {
        setRemaining(msg.remaining);
        setStatus(msg.status);
        setDuration(msg.duration);
        if (msg.mode) {
          setCurrMode(msg.mode);
        }
      } else if (msg.type === "TIMER_COMPLETED") {
        setStatus("stopped");
        setRemaining(0);
        console.log(`Timer completed: ${msg.mode}`);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    }
  }, []);

  // Reset time when mode changes
  useEffect(() => {
    changeMode();
    resetTime();
  }, [currMode, modes]);

  // Reset time when timer ends
  useEffect(() => {
    if (status === "stopped") {
      resetTime();
    }
  }, [status])

  // Timer control functions
  const startTime = () => {
    chrome.runtime.sendMessage({
      type: "START_TIMER",
      duration: modes[currMode],
      mode: currMode
    }, (response) => {
      if (response?.success) {
        setStatus(response.state.status);
        setRemaining(response.state.remaining);
        setDuration(response.status.duration);
      }
    });
  };

  const pauseTime = () => {
    chrome.runtime.sendMessage({ type: "PAUSE_TIMER" }, (response) => {
      if (response?.success) {
        setStatus(response.state.status);
      }
    });
  };

  const continueTime = () => {
    chrome.runtime.sendMessage({ type: "CONTINUE_TIMER" }, (response) => {
      if (response?.success) {
        setStatus(response.state.status);
        setRemaining(response.state.remaining);
      }
    });
  };

  const resetTime = () => {
    chrome.runtime.sendMessage({ type: "RESET_TIMER" }, (response) => {
      if (response?.success) {
        setStatus(response.state.status);
        setRemaining(modes[currMode] * 60 * 1000);
        setDuration(modes[currMode] * 60 * 1000);
      }
    });
  };

  const changeMode = () => {
    chrome.runtime.sendMessage({ type: "CHANGE_MODE", currMode: currMode });
  }

  return (
    <div className={`w-[380px] h-[336px] p-5 ${isDarkMode ? 'bg-[#0D0402]' : 'bg-white'} `} >
      <TabMenu currMode={currMode} setCurrMode={setCurrMode} />
      <Timer remaining={remaining} progress={progress} circumference={circumference} isDarkMode={isDarkMode} />
      <Controlls status={status} startTime={startTime} continueTime={continueTime} resetTime={resetTime} pauseTime={pauseTime} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </div >
  )
}

export default Popup;
