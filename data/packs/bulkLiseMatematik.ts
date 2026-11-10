import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { QuestionDifficulty } from '@/data/embeddedQuestionPackV10';

let seed = 20261110;
function rnd() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function pick<T>(list: T[]): T {
  return list[Math.floor(rnd() * list.length)];
}
function shuffle<T>(list: T[]): T[] {
  const result = [...list];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rnd() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}
function mc(input: {
  id: string;
  levelName: string;
  courseName: string;
  prompt: string;
  answer: string;
  distractors: string[];
  explanation: string;
  difficulty?: QuestionDifficulty;
}): EmbeddedQuestionSeed {
  const options = shuffle([input.answer, ...input.distractors]);
  if (options.length !== 4 || new Set(options).size !== 4) {
    throw new Error(`Seçenek hatası: ${input.id}`);
  }
  return {
    id: input.id,
    levelName: input.levelName,
    courseName: input.courseName,
    topicIndex: 0,
    prompt: input.prompt,
    options,
    correctAnswer: input.answer,
    explanation: input.explanation,
    difficulty: input.difficulty ?? 'standard',
    questionKind: 'multiple-choice',
  };
}

/* ---------------------------------------------------------------- */
/* Ortak yardımcılar                                                 */
/* ---------------------------------------------------------------- */

const LEVEL = 'Lise';
const MATH = 'Matematik';

const TOPIC_EQ = 'İkinci Dereceden Denklemler';
const TOPIC_FN = 'Fonksiyonlar';
const TOPIC_LOG = 'Logaritma';

const questions: EmbeddedQuestionSeed[] = [];
const topicIds: Record<string, string[]> = {};
const usedPrompts = new Set<string>();

type Draft = {
  id: string;
  prompt: string;
  answer: string;
  distractors: string[];
  explanation: string;
  difficulty: QuestionDifficulty;
};

function minus(text: string): string {
  return text.replace(/(^|[\s(=])-(?=\d)/g, '$1−');
}

function add(draft: Draft, topic: string): boolean {
  const key = `${draft.prompt}|${[draft.answer, ...draft.distractors].slice().sort().join('|')}`;
  if (usedPrompts.has(key)) return false;
  usedPrompts.add(key);
  questions.push(
    mc({
      id: draft.id,
      levelName: LEVEL,
      courseName: MATH,
      prompt: minus(draft.prompt),
      answer: draft.answer,
      distractors: draft.distractors,
      explanation: minus(draft.explanation),
      difficulty: draft.difficulty,
    }),
  );
  topicIds[topic] = [...(topicIds[topic] ?? []), draft.id];
  return true;
}

function run(count: number, make: (index: number) => Draft | null, topic: string) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 200) {
    guard += 1;
    const draft = make(made);
    if (!draft) continue;
    if (add(draft, topic)) made += 1;
  }
  if (made < count) throw new Error(`${topic}: ${count} yerine ${made} soru üretildi`);
}

function difficultyAt(index: number): QuestionDifficulty {
  const slot = index % 10;
  if (slot < 3) return 'easy';
  if (slot < 8) return 'standard';
  return 'hard';
}

function fmt(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded).replace('.', ',').replace('-', '−');
}

function par(value: number): string {
  return value < 0 ? `(${fmt(value)})` : fmt(value);
}

