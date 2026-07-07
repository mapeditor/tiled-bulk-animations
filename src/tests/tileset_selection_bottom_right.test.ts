import { test, expect } from "bun:test";
import { makeTile, getIndexModule, makeTilesetAsset } from "./_helpers";

const COLS = 10;
const ROWS = 8;
const TW = 16;
const TH = 16;

test("bottom-right tile produces 1x1 at correct position", async () => {
    const { tileset_selection } = await getIndexModule();
    const asset = makeTilesetAsset(COLS, ROWS, TW, TH);
    const lastId = ROWS * COLS - 1;
    const [rect] = tileset_selection(asset, [makeTile(lastId)]) as any[];
    expect(rect.x).toBe(COLS - 1);
    expect(rect.y).toBe(ROWS - 1);
    expect(rect.width).toBe(1);
    expect(rect.height).toBe(1);
});
