# Distribution sprint — v0.2.1

Updated 2026-05-30 — server is now fully shipped on all canonical surfaces. Remaining work is pure announcement.

## Shipped (no further action needed)

| Channel | Status |
|---|---|
| npm `@hellouchit/mcp-regulated-ai-compliance@0.2.1` | ✅ Live with provenance |
| Official MCP Registry `io.github.uchit/mcp-regulated-ai-compliance@0.2.1` | ✅ isLatest |
| Glama `glama.ai/mcp/servers/uchit/mcp-regulated-ai-compliance` | ✅ Verified |
| Smithery `smithery.ai/server/@uchit86/regulated-ai-compliance` | ✅ Verified |
| **Hosted endpoint** `https://mcp.hellouchit.com/mcp` | ✅ Cloudflare Worker, cert auto-provisioned |
| Claude Desktop local install (via npx) | ✅ Tested |

## Pending (out of our hands)

| Channel | Status |
|---|---|
| mcp.so | ⏳ Awaiting review (typically <24h) |
| PulseMCP | ⏳ Daily auto-pull from Official Registry |
| awesome-mcp-servers PR #7084 | ⏳ Awaiting punkpeye merge |
| ChatGPT MCP directory | 🔜 When their submission opens |

## Announcement window (you do, when ready)

| Action | Best window | File |
|---|---|---|
| LinkedIn post | Tue 2026-06-02 OR Wed 2026-06-03, 7:30am AEST | `03-linkedin-post.md` |
| X / Twitter cross-post | 5 min after LinkedIn lands | (in `03-linkedin-post.md`) |
| Show HN | Wed 2026-06-03 to Fri 2026-06-05, 1-3am AEST | `04-show-hn.md` |
| Substack: "How I'd ground a coding assistant in EU AI Act" | Day +5 | (next sprint draft) |

## Success metrics — 7-day window after announcement

| Metric | Source | Target | Stretch |
|---|---|---|---|
| GitHub stars | Repo Insights → Traffic | +30 | +100 |
| npm weekly downloads | `npm view @hellouchit/mcp-regulated-ai-compliance` | +50 | +200 |
| Smithery installs | Smithery dashboard | +10 | +50 |
| **Hosted endpoint hits** | Cloudflare Worker analytics | +500 | +5000 |
| LinkedIn post impressions | LinkedIn analytics | 8K | 25K |
| Inbound qualified DMs | LinkedIn DMs / GitHub Issues | 5 | 15 |
| hellouchit.com outbound clicks (source_url) | GA4 → outbound_click | +50 | +200 |

The last metric is the actual ROI of the MCP server — every tool response embeds a `source_url` back to your dataset, anti-patterns, or playbooks. Each click = an AI agent in someone's IDE that footnoted your work.
