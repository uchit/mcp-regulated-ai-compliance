/**
 * Pluggable data source for the embedded knowledge.
 *
 * The MCP server embeds 4 data files (dataset.json, crosswalks.json,
 * anti-patterns.md, plus the 4 playbook markdown files). The retrieval
 * layer (src/lib/retrieval.ts) is platform-agnostic and reads through
 * this abstraction so the same code works on:
 *
 *   - Node.js (stdio + node:http entrypoints) — see node-data-source.ts
 *   - Cloudflare Workers / Deno Deploy / Vercel Edge — caller passes
 *     embedded text constants imported at bundle-time
 *
 * Initialise once at process start by calling `setDataSource()`.
 */

export interface DataSource {
  dataset: () => string;
  antiPatterns: () => string;
  crosswalks: () => string;
  playbooks: () => Record<string, string>;
}

let _source: DataSource | null = null;

export function setDataSource(source: DataSource): void {
  _source = source;
}

export function getDataSource(): DataSource {
  if (_source) return _source;
  throw new Error(
    "[mcp-regulated-ai-compliance] data source not initialised. " +
      "Call setDataSource() before tool/resource handlers run."
  );
}

/** Test-helper: clear the configured source. Useful between tests. */
export function resetDataSource(): void {
  _source = null;
}
