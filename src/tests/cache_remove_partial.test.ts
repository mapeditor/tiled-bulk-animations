import { test, expect } from "bun:test";
import cacheservice from "../cache";
import { mockAsset } from "./_helpers";

test("remove only removes the specified key", () => {
    const cache = new cacheservice();
    const asset1 = mockAsset("a") as any;
    const asset2 = mockAsset("b") as any;
    cache.add("a", asset1);
    cache.add("b", asset2);
    cache.remove("a");
    expect(cache.get("a")).toBeNull();
    expect(cache.get("b")).toBe(asset2);
});
