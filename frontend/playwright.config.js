import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  workers: 1, // serial execution to avoid database race conditions
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'off',
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
})
