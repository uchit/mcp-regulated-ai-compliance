/**
 * Tool: lookup_control
 *
 * THE REFERENCE IMPLEMENTATION. The pattern other tools should follow:
 *
 * 1. Define input schema with Zod
 * 2. Define a typed handler that takes validated input
 * 3. Return a structured response with source_url citations
 * 4. Export both the schema (for MCP registration) and the handler
 */

import { z } from "zod";
import { findControls } from "../lib/retrieval.js";
import { RegulationSlug, Sector } from "../lib/types.js";

// ─────────────────────────────────────────────────────────────────────
// Input schema (Zod → JSON Schema for MCP)
// ─────────────────────────────────────────────────────────────────────

export const LookupControlInputSchema = z.object({
  regulation: RegulationSlug.optional().describe(
    "Regulation slug. One of: cps234, cps230, soci, ai_safety_au, privacy_au, e8, irap, eu_ai_act, dora, nis2, gdpr, circia, hipaa, fda_samd, cisa_ssa, ssdf, ai_rmf, sp80053, iso42001, iso27001, slsa, owasp_llm, atlas, bcbs239, pci, iec62443, iso13485, iec62304"
  ),
  surface: z.string().optional().describe(
    "Enforcement surface keyword (case-insensitive substring match). Examples: 'Cloud', 'CI/CD', 'K8s', 'Network', 'Runtime', 'Source'"
  ),
  category: z.string().optional().describe(
    "Control category. Examples: 'Identity & access', 'Supply chain & provenance', 'AI evals & guardrails', 'Data governance', 'Cryptography & secrets', 'Resilience & continuity'"
  ),
  sector: Sector.optional().describe(
    "Sector filter. One of: banks, government, healthcare, critical-infrastructure, all"
  ),
  search: z.string().optional().describe(
    "Free-text search over control names + notes + evidence shape"
  ),
  limit: z.number().int().min(1).max(50).default(10).describe(
    "Maximum number of matches to return (default 10)"
  ),
});

export type LookupControlInput = z.infer<typeof LookupControlInputSchema>;

// ─────────────────────────────────────────────────────────────────────
// Output shape (typed)
// ─────────────────────────────────────────────────────────────────────

export interface LookupControlOutput {
  query: LookupControlInput;
  total_matches: number;
  returned: number;
  matches: Array<{
    id: string;
    control: string;
    category: string;
    enforcement_surface: string;
    regulations: Array<{ slug: string; label: string; jurisdiction: string }>;
    tools: Array<{ name: string; type: string; vendor: string }>;
    evidence_shape: string;
    sectors: string[];
    anti_pattern: string | null;
    practitioner_note: string;
    source_url: string;
  }>;
  guidance: string;
}

// ─────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────

export async function lookupControlHandler(
  rawInput: unknown
): Promise<LookupControlOutput> {
  // Validate
  const input = LookupControlInputSchema.parse(rawInput);

  // Fetch matches via retrieval layer
  const matches = findControls({
    regulation: input.regulation,
    surface: input.surface,
    category: input.category,
    sector: input.sector,
    search: input.search,
  });

  // Get full regulation metadata for citations
  const { getDataset } = await import("../lib/retrieval.js");
  const regulations = getDataset().regulations;

  const limited = matches.slice(0, input.limit);

  return {
    query: input,
    total_matches: matches.length,
    returned: limited.length,
    matches: limited.map(row => ({
      id: row.id,
      control: row.ctrl,
      category: row.cat,
      enforcement_surface: row.surface,
      regulations: row.reg.map(slug => ({
        slug,
        label: regulations[slug]?.label ?? slug,
        jurisdiction: regulations[slug]?.jurisdiction ?? "INTL",
      })),
      tools: row.tools.map(([name, type, vendor]) => ({
        name,
        type,
        vendor,
      })),
      evidence_shape: row.evidence,
      sectors: row.sectors,
      anti_pattern: row.anti_pattern ?? null,
      practitioner_note: row.notes,
      source_url: row.source_url,
    })),
    guidance: buildGuidance(matches.length, input),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function buildGuidance(matchCount: number, input: LookupControlInput): string {
  if (matchCount === 0) {
    return [
      "No matching controls found. Try broadening the search:",
      input.regulation && "- Remove the regulation filter to see cross-regulation matches",
      input.category && "- Try a different category (or remove the filter)",
      input.surface && "- Use a more general surface keyword",
      "- Use the `search` parameter for free-text matching across all controls",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (matchCount > (input.limit ?? 10)) {
    return `${matchCount} matches found; showing first ${input.limit ?? 10}. Refine with category/surface filters or increase the limit (max 50).`;
  }

  return `${matchCount} match${matchCount === 1 ? "" : "es"} returned. Each row links back to the source on hellouchit.com.`;
}

// ─────────────────────────────────────────────────────────────────────
// MCP tool descriptor (registered by src/index.ts)
// ─────────────────────────────────────────────────────────────────────

export const lookupControlTool = {
  name: "lookup_control",
  description: [
    "Look up which security/compliance controls apply for a given regulation, control category, enforcement surface, and/or sector.",
    "Each result includes: the named control, the regulations that mandate it, the tooling options that implement it (categorised as managed/oss/commercial/standard), the evidence shape an auditor would expect, sector relevance, and a practitioner note.",
    "Sourced from the curated dataset at hellouchit.com/dataset/ (CC BY 4.0). Covers EU AI Act, NIST AI RMF, ISO/IEC 42001, APRA CPS 234/230, AU AI Safety Standard, ASD Essential Eight, IRAP, SLSA, NIST SSDF, OWASP LLM Top 10, MITRE ATLAS, BCBS 239, PCI DSS 4.0, HIPAA, GDPR, EU DORA, EU NIS2, CISA SSA, FDA SaMD, IEC 62443, and more.",
    "Use this tool whenever you need to answer 'which tool closes X regulator's requirement on Y surface' or 'what evidence does Z compliance regime expect'.",
  ].join("\n\n"),
  inputSchema: LookupControlInputSchema,
};
