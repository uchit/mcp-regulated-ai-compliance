# Show HN — post once v0.1.0 is live on npm

**Best posting window:** Tuesday-Thursday, 8-10am US Pacific (= Wednesday-Friday 1-3am AEST).
**Title:** Lead with what it IS, not adjectives. HN voters reject anything that smells like marketing.

---

## Title (80 char max — HN cuts at 80)

```
Show HN: An MCP server that grounds AI in regulated-industry compliance text
```

(76 chars — leaves room.)

## URL

```
https://github.com/uchit/mcp-regulated-ai-compliance
```

## Text body (optional but recommended — keep < 1500 chars; HN folds anything longer)

```
I work on AI for ANZ banks, super funds, and insurers. The same failure
mode every engagement: AI assistants hallucinate regulation citations.
Wrong paragraph numbers in EU AI Act Article 9. Mixing APRA CPS 230 with
CPS 234. Quoting NIST AI RMF v0.9 instead of v1.0.

Prompt engineering doesn't fix it. Grounding does.

So I packaged the dataset I'd built over the last 18 months —
56 controls × 28 regulations × 261 tools, 15 named anti-patterns,
a 20-entry crosswalk between EU AI Act / APRA / NIST / ISO 42001 / AU AI Safety,
plus an EU AI Act 12-week playbook — as an MCP server.

6 tools, 53 resources, 5 prompts. Works in Claude Desktop, Cursor, Zed,
Windsurf, Continue, Cline, ChatGPT, and any other MCP client.

Stack: TypeScript strict, Zod for runtime validation + JSON Schema
generation, @modelcontextprotocol/sdk, stdio transport, npm with provenance.
Apache 2.0 (code) + CC BY 4.0 (dataset).

Install:
  npx -y @hellouchit/mcp-regulated-ai-compliance

Or paste into Claude Desktop config:
  "command": "npx",
  "args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]

Curious what other regulated-industry frameworks people want added.
Roadmap is open in scope/05-build-roadmap.md.
```

---

## Comment-engagement plan

HN ranks by comment velocity in the first 60 min. Be ready to:

1. **Be at your computer** for the 90 min after posting
2. **Reply to every comment within 10 min**, especially:
   - Technical questions about MCP / Zod / stdio → answer fully
   - "Why not just RAG?" → explain that RAG returns prose; tools return *structured callable knowledge* the model uses for branching logic
   - "Is the dataset proprietary?" → CC BY 4.0, raw JSON in `src/data/dataset.json`, free to fork
   - Skeptical comments → engage politely; do NOT delete or downvote
3. **Don't ask people to upvote** (instant HN ban + flag risk)

Realistic outcomes:
- Front-page (top 30): ~15% probability
- 2nd page (30-90): ~40% probability
- Just appears in /new: ~45% probability

Even just-in-/new yields 50-200 GitHub stars and 5-15 quality DMs from regulated-industry engineers — which is the actual goal.
