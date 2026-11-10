/**
 * ÖSYM / AYT toplu soru paketi.
 *
 * AYT Sayısal: 450 soru (Matematik, Fizik, Kimya, Biyoloji).
 * AYT Eşit Ağırlık: 350 soru (Matematik, Edebiyat, Tarih, Coğrafya).
 *
 * Sayısal cevaplar kodla hesaplanır; sözel içerik tablolardan üretilir.
 */
import type {
  EmbeddedQuestionSeed,
  QuestionDifficulty,
  QuestionKind,
} from '@/data/embeddedQuestionPackV10';

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

const LEVEL_NAME = 'ÖSYM';
const COURSE_SAY = 'AYT Sayısal';
const COURSE_EA = 'AYT Eşit Ağırlık';

const T_MAT = 'Matematik';
const T_FIZ = 'Fizik';
const T_KIM = 'Kimya';
const T_BIY = 'Biyoloji';
const T_EDB = 'Edebiyat';
const T_TAR = 'Tarih';
const T_COG = 'Coğrafya';

type Draft = {
  prompt: string;
  answer: string;
  distractors: string[];
  explanation: string;
  difficulty?: QuestionDifficulty;
  kind?: QuestionKind;
};

const questions: EmbeddedQuestionSeed[] = [];
const bucket: Record<string, string[]> = {};
const usedKeys = new Set<string>();
const counters: Record<string, number> = {};

function nextId(prefix: string): string {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  return `bulk-${prefix}-${counters[prefix]}`;
}

function difficultyAt(index: number): QuestionDifficulty {
  const slot = index % 10;
  if (slot < 3) return 'easy';
  if (slot < 8) return 'standard';
  return 'hard';
}

function fmt(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace('.', ',').replace('-', '−');
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function fracText(numerator: number, denominator: number): string {
  if (numerator === 0) return '0';
  if (numerator === denominator) return '1';
  const divisor = gcd(numerator, denominator) || 1;
  return `${numerator / divisor}/${denominator / divisor}`;
}

const SUBS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
const SUPS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

function sub(n: number): string {
  return String(n)
    .split('')
    .map((digit) => SUBS[Number(digit)])
    .join('');
}

function sup(n: number): string {
  return String(n)
    .split('')
    .map((digit) => SUPS[Number(digit)])
    .join('');
}

function wrongText(answer: string, candidates: string[], unit = '', base = 0): string[] {
  const seen = new Set([answer]);
  const out: string[] = [];
  for (const text of candidates) {
    if (out.length === 3) break;
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  let step = 1;
  while (out.length < 3 && step < 60) {
    for (const value of [base + step, base - step]) {
      if (out.length === 3) break;
      const text = `${fmt(value)}${unit}`;
      if (seen.has(text)) continue;
      seen.add(text);
      out.push(text);
    }
    step += 1;
  }
  if (out.length !== 3) throw new Error(`çeldirici yetersiz: ${answer}`);
  return out;
}

function nums(values: number[]): string[] {
  return values.map((value) => fmt(value));
}

function withUnit(values: number[], unit: string): string[] {
  return values.map((value) => `${fmt(value)} ${unit}`);
}

function sample(list: string[], count: number, start: number): string[] {
  const out: string[] = [];
  for (let step = 0; step < list.length && out.length < count; step += 1) {
    out.push(list[(start + step) % list.length]);
  }
  return out;
}

function otherValues(list: string[], correct: string, start: number): string[] {
  const out: string[] = [];
  const seen = new Set([correct]);
  for (let step = 0; step < list.length * 2 && out.length < 3; step += 1) {
    const value = list[(start + step) % list.length];
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  if (out.length !== 3) throw new Error(`seçenek havuzu yetersiz: ${correct}`);
  return out;
}

function mc(course: string, draft: Draft, id: string): EmbeddedQuestionSeed {
  const options = shuffle([draft.answer, ...draft.distractors]);
  if (options.length !== 4 || new Set(options).size !== 4) {
    throw new Error(`Seçenek hatası: ${id}`);
  }
  return {
    id,
    levelName: LEVEL_NAME,
    courseName: course,
    topicIndex: 0,
    prompt: draft.prompt,
    options,
    correctAnswer: draft.answer,
    explanation: draft.explanation,
    difficulty: draft.difficulty ?? 'standard',
    questionKind: draft.kind ?? 'multiple-choice',
  };
}

function add(course: string, topic: string, draft: Draft, prefix: string): boolean {
  const key = `${course}|${draft.prompt}|${[draft.answer, ...draft.distractors]
    .slice()
    .sort()
    .join('|')}`
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('tr-TR');
  if (usedKeys.has(key)) return false;
  usedKeys.add(key);
  const id = nextId(prefix);
  questions.push(mc(course, draft, id));
  const bucketKey = `${course}::${topic}`;
  bucket[bucketKey] = [...(bucket[bucketKey] ?? []), id];
  return true;
}

function fill(
  course: string,
  topic: string,
  prefix: string,
  count: number,
  make: (index: number) => Draft,
) {
  let made = 0;
  let attempt = 0;
  while (made < count) {
    // Veri havuzu tükenirse üretilebilen kadar soruyla devam et; eksik kalan
    // birkaç soru paketin tamamını çalıştırılamaz hâle getirmesin.
    if (attempt > count * 60) break;
    const draft = make(attempt);
    attempt += 1;
    const ready: Draft = { ...draft, difficulty: draft.difficulty ?? difficultyAt(made) };
    if (add(course, topic, ready, prefix)) made += 1;
  }
}

function chain(values: number[]): string {
  const parts: string[] = [];
  values.forEach((value, index) => {
    if (index > 0 && value === 0) return;
    if (parts.length === 0) parts.push(fmt(value));
    else parts.push(`${value < 0 ? '−' : '+'} ${fmt(Math.abs(value))}`);
  });
  return parts.join(' ');
}

function poly2(a: number, b: number, c: number): string {
  const parts: string[] = [a === 1 ? 'x²' : a === -1 ? '−x²' : `${fmt(a)}x²`];
  if (b !== 0) parts.push(`${b > 0 ? '+' : '−'} ${Math.abs(b) === 1 ? '' : fmt(Math.abs(b))}x`);
  if (c !== 0) parts.push(`${c > 0 ? '+' : '−'} ${fmt(Math.abs(c))}`);
  return parts.join(' ');
}

function poly3(a: number, b: number, c: number, d: number): string {
  const parts: string[] = [a === 1 ? 'x³' : a === -1 ? '−x³' : `${fmt(a)}x³`];
  if (b !== 0) parts.push(`${b > 0 ? '+' : '−'} ${Math.abs(b) === 1 ? '' : fmt(Math.abs(b))}x²`);
  if (c !== 0) parts.push(`${c > 0 ? '+' : '−'} ${Math.abs(c) === 1 ? '' : fmt(Math.abs(c))}x`);
  if (d !== 0) parts.push(`${d > 0 ? '+' : '−'} ${fmt(Math.abs(d))}`);
  return parts.join(' ');
}

/* -------------------------------------------------- Matematik */

const POLY_A = [1, 2, 3, 2, 1, 3];
const POLY_B = [-5, -4, -3, -2, 2, 3, 4, 5, -6, 6];
const POLY_C = [1, -2, 3, -4, 5, 6, -1, 2, -3, 4];
const POLY_K = [-3, -2, -1, 2, 3, 4, 1, -4, 0, 5];

function genFonksiyon(idp: string, course: string, count: number, off: number) {
  fill(course, T_MAT, `${idp}-fonksiyon`, count, (index) => {
    const i = index + off;
    const a = POLY_A[i % POLY_A.length];
    const b = POLY_B[(i * 3) % POLY_B.length];
    const c = POLY_C[(i * 7) % POLY_C.length];
    const k = POLY_K[(i * 7) % POLY_K.length];
    const expr = poly2(a, b, c);
    const answer = a * k * k + b * k + c;
    const forms = [
      `f(x) = ${expr} olduğuna göre f(${fmt(k)}) kaçtır?`,
      `Gerçek sayılarda tanımlı f(x) = ${expr} fonksiyonu için f(${fmt(k)}) değeri kaçtır?`,
      `f(x) = ${expr} kuralıyla verilen fonksiyonda x = ${fmt(k)} alınırsa f(x) kaç olur?`,
      `Bir f fonksiyonu her x için f(x) = ${expr} eşitliğini sağlıyor. Buna göre f(${fmt(k)}) kaçtır?`,
    ];
    return {
      prompt: forms[i % forms.length],
      answer: fmt(answer),
      distractors: wrongText(
        fmt(answer),
        nums([a * k * k - b * k + c, a * k * k + b * k, a * k + b * k + c, answer + 2]),
        '',
        answer,
      ),
      explanation: `x yerine ${fmt(k)} yazılır: f(${fmt(k)}) = ${chain([
        a * k * k,
        b * k,
        c,
      ])} = ${fmt(answer)} bulunur.`,
    };
  });
}

const KOK_P = [-1, 2, 3, -2, 4, -3, 5, 1, -4, 6, -5, 2, -6, 3, 7, -2, 8, 1, -3, 4];
const KOK_Q = [3, -1, 2, 5, -2, 4, -3, 6, 1, -5, 2, -4, 3, 7, -1, 5, -2, 8, 4, -6];

function genPolinom(idp: string, course: string, count: number, off: number) {
  fill(course, T_MAT, `${idp}-polinom`, count, (index) => {
    const i = index + off;
    const p = KOK_P[i % KOK_P.length];
    let q = KOK_Q[(i * 7) % KOK_Q.length];
    if (p + q === 0) q += 1;
    const b = -(p + q);
    const c = p * q;
    const sum = p + q;
    const prod = p * q;
    const expr = poly2(1, b, c);
    if (i % 2 === 0) {
      return {
        prompt: `${expr} = 0 denkleminin kökler toplamı kaçtır?`,
        answer: fmt(sum),
        distractors: wrongText(fmt(sum), nums([-sum, prod, sum + 1]), '', sum),
        explanation: `x² + bx + c = 0 denkleminde kökler toplamı −b/a’dır. b = ${fmt(
          b,
        )} ve a = 1 olduğundan toplam ${fmt(sum)} olur.`,
      };
    }
    return {
      prompt: `${expr} = 0 denkleminin kökler çarpımı kaçtır?`,
      answer: fmt(prod),
      distractors: wrongText(fmt(prod), nums([sum, -prod, prod + 2]), '', prod),
      explanation: `Kökler çarpımı c/a’dır. c = ${fmt(c)} ve a = 1 olduğundan çarpım ${fmt(
        prod,
      )} bulunur.`,
    };
  });
}

const TRIG: Array<[string, number]> = [
  ['sin30°', 0.5],
  ['cos60°', 0.5],
  ['tan45°', 1],
  ['sin90°', 1],
  ['cos0°', 1],
  ['sin150°', 0.5],
  ['cos120°', -0.5],
  ['sin270°', -1],
  ['cos180°', -1],
  ['tan135°', -1],
  ['sin0°', 0],
  ['cos90°', 0],
  ['tan0°', 0],
  ['sin180°', 0],
  ['tan180°', 0],
];

const TRIPLES: Array<[number, number, number]> = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
  [12, 35, 37],
];

function genTrig(idp: string, course: string, count: number, off: number) {
  fill(course, T_MAT, `${idp}-trig`, count, (index) => {
    const i = index + off;
    if (i % 3 === 2) {
      const [opposite, adjacent, hypotenuse] = TRIPLES[i % TRIPLES.length];
      const sinText = fracText(opposite, hypotenuse);
      return {
        prompt: `Bir dik üçgende dar açı olan α için sinα = ${sinText} olduğuna göre cosα kaçtır?`,
        answer: fracText(adjacent, hypotenuse),
        distractors: wrongText(fracText(adjacent, hypotenuse), [
          fracText(opposite, adjacent),
          fracText(hypotenuse, opposite),
          fracText(adjacent, opposite),
          fracText(hypotenuse, adjacent),
        ]),
        explanation: `Kenarlar ${opposite}, ${adjacent} ve ${hypotenuse} olan dik üçgende sinα = ${opposite}/${hypotenuse} olduğundan komşu kenar ${adjacent} olur ve cosα = ${adjacent}/${hypotenuse} bulunur.`,
      };
    }
    const t1 = TRIG[i % TRIG.length];
    const t2 = TRIG[(i * 7 + 2) % TRIG.length];
    const t3 = TRIG[(i * 11 + 5) % TRIG.length];
    const c1 = [1, 2, 3, 4][i % 4];
    const c2 = [2, 3, 1, 4][(i * 3) % 4];
    const c3 = [1, 2, 3][(i * 5) % 3];
    const value = c1 * t1[1] + c2 * t2[1] - c3 * t3[1];
    const expr = `${c1 === 1 ? '' : `${c1}·`}${t1[0]} + ${c2 === 1 ? '' : `${c2}·`}${
      t2[0]
    } − ${c3 === 1 ? '' : `${c3}·`}${t3[0]}`;
    const forms = [
      `${expr} işleminin sonucu kaçtır?`,
      `Özel açıların trigonometrik değerleri kullanılarak ${expr} ifadesi hesaplanırsa sonuç kaç olur?`,
      `Trigonometrik oranlar tablosundan yararlanarak ${expr} toplamı bulunduğunda hangi değer elde edilir?`,
    ];
    return {
      prompt: forms[i % forms.length],
      answer: fmt(value),
      distractors: wrongText(
        fmt(value),
        nums([c1 * t1[1] + c2 * t2[1] + c3 * t3[1], value + 0.5, -value, value + 1]),
        '',
        value,
      ),
      explanation: `${t1[0]} = ${fmt(t1[1])}, ${t2[0]} = ${fmt(t2[1])}, ${t3[0]} = ${fmt(
        t3[1],
      )} olduğundan işlem ${fmt(value)} sonucunu verir.`,
    };
  });
}

const LOG_BASES = [2, 3, 5, 10, 4, 7];

function genLog(idp: string, course: string, count: number, off: number) {
  fill(course, T_MAT, `${idp}-log`, count, (index) => {
    const i = index + off;
    const base = LOG_BASES[i % LOG_BASES.length];
    const p = [2, 3, 4, 1, 2, 3, 2][(i * 3) % 7];
    const q = [1, 2, 1, 3, 2][(i * 2) % 5];
    const big = Math.pow(base, p);
    const small = Math.pow(base, q);
    const lt = `log${sub(base)}`;
    if (i % 4 === 0) {
      return {
        prompt: `${lt}${big} ifadesinin değeri kaçtır?`,
        answer: fmt(p),
        distractors: wrongText(fmt(p), nums([p + 1, p - 1, base]), '', p),
        explanation: `${big} = ${base}${sup(p)} olduğundan ${lt}${big} = ${p} olur.`,
      };
    }
    if (i % 4 === 1) {
      return {
        prompt: `${lt}x = ${p} olduğuna göre ${lt}(x³) ifadesinin değeri kaçtır?`,
        answer: fmt(3 * p),
        distractors: wrongText(fmt(3 * p), nums([p + 3, p * p, 3 * p + 1]), '', 3 * p),
        explanation: `${lt}(x³) = 3·${lt}x = 3·${p} = ${fmt(3 * p)} bulunur.`,
      };
    }
    if (i % 4 === 2) {
      return {
        prompt: `${lt}${big} + ${lt}${small} toplamı kaçtır?`,
        answer: fmt(p + q),
        distractors: wrongText(fmt(p + q), nums([p * q, p + q + 1, p - q]), '', p + q),
        explanation: `${lt}${big} = ${p} ve ${lt}${small} = ${q} olduğundan toplam ${fmt(
          p + q,
        )} olur.`,
      };
    }
    return {
      prompt: `${lt}(${big} ÷ ${small}) ifadesinin değeri kaçtır?`,
      answer: fmt(p - q),
      distractors: wrongText(fmt(p - q), nums([p + q, q - p, p - q + 1]), '', p - q),
      explanation: `Bölümün logaritması logaritmaların farkıdır: ${p} − ${q} = ${fmt(
        p - q,
      )}.`,
    };
  });
}

function genDizi(idp: string, course: string, count: number, off: number) {
  fill(course, T_MAT, `${idp}-dizi`, count, (index) => {
    const i = index + off;
    const a1 = [2, 3, 5, 4, 6, 7][i % 6];
    const d = [3, 4, 2, 5, 3, 2][(i * 5) % 6];
    const r = [2, 3][(i * 3) % 2];
    const n = [8, 10, 12, 9, 11, 7, 6][(i * 5) % 7];
    if (i % 3 === 0) {
      const answer = a1 + (n - 1) * d;
      return {
        prompt: `İlk terimi ${a1} ve ortak farkı ${d} olan aritmetik dizinin ${n}. terimi kaçtır?`,
        answer: fmt(answer),
        distractors: wrongText(fmt(answer), nums([a1 + n * d, a1 + (n - 1) * d + d, a1 * d]), '', answer),
        explanation: `a${sub(n)} = a1 + (n − 1)·d = ${a1} + ${n - 1}·${d} = ${fmt(answer)} olur.`,
      };
    }
    if (i % 3 === 1) {
      const term = 4 + (i % 3);
      const value = a1 * Math.pow(r, term - 1);
      return {
        prompt: `İlk terimi ${a1} ve ortak çarpanı ${r} olan geometrik dizinin ${term}. terimi kaçtır?`,
        answer: fmt(value),
        distractors: wrongText(fmt(value), nums([a1 * r * term, value / r, value + a1]), '', value),
        explanation: `a${sub(term)} = a1·r${sup(term - 1)} = ${a1}·${r}${sup(
          term - 1,
        )} = ${fmt(value)} bulunur.`,
      };
    }
    const sum = (n * (2 * a1 + (n - 1) * d)) / 2;
    return {
      prompt: `İlk terimi ${a1}, ortak farkı ${d} olan aritmetik dizinin ilk ${n} teriminin toplamı kaçtır?`,
      answer: fmt(sum),
      distractors: wrongText(fmt(sum), nums([n * (a1 + (n - 1) * d), sum + d, sum / 2]), '', sum),
      explanation: `S${sub(n)} = n·(2a1 + (n − 1)d) ÷ 2 = ${n}·(${2 * a1} + ${
        n - 1
      }·${d}) ÷ 2 = ${fmt(sum)} bulunur.`,
    };
  });
}

const ZAR_FAV: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
};
const ZAR_SUM = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const TORBA_RED = [2, 3, 4, 5, 6];
const TORBA_BLUE = [3, 4, 5, 6, 8, 9, 10];

function genOlasilik(idp: string, course: string, count: number, off: number) {
  fill(course, T_MAT, `${idp}-olasilik`, count, (index) => {
    const i = index + off;
    const slot = Math.floor(i / 2);
    if (i % 2 === 0) {
      const target = ZAR_SUM[slot % ZAR_SUM.length];
      const answer = fracText(ZAR_FAV[target], 36);
      return {
        prompt: `İki zar birlikte atıldığında üst yüzlere gelen sayıların toplamının ${target} olma olasılığı kaçtır?`,
        answer,
        distractors: wrongText(answer, [
          fracText(ZAR_FAV[target], 12),
          fracText(1, 6),
          fracText(ZAR_FAV[target] + 1, 36),
          fracText(ZAR_FAV[target], 30),
        ]),
        explanation: `36 eşit olası sonuçtan ${ZAR_FAV[target]} tanesi ${target} toplamını verir; olasılık ${answer} olur.`,
      };
    }
    const red = TORBA_RED[slot % TORBA_RED.length];
    const blue = TORBA_BLUE[(slot * 3) % TORBA_BLUE.length];
    const total = red + blue;
    const answer = fracText(red, total);
    return {
      prompt: `Bir torbada ${red} kırmızı ve ${blue} mavi bilye vardır. Rastgele çekilen bir bilyenin kırmızı olma olasılığı kaçtır?`,
      answer,
      distractors: wrongText(answer, [
        fracText(blue, total),
        fracText(red, blue),
        fracText(red + 1, total),
        fracText(blue, red),
      ]),
      explanation: `Toplam ${total} bilyenin ${red} tanesi kırmızıdır; olasılık ${red}/${total} = ${answer} bulunur.`,
    };
  });
}

const VEK: Array<[number, number, number]> = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [12, 16, 20],
];

