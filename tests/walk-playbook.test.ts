/**
 * walk_playbook + playbook parser tests.
 * Covers all 4 playbooks × structural invariants per playbook.
 */

import { describe, expect, it } from "vitest";
import { getPlaybooks } from "../src/lib/retrieval.ts";
import { walkPlaybookHandler } from "../src/tools/walk-playbook.ts";

const ALL_SLUGS = [
  "eu-ai-act-12-weeks",
  "cisa-attestation-90-days",
  "cloud-cost-aware-to-controlled",
  "vault-theatre-to-workload-identity",
] as const;

describe("playbook parser", () => {
  const pbs = getPlaybooks();

  it("loads all 4 playbooks", () => {
    expect(pbs.size).toBe(4);
    for (const slug of ALL_SLUGS) expect(pbs.has(slug)).toBe(true);
  });

  it.each(ALL_SLUGS)("parses %s into 12 weeks with sequential numbers + non-empty gates", (slug) => {
    const pb = pbs.get(slug)!;
    expect(pb.weeks).toHaveLength(12);
    pb.weeks.forEach((w, i) => {
      expect(w.week_number).toBe(i + 1);
      expect(w.title.length).toBeGreaterThan(5);
      expect(w.gate).toMatch(/^Gate \d+/);
      expect(w.what_to_do.length).toBeGreaterThan(80);
      expect(w.source_url).toMatch(/^https:\/\/hellouchit\.com\/playbooks\//);
      expect(w.source_url).toContain(`#week-${w.week_number}`);
    });
  });

  it.each(ALL_SLUGS)("attaches diagnostic + canonical hellouchit URL for %s", (slug) => {
    const pb = pbs.get(slug)!;
    expect(pb.diagnostic_to_rerun.url).toMatch(/^https:\/\/hellouchit\.com\//);
    expect(pb.diagnostic_to_rerun.name).toMatch(/diagnostic|review/i);
    expect(pb.source_url).toMatch(/^https:\/\/hellouchit\.com\/playbooks\//);
  });
});

describe("walk_playbook handler", () => {
  it.each(ALL_SLUGS)("returns whole playbook for %s when week omitted", async (slug) => {
    const result = (await walkPlaybookHandler({ playbook: slug })) as Record<string, unknown>;
    const pb = result.playbook as { weeks: unknown[]; slug: string; source_url: string };
    expect(pb).toBeDefined();
    expect(pb.slug).toBe(slug);
    expect(pb.weeks).toHaveLength(12);
    expect(pb.source_url).toMatch(/^https:\/\/hellouchit\.com\/playbooks\//);
  });

  it("returns single-week scope + metadata when week specified", async () => {
    const result = (await walkPlaybookHandler({
      playbook: "vault-theatre-to-workload-identity",
      week: 5,
    })) as Record<string, unknown>;
    expect(result.playbook_metadata).toBeDefined();
    const week = result.week as { week_number: number; gate: string; what_to_do: string };
    expect(week.week_number).toBe(5);
    expect(week.gate).toContain("Gate 5");
    // CI/CD via OIDC is week 5 of the vault playbook
    expect(week.what_to_do.toLowerCase()).toContain("oidc");
  });

  it("rejects week > 12 at the schema layer", async () => {
    await expect(
      walkPlaybookHandler({
        playbook: "eu-ai-act-12-weeks",
        week: 99,
      } as never)
    ).rejects.toThrow();
  });
});
