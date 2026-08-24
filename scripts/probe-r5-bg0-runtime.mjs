import { chromium } from 'playwright';

const origin = process.env.R5_RUNTIME_ORIGIN ?? 'http://127.0.0.1:4173';
const screenshotPath = process.env.R5_RUNTIME_SCREENSHOT ?? '/tmp/r5-bg0-runtime.png';
const modes = ['shell', 'stable', 'terrain-none', 'terrain-world', 'terrain-formations', 'full'];
const browser = await chromium.launch({ headless: true });

async function heartbeat(page, label) {
  await Promise.race([
    page.evaluate(() => new Promise(resolve => setTimeout(resolve, 0))),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} main-thread heartbeat exceeded 10000ms`)), 10000))
  ]);
}

async function exercise(mode, index) {
  const pageErrors = [];
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.on('pageerror', error => pageErrors.push(error.stack ?? error.message));
  const url = new URL(origin);
  url.searchParams.set('r5HardwareDiag', mode);
  await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });

  const badge = page.locator('.r5-hardware-diagnostic-badge');
  await badge.waitFor({ state: 'visible', timeout: 10_000 });
  if (!(await badge.textContent())?.includes(mode.toUpperCase())) throw new Error(`${mode}: persistent badge does not identify mode`);

  const begin = page.getByRole('button', { name: 'BEGIN CAMPAIGN', exact: true });
  await begin.waitFor({ state: 'visible', timeout: 10_000 });
  if (mode.startsWith('terrain-') || mode === 'full') {
    await page.locator('.r3-terrain-prototype').waitFor({ state: 'attached', timeout: 25_000 });
    await page.waitForFunction(() => document.querySelector('.r3-terrain-prototype')?.getAttribute('data-status') === 'ready', null, { timeout: 30_000 });
    if (mode === 'terrain-world' || mode === 'full') await page.waitForFunction(() => Boolean(window.__r3WorldMiniatures), null, { timeout: 15_000 });
    if (mode === 'terrain-formations' || mode === 'full') await page.waitForFunction(() => Boolean(window.__r3FormationMiniatures), null, { timeout: 15_000 });
  }
  await heartbeat(page, `${mode} pre-launch`);
  await begin.click({ timeout: 10_000 });
  await page.locator('.startup-launcher').waitFor({ state: 'detached', timeout: 20_000 });
  await page.locator('.r3-tabletop-shell').waitFor({ state: 'visible', timeout: 20_000 });
  await page.getByText('LAUNCHED / RESPONSIVE', { exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  await heartbeat(page, `${mode} post-launch`);

  const trayToggle = page.locator('.r3-tray-toggle');
  const before = await trayToggle.getAttribute('aria-expanded');
  await trayToggle.click({ timeout: 10_000 });
  await page.waitForFunction(previous => document.querySelector('.r3-tray-toggle')?.getAttribute('aria-expanded') !== previous, before);
  await heartbeat(page, `${mode} tray interaction`);

  const expected = {
    shell: { placeholder: 1, stable: 0, terrain: 0, canvas: 0, world: false, formations: false },
    stable: { placeholder: 0, stable: 1, terrain: 0, canvas: 0, world: false, formations: false },
    'terrain-none': { placeholder: 0, stable: 0, terrain: 1, canvas: 1, world: false, formations: false },
    'terrain-world': { placeholder: 0, stable: 0, terrain: 1, canvas: 1, world: true, formations: false },
    'terrain-formations': { placeholder: 0, stable: 0, terrain: 1, canvas: 1, world: false, formations: true },
    full: { placeholder: 0, stable: 0, terrain: 1, canvas: 1, world: true, formations: true }
  }[mode];

  const actual = await page.evaluate(() => ({
    placeholder: document.querySelectorAll('.r5-hardware-map-placeholder').length,
    stable: document.querySelectorAll('.r5-rich-map-fallback').length,
    terrain: document.querySelectorAll('.r3-terrain-prototype').length,
    canvas: document.querySelectorAll('.maplibregl-canvas').length,
    scene: window.__r3TerrainDiagnostics?.sceneMode ?? null,
    world: Boolean(window.__r3WorldMiniatures),
    formations: Boolean(window.__r3FormationMiniatures)
  }));
  for (const key of ['placeholder', 'stable', 'terrain', 'canvas', 'world', 'formations']) {
    if (actual[key] !== expected[key]) throw new Error(`${mode}: expected ${key}=${expected[key]}, got ${actual[key]} (${JSON.stringify(actual)})`);
  }
  const expectedScene = mode.startsWith('terrain-') ? mode.slice(8) : mode === 'full' ? 'full' : null;
  if (actual.scene !== expectedScene) throw new Error(`${mode}: expected diagnostic scene ${expectedScene}, got ${actual.scene}`);
  if (pageErrors.length) throw new Error(`${mode}: page errors: ${pageErrors.join('\n')}`);
  if (index === modes.length - 1) await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`R5 isolation result ${mode}: ${JSON.stringify(actual)}`);
  await page.close();
}

try {
  for (const [index, mode] of modes.entries()) await exercise(mode, index);
} finally {
  await browser.close();
}