function genVektor(idp: string, course: string, count: number) {
  fill(course, T_MAT, `${idp}-vektor`, count, (index) => {
    const i = index;
    const [a, b, c] = VEK[i % VEK.length];
    if (i % 3 === 0) {
      return {
        prompt: `Birbirine dik iki vektörün büyüklükleri ${a} birim ve ${b} birimdir. Bu iki vektörün bileşkesinin büyüklüğü kaç birimdir?`,
        answer: fmt(c),
        distractors: wrongText(fmt(c), nums([a + b, Math.abs(a - b), c + 1]), '', c),
        explanation: `Dik vektörlerde bileşke √(${a}² + ${b}²) = √${a * a + b * b} = ${c} birim olur.`,
      };
    }
    if (i % 3 === 1) {
      return {
        prompt: `Aynı yönde hareket eden ${a} birimlik ve ${b} birimlik iki vektörün bileşkesinin büyüklüğü kaç birimdir?`,
        answer: fmt(a + b),
        distractors: wrongText(fmt(a + b), nums([c, Math.abs(a - b), a + b + 1]), '', a + b),
        explanation: `Aynı yönlü vektörlerin bileşkesi büyüklüklerin toplamıdır: ${a} + ${b} = ${fmt(
          a + b,
        )} birim.`,
      };
    }
    return {
      prompt: `Zıt yönde hareket eden ${a} birimlik ve ${b} birimlik iki vektörün bileşkesinin büyüklüğü kaç birimdir?`,
      answer: fmt(Math.abs(a - b)),
      distractors: wrongText(fmt(Math.abs(a - b)), nums([a + b, c, Math.abs(a - b) + 1]), '', Math.abs(a - b)),
      explanation: `Zıt yönlü vektörlerde bileşke büyüklükler farkıdır: ${b} − ${a} = ${fmt(
        Math.abs(a - b),
      )} birim.`,
    };
  });
}

const TUR_A = [1, 2, 1, 3, 2, 1];
const TUR_B = [-3, 2, -2, 3, -4, 1, 5];
const TUR_C = [4, -5, 6, 2, -3];
const TUR_D = [1, -2, 3, 0, 5];
const TUR_K = [1, -1, 2, -2, 3, 0, 4];

function genTurev(idp: string, course: string, count: number) {
  fill(course, T_MAT, `${idp}-turev`, count, (index) => {
    const i = index;
    const a = TUR_A[i % TUR_A.length];
    const b = TUR_B[(i * 3) % TUR_B.length];
    const c = TUR_C[(i * 2) % TUR_C.length];
    const d = TUR_D[(i * 3) % TUR_D.length];
    const k = TUR_K[(i * 5) % TUR_K.length];
    const expr = poly3(a, b, c, d);
    const answer = 3 * a * k * k + 2 * b * k + c;
    const forms = [
      `f(x) = ${expr} olduğuna göre f′(${fmt(k)}) kaçtır?`,
      `f(x) = ${expr} fonksiyonunun türevinin x = ${fmt(k)} noktasındaki değeri kaçtır?`,
    ];
    return {
      prompt: forms[i % forms.length],
      answer: fmt(answer),
      distractors: wrongText(
        fmt(answer),
        nums([3 * a * k * k + b * k + c, a * k * k + 2 * b * k + c, answer + 3]),
        '',
        answer,
      ),
      explanation: `f′(x) = ${3 * a}x² ${2 * b < 0 ? '−' : '+'} ${Math.abs(2 * b)}x ${
        c < 0 ? '−' : '+'
      } ${Math.abs(c)} olur. x = ${fmt(k)} için değer ${fmt(answer)} bulunur.`,
    };
  });
}

/* -------------------------------------------------- Fizik */

