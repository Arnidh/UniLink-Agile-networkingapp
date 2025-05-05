
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Configure the test environment
    environment: 'jsdom', // Use jsdom to simulate a browser environment
    globals: true, // Make globals like `describe`, `it`, and `expect` available
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Test file patterns
    coverage: {
      provider: 'v8', // Use V8 for better coverage reporting
      reporter: ['text', 'json', 'html', 'lcov'], // Configure coverage reports
      include: ['src/**/*.{ts,tsx}'], // Specify which files to track coverage for
      exclude: [
        'src/**/*.d.ts', 
        'src/main.tsx', 
        'src/vite-env.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/utils/test-utils.tsx',
        'src/setupTests.ts'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    },
    // Setup file to run before tests
    setupFiles: [join(__dirname, './src/setupTests.ts')],
    alias: {
      '@': join(__dirname, 'src'), // Add alias for easier imports
    },
    // Transform settings if needed
    transformMode: {
      web: [/\.jsx$/, /\.tsx$/], // Apply transformations to JSX/TSX files
    },
    // Customize test run options
    reporters: ['default', 'html'],
    outputFile: 'test-results.html'
  },
});
