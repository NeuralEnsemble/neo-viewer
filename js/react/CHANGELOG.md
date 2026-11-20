# Changelog

## [2.1.1] - 2026-07-03

### Changed

- Upgraded build/test toolchain to Vite 7, Vitest 4, and `@vitejs/plugin-react` 5 to resolve Dependabot security alerts (dev dependencies only; no runtime API changes).

### Fixed

- Pinned the library CSS output filename to `style.css` so the published `./style.css` export keeps resolving under Vite 6+.

## [2.1.0] - 2026-03-30

### Added

- Changing the `source` attribute of `Visualizer` now updates the component dynamically.
- Unit tests for modifying the `source` attribute.

### Fixed

- Race condition when `source` changes rapidly (added cleanup to `useEffect`).

## [2.0.0] - 2026-02-18

### Changed

- Replaced Material UI (MUI) dependency with plain HTML elements and a bundled CSS stylesheet (`visualizer.css`), removing the need for `@mui/material` and `@emotion/*` peer dependencies.
- Icons replaced with inline SVGs (sourced from Bootstrap Icons).
- Info panel now uses a simple popover implementation instead of MUI `Popover`.

### Added

- CSS custom properties (e.g. `--nv-primary`) for easy theming without a component library.
- `codemeta.json` metadata file.

## [1.1.0] - 2026-02-18

### Changed

- Upgraded to React 19, MUI v6, and Plotly.js v2.x.
- Migrated build system from Rollup to Vite.
- Migrated demo deployment URLs from brainsimulation.eu to apps.ebrains.eu.
- Replaced object.cscs.ch data URLs with data-proxy.ebrains.eu.

### Added

- Multi-file demo for the React component.
- `.nvmrc` for consistent Node version.
- EBRAINS-2.0 acknowledgement.

## [1.0.4] - 2022-05-09

### Changed

- Version bump only (build metadata update).

## [1.0.3] - 2022-05-09

### Fixed

- Bug where `results` variable was referenced as `res` in analog signal callback.
- Base URL configuration for API in the master branch.
- Various URL fixes for hosting the demo in a subdirectory.

## [1.0.2] - 2022-04-28

### Improved

- Error handling in the Visualizer component.

## [1.0.1] - 2022-01-03

### Fixed

- React version compatibility issue.

## [1.0.0] - 2021-12-08

### Changed

- Renamed repository; demo app completed.
- Updated build scripts.

## [0.1.0] - 2021-12-07

### Added

- Initial release of the React component.
- Visualization of analog signals and spike trains using Plotly.js.
- Configurable base URL for the API.
- Metadata display panel with download button.
- Toggle buttons for showing/hiding signals and spike trains.
- Responsive sizing.
- Loading indicator.
- Interactive demo application.
