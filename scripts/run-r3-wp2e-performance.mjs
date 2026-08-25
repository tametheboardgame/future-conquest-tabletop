import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const origin = process.env.R3_WP2E_ORIGIN ?? 'http://127.0.0.1:4173';
const output = process.env.R3_WP2E_EVIDENCE ?? 'artifacts/r3-wp2e-performance.json';
// Do not use GITHUB_SHA here: pull_request workflows set it to GitHub's
// synthetic merge commit unless every caller remembers to override it.
const buildSha = process.env.R3_WP2E_BUILD_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const variant = process.env.R3_WP2E_VARIANT ?? 'local';
const tileCancellation = process.env.R3_WP2E_TILE_CANCELLATION ?? 'default';
const TERRAIN_QUIET_MS = 500;
const INITIAL_SETTLE_MINIMUM_MS = 250;
const CAMERA_SETTLE_MINIMUM_MS = 950;
const SETTLEMENT_TIMEOUT_MS = 45_000;
const TERRAIN_TILE_PATH = '/generated/r3-terrain/tiles/';
// The terrain benchmark must compare the renderer, not the amount of screen
// real estate a surrounding UI happens to give it. WP6 deliberately enlarges
// the production map, so both exact base and exact head are measured through
// the same fixed benchmark surface. The workflow copies this head-owned probe
// into the base checkout before either measurement.
const BENCHMARK_MAP_WIDTH = 1100;
const BENCHMARK_MAP_HEIGHT = 600;
const BENCHMARK_DIMENSION_TOLERANCE = 2;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
const session = await context.newCDPSession(page);
await session.send('Network.enable');
await session.send('Network.setCacheDisabled', { cacheDisabled: true });

const requests = [];
const diagnostics = [];
const inFlightTerrainRequests = new Set();
let lastTerrainActivityAt = 0;
let peakInFlightTerrainRequests = 0;
const isTerrainTileUrl = url => url.includes(TERRAIN_TILE_PATH);
const noteTerrainActivity = () => {
  lastTerrainActivityAt = performance.now();
  peakInFlightTerrainRequests = Math.max(peakInFlightTerrainRequests, inFlightTerrainRequests.size);
};

page.on('console', message => diagnostics.push(`[console:${message.type()}] ${message.text()}`));
page.on('pageerror', error => diagnostics.push(`[pageerror] ${error.stack ?? error.message}`));
page.on('request', request => {
  if (!isTerrainTileUrl(request.url())) return;
  inFlightTerrainRequests.add(request);
  noteTerrainActivity();
});
page.on('response', response => {
  if (!isTerrainTileUrl(response.url())) return;
  requests.push({
    url: response.url(),
    status: response.status(),
    bytes: Number(response.headers()['content-length'] ?? 0)
  });
});
page.on('requestfinished', request => {
  if (!isTerrainTileUrl(request.url())) return;
  inFlightTerrainRequests.delete(request);
  noteTerrainActivity();
});
page.on('requestfailed', request => {
  if (isTerrainTileUrl(request.url())) {
    inFlightTerrainRequests.delete(request);
    noteTerrainActivity();
  }
  if (request.url().includes('/generated/r3-terrain/')) {
    diagnostics.push(`[requestfailed] ${request.url()} :: ${request.failure()?.errorText ?? 'unknown'}`);
  }
});
await page.addInitScript(() => {
  localStorage.setItem('future-conquest:intro-seen:v3', 'true');
  localStorage.setItem('future-conquest-tutorial-seen-v1', 'true');
});

