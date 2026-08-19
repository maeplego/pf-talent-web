import { describe, expect, it } from "vitest";
import { calendarPublicWebBase, upcomingSlotRange } from "./calendar";

describe("calendarPublicWebBase", () => {
  it("defaults to local calendar web", () => {
    expect(calendarPublicWebBase()).toBe("http://localhost:3005");
  });
});

describe("upcomingSlotRange", () => {
  it("returns a start before end", () => {
    const range = upcomingSlotRange();
    expect(Date.parse(range.rangeStart)).toBeLessThan(Date.parse(range.rangeEnd));
  });
});
