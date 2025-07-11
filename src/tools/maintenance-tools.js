import dbService from "../services/db-service.js";
import config from "../config.js";

export const maintenanceTools = [
  {
    name: "reset_auto_increment",
    description: "테이블의 AUTO_INCREMENT 값을 지정된 값으로 리셋 (local/test 환경에서만 허용)",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "AUTO_INCREMENT를 리셋할 테이블명",
        },
        start_value: {
          type: "number",
          description: "시작할 AUTO_INCREMENT 값 (기본값: 1)",
          default: 1,
        },
        database_name: {
          type: "string",
          description: `대상 데이터베이스 이름 (선택적, 기본값: ${config.defaultDatabase})`,
        },
      },
      required: ["table"],
    },
    handler: async ({ table, start_value = 1, database_name }) => {
      const dbName = database_name || config.defaultDatabase;
      
      // 🔒 환경 제한 확인
      if (config.environment === "production") {
        throw new Error("❌ 프로덕션 환경에서는 AUTO_INCREMENT 리셋이 금지됩니다.");
      }

      // 🔒 안전 설정 확인  
      if (!config.safety.enableMaintenanceOps) {
        throw new Error("❌ 유지보수 작업이 비활성화되어 있습니다. ENABLE_MAINTENANCE_OPS=true 설정이 필요합니다.");
      }

      const { type } = dbService.getPool(dbName);
      
      // 📋 1단계: 테이블 존재 여부 확인
      let checkQuery;
      let checkParams;
      
      if (type === "mysql") {
        checkQuery = "SHOW TABLES LIKE ?";
        checkParams = [table];
      } else if (type === "postgresql") {
        checkQuery = "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = $1";
        checkParams = [table];
      }

      const tableExists = await dbService.executeQuery(checkQuery, checkParams, database_name);
      
      if (tableExists.length === 0) {
        throw new Error(`❌ 테이블 '${table}'이 데이터베이스 '${dbName}'에 존재하지 않습니다.`);
      }

      // 🔧 2단계: AUTO_INCREMENT 리셋 실행
      let resetQuery;
      let resetParams = [];
      
      if (type === "mysql") {
        // MySQL: ALTER TABLE table_name AUTO_INCREMENT = start_value
        resetQuery = `ALTER TABLE ?? AUTO_INCREMENT = ?`;
        resetParams = [table, start_value];
      } else if (type === "postgresql") {
        // PostgreSQL: 시퀀스를 찾아서 리셋
        // 먼저 시퀀스 이름 찾기
        const seqQuery = `
          SELECT pg_get_serial_sequence($1, column_name) as sequence_name
          FROM information_schema.columns 
          WHERE table_name = $1 
            AND table_schema = 'public'
            AND column_default LIKE 'nextval%'
          LIMIT 1
        `;
        
        const sequences = await dbService.executeQuery(seqQuery, [table], database_name);
        
        if (sequences.length === 0) {
          throw new Error(`❌ 테이블 '${table}'에서 AUTO_INCREMENT(시퀀스) 컬럼을 찾을 수 없습니다.`);
        }
        
        const sequenceName = sequences[0].sequence_name;
        if (!sequenceName) {
          throw new Error(`❌ 테이블 '${table}'의 시퀀스 이름을 확인할 수 없습니다.`);
        }
        
        resetQuery = `ALTER SEQUENCE ${sequenceName} RESTART WITH $1`;
        resetParams = [start_value];
      }

      // 🚀 3단계: 리셋 실행
      await dbService.executeQuery(resetQuery, resetParams, database_name);
      
      // ✅ 4단계: 결과 확인
      let verifyQuery;
      let verifyResult;
      
      if (type === "mysql") {
        verifyQuery = `
          SELECT AUTO_INCREMENT 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        `;
        verifyResult = await dbService.executeQuery(verifyQuery, [table], database_name);
      } else if (type === "postgresql") {
        const sequences = await dbService.executeQuery(
          `SELECT pg_get_serial_sequence($1, column_name) as sequence_name
           FROM information_schema.columns 
           WHERE table_name = $1 AND table_schema = 'public'
             AND column_default LIKE 'nextval%'
           LIMIT 1`,
          [table], 
          database_name
        );
        
        const sequenceName = sequences[0].sequence_name;
        verifyQuery = `SELECT last_value FROM ${sequenceName}`;
        verifyResult = await dbService.executeQuery(verifyQuery, [], database_name);
      }

      return {
        data: {
          table: table,
          database: dbName,
          database_type: type,
          reset_value: start_value,
          current_value: verifyResult?.[0] || "확인불가",
          timestamp: new Date().toISOString()
        },
        count: 1,
        message: `✅ 테이블 '${table}'의 AUTO_INCREMENT를 ${start_value}로 리셋 완료 (${type})`,
      };
    },
  },

  {
    name: "check_auto_increment_status",
    description: "테이블의 현재 AUTO_INCREMENT 상태 확인",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "확인할 테이블명",
        },
        database_name: {
          type: "string",
          description: `대상 데이터베이스 이름 (선택적, 기본값: ${config.defaultDatabase})`,
        },
      },
      required: ["table"],
    },
    handler: async ({ table, database_name }) => {
      const dbName = database_name || config.defaultDatabase;
      const { type } = dbService.getPool(dbName);
      
      let statusQuery;
      let statusParams;
      
      if (type === "mysql") {
        statusQuery = `
          SELECT 
            TABLE_NAME as table_name,
            AUTO_INCREMENT as current_auto_increment,
            ENGINE as engine
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        `;
        statusParams = [table];
      } else if (type === "postgresql") {
        statusQuery = `
          SELECT 
            c.table_name,
            c.column_name,
            pg_get_serial_sequence(c.table_name, c.column_name) as sequence_name
          FROM information_schema.columns c
          WHERE c.table_name = $1 
            AND c.table_schema = 'public'
            AND c.column_default LIKE 'nextval%'
        `;
        statusParams = [table];
      }

      const statusResult = await dbService.executeQuery(statusQuery, statusParams, database_name);
      
      if (statusResult.length === 0) {
        throw new Error(`❌ 테이블 '${table}'을 찾을 수 없거나 AUTO_INCREMENT 컬럼이 없습니다.`);
      }

      let detailedInfo = statusResult[0];
      
      // PostgreSQL인 경우 시퀀스 상세 정보 추가 조회
      if (type === "postgresql" && detailedInfo.sequence_name) {
        const seqDetailQuery = `
          SELECT 
            last_value,
            start_value,
            increment_by,
            is_called
          FROM ${detailedInfo.sequence_name}
        `;
        const seqDetails = await dbService.executeQuery(seqDetailQuery, [], database_name);
        detailedInfo = { ...detailedInfo, ...seqDetails[0] };
      }

      return {
        data: {
          table: table,
          database: dbName,
          database_type: type,
          ...detailedInfo,
          timestamp: new Date().toISOString()
        },
        count: 1,
        message: `테이블 '${table}'의 AUTO_INCREMENT 상태 조회 성공 (${type})`,
      };
    },
  },

  {
    name: "truncate_table", 
    description: "테이블의 모든 데이터를 삭제하고 AUTO_INCREMENT를 1로 리셋 (local 환경에서만 허용)",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "TRUNCATE할 테이블명",
        },
        database_name: {
          type: "string",
          description: `대상 데이터베이스 이름 (선택적, 기본값: ${config.defaultDatabase})`,
        },
        confirm: {
          type: "boolean",
          description: "위험한 작업임을 확인 (true 필수)",
        },
      },
      required: ["table", "confirm"],
    },
    handler: async ({ table, database_name, confirm }) => {
      const dbName = database_name || config.defaultDatabase;
      
      // 🔒 확인 체크
      if (!confirm) {
        throw new Error("❌ 위험한 작업입니다. confirm: true를 설정해주세요.");
      }

      // 🔒 환경 제한 (local만 허용)
      if (config.environment !== "local") {
        throw new Error("❌ TRUNCATE는 local 환경에서만 허용됩니다.");
      }

      // 🔒 안전 설정 확인
      if (!config.safety.enableTruncate) {
        throw new Error("❌ TRUNCATE 작업이 비활성화되어 있습니다. ENABLE_TRUNCATE=true 설정이 필요합니다.");
      }

      const { type } = dbService.getPool(dbName);
      
      // 📊 실행 전 데이터 수 확인
      const countQuery = `SELECT COUNT(*) as row_count FROM ??`;
      const countResult = await dbService.executeQuery(countQuery, [table], database_name);
      const beforeCount = countResult[0]?.row_count || 0;

      // 🚀 TRUNCATE 실행
      let truncateQuery;
      if (type === "mysql") {
        truncateQuery = "TRUNCATE TABLE ??";
      } else if (type === "postgresql") {
        truncateQuery = "TRUNCATE TABLE ?? RESTART IDENTITY";
      }

      await dbService.executeQuery(truncateQuery, [table], database_name);

      return {
        data: {
          table: table,
          database: dbName,
          database_type: type,
          rows_deleted: beforeCount,
          auto_increment_reset: true,
          timestamp: new Date().toISOString()
        },
        count: 1,
        message: `🗑️ 테이블 '${table}' TRUNCATE 완료. ${beforeCount}개 행 삭제됨. AUTO_INCREMENT 리셋됨.`,
      };
    },
  },
];
