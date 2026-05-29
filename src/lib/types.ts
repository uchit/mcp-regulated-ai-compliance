/**
 * Shared types + Zod schemas for the regulated-AI-compliance MCP server.
 *
 * Single source of truth for input/output shapes across all tools.
 * Zod schemas double as runtime validators and JSON Schema generators
 * for the MCP protocol.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────
// Regulation registry — mirrors dataset.json's regulations table
// ─────────────────────────────────────────────────────────────────────

export const RegulationSlug = z.enum([
  "cps234",
  "cps230",
  "soci",
  "ai_safety_au",
  "privacy_au",
  "e8",
  "irap",
  "eu_ai_act",
  "dora",
  "nis2",
  "gdpr",
  "circia",
  "hipaa",
  "fda_samd",
  "cisa_ssa",
  "ssdf",
  "ai_rmf",
  "sp80053",
  "iso42001",
  "iso27001",
  "slsa",
  "owasp_llm",
  "atlas",
  "bcbs239",
  "pci",
  "iec62443",
  "iso13485",
  "iec62304",
]);
export type RegulationSlug = z.infer<typeof RegulationSlug>;

export const Sector = z.enum([
  "banks",
  "government",
  "healthcare",
  "critical-infrastructure",
  "all",
]);
export type Sector = z.infer<typeof Sector>;

export const ToolType = z.enum(["managed", "oss", "commercial", "standard"]);
export type ToolType = z.infer<typeof ToolType>;

export const OverlapStrength = z.enum(["FULL", "PARTIAL", "NEW"]);
export type OverlapStrength = z.infer<typeof OverlapStrength>;

export const RiskTier = z.enum([
  "prohibited",
  "high-risk",
  "limited-risk",
  "minimal-risk",
  "GPAI",
  "not-applicable",
]);
export type RiskTier = z.infer<typeof RiskTier>;

export const Certainty = z.enum(["high", "medium", "low"]);
export type Certainty = z.infer<typeof Certainty>;

// ─────────────────────────────────────────────────────────────────────
// Dataset row shape (from dataset.json)
// ─────────────────────────────────────────────────────────────────────

export const ToolEntry = z.tuple([
  z.string(),       // name
  z.string(),       // type (managed/oss/commercial/standard)
  z.string(),       // vendor
]);
export type ToolEntry = z.infer<typeof ToolEntry>;

export const DatasetRow = z.object({
  id: z.string(),
  reg: z.array(z.string()),       // regulation slugs
  ctrl: z.string(),               // control name
  cat: z.string(),                // category
  surface: z.string(),
  tools: z.array(ToolEntry),
  evidence: z.string(),
  anti_pattern: z.string().optional(),
  sectors: z.array(z.string()),
  notes: z.string(),
});
export type DatasetRow = z.infer<typeof DatasetRow>;

export const RegulationMeta = z.object({
  label: z.string(),
  jurisdiction: z.enum(["AU", "EU", "US", "INTL"]),
});
export type RegulationMeta = z.infer<typeof RegulationMeta>;

export const Dataset = z.object({
  version: z.string(),
  license: z.string(),
  source: z.string(),
  regulations: z.record(z.string(), RegulationMeta),
  rows: z.array(DatasetRow),
});
export type Dataset = z.infer<typeof Dataset>;

// ─────────────────────────────────────────────────────────────────────
// Anti-pattern shape
// ─────────────────────────────────────────────────────────────────────

export const AntiPattern = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.string().optional(),
  where_it_appears: z.string(),
  why_its_bad: z.string(),
  what_to_do_instead: z.string(),
  tell: z.string().optional(),
  source_url: z.string().url(),
});
export type AntiPattern = z.infer<typeof AntiPattern>;

// ─────────────────────────────────────────────────────────────────────
// Crosswalk shape
// ─────────────────────────────────────────────────────────────────────

export const CrosswalkMapping = z.object({
  references: z.array(z.string()),  // e.g. ["MAP 1.1", "MAP 5.1"]
  overlap: OverlapStrength,
  notes: z.string(),
});
export type CrosswalkMapping = z.infer<typeof CrosswalkMapping>;

export const CrosswalkEntry = z.object({
  id: z.string(),
  framework: z.string(),
  reference: z.string(),       // e.g. "Article 9"
  title: z.string(),
  mappings: z.record(z.string(), CrosswalkMapping),
});
export type CrosswalkEntry = z.infer<typeof CrosswalkEntry>;

// ─────────────────────────────────────────────────────────────────────
// Playbook shape
// ─────────────────────────────────────────────────────────────────────

export const PlaybookWeek = z.object({
  week_number: z.number().int().min(1).max(12),
  phase: z.string(),           // "1-4 Triage", "5-8 Substrate", "9-12 Documentation"
  title: z.string(),
  what_to_do: z.string(),
  gate: z.string(),            // "Gate N · ..."
  anti_patterns_to_avoid: z.array(z.string()),
  source_url: z.string().url(),
});
export type PlaybookWeek = z.infer<typeof PlaybookWeek>;

export const Playbook = z.object({
  slug: z.string(),
  title: z.string(),
  audience: z.string(),
  pre_requisites: z.string(),
  end_state: z.string(),
  diagnostic_to_rerun: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  weeks: z.array(PlaybookWeek),
  source_url: z.string().url(),
});
export type Playbook = z.infer<typeof Playbook>;

// ─────────────────────────────────────────────────────────────────────
// Shared "source citation" sub-schema
// ─────────────────────────────────────────────────────────────────────

export const SourceCitation = z.object({
  url: z.string().url(),
  type: z.enum(["dataset", "anti-pattern", "playbook", "decision-tree", "essay", "external"]),
  label: z.string(),
});
export type SourceCitation = z.infer<typeof SourceCitation>;
