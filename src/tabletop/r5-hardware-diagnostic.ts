export const R5_HARDWARE_DIAGNOSTIC_MODES = [
  'shell', 'stable', 'maplibre-base', 'dem-source', 'terrain-mesh', 'hillshade-only',
  'terrain-none', 'terrain-world', 'terrain-formations', 'full'
] as const;
export type R5HardwareDiagnosticMode = typeof R5_HARDWARE_DIAGNOSTIC_MODES[number];
export type R5MapDiagnosticMode = 'production' | R5HardwareDiagnosticMode;

export const R5_TERRAIN_CORE_DIAGNOSTIC_MODES = ['maplibre-base', 'dem-source', 'terrain-mesh', 'hillshade-only'] as const;
export type R5TerrainCoreDiagnosticMode = typeof R5_TERRAIN_CORE_DIAGNOSTIC_MODES[number];

export function isR5TerrainCoreDiagnosticMode(mode: R5MapDiagnosticMode): mode is R5TerrainCoreDiagnosticMode {
  return R5_TERRAIN_CORE_DIAGNOSTIC_MODES.includes(mode as R5TerrainCoreDiagnosticMode);
}

export function readR5HardwareDiagnosticMode(search = window.location.search): R5MapDiagnosticMode {
  const requested = new URLSearchParams(search).get('r5HardwareDiag');
  return R5_HARDWARE_DIAGNOSTIC_MODES.includes(requested as R5HardwareDiagnosticMode) ? requested as R5HardwareDiagnosticMode : 'production';
}

export function logR5HardwareDiagnostic(mode: R5MapDiagnosticMode, event: string) {
  if (mode !== 'production') console.info('[R5 hardware diagnostic]', { mode, event, timestamp: performance.now(), wallClock: new Date().toISOString() });
}
