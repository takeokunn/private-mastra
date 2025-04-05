# Mastra フレームワーク コーディングルール

## 1. プロジェクト構造

### 1.1 ディレクトリ構造
```
src/
├── agents/         # AIエージェント定義
├── tools/          # エージェントツール実装
├── workflows/      # ワークフロー実装
│   ├── steps/      # ワークフローステップ
│   └── index.ts    # ワークフローのエクスポート
├── rag/            # RAG (検索拡張生成) コンポーネント
│   ├── sources/    # データソース
│   └── retrievers/ # 検索実装
├── integrations/   # 外部サービス統合
├── utils/          # ユーティリティ関数
├── types/          # 型定義
├── evals/          # 評価フレームワーク
└── index.ts        # メインエントリーポイント
```

### 1.2 ファイル命名
- エージェント: `<name>.agent.ts`
- ツール: `<name>.tool.ts`
- ワークフロー: `<name>.workflow.ts`
- ワークフローステップ: `<name>.step.ts`
- RAGコンポーネント: `<name>.retriever.ts`
- 型定義: `<name>.types.ts`
- エバリュエーター: `<name>.eval.ts`

## 2. コード構成

### 2.1 インポート/エクスポート
- 名前付きエクスポート/インポートを優先する
```typescript
// 推奨
export { MyAgent };
import { MyAgent } from './agents/my.agent';

// 非推奨（特別な理由がない限り）
export default MyAgent;
import MyAgent from './agents/my.agent';
```

- インポートの順序
```typescript
// 1. 外部パッケージ（アルファベット順）
import { z } from 'zod';

// 2. Mastraコアインポート
import { Mastra, Agent, Tool } from '@mastra/core';

// 3. プロジェクト内のモジュール（パスの浅い順）
import { SomeType } from '../types';
import { utilFunction } from '../utils';
import { MyTool } from './tools';
```

### 2.2 パスエイリアス
- パスエイリアスを使用してディープなインポートを避ける
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@agents/*": ["./src/agents/*"],
      "@tools/*": ["./src/tools/*"],
      "@workflows/*": ["./src/workflows/*"]
    }
  }
}

// 使用例
import { ChatAgent } from '@/agents/chat.agent';
```

## 3. エージェント実装

### 3.1 エージェント定義
```typescript
import { Agent, createAgent } from '@mastra/core';
import { z } from 'zod';

// エージェントのスキーマを定義
const inputSchema = z.object({
  query: z.string().describe('ユーザーからの質問'),
});

const outputSchema = z.object({
  response: z.string().describe('エージェントの応答'),
});

// エージェントの実装
export const myAgent = createAgent({
  name: 'MyAgent',
  description: 'ユーザーの質問に答えるエージェント',
  inputSchema,
  outputSchema,
  tools: [/* ツールリスト */],
  systemPrompt: `あなたは役立つAIアシスタントです。`,
  execute: async ({ input, tools, llm }) => {
    // エージェントロジックの実装
    const response = await llm.chat({
      messages: [{ role: 'user', content: input.query }],
    });

    return {
      response: response.message.content,
    };
  },
});
```

### 3.2 ツール実装
```typescript
import { createTool } from '@mastra/core';
import { z } from 'zod';

export const searchTool = createTool({
  name: 'search',
  description: 'ウェブで情報を検索します',
  inputSchema: z.object({
    query: z.string().describe('検索クエリ'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
    })),
  }),
  execute: async ({ input, integrations }) => {
    // ツールの実装
    const results = await integrations.searchProvider.search(input.query);

    return {
      results: results.map(result => ({
        title: result.title,
        url: result.url,
        snippet: result.snippet,
      })),
    };
  },
});
```

## 4. ワークフロー実装

### 4.1 ワークフロー定義
```typescript
import { createWorkflow } from '@mastra/core';
import { analyzeQueryStep } from './steps/analyze-query.step';
import { retrieveDataStep } from './steps/retrieve-data.step';
import { generateResponseStep } from './steps/generate-response.step';

