# Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** (Node 20+) | Largest MCP server ecosystem; best Anthropic SDK support; fast install via npm |
| MCP SDK | `@modelcontextprotocol/sdk` (Anthropic-maintained) | Reference implementation; handles transport + protocol |
| Transport | **stdio** (v0.1-v1.0) | Lowest-friction install; runs locally; no infrastructure cost |
| Transport (v2.0+) | **streamable HTTP** | For team/enterprise deployments; same code, different transport |
| Build | `tsc` (TypeScript compiler) | No bundler complexity; ES modules; tree-shakable |
| Test | `vitest` | Fast; native TS support; works with stdio mock |
| Lint | `biome` | One-tool replacement for ESLint + Prettier; 10x faster |
| Package manager | `npm` | Universal; works with `npx` (zero-install distribution) |

## Repo + module layout

```
src/
├── index.ts              ← entry point; instantiates Server, registers all tools/resources/prompts, starts stdio
├── tools/                ← one file per tool
│   ├── lookup-control.ts
│   ├── classify-use-case.ts
│   ├── get-anti-pattern.ts
│   ├── crosswalk.ts
│   ├── walk-playbook.ts
│   ├── list-regulations.ts
│   ├── decision-tree.ts
│   ├── generate-template.ts       ← v0.2+
│   ├── score-diagnostic.ts        ← v0.2+
│   └── check-compliance.ts        ← v0.2+
├── resources/            ← one file per resource type; resources are READ-ONLY content the client can fetch
│   ├── playbooks.ts
│   ├── anti-patterns.ts
│   ├── decision-trees.ts
│   └── dataset.ts
├── prompts/              ← pre-built prompt templates clients can pre-fill
│   ├── eu-ai-act-classify.ts
│   ├── au-ai-safety-walkthrough.ts
│   └── crosswalk-frameworks.ts
├── data/                 ← embedded knowledge (compiled in at build time)
│   ├── dataset.json
│   ├── anti-patterns.md
│   ├── playbooks/
│   └── decision-trees/
└── lib/
    ├── retrieval.ts      ← search/match helpers across data
    ├── schemas.ts        ← Zod schemas for tool input/output validation
    └── types.ts
```

## How the server starts (mental model)

```
User adds to claude_desktop_config.json:
{
  "mcpServers": {
    "regulated-ai-compliance": {
      "command": "npx",
      "args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]
    }
  }
}
```

1. Claude Desktop reads config → spawns `npx @hellouchit/mcp-regulated-ai-compliance` as a child process
2. Child process is our `src/index.ts` (compiled to `dist/index.js`)
3. Process communicates with Claude Desktop over **stdin/stdout** using the MCP wire protocol
4. Process advertises: "I have these tools, these resources, these prompts" via the protocol's `initialize` handshake
5. When the user asks Claude a question, Claude's reasoning may decide to call one of the tools → request flows over stdio → our server executes → response flows back
6. When the user explicitly drags a resource into context, Claude fetches the resource over stdio

## Transport: why stdio first

| Transport | Pros | Cons |
|---|---|---|
| **stdio** (v0.1-v1.0) | Zero-config for end-user; no network; no auth; works offline; lowest-friction MCP install | Single-user only; one process per client; no shared state |
| **streamable HTTP** (v2.0) | Multi-user; hosted; shared state possible; works behind firewalls | Requires hosting; auth needed; tail-latency considerations |

The MCP community in 2026 still defaults to stdio for the install path. HTTP is for teams/enterprises. Ship stdio first.

## Data lifecycle

```
hellouchit.com/dataset/
       ↓ (manual refresh, quarterly)
src/data/dataset.json
       ↓ (compiled in at build)
dist/data/dataset.json
       ↓ (loaded at runtime by retrieval.ts)
in-memory queryable map
```

**Refresh discipline:** the embedded `dataset.json` and `anti-patterns.md` are snapshots of the canonical versions on hellouchit.com. Re-sync quarterly via:

```bash
npm run sync-data
# (runs a script that re-pulls from hellouchit.com/dataset/dataset.json + anti-patterns markdown)
```

Bump npm version after each sync; users on `npx -y` auto-get the latest. No telemetry, no auto-update — quarterly bump is the cadence.

## Schemas

Use **Zod** for all tool input/output schemas. The MCP SDK accepts JSON Schema directly; Zod gives us:
- Single source of truth for shape
- Auto-generated TypeScript types
- Auto-converted to JSON Schema for the MCP protocol
- Runtime validation

Pattern:

```ts
import { z } from 'zod';

const LookupControlInput = z.object({
  regulation: z.enum(['cps234', 'cps230', 'eu_ai_act', ...]),
  surface: z.string().optional(),
});

const LookupControlOutput = z.object({
  control: z.string(),
  tools: z.array(...),
  evidence_shape: z.string(),
});
```

## Testing strategy

| Layer | Test type | Tool |
|---|---|---|
| Pure functions (retrieval, validation) | Unit | vitest |
| Tools (input → output) | Integration | vitest + fixtures from `src/data/` |
| End-to-end (server boot → tool call → response) | E2E | vitest + MCP test-client |
| Schema compatibility | Type-check | `tsc --noEmit` in CI |

Aim for >80% line coverage on `src/tools/` and `src/lib/`. Resources/prompts are mostly static; don't over-test.

## Performance budget

- Cold start: <500ms (acceptable for stdio-spawn)
- Single tool call: <50ms p99 (in-memory data)
- Memory: <100MB (entire dataset fits easily; no chunking needed)

These are loose — MCP isn't a hot-path service. But staying under them keeps the install feel snappy.

## Errors + observability

- All tool errors return MCP `isError: true` with a human-readable message
- Tool outputs include a `source` field pointing at the dataset row / playbook / anti-pattern URL so clients can cite back to hellouchit.com
- No telemetry in v0.1 — installs are private by design
- v0.2+: opt-in anonymous usage telemetry (count tool calls only, no payload) via env var `HELLOUCHIT_MCP_TELEMETRY=1`

## Security

- No network calls at runtime in v0.1
- No external API dependencies — entire knowledge base is embedded
- No write operations — pure read tool
- No auth needed (stdio is the security boundary)
- v2.0 HTTP transport will add auth (Bearer token at minimum)
