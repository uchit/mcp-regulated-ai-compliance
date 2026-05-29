/**
 * Tool: crosswalk
 *
 * Map a regulatory requirement from one framework to its equivalents
 * in other frameworks, with FULL/PARTIAL/NEW overlap classification.
 *
 * The single highest-value tool in the server — answers the most
 * common multi-framework question: "I've done X for Y framework, what
 * carries over to Z?"
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { CrosswalkEntry } from "../lib/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

// ─────────────────────────────────────────────────────────────────────
// Load crosswalk data once at startup
// ─────────────────────────────────────────────────────────────────────

interface CrosswalkData {
  version: string;
  source: string;
  frameworks: Record<string, { label: string; jurisdiction: string }>;
  entries: CrosswalkEntry[];
}

let _crosswalks: CrosswalkData | null = null;

function getCrosswalks(): CrosswalkData {
  if (_crosswalks) return _crosswalks;
  const raw = readFileSync(join(DATA_DIR, "crosswalks.json"), "utf-8");
  _crosswalks = JSON.parse(raw) as CrosswalkData;
  return _crosswalks;
}

// ─────────────────────────────────────────────────────────────────────
// Input schema
// ─────────────────────────────────────────────────────────────────────

export const CrosswalkInputSchema = z.object({
  from_framework: z.string().optional().describe(
    "Source framework slug (e.g. 'eu_ai_act', 'au_ai_safety', 'nist_ai_rmf', 'iso_42001', 'apra_cps_230', 'ssdf'). If omitted with from_reference, searches across all frameworks."
  ),
  from_reference: z.string().optional().describe(
    "Source requirement reference (e.g. 'Article 9', 'G2', 'MAP 1.1', 'A.6.1', '§13', 'PS.3'). Case-insensitive substring match against entry references."
  ),
  to_frameworks: z.array(z.string()).optional().describe(
    "Target frameworks to map TO. If omitted, returns mappings to all available target frameworks."
  ),
  overlap_filter: z.enum(["FULL", "PARTIAL", "NEW"]).optional().describe(
    "Filter results by overlap strength."
  ),
  list_all_frameworks: z.boolean().optional().describe(
    "If true, ignore other parameters and return the framework catalogue."
  ),
});

export type CrosswalkInput = z.infer<typeof CrosswalkInputSchema>;

// ─────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────

export async function crosswalkHandler(rawInput: unknown) {
  const input = CrosswalkInputSchema.parse(rawInput);
  const data = getCrosswalks();

  if (input.list_all_frameworks) {
    return {
      version: data.version,
      source_url: data.source,
      frameworks: Object.entries(data.frameworks).map(([slug, meta]) => ({
        slug,
        label: meta.label,
        jurisdiction: meta.jurisdiction,
      })),
    };
  }

  // Filter entries
  let entries = data.entries;

  if (input.from_framework) {
    entries = entries.filter(e => e.framework === input.from_framework);
  }

  if (input.from_reference) {
    const ref = input.from_reference.toLowerCase();
    entries = entries.filter(e => e.reference.toLowerCase().includes(ref));
  }

  // Shape the output
  const results = entries.map(entry => {
    const mappings = input.to_frameworks
      ? Object.entries(entry.mappings).filter(([fw]) =>
          input.to_frameworks!.includes(fw)
        )
      : Object.entries(entry.mappings);

    const filteredMappings = input.overlap_filter
      ? mappings.filter(([, m]) => m.overlap === input.overlap_filter)
      : mappings;

    return {
      id: entry.id,
      source: {
        framework: entry.framework,
        framework_label: data.frameworks[entry.framework]?.label ?? entry.framework,
        reference: entry.reference,
        title: entry.title,
      },
      mappings: filteredMappings.map(([fw, m]) => ({
        framework: fw,
        framework_label: data.frameworks[fw]?.label ?? fw,
        references: m.references,
        overlap: m.overlap,
        notes: m.notes,
      })),
      source_url: `https://hellouchit.com/dataset/`,
    };
  });

  return {
    query: input,
    total: results.length,
    results,
    guidance:
      results.length === 0
        ? "No crosswalk entries matched. Try setting list_all_frameworks=true to see available frameworks, or use broader filters."
        : `${results.length} crosswalk entr${results.length === 1 ? "y" : "ies"} returned. Overlap classifications: FULL = direct equivalence · PARTIAL = substantial overlap with gaps · NEW = no equivalent (new work required).`,
  };
}

export const crosswalkTool = {
  name: "crosswalk",
  description: [
    "Map a regulatory requirement to its equivalents across other frameworks. Covers: EU AI Act ↔ NIST AI RMF ↔ ISO/IEC 42001 ↔ AU AI Safety Standard ↔ APRA CPS 230/234 ↔ OECD AI Principles ↔ Council of Europe Framework Convention on AI ↔ GDPR ↔ SLSA ↔ NIST SSDF ↔ OWASP LLM Top 10.",
    "Each mapping has overlap classification (FULL · PARTIAL · NEW) plus practitioner notes on why.",
    "Use whenever a user has work in one framework and needs to know what carries over to another. Highest-leverage when multinationals operating across jurisdictions need to demonstrate 'work done once counts everywhere'.",
    "Source data maintained at hellouchit.com/dataset/. Set list_all_frameworks=true to see the framework catalogue first if you're unsure of the slugs.",
  ].join("\n\n"),
  inputSchema: CrosswalkInputSchema,
};
