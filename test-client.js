// test-client.js - 다중 DB 테스트 클라이언트
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 1. 서버 프로세스를 시작하도록 transport 설정
  const transport = new StdioClientTransport({
    command: "npm",
    args: ["start"],
    logMessages: true,
  });

  // 2. MCP 클라이언트 생성
  const client = new Client({
    name: "database-mcp-tester",
    version: "1.0.0",
  });

  let serverProcess;

  try {
    // 3. transport를 사용해 서버에 연결
    serverProcess = await client.connect(transport);
    console.log("✅ 클라이언트가 서버에 연결되었습니다.");

    // 4. 다중 DB 기능 테스트
    await runMultiDbTests(client);

  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
  } finally {
    // 5. 서버 프로세스 종료
    if (serverProcess) {
      serverProcess.kill();
    }
    console.log("\n⏹️ 테스트가 종료되었습니다.");
  }
}

/**
 * 다중 DB 기능 테스트 실행
 */
async function runMultiDbTests(client) {
  const tests = [
    {
      name: "현재 환경 확인",
      tool: "get_current_environment",
      args: {},
    },
    {
      name: "DB 연결 상태 확인",
      tool: "check_db_connections", 
      args: {},
    },
    {
      name: "설정된 데이터베이스 목록",
      tool: "list_databases",
      args: {},
    },
    {
      name: "기본 DB 테이블 목록",
      tool: "list_tables",
      args: {},
    },
    {
      name: "ino_maria DB 테이블 목록",
      tool: "list_tables",
      args: { database_name: "ino_maria" },
    },
    {
      name: "urwi_users DB 테이블 목록", 
      tool: "list_tables",
      args: { database_name: "urwi_users" },
    },
    {
      name: "urwi_feeds DB 테이블 목록",
      tool: "list_tables", 
      args: { database_name: "urwi_feeds" },
    },
    {
      name: "ino_maria DB 통계",
      tool: "get_db_statistics",
      args: { database_name: "ino_maria" },
    },
  ];

  for (const test of tests) {
    try {
      console.log(`\n🔄 ${test.name}...`);
      const response = await client.callTool({
        name: test.tool,
        arguments: test.args,
      });

      // 응답 처리
      if (response.toolResult && response.toolResult.content[0].type === "text") {
        const resultText = response.toolResult.content[0].text;
        console.log("----------< 서버 응답 >----------");
        
        try {
          const parsedResult = JSON.parse(resultText);
          console.log(JSON.stringify(parsedResult, null, 2));
        } catch (e) {
          console.log(resultText);
        }
        console.log("---------------------------------");
      } else {
        console.log("알 수 없는 응답 형식:", response);
      }

    } catch (error) {
      console.error(`❌ ${test.name} 실패:`, error.message);
    }
  }
}

main();
