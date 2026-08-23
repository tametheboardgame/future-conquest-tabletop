import { useMemo, useState } from 'react';
import { buildR5RichMapFrame } from '../presentation/r5-rich-map-adapter';
import type { TabletopBoardDefinition } from './board';
import type { CombatResolution } from './combat';
import { previewAttack, type CoreActionRequest, type CoreActionResult, type CoreActionType } from './core-actions';
import type { TabletopPrototypeForce } from './pieces';
import { RichMapBackdrop } from './RichMapBackdrop';
import type { TabletopGameState } from './state';

export interface RichMapShellProps {
  board: TabletopBoardDefinition;
  force: TabletopPrototypeForce;
  game: TabletopGameState;
  onAction: (request: CoreActionRequest) => CoreActionResult;
  onPass: () => void;
}

const seatLabels: Record<string, string> = { 'future-seat': 'Future Force', 'coalition-seat': 'Coalition' };

export function RichMapShell({ board, force, game, onAction, onPass }: RichMapShellProps) {
  const [selectedAction, setSelectedAction] = useState<CoreActionType>('move');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>('paris');
  const [pendingAttackRegionId, setPendingAttackRegionId] = useState<string | null>(null);
  const [combatResult, setCombatResult] = useState<CombatResolution | null>(null);
  const [feedback, setFeedback] = useState('Select a formation miniature on the map.');
  const [trayOpen, setTrayOpen] = useState(true);
  const [railView, setRailView] = useState<'board' | 'forces' | 'help'>('board');
  const round = game.round;
  const selectedPiece = selectedPieceId ? game.board.pieces[selectedPieceId] ?? null : null;
  const selectedDefinition = selectedPiece ? force.definitions[selectedPiece.definitionId] : null;
  const regions = useMemo(() => new Map(board.regions.map(region => [region.id, region])), [board.regions]);
  const frame = useMemo(() => buildR5RichMapFrame({ board, game, definitions: force.definitions, selectedPieceId, selectedRegionId, action: selectedAction }), [board, game, force.definitions, selectedPieceId, selectedRegionId, selectedAction]);
  const legal = useMemo(() => new Set(frame.legalTargetRegionIds), [frame]);
  const preview = selectedPiece && pendingAttackRegionId ? previewAttack(game, selectedPiece.id, pendingAttackRegionId) : null;

  const selectPiece = (pieceId: string) => {
    const piece = game.board.pieces[pieceId];
    if (!piece) return;
    setSelectedPieceId(pieceId); setSelectedRegionId(piece.regionId); setPendingAttackRegionId(null); setTrayOpen(true);
    setFeedback(`${force.definitions[piece.definitionId]?.name ?? piece.definitionId} selected.`);
  };
  const perform = (request: CoreActionRequest) => {
    const result = onAction(request); setFeedback(result.reason);
    if (result.ok) { if (result.combat) setCombatResult(result.combat); setSelectedPieceId(null); setPendingAttackRegionId(null); }
  };
  const selectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    if (!selectedPiece || !legal.has(regionId)) return;
    if (selectedAction === 'move') perform({ type: 'move', seatId: round.activeSeatId, pieceId: selectedPiece.id, targetRegionId: regionId });
    if (selectedAction === 'attack') { setPendingAttackRegionId(regionId); setTrayOpen(true); }
  };

  return <main className="r5-command-host" data-authority="r5-tabletop" data-visual-host="r3-wp6.6">
    <header className="r5-command-topbar">
      <div><p>R5 TABLETOP COMMAND · R3 PRESENTATION LINK</p><h1>FUTURE CONQUEST</h1></div>
      <div className="r5-top-metrics" aria-label="Tabletop round status">
        <span>ROUND <strong>{round.round}/{round.maxRounds}</strong></span>
        <span>ACTIVE SIDE <strong>{seatLabels[round.activeSeatId]}</strong></span>
        <span>COMMANDS <strong>{round.commandActionsRemaining[round.activeSeatId]}</strong></span>
        <span>PHASE <strong>{round.phase.toUpperCase()}</strong></span>
      </div>
    </header>
    <section className="r5-command-workspace">
      <nav className="r5-command-rail" aria-label="Board game views">
        <div className="r5-rail-brand"><strong>FC</strong><small>COMMAND</small></div>
        {([['board','⌖','Board'],['forces','◇','Forces'],['help','?','Help']] as const).map(([id, icon, label]) => <button key={id} className={railView === id ? 'active' : ''} onClick={() => setRailView(id)} title={label}><b>{icon}</b><small>{label}</small></button>)}
        <i>LINK</i>
      </nav>
      <section className="r5-physical-board" aria-label={`${board.name} physical terrain board`}>
        <RichMapBackdrop board={board} force={force} game={game} selectedPieceId={selectedPieceId} selectedRegionId={selectedRegionId} onSelectPiece={selectPiece} onSelectRegion={selectRegion} />
        <div className="r5-map-caption"><strong>CENTRAL EUROPE THEATRE</strong><span>Drag to pan · scroll to zoom · select miniatures and places directly</span></div>
        {railView !== 'board' && <aside className="r5-rail-popover"><button onClick={() => setRailView('board')} aria-label="Close">×</button><p>{railView === 'forces' ? 'FORCES' : 'FIELD MANUAL'}</p><h2>{railView === 'forces' ? 'R5 formations' : 'Board controls'}</h2>{railView === 'forces' ? Object.values(game.board.pieces).map(piece => <button key={piece.id} onClick={() => { selectPiece(piece.id); setRailView('board'); }}>{force.definitions[piece.definitionId]?.name} · STR {piece.strength}</button>) : <span>Select a formation miniature, choose Move or Attack, then select a highlighted geographic place. Every action is validated by the R5 dispatcher.</span>}</aside>}
        <aside className={`r5-board-tray ${trayOpen ? 'open' : 'closed'}`} aria-label="Board game action tray">
          <button className="r5-tray-toggle" onClick={() => setTrayOpen(value => !value)} aria-expanded={trayOpen}>{trayOpen ? '›' : '‹'}<span>{trayOpen ? 'Collapse tray' : 'Open action tray'}</span></button>
          <div className="r5-tray-content">
            <p className="r5-panel-label">CURRENT ACTIVATION</p><h2>{seatLabels[round.activeSeatId]}</h2>
            <div className="r5-action-tabs"><button className={selectedAction === 'move' ? 'active' : ''} onClick={() => { setSelectedAction('move'); setPendingAttackRegionId(null); }}>MOVE</button><button className={selectedAction === 'attack' ? 'active' : ''} onClick={() => { setSelectedAction('attack'); setPendingAttackRegionId(null); }}>ATTACK</button><button onClick={onPass}>PASS</button></div>
            {selectedPiece && selectedDefinition ? <section className="r5-piece-card"><small>{selectedPiece.factionId === 'future-force' ? 'FUTURE FORCE' : 'COALITION'}</small><h3>{selectedDefinition.name}</h3><dl><div><dt>Strength</dt><dd>{selectedPiece.strength}</dd></div><div><dt>Readiness</dt><dd>{selectedPiece.readiness}</dd></div><div><dt>Position</dt><dd>{regions.get(selectedPiece.regionId)?.name}</dd></div></dl><p>LEGAL {selectedAction.toUpperCase()} TARGETS</p><div className="r5-target-list">{frame.legalTargetRegionIds.map(id => <button key={id} onClick={() => selectRegion(id)}>{regions.get(id)?.name ?? id}</button>)}</div></section> : <p className="r5-empty-selection">Select a formation miniature on the terrain.</p>}
            {preview && selectedPiece && pendingAttackRegionId && <section className="r5-combat-context"><p>COMBAT PREVIEW</p><strong>{preview.attackerDice} dice vs {preview.defenderDice} dice</strong><span>{preview.advantage === 'even' ? 'Even odds' : `${preview.advantage} advantage`}</span><button onClick={() => perform({ type: 'attack', seatId: round.activeSeatId, pieceId: selectedPiece.id, targetRegionId: pendingAttackRegionId })}>CONFIRM ATTACK</button><button onClick={() => setPendingAttackRegionId(null)}>Cancel</button></section>}
            {combatResult && <section className="r5-combat-context"><p>COMBAT RESOLVED</p><div className="r5-dice-row">{combatResult.attackerRolls.map((die, i) => <b key={`a${i}`} className={die >= 5 ? 'hit' : ''}>{die}</b>)}</div><span>{combatResult.attackerHits} attacker hits · {combatResult.defenderHits} defender hits</span><button onClick={() => setCombatResult(null)}>CONTINUE</button></section>}
            <output>{feedback}</output>
          </div>
        </aside>
      </section>
    </section>
  </main>;
}
