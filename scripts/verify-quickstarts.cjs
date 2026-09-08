// Exercise public documentation only; no API credentials or patient records.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
(async () => {
  const base = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3095';
  const output = process.env.VERIFY_OUTPUT || '/tmp/mindbill-quickstarts';
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const internalLinks = new Set();
    const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'horizontal page overflow');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 960 });
      for (const theme of ['light', 'dark']) {
        assert.equal((await page.goto(`${base}/learn/quickstart`)).status(), 200);
        await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
        await page.getByRole('heading', { name: 'Add billing to your app', exact: true }).waitFor();
        assert.equal(await page.locator('.quickstart-optionals details[open]').count(), 0);
        await noOverflow();
        await page.screenshot({ path: `${output}/components-${width}-${theme}.png` });
        const install = page.getByRole('tablist', { name: 'Install framework', exact: true });
        await install.getByRole('tab', { name: 'Angular', exact: true }).click();
        assert.match(await page.locator('#install [role=tabpanel]:visible').innerText(), /@mindbill\/angular/);
        assert.match(await page.locator('#bill > .quickstart-tabs > [role=tabpanel]:visible').innerText(), /MindBillBillLifecycleComponent/);
        assert.match(await page.locator('#dashboard [role=tabpanel]:visible').innerText(), /MindBillBillingDashboardComponent/);
        await page.locator('#prefill > summary').click();
        assert.match(await page.locator('#prefill pre').innerText(), /Taylor/);
        await page.getByRole('button', { name: 'Copy page', exact: false }).click();
        const markdown = await page.evaluate(() => navigator.clipboard.readText());
        assert.match(markdown, /MindBillBillLifecycleComponent/);
        const hiddenReact = await page.locator('#bill > .quickstart-tabs > [role=tabpanel][hidden] pre').innerText();
        assert.equal(markdown.includes(hiddenReact.trim()), false, 'copied inactive React snippet');
        await install.getByRole('tab', { name: 'Angular', exact: true }).focus();
        await page.keyboard.press('ArrowLeft');
        assert.equal(await install.getByRole('tab', { name: 'React', exact: true }).getAttribute('aria-selected'), 'true');
        const backend = page.getByRole('tablist', { name: 'Backend framework', exact: true });
        for (const [name, pattern] of [['Next.js', /POST/], ['Express', /app\.post/], ['FastAPI', /def /], ['HTTP', /POST/]]) {
          await backend.getByRole('tab', { name, exact: true }).click();
          const panel = page.locator('#auth [role=tabpanel]:visible');
          assert.match(await panel.innerText(), pattern);
          await panel.getByRole('button', { name: 'Copy', exact: true }).click();
          assert.match(await page.evaluate(() => navigator.clipboard.readText()), pattern);
          await noOverflow();
        }
        await backend.getByRole('tab', { name: 'Next.js', exact: true }).click();
        await page.locator('#auth').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${output}/auth-${width}-${theme}.png` });
        await page.locator('#prefill > summary').click();
        await page.locator('#optional').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${output}/optional-${width}-${theme}.png` });
        for (const path of ['/learn/quickstart', '/learn/api-quickstart', '/learn/treatment-quickstart']) {
          assert.equal((await page.goto(`${base}${path}`)).status(), 200);
          await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
          await noOverflow();
          const links = await page.locator('.doc-article a[href^="/"]:not([download])').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
          links.forEach(link => internalLinks.add(link));
          if (path.includes('api-quickstart')) {
            const actions = page.getByRole('tablist', { name: 'Bill action', exact: true });
            for (const [name, action] of [['Resubmit', 'resubmit'], ['Second review', 'second_review'], ['Close', 'close'], ['Reopen', 'reopen'], ['Add a note', 'add_note']]) {
              await actions.getByRole('tab', { name, exact: true }).click();
              assert.ok((await page.locator('#actions [role=tabpanel]:visible').innerText()).includes(`action: "${action}"`));
              await noOverflow();
            }
          }
          if (path.includes('treatment-quickstart')) {
            await page.getByRole('tablist', { name: 'Treatment submission', exact: true }).getByRole('tab', { name: 'API', exact: true }).click();
            assert.match(await page.locator('#submit [role=tabpanel]:visible').innerText(), /documentType: "final_report"/);
            assert.equal(await page.locator('#rfa').getAttribute('open'), null);
            await page.locator('#rfa > summary').click();
            assert.match(await page.locator('#rfa').innerText(), /does not sign or send/);
          }
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: `${output}/${path.split('/').pop()}-${width}-${theme}.png` });
        }
      }
    }
    // Verify every local destination and anchor introduced in these guides.
    for (const link of internalLinks) {
      const url = new URL(link, base);
      const response = await context.request.get(url.origin + url.pathname + url.search);
      assert.equal(response.status(), 200, link);
      await page.goto(url.href);
      if (url.hash) assert.ok(await page.locator(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).count(), `missing anchor: ${link}`);
    }
    const example = await (await fetch(`${base}/examples/bill.json`)).json();
    assert.equal(example.patient.lastName, 'Example');
    assert.equal(example.claim.claimsAdministrator.id, 'REPLACE_WITH_DIRECTORY_ID');
    assert.deepEqual(errors, []);
    console.log('PASS: 3 quickstarts, desktop/mobile, light/dark, shared framework tabs, keyboard selection, snippet/page copy, optional disclosures, API action tabs, links and anchors, synthetic download, no page errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
