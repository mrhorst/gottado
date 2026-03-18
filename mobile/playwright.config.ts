import { defineConfig, devices } from '@playwright/test'

const webPort = 19006
const backendPort = 3100

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: [
    {
      command: `PORT=${backendPort} node --import tsx src/index.ts`,
      cwd: '../backend',
      url: `http://127.0.0.1:${backendPort}`,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: `sh -c 'CI=1 EXPO_PUBLIC_API_URL=http://127.0.0.1:${backendPort} npx expo export --platform web && python3 -m http.server ${webPort} -d dist'`,
      cwd: '.',
      url: `http://127.0.0.1:${webPort}`,
      reuseExistingServer: true,
      timeout: 420_000,
    },
  ],
})
