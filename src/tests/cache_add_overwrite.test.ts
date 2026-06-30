import { test, expect } from "bun:test";
import cacheservice from "../cache";
import { mockAsset } from "./_helpers";

test("add with same key overwrites previous value", () => {
    const cache = new cacheservice();
    const asset1 = mockAsset("tileset1") as any;
    const asset2 = mockAsset("tileset1") as any;
    cache.add("tileset1", asset1);
    cache.add("tileset1", asset2);
    expect(cache.get("tileset1")).toBe(asset2);
});
