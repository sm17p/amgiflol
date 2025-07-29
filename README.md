<div class="title-block" style="text-align: center;" align="center">

# Amgiflol - Figma-like Layout Inspector For Web

<p><img alt="title="amgiflol logo"" title="amgiflol logo" src="src/assets/icon.png" width="256" height="256"></img></p>

[![Release](https://img.shields.io/github/v/release/sm17p/amgiflol)](https://github.com/sm17p/amgiflol/releases)
[![Release date](https://img.shields.io/github/release-date/sm17p/amgiflol)](https://github.com/sm17p/amgiflol/releases)
[![License](https://img.shields.io/github/license/sm17p/amgiflol)](./LICENSE.md)

**LOGO BY** - [b3an33](https://github.com/b3an33)

</div>

A browser extension that helps with design audit. Match web layouts with Figma designs through real-time element inspection, measurements, and visual overlays.

## Marketplace

### Supported Browsers

| Chromium                               | Firefox      |
| -------------------------------------- | ------------ |
| Chrome, Edge, Brave, Vivaldi, Arc, Dia | Firefox, Zen |

### Users

[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/kpkpcekkflbmmmhjlnkbkfkdjfjnnonl?style=for-the-badge&logo=GoogleChrome&label=Chromium)](https://chromewebstore.google.com/detail/amgiflol/kpkpcekkflbmmmhjlnkbkfkdjfjnnonl) [![Mozilla Add-on Users](https://img.shields.io/amo/users/amgiflol?style=for-the-badge&logo=Firefox-Browser&label=Firefox)](https://addons.mozilla.org/en-US/firefox/addon/amgiflol/)

## Target Audience

Any individual or web development teams including front-end developers, UI/UX designers, QA engineers, and product managers.

## Usage Note

> [!IMPORTANT]
>
> Personally, I'm building this tool to act as an active visual debugger, since it is what I struggle with the most.
>
> 1. For others, it's intended to be used as an audit tool at the end or during development. Use it to reason about the layout like you would in a prototyping tool like Figma, or Adobe XD.
> 2. This tool won't automatically point out alignment or style mismatch with your designs.
> 3. You may find some shortcuts not implemented or upto the industry standard.
> 4. **This tool doesn't require you to login into any of your fav prototyping tool.**

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
- **Rainbow Layouts**: Nested rainbow themed overlay for layers
- **Auto-Hide/Move**: Smart UI positioning to avoid interference

## Roadmap

### 🚀 Planned Features

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

**License**: [MIT](./LICENSE.md) | **Powered By**: Vite + WXT + Svelte + TypeScript + bits-ui
