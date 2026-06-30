import { test, expect } from "bun:test";
import cacheservice from "../cache";
import { mockAsset } from "./_helpers";

test("custom prefix is used for all operations", () => {
    const cache = new cacheservice("myapp:");
    const asset = mockAsset("item") as any;
    cache.add("item", asset);
    expect(cache.get("item")).toBe(asset);
    cache.remove("item");
    expect(cache.get("item")).toBeNull();
});
