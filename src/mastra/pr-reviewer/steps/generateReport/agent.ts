import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

const instructions = `
あなたはプロのソフトウェアエンジニアです。
あなたは厳格かつ誠実にレビューすることを求められています。
`;

export const agent = new Agent({
  name: "Pull Request Agent",
  instructions,
  model: google("gemini-1.5-flash-latest"),
});
