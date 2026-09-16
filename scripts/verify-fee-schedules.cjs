// Public documentation only; synthetic examples and no API credentials.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
(async () => {
  const base = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3096';
  const output = process.env.VERIFY_OUTPUT || '/tmp/mindbill-fee-docs';
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [], links = new Set();
    page.on('pageerror', e => errors.push(e.message));
    const pages = ['/guides/fee-schedules', '/api-reference/ca-claim-fee-quote', '/api-reference/treatment-fee-quote', '/learn/treatment-quickstart', '/learn/workers-comp-billing', '/guides/upgrade'];
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 960 });
      for (const path of pages) {
        assert.equal((await page.goto(base + path)).status(), 200, path);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, path + ' overflows');
        assert.ok(await page.locator('h1').innerText());
        (await page.locator('.doc-article a[href^="/"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')))).forEach(h => links.add(h));
        if (path === '/guides/fee-schedules') {
          assert.match(await page.locator('main').innerText(), /pricedSubtotalCents/);
          assert.match(await page.locator('main').innerText(), /Historical and specialty coverage is not complete/);
          await page.screenshot({ path: `${output}/guide-${width}.png` });
          await page.locator('#results').scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/results-${width}.png` });
        }
        if (path === '/api-reference/ca-claim-fee-quote') {
          assert.match(await page.locator('main').innerText(), /completeDateOfServiceContext/);
          assert.match(await page.locator('main').innerText(), /source_unavailable/);
          await page.screenshot({ path: `${output}/api-${width}.png` });
        }
      }
    }
    for (const link of links) {
      const url = new URL(link, base);
      assert.equal((await context.request.get(url.origin + url.pathname)).status(), 200, link);
      if (url.hash) {
        await page.goto(url.href);
        assert.ok(await page.locator(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).count(), link);
      }
    }
    assert.deepEqual(errors, []);
    console.log(`PASS: ${pages.length} pages desktop/mobile; ${links.size} internal links/anchors; review semantics; no overflow or page errors.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
