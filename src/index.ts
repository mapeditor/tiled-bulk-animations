// Global Config
const config : IConfig =  {
    name: "BulkAnimationEditor",
    title: "Bulk Animation Editor",
    version: "1.4.0",
    debug: false
};

// The tileset currently being edited
let active_asset: Tileset;

// Connect to 'activeAssetChanged' signal to update active_asset value when asset is changed.
tiled.activeAssetChanged.connect((asset) => {
    // We only care about tilesets in this scenerio
    if (!asset?.isTileset) {
        return;
    }

    active_asset = asset as Tileset;

    // Reset selected tiles because Tiled stores this value from the last opened tileset
    // Which creates a stale reference
    active_asset.selectedTiles = [];
});

const action_animation_create = tiled.registerAction(`${config.name}_CreateFromSelection`,
    action => animation_create());
    action_animation_create.text = "Create Animations From Selection";
    action_animation_create.icon = "images/icon-create.png";

const action_animation_clear = tiled.registerAction(`${config.name}_ClearFromSelection`,
    action => animation_clear());
    action_animation_clear.text = "Clear Animations From Selection";
    action_animation_clear.icon = "images/icon-clear.png";

export function tileset_selection (selected_tiles: Tile[]) {
    // Create structured object for organization and better
    // visibility into what's needed in the object
    const tileset_dimensions : ITilesetDimensions = {
        image: {
            width: active_asset.imageWidth,
            height: active_asset.imageHeight
        },
        tileset: {
            tile: {
                width: active_asset.tileWidth,
                height: active_asset.tileHeight,
                spacing: active_asset.tileSpacing
            },
            margin: active_asset.margin,
            rows: 0,
            columns: 0
        }
    }

    // Calculate tileset columns
    tileset_dimensions.tileset.columns = Math.floor((
        tileset_dimensions.image.width + tileset_dimensions.tileset.tile.spacing - 2*tileset_dimensions.tileset.margin)
        / (tileset_dimensions.tileset.tile.width + tileset_dimensions.tileset.tile.spacing)
    );

    // Calculate tileset rows
    tileset_dimensions.tileset.rows = Math.floor((
        tileset_dimensions.image.height + tileset_dimensions.tileset.tile.spacing -2*tileset_dimensions.tileset.margin)
        / (tileset_dimensions.tileset.tile.height + tileset_dimensions.tileset.tile.spacing)
    );

    let selection_left_bounds = Infinity,
    selection_top_bounds = Infinity,
    selection_bottom_bounds = -Infinity,
    selection_right_bounds = -Infinity;

    selected_tiles.forEach((tile => {
        const x = tile.id % tileset_dimensions.tileset.columns;
        const y = Math.floor(tile.id / tileset_dimensions.tileset.columns);
        if (x < selection_left_bounds) selection_left_bounds = x;
        if (x > selection_right_bounds) selection_right_bounds = x;
        if (y < selection_top_bounds) selection_top_bounds = y;
        if (y > selection_bottom_bounds) selection_bottom_bounds = y;
    }));

    const selection_width = selection_right_bounds - selection_left_bounds + 1;
    const selection_height = selection_bottom_bounds - selection_top_bounds + 1;

    const selection_rect_bounds = Qt.rect(selection_left_bounds, selection_top_bounds, selection_width, selection_height);
    return [selection_rect_bounds, tileset_dimensions];
}

function animation_create () {
    // Ensure that there are tiles selected to operate on
    const selected_tile_count = active_asset.selectedTiles.length > 0 ? active_asset.selectedTiles: 0;
    if (!selected_tile_count) {
        tiled.alert("No tiles selected");
        return;
    }

    debug(`Selected tiles: ${selected_tile_count.length}`);

    // Sort existing tiles
    const selected_tiles = active_asset.selectedTiles.slice().sort((a, b) => a.id - b.id);

    // Check if the selected tiles have existing animations
    const selected_animated_tiles = selected_tiles.filter(tile => tile.frames?.length > 0);

    // Check if there are animated tiles to operate on
    const selected_animated_tile_count = selected_animated_tiles.length > 0 ? selected_animated_tiles: 0;

    // If there are existing animations, ask the user for permission to overwrite them
    if (selected_animated_tile_count) {
        const response = tiled.confirm(`There were ${selected_animated_tile_count.length} tile(s) found in your selection that have existing animations. These will be overwritten. Continue?`);
        if (!response) { return; } else { debug(`Overwriting ${selected_animated_tile_count.length} tile(s)`) }
    }

    const _tileset_selection = tileset_selection(selected_tiles)
    const tileset_selected_tiles = _tileset_selection[0] as rect;
    const tileset_dimensions = _tileset_selection[1] as ITilesetDimensions;

    if (selected_tiles.length !== tileset_selected_tiles.width * tileset_selected_tiles.height) {
        tiled.alert("Selection must be a rectangular region");
        return;
    }

    const dialog = dialog_create(config.title, 400);
    const result = animation_dialog_create(dialog);
    result.confirmation_button.clicked.connect(() => {
        const duration = result.animation_frame_duration.value;
        const frame_count = result.animation_frames_input.value;
        const direction = ["Right", "Down", "Both"][result.animation_direction.currentIndex];
        if (!direction) {
            tiled.alert("No direction selected. (This should not occur)");
            return;
        }
        active_asset.macro("Create Animations (Bulk)", () => {
            for (const tile of selected_tiles) {
                const tile_frames = get_tile_frames(tile, frame_count, duration, direction, tileset_selected_tiles, tileset_dimensions);
                if (!tile_frames) return;
                    tile.frames = tile_frames;
            }
        });

        dialog.accept();
    });
}

