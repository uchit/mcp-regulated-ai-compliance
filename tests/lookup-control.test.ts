/**
 * Tests — lookup_control reference tool.
 *
 * Covers the canonical query shapes. Other tools' tests follow this pattern.
 */

import { describe, expect, it } from "vitest";
import { lookupControlHandler } from "../src/tools/lookup-control.js";

describe("lookup_control", () => {
  it("returns matches for a known regulation", async () => {
    const result = await lookupControlHandler({ regulation: "cps234" });
    expect(result.total_matches).toBeGreaterThan(0);
    expect(result.matches[0]?.source_url).toMatch(/hellouchit\.com/);
  });

  it("filters by category", async () => {
    const result = await lookupControlHandler({
      regulation: "cps234",
      category: "Identity & access",
    });
    expect(result.total_matches).toBeGreaterThan(0);
    for (const m of result.matches) {
      expect(m.category).toBe("Identity & access");
    }
  });

  it("filters by sector", async () => {
    const result = await lookupControlHandler({ sector: "banks" });
    expect(result.total_matches).toBeGreaterThan(0);
    for (const m of result.matches) {
      expect(m.sectors).toContain("banks");
    }
  });

  it("free-text search across controls", async () => {
    const result = await lookupControlHandler({ search: "workload identity" });
    expect(result.total_matches).toBeGreaterThan(0);
    const hit = result.matches[0];
    expect(hit?.control.toLowerCase()).toContain("workload");
  });

  it("returns guidance when no matches", async () => {
    const result = await lookupControlHandler({
      regulation: "cps234",
      category: "Definitely-not-a-real-category-xyz",
    });
    expect(result.total_matches).toBe(0);
    expect(result.guidance.toLowerCase()).toContain("no matching");
  });

  it("respects limit param", async () => {
    const result = await lookupControlHandler({ limit: 2 });
    expect(result.returned).toBeLessThanOrEqual(2);
  });

  it("each match has source_url back to hellouchit.com", async () => {
    const result = await lookupControlHandler({});
    for (const m of result.matches) {
      expect(m.source_url).toMatch(/^https:\/\/hellouchit\.com\/dataset\/#r\d+$/);
    }
  });

  it("validates input — rejects invalid regulation slug", async () => {
    await expect(
      lookupControlHandler({ regulation: "not-a-real-regulation" })
    ).rejects.toThrow();
  });

  it("validates input — rejects limit out of range", async () => {
    await expect(lookupControlHandler({ limit: 0 })).rejects.toThrow();
    await expect(lookupControlHandler({ limit: 51 })).rejects.toThrow();
  });
});
