const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const builder = fs.readFileSync('scripts/build-motion-comic-assets.mjs', 'utf8');
const verifier = fs.readFileSync('scripts/verify-motion-comic-build.mjs', 'utf8');
const titleBuilder = fs.readFileSync('scripts/build-title-card-asset.mjs', 'utf8');
const titleVerifier = fs.readFileSync('scripts/verify-title-card-build.mjs', 'utf8');

test('Page 2 panels are emitted to a stable production directory', () => {
  assert.match(builder, /const page2PublicDirectory = path\.join\([\s\S]*?'page2'\);/);
  assert.match(builder, /mkdir\(page2PublicDirectory/);
  assert.match(builder, /writeFile\(path\.join\(page2PublicDirectory, asset\.fileName\), asset\.bytes\)/);
});

test('title card uses the same stable production asset strategy', () => {
  assert.match(titleBuilder, /publicOutputPath/);
  assert.match(titleBuilder, /writeFile\(publicOutputPath, bytes\)/);
  assert.match(titleVerifier, /generated', 'motion-comic-v3', 'title-card-future-conquest\.webp'/);
  assert.match(titleVerifier, /sha256 !== EXPECTED_SHA256/);
  assert.match(titleVerifier, /path: `generated\/motion-comic-v3\/\$\{fileName\}`/);
});

test('production verification checks every stable Page 2 panel', () => {
  assert.match(verifier, /const page2AssetDirectory = path\.join\([\s\S]*?'page2'\);/);
  assert.match(verifier, /const fileName = `\$\{asset\.baseName\}\.webp`/);
  assert.match(verifier, /assetStats\.size !== asset\.length/);
  assert.match(verifier, /!isWebP\(assetBytes\)/);
  assert.doesNotMatch(verifier, /viteAssetFiles/);
});
