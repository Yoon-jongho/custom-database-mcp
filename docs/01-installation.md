# 📦 Database-MCP 설치 가이드

## 📋 시스템 요구사항

### 필수 요구사항
- **Node.js**: v18.0.0 이상 (LTS 권장)
- **npm**: v8.0.0 이상 또는 **yarn**: v1.22.0 이상
- **Git**: 코드 다운로드 및 버전 관리용

### 지원하는 데이터베이스
- **MySQL**: v5.7 이상
- **MariaDB**: v10.3 이상  
- **PostgreSQL**: v12 이상

## 🚀 설치 과정

### 1단계: 저장소 클론
```bash
# GitHub에서 클론 (추후 배포 후)
git clone https://github.com/your-username/database-mcp.git
cd database-mcp

# 또는 ZIP 다운로드 후 압축 해제
```

### 2단계: 의존성 설치
```bash
# npm 사용시
npm install

# yarn 사용시  
yarn install
```

### 3단계: 환경 설정 파일 생성
```bash
# 예제 파일을 복사하여 환경 설정 파일 생성
cp .env.example .env.local

# 또는 직접 생성
touch .env.local
```

### 4단계: 환경 설정 편집
`.env.local` 파일을 열어서 데이터베이스 정보를 입력합니다.

```bash
# 편집기로 열기 (VS Code 예시)
code .env.local

# 또는 다른 편집기
vim .env.local
nano .env.local
```

### 5단계: 연결 테스트
```bash
# 테스트 클라이언트 실행
node test-client.js

# 또는 서버 직접 실행
npm start
```

## ✅ 설치 확인

### 성공적인 설치 확인 방법

1. **의존성 설치 확인**
   ```bash
   npm list --depth=0
   ```
   필수 패키지들이 모두 설치되었는지 확인

2. **환경 설정 확인**
   ```bash
   node -e "import config from './src/config.js'; console.log('DB 개수:', config.databases.size)"
   ```

3. **DB 연결 테스트**
   ```bash
   node test-client.js
   ```
   모든 설정된 DB에 연결이 성공해야 함

### 예상 출력 결과
```
Database MCP server started
✅ 클라이언트가 서버에 연결되었습니다.
🔄 현재 환경 확인...
총 3개 DB 중 3개 연결 성공
```

## 🔧 개발 환경 설정 (선택사항)

### 개발 도구 설치
```bash
# nodemon (자동 재시작)
npm install -g nodemon

# 또는 프로젝트에만 설치
npm install --save-dev nodemon
```

### 개발 스크립트 추가
`package.json`에 개발용 스크립트 추가:
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "test": "node test-client.js"
  }
}
```

### VS Code 설정 (추천)
`.vscode/settings.json` 파일 생성:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.eol": "\n"
}
```

## 🐳 Docker 환경에서 설치

### Docker Compose 사용
```yaml
# docker-compose.yml 예시
version: '3.8'
services:
  database-mcp:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=local
    depends_on:
      - mysql
      - postgres
      
  mysql:
    image: mariadb:10.11
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: testdb
    ports:
      - "3306:3306"
      
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
    ports:
      - "5432:5432"
```

## ❌ 일반적인 설치 오류

### Node.js 버전 오류
```bash
# 오류: Node.js 버전이 낮음
Error: Requires Node.js v18.0.0 or higher

# 해결: nvm으로 최신 버전 설치
nvm install --lts
nvm use --lts
```

### 권한 오류 (macOS/Linux)
```bash
# 오류: npm 권한 문제
Error: EACCES: permission denied

# 해결: nvm 사용 또는 권한 변경
sudo chown -R $(whoami) ~/.npm
```

### 네트워크 오류
```bash
# 오류: 네트워크 타임아웃
Error: network timeout

# 해결: npm 레지스트리 변경
npm config set registry https://registry.npmjs.org/
```

## 🔄 업데이트 방법

### Git으로 업데이트
```bash
# 최신 코드 가져오기
git pull origin main

# 의존성 업데이트
npm install

# 설정 파일 확인 (새로운 설정이 추가되었을 수 있음)
diff .env.example .env.local
```

### 수동 업데이트
```bash
# 새 버전 다운로드
# 기존 .env.local 백업
cp .env.local .env.local.backup

# 새 코드로 교체
# 설정 파일 복원
cp .env.local.backup .env.local
```

## 📞 도움이 필요한 경우

### 문서 참조 순서
1. **[설정 가이드](02-configuration.md)** - 환경 설정 상세 방법
2. **[기본 사용법](03-basic-usage.md)** - 첫 번째 DB 연결 테스트
3. **[트러블슈팅](05-troubleshooting.md)** - 일반적인 문제 해결

### 커뮤니티 지원
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Discussions**: 일반적인 질문 및 사용법 문의
- **Wiki**: 커뮤니티가 작성한 팁과 가이드

---

**다음 단계**: [환경 설정 가이드](02-configuration.md)를 확인하여 데이터베이스 연결을 설정하세요.
