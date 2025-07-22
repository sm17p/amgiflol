# Amgiflol - Figma-like Layout Inspector For Web

A browser extension that helps with design audit. Match web layouts with Figma designs through real-time element inspection, measurements, and visual overlays.

- [Google Chrome](https://chromewebstore.google.com/detail/amgiflol/kpkpcekkflbmmmhjlnkbkfkdjfjnnonl/)
- [Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/amgiflol/)

## Target Audience

Any individual or web development teams including front-end developers, UI/UX designers, QA engineers, and product managers.

## Usage Note

Personally, I'm building this tool to act as an active visual debugger, since it is what I struggle with the most.

1. For others, it's intended to be used as an audit tool at the end or during development. Use it to reason about the layout like you would in a prototyping tool like Figma, or Adobe XD.
2. This tool won't automatically point out alignment or style mismatch with your designs.
3. You may find some shortcuts not implemented or upto the industry standard.
4. **This tool doesn't require you to login into any of your fav prototyping tool.**

## Current Features

- **Distance Measurements**: Meeasurements between element and it's parent
- **Dynamic Rulers**: Mouse-following coordinate system
- **Element Inspection**: Real-time hover detection with element information
- **Keyboard Shortcuts**: Quick access to all features
- **Lock/Unlock**: Persistent element tracking
- **Screenshots**: Capture current page state with overlays
- **Side Panel**: Detailed element properties, computed styles, attributes
- **Toolbar**: Floating interface with auto-positioning
- **Visual Overlays**: Highlight elements and parent relationships
- **Feature Voting**: Vote for your features to be developed
- **Design Mode**: Edit text on screen

## Roadmap

### 🚀 Planned Features

- **Auto-Hide/Move**: Smart UI positioning to avoid interference
- **Neighbour Analysis**: Automatic sibling/parent distance detection
- **Viewport Tools**: Responsive design testing utilities
- **Parent/Sibling Traversal**: Navigate element hierarchy
- **Enhanced Measurements**: Area calculations, angle measurements
- **Multiple Trackers**: Track multiple elements simultaneously

## Quick Setup

**Requirements**: Node.js ≥24, PNPM 10.12.3

```bash
pnpm install
pnpm dev:firefox      # Development mode for Firefox
---- or ----
pnpm build:firefox    # Build for Firefox
pnpm zip:firefox      # Create distribution package for firefox
```

## Development

### State Management

- **Reactive Stores**: Svelte 5 runes
- **Cross-Context Communication**: Typed message bus system
- **Storage Sync**: Browser storage integration with per-domain settings

### Component Architecture

```
src/lib/
├── components/      # UI components (Tracker, Ruler, Measurements)
├── modules/         # Features (Toolbar, SidePanel, EventsManager)
├── core/            # Business logic (ElementInspector, MessageBus)
└── store/           # State management (UI, Trackers, Metadata)
```

### Internal | Developer Tools

- **Debug Interface**: Performance metrics, message history (dev mode only)

### File Structure

```
src/
├── entrypoints/           # Extension entry points
│   ├── background.ts      # Background script
│   ├── content.ts         # Content script injection
│   └── popup/             # Extension popup
├── lib/
│   ├── Main.svelte        # Content script root
│   ├── components/        # Reusable UI components
│   ├── modules/           # Feature modules
│   ├── core/              # Core utilities
│   └── store/             # State management
└── utils/                 # Helper functions
```

---

**License**: MIT | **Build**: Vite + WXT + Svelte + TypeScript
