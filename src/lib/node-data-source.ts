/**
 * Node.js file-system implementation of DataSource.
 *
 * Used by the stdio (src/index.ts) and node:http (src/http.ts) entrypoints.
 * Workers / Edge entrypoints DO NOT import this module — they construct
 * their own DataSource from bundle-time text imports.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DataSource } from "./data-source.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const PLAYBOOK_DIR = join(DATA_DIR, "playbooks");

let _cachedPlaybooks: Record<string, string> | null = null;

export const nodeDataSource: DataSource = {
  dataset: () => readFileSync(join(DATA_DIR, "dataset.json"), "utf-8"),
  antiPatterns: () => readFileSync(join(DATA_DIR, "anti-patterns.md"), "utf-8"),
  crosswalks: () => readFileSync(join(DATA_DIR, "crosswalks.json"), "utf-8"),
  playbooks: () => {
    if (_cachedPlaybooks) return _cachedPlaybooks;
    const out: Record<string, string> = {};
    for (const file of readdirSync(PLAYBOOK_DIR)) {
      if (!file.endsWith("-playbook.md")) continue;
      const slug = file.replace(/-playbook\.md$/, "");
      out[slug] = readFileSync(join(PLAYBOOK_DIR, file), "utf-8");
    }
    _cachedPlaybooks = out;
    return out;
  },
};
