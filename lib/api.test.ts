import { afterEach, describe, expect, it, vi } from "vitest";
import { buildJobsQuery, talentFetch } from "./api";

const session = { sub: "candidate-1", role: "candidate" as const, orgId: "org-demo-a", organizations: [], devMode: true };

describe("buildJobsQuery", () => {
  it("omits empty filters", () => {
    expect(buildJobsQuery({})).toBe("");
    expect(buildJobsQuery({ q: "go", remote: "true" })).toBe("q=go&remote=true");
  });
});

describe("talentFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a connection error when the API is down", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );
    const result = await talentFetch("/v1/jobs", session);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(503);
      expect(result.error).toBe("talent API に接続できません");
    }
  });

  it("forwards X-Dev-User-Sub", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await talentFetch("/v1/jobs", session);
    expect(result.ok).toBe(true);
    expect(fetchMock.mock.calls[0][1].headers["X-Dev-User-Sub"]).toBe("candidate-1");
    expect(fetchMock.mock.calls[0][1].headers["X-Dev-User-Org"]).toBe("org-demo-a");
  });
});
