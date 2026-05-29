# LinkedIn announcement — post once v0.1.0 is live on npm

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

→ github.com/uchit/mcp-regulated-ai-compliance

What's inside:
• 56 controls × 28 regulations × 261 tools
• 15 named anti-patterns (the failure modes I see most often)
• 20-entry crosswalk matrix
  (EU AI Act ↔ APRA ↔ NIST ↔ ISO 42001 ↔ AU AI Safety)
• EU AI Act 12-week playbook
• 6 tools, 53 resources, 5 prompts
  callable from Claude Desktop, Cursor, Zed, Windsurf,
  Continue, Cline, and any other MCP-compatible client.

Install in your Claude Desktop config:
"command": "npx",
"args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]

Apache 2.0 (code) + CC BY 4.0 (dataset).
Free for individual and commercial use. Patent grant included.

If you ship AI in a regulated industry,
this should be the first MCP server in your config.

#AI #Compliance #EUAIAct #APRA #NIST #ISO42001 #MCP #ResponsibleAI
```

---

## Post-publish housekeeping

After posting:

1. **Reply to your own post within 5 min** with a comment: *"Direct npm link → npmjs.com/package/@hellouchit/mcp-regulated-ai-compliance — `npx` will fetch + run it; no global install needed."* (Replies boost reach.)
2. **DM 3-5 ANZ compliance practitioners** who've engaged with your previous AI/compliance posts. One line: *"Shipped this today — thought of you. Curious what you'd want added in v0.2."* Builds repeat engagement.
3. **Cross-post a condensed version to X** (~250 chars) linking the GitHub repo, same day.
