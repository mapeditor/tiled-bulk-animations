import { test, expect } from "bun:test";
import cacheservice from "../cache";
import { mockAsset } from "./_helpers";

test("fileNameChanged signal fires without breaking existing get", () => {
    const cache = new cacheservice();
    const asset = mockAsset("oldname") as any;
    cache.add("oldname", asset);
    expect(() => (asset as any)._fireFileNameChanged("newname")).not.toThrow();
    expect(cache.get("oldname")).toBe(asset);
});
