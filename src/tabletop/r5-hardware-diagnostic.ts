export const R5_HARDWARE_DIAGNOSTIC_MODES = ['shell', 'stable', 'terrain-none', 'terrain-world', 'terrain-formations', 'full'] as const;
export type R5HardwareDiagnosticMode = typeof R5_HARDWARE_DIAGNOSTIC_MODES[number];
export type R5MapDiagnosticMode = 'production' | R5HardwareDiagnosticMode;

export function readR5HardwareDiagnosticMode(search = window.location.search): R5MapDiagnosticMode {
  const requested = new URLSearchParams(search).get('r5HardwareDiag');
  return R5_HARDWARE_DIAGNOSTIC_MODES.includes(requested as R5HardwareDiagnosticMode) ? requested as R5HardwareDiagnosticMode : 'production';
}

export function logR5HardwareDiagnostic(mode: R5MapDiagnosticMode, event: string) {
  if (mode !== 'production') console.info('[R5 hardware diagnostic]', { mode, event, timestamp: performance.now(), wallClock: new Date().toISOString() });
}
