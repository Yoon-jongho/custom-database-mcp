# database-mcp

## 🚀 프로젝트 소개

`database-mcp`는 데이터베이스에 안전하고 효율적으로 접근하기 위한 Model Context Protocol (MCP) 서버입니다. 이 서버는 외부 애플리케이션이 데이터베이스와 상호작용할 수 있도록 표준화된 인터페이스를 제공하며, 데이터베이스 작업에 대한 강력한 제어 및 보안 기능을 포함합니다.

## ✨ 주요 기능

- **안전한 데이터베이스 연결**: `mysql2` 커넥션 풀을 사용하여 효율적이고 안정적인 MariaDB 연결을 관리합니다.
- **쿼리 실행 도구**: `SELECT`, `INSERT`, `UPDATE`, `DELETE` 등 다양한 SQL 쿼리를 실행할 수 있는 도구를 제공합니다.
- **환경별 접근 제어**: `local`, `test`, `production` 환경에 따라 허용되는 데이터베이스 작업(예: 읽기 전용, 특정 명령어 차단)을 세밀하게 제어합니다.
- **보안 강화**: SQL 인젝션 방지를 위한 Prepared Statement 사용, 위험한 명령어(DROP, TRUNCATE) 차단, 프로덕션 환경 접근 제한 등의 안전 장치를 내장하고 있습니다.
- **일관된 응답 형식**: 모든 도구 호출에 대해 일관된 JSON 응답 형식(`{ data, count, message }`)을 제공하여 클라이언트 개발을 용이하게 합니다.

## 🏁 시작하기

이 프로젝트를 로컬 환경에서 설정하고 실행하는 방법입니다.

### 📋 전제 조건

- Node.js (v18 이상 권장)
- npm (Node.js 설치 시 함께 설치됩니다)
- MariaDB 또는 MySQL 데이터베이스

### 📦 설치

1.  저장소를 클론합니다:
    ```bash
    git clone https://github.com/your-username/database-mcp.git
    cd database-mcp
    ```
2.  의존성 패키지를 설치합니다:
    ```bash
    npm install
    ```
3.  `.env.example` 파일을 참조하여 `.env.local` 파일을 생성하고 데이터베이스 연결 정보를 설정합니다.
    ```
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_DATABASE=your_db_name
    MAX_ROWS=1000
    ENABLE_DELETE=true
    ENABLE_DROP=false
    ALLOWED_DBS=your_db_name
    ```

### ▶️ 서버 실행

```bash
npm start
```

서버가 성공적으로 시작되면 `Database MCP server started` 메시지가 출력됩니다.

### 🧪 테스트 클라이언트 실행

서버가 데이터베이스와 올바르게 통신하는지 확인하기 위해 테스트 클라이언트를 실행할 수 있습니다.

```bash
node test-client.js
```

이 클라이언트는 서버의 `list_tables` 도구를 호출하여 데이터베이스의 테이블 목록을 가져옵니다.

## 💡 사용법

MCP 서버는 표준 입출력(stdio)을 통해 통신하며, MCP SDK를 사용하여 서버의 도구들을 호출할 수 있습니다.

예시 (JavaScript/TypeScript 클라이언트):

```javascript
// 예시: 테이블 목록 조회
const response = await client.callTool({
  name: "list_tables",
  arguments: {},
});
console.log(response.content[0].text);

// 예시: 쿼리 실행
const queryResponse = await client.callTool({
  name: "execute_query",
  arguments: {
    query: "SELECT * FROM users WHERE id = ?",
    params: [1],
  },
});
console.log(queryResponse.content[0].text);
```

## 🤝 기여

기여를 환영합니다! 버그 리포트, 기능 제안, 풀 리퀘스트 등 어떤 형태의 기여든 좋습니다. 자세한 내용은 `CONTRIBUTING.md` (예정) 파일을 참조해주세요.

## 📄 라이선스

이 프로젝트의 모든 권한은 [귀하의 이름 또는 회사명]에게 있습니다.
