// Timer state management
interface TimerState {
  status: 'stopped' | 'running' | 'paused';
  duration: number; // Total duration in milliseconds
  remaining: number; // Remaining time in milliseconds
  startTime: number | null; // When the timer was started
  pausedAt: number | null; // When the timer was paused
  mode: 'focus' | 'short_break' | 'long_break'; // Current timer mode
}

let timerState: TimerState = {
  status: 'stopped',
  duration: 0,
  remaining: 0,
  startTime: null,
  pausedAt: null,
  mode: 'focus'
};

let intervalId: ReturnType<typeof setInterval> | null = null;
let alarmName: string | null = null;

// Default timer durations (in minutes)
const DEFAULT_DURATIONS = {
  focus: 25,
  short_break: 5,
  long_break: 30
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Pomodoro Extension installed!");

  // Load saved state from storage
  await loadTimerState();

  // Clear any existing alarms
  chrome.alarms.clearAll();

  // Initialize with default state
  if (timerState.status === 'stopped') {
    resetTimer();
  }
});

/**
 * Loads timer state from Chrome storage
 */
async function loadTimerState(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(['timerState']);
    if (result.timerState) {
      timerState = { ...timerState, ...result.timerState };
      console.log('Timer state loaded from storage:', timerState);
    }
  } catch (error) {
    console.error('Error loading timer state:', error);
  }
}

/**
 * Saves timer state to Chrome storage
 */
async function saveTimerState(): Promise<void> {
  try {
    await chrome.storage.local.set({ timerState });
  } catch (error) {
    console.error('Error saving timer state:', error);
  }
}

/**
 * Starts a new timer with the specified duration
 * @param duration Duration in minutes
 * @param mode Timer mode (focus, short_break, long_break)
 */
function startTimer(duration: number, mode: 'focus' | 'short_break' | 'long_break' = 'focus'): void {
  const durationMs = duration * 60 * 1000;

  timerState = {
    status: 'running',
    duration: durationMs,
    remaining: durationMs,
    startTime: Date.now(),
    pausedAt: null,
    mode: mode
  };

  // Set up Chrome alarm for better accuracy
  alarmName = `pomodoro-timer-${Date.now()}`;
  chrome.alarms.create(alarmName, {
    delayInMinutes: duration
  });

  startInterval();
  saveTimerState();

  console.log(`Timer started for ${duration} minutes (${mode} mode)`);

  // Update badge
  updateBadge();
}

/**
 * Stops the current timer and clears the interval
 */
function stopTimer(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Clear alarm
  if (alarmName) {
    chrome.alarms.clear(alarmName);
    alarmName = null;
  }

  timerState.status = 'stopped';
  timerState.startTime = null;
  timerState.pausedAt = null;

  saveTimerState();
  updateBadge();
  console.log('Timer stopped');
}

/**
 * Pauses the current running timer
 */
function pauseTimer(): void {
  if (timerState.status !== 'running') {
    console.warn('Cannot pause timer: timer is not running');
    return;
  }

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Clear alarm
  if (alarmName) {
    chrome.alarms.clear(alarmName);
    alarmName = null;
  }

  timerState.status = 'paused';
  timerState.pausedAt = Date.now();

  saveTimerState();
  updateBadge();
  console.log('Timer paused');
}

/**
 * Continues a paused timer
 */
function continueTimer(): void {
  if (timerState.status !== 'paused') {
    console.warn('Cannot continue timer: timer is not paused');
    return;
  }

  // Adjust start time to account for paused duration
  const pausedDuration = Date.now() - timerState.pausedAt!;
  timerState.startTime = timerState.startTime! + pausedDuration;
  timerState.status = 'running';
  timerState.pausedAt = null;

  // Recreate alarm with remaining time
  const remainingMinutes = timerState.remaining / (60 * 1000);
  alarmName = `pomodoro-timer-${Date.now()}`;
  chrome.alarms.create(alarmName, {
    delayInMinutes: remainingMinutes
  });

  startInterval();
  saveTimerState();
  updateBadge();
  console.log('Timer continued');
}

/**
 * Resets the timer to initial state
 */
function resetTimer(): void {
  stopTimer();

  timerState = {
    status: 'stopped',
    duration: 0,
    remaining: 0,
    startTime: null,
    pausedAt: null,
    mode: timerState.mode,
  };

  saveTimerState();
  updateBadge();
  console.log('Timer reset');
}