function genNewton(idp: string, count: number) {
  const M = [2, 3, 4, 5, 6, 8, 10, 2, 4, 5];
  const A = [3, 4, 5, 2, 3, 6, 2];
  fill(COURSE_SAY, T_FIZ, `${idp}-newton`, count, (index) => {
    const i = index;
    const m = M[i % M.length];
    const a = A[(i * 3) % A.length];
    const force = m * a;
    if (i % 2 === 0) {
      return {
        prompt: `Kütlesi ${m} kg olan bir cisme ${force} N’luk net kuvvet uygulanıyor. Cismin ivmesi kaç m/s² olur?`,
        answer: `${fmt(a)} m/s²`,
        distractors: wrongText(`${fmt(a)} m/s²`, withUnit([force, a + 1, m + a, a + 2], 'm/s²'), ' m/s²', a),
        explanation: `Newton’un ikinci yasası F = m·a’dır. a = F ÷ m = ${force} ÷ ${m} = ${fmt(
          a,
        )} m/s² bulunur.`,
      };
    }
    return {
      prompt: `Kütlesi ${m} kg olan bir cisme ${a} m/s² ivme kazandıran net kuvvet kaç N’dur?`,
      answer: `${fmt(force)} N`,
      distractors: wrongText(`${fmt(force)} N`, withUnit([m + a, a, force / 2, force + m], 'N'), ' N', force),
      explanation: `F = m·a = ${m} × ${fmt(a)} = ${fmt(force)} N olur.`,
    };
  });
}

function genMomentum(idp: string, count: number) {
  const M = [2, 3, 4, 5, 6];
  const V = [3, 4, 5, 6, 8, 10];
  fill(COURSE_SAY, T_FIZ, `${idp}-momentum`, count, (index) => {
    const i = index;
    const m = M[i % M.length];
    const v = V[(i * 3) % V.length];
    if (i % 3 !== 2) {
      const answer = m * v;
      return {
        prompt: `Kütlesi ${m} kg olan bir cisim ${v} m/s hızla hareket etmektedir. Cismin momentumu kaç kg·m/s’dir?`,
        answer: `${fmt(answer)} kg·m/s`,
        distractors: wrongText(
          `${fmt(answer)} kg·m/s`,
          withUnit([m + v, answer / 2, v, answer + m], 'kg·m/s'),
          ' kg·m/s',
          answer,
        ),
        explanation: `Momentum p = m·v = ${m} × ${v} = ${fmt(answer)} kg·m/s bulunur.`,
      };
    }
    const m1 = 2 + (i % 3);
    const v1 = 4 + (i % 4);
    const m2 = 2 * m1;
    const common = (m1 * v1) / (m1 + m2);
    return {
      prompt: `${m1} kg kütleli bir cisim ${v1} m/s hızla, durmakta olan ${m2} kg kütleli cisme çarpıp onunla birlikte hareket ediyor. Ortak hız kaç m/s olur?`,
      answer: `${fmt(common)} m/s`,
      distractors: wrongText(`${fmt(common)} m/s`, withUnit([v1, v1 / 2, common + 1, m1 + v1], 'm/s'), ' m/s', common),
      explanation: `Momentum korunur: ${m1}·${v1} = (${m1} + ${m2})·v′ eşitliğinden v′ = ${fmt(
        common,
      )} m/s bulunur.`,
    };
  });
}

function genOhm(idp: string, count: number) {
  const R = [4, 6, 8, 10, 12, 20];
  const I = [2, 3, 4, 5];
  const PARALEL: Array<[number, number]> = [
    [6, 3],
    [4, 4],
    [12, 6],
    [10, 10],
    [20, 5],
    [8, 8],
    [9, 18],
    [6, 6],
  ];
  fill(COURSE_SAY, T_FIZ, `${idp}-ohm`, count, (index) => {
    const i = index;
    if (i % 3 === 0) {
      const r = R[i % R.length];
      const current = I[(i * 3) % I.length];
      const voltage = r * current;
      return {
        prompt: `Direnci ${r} Ω olan bir iletkenden ${current} A akım geçmektedir. İletkenin uçları arasındaki potansiyel fark kaç V’tur?`,
        answer: `${fmt(voltage)} V`,
        distractors: wrongText(`${fmt(voltage)} V`, withUnit([r + current, voltage / 2, current, voltage + r], 'V'), ' V', voltage),
        explanation: `Ohm yasası V = I·R’dir. V = ${current} × ${r} = ${fmt(voltage)} V bulunur.`,
      };
    }
    if (i % 3 === 1) {
      const r1 = R[i % R.length];
      const r2 = R[(i * 3 + 2) % R.length];
      const total = r1 + r2;
      return {
        prompt: `Seri bağlanmış ${r1} Ω ve ${r2} Ω değerindeki iki direncin eşdeğer direnci kaç Ω’dur?`,
        answer: `${fmt(total)} Ω`,
        distractors: wrongText(`${fmt(total)} Ω`, withUnit([r1 * r2, Math.abs(r1 - r2), total / 2, total + 1], 'Ω'), ' Ω', total),
        explanation: `Seri bağlamada eşdeğer direnç toplanır: ${r1} + ${r2} = ${fmt(total)} Ω olur.`,
      };
    }
    const [r1, r2] = PARALEL[i % PARALEL.length];
    const total = (r1 * r2) / (r1 + r2);
    return {
      prompt: `Paralel bağlanmış ${r1} Ω ve ${r2} Ω değerindeki iki direncin eşdeğer direnci kaç Ω’dur?`,
      answer: `${fmt(total)} Ω`,
      distractors: wrongText(`${fmt(total)} Ω`, withUnit([r1 + r2, r1 * r2, total + 1, total * 2], 'Ω'), ' Ω', total),
      explanation: `Paralel bağlamada 1/Reş = 1/${r1} + 1/${r2} yazılır; Reş = ${r1}·${r2} ÷ (${
        r1
      } + ${r2}) = ${fmt(total)} Ω bulunur.`,
    };
  });
}

function genDalga(idp: string, count: number) {
  const LAMBDA = [2, 3, 4, 5, 6];
  const FREKANS = [2, 4, 5, 10];
  fill(COURSE_SAY, T_FIZ, `${idp}-dalga`, count, (index) => {
    const i = index;
    const lambda = LAMBDA[i % LAMBDA.length];
    const frequency = FREKANS[(i * 3) % FREKANS.length];
    const speed = lambda * frequency;
    if (i % 2 === 0) {
      return {
        prompt: `Frekansı ${frequency} Hz, dalga boyu ${lambda} m olan bir dalganın yayılma hızı kaç m/s’dir?`,
        answer: `${fmt(speed)} m/s`,
        distractors: wrongText(`${fmt(speed)} m/s`, withUnit([lambda + frequency, speed / 2, frequency, speed + lambda], 'm/s'), ' m/s', speed),
        explanation: `Dalga hızı v = λ·f = ${lambda} × ${frequency} = ${fmt(speed)} m/s bulunur.`,
      };
    }
    return {
      prompt: `Yayılma hızı ${speed} m/s olan bir dalganın frekansı ${frequency} Hz ise dalga boyu kaç m’dir?`,
      answer: `${fmt(lambda)} m`,
      distractors: wrongText(`${fmt(lambda)} m`, withUnit([speed + frequency, lambda + 1, speed / 2, frequency], 'm'), ' m', lambda),
      explanation: `v = λ·f eşitliğinden λ = v ÷ f = ${speed} ÷ ${frequency} = ${fmt(
        lambda,
      )} m bulunur.`,
    };
  });
}

function genEnerji(idp: string, count: number) {
  const M = [2, 4, 5, 10];
  const V = [2, 4, 6, 10, 8];
  const H = [2, 3, 5, 8, 10];
  fill(COURSE_SAY, T_FIZ, `${idp}-enerji`, count, (index) => {
    const i = index;
    if (i % 2 === 0) {
      const m = M[i % M.length];
      const v = V[(i * 3) % V.length];
      const answer = 0.5 * m * v * v;
      return {
        prompt: `Kütlesi ${m} kg olan bir cisim ${v} m/s hızla hareket ederken kinetik enerjisi kaç J’dür?`,
        answer: `${fmt(answer)} J`,
        distractors: wrongText(`${fmt(answer)} J`, withUnit([m * v, answer * 2, answer / 2, m * v * v], 'J'), ' J', answer),
        explanation: `Kinetik enerji Ek = ½·m·v² = 0,5 × ${m} × ${v}² = ${fmt(answer)} J bulunur.`,
      };
    }
    const m = M[i % M.length];
    const h = H[(i * 3) % H.length];
    const answer = m * 10 * h;
    return {
      prompt: `Kütlesi ${m} kg olan bir cisim yerden ${h} m yükseklikte duruyor. Cismin potansiyel enerjisi kaç J’dür? (g = 10 m/s²)`,
      answer: `${fmt(answer)} J`,
      distractors: wrongText(`${fmt(answer)} J`, withUnit([m * h, answer / 2, answer + m, m * 10], 'J'), ' J', answer),
      explanation: `Potansiyel enerji Ep = m·g·h = ${m} × 10 × ${h} = ${fmt(answer)} J olur.`,
    };
  });
}

function genBasinc(idp: string, count: number) {
  const F = [20, 40, 60, 100, 200];
  const A = [2, 4, 5, 10, 0.5, 8, 20];
  fill(COURSE_SAY, T_FIZ, `${idp}-basinc`, count, (index) => {
    const i = index;
    const force = F[i % F.length];
    const area = A[(i * 3) % A.length];
    const answer = force / area;
    return {
      prompt: `Ağırlığı ${force} N olan bir cisim ${fmt(area)} m² lik yüzeye dik olarak etki etmektedir. Yüzeye uygulanan basınç kaç Pa’dır?`,
      answer: `${fmt(answer)} Pa`,
      distractors: wrongText(`${fmt(answer)} Pa`, withUnit([force * area, answer / 2, force, answer + 5], 'Pa'), ' Pa', answer),
      explanation: `Basınç P = F ÷ A = ${force} ÷ ${fmt(area)} = ${fmt(answer)} Pa bulunur.`,
    };
  });
}

function genIsGuc(idp: string, count: number) {
  const F = [10, 20, 30, 40, 50];
  const X = [2, 3, 4, 5, 10, 6, 8];
  const T = [2, 4, 5, 10, 8];
  fill(COURSE_SAY, T_FIZ, `${idp}-isguc`, count, (index) => {
    const i = index;
    const force = F[i % F.length];
    const way = X[(i * 3) % X.length];
    const work = force * way;
    if (i % 2 === 0) {
      return {
        prompt: `Bir cisme ${force} N’luk kuvvet, kuvvet yönünde ${way} m yol aldırıyor. Yapılan iş kaç J’dür?`,
        answer: `${fmt(work)} J`,
        distractors: wrongText(`${fmt(work)} J`, withUnit([force + way, work / 2, force, work + way], 'J'), ' J', work),
        explanation: `İş W = F·x = ${force} × ${way} = ${fmt(work)} J olur.`,
      };
    }
    const time = T[(i * 3) % T.length];
    const power = work / time;
    return {
      prompt: `${fmt(work)} J’lük iş ${time} s’de yapılırsa güç kaç W’tır?`,
      answer: `${fmt(power)} W`,
      distractors: wrongText(`${fmt(power)} W`, withUnit([work * time, power / 2, work, power + time], 'W'), ' W', power),
      explanation: `Güç P = W ÷ t = ${fmt(work)} ÷ ${time} = ${fmt(power)} W bulunur.`,
    };
  });
}

function genIsi(idp: string, count: number) {
  const M = [100, 200, 50, 400];
  const DT = [10, 20, 30, 40, 25, 15, 50];
  fill(COURSE_SAY, T_FIZ, `${idp}-isi`, count, (index) => {
    const i = index;
    const m = M[i % M.length];
    const dt = DT[(i * 3) % DT.length];
    const answer = m * 0.5 * dt;
    return {
      prompt: `Öz ısısı 0,5 cal/g·°C olan ${m} g kütleli bir maddenin sıcaklığı ${dt} °C artırılıyor. Maddenin aldığı ısı kaç cal’dir?`,
      answer: `${fmt(answer)} cal`,
      distractors: wrongText(`${fmt(answer)} cal`, withUnit([m * dt, answer / 2, m + dt, answer * 2], 'cal'), ' cal', answer),
      explanation: `Q = m·c·ΔT = ${m} × 0,5 × ${dt} = ${fmt(answer)} cal bulunur.`,
    };
  });
}

