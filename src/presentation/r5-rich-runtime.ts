export type R5RichStage = 'terrain' | 'world' | 'formations';
export type R5RichStageState = 'waiting' | 'arming' | 'ready' | 'disabled';

export interface R5RichRuntimeDiagnostic {
  forced: boolean;
  stage: R5RichStage;
  states: Record<R5RichStage, R5RichStageState>;
  detail: string;
  heartbeatMs?: number;
}

declare global {
  interface Window { __r5RichRuntime?: R5RichRuntimeDiagnostic }
}

const ORDER: readonly R5RichStage[] = ['terrain', 'world', 'formations'];
const PENDING_KEY = 'r5-rich-pending-stage';

function pendingStage() {
  try { return sessionStorage.getItem(PENDING_KEY) as R5RichStage | null; }
  catch { return null; }
}

export function richRuntimeOptions(search = window.location.search) {
  const params = new URLSearchParams(search);
  const forced = params.get('r5RichPath') === 'force';
  const disabled = new Set((params.get('r5Disable') ?? '').split(',').filter(Boolean) as R5RichStage[]);
  const previousPending = pendingStage();
  if (previousPending && ORDER.includes(previousPending) && !forced) disabled.add(previousPending);
  return { forced, disabled, previousPending };
}

/**
 * Persists an armed stage before touching the GPU. If that operation hard-locks
 * the browser, the next load can identify and omit precisely that stage.
 */
export function armRichStage(stage: R5RichStage) {
  try { sessionStorage.setItem(PENDING_KEY, stage); } catch { /* diagnostics still work without storage */ }
}

export function settleRichStage(stage: R5RichStage) {
  try { if (sessionStorage.getItem(PENDING_KEY) === stage) sessionStorage.removeItem(PENDING_KEY); } catch { /* unavailable */ }
}

export function clearRichStageArm() {
  try { sessionStorage.removeItem(PENDING_KEY); } catch { /* unavailable */ }
}

export const initialRichStageStates = (): Record<R5RichStage, R5RichStageState> => ({
  terrain: 'waiting', world: 'waiting', formations: 'waiting'
});
