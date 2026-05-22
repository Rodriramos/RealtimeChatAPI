import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',        // simula el DOM del navegador
    globals: true,               // permite usar describe/it/expect sin imports
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
  },
})