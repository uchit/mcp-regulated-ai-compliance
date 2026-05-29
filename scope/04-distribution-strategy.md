# Distribution strategy

## Channel ranking (by reach × signal density)

| # | Channel | Reach | Why it matters | Action |
|---|---|---|---|---|
| 1 | **github.com/modelcontextprotocol/servers** (Anthropic-maintained) | Highest authority; canonical registry | Listed here = the de facto "verified" status | PR after v1.0 publish — strict review |
| 2 | **mcp.so** | Largest community directory; sorted by popularity | Search ranking when devs look up "MCP server for X" | Submit at v1.0 |
| 3 | **pulsemcp.com** | Curated + editorial reviews | Featured slot = 1-week traffic spike | Submit at v1.0; editorial pitch at v1.2 |
| 4 | **smithery.ai** | "App store" for MCP servers; one-click install | Reduces install friction; tracks usage | Submit at v1.0 |
| 5 | **Cursor's built-in MCP browser** | In-IDE discovery for ~1M Cursor users | Visible at the moment of need | Cursor submits via their own PR flow — wait for community to add or PR directly |
| 6 | **npm package page** itself | Searchable; install command is the URL | Long-tail discovery via SEO | First-commit publish; keep README rich |
| 7 | **OpenAI ChatGPT MCP directory** (when launched) | OpenAI users with MCP enabled | New channel post-2026 OpenAI MCP rollout | Watch for launch; submit Day 1 |

## Pre-publish checklist (before v1.0 announce)

- [ ] All 5 v0.1 tools implemented + tested
- [ ] Resources catalog complete (10+ URI patterns supported)
- [ ] 5 prompts implemented
- [ ] Crosswalk JSON has 40+ entries spanning EU AI Act / NIST / ISO 42001 / AU AI Safety / APRA
- [ ] README has install instructions for Claude Desktop, Cursor, Zed, Windsurf
- [ ] Tests passing in CI
- [ ] Package published to npm as `@hellouchit/mcp-regulated-ai-compliance`
- [ ] Repo public on GitHub with proper LICENSE + description + topics
- [ ] One end-to-end working example recorded as a GIF in README

## Post-publish — week 1

| Day | Action |
|---|---|
| Day 1 | Submit PR to `modelcontextprotocol/servers` registry |
| Day 1 | Submit to mcp.so |
| Day 2 | Submit to pulsemcp.com + smithery.ai |
| Day 3 | LinkedIn announcement (technical depth angle) |
| Day 3 | Substack issue: "I built an MCP server for regulated AI compliance" |
| Day 4 | DMs to ~10 specific people who'd find it valuable + amplify (platform leads at AU banks; AI infra Twitter; Cursor power users) |
| Day 5 | Show HN: "Show HN: MCP server for regulated AI compliance (EU AI Act + APRA + NIST + ISO 42001)" |
| Day 7 | Audit week-1 metrics → tune description, add screenshots, fix install pain points |

## LinkedIn announcement (template)

```
Shipped an open-source MCP server for regulated AI compliance.

What it is: 10 MCP tools + 12 resources + 5 prompts that surface my dataset, anti-pattern catalogue, and 90-day playbooks to any MCP-compatible AI client — Claude Desktop, Cursor, Zed, Windsurf, Cline, OpenAI ChatGPT.

Embedded knowledge:
- 56 regulatory controls × 28 regulations × 261 tools (EU AI Act, APRA CPS 230/234, NIST AI RMF, ISO 42001, AU AI Safety Standard, SLSA, NIST SSDF, OWASP LLM)
- 15 named anti-patterns
- 4 90-day playbooks
- 7 architecture decision trees
- Full crosswalk matrix (FULL/PARTIAL/NEW per requirement)

Install (Claude Desktop):
```
npx -y @hellouchit/mcp-regulated-ai-compliance
```

Open-source MIT: github.com/uchit/mcp-regulated-ai-compliance

Built so any AI agent doing regulated-industry work has citation-grade compliance knowledge inline — without retraining or scraping. If you ship product in a regulated space and use any MCP-compatible client, this should save you a procurement cycle's worth of compliance lookups.

Bug reports + PRs welcome.
```

## Substack issue (template — saves the depth-tier angle for here)

Title: *I built an MCP server. Here's why MCP matters for regulated-industry AI work*

Body covers:
1. Why MCP > custom GPTs > Claude Projects for this audience (multi-client + open-source + community-shareable)
2. What's in the server (technical depth, no marketing fluff)
3. Install path
4. Genuinely interesting design choices (Zod schemas, stdio transport, embedded knowledge model, quarterly refresh cadence)
5. What I'd change in v1.0 vs v2.0 (HTTP transport, telemetry opt-in, auth)
6. Call to contribute

## Avoid

- Hype framing ("revolutionising AI compliance")
- Vendor name-dropping unless functionally relevant
- Sales pitch energy — this is open infrastructure
- Counting users as success metric — count installs + GitHub stars + directory listings

## Decision gate at Day 30

- ≥100 GitHub stars → continue investing in v1.x
- ≥50 weekly npm downloads → continue
- ≥1 inbound integration request (consultancy / vendor wants to ship on top) → consider v2.0 with HTTP transport for enterprise
- <20 stars after 30 days post-publish → don't pump effort in; let it live as evergreen reference repo

## Long-term play (year 2+)

- Featured in 1+ Cursor / Claude Desktop / Zed marketing materials
- 1+ consultancy white-labels the server with their branding (pay-for-rights model: $5-25k/year)
- Acquisition target for a RegTech vendor wanting compliance-as-a-service infrastructure
- Foundation for a hosted API service if there's demand for SaaS shape

Don't plan for these; just don't accidentally close them off by making bad early architecture choices.