export const searchAndAnswerWorkflow = createWorkflow({
  name: 'SearchAndAnswer',
  description: '質問を分析し、データを検索して回答を生成するワークフロー',
  steps: [
    analyzeQueryStep,
    retrieveDataStep,
    generateResponseStep,
  ],
});
```

### 4.2 ステップ実装
```typescript
import { createStep } from '@mastra/core';
import { z } from 'zod';

export const analyzeQueryStep = createStep({
  name: 'AnalyzeQuery',
  description: 'ユーザーの質問を分析し、検索キーワードを抽出します',
  inputSchema: z.object({
    query: z.string().describe('ユーザーの質問'),
  }),
  outputSchema: z.object({
    keywords: z.array(z.string()).describe('抽出されたキーワード'),
    intent: z.string().describe('ユーザーの意図'),
  }),
  execute: async ({ input, llm }) => {
    // ステップの実装
    const response = await llm.chat({
      messages: [
        {
          role: 'system',
          content: 'あなたは質問分析のスペシャリストです。質問からキーワードと意図を抽出してください。',
        },
        {
          role: 'user',
          content: `以下の質問を分析してください: "${input.query}"`,
        },
      ],
      responseFormat: { type: 'json_object' },
    });

    const result = JSON.parse(response.message.content);

    return {
      keywords: result.keywords,
      intent: result.intent,
    };
  },
});
```

## 5. RAG実装

### 5.1 レトリーバー
```typescript
import { createRetriever } from '@mastra/core';
import { z } from 'zod';

export const documentRetriever = createRetriever({
  name: 'DocumentRetriever',
  description: 'ドキュメントコレクションから関連情報を検索します',
  inputSchema: z.object({
    query: z.string().describe('検索クエリ'),
    limit: z.number().optional().default(5).describe('返す結果の最大数'),
  }),
  outputSchema: z.object({
    documents: z.array(z.object({
      content: z.string(),
      metadata: z.record(z.string(), z.any()),
    })),
  }),
  execute: async ({ input, integrations }) => {
    // レトリーバーの実装
    const results = await integrations.vectorStore.search({
      query: input.query,
      limit: input.limit,
    });

    return {
      documents: results,
    };
  },
});
```

## 6. 型定義

### 6.1 スキーマ駆動型開発
- Zodスキーマを使用して型安全性を確保する
```typescript
// types/user.types.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
  }),
});

export type User = z.infer<typeof userSchema>;
```

### 6.2 型定義ファイル
- 複雑な型や再利用される型は専用のファイルに定義する
```typescript
// types/common.types.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}
```

## 7. エラー処理

### 7.1 エラーハンドリング
```typescript
import { createWorkflow, WorkflowError } from '@mastra/core';

export const robustWorkflow = createWorkflow({
  name: 'RobustWorkflow',
  description: 'エラー処理を備えたワークフロー',
  steps: [/* ステップリスト */],
  onError: async (error, context) => {
    if (error instanceof WorkflowError) {
      // ワークフロー特有のエラー処理
      context.logger.error(`ワークフローエラー: ${error.message}`, {
        stepName: error.stepName,
        inputs: error.inputs,
      });

      // エラーからの回復を試みる
      return {
        fallbackResult: 'エラーが発生しましたが、代替結果を提供します',
      };
    }

    // その他のエラー
    context.logger.error(`予期しないエラー: ${error.message}`);
    throw error; // エラーを再スロー
  },
});
```

### 7.2 カスタムエラー
```typescript
// utils/errors.ts
export class AgentError extends Error {
  constructor(
    message: string,
    public readonly agentName: string,
    public readonly inputs?: Record<string, any>
  ) {
    super(`Agent ${agentName}: ${message}`);
    this.name = 'AgentError';
  }
}

export class ToolError extends Error {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly inputs?: Record<string, any>
  ) {
    super(`Tool ${toolName}: ${message}`);
    this.name = 'ToolError';
  }
}
```

## 8. ロギングと可観測性

### 8.1 ロギング実装
```typescript
import { createLogger } from '@mastra/core';

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: 'json',
  transports: [
    { type: 'console' },
    // 本番環境では追加のトランスポート
    ...(process.env.NODE_ENV === 'production' ? [
      { type: 'file', filename: 'logs/app.log' }
    ] : []),
  ],
});

