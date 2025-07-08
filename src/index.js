// src/index.js
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { environmentTools } from "./tools/environment-tools.js";
import { queryTools } from "./tools/query-tools.js";

const server = new Server(
  {
    name: "database-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 모든 도구 통합
const allTools = [...environmentTools, ...queryTools];

// 도구 목록 제공
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  })),
}));

// 도구 실행
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const tool = allTools.find((t) => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    const result = await tool.handler(args);

    return {
      toolResult: {
        content: [
          {
            type: "text",
            text:
              typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2),
          },
        ],
      },
    };
  } catch (error) {
    return {
      toolResult: {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      },
    };
  }
});

// 서버 시작
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Database MCP server started");
