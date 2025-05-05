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
      reporter: ['text', 'json', 'html'], // Configure coverage reports
      include: ['src/**/*.{ts,tsx}'], // Specify which files to track coverage for
      exclude: ['src/**/*.d.ts'], // Exclude type definition files from coverage
    },
    // Setup file to run before tests (useful for global test setup)
    setupFiles: [join(__dirname, './src/setupTests.ts')],
    alias: {
      '@': join(__dirname, 'src'), // Add alias for easier imports
    },
    // Transform settings if needed
    transformMode: {
      web: [/\.jsx$/, /\.tsx$/], // Apply transformations to JSX/TSX files
    },
    // Customize test run options
    reporters: 'default', // You can change this to 'dot' or 'json' depending on your needs
  },
});
