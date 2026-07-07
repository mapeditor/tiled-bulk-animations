// Global Config
const config : IConfig =  {
    name: "BulkAnimationEditor",
    title: "Bulk Animation Editor",
    version: "1.4.0",
    debug: false
};

const action_animation_create = tiled.registerAction(`${config.name}_CreateFromSelection`,
    action => animation_create());
    action_animation_create.text = "Create Animations From Selection";
    action_animation_create.icon = "images/icon-create.png";

const action_animation_clear = tiled.registerAction(`${config.name}_ClearFromSelection`,
    action => animation_clear());
    action_animation_clear.text = "Clear Animations From Selection";
    action_animation_clear.icon = "images/icon-clear.png";

export function tileset_selection (tileset: Tileset, selected_tiles: Tile[]) : [rect, ITilesetDimensions] {
    // Create structured object for organization and better
    // visibility into what's needed in the object
    const tileset_dimensions : ITilesetDimensions = {
        image: {
            width: tileset.imageWidth,
            height: tileset.imageHeight
        },
        tileset: {
            tile: {
                width: tileset.tileWidth,
                height: tileset.tileHeight,
                spacing: tileset.tileSpacing
            },
            margin: tileset.margin,
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
    const tileset = tiled.activeAsset as Tileset;
    if (!tileset?.isTileset) {
        tiled.alert("No tileset is active");
        return;
    }

    // Ensure that there are tiles selected to operate on
    if (!tileset.selectedTiles.length) {
        tiled.alert("No tiles selected");
        return;
    }

    debug(`Selected tiles: ${tileset.selectedTiles.length}`);

    // Sort existing tiles
    const selected_tiles = tileset.selectedTiles.slice().sort((a, b) => a.id - b.id);

    // Check if the selected tiles have existing animations
    const selected_animated_tiles = selected_tiles.filter(tile => tile.frames?.length > 0);

    // If there are existing animations, ask the user for permission to overwrite them
    if (selected_animated_tiles.length) {
        const response = tiled.confirm(`There were ${selected_animated_tiles.length} tile(s) found in your selection that have existing animations. These will be overwritten. Continue?`);
        if (!response) { return; } else { debug(`Overwriting ${selected_animated_tiles.length} tile(s)`) }
    }

    const _tileset_selection = tileset_selection(tileset, selected_tiles)
    const tileset_selected_tiles = _tileset_selection[0];
    const tileset_dimensions = _tileset_selection[1];

    const dialog = dialog_create(config.title, 400);
    const result = animation_dialog_create(dialog, tileset_selected_tiles, tileset_dimensions);
    result.confirmation_button.clicked.connect(() => {
        const duration = result.animation_frame_duration.value;
        const frame_count = result.animation_frames_input.value;
        const direction = ["Right", "Down", "Both"][result.animation_direction.currentIndex];
        const stride: IStride = {
            horizontal: result.animation_stride_horizontal.value,
            vertical: result.animation_stride_vertical.value
        };
        if (!direction) {
            tiled.alert("No direction selected. (This should not occur)");
            return;
        }
        tileset.macro("Create Animations (Bulk)", () => {
            const results = selected_tiles.map(tile => get_tile_frames(tile, frame_count, duration, direction, tileset_selected_tiles, tileset_dimensions, stride));
            if (results.some(r => r === null)) {
                tiled.alert("The animation does not fit within the tileset bounds for one or more selected tiles. Try reducing the frame count or stride.");
                return;
            }
            for (let i = 0; i < selected_tiles.length; i++) {
                selected_tiles[i]!.frames = results[i]!;
            }
        });

        dialog.accept();
    });
}

export function get_tile_frames(tile: Tile, frame_count: number, duration: number, direction: string, tileset_selected_tiles: rect, tile_dimensions: ITilesetDimensions, stride?: IStride) {
    const st = stride || { horizontal: 0, vertical: 0 };
    const columns = tile_dimensions.tileset.columns;
    const max_tiles = columns * tile_dimensions.tileset.rows;

    if (direction === "Both") {
        const h_advance = tileset_selected_tiles.width + st.horizontal;
        const v_advance = tileset_selected_tiles.height + st.vertical;
        const cells_per_row = 1 + Math.floor((columns - tileset_selected_tiles.x - tileset_selected_tiles.width) / h_advance);
        const tile_col = tile.id % columns;
        const tile_row = Math.floor(tile.id / columns);
        const col_offset = tile_col - tileset_selected_tiles.x;
        const row_offset = tile_row - tileset_selected_tiles.y;

        if (frame_count > 0) {
            const last_cell_col = (frame_count - 1) % cells_per_row;
            const last_cell_row = Math.floor((frame_count - 1) / cells_per_row);
            const last_tc = tileset_selected_tiles.x + last_cell_col * h_advance + col_offset;
            const last_tr = tileset_selected_tiles.y + last_cell_row * v_advance + row_offset;
            if (last_tr * columns + last_tc >= max_tiles) return null;
        }

        const frames: frame[] = [];
        for (let i = 0; i < frame_count; i++) {
            const cell_col = i % cells_per_row;
            const cell_row = Math.floor(i / cells_per_row);
            const tc = tileset_selected_tiles.x + cell_col * h_advance + col_offset;
            const tr = tileset_selected_tiles.y + cell_row * v_advance + row_offset;
            frames.push({ tileId: tr * columns + tc, duration });
        }
        return frames;
    }

    const stride_value = direction === "Down"
        ? columns * (tileset_selected_tiles.height + st.vertical)
        : tileset_selected_tiles.width + st.horizontal;

    if (frame_count > 0) {
        if (direction === "Right") {
            if (tile.id % columns + (frame_count - 1) * stride_value >= columns) return null;
        } else {
            if (tile.id + (frame_count - 1) * stride_value >= max_tiles) return null;
        }
    }

    const frames: frame[] = [];
    for (let i = 0; i < frame_count; i++) {
        frames.push({ tileId: tile.id + i * stride_value, duration });
    }
    return frames;
}

function animation_clear () {
    const tileset = tiled.activeAsset as Tileset;
    if (!tileset?.isTileset) {
        tiled.alert("No tileset is active");
        return;
    }

    // Ensure that there are tiles selected to operate on
    if (!tileset.selectedTiles.length) {
        tiled.alert("No tiles selected");
        return;
    }

    // Sort existing tiles
    const selected_tiles = tileset.selectedTiles.slice().sort((a, b) => a.id - b.id);

    // Check if the selected tiles have existing animations
    const selected_animated_tiles = selected_tiles.filter(tile => tile.frames?.length > 0);

    // If there are existing animations, ask the user for permission to clear them
    if (selected_animated_tiles.length) {
        const response = tiled.confirm(`There were ${selected_animated_tiles.length} tile(s) found in your selection that have existing animations. The animations will be removed. Continue?`);
        if (!response) { return; } else { debug(`Clearing ${selected_animated_tiles.length} tile(s) animations`) }
    }

    // Clear animation frames
    tileset.macro("Clear Animations", () => {
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

function animation_dialog_create(dialog: Dialog, tileset_selected_tiles: rect, tile_dimensions: ITilesetDimensions) : IAnimationConfirmation {
    dialog!.addHeading("  The direction that animation frames advance in the sprite sheet", true);
    dialog!.addNewRow();
    const animation_direction = dialog!.addComboBox('Direction: ', ['Right', 'Down', 'Both']);

    dialog!.addSeparator();

    const columns = tile_dimensions.tileset.columns;
    const rows = tile_dimensions.tileset.rows;
    const sel_x = tileset_selected_tiles.x;
    const sel_y = tileset_selected_tiles.y;
    const sel_w = tileset_selected_tiles.width;
    const sel_h = tileset_selected_tiles.height;

    dialog!.addHeading("  The number of animation frames to generate", true);
    dialog!.addNewRow();
    const animation_frames_input = dialog!.addNumberInput('Frames: ');
    animation_frames_input.decimals = 0;
    animation_frames_input.minimum = 2;
    animation_frames_input.maximum = sel_w > 0 ? 1 + Math.floor((columns - sel_x - sel_w) / sel_w) : 99999;
    animation_frames_input.value = 2;

    dialog!.addSeparator();

    dialog!.addHeading("  Duration of each animation frame in milliseconds", true);
    dialog!.addNewRow();
    const animation_frame_duration = dialog!.addNumberInput('Duration(ms): ');
    animation_frame_duration.decimals = 0;
    animation_frame_duration.minimum = 0;
    animation_frame_duration.maximum = 9900;
    animation_frame_duration.value = 100;

    dialog!.addSeparator();

    dialog!.addHeading("  Additional stride (in tiles) to advance between frames", true);
    dialog!.addNewRow();
    const animation_stride_horizontal = dialog!.addNumberInput('Horizontal Stride: ');
    animation_stride_horizontal.decimals = 0;
    animation_stride_horizontal.minimum = 1 - sel_w;
    animation_stride_horizontal.value = 0;

    const animation_stride_vertical = dialog!.addNumberInput('Vertical Stride: ');
    animation_stride_vertical.decimals = 0;
    animation_stride_vertical.minimum = 1 - sel_h;
    animation_stride_vertical.value = 0;
    animation_stride_vertical.enabled = false;

    animation_direction.currentIndexChanged.connect((index: number) => {
        animation_stride_horizontal.enabled = index !== 1;
        animation_stride_vertical.enabled = index !== 0;
        animation_stride_horizontal.minimum = index === 1 ? 0 : 1 - sel_w;
        animation_stride_vertical.minimum = index === 0 ? 0 : 1 - sel_h;
        if (index === 0) {
            animation_frames_input.maximum = sel_w > 0 ? 1 + Math.floor((columns - sel_x - sel_w) / sel_w) : 99999;
        } else if (index === 1) {
            animation_frames_input.maximum = sel_h > 0 ? 1 + Math.floor((rows - sel_y - sel_h) / sel_h) : 99999;
        } else {
            const hf = sel_w > 0 ? 1 + Math.floor((columns - sel_x - sel_w) / sel_w) : 99999;
            const vf = sel_h > 0 ? 1 + Math.floor((rows - sel_y - sel_h) / sel_h) : 99999;
            animation_frames_input.maximum = hf * vf;
        }
    });

    const confirmation_button = dialog!.addButton("Confirm");
    const cancelation_button = dialog!.addButton("Cancel");

    cancelation_button.clicked.connect(() => dialog!.reject());
    dialog!.show();

    const data = {
        confirmation_button,
        animation_frames_input: animation_frames_input,
        animation_frame_duration: animation_frame_duration,
        animation_direction: animation_direction,
        animation_stride_horizontal,
        animation_stride_vertical
    }

    return data;
}

// Debug logging
function debug(message: string) {
    if (config.debug) {
        tiled.log(`[DEBUG]: ${message}`);
    }
}