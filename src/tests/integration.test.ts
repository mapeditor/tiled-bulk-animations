import { test, expect, describe } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, makeStride, makeTilesetAsset, getIndexModule } from "./_helpers";

// These constants are derived from test_map.json tileset configurations
const TILESETS = {
    group1: {
        rect1: { cols: 6,  rows: 15, tw: 32, th: 32, iw: 192, ih: 480 },
        rect2: { cols: 12, rows: 9,  tw: 32, th: 32, iw: 384, ih: 288 },
        square: { cols: 9,  rows: 9,  tw: 32, th: 32, iw: 288, ih: 288 },
    },
    group2: {
        rect1: { cols: 6,  rows: 10, tw: 32, th: 32, iw: 192, ih: 320 },
        rect2: { cols: 12, rows: 6,  tw: 32, th: 32, iw: 384, ih: 192 },
        square: { cols: 9,  rows: 6,  tw: 32, th: 32, iw: 288, ih: 192 },
    },
    group3: {
        rect1: { cols: 4,  rows: 15, tw: 32, th: 32, iw: 128, ih: 480 },
        rect2: { cols: 8,  rows: 9,  tw: 32, th: 32, iw: 256, ih: 288 },
        square: { cols: 6,  rows: 9,  tw: 32, th: 32, iw: 192, ih: 288 },
    },
} as const;

describe("integration: tileset_selection", () => {
    test("rect1 (6 col): tileset_selection computes correct columns and rows", async () => {
        const { tileset_selection } = await getIndexModule();
        const cfg = TILESETS.group1.rect1;
        const tileset = makeTilesetAsset(cfg.cols, cfg.rows, cfg.tw, cfg.th, 0, 0);

        // Select a 3x2 block of tiles starting at tile 0 (row 0, cols 0-2)
        // In a 6-col grid: tiles 0,1,2 + 6,7,8
        const selected = [makeTile(0), makeTile(1), makeTile(2), makeTile(6), makeTile(7), makeTile(8)];

        const [rect, dims] = tileset_selection(tileset, selected) as any;

        expect(dims.tileset.columns).toBe(cfg.cols);
        expect(dims.tileset.rows).toBe(cfg.rows);
        expect(rect.x).toBe(0);
        expect(rect.y).toBe(0);
        expect(rect.width).toBe(3);
        expect(rect.height).toBe(2);
    });

    test("rect2 (12 col): tileset_selection computes correct columns and rows", async () => {
        const { tileset_selection } = await getIndexModule();
        const cfg = TILESETS.group1.rect2;
        const tileset = makeTilesetAsset(cfg.cols, cfg.rows, cfg.tw, cfg.th, 0, 0);

        const selected = [makeTile(0), makeTile(1), makeTile(2), makeTile(12), makeTile(13), makeTile(14)];

        const [rect, dims] = tileset_selection(tileset, selected) as any;

        expect(dims.tileset.columns).toBe(cfg.cols);
        expect(dims.tileset.rows).toBe(cfg.rows);
        expect(rect.x).toBe(0);
        expect(rect.y).toBe(0);
        expect(rect.width).toBe(3);
        expect(rect.height).toBe(2);
    });

    test("square (9 col): tileset_selection computes correct columns and rows", async () => {
        const { tileset_selection } = await getIndexModule();
        const cfg = TILESETS.group1.square;
        const tileset = makeTilesetAsset(cfg.cols, cfg.rows, cfg.tw, cfg.th, 0, 0);

        const selected = [makeTile(0), makeTile(1), makeTile(2), makeTile(9), makeTile(10), makeTile(11)];

        const [rect, dims] = tileset_selection(tileset, selected) as any;

        expect(dims.tileset.columns).toBe(cfg.cols);
        expect(dims.tileset.rows).toBe(cfg.rows);
        expect(rect.x).toBe(0);
        expect(rect.y).toBe(0);
        expect(rect.width).toBe(3);
        expect(rect.height).toBe(2);
    });

    test("group3 rect1 (4 col): tileset_selection on narrow tileset", async () => {
        const { tileset_selection } = await getIndexModule();
        const cfg = TILESETS.group3.rect1;
        const tileset = makeTilesetAsset(cfg.cols, cfg.rows, cfg.tw, cfg.th, 0, 0);

        const selected = [makeTile(0), makeTile(1), makeTile(4), makeTile(5)];

        const [rect, dims] = tileset_selection(tileset, selected) as any;

        expect(dims.tileset.columns).toBe(cfg.cols);
        expect(dims.tileset.rows).toBe(cfg.rows);
        expect(rect.x).toBe(0);
        expect(rect.y).toBe(0);
        expect(rect.width).toBe(2);
        expect(rect.height).toBe(2);
    });
});

