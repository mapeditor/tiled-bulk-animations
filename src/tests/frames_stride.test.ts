import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, makeStride, getIndexModule } from "./_helpers";

test("Right stride adds horizontal stride", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(2);
    const frames = get_tile_frames(tile, 3, 100, "Right", makeRect(0, 0, 3, 2), makeTilesetDimensions(15, 8), makeStride(1));
    expect(frames).toHaveLength(3);
    expect(frames[0]).toEqual({ tileId: 2, duration: 100 });
    expect(frames[1]).toEqual({ tileId: 6, duration: 100 });
    expect(frames[2]).toEqual({ tileId: 10, duration: 100 });
});

test("Down stride adds vertical stride", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(12);
    const frames = get_tile_frames(tile, 3, 100, "Down", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 15), makeStride(0, 1));
    expect(frames).toHaveLength(3);
    expect(frames[0]).toEqual({ tileId: 12, duration: 100 });
    expect(frames[1]).toEqual({ tileId: 42, duration: 100 });
    expect(frames[2]).toEqual({ tileId: 72, duration: 100 });
});

test("Both stride adds horizontal + vertical stride", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(12);
    const frames = get_tile_frames(tile, 3, 100, "Both", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 15), makeStride(1, 10));
    expect(frames).toHaveLength(3);
    expect(frames[0]).toEqual({ tileId: 12, duration: 100 });
    expect(frames[1]).toEqual({ tileId: 16, duration: 100 });
    expect(frames[2]).toEqual({ tileId: 132, duration: 100 });
});

test("Zero stride produces same results as no stride", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(12);
    const frames_no_stride = get_tile_frames(tile, 3, 100, "Right", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 8));
    const frames_zero_stride = get_tile_frames(tile, 3, 100, "Right", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 8), makeStride(0, 0));
    expect(frames_no_stride).toEqual(frames_zero_stride);
});

test("returns null when frames reference non-existent tiles", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(75);
    const frames = get_tile_frames(tile, 3, 100, "Right", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 8));
    expect(frames).toBeNull();
});

test("negative horizontal stride reduces advance below selection width", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(0);
    const frames = get_tile_frames(tile, 3, 100, "Right", makeRect(0, 0, 3, 2), makeTilesetDimensions(10, 8), makeStride(-1));
    expect(frames).toHaveLength(3);
    expect(frames[0]).toEqual({ tileId: 0, duration: 100 });
    expect(frames[1]).toEqual({ tileId: 2, duration: 100 });
    expect(frames[2]).toEqual({ tileId: 4, duration: 100 });
});

test("negative vertical stride reduces advance below selection height", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(12);
    const frames = get_tile_frames(tile, 3, 100, "Down", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 15), makeStride(0, -1));
    expect(frames).toHaveLength(3);
    expect(frames[0]).toEqual({ tileId: 12, duration: 100 });
    expect(frames[1]).toEqual({ tileId: 22, duration: 100 });
    expect(frames[2]).toEqual({ tileId: 32, duration: 100 });
});
