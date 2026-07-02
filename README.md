# Bulk Animation Editor

A [Tiled Map Editor](https://www.mapeditor.org/) extension for creating animations across multiple tiles at once.

![Demo](demo.gif)

## How It Works

Select a group of tiles in your tileset where the first frame of each animation sits in a contiguous rectangular region. The extension automatically detects the layout and generates frame sequences in the direction you specify.

Supports three animation directions:
- **Right**: subsequent frames are to the right of the selection
- **Down**: subsequent frames are below the selection
- **Both**: frames progress right then wrap to the next row (grid order)

## Installation

1. Download [`bulk-animations.zip`](https://github.com/mapeditor/tiled-bulk-animations/releases/latest) from the latest release.
2. Extract and place the `bulk-animations` folder into Tiled's extensions directory.

| Platform | Extensions Directory |
|----------|---------------------|
| Windows  | `%USERPROFILE%/AppData/Local/Tiled/extensions/` |
| macOS    | `~/Library/Preferences/Tiled/extensions/` |
| Linux    | `~/.config/tiled/extensions/` |

> You can also open the directory from Tiled: **Edit → Preferences → Plugins → Open** (Extensions section).

## Usage

1. Open a tileset (`.tsx`) in Tiled.
2. Select the tiles containing the *first frame* of each animation you want to create. The selection must be a contiguous rectangular region.
3. Go to **Tileset → Create Animations From Selection**.
4. Choose the animation **direction** (Right, Down, or Both), number of **frames**, and **frame duration**.
5. Optionally add extra **Horizontal Stride** and/or **Vertical Stride** to account for gaps between animation frames in your sprite sheet.
6. Click **Confirm**.

The base stride is automatically derived from your selection dimensions and the chosen direction. The Horizontal/Vertical stride values add to this base calculation.

To remove animations, select the tiles and use **Tileset → Clear Animations From Selection**.

## Development

Written in TypeScript. Requires [Bun](https://bun.sh/).

```sh
bun install
```

### Build

```sh
bun run build
```

The output lands in `dist/bulk-animations/`. Copy that folder into Tiled's extensions directory to use the extension.

### Tests

```sh
bun test
```

### Debug Logging

Set `config.debug` to `true` in `src/index.ts` to enable debug output. Messages appear in Tiled's console (**View → Views and Toolbars → Console**). Set it back to `false` before building a release.

### Credits
- Leonard Pabin aka (Len) and Zachariah Husiar aka (Zabin) for the artwork located in src/tests/data/