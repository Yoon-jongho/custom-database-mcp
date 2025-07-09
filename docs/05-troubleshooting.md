# 🔧 Database-MCP 트러블슈팅

## ❌ 일반적인 오류들

### 1. 연결 오류

#### "ECONNREFUSED" 오류
```bash
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**원인**: 데이터베이스 서버가 실행되지 않음
**해결**: 
```bash
# MySQL/MariaDB 시작
sudo systemctl start mysql

# PostgreSQL 시작
sudo systemctl start postgresql

# Docker 확인
docker ps | grep database
```

#### "Access denied" 오류
```bash
Error: Access denied for user 'username'@'host'
```
**원인**: 잘못된 사용자명/비밀번호 또는 권한 부족
**해결**:
```bash
# 비밀번호 확인
mysql -u username -p

# 권한 부여
GRANT ALL PRIVILEGES ON database.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 설정 오류

#### JSON 파싱 오류
```bash
SyntaxError: Unexpected token } in JSON at position 123
```
**원인**: DATABASES JSON 문법 오류
**해결**:
```bash
# JSON 검증
node -e "console.log(JSON.parse(process.env.DATABASES))"

# 온라인 JSON 검증기 사용
# https://jsonlint.com/
```

#### "DB를 찾을 수 없습니다" 오류
```bash
Error: DB 'wrong_name'를 찾을 수 없습니다.
```
**원인**: 잘못된 database_name 사용
**해결**:
```javascript
// 사용 가능한 DB 목록 확인
{
  name: "list_databases",
  arguments: {}
}
```

### 3. 권한 오류

#### "작업이 허용되지 않습니다" 오류
```bash
Error: DELETE 작업은 test 환경에서 허용되지 않습니다.
```
**원인**: 현재 환경에서 해당 작업이 제한됨
**해결**:
```javascript
// 현재 환경의 허용 작업 확인
{
  name: "get_current_environment",
  arguments: {}
}
```

## 🔍 디버깅 방법

### 1. 연결 상태 확인
```javascript
{
  name: "check_db_connections",
  arguments: {}
}
```

### 2. 설정 정보 확인
```bash
# 환경 변수 확인
echo $NODE_ENV

# 설정된 DB 목록 확인
node -e "
import config from './src/config.js';
console.log('기본 DB:', config.defaultDatabase);
config.databases.forEach((db, name) => {
  console.log(name + ':', db.host + ':' + db.port);
});
"
```

### 3. 로그 확인
```bash
# 서버 실행시 상세 로그
DEBUG=* npm start

# 테스트 실행시 로그
node test-client.js 2>&1 | tee debug.log
```

## 📊 성능 문제

### 1. 느린 쿼리
**증상**: 쿼리 실행이 오래 걸림
**해결**:
```javascript
// 쿼리 실행 계획 확인
{
  name: "execute_query",
  arguments: {
    query: "EXPLAIN SELECT * FROM large_table WHERE column = ?",
    params: ["value"]
  }
}

// 인덱스 추가 검토
{
  name: "execute_query", 
  arguments: {
    query: "CREATE INDEX idx_column ON large_table(column)"
  }
}
```

### 2. 메모리 부족
**증상**: 큰 결과셋 조회시 메모리 오류
**해결**:
- MAX_ROWS 설정 줄이기
- LIMIT 절 사용
- 페이징 처리

## 🔄 복구 방법

### 1. 커넥션 풀 재시작
```javascript
// 서버 재시작 (프로세스 종료 후 다시 시작)
process.exit(0);  // 서버 종료
npm start         // 재시작
```

### 2. 설정 초기화
```bash
# 백업 생성
cp .env.local .env.local.backup

# 기본 설정으로 복원
cp .env.example .env.local
```

## 📞 지원 요청

### 버그 리포트시 포함할 정보
1. **환경 정보**: OS, Node.js 버전, 패키지 버전
2. **오류 메시지**: 전체 스택 트레이스
3. **설정 파일**: 민감 정보 제거한 .env 내용
4. **재현 과정**: 오류 발생까지의 단계별 과정

### 문의 채널
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Discussions**: 사용법 관련 질문
- **Wiki**: 커뮤니티 가이드 및 팁

---

**추가 도움이 필요하면 [GitHub Issues](https://github.com/your-repo/database-mcp/issues)에 문의하세요.**
