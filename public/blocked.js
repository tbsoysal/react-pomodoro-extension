// Get blocked site from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const blockedSite = urlParams.get('blocked');

if (blockedSite) {
  // Show the actual blocked site name
  document.getElementById('blockedSite').textContent = decodeURIComponent(blockedSite);
} else {
  // Show generic message if no site parameter
  document.getElementById('blockedSite').textContent = 'Bu Site';
}

// Timer functionality
let timeLeft = 25 * 60; // Default 25 minutes
let isRunning = true;
let timerInterval = null;

// Update timer display
function updateTimer() {
  if (timeLeft > 0) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    document.getElementById('timeRemaining').textContent = timeString;
    timeLeft--;
  } else {
    document.getElementById('timeRemaining').textContent = '00:00';
    document.getElementById('currentMode').textContent = 'Süre Doldu!';
    isRunning = false;
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  }
}

// Get real timer state from storage
async function getRealTimerState() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get(['timerState'], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });

      if (result && result.timerState) {
        const { timeLeft: realTimeLeft, mode } = result.timerState;
        
        // Update with real timer data
        timeLeft = realTimeLeft;
        
        const modeNames = {
          'focus': 'Odaklanma Modu',
          'short_break': 'Kısa Mola',
          'long_break': 'Uzun Mola'
        };
        document.getElementById('currentMode').textContent = modeNames[mode] || 'Odaklanma Modu';
        
        updateTimer();
        return true;
      }
    }
  } catch (error) {
    console.log('Could not get real timer state:', error);
  }
  return false;
}

// Start the timer
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Show initial time
  updateTimer();
  
  // Start countdown
  timerInterval = setInterval(updateTimer, 1000);
}

// Initialize timer
async function initTimer() {
  // Try to get real timer state first
  const hasRealTimer = await getRealTimerState();
  
  if (!hasRealTimer) {
    // Fallback to default timer
    timeLeft = 25 * 60;
    document.getElementById('currentMode').textContent = 'Odaklanma Modu';
    updateTimer();
  }
  
  // Start the timer
  startTimer();
}

// Listen for storage changes to update timer
function setupStorageListener() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.timerState) {
        const { timeLeft: newTimeLeft, mode } = changes.timerState.newValue;
        timeLeft = newTimeLeft;
        
        const modeNames = {
          'focus': 'Odaklanma Modu',
          'short_break': 'Kısa Mola',
          'long_break': 'Uzun Mola'
        };
        document.getElementById('currentMode').textContent = modeNames[mode] || 'Odaklanma Modu';
      }
    });
  }
}

// Open options page
function openOptions() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  setupStorageListener();
  initTimer();
  setupButtonListeners();
});

// Setup button event listeners
function setupButtonListeners() {
  // Open options button
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', openOptions);
  }

  // Close tab button
  const closeTabBtn = document.getElementById('closeTabBtn');
  if (closeTabBtn) {
    closeTabBtn.addEventListener('click', () => {
      window.close();
    });
  }
}

// Make functions available globally
window.openOptions = openOptions;
