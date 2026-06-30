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

1. Download [`bulk-animations.zip`](https://github.com/Lillious-Networks/tiled-bulk-animations/releases/latest) from the latest release.
2. Extract and place the `bulk-animations` folder into Tiled's extensions directory.

| Platform | Extensions Directory |
|----------|---------------------|
| Windows  | `%USERPROFILE%/AppData/Local/Tiled/extensions/` |
| macOS    | `~/Library/Preferences/Tiled/extensions/` |
| Linux    | `~/.config/tiled/extensions/` |

> You can also open the directory from Tiled: **Edit → Preferences → Plugins → Open** (Extensions section).

## Usage

1. Open a tileset (`.tsx`) in Tiled.
2. Select the tiles containing the *first frame* of each animation you want to create.
3. Go to **Tileset → Create Animation From Selection**.
4. Choose the animation **direction**, number of **frames** per animation, and **frame duration**.
5. Click **OK**.

Stride (the number of tiles between consecutive frames) is automatically derived from your selection size.

To remove animations, select the tiles and use **Tileset → Clear Animations In Selection**.

## Development

Requires [Bun](https://bun.sh/).

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
