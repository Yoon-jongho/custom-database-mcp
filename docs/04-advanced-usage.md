# 🎓 Database-MCP 고급 사용법

## 🔧 환경 관리

### 환경 전환
```javascript
// 테스트 환경으로 전환
{
  name: "switch_environment",
  arguments: {
    environment: "test"
  }
}

// 현재 환경 확인
{
  name: "get_current_environment", 
  arguments: {}
}
```

## 🔍 복잡한 쿼리 패턴

### 조인 쿼리
```javascript
{
  name: "execute_query",
  arguments: {
    query: `
      SELECT u.username, p.title, p.created_at
      FROM users u
      INNER JOIN posts p ON u.id = p.user_id
      WHERE u.status = ? AND p.published = ?
      ORDER BY p.created_at DESC
      LIMIT ?
    `,
    params: ["active", true, 20]
  }
}
```

### 집계 쿼리
```javascript
{
  name: "execute_query",
  arguments: {
    query: `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `
  }
}
```

## 📊 성능 최적화

### 인덱스 확인 (MySQL)
```javascript
{
  name: "execute_query",
  arguments: {
    query: "SHOW INDEX FROM users"
  }
}
```

### 쿼리 실행 계획 (PostgreSQL)
```javascript
{
  name: "execute_query",
  arguments: {
    query: "EXPLAIN ANALYZE SELECT * FROM users WHERE email = $1",
    params: ["user@example.com"],
    database_name: "postgres_db"
  }
}
```

## 🔄 데이터 마이그레이션

### 다중 DB 간 데이터 복사
```javascript
// 1. 소스 DB에서 데이터 조회
{
  name: "execute_query",
  arguments: {
    query: "SELECT id, username, email FROM users WHERE migrated = false",
    database_name: "old_db"
  }
}

// 2. 타겟 DB에 데이터 삽입
{
  name: "execute_query", 
  arguments: {
    query: "INSERT INTO users_new (id, username, email) VALUES (?, ?, ?)",
    params: [1, "username", "email@example.com"],
    database_name: "new_db"
  }
}
```

---

**더 자세한 내용은 [트러블슈팅 가이드](05-troubleshooting.md)를 참조하세요.**
