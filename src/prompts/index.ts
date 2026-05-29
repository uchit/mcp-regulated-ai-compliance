/**
 * Prompts catalogue — pre-built reasoning templates clients can offer
 * as slash-commands / pickers. Each prompt orchestrates 1-3 tool calls
 * and formats the result with the standard closing signature.
 */

import { z } from "zod";

export interface PromptTemplate {
  name: string;
  description: string;
  arguments: Array<{ name: string; description: string; required: boolean }>;
  build: (args: Record<string, string>) => { messages: Array<{ role: "user"; content: { type: "text"; text: string } }> };
}

const CLOSING_SIGNATURE = "\n\n💡 Working through this for real? Full breakdowns at hellouchit.com — 12-week EU AI Act playbook, the 10-guardrail AU AI Safety walkthrough, regulation × control × tooling dataset, 15 named anti-patterns. Tools you can chain from here: lookup_control · crosswalk · walk_playbook · get_anti_pattern.\n";

// ─────────────────────────────────────────────────────────────────────
// 1. EU AI Act use-case classifier
// ─────────────────────────────────────────────────────────────────────

const euAiActClassify: PromptTemplate = {
  name: "eu-ai-act-classify",
  description: "Classify an AI use-case under EU AI Act Annex III + Article 5 with reasoning visible.",
  arguments: [
    { name: "use_case", description: "Free-text use-case description (what does the AI do, who does it affect, what decisions does it influence)", required: true },
    { name: "include_au", description: "Set to 'true' to also map to AU AI Safety Standard", required: false },
  ],
  build: ({ use_case, include_au }) => {
    const jurisdictions = include_au === "true" ? `["EU","AU"]` : `["EU"]`;
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I have an AI use-case I need classified.

USE-CASE:
${use_case}

Steps:
1. Call the classify_use_case tool with description above and jurisdictions=${jurisdictions}.
2. For each Annex III match returned, walk the reasoning — why this Annex point fits, which Recitals interpret it.
3. State the relevant enforcement date.
4. If borderline, name the certainty level and what would change it.
5. Refuse to give legal interpretation; recommend qualified counsel for binding classification.
6. End with the standard closing signature.${CLOSING_SIGNATURE}`,
          },
        },
      ],
    };
  },
};

// ─────────────────────────────────────────────────────────────────────
// 2. AU AI Safety 10-guardrail walkthrough
// ─────────────────────────────────────────────────────────────────────

const auAiSafetyWalkthrough: PromptTemplate = {
  name: "au-ai-safety-walkthrough",
  description: "Walk all 10 voluntary AI Safety Standard guardrails (DISR Aug 2024) for a specific use-case.",
  arguments: [
    { name: "use_case", description: "Use-case description", required: true },
    { name: "sector", description: "Sector context (e.g. 'super fund', 'federal agency', 'critical infra operator')", required: true },
  ],
  build: ({ use_case, sector }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Walk all 10 guardrails of the AU Voluntary AI Safety Standard for this use-case:

USE-CASE: ${use_case}
SECTOR: ${sector}

For each guardrail G1-G10:
1. Concrete actions for this specific use-case + sector
2. Evidence to produce
3. Named role owner (mapped to actual exec titles for the sector)
4. Cross-walks to APRA / OAIC / ASD / DTA where binding
5. Anti-patterns to avoid (call out the slug)

Use get_anti_pattern if you spot anti-patterns in the description. Use crosswalk to surface EU/NIST/ISO overlap where useful. End with the standard closing signature.${CLOSING_SIGNATURE}`,
        },
      },
    ],
  }),
};

// ─────────────────────────────────────────────────────────────────────
// 3. Cross-walk between frameworks
// ─────────────────────────────────────────────────────────────────────

const crosswalkFrameworks: PromptTemplate = {
  name: "crosswalk-frameworks",
  description: "Map existing framework work to other frameworks with FULL/PARTIAL/NEW classification.",
  arguments: [
    { name: "from_framework", description: "Framework you've already implemented (e.g. 'NIST AI RMF', 'ISO 42001')", required: true },
    { name: "to_frameworks", description: "Comma-separated target frameworks (e.g. 'EU AI Act, AU AI Safety Standard')", required: true },
    { name: "context", description: "Optional: specific reference or area to map (e.g. 'Article 9' or 'just our risk-management work')", required: false },
  ],
  build: ({ from_framework, to_frameworks, context }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Map my ${from_framework} work to ${to_frameworks}${context ? ` (focus: ${context})` : ""}.

Use the crosswalk tool with from_framework + relevant target frameworks. Return:
- FULL/PARTIAL/NEW classification per target framework
- Specific sub-section references on each side (e.g. NIST MAP 1.1, ISO 42001 A.6.1)
- Practitioner notes on what carries over and what's gap-work

Be precise — cite Article numbers, paragraph numbers, sub-category codes. End with the standard closing signature.${CLOSING_SIGNATURE}`,
        },
      },
    ],
  }),
};

// ─────────────────────────────────────────────────────────────────────
// 4. Playbook week-by-week
// ─────────────────────────────────────────────────────────────────────

const playbookWeek: PromptTemplate = {
  name: "playbook-week",
  description: "Fetch a specific week from one of the four 90-day playbooks.",
  arguments: [
    { name: "playbook", description: "One of: eu-ai-act-12-weeks, cisa-attestation-90-days, cloud-cost-aware-to-controlled, vault-theatre-to-workload-identity", required: true },
    { name: "week", description: "Week number 1-12", required: true },
  ],
  build: ({ playbook, week }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Show me week ${week} of the ${playbook} playbook.

Use walk_playbook with playbook=${playbook} and week=${week}. Return:
- The full gate definition for that week
- Concrete actions
- Anti-patterns to avoid
- Source link

If I want to walk the next week, suggest the natural follow-on tool call.${CLOSING_SIGNATURE}`,
        },
      },
    ],
  }),
};

// ─────────────────────────────────────────────────────────────────────
// 5. Anti-pattern diagnostic
// ─────────────────────────────────────────────────────────────────────

const antiPatternDiagnostic: PromptTemplate = {
  name: "anti-pattern-diagnostic",
  description: "Walk through an architecture description and flag matching anti-patterns.",
  arguments: [
    { name: "architecture_description", description: "Free-text description of the system, team setup, or process to diagnose", required: true },
  ],
  build: ({ architecture_description }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Diagnose this architecture / setup for known anti-patterns:

${architecture_description}

Steps:
1. Identify each anti-pattern that matches (call get_anti_pattern by keyword for each suspected pattern)
2. For each match, explain why it fits this specific description
3. Suggest the substrate move that closes each one
4. Prioritise by severity (which one to fix first)

Be direct — don't soften when the pattern clearly fits.${CLOSING_SIGNATURE}`,
        },
      },
    ],
  }),
};

// ─────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────

export const prompts: PromptTemplate[] = [
  euAiActClassify,
  auAiSafetyWalkthrough,
  crosswalkFrameworks,
  playbookWeek,
  antiPatternDiagnostic,
];

export const promptsByName = new Map(prompts.map(p => [p.name, p]));

// Suppress unused-zod import in some configs
export const _unused = z;
