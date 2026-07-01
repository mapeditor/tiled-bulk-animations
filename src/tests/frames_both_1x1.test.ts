import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule } from "./_helpers";

test("Both with 1x1 selection fills row then wraps", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(0);
    const frames = get_tile_frames(tile, 3, 100, "Both", makeRect(0, 0, 1, 1), makeTilesetDimensions(10, 8));
    expect(frames[0].tileId).toBe(0);
    expect(frames[1].tileId).toBe(1);
    expect(frames[2].tileId).toBe(2);
});