/* -------------------------------------------------- Kimya */

function genGaz(idp: string, count: number) {
  const P1 = [1, 2, 3, 4];
  const V1 = [2, 4, 6, 8, 10];
  fill(COURSE_SAY, T_KIM, `${idp}-gaz`, count, (index) => {
    const i = index;
    const p1 = P1[i % P1.length];
    const v1 = V1[(i * 3) % V1.length];
    const p2 = p1 * 2;
    const v2 = (p1 * v1) / p2;
    return {
      prompt: `Sabit sıcaklıkta ${p1} atm basınç altındaki bir gazın hacmi ${v1} L’dir. Basınç ${p2} atm’ye çıkarılırsa gazın hacmi kaç L olur?`,
      answer: `${fmt(v2)} L`,
      distractors: wrongText(`${fmt(v2)} L`, withUnit([p1 * v1, v1 * 2, v2 + 1, p2], 'L'), ' L', v2),
      explanation: `Sabit sıcaklıkta P1·V1 = P2·V2 olduğundan ${p1}×${v1} = ${p2}×V2 ve V2 = ${fmt(
        v2,
      )} L bulunur.`,
    };
  });
}

const MADDE: Array<[string, number]> = [
  ['NaOH', 40],
  ['CaCO₃', 100],
  ['H₂SO₄', 98],
  ['CH₃COOH', 60],
  ['NaOH', 40],
  ['CaCO₃', 100],
];

function genDerisim(idp: string, count: number) {
  fill(COURSE_SAY, T_KIM, `${idp}-derisim`, count, (index) => {
    const i = index;
    const [name, ma] = MADDE[i % MADDE.length];
    const k = [1, 2, 4, 3][(i * 3) % 4];
    const volume = [1, 2, 4, 5, 10][(i * 3) % 5];
    const mass = ma * k;
    const answer = k / volume;
    return {
      prompt: `${mass} g ${name} (mol kütlesi ${ma} g/mol) suda çözülerek ${volume} L çözelti hazırlanıyor. Çözeltinin molar derişimi kaç mol/L’dir?`,
      answer: `${fmt(answer)} mol/L`,
      distractors: wrongText(
        `${fmt(answer)} mol/L`,
        withUnit([k * volume, mass / volume, answer / 2, answer + 1], 'mol/L'),
        ' mol/L',
        answer,
      ),
      explanation: `n = m ÷ MA = ${mass} ÷ ${ma} = ${k} mol; M = n ÷ V = ${k} ÷ ${volume} = ${fmt(
        answer,
      )} mol/L bulunur.`,
    };
  });
}

const DENGE_ROWS: Array<[number, number, number, number]> = [
  [0.2, 0.5, 0.4, 0.5],
  [0.1, 0.2, 0.4, 0.1],
  [0.5, 0.4, 0.2, 0.2],
  [0.2, 0.2, 0.4, 0.4],
  [0.1, 0.4, 0.2, 0.2],
  [0.4, 0.5, 0.2, 0.1],
  [0.2, 0.4, 0.4, 0.2],
  [0.5, 0.2, 0.5, 0.2],
  [0.1, 0.1, 0.2, 0.5],
  [0.25, 0.4, 0.5, 0.4],
  [0.2, 0.5, 0.5, 0.4],
  [0.4, 0.4, 0.8, 0.2],
  [0.2, 0.25, 0.5, 0.4],
  [0.5, 0.5, 0.5, 0.5],
  [0.1, 0.5, 0.5, 0.2],
  [0.3, 0.2, 0.3, 0.4],
];

function genDenge(idp: string, count: number) {
  fill(COURSE_SAY, T_KIM, `${idp}-denge`, count, (index) => {
    const i = index;
    const [a, b, c, d] = DENGE_ROWS[i % DENGE_ROWS.length];
    const answer = (c * d) / (a * b);
    return {
      prompt: `A(g) + B(g) ⇌ C(g) + D(g) tepkimesi dengede iken [A] = ${fmt(a)} M, [B] = ${fmt(
        b,
      )} M, [C] = ${fmt(c)} M ve [D] = ${fmt(d)} M ölçülüyor. Denge sabiti K kaçtır?`,
      answer: fmt(answer),
      distractors: wrongText(fmt(answer), nums([(a * b) / (c * d), answer * 2, answer + 1]), '', answer),
      explanation: `K = ([C]·[D]) ÷ ([A]·[B]) = (${fmt(c)}×${fmt(d)}) ÷ (${fmt(a)}×${fmt(
        b,
      )}) = ${fmt(answer)} bulunur.`,
    };
  });
}

function genMol(idp: string, count: number) {
  const MADDE2: Array<[string, number]> = [
    ['NaOH', 40],
    ['CaCO₃', 100],
    ['H₂SO₄', 98],
    ['CH₃COOH', 60],
    ['KNO₃', 101],
    ['NaCl', 58],
  ];
  fill(COURSE_SAY, T_KIM, `${idp}-mol`, count, (index) => {
    const i = index;
    const [name, ma] = MADDE2[i % MADDE2.length];
    const n = [0.5, 1, 2, 3, 0.25][(i * 3) % 5];
    const mass = ma * n;
    return {
      prompt: `${fmt(n)} mol ${name} kaç gramdır? (${name} için mol kütlesi ${ma} g/mol)`,
      answer: `${fmt(mass)} g`,
      distractors: wrongText(`${fmt(mass)} g`, withUnit([n + ma, mass / 2, ma, mass + ma], 'g'), ' g', mass),
      explanation: `m = n·MA = ${fmt(n)} × ${ma} = ${fmt(mass)} g bulunur.`,
    };
  });
}

function genPh(idp: string, count: number) {
  const rows: Array<[string, number, boolean]> = [
    ['HCl', 1, true],
    ['HCl', 2, true],
    ['HCl', 3, true],
    ['HCl', 4, true],
    ['HNO₃', 2, true],
    ['NaOH', 1, false],
    ['NaOH', 2, false],
    ['KOH', 3, false],
    ['NaOH', 4, false],
  ];
  fill(COURSE_SAY, T_KIM, `${idp}-ph`, count, (index) => {
    const i = index;
    const [name, power, acidic] = rows[i % rows.length];
    const answer = acidic ? power : 14 - power;
    const forms = acidic
      ? [
          `Derişimi 1×10⁻${sup(power)} M olan ${name} çözeltisinin pH değeri kaçtır?`,
          `Sulu çözeltide H⁺ derişimi 1×10⁻${sup(power)} M olan ${name} çözeltisinin pH’sı kaçtır?`,
        ]
      : [
          `Derişimi 1×10⁻${sup(power)} M olan ${name} çözeltisinin pH değeri kaçtır?`,
          `Sulu çözeltide OH⁻ derişimi 1×10⁻${sup(power)} M olan ${name} çözeltisinin pH’sı kaçtır?`,
        ];
    return {
      prompt: forms[i % forms.length],
      answer: fmt(answer),
      distractors: wrongText(fmt(answer), nums([power, 14 - answer, answer + 1]), '', answer),
      explanation: acidic
        ? `Kuvvetli asitte [H⁺] = 1×10⁻${sup(power)} M olduğundan pH = ${answer} bulunur.`
        : `Kuvvetli bazda pOH = ${power}, pH = 14 − ${power} = ${answer} bulunur.`,
    };
  });
}

const ELEKTRON: Array<{ shell: Array<[number, string, number]>; name: string }> = [
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 1]], name: 'sodyum' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 5]], name: 'klor' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 6], [4, 's', 1]], name: 'potasyum' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 4]], name: 'kükürt' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 6], [4, 's', 2]], name: 'kalsiyum' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 1]], name: 'alüminyum' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 6]], name: 'argon' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 4]], name: 'oksijen' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 6], [4, 's', 2], [3, 'd', 6]], name: 'demir' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 6], [4, 's', 2], [3, 'd', 10], [4, 'p', 5]], name: 'brom' },
  { shell: [[1, 's', 2], [2, 's', 1]], name: 'lityum' },
  { shell: [[1, 's', 2], [2, 's', 2]], name: 'berilyum' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 1]], name: 'bor' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 2]], name: 'karbon' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 3]], name: 'azot' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 5]], name: 'flor' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6]], name: 'neon' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2]], name: 'magnezyum' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 3]], name: 'fosfor' },
  { shell: [[1, 's', 2], [2, 's', 2], [2, 'p', 6], [3, 's', 2], [3, 'p', 2]], name: 'silisyum' },
];

function elektronText(shell: Array<[number, string, number]>): string {
  return shell.map(([level, orbital, count]) => `${level}${orbital}${sup(count)}`).join(' ');
}

function genElektron(idp: string, count: number) {
  fill(COURSE_SAY, T_KIM, `${idp}-elektron`, count, (index) => {
    const i = index;
    const row = ELEKTRON[i % ELEKTRON.length];
    const total = row.shell.reduce((sum, [, , count]) => sum + count, 0);
    const config = elektronText(row.shell);
    if (i % 2 === 0) {
      return {
        prompt: `Temel hâl elektron dizilimi ${config} olan elementin atom numarası kaçtır?`,
        answer: fmt(total),
        distractors: wrongText(fmt(total), nums([total + 1, total - 1, total + 2]), '', total),
        explanation: `Dizilimdeki üst simgeler toplanır: ${config} → ${total} elektron, yani atom numarası ${total} olur.`,
      };
    }
    return {
      prompt: `Temel hâl elektron dizilimi ${config} olan element aşağıdakilerden hangisidir?`,
      answer: row.name,
      distractors: otherValues(
        ELEKTRON.map((item) => item.name),
        row.name,
        i,
      ),
      explanation: `Toplam ${total} elektronu olan bu element ${row.name} elementidir; dizilim ${config} biçiminde biter.`,
    };
  });
}

function genSeyreltme(idp: string, count: number) {
  const M1 = [0.5, 1, 2, 4];
  const V1 = [100, 200, 50, 250, 400];
  const V2 = [200, 400, 500, 1000, 800, 250, 500];
  fill(COURSE_SAY, T_KIM, `${idp}-seyreltme`, count, (index) => {
    const i = index;
    const m1 = M1[i % M1.length];
    const v1 = V1[(i * 3) % V1.length];
    const v2 = V2[(i * 5) % V2.length];
    const answer = (m1 * v1) / v2;
    return {
      prompt: `Derişimi ${fmt(m1)} mol/L olan ${v1} mL çözelti, su eklenerek ${v2} mL’ye tamamlanıyor. Yeni derişim kaç mol/L olur?`,
      answer: `${fmt(answer)} mol/L`,
      distractors: wrongText(`${fmt(answer)} mol/L`, withUnit([m1 * (v2 / v1), answer * 2, m1, answer + 1], 'mol/L'), ' mol/L', answer),
      explanation: `Seyreltmede mol sayısı korunur: M1·V1 = M2·V2 → ${fmt(m1)}×${v1} = M2×${v2}, M2 = ${fmt(
        answer,
      )} mol/L bulunur.`,
    };
  });
}

function genYuzde(idp: string, count: number) {
  const TUZ = [10, 20, 25, 40, 50];
  const SU = [40, 60, 90, 150, 200, 250, 350];
  fill(COURSE_SAY, T_KIM, `${idp}-yuzde`, count, (index) => {
    const i = index;
    const salt = TUZ[i % TUZ.length];
    const water = SU[(i * 3) % SU.length];
    const answer = (salt / (salt + water)) * 100;
    return {
      prompt: `${salt} g tuz ${water} g suda tamamen çözünüyor. Oluşan çözeltinin kütlece yüzde derişimi kaçtır?`,
      answer: `${fmt(answer)}%`,
      distractors: wrongText(`${fmt(answer)}%`, withUnit([(salt / water) * 100, answer / 2, answer + 5, salt + water], '%'), '%', answer),
      explanation: `Çözelti kütlesi ${salt} + ${water} = ${salt + water} g’dır. Yüzde derişim = (${salt} ÷ ${
        salt + water
      }) × 100 = ${fmt(answer)}% bulunur.`,
    };
  });
}

