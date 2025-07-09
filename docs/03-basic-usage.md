# 🚀 Database-MCP 기본 사용법

## 🎯 첫 번째 테스트

### 1. 서버 시작 및 연결 확인
```bash
# 테스트 클라이언트 실행
node test-client.js

# 예상 출력
Database MCP server started
✅ 클라이언트가 서버에 연결되었습니다.
총 3개 DB 중 3개 연결 성공
```

### 2. 환경 상태 확인
```javascript
// 현재 환경 정보 조회
{
  name: "get_current_environment",
  arguments: {}
}

// 응답 예시
{
  "environment": "local",
  "defaultDatabase": "main_db", 
  "totalDatabases": 3,
  "allowedOperations": ["SELECT", "INSERT", "UPDATE", "DELETE", "SHOW", "DESCRIBE"]
}
```

## 🛠️ 주요 도구들

### 1. 데이터베이스 관리 도구

#### `list_databases` - 설정된 DB 목록 조회
```javascript
// 모든 설정된 데이터베이스 확인
{
  name: "list_databases",
  arguments: {}
}

// 응답
{
  "data": [
    {
      "name": "main_db",
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "database": "myapp_db",
      "isConnected": true,
      "isDefault": true
    },
    {
      "name": "analytics_db", 
      "type": "postgresql",
      "host": "localhost",
      "port": 5432,
      "database": "analytics",
      "isConnected": true,
      "isDefault": false
    }
  ]
}
```

#### `check_db_connections` - 연결 상태 확인
```javascript
{
  name: "check_db_connections",
  arguments: {}
}

// 모든 DB의 실시간 연결 상태 확인
```

### 2. 테이블 관리 도구

#### `list_tables` - 테이블 목록 조회
```javascript
// 기본 DB의 테이블 목록
{
  name: "list_tables",
  arguments: {}
}

// 특정 DB의 테이블 목록
{
  name: "list_tables", 
  arguments: {
    database_name: "analytics_db"
  }
}
```

#### `describe_table` - 테이블 구조 조회
```javascript
// 기본 DB의 테이블 구조
{
  name: "describe_table",
  arguments: {
    table: "users"
  }
}

// 특정 DB의 테이블 구조
{
  name: "describe_table",
  arguments: {
    table: "events",
    database_name: "analytics_db"
  }
}
```

### 3. 쿼리 실행 도구

#### `execute_query` - SQL 쿼리 실행

**기본 SELECT 쿼리**
```javascript
{
  name: "execute_query",
  arguments: {
    query: "SELECT * FROM users LIMIT 5"
  }
}
```

**매개변수가 있는 쿼리 (Prepared Statement)**
```javascript
{
  name: "execute_query",
  arguments: {
    query: "SELECT * FROM users WHERE age > ? AND city = ?",
    params: ["25", "Seoul"]
  }
}
```

**특정 DB에서 쿼리 실행**
```javascript
{
  name: "execute_query",
  arguments: {
    query: "SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type",
    database_name: "analytics_db"
  }
}
```

## 📊 실제 사용 예제

### 예제 1: 사용자 데이터 조회
```javascript
// 1. 사용자 테이블 구조 확인
{
  name: "describe_table",
  arguments: { table: "users" }
}

// 2. 최신 사용자 10명 조회
{
  name: "execute_query", 
  arguments: {
    query: "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10"
  }
}

// 3. 특정 조건으로 사용자 검색
{
  name: "execute_query",
  arguments: {
    query: "SELECT * FROM users WHERE email LIKE ? AND status = ?",
    params: ["%@gmail.com", "active"]
  }
}
```

### 예제 2: 다중 DB 분석
```javascript
// 1. 메인 DB에서 사용자 수 확인
{
  name: "execute_query",
  arguments: {
    query: "SELECT COUNT(*) as user_count FROM users",
    database_name: "main_db"
  }
}

// 2. 분석 DB에서 이벤트 통계 확인  
{
  name: "execute_query",
  arguments: {
    query: "SELECT DATE(created_at) as date, COUNT(*) as events FROM events GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 7",
    database_name: "analytics_db"
  }
}
```

