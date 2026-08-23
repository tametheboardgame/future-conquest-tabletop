import { useSyncExternalStore } from 'react';
import { CENTRAL_FRONT_BOARD } from './tabletop/board';
import { commandPhaseStore } from './tabletop/command-store';
import { CENTRAL_FRONT_PROTOTYPE_FORCE } from './tabletop/pieces';
import { TabletopBoard } from './tabletop/TabletopBoard';

export default function App() {
  const round = useSyncExternalStore(commandPhaseStore.subscribe, commandPhaseStore.getSnapshot);
  return (
    <TabletopBoard
      board={CENTRAL_FRONT_BOARD}
      force={CENTRAL_FRONT_PROTOTYPE_FORCE}
      round={round}
      onSpendAction={commandPhaseStore.spend}
      onPass={commandPhaseStore.pass}
    />
  );
}
