# Changelog

Changes to the Neo Viewer API software, whose version is given in `api/codemeta.json` and
matches the git tags `X.Y.Z`. Each release corresponds to a deployment of the service at
https://neoviewer.apps.ebrains.eu, so changes to the website and demo pages that the API
serves are included too.

The API *interface* has its own version, shown at `/api/docs`; all 1.x versions are served at
`/api/v1`. The React component is versioned separately: see `js/react/CHANGELOG.md`.

Entries for releases before 2.5.0 were reconstructed from the git history.

## [Unreleased]

### Added

- Usage tracking with EBRAINS Stats (Matomo): the website and demo pages use the Matomo
  JavaScript tracker on the production host only, and the API records requests server-side,
  so that use from visualisers embedded in other sites is counted. Server-side tracking is
  enabled by setting `MATOMO_SITE_ID`, and records visitor locations only if `MATOMO_TOKEN_AUTH`
  is also set.

## [2.5.0] - 2026-11-20

### Added

- `GET /api/v1/` reports the API interface version (`api_version`), the software version
  (`software_version`, from `codemeta.json`) and the commit and build time of the running
  deployment (`deployment`), replacing the previous `version` field (API interface 1.2).
- Light/dark theme for the website, with a toggle in the header, and breadcrumb navigation.

### Changed

- Upgraded Neo from 0.13.3 to 0.14.4, with numpy 2, scipy 1.17, quantities 0.16, h5py 3.16,
  pynwb 3.1 and other scientific dependencies. File-format support and some details of the
  returned data follow Neo 0.14.
- Upgraded FastAPI (0.136), Pydantic (2.13), uvicorn (0.46) and httpx, fixing security alerts.
- The OpenAPI document reports the API interface version (1.2) instead of a stale "1.8".
- Redesigned the homepage, guides and React demo using the EBRAINS Design System.
- The React demo uses neural-activity-visualizer-react 2.2.0.
- Docker images: the code and virtual environment are now owned by root, with only the download
  cache writable by the app, which reduces the production image from 1.12 GB to 702 MB.
  Packages that pulled in libbrotli1 were removed. The dev image runs uvicorn only, as in
  production.

### Fixed

- The React deployment guide produced a blank page on Netlify (new `build-demo-root` script),
  and the guides use current Netlify terminology.

## [2.4.0] - 2026-06-15

### Changed

- Production moved to the EBRAINS Kubernetes cluster: the API runs on uvicorn as a non-root
  user on port 8000, replacing nginx and supervisor, and serves the homepage and React demo
  itself.
- The React demo uses neural-activity-visualizer-react 2.1.0 (Material UI removed; changing
  `source` updates the component), built with Vite and Node 22.

### Added

- `codemeta.json` metadata for the API.

## [2.3.0] - 2026-01-23

### Changed

- Example and test data URLs use `data-proxy.ebrains.eu` instead of `object.cscs.ch`.
- Added the EBRAINS 2.0 acknowledgement.

## [2.2.0] - 2024-12-18

### Changed

- Neo is pinned to the released version 0.13.3 (previously installed from its `master`
  branch), with quantities 0.15.
- The service moved from `brainsimulation.eu` to `neoviewer.apps.ebrains.eu`.

## [2.1.0] - 2024-03-14

### Added

- Guides for deploying the React demo, using the AngularJS component and the plot
  interactivity features.

### Fixed

- Links to the API documentation, and remaining references to Django instead of FastAPI.

## [2.0.0] - 2024-01-03

### Changed

- The AngularJS component works with the FastAPI implementation introduced in 1.7.0:
  it no longer sends `format=json`, and handles `times` being `null` for regularly sampled
  analog signals.
- `/api/v1` is listed before the deprecated `/api` in the documentation.

### Fixed

- `down_sample_factor` may be left blank, and unexpected parameter values are handled more
  robustly.

## [1.8.0] - 2023-08-30

### Added

- Support for zip files and for multi-file and directory-based Neo IO modules.
- Support for files containing more than one Block (`block_id` parameter; API interface 1.1).
- Integration tests using example data from the G-Node GIN repository.

### Fixed

- Downloading of auxiliary files for multi-file formats.

## [1.7.0] - 2023-08-28

### Changed

- Reimplemented the API using FastAPI, replacing Django (API interface 1.0). Endpoints are
  served at `/api/v1`, and at `/api` for backwards compatibility. `format=json` is no
  longer needed, and `times` is `null` for regularly sampled analog signals.
- Neo is installed from its `master` branch.

### Fixed

- Clearer error messages when a data file cannot be opened or contains NaN values.

## [1.6.0] - 2023-08-23

### Changed

- Upgraded to Neo 0.12.0; Docker images based on Debian bullseye, using copies of the base
  images in the EBRAINS registry.

### Added

- Demos of multiple file types in the AngularJS and React demo pages.

### Fixed

- Files with an upper-case `.ABF` extension.

## [1.5.0] - 2022-04-29

### Added

- New homepage, including a hosted React demo app.
- Docker images built by GitLab CI on EBRAINS, with the repository mirrored there from GitHub.

### Changed

- Responses include the source URL and file name of the data file.

### Fixed

- Reading `.dat` files.

## [1.4.0] - 2021-04-19

### Changed

- Upgraded to Neo 0.9.0 (from a dedicated `neoview` branch), with support for NWB files.
- Better management of the cache of downloaded files.

### Added

- JSON error responses for missing parameters, and automated tests run by CI.

### Fixed

- Handling of non-numeric values of `down_sample_factor`.

## [1.3.0] - 2020-05-03

### Changed

- Upgraded to Neo 0.8.0, using lazy loading to read only the requested data.
- Downsampling is done on the server.

### Fixed

- Errors when opening a file that is already open, or downloading a file that is already
  cached.

## [1.2.0] - 2019-08-05

### Added

- Spike trains.
- `down_sample_factor` parameter.

## [1.1.0] - 2019-05-27

### Added

- Multi-channel signals and irregularly sampled signals.
- Display of multiple signals from a Block or Segment.
- JSON metadata for AsciiSignalIO.

### Changed

- IP addresses are anonymised in server logs.

## [1.0.0] - 2019-01-18

First release: a Django REST API that reads electrophysiology data files with Neo 0.7.1,
with an AngularJS component for plotting them. The IO class can be given explicitly with
the `iotype` attribute, and unsupported file types return an informative error (HTTP 415).
