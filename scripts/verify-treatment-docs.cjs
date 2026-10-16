// Public documentation only; synthetic examples and no API credentials.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
(async () => {
  const base = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3096';
  const output = process.env.VERIFY_OUTPUT || '/tmp/mindbill-treatment-docs';
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  const referenceSlugs = ['encounter-fee-quote', 'ca-claim-edits', 'ca-copy-service-fee-quote', 'ca-inpatient-fee-quote', 'pharmacy-fee-quote', 'compound-pharmacy-fee-quote', 'owcp-fee-quote', 'owcp-ancillary-fee-quote',
    'rfa-creation-context', 'rfa-provider-signature', 'rfa-draft-preview', 'rfa-form-preview', 'rfa-response-reading', 'rfa-related', 'bill-ur-decisions', 'attach-bill-ur-decisions',
    'rfa-delivery-preview', 'rfa-submit', 'rfa-sent-outside', 'undo-rfa-sent-outside', 'rfa-forwards', 'rfa-export', 'rfa-treatment-closure', 'rfa-reconcile-fax',
    'list-bill-drafts', 'create-bill-draft', 'get-bill-draft', 'update-bill-draft', 'delete-bill-draft'];
  const pages = ['/guides/treatment-billing', '/guides/rfas', '/guides/webhooks', '/guides/videos', '/guides/fee-schedules', '/guides/upgrade', '/components/react', '/api-reference', '/api-reference/browser-api', '/api-reference/events', '/api-reference/create-bill', '/guides/partner-integration', ...referenceSlugs.map(slug => `/api-reference/${slug}`)];
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [], links = new Set();
    page.on('pageerror', e => errors.push(e.message));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 960 });
      for (const path of pages) {
        assert.equal((await page.goto(base + path, { waitUntil: 'networkidle' })).status(), 200, path);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${path} overflows at ${width}`);
        const text = await page.locator('main').innerText();
        assert.doesNotMatch(text, /bill\.status\.updated/, path);
        // Unconfigured videos render nothing: no player, no placeholder.
        assert.equal(await page.locator('video').count(), 0, `${path} renders a video`);
        assert.equal(await page.locator('[data-demo-video]').count(), 0, `${path} renders a video slot`);
        if (path.startsWith('/api-reference/') && referenceSlugs.includes(path.split('/').pop()) && path !== '/api-reference/bill-ur-decisions' && path !== '/api-reference/attach-bill-ur-decisions') {
          assert.match(text, /treatmentBilling/, `${path} lacks capability`);
        }
        (await page.locator('.doc-article a[href^="/"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')))).forEach(h => links.add(h));
        if (path === '/guides/treatment-billing') {
          for (const name of ['ConnectedTreatmentBillForm', 'RfaClaimIndex', 'RelatedAuthorizationRecords', 'BillUrDecisions', 'officialForm', 'treatment_billing_not_enabled', 'placeOfServiceId',
            'Save and resume drafts', 'draftId', 'onDraftSaved', 'createBillDraftsClient', 'bill_draft_revision_conflict', 'onSaveDraft']) assert.match(text, new RegExp(name), name);
          await page.locator('#drafts').scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/treatment-drafts-${width}.png` });
          const shots = page.locator('.walkthrough-image-button img');
          for (let i = 0; i < await shots.count(); i++) { await shots.nth(i).scrollIntoViewIfNeeded(); await shots.nth(i).evaluate(n => n.decode().catch(() => null)); }
          const images = await shots.evaluateAll(nodes => nodes.map(n => n.complete && n.naturalWidth > 0));
          assert.equal(images.filter(Boolean).length, 5, 'treatment screenshots load');
          await page.screenshot({ path: `${output}/treatment-billing-${width}.png`, fullPage: true });
        }
        if (path === '/guides/webhooks') {
          assert.equal(await page.locator('.webhook-events > div').count(), 48);
          for (const type of ['rfa.decision_recorded', 'rfa.follow_up_due', 'org.onboarding_completed', 'eor.received', 'bill.autofill_completed']) assert.match(text, new RegExp(type.replace('.', '\\.')));
          await page.screenshot({ path: `${output}/webhooks-${width}.png`, fullPage: true });
        }
        if (path === '/guides/videos') {
          assert.match(text, /Videos coming soon/);
          await page.screenshot({ path: `${output}/videos-${width}.png` });
        }
        if (path === '/guides/rfas') {
          assert.match(text, /\/rfas\/\{rfaId\}\/response-reading/);
          await page.locator('#routes').scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/rfa-routes-${width}.png` });
        }
        if (path === '/guides/fee-schedules') {
          await page.locator('#encounter').scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/fee-encounter-${width}.png` });
        }
        if (/^\/api-reference\/(list|create|get|update|delete)-bill-draft/.test(path)) {
          for (const term of ['treatmentBilling', 'Idempotency|bills:read', 'billdraft_example']) assert.match(text, new RegExp(term), `${path} ${term}`);
          await page.screenshot({ path: `${output}/${path.split('/').pop()}-${width}.png`, fullPage: true });
        }
        if (path === '/api-reference/create-bill') {
          for (const term of ['draft.revision', 'bill_draft_not_editable', 'Drafts are not bills']) assert.match(text, new RegExp(term.replace('.', '\\.')), term);
          assert.doesNotMatch(text, /No public draft/);
        }
        if (path === '/guides/partner-integration') assert.match(text, /bill draft/);
        if (path === '/api-reference/encounter-fee-quote') await page.screenshot({ path: `${output}/encounter-api-${width}.png`, fullPage: true });
        if (path === '/guides/upgrade') { assert.match(text, /React 0\.79\.0, browser 0\.52\.0/); assert.match(text, /createBillDraftsClient/); await page.locator('#v079').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/upgrade-v079-${width}.png` }); await page.locator('#v078').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${output}/upgrade-${width}.png` }); }
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
    console.log(`PASS: ${pages.length} pages desktop/mobile; ${links.size} internal links/anchors; no video slots rendered; screenshots load; no overflow or page errors.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
