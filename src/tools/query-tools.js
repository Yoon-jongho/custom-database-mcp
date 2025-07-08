import dbService from "../services/db-service.js";
import config from "../config.js";

export const queryTools = [
  {
    name: "execute_query",
    description: "쿼리 실행 (안전 모드 적용)",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "SQL 쿼리",
        },
        params: {
          type: "array",
          description: "쿼리 파라미터 (prepared statement)",
          items: {
            type: "string",
          },
        },
      },
      required: ["query"],
    },
    handler: async ({ query, params = [] }) => {
      const rows = await dbService.executeQuery(query, params);
      let message = "";

      // 행 수 제한
      if (rows.length > config.safety.maxRows) {
        message = `결과가 ${config.safety.maxRows}개로 제한되었습니다. (전체: ${rows.length}개)`;
        return {
          data: rows.slice(0, config.safety.maxRows),
          count: config.safety.maxRows,
          message,
        };
      }

      return { data: rows, count: rows.length, message: "쿼리 성공" };
    },
  },

  {
    name: "list_tables",
    description: "현재 데이터베이스의 테이블 목록 조회",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const rows = await dbService.executeQuery("SHOW TABLES");
      return { data: rows, count: rows.length, message: "테이블 목록 조회 성공" };
    },
  },

  {
    name: "describe_table",
    description: "테이블 구조 조회",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "테이블명",
        },
      },
      required: ["table"],
    },
    handler: async ({ table }) => {
      const rows = await dbService.executeQuery("DESCRIBE ??", [table]);
      return { data: rows, count: rows.length, message: `테이블 '${table}' 구조 조회 성공` };
    },
  },
];