/* -------------------------------------------------- Biyoloji */

const GAMETES: Record<string, string[]> = { AA: ['A', 'A'], Aa: ['A', 'a'], aa: ['a', 'a'] };

function crossOne(first: string, second: string): Record<string, number> {
  const counts: Record<string, number> = { AA: 0, Aa: 0, aa: 0 };
  for (const left of GAMETES[first]) {
    for (const right of GAMETES[second]) {
      const key = [left, right].sort().join('');
      counts[key] += 1;
    }
  }
  return counts;
}

const CAPRAZ: Array<[string, string]> = [
  ['Aa', 'Aa'],
  ['Aa', 'aa'],
  ['AA', 'aa'],
  ['aa', 'aa'],
  ['AA', 'Aa'],
  ['AA', 'AA'],
];

function genGenetik(idp: string, count: number) {
  fill(COURSE_SAY, T_BIY, `${idp}-genetik`, count, (index) => {
    const i = index;
    const [first, second] = CAPRAZ[i % CAPRAZ.length];
    const counts = crossOne(first, second);
    const dominant = counts.AA + counts.Aa;
    const recessive = counts.aa;
    const form = Math.floor(i / CAPRAZ.length) % 3;
    if (form === 0) {
      return {
        prompt: `Bezelyelerde ${first} × ${second} çaprazlaması yapılıyor. Baskın fenotipli bireylerin oranı kaçtır?`,
        answer: fracText(dominant, 4),
        distractors: wrongText(fracText(dominant, 4), [
          fracText(recessive, 4),
          fracText(dominant + 1, 4),
          fracText(1, 3),
        ]),
        explanation: `Çaprazlamada 4 olası bireyin ${dominant} tanesi baskın fenotiplidir; oran ${fracText(
          dominant,
          4,
        )} olur.`,
      };
    }
    if (form === 1) {
      return {
        prompt: `Bezelyelerde ${first} × ${second} çaprazlamasında çekinik fenotipli bireylerin oranı kaçtır?`,
        answer: fracText(recessive, 4),
        distractors: wrongText(fracText(recessive, 4), [
          fracText(dominant, 4),
          fracText(1, 2),
          fracText(recessive + 1, 4),
        ]),
        explanation: `4 olası bireyin ${recessive} tanesi çekinik fenotiplidir; oran ${fracText(
          recessive,
          4,
        )} bulunur.`,
      };
    }
    const genotypeKinds = Object.values(counts).filter((value) => value > 0).length;
    return {
      prompt: `Bezelyelerde ${first} × ${second} çaprazlamasında oluşabilecek farklı genotip çeşidi sayısı kaçtır?`,
      answer: fmt(genotypeKinds),
      distractors: wrongText(fmt(genotypeKinds), nums([genotypeKinds + 1, 3, 2]), '', genotypeKinds),
      explanation: `Çaprazlama sonucunda ${Object.entries(counts)
        .filter(([, value]) => value > 0)
        .map(([key]) => key)
        .join(', ')} genotipleri oluşur; yani ${genotypeKinds} çeşit genotip vardır.`,
    };
  });
}

function genProtein(idp: string, count: number) {
  const KODON = [10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 50, 60, 72, 90];
  fill(COURSE_SAY, T_BIY, `${idp}-protein`, count, (index) => {
    const i = index;
    const codon = KODON[i % KODON.length];
    const nucleotide = codon * 3;
    if (i % 2 === 0) {
      return {
        prompt: `${nucleotide} nükleotitten oluşan bir mRNA molekülü en fazla kaç amino asit kodlayabilir?`,
        answer: fmt(codon),
        distractors: wrongText(fmt(codon), nums([nucleotide, codon * 2, codon + 3]), '', codon),
        explanation: `Her amino asit üç nükleotitlik bir kodonla kodlanır: ${nucleotide} ÷ 3 = ${codon} amino asit bulunur.`,
      };
    }
    return {
      prompt: `${codon} amino asitten oluşan bir proteinin sentezi için mRNA’da en az kaç nükleotit bulunmalıdır?`,
      answer: fmt(nucleotide),
      distractors: wrongText(fmt(nucleotide), nums([codon, nucleotide + 3, nucleotide / 2]), '', nucleotide),
      explanation: `Bir amino asit üç nükleotitle kodlandığından ${codon} × 3 = ${nucleotide} nükleotit gerekir.`,
    };
  });
}

function genFotosentez(idp: string, count: number) {
  const CO2 = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84];
  fill(COURSE_SAY, T_BIY, `${idp}-fotosentez`, count, (index) => {
    const i = index;
    const co2 = CO2[i % CO2.length];
    const glikoz = co2 / 6;
    return {
      prompt: `Fotosentezde ${co2} mol karbondioksit tüketildiğinde kaç mol glikoz üretilir?`,
      answer: fmt(glikoz),
      distractors: wrongText(fmt(glikoz), nums([co2, glikoz * 6, glikoz + 1]), '', glikoz),
      explanation: `6CO₂ + 6H₂O → C₆H₁₂O₆ denklemine göre 6 mol CO₂ 1 mol glikoz verir: ${co2} ÷ 6 = ${fmt(
        glikoz,
      )} mol glikoz oluşur.`,
    };
  });
}

function genSolunum(idp: string, count: number) {
  fill(COURSE_SAY, T_BIY, `${idp}-solunum`, count, (index) => {
    const i = index;
    const glikoz = 1 + (i % 13);
    if (i % 2 === 0) {
      const piruvat = glikoz * 2;
      return {
        prompt: `${glikoz} glikoz molekülünün glikoliz basamağında toplam kaç pirüvat molekülü oluşur?`,
        answer: fmt(piruvat),
        distractors: wrongText(fmt(piruvat), nums([glikoz, piruvat + 2, glikoz * 3]), '', piruvat),
        explanation: `Glikolizde bir glikoz iki pirüvata ayrılır: ${glikoz} × 2 = ${piruvat} pirüvat oluşur.`,
      };
    }
    const co2 = glikoz * 6;
    return {
      prompt: `${glikoz} glikoz molekülünün oksijenli solunumu sonucunda toplam kaç karbondioksit molekülü açığa çıkar?`,
      answer: fmt(co2),
      distractors: wrongText(fmt(co2), nums([glikoz * 2, co2 + 6, glikoz]), '', co2),
      explanation: `Bir glikozun oksijenli solunumunda 6 CO₂ çıkar: ${glikoz} × 6 = ${co2} CO₂ oluşur.`,
    };
  });
}

const ENZIM: Array<[string, string]> = [
  ['Enzimler', 'Tepkimeleri hızlandıran, tepkimeden değişmeden çıkan biyolojik katalizörlerdir'],
  ['Yüksek sıcaklık', 'Enzimin üç boyutlu yapısını bozarak denatürasyona yol açar'],
  ['Optimum sıcaklık', 'Enzimin en hızlı çalıştığı sıcaklık değeridir'],
  ['Substrat derişiminin artması', 'Belirli bir noktaya kadar tepkime hızını artırır'],
  ['Enzim derişiminin artması', 'Substrat yeterliyse tepkime hızını artırır'],
  ['pH değişimi', 'Enzimin etkinliğini azaltabilir veya durdurabilir'],
  ['Özgüllük', 'Her enzimin yalnızca belirli bir substrata etki etmesidir'],
  ['Kofaktör', 'Enzimin etkinlik kazanması için gereken yardımcı maddedir'],
  ['İnhibitör', 'Enzimin etkinliğini azaltan maddedir'],
];

function genEnzim(idp: string, count: number) {
  fill(COURSE_SAY, T_BIY, `${idp}-enzim`, count, (index) => {
    const i = index;
    const row = ENZIM[i % ENZIM.length];
    const tanimlar = ENZIM.map((item) => item[1]);
    if (i % 2 === 0) {
      return {
        prompt: `${row[0]} ile ilgili doğru açıklama aşağıdakilerden hangisidir?`,
        answer: row[1],
        distractors: otherValues(tanimlar, row[1], i),
        explanation: `${row[0]}: ${row[1].toLocaleLowerCase('tr-TR')}.`,
      };
    }
    return {
      prompt: `${row[1]} Bu açıklama aşağıdaki kavramlardan hangisine aittir?`,
      answer: row[0],
      distractors: otherValues(
        ENZIM.map((item) => item[0]),
        row[0],
        i,
      ),
      explanation: `Tanımda anlatılan durum ${row[0].toLocaleLowerCase('tr-TR')} kavramıyla açıklanır.`,
    };
  });
}

function genEkoloji(idp: string, count: number) {
  const ENERJI = [10000, 20000, 50000, 80000, 100000, 200000, 400000, 500000, 600000, 800000, 1000000, 2000000, 4000000, 5000000];
  fill(COURSE_SAY, T_BIY, `${idp}-ekoloji`, count, (index) => {
    const i = index;
    const producer = ENERJI[i % ENERJI.length];
    const third = producer / 100;
    return {
      prompt: `Bir besin piramidinde üreticilerin topladığı enerji ${producer} kcal ise üçüncü trofik düzeye aktarılan enerji kaç kcal olur?`,
      answer: fmt(third),
      distractors: wrongText(fmt(third), nums([producer / 10, producer / 1000, third * 10]), '', third),
      explanation: `Her basamakta enerjinin yaklaşık %10’u aktarılır: ${producer} → ${fmt(
        producer / 10,
      )} → ${fmt(third)} kcal olur.`,
    };
  });
}

const ABO: Record<string, string[]> = {
  AA: ['A', 'A'],
  AO: ['A', 'O'],
  BB: ['B', 'B'],
  BO: ['B', 'O'],
  AB: ['A', 'B'],
  OO: ['O', 'O'],
};

function aboPhenotype(pair: string): string {
  if (pair === 'AA' || pair === 'AO') return 'A';
  if (pair === 'BB' || pair === 'BO') return 'B';
  if (pair === 'AB') return 'AB';
  return 'O';
}

function aboCross(first: string, second: string): string[] {
  const set = new Set<string>();
  for (const left of ABO[first]) {
    for (const right of ABO[second]) {
      set.add(aboPhenotype([left, right].sort().join('')));
    }
  }
  return [...set].sort();
}

const ABO_CROSS: Array<[string, string]> = [
  ['AO', 'BO'],
  ['AO', 'AO'],
  ['AB', 'OO'],
  ['AA', 'BO'],
  ['AB', 'AB'],
  ['OO', 'OO'],
  ['AA', 'AO'],
  ['BB', 'AO'],
];

function genKanGrubu(idp: string, count: number) {
  fill(COURSE_SAY, T_BIY, `${idp}-kan`, count, (index) => {
    const i = index;
    const [first, second] = ABO_CROSS[i % ABO_CROSS.length];
    const phenotypes = aboCross(first, second);
    const form = Math.floor(i / ABO_CROSS.length) % 2;
    const forms = [
      `${first} ve ${second} genotipli bireylerin çaprazlanmasıyla oluşabilecek farklı kan grubu çeşidi sayısı kaçtır?`,
      `${first} × ${second} çaprazlamasında ortaya çıkabilecek kan grubu çeşidi sayısı kaçtır?`,
    ];
    return {
      prompt: forms[form],
      answer: fmt(phenotypes.length),
      distractors: wrongText(fmt(phenotypes.length), nums([4, phenotypes.length + 1, 1]), '', phenotypes.length),
      explanation: `Çaprazlama ${phenotypes.join(', ')} kan gruplarını verir; toplam ${phenotypes.length} çeşit oluşur.`,
    };
  });
}

