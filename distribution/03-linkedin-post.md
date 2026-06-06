# LinkedIn announcement — v0.2.1 (post when ready)

**Best posting window for ANZ practitioners:** Tuesday or Wednesday, 7:30am AEST.
**Format:** Lead with the practitioner problem, not the tech. NO emojis at the front (LinkedIn algorithm penalises). Short lines, scannable.

---

## Post (paste into LinkedIn directly)

```
Most AI compliance work I see in banks, super funds, and insurers
fails at one specific step:

The AI assistant hallucinates the regulation.

"EU AI Act Article 9 requires..." → wrong paragraph.
"APRA CPS 230 says..." → mixing it up with CPS 234.
"NIST AI RMF Govern function..." → quoting v0.9, not v1.0.

The fix isn't a better prompt.
It's grounding the model in the actual regulation text,
the actual controls, and the actual crosswalks between frameworks.

So I shipped that as an MCP server today.

WHAT'S INSIDE

• 6 tools — lookup_control · classify_use_case · crosswalk ·
  walk_playbook · get_anti_pattern · list_regulations
• 56 controls × 28 regulations × 261 tools
• 15 named anti-patterns I see most often
• 20-entry crosswalk matrix
  (EU AI Act ↔ APRA ↔ NIST ↔ ISO 42001 ↔ AU AI Safety)
• 4 × 12-week playbooks:
  - EU AI Act high-risk readiness
  - CISA secure-software attestation
  - Cloud cost: Aware → Controlled
  - Vault Theatre → Workload Identity

HOW TO USE IT

Works in every MCP-compatible client:
Claude Desktop · Cursor · Zed · Windsurf · Continue · Cline · ChatGPT.

Option 1 — local (Claude Desktop / Cursor / Zed):
  "command": "npx",
  "args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]

Option 2 — hosted (no install, just an HTTPS URL):
  https://mcp.hellouchit.com/mcp

Option 3 — Smithery one-click install:
  smithery.ai/server/@uchit86/regulated-ai-compliance

Listed on:
• npm — @hellouchit/mcp-regulated-ai-compliance
• Official MCP Registry — io.github.uchit/...
• Glama
• Smithery

Apache 2.0 (code) + CC BY 4.0 (dataset). Patent grant included.

If you work on AI in a regulated industry, hope it's useful —
feedback and PRs welcome.

Personal open-source project — views my own, not affiliated with my employer.

Repo: github.com/uchit/mcp-regulated-ai-compliance
Hosted: mcp.hellouchit.com/mcp

#AI #Compliance #EUAIAct #APRA #NIST #ISO42001 #MCP #ResponsibleAI
```

---

## Post-publish housekeeping

After posting:

1. **Reply to your own post** with a comment noting that Glama and Smithery both auto-discovered the 6 tools / 56 resources / 5 prompts on first probe and verify servers before listing — glama.ai/mcp/servers/uchit/mcp-regulated-ai-compliance · smithery.ai/server/@uchit86/regulated-ai-compliance.
2. **Cross-post a condensed version to X** (~250 chars) linking the GitHub repo, same day.

---

## X / Twitter version (post same day, ~5 min after LinkedIn)

```
Shipped mcp-regulated-ai-compliance — MCP server for grounded
regulated-industry AI compliance.

EU AI Act · APRA · NIST AI RMF · ISO 42001 · AU AI Safety.
56 controls · 28 regs · 261 tools · 15 anti-patterns ·
20 crosswalks · 4 × 12-week playbooks.

Hosted: mcp.hellouchit.com/mcp
Repo: github.com/uchit/mcp-regulated-ai-compliance

Apache 2.0. Works in every MCP client.
```

---

## Project signals to watch (optional)

Normal open-source curiosity metrics — no lead-gen / conversion tracking:

| Metric | Source |
|---|---|
| Repo stars | github.com/uchit/mcp-regulated-ai-compliance |
| npm weekly downloads | `npm view @hellouchit/mcp-regulated-ai-compliance` |
| GitHub issues / PRs opened | repo Issues + Pull Requests tabs |
