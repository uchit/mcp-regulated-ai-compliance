# Glama-compatible Dockerfile for mcp-regulated-ai-compliance.
#
# Glama's verification harness spawns the container and sends an MCP
# `initialize` + `tools/list` request over stdio. The server must boot
# and respond on stdout/stdin — no external network calls, no secrets.
#
# This server is pure-data (dataset.json + crosswalks + anti-patterns
# all bundled at build time), so it satisfies Glama's introspection
# requirements out of the box.

FROM node:22-alpine AS build

WORKDIR /app

# Install deps separately so layer cache survives source edits
COPY package.json package-lock.json* tsconfig.json ./
RUN npm ci --include=dev

# Build
COPY src ./src
RUN npm run build

# Strip dev deps for runtime
RUN npm prune --omit=dev

# ─── Runtime image ───────────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Non-root user (Glama best practice)
RUN addgroup -S mcp && adduser -S mcp -G mcp

COPY --from=build --chown=mcp:mcp /app/node_modules ./node_modules
COPY --from=build --chown=mcp:mcp /app/dist ./dist
COPY --chown=mcp:mcp package.json ./

USER mcp

# stdio transport — Glama pipes JSON-RPC in/out
ENTRYPOINT ["node", "dist/index.js"]
