interface Modes {
  "focus": number;
  "short_break": number;
  "long_break": number;
}

interface TimerState {
  "timeLeft": number;
  "duration": number;
  "status": "running" | "stopped" | "paused";
  "mode": keyof Modes;
}

const modes: Modes = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 30 * 60
};

// Default TimerState
const timerState: TimerState = {
  timeLeft: modes.focus,
  duration: modes.focus,
  status: 'stopped',
  mode: 'focus'
}

function saveNewTimerState() {
  chrome.storage.local.set({ "timerState": timerState });
}

let timer: ReturnType<typeof setInterval>;

// Start Timer Function
function startTimer() {
  const updateTimer = () => {
    if (timerState.timeLeft > 0) {
      timerState.status = "running";
      timerState.timeLeft -= 1;
    }
    else {
      console.log(timerState.timeLeft, " is not greater than 0.")
      clearInterval(timer);
      resetTimer();
    }

    saveNewTimerState();
    chrome.runtime.sendMessage({ type: "TIMER_UPDATE", newTimerState: timerState });
  };

  updateTimer()
  timer = setInterval(updateTimer, 1000);
};

// Stop Timer Function
function stopTimer() {
  if (timerState.status !== "paused") {
    clearInterval(timer);
    timerState.status = "paused";

    saveNewTimerState();
    chrome.runtime.sendMessage({ type: "TIMER_UPDATE", newTimerState: timerState });
  }
}

// Stop Timer Function
function resetTimer() {
  clearInterval(timer);
  timerState.status = "stopped";
  timerState.timeLeft = modes[timerState.mode];

  saveNewTimerState();
  chrome.runtime.sendMessage({ type: "TIMER_UPDATE", newTimerState: timerState });
}

// Change Mode function
function changeMode(newMode: keyof Modes) {
  console.log("currentMode: ", timerState.mode)
  console.log("Newmode: ", newMode);
  if (newMode !== timerState.mode) {
    timerState.mode = newMode;
    timerState.duration = modes[newMode];
    timerState.timeLeft = modes[newMode];
    timerState.status = "stopped";
    clearInterval(timer);

    saveNewTimerState();
    chrome.runtime.sendMessage({ type: "TIMER_UPDATE", newTimerState: timerState });
  }
}

// Get timerState from chrome storage if exist, if not save the default values to chrome storage
chrome.storage.local.get("timerState", (result) => {
  if (result.timerState !== undefined) {
    Object.assign(timerState, result.timerState);
  } else {
    chrome.storage.local.set({ "timerState": timerState });
  }
})

// Listen for incoming messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "GET_CURRENT_STATE":
      sendResponse({ success: true, reply: timerState });
      break;
    case "START_TIMER":
      startTimer();
      sendResponse({ reply: "Timer start!" });
      break;
    case "STOP_TIMER":
      stopTimer();
      sendResponse({ reply: "Timer stop!" });
      break;
    case "RESET_TIMER":
      resetTimer();
      sendResponse({ reply: "Timer reset!" });
      break;
    case "CHANGE_MODE":
      changeMode(message.newMode);
      sendResponse({ reply: "Mode changed" });
      break;
  }
})
