import { test, expect } from "bun:test";
import { makeTile, getIndexModule, makeTilesetAsset } from "./_helpers";

const COLS = 10;
const ROWS = 8;
const TW = 16;
const TH = 16;

test("returns correct columns and rows from tileset dimensions", async () => {
    const { tileset_selection } = await getIndexModule();
    const asset = makeTilesetAsset(COLS, ROWS, TW, TH);
    const [_, dims] = tileset_selection(asset, [makeTile(0)]) as any[];
    expect(dims.tileset.columns).toBe(COLS);
    expect(dims.tileset.rows).toBe(ROWS);
});
