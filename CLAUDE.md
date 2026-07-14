# CLAUDE.md

## Project: Parvez Draw

An offline-first whiteboard application built on the Excalidraw codebase.

## Project Structure

Parvez Draw is a **monorepo** with a clear separation between the core library and the application:

- **`packages/excalidraw/`** - Main React component library (internal `@excalidraw/excalidraw`)
- **`excalidraw-app/`** - Full-featured web application (Parvez Draw)
- **`packages/`** - Core packages: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`

## Development Workflow

1. **Package Development**: Work in `packages/*` for editor features
2. **App Development**: Work in `excalidraw-app/` for app-specific features
3. **Testing**: Always run `yarn test:update` before committing
4. **Type Safety**: Use `yarn test:typecheck` to verify TypeScript

## Development Commands

```bash
yarn test:typecheck  # TypeScript type checking
yarn test:update     # Run all tests (with snapshot updates)
yarn fix             # Auto-fix formatting and linting issues
yarn build           # Build for production
yarn start           # Start development server
```

## Architecture Notes

### Package System

- Uses Yarn workspaces for monorepo management
- Internal packages use path aliases (see `vitest.config.mts`)
- Build system uses esbuild for packages, Vite for the app
- TypeScript throughout with strict configuration

### Key Changes from Excalidraw

- **Rebranded** to "Parvez Draw"
- **Removed** all cloud/collaboration features (Firebase, Socket.IO, Sentry)
- **Removed** AI features (Text-to-Diagram, Diagram-to-Code)
- **Removed** Excalidraw+ integration and auth
- **Added** version history (IndexedDB snapshots)
- **Added** recent files list
- **Added** PDF export
- **Added** settings: auto-save interval, performance mode, high DPI
- **File format** renamed to `.parvezdraw` (backward compatible)

### Storage

- **localStorage** - App state, preferences, recent files
- **IndexedDB** - Files (images), version history, library

### Key Files

- `excalidraw-app/App.tsx` - Main app component
- `excalidraw-app/data/LocalData.ts` - Local storage manager
- `excalidraw-app/data/VersionHistory.ts` - Version snapshots
- `excalidraw-app/data/RecentFiles.ts` - Recent files list
- `excalidraw-app/data/settings.ts` - App settings
- `excalidraw-app/components/AppMainMenu.tsx` - Main menu with settings
- `packages/common/src/constants.ts` - App name and constants