const started = performance.now();
// Use an explicit BG0 terrain-core mode rather than the broader terrain-none
// scene mode. This guarantees the same diagnostic settlement contract exists
// in both the exact accepted base and the exact BG1 head.
const query = new URLSearchParams({ terrain: '1', r5HardwareDiag: 'terrain-mesh' });
if (tileCancellation === 'cancel') query.set('tileCancellation', 'cancel');
if (tileCancellation === 'retain') query.set('tileCancellation', 'retain');
await page.goto(`${origin}/?${query.toString()}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });

// Normalise only the benchmark's map geometry. The probe deliberately supports
// both the historical command-map shell and the accepted R5 tabletop shell so
// an R5 rules-only PR can still compare the exact base renderer with the head.
await page.addStyleTag({ content: `
  .command-map-workspace {
    grid-template-columns: ${BENCHMARK_MAP_WIDTH}px minmax(0, 1fr) !important;
    align-items: start !important;
  }
  .r3-command-workspace {
    grid-template-columns: 72px ${BENCHMARK_MAP_WIDTH}px !important;
    justify-content: start !important;
    align-items: start !important;
  }
  .map-panel,
  .r3-map-host {
    display: block !important;
    position: relative !important;
    width: ${BENCHMARK_MAP_WIDTH}px !important;
    min-width: ${BENCHMARK_MAP_WIDTH}px !important;
    max-width: ${BENCHMARK_MAP_WIDTH}px !important;
    height: ${BENCHMARK_MAP_HEIGHT}px !important;
    min-height: ${BENCHMARK_MAP_HEIGHT}px !important;
    max-height: ${BENCHMARK_MAP_HEIGHT}px !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .map-panel > .map-heading {
    position: absolute !important;
    z-index: 50 !important;
  }
  .map-panel > .r3-terrain-prototype-shell,
  .r3-map-host > .r3-terrain-prototype-shell,
  .r3-terrain-prototype-shell {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    max-height: 100% !important;
  }
  .r3-terrain-prototype {
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    max-height: 100% !important;
    box-sizing: border-box !important;
  }
` });

await page.getByRole('button', { name: 'BEGIN CAMPAIGN', exact: true }).click();
await page.locator('.startup-game-shell').waitFor({ state: 'visible', timeout: 15_000 });

// Older R3 builds required explicitly entering the map command view. The R5
// tabletop shell is map-first and has no such control. Do not wait for an
// element that intentionally no longer exists on current production.
const legacyMapControl = page.locator('[data-command-view="map"]');
if (await legacyMapControl.count()) {
  await legacyMapControl.first().click();
} else {
  await page.locator('.r3-map-host, .map-panel').first().waitFor({ state: 'visible', timeout: 15_000 });
}

const terrainCanvas = page.locator('.r3-terrain-prototype-canvas canvas');
const fallback = page.locator('.r3-terrain-fallback-notice');
const startupOutcome = await Promise.race([
  terrainCanvas.waitFor({ state: 'visible', timeout: 45_000 }).then(() => 'terrain'),
  fallback.waitFor({ state: 'visible', timeout: 45_000 }).then(() => 'fallback')
]).catch(() => 'timeout');
if (startupOutcome !== 'terrain') {
  const state = await page.evaluate(() => ({
    terrainStatus: document.querySelector('.r3-terrain-prototype')?.getAttribute('data-status') ?? null,
    terrainPrototype: Boolean(document.querySelector('.r3-terrain-prototype')),
    fallback: document.querySelector('.r3-terrain-fallback-notice')?.textContent ?? null,
    canvasCount: document.querySelectorAll('.maplibregl-canvas').length,
    terrainCore: window.__r5TerrainCoreDiagnostic ?? null
  }));
  console.error('WP2E performance startup diagnostics:', JSON.stringify({ startupOutcome, state, diagnostics }, null, 2));
  await browser.close();
  // Exit 75 distinguishes the one retryable renderer-start path from later
  // measurement failures, which must remain strict for both variants.
  console.error(startupOutcome === 'fallback'
    ? `terrain fell back during WP2E performance gate: ${state.fallback ?? 'unknown reason'}`
    : 'terrain renderer did not expose a visible canvas during WP2E performance gate');
  process.exit(75);
}

// Current BG0 uses the terrain-core diagnostic as the authoritative settlement
// evidence. The terrain-mesh mode isolates exactly the DEM plus MapLibre terrain
// surface being benchmarked, without custom Three layers or hillshade work.
await page.waitForFunction(() => {
  const snapshot = window.__r5TerrainCoreDiagnostic;
  return snapshot?.mode === 'terrain-mesh'
    && snapshot.mapLoaded === true
    && snapshot.styleLoaded === true
    && snapshot.tilesLoaded === true
    && snapshot.demSourcePresent === true
    && snapshot.demSourceLoaded === true
    && snapshot.terrainAttached === true
    && snapshot.hillshadePresent === false;
}, undefined, { timeout: 45_000 });
await page.waitForFunction(() => document.querySelector('.r3-terrain-prototype')?.getAttribute('data-overlay-lod') === 'campaign');
await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const firstUsefulPaintMs = performance.now() - started;

const benchmarkSurface = await page.evaluate(() => {
  const panel = document.querySelector('.map-panel') ?? document.querySelector('.r3-map-host');
  const prototype = document.querySelector('.r3-terrain-prototype');
  const canvas = document.querySelector('.r3-terrain-prototype-canvas canvas');
  const dimensions = node => {
    if (!(node instanceof Element)) return null;
    const box = node.getBoundingClientRect();
    return {
      width: Math.round(box.width * 10) / 10,
      height: Math.round(box.height * 10) / 10
    };
  };
  return {
    panel: dimensions(panel),
    prototype: dimensions(prototype),
    canvas: dimensions(canvas)
  };
});
const benchmarkWidthDelta = Math.abs((benchmarkSurface.prototype?.width ?? 0) - BENCHMARK_MAP_WIDTH);
const benchmarkHeightDelta = Math.abs((benchmarkSurface.prototype?.height ?? 0) - BENCHMARK_MAP_HEIGHT);
if (benchmarkWidthDelta > BENCHMARK_DIMENSION_TOLERANCE || benchmarkHeightDelta > BENCHMARK_DIMENSION_TOLERANCE) {
  throw new Error(`terrain benchmark surface drifted from ${BENCHMARK_MAP_WIDTH}x${BENCHMARK_MAP_HEIGHT}: ${JSON.stringify(benchmarkSurface)}`);
}

/**
 * Build-neutral settlement rule used identically for exact base and exact head:
 * allow the normal camera/render window to elapse, then require every observed
 * Terrain-RGB request body to have completed and terrain network activity to
 * have remained quiet for a bounded period.
 */
const waitForTerrainSettlement = async (phaseStartedAt, minimumMs) => {
  for (;;) {
    const now = performance.now();
    const minimumElapsed = now - phaseStartedAt >= minimumMs;
    const noTerrainInFlight = inFlightTerrainRequests.size === 0;
    const terrainQuiet = lastTerrainActivityAt === 0 || now - lastTerrainActivityAt >= TERRAIN_QUIET_MS;
    if (minimumElapsed && noTerrainInFlight && terrainQuiet) return;
    if (now - phaseStartedAt >= SETTLEMENT_TIMEOUT_MS) {
      throw new Error(`terrain did not settle within ${SETTLEMENT_TIMEOUT_MS}ms; ${inFlightTerrainRequests.size} tile request(s) still in flight`);
    }
    await page.waitForTimeout(100);
  }
};

const initialSettlementStarted = performance.now();
await waitForTerrainSettlement(initialSettlementStarted, INITIAL_SETTLE_MINIMUM_MS);
const campaignSettledMs = performance.now() - started;

// Selected/local camera requires an actual selected territory. Establish the
// same deterministic selection through the real terrain label on both exact
// base and head before timing either camera transition.
const benchmarkTerritory = page.locator('.r3-terrain-territory-label[data-territory-id="DE-03"]');
await benchmarkTerritory.waitFor({ state: 'visible', timeout: 15_000 });
await benchmarkTerritory.click({ force: true });
await page.waitForFunction(() => document.querySelector('.r3-terrain-territory-label.selected')?.getAttribute('data-territory-id') === 'DE-03');
await page.waitForFunction(() => {
  const button = [...document.querySelectorAll('.r3-terrain-prototype-toolbar button')]
    .find(element => element.textContent?.trim() === 'selected');
  return button instanceof HTMLButtonElement && !button.disabled;
});
const selectionSettlementStarted = performance.now();
await waitForTerrainSettlement(selectionSettlementStarted, INITIAL_SETTLE_MINIMUM_MS);

const transition = async (name, expectedLod) => {
  const before = performance.now();
  // This benchmark owns renderer/network settlement, not pointer hit-testing.
  // The dedicated browser/selection gates exercise the same visible controls as
  // a user. Invoke the already-proven enabled button directly here so an overlay
  // cannot turn Playwright actionability delay into a false performance result.
  await page.evaluate(cameraName => {
    const button = [...document.querySelectorAll('.r3-terrain-prototype-toolbar button')]
      .find(element => element.textContent?.trim() === cameraName);
    if (!(button instanceof HTMLButtonElement) || button.disabled) {
      throw new Error(`Camera control ${cameraName} is unavailable.`);
    }
    button.click();
  }, name);
  await page.waitForFunction(lod => document.querySelector('.r3-terrain-prototype')?.getAttribute('data-overlay-lod') === lod, expectedLod);
  await waitForTerrainSettlement(before, CAMERA_SETTLE_MINIMUM_MS);
  return performance.now() - before;
};
const campaignToTheatreMs = await transition('theatre', 'theatre');
const theatreToSelectedMs = await transition('selected', 'local');

const resourceEntries = await page.evaluate(() => performance.getEntriesByType('resource')
  .filter(entry => entry.name.includes('/generated/r3-terrain/tiles/'))
  .map(entry => ({ name: entry.name, transferSize: entry.transferSize, encodedBodySize: entry.encodedBodySize })));
const counts = new Map();
for (const request of requests) counts.set(request.url, (counts.get(request.url) ?? 0) + 1);
const duplicateRequests = [...counts.entries()].filter(([, count]) => count > 1).map(([url, count]) => ({ url, count }));
const declaredBytes = requests.reduce((sum, request) => sum + (Number.isFinite(request.bytes) ? request.bytes : 0), 0);
const transferredBytes = resourceEntries.reduce((sum, entry) => sum + entry.transferSize, 0);
const encodedBodyBytes = resourceEntries.reduce((sum, entry) => sum + entry.encodedBodySize, 0);
const evidence = {
  schemaVersion: 2,
  buildSha,
  variant,
  tileCancellation,
  measuredAt: new Date().toISOString(),
  browser: await browser.version(),
  viewport: { width: 1600, height: 1000 },
  benchmarkSurface: {
    requested: { width: BENCHMARK_MAP_WIDTH, height: BENCHMARK_MAP_HEIGHT },
    measured: benchmarkSurface,
    normalisedAcrossBuilds: true
  },
  cacheMode: 'cold-disabled',
  usefulPaint: {
    diagnosticMode: 'terrain-mesh',
    requiresMapStyleTilesSettled: true,
    requiresTerrainCoreComposition: true,
    requiresCampaignLod: true,
    animationFramesAfterReady: 2
  },
  settlement: {
    initialMinimumMs: INITIAL_SETTLE_MINIMUM_MS,
    cameraMinimumMs: CAMERA_SETTLE_MINIMUM_MS,
    terrainQuietMs: TERRAIN_QUIET_MS,
    requiresCompletedTerrainBodies: true,
    peakInFlightTerrainRequests,
    buildNeutral: true
  },
  timingsMs: { firstUsefulPaintMs, campaignSettledMs, campaignToTheatreMs, theatreToSelectedMs },
  terrainNetwork: {
    totalRequests: requests.length,
    uniqueRequests: counts.size,
    duplicateRequestCount: requests.length - counts.size,
    duplicateRequests,
    declaredBytes,
    transferredBytes,
    encodedBodyBytes
  },
  fallbackVisible: await fallback.isVisible().catch(() => false),
  warning: await page.locator('.r3-terrain-prototype').getAttribute('data-status') === 'warning',
  terrainCore: await page.evaluate(() => window.__r5TerrainCoreDiagnostic ?? null),
  diagnostics
};
if (evidence.fallbackVisible) throw new Error('terrain fell back during WP2E performance gate');
fs.mkdirSync(new URL('../artifacts/', import.meta.url), { recursive: true });
fs.mkdirSync(output.slice(0, output.lastIndexOf('/')) || '.', { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
await browser.close();