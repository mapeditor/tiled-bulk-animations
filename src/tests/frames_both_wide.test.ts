import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule } from "./_helpers";

test("Both wraps to next row per cells_per_row", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(1);
    const frames = get_tile_frames(tile, 2, 100, "Both", makeRect(1, 0, 5, 2), makeTilesetDimensions(10, 8));
    expect(frames[0].tileId).toBe(1);
    expect(frames[1].tileId).toBe(21);
});
