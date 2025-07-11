// src/index.js - MCP 호환 강화 버전
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// MCP 서버 초기화 전에 stdout 보호
const originalLog = console.log;
const originalWrite = process.stdout.write;

// stdout을 임시로 null로 리다이렉트 (의존성 로딩 중)
process.stdout.write = () => {};
console.log = () => {};

// 설정 및 도구 로드 (이 시점에서 stdout 출력 차단)
const { environmentTools } = await import("./tools/environment-tools.js");
const { queryTools } = await import("./tools/query-tools.js");
const { maintenanceTools } = await import("./tools/maintenance-tools.js");

// stdout 복원 (MCP JSON 통신용)
process.stdout.write = originalWrite;
console.log = originalLog;

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
const allTools = [...environmentTools, ...queryTools, ...maintenanceTools];

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

// 성공 메시지는 stderr로 출력 (디버깅용)
console.error("Database MCP server started successfully");
