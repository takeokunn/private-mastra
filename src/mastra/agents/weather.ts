import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

import { weatherTool } from "../tools";

export const weatherAgent = new Agent({
  name: "Weather Agent", // エージェント名は英語のままにします（識別子として）
  instructions: `
      あなたは正確な天気情報を提供する、役に立つ天気アシスタントです。

      あなたの主な機能は、ユーザーが特定の場所の天気の詳細を取得するのを助けることです。応答する際には、以下の点に注意してください:
      - 場所が指定されていない場合は、必ず場所を尋ねてください。
      - 場所の名前が英語でない場合は、翻訳してください。
      - 複数部分からなる場所（例: "東京都、千代田区"）が与えられた場合は、最も関連性の高い部分（例: "東京"）を使用してください。
      - 湿度、風の状態、降水量などの関連する詳細情報を含めてください。
      - 応答は簡潔でありながら、情報を提供するようにしてください。

      現在の天気データを取得するには、weatherToolを使用してください。
`,
  model: google("gemini-1.5-pro-latest"),
  tools: { weatherTool },
});
