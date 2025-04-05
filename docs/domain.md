# Mastra 開発ドメイン概要

Mastra は、AI アプリケーションと機能を構築するためのプリミティブを提供する、TypeScript ベースのオープンソース AI エージェントフレームワークです。

Mastra を使用した開発は、主に以下のコアコンポーネントと概念に基づいています。

## 関連リンク

https://mastra.ai/docs/getting-started/project-structure

## 主要コンポーネント

1.  **エージェント (Agents):**
    *   記憶（Memory）を持ち、ツール（Tools）を実行できるインテリジェントな AI エンティティ。
    *   ユーザーとの対話やタスクの実行が可能です。
    *   [エージェント概要](https://mastra.ai/docs/agents/overview)

2.  **ツール (Tools):**
    *   エージェントが特定のタスクを実行するために呼び出すことができる関数。
    *   [`createTool()`](https://mastra.ai/docs/reference/agents/createTool) を使用して定義され、入力と出力のスキーマ（Zod を使用）を持ちます。
    *   例: 外部 API の呼び出し、データベース検索、計算など。
    *   [ツールの追加](https://mastra.ai/docs/agents/adding-tools)

3.  **ワークフロー (Workflows):**
    *   LLM コールやその他のロジックを決定論的な順序で実行するためのグラフベースのエンジン。
    *   ステップ（Steps）、制御フロー（Control Flow: `.then()`, `.after()`, `.if()` など）、変数（Variables）、中断/再開（Suspend & Resume）などの機能を提供します。
    *   複雑なプロセスやタスクの自動化に適しています。
    *   [ワークフロー概要](https://mastra.ai/docs/workflows/overview)

4.  **RAG (Retrieval-Augmented Generation):**
    *   ドキュメント（テキスト、HTML、Markdown、JSON など）を処理（チャンキング）、埋め込み（Embedding）を作成し、ベクトルデータベース（Vector Databases）に保存します。
    *   クエリ時に、関連性の高い情報をデータベースから取得（Retrieval）し、それをコンテキストとして LLM に提供することで、より正確で根拠のある応答を生成します。
    *   [RAG 概要](https://mastra.ai/docs/rag/overview)

5.  **メモリ (Memory):**
    *   エージェントの会話履歴や状態を永続化するための仕組み。
    *   Postgres, LibSQL, Upstash などのストレージオプションがあります。
    *   会話スレッドの管理や、関連情報の検索（時間、意味的類似性）が可能です。
    *   [エージェントメモリ](https://mastra.ai/docs/agents/agent-memory)

6.  **評価 (Evals):**
    *   LLM の出力品質を評価するためのフレームワーク。
    *   毒性、バイアス、関連性、事実の正確さなどの組み込みメトリクスや、カスタム評価を定義できます。
    *   [評価概要](https://mastra.ai/docs/evals/overview)

7.  **音声 (Voice):**
    *   テキスト読み上げ（Text-to-Speech）および音声認識（Speech-to-Text）機能を提供し、音声ベースのインタラクションを可能にします。
    *   [音声概要](https://mastra.ai/docs/voice/overview)

## 開発プロセスとツール

*   **ローカル開発環境:** `mastra dev` コマンドで起動し、開発中のエージェントと対話したり、状態やメモリを確認したりできます。 ([開発環境](https://mastra.ai/docs/local-dev/mastra-dev))
*   **モデルルーティング:** Vercel AI SDK を介して、複数の LLM プロバイダー（OpenAI, Anthropic, Google Gemini など）を統一的に扱います。
*   **デプロイメント:** 作成したエージェントやワークフローを、既存の Node.js アプリケーションに組み込んだり、Hono ベースのサーバーとしてバンドルしたり、サーバーレスプラットフォーム（Vercel, Cloudflare Workers, Netlify）にデプロイしたりできます。 ([デプロイメント](https://mastra.ai/docs/deployment/deployment))
*   **オブザーバビリティ:** ロギングとトレースを通じて、アプリケーションの動作を監視し、デバッグやパフォーマンス分析に役立てます。 ([オブザーバビリティ](https://mastra.ai/docs/observability/logging))

これらのコンポーネントとツールを組み合わせることで、開発者は高度な AI 機能を持つアプリケーションを効率的に構築できます。
