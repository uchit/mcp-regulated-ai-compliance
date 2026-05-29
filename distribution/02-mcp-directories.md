# MCP directory submissions

Three secondary directories. Submit to all three (~5 min total).

---

## A · mcp.so

**URL:** https://mcp.so/submit (or PR to https://github.com/chatmcp/mcp-directory)
**Method:** Web form OR repo PR

**Fields:**

| Field | Value |
|---|---|
| Name | `Regulated AI Compliance` |
| Slug | `regulated-ai-compliance` |
| Description (short) | `EU AI Act · APRA · NIST AI RMF · ISO 42001 · AU AI Safety — 6 tools, 53 resources, 5 prompts. Grounded compliance citations for any MCP client.` |
| GitHub URL | `https://github.com/uchit/mcp-regulated-ai-compliance` |
| npm package | `@hellouchit/mcp-regulated-ai-compliance` |
| Author | `Uchit Vyas` |
| Author URL | `https://hellouchit.com` |
| License | `Apache-2.0` |
| Category | `Knowledge / Reference` (or `Compliance` if present) |
| Tags | `compliance`, `eu-ai-act`, `apra`, `nist`, `iso-42001`, `regulated-industries`, `governance` |
| Install command | `npx -y @hellouchit/mcp-regulated-ai-compliance` |

---

## B · pulsemcp.com

**URL:** https://www.pulsemcp.com/submit
**Method:** Web form

**Same fields as mcp.so above.** Plus:

| Extra field | Value |
|---|---|
| Transport | `stdio` |
| Tools list | `lookup_control, get_anti_pattern, crosswalk, walk_playbook, classify_use_case, list_regulations` |
| Example use case | `"Classify a recruitment AI use case under EU AI Act Annex III and surface the corresponding APRA expectations."` |

---

## C · smithery.ai

**URL:** https://smithery.ai/new
**Method:** Connects to GitHub repo; auto-pulls README + `package.json`.

**Steps:**

1. Sign in with GitHub
2. **Add Server** → paste `uchit/mcp-regulated-ai-compliance`
3. Smithery scans the repo + offers to host the stdio server behind their HTTP gateway (optional — say yes; gives you a hosted URL practitioners can use without installing)
4. Add the same tags as above
5. Submit

Smithery generates an auto-install one-liner for Claude Desktop, Cursor, etc. — that one-liner is what most practitioners will copy. Worth the extra 90 seconds.

---

## Expected timelines

| Directory | Approval typically |
|---|---|
| modelcontextprotocol/servers PR | 3-10 days (Anthropic team review) |
| mcp.so | < 24 hours (auto) |
| pulsemcp.com | 1-3 days |
| smithery.ai | < 1 hour (auto) |
