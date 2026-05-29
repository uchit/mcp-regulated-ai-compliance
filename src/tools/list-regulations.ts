/**
 * Tool: list_regulations
 *
 * Return the regulations covered by the dataset, optionally filtered
 * by jurisdiction. Useful as a starting point — agents can use this
 * to discover what's available before calling lookup_control.
 */

import { z } from "zod";
import { getDataset } from "../lib/retrieval.js";

export const ListRegulationsInputSchema = z.object({
  jurisdiction: z.enum(["AU", "EU", "US", "INTL", "all"]).default("all").describe(
    "Filter by jurisdiction. Default: all."
  ),
  include_row_count: z.boolean().default(true).describe(
    "Include how many control rows in the dataset reference each regulation."
  ),
});

export type ListRegulationsInput = z.infer<typeof ListRegulationsInputSchema>;

export async function listRegulationsHandler(rawInput: unknown) {
  const input = ListRegulationsInputSchema.parse(rawInput);
  const ds = getDataset();

  // Compute row counts per regulation
  const counts: Record<string, number> = {};
  if (input.include_row_count) {
    for (const row of ds.rows) {
      for (const reg of row.reg) {
        counts[reg] = (counts[reg] ?? 0) + 1;
      }
    }
  }

  const all = Object.entries(ds.regulations).map(([slug, meta]) => ({
    slug,
    label: meta.label,
    jurisdiction: meta.jurisdiction,
    ...(input.include_row_count ? { control_row_count: counts[slug] ?? 0 } : {}),
  }));

  const filtered =
    input.jurisdiction === "all"
      ? all
      : all.filter(r => r.jurisdiction === input.jurisdiction);

  return {
    query: input,
    total: filtered.length,
    regulations: filtered.sort((a, b) => a.label.localeCompare(b.label)),
    source_url: "https://hellouchit.com/dataset/",
  };
}

export const listRegulationsTool = {
  name: "list_regulations",
  description: [
    "Return the regulations covered by the dataset. Useful as a discovery step — call this first to find available regulation slugs before calling lookup_control or crosswalk.",
    "Each entry includes: slug (for use with other tools), full label, jurisdiction (AU/EU/US/INTL), and the count of control rows that reference it.",
  ].join("\n\n"),
  inputSchema: ListRegulationsInputSchema,
};
