import { describe, expect, it } from "vitest";
import { outputFormat } from "./output";

describe("outputFormat", () => {
  it("should return the correct org format string with the provided title", () => {
    const title = "テストタイトル";
    const expectedOutput = `
# 出力フォーマット（org）

以下の形式で出力してください。

\`\`\`org
* ${title}
** コメント

[総評を可能な限り箇条書きで出力]

** 評価

[問題がある箇所を可能な限り箇条書きで出力]

** 構造的懸念・改善提案

[提案を可能な限り箇条書きで出力]
\`\`\`
`;
    expect(outputFormat(title)).toBe(expectedOutput);
  });

  it("should handle different titles correctly", () => {
    const title = "別のテストタイトル";
    const expectedOutput = `
# 出力フォーマット（org）

以下の形式で出力してください。

\`\`\`org
* ${title}
** コメント

[総評を可能な限り箇条書きで出力]

** 評価

[問題がある箇所を可能な限り箇条書きで出力]

** 構造的懸念・改善提案

[提案を可能な限り箇条書きで出力]
\`\`\`
`;
    expect(outputFormat(title)).toBe(expectedOutput);
  });
});
