#!/usr/bin/env node
/**
 * mcp-regulated-ai-compliance — entry point
 *
 * MCP server exposing regulated-industry AI compliance knowledge as
 * tools, resources, and prompts. Uses stdio transport so the install
 * path is `npx -y @hellouchit/mcp-regulated-ai-compliance`.
 *
 * Built by Uchit Vyas (https://hellouchit.com). Apache 2.0.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

// Tools
import { classifyUseCaseHandler, classifyUseCaseTool } from "./tools/classify-use-case.js";
import { crosswalkHandler, crosswalkTool } from "./tools/crosswalk.js";
import { getAntiPatternHandler, getAntiPatternTool } from "./tools/get-anti-pattern.js";
import { listRegulationsHandler, listRegulationsTool } from "./tools/list-regulations.js";
import { lookupControlHandler, lookupControlTool } from "./tools/lookup-control.js";
import { walkPlaybookHandler, walkPlaybookTool } from "./tools/walk-playbook.js";

// Resources
import { antiPatternResources } from "./resources/anti-patterns.js";
import { crosswalkResources } from "./resources/crosswalks.js";
import { datasetResources } from "./resources/dataset.js";
import { playbookResources } from "./resources/playbooks.js";

// Prompts
import { prompts, promptsByName } from "./prompts/index.js";

// ─────────────────────────────────────────────────────────────────────
// Server
// ─────────────────────────────────────────────────────────────────────

const server = new Server(
  { name: "mcp-regulated-ai-compliance", version: "0.1.0" },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);

// ─────────────────────────────────────────────────────────────────────
// Tools (6)
// ─────────────────────────────────────────────────────────────────────

const tools = [
  lookupControlTool,
  getAntiPatternTool,
  crosswalkTool,
  walkPlaybookTool,
  classifyUseCaseTool,
  listRegulationsTool,
];

const toolHandlers: Record<string, (input: unknown) => Promise<unknown>> = {
  lookup_control: lookupControlHandler,
  get_anti_pattern: getAntiPatternHandler,
  crosswalk: crosswalkHandler,
  walk_playbook: walkPlaybookHandler,
  classify_use_case: classifyUseCaseHandler,
  list_regulations: listRegulationsHandler,
};

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
    return { isError: true, content: [{ type: "text", text: `Unknown tool: ${name}` }] };
  }
  try {
    const result = await handler(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { isError: true, content: [{ type: "text", text: `Tool '${name}' failed: ${msg}` }] };
  }
});

// ─────────────────────────────────────────────────────────────────────
// Resources (4 providers)
// ─────────────────────────────────────────────────────────────────────

const resourceProviders = [
  datasetResources,
  antiPatternResources,
  playbookResources,
  crosswalkResources,
];

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: resourceProviders.flatMap(p => p.list()),
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  for (const provider of resourceProviders) {
    const result = provider.read(uri);
    if (result) {
      return { contents: [result] };
    }
  }
  throw new Error(`Resource not found: ${uri}`);
});

// ─────────────────────────────────────────────────────────────────────
// Prompts (5)
// ─────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: prompts.map(p => ({
    name: p.name,
    description: p.description,
    arguments: p.arguments,
  })),
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tpl = promptsByName.get(name);
  if (!tpl) throw new Error(`Unknown prompt: ${name}`);
  return tpl.build((args as Record<string, string>) ?? {});
});

// ─────────────────────────────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const resourceCount = resourceProviders.flatMap(p => p.list()).length;
  console.error(
    `[mcp-regulated-ai-compliance] v0.1.0 ready on stdio · ${tools.length} tools · ${resourceCount} resources · ${prompts.length} prompts`
  );
}

main().catch((err: unknown) => {
  console.error("[mcp-regulated-ai-compliance] fatal:", err);
  process.exit(1);
});
