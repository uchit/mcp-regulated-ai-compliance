# PR to modelcontextprotocol/servers

## Steps

1. Fork https://github.com/modelcontextprotocol/servers
2. Edit `README.md` → **Community Servers** section (alphabetical)
3. Insert the line below in alphabetical position
4. PR title: `Add regulated-ai-compliance MCP server`
5. PR body: paste the body block below

## Line to add (alphabetical — between any nearby R entries)

```markdown
- **[Regulated AI Compliance](https://github.com/uchit/mcp-regulated-ai-compliance)** - Regulated-industry AI compliance knowledge (EU AI Act · APRA · NIST AI RMF · ISO 42001 · AU AI Safety Standard) exposed as 6 tools, 53 resources, and 5 prompts. 56 controls × 28 regulations × 261 tools, 15 named anti-patterns, 20-entry crosswalk matrix.
```

## PR body

```markdown
## Description

Adds `@hellouchit/mcp-regulated-ai-compliance` to the **Community Servers** section.

This MCP server exposes the curated regulated-industry AI compliance dataset from [hellouchit.com](https://hellouchit.com) — covering EU AI Act, APRA CPS 230/234, NIST AI RMF, ISO 42001, AU AI Safety Standard, OECD, Council of Europe AI Convention, OWASP LLM Top 10, SLSA, SSDF, OAIC APPs, and 17 more frameworks.

### What it provides

- **6 tools** — `lookup_control` · `get_anti_pattern` · `crosswalk` · `walk_playbook` · `classify_use_case` · `list_regulations`
- **53 resources** — full dataset, per-regulation/per-category slices, 15 named anti-patterns, EU AI Act 12-week playbook, 20-entry framework crosswalk matrix
- **5 prompts** — pre-built templates for EU AI Act classification, AU AI Safety walkthrough, framework crosswalk, playbook week, anti-pattern diagnostic

### Why it's useful

Regulated-industry AI work (banking, super, insurance, health) needs grounded citations to specific regulation articles, paragraphs, and recital numbers. This server lets any MCP client query that knowledge directly instead of hallucinating compliance answers.

### Quality

- TypeScript strict mode, 9/9 unit tests passing
- CI on Node 20 + 22
- Published to npm with provenance attestation
- Apache 2.0 (code) + CC BY 4.0 (dataset)

### Install

\`\`\`json
{
  "mcpServers": {
    "regulated-ai-compliance": {
      "command": "npx",
      "args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]
    }
  }
}
\`\`\`

### Author

Uchit Vyas — Author of 5 books on cloud/security architecture, US patent holder, Top 50 DevSecOps globally.
```
