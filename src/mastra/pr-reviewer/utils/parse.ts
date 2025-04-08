import type { PrUrlParts } from "../types";

/**
 * GitHub PR URL を解析し、owner, repo, pull number を抽出する
 *
 * @param prUrl 解析対象の PR URL。
 * @returns 解析された PR URL の構成要素。
 * @throws {Error} 不正な URL フォーマットの場合。
 */
export const parsePrUrl = (prUrl: string): PrUrlParts => {
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) {
    throw new Error(
      "[InvalidUrl] 不正な PR URL フォーマットです。期待されるフォーマット: https://github.com/owner/repo/pull/number",
    );
  }

  return {
    owner: match[1],
    repo: match[2],
    pull_number: parseInt(match[3], 10),
  };
};
