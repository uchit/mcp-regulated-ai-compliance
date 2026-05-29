/**
 * Resources: hellouchit://anti-patterns/*
 *
 * URIs:
 *   hellouchit://anti-patterns/full      — all anti-patterns as one Markdown
 *   hellouchit://anti-patterns/{slug}    — single anti-pattern as Markdown
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getAntiPatterns } from "../lib/retrieval.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

export const antiPatternResources = {
  list() {
    const resources = [
      {
        uri: "hellouchit://anti-patterns/full",
        name: "All anti-patterns",
        description: "The 15 named failure modes across enterprise architecture, platform engineering, DevSecOps, applied GenAI, data, and operating-model design. Markdown.",
        mimeType: "text/markdown",
      },
    ];
    for (const ap of getAntiPatterns().values()) {
      resources.push({
        uri: `hellouchit://anti-patterns/${ap.slug}`,
        name: ap.name,
        description: ap.where_it_appears,
        mimeType: "text/markdown",
      });
    }
    return resources;
  },

  read(uri: string) {
    if (uri === "hellouchit://anti-patterns/full") {
      return {
        uri,
        mimeType: "text/markdown",
        text: readFileSync(join(DATA_DIR, "anti-patterns.md"), "utf-8"),
      };
    }
    const m = uri.match(/^hellouchit:\/\/anti-patterns\/(.+)$/);
    if (m) {
      const slug = m[1] ?? "";
      const ap = getAntiPatterns().get(slug);
      if (!ap) return null;
      const text = [
        `# ${ap.name}`,
        "",
        ap.category ? `*Category: ${ap.category}*` : "",
        "",
        "## Where it appears",
        ap.where_it_appears,
        "",
        "## Why it's bad",
        ap.why_its_bad,
        "",
        "## What to do instead",
        ap.what_to_do_instead,
        "",
        ap.tell ? `**Diagnostic tell:** ${ap.tell}` : "",
        "",
        `Source: ${ap.source_url}`,
      ].filter(Boolean).join("\n");
      return { uri, mimeType: "text/markdown", text };
    }
    return null;
  },
};
