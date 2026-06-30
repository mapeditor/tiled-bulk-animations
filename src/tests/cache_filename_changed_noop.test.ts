import { test, expect } from "bun:test";
import cacheservice from "../cache";
import { mockAsset } from "./_helpers";

test("fileNameChanged does nothing if old key not found", () => {
    const cache = new cacheservice();
    const asset = mockAsset("ts") as any;
    cache.add("ts", asset);
    (asset as any)._fireFileNameChanged("nonexistent");
    expect(cache.get("ts")).toBe(asset);
});
