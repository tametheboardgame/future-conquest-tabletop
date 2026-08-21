import { CENTRAL_FRONT_BOARD } from './tabletop/board';
import { TabletopBoard } from './tabletop/TabletopBoard';

export default function App() {
  return <TabletopBoard board={CENTRAL_FRONT_BOARD} />;
}
