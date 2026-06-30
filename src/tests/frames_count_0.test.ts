import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule } from "./_helpers";

test("frame_count = 0 returns empty array", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(5);
    const frames = get_tile_frames(tile, 0, 50, "Right", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 8));
    expect(frames).toHaveLength(0);
});
