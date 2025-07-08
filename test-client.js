// test-client.js
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

    // 4. 'list_tables' 도구 호출
    console.log("\n🔄 'list_tables' 도구를 호출합니다...");
    const response = await client.callTool({
      name: "list_tables",
      arguments: {},
    });

    // 5. 결과 출력 (응답 구조 수정)
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
    console.error("❌ 테스트 중 오류 발생:", error);
  } finally {
    // 6. 서버 프로세스 종료
    if (serverProcess) {
      serverProcess.kill();
    }
    console.log("\n⏹️ 테스트가 종료되었습니다.");
  }
}

main();