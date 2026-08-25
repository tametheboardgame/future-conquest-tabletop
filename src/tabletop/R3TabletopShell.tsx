import { useMemo, useState } from 'react';
import { legalTargets, previewAttack, type CoreActionRequest, type CoreActionResult } from './core-actions';
import type { CombatResolution } from './combat';
import type { TabletopBoardDefinition } from './board';
import { commandSeatLabel } from './command-seats';
import type { TabletopPrototypeForce } from './pieces';
import { RichMapBackdrop } from './RichMapBackdrop';
import type { TabletopGameState } from './state';
import type { R5MapDiagnosticMode } from './r5-hardware-diagnostic';

interface Props {
  board: TabletopBoardDefinition;
  force: TabletopPrototypeForce;
  game: TabletopGameState;
  onAction: (request: CoreActionRequest) => CoreActionResult;
  onPass: () => void;
  diagnosticMode?: R5MapDiagnosticMode;
}

type Action = 'move' | 'attack';

/**
 * R3 is deliberately only the view/controller here. Every piece, target and
 * result below is read from, or sent to, the R5 tabletop boundary in Props.
 */
export function R3TabletopShell({ board, force, game, onAction, onPass, diagnosticMode = 'production' }: Props) {
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState('paris');
  const [action, setAction] = useState<Action>('move');
  const [trayOpen, setTrayOpen] = useState(true);
  const [feedback, setFeedback] = useState('Select a formation on the map.');
  const [combat, setCombat] = useState<CombatResolution | null>(null);
  const selectedPiece = selectedPieceId ? game.board.pieces[selectedPieceId] : undefined;
  const targets = useMemo(
    () => new Set(legalTargets(game, action, selectedPieceId ?? undefined)),
    [game, action, selectedPieceId]
  );
  const regions = useMemo(() => new Map(board.regions.map(region => [region.id, region])), [board]);
  const definition = selectedPiece ? force.definitions[selectedPiece.definitionId] : undefined;
  const activeSeat = game.round.activeSeatId;

  const selectPiece = (pieceId: string) => {
    const piece = game.board.pieces[pieceId];
    if (!piece) return;
    setSelectedPieceId(pieceId);
    setSelectedRegionId(piece.regionId);
    setFeedback(`${force.definitions[piece.definitionId]?.name ?? piece.definitionId} selected.`);
    setTrayOpen(true);
  };

  const selectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    if (!selectedPiece || !targets.has(regionId)) return;
    if (action === 'attack') {
      const preview = previewAttack(game, selectedPiece.id, regionId);
      setFeedback(preview
        ? `Engagement preview: ${preview.attackerDice} attack dice against ${preview.defenderDice}. Select Engage to resolve.`
        : 'That engagement is no longer legal.');
      return;
    }
    const result = onAction({ type: 'move', seatId: activeSeat, pieceId: selectedPiece.id, targetRegionId: regionId });
    setFeedback(result.reason);
    if (result.ok) setSelectedPieceId(null);
  };

  const engage = () => {
    if (!selectedPiece || !targets.has(selectedRegionId)) return;
    const result = onAction({ type: 'attack', seatId: activeSeat, pieceId: selectedPiece.id, targetRegionId: selectedRegionId });
    setFeedback(result.reason);
    if (result.ok) {
      setCombat(result.combat ?? null);
      setSelectedPieceId(null);
    }
  };

  return <main className="r3-tabletop-shell" data-authority="r5-tabletop" data-presentation="r3-wp6.6-shell">
    <header className="r3-command-topbar">
      <div><p>Future Conquest</p><h1>{board.name}</h1></div>
      <dl aria-label="Tabletop command status">
        <div><dt>Round</dt><dd>{game.round.round} / {game.round.maxRounds}</dd></div>
        <div><dt>Active command</dt><dd>{commandSeatLabel(activeSeat)}</dd></div>
        <div><dt>Actions</dt><dd>{game.round.commandActionsRemaining[activeSeat]}</dd></div>
        <div><dt>Phase</dt><dd>{game.round.phase}</dd></div>
      </dl>
    </header>

    <div className="r3-command-workspace">
      <nav className="r3-command-rail" aria-label="Board game views">
        <div className="r3-command-brand"><strong>FC</strong><span>COMMAND</span></div>
        <button className="active" type="button"><b>⌖</b><span>Board</span></button>
        <button type="button" onClick={() => setTrayOpen(true)}><b>◇</b><span>Forces</span></button>
        <button type="button" onClick={() => setTrayOpen(true)}><b>▣</b><span>Combat</span></button>
        <div className="r3-command-link"><i /> LINK</div>
      </nav>

      <section className="r3-map-host" aria-label={`${board.name} physical terrain board`}>
        <RichMapBackdrop board={board} force={force} game={game} selectedPieceId={selectedPieceId} selectedRegionId={selectedRegionId} onSelectPiece={selectPiece} onSelectRegion={selectRegion} diagnosticMode={diagnosticMode} />
        <div className="r3-map-caption"><span>THEATRE // EUROPE</span><strong>Physical command map</strong><small>Pan · zoom · select formation miniatures</small></div>
        <div className="r3-legal-targets" aria-label="R5 legal geographic targets">
          {[...targets].map(regionId => {
            const region = regions.get(regionId);
            if (!region) return null;
            return <button key={regionId} type="button" style={{ left: `${region.x / 12}%`, top: `${(region.y - 150) / 5.8}%` }} className={selectedRegionId === regionId ? 'is-selected' : ''} onClick={() => selectRegion(regionId)}><i />{region.name}</button>;
          })}
        </div>

        <aside className={`r3-board-tray${trayOpen ? ' is-open' : ''}`} aria-label="Board game action tray">
          <button className="r3-tray-toggle" type="button" aria-expanded={trayOpen} onClick={() => setTrayOpen(value => !value)}>{trayOpen ? '›' : '‹'}<span>Actions</span></button>
          <div className="r3-tray-content">
            <p className="r3-panel-label">Current activation</p><h2>{commandSeatLabel(activeSeat)}</h2>
            <p className="r3-piece-name">{definition?.name ?? 'No formation selected'}</p>
            {selectedPiece && <p className="r3-piece-stats">Strength {selectedPiece.strength} · {selectedPiece.readiness} · {selectedPiece.supply}</p>}
            <div className="r3-action-buttons">
              <button type="button" className={action === 'move' ? 'active' : ''} onClick={() => { setAction('move'); setFeedback('Move selected. Legal destinations highlighted.'); }}>Move</button>
              <button type="button" className={action === 'attack' ? 'active' : ''} onClick={() => { setAction('attack'); setFeedback('Attack selected. Legal targets highlighted.'); }}>Attack</button>
            </div>
            {action === 'attack' && selectedPiece && targets.has(selectedRegionId) && <button className="r3-engage" type="button" onClick={engage}>Engage {regions.get(selectedRegionId)?.name}</button>}
            <p className="r3-feedback" aria-live="polite">{feedback}</p>
            {combat && <div className="r3-combat-result"><p className="r3-panel-label">Deterministic combat result</p><div><span>Attack</span>{combat.attackerRolls.map((die, index) => <b key={index}>{die}</b>)}</div><div><span>Defence</span>{combat.defenderRolls.map((die, index) => <b key={index}>{die}</b>)}</div><strong>{combat.attackerHits} hits · {combat.defenderHits} returned</strong><button type="button" onClick={() => setCombat(null)}>Clear result</button></div>}
            <button className="r3-pass" type="button" onClick={onPass}>Pass activation</button>
          </div>
        </aside>
      </section>
    </div>
  </main>;
}
