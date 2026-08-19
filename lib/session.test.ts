import { describe, expect, it } from "vitest";
import { parseDevSession, sessionQuery } from "./session";

describe("parseDevSession", () => {
  it("returns null without user", () => {
    expect(parseDevSession({})).toBeNull();
    expect(parseDevSession({ role: "candidate" })).toBeNull();
  });

  it("infers employer from sub when role is omitted", () => {
    expect(parseDevSession({ user: "employer-1" })).toEqual({ sub: "employer-1", role: "employer" });
  });

  it("keeps an explicit role", () => {
    expect(parseDevSession({ user: "employer-1", role: "candidate" })).toEqual({
      sub: "employer-1",
      role: "candidate",
    });
  });
});

describe("sessionQuery", () => {
  it("keeps user and role on every link", () => {
    expect(sessionQuery({ sub: "candidate-1", role: "candidate" }, { q: "go" })).toBe(
      "?user=candidate-1&role=candidate&q=go",
    );
  });
});
