import fs from 'node:fs';
import { chromium } from 'playwright';

const origin = process.env.R5_RUNTIME_ORIGIN ?? 'http://127.0.0.1:4173';
const screenshotPath = process.env.R5_RUNTIME_SCREENSHOT ?? '/tmp/r5-bg0-runtime.png';
const pageErrors = [];
const requestFailures = [];
const consoleErrors = [];
const progressiveWindowMs = Number(process.env.R5_RUNTIME_PROGRESSIVE_WINDOW_MS ?? 60_000);

// GitHub's Linux runners do not expose a hardware GPU. Make their renderer
// choice explicit instead of depending on Chromium's changing automatic
// software-WebGL fallback policy. Production remains entirely unaffected.
const softwareWebgl = process.env.R5_CHROMIUM_SOFTWARE_WEBGL === '1';
const browser = await chromium.launch({
  headless: true,
  args: softwareWebgl ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : []
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(() => {
  const evidence = window.__r5RuntimeEvidence = {
    startedAt: performance.now(), animationFrames: 0, contextEvents: [], stages: []
  };
  const nativeRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = callback => nativeRaf(timestamp => {
    evidence.animationFrames += 1;
    callback(timestamp);
  });
  document.addEventListener('webglcontextlost', event => {
    evidence.contextEvents.push({ type: 'lost', at: performance.now() });
  }, true);
  document.addEventListener('webglcontextrestored', () => {
    evidence.contextEvents.push({ type: 'restored', at: performance.now() });
  }, true);
  const observeStages = () => new MutationObserver(() => {
    const host = document.querySelector('.r3-terrain-prototype');
    const stage = host ? `${host.getAttribute('data-status')}:${host.getAttribute('data-terrain-relief')}:${host.getAttribute('data-physical-formations')}` : 'fallback';
    if (evidence.stages.at(-1)?.stage !== stage) evidence.stages.push({ stage, at: performance.now() });
  }).observe(document.documentElement, { subtree: true, attributes: true, childList: true });
  if (document.documentElement) observeStages();
  else document.addEventListener('DOMContentLoaded', observeStages, { once: true });
});
page.on('console', message => {
  const line = `[browser console ${message.type()}] ${message.text()}`;
  console.log(line);
  if (message.type() === 'error') consoleErrors.push(line);
});
page.on('pageerror', error => {
  const line = error.stack ?? error.message;
  pageErrors.push(line);
  console.error(`[browser pageerror] ${line}`);
});
page.on('requestfailed', request => {
  const line = `${request.url()} :: ${request.failure()?.errorText ?? 'unknown'}`;
  requestFailures.push(line);
  console.error(`[request failed] ${line}`);
});

const heartbeat = async (label, timeout = 2_000) => {
  const started = Date.now();
  await Promise.race([
    // A timer task measures the browser JS event loop directly. An rAF-based
    // pulse can be delayed by headless SwiftShader's continuous MapLibre paint
    // even while application events remain responsive.
    page.evaluate(() => new Promise(resolve => setTimeout(() => resolve(performance.now()), 0))),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} main-thread heartbeat exceeded ${timeout}ms`)), timeout))
  ]);
  console.log(`${label} heartbeat: ${Date.now() - started}ms`);
};

const activate = async (selector, label) => {
  await page.locator(selector).waitFor({ state: 'visible', timeout: 5_000 });
  await page.evaluate(({ selector, label }) => {
    const control = document.querySelector(selector);
    if (!(control instanceof HTMLElement)) throw new Error(`${label} is not an HTML control`);
    control.click();
  }, { selector, label });
};

try {
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  const begin = page.getByRole('button', { name: 'BEGIN CAMPAIGN', exact: true });
  await begin.waitFor({ state: 'visible', timeout: 10_000 });
  await page.locator('.r5-rich-map').waitFor({ state: 'attached', timeout: 10_000 });
  await page.locator('.r3-terrain-prototype, .r3-terrain-prototype-loading').first().waitFor({ state: 'attached', timeout: 25_000 });
  const preLaunchHostCount = await page.locator('.r5-rich-map').count();
  if (preLaunchHostCount !== 1) throw new Error(`Terrain host was not mounted behind launcher: ${preLaunchHostCount}`);
  await heartbeat('pre-launch');
  await begin.click({ timeout: 5_000 });
  await page.locator('.startup-launcher').waitFor({ state: 'detached', timeout: 5_000 });
  await page.locator('.r3-tabletop-shell').waitFor({ state: 'visible', timeout: 5_000 });
  await heartbeat('post-launch');

  const tray = page.locator('.r3-board-tray');
  const trayToggle = page.locator('.r3-tray-toggle');
  const expandedBefore = await trayToggle.getAttribute('aria-expanded');
  // locator.click() waits for a stable bounding box. Continuous software-WebGL
  // painting can prevent that heuristic from settling despite a healthy main
  // thread, so invoke the same DOM activation behaviour deterministically.
  await activate('.r3-tray-toggle', 'tray toggle');
  await page.waitForFunction(before => document.querySelector('.r3-tray-toggle')?.getAttribute('aria-expanded') !== before, expandedBefore);
  await heartbeat('tray-toggle');

  const terrain = page.locator('.r3-terrain-prototype');
  const handled = page.locator('.r3-terrain-prototype[data-status="ready"], .r3-terrain-prototype[data-status="warning"], .r5-rich-map-fallback');
  await handled.first().waitFor({ state: 'visible', timeout: 25_000 });
  const rendererCount = await terrain.count();
  const canvasCount = await page.locator('.maplibregl-canvas').count();
  if (rendererCount > 1 || canvasCount > 1) throw new Error(`Duplicate terrain runtime: ${rendererCount} renderer(s), ${canvasCount} canvas(es)`);

  // Stay alive through terrain restoration, shared-context Three.js imports,
  // model loading and delayed/idle callbacks rather than accepting first paint.
  const progressiveStarted = Date.now();
  let heartbeatSamples = 0;
  while (Date.now() - progressiveStarted < progressiveWindowMs) {
    await page.waitForTimeout(Math.min(1_000, progressiveWindowMs - (Date.now() - progressiveStarted)));
    await heartbeat(`progressive-${++heartbeatSamples}`, 2_500);
    const counts = await page.evaluate(() => ({
      canvases: document.querySelectorAll('.maplibregl-canvas').length,
      renderers: document.querySelectorAll('.r3-terrain-prototype').length
    }));
    if (counts.canvases > 1 || counts.renderers > 1) throw new Error(`Progressive renderer duplication: ${JSON.stringify(counts)}`);
  }
  const expandedAfterStaging = await trayToggle.getAttribute('aria-expanded');
  await activate('.r3-tray-toggle', 'tray toggle');
  await page.waitForFunction(before => document.querySelector('.r3-tray-toggle')?.getAttribute('aria-expanded') !== before, expandedAfterStaging);
  await heartbeat('post-staging-tray-toggle');

  let interaction = { mode: 'handled-fallback', before: null, after: null };
  if (canvasCount === 1) {
    const canvas = page.locator('.maplibregl-canvas');
    const before = await page.evaluate(() => window.__r3TerrainMap?.getCenter().toArray() ?? null);
    const box = await canvas.boundingBox();
    if (!box) throw new Error('MapLibre canvas has no interactive bounds.');
    await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.55);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.48, { steps: 5 });
    await page.mouse.up();
    await page.mouse.wheel(0, -180);
    await heartbeat('map-interaction');
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => window.__r3TerrainMap?.getCenter().toArray() ?? null);
    if (JSON.stringify(before) === JSON.stringify(after)) throw new Error('Map pan did not change its camera centre.');
    interaction = { mode: 'maplibre', before, after };
  } else {
    const fallbackMap = page.locator('.r5-rich-map-fallback .europe-map-frame');
    await fallbackMap.waitFor({ state: 'visible', timeout: 5_000 });
    const zoomStatus = fallbackMap.locator('.map-viewport-status');
    const before = await zoomStatus.innerText();
    await fallbackMap.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await page.waitForFunction(value => document.querySelector('.r5-rich-map-fallback .map-viewport-status')?.textContent !== value, before);
    const after = await zoomStatus.innerText();
    await heartbeat('fallback-map-interaction');
    interaction = { mode: 'stable-map', before, after };
  }

  const diagnostics = await page.evaluate(() => ({
    terrainStatus: document.querySelector('.r3-terrain-prototype')?.getAttribute('data-status') ?? 'fallback',
    physicalFormations: document.querySelector('.r3-terrain-prototype')?.getAttribute('data-physical-formations') ?? null,
    canvasCount: document.querySelectorAll('.maplibregl-canvas').length,
    rendererCount: document.querySelectorAll('.r3-terrain-prototype').length,
    trayExpanded: document.querySelector('.r3-tray-toggle')?.getAttribute('aria-expanded') ?? null,
    mapLoaded: window.__r3TerrainMap?.loaded() ?? null,
    styleLoaded: window.__r3TerrainMap?.isStyleLoaded() ?? null,
    tilesLoaded: window.__r3TerrainMap?.areTilesLoaded() ?? null,
    runtimeEvidence: window.__r5RuntimeEvidence ?? null,
    worldRenderCount: window.__r3WorldMiniatures?.renderCount ?? null,
    formationRenderCount: window.__r3FormationMiniatures?.renderCount ?? null
  }));
  console.log('R5 BG0 runtime diagnostics:', JSON.stringify({ ...diagnostics, interaction, consoleErrors, requestFailures }));
  await page.screenshot({ path: screenshotPath, fullPage: true });
  if (!fs.existsSync(screenshotPath)) throw new Error('Runtime screenshot was not written.');
  if (pageErrors.length) {
    throw new Error(`Browser emitted uncaught page errors: ${JSON.stringify(pageErrors)}`);
  }
} finally {
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
  await browser.close();
}
