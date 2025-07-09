import config from "../config.js";
import dbService from "../services/db-service.js";

// 환경 및 DB 상태 관련 도구들
export const environmentTools = [
  {
    name: "switch_environment",
    description: "DB 환경 전환 (local/test)",
    inputSchema: {
      type: "object",
      properties: {
        environment: {
          type: "string",
          enum: ["local", "test"],
          description: "전환할 환경",
        },
      },
      required: ["environment"],
    },
    handler: async ({ environment }) => {
      if (environment === "production") {
        throw new Error("프로덕션 환경은 접근 불가");
      }
      
      const oldEnv = process.env.NODE_ENV || "local";
      process.env.NODE_ENV = environment;
      
      return {
        data: {
          previousEnvironment: oldEnv,
          currentEnvironment: environment,
          allowedOperations: config.restrictions[environment].allowedOperations,
          readOnly: config.restrictions[environment].readOnly,
        },
        count: 1,
        message: `환경이 ${oldEnv}에서 ${environment}로 전환되었습니다.`,
      };
    },
  },

  {
    name: "get_current_environment",
    description: "현재 DB 환경 및 설정 확인",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      const currentEnv = config.environment;
      const restrictions = config.restrictions[currentEnv];
      
      return {
        data: {
          environment: currentEnv,
          defaultDatabase: config.defaultDatabase,
          totalDatabases: config.databases.size,
          allowedOperations: restrictions.allowedOperations,
          readOnly: restrictions.readOnly,
          safetySettings: config.safety,
        },
        count: 1,
        message: `현재 환경: ${currentEnv}`,
      };
    },
  },

  {
    name: "check_db_connections",
    description: "모든 데이터베이스 연결 상태 확인",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      await dbService.initialize(); // 연결 초기화
      const databases = dbService.getAvailableDatabases();
      
      const connectionStatus = databases.map(db => ({
        name: db.name,
        type: db.type,
        host: db.host,
        port: db.port,
        database: db.database,
        isConnected: db.isConnected,
        isDefault: db.isDefault,
        status: db.isConnected ? "연결됨" : "연결 실패"
      }));

      const connectedCount = connectionStatus.filter(db => db.isConnected).length;
      
      return {
        data: connectionStatus,
        count: connectionStatus.length,
        message: `총 ${connectionStatus.length}개 DB 중 ${connectedCount}개 연결 성공`,
      };
    },
  },

  {
    name: "get_db_statistics",
    description: "데이터베이스별 간단한 통계 정보 조회",
    inputSchema: {
      type: "object",
      properties: {
        database_name: {
          type: "string",
          description: `통계를 조회할 데이터베이스 이름 (선택적, 기본값: ${config.defaultDatabase})`,
        },
      },
    },
    handler: async ({ database_name }) => {
      const dbName = database_name || config.defaultDatabase;
      const { type } = dbService.getPool(dbName);
      
      let query;
      if (type === "mysql") {
        query = `
          SELECT 
            COUNT(*) as table_count
          FROM information_schema.tables 
          WHERE table_schema = DATABASE()
        `;
      } else if (type === "postgresql") {
        query = `
          SELECT 
            COUNT(*) as table_count
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `;
      }

      const result = await dbService.executeQuery(query, [], database_name);
      const tableCount = result[0].table_count || result[0].count;

      return {
        data: {
          database: dbName,
          type: type,
          tableCount: parseInt(tableCount),
          connectionStatus: "활성",
        },
        count: 1,
        message: `데이터베이스 '${dbName}' 통계 조회 성공`,
      };
    },
  },
];