function sq(value: number): string {
  return value < 0 ? `(${fmt(value)})²` : `${value}²`;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

function sub(value: number): string {
  return String(value)
    .split('')
    .map((digit) => SUB[Number(digit)])
    .join('');
}

function sup(value: number): string {
  return String(value)
    .split('')
    .map((digit) => SUP[Number(digit)])
    .join('');
}

function coefX(value: number): string {
  if (value === 1) return ' + x';
  if (value === -1) return ' − x';
  return value > 0 ? ` + ${value}x` : ` − ${Math.abs(value)}x`;
}

function linText(m: number, n: number): string {
  let text = m === 1 ? 'x' : m === -1 ? '−x' : `${fmt(m)}x`;
  if (n !== 0) text += n > 0 ? ` + ${n}` : ` − ${Math.abs(n)}`;
  return text;
}

function polyText(a: number, b: number, c: number): string {
  let text = a === 1 ? 'x²' : `${a}x²`;
  if (b !== 0) text += coefX(b);
  if (c !== 0) text += c > 0 ? ` + ${c}` : ` − ${Math.abs(c)}`;
  return text;
}

function quadText(a: number, b: number, c: number): string {
  return `${polyText(a, b, c)} = 0`;
}

function shift(a: number): string {
  return a >= 0 ? `x − ${a}` : `x + ${Math.abs(a)}`;
}

function factorText(root: number): string {
  return root >= 0 ? `(x − ${root})` : `(x + ${Math.abs(root)})`;
}

function nums(answer: number, candidates: number[]): string[] {
  const seen = new Set([fmt(answer)]);
  const out: string[] = [];
  for (const value of candidates) {
    if (out.length === 3) break;
    if (!Number.isFinite(value) || !Number.isInteger(value)) continue;
    const text = fmt(value);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  let step = 1;
  while (out.length < 3 && step < 60) {
    for (const value of [answer + step, answer - step]) {
      if (out.length === 3) break;
      const text = fmt(value);
      if (seen.has(text)) continue;
      seen.add(text);
      out.push(text);
    }
    step += 1;
  }
  if (out.length < 3) throw new Error('çeldirici yetersiz');
  return out;
}

function texts(answer: string, candidates: string[], fallback?: (step: number) => string): string[] {
  const seen = new Set([answer]);
  const out: string[] = [];
  for (const text of candidates) {
    if (out.length === 3) break;
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  if (out.length < 3 && fallback) {
    let step = 1;
    while (out.length < 3 && step < 60) {
      const text = fallback(step);
      step += 1;
      if (seen.has(text)) continue;
      seen.add(text);
      out.push(text);
    }
  }
  if (out.length < 3) throw new Error('çeldirici yetersiz');
  return out;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
}

function frac(n: number, d: number): string {
  const sign = n * d < 0 ? '−' : '';
  const a = Math.abs(n);
  const b = Math.abs(d);
  const g = gcd(a, b);
  const na = a / g;
  const nb = b / g;
  return nb === 1 ? `${sign}${na}` : `${sign}${na}/${nb}`;
}

/* ---------------------------------------------------------------- */
/* İkinci Dereceden Denklemler                                       */
/* ---------------------------------------------------------------- */

function genFactor() {
  run(
    40,
    (i) => {
      const r1 = -8 + Math.floor(rnd() * 11);
      const r2 = r1 + 1 + Math.floor(rnd() * 6);
      if (r2 > 10) return null;
      const eq = quadText(1, -(r1 + r2), r1 * r2);
      const askBig = i % 2 === 0;
      const answer = askBig ? r2 : r1;
      const prompt = askBig
        ? pick([
            `${eq} denkleminin büyük kökü kaçtır?`,
            `${eq} denklemini sağlayan büyük kök aşağıdakilerden hangisidir?`,
            `${eq} denkleminin köklerinden büyük olanı kaçtır?`,
          ])
        : pick([
            `${eq} denkleminin küçük kökü kaçtır?`,
            `${eq} denklemini sağlayan küçük kök aşağıdakilerden hangisidir?`,
            `${eq} denkleminin köklerinden küçük olanı kaçtır?`,
          ]);
      return {
        id: `bulk-lm-fac-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: nums(answer, [r1, r2, -r1, -r2, r1 + r2, r1 * r2, -(r1 * r2)]),
        explanation: `${eq} denklemi ${factorText(r1)}${factorText(r2)} = 0 biçiminde çarpanlara ayrılır. Buradan kökler ${r1} ve ${r2} bulunur. Büyük kök ${Math.max(r1, r2)}, küçük kök ${Math.min(r1, r2)} olduğundan cevap ${answer} olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

function genDiscriminant() {
  run(
    34,
    (i) => {
      const a = pick([1, 1, 2, 3]);
      const b = -7 + Math.floor(rnd() * 15);
      const c = -6 + Math.floor(rnd() * 13);
      const delta = b * b - 4 * a * c;
      const eq = quadText(a, b, c);
      const prompt = pick([
        `${eq} denkleminin diskriminantı kaçtır?`,
        `${eq} denklemi için Δ = b² − 4ac değeri kaçtır?`,
        `${eq} denkleminin diskriminantı aşağıdakilerden hangisidir?`,
      ]);
      return {
        id: `bulk-lm-disc-${i + 1}`,
        prompt,
        answer: fmt(delta),
        distractors: nums(delta, [
          b * b + 4 * a * c,
          4 * a * c - b * b,
          b * b,
          delta + 4,
          delta - 4,
          -delta,
        ]),
        explanation: `Katsayılar a = ${a}, b = ${b}, c = ${c} olur. Δ = b² − 4ac = ${sq(b)} − 4 × ${a} × ${par(c)} = ${delta} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

function genRootSum() {
  run(
    34,
    (i) => {
      const a = pick([1, 1, 1, 2, 3]);
      const b = pick([-9, -8, -6, -4, -3, -2, 2, 3, 4, 6, 8, 9]);
      const c = pick([-8, -6, -5, -3, -2, 2, 3, 5, 6, 8]);
      if (b % a !== 0) return null;
      const sum = -b / a;
      const eq = quadText(a, b, c);
      const prompt = pick([
        `${eq} denkleminin kökler toplamı kaçtır?`,
        `${eq} denkleminin köklerinin toplamı aşağıdakilerden hangisidir?`,
        `${eq} denklemi için x₁ + x₂ toplamı kaçtır?`,
      ]);
      return {
        id: `bulk-lm-sum-${i + 1}`,
        prompt,
        answer: fmt(sum),
        distractors: nums(sum, [b / a, c / a, -c / a, sum + 1, sum - 1]),
        explanation: `Kökler toplamı −b ÷ a ile bulunur: −(${b}) ÷ ${a} = ${sum}. Denklemde a = ${a}, b = ${b} değerleri yerine konmuştur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

function genRootProduct() {
  run(
    34,
    (i) => {
      const a = pick([1, 1, 1, 2, 3]);
      const b = pick([-9, -7, -5, -4, -3, 3, 4, 5, 7, 9]);
      const c = pick([-12, -9, -6, -4, -3, 3, 4, 6, 9, 12]);
      if (c % a !== 0) return null;
      const product = c / a;
      const eq = quadText(a, b, c);
      const prompt = pick([
        `${eq} denkleminin kökler çarpımı kaçtır?`,
        `${eq} denkleminin köklerinin çarpımı aşağıdakilerden hangisidir?`,
        `${eq} denklemi için x₁ · x₂ çarpımı kaçtır?`,
      ]);
      return {
        id: `bulk-lm-prod-${i + 1}`,
        prompt,
        answer: fmt(product),
        distractors: nums(product, [-c / a, -b / a, b / a, product + 2, product - 2]),
        explanation: `Kökler çarpımı c ÷ a ile bulunur: ${c} ÷ ${a} = ${product}. Denklemde a = ${a}, c = ${c} değerleri kullanılmıştır.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

function genBuildEquation() {
  run(
    34,
    (i) => {
      const r1 = pick([-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7]);
      const r2 = pick([-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7]);
      if (r1 === r2 || r1 + r2 === 0) return null;
      const s = r1 + r2;
      const p = r1 * r2;
      const answer = quadText(1, -s, p);
      const prompt = pick([
        `Kökleri ${r1} ve ${r2} olan ikinci dereceden denklem aşağıdakilerden hangisidir?`,
        `Kökleri ${r1} ile ${r2} olan denklem hangisidir?`,
        `Kökleri ${r1} ve ${r2} olan denklemi aşağıdakilerden hangisi verir?`,
      ]);
      return {
        id: `bulk-lm-build-${i + 1}`,
        prompt,
        answer,
        distractors: texts(answer, [quadText(1, s, p), quadText(1, -s, -p), quadText(1, s, -p)]),
        explanation: `Kökler toplamı ${r1} + ${r2} = ${s}, kökler çarpımı ${r1} × ${r2} = ${p} olur. Denklem x² − (toplam)x + (çarpım) = 0 olduğundan ${answer} biçimindedir.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

function genOtherRoot() {
  run(
    34,
    (i) => {
      const r1 = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const r2 = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      if (r1 === r2) return null;
      const s = r1 + r2;
      const eq = quadText(1, -s, r1 * r2);
      const prompt = pick([
        `${eq} denkleminin bir kökü ${r1} ise diğer kökü kaçtır?`,
        `${eq} denkleminin köklerinden biri ${r1} olduğuna göre diğer kök kaçtır?`,
        `${eq} denklemi x = ${r1} değerini sağlıyorsa diğer kök kaçtır?`,
      ]);
      return {
        id: `bulk-lm-other-${i + 1}`,
        prompt,
        answer: fmt(r2),
        distractors: nums(r2, [r1, -r1, s, -s, r1 * r2, r1 - r2]),
        explanation: `Kökler toplamı ${s} olduğundan ${r1} + x₂ = ${s} yazılır. Buradan x₂ = ${s} − ${par(r1)} = ${r2} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

function genSquareSum() {
  run(
    24,
    (i) => {
      const r1 = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const r2 = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      if (r1 === r2) return null;
      const s = r1 + r2;
      const p = r1 * r2;
      const answer = r1 * r1 + r2 * r2;
      const eq = quadText(1, -s, p);
      const prompt = pick([
        `${eq} denkleminin köklerinin kareleri toplamı kaçtır?`,
        `${eq} denklemi için x₁² + x₂² ifadesinin değeri nedir?`,
        `${eq} denkleminin kökleri x₁ ve x₂ ise x₁² + x₂² toplamı kaçtır?`,
      ]);
      return {
        id: `bulk-lm-sqsum-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: nums(answer, [s * s, s * s + 2 * p, p * p, answer + 2, answer - 2]),
        explanation: `x₁ + x₂ = ${s} ve x₁ · x₂ = ${p} olur. x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${sq(s)} − 2 × ${par(p)} = ${answer} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

/* ---------------------------------------------------------------- */
/* Fonksiyonlar                                                      */
/* ---------------------------------------------------------------- */

function genLinearValue() {
  run(
    40,
    (i) => {
      const a = pick([2, 3, 4, 5, 6, -2, -3]);
      const b = pick([-9, -7, -5, -3, -2, 2, 3, 5, 7, 9]);
      const k = pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const answer = a * k + b;
      const prompt = pick([
        `f(x) = ${linText(a, b)} olduğuna göre f(${k}) kaçtır?`,
        `f(x) = ${linText(a, b)} fonksiyonunda f(${k}) değeri kaçtır?`,
        `f fonksiyonu f(x) = ${linText(a, b)} kuralıyla tanımlıysa f(${k}) kaçtır?`,
      ]);
      return {
        id: `bulk-lm-fval-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: nums(answer, [a * k - b, -answer, a * (k + b), answer + a, answer - a]),
        explanation: `x yerine ${k} yazılır: ${a} × ${par(k)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${answer}. Yani f(${k}) = ${answer} olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FN,
  );
}

function genQuadraticValue() {
  run(
    34,
    (i) => {
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const c = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const k = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      const value = k * k + b * k + c;
      const expr = polyText(1, b, c);
      const prompt = pick([
        `g(x) = ${expr} olduğuna göre g(${k}) kaçtır?`,
        `g(x) = ${expr} fonksiyonunda g(${k}) değeri nedir?`,
        `g fonksiyonu g(x) = ${expr} biçiminde tanımlıysa g(${k}) kaçtır?`,
      ]);
      return {
        id: `bulk-lm-qval-${i + 1}`,
        prompt,
        answer: fmt(value),
        distractors: nums(value, [
          k * k - b * k + c,
          -value,
          k * k + b + c,
          value + 2 * k,
          value - 2 * k,
        ]),
        explanation: `x yerine ${k} yazılır: ${sq(k)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} × ${par(k)} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${value}. Yani g(${k}) = ${value} olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FN,
  );
}

function genCompositeSymbolic() {
  run(
    34,
    (i) => {
      const a = pick([2, 3, 4, 5]);
      const c = pick([2, 3, 4, 5]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const d = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      if (b === d) return null;
      const answer = linText(a * c, a * d + b);
      const prompt = pick([
        `f(x) = ${linText(a, b)} ve g(x) = ${linText(c, d)} olduğuna göre (f ∘ g)(x) aşağıdakilerden hangisidir?`,
        `f(x) = ${linText(a, b)}, g(x) = ${linText(c, d)} ise (f ∘ g)(x) nedir?`,
        `f(x) = ${linText(a, b)} ve g(x) = ${linText(c, d)} fonksiyonları için f(g(x)) ifadesi hangisidir?`,
      ]);
      return {
        id: `bulk-lm-comp-${i + 1}`,
        prompt,
        answer,
        distractors: texts(
          answer,
          [
            linText(a * c, c * b + d),
            linText(a + c, b + d),
            linText(a * c, a * d - b),
            linText(a * c, a * b + d),
          ],
          (step) => linText(a * c + step, a * d + b + step),
        ),
        explanation: `f(g(x)) için g(x) ifadesi f içine yazılır: ${a} × (${linText(c, d)}) ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${answer}.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FN,
  );
}

function genInverse() {
  run(
    34,
    (i) => {
      const a = pick([2, 3, 4, 5]);
      const b = pick([-6, -4, -3, -2, 2, 3, 4, 6]);
      const m = pick([-3, -2, -1, 1, 2, 3, 4, 5]);
      const target = a * m + b;
      const prompt = pick([
        `f(x) = ${linText(a, b)} olduğuna göre f⁻¹(${target}) kaçtır?`,
        `f(x) = ${linText(a, b)} ise f⁻¹(${target}) değeri nedir?`,
        `f(x) = ${linText(a, b)} fonksiyonunun tersi için f⁻¹(${target}) kaçtır?`,
      ]);
      return {
        id: `bulk-lm-inv-${i + 1}`,
        prompt,
        answer: fmt(m),
        distractors: nums(m, [(target + b) / a, target, a * target + b, -m, m + 1, m - 1]),
        explanation: `f⁻¹(x) = (x − ${par(b)}) ÷ ${a} olur. f⁻¹(${target}) = (${target} − ${par(b)}) ÷ ${a} = ${m} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FN,
  );
}

function genDomain() {
  run(
    34,
    (i) => {
      const kind = i % 3;
      if (kind === 0) {
        const a = pick([-5, -4, -3, -2, 2, 3, 4, 5]);
        const answer = `x ≠ ${fmt(a)}`;
        const prompt = pick([
          `f(x) = 1 ÷ (${shift(a)}) fonksiyonunun tanım kümesi nedir?`,
          `f(x) = 1 ÷ (${shift(a)}) olduğuna göre tanım kümesi aşağıdakilerden hangisidir?`,
          `f(x) = 1 ÷ (${shift(a)}) biçiminde verilen fonksiyonun tanım kümesi hangisidir?`,
        ]);
        return {
          id: `bulk-lm-dom-${i + 1}`,
          prompt,
          answer,
          distractors: texts(answer, [
            `x ≠ ${fmt(-a)}`,
            `x ≥ ${fmt(a)}`,
            `x > ${fmt(a)}`,
            `x ≤ ${fmt(a)}`,
          ]),
          explanation: `Payda sıfır olamaz: ${shift(a)} ≠ 0 yazılır. Buradan x ≠ ${fmt(a)} elde edilir, tanım kümesi tüm gerçek sayılardan bu değerin çıkarılmasıdır.`,
          difficulty: difficultyAt(i),
        };
      }
      if (kind === 1) {
        const a = pick([-4, -3, -2, 2, 3, 4, 5]);
        const answer = `x ≥ ${fmt(a)}`;
        const prompt = pick([
          `f(x) = √(${shift(a)}) fonksiyonunun tanım kümesi nedir?`,
          `f(x) = √(${shift(a)}) olduğuna göre tanım kümesi aşağıdakilerden hangisidir?`,
          `f(x) = √(${shift(a)}) fonksiyonu hangi x değerleri için tanımlıdır?`,
        ]);
        return {
          id: `bulk-lm-dom-${i + 1}`,
          prompt,
          answer,
          distractors: texts(answer, [
            `x ≤ ${fmt(a)}`,
            `x > ${fmt(a)}`,
            `x ≠ ${fmt(a)}`,
            `x < ${fmt(a)}`,
          ]),
          explanation: `Karekökün içi negatif olamaz: ${shift(a)} ≥ 0 yazılır. Buradan x ≥ ${fmt(a)} bulunur.`,
          difficulty: difficultyAt(i),
        };
      }
      const a = pick([2, 3, 4, 5, 6]);
      const answer = `x ≤ ${a}`;
      const prompt = pick([
        `f(x) = √(${a} − x) fonksiyonunun tanım kümesi nedir?`,
        `f(x) = √(${a} − x) olduğuna göre tanım kümesi aşağıdakilerden hangisidir?`,
        `f(x) = √(${a} − x) fonksiyonu hangi x değerleri için tanımlıdır?`,
      ]);
      return {
        id: `bulk-lm-dom-${i + 1}`,
        prompt,
        answer,
        distractors: texts(answer, [`x ≥ ${a}`, `x < ${a}`, `x ≠ ${a}`, `x > ${a}`]),
        explanation: `Karekökün içi negatif olamaz: ${a} − x ≥ 0 yazılır. Buradan x ≤ ${a} elde edilir.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FN,
  );
}

function genSlope() {
  run(
    34,
    (i) => {
      const x1 = pick([-4, -3, -2, -1, 1, 2, 3]);
      const x2 = pick([-4, -3, -2, -1, 2, 3, 4, 5]);
      if (x1 === x2) return null;
      const y1 = pick([-6, -4, -2, 1, 3, 5, 7]);
      const m = pick([-3, -2, -1, 1, 2, 3]);
      const y2 = y1 + m * (x2 - x1);
      const prompt = pick([
        `A(${x1}, ${y1}) ve B(${x2}, ${y2}) noktalarından geçen doğrunun eğimi kaçtır?`,
        `Analitik düzlemde A(${x1}, ${y1}) ile B(${x2}, ${y2}) noktalarını birleştiren doğrunun eğimi nedir?`,
        `A(${x1}, ${y1}) ve B(${x2}, ${y2}) noktaları veriliyor. Bu noktalardan geçen doğrunun eğimi aşağıdakilerden hangisidir?`,
      ]);
      return {
        id: `bulk-lm-slope-${i + 1}`,
        prompt,
        answer: fmt(m),
        distractors: nums(m, [(x2 - x1) / (y2 - y1), -m, m + 1, m - 1, m * 2]),
        explanation: `Eğim = (y₂ − y₁) ÷ (x₂ − x₁) = (${y2} − ${y1}) ÷ (${x2} − ${par(x1)}) = ${y2 - y1} ÷ ${x2 - x1} = ${m} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FN,
  );
}

function genCompositeValue() {
  run(
    23,
    (i) => {
      const a = pick([2, 3, 4]);
      const c = pick([2, 3, 4]);
      const b = pick([-5, -3, -2, 2, 3, 5]);
      const d = pick([-4, -3, -2, 2, 3, 4]);
      const k = pick([-3, -2, -1, 1, 2, 3, 4]);
      const gk = c * k + d;
      const answer = a * gk + b;
      const prompt = pick([
        `f(x) = ${linText(a, b)} ve g(x) = ${linText(c, d)} olduğuna göre (f ∘ g)(${k}) kaçtır?`,
        `f(x) = ${linText(a, b)}, g(x) = ${linText(c, d)} ise f(g(${k})) değeri nedir?`,
        `f(x) = ${linText(a, b)} ve g(x) = ${linText(c, d)} fonksiyonları için (f ∘ g)(${k}) kaçtır?`,
      ]);
      return {
        id: `bulk-lm-compv-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: nums(answer, [
          c * (a * k + b) + d,
          (a * k + b) + (c * k + d),
          (a * k + b) * (c * k + d),
          answer + a,
          answer - a,
        ]),
        explanation: `Önce g(${k}) = ${c} × ${par(k)} ${d < 0 ? '−' : '+'} ${Math.abs(d)} = ${gk} bulunur. Sonra f(${gk}) = ${a} × ${gk} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${answer} olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FN,
  );
}

/* ---------------------------------------------------------------- */
/* Logaritma                                                         */
/* ---------------------------------------------------------------- */

function genLogDefinition() {
  run(
    40,
    (i) => {
      const base = pick([2, 2, 3, 3, 5, 10]);
      const power = pick([2, 3, 4, 5]);
      if (base === 10 && power > 4) return null;
      const n = Math.pow(base, power);
      const prompt = pick([
        `log${sub(base)}(${n}) ifadesinin değeri kaçtır?`,
        `log${sub(base)}(${n}) işleminin sonucu nedir?`,
        `log${sub(base)}(${n}) logaritmasının değeri aşağıdakilerden hangisidir?`,
      ]);
      return {
        id: `bulk-lm-logdef-${i + 1}`,
        prompt,
        answer: fmt(power),
        distractors: nums(power, [power + 1, power - 1, n / base, base * power, n - base]),
        explanation: `${n} sayısı ${base} tabanında ${base}${sup(power)} biçiminde yazılır. log${sub(base)}(${base}${sup(power)}) = ${power} olduğundan sonuç ${power} olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_LOG,
  );
}

function genLogSum() {
  run(
    34,
    (i) => {
      const base = pick([2, 2, 3, 3, 5]);
      const p = pick([1, 2, 3, 4]);
      const q = pick([1, 2, 3, 4]);
      const x = Math.pow(base, p);
      const y = Math.pow(base, q);
      const answer = p + q;
      const prompt = pick([
        `log${sub(base)}(${x}) + log${sub(base)}(${y}) toplamı kaçtır?`,
        `log${sub(base)}(${x}) + log${sub(base)}(${y}) işleminin sonucu nedir?`,
        `log${sub(base)}(${x}) + log${sub(base)}(${y}) ifadesinin değeri aşağıdakilerden hangisidir?`,
      ]);
      return {
        id: `bulk-lm-logsum-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: nums(answer, [p * q, answer + 1, answer - 1, Math.abs(p - q), x + y]),
        explanation: `log${sub(base)}(${x}) = ${p} ve log${sub(base)}(${y}) = ${q} olur. Toplam özelliğiyle log${sub(base)}(${x}) + log${sub(base)}(${y}) = log${sub(base)}(${x * y}) = ${answer} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_LOG,
  );
}

function genLogDiff() {
  run(
    34,
    (i) => {
      const base = pick([2, 2, 3, 3, 5]);
      const p = pick([2, 3, 4, 5]);
      const q = pick([1, 2, 3]);
      if (p <= q) return null;
      const x = Math.pow(base, p);
      const y = Math.pow(base, q);
      const answer = p - q;
      const prompt = pick([
        `log${sub(base)}(${x}) − log${sub(base)}(${y}) sonucu kaçtır?`,
        `log${sub(base)}(${x}) − log${sub(base)}(${y}) işleminin değeri nedir?`,
        `log${sub(base)}(${x}) − log${sub(base)}(${y}) çıkarma işleminin sonucu hangisidir?`,
      ]);
      return {
        id: `bulk-lm-logdiff-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: nums(answer, [q - p, p * q, p + q, p / q, x - y]),
        explanation: `log${sub(base)}(${x}) = ${p} ve log${sub(base)}(${y}) = ${q} olur. Bölüm özelliğiyle fark, log${sub(base)}(${x} ÷ ${y}) = ${answer} değerine eşittir.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_LOG,
  );
}

function genLogPower() {
  run(
    34,
    (i) => {
      const base = pick([2, 2, 3, 3, 5]);
      const p = pick([2, 3, 4]);
      const n = pick([2, 3, 4]);
      if (base === 5 && p > 3) return null;
      const x = Math.pow(base, p);
      const answer = n * p;
      const prompt = pick([
        `log${sub(base)}(${x}${sup(n)}) sonucu kaçtır?`,
        `log${sub(base)}(${x}${sup(n)}) ifadesi hangi değere eşittir?`,
        `log${sub(base)}(${x}${sup(n)}) kaçtır?`,
      ]);
      return {
        id: `bulk-lm-logpow-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: nums(answer, [n + p, Math.pow(p, n), answer + 1, answer - 1, n * p + p]),
        explanation: `Kuvvet özelliğiyle üs öne alınır: log${sub(base)}(${x}${sup(n)}) = ${n} × log${sub(base)}(${x}) = ${n} × ${p} = ${answer} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_LOG,
  );
}

function genBaseChange() {
  run(
    34,
    (i) => {
      const base = pick([2, 3, 5]);
      const m = pick([2, 3]);
      const n = pick([1, 2, 3, 4]);
      if (n === m) return null;
      const bigBase = Math.pow(base, m);
      const n2 = Math.pow(base, n);
      const answer = frac(n, m);
      const prompt = pick([
        `log${sub(bigBase)}(${n2}) kaçtır?`,
        `log${sub(bigBase)}(${n2}) işleminin sonucu nedir?`,
        `log${sub(bigBase)}(${n2}) ifadesi hangi değere eşittir?`,
      ]);
      return {
        id: `bulk-lm-base-${i + 1}`,
        prompt,
        answer,
        distractors: texts(answer, [frac(m, n), String(n), String(m), frac(n + m, m)], (step) =>
          frac(n + step, m),
        ),
        explanation: `${bigBase} = ${base}${sup(m)} ve ${n2} = ${base}${sup(n)} olduğundan log${sub(bigBase)}(${n2}) = ${n} ÷ ${m} = ${answer} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_LOG,
  );
}

function genExponential() {
  run(
    34,
    (i) => {
      const base = pick([2, 2, 3, 3, 4, 5, 10]);
      const negative = i % 5 === 4;
      const power = pick([2, 3, 4]);
      if (base === 5 && power > 3) return null;
      if (base === 10 && power > 3) return null;
      const n = Math.pow(base, power);
      if (negative) {
        const answer = -power;
        const prompt = pick([
          `${base}ˣ = 1/${n} denklemini sağlayan x kaçtır?`,
          `${base}ˣ = 1/${n} eşitliğinde x değeri nedir?`,
          `${base}ˣ = 1/${n} ise x kaçtır?`,
          `${base}ˣ = 1/${n} denkleminin çözümü olan x aşağıdakilerden hangisidir?`,
        ]);
        return {
          id: `bulk-lm-exp-${i + 1}`,
          prompt,
          answer: fmt(answer),
          distractors: nums(answer, [power, answer + 1, answer - 1, power + 1, -power * 2]),
          explanation: `1/${n} = ${base}⁻${sup(power)} biçiminde yazılır. Tabanlar eşit olduğundan x = ${answer} olur.`,
          difficulty: difficultyAt(i),
        };
      }
      const prompt = pick([
        `${base}ˣ = ${n} denklemini sağlayan x kaçtır?`,
        `${base}ˣ = ${n} eşitliğinde x değeri nedir?`,
        `${base}ˣ = ${n} ise x kaçtır?`,
        `${base}ˣ = ${n} denkleminin çözümü olan x aşağıdakilerden hangisidir?`,
      ]);
      return {
        id: `bulk-lm-exp-${i + 1}`,
        prompt,
        answer: fmt(power),
        distractors: nums(power, [power + 1, power - 1, n / base, power * 2, n - base]),
        explanation: `${n} = ${base}${sup(power)} olduğundan denklem ${base}ˣ = ${base}${sup(power)} biçimine gelir. Tabanlar eşit olduğu için x = ${power} olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_LOG,
  );
}

function genLogEquation() {
  run(
    23,
    (i) => {
      const base = pick([2, 3]);
      const power = pick([2, 3, 4]);
      const n = Math.pow(base, power);
      const shifted = i % 2 === 1;
      if (!shifted) {
        const prompt = pick([
          `log${sub(base)}(x) = ${power} denklemini sağlayan x kaçtır?`,
          `log${sub(base)}(x) = ${power} eşitliğinde x değeri nedir?`,
          `log${sub(base)}(x) = ${power} ise x kaçtır?`,
        ]);
        return {
          id: `bulk-lm-logeq-${i + 1}`,
          prompt,
          answer: fmt(n),
          distractors: nums(n, [power * power, base * power, n + base, n - base, power + base]),
          explanation: `Logaritma tanımına göre log${sub(base)}(x) = ${power} ise x = ${base}${sup(power)} = ${n} olur.`,
          difficulty: difficultyAt(i),
        };
      }
      const a = pick([1, 2, 3, 4]);
      const answer = n + a;
      const prompt = pick([
        `log${sub(base)}(x − ${a}) = ${power} denklemini sağlayan x kaçtır?`,
        `log${sub(base)}(x − ${a}) = ${power} eşitliğinde x değeri nedir?`,
        `log${sub(base)}(x − ${a}) = ${power} ise x kaçtır?`,
      ]);
      return {
        id: `bulk-lm-logeq-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: nums(answer, [n, n - a, n + a + 1, power * power, n * base]),
        explanation: `Tanıma göre x − ${a} = ${base}${sup(power)} = ${n} yazılır. Buradan x = ${n} + ${a} = ${answer} bulunur; değer tanım kümesine uygundur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_LOG,
  );
}

/* ---------------------------------------------------------------- */
/* Üretim                                                            */
/* ---------------------------------------------------------------- */

genFactor();
genDiscriminant();
genRootSum();
genRootProduct();
genBuildEquation();
genOtherRoot();
genSquareSum();

genLinearValue();
genQuadraticValue();
genCompositeSymbolic();
genInverse();
genDomain();
genSlope();
genCompositeValue();

genLogDefinition();
genLogSum();
genLogDiff();
genLogPower();
genBaseChange();
genExponential();
genLogEquation();

export { questions };

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'Lise::Matematik': {
    'İkinci Dereceden Denklemler': topicIds[TOPIC_EQ] ?? [],
    Fonksiyonlar: topicIds[TOPIC_FN] ?? [],
    Logaritma: topicIds[TOPIC_LOG] ?? [],
  },
};
