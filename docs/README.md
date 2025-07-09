# 📚 Database-MCP 가이드 모음

Database-MCP를 효과적으로 사용하기 위한 완전한 가이드입니다.

## 🚀 시작하기

### 1. [📦 설치 가이드](01-installation.md)
- 시스템 요구사항
- 단계별 설치 과정
- 개발 환경 설정
- Docker 환경 설정
- 일반적인 설치 오류 해결

### 2. [⚙️ 설정 가이드](02-configuration.md)
- 환경 설정 파일 구조
- Single DB vs Multi DB 설정
- 상세 설정 옵션
- 보안 고려사항
- 설정 예제 (로컬, 클라우드, Docker)

## 💡 사용법

### 3. [🚀 기본 사용법](03-basic-usage.md)
- 첫 번째 테스트 실행
- 주요 도구들 사용법
- 실제 사용 예제
- 보안 및 제한사항
- 성능 모니터링
- 최적 사용법 팁

### 4. [🎓 고급 사용법](04-advanced-usage.md)
- 환경 관리 및 전환
- 복잡한 쿼리 패턴
- 성능 최적화 기법
- 다중 DB 간 데이터 마이그레이션
- 사용자 정의 도구 개발

## 🔧 문제 해결

### 5. [🔧 트러블슈팅](05-troubleshooting.md)
- 일반적인 오류 및 해결법
- 디버깅 방법
- 성능 문제 진단
- 복구 절차
- 지원 요청 방법

## 📖 참고 자료

### 도구별 상세 사용법
- **데이터베이스 관리**: `list_databases`, `check_db_connections`
- **테이블 관리**: `list_tables`, `describe_table`
- **쿼리 실행**: `execute_query` (매개변수, 다중 DB)
- **환경 관리**: `get_current_environment`, `switch_environment`
- **성능 모니터링**: `get_db_statistics`

### 지원하는 데이터베이스
- **MySQL** (v5.7+)
- **MariaDB** (v10.3+)
- **PostgreSQL** (v12+)

### 환경별 제한사항
- **local**: 모든 작업 허용
- **test**: DELETE 작업 제한
- **production**: 읽기 전용 + 접근 차단

## 🎯 빠른 참조

### 기본 명령어
```bash
# 설치
npm install

# 설정
cp .env.example .env.local

# 테스트
node test-client.js

# 실행
npm start
```

### 필수 환경 변수
```bash
# Single DB
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_DATABASE=database

# Multi DB (권장)
DATABASES='[{"name":"db1","host":"localhost",...}]'
DEFAULT_DATABASE=db1
```

## 🤝 커뮤니티

- **GitHub Repository**: [database-mcp](https://github.com/your-repo/database-mcp)
- **Issues**: 버그 리포트 및 기능 요청
- **Discussions**: 사용법 질문 및 아이디어 공유
- **Wiki**: 커뮤니티 가이드 및 팁

---

**시작하려면 [설치 가이드](01-installation.md)부터 확인하세요!** 🚀
