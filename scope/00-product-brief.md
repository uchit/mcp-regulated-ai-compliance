# Product brief — mcp-regulated-ai-compliance

## What it is

A **single open-source MCP server** that exposes the regulated-industry AI compliance knowledge maintained at hellouchit.com — currently the 56-control × 28-regulation × 261-tool dataset, the 15-anti-pattern catalogue, the 4 90-day playbooks (EU AI Act, CISA SSA, FinOps, Vault Theatre→Workload Identity), 7 architecture decision trees, and 6 practitioner diagnostics — as MCP tools, resources, and prompts callable from any compatible AI client.

## Who it's for

The buyer profile in priority order:

1. **Cursor / Zed / Windsurf developers** writing code for AI features in regulated-industry products (banks, healthcare, government, critical infrastructure). They want their AI pair-programmer to know what EU AI Act / APRA / NIST expects, inline, while they code.

2. **Claude Desktop power users** who do deep research / compliance work in Claude but want their tool to have access to citation-grade compliance data without manually uploading it to a Project.

3. **Cline / Continue / OpenAI ChatGPT users** with the MCP add-on, doing similar work.

4. **Internal AI agents** at consultancies / banks / government agencies that integrate via the OpenAI Agents SDK or LangChain MCP adapter — your server becomes their default compliance-knowledge layer.

5. **The Anthropic + OpenAI + Cursor ecosystem editorial teams** who curate the public MCP directories. Being featured here = orders-of-magnitude distribution.

## Why MCP, not API or web app

| Option | Why not |
|---|---|
| REST API | Requires users to write integration code; doesn't surface naturally in AI workflows |
| Custom GPT | Already done (live in OpenAI Store); covers only ChatGPT |
| Claude Project | Already done; private per-user account; no public sharing on Pro Personal |
| Web app | Yet another tool to remember; doesn't enhance existing workflows |
| **MCP server** | **Plugs into existing AI workflows; one publish → 40+ client surfaces; community-maintained directory** |

## Strategic positioning

This is **not** a SaaS. It's **published reference infrastructure**, like:
- `uvicorn` is to Python web apps
- `cosign` is to container signing
- `OPA` is to policy enforcement

The brand play: become the **default compliance-knowledge MCP server in regulated industries**, so that when any AI agent in a regulated-industry workflow needs "what does APRA CPS 234 say about workload identity," it calls *your* server.

Direct revenue: $0 from the server itself. Compounding revenue: every install attribution → hellouchit.com visit → all the other monetization paths already in place (expert network rate lift, advisory-engagement leads, board-position credibility, etc.).

## Success criteria (12 months from v1.0 publish)

| Metric | Conservative | Strong |
|---|---|---|
| GitHub stars | 100 | 1,500+ |
| npm weekly downloads | 50 | 2,000+ |
| Listings in MCP directories | 3 | All 5 major directories + featured slot in 1 |
| Mentions in AI-engineering Substacks / podcasts | 1 | 6+ |
| Pull requests from external contributors | 0 | 5+ |
| Sponsored installs by named consultancies | 0 | 2+ |

A successful MCP server in this category in 2026 looks like **800–3,000 weekly downloads** with steady ~+10% month-over-month growth.

## What success doesn't require

- Revenue
- Vendor partnerships
- Marketing budget
- A team

Solo-maintainable; that's part of the design.

## Decision gates

| Gate | Trigger to continue |
|---|---|
| v0.1 (1 tool) | 5 friendly testers say "yes, install on Monday" |
| v0.5 (5 tools) | 30 GitHub stars + 1 inbound integration request |
| v1.0 (public publish) | Listed in MCP directory + 100 stars in 30 days |
| v2.0 (add HTTP transport + auth) | Need expressed by 3+ enterprise users |

If v0.5 → v1.0 transition stalls (no directory listing, < 50 stars after 90 days post-publish): pivot or sunset. Don't fund a hobby project pretending to be infrastructure.
