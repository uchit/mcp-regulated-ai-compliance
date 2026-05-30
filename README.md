# mcp-regulated-ai-compliance

> A **Model Context Protocol** server exposing the regulated-industry AI compliance knowledge from [hellouchit.com](https://hellouchit.com) as tools, resources, and prompts callable from any MCP-compatible AI client — Claude Desktop, Cursor, Zed, Windsurf, OpenAI ChatGPT, Continue, Cline, and ~40 other clients.
>
> Free + open-source (Apache 2.0, dataset CC BY 4.0). Built by Uchit Vyas — FDE for Technology Transformation & AI at Accenture ANZ.

---

## Why this exists

The **OpenAI GPT Store** hosts the EU AI Act and AU AI Safety Standard coaches as ChatGPT-only assets. The **Claude Project** equivalents are private to each user's Claude Pro account (no public sharing). Neither reaches the practitioners who work primarily inside **Cursor, Zed, Continue, Cline, or the Claude API directly**.

An MCP server is the only Claude-side asset that is genuinely shareable + multi-client. It surfaces the same dataset, anti-patterns, decision trees, and classification logic — but as **tools any AI agent in any compatible client can call**. One published server → 40+ client surfaces → the practitioner who never opens ChatGPT or claude.ai still ends up citing your work.

---

## What's in this folder

```
mcp-regulated-ai-compliance/
├── README.md                          ← you are here
├── scope/                             ← the design docs (read FIRST)
│   ├── 00-product-brief.md            What this is + who it's for
│   ├── 01-architecture.md             System design + transport choices
│   ├── 02-tools-spec.md               The 10 tools the server exposes
│   ├── 03-resources-spec.md           The resources + prompts
│   ├── 04-distribution-strategy.md    Where to list + how to get installs
│   └── 05-build-roadmap.md            v0.1 → v1.0 in 4 phases
├── src/
│   ├── index.ts                       ← MCP server entry point (working stub)
│   ├── tools/                         ← one file per tool
│   │   └── lookup-control.ts          ← FULLY IMPLEMENTED as reference
│   ├── resources/                     ← one file per resource type
│   ├── prompts/                       ← pre-built prompt templates
│   ├── data/                          ← embedded knowledge (dataset, anti-patterns, playbooks)
│   │   ├── dataset.json               ← 56 controls × 28 regulations × 261 tools
│   │   ├── dataset.csv                ← same data, CSV format
│   │   ├── anti-patterns.md           ← 15 named failure modes
│   │   └── playbooks/                 ← 90-day playbooks
│   └── lib/
├── docs/
│   └── install/                       ← per-client install guides
├── examples/                          ← sample conversations / use-cases
├── tests/
├── package.json                       ← npm config (working)
├── tsconfig.json                      ← TypeScript config
├── LICENSE                            ← Apache 2.0 (code) + CC BY 4.0 (dataset)
├── .gitignore
└── .github/workflows/                 ← CI: build + publish to npm
```

---

## Status — v0.2.1 shipped 2026-05-29

> v0.2.1 = data-source abstraction so the same codebase runs on Node (stdio, node:http) AND on Cloudflare Workers / Deno Deploy / Vercel Edge. See `worker/` for the Cloudflare scaffold.

[![CI](https://github.com/uchit/mcp-regulated-ai-compliance/actions/workflows/ci.yml/badge.svg)](https://github.com/uchit/mcp-regulated-ai-compliance/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@hellouchit/mcp-regulated-ai-compliance.svg)](https://www.npmjs.com/package/@hellouchit/mcp-regulated-ai-compliance)
[![npm downloads](https://img.shields.io/npm/dm/@hellouchit/mcp-regulated-ai-compliance.svg)](https://www.npmjs.com/package/@hellouchit/mcp-regulated-ai-compliance)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Provenance](https://img.shields.io/badge/npm-provenance%20signed-success)](https://search.sigstore.dev/?logIndex=1667445738)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-active-brightgreen)](https://registry.modelcontextprotocol.io/v0/servers?search=regulated-ai-compliance)
[![Glama MCP score](https://glama.ai/mcp/servers/uchit/mcp-regulated-ai-compliance/badges/score.svg)](https://glama.ai/mcp/servers/uchit/mcp-regulated-ai-compliance)
[![smithery badge](https://smithery.ai/badge/@uchit86/regulated-ai-compliance)](https://smithery.ai/server/@uchit86/regulated-ai-compliance)

| Phase | Status |
|---|---|
| **Phase 0 — Scope + skeleton** | ✅ done |
| **Phase 1 — Working server + reference tool** | ✅ done |
| **Phase 2 — 6 core tools** | ✅ done |
| **Phase 3 — 4 resource providers + 5 prompts** | ✅ done |
| **Phase 4 — npm publish + directory submissions** | ✅ done |
| **Phase 5 — HTTP transport + 4 playbooks + parser** | ✅ **done (v0.2.0)** |

### v0.2.0 ships with

- **Streamable HTTP transport** — `npx mcp-regulated-ai-compliance-http` boots a Node HTTP server on port 3000 (configurable) at `/mcp`. Unlocks Smithery, ChatGPT MCP directory, browser-based clients, and any platform that prefers HTTP over stdio. Stateless by default; set `MCP_STATEFUL=true` for per-session UUIDs.
- **All 4 playbooks fully structured** — markdown parser extracts 12-week / 12-gate / phase / anti-pattern / source-URL data:
  - `eu-ai-act-12-weeks` — Piloting → Articles 9-15 ready by 2 Aug 2026
  - `cisa-attestation-90-days` — Federal contractor SSDF + Common Form 3201-NEW
  - `cloud-cost-aware-to-controlled` — FinOps Aware → Controlled (AWS / Azure / GCP)
  - `vault-theatre-to-workload-identity` — Long-lived creds → OIDC federation
- **6 tools** — `lookup_control` · `get_anti_pattern` · `crosswalk` · `walk_playbook` · `classify_use_case` · `list_regulations`
- **4 resource providers (56 URIs)** — full dataset (+ by-regulation + by-category), 15 anti-patterns (bundled + per-slug), 4 playbooks, the 20-entry crosswalk matrix
- **5 prompts** — `eu-ai-act-classify` · `au-ai-safety-walkthrough` · `crosswalk-frameworks` · `playbook-week` · `anti-pattern-diagnostic`
- **Embedded knowledge** — 56 controls × 28 regulations × 261 tools, 15 named anti-patterns, 4 × 12-week playbooks, 20 crosswalks
- **CI + tests** — GitHub Actions on Node 22 + 24, **24/24** unit tests, automated `npm publish --provenance` on version tag (sigstore-anchored)

### Where you can find it

| Channel | Status |
|---|---|
| npm | ✅ [`@hellouchit/mcp-regulated-ai-compliance@0.2.0`](https://www.npmjs.com/package/@hellouchit/mcp-regulated-ai-compliance) |
| Official MCP Registry | ✅ [`io.github.uchit/mcp-regulated-ai-compliance`](https://registry.modelcontextprotocol.io/v0/servers?search=regulated-ai-compliance) |
| Glama | ✅ [verified](https://glama.ai/mcp/servers/uchit/mcp-regulated-ai-compliance) |
| mcp.so | ⏳ awaiting review |
| PulseMCP | ⏳ auto-pulls from Official Registry (~24h) |
| awesome-mcp-servers (Security) | ⏳ [PR #7084](https://github.com/punkpeye/awesome-mcp-servers/pull/7084) |
| **Hosted endpoint** | ✅ **[https://mcp.hellouchit.com/mcp](https://mcp.hellouchit.com/mcp)** (Cloudflare Worker · stateless) |
| Smithery | ✅ [smithery.ai/server/@uchit86/regulated-ai-compliance](https://smithery.ai/server/@uchit86/regulated-ai-compliance) |

See `scope/05-build-roadmap.md` for the v0.2+ roadmap.

---

## Quick install

For Claude Desktop:

```bash
# In your Claude Desktop config file (~/Library/Application Support/Claude/claude_desktop_config.json):
{
  "mcpServers": {
    "regulated-ai-compliance": {
      "command": "npx",
      "args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]
    }
  }
}
```

Then restart Claude Desktop → you'll see new tools available: `lookup_control`, `classify_use_case`, `get_anti_pattern`, etc.

### Regulation slugs (use these exact values in tool arguments)

`eu_ai_act` · `cps234` · `cps230` · `soci` · `ai_safety_au` · `privacy_au` · `e8` · `irap` · `dora` · `nis2` · `gdpr` · `circia` · `hipaa` · `fda_samd` · `cisa_ssa` · `ssdf` · `ai_rmf` · `sp80053` · `iso42001` · `iso27001` · `slsa` · `owasp_llm` · `atlas` · `bcbs239` · `pci` · `iec62443` · `iso13485` · `iec62304`

---

## Local development

```bash
npm install
npm run build
npm run dev          # runs server in dev mode (stdio transport)
npm test             # runs the test suite
```

See `scope/01-architecture.md` for the dev-loop details.

---

## License

**Code:** Apache 2.0. Free for individual + commercial use. Patent grant included.
**Dataset** (regulations × controls × tooling, anti-patterns, playbooks, crosswalks): CC BY 4.0 — attribution to hellouchit.com required.

If you ship a commercial product on top of this, please consider [sponsoring on GitHub](https://github.com/sponsors/uchit).

---

## Looking for a hosted / managed version?

For organisations needing a multi-tenant hosted instance with:

- SSO + audit log + admin console
- White-labelled dataset extensions (your own controls + crosswalks added alongside the canonical ones)
- Customer-specific playbook variants
- SLA + dedicated support

→ **The managed/SaaS edition is on the roadmap.** Sign up at [hellouchit.com/letters](https://hellouchit.com/letters) to be notified when it ships, or email **contact@hellouchit.com** to be early-access.
