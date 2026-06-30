import { test, expect } from "bun:test";
import { makeTile, getIndexModule, setActiveAsset } from "./_helpers";

const COLS = 10;
const ROWS = 8;
const TW = 16;
const TH = 16;

test("rectangular selection spans correct bounds", async () => {
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
    const ids = [12, 13, 14, 22, 23, 24];
    const [rect] = tileset_selection(ids.map(makeTile)) as any[];
    expect(rect.x).toBe(2);
    expect(rect.y).toBe(1);
    expect(rect.width).toBe(3);
    expect(rect.height).toBe(2);
});
