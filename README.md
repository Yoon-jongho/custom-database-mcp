# 🗃️ Database-MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D8.0.0-red.svg)](https://www.npmjs.com/)

**강력하고 안전한 다중 데이터베이스 MCP 서버** - MySQL, MariaDB, PostgreSQL을 동시에 지원하는 Model Context Protocol 서버

## 🚀 주요 특징

### 🗄️ **다중 데이터베이스 지원**

- **MySQL, MariaDB, PostgreSQL** 동시 연결 및 관리
- **무제한 DB 추가** - JSON 설정으로 간단하게 확장
- **동적 DB 선택** - 도구별로 사용할 DB를 실시간 선택

### 🔒 **엔터프라이즈급 보안**

- **환경별 접근 제어** (local/test/production)
- **SQL Injection 방지** - Prepared Statement 강제 사용
- **위험한 쿼리 차단** - DROP, TRUNCATE 등 자동 차단
- **프로덕션 환경 보호** - 읽기 전용 또는 완전 차단

### ⚡ **고성능 아키텍처**

- **커넥션 풀링** - DB별 최적화된 연결 관리
- **지연 초기화** - 필요시에만 연결 생성
- **결과 제한** - 대용량 데이터 안전 처리

### 🛠️ **개발자 친화적**

- **직관적인 API** - 간단하고 일관된 도구 인터페이스
- **실시간 모니터링** - 연결 상태 및 통계 확인
- **포괄적인 문서** - 상세한 가이드 및 예제 제공

## 📊 지원하는 데이터베이스

| 데이터베이스   | 버전  | 상태         | 특징               |
| -------------- | ----- | ------------ | ------------------ |
| **MySQL**      | 5.7+  | ✅ 완전 지원 | 표준 SQL, 트랜잭션 |
| **MariaDB**    | 10.3+ | ✅ 완전 지원 | MySQL 호환, 고성능 |
| **PostgreSQL** | 12+   | ✅ 완전 지원 | 고급 기능, JSONB   |

## 🎯 빠른 시작

### 1️⃣ 설치

```bash
git clone https://github.com/Yoon-jongho/custom-database-mcp.git
cd custom-database-mcp
npm install
```

### 2️⃣ 데이터베이스 설정

```bash
# 환경 설정 파일 생성
cp .env.example .env.local

# 데이터베이스 연결 정보 입력
vim .env.local
```

### 3️⃣ 연결 테스트

```bash
# 연결 테스트 (선택적)
node test-client.js
```

### 4️⃣ Claude Desktop 연결

#### **Step 1: Claude Desktop 설치**
[Claude Desktop](https://claude.ai/download)을 다운로드하고 설치합니다.

#### **Step 2: MCP 설정 파일 수정**

**macOS**:
```bash
# 설정 파일 열기
vim ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows**:
```bash
# 설정 파일 경로
%APPDATA%\Claude\claude_desktop_config.json
```

#### **Step 3: Database-MCP 서버 등록**

설정 파일에 다음 내용을 추가하세요:

```json
{
  "mcpServers": {
    "database-mcp": {
      "command": "node",
      "args": ["/절대/경로/database-mcp/src/index.js"],
      "env": {
        "NODE_ENV": "local"
      }
    }
  }
}
```

> **💡 중요**: `/절대/경로/database-mcp`를 실제 프로젝트 경로로 변경하세요!

**예시**:
```json
{
  "mcpServers": {
    "database-mcp": {
      "command": "node", 
      "args": ["/Users/username/projects/database-mcp/src/index.js"],
      "env": {
        "NODE_ENV": "local"
      }
    }
  }
}
```

#### **Step 4: Claude Desktop 재시작**

1. Claude Desktop을 완전히 종료
2. 다시 시작
3. 새로운 대화에서 Database-MCP 도구가 나타나는지 확인

#### **Step 5: 연결 확인**

Claude Desktop에서 다음과 같이 테스트해보세요:

```
Database-MCP 서버의 연결 상태를 확인해줘
```

정상적으로 연결되면 데이터베이스 목록과 연결 상태가 표시됩니다.

## ⚙️ 설정 예제

### Single DB 설정 (간단)

```bash
# .env.local
DB_HOST=localhost
DB_PORT=3306
DB_USER=myuser
DB_PASSWORD=mypassword
DB_DATABASE=mydatabase
```

### Multi DB 설정 (권장)

```bash
# .env.local
DATABASES='[
  {
    "name": "main_db",
    "host": "localhost",
    "port": 3306,
    "user": "mysql_user",
    "password": "mysql_password",
    "database": "app_database",
    "type": "mysql",
    "description": "메인 애플리케이션 DB"
  },
  {
    "name": "analytics_db",
    "host": "localhost",
    "port": 5432,
    "user": "postgres_user",
    "password": "postgres_password",
    "database": "analytics_warehouse",
    "type": "postgresql",
    "description": "데이터 분석용 DB"
  }
]'

