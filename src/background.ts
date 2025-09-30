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
  "mode_durations": Modes;
}

let modes: Modes = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 30 * 60
};

// Default TimerState
const timerState: TimerState = {
  timeLeft: modes.focus,
  duration: modes.focus,
  status: 'stopped',
  mode: 'focus',
  mode_durations: modes
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
  timerState.mode = newMode;
  timerState.duration = modes[newMode];
  timerState.timeLeft = modes[newMode];
  timerState.status = "stopped";
  clearInterval(timer);

  saveNewTimerState();
  chrome.runtime.sendMessage({ type: "TIMER_UPDATE", newTimerState: timerState });

}

function changeDurations() {
  chrome.storage.local.get("timerState", (result) => {
    if (result.durations) {
      // Update the modes object (convert minutes to seconds)
      modes.focus = result.durations.focus * 60;
      modes.short_break = result.durations.short_break * 60;
      modes.long_break = result.durations.long_break * 60;

      // Update timerState
      timerState.mode_durations = modes;
      timerState.duration = modes[timerState.mode];
      timerState.timeLeft = modes[timerState.mode];

      saveNewTimerState();
      chrome.runtime.sendMessage({ type: "TIMER_UPDATE", newTimerState: timerState });
    }
  })
}

// Get timerState from chrome storage if exist, if not save the default values to chrome storage
chrome.storage.local.get("timerState", (result) => {
  if (result.timerState !== undefined) {
    Object.assign(timerState, result.timerState);
  } else {
    chrome.storage.local.set({ "timerState": timerState });
  }
})

// After loading timerState, also load custom durations if they exist
chrome.storage.local.get("durations", (result) => {
  if (result.durations) {
    modes.focus = result.durations.focus * 60;
    modes.short_break = result.durations.short_break * 60;
    modes.long_break = result.durations.long_break * 60;
    timerState.mode_durations = modes;
  }
});

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
    case "CHANGE_DURATIONS":
      changeDurations();
      sendResponse({ reply: `Durations changed to, ${timerState.mode_durations}` })

  }
})

// Listen for storage changes
chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
  if (areaName === 'local' && changes.durations) {
    const newDurations = changes.durations.newValue as Modes;

    // Update modes (convert minutes to seconds)
    modes.focus = newDurations.focus * 60;
    modes.short_break = newDurations.short_break * 60;
    modes.long_break = newDurations.long_break * 60;

    // Update timerState
    timerState.mode_durations = modes;

    // Reset current mode to new duration if timer is stopped
    if (timerState.status === 'stopped') {
      timerState.duration = modes[timerState.mode];
      timerState.timeLeft = modes[timerState.mode];
    }

    saveNewTimerState();
    chrome.runtime.sendMessage({ type: "TIMER_UPDATE", newTimerState: timerState });
  }
  // Add this for mode changes
  if (areaName === 'local' && changes.selectedMode) {
    const newMode = changes.selectedMode.newValue as keyof Modes;
    changeMode(newMode);
  }
});
