import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule } from "./_helpers";

test("frame_count = 1 returns single frame", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(5);
    const frames = get_tile_frames(tile, 1, 50, "Right", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 8));
    expect(frames).toHaveLength(1);
    expect(frames[0]).toEqual({ tileId: 5, duration: 50 });
});
