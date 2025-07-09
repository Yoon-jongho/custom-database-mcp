# ⚙️ Database-MCP 설정 가이드

## 📋 설정 파일 개요

Database-MCP는 `.env` 파일을 통해 환경별 설정을 관리합니다.

### 환경별 설정 파일
- **`.env.local`** - 로컬 개발 환경
- **`.env.test`** - 테스트 환경  
- **`.env.production`** - 프로덕션 환경 (접근 차단됨)

## 🗃️ 데이터베이스 설정 방법

### 1. Single DB 설정 (기본/하위 호환성)

간단한 단일 데이터베이스 연결:
```bash
# 기본 DB 설정
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_DATABASE=your_database
```

### 2. Multi DB 설정 (권장)

여러 데이터베이스를 동시에 사용:
```bash
# 다중 DB 설정 (JSON 형태)
DATABASES='[
  {
    "name": "main_db",
    "host": "localhost",
    "port": 3306,
    "user": "mysql_user",
    "password": "mysql_password",
    "database": "main_database",
    "type": "mysql",
    "description": "메인 MySQL 데이터베이스"
  },
  {
    "name": "analytics_db",
    "host": "localhost",
    "port": 5432,
    "user": "postgres_user",
    "password": "postgres_password", 
    "database": "analytics_database",
    "type": "postgresql",
    "description": "분석용 PostgreSQL 데이터베이스"
  }
]'

# 기본 DB 지정 (도구에서 database_name 미지정시 사용)
DEFAULT_DATABASE=main_db
```

## 🔧 상세 설정 옵션

### 데이터베이스 객체 속성

| 속성 | 필수 | 타입 | 설명 | 예시 |
|------|------|------|------|------|
| `name` | ✅ | string | DB 식별자 (고유해야 함) | "main_db" |
| `host` | ✅ | string | 데이터베이스 호스트 | "localhost" |
| `port` | ✅ | number | 포트 번호 | 3306, 5432 |
| `user` | ✅ | string | 사용자명 | "root" |
| `password` | ✅ | string | 비밀번호 | "password123" |
| `database` | ✅ | string | 데이터베이스명 | "myapp_db" |
| `type` | ✅ | string | DB 타입 | "mysql", "postgresql" |
| `description` | ⚪ | string | 설명 (관리용) | "메인 DB" |

### 안전 설정

```bash
# 보안 및 제한 설정
SAFE_MODE=true                    # 안전 모드 활성화
MAX_ROWS=1000                     # 쿼리 결과 최대 행 수
ENABLE_DELETE=false               # DELETE 쿼리 허용 여부
ENABLE_DROP=false                 # DROP 쿼리 허용 여부
ALLOWED_DBS=db1,db2,db3          # 허용된 데이터베이스 목록
```

### MCP 서버 설정

```bash
# MCP 관련 설정
MCP_SERVER_NAME=database-mcp      # 서버 식별 이름
NODE_ENV=local                    # 환경 (local/test/production)
```

## 📚 설정 예제

### 로컬 Docker 환경 예제

```bash
# .env.local
# Docker MariaDB + PostgreSQL 환경

# 기본 DB (하위 호환성)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_DATABASE=myapp_db

# 다중 DB 설정
DATABASES='[
  {
    "name": "mariadb_main",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "rootpassword",
    "database": "myapp_db",
    "type": "mysql",
    "description": "메인 MariaDB"
  },
  {
    "name": "postgres_analytics",
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "postgres",
    "database": "analytics_db",
    "type": "postgresql",
    "description": "분석용 PostgreSQL"
  }
]'

DEFAULT_DATABASE=mariadb_main

# 안전 설정
SAFE_MODE=true
MAX_ROWS=1000
ENABLE_DELETE=true
ENABLE_DROP=false
ALLOWED_DBS=myapp_db,analytics_db

# MCP 설정
MCP_SERVER_NAME=database-mcp
```

---

**다음 단계**: [기본 사용법](03-basic-usage.md)을 확인하여 첫 번째 쿼리를 실행해보세요.