const OZMOZ: Array<[string, string]> = [
  ['Hücrenin saf suya konması', 'Hücre su alarak şişer'],
  ['Hücrenin yoğun tuz çözeltisine konması', 'Hücre su kaybederek büzülür'],
  ['Bitki hücresinin hipotonik ortama konması', 'Turgor basıncı artar'],
  ['Difüzyon', 'Madde çok yoğun ortamdan az yoğun ortama geçer'],
  ['Aktif taşıma', 'Madde ATP harcanarak az yoğun ortamdan çok yoğun ortama taşınır'],
  ['Osmoz', 'Su, yarı geçirgen zardan derişimi yüksek ortama geçer'],
  ['Endositoz', 'Büyük moleküller hücre zarından içeri alınır'],
  ['Ekzositoz', 'Büyük moleküller hücre dışına verilir'],
  ['Kolaylaştırılmış difüzyon', 'Taşıyıcı protein yardımıyla ATP harcanmadan madde geçişi olur'],
  ['Plazmoliz', 'Hücrenin su kaybederek zarın çekilmesi durumudur'],
];

function genOsmoz(idp: string, count: number) {
  fill(COURSE_SAY, T_BIY, `${idp}-osmoz`, count, (index) => {
    const i = index;
    const row = OZMOZ[i % OZMOZ.length];
    if (i % 2 === 0) {
      return {
        prompt: `${row[0]} durumunda aşağıdakilerden hangisi gerçekleşir?`,
        answer: row[1],
        distractors: otherValues(
          OZMOZ.map((item) => item[1]),
          row[1],
          i,
        ),
        explanation: `${row[0]} durumunda ${row[1].toLocaleLowerCase('tr-TR')}.`,
      };
    }
    return {
      prompt: `${row[1]} Bu olay aşağıdakilerden hangisiyle açıklanır?`,
      answer: row[0],
      distractors: otherValues(
        OZMOZ.map((item) => item[0]),
        row[0],
        i,
      ),
      explanation: `Sözü edilen olay ${row[0].toLocaleLowerCase('tr-TR')} ile gerçekleşir.`,
    };
  });
}

/* -------------------------------------------------- Edebiyat */

const EDEBI: Array<[string, string, string]> = [
  ['Şair Evlenmesi', 'Şinasi', 'Tanzimat Dönemi'],
  ['İntibah', 'Namık Kemal', 'Tanzimat Dönemi'],
  ['Felatun Bey ile Rakım Efendi', 'Ahmet Mithat Efendi', 'Tanzimat Dönemi'],
  ['Vatan Yahut Silistre', 'Namık Kemal', 'Tanzimat Dönemi'],
  ['Aşk-ı Memnu', 'Halit Ziya Uşaklıgil', 'Servet-i Fünun Dönemi'],
  ['Mai ve Siyah', 'Halit Ziya Uşaklıgil', 'Servet-i Fünun Dönemi'],
  ['Eylül', 'Mehmet Rauf', 'Servet-i Fünun Dönemi'],
  ['Rübab-ı Şikeste', 'Tevfik Fikret', 'Servet-i Fünun Dönemi'],
  ['Çalıkuşu', 'Reşat Nuri Güntekin', 'Millî Edebiyat Dönemi'],
  ['Yaban', 'Yakup Kadri Karaosmanoğlu', 'Millî Edebiyat Dönemi'],
  ['Ateşten Gömlek', 'Halide Edip Adıvar', 'Millî Edebiyat Dönemi'],
  ['Kuyucaklı Yusuf', 'Sabahattin Ali', 'Cumhuriyet Dönemi'],
  ['İnce Memed', 'Yaşar Kemal', 'Cumhuriyet Dönemi'],
  ['Huzur', 'Ahmet Hamdi Tanpınar', 'Cumhuriyet Dönemi'],
  ['Dokuzuncu Hariciye Koğuşu', 'Peyami Safa', 'Cumhuriyet Dönemi'],
  ['Bereketli Topraklar Üzerinde', 'Orhan Kemal', 'Cumhuriyet Dönemi'],
  ['Memleketimden İnsan Manzaraları', 'Nazım Hikmet', 'Cumhuriyet Dönemi'],
  ['Üvercinka', 'Cemal Süreya', 'Cumhuriyet Dönemi'],
  ['Leyla ve Mecnun', 'Fuzuli', 'Divan Edebiyatı'],
  ['Hüsn ü Aşk', 'Şeyh Galip', 'Divan Edebiyatı'],
];

const EDEBI_DONEM = [...new Set(EDEBI.map((row) => row[2]))];
const EDEBI_YAZAR = [...new Set(EDEBI.map((row) => row[1]))];

function genEdebiDonem(idp: string, count: number) {
  fill(COURSE_EA, T_EDB, `${idp}-edb-donem`, count, (index) => {
    const i = index;
    const row = EDEBI[i % EDEBI.length];
    const form = Math.floor(i / EDEBI.length) % 2;
    if (form === 0) {
      return {
        prompt: `“${row[0]}” adlı eser hangi edebî döneme aittir?`,
        answer: row[2],
        distractors: otherValues(EDEBI_DONEM, row[2], i),
        explanation: `“${row[0]}” ${row[1]} tarafından ${row[2]} içinde kaleme alınmıştır.`,
      };
    }
    return {
      prompt: `“${row[0]}” adlı eserin yazarı aşağıdakilerden hangisidir?`,
      answer: row[1],
      distractors: otherValues(EDEBI_YAZAR, row[1], i + 3),
      explanation: `“${row[0]}” ${row[1]}’e aittir ve ${row[2]} özellikleri taşır.`,
    };
  });
}

const OLCU: Array<[string, string, number]> = [
  ['Koşma', 'Hece ölçüsü (11’li)', 11],
  ['Mani', 'Hece ölçüsü (7’li)', 7],
  ['Semai', 'Hece ölçüsü (8’li)', 8],
  ['Varsağı', 'Hece ölçüsü (8’li)', 8],
  ['Destan', 'Hece ölçüsü (11’li)', 11],
  ['Gazel', 'Aruz ölçüsü', 0],
  ['Kaside', 'Aruz ölçüsü', 0],
  ['Mesnevi', 'Aruz ölçüsü', 0],
  ['Rubai', 'Aruz ölçüsü', 0],
  ['Tuyuğ', 'Aruz ölçüsü', 0],
  ['Şarkı', 'Aruz ölçüsü', 0],
  ['Kıt’a', 'Aruz ölçüsü', 0],
  ['Müstezat', 'Aruz ölçüsü', 0],
  ['Murabba', 'Aruz ölçüsü', 0],
];

const OLCU_TUR = [...new Set(OLCU.map((row) => row[1]))];
const HECELI = OLCU.filter((row) => row[2] > 0);

function genOlcu(idp: string, count: number) {
  fill(COURSE_EA, T_EDB, `${idp}-edb-olcu`, count, (index) => {
    const i = index;
    if (i < OLCU.length) {
      const row = OLCU[i];
      return {
        prompt: `${row[0]} nazım biçiminde hangi ölçü kullanılır?`,
        answer: row[1],
        distractors: otherValues(OLCU_TUR, row[1], i),
        explanation: `${row[0]} nazım biçimi ${row[1].toLocaleLowerCase('tr-TR')} ile yazılır.`,
      };
    }
    const row = HECELI[(i - OLCU.length) % HECELI.length];
    return {
      prompt: `${row[0]} nazım biçiminde dize başına kaç hece bulunur?`,
      answer: fmt(row[2]),
      distractors: wrongText(fmt(row[2]), nums([7, 8, 11]), '', row[2]),
      explanation: `${row[0]} ${row[2]}’li hece ölçüsüyle yazılır; her dizede ${row[2]} hece vardır.`,
    };
  });
}

const SANAT: Array<[string, string]> = [
  ['Teşbih', 'Bir varlığı benzetme yönüyle başka bir varlığa benzeterek anlatma'],
  ['İstiare', 'Benzetme ögelerinden yalnızca birini kullanarak benzetme yapma'],
  ['Kinaye', 'Bir sözü hem gerçek hem mecaz anlamıyla kullanma'],
  ['Tecahül-i arif', 'Bilinen bir gerçeği bilmiyormuş gibi davranma'],
  ['Hüsn-i talil', 'Bir olayın nedenini güzel bir hayale bağlama'],
  ['Telmih', 'Dize içinde tarihî veya edebî bir olaya işaret etme'],
  ['Tezat', 'Karşıt kavramları bir arada kullanma'],
  ['İntak', 'İnsan dışı varlıkları konuşturma'],
  ['Mübalağa', 'Bir durumu olduğundan çok abartarak anlatma'],
  ['Tenasüp', 'Anlamca ilgili sözcükleri uyum içinde kullanma'],
];

function genSanat(idp: string, count: number) {
  fill(COURSE_EA, T_EDB, `${idp}-edb-sanat`, count, (index) => {
    const i = index;
    const row = SANAT[i % SANAT.length];
    const form = Math.floor(i / SANAT.length) % 3;
    const terimler = SANAT.map((item) => item[0]);
    const tanimlar = SANAT.map((item) => item[1]);
    if (form === 0) {
      return {
        prompt: `“${row[1]}” tanımı aşağıdaki söz sanatlarından hangisine aittir?`,
        answer: row[0],
        distractors: otherValues(terimler, row[0], i),
        explanation: `Bu tanım ${row[0]} sanatını anlatmaktadır.`,
      };
    }
    if (form === 1) {
      return {
        prompt: `${row[0]} sanatının bulunduğu bir dizede aşağıdaki özelliklerden hangisi görülür?`,
        answer: row[1],
        distractors: otherValues(tanimlar, row[1], i),
        explanation: `${row[0]} sanatında ${row[1].toLocaleLowerCase('tr-TR')}.`,
      };
    }
    return {
      prompt: `“${row[1]}” özelliği hangi edebî sanatın tanımıdır?`,
      answer: row[0],
      distractors: otherValues(terimler, row[0], i + 4),
      explanation: `Sözü edilen özellik ${row[0]} sanatına aittir.`,
    };
  });
}

const AKIM: Array<[string, string]> = [
  ['Tanzimat edebiyatı', 'Batılı anlamda ilk örneklerin verildiği, toplum için sanat anlayışının benimsendiği dönem'],
  ['Servet-i Fünun', 'Sanat için sanat anlayışıyla ağır ve süslü bir dilin kullanıldığı dönem'],
  ['Fecr-i Ati', 'Servet-i Fünun’a tepki olarak doğan ancak onu sürdüren topluluk'],
  ['Millî Edebiyat', 'Sade dil ve hece ölçüsüyle millî konulara yönelen dönem'],
  ['Garip', 'Şiirde ölçüyü ve kafiyeyi reddeden, gündelik hayatı sade dille anlatan hareket'],
  ['İkinci Yeni', 'Anlam kapalılığını ve çağrışımı öne çıkaran şiir hareketi'],
  ['Toplumcu gerçekçilik', 'Toplumsal sorunları gerçekçi bir bakışla işleyen anlayış'],
  ['Yedi Meşaleciler', 'Beş Hececilere tepki olarak kurulan, sanat sanat içindir diyen topluluk'],
];

function genAkim(idp: string, count: number) {
  fill(COURSE_EA, T_EDB, `${idp}-edb-akim`, count, (index) => {
    const i = index;
    const row = AKIM[i % AKIM.length];
    const form = Math.floor(i / AKIM.length) % 3;
    const adlar = AKIM.map((item) => item[0]);
    const ozellikler = AKIM.map((item) => item[1]);
    if (form === 0) {
      return {
        prompt: `“${row[1]}” özelliği hangi edebî dönem veya topluluğa aittir?`,
        answer: row[0],
        distractors: otherValues(adlar, row[0], i),
        explanation: `Bu özellik ${row[0]} anlayışını tanımlar.`,
      };
    }
    if (form === 1) {
      return {
        prompt: `${row[0]} anlayışının belirgin özelliği aşağıdakilerden hangisidir?`,
        answer: row[1],
        distractors: otherValues(ozellikler, row[1], i),
        explanation: `${row[0]}: ${row[1].toLocaleLowerCase('tr-TR')}.`,
      };
    }
    return {
      prompt: `Aşağıdaki edebî topluluklardan hangisi “${row[1]}” özelliğiyle tanınır?`,
      answer: row[0],
      distractors: otherValues(adlar, row[0], i + 2),
      explanation: `Sözü edilen özellik ${row[0]} topluluğuna aittir.`,
    };
  });
}

