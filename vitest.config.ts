import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    // Use node environment by default (for Server Component tests)
    environment: 'node',
    // Client component tests specify 'happy-dom' environment via comment directive
    // Add: /** @vitest-environment happy-dom */ at the top of test files
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
