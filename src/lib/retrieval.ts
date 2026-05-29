/**
 * Data-loading + retrieval helpers.
 *
 * The MCP server embeds knowledge at build-time. This module loads the
 * embedded data once on first call and caches in memory. All tools
 * call through this layer rather than touching the JSON/Markdown files
 * directly.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type AntiPattern,
  type Dataset,
  type DatasetRow,
  type Playbook,
  type RegulationSlug,
  type Sector,
} from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

// ─────────────────────────────────────────────────────────────────────
// Dataset (regulation × control × tooling)
// ─────────────────────────────────────────────────────────────────────

let _dataset: Dataset | null = null;

export function getDataset(): Dataset {
  if (_dataset) return _dataset;
  const raw = readFileSync(join(DATA_DIR, "dataset.json"), "utf-8");
  _dataset = JSON.parse(raw) as Dataset;
  return _dataset;
}

export interface ControlMatch extends DatasetRow {
  source_url: string;
}

/**
 * Filter dataset rows by intersection of (regulation, surface, category, sector).
 * Returns matches with source_url back to hellouchit.com.
 */
export function findControls(query: {
  regulation?: RegulationSlug;
  surface?: string;
  category?: string;
  sector?: Sector;
  search?: string;
}): ControlMatch[] {
  const ds = getDataset();
  const surfaceLower = query.surface?.toLowerCase();
  const searchLower = query.search?.toLowerCase();
  const matches: ControlMatch[] = [];

  for (const row of ds.rows) {
    // regulation filter (row.reg is array of slugs)
    if (query.regulation && !row.reg.includes(query.regulation)) continue;

    // surface filter (substring, case-insensitive)
    if (surfaceLower && !row.surface.toLowerCase().includes(surfaceLower)) continue;

    // category filter (exact)
    if (query.category && row.cat !== query.category) continue;

    // sector filter
    if (query.sector && query.sector !== "all" && !row.sectors.includes(query.sector)) {
      continue;
    }

    // free-text search across ctrl / notes / evidence
    if (searchLower) {
      const haystack = `${row.ctrl} ${row.notes} ${row.evidence}`.toLowerCase();
      if (!haystack.includes(searchLower)) continue;
    }

    matches.push({
      ...row,
      source_url: `https://hellouchit.com/dataset/#${row.id}`,
    });
  }

  return matches;
}

// ─────────────────────────────────────────────────────────────────────
// Anti-patterns
// ─────────────────────────────────────────────────────────────────────

let _antiPatterns: Map<string, AntiPattern> | null = null;

/**
 * Parse anti-patterns.md once at startup into a slug → AntiPattern map.
 * Markdown structure is well-known (15 patterns, each with consistent headings).
 */
export function getAntiPatterns(): Map<string, AntiPattern> {
  if (_antiPatterns) return _antiPatterns;

  const md = readFileSync(join(DATA_DIR, "anti-patterns.md"), "utf-8");
  _antiPatterns = parseAntiPatternsMarkdown(md);
  return _antiPatterns;
}

