import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule } from "./_helpers";

test("duration is preserved on all frames", async () => {
    const { get_tile_frames, AnimationDirection } = await getIndexModule();
    const tile = makeTile(0);
    const frames = get_tile_frames(tile, 4, 250, AnimationDirection.Right, makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 8))!;
    expect(frames.map(f => f.duration)).toEqual([250, 250, 250, 250]);
});
