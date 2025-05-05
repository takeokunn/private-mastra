import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@src/mastra': path.resolve(__dirname, 'src/mastra'),
    },
  },

  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    env: {
      GITHUB_TOKEN: "github-token"
    }
  },
});
