/**
 * Blog Reviewer Tool の入力型
 */
export type BlogReviewerInput = {
  /** レビュー対象のブログ記事の内容またはURL */
  contentOrUrl: string;
};

/**
 * Blog Reviewer Tool の出力型
 */
export type BlogReviewerOutput = {
  /** レビュー結果のサマリー */
  summary: string;
  /** 提案事項のリスト */
  suggestions: string[];
};