describe("integration: get_tile_frames with real tileset layouts", () => {
    test("rect1 (6 col, 3x2 sel): Right direction stride = 3", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group1.rect1;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 4, 500, "Right",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th)
        );
        expect(frames).toHaveLength(4);
        expect(frames[0]).toEqual({ tileId: 0, duration: 500 });
        expect(frames[1]).toEqual({ tileId: 3, duration: 500 });
        expect(frames[2]).toEqual({ tileId: 6, duration: 500 });
        expect(frames[3]).toEqual({ tileId: 9, duration: 500 });
    });

    test("rect1 (6 col, 3x2 sel): Down direction stride = columns * height", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group1.rect1;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 4, 500, "Down",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th)
        );
        // columns=6, height=2 → stride = 12
        expect(frames[0]).toEqual({ tileId: 0,  duration: 500 });
        expect(frames[1]).toEqual({ tileId: 12, duration: 500 });
        expect(frames[2]).toEqual({ tileId: 24, duration: 500 });
        expect(frames[3]).toEqual({ tileId: 36, duration: 500 });
    });

    test("rect1 (6 col, 3x2 sel): Both direction stride = 3 + 6*2 = 15", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group1.rect1;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 4, 500, "Both",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th)
        );
        // Both stride = 3 + 12 = 15
        expect(frames[0]).toEqual({ tileId: 0,  duration: 500 });
        expect(frames[1]).toEqual({ tileId: 15, duration: 500 });
        expect(frames[2]).toEqual({ tileId: 30, duration: 500 });
        expect(frames[3]).toEqual({ tileId: 45, duration: 500 });
    });

    test("rect2 (12 col, 3x2 sel): Both direction stride = 3 + 12*2 = 27", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group1.rect2;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 4, 500, "Both",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th)
        );
        expect(frames[0]).toEqual({ tileId: 0,  duration: 500 });
        expect(frames[1]).toEqual({ tileId: 27, duration: 500 });
        expect(frames[2]).toEqual({ tileId: 54, duration: 500 });
        expect(frames[3]).toEqual({ tileId: 81, duration: 500 });
    });

    test("square (9 col, 3x2 sel): Both direction stride = 3 + 9*2 = 21", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group1.square;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 4, 500, "Both",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th)
        );
        expect(frames[0]).toEqual({ tileId: 0,  duration: 500 });
        expect(frames[1]).toEqual({ tileId: 21, duration: 500 });
        expect(frames[2]).toEqual({ tileId: 42, duration: 500 });
        expect(frames[3]).toEqual({ tileId: 63, duration: 500 });
    });

    test("group3 rect1 (4 col, 2x2 sel): Right direction stride = 2", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group3.rect1;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 4, 500, "Right",
            makeRect(0, 0, 2, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th)
        );
        expect(frames[0]).toEqual({ tileId: 0, duration: 500 });
        expect(frames[1]).toEqual({ tileId: 2, duration: 500 });
        expect(frames[2]).toEqual({ tileId: 4, duration: 500 });
        expect(frames[3]).toEqual({ tileId: 6, duration: 500 });
    });

    test("group3 rect2 (8 col, 2x2 sel): Both stride = 2 + 8*2 = 18", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group3.rect2;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 4, 500, "Both",
            makeRect(0, 0, 2, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th)
        );
        expect(frames[0]).toEqual({ tileId: 0,  duration: 500 });
        expect(frames[1]).toEqual({ tileId: 18, duration: 500 });
        expect(frames[2]).toEqual({ tileId: 36, duration: 500 });
        expect(frames[3]).toEqual({ tileId: 54, duration: 500 });
    });
});

