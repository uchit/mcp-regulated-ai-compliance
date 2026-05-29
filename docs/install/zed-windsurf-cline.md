# Install — Zed · Windsurf · Cline · Continue

All four clients accept the same `stdio` MCP server configuration. Add the server in each client's settings UI or config file.

## Zed

`~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "regulated-ai-compliance": {
      "command": "npx",
      "args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]
    }
  }
}
```

Restart Zed → the tool appears in the assistant panel.

## Windsurf

Windsurf Settings → MCP → **Add Server** → `stdio` → `npx -y @hellouchit/mcp-regulated-ai-compliance`.

## Cline (VS Code extension)

Cline → Settings (gear icon) → **MCP Servers** → **+** →

```json
{
  "regulated-ai-compliance": {
    "command": "npx",
    "args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]
  }
}
```

## Continue (VS Code / JetBrains)

`~/.continue/config.json`:

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]
        }
      }
    ]
  }
}
```

## OpenAI ChatGPT (via MCP support, when enabled on your account)

In ChatGPT settings → **Connectors** → **Add MCP server** → URL/command-line input → `npx -y @hellouchit/mcp-regulated-ai-compliance`.

ChatGPT MCP support rolled out to Plus + Pro users through 2026. If you don't see the option, you're on a tier or region that doesn't have it yet.

## Common verification step

After install, test with this prompt in any of the above clients:

> *"List all available tools from the regulated-ai-compliance MCP server."*

You should see `lookup_control` (v0.1; more tools added in later releases).
