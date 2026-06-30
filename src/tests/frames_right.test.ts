import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule } from "./_helpers";

test("Right frames advance by selection width", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(12);
    const frames = get_tile_frames(tile, 3, 100, "Right", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 8));
    expect(frames).toHaveLength(3);
    expect(frames[0]).toEqual({ tileId: 12, duration: 100 });
    expect(frames[1]).toEqual({ tileId: 15, duration: 100 });
    expect(frames[2]).toEqual({ tileId: 18, duration: 100 });
});
