import {defineConfig, devices} from '@playwright/test';

const baseURL='http://127.0.0.1:5197';
export default defineConfig({
  testDir:'./tests/browser',
  fullyParallel:true,
  forbidOnly:!!process.env.CI,
  retries:process.env.CI?1:0,
  workers:2,
  timeout:30_000,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL,trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'npm run preview -- --host 127.0.0.1 --port 5197 --strictPort',url:baseURL,reuseExistingServer:false,timeout:30_000},
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome']}},
    {name:'firefox',use:{...devices['Desktop Firefox']}},
    {name:'webkit',use:{...devices['Desktop Safari']}},
    {name:'mobile-webkit',use:{...devices['iPhone 13']}},
  ],
});
