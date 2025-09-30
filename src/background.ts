/**
 * Background Script - Pomodoro Timer Core Logic
 * 
 * This script runs persistently in the background and manages:
 * - Timer countdown logic
 * - State management and persistence
 * - Communication with popup and options pages
 * - Storage synchronization
 * - Website blocking during focus mode
 */

import type { Modes, TimerState, ModeKey, ChromeMessage } from './types';

// ============================================================================
// HELPER FUNCTIONS (Inlined to avoid code splitting issues)
// ============================================================================

/**
 * Convert minutes to seconds
 */
const minutesToSeconds = (minutes: number): number => minutes * 60;

/**
 * Convert Modes object from minutes to seconds
 */
const convertModesToSeconds = (modes: { focus: number; short_break: number; long_break: number }): Modes => ({
  focus: minutesToSeconds(modes.focus),
  short_break: minutesToSeconds(modes.short_break),
  long_break: minutesToSeconds(modes.long_break)
});

/**
 * Default timer durations (in minutes)
 */
const DEFAULT_DURATIONS = {
  focus: 25,
  short_break: 5,
  long_break: 30
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Mode durations in seconds
 * Initialized with defaults, updated from storage if custom values exist
 */
let modes: Modes = convertModesToSeconds(DEFAULT_DURATIONS);

/**
 * Current timer state
 * This is the single source of truth for the timer
 */
const timerState: TimerState = {
  timeLeft: modes.focus,
  duration: modes.focus,
  status: 'stopped',
  mode: 'focus',
  mode_durations: modes
};

/**
 * Interval reference for the countdown timer
 */
let timerInterval: ReturnType<typeof setInterval> | null = null;

/**
 * List of blocked websites
 */
let blockedSites: string[] = [];

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Save current timer state to Chrome storage
 * Called whenever state changes to persist across extension reloads
 */
const saveTimerState = async (): Promise<void> => {
  try {
    await chrome.storage.local.set({ timerState });
  } catch (error) {
    console.error('Failed to save timer state:', error);
  }
};

/**
 * Broadcast timer state update to all listeners (popup, etc.)
 * Ensures UI stays in sync with background state
 */
const broadcastUpdate = (): void => {
  try {
    chrome.runtime.sendMessage({ 
      type: "TIMER_UPDATE", 
      newTimerState: timerState 
    }, () => {
      // Handle connection errors silently - this is expected when no popup is open
      if (chrome.runtime.lastError) {
        // No need to log - this is normal behavior
      }
    });
  } catch (error) {
    console.log('Failed to broadcast update:', error);
  }
};

// ============================================================================
// SITE BLOCKING FUNCTIONS
// ============================================================================

/**
 * Enable site blocking using declarativeNetRequest API
 * Blocks websites in the blocked sites list
 */
const enableSiteBlocking = async (): Promise<void> => {
  if (blockedSites.length === 0) return;

  // Create blocking rules for each site
  const rules = blockedSites.flatMap((site, index) => {
    const baseId = index * 4 + 1;
    
    // Create multiple rules for each site to handle different scenarios:
    // 1. Block exact domain main frame
    // 2. Block exact domain with any path
    // 3. Block subdomain main frame  
    // 4. Block subdomain with any path
    return [
      {
        id: baseId,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: chrome.runtime.getURL('blocked.html') + '?blocked=' + encodeURIComponent(site)
          }
        },
        condition: {
          urlFilter: `*://${site}`,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      },
      {
        id: baseId + 1,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: chrome.runtime.getURL('blocked.html') + '?blocked=' + encodeURIComponent(site)
          }
        },
        condition: {
          urlFilter: `*://${site}/*`,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      },
      {
        id: baseId + 2,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: chrome.runtime.getURL('blocked.html') + '?blocked=' + encodeURIComponent(site)
          }
        },
        condition: {
          urlFilter: `*://*.${site}`,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      },
      {
        id: baseId + 3,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
          redirect: {
            url: chrome.runtime.getURL('blocked.html') + '?blocked=' + encodeURIComponent(site)
          }
        },
        condition: {
          urlFilter: `*://*.${site}/*`,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        }
      }
    ];
  });

  try {
    // Remove existing rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map(rule => rule.id);
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove,
      addRules: rules as chrome.declarativeNetRequest.Rule[]
    });
  } catch (error) {
    console.error('Failed to enable site blocking:', error);
  }
};

/**
 * Disable site blocking
 * Removes all blocking rules
 */
const disableSiteBlocking = async (): Promise<void> => {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map(rule => rule.id);
    
    if (ruleIdsToRemove.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove
      });
    }
  } catch (error) {
    console.error('Failed to disable site blocking:', error);
  }
};

/**
 * Update blocking based on timer state
 * Enables blocking during focus mode, disables during breaks
 */
const updateBlocking = async (): Promise<void> => {
  // Only block during focus mode when timer is running
  if (timerState.mode === 'focus' && timerState.status === 'running') {
    await enableSiteBlocking();
  } else {
    await disableSiteBlocking();
  }
};

/**
 * Save state and notify listeners
 * Convenience function called after every state change
 */
const syncState = async (): Promise<void> => {
  await saveTimerState();
  broadcastUpdate();
  await updateBlocking();
};

