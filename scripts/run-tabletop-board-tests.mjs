import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';

const tsc = process.platform === 'win32' ? 'node_modules/.bin/tsc.cmd' : 'node_modules/.bin/tsc';

rmSync('.tabletop-test-dist', { recursive: true, force: true });
execFileSync(tsc, ['-p', 'tsconfig.tabletop-board-test.json'], { stdio: 'inherit' });
writeFileSync('.tabletop-test-dist/package.json', '{"type":"commonjs"}\n');
execFileSync(process.execPath, ['--test', 'tests/tabletop-board.test.cjs'], { stdio: 'inherit' });
