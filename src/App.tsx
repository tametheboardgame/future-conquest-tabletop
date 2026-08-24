import { useMemo, useSyncExternalStore } from 'react';
import { CENTRAL_FRONT_BOARD } from './tabletop/board';
import { tabletopGameStore } from './tabletop/game-store';
import { CENTRAL_FRONT_PROTOTYPE_FORCE } from './tabletop/pieces';
import { R3TabletopShell } from './tabletop/R3TabletopShell';
import { readR5HardwareDiagnosticMode } from './tabletop/r5-hardware-diagnostic';

export default function App() {
  const game = useSyncExternalStore(tabletopGameStore.subscribe, tabletopGameStore.getSnapshot);
  const force = useMemo(() => ({
    definitions: CENTRAL_FRONT_PROTOTYPE_FORCE.definitions,
    pieces: Object.values(game.board.pieces)
  }), [game.board.pieces]);
  const diagnosticMode = useMemo(() => readR5HardwareDiagnosticMode(), []);
  return <R3TabletopShell board={CENTRAL_FRONT_BOARD} force={force} game={game} onAction={tabletopGameStore.dispatch} onPass={tabletopGameStore.pass} diagnosticMode={diagnosticMode} />;
}
