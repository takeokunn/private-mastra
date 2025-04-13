# ブログレビュー担当エージェント(blog-reviewer)

このドキュメントはブログレビュー担当エージェントについて説明します。

## 概要

`blogReviewerAgent` は、指定されたURLのブログ記事をレビューするために設計されています。コンテンツを分析し、フィードバックを提供します。

## 機能

- 提供されたURLからブログ記事のコンテンツを取得します。
- 事前定義された基準に基づいてコンテンツを分析します（TODO: 基準を特定）。
- レビューメッセージと改善提案（オプション）を返します。

## 使用方法

エージェントへの入力としてブログ記事のURLを提供します。

```typescript
import { blogReviewerAgent } from "./agents";

const result = await blogReviewerAgent.run({ url: "https://example.com/blog/post" });
console.log(result);
```

## 今後の拡張機能

- 詳細な分析ロジックを実装します。
- 具体的なレビュー基準を定義します。
- コンテンツ取得と分析のためのツールを追加します。
- Zodを使用して入力および出力タイプを定義します。
