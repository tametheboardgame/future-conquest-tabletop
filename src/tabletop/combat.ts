import { adjacentRegionIds, type TabletopBoardDefinition, type TabletopTerrain } from './board';
import type { TabletopGameState, TabletopPieceState, TabletopRandomState, TabletopReadiness, TabletopSupplyState } from './state';

export interface CombatModifier { side: 'attacker' | 'defender'; value: number; reason: string }
export interface CombatPreview {
  attackerDice: number;
  defenderDice: number;
  advantage: 'attacker' | 'defender' | 'even';
  modifiers: CombatModifier[];
}
export interface CombatResolution extends CombatPreview {
  attacker: TabletopPieceState;
  defenders: TabletopPieceState[];
  attackerRolls: number[];
  defenderRolls: number[];
  attackerHits: number;
  defenderHits: number;
  pieces: Record<string, TabletopPieceState>;
  random: TabletopRandomState;
  retreatedTo: string | null;
  eliminated: string[];
  feedback: string;
}

const terrainDefence: Partial<Record<TabletopTerrain, number>> = { urban: 1, forest: 1, river: 1, mountain: 2 };
const supplyPenalty: Record<TabletopSupplyState, number> = { supplied: 0, strained: -1, 'cut-off': -2 };
const readinessPenalty: Record<TabletopReadiness, number> = { ready: 0, damaged: -1, crippled: -2 };
const label = (value: number) => `${value > 0 ? '+' : ''}${value}`;

function formationModifiers(piece: TabletopPieceState, side: CombatModifier['side']): CombatModifier[] {
  const result: CombatModifier[] = [];
  const supply = supplyPenalty[piece.supply];
  const readiness = readinessPenalty[piece.readiness];
  if (supply) result.push({ side, value: supply, reason: `${piece.definitionId}: ${piece.supply} supply ${label(supply)}` });
  if (readiness) result.push({ side, value: readiness, reason: `${piece.definitionId}: ${piece.readiness} readiness ${label(readiness)}` });
  return result;
}

/** Pure, non-random combat forecast. One die is granted for each two strength, rounded up. */
export function previewCombat(board: TabletopBoardDefinition, attacker: TabletopPieceState, defenders: TabletopPieceState[]): CombatPreview {
  const ordered = [...defenders].sort((a, b) => a.id.localeCompare(b.id));
  const modifiers = [
    ...formationModifiers(attacker, 'attacker'),
    ...ordered.flatMap((piece) => formationModifiers(piece, 'defender'))
  ];
  const region = board.regions.find((candidate) => candidate.id === ordered[0]?.regionId);
  const terrain = region ? terrainDefence[region.terrain] ?? 0 : 0;
  if (terrain) modifiers.push({ side: 'defender', value: terrain, reason: `${region?.terrain} terrain ${label(terrain)}` });
  if (ordered.some((piece) => piece.entrenched)) modifiers.push({ side: 'defender', value: 1, reason: 'entrenched posture +1' });
  const attackerBase = Math.max(1, Math.ceil(attacker.strength / 2));
  const defenderBase = Math.max(1, Math.ceil(ordered.reduce((sum, piece) => sum + piece.strength, 0) / 2));
  const attackerDice = Math.max(1, attackerBase + modifiers.filter((m) => m.side === 'attacker').reduce((sum, m) => sum + m.value, 0));
  const defenderDice = Math.max(1, defenderBase + modifiers.filter((m) => m.side === 'defender').reduce((sum, m) => sum + m.value, 0));
  return { attackerDice, defenderDice, advantage: attackerDice === defenderDice ? 'even' : attackerDice > defenderDice ? 'attacker' : 'defender', modifiers };
}

/** Indexed integer mixing keeps every roll reproducible from the save's seed and cursor. */
export function rollCombatDie(random: TabletopRandomState): { value: number; random: TabletopRandomState } {
  let value = (random.seed + random.cursor + 0x9e3779b9) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  value = (value ^ (value >>> 15)) >>> 0;
  return { value: value % 6 + 1, random: { ...random, cursor: random.cursor + 1 } };
}

function worsen(readiness: TabletopReadiness): TabletopReadiness {
  return readiness === 'ready' ? 'damaged' : 'crippled';
}

export function resolveCombat(state: TabletopGameState, board: TabletopBoardDefinition, attackerId: string, targetRegionId: string): CombatResolution {
  const attacker = state.board.pieces[attackerId];
  const defenders = Object.values(state.board.pieces).filter((p) => p.regionId === targetRegionId && p.factionId !== attacker.factionId).sort((a, b) => a.id.localeCompare(b.id));
  const preview = previewCombat(board, attacker, defenders);
  let random = state.random;
  const roll = (count: number) => Array.from({ length: count }, () => { const next = rollCombatDie(random); random = next.random; return next.value; });
  const attackerRolls = roll(preview.attackerDice);
  const defenderRolls = roll(preview.defenderDice);
  const attackerHits = attackerRolls.filter((die) => die >= 5).length;
  const defenderHits = defenderRolls.filter((die) => die >= 5).length;
  const pieces = structuredClone(state.board.pieces);
  const eliminated: string[] = [];
  let remainingHits = attackerHits;
  for (const defender of defenders) {
    const hits = Math.min(remainingHits, defender.strength);
    remainingHits -= hits;
    if (hits >= defender.strength) { delete pieces[defender.id]; eliminated.push(defender.id); }
    else if (hits > 0) pieces[defender.id] = { ...defender, strength: defender.strength - hits, readiness: worsen(defender.readiness) };
  }
  if (defenderHits >= attacker.strength) { delete pieces[attacker.id]; eliminated.push(attacker.id); }
  else if (defenderHits > 0) pieces[attacker.id] = { ...attacker, strength: attacker.strength - defenderHits, readiness: worsen(attacker.readiness) };

  const survivors = defenders.filter((piece) => pieces[piece.id]);
  let retreatedTo: string | null = null;
  if (survivors.length && attackerHits > defenderHits) {
    retreatedTo = adjacentRegionIds(board, targetRegionId).sort().find((regionId) => {
      const occupants = Object.values(pieces).filter((piece) => piece.regionId === regionId);
      return regionId !== attacker.regionId && !occupants.some((piece) => piece.factionId !== defenders[0].factionId);
    }) ?? null;
    if (retreatedTo) for (const defender of survivors) pieces[defender.id] = { ...pieces[defender.id], regionId: retreatedTo };
  }
  const retreatText = retreatedTo ? ` Defenders retreated to ${retreatedTo}.` : '';
  const lossText = eliminated.length ? ` Eliminated: ${eliminated.join(', ')}.` : '';
  return { ...preview, attacker: structuredClone(attacker), defenders: structuredClone(defenders), attackerRolls, defenderRolls, attackerHits, defenderHits, pieces, random, retreatedTo, eliminated,
    feedback: `${preview.attackerDice} vs ${preview.defenderDice} dice; attacker ${attackerHits} hit${attackerHits === 1 ? '' : 's'}, defender ${defenderHits}.${retreatText}${lossText}` };
}