// ============================================================================
// TIMER CONTROL FUNCTIONS
// ============================================================================

/**
 * Start or resume the timer
 * Creates an interval that decrements timeLeft every second
 */
const startTimer = async (): Promise<void> => {
  // Prevent multiple intervals
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Update status
  timerState.status = "running";
  await syncState();

  // Create countdown interval
  timerInterval = setInterval(async () => {
    if (timerState.timeLeft > 0) {
      // Decrement time
      timerState.timeLeft -= 1;
      await syncState();
    } else {
      // Timer finished - reset automatically
      await resetTimer();
    }
  }, 1000); // Run every second
};

/**
 * Pause the timer
 * Stops the countdown but preserves remaining time
 */
const stopTimer = async (): Promise<void> => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  timerState.status = "paused";
  await syncState();
};

/**
 * Reset timer to initial state for current mode
 * Stops countdown and restores full duration
 */
const resetTimer = async (): Promise<void> => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  timerState.status = "stopped";
  timerState.timeLeft = modes[timerState.mode];
  timerState.duration = modes[timerState.mode];
  
  await syncState();
};

/**
 * Switch to a different timer mode
 * Resets timer with the new mode's duration
 * 
 * @param newMode - Mode to switch to (focus, short_break, long_break)
 */
const changeMode = async (newMode: ModeKey): Promise<void> => {
  // Stop any running timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Update to new mode
  timerState.mode = newMode;
  timerState.duration = modes[newMode];
  timerState.timeLeft = modes[newMode];
  timerState.status = "stopped";
  
  await syncState();
};

/**
 * Reload custom durations from storage
 * Called when user updates durations in options page
 */
const reloadDurations = async (): Promise<void> => {
  const result = await chrome.storage.local.get('durations');
  
  if (result.durations) {
    // Convert minutes to seconds
    modes = convertModesToSeconds(result.durations);
    
    // Update timerState with new durations
    timerState.mode_durations = modes;
    
    // If timer is stopped, update to new duration
    if (timerState.status === 'stopped') {
      timerState.duration = modes[timerState.mode];
      timerState.timeLeft = modes[timerState.mode];
    }
    
    await syncState();
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize background script
 * Loads saved state and custom durations from storage
 */
const initialize = async (): Promise<void> => {
  // Load saved timer state
  const stateResult = await chrome.storage.local.get('timerState');
  if (stateResult.timerState) {
    Object.assign(timerState, stateResult.timerState);
  }
  
  // Load custom durations
  const durationsResult = await chrome.storage.local.get('durations');
  if (durationsResult.durations) {
    modes = convertModesToSeconds(durationsResult.durations);
    timerState.mode_durations = modes;
  }
  
  // Load blocked sites
  const blockedSitesResult = await chrome.storage.local.get('blockedSites');
  if (blockedSitesResult.blockedSites) {
    blockedSites = blockedSitesResult.blockedSites;
  }
  
  // Save initial state
  await saveTimerState();
  
  // Update blocking based on current state
  await updateBlocking();
};

// Run initialization
initialize();

// ============================================================================
// MESSAGE LISTENERS
// ============================================================================

/**
 * Listen for messages from popup and options pages
 * Handles all timer control commands
 */
chrome.runtime.onMessage.addListener((message: ChromeMessage, _sender, sendResponse) => {
  switch (message.type) {
    case "GET_CURRENT_STATE":
      // Return current timer state
      sendResponse({ success: true, reply: timerState });
      break;
      
    case "START_TIMER":
      startTimer();
      sendResponse({ reply: "Timer started" });
      break;
      
    case "STOP_TIMER":
      stopTimer();
      sendResponse({ reply: "Timer paused" });
      break;
      
    case "RESET_TIMER":
      resetTimer();
      sendResponse({ reply: "Timer reset" });
      break;
      
    case "CHANGE_MODE":
      if (message.newMode) {
        changeMode(message.newMode);
        sendResponse({ reply: `Mode changed to ${message.newMode}` });
      }
      break;
      
    case "CHANGE_DURATIONS":
      reloadDurations();
      sendResponse({ reply: "Durations reloaded" });
      break;
  }
  
  return true; // Keep message channel open for async responses
});

// ============================================================================
// STORAGE CHANGE LISTENERS
// ============================================================================

/**
 * Listen for storage changes
 * Automatically syncs when durations are updated from options page
 */
chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
  // Only process local storage changes
  if (areaName !== 'local') return;
  
  // Reload durations when updated
  if (changes.durations) {
    const newDurations = changes.durations.newValue as Modes;
    
    // Convert to seconds and update
    modes = convertModesToSeconds(newDurations);
    timerState.mode_durations = modes;
    
    // If timer is stopped, update to new duration
    if (timerState.status === 'stopped') {
      timerState.duration = modes[timerState.mode];
      timerState.timeLeft = modes[timerState.mode];
    }
    
    syncState();
  }
  
  // Switch mode when changed from options page
  if (changes.selectedMode) {
    const newMode = changes.selectedMode.newValue as ModeKey;
    changeMode(newMode);
  }
  
  // Update blocked sites when changed from options page
  if (changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue as string[];
    updateBlocking();
  }
});