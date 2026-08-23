import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';

const tsc = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';

rmSync('.test-dist', { recursive: true, force: true });
execFileSync(tsc, ['-p', 'tsconfig.test.json'], { stdio: 'inherit' });
writeFileSync('.test-dist/package.json', '{"type":"commonjs"}\n');

// R5 deliberately keeps the proven simulation layer available as an implementation
// resource.  Keep this list explicit: tests outside it are presentation/source
// contracts for the superseded R2/R3 application, not an implicit wildcard gate on
// the current tabletop entrypoint.
const reusableEngineTests = [
  'tests/concurrent-operation-defenders.test.cjs',
  'tests/current-engine-balance-harness.test.cjs',
  'tests/engine.test.cjs',
  'tests/formation-organisation.test.cjs',
  'tests/persistence.test.cjs',
  'tests/player-preferences.test.cjs',
  'tests/r2-wp2-engineering-infrastructure.test.cjs',
  'tests/r2-wp3-territory-logistics.test.cjs',
  'tests/r2-wp7-balance-player.test.cjs',
  'tests/targeting.test.cjs',
  'tests/wp11-balance-harness-modernisation.test.cjs',
  'tests/wp2-logistics-resilience.test.cjs'
];

execFileSync(process.execPath, ['--test', ...reusableEngineTests], { stdio: 'inherit' });
