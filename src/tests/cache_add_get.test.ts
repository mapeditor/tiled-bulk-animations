import { test, expect } from "bun:test";
import cacheservice from "../cache";
import { mockAsset } from "./_helpers";

test("add stores an asset and get retrieves it", () => {
    const cache = new cacheservice();
    const asset = mockAsset("tileset1") as any;
    cache.add("tileset1", asset);
    expect(cache.get("tileset1")).toBe(asset);
});
