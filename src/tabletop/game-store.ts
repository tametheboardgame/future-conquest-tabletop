import { passCommandActivation } from './command-phase';
import { createTabletopGame, dispatchCoreAction, resumeTabletopGame, serializeTabletopGame, type CoreActionRequest, type CoreActionResult } from './core-actions';
import type { TabletopGameState } from './state';

const SAVE_KEY = 'future-conquest-tabletop-v1';
class TabletopGameStore {
  private state: TabletopGameState = createTabletopGame();
  private readonly listeners = new Set<() => void>();
  constructor() {
    const saved = typeof localStorage === 'undefined' ? null : localStorage.getItem(SAVE_KEY);
    if (saved) try { this.state = resumeTabletopGame(saved); } catch { localStorage.removeItem(SAVE_KEY); }
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  dispatch = (request: CoreActionRequest): CoreActionResult => {
    const result = dispatchCoreAction(this.state, request);
    if (result.ok) this.commit(result.state);
    return result;
  };
  pass = () => { const result = passCommandActivation(this.state.round, this.state.round.activeSeatId); if (result.ok) this.commit({ ...this.state, round: result.state }); };
  private commit(state: TabletopGameState) { this.state = state; if (typeof localStorage !== 'undefined') localStorage.setItem(SAVE_KEY, serializeTabletopGame(state)); this.listeners.forEach((listener) => listener()); }
}
export const tabletopGameStore = new TabletopGameStore();
