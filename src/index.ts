#!/usr/bin/env node
/**
 * mcp-regulated-ai-compliance — entry point
 *
 * MCP server exposing regulated-industry AI compliance knowledge as
 * tools, resources, and prompts. Uses stdio transport (v0.1) so the
 * install path is `npx -y @hellouchit/mcp-regulated-ai-compliance`.
 *
 * Built by Uchit Vyas (https://hellouchit.com). MIT.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  lookupControlHandler,
  lookupControlTool,
} from "./tools/lookup-control.js";

// ─────────────────────────────────────────────────────────────────────
// Server identity
// ─────────────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: "mcp-regulated-ai-compliance",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      // resources + prompts capabilities will be added in Phase 3
    },
  }
);

// ─────────────────────────────────────────────────────────────────────
// Tool registry
// ─────────────────────────────────────────────────────────────────────

const tools = [lookupControlTool];

const toolHandlers: Record<string, (input: unknown) => Promise<unknown>> = {
  lookup_control: lookupControlHandler,
};

// ─────────────────────────────────────────────────────────────────────
// Protocol handlers
// ─────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.inputSchema, { target: "openApi3" }),
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const handler = toolHandlers[name];

  if (!handler) {
    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
    };
  }

  try {
    const result = await handler(args);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Tool '${name}' failed: ${message}`,
        },
      ],
    };
  }
});

// ─────────────────────────────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio: stderr is fine for logs; stdout is reserved for MCP protocol
  console.error("[mcp-regulated-ai-compliance] v0.1.0 ready on stdio");
}

main().catch((err: unknown) => {
  console.error("[mcp-regulated-ai-compliance] fatal:", err);
  process.exit(1);
});
