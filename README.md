# mcp-regulated-ai-compliance

> A **Model Context Protocol** server exposing the regulated-industry AI compliance knowledge from [hellouchit.com](https://hellouchit.com) as tools, resources, and prompts callable from any MCP-compatible AI client — Claude Desktop, Cursor, Zed, Windsurf, OpenAI ChatGPT, Continue, Cline, and ~40 other clients.
>
> Free + open-source (MIT). Built by Uchit Vyas — FDE for Technology Transformation & AI at Accenture ANZ.

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
├── LICENSE                            ← MIT
├── .gitignore
└── .github/workflows/                 ← CI: build + publish to npm
```

---

## Build status

| Phase | Status |
|---|---|
| **Phase 0 — Scope + skeleton** | ✅ done (you're looking at it) |
| **Phase 1 — Working server with 1 tool** | ✅ `lookup_control` implemented as reference |
| **Phase 2 — Core tools (v0.1)** | ⏳ in progress |
| **Phase 3 — Resources + prompts** | ⏳ planned |
| **Phase 4 — Publishing + directory listing** | ⏳ planned |

Read `scope/05-build-roadmap.md` for what to build in what order.

---

## Quick install (once published — currently in development)

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

MIT. Free to fork, embed, modify. Attribution to hellouchit.com appreciated but not required.

If you ship a commercial product on top of this, please consider sponsoring at [github.com/sponsors/uchit](https://github.com/sponsors/uchit).
