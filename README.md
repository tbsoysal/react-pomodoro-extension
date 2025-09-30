# 🍅 Pomodoro Timer Extension

A beautiful, customizable Pomodoro timer Chrome extension built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- ⏱️ **Three Timer Views**: Circular, Digital, and Segmented displays
- 🎨 **Dark/Light Mode**: Customizable theme
- ⚙️ **Customizable Durations**: Set your own focus and break times
- 🔄 **Auto-Sync**: Changes sync across all extension pages
- 💾 **Persistent State**: Timer state preserved across browser restarts
- 🎯 **Three Modes**: Focus, Short Break, and Long Break

## 🚀 Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/react-pomodoro-extension.git
cd react-pomodoro-extension
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

### Development

Run in development mode with hot reload:
```bash
npm run dev
```

## 📖 Usage

### Using the Timer

1. **Click the extension icon** to open the timer popup
2. **Select a mode**: Focus (25min), Short Break (5min), or Long Break (30min)
3. **Click Start** to begin the countdown
4. **Click Pause** to pause the timer
5. **Click Reset** to restart

### Customizing Settings

1. **Right-click the extension icon** → Select "Options"
2. **Timer Settings**:
   - Change duration for each mode
   - Switch between modes
3. **Appearance Settings**:
   - Choose timer view (Circular, Digital, Segmented)
   - Toggle dark/light mode

### Changing Durations

1. Open **Options** page
2. Go to **Zamanlayıcı (Timer)** tab
3. Enter new durations:
   - **Odak (Focus)**: Default 25 minutes
   - **Kısa Mola (Short Break)**: Default 5 minutes
   - **Uzun Mola (Long Break)**: Default 30 minutes
4. Changes save automatically!

## 🏗️ Project Structure

```
src/
├── types/              # TypeScript type definitions
├── constants/          # App constants and defaults
├── utils/              # Utility functions
│   ├── timeUtils.ts    # Time conversion helpers
│   ├── storageUtils.ts # Chrome storage wrappers
│   └── messageUtils.ts # Messaging utilities
├── hooks/              # Custom React hooks
│   ├── useTimerState.ts
│   └── useStorage.ts
├── background.ts       # Background script (timer logic)
├── popup/              # Extension popup UI
│   ├── Popup.tsx
│   ├── circular_timer_view/
│   ├── digital_timer_view/
│   └── segmented_timer_view/
└── options/            # Options page UI
    ├── Options.tsx
    ├── TimerSettings.tsx
    ├── ViewSettings.tsx
    └── ...
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture guide
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Refactoring details

## 🛠️ Built With

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Chrome Extension API** - Browser integration

## 🧪 Scripts

```bash
npm run dev      # Development mode with hot reload
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 🔧 Technical Highlights

### Custom Hooks

- **`useTimerState()`** - Syncs timer state with background script
- **`useStorage()`** - Generic storage synchronization hook

### Utilities

- **Promise-based APIs** - Clean async/await instead of callbacks
- **Type-safe storage** - TypeScript wrappers for Chrome storage
- **Centralized messaging** - Simple API for background communication

### Best Practices

- ✅ Single source of truth (background script)
- ✅ DRY principle (no code duplication)
- ✅ Type safety (comprehensive TypeScript)
- ✅ Separation of concerns (clear architecture)
- ✅ Comprehensive documentation
- ✅ Clean code with comments

## 🐛 Bug Fixes

This refactored version fixes:
- ✅ Duration changes not syncing
- ✅ Mode changes from options not updating popup
- ✅ Storage inconsistency (sync vs local)
- ✅ Stale state on popup reopen
- ✅ useState/useEffect confusion

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the fast build tool
- Chrome Extensions team for the APIs

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Happy Pomodoro-ing! 🍅⏱️**