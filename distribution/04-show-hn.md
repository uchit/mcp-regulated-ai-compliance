# Show HN — v0.2.1 (post when ready)

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
plus 4 × 12-week playbooks (EU AI Act readiness, CISA SSA attestation,
cloud cost Aware→Controlled, vault-theatre→workload-identity) —
as an MCP server.

6 tools, 56 resources, 5 prompts. Works in Claude Desktop, Cursor, Zed,
Windsurf, Continue, Cline, ChatGPT, and any other MCP client.

Two install paths:

  1. Local (stdio):
       npx -y @hellouchit/mcp-regulated-ai-compliance
  2. Hosted (streamable HTTP, no install):
       https://mcp.hellouchit.com/mcp

Stack: TypeScript strict, Zod for runtime validation + JSON Schema
generation, @modelcontextprotocol/sdk, both stdio + streamable-HTTP
transports, deployed to Cloudflare Workers (V8 isolates, ~50ms cold start),
npm with sigstore provenance.

Listed on the Official MCP Registry (registry.modelcontextprotocol.io)
and on Glama and Smithery — both verified the server by spawning it
and probing its tools/list before listing.

Apache 2.0 (code) + CC BY 4.0 (dataset).

Curious what other regulated-industry frameworks people want added.
Roadmap is open in scope/05-build-roadmap.md.
```

---

## Comment-engagement plan

HN ranks by comment velocity in the first 60 min. Be ready to:

1. **Be at your computer** for the 90 min after posting
2. **Reply to every comment within 10 min**, especially:
   - "Why not just RAG?" → explain that RAG returns prose; tools return *structured callable knowledge* the model uses for branching logic. Show a `crosswalk` example: input "Article 9", output structured JSON with FULL/PARTIAL/NEW classifications across 5 frameworks. A RAG retriever can't make those branching decisions cleanly.
   - "Is the dataset proprietary?" → CC BY 4.0, raw JSON in `src/data/dataset.json`, free to fork. The maintained-by-me curation is what differentiates from any LLM trying to scrape primary sources.
   - "How did you handle CF Workers + the MCP SDK?" → DataSource abstraction in src/lib/data-source.ts; embed-data script bundles the 161KB knowledge into the worker; the SDK has a WebStandardStreamableHTTPServerTransport variant that returns a Response from a Request. Stateless mode means per-request transport+server (cheap, ~µs of registration).
   - "What about regulations not yet covered?" → 28 covered today; PR welcome on src/data/dataset.json; the crosswalk format is documented in scope/03-resources-spec.md.
   - Skeptical comments → engage politely; do NOT delete or downvote.
3. **Don't ask people to upvote** (instant HN ban + flag risk)

Realistic outcomes:
- Front-page (top 30): ~20% probability (improved from ~15% because the hosted endpoint = lower friction to try = more upvotes from quick-tryers)
- 2nd page (30-90): ~40% probability
- Just appears in /new: ~40% probability

Even just-in-/new yields 100-300 GitHub stars and 8-20 quality DMs from regulated-industry engineers — which is the actual goal.

---

## If a question gets traction — write a follow-up Show HN comment with depth

When one of the comments is high-quality and gets upvotes, drop a deeper reply citing specific code paths:

> RE the DataSource abstraction — full file is at src/lib/data-source.ts:1-46. The Node version is src/lib/node-data-source.ts (uses readFileSync). The Worker version is in worker/src/worker.ts:24-29 (uses bundle-time text imports). The retrieval layer in src/lib/retrieval.ts has zero fs imports — that's the moat against runtime fragmentation as we add Deno Deploy / Bun / Edge runtimes in v0.3.

That kind of reply lifts the post in the HN ranking because each substantive sub-comment is signal.
