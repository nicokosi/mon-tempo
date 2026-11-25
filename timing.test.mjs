// Run with: node timing.test.mjs
import assert from 'node:assert/strict';
import { clampBpm, clampBeats, parseParams, scannerPosition, tapTempo } from './timing.js';

assert.equal(clampBpm(10), 30);
assert.equal(clampBpm(999), 250);
assert.equal(clampBpm('abc'), 120);
assert.equal(clampBeats(0), 4);
assert.equal(clampBeats(13), 12);

assert.deepEqual(parseParams(''), { bpm: 120, beats: 4 });
assert.deepEqual(parseParams('?bpm=96&beats=3'), { bpm: 96, beats: 3 });

assert.equal(scannerPosition(0, 0), 0);
assert.equal(scannerPosition(0, 1), 1);
assert.equal(scannerPosition(1, 0), 1);
assert.equal(scannerPosition(1, 0.25), 0.75);

assert.equal(tapTempo([1000]), null);
assert.equal(tapTempo([0, 500, 1000, 1500]), 120);
assert.equal(tapTempo([0, 1000]), 60);

console.log('timing: ok');
