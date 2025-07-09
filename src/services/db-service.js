import mysql from "mysql2/promise";
import pg from "pg";
import config from "../config.js";

class DatabaseService {
  constructor() {
    this.pools = new Map(); // DB별 커넥션 풀 저장
    this.initialized = false;
  }

  /**
   * 모든 DB 커넥션 풀 초기화
   */
  async initialize() {
    if (this.initialized) return;

    console.error("🔄 데이터베이스 커넥션 풀 초기화 중...");

    for (const [dbName, dbConfig] of config.databases) {
      try {
        await this.createPool(dbName, dbConfig);
        console.error(`✅ ${dbName} 커넥션 풀 생성 성공 (${dbConfig.type})`);
      } catch (error) {
        console.error(`❌ ${dbName} 커넥션 풀 생성 실패: ${error.message}`);
        // 개별 DB 실패는 전체를 중단시키지 않음
      }
    }

    this.initialized = true;
    console.error(`✅ 총 ${this.pools.size}개 DB 커넥션 풀 초기화 완료`);
  }

  /**
   * DB 타입에 따라 커넥션 풀 생성
   */
  async createPool(dbName, dbConfig) {
    const { type, host, port, user, password, database } = dbConfig;

    if (type === "mysql" || type === "mariadb") {
      // MySQL/MariaDB 커넥션 풀
      const pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: false, // 보안을 위해 비활성화
        timezone: "+00:00", // UTC 사용
      });

      // 연결 테스트
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();

      this.pools.set(dbName, { pool, type: "mysql" });

    } else if (type === "postgresql") {
      // PostgreSQL 커넥션 풀
      const { Pool } = pg;
      const pool = new Pool({
        host,
        port,
        user,
        password,
        database,
        max: 10, // 최대 연결 수
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // 연결 테스트
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.pools.set(dbName, { pool, type: "postgresql" });

    } else {
      throw new Error(`지원하지 않는 DB 타입: ${type}`);
    }
  }

  /**
   * DB 풀 가져오기
   */
  getPool(dbName) {
    if (!this.initialized) {
      throw new Error("DatabaseService가 초기화되지 않았습니다. initialize()를 먼저 호출하세요.");
    }

    if (!dbName) {
      dbName = config.defaultDatabase;
    }

    const poolInfo = this.pools.get(dbName);
    if (!poolInfo) {
      const availableDbs = Array.from(this.pools.keys()).join(", ");
      throw new Error(`DB '${dbName}'를 찾을 수 없습니다. 사용 가능한 DB: ${availableDbs}`);
    }

    return poolInfo;
  }

  /**
   * 쿼리 실행 (DB별 동적 선택)
   */
  async executeQuery(query, params = [], dbName = null) {
    await this.initialize(); // 지연 초기화

    const { pool, type } = this.getPool(dbName);

    // 안전성 검사
    const upperQuery = query.toUpperCase().trim();
    const currentRestrictions = config.restrictions[config.environment];

    // 허용된 작업인지 확인
    const operation = upperQuery.split(" ")[0];
    if (!currentRestrictions.allowedOperations.includes(operation)) {
      throw new Error(
        `${operation} 작업은 ${config.environment} 환경에서 허용되지 않습니다.`
      );
    }

    // DROP, TRUNCATE 등 위험한 명령어 차단
    if (
      config.safety.enableDrop === false &&
      (upperQuery.includes("DROP") || upperQuery.includes("TRUNCATE"))
    ) {
      throw new Error("DROP/TRUNCATE 명령어는 차단되어 있습니다.");
    }

    try {
      if (type === "mysql") {
        return await this.executeMySQLQuery(pool, query, params);
      } else if (type === "postgresql") {
        return await this.executePostgreSQLQuery(pool, query, params);
      }
    } catch (error) {
      throw new Error(`쿼리 실행 오류 (${dbName || config.defaultDatabase}): ${error.message}`);
    }
  }

  /**
   * MySQL/MariaDB 쿼리 실행
   */
  async executeMySQLQuery(pool, query, params) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * PostgreSQL 쿼리 실행
   */
  async executePostgreSQLQuery(pool, query, params) {
    const client = await pool.connect();
    try {
      // PostgreSQL은 $1, $2 형태의 파라미터 사용
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * 모든 커넥션 풀 종료
   */
  async disconnect() {
    console.error("🔄 모든 DB 커넥션 풀 종료 중...");
    
    for (const [dbName, { pool, type }] of this.pools) {
      try {
        if (type === "mysql") {
          await pool.end();
        } else if (type === "postgresql") {
          await pool.end();
        }
        console.error(`✅ ${dbName} 커넥션 풀 종료 완료`);
      } catch (error) {
        console.error(`❌ ${dbName} 커넥션 풀 종료 실패: ${error.message}`);
      }
    }

    this.pools.clear();
    this.initialized = false;
  }

  /**
   * 설정된 DB 목록 조회
   */
  getAvailableDatabases() {
    const databases = [];
    for (const [dbName, dbConfig] of config.databases) {
      const poolInfo = this.pools.get(dbName);
      databases.push({
        name: dbName,
        type: dbConfig.type,
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        description: dbConfig.description,
        isConnected: !!poolInfo,
        isDefault: dbName === config.defaultDatabase
      });
    }
    return databases;
  }

  /**
   * 특정 DB 정보 조회
   */
  getDatabaseInfo(dbName) {
    const dbConfig = config.databases.get(dbName);
    if (!dbConfig) {
      throw new Error(`DB '${dbName}'를 찾을 수 없습니다.`);
    }

    const poolInfo = this.pools.get(dbName);
    return {
      name: dbName,
      type: dbConfig.type,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      description: dbConfig.description,
      isConnected: !!poolInfo,
      isDefault: dbName === config.defaultDatabase
    };
  }
}

export default new DatabaseService();
