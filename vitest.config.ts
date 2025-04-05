import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // describe, it, expectなどをグローバルに利用可能にする
    environment: 'node', // Node.js環境でテストを実行
    include: ['src/**/*.spec.ts'],
    // 必要に応じてカバレッジ設定などを追加
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
    },
  }
});
