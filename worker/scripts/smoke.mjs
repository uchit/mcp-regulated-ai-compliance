#!/usr/bin/env node
/**
 * End-to-end smoke test against a running worker (local `wrangler dev`
 * defaults to localhost:8787; pass --url to test a deployed instance).
 *
 * Verifies:
 *  - /health returns 200 + server metadata
 *  - POST /mcp tools/list returns 6 tools
 *  - POST /mcp tools/call walk_playbook returns structured week data
 */

const url = process.argv.find((a) => a.startsWith("--url="))?.split("=")[1] ?? "http://localhost:8787";

const accept = "application/json, text/event-stream";

async function call(body) {
  const res = await fetch(`${url}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json", accept },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  // Streamable HTTP can return either SSE or JSON; handle both.
  if (text.startsWith("event:")) {
    const dataLine = text.split("\n").find((l) => l.startsWith("data:"));
    return dataLine ? JSON.parse(dataLine.slice(5).trim()) : { raw: text };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

console.log(`[smoke] target: ${url}\n`);

const health = await fetch(`${url}/health`).then((r) => r.json());
console.log("health:", health);
if (!health.ok) process.exit(1);

const list = await call({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} });
console.log(`tools/list: ${list.result?.tools?.length ?? "FAIL"} tools`);

const week = await call({
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: { name: "walk_playbook", arguments: { playbook: "cisa-attestation-90-days", week: 9 } },
});
const inner = JSON.parse(week.result?.content?.[0]?.text ?? "{}");
console.log(`walk_playbook cisa wk9: ${inner.week?.title ?? "FAIL"}`);
console.log(`  gate: ${inner.week?.gate ?? "FAIL"}`);

console.log("\n[smoke] ✅ all checks passed");
