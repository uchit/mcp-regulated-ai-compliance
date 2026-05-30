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

Apache 2.0 (code) + CC BY 4.0 (dataset).
Free for individual and commercial use. Patent grant included.

If you ship AI in a regulated industry,
this should be the first MCP server in your config.

Repo: github.com/uchit/mcp-regulated-ai-compliance
Hosted: mcp.hellouchit.com/mcp

#AI #Compliance #EUAIAct #APRA #NIST #ISO42001 #MCP #ResponsibleAI
```

---

## Post-publish housekeeping

After posting:

1. **Reply to your own post within 5 min** with a comment:
   *"Glama auto-discovered all 6 tools / 56 resources / 5 prompts on first probe — glama.ai/mcp/servers/uchit/mcp-regulated-ai-compliance. Smithery did the same — smithery.ai/server/@uchit86/regulated-ai-compliance. Both verify before listing, so the trust badge is real."*
2. **DM 3-5 ANZ compliance practitioners** who've engaged with your previous AI/compliance posts. One line: *"Shipped this today — thought of you. Curious what you'd want added in v0.3. The hosted endpoint at mcp.hellouchit.com/mcp means you can try it in 30 seconds without installing anything."* Builds repeat engagement.
3. **Cross-post a condensed version to X** (~250 chars) linking the GitHub repo, same day.

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

## Engagement-window numbers to track

| Metric | Source | Target after 48h |
|---|---|---|
| Post impressions | LinkedIn analytics | 8K (org reach) · 25K (with reshares) |
| Profile-page clicks | LinkedIn analytics | 200 |
| Repo stars | github.com/uchit/mcp-regulated-ai-compliance | +30 |
| npm weekly downloads | `npm view @hellouchit/mcp-regulated-ai-compliance` | +50 |
| Hosted-endpoint hits | Cloudflare worker dashboard → Requests | +500 |
| Inbound DMs (qualified) | LinkedIn DMs | 5-10 |
| hellouchit.com outbound clicks (from source_url in tool responses) | GA4 → outbound_click | +50 |