/**
 * Change the mode and reset timer
 */
function changeMode(currMode: "focus" | "short_break" | "long_break"): void {
  timerState = {
    ...timerState,
    mode: currMode
  };

  saveTimerState();
  updateBadge();
  console.log("Mode change");
}

/**
 * Starts the interval for updating timer
 */
function startInterval(): void {
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(() => {
    updateTimer();
  }, 1000);
}

/**
 * Updates the timer state and checks for completion
 */
function updateTimer(): void {
  if (timerState.status !== 'running' || !timerState.startTime) {
    return;
  }

  const elapsed = Date.now() - timerState.startTime;
  timerState.remaining = Math.max(timerState.duration - elapsed, 0);

  // Check if timer has completed
  if (timerState.remaining <= 0) {
    timerCompleted();
    return;
  }

  // Save state periodically
  if (Math.floor(elapsed / 1000) % 10 === 0) {
    saveTimerState();
  }

  // Send update to popup/content scripts
  chrome.runtime.sendMessage({
    type: "TIMER_UPDATE",
    remaining: timerState.remaining,
    status: timerState.status,
    duration: timerState.duration,
    mode: timerState.mode
  }).catch(() => {
    // Ignore errors if no listeners are available
  });

  // Update badge
  updateBadge();
}

/**
 * Handles timer completion
 */
function timerCompleted(): void {
  stopTimer();

  // Send completion notification
  chrome.runtime.sendMessage({
    type: "TIMER_COMPLETED",
    mode: timerState.mode
  }).catch(() => {
    // Ignore errors if no listeners are available
  });

  // Show notification
  showNotification();

  console.log(`Timer completed (${timerState.mode} mode)`);
}

/**
 * Shows completion notification
 */
function showNotification(): void {
  const modeText = {
    focus: 'Focus session',
    short_break: 'Short break',
    long_break: 'Long break'
  };

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/light.svg',
    title: `${modeText[timerState.mode]} Complete!`,
    message: timerState.mode === 'focus'
      ? 'Time for a break! 🎉'
      : 'Break time is over! Ready to focus? 💪'
  });
}

/**
 * Updates the extension badge
 */
function updateBadge(): void {
  if (timerState.status === 'running') {
    const minutes = Math.ceil(timerState.remaining / (60 * 1000));
    chrome.action.setBadgeText({ text: minutes.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#F02900' });
  } else if (timerState.status === 'paused') {
    chrome.action.setBadgeText({ text: '⏸️' });
    chrome.action.setBadgeBackgroundColor({ color: '#FFA500' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

/**
 * Gets the current timer state
 */
function getTimerState() {
  return {
    status: timerState.status,
    remaining: timerState.remaining,
    duration: timerState.duration,
    mode: timerState.mode,
    progress: timerState.duration > 0 ? (timerState.duration - timerState.remaining) / timerState.duration : 0
  };
}

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === alarmName && timerState.status === 'running') {
    timerCompleted();
  }
});

// Message handling
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  try {
    switch (msg.type) {
      case "START_TIMER":
        if (msg.duration && msg.duration > 0) {
          startTimer(msg.duration, msg.mode || 'focus');
          sendResponse({ success: true, state: getTimerState() });
        } else {
          sendResponse({ success: false, error: "Invalid duration" });
        }
        break;

      case "STOP_TIMER":
        stopTimer();
        sendResponse({ success: true, state: getTimerState() });
        break;

      case "PAUSE_TIMER":
        pauseTimer();
        sendResponse({ success: true, state: getTimerState() });
        break;

      case "CONTINUE_TIMER":
        continueTimer();
        sendResponse({ success: true, state: getTimerState() });
        break;

      case "RESET_TIMER":
        resetTimer();
        sendResponse({ success: true, state: getTimerState() });
        break;

      case "GET_TIMER_STATE":
        sendResponse({ success: true, state: getTimerState() });
        break;

      case "GET_DEFAULT_DURATIONS":
        sendResponse({ success: true, durations: DEFAULT_DURATIONS });
        break;

      case "CHANGE_MODE":
        changeMode(msg.currMode);
        sendResponse({ success: true, state: getTimerState() });
        break;

      default:
        sendResponse({ success: false, error: "Unknown message type" });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  return true; // Keep message channel open for async response
});

// Clean up on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (alarmName) {
    chrome.alarms.clear(alarmName);
  }
});
