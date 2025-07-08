import mysql from "mysql2/promise";
import config from "../config.js";

class DatabaseService {
  constructor() {
    this.pool = null;
  }

  getPool() {
    if (this.pool) {
      return this.pool;
    }

    try {
      this.pool = mysql.createPool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        waitForConnections: true,
        connectionLimit: 10, // 동시에 유지할 최대 커넥션 수
        queueLimit: 0, // connectionLimit에 도달했을 때 대기열 한도
        multipleStatements: false, // 보안을 위해 비활성화
      });

      console.error(`✅ DB 커넥션 풀 생성 성공 (${config.environment})`);
      return this.pool;
    } catch (error) {
      console.error(`❌ DB 커넥션 풀 생성 실패: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async executeQuery(query, params = []) {
    const pool = this.getPool();
    const connection = await pool.getConnection();

    // 안전성 검사
    const upperQuery = query.toUpperCase().trim();
    const currentRestrictions = config.restrictions[config.environment];

    // 허용된 작업인지 확인
    const operation = upperQuery.split(" ")[0];
    if (!currentRestrictions.allowedOperations.includes(operation)) {
      connection.release();
      throw new Error(
        `${operation} 작업은 ${config.environment} 환경에서 허용되지 않습니다.`
      );
    }

    // DROP, TRUNCATE 등 위험한 명령어 차단
    if (
      config.safety.enableDrop === false &&
      (upperQuery.includes("DROP") || upperQuery.includes("TRUNCATE"))
    ) {
      connection.release();
      throw new Error("DROP/TRUNCATE 명령어는 차단되어 있습니다.");
    }

    try {
      const [rows] = await connection.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`쿼리 실행 오류: ${error.message}`);
    } finally {
      connection.release(); // 사용한 커넥션은 반드시 반환
    }
  }
}

export default new DatabaseService();
