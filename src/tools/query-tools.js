import dbService from "../services/db-service.js";
import config from "../config.js";

export const queryTools = [
  {
    name: "execute_query",
    description: "특정 데이터베이스에서 쿼리 실행 (안전 모드 적용)",
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
        database_name: {
          type: "string",
          description: `실행할 데이터베이스 이름 (선택적, 기본값: ${config.defaultDatabase})`,
        },
      },
      required: ["query"],
    },
    handler: async ({ query, params = [], database_name }) => {
      const rows = await dbService.executeQuery(query, params, database_name);
      const dbName = database_name || config.defaultDatabase;
      let message = "";

      // 행 수 제한
      if (rows.length > config.safety.maxRows) {
        message = `결과가 ${config.safety.maxRows}개로 제한되었습니다. (전체: ${rows.length}개)`;
        return {
          data: rows.slice(0, config.safety.maxRows),
          count: config.safety.maxRows,
          message,
          database: dbName,
        };
      }

      return { 
        data: rows, 
        count: rows.length, 
        message: "쿼리 성공",
        database: dbName,
      };
    },
  },

  {
    name: "list_tables",
    description: "특정 데이터베이스의 테이블 목록 조회",
    inputSchema: {
      type: "object",
      properties: {
        database_name: {
          type: "string",
          description: `조회할 데이터베이스 이름 (선택적, 기본값: ${config.defaultDatabase})`,
        },
      },
    },
    handler: async ({ database_name }) => {
      const dbName = database_name || config.defaultDatabase;
      const { type } = dbService.getPool(dbName);
      
      let query;
      if (type === "mysql") {
        query = "SHOW TABLES";
      } else if (type === "postgresql") {
        query = "SELECT tablename FROM pg_tables WHERE schemaname = 'public'";
      }

      const rows = await dbService.executeQuery(query, [], database_name);
      
      return { 
        data: rows, 
        count: rows.length, 
        message: `테이블 목록 조회 성공 (${type})`,
        database: dbName,
      };
    },
  },

  {
    name: "describe_table",
    description: "특정 데이터베이스의 테이블 구조 조회",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "테이블명",
        },
        database_name: {
          type: "string",
          description: `조회할 데이터베이스 이름 (선택적, 기본값: ${config.defaultDatabase})`,
        },
      },
      required: ["table"],
    },
    handler: async ({ table, database_name }) => {
      const dbName = database_name || config.defaultDatabase;
      const { type } = dbService.getPool(dbName);
      
      let query;
      let params;
      
      if (type === "mysql") {
        query = "DESCRIBE ??";
        params = [table];
      } else if (type === "postgresql") {
        query = `
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `;
        params = [table];
      }

      const rows = await dbService.executeQuery(query, params, database_name);
      
      return { 
        data: rows, 
        count: rows.length, 
        message: `테이블 '${table}' 구조 조회 성공 (${type})`,
        database: dbName,
        table: table,
      };
    },
  },

  {
    name: "list_databases",
    description: "설정된 모든 데이터베이스 목록 조회",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const databases = dbService.getAvailableDatabases();
      
      return { 
        data: databases, 
        count: databases.length, 
        message: "데이터베이스 목록 조회 성공",
      };
    },
  },

  {
    name: "get_database_info",
    description: "특정 데이터베이스의 상세 정보 조회",
    inputSchema: {
      type: "object",
      properties: {
        database_name: {
          type: "string",
          description: "조회할 데이터베이스 이름",
        },
      },
      required: ["database_name"],
    },
    handler: async ({ database_name }) => {
      const dbInfo = dbService.getDatabaseInfo(database_name);
      
      return { 
        data: dbInfo, 
        count: 1, 
        message: `데이터베이스 '${database_name}' 정보 조회 성공`,
      };
    },
  },
];
