import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchHealth } from "../useHealth";

afterEach(() => vi.unstubAllGlobals());
describe("health API", () => {
  it("reads health from the same-origin API", async () => {
    // GIVEN
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ status: "ok" }) });
    vi.stubGlobal("fetch", fetch);
    // WHEN
    const result = await fetchHealth();
    // THEN
    expect(result.status).toBe("ok");
    expect(fetch).toHaveBeenCalledWith("/api/health");
  });
  it("reports a failed backend response", async () => {
    // GIVEN
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    // WHEN / THEN
    await expect(fetchHealth()).rejects.toThrow("Backend unavailable");
  });
});
