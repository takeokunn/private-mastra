import { createAgent } from "@/utils/create-agent"; // ユーティリティ関数が存在すると仮定
import {
  DesignDocsReviewerInputSchema,
  DesignDocsReviewerOutputSchema,
} from "../types";
// import { tools } from "../tools"; // エージェントがツールを必要とする場合にインポート

export const designDocsReviewerAgent = createAgent({
  name: "designDocsReviewerAgent",
  description: "指定されたURLに基づいてデザインドキュメントをレビューします。",
  // tools: tools, // 必要であればここでツールを追加
  inputTypeDef: DesignDocsReviewerInputSchema,
  outputTypeDef: DesignDocsReviewerOutputSchema,
  async run(input) {
    // TODO: デザインドキュメントを取得し、分析し、レビューを返すロジックを実装します。
    console.log(`デザインドキュメントをレビュー中: ${input.docUrl}`);

    // プレースホルダー実装
    await new Promise((resolve) => setTimeout(resolve, 100)); // 作業をシミュレート

    // 例：必要であればツールを呼び出す
    // const analysisResult = await designDocReviewerTool.execute({ docUrl: input.docUrl });

    return {
      message: `デザインドキュメント ${input.docUrl} をレビューしました（プレースホルダー）。`,
      // suggestions: ["図をもっと追加することを検討してください。", "セクション3を明確にしてください。"], // 提案の例
    };
  },
});
