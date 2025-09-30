# Pomodoro Extension - Architecture Guide

This document explains the codebase structure and how different parts work together.

## 📁 Project Structure

```
src/
├── types/              # Shared TypeScript types
│   └── index.ts        # All interfaces and types
│
├── constants/          # Application constants
│   └── index.ts        # Default values, storage keys, labels
│
├── utils/              # Utility functions
│   ├── timeUtils.ts    # Time conversion helpers
│   ├── storageUtils.ts # Chrome storage wrappers
│   └── messageUtils.ts # Chrome messaging helpers
│
├── hooks/              # Custom React hooks
│   ├── useTimerState.ts # Timer state management
│   └── useStorage.ts    # Storage synchronization
│
├── background.ts       # Background script (timer logic)
│
├── popup/              # Extension popup (main timer UI)
│   ├── Popup.tsx       # Main popup component
│   ├── circular_timer_view/
│   ├── digital_timer_view/
│   └── segmented_timer_view/
│
└── options/            # Extension options page (settings)
    ├── Options.tsx     # Main options component
    ├── TimerSettings.tsx
    ├── ViewSettings.tsx
    └── ...
```

---

## 🔄 How It Works

### 1. Background Script (`background.ts`)

The **single source of truth** for timer state. It:
- Runs the countdown timer
- Stores state in Chrome storage
- Broadcasts updates to popup/options pages
- Listens for control messages (start, stop, reset, etc.)

**Key Functions:**
- `startTimer()` - Start/resume countdown
- `stopTimer()` - Pause the timer
- `resetTimer()` - Reset to initial state
- `changeMode()` - Switch between focus/break modes
- `reloadDurations()` - Load custom durations from storage

### 2. Popup (`Popup.tsx`)

The main UI shown when clicking the extension icon. It:
- Displays the timer in selected view (circular/digital/segmented)
- Provides controls (start, pause, reset)
- Automatically syncs with background script

**Uses:**
- `useTimerState()` - Gets real-time timer state
- `useStorage()` - Loads theme preference
- `messages.*` - Sends commands to background

### 3. Options Page (`Options.tsx`)

Full settings page for customization. It:
- Allows changing timer durations
- Lets users switch modes
- Saves preferences to storage

**Components:**
- `TimerSettings` - Duration and mode settings
- `ViewSettings` - Theme selection
- `Profile`, `Stats`, `Permissions` - Other settings

---

## 🧩 Shared Utilities

### Types (`src/types/index.ts`)

All TypeScript interfaces used across the extension:

```typescript
// Timer durations (minutes in UI, seconds in background)
interface Modes {
  focus: number;
  short_break: number;
  long_break: number;
}

// Complete timer state
interface TimerState {
  timeLeft: number;
  duration: number;
  status: "running" | "stopped" | "paused";
  mode: "focus" | "short_break" | "long_break";
  mode_durations: Modes;
}
```

### Constants (`src/constants/index.ts`)

Default values and configuration:

```typescript
// Default durations (in minutes)
DEFAULT_DURATIONS = {
  focus: 25,
  short_break: 5,
  long_break: 30
}

// Storage keys (prevents typos)
STORAGE_KEYS = {
  TIMER_STATE: 'timerState',
  DURATIONS: 'durations',
  THEME: 'theme'
}
```

### Storage Utils (`src/utils/storageUtils.ts`)

Promise-based Chrome storage wrapper:

```typescript
// Get timer state
const state = await storage.getTimerState();

// Save durations
await storage.setDurations({ focus: 30, short_break: 10, ... });
```

### Message Utils (`src/utils/messageUtils.ts`)

Clean API for background communication:

```typescript
// Start timer
await messages.startTimer();

// Change mode
await messages.changeMode('short_break');
```

### Time Utils (`src/utils/timeUtils.ts`)

Time conversion helpers:

```typescript
// Convert 25 minutes → 1500 seconds
const seconds = minutesToSeconds(25);

// Format 1500 seconds → "25:00"
const display = formatTime(1500);
```

---

## 🎣 Custom Hooks

### `useTimerState()`

Manages timer state synchronization:

```typescript
const { timerState, loading } = useTimerState();

// timerState updates automatically from background
// Includes: timeLeft, duration, status, mode
```

**Features:**
- Fetches initial state on mount
- Listens for real-time updates
- Refreshes when popup becomes visible

### `useStorage()`

Generic storage synchronization hook:

