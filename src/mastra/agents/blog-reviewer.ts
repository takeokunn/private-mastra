import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { blogReviewerTool } from "../tools/blog-reviewer"; // 作成したToolをインポート
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseToolInterface } from "@langchain/core/tools";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";

// TODO: 環境変数からAPIキーなどを読み込む設定を追加する
// import { getEnvironmentVariable } from "@langchain/core/utils/env";
// const OPENAI_API_KEY = getEnvironmentVariable("OPENAI_API_KEY");

// 使用するモデルを定義 (例: OpenAI)
// 必要に応じてモデルや設定を変更してください
const model = new ChatOpenAI({
  // apiKey: OPENAI_API_KEY,
  model: "gpt-4o", // modelName ではなく model を使用 (v0.2.x以降)
  temperature: 0.7,
});

// Agentが使用するツールをリスト化
const tools: BaseToolInterface[] = [blogReviewerTool];

// Agentのプロンプトテンプレートを定義
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "あなたは優秀なブログ記事編集者です。提供されたツールを使って記事をレビューし、具体的な改善提案を行ってください。"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"], // Agentの思考プロセス用
]);

// Agentを作成 (LangChain の createToolCallingAgent を使用)
const agent = createToolCallingAgent({
  llm: model,
  tools,
  prompt: promptTemplate,
});

// AgentExecutor を作成
const blogReviewerAgent = new AgentExecutor({
  agent,
  tools,
  verbose: true, // 実行ログを表示する場合
});

// AgentExecutorをエクスポート
export { blogReviewerAgent };
