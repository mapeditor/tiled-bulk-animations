import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule } from "./_helpers";

test("Right stride equals exactly the selection width", async () => {
    const { get_tile_frames, AnimationDirection } = await getIndexModule();
    const tile = makeTile(0);
    const frames = get_tile_frames(tile, 4, 100, AnimationDirection.Right, makeRect(0, 0, 1, 1), makeTilesetDimensions(10, 8))!;
    expect(frames.map(f => f.tileId)).toEqual([0, 1, 2, 3]);
});
