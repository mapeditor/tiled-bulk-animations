import { test, expect } from "bun:test";
import { makeTile, getIndexModule, makeTilesetAsset } from "./_helpers";

const COLS = 10;
const ROWS = 8;
const TW = 16;
const TH = 16;

test("top-left tile correctly identifies x=0,y=0", async () => {
    const { tileset_selection } = await getIndexModule();
    const asset = makeTilesetAsset(COLS, ROWS, TW, TH);
    const [rect] = tileset_selection(asset, [makeTile(0)]) as any[];
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
});
