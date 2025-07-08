// 환경 전환 관련 도구들
export const environmentTools = [
  {
    name: "switch_environment",
    description: "DB 환경 전환 (local/test)",
    inputSchema: {
      type: "object",
      properties: {
        environment: {
          type: "string",
          enum: ["local", "test"],
          description: "전환할 환경",
        },
      },
      required: ["environment"],
    },
    handler: async ({ environment }) => {
      if (environment === "production") {
        throw new Error("프로덕션 환경은 접근 불가");
      }
      process.env.NODE_ENV = environment;
      return `환경이 ${environment}로 전환되었습니다.`;
    },
  },

  {
    name: "get_current_environment",
    description: "현재 DB 환경 확인",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      return `현재 환경: ${process.env.NODE_ENV || "local"}`;
    },
  },
];
