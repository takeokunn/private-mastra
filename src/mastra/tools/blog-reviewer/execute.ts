import type { BlogReviewerInput, BlogReviewerOutput } from "./types";

/**
 * ブログ記事をレビューする Tool の実行関数（プレースホルダー）
 * @param input レビュー対象のブログ記事情報
 * @returns レビュー結果
 */
export const executeBlogReviewer = async (
  input: BlogReviewerInput,
): Promise<BlogReviewerOutput> => {
  console.log("Executing Blog Reviewer Tool with input:", input);
  // TODO: ここに実際のレビューロジックを実装する
  // (例: LLM APIを呼び出して記事内容を評価・提案生成)

  // ダミーのレスポンス
  const dummyOutput: BlogReviewerOutput = {
    summary: `記事「${
      input.contentOrUrl.substring(0, 30)
    }...」のレビュー結果です。`,
    suggestions: [
      "改善点1: タイトルをより具体的にする。",
      "改善点2: 導入部で読者の興味を引く工夫をする。",
      "改善点3: 図や画像を効果的に使用する。",
    ],
  };

  return dummyOutput;
};
