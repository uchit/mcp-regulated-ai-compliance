/**
 * Resources: hellouchit://crosswalks/*
 *
 * URIs:
 *   hellouchit://crosswalks/full  — full crosswalk JSON (20+ entries)
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

export const crosswalkResources = {
  list() {
    return [
      {
        uri: "hellouchit://crosswalks/full",
        name: "Full crosswalk matrix",
        description: "Multi-framework crosswalks: EU AI Act ↔ NIST AI RMF ↔ ISO/IEC 42001 ↔ AU AI Safety Standard ↔ APRA CPS 230/234 ↔ OECD AI Principles ↔ OWASP LLM ↔ SLSA ↔ SSDF ↔ GDPR. Overlap classifications: FULL · PARTIAL · NEW.",
        mimeType: "application/json",
      },
    ];
  },

  read(uri: string) {
    if (uri === "hellouchit://crosswalks/full") {
      return {
        uri,
        mimeType: "application/json",
        text: readFileSync(join(DATA_DIR, "crosswalks.json"), "utf-8"),
      };
    }
    return null;
  },
};
