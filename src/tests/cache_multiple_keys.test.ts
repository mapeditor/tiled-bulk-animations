import { test, expect } from "bun:test";
import cacheservice from "../cache";
import { mockAsset } from "./_helpers";

test("multiple keys can coexist", () => {
    const cache = new cacheservice();
    const asset1 = mockAsset("a") as any;
    const asset2 = mockAsset("b") as any;
    const asset3 = mockAsset("c") as any;
    cache.add("a", asset1);
    cache.add("b", asset2);
    cache.add("c", asset3);
    expect(cache.get("a")).toBe(asset1);
    expect(cache.get("b")).toBe(asset2);
    expect(cache.get("c")).toBe(asset3);
});