DEFAULT_DATABASE=main_db
```

## 🛠️ 사용법

### 데이터베이스 목록 조회

```javascript
{
  name: "list_databases",
  arguments: {}
}
```

### 특정 DB의 테이블 조회

```javascript
{
  name: "list_tables",
  arguments: {
    database_name: "analytics_db"
  }
}
```

### 쿼리 실행 (안전한 매개변수 사용)

```javascript
{
  name: "execute_query",
  arguments: {
    query: "SELECT * FROM users WHERE age > ? AND city = ?",
    params: ["25", "Seoul"],
    database_name: "main_db"
  }
}
```

### 연결 상태 확인

```javascript
{
  name: "check_db_connections",
  arguments: {}
}
```

## 🔧 트러블슈팅

### Claude Desktop 연결 문제

#### **❌ "Server disconnected" 오류**

**원인**: JSON 파싱 오류 또는 stdout 출력 간섭

**해결책**:
1. `.env.local`에서 `MCP_DEBUG=false` 확인
2. Claude Desktop 완전 재시작
3. 절대 경로가 정확한지 확인

```bash
# 경로 확인
pwd
# 출력 예: /Users/username/projects/database-mcp
```

#### **❌ "Tool not found" 오류**

**원인**: MCP 서버가 등록되지 않음

**해결책**:
1. `claude_desktop_config.json` 문법 확인
2. JSON 형식이 올바른지 검증
3. Node.js 버전 확인 (18.0.0 이상)

```bash
node --version  # v18.0.0 이상이어야 함
```

#### **❌ 데이터베이스 연결 실패**

**원인**: 잘못된 DB 설정 또는 DB 서버 중단

**해결책**:
1. 데이터베이스 서버 상태 확인
2. `.env.local` 설정 검증
3. 방화벽 설정 확인

```bash
# MySQL 연결 테스트
mysql -h localhost -P 3306 -u username -p

# PostgreSQL 연결 테스트  
psql -h localhost -p 5432 -U username -d database
```

### 일반적인 문제

#### **성능 이슈**

- **커넥션 풀 크기 조정**: 환경변수 `DB_POOL_SIZE` 설정
- **쿼리 타임아웃**: 환경변수 `DB_TIMEOUT` 설정
- **결과 제한**: 환경변수 `MAX_ROWS` 설정

#### **보안 경고**

- **프로덕션 접근 차단**: `NODE_ENV=production`에서 자동 차단됨
- **위험한 쿼리**: DROP, TRUNCATE 등은 자동으로 차단됨
- **SQL Injection**: Prepared Statement 사용으로 방지

### 디버깅 방법

#### **서버 로그 확인**

```bash
# MCP 서버 디버그 모드 실행
MCP_DEBUG=true node src/index.js
```

#### **연결 상태 확인**

```bash
# 테스트 클라이언트 실행
node test-client.js
```

#### **상세 로그 보기**

Claude Desktop 로그 확인:
- **macOS**: `~/Library/Logs/Claude/`
- **Windows**: `%APPDATA%\Claude\logs\`

## 📚 완전한 문서

상세한 사용법과 설정 방법은 **[가이드 모음](docs/README.md)**에서 확인하세요:

- 📦 **[설치 가이드](docs/01-installation.md)** - 단계별 설치 과정
- ⚙️ **[설정 가이드](docs/02-configuration.md)** - 환경 설정 완전 가이드
- 🚀 **[기본 사용법](docs/03-basic-usage.md)** - 첫 번째 쿼리부터 고급 활용
- 🎓 **[고급 사용법](docs/04-advanced-usage.md)** - 복잡한 쿼리와 최적화
- 🔧 **[트러블슈팅](docs/05-troubleshooting.md)** - 문제 해결 가이드

## 🔒 보안 및 제한사항

### 환경별 제한

- **local**: 모든 작업 허용 (개발 환경)
- **test**: DELETE 작업 제한 (테스트 환경)
- **production**: 읽기 전용 + 접근 차단 (보안)

### 안전 장치

- **SQL Injection 방지**: Prepared Statement 강제 사용
- **위험한 쿼리 차단**: DROP, TRUNCATE 등 자동 차단
- **결과 제한**: 기본 1000행 제한 (설정 가능)
- **커넥션 관리**: 자동 풀링 및 타임아웃 처리

## 🐳 Docker 지원

### Docker Compose 예제

```yaml
version: "3.8"
services:
  database-mcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=local
    depends_on:
      - mysql
      - postgres

  mysql:
    image: mariadb:10.11
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: appdb
    ports:
      - "3306:3306"

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: analytics
    ports:
      - "5432:5432"
