const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CENTRAL_FRONT_BOARD,
  adjacentRegionIds,
  validateTabletopBoard
} = require('../.tabletop-test-dist/board.js');
const {
  CENTRAL_FRONT_PROTOTYPE_FORCE,
  validatePrototypeForce
} = require('../.tabletop-test-dist/pieces.js');

test('prototype board stays within the intended tabletop scale', () => {
  assert.equal(CENTRAL_FRONT_BOARD.regions.length, 18);
  assert.ok(CENTRAL_FRONT_BOARD.regions.length >= 15);
  assert.ok(CENTRAL_FRONT_BOARD.regions.length <= 20);
  assert.equal(CENTRAL_FRONT_BOARD.connections.length, 39);
});

test('prototype objectives are explicit and valid', () => {
  assert.deepEqual(
    CENTRAL_FRONT_BOARD.objectives.map((objective) => objective.label),
    ['London', 'Paris', 'Ruhr', 'Berlin', 'Vienna', 'Carpathian Portal', 'Kyiv']
  );
  assert.deepEqual(validateTabletopBoard(CENTRAL_FRONT_BOARD), []);
});

test('strategic graph is connected and every region has at least two exits', () => {
  const visited = new Set();
  const stack = [CENTRAL_FRONT_BOARD.regions[0].id];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    for (const neighbour of adjacentRegionIds(CENTRAL_FRONT_BOARD, current)) {
      if (!visited.has(neighbour)) stack.push(neighbour);
    }
  }

  assert.equal(visited.size, CENTRAL_FRONT_BOARD.regions.length);
  for (const region of CENTRAL_FRONT_BOARD.regions) {
    assert.ok(
      adjacentRegionIds(CENTRAL_FRONT_BOARD, region.id).length >= 2,
      `${region.id} should have at least two strategic exits`
    );
  }
});

test('network exposes distinct strategic route categories', () => {
  const types = new Set(CENTRAL_FRONT_BOARD.connections.map((connection) => connection.type));
  assert.ok(types.has('major-corridor'));
  assert.ok(types.has('route'));
  assert.ok(types.has('river-crossing'));
  assert.ok(types.has('mountain-pass'));
  assert.ok(types.has('sea-crossing'));
});

test('validator rejects duplicate links and malformed references', () => {
  const duplicateLink = structuredClone(CENTRAL_FRONT_BOARD);
  duplicateLink.connections.push({ ...duplicateLink.connections[0], id: 'duplicate-link' });
  assert.match(validateTabletopBoard(duplicateLink).join('\n'), /Duplicate undirected link/);

  const brokenObjective = structuredClone(CENTRAL_FRONT_BOARD);
  brokenObjective.objectives[0].regionId = 'missing-region';
  assert.match(validateTabletopBoard(brokenObjective).join('\n'), /unknown region/);

  const isolated = structuredClone(CENTRAL_FRONT_BOARD);
  isolated.connections = isolated.connections.filter((connection) => (
    connection.a !== 'london' && connection.b !== 'london'
  ));
  assert.match(validateTabletopBoard(isolated).join('\n'), /Isolated region: london/);
});

test('prototype force has valid asymmetric starting formations', () => {
  assert.deepEqual(validatePrototypeForce(CENTRAL_FRONT_BOARD, CENTRAL_FRONT_PROTOTYPE_FORCE), []);

  const future = CENTRAL_FRONT_PROTOTYPE_FORCE.pieces.filter((piece) => piece.factionId === 'future-force');
  const coalition = CENTRAL_FRONT_PROTOTYPE_FORCE.pieces.filter((piece) => piece.factionId === 'present-day-coalition');
  assert.equal(future.length, 8);
  assert.equal(coalition.length, 12);
});

test('every starting formation has a unique identity, valid definition and board position', () => {
  const boardRegions = new Set(CENTRAL_FRONT_BOARD.regions.map((region) => region.id));
  const ids = new Set();

  for (const piece of CENTRAL_FRONT_PROTOTYPE_FORCE.pieces) {
    assert.equal(ids.has(piece.id), false, `duplicate piece id ${piece.id}`);
    ids.add(piece.id);
    const definition = CENTRAL_FRONT_PROTOTYPE_FORCE.definitions[piece.definitionId];
    assert.ok(definition, `${piece.id} should have a definition`);
    assert.equal(definition.factionId, piece.factionId);
    assert.equal(boardRegions.has(piece.regionId), true, `${piece.id} should start on the board`);
  }
});

test('starting deployment exercises multiple regions and stacked-piece presentation', () => {
  for (const factionId of ['future-force', 'present-day-coalition']) {
    const factionPieces = CENTRAL_FRONT_PROTOTYPE_FORCE.pieces.filter((piece) => piece.factionId === factionId);
    assert.ok(new Set(factionPieces.map((piece) => piece.regionId)).size >= 2);
  }

  const occupancy = new Map();
  for (const piece of CENTRAL_FRONT_PROTOTYPE_FORCE.pieces) {
    occupancy.set(piece.regionId, (occupancy.get(piece.regionId) ?? 0) + 1);
  }
  assert.ok([...occupancy.values()].some((count) => count >= 2));
});
