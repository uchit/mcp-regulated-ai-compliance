#!/usr/bin/env node
/**
 * Streamable HTTP entrypoint — used by hosted clients (Smithery, ChatGPT
 * MCP directory, browser-based clients, agent platforms that prefer HTTP
 * over stdio).
 *
 * Speaks the 2025-11-25 MCP Streamable HTTP transport spec via the SDK's
 * StreamableHTTPServerTransport. Stateless mode by default (every request
 * gets its own session) — appropriate for read-only knowledge servers
 * like this one. For stateful workloads, set MCP_STATEFUL=true.
 *
 * Configuration via env vars:
 *   PORT          — bind port (default 3000)
 *   HOST          — bind host (default 0.0.0.0)
 *   MCP_PATH      — MCP endpoint path (default /mcp)
 *   MCP_STATEFUL  — "true" for per-session UUIDs (default unset = stateless)
 */

import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { setDataSource } from "./lib/data-source.js";
import { nodeDataSource } from "./lib/node-data-source.js";
import { SERVER_NAME, SERVER_VERSION, buildServer } from "./server.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const MCP_PATH = process.env.MCP_PATH ?? "/mcp";
const STATEFUL = process.env.MCP_STATEFUL === "true";

async function main() {
  setDataSource(nodeDataSource);
  const { server, summary } = buildServer();

  const transport = new StreamableHTTPServerTransport(
    STATEFUL ? { sessionIdGenerator: () => randomUUID() } : { sessionIdGenerator: undefined }
  );
  await server.connect(transport);

  const httpServer = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "/";

    // Health check — useful for hosted-platform probes (Cloudflare, Fly, k8s)
    if (req.method === "GET" && (url === "/" || url === "/health")) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        ok: true,
        name: SERVER_NAME,
        version: SERVER_VERSION,
        transport: "streamable-http",
        mode: STATEFUL ? "stateful" : "stateless",
        endpoint: MCP_PATH,
        tools: summary.toolCount,
        resources: summary.resourceCount,
        prompts: summary.promptCount,
      }, null, 2));
      return;
    }

    // MCP endpoint
    if (url === MCP_PATH || url.startsWith(`${MCP_PATH}?`)) {
      try {
        // Buffer the body for POST so the SDK can re-read JSON-RPC payloads
        const parsedBody = req.method === "POST" ? await readJson(req) : undefined;
        await transport.handleRequest(req, res, parsedBody);
      } catch (err) {
        if (!res.headersSent) {
          res.writeHead(500, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
        } else {
          res.end();
        }
      }
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found", hint: `MCP endpoint is ${MCP_PATH}` }));
  });

  httpServer.listen(PORT, HOST, () => {
    console.error(
      `[${SERVER_NAME}] v${SERVER_VERSION} ready on http://${HOST}:${PORT}${MCP_PATH} (${STATEFUL ? "stateful" : "stateless"}) · ${summary.toolCount} tools · ${summary.resourceCount} resources · ${summary.promptCount} prompts`
    );
  });

  // Graceful shutdown for container orchestrators
  const shutdown = (signal: string) => {
    console.error(`[${SERVER_NAME}] received ${signal}, closing...`);
    httpServer.close(() => process.exit(0));
    // Force-exit after 10s if connections hang
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
  }
  if (chunks.length === 0) return undefined;
  const body = Buffer.concat(chunks).toString("utf-8");
  try {
    return JSON.parse(body);
  } catch {
    // Let the transport return a JSON-RPC parse error
    return body;
  }
}

main().catch((err: unknown) => {
  console.error(`[${SERVER_NAME}] fatal:`, err);
  process.exit(1);
});
