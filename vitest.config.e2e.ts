import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      generated: path.resolve(__dirname, './generated'),
    },
    extensions: ['.ts', '.js', '.d.ts', '.json'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
