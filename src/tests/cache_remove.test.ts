import { test, expect } from "bun:test";
import cacheservice from "../cache";
import { mockAsset } from "./_helpers";

test("remove deletes an entry", () => {
    const cache = new cacheservice();
    const asset = mockAsset("tileset1") as any;
    cache.add("tileset1", asset);
    cache.remove("tileset1");
    expect(cache.get("tileset1")).toBeNull();
});
