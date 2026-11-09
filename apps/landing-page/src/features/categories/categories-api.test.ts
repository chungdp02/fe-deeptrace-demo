import { afterEach, describe, expect, it, vi } from "vitest";
import { loadCategories } from "./categories-api";

afterEach(() => vi.unstubAllGlobals());

describe("loadCategories", () => {
  it("returns validated category data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      categories: [{
        id: "sample",
        title: { vi: "Mẫu", en: "Sample" },
        description: { vi: "Mô tả", en: "Description" },
        highlights: { vi: ["Chi tiết"], en: ["Detail"] },
        sample: { product: { vi: "Sản phẩm mẫu", en: "Sample product" }, batchCode: "DEMO-001" },
      }],
    })));

    await expect(loadCategories()).resolves.toHaveLength(1);
  });

  it("rejects a failed request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(loadCategories()).rejects.toThrow("Categories request failed: 503");
  });

  it("rejects malformed server data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ categories: [{ id: 42 }] })));

    await expect(loadCategories()).rejects.toThrow();
  });
});