// 使用例
logger.info('ワークフローを開始します', { workflowName: 'SearchAndAnswer' });
logger.debug('LLMリクエスト', { prompt, parameters });
logger.error('エラーが発生しました', { error: err.message, stack: err.stack });
```

### 8.2 トレーシング
```typescript
import { startSpan } from '@mastra/core';

async function complexOperation() {
  // パフォーマンスのトレーシング
  const span = startSpan('complex-operation');

  try {
    // 操作の実行
    const result = await someExpensiveFunction();

    // スパンにメタデータを追加
    span.addAttributes({
      resultSize: result.length,
      processingTime: Date.now() - span.startTime,
    });

    return result;
  } catch (error) {
    // エラー情報をスパンに記録
    span.recordError(error);
    throw error;
  } finally {
    // スパンを終了
    span.end();
  }
}
```

## 9. テスト

### 9.1 Vitestの設定
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['**/*.spec.{ts,js}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/__tests__/**'],
    },
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    mockReset: true,
    clearMocks: true,
  },
});

// vitest.setup.ts
import { afterEach } from 'vitest';
import { cleanup } from 'some-testing-lib'; // 必要に応じて

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup();
});
```

### 9.2 ディレクトリ構造とファイル命名
```
src/
├── agents/
│   ├── my.agent.ts
│   └── __tests__/
│       └── my.agent.test.ts
├── tools/
│   ├── search.tool.ts
│   └── __tests__/
│       └── search.tool.test.ts
└── workflows/
    ├── qa.workflow.ts
    └── __tests__/
        └── qa.workflow.test.ts
```

または代替として：

```
src/
└── ...
tests/
├── unit/
│   ├── agents/
│   │   └── my.agent.test.ts
│   └── tools/
│       └── search.tool.test.ts
└── integration/
    └── workflows/
        └── qa.workflow.test.ts
```

### 9.3 ユニットテスト
```typescript
// agents/my.agent.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { myAgent } from './my.agent';

describe('MyAgent', () => {
  // テストごとに新しいモックを設定
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // テスト後のクリーンアップ
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should respond to user queries', async () => {
    // モックLLMの設定
    const mockLLM = {
      chat: vi.fn().mockResolvedValue({
        message: { role: 'assistant', content: 'これは回答です' },
      }),
    };

    // エージェントの実行
    const result = await myAgent.execute({
      input: { query: 'これは質問です' },
      llm: mockLLM,
      tools: [],
      integrations: {},
    });

    // 検証
    expect(mockLLM.chat).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({ content: 'これは質問です' }),
      ]),
    }));

    expect(result).toEqual({
      response: 'これは回答です',
    });
  });

  it('should handle errors gracefully', async () => {
    // エラーをスローするモックの設定
    const mockLLM = {
      chat: vi.fn().mockRejectedValue(new Error('LLMエラー')),
    };

    // エラーハンドリングのテスト
    await expect(myAgent.execute({
      input: { query: 'これは質問です' },
      llm: mockLLM,
      tools: [],
      integrations: {},
    })).rejects.toThrow('LLMエラー');
  });
});
```

### 9.4 モック活用パターン
```typescript
// tools/search.tool.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { searchTool } from './search.tool';

// 依存モジュールのモック
vi.mock('@some/external-api', () => ({
  search: vi.fn(),
}));

// 特定のモジュールから一部の関数だけをモック
import * as utils from '../../utils/http';
vi.spyOn(utils, 'fetchWithRetry').mockImplementation(async () => {
  return { data: 'モックデータ' };
});

describe('SearchTool', () => {
  it('should search and return results', async () => {
    // モック統合モジュールの設定
    const mockIntegrations = {
      searchProvider: {
        search: vi.fn().mockResolvedValue([
          { title: '結果1', url: 'http://example.com/1', snippet: '説明1' },
          { title: '結果2', url: 'http://example.com/2', snippet: '説明2' },
        ]),
      },
    };

    const result = await searchTool.execute({
      input: { query: '検索キーワード' },
      integrations: mockIntegrations,
    });

    expect(mockIntegrations.searchProvider.search).toHaveBeenCalledWith('検索キーワード');
    expect(result.results).toHaveLength(2);
    expect(result.results[0].title).toBe('結果1');
  });
});
```

