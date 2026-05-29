/**
 * Resources: hellouchit://playbooks/*
 *
 * URIs:
 *   hellouchit://playbooks/{slug}  — full playbook as Markdown
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLAYBOOK_DIR = join(__dirname, "..", "data", "playbooks");

const PLAYBOOK_META: Record<string, { name: string; description: string }> = {
  "eu-ai-act-12-weeks-playbook": {
    name: "EU AI Act high-risk readiness in 12 weeks",
    description: "Week-by-week playbook for taking a high-risk AI use-case from Piloting to EU AI Act Articles 9-15 ready by 2 Aug 2026. Three phases, twelve named gates.",
  },
  "cisa-attestation-90-days": {
    name: "CISA Secure Software Attestation in 90 days",
    description: "From 'some SSDF practices' to a defensible CISA SSA signature. Workload identity · SLSA L2+ provenance · SBOM owner-loop · verified deploys.",
  },
  "cloud-cost-aware-to-controlled": {
    name: "Cloud Cost — Aware → Controlled in a quarter",
    description: "From 5-12% YoY savings to 20-35% from baseline. Per-service cost in dev view · idle hunt · right-sizing · commitment review · cost-of-design in arch review.",
  },
  "vault-theatre-to-workload-identity": {
    name: "Vault Theatre → Workload Identity migration",
    description: "From static-creds-in-vault to OIDC-based workload identity. Wedge pipeline · paved-path template · across-estate rollout · new-cred detection.",
  },
};

export const playbookResources = {
  list() {
    try {
      const files = readdirSync(PLAYBOOK_DIR).filter(f => f.endsWith(".md"));
      return files.map(f => {
        const slug = f.replace(/\.md$/, "");
        const meta = PLAYBOOK_META[slug] ?? { name: slug, description: "Playbook" };
        return {
          uri: `hellouchit://playbooks/${slug}`,
          name: meta.name,
          description: meta.description,
          mimeType: "text/markdown",
        };
      });
    } catch {
      return [];
    }
  },

  read(uri: string) {
    const m = uri.match(/^hellouchit:\/\/playbooks\/(.+)$/);
    if (!m) return null;
    try {
      const text = readFileSync(join(PLAYBOOK_DIR, `${m[1]}.md`), "utf-8");
      return { uri, mimeType: "text/markdown", text };
    } catch {
      return null;
    }
  },
};
