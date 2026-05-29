/**
 * MCP Server factory.
 *
 * Builds a configured Server instance with all 6 tools, 4 resource
 * providers, and 5 prompts registered — but does NOT bind a transport.
 * Transport binding happens in src/index.ts (stdio) or src/http.ts
 * (Streamable HTTP).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
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

export const SERVER_NAME = "mcp-regulated-ai-compliance";
export const SERVER_VERSION = "0.2.1";

export interface ServerBuildSummary {
  toolCount: number;
  resourceCount: number;
  promptCount: number;
}

export function buildServer(): { server: Server; summary: ServerBuildSummary } {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );

  // ── Tools ────────────────────────────────────────────────────────
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

  // ── Resources ────────────────────────────────────────────────────
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

  // ── Prompts ──────────────────────────────────────────────────────
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

  return {
    server,
    summary: {
      toolCount: tools.length,
      resourceCount: resourceProviders.flatMap(p => p.list()).length,
      promptCount: prompts.length,
    },
  };
}
