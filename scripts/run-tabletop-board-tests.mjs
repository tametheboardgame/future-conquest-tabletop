import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';

const tsc = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';

rmSync('.tabletop-test-dist', { recursive: true, force: true });
execFileSync(tsc, ['-p', 'tsconfig.tabletop-board-test.json'], { stdio: 'inherit' });
writeFileSync('.tabletop-test-dist/package.json', '{"type":"commonjs"}\n');
execFileSync(process.execPath, ['--test', 'tests/tabletop-board.test.cjs', 'tests/r5-bg1-rules-authority.test.cjs'], { stdio: 'inherit' });
