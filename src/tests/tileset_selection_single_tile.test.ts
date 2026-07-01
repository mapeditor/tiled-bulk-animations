import { test, expect } from "bun:test";
import { makeTile, getIndexModule, makeTilesetAsset } from "./_helpers";

const COLS = 10;
const ROWS = 8;
const TW = 16;
const TH = 16;

test("single tile selection produces 1x1 bounds", async () => {
    const { tileset_selection } = await getIndexModule();
    const asset = makeTilesetAsset(COLS, ROWS, TW, TH);
    const [rect] = tileset_selection(asset, [makeTile(23)]) as any[];
    expect(rect.x).toBe(3);
    expect(rect.y).toBe(2);
    expect(rect.width).toBe(1);
    expect(rect.height).toBe(1);
});