function parseAntiPatternsMarkdown(_md: string): Map<string, AntiPattern> {
  // v0.1: stub implementation. Full Markdown-to-structured parsing
  // ships in Phase 2 of the build roadmap. For now, return a static
  // seed map covering the 6 most-cited anti-patterns so the tool isn't
  // empty when called.
  //
  // Phase-2 implementation note: use a regex like
  //   /^####\s+\d+\.\s+(.+)$/gm
  // to find each pattern's header, then parse the standard sub-sections
  // (Where it appears · Why it's bad · What to do instead · Tell).

  const slugify = (name: string): string =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const seed: AntiPattern[] = [
    {
      slug: "inline-prompt-pattern",
      name: "Inline Prompt Pattern",
      category: "Applied GenAI",
      where_it_appears: "Prompts hardcoded as string literals in service code (.py, .ts, .js)",
      why_its_bad: "Cannot version, cannot evaluate, cannot replay decisions — direct EU AI Act Article 12 audit-trail failure",
      what_to_do_instead: "Prompt registry with versioning + evaluation gating + per-request prompt-version logging",
      tell: "Production prompts that look like business policy live in source code",
      source_url: "https://hellouchit.com/anti-patterns/#inline-prompt-pattern",
    },
    {
      slug: "eval-set-never-runs",
      name: "Eval Set That Never Runs",
      category: "Applied GenAI",
      where_it_appears: "Team has an eval dataset but it's not gated into CI/CD",
      why_its_bad: "Model/prompt changes ship to production without regression-tested behaviour",
      what_to_do_instead: "Eval-gated CI: every prompt or model change runs evals + blocks merge on critical regression",
      tell: "Eval set exists in repo but no CI workflow references it",
      source_url: "https://hellouchit.com/anti-patterns/#eval-set-never-runs",
    },
    {
      slug: "ai-coe-trap",
      name: "AI CoE Trap",
      category: "Operating model",
      where_it_appears: "Central AI Centre of Excellence owns AI without owning platform substrate",
      why_its_bad: "Substrate gaps (audit pipeline, prompt registry, deployment controls, observability) persist; CoE becomes a knowledge silo",
      what_to_do_instead: "Platform team owns substrate; AI team owns quality; Product/Risk owns intent",
      source_url: "https://hellouchit.com/anti-patterns/#ai-coe-trap",
    },
    {
      slug: "vault-theatre",
      name: "Vault Theatre",
      category: "DevSecOps",
      where_it_appears: "Static long-lived credentials stored in HashiCorp Vault / AWS Secrets Manager",
      why_its_bad: "Rotation alone doesn't close the audit finding; demonstrated-least-privilege requires federated identity (OIDC), not just shorter-lived statics",
      what_to_do_instead: "Migrate to workload identity (IRSA, GCP Workload Identity, Azure Federated Credentials, GitHub Actions OIDC)",
      tell: "Vault exists but services still pull static access keys",
      source_url: "https://hellouchit.com/anti-patterns/#vault-theatre",
    },
    {
      slug: "sbom-shelfware",
      name: "SBOM Shelfware",
      category: "DevSecOps",
      where_it_appears: "SBOMs generated on every build but never wired to vulnerability alerts",
      why_its_bad: "Burns 30+ days on KEV-listed CVEs; emitting SBOMs is necessary but not sufficient",
      what_to_do_instead: "SBOM → CISA KEV feed → owner-of-service alert (not central security inbox) → patch within SLA",
      tell: "SBOMs in registry; no alert pipeline; no owner notifications on CVE matches",
      source_url: "https://hellouchit.com/anti-patterns/#sbom-shelfware",
    },
    {
      slug: "pdf-principles",
      name: "PDF Principles",
      category: "Enterprise Architecture",
      where_it_appears: "Architecture function publishes 70-page principles document",
      why_its_bad: "Principles not encoded in platform defaults or policy-as-code don't exist — illusion of governance",
      what_to_do_instead: "Encode in OPA / Kyverno admission policies + paved-path scaffolds",
      tell: "Teams routinely violate 'principles' without consequence",
      source_url: "https://hellouchit.com/anti-patterns/#pdf-principles",
    },
  ];

  // Suppress unused-var lint in v0.1 stub
  void slugify;

  return new Map(seed.map(p => [p.slug, p]));
}

/**
 * Search anti-patterns by name or keyword.
 */
export function findAntiPatterns(query: string): AntiPattern[] {
  const all = Array.from(getAntiPatterns().values());
  const q = query.toLowerCase();
  return all.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.slug.includes(q) ||
    p.where_it_appears.toLowerCase().includes(q) ||
    p.tell?.toLowerCase().includes(q)
  );
}

// ─────────────────────────────────────────────────────────────────────
// Playbooks (v0.1 stub; full parser in Phase 2)
// ─────────────────────────────────────────────────────────────────────

let _playbooks: Map<string, Playbook> | null = null;

export function getPlaybooks(): Map<string, Playbook> {
  if (_playbooks) return _playbooks;
  // Phase 2: parse the 4 playbook markdown files in src/data/playbooks/
  // into structured Playbook objects.
  _playbooks = new Map();
  return _playbooks;
}