### 9.5 テストフィクスチャとファクトリ
```typescript
// tests/fixtures/agent-fixtures.ts
import { Agent, Tool } from '@mastra/core';

/**
 * テスト用のモックエージェントを生成するファクトリ関数
 */
export function createMockAgent(overrides = {}) {
  return {
    name: 'MockAgent',
    description: 'テスト用のモックエージェント',
    execute: vi.fn().mockResolvedValue({ response: 'モック応答' }),
    ...overrides,
  };
}

/**
 * テスト用のモックツールを生成するファクトリ関数
 */
export function createMockTool(overrides = {}) {
  return {
    name: 'MockTool',
    description: 'テスト用のモックツール',
    execute: vi.fn().mockResolvedValue({ result: 'モック結果' }),
    ...overrides,
  };
}

/**
 * テスト用のモックLLMを生成するファクトリ関数
 */
export function createMockLLM(overrides = {}) {
  return {
    chat: vi.fn().mockResolvedValue({
      message: { role: 'assistant', content: 'モック応答' },
    }),
    ...overrides,
  };
}
```

### 9.6 統合テスト
```typescript
// workflows/qa.workflow.spec.ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { qaWorkflow } from './qa.workflow';
import { setupTestEnvironment, teardownTestEnvironment } from '../../test-utils';

describe('QA Workflow Integration', () => {
  // テスト環境のセットアップ（例：テスト用DBの準備など）
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  // テスト環境のクリーンアップ
  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('should process a query end-to-end', async () => {
    const result = await qaWorkflow.execute({
      input: { query: 'AIとは何ですか？' },
      // 実際の依存関係を注入するか、統合テスト用のモックを使用
    });

    expect(result).toMatchObject({
      answer: expect.any(String),
      sources: expect.arrayContaining([
        expect.objectContaining({
          title: expect.any(String),
          url: expect.any(String),
        }),
      ]),
    });
  });
});
```

### 9.7 スナップショットテスト
```typescript
// agents/utils/response-formatter.spec.ts
import { describe, it, expect } from 'vitest';
import { formatResponse } from './response-formatter';

describe('ResponseFormatter', () => {
  it('should format responses consistently', () => {
    const rawResponse = {
      answer: 'これは回答です',
      sources: [
        { title: 'ソース1', url: 'http://example.com/1' },
        { title: 'ソース2', url: 'http://example.com/2' },
      ],
      confidence: 0.95,
    };

    const formatted = formatResponse(rawResponse);

    // スナップショットと比較して一貫性を確認
    expect(formatted).toMatchSnapshot();
  });
});
```

### 9.8 パフォーマンステスト
```typescript
// agents/performance/large-context.spec.ts
import { describe, it, expect } from 'vitest';
import { generateResponse } from '../response-generator';

// パフォーマンステストはデフォルトで除外されることが多い
describe.skip('Performance Tests', () => {
  it('should handle large context efficiently', async () => {
    // 大量のコンテキストデータを生成
    const largeContext = Array(100).fill('テストコンテキスト文章').join(' ');

    const startTime = performance.now();

    await generateResponse({
      query: 'テスト質問',
      context: largeContext,
    });

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // 処理時間の上限を設定
    expect(executionTime).toBeLessThan(5000); // 5秒以内
  });
});
```

### 9.9 エバリュエーション
```typescript
// evals/accuracy.eval.ts
import { createEval } from '@mastra/core';

export const accuracyEval = createEval({
  name: 'AccuracyEval',
  description: '回答の正確性を評価します',
  evaluate: async ({ response, expectedAnswer, llm }) => {
    const evalPrompt = `
回答: ${response}
正解: ${expectedAnswer}

