import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',

  use: {
    baseURL: 'https://visat-manager.vercel.app',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})