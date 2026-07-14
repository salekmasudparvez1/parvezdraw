# Parvez Draw

An offline-first whiteboard application built on the Excalidraw codebase.

## Features

- **Offline-first** - Works without internet connection, saves locally
- **Hand-drawn style** - Beautiful sketch-like diagrams and wireframes
- **Infinite canvas** - Draw as much as you want
- **Dark mode** - Easy on the eyes
- **Export** - PNG, SVG, JSON (.parvezdraw), and PDF
- **Auto-save** - Automatic local storage with version history
- **PWA support** - Install as a Progressive Web App
- **Customizable** - Grid, snap, themes, and more

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd excalidraw

# Install dependencies
yarn install

# Build packages
yarn build:packages

# Start development server
yarn start
```

### Build for Production

```bash
yarn build
```

The built app will be in `excalidraw-app/build/`.

## Development Commands

```bash
yarn start              # Start dev server
yarn build              # Build for production
yarn test:typecheck     # Type check
yarn test:update        # Run tests with snapshot updates
yarn fix                # Fix linting and formatting
```

## Project Structure

```
excalidraw/
├── excalidraw-app/          # Main application
│   ├── App.tsx              # Root component
│   ├── components/          # UI components
│   ├── data/                # Data layer (localStorage, IndexedDB)
│   └── ...
├── packages/
│   ├── excalidraw/          # Core editor library
│   ├── common/              # Shared utilities
│   ├── element/             # Element types and logic
│   ├── math/                # Math utilities
│   └── utils/               # Utility functions
└── public/                  # Static assets
```

## File Format

Parvez Draw uses `.parvezdraw` file format (JSON-based, backward compatible with `.excalidraw` files).

## Settings

Access settings from the main menu:

- **Auto-save interval** - 30s, 1min, 5min, or manual
- **Performance mode** - Optimize for slower devices
- **High DPI mode** - Use full device resolution
- **Grid** - Toggle grid overlay
- **Snap** - Toggle snap-to-elements
- **Theme** - Light/Dark/System

## License

MIT License - See [LICENSE](LICENSE) for details.

This project is based on [Excalidraw](https://github.com/excalidraw/excalidraw), which is also MIT licensed.
