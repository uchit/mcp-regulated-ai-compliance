# Install — Claude Desktop

## Prerequisites

- Claude Desktop (macOS, Windows, or Linux)
- Node.js 20+ installed locally (`node --version` to check)
- Claude Pro / Team / Enterprise account

## Add the server

Edit your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

If the file doesn't exist, create it. Add or extend the `mcpServers` block:

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

Already have other MCP servers? Add this as another key inside the existing `mcpServers` object.

## Restart Claude Desktop

Fully quit (Cmd+Q on macOS, not just close window) and reopen.

## Verify

In a new conversation, click the **🔌 connector icon** (bottom of input box). You should see:

- **regulated-ai-compliance** in the connected servers list
- 1 tool available: `lookup_control` (v0.1) — more in later versions

Try this prompt:

> *"Using the regulated-ai-compliance server, look up controls for APRA CPS 234 in the Identity & access category."*

You should see Claude call `lookup_control` and return matching rows from the dataset, with `source_url` links back to hellouchit.com.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Server not in connector list | Check JSON syntax in config file; restart Claude Desktop |
| "Command not found: npx" | Install Node.js 20+ from nodejs.org; `npx` ships with it |
| Tools error out | Check `~/Library/Logs/Claude/mcp*.log` for stack traces |
| Want to debug locally | Clone the repo + `npm install && npm run build && npm run dev`; use the local path in config: `"command": "node", "args": ["/path/to/mcp-regulated-ai-compliance/dist/index.js"]` |

## Update

`npx -y` always fetches the latest published version. To pin a specific version:

```json
"args": ["-y", "@hellouchit/mcp-regulated-ai-compliance@0.1.0"]
```

New releases are announced at hellouchit.com/letters.
