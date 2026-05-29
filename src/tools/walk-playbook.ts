/**
 * Tool: walk_playbook
 *
 * Return a 90-day playbook structure (whole playbook, or specific
 * week/gate). Pulled from the embedded playbook markdown files;
 * structured for AI agents to walk a user through gate-by-gate.
 */

import { z } from "zod";
import { getPlaybooks } from "../lib/retrieval.js";

const PLAYBOOK_SLUGS = z.enum([
  "eu-ai-act-12-weeks",
  "cisa-attestation-90-days",
  "cloud-cost-aware-to-controlled",
  "vault-theatre-to-workload-identity",
]);

export const WalkPlaybookInputSchema = z.object({
  playbook: PLAYBOOK_SLUGS.describe(
    "Playbook slug. Available: eu-ai-act-12-weeks · cisa-attestation-90-days · cloud-cost-aware-to-controlled · vault-theatre-to-workload-identity"
  ),
  week: z.number().int().min(1).max(12).optional().describe(
    "Specific week number (1-12). If omitted, returns the full playbook structure with metadata."
  ),
  include_metadata: z.boolean().default(true).describe(
    "Include playbook-level metadata (audience, prerequisites, end-state, diagnostic to re-run)."
  ),
});

export type WalkPlaybookInput = z.infer<typeof WalkPlaybookInputSchema>;

export async function walkPlaybookHandler(rawInput: unknown) {
  const input = WalkPlaybookInputSchema.parse(rawInput);
  const playbooks = getPlaybooks();
  const playbook = playbooks.get(input.playbook);

  if (!playbook) {
    return {
      isError: true,
      message: `Playbook '${input.playbook}' not yet parsed into structured form. Available canonical sources: https://hellouchit.com/playbooks/${input.playbook}.html`,
      fallback_url: `https://hellouchit.com/playbooks/${input.playbook}.html`,
    };
  }

  // Specific week requested
  if (input.week !== undefined) {
    const week = playbook.weeks.find(w => w.week_number === input.week);
    if (!week) {
      return {
        isError: true,
        message: `Week ${input.week} not found in playbook '${input.playbook}'. Weeks 1-12 are valid.`,
      };
    }
    return {
      query: input,
      ...(input.include_metadata
        ? { playbook_metadata: omit(playbook, "weeks") }
        : {}),
      week,
    };
  }

  // Whole playbook
  return {
    query: input,
    playbook,
  };
}

function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const { [key]: _, ...rest } = obj;
  void _;
  return rest;
}

export const walkPlaybookTool = {
  name: "walk_playbook",
  description: [
    "Return a structured 90-day playbook (or specific week/gate from one). Playbooks are sequenced from week 1 to week 12, organised into 3 phases, with 12 named gates and anti-pattern callouts.",
    "Available playbooks:",
    "- eu-ai-act-12-weeks: From 'Piloting' to EU AI Act Articles 9-15 ready by 2 Aug 2026",
    "- cisa-attestation-90-days: From 'some SSDF practices' to defensible CISA Secure Software Attestation",
    "- cloud-cost-aware-to-controlled: From 5-12% YoY savings to 20-35% (FinOps Aware → Controlled)",
    "- vault-theatre-to-workload-identity: From static-creds-in-vault to OIDC workload identity",
    "Use to walk a user through implementation sequentially, or to extract a specific gate's requirements.",
  ].join("\n"),
  inputSchema: WalkPlaybookInputSchema,
};
