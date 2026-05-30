/**
 * Cloudflare Worker entrypoint — Streamable HTTP transport over Web Fetch.
 *
 * Reuses the parent npm package's server-builder (buildServer) and pure
 * data-source abstraction (setDataSource). The only worker-specific
 * surface is this file + the embedded data constants + the fetch handler.
 *
 * Deployment:
 *   npm run build && npx wrangler deploy
 *
 * Local development:
 *   npm run dev          # wrangler dev → http://localhost:8787/mcp
 */

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { setDataSource } from "../../src/lib/data-source.js";
import { SERVER_NAME, SERVER_VERSION, buildServer } from "../../src/server.js";
import {
  ANTI_PATTERNS_MD,
  CROSSWALKS_JSON,
  DATASET_JSON,
  PLAYBOOKS,
} from "./embedded.js";

interface Env {
  MCP_STATEFUL?: string;
}

// One-time global init — modules are evaluated once per isolate, so this
// runs once per cold start and stays warm across requests. The DataSource
// shim points at the embedded constants; the buildServer-ready capability
// summary is computed once and cached for the /health response.
setDataSource({
  dataset: () => DATASET_JSON,
  antiPatterns: () => ANTI_PATTERNS_MD,
  crosswalks: () => CROSSWALKS_JSON,
  playbooks: () => PLAYBOOKS,
});

const _capabilitySummary = buildServer().summary;

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const stateful = env.MCP_STATEFUL === "true";

    // Health endpoint — useful for uptime monitoring, Cloudflare healthchecks,
    // and a quick "is the server alive" sanity URL practitioners can curl.
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return Response.json(
        {
          ok: true,
          name: SERVER_NAME,
          version: SERVER_VERSION,
          transport: "streamable-http",
          mode: stateful ? "stateful" : "stateless",
          endpoint: "/mcp",
          tools: _capabilitySummary.toolCount,
          resources: _capabilitySummary.resourceCount,
          prompts: _capabilitySummary.promptCount,
          docs: "https://github.com/uchit/mcp-regulated-ai-compliance",
          author: "https://hellouchit.com",
        },
        { headers: { "cache-control": "public, max-age=60" } }
      );
    }

    // MCP endpoint — POST for JSON-RPC, GET for SSE long-poll.
    //
    // Per the SDK contract, a stateless transport (sessionIdGenerator
    // undefined) cannot be reused across requests — each request gets
    // a fresh server + transport. buildServer is pure handler-registration
    // (~ a few µs); the dataset is parsed once on first call thanks to
    // module-level caching in retrieval.ts.
    if (url.pathname === "/mcp") {
      try {
        const { server } = buildServer();
        const transport = new WebStandardStreamableHTTPServerTransport(
          stateful
            ? { sessionIdGenerator: () => crypto.randomUUID() }
            : { sessionIdGenerator: undefined }
        );
        await server.connect(transport);
        return await transport.handleRequest(request);
      } catch (err) {
        return Response.json(
          {
            jsonrpc: "2.0",
            error: {
              code: -32603,
              message: "Internal error",
              data: err instanceof Error ? err.message : String(err),
            },
            id: null,
          },
          { status: 500 }
        );
      }
    }

    return Response.json(
      { error: "Not Found", hint: "MCP endpoint is /mcp · health at /" },
      { status: 404 }
    );
  },
} satisfies ExportedHandler<Env>;
