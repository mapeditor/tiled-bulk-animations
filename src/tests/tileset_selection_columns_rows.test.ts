import { test, expect } from "bun:test";
import { makeTile, getIndexModule, setActiveAsset } from "./_helpers";

const COLS = 10;
const ROWS = 8;
const TW = 16;
const TH = 16;

test("returns correct columns and rows from tileset dimensions", async () => {
    const { tileset_selection } = await getIndexModule();
    await setActiveAsset({
        imageWidth: COLS * TW,
        imageHeight: ROWS * TH,
        tileWidth: TW,
        tileHeight: TH,
        tileSpacing: 0,
        margin: 0,
        isTileset: true,
        selectedTiles: [],
        modifiedChanged: { connect: () => {} },
        macro: () => {},
        findTile: undefined,
        tile: undefined,
    } as any);
    const [_, dims] = tileset_selection([makeTile(0)]) as any[];
    expect(dims.tileset.columns).toBe(COLS);
    expect(dims.tileset.rows).toBe(ROWS);
});
