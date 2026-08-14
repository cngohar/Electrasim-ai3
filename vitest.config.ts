/// <reference types="vitest/config" />
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Vitest config (separate from vite.config.ts to keep dev/build lean).
 *
 * - jsdom env so React component tests can render against a virtual DOM.
 * - Globals enabled so tests can use `describe/it/expect` without imports.
 * - Coverage via v8 (Node-native, fast). Results land in /coverage.
 * - App and Astro helper tests run under one root quality gate.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'astro-site/src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: ['node_modules/', 'dist/', 'e2e/', '**/*.config.*', 'src/main.tsx', 'src/test/**'],
    },
  },
});