上記の回答は正解にどれくらい近いですか？
1（全く正しくない）から10（完全に正しい）のスケールで評価し、理由を説明してください。
評価は以下のJSON形式で返してください:
{ "score": <数値>, "reason": "<説明>" }
`;

    const evalResult = await llm.chat({
      messages: [{ role: 'user', content: evalPrompt }],
      responseFormat: { type: 'json_object' },
    });

    const result = JSON.parse(evalResult.message.content);

    return {
      score: result.score / 10, // 0-1のスケールに正規化
      reason: result.reason,
      metadata: {
        response,
        expectedAnswer,
      },
    };
  },
});
```

## 10. パフォーマンスと最適化

### 10.1 並列処理
```typescript
import { createWorkflow, parallel } from '@mastra/core';
import { step1, step2, step3 } from './steps';

export const efficientWorkflow = createWorkflow({
  name: 'EfficientWorkflow',
  description: '並列処理を活用した効率的なワークフロー',
  steps: [
    // 最初のステップ
    step1,

    // 並列実行するステップ
    parallel([step2, step3]),

    // 結果を組み合わせるステップ
    combinedResultsStep,
  ],
});
```

### 10.2 キャッシュ戦略
```typescript
import { createTool, createCache } from '@mastra/core';
import { z } from 'zod';

// キャッシュの設定
const cache = createCache({
  type: 'memory', // メモリキャッシュ（開発環境向け）
  // type: 'redis', // Redisキャッシュ（本番環境向け）
  // redisUrl: process.env.REDIS_URL,
  ttl: 60 * 60, // 1時間
});

// キャッシュを活用するツール
export const expensiveOperationTool = createTool({
  name: 'expensiveOperation',
  description: '計算コストの高い操作を実行します',
  inputSchema: z.object({
    parameter: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ input }) => {
    // キャッシュキーの作成
    const cacheKey = `expensive:${input.parameter}`;

    // キャッシュをチェック
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      return { result: cachedResult };
    }

    // 高コストな操作
    const result = await veryExpensiveComputation(input.parameter);

    // 結果をキャッシュに保存
    await cache.set(cacheKey, result);

    return { result };
  },
});
```

## 11. コード品質

### 11.1 リンター設定
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // mastra向けカスタムルール
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
```

### 11.2 フォーマッター設定
```javascript
// .prettierrc.js
module.exports = {
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
  printWidth: 100,
  arrowParens: 'avoid',
  bracketSpacing: true,
};
```

## 12. ドキュメンテーション

### 12.1 JSDoc
```typescript
/**
 * ユーザーからの質問に基づいて回答を生成するエージェント
 *
 * @param options - エージェント設定オプション
 * @param options.systemPrompt - エージェントのシステムプロンプト
 * @param options.tools - エージェントが使用できるツールのリスト
 * @param options.modelName - 使用するLLMモデル名
 *
 * @returns 設定されたエージェントインスタンス
 *
 * @example
 * ```typescript
 * const qaAgent = createQAAgent({
 *   systemPrompt: 'あなたは質問に答えるエキスパートです',
 *   tools: [searchTool],
 *   modelName: 'gpt-4',
 * });
 *
 * const result = await qaAgent.execute({
 *   input: { query: '東京の天気は？' }
 * });
 * ```
 */
export function createQAAgent(options: QAAgentOptions): Agent<QAInput, QAOutput> {
  // 実装
}
```

### 12.2 README
- 各ディレクトリにREADME.mdファイルを作成し、コンポーネントの役割と使用例を説明する
```markdown
# Agents

このディレクトリには、アプリケーションで使用されるAIエージェントが含まれています。

## 利用可能なエージェント

### ChatAgent

ユーザーとの会話を処理するエージェント。記憶機能を持ち、過去の対話を考慮して応答を生成します。

```typescript
import { chatAgent } from './chat.agent';

const response = await chatAgent.execute({
  input: {
    message: 'こんにちは！',
    conversationId: 'user123',
  }
});

console.log(response.reply);
```

### SearchAgent

ウェブ検索を実行し、結果を要約するエージェント。

```typescript
import { searchAgent } from './search.agent';

const response = await searchAgent.execute({
  input: { query: '最新のAI技術トレンド' }
});

console.log(response.summary);
console.log(response.sources);
```
```
