# Build roadmap — 4 phases, ~16 hours focused

## Phase 1 — Working skeleton (3 hours · COMPLETE ✅)

- [x] Repo skeleton + folder structure
- [x] `package.json` with correct MCP SDK dependency
- [x] `tsconfig.json` strict mode
- [x] `src/index.ts` MCP Server instantiation + stdio transport
- [x] `src/tools/lookup-control.ts` fully implemented (reference)
- [x] `src/lib/retrieval.ts` data-loading helpers
- [x] `src/lib/types.ts` shared types + Zod schemas
- [x] Data files copied in (`dataset.json`, `anti-patterns.md`, one playbook)
- [x] `LICENSE` (MIT) + `.gitignore`
- [x] Scope docs (this folder)

**Verification:** `npm install && npm run build && npm run dev` — server starts on stdio, advertises 1 tool (`lookup_control`), responds to a `tools/call` request.

---

## Phase 2 — Core tools (6 hours)

Order matters — each tool builds on the data-loading patterns from `lookup_control`.

| Hour | Tool | Notes |
|---|---|---|
| 1 | `get_anti_pattern` | Parse `anti-patterns.md` once at startup into structured form; slug index + keyword search |
| 2 | `crosswalk` | Build `src/data/crosswalks.json` (~40 entries) + lookup function; this is the highest-value tool |
| 3 | `walk_playbook` | Parse 4 playbook markdown files into week + gate structure |
| 4 | `classify_use_case` | Pattern-match description against high-risk classifications from dataset + crosswalks |
| 5 | `list_regulations` | Simple filter over dataset.json regulations index |
| 6 | Tests + bug fixes | vitest suite covering all 6 tools; aim 80% line coverage |

**Verification:** call each tool via MCP test-client; all 6 return well-typed, source-cited responses.

---

## Phase 3 — Resources + prompts (4 hours)

| Hour | Component | Notes |
|---|---|---|
| 1 | Resources for dataset (full + by-regulation + by-category) | 3 URI patterns; reuse retrieval helpers |
| 2 | Resources for anti-patterns (full + by-slug) + playbooks (full + by-week) | 4 URI patterns |
| 3 | Resources for crosswalks (full) + decision trees (full + by-slug) | 2 URI patterns; decision trees imported from hellouchit.com/decisions/ JSON |
| 4 | 5 prompts (eu-ai-act-classify, au-ai-safety-walkthrough, crosswalk-frameworks, playbook-week, anti-pattern-diagnostic) | Slot-filled templates that orchestrate tool calls |

**Verification:** all resources fetchable via test-client at correct URIs; all 5 prompts list in `prompts/list` and execute correctly.

---

## Phase 4 — Publish + distribute (3 hours)

| Time | Task | Notes |
|---|---|---|
| 30 min | npm package metadata polish (description, keywords, README image, screenshots) | First impression matters in npm search |
| 30 min | `.github/workflows/publish.yml` for auto-publish on tag | `npm run release` cuts a tag + auto-publishes |
| 30 min | Per-client install docs (Claude Desktop, Cursor, Zed, Windsurf, Continue) | One markdown file each in `docs/install/` |
| 30 min | Record GIF of working example (terminal + Claude Desktop side-by-side) | Add to README — significantly increases install rate |
| 30 min | Create `npm` org + publish v1.0.0 | `npm publish --access public` |
| 30 min | Make GitHub repo public + add topics: `mcp` `claude` `ai-compliance` `eu-ai-act` `apra` `nist-ai-rmf` `iso-42001` | Topic tags drive GitHub search |

**Then execute the Week 1 distribution plan from `04-distribution-strategy.md`.**

---

## Total: 16 hours focused work

| Phase | Hours | Status |
|---|---|---|
| Phase 1 | 3 | ✅ Done |
| Phase 2 | 6 | ⏳ |
| Phase 3 | 4 | ⏳ |
| Phase 4 | 3 | ⏳ |

**16 hours = 2 focused days** (or 4 evenings) with Cursor / Claude Code pair-programming. Most of the work is mechanical (parsing markdown, building lookup tables, writing tool handlers).

The non-mechanical work is the **crosswalk JSON** (3 hours of careful drafting + cross-checking against actual EU AI Act / NIST / ISO 42001 / APRA / AU AI Safety documents). Don't speed-run this; it IS the product for many users.

---

## What to ship in v0.2 / v0.3 (after v1.0 install signal exists)

- v0.2: `decision_tree`, `score_diagnostic`, `generate_template`, `check_compliance` tools
- v0.2: Telemetry opt-in (anonymous tool-call count via `HELLOUCHIT_MCP_TELEMETRY=1` env var)
- v0.3: AU AI Safety Mandatory Guardrails text (when published, expected 2026-2027)
- v0.3: HTTP/SSE transport for hosted-server use case
- v1.0 → v2.0: Auth, multi-tenant resources, enterprise audit log

---

## Don't ship in v1.0

- **Auth.** stdio transport is the security boundary.
- **Database.** All knowledge embedded; no runtime mutation.
- **Network calls at runtime.** Quarterly data refresh is at build-time.
- **Custom UI.** MCP clients are the UI.
- **Telemetry.** Wait for opt-in v0.2 if needed.
- **HTTP transport.** Add only if 3+ enterprise users ask.

Keep v1.0 small + sharp + obviously open-source.
