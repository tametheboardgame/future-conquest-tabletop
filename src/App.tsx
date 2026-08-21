import { CENTRAL_FRONT_BOARD } from './tabletop/board';
import { CENTRAL_FRONT_PROTOTYPE_FORCE } from './tabletop/pieces';
import { TabletopBoard } from './tabletop/TabletopBoard';

export default function App() {
  return <TabletopBoard board={CENTRAL_FRONT_BOARD} force={CENTRAL_FRONT_PROTOTYPE_FORCE} />;
}
