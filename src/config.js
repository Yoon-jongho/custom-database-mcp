// src/config.js
const dotenv = require("dotenv");
const path = require("path");

// 환경 변수로 어떤 설정 파일을 사용할지 결정
const ENV = process.env.NODE_ENV || "local";
const envFile = `.env.${ENV}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const config = {
  // 현재 환경
  environment: ENV,

  // DB 설정
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },

  // 안전 설정
  safety: {
    maxRows: parseInt(process.env.MAX_ROWS) || 1000,
    enableDelete: process.env.ENABLE_DELETE === "true",
    enableDrop: process.env.ENABLE_DROP === "true",
    allowedDbs: process.env.ALLOWED_DBS?.split(",") || [],
  },

  // 환경별 제한
  restrictions: {
    local: {
      readOnly: false,
      allowedOperations: ["SELECT", "INSERT", "UPDATE", "DELETE"],
    },
    test: {
      readOnly: false,
      allowedOperations: ["SELECT", "INSERT", "UPDATE"], // DELETE 제한
    },
    production: {
      readOnly: true,
      allowedOperations: ["SELECT"], // 읽기 전용
    },
  },
};

// 프로덕션 환경 차단
if (ENV === "production") {
  throw new Error("🚫 프로덕션 DB 접근은 보안상 차단되어 있습니다!");
}

module.exports = config;
