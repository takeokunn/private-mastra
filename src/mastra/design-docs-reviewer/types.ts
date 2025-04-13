import { z } from "zod";

// エージェントの入力型を定義
export const DesignDocsReviewerInputSchema = z.object({
  docUrl: z.string().url("デザインドキュメントのURL形式が無効です。"),
  // 必要に応じて他の関連する入力フィールドを追加（例：レビュー基準）
});
export type DesignDocsReviewerInput = z.infer<
  typeof DesignDocsReviewerInputSchema
>;

// エージェントの出力型を定義
export const DesignDocsReviewerOutputSchema = z.object({
  message: z.string(),
  suggestions: z.array(z.string()).optional(),
  // 必要に応じて他の関連する出力フィールドを追加
});
export type DesignDocsReviewerOutput = z.infer<
  typeof DesignDocsReviewerOutputSchema
>;

// 必要であればツールの型を定義
export const DesignDocAnalysisSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  // 他の分析フィールドを追加
});
export type DesignDocAnalysis = z.infer<typeof DesignDocAnalysisSchema>;
