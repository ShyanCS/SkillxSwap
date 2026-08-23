import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      // Test scaffolding and the entry graph are not unit-test targets.
      exclude: ['src/test/**', 'src/main.jsx', 'dist/**'],
      // Deliberate floor, not a destination: the suite currently pins the
      // logger, ErrorBanner, and the two busiest list/action pages. Raise
      // this as each extraction phase lands with its own tests.
      thresholds: {
        statements: 10,
        branches: 5,
        functions: 10,
        lines: 10,
      },
    },
  },
});