```typescript
const { value, setValue, loading } = useStorage(
  storage.getTheme,  // Fetcher function
  storage.setTheme,  // Setter function
  'circular'         // Default value
);

// setValue automatically saves to Chrome storage
```

---

## 📡 Communication Flow

### Starting the Timer

```
Popup
  ↓ (user clicks start)
messages.startTimer()
  ↓ (Chrome message)
background.ts → startTimer()
  ↓ (setInterval countdown)
background.ts → syncState()
  ↓ (broadcast update)
Popup ← TIMER_UPDATE message
  ↓ (useTimerState hook)
UI updates automatically
```

### Changing Durations

```
Options Page
  ↓ (user changes input)
TimerSettings → setDurations()
  ↓ (via useStorage hook)
Chrome Storage (durations saved)
  ↓ (storage.onChanged listener)
background.ts → reloadDurations()
  ↓ (convert mins → secs)
background.ts → syncState()
  ↓ (broadcast update)
Popup updates with new duration
```

---

## 💡 Best Practices Used

### 1. Single Source of Truth
- Background script owns timer state
- UI components just display and send commands

### 2. Type Safety
- All types centralized in `src/types/`
- TypeScript prevents type errors

### 3. DRY Principle
- Utilities prevent code duplication
- Constants avoid magic numbers/strings

### 4. Separation of Concerns
- Background: Logic and state
- Popup: Display and user interaction
- Options: Settings management
- Utils: Reusable helpers

### 5. Promises over Callbacks
- All storage/messaging uses Promises
- Cleaner async/await code

### 6. Automatic Sync
- Storage changes trigger updates
- No manual refresh needed

---

## 🔧 How to Change Durations

There are two ways:

### 1. From UI (Options Page)
1. Right-click extension → Options
2. Go to "Zamanlayıcı" tab
3. Change duration inputs
4. Updates automatically save and sync

### 2. Programmatically
```typescript
import { storage } from './utils/storageUtils';

// Set new durations
await storage.setDurations({
  focus: 30,
  short_break: 10,
  long_break: 20
});

// Background script auto-detects change
```

---

## 🔧 How to Change Mode

### From Options Page
```typescript
// TimerSettings.tsx automatically handles this
// Just select from dropdown
```

### From Popup
```typescript
// TabMenu components handle mode switching
// Click different tabs (Focus, Short Break, Long Break)
```

### Programmatically
```typescript
import { messages } from './utils/messageUtils';

// Switch to focus mode
await messages.changeMode('focus');
```

---

## 🐛 Debugging Tips

### Check Timer State
Open background script console:
```javascript
chrome.storage.local.get('timerState', (data) => {
  console.log(data.timerState);
});
```

### Check Durations
```javascript
chrome.storage.local.get('durations', (data) => {
  console.log(data.durations);
});
```

### Monitor Messages
In background.ts, all messages are logged:
```typescript
chrome.runtime.onMessage.addListener((message) => {
  console.log('Received:', message.type);
  // ...
});
```

---

## 📝 Adding New Features

### Add a New Timer Mode

1. Update types:
```typescript
// src/types/index.ts
interface Modes {
  focus: number;
  short_break: number;
  long_break: number;
  custom_mode: number; // Add new mode
}
```

2. Update constants:
```typescript
// src/constants/index.ts
DEFAULT_DURATIONS = {
  ...existing,
  custom_mode: 15
}

MODE_LABELS = {
  ...existing,
  custom_mode: 'Özel Mod'
}
```

3. Add to UI (TabMenu components, TimerSettings, etc.)

### Add New Storage Value

1. Add to storage utils:
```typescript
// src/utils/storageUtils.ts
export const storage = {
  ...existing,
  
  getMyValue(): Promise<MyType | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get('myKey', (data) => {
        resolve(data.myKey || null);
      });
    });
  },
  
  setMyValue(value: MyType): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ myKey: value }, resolve);
    });
  }
}
```

2. Use in components:
```typescript
const { value, setValue } = useStorage(
  storage.getMyValue,
  storage.setMyValue,
  defaultValue
);
```

---

## 🎨 Code Style

- **Comments**: Every file has header explaining purpose
- **Functions**: JSDoc comments explain what they do
- **Types**: Always use TypeScript types
- **Naming**: Descriptive names (no abbreviations)
- **Organization**: Related code grouped together
- **Async**: Use async/await, not callbacks

---

## 📚 Further Reading

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Chrome Runtime Messaging](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
