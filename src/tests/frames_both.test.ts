import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule, AnimationDirection } from "./_helpers";

test("Both fills a row left-to-right then wraps to the next", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(12);
    const frames = get_tile_frames(tile, 3, 100, AnimationDirection.Both, makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 8));
    expect(frames).toHaveLength(3);
    expect(frames[0]).toEqual({ tileId: 12, duration: 100 });
    expect(frames[1]).toEqual({ tileId: 15, duration: 100 });
    expect(frames[2]).toEqual({ tileId: 32, duration: 100 });
});
