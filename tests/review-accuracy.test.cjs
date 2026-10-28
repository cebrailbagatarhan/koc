const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const filename = path.join(__dirname, '../utils/reviewAccuracy.ts');
const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const compiled = new Module(filename, module);
compiled.filename = filename;
compiled.paths = module.paths;
compiled._compile(js, filename);
const { getReviewAccuracyPercentage } = compiled.exports;

test('shows 0 and 100 percent for boundary scores', () => {
  assert.equal(getReviewAccuracyPercentage(0, 4), 0);
  assert.equal(getReviewAccuracyPercentage(4, 4), 100);
});
test('rounds the correct share of answered questions', () => {
  assert.equal(getReviewAccuracyPercentage(2, 3), 67);
  assert.equal(getReviewAccuracyPercentage(3, 4), 75);
});
test('rejects empty, invalid, or inconsistent totals', () => {
  for (const [correct, total] of [[0, 0], [3, 2], [-1, 3], [1.5, 3], [1, Infinity], [1, NaN]]) {
    assert.equal(getReviewAccuracyPercentage(correct, total), null);
  }
});