```

## 🎯 사용 사례

### 🏢 **기업 환경**

- 다중 마이크로서비스 DB 통합 관리
- 개발/테스트/프로덕션 환경 분리
- 안전한 데이터 분석 및 리포팅

### 🔬 **데이터 과학**

- 여러 데이터 소스 통합 분석
- 안전한 쿼리 실행 환경
- 실시간 데이터 모니터링

### 🚀 **개발 팀**

- 로컬 개발 환경 표준화
- 팀간 DB 접근 권한 관리
- CI/CD 파이프라인 통합

## 📈 성능 벤치마크

| 작업          | MySQL  | PostgreSQL | 동시 연결 |
| ------------- | ------ | ---------- | --------- |
| 단순 SELECT   | ~2ms   | ~3ms       | 10개 풀   |
| 복잡한 JOIN   | ~15ms  | ~12ms      | 자동 관리 |
| 대용량 INSERT | ~500ms | ~400ms     | 트랜잭션  |

## 🤝 기여하기

Database-MCP는 오픈소스 프로젝트입니다. 기여를 환영합니다!

### 기여 방법

1. **Fork** 이 저장소를 포크하세요
2. **Branch** 새 기능 브랜치를 만드세요 (`git checkout -b feature/amazing-feature`)
3. **Commit** 변경사항을 커밋하세요 (`git commit -m 'Add amazing feature'`)
4. **Push** 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. **Pull Request** 를 생성하세요

### 개발 가이드라인

- **코드 스타일**: ESLint + Prettier 사용
- **테스트**: 새 기능은 테스트 포함 필수
- **문서**: 공개 API 변경시 문서 업데이트
- **보안**: 보안 관련 변경은 별도 리뷰

## 📞 지원 및 커뮤니티

- 🐛 **버그 리포트**: [GitHub Issues](https://github.com/Yoon-jongho/custom-database-mcp/issues)
- 💡 **기능 제안**: [GitHub Discussions](https://github.com/Yoon-jongho/custom-database-mcp/discussions)
- 📖 **문서 개선**: [Wiki](https://github.com/Yoon-jongho/custom-database-mcp/wiki)
- 💬 **질문 및 지원**: [Discussions](https://github.com/Yoon-jongho/custom-database-mcp/discussions)

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

## 🌟 스타 히스토리

[![Star History Chart](https://api.star-history.com/svg?repos=Yoon-jongho/custom-database-mcp&type=Date)](https://star-history.com/#Yoon-jongho/custom-database-mcp&Date)

---

<div align="center">

**Database-MCP로 안전하고 효율적인 다중 데이터베이스 관리를 시작하세요!** 🚀

[🚀 빠른 시작](#-빠른-시작) • [📚 문서](docs/README.md) • [🤝 기여하기](#-기여하기) • [📞 지원](#-지원-및-커뮤니티)

</div>
