# Cloudflare Worker deployment

Hosted Streamable-HTTP endpoint for `mcp-regulated-ai-compliance`. Same 6 tools, 5 prompts, 56 resources as the npm package — served from Cloudflare's edge (300+ POPs, ~50ms cold start, $0/mo on the free tier at expected traffic).

This is the deployment artefact that lets you submit to **Smithery**, **ChatGPT MCP directory**, and any other client that requires a hosted HTTPS endpoint instead of a local `npx`.

---

## One-time setup

```bash
cd worker

# 1 · Install
npm install

# 2 · Authenticate Cloudflare (opens browser)
npx wrangler login

# 3 · Fill account_id in wrangler.toml — find it at:
#    Cloudflare dashboard → right sidebar → Account ID
```

---

## Local dev

```bash
npm run dev           # generates src/embedded.ts then runs wrangler dev
```

Worker boots on **http://localhost:8787** with hot reload. In a second terminal:

```bash
npm run smoke         # runs the 3-check end-to-end test
# → health · tools/list · walk_playbook cisa wk9
```

---

## Deploy

```bash
npm run deploy        # regenerates embed-data then wrangler deploy
```

First deploy gives you a workers.dev URL — e.g. `https://mcp-regulated-ai-compliance.<your-subdomain>.workers.dev`.

Smoke-test the deployed version:

```bash
npm run smoke -- --url=https://mcp-regulated-ai-compliance.<sub>.workers.dev
```

---

## Custom domain (recommended for Smithery / ChatGPT)

A vanity domain like `mcp.hellouchit.com` is what listings will display. Setup:

1. **Cloudflare dashboard** → Workers & Pages → `mcp-regulated-ai-compliance` → **Settings** → **Domains & Routes** → **Add → Custom Domain**
2. Enter `mcp.hellouchit.com`
3. Cloudflare auto-provisions the cert (~30s) and creates the DNS CNAME automatically (if `hellouchit.com` is on Cloudflare DNS)

Final URL practitioners see:

```
https://mcp.hellouchit.com/mcp        # MCP endpoint
https://mcp.hellouchit.com/health     # uptime check
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare Worker (V8 isolate, ~50ms cold start)            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ src/worker.ts                                         │   │
│  │   fetch(request) →                                    │   │
│  │     WebStandardStreamableHTTPServerTransport          │   │
│  │       .handleRequest(request) → Response              │   │
│  └────────┬─────────────────────────────────────────────┘   │
│           │                                                   │
│  ┌────────▼─────────────────────────────────────────────┐   │
│  │ ../../src/server.ts → buildServer()                   │   │
│  │   registers 6 tools · 4 resource providers · 5 prompts│   │
│  └────────┬─────────────────────────────────────────────┘   │
│           │                                                   │
│  ┌────────▼─────────────────────────────────────────────┐   │
│  │ ../../src/lib/data-source.ts                          │   │
│  │   setDataSource({ dataset, antiPatterns, ... })       │   │
│  └────────┬─────────────────────────────────────────────┘   │
│           │                                                   │
│  ┌────────▼─────────────────────────────────────────────┐   │
│  │ src/embedded.ts (generated at build time)             │   │
│  │   - DATASET_JSON (56 controls × 28 regs × 261 tools)  │   │
│  │   - ANTI_PATTERNS_MD (15 named anti-patterns)         │   │
│  │   - CROSSWALKS_JSON (20-entry crosswalk matrix)       │   │
│  │   - PLAYBOOKS (4 × 12-week playbooks)                 │   │
│  │   ~161KB total, inlined at bundle time                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

No `node:fs`, no `node:http`, no I/O beyond `crypto.randomUUID()` and the HTTP request handling. Everything else is pure data + pure functions.

---

## Why Cloudflare Workers (vs Vercel Edge / Fly.io / Render)

| Option | Cost at v0.2 traffic | Cold start | Custom domain | Compatibility |
|---|---|---|---|---|
| **Cloudflare Workers** | **$0/mo** (100K req/day free) | **~50ms** | Free + auto cert | V8 isolate — needs web-standard SDK variant (✅ this worker uses it) |
| Vercel Edge | $0/mo on Hobby | ~80ms | Free | Same — V8 isolate |
| Fly.io | $0-5/mo | ~500ms (machine wake) | Free | Full Node — could use the same `dist/http.js` as the npm package |
| Render | $0/mo (free tier sleeps after 15min) | ~10s wake from sleep | $0 with workaround | Full Node |

Cloudflare wins for this workload because there's no DB, no long-running work, and 99% of requests will fit inside the free CPU budget. The "needs web-standard SDK" constraint was solved with two extra imports.

---

## What's in scope for v0.2 vs v0.3

**v0.2 (this scaffold):**
- Stateless worker, fetch handler, embedded data, no auth
- Public endpoint — anyone can call
- 100K req/day free tier; rate-limiting via Cloudflare rules if needed later

**v0.3 candidates:**
- API-key auth for premium-tier (open tier 60 rpm, signed tier unlimited)
- Worker observability → R2 logs → analytics on which tools are most-called
- Optional HMAC signing of responses for tamper-evident audit consumption
- Per-tool latency SLO + Workers AI usage if any tool needs an LLM call
