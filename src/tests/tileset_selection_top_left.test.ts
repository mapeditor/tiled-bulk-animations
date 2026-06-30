import { test, expect } from "bun:test";
import { makeTile, getIndexModule, setActiveAsset } from "./_helpers";

const COLS = 10;
const ROWS = 8;
const TW = 16;
const TH = 16;

test("top-left tile correctly identifies x=0,y=0", async () => {
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
    const [rect] = tileset_selection([makeTile(0)]) as any[];
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
});