describe("integration: stride with real tileset layouts", () => {
    test("rect1 (6 col, 3x2 sel, horizontal=1): Right stride = 3 + 1 = 4", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group1.rect1;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 4, 500, "Right",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th),
            makeStride(1)
        );
        expect(frames[0]).toEqual({ tileId: 0,  duration: 500 });
        expect(frames[1]).toEqual({ tileId: 4,  duration: 500 });
        expect(frames[2]).toEqual({ tileId: 8,  duration: 500 });
        expect(frames[3]).toEqual({ tileId: 12, duration: 500 });
    });

    test("rect1 (6 col, 3x2 sel, vertical=20): Down stride = 12 + 20 = 32", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group1.rect1;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 3, 500, "Down",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th),
            makeStride(0, 20)
        );
        expect(frames[0]).toEqual({ tileId: 0,  duration: 500 });
        expect(frames[1]).toEqual({ tileId: 32, duration: 500 });
        expect(frames[2]).toEqual({ tileId: 64, duration: 500 });
    });

    test("square (9 col, 3x2 sel): horizontal + vertical on Both direction", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group1.square;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 3, 500, "Both",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th),
            makeStride(3, 9)
        );
        // stride = width + cols*height + h + v = 3 + 18 + 3 + 9 = 33
        expect(frames[0]).toEqual({ tileId: 0,  duration: 500 });
        expect(frames[1]).toEqual({ tileId: 33, duration: 500 });
        expect(frames[2]).toEqual({ tileId: 66, duration: 500 });
    });

    test("group3 rect1 (4 col, 2x2 sel): horizontal stride on narrow tileset", async () => {
        const { get_tile_frames } = await getIndexModule();
        const cfg = TILESETS.group3.rect1;
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 4, 500, "Right",
            makeRect(0, 0, 2, 2),
            makeTilesetDimensions(cfg.cols, cfg.rows, cfg.tw, cfg.th),
            makeStride(2)
        );
        // stride = width + h = 2 + 2 = 4
        expect(frames[0]).toEqual({ tileId: 0,  duration: 500 });
        expect(frames[1]).toEqual({ tileId: 4,  duration: 500 });
        expect(frames[2]).toEqual({ tileId: 8,  duration: 500 });
        expect(frames[3]).toEqual({ tileId: 12, duration: 500 });
    });
});

describe("integration: frame_count edge cases with real tilesets", () => {
    test("frame_count=0 returns empty array", async () => {
        const { get_tile_frames } = await getIndexModule();
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 0, 100, "Right",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(6, 15, 32, 32)
        );
        expect(frames).toEqual([]);
    });

    test("frame_count=1 returns single frame", async () => {
        const { get_tile_frames } = await getIndexModule();
        const tile = makeTile(42);
        const frames = get_tile_frames(
            tile, 1, 100, "Down",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(12, 9, 32, 32)
        );
        expect(frames).toHaveLength(1);
        expect(frames[0]).toEqual({ tileId: 42, duration: 100 });
    });

    test("large frame_count works correctly", async () => {
        const { get_tile_frames } = await getIndexModule();
        const tile = makeTile(0);
        const frames = get_tile_frames(
            tile, 20, 500, "Right",
            makeRect(0, 0, 3, 2),
            makeTilesetDimensions(6, 15, 32, 32)
        );
        expect(frames).toHaveLength(20);
        // stride = 3, so tileId[i] = 0 + i*3
        expect(frames[0].tileId).toBe(0);
        expect(frames[19].tileId).toBe(57);
    });
});

describe("integration: consistency across tileset variants", () => {
    // The same 3x2 selection should produce the same Right stride regardless of tileset width
    test("3x2 selection produces width=3 Right stride across all column widths", async () => {
        const { get_tile_frames } = await getIndexModule();
        const tilesetColumnWidths = [4, 6, 8, 9, 12];
        const tile = makeTile(0);
        const sel = makeRect(0, 0, 3, 2);

        for (const cols of tilesetColumnWidths) {
            const rows = 10; // arbitrary - enough tiles
            const frames = get_tile_frames(
                tile, 3, 100, "Right",
                sel,
                makeTilesetDimensions(cols, rows, 32, 32)
            );
            expect(frames[0].tileId).toBe(0);
            expect(frames[1].tileId).toBe(3);
            expect(frames[2].tileId).toBe(6);
        }
    });

    // Down stride changes with tileset column count
    test("3x2 selection Down stride scales with columns", async () => {
        const { get_tile_frames } = await getIndexModule();
        const tile = makeTile(0);
        const sel = makeRect(0, 0, 3, 2);

        const frames6 = get_tile_frames(tile, 3, 100, "Down", sel, makeTilesetDimensions(6, 15, 32, 32));
        const frames12 = get_tile_frames(tile, 3, 100, "Down", sel, makeTilesetDimensions(12, 9, 32, 32));

        // 6 cols: stride = 6*2 = 12  → 0, 12, 24
        // 12 cols: stride = 12*2 = 24 → 0, 24, 48
        expect(frames6[1].tileId).toBe(12);
        expect(frames12[1].tileId).toBe(24);
    });

    // Padding should work identically regardless of tile size
    test("stride behavior is independent of tile dimensions", async () => {
        const { get_tile_frames } = await getIndexModule();
        const tile = makeTile(0);
        const sel = makeRect(0, 0, 2, 2);
        const st = makeStride(1);

        const frames16 = get_tile_frames(tile, 3, 100, "Right", sel, makeTilesetDimensions(8, 10, 16, 16), st);
        const frames32 = get_tile_frames(tile, 3, 100, "Right", sel, makeTilesetDimensions(8, 10, 32, 32), st);

        // stride = 2 + 1 = 3, independent of tile width/height
        expect(frames16[1].tileId).toBe(3);
        expect(frames32[1].tileId).toBe(3);
    });
});
