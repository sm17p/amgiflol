# Amgiflol - A layout inspector web extension to match your pixels with Figma

## Overview

This extension is built with a modular architecture using wxt, Svelte 5, TypeScript, and Tailwind CSS

## Features

1. Locate
2. Screenshot

## Environment Configuration

- Node Version >= 24
- PNPM 10.12.3

## Building Source Code

```bash
pnpm i
pnpm build:firefox
pnpm zip:firefox
```

## Directory structure

```
amgiflol/
├── src/
│   ├── entrypoints/              # Extension entry points
│   │   ├── background.ts         # Background script for cross-tab communication
│   │   ├── content.ts            # Content script injection point
│   │   └── popup/               # Extension popup interface
│   │       ├── index.html       # Popup HTML template
│   │       └── main.ts          # Popup Svelte app entry
│   ├── lib/
│   │   ├── Main.svelte          # Content script root component
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Measurements.svelte    # SVG measurement system
│   │   │   ├── Ruler.svelte          # Dynamic ruler overlay
│   │   │   ├── SelectorManager.svelte # Element selection management
│   │   │   ├── Switch.svelte         # Custom switch component
│   │   │   ├── Tooltip.svelte        # Tooltip wrapper
│   │   │   └── Tracker.svelte        # Element tracking overlay
│   │   ├── core/                # Core business logic
│   │   │   ├── ElementInspector.ts   # DOM analysis utilities
│   │   │   └── MessageBus.ts         # Cross-context messaging
│   │   ├── modules/             # Feature modules
│   │   │   ├── DebugToolbar/         # Development debugging interface
│   │   │   ├── EventsManager/        # Global event handling
│   │   │   ├── ExtensionSettings/    # Popup settings interface
│   │   │   ├── SidePanel/           # Element details panel
│   │   │   ├── SvgManager/          # SVG overlay management
│   │   │   └── Toolbar/             # Main toolbar interface
│   │   └── store/               # State management
│   │       ├── MetaDataStore.svelte.ts   # Mouse and window state
│   │       ├── TrackersStore.svelte.ts   # Element tracking state
│   │       ├── TrackerState.svelte.ts    # Individual tracker state
│   │       ├── UIStore.svelte.ts         # UI state management
│   │       └── index.svelte.ts           # Store exports
│   ├── assets/                  # Static assets
│   │   └── svelte.svg          # Svelte logo
│   ├── utils/                   # Utility functions
│   │   └── data-urls.ts        # Data URL manipulation
│   └── app.d.ts                # Global type definitions
```