/* -------------------------------------------------- Tarih */

const OSMANLI: Array<[string, string]> = [
  ['Bursa’nın fethi', 'Kuruluş Dönemi'],
  ['Kosova Savaşı', 'Kuruluş Dönemi'],
  ['Niğbolu Savaşı', 'Kuruluş Dönemi'],
  ['Ankara Savaşı', 'Kuruluş Dönemi'],
  ['Varna Savaşı', 'Kuruluş Dönemi'],
  ['İstanbul’un fethi', 'Yükselme Dönemi'],
  ['Otlukbeli Savaşı', 'Yükselme Dönemi'],
  ['Çaldıran Savaşı', 'Yükselme Dönemi'],
  ['Mohaç Savaşı', 'Yükselme Dönemi'],
  ['Preveze Deniz Savaşı', 'Yükselme Dönemi'],
  ['Zitvatorok Antlaşması', 'Duraklama Dönemi'],
  ['IV. Murat’ın Revan Seferi', 'Duraklama Dönemi'],
  ['Girit’in fethi', 'Duraklama Dönemi'],
  ['II. Viyana Kuşatması', 'Duraklama Dönemi'],
  ['Pasarofça Antlaşması', 'Gerileme Dönemi'],
  ['Belgrad Antlaşmaları', 'Gerileme Dönemi'],
  ['Küçük Kaynarca Antlaşması', 'Gerileme Dönemi'],
  ['Ziştovi Antlaşması', 'Gerileme Dönemi'],
  ['Tanzimat Fermanı', 'Dağılma Dönemi'],
  ['Islahat Fermanı', 'Dağılma Dönemi'],
  ['I. Meşrutiyet’in ilanı', 'Dağılma Dönemi'],
  ['Berlin Antlaşması', 'Dağılma Dönemi'],
];

const OSMANLI_DONEM = [...new Set(OSMANLI.map((row) => row[1]))];

function genOsmanli(idp: string, count: number) {
  fill(COURSE_EA, T_TAR, `${idp}-tar-osmanli`, count, (index) => {
    const i = index;
    const row = OSMANLI[i % OSMANLI.length];
    const form = Math.floor(i / OSMANLI.length) % 2;
    if (form === 0) {
      return {
        prompt: `${row[0]} hangi dönemde gerçekleşmiştir?`,
        answer: row[1],
        distractors: otherValues(OSMANLI_DONEM, row[1], i),
        explanation: `${row[0]} ${row[1]} içinde yer alan gelişmelerden biridir.`,
      };
    }
    const pool = OSMANLI.filter((item) => item[1] === row[1]).map((item) => item[0]);
    return {
      prompt: `Aşağıdaki olaylardan hangisi ${row[1]} içinde yer alır?`,
      answer: row[0],
      distractors: sample(
        OSMANLI.filter((item) => item[1] !== row[1]).map((item) => item[0]),
        3,
        i,
      ),
      explanation: `${row[0]} ${row[1]} dönemine aittir; diğer seçenekler başka dönemlerde gerçekleşmiştir.`,
    };
  });
}

const INKILAP: Array<[string, number]> = [
  ['Saltanatın kaldırılması', 1922],
  ['Cumhuriyet’in ilanı', 1923],
  ['Halifeliğin kaldırılması', 1924],
  ['Tevhid-i Tedrisat Kanunu', 1924],
  ['Şapka İnkılabı', 1925],
  ['Tekke ve zaviyelerin kapatılması', 1925],
  ['Takvim ve saat değişikliği', 1925],
  ['Türk Medeni Kanunu', 1926],
  ['Harf İnkılabı', 1928],
  ['Kadınlara belediye seçimlerinde seçme hakkı', 1930],
  ['Soyadı Kanunu', 1934],
  ['Kadınlara milletvekili seçme ve seçilme hakkı', 1934],
];

function inkilapSet(index: number): Array<[string, number]> {
  const out: Array<[string, number]> = [];
  const years = new Set<number>();
  let cursor = index * 3;
  let guard = 0;
  while (out.length < 4 && guard < 120) {
    const item = INKILAP[cursor % INKILAP.length];
    cursor += 1;
    guard += 1;
    if (years.has(item[1])) continue;
    years.add(item[1]);
    out.push(item);
  }
  return out;
}

function genInkilap(idp: string, count: number) {
  fill(COURSE_EA, T_TAR, `${idp}-tar-inkilap`, count, (index) => {
    const i = index;
    const group = inkilapSet(i);
    if (i % 3 !== 2) {
      const earliest = [...group].sort((left, right) => left[1] - right[1])[0];
      return {
        prompt: 'Aşağıdaki inkılap hareketlerinden hangisi diğerlerinden daha önce gerçekleşmiştir?',
        answer: earliest[0],
        distractors: group.filter((item) => item[0] !== earliest[0]).map((item) => item[0]),
        explanation: `${earliest[0]} ${earliest[1]} yılında, diğerleri ise ${group
          .filter((item) => item[0] !== earliest[0])
          .map((item) => `${item[0]} ${item[1]}`)
          .join(', ')} tarihlerinde gerçekleşmiştir.`,
        kind: 'sequence',
      };
    }
    const target = group[i % group.length];
    return {
      prompt: `${target[0]} hangi yıl gerçekleşmiştir?`,
      answer: fmt(target[1]),
      distractors: wrongText(
        fmt(target[1]),
        group.filter((item) => item[1] !== target[1]).map((item) => fmt(item[1])),
        '',
        target[1],
      ),
      explanation: `${target[0]} ${target[1]} yılında yürürlüğe girmiştir.`,
    };
  });
}

const ANTLASMA: Array<[string, number, string]> = [
  ['Karlofça Antlaşması', 1699, 'Osmanlı Devleti’nin ilk kez büyük ölçüde toprak kaybettiği antlaşma'],
  ['Küçük Kaynarca Antlaşması', 1774, 'Rusya’ya Karadeniz’de ticaret ve konsolosluk hakkı tanıyan antlaşma'],
  ['Yaş Antlaşması', 1792, 'Kırım’ın Rusya’ya ait olduğunun kabul edildiği antlaşma'],
  ['Bükreş Antlaşması', 1812, 'Sırplara ayrıcalık tanınan antlaşma'],
  ['Edirne Antlaşması', 1829, 'Yunanistan’ın bağımsızlığının kabul edildiği antlaşma'],
  ['Hünkâr İskelesi Antlaşması', 1833, 'Osmanlı ile Rusya arasında savunma ittifakı kuran antlaşma'],
  ['Paris Antlaşması', 1856, 'Osmanlı Devleti’nin Avrupa devletler hukukundan yararlanmasının kabul edildiği antlaşma'],
  ['Berlin Antlaşması', 1878, 'Sırbistan, Karadağ ve Romanya’nın bağımsızlığının kabul edildiği antlaşma'],
  ['Mondros Ateşkes Antlaşması', 1918, 'İtilaf Devletleri’ne geniş işgal yetkisi veren ateşkes'],
  ['Sevr Antlaşması', 1920, 'TBMM tarafından tanınmayan, Osmanlı topraklarını paylaştıran antlaşma'],
  ['Ankara Antlaşması', 1921, 'Fransa ile imzalanan ve güney sınırını belirleyen antlaşma'],
  ['Kars Antlaşması', 1921, 'Doğu sınırının kesinleşmesini sağlayan antlaşma'],
  ['Mudanya Ateşkes Antlaşması', 1922, 'TBMM’nin siyasi alandaki ilk başarısını gösteren ateşkes'],
  ['Lozan Antlaşması', 1923, 'Türkiye Cumhuriyeti’nin bağımsızlığının uluslararası alanda kabul edildiği antlaşma'],
  ['Moskova Antlaşması', 1921, 'Sovyet Rusya ile imzalanan ilk dostluk antlaşması'],
];

const ANTLASMA_SONUC = ANTLASMA.map((row) => row[2]);

function genAntlasma(idp: string, count: number) {
  fill(COURSE_EA, T_TAR, `${idp}-tar-antlasma`, count, (index) => {
    const i = index;
    const row = ANTLASMA[i % ANTLASMA.length];
    const form = Math.floor(i / ANTLASMA.length) % 2;
    if (form === 0) {
      return {
        prompt: `${row[0]} ile ilgili aşağıdaki sonuçlardan hangisi doğrudur?`,
        answer: row[2],
        distractors: otherValues(ANTLASMA_SONUC, row[2], i),
        explanation: `${row[0]} (${row[1]}) ${row[2].toLocaleLowerCase('tr-TR')}.`,
      };
    }
    return {
      prompt: `${row[0]} hangi yıl imzalanmıştır?`,
      answer: fmt(row[1]),
      distractors: wrongText(
        fmt(row[1]),
        ANTLASMA.filter((item) => item[1] !== row[1]).map((item) => fmt(item[1])),
        '',
        row[1],
      ),
      explanation: `${row[0]} ${row[1]} yılında imzalanmıştır.`,
    };
  });
}

const KURUM: Array<[string, string]> = [
  ['Divan-ı Hümayun', 'Devlet işlerinin görüşüldüğü en yüksek karar organı'],
  ['Sadrazam', 'Padişahın mutlak vekili olarak divana başkanlık eden görevli'],
  ['Kazasker', 'Adalet ve eğitim işlerinden sorumlu divan üyesi'],
  ['Defterdar', 'Maliye işlerini yürüten divan üyesi'],
  ['Nişancı', 'Tapu ve kadastro işleriyle devlet yazışmalarını yürüten görevli'],
  ['Reisülküttap', 'Dış yazışmaları yürüten divan görevlisi'],
  ['Şeyhülislam', 'Dini konularda fetva veren en yüksek makam'],
  ['Yeniçeri Ocağı', 'Kapıkulu piyadesi olarak merkez ordusunu oluşturan ocak'],
  ['Tımar sistemi', 'Toprak gelirinin hizmet karşılığı askerlere tahsis edildiği sistem'],
  ['İltizam', 'Vergi toplama hakkının açık artırmayla devredilmesi'],
  ['Kadı', 'Bulunduğu bölgede adalet ve belediye işlerini yürüten görevli'],
  ['Muhtesip', 'Çarşı ve pazarda fiyat denetimi yapan görevli'],
  ['Müderris', 'Medresede ders veren öğretim görevlisi'],
];

function genKurum(idp: string, count: number) {
  fill(COURSE_EA, T_TAR, `${idp}-tar-kurum`, count, (index) => {
    const i = index;
    const row = KURUM[i % KURUM.length];
    if (i % 2 === 0) {
      return {
        prompt: `${row[0]} hangi görevi yürütür?`,
        answer: row[1],
        distractors: otherValues(
          KURUM.map((item) => item[1]),
          row[1],
          i,
        ),
        explanation: `${row[0]} ${row[1].toLocaleLowerCase('tr-TR')}.`,
      };
    }
    return {
      prompt: `${row[1]} görevini hangi kurum veya görevli yürütür?`,
      answer: row[0],
      distractors: otherValues(
        KURUM.map((item) => item[0]),
        row[0],
        i,
      ),
      explanation: `Bu görev ${row[0]} tarafından yürütülür.`,
    };
  });
}

/* -------------------------------------------------- Coğrafya */

const IL_IKLIM: Array<[string, string]> = [
  ['Rize', 'Karadeniz iklimi'],
  ['Trabzon', 'Karadeniz iklimi'],
  ['Ordu', 'Karadeniz iklimi'],
  ['Giresun', 'Karadeniz iklimi'],
  ['Antalya', 'Akdeniz iklimi'],
  ['Mersin', 'Akdeniz iklimi'],
  ['Muğla', 'Akdeniz iklimi'],
  ['Adana', 'Akdeniz iklimi'],
  ['İzmir', 'Akdeniz iklimi'],
  ['Konya', 'Karasal iklim'],
  ['Kayseri', 'Karasal iklim'],
  ['Ankara', 'Karasal iklim'],
  ['Erzurum', 'Karasal iklim'],
  ['Van', 'Karasal iklim'],
  ['İstanbul', 'Marmara (geçiş) iklimi'],
  ['Edirne', 'Marmara (geçiş) iklimi'],
  ['Bursa', 'Marmara (geçiş) iklimi'],
  ['Çanakkale', 'Marmara (geçiş) iklimi'],
];

