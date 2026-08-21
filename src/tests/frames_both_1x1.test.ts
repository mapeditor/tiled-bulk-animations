import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule } from "./_helpers";

test("Both with 1x1 selection advances along the row", async () => {
    const { get_tile_frames, AnimationDirection } = await getIndexModule();
    const tile = makeTile(0);
    const frames = get_tile_frames(tile, 3, 100, AnimationDirection.Both, makeRect(0, 0, 1, 1), makeTilesetDimensions(10, 8))!;
    expect(frames[0]!.tileId).toBe(0);
    expect(frames[1]!.tileId).toBe(1);
    expect(frames[2]!.tileId).toBe(2);
});

// Covers the wrap itself, which the case above never reaches: a 1x1 selection
// at x=2 must return to column 2 on the next row rather than running past the
// row end like Right does.
test("Both with 1x1 selection wraps back to the selection column", async () => {
    const { get_tile_frames, AnimationDirection } = await getIndexModule();
    const tile = makeTile(2);
    const frames = get_tile_frames(tile, 10, 100, AnimationDirection.Both, makeRect(2, 0, 1, 1), makeTilesetDimensions(10, 8))!;
    expect(frames.map(f => f.tileId)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 12, 13]);
});
