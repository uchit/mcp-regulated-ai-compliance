/**
 * Tool: get_anti_pattern
 *
 * Look up named anti-patterns by name or keyword. Returns the full
 * structured definition + remediation guidance + source URL.
 */

import { z } from "zod";
import { findAntiPatterns, getAntiPatterns } from "../lib/retrieval.js";

export const GetAntiPatternInputSchema = z.object({
  query: z.string().min(1).describe(
    "Search query. Can be a name ('AI CoE Trap'), slug ('vault-theatre'), or keyword ('inline prompt', 'static credentials'). Case-insensitive substring search."
  ),
  list_all: z.boolean().optional().describe(
    "If true, ignore query and return all known anti-patterns. Useful for catalogue browsing."
  ),
});

export type GetAntiPatternInput = z.infer<typeof GetAntiPatternInputSchema>;

export async function getAntiPatternHandler(rawInput: unknown) {
  const input = GetAntiPatternInputSchema.parse(rawInput);

  const matches = input.list_all
    ? Array.from(getAntiPatterns().values())
    : findAntiPatterns(input.query);

  return {
    query: input,
    total: matches.length,
    matches: matches.map(p => ({
      slug: p.slug,
      name: p.name,
      category: p.category ?? null,
      where_it_appears: p.where_it_appears,
      why_its_bad: p.why_its_bad,
      what_to_do_instead: p.what_to_do_instead,
      diagnostic_tell: p.tell ?? null,
      source_url: p.source_url,
    })),
    guidance:
      matches.length === 0
        ? `No anti-pattern matched '${input.query}'. Try broader keywords or set list_all=true to browse the full catalogue.`
        : matches.length === 1
        ? "Single match returned with full structured definition."
        : `${matches.length} matches. Each includes the where/why/what-to-do triple + source link.`,
  };
}

export const getAntiPatternTool = {
  name: "get_anti_pattern",
  description: [
    "Look up anti-patterns from the catalogue at hellouchit.com/anti-patterns/ — named failure modes that recur across regulated-industry tech delivery.",
    "Each match returns: where the pattern appears, why it's bad, what to do instead, and a diagnostic 'tell' that surfaces it. Examples: 'Inline Prompt Pattern', 'AI CoE Trap', 'Vault Theatre', 'SBOM Shelfware', 'PDF Principles', 'Eval Set That Never Runs'.",
    "Use when reviewing an architecture description or codebase to flag known failure shapes; or when you need to name a problem precisely for a stakeholder conversation.",
  ].join("\n\n"),
  inputSchema: GetAntiPatternInputSchema,
};
