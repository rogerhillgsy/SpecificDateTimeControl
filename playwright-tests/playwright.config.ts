import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: "./tests",
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: "html",
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",
        ignoreHTTPSErrors: true,
        video: "on-first-retry",
        headless: true,
        baseURL: process.env.environmentUrl,
        screenshot: "only-on-failure",
        ...devices["Desktop Chrome"],
    },

    // Timeout on each expect()
    expect: {
        timeout: 10 * 1000,
    },
    // Overall test timeout. 60s.
    timeout: 60 * 1000,

    /* Configure projects for major browsers */
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"], storageState: process.env.storageState },
            dependencies: ["setup"],
        },

        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"], storageState: process.env.storageState },
            dependencies: ["setup"],
            workers: 1
        },
        {
            name: "All",
            dependencies: ["chromium", "firefox","Microsoft Edge","Google Chrome"],
        },

        // There are wide variances between webkit behaviour on the (legacy) windows verion, MacOS and iOS.
        // Therefore ignore webkit for now.
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'],
        //   storageState: process.env.storageState
        // },
        //   dependencies: ['setup'],
        // },
        {
            name: "setup",
            testMatch: "**/*.setup.ts",
        },
        {
            name: "tests",
            testMatch: "**/*.spec.ts",
            use: {
                storageState: process.env.storageState,
            },
            dependencies: ["setup"],
        },
        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        {
            name: "Microsoft Edge",
            use: { ...devices["Desktop Edge"], channel: "msedge", storageState: process.env.storageState },
            dependencies: ["setup"],
        },
        {
            name: "Google Chrome",
            use: { ...devices["Desktop Chrome"], channel: "chrome", storageState: process.env.storageState },
            dependencies: ["setup"],
        },
    ],

    outputDir: "test-results/",

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
