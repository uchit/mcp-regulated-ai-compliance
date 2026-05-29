# Install — Cursor

## Prerequisites

- Cursor 0.42+ (MCP support)
- Node.js 20+

## Add the server

Open Cursor → **Cursor Settings** → **Features** → **Model Context Protocol** → **+ Add new MCP server**.

| Field | Value |
|---|---|
| Name | `regulated-ai-compliance` |
| Type | `stdio` |
| Command | `npx -y @hellouchit/mcp-regulated-ai-compliance` |

Or directly edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "regulated-ai-compliance": {
      "command": "npx",
      "args": ["-y", "@hellouchit/mcp-regulated-ai-compliance"]
    }
  }
}
```

## Verify

Open Cursor's **Composer** (Cmd/Ctrl+K) and type:

> *"Look up controls for SLSA Build L3 in CI/CD context using the regulated-ai-compliance MCP server."*

You should see Cursor surface the tool call, execute it, and return formatted results.

## In-editor use case

Where this matters most: when Cursor is writing CI/CD code (`.github/workflows/`, `Dockerfile`, `terraform/`) and you want it to apply the right SLSA / SSDF / NIST AI RMF controls. Pre-load the server and Cursor's pair-programmer can look up the right pattern inline.

Example prompt while editing a GitHub Actions workflow:

> *"This pipeline builds a container image we'll ship to production. Look up the controls for SLSA Build L3 in CI/CD, then suggest what's missing from the workflow."*
