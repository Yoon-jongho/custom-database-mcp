// src/config.js - 다중 DB 지원 버전 (MCP 호환)
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ES modules에서 __dirname 구하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 프로젝트 루트 경로 (src 폴더의 상위 폴더)
const PROJECT_ROOT = path.resolve(__dirname, "..");

// 환경 변수로 어떤 설정 파일을 사용할지 결정
const ENV = process.env.NODE_ENV || "local";
const envFile = `.env.${ENV}`;

// MCP 서버에서는 디버깅 출력을 환경변수로 제어
const DEBUG_MODE = process.env.MCP_DEBUG === "true";

// 디버깅 로그 함수 (MCP 호환)
function debugLog(message) {
  if (DEBUG_MODE) {
    // stderr로 출력하여 JSON 파싱 방해하지 않음
    console.error(`[DEBUG] ${message}`);
  }
}

// MCP 호환: dotenv를 silent 모드로 로드 (stdout 출력 방지)
const envPath = path.resolve(PROJECT_ROOT, envFile);
try {
  dotenv.config({ 
    path: envPath,
    debug: false,  // 디버그 출력 비활성화
    override: false  // 기존 환경변수 덮어쓰지 않음
  });
  debugLog(`환경 설정 로딩: ${envPath}`);
} catch (error) {
  // stderr로 에러 출력
  console.error(`[ERROR] 환경 설정 로딩 실패: ${error.message}`);
}

/**
 * 다중 DB 설정 파싱
 */
function parseDatabases() {
  const databases = new Map();

  try {
    // 1. 기존 single DB 설정 (하위 호환성)
    if (process.env.DB_HOST && process.env.DB_DATABASE) {
      const defaultDb = {
        name: "default",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        type: "mysql", // 기본값
        description: "기본 DB (legacy 설정)"
      };
      databases.set("default", defaultDb);
    }

    // 2. 다중 DB 설정 (JSON 형태)
    if (process.env.DATABASES) {
      const dbConfigs = JSON.parse(process.env.DATABASES);
      dbConfigs.forEach(dbConfig => {
        if (!dbConfig.name) {
          throw new Error("DB 설정에서 'name' 필드가 누락되었습니다.");
        }
        
        // 기본값 설정
        dbConfig.type = dbConfig.type || "mysql";
        dbConfig.port = dbConfig.port || (dbConfig.type === "postgresql" ? 5432 : 3306);
        
        databases.set(dbConfig.name, dbConfig);
      });
    }

    // 3. Docker 환경 DB 설정 (선택적)
    if (process.env.DOCKER_DATABASES) {
      const dockerDbConfigs = JSON.parse(process.env.DOCKER_DATABASES);
      dockerDbConfigs.forEach(dbConfig => {
        if (!dbConfig.name) {
          throw new Error("Docker DB 설정에서 'name' 필드가 누락되었습니다.");
        }
        
        // Docker 환경 표시
        dbConfig.isDocker = true;
        dbConfig.type = dbConfig.type || "mysql";
        dbConfig.port = dbConfig.port || (dbConfig.type === "postgresql" ? 5432 : 3306);
        
        databases.set(dbConfig.name, dbConfig);
      });
    }

  } catch (error) {
    // MCP 호환: 에러는 stderr로 출력
    console.error(`[ERROR] DB 설정 파싱 오류: ${error.message}`);
    throw new Error(`DB 설정 파싱 실패: ${error.message}`);
  }

  if (databases.size === 0) {
    const errorMsg = `설정된 데이터베이스가 없습니다. 프로젝트 루트(${PROJECT_ROOT})에서 .env 파일을 확인해주세요.`;
    console.error(`[ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  return databases;
}

const config = {
  // 현재 환경
  environment: ENV,

  // 프로젝트 루트 경로 (디버깅용)
  projectRoot: PROJECT_ROOT,

  // 다중 DB 설정
  databases: parseDatabases(),
  
  // 기본 DB 이름 (도구에서 database_name 미지정시 사용)
  defaultDatabase: process.env.DEFAULT_DATABASE || "default",

  // 기존 single DB 설정 (하위 호환성 - deprecated)
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },

  // 안전 설정
  safety: {
    maxRows: parseInt(process.env.MAX_ROWS) || 1000,
    enableDelete: process.env.ENABLE_DELETE === "true",
    enableDrop: process.env.ENABLE_DROP === "true",
    enableMaintenanceOps: process.env.ENABLE_MAINTENANCE_OPS === "true",
    enableTruncate: process.env.ENABLE_TRUNCATE === "true",
    allowedDbs: process.env.ALLOWED_DBS?.split(",") || [],
  },

  // 환경별 제한
  restrictions: {
    local: {
      readOnly: false,
      allowedOperations: ["SELECT", "INSERT", "UPDATE", "DELETE", "SHOW", "DESCRIBE", "ALTER"],
    },
    test: {
      readOnly: false,
      allowedOperations: ["SELECT", "INSERT", "UPDATE", "SHOW", "DESCRIBE", "ALTER"], // DELETE 제한
    },
    production: {
      readOnly: true,
      allowedOperations: ["SELECT", "SHOW", "DESCRIBE"], // 읽기 전용
    },
  },
};

// 프로덕션 환경 차단
if (ENV === "production") {
  throw new Error("프로덕션 DB 접근은 보안상 차단되어 있습니다!");
}

// 설정 검증 (MCP 호환)
function validateConfig() {
  const defaultDb = config.databases.get(config.defaultDatabase);
  if (!defaultDb) {
    const errorMsg = `기본 DB '${config.defaultDatabase}'가 설정되지 않았습니다.`;
    console.error(`[ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 디버그 모드일 때만 상세 정보 출력
  if (DEBUG_MODE) {
    debugLog("설정된 데이터베이스:");
    config.databases.forEach((dbConfig, name) => {
      const dockerLabel = dbConfig.isDocker ? "[Docker] " : "";
      debugLog(`  ${dockerLabel}${name}: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} (${dbConfig.type})`);
    });
    
    debugLog(`기본 DB: ${config.defaultDatabase}`);
    debugLog(`환경: ${config.environment}`);
    debugLog(`프로젝트 루트: ${config.projectRoot}`);
  }
}

validateConfig();

export default config;
