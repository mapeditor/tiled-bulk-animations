# Changelog

## [1.4.0] - 2026-07-01

### Added
- `@mapeditor/tiled-api` v1.11.0 type definitions
- The dialog now remembers the last confirmed settings (direction, frames, duration and stride) until Tiled is closed or the extension is reloaded

### Changed
- Rewritten from prototype-based JavaScript to TypeScript with strict mode
- Icons moved to `images/` directory with updated paths
- Buttons renamed: `OK` → `Confirm`
- Menu items renamed: `Create Bulk Animations` → `Create Animations From Selection`, `Clear Animations` → `Clear Animations From Selection`

### Fixed
- Fixed an issue where the "Both" direction was being treated as a diagonal (introduced in 1.3.1). It now correctly restores the wrap behaviour logic found in 1.3.0.

## [1.3.2] - 2022-09-13

### Fixed
- Max frames and default stride not updating when switching directions

## [1.3.1] - 2022-09-13

### Fixed
- Stride and max frame calculation edge cases

## [1.3.0] - 2022-08-18

### Changed
- Adopted new dialog API introduced in Tiled 1.9

## [1.2.0] - 2021-01-21

### Added
- "Both" direction mode: animations that span right then wrap downward

## [1.1.0] - 2020-08-25

### Added
- Tileset margin and spacing support
- Discontinuous and non-rectangular selections
- Stride input (tiles to advance between frames)

## [1.0.0] - 2020-07-05

Initial release.
