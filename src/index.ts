#!/usr/bin/env node
/**
 * stdio entrypoint — used by Claude Desktop, Cursor, Zed, Continue, Cline,
 * and every other client that speaks MCP over stdin/stdout.
 *
 * For Streamable HTTP transport (hosted clients · Smithery · ChatGPT MCP
 * directory), see src/http.ts.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_NAME, SERVER_VERSION, buildServer } from "./server.js";

async function main() {
  const { server, summary } = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `[${SERVER_NAME}] v${SERVER_VERSION} ready on stdio · ${summary.toolCount} tools · ${summary.resourceCount} resources · ${summary.promptCount} prompts`
  );
}

main().catch((err: unknown) => {
  console.error(`[${SERVER_NAME}] fatal:`, err);
  process.exit(1);
});
