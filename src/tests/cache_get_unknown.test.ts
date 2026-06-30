import { test, expect } from "bun:test";
import cacheservice from "../cache";

test("get returns null for unknown key", () => {
    const cache = new cacheservice();
    expect(cache.get("nonexistent")).toBeNull();
});
