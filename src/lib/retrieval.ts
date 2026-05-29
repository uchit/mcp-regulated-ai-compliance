/**
 * Data-loading + retrieval helpers.
 *
 * The MCP server embeds knowledge at build-time. This module loads the
 * embedded data once on first call and caches in memory. All tools
 * call through this layer rather than touching the JSON/Markdown files
 * directly.
 */

import {
  type AntiPattern,
  type Dataset,
  type DatasetRow,
  type Playbook,
  type RegulationSlug,
  type Sector,
} from "./types.js";
import { getDataSource } from "./data-source.js";

// ─────────────────────────────────────────────────────────────────────
// Dataset (regulation × control × tooling)
// ─────────────────────────────────────────────────────────────────────

let _dataset: Dataset | null = null;

export function getDataset(): Dataset {
  if (_dataset) return _dataset;
  _dataset = JSON.parse(getDataSource().dataset()) as Dataset;
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
  _antiPatterns = parseAntiPatternsMarkdown(getDataSource().antiPatterns());
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
// Playbooks (v0.2 — full markdown parser)
// ─────────────────────────────────────────────────────────────────────

let _playbooks: Map<string, Playbook> | null = null;

export function getPlaybooks(): Map<string, Playbook> {
  if (_playbooks) return _playbooks;
  _playbooks = new Map();
  const raw = getDataSource().playbooks();
  for (const [slug, md] of Object.entries(raw)) {
    try {
      _playbooks.set(slug, parsePlaybookMarkdown(slug, md));
    } catch (err) {
      // Malformed markdown ≠ fatal — server boots with fewer playbooks
      // rather than crashing. The walk_playbook tool surfaces a clear
      // error when the slug isn't in the map.
      console.error(
        `[retrieval] skipped playbook '${slug}': ${err instanceof Error ? err.message : err}`
      );
    }
  }
  return _playbooks;
}

/**
 * Parse a playbook markdown file into a structured Playbook.
 *
 * Recognised structure (anchored to the eu-ai-act-12-weeks template):
 *   # <Title>
 *   > Source: <url>
 *   **Audience** <text>  **Pre-req** <text>
 *   **End state** <text>
 *   **Re-run diagnostic at week 13** [<name>](<url>)
 *   Phase N
 *   Weeks N–N
 *   ## <Phase title>
 *   Week N
 *   ### <Week title>
 *   <body...>
 *   **Gate N · <gate title>**
 *   <gate body...>
 *   **Avoid —** <antipattern blurb>   (zero or more)
 */
export function parsePlaybookMarkdown(slug: string, md: string): Playbook {
  // ── Header block ───────────────────────────────────────────────────
  const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? slug;

  const sourceUrl =
    md.match(/^>\s*Source:\s*(\S+)/m)?.[1]?.trim() ??
    `https://hellouchit.com/playbooks/${slug}.html`;

  const audience =
    md.match(/\*\*Audience\*\*\s+([^*]+?)(?=\*\*|$)/)?.[1]?.trim() ??
    "Engineering + product + risk leadership";

  const pre_requisites =
    md.match(/\*\*Pre-req\*\*\s+([^*]+?)(?=\*\*|\n\n|$)/)?.[1]?.trim() ??
    "Live system in production or pre-launch";

  const end_state =
    md.match(/\*\*End state\*\*\s+([\s\S]+?)(?=\*\*Re-run|\nPhase|\n##)/)?.[1]?.trim() ??
    "See playbook body";

  const diagMatch = md.match(
    /\*\*Re-run diagnostic at week 13\*\*\s+\[([^\]]+)\]\(([^)]+)\)/
  );
  const diagnostic_to_rerun = {
    name: diagMatch?.[1]?.trim() ?? "Readiness diagnostic",
    url: normaliseUrl(diagMatch?.[2]?.trim() ?? "/tools/", sourceUrl),
  };

  // ── Week blocks ────────────────────────────────────────────────────
  // Split on "Week N" anchors that start a line. Phase context is
  // inferred from the most recent "## <phase title>" before the week.
  const weeks: Playbook["weeks"] = [];
  const phaseHeaders: { line: number; phase: string }[] = [];
  const lines = md.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const phaseMatch = line.match(/^##\s+(.+)$/);
    if (phaseMatch) phaseHeaders.push({ line: i, phase: phaseMatch[1]!.trim() });
  }

  const weekAnchorRe = /^Week\s+(\d{1,2})\s*$/;
  const weekStarts: { lineIdx: number; weekNumber: number }[] = [];
  lines.forEach((line, idx) => {
    const m = line.match(weekAnchorRe);
    if (m) weekStarts.push({ lineIdx: idx, weekNumber: Number(m[1]) });
  });

  for (let i = 0; i < weekStarts.length; i++) {
    const start = weekStarts[i]!;
    const end = weekStarts[i + 1]?.lineIdx ?? lines.length;
    const block = lines.slice(start.lineIdx, end).join("\n");

    const titleMatch = block.match(/^###\s+(.+)$/m);
    const weekTitle = titleMatch?.[1]?.trim().replace(/\.$/, "") ?? `Week ${start.weekNumber}`;

    const gateMatch = block.match(/\*\*Gate\s+\d+\s*·\s*([^*]+)\*\*/);
    const gate = gateMatch ? `Gate ${start.weekNumber} · ${gateMatch[1]!.trim()}` : `Gate ${start.weekNumber}`;

    const anti_patterns_to_avoid = Array.from(
      block.matchAll(/\*\*Avoid\s+—\*\*\s+([^\n]+)/g),
      (m) => m[1]!.trim()
    );

    // what_to_do = block stripped of the gate/avoid markers + ### header
    const bodyLines = block
      .split("\n")
      .filter((l) => !weekAnchorRe.test(l))
      .filter((l) => !/^###\s/.test(l))
      .filter((l) => !/^\*\*Gate\s+\d+/.test(l))
      .filter((l) => !/^\*\*Avoid\s+—/.test(l))
      .join("\n")
      .trim();

    // Phase = most recent "## " header before this week
    const phase =
      [...phaseHeaders].reverse().find((p) => p.line < start.lineIdx)?.phase ?? "Phase";

    weeks.push({
      week_number: start.weekNumber,
      phase,
      title: weekTitle,
      what_to_do: bodyLines,
      gate,
      anti_patterns_to_avoid,
      source_url: `${sourceUrl}#week-${start.weekNumber}`,
    });
  }

  return {
    slug,
    title,
    audience,
    pre_requisites,
    end_state,
    diagnostic_to_rerun,
    weeks,
    source_url: sourceUrl,
  };
}

/** Resolve a relative URL (e.g. "/tools/x.html") against an absolute base. */
function normaliseUrl(href: string, base: string): string {
  // Strip markdown angle-bracket wrapping used in the source playbooks
  // (e.g. `</tools/genai-readiness.html>`).
  const clean = href.replace(/^<+|>+$/g, "");
  if (/^https?:\/\//.test(clean)) return clean;
  // Always resolve against the canonical site root, never the playbook
  // URL (otherwise "/tools/x" gets mounted under the playbook path).
  const root = (() => {
    try {
      const u = new URL(base);
      return `${u.protocol}//${u.host}`;
    } catch {
      return "https://hellouchit.com";
    }
  })();
  try {
    return new URL(clean, root).toString();
  } catch {
    return `https://hellouchit.com${clean.startsWith("/") ? "" : "/"}${clean}`;
  }
}
