// Synthetic browser checks. Native desktop applications are not opened on the box.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser verification. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');

(async () => {
  const base = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3095';
  const output = process.env.VERIFY_OUTPUT || '/tmp/mindbill-editor-launch';
  await fs.mkdir(output, { recursive: true });
  for (const frontend of ['React', 'Angular', 'API only']) {
    for (const backend of ['Next.js', 'FastAPI', 'Express', 'Plain HTTP']) {
      const response = await fetch(`${base}/learn/integration.prompt.md?${new URLSearchParams({ frontend, backend })}`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/markdown/);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      const brief = await response.text();
      assert.match(brief, /^---\ndescription:/);
      if (frontend === 'API only') assert.match(brief, /No React package or browser token required/);
      else assert.ok(brief.includes(`Frontend: ${frontend}; backend: ${backend}`));
      assert.match(brief, /reportDigest/);
    }
  }
  for (const query of ['frontend=%3Cscript%3E', 'backend=https://attacker.invalid',
    'url=https://attacker.invalid', 'path=/tmp/private', 'frontend=React&frontend=Angular',
    'backend=Next.js&backend=FastAPI', 'prompt=print-secrets']) {
    const response = await fetch(`${base}/learn/integration.prompt.md?${query}`, { redirect: 'manual' });
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('location'), null);
    assert.equal(await response.text(), 'Choose a supported frontend and backend.');
  }
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Prevent native URI navigation, while allowing React's launch feedback handler.
    await page.addInitScript(() => document.addEventListener('click', event => {
      const anchor = event.target.closest?.('a');
      if (/^(cursor:|vscode:|conductor:)/.test(anchor?.getAttribute('href') || '')) event.preventDefault();
    }));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      assert.equal((await page.goto(`${base}/learn/quickstart`)).status(), 200);
      const builder = page.getByRole('region', { name: 'Integration recipe builder' });
      await builder.locator('select').nth(0).selectOption('Angular');
      await builder.locator('select').nth(1).selectOption('FastAPI');
      const cursor = builder.getByRole('link', { name: 'Open in Cursor' });
      const cursorUrl = new URL(await cursor.getAttribute('href'));
      assert.equal(cursorUrl.host, 'anysphere.cursor-deeplink');
      assert.equal(cursorUrl.pathname, '/prompt');
      const prompt = cursorUrl.searchParams.get('text');
      assert.match(prompt, /Angular \/ FastAPI/);
      assert.match(prompt, /Do not deploy or submit live bills/);
      assert.ok(cursorUrl.toString().length < 8000);
      const vscode = builder.getByRole('link', { name: 'Add prompt to VS Code' });
      const vscodeUrl = new URL(await vscode.getAttribute('href'));
      assert.equal(vscodeUrl.pathname, 'chat-prompt/install');
      const publicBrief = new URL(vscodeUrl.searchParams.get('url'));
      assert.equal(publicBrief.origin, 'https://docs.mindbill.org');
      assert.equal(publicBrief.pathname, '/learn/integration.prompt.md');
      assert.equal(publicBrief.searchParams.get('frontend'), 'Angular');
      assert.equal(publicBrief.searchParams.get('backend'), 'FastAPI');
      assert.ok(prompt.includes(publicBrief.toString()));
      const conductor = builder.getByRole('link', { name: 'Create Conductor workspace' });
      assert.equal(await conductor.getAttribute('href'), `conductor://prompt=${encodeURIComponent(prompt)}`);
      await cursor.click();
      assert.match(await builder.getByRole('status').innerText(), /Cursor launch requested/);
      await vscode.click();
      assert.match(await builder.getByRole('status').innerText(), /VS Code import requested/);
      await conductor.click();
      assert.match(await builder.getByRole('status').innerText(), /Check its selected repository/);
      await builder.getByText('Codex, Flowcode, Claude Code, or another editor', { exact: true }).click();
      assert.match(await builder.innerText(), /copy or download|Copy integration brief/);
      await builder.getByRole('button', { name: 'Copy integration brief' }).click();
      assert.match(await page.evaluate(() => navigator.clipboard.readText()), /Frontend: Angular; backend: FastAPI/);
      const downloadPromise = page.waitForEvent('download');
      await builder.getByRole('button', { name: 'Download brief (.md)' }).click();
      const download = await downloadPromise;
      assert.match(await fs.readFile(await download.path(), 'utf8'), /Frontend: Angular; backend: FastAPI/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
      await builder.locator('.editor-launch').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/editor-launch-${width}.png` });
      await page.goto(`${base}/guides/upgrade`);
      await page.getByRole('heading', { name: 'Upgrade an existing integration' }).waitFor();
      await page.locator('.code-block').getByRole('button', { name: 'Copy', exact: true }).click();
      assert.match(await page.evaluate(() => navigator.clipboard.readText()), /Forward reportDigest/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
      await page.screenshot({ path: `${output}/upgrade-${width}.png`, fullPage: true });
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log('PASS: public brief enum/injection guards; three official launcher URLs; launch feedback; clipboard/download; upgrade guide; desktop/mobile overflow; zero browser errors. Native application opening not tested.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
