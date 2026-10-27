const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Compile the actual app utility, without importing Expo or React Native.
const filename = path.join(__dirname, '../utils/goalWorkload.ts');
const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const compiled = new Module(filename, module);
compiled.filename = filename;
compiled.paths = module.paths;
compiled._compile(js, filename);
const { estimateGoalWorkload, formatWeeklyStudyTime } = compiled.exports;
const today = new Date(2026, 9, 27, 15);

test('includes today and the target day in the preview', () => {
  assert.deepEqual(estimateGoalWorkload('2026-10-29', 30, today), { days: 3, totalMinutes: 90 });
});
test('same-day goal still has one day of study', () => {
  assert.deepEqual(estimateGoalWorkload('2026-10-27', 15, today), { days: 1, totalMinutes: 15 });
});
test('expired goals show no remaining workload', () => {
  assert.deepEqual(estimateGoalWorkload('2026-10-26', 45, today), { days: 0, totalMinutes: 0 });
});
test('rejects invalid dates and non-finite study time', () => {
  for (const date of ['2026-02-30', '2026-13-01', '2026-1-01', 'nonsense']) {
    assert.equal(estimateGoalWorkload(date, 30, today), null);
  }
  assert.equal(estimateGoalWorkload('2026-10-28', Infinity, today), null);
  assert.equal(estimateGoalWorkload('2026-10-28', 0, today), null);
});
test('uses calendar days rather than elapsed 24-hour blocks', () => {
  assert.deepEqual(estimateGoalWorkload('2024-03-01', 20, new Date(2024, 1, 28, 23)), { days: 3, totalMinutes: 60 });
});

test('weekly study preview includes seven days and formats hours and minutes', () => {
  assert.equal(formatWeeklyStudyTime(15), '1 sa 45 dk');
  assert.equal(formatWeeklyStudyTime(25), '2 sa 55 dk');
  assert.equal(formatWeeklyStudyTime(40), '4 sa 40 dk');
  assert.equal(formatWeeklyStudyTime(60), '7 sa');
  assert.equal(formatWeeklyStudyTime(1), '7 dk');
});

test('weekly study preview rejects invalid and overflowing durations', () => {
  for (const minutes of [0, -5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.equal(formatWeeklyStudyTime(minutes), null);
  }
});
