const { defineConfig, devices } = require('@playwright/test');
const { uiBaseUrl, apiBaseUrl } = require('./src/utils/env');

module.exports = defineConfig({
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  outputDir: 'test-results',
  use: {
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: uiBaseUrl(),
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiBaseUrl(),
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
