import { test, expect } from "bun:test";
import { makeTile, getIndexModule, setActiveAsset } from "./_helpers";

const COLS = 10;
const ROWS = 8;
const TW = 16;
const TH = 16;

test("bottom-right tile produces 1x1 at correct position", async () => {
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
    const lastId = ROWS * COLS - 1;
    const [rect] = tileset_selection([makeTile(lastId)]) as any[];
    expect(rect.x).toBe(COLS - 1);
    expect(rect.y).toBe(ROWS - 1);
    expect(rect.width).toBe(1);
    expect(rect.height).toBe(1);
});