export function get_tile_frames(tile: Tile, frame_count: number, duration: number, direction: string, tileset_selected_tiles: rect, tile_dimensions: ITilesetDimensions) {
    const stride = direction === "Down"
        ? tile_dimensions.tileset.columns * tileset_selected_tiles.height
        : direction === "Both"
            ? tileset_selected_tiles.width + tile_dimensions.tileset.columns * tileset_selected_tiles.height
            : tileset_selected_tiles.width;

    const frames: frame[] = [];
    for (let i = 0; i < frame_count; i++) {
        frames.push({ tileId: tile.id + i * stride, duration });
    }
    return frames;
}

function animation_clear () {
    // Ensure that there are tiles selected to operate on
    const selected_tile_count = active_asset.selectedTiles.length > 0 ? active_asset.selectedTiles: 0;
    if (!selected_tile_count) {
        tiled.alert("No tiles selected");
        return;
    }

    // Sort existing tiles
    const selected_tiles = active_asset.selectedTiles.slice().sort((a, b) => a.id - b.id);

    // Check if the selected tiles have existing animations
    const selected_animated_tiles = selected_tiles.filter(tile => tile.frames?.length > 0);

    // Check if there are animated tiles to operate on
    const selected_animated_tile_count = selected_animated_tiles.length > 0 ? selected_animated_tiles: 0;

    // If there are existing animations, ask the user for permission to clear them
    if (selected_animated_tile_count) {
        const response = tiled.confirm(`There were ${selected_animated_tile_count.length} tile(s) found in your selection that have existing animations. The animations will be removed. Continue?`);
        if (!response) { return; } else { debug(`Clearing ${selected_animated_tile_count.length} tile(s) animations`) }
    }

    // Clear animation frames
    active_asset.macro("Clear Animations", () => {
        selected_animated_tiles.forEach(tile => {
            tile.frames = [];
        });
    });
}

// Extend Menu
tiled.extendMenu("Tileset", [
    { separator: true },
    { action: `${config.name}_CreateFromSelection`},
    { action: `${config.name}_ClearFromSelection`},
    { separator: true }
]);

function dialog_create(title: string, min_width?: number, min_height?: number) : Dialog {
    const dialog = new Dialog(title);
    if (min_width !== undefined) dialog.minimumWidth = min_width;
    if (min_height !== undefined) dialog.minimumHeight = min_height;
    return dialog;
}

function animation_dialog_create(dialog: Dialog) : IAnimationConfirmation {
    const animation_direction = dialog!.addComboBox('Direction: ', ['Right', 'Down', 'Both']);

    const animation_frames_input = dialog!.addNumberInput('Frames: ');
    animation_frames_input.decimals = 0;
    animation_frames_input.minimum = 2;
    animation_frames_input.value = 2;

    const animation_frame_duration = dialog!.addNumberInput('Duration(ms): ');
    animation_frame_duration.decimals = 0;
    animation_frame_duration.minimum = 0;
    animation_frame_duration.maximum = 9900;
    animation_frame_duration.value = 100;

    const confirmation_button = dialog!.addButton("Confirm");
    const cancelation_button = dialog!.addButton("Cancel");

    cancelation_button.clicked.connect(() => dialog!.reject());
    dialog!.show();

    const data = {
        confirmation_button,
        animation_frames_input: animation_frames_input,
        animation_frame_duration: animation_frame_duration,
        animation_direction: animation_direction
    }

    return data;
}

// Debug logging
function debug(message: string) {
    if (config.debug) {
        tiled.log(`[DEBUG]: ${message}`);
    }
}

export function _setActiveAsset(asset: Tileset) {
    active_asset = asset;
}