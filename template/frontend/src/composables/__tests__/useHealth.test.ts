import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchHealth } from "../useHealth";

afterEach(() => vi.unstubAllGlobals());
describe("health API", () => {
  it("reads health from the same-origin API", async () => {
    // GIVEN
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ status: "ok" }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetch);
    // WHEN
    const result = await fetchHealth();
    // THEN
    expect(result.status).toBe("ok");
    expect(fetch).toHaveBeenCalledWith(
      "/api/health",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });
  it("reports a failed backend response", async () => {
    // GIVEN
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 503 })),
    );
    // WHEN / THEN
    await expect(fetchHealth()).rejects.toThrow(
      "Response returned an error code",
    );
  });
});
