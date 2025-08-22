import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    alias: {
      '@': resolve(__dirname, './'),
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/android/**',
      '**/ios/**',
      '**/coverage/**',
      '**/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      all: true,
      include: [
        'utils/**/*.{ts,tsx}',
        'lib/auth.ts',
        'lib/debug.ts',
        'lib/supabase.ts',
      ],
      exclude: [
        'node_modules/',
        'test/',
        'coverage/',
        'e2e/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{js,ts,mjs}',
        'app.json',
        'babel.config.js',
        'eas.json',
        'docs/',
        'android/',
        'ios/',
        '**/__tests__/**',
        '**/node_modules/**',
        '**/dist/**',
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
      },
      watermarks: {
        statements: [60, 80],
        functions: [60, 80],
        branches: [60, 80],
        lines: [60, 80],
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
