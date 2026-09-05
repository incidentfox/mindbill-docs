// Synthetic production-preview smoke. PLAYWRIGHT_MODULE may point to a shared install.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser verification script. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');

(async () => {
  const base = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3095';
  const output = process.env.VERIFY_OUTPUT || '/tmp/mindbill-partner-docs';
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 960 });
      assert.equal((await page.goto(`${base}/learn/quickstart`)).status(), 200);
      const builder = page.getByRole('region', { name: 'Integration recipe builder' });
      await builder.locator('select').nth(0).selectOption('Angular');
      await builder.locator('select').nth(1).selectOption('FastAPI');
      const downloadPromise = page.waitForEvent('download');
      await builder.getByRole('button', { name: 'Download brief (.md)' }).click();
      const download = await downloadPromise;
      const brief = await fs.readFile(await download.path(), 'utf8');
      assert.match(brief, /Frontend: Angular; backend: FastAPI/);
      assert.match(brief, /Notification ownership/);
      assert.match(brief, /consent/);
      assert.match(brief, /assigned_bills/);
      assert.match(brief, /recipients\/\{externalUserId\}\/bills\/\{billId\}/);
      await builder.locator('select').nth(0).selectOption('API only');
      await builder.getByRole('button', { name: 'Copy full agent brief' }).click();
      assert.match(await page.evaluate(() => navigator.clipboard.readText()), /No React package or browser token required/);
      await page.screenshot({ path: `${output}/quickstart-${width}.png`, fullPage: true });
      assert.equal((await page.goto(`${base}/guides/notifications`)).status(), 200);
      await page.getByRole('heading', { name: 'Send useful billing notifications' }).waitFor();
      assert.match(await page.locator('body').innerText(), /Removing an association suppresses pending notifications/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `${output}/notifications-${width}.png`, fullPage: true });
    }
    await page.goto(`${base}/api-reference/browser-api`);
    assert.match(await page.locator('body').innerText(), /getSubmissionArtifact/);
    await page.goto(`${base}/guides/lifecycle`);
    assert.match(await page.locator('body').innerText(), /getSubmissionArtifact/);
    assert.deepEqual(errors, []);
    console.log('PASS: desktop/mobile onboarding copy + download, notifications, historical artifact docs, no page errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
