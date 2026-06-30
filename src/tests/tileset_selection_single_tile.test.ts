import { test, expect } from "bun:test";
import { makeTile, getIndexModule, setActiveAsset } from "./_helpers";

const COLS = 10;
const ROWS = 8;
const TW = 16;
const TH = 16;

test("single tile selection produces 1x1 bounds", async () => {
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
    const [rect] = tileset_selection([makeTile(23)]) as any[];
    expect(rect.x).toBe(3);
    expect(rect.y).toBe(2);
    expect(rect.width).toBe(1);
    expect(rect.height).toBe(1);
});
