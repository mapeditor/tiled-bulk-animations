import { test, expect } from "bun:test";
import cacheservice from "../cache";

test("remove on non-existent key does not throw", () => {
    const cache = new cacheservice();
    expect(() => cache.remove("nonexistent")).not.toThrow();
});
