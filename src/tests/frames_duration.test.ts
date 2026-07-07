import { test, expect } from "bun:test";
import { makeTile, makeRect, makeTilesetDimensions, getIndexModule } from "./_helpers";

test("duration is preserved on all frames", async () => {
    const { get_tile_frames } = await getIndexModule();
    const tile = makeTile(0);
    const frames = get_tile_frames(tile, 4, 250, "Right", makeRect(2, 1, 3, 2), makeTilesetDimensions(10, 8));
    expect(frames).toHaveLength(4);
    for (const f of frames as any[]) {
        expect(f.duration).toBe(250);
    }
});
