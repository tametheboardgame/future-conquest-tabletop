import {
  createCommandRound,
  passCommandActivation,
  refreshCommandPhase,
  resumeCommandRound,
  serializeCommandRound,
  spendCommandAction
} from './command-phase';
import type { TabletopRoundState } from './state';

const COMMAND_ROUND_SAVE_KEY = 'future-conquest-tabletop-command-round-v1';

/** Rules-owned store. React subscribes to it but never owns command-phase state. */
class CommandPhaseStore {
  private state: TabletopRoundState;
  private readonly listeners = new Set<() => void>();

  constructor() {
    this.state = refreshCommandPhase(createCommandRound());
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(COMMAND_ROUND_SAVE_KEY);
      if (saved) {
        try {
          this.state = resumeCommandRound(saved);
        } catch {
          localStorage.removeItem(COMMAND_ROUND_SAVE_KEY);
        }
      }
    }
  }

  getSnapshot = (): TabletopRoundState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  spend = (): void => {
    const result = spendCommandAction(this.state, this.state.activeSeatId);
    if (result.ok) this.commit(result.state);
  };

  pass = (): void => {
    const result = passCommandActivation(this.state, this.state.activeSeatId);
    if (result.ok) this.commit(result.state);
  };

  private commit(state: TabletopRoundState): void {
    this.state = state;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(COMMAND_ROUND_SAVE_KEY, serializeCommandRound(state));
    }
    this.listeners.forEach((listener) => listener());
  }
}

export const commandPhaseStore = new CommandPhaseStore();