const IKlim_OZELLIK: Array<[string, string]> = [
  ['Yazları sıcak ve kurak, kışları ılık ve yağışlı olması', 'Akdeniz iklimi'],
  ['Her mevsim yağışlı olması ve yazların serin geçmesi', 'Karadeniz iklimi'],
  ['Kışları sert ve kar yağışlı, yazları sıcak ve kurak olması', 'Karasal iklim'],
  ['Yaz ile kış arasındaki sıcaklık farkının az olması ve yağışın her mevsime dağılması', 'Marmara (geçiş) iklimi'],
];

const IKlim_TUR = [...new Set(IL_IKLIM.map((row) => row[1]))];

function genIklim(idp: string, count: number) {
  fill(COURSE_EA, T_COG, `${idp}-cog-iklim`, count, (index) => {
    const i = index;
    if (i < IL_IKLIM.length) {
      const row = IL_IKLIM[i];
      const forms = [
        `${row[0]} ilinde hangi iklim tipi etkilidir?`,
        `${row[0]} ili hangi iklim tipinin etkisi altındadır?`,
      ];
      return {
        prompt: forms[i % forms.length],
        answer: row[1],
        distractors: otherValues(IKlim_TUR, row[1], i),
        explanation: `${row[0]} ${row[1].toLocaleLowerCase('tr-TR')} etkisi altındadır.`,
      };
    }
    const row = IKlim_OZELLIK[(i - IL_IKLIM.length) % IKlim_OZELLIK.length];
    return {
      prompt: `${row[0]} görülen bir yörede hangi iklim tipi etkilidir?`,
      answer: row[1],
      distractors: otherValues(IKlim_TUR, row[1], i),
      explanation: `Bu özellikler ${row[1].toLocaleLowerCase('tr-TR')} belirgin özellikleridir.`,
    };
  });
}

const EKONOMI: Array<[string, string]> = [
  ['Fındık', 'Doğu Karadeniz kıyıları'],
  ['Çay', 'Doğu Karadeniz kıyıları'],
  ['İncir', 'Ege kıyıları'],
  ['Üzüm', 'Ege Bölgesi iç kesimleri'],
  ['Kayısı', 'Malatya ve çevresi'],
  ['Zeytin', 'Ege ve Marmara kıyıları'],
  ['Pamuk', 'Çukurova'],
  ['Buğday', 'İç Anadolu'],
  ['Şeker pancarı', 'İç Anadolu ve Doğu Anadolu'],
  ['Muz', 'Antalya ve çevresi'],
  ['Turunçgil', 'Akdeniz kıyıları'],
  ['Tütün', 'Ege ve Karadeniz'],
  ['Antep fıstığı', 'Güneydoğu Anadolu'],
  ['Çeltik', 'Edirne ve çevresi'],
  ['Bor mineralleri', 'Eskişehir-Kırka ve Balıkesir-Bigadiç'],
  ['Krom', 'Elazığ-Guleman'],
  ['Bakır', 'Artvin-Murgul'],
  ['Taş kömürü', 'Zonguldak'],
  ['Linyit', 'Afşin-Elbistan'],
  ['Demir', 'Sivas-Divriği'],
  ['Boksit', 'Konya-Seydişehir'],
  ['Petrol', 'Batman ve Adıyaman'],
];

const EKONOMI_YORE = [...new Set(EKONOMI.map((row) => row[1]))];

function genEkonomi(idp: string, count: number) {
  fill(COURSE_EA, T_COG, `${idp}-cog-ekonomi`, count, (index) => {
    const i = index;
    const row = EKONOMI[i % EKONOMI.length];
    const forms = [
      `${row[0]} üretimi veya çıkarımı hangi yörede yoğunlaşmıştır?`,
      `${row[0]} hangi yörenin öne çıkan ekonomik değeridir?`,
    ];
    return {
      prompt: forms[i % forms.length],
      answer: row[1],
      distractors: otherValues(EKONOMI_YORE, row[1], i),
      explanation: `${row[0]} üretiminde ${row[1].toLocaleLowerCase('tr-TR')} öne çıkar.`,
    };
  });
}

const YER: Array<[string, string]> = [
  ['Ağrı Dağı', 'Türkiye’nin en yüksek noktasıdır'],
  ['Van Gölü', 'Türkiye’nin en büyük gölüdür'],
  ['Tuz Gölü', 'Türkiye’nin en tuzlu göllerinden biridir'],
  ['Kızılırmak', 'Türkiye’de en uzun akarsudur'],
  ['Fırat Nehri', 'Türkiye’den doğup Basra Körfezi’ne ulaşan akarsudur'],
  ['Erciyes Dağı', 'İç Anadolu’da yer alan volkanik bir dağdır'],
  ['Uludağ', 'Marmara Bölgesi’nin en yüksek dağıdır'],
  ['Toroslar', 'Akdeniz kıyısına paralel uzanan dağ sırasıdır'],
  ['Kuzey Anadolu Dağları', 'Karadeniz kıyısına paralel uzanan dağ sırasıdır'],
  ['Çukurova', 'Seyhan ve Ceyhan nehirlerinin oluşturduğu delta ovasıdır'],
  ['Pamukkale', 'Travertenleriyle ünlü doğal oluşumdur'],
  ['Kapadokya', 'Peribacalarıyla ünlü volkanik tüf arazisidir'],
  ['Nemrut Dağı', 'Adıyaman’da tümülüs ve heykelleriyle ünlü dağdır'],
  ['Sakarya Nehri', 'Kaynağını İç Batı Anadolu’dan alıp Karadeniz’e dökülen akarsudur'],
  ['Beyşehir Gölü', 'Türkiye’nin en büyük tatlı su gölüdür'],
  ['Ihlara Vadisi', 'Aksaray’da volkanik arazide oluşan kanyondur'],
  ['Manyas Gölü', 'Balıkesir’de kuş cennetiyle ünlü göldür'],
];

const YER_OZELLIK = YER.map((row) => row[1]);

function genYer(idp: string, count: number) {
  fill(COURSE_EA, T_COG, `${idp}-cog-yer`, count, (index) => {
    const i = index;
    const row = YER[i % YER.length];
    if (i % 2 === 0) {
      return {
        prompt: `${row[0]} ile ilgili aşağıdaki bilgilerden hangisi doğrudur?`,
        answer: row[1],
        distractors: otherValues(YER_OZELLIK, row[1], i),
        explanation: `${row[0]}, ${row[1].toLocaleLowerCase('tr-TR')}.`,
      };
    }
    return {
      prompt: `${row[1]} Bu özellik aşağıdaki yer şekillerinden hangisine aittir?`,
      answer: row[0],
      distractors: otherValues(
        YER.map((item) => item[0]),
        row[0],
        i,
      ),
      explanation: `Sözü edilen özellik ${row[0]} için geçerlidir.`,
    };
  });
}

const NUFUS: Array<[string, string]> = [
  ['Nüfus yoğunluğu', 'Birim alana düşen kişi sayısı'],
  ['İç göç', 'Ülke sınırları içinde yerleşim yeri değiştirme'],
  ['Dış göç', 'Ülke sınırları dışına yapılan göç'],
  ['Mevsimlik göç', 'Belirli dönemlerde çalışmak için yapılan geçici göç'],
  ['Beyin göçü', 'Nitelikli iş gücünün yurt dışına gitmesi'],
  ['Doğal nüfus artışı', 'Doğum ile ölüm arasındaki farktan kaynaklanan artış'],
  ['Nüfus piramidi', 'Yaş ve cinsiyet dağılımını gösteren grafik'],
  ['Kentleşme', 'Kentsel nüfus oranının artması'],
  ['Çarpık kentleşme', 'Kentlerin plansız ve düzensiz büyümesi'],
  ['Nüfus sayımı', 'Nüfusun sayı ve özelliklerinin belirlenmesi'],
  ['Gecekondu', 'İzinsiz yapılan ve altyapısı yetersiz olan konut'],
];

function genNufus(idp: string, count: number) {
  fill(COURSE_EA, T_COG, `${idp}-cog-nufus`, count, (index) => {
    const i = index;
    const row = NUFUS[i % NUFUS.length];
    if (i % 2 === 0) {
      return {
        prompt: `${row[0]} kavramının tanımı aşağıdakilerden hangisidir?`,
        answer: row[1],
        distractors: otherValues(
          NUFUS.map((item) => item[1]),
          row[1],
          i,
        ),
        explanation: `${row[0]}: ${row[1].toLocaleLowerCase('tr-TR')}.`,
      };
    }
    return {
      prompt: `${row[1]} Bu tanım aşağıdaki kavramlardan hangisine aittir?`,
      answer: row[0],
      distractors: otherValues(
        NUFUS.map((item) => item[0]),
        row[0],
        i,
      ),
      explanation: `Tanımda anlatılan durum ${row[0].toLocaleLowerCase('tr-TR')} kavramıdır.`,
    };
  });
}

/* -------------------------------------------------- Üretim */

genFonksiyon('ayts', COURSE_SAY, 15, 0);
genPolinom('ayts', COURSE_SAY, 14, 0);
genTrig('ayts', COURSE_SAY, 15, 0);
genLog('ayts', COURSE_SAY, 14, 0);
genDizi('ayts', COURSE_SAY, 14, 0);
genOlasilik('ayts', COURSE_SAY, 14, 0);
genVektor('ayts', COURSE_SAY, 14);
genTurev('ayts', COURSE_SAY, 14);

genNewton('ayts', 14);
genMomentum('ayts', 14);
genOhm('ayts', 14);
genDalga('ayts', 14);
genEnerji('ayts', 14);
genBasinc('ayts', 14);
genIsGuc('ayts', 14);
genIsi('ayts', 14);

genGaz('ayts', 14);
genDerisim('ayts', 14);
genDenge('ayts', 14);
genMol('ayts', 14);
genPh('ayts', 14);
genElektron('ayts', 14);
genSeyreltme('ayts', 14);
genYuzde('ayts', 14);

genGenetik('ayts', 14);
genProtein('ayts', 14);
genFotosentez('ayts', 14);
genSolunum('ayts', 14);
genEnzim('ayts', 14);
genEkoloji('ayts', 14);
genKanGrubu('ayts', 14);
genOsmoz('ayts', 14);

genFonksiyon('aytea', COURSE_EA, 15, 11);
genPolinom('aytea', COURSE_EA, 15, 7);
genTrig('aytea', COURSE_EA, 15, 5);
genLog('aytea', COURSE_EA, 14, 3);
genDizi('aytea', COURSE_EA, 14, 4);
genOlasilik('aytea', COURSE_EA, 14, 9);

genEdebiDonem('aytea', 26);
genOlcu('aytea', 18);
genSanat('aytea', 22);
genAkim('aytea', 21);

genOsmanli('aytea', 22);
genInkilap('aytea', 22);
genAntlasma('aytea', 24);
genKurum('aytea', 20);

genIklim('aytea', 22);
genEkonomi('aytea', 22);
genYer('aytea', 22);
genNufus('aytea', 22);

export { questions };

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'ÖSYM::AYT Sayısal': {
    Matematik: bucket[`${COURSE_SAY}::${T_MAT}`] ?? [],
    Fizik: bucket[`${COURSE_SAY}::${T_FIZ}`] ?? [],
    Kimya: bucket[`${COURSE_SAY}::${T_KIM}`] ?? [],
    Biyoloji: bucket[`${COURSE_SAY}::${T_BIY}`] ?? [],
  },
  'ÖSYM::AYT Eşit Ağırlık': {
    Matematik: bucket[`${COURSE_EA}::${T_MAT}`] ?? [],
    Edebiyat: bucket[`${COURSE_EA}::${T_EDB}`] ?? [],
    Tarih: bucket[`${COURSE_EA}::${T_TAR}`] ?? [],
    Coğrafya: bucket[`${COURSE_EA}::${T_COG}`] ?? [],
  },
};
