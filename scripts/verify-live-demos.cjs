// Public documentation only; synthetic demo data and no API credentials.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
// Opens every page with a live component demo (Sandpack React playgrounds and the Angular previews) at
// 1440 and 390 px, waits for each preview to render its component, and asserts: no Sandpack error overlay,
// no page/console errors, no horizontal page overflow, and that React demos load the pinned SDK versions.
//   VERIFY_BASE_URL=http://127.0.0.1:3096 PLAYWRIGHT_MODULE=<path>/playwright-core node scripts/verify-live-demos.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');

const versions = (() => {
  const source = require('node:fs').readFileSync(path.join(__dirname, '..', 'lib', 'sdk-versions.ts'), 'utf8');
  const pick = name => source.match(new RegExp(`${name}: "([^"]+)"`))[1];
  return { react: pick('react'), browser: pick('browser') };
})();

// Each React playground: expected title and a selector or text proving the component itself rendered.
const pages = {
  '/components/react': [
    ['BillSubmissionForm', 'form'], ['Composable submission sections', 'form'], ['BillingDashboard', 'text=Billing operations'],
    ['BillingReport', 'text=Republic Indemnity'], ['ConnectedBillLifecycle', 'text=Medical necessity or frequency'], ['ConnectedBillStatus', 'text=View denial'],
    ['BillStatusSummary', 'text=Post payment'], ['BillLifecycleProgress', 'text=Second'], ['BillSnapshotSummary', 'text=Alex Morgan'],
    ['BillExplanationOfReview', 'text=EOR-1038.pdf'], ['BillRemittanceCard', 'text=Payment reduced pending additional documentation.'],
    ['BillPayerContactCard', 'text=Jordan Lee'], ['BillPaymentLedger', 'text=4811505'], ['BillLifecycleActions', 'text=Submit second review'],
    ['BillActivityTimeline', 'text=EOR-1038.pdf received'], ['MindBillBillReview', 'text=Hosted bill review'], ['MindBillBillTimeline', 'text=Hosted bill timeline'],
  ],
  '/components/react/lifecycle-demo': [['Complete bill journey', 'text=Electronically sent to Republic Indemnity'], ['Lifecycle status gallery', 'text=$2,015.00']],
  '/guides/lifecycle': [['ConnectedBillLifecycle', 'text=Medical necessity or frequency'], ['BillLifecycleActions', 'text=Submit second review'], ['BillActivityTimeline', 'text=EOR-1038.pdf received']],
  '/guides/treatment-billing': [
    ['ConnectedTreatmentBillForm', '.mbsf-expected:has-text("$90.00")'], ['RfaClaimIndex', 'text=Requested treatments'],
    ['RelatedAuthorizationRecords', 'text=Bill #1042'], ['BillUrDecisions', 'text=DEMO-AUTH-x'],
  ],
  '/components/angular': 'angular',
};

// Expected noise from outside the components: the hosted-wrapper demos deliberately use a placeholder session
// and the Sandpack bundler logs its own telemetry failures. Everything else fails the run.
const ignoredConsole = [/\[BABEL\] Note: The code generator has deoptimised/, /demo-session-replace-me/, /embed\/bill-(review|timeline)/, /Failed to load resource.*(app\.mindbill\.org|codesandbox|csb\.app)/i, /col\.csbops\.io/, /sentry/i];

(async () => {
  const base = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3096';
  const output = process.env.VERIFY_OUTPUT || '/tmp/mindbill-live-demos';
  const only = process.env.VERIFY_PAGES ? process.env.VERIFY_PAGES.split(',') : Object.keys(pages);
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  const shots = [];
  try {
    for (const width of [1440, 390]) {
      for (const route of only) {
        const context = await browser.newContext({ viewport: { width, height: 960 } });
        const page = await context.newPage();
        const errors = [];
        const packages = new Set();
        page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
        page.on('console', m => { if (m.type() === 'error' && !ignoredConsole.some(re => re.test(m.text() + ' ' + (m.location().url || '')))) errors.push(`console(${m.location().url}): ${m.text()}`); });
        context.on('request', r => { const m = r.url().match(/@mindbill\/(react|browser)@?\/?(\d+\.\d+\.\d+)/) || r.url().match(/\/@mindbill\/(react|browser)\/-\/(?:react|browser)-(\d+\.\d+\.\d+)/); if (m) packages.add(`${m[1]}@${m[2]}`); });
        assert.equal((await page.goto(base + route, { waitUntil: 'domcontentloaded' })).status(), 200, route);
        const slug = route.replace(/^\//, '').replace(/\//g, '-');
        const shells = page.locator('.playground-shell');
        if (pages[route] === 'angular') {
          const count = await shells.count();
          assert.ok(count >= 4, `${route}: angular playgrounds`);
          for (let i = 0; i < count; i++) {
            const shell = shells.nth(i);
            await shell.scrollIntoViewIfNeeded();
            await shell.locator('.angular-playground-preview > div > *').first().waitFor({ timeout: 45000 });
            assert.equal(await shell.locator('.angular-playground-status').count(), 0, `${route} angular #${i} did not render`);
            const file = path.join(output, `${slug}-${i + 1}-${width}.png`);
            await shell.screenshot({ path: file }); shots.push(file);
          }
        } else {
          const expected = pages[route];
          assert.equal(await shells.count(), expected.length, `${route}: playground count`);
          for (let i = 0; i < expected.length; i++) {
            const [name, proof] = expected[i];
            const shell = shells.nth(i);
            assert.equal((await shell.locator('.playground-title > span').innerText()).trim(), name, `${route} #${i}`);
            await shell.scrollIntoViewIfNeeded();
            const iframe = shell.locator('iframe.sp-preview-iframe');
            await iframe.waitFor({ state: 'attached', timeout: 60000 });
            const frame = shell.frameLocator('iframe.sp-preview-iframe');
            try {
              await frame.locator(proof).first().waitFor({ state: 'attached', timeout: 120000 });
            } catch (error) {
              const overlay = await shell.locator('.sp-error-message').allInnerTexts().catch(() => []);
              throw new Error(`${route} ${name} at ${width}: component did not render. ${overlay.join(' ')} ${error.message}`);
            }
            await page.waitForTimeout(800);
            assert.equal(await shell.locator('.sp-error-message').count(), 0, `${route} ${name}: Sandpack error ${await shell.locator('.sp-error-message').allInnerTexts().catch(() => '')}`);
            const file = path.join(output, `${slug}-${String(i + 1).padStart(2, '0')}-${name.replace(/[^A-Za-z0-9]+/g, '-')}-${width}.png`);
            await shell.screenshot({ path: file }); shots.push(file);
          }
          assert.ok(packages.has(`react@${versions.react}`), `${route}: demos did not load @mindbill/react@${versions.react} (saw ${[...packages].join(', ') || 'none'})`);
          assert.ok(packages.has(`browser@${versions.browser}`), `${route}: demos did not load @mindbill/browser@${versions.browser} (saw ${[...packages].join(', ') || 'none'})`);
          for (const stale of [...packages].filter(p => p !== `react@${versions.react}` && p !== `browser@${versions.browser}`)) assert.fail(`${route}: stale package ${stale}`);
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} overflows at ${width}`);
        assert.deepEqual(errors, [], `${route} at ${width}: errors`);
        await context.close();
        process.stdout.write(`ok ${route} @${width} [${[...packages].join(', ')}]\n`);
      }
    }
  } finally {
    await browser.close();
  }
  process.stdout.write(`${shots.length} screenshots in ${output}\n`);
})().catch(error => { console.error(error); process.exit(1); });