### 예제 3: 데이터 입력 및 수정
```javascript
// 1. 새 사용자 추가
{
  name: "execute_query",
  arguments: {
    query: "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    params: ["newuser", "newuser@example.com", "hashed_password"]
  }
}

// 2. 사용자 정보 업데이트
{
  name: "execute_query",
  arguments: {
    query: "UPDATE users SET last_login = NOW() WHERE id = ?",
    params: ["123"]
  }
}
```

## 🔒 보안 및 제한사항

### 1. 환경별 제한
- **local**: 모든 작업 허용 (SELECT, INSERT, UPDATE, DELETE, SHOW, DESCRIBE)
- **test**: DELETE 제한 (SELECT, INSERT, UPDATE, SHOW, DESCRIBE)
- **production**: 읽기 전용 (SELECT, SHOW, DESCRIBE) + 접근 차단

### 2. 안전 장치
- **최대 행 수 제한**: 기본 1000개 (MAX_ROWS 설정)
- **위험한 쿼리 차단**: DROP, TRUNCATE 등
- **Prepared Statement**: SQL Injection 방지

### 3. 허용된 작업 확인
```javascript
{
  name: "get_current_environment",
  arguments: {}
}

// allowedOperations에서 현재 환경에서 가능한 작업 확인
```

## 📈 성능 모니터링

### 데이터베이스 통계 조회
```javascript
// 전체 통계
{
  name: "get_db_statistics",
  arguments: {}
}

// 특정 DB 통계
{
  name: "get_db_statistics", 
  arguments: {
    database_name: "analytics_db"
  }
}
```

## ❌ 일반적인 오류 처리

### 1. DB 연결 오류
```javascript
// 오류 예시
{
  "error": "DB 'wrong_db_name'를 찾을 수 없습니다. 사용 가능한 DB: main_db, analytics_db"
}

// 해결: 올바른 database_name 사용
{
  name: "list_databases",
  arguments: {}  // 먼저 사용 가능한 DB 목록 확인
}
```

### 2. 권한 오류
```javascript
// 오류 예시  
{
  "error": "DELETE 작업은 test 환경에서 허용되지 않습니다."
}

// 해결: 허용된 작업만 사용
{
  name: "get_current_environment",
  arguments: {}  // allowedOperations 확인
}
```

### 3. 쿼리 결과 제한
```javascript
// 응답 예시
{
  "data": [...], 
  "count": 1000,
  "message": "결과가 1000개로 제한되었습니다. (전체: 5000개)"
}

// 해결: LIMIT 절 사용하여 필요한 만큼만 조회
{
  name: "execute_query",
  arguments: {
    query: "SELECT * FROM large_table ORDER BY id DESC LIMIT 100"
  }
}
```

## 🎯 최적 사용법 팁

### 1. 효율적인 쿼리 작성
```javascript
// ❌ 비효율적
query: "SELECT * FROM users"  // 모든 컬럼, 모든 행

// ✅ 효율적  
query: "SELECT id, username, email FROM users WHERE status = 'active' LIMIT 50"
```

### 2. 매개변수 사용
```javascript
// ❌ SQL Injection 위험
query: `SELECT * FROM users WHERE id = ${userId}`

// ✅ 안전한 방법
query: "SELECT * FROM users WHERE id = ?",
params: [userId]
```

### 3. 적절한 DB 선택
```javascript
// 사용자 관련 작업은 main_db
database_name: "main_db"

// 분석/로그 관련 작업은 analytics_db  
database_name: "analytics_db"
```

---

**다음 단계**: [고급 사용법](04-advanced-usage.md)에서 더 복잡한 기능들을 알아보세요.
