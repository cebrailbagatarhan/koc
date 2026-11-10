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

const LEVEL = 'Ortaokul';
const MATH = 'Matematik';

const TOPIC_EQ = 'Denklemler';
const TOPIC_FRAC = 'Ondalık ve Kesirler';
const TOPIC_TRI = 'Üçgenler';

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

function add(draft: Draft, topic: string): boolean {
  const key = `${draft.prompt}|${[draft.answer, ...draft.distractors].slice().sort().join('|')}`;
  if (usedPrompts.has(key)) return false;
  usedPrompts.add(key);
  questions.push(
    mc({
      id: draft.id,
      levelName: LEVEL,
      courseName: MATH,
      prompt: draft.prompt,
      answer: draft.answer,
      distractors: draft.distractors,
      explanation: draft.explanation,
      difficulty: draft.difficulty,
    }),
  );
  topicIds[topic] = [...(topicIds[topic] ?? []), draft.id];
  return true;
}

function run(count: number, make: (index: number) => Draft | null, topic: string) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 80) {
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
  return String(rounded).replace('.', ',');
}

function signed(value: number): string {
  return value < 0 ? `−${Math.abs(value)}` : String(value);
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
  while (out.length < 3 && step < 40) {
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

function texts(answer: string, candidates: string[]): string[] {
  const seen = new Set([answer]);
  const out: string[] = [];
  for (const text of candidates) {
    if (out.length === 3) break;
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
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

function frac(num: number, den: number): string {
  let n = num;
  let d = den;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  const sn = n / g;
  const sd = d / g;
  return sd === 1 ? String(sn) : `${sn}/${sd}`;
}

function fracDistractors(num: number, den: number, extras: number[][]): string[] {
  const answer = frac(num, den);
  const seen = new Set([answer]);
  const out: string[] = [];
  const push = (text: string) => {
    if (out.length === 3 || seen.has(text)) return;
    seen.add(text);
    out.push(text);
  };
  for (const [n, d] of extras) {
    if (!d) continue;
    push(frac(n, d));
  }
  for (const [n, d] of [
    [num + den, den],
    [num, den + 1],
    [num + 2 * den, den],
    [num, den + 2],
    [num + den, den + 1],
  ]) {
    if (out.length === 3) break;
    push(frac(n, d));
  }
  if (out.length < 3) throw new Error('kesir çeldirici yetersiz');
  return out;
}

/* ---------------------------------------------------------------- */
/* Denklemler: birinci derece denklem                                */
/* ---------------------------------------------------------------- */

function genLinear() {
  run(
    40,
    (i) => {
      const a = 2 + Math.floor(rnd() * 8);
      const x = 2 + Math.floor(rnd() * 14);
      const b = 3 + Math.floor(rnd() * 23);
      const c = a * x + b;
      const prompt =
        i % 2 === 0
          ? `${a}x + ${b} = ${c} denkleminde x kaçtır?`
          : `${c} = ${a}x + ${b} eşitliğini sağlayan x değeri kaçtır?`;
      return {
        id: `bulk-om-eq-${i + 1}`,
        prompt,
        answer: String(x),
        distractors: nums(x, [c - b, c + b, x + 1, x - 1, (c - b) / a + 2, Math.round(c / a), c - b - a]),
        explanation: `${a}x + ${b} = ${c} eşitliğinde önce ${b} karşı tarafa alınır: ${a}x = ${c} − ${b} = ${c - b}. Sonra her iki taraf ${a} sayısına bölünür: x = ${c - b} ÷ ${a} = ${x}.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

/* ---------------------------------------------------------------- */
/* Denklemler: denklem kurma problemi                                */
/* ---------------------------------------------------------------- */

function genEqWord() {
  run(
    40,
    (i) => {
      const mode = i % 4;
      if (mode === 0) {
        const a = 2 + Math.floor(rnd() * 7);
        const x = 3 + Math.floor(rnd() * 12);
        const b = 2 + Math.floor(rnd() * 18);
        const c = a * x + b;
        return {
          id: `bulk-om-eqw-${i + 1}`,
          prompt: `Bir sayının ${a} katının ${b} fazlası ${c} ediyor. Bu sayı kaçtır?`,
          answer: String(x),
          distractors: nums(x, [c - b, c + b, x + 1, x - 1, c - a, Math.round(c / a)]),
          explanation: `Sayıya x dersek ${a}x + ${b} = ${c} olur. ${a}x = ${c} − ${b} = ${c - b}, dolayısıyla x = ${c - b} ÷ ${a} = ${x}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const a = 2 + Math.floor(rnd() * 6);
        const x = 4 + Math.floor(rnd() * 12);
        const b = 2 + Math.floor(rnd() * (a * x - 5));
        const c = a * x - b;
        return {
          id: `bulk-om-eqw-${i + 1}`,
          prompt: `Hangi sayının ${a} katından ${b} çıkarılırsa ${c} kalır?`,
          answer: String(x),
          distractors: nums(x, [c - b, c + b, x + 2, x - 2, c + a, Math.round(c / a)]),
          explanation: `${a}x − ${b} = ${c} yazılır. ${a}x = ${c} + ${b} = ${c + b}, buradan x = ${c + b} ÷ ${a} = ${x}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 2) {
        const x = 2 * (4 + Math.floor(rnd() * 12));
        const b = 2 + Math.floor(rnd() * 15);
        const c = x / 2 + b;
        return {
          id: `bulk-om-eqw-${i + 1}`,
          prompt: `Bir sayının yarısının ${b} fazlası ${c} ise bu sayı kaçtır?`,
          answer: String(x),
          distractors: nums(x, [c - b, c + b, x / 2, x + 2, 2 * c, c - b + 2]),
          explanation: `Sayı x olsun: x ÷ 2 + ${b} = ${c}. Buradan x ÷ 2 = ${c} − ${b} = ${c - b}, sayı x = ${c - b} × 2 = ${x}.`,
          difficulty: difficultyAt(i),
        };
      }
      const a = 2 + Math.floor(rnd() * 4);
      const b = 2 + Math.floor(rnd() * 4);
      const x = 3 + Math.floor(rnd() * 10);
      const c = (a + b) * x;
      return {
        id: `bulk-om-eqw-${i + 1}`,
        prompt: `Bir sayının ${a} katı ile ${b} katının toplamı ${c} ediyor. Bu sayı kaçtır?`,
        answer: String(x),
        distractors: nums(x, [c / a, c / b, x + 1, x - 1, c - a - b, c / (a * b)]),
        explanation: `${a}x + ${b}x = ${a + b}x olur. ${a + b}x = ${c} ise x = ${c} ÷ ${a + b} = ${x}.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

/* ---------------------------------------------------------------- */
/* Denklemler: iki tarafta bilinmeyen                                */
/* ---------------------------------------------------------------- */

function genBothSides() {
  run(
    38,
    (i) => {
      const a = 5 + Math.floor(rnd() * 5);
      const c = 2 + Math.floor(rnd() * 3);
      const x = 2 + Math.floor(rnd() * 11);
      const b = 1 + Math.floor(rnd() * 18);
      const d = (a - c) * x + b;
      const prompt =
        i % 2 === 0
          ? `${a}x + ${b} = ${c}x + ${d} denkleminde x kaçtır?`
          : `${a}x + ${b} = ${c}x + ${d} eşitliğinde bilinmeyen x kaçtır?`;
      return {
        id: `bulk-om-both-${i + 1}`,
        prompt,
        answer: String(x),
        distractors: nums(x, [(d + b) / (a - c), (d - b) / (a + c), x + 1, x - 1, (d + b) / (a + c), x + 3]),
        explanation: `Bilinmeyenler bir tarafta toplanır: ${a}x − ${c}x = ${d} − ${b}, yani ${a - c}x = ${d - b}. Buradan x = ${d - b} ÷ ${a - c} = ${x}.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

/* ---------------------------------------------------------------- */
/* Denklemler: parantezli denklem                                    */
/* ---------------------------------------------------------------- */

function genParen() {
  run(
    37,
    (i) => {
      const a = 2 + Math.floor(rnd() * 7);
      const b = 2 + Math.floor(rnd() * 12);
      const x = 3 + Math.floor(rnd() * 12);
      const c = a * (x + b);
      const prompt =
        i % 2 === 0
          ? `${a}(x + ${b}) = ${c} denklemini sağlayan x değeri kaçtır?`
          : `${c} = ${a}(x + ${b}) eşitliğinde x kaçtır?`;
      return {
        id: `bulk-om-par-${i + 1}`,
        prompt,
        answer: String(x),
        distractors: nums(x, [(c - b) / a, c / a, x + 1, x - 1, c / a + b, (c + b) / a]),
        explanation: `İki taraf ${a} sayısına bölünürse x + ${b} = ${c} ÷ ${a} = ${x + b} bulunur. Böylece x = ${x + b} − ${b} = ${x}.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

/* ---------------------------------------------------------------- */
/* Denklemler: negatif sayı işlemi                                   */
/* ---------------------------------------------------------------- */

function genNeg() {
  run(
    38,
    (i) => {
      const a = 3 + Math.floor(rnd() * 15);
      const b = 2 + Math.floor(rnd() * 13);
      const mode = i % 5;
      if (mode === 0) {
        const answer = b - a;
        if (answer === 0) return null;
        return {
          id: `bulk-om-neg-${i + 1}`,
          prompt: `(−${a}) + ${b} işleminin sonucu kaçtır?`,
          answer: signed(answer),
          distractors: texts(signed(answer), [signed(-answer), signed(-(a + b)), signed(a + b), signed(answer + 1)]),
          explanation: `Zıt işaretli iki sayı toplanırken büyük olandan küçük çıkarılır: ${b} − ${a} = ${signed(answer)}. Sonuç büyük sayının işaretini alır: ${signed(answer)}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const answer = b - a;
        if (answer === 0) return null;
        return {
          id: `bulk-om-neg-${i + 1}`,
          prompt: `(−${a}) − (−${b}) işleminin sonucu kaçtır?`,
          answer: signed(answer),
          distractors: texts(signed(answer), [signed(-(a + b)), signed(a + b), signed(answer - 1), signed(-answer)]),
          explanation: `Çıkarma, ikinci sayının tersini eklemektir: (−${a}) − (−${b}) = (−${a}) + ${b} = ${signed(answer)}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 2) {
        const answer = -a * b;
        return {
          id: `bulk-om-neg-${i + 1}`,
          prompt: `(−${a}) × ${b} çarpımının sonucu kaçtır?`,
          answer: signed(answer),
          distractors: texts(signed(answer), [signed(-answer), signed(a + b), signed(-(a + b)), signed(answer - b)]),
          explanation: `Ters işaretli iki sayının çarpımı negatiftir: ${a} × ${b} = ${a * b}, işaret eksi olduğu için sonuç ${signed(answer)}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 3) {
        const answer = a * b;
        return {
          id: `bulk-om-neg-${i + 1}`,
          prompt: `(−${a}) × (−${b}) çarpımının sonucu kaçtır?`,
          answer: signed(answer),
          distractors: texts(signed(answer), [signed(-answer), signed(a + b), signed(-(a + b)), signed(answer + a)]),
          explanation: `Aynı işaretli iki sayının çarpımı pozitiftir: ${a} × ${b} = ${answer}, işaret artı olur.`,
          difficulty: difficultyAt(i),
        };
      }
      const answer = -a;
      return {
        id: `bulk-om-neg-${i + 1}`,
        prompt: `(−${a * b}) ÷ ${b} bölümünün sonucu kaçtır?`,
        answer: signed(answer),
        distractors: texts(signed(answer), [signed(-answer), signed(-(a * b)), signed(a * b), signed(answer - 1)]),
        explanation: `Bölmede önce mutlak değerler bölünür: ${a * b} ÷ ${b} = ${a}. İşaretler farklı olduğu için sonuç ${signed(answer)} olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

/* ---------------------------------------------------------------- */
/* Denklemler: kesirli katsayılı denklem                             */
/* ---------------------------------------------------------------- */

function genEqFraction() {
  run(
    40,
    (i) => {
      if (i % 2 === 0) {
        const a = 2 + Math.floor(rnd() * 5);
        const q = 2 + Math.floor(rnd() * 11);
        const x = a * q;
        const b = 2 + Math.floor(rnd() * 14);
        const c = q + b;
        return {
          id: `bulk-om-eqf-${i + 1}`,
          prompt: `x/${a} + ${b} = ${c} eşitliğinde x kaçtır?`,
          answer: String(x),
          distractors: nums(x, [c - b, (c + b) * a, x + a, x - a, c - b + a, c * a]),
          explanation: `Önce ${b} karşı tarafa geçer: x ÷ ${a} = ${c} − ${b} = ${q}. Sonra her iki taraf ${a} ile çarpılır: x = ${q} × ${a} = ${x}.`,
          difficulty: difficultyAt(i),
        };
      }
      const b = 2 + Math.floor(rnd() * 5);
      const k = 2 + Math.floor(rnd() * 9);
      const x = b * k;
      const a = 2 + Math.floor(rnd() * 4);
      const c = a * k;
      return {
        id: `bulk-om-eqf-${i + 1}`,
        prompt: `${a}x/${b} = ${c} eşitliğini sağlayan x değeri kaçtır?`,
        answer: String(x),
        distractors: nums(x, [c / a, c * b, x + b, x - b, c + b, c * a]),
        explanation: `İçler dışlar çarpımı yapılır: ${a}x = ${c} × ${b} = ${c * b}. Böylece x = ${c * b} ÷ ${a} = ${x}.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_EQ,
  );
}

/* ---------------------------------------------------------------- */
/* Ondalık ve Kesirler: kesir toplama çıkarma                        */
/* ---------------------------------------------------------------- */

function genFracAddSub() {
  run(
    40,
    (i) => {
      const mode = i % 4;
      let n1 = 1;
      let d1 = 2;
      let n2 = 1;
      let d2 = 3;
      let sign = 1;
      if (mode === 0) {
        d1 = 5 + Math.floor(rnd() * 7);
        n1 = 1 + Math.floor(rnd() * (d1 - 1));
        n2 = 1 + Math.floor(rnd() * (d1 - 1));
        d2 = d1;
      } else if (mode === 1) {
        d1 = 6 + Math.floor(rnd() * 6);
        n1 = 3 + Math.floor(rnd() * (d1 - 3));
        n2 = 1 + Math.floor(rnd() * (n1 - 1));
        d2 = d1;
        sign = -1;
      } else if (mode === 2) {
        d1 = 2 + Math.floor(rnd() * 4);
        d2 = d1 * 2;
        n1 = 1 + Math.floor(rnd() * (d1 - 1));
        n2 = 1 + Math.floor(rnd() * (d2 - 1));
      } else {
        d1 = pick([3, 4, 5, 7]);
        d2 = pick([4, 5, 8, 9].filter((value) => value % d1 !== 0 && d1 % value !== 0));
        n1 = 1 + Math.floor(rnd() * (d1 - 1));
        n2 = 1 + Math.floor(rnd() * (d2 - 1));
      }
      const num = n1 * d2 + sign * n2 * d1;
      const den = d1 * d2;
      if (num <= 0) return null;
      const op = sign > 0 ? '+' : '−';
      const prompt =
        i % 2 === 0
          ? `${n1}/${d1} ${op} ${n2}/${d2} işleminin sonucu kaçtır?`
          : `${n1}/${d1} kesri ile ${n2}/${d2} kesrine ${op} işlemi uygulanırsa sonuç ne olur?`;
      return {
        id: `bulk-om-fa-${i + 1}`,
        prompt,
        answer: frac(num, den),
        distractors: fracDistractors(num, den, [
          [n1 + sign * n2, d1 + d2],
          [n1 * n2, den],
          [num + den, den],
        ]),
        explanation:
          d1 === d2
            ? `Paydalar eşit olduğu için yalnızca paylar işleme girer: ${n1} ${op} ${n2} = ${n1 + sign * n2}, payda ${d1} olarak kalır. ${n1 + sign * n2}/${d1} sadeleştirilince ${frac(num, den)} bulunur.`
            : `Paydalar ${d1} ve ${d2} olduğu için ortak payda ${den} alınır: ${n1}/${d1} = ${n1 * d2}/${den}, ${n2}/${d2} = ${n2 * d1}/${den}. ${num}/${den} sadeleştirilince ${frac(num, den)} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FRAC,
  );
}

/* ---------------------------------------------------------------- */
/* Ondalık ve Kesirler: kesir ondalık dönüşümü                       */
/* ---------------------------------------------------------------- */

const DECIMAL_TABLE: Array<[number, number, string]> = [
  [1, 2, '0,5'],
  [1, 4, '0,25'],
  [3, 4, '0,75'],
  [1, 5, '0,2'],
  [2, 5, '0,4'],
  [3, 5, '0,6'],
  [4, 5, '0,8'],
  [1, 8, '0,125'],
  [3, 8, '0,375'],
  [5, 8, '0,625'],
  [7, 8, '0,875'],
  [1, 10, '0,1'],
  [3, 10, '0,3'],
  [7, 10, '0,7'],
  [9, 10, '0,9'],
  [1, 20, '0,05'],
  [3, 20, '0,15'],
  [7, 20, '0,35'],
  [9, 20, '0,45'],
  [11, 20, '0,55'],
  [13, 20, '0,65'],
  [17, 20, '0,85'],
  [19, 20, '0,95'],
  [1, 25, '0,04'],
  [2, 25, '0,08'],
  [3, 25, '0,12'],
  [4, 25, '0,16'],
  [6, 25, '0,24'],
  [1, 50, '0,02'],
  [7, 50, '0,14'],
];

function genFracDecimal() {
  run(
    40,
    (i) => {
      const [num, den, text] = DECIMAL_TABLE[(i * 7 + Math.floor(rnd() * 5)) % DECIMAL_TABLE.length];
      const value = num / den;
      if (i % 3 === 0) {
        const thousand = Math.round(value * 1000);
        const g = gcd(thousand, 1000);
        return {
          id: `bulk-om-fd-${i + 1}`,
          prompt: `${text} ondalık sayısının en sade kesir gösterimi hangisidir?`,
          answer: `${num}/${den}`,
          distractors: texts(`${num}/${den}`, [
            `${num}/${den * 10}`,
            `${den}/${num}`,
            `${num + 1}/${den}`,
            `${num * 10}/${den}`,
          ]),
          explanation: `${text} sayısı ${thousand}/1000 kesrine eşittir. Pay ve payda ${g} ile sadeleştirilince ${num}/${den} elde edilir.`,
          difficulty: difficultyAt(i),
        };
      }
      if (i % 3 === 1) {
        const candidates = [
          Number(`${num}${den}`) / 100,
          value * 10,
          value / 10,
          (num + 1) / den,
        ].map(fmt);
        return {
          id: `bulk-om-fd-${i + 1}`,
          prompt: `${num}/${den} kesrinin ondalık gösterimi hangisidir?`,
          answer: text,
          distractors: texts(text, candidates),
          explanation: `Pay, paydaya bölünür: ${num} ÷ ${den} = ${text}. Bu yüzden kesrin ondalık gösterimi ${text} olur.`,
          difficulty: difficultyAt(i),
        };
      }
      const whole = 1 + Math.floor(rnd() * 4);
      const total = whole * den + num;
      const decimalText = `${whole},${text.split(',')[1]}`;
      return {
        id: `bulk-om-fd-${i + 1}`,
        prompt: `${decimalText} ondalık sayısının bileşik kesir gösterimi hangisidir?`,
        answer: `${total}/${den}`,
        distractors: texts(`${total}/${den}`, [
          `${whole * den + num}/${den + 1}`,
          `${whole}/${den}`,
          `${total + den}/${den}`,
          `${whole * 10 + num}/${den * 10}`,
        ]),
        explanation: `Tam kısım ${whole}, kesir kısmı ${num}/${den} olduğu için ${whole} × ${den} + ${num} = ${total} payı verir: ${total}/${den}.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FRAC,
  );
}

/* ---------------------------------------------------------------- */
/* Ondalık ve Kesirler: ondalık işlem                                */
/* ---------------------------------------------------------------- */

function genDecimalOp() {
  run(
    40,
    (i) => {
      const mode = i % 4;
      if (mode === 0) {
        const a = 50 + Math.floor(rnd() * 450);
        const b = 25 + Math.floor(rnd() * 475);
        const sum = a + b;
        return {
          id: `bulk-om-dec-${i + 1}`,
          prompt: `${fmt(a / 100)} + ${fmt(b / 100)} işleminin sonucu kaçtır?`,
          answer: fmt(sum / 100),
          distractors: texts(fmt(sum / 100), [
            fmt((sum + 10) / 100),
            fmt((sum - 10) / 100),
            fmt((sum * 10) / 100),
            fmt((a * b) / 10000),
          ]),
          explanation: `Ondalık kısımlar aynı basamağa getirilir: ${fmt(a / 100)} + ${fmt(b / 100)} = ${fmt(sum / 100)}. Virgüller alt alta gelmediğinde basamak kayması olur.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const a = 200 + Math.floor(rnd() * 700);
        const b = 25 + Math.floor(rnd() * 150);
        const diff = a - b;
        return {
          id: `bulk-om-dec-${i + 1}`,
          prompt: `${fmt(a / 100)} − ${fmt(b / 100)} işleminin sonucu kaçtır?`,
          answer: fmt(diff / 100),
          distractors: texts(fmt(diff / 100), [
            fmt((diff + 10) / 100),
            fmt((diff - 10) / 100),
            fmt((a + b) / 100),
            fmt((diff * 10) / 100),
          ]),
          explanation: `Eksilen ${fmt(a / 100)}, çıkan ${fmt(b / 100)} olarak aynı basamağa yazılır. ${a} − ${b} = ${diff} yüzdelik, yani sonuç ${fmt(diff / 100)}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 2) {
        const t = 15 + Math.floor(rnd() * 85);
        const m = 2 + Math.floor(rnd() * 8);
        const product = (t * m) / 10;
        return {
          id: `bulk-om-dec-${i + 1}`,
          prompt: `${fmt(t / 10)} × ${m} çarpımının sonucu kaçtır?`,
          answer: fmt(product),
          distractors: texts(fmt(product), [
            fmt(product * 10),
            fmt(product / 10),
            fmt(t / 10 + m),
            fmt(product + 1),
          ]),
          explanation: `${fmt(t / 10)} sayısı ${t}/10 biçiminde yazılır. ${t} × ${m} = ${t * m}, payda 10 olduğu için sonuç ${fmt(product)} olur.`,
          difficulty: difficultyAt(i),
        };
      }
      const m = 2 + Math.floor(rnd() * 5);
      const q = 11 + Math.floor(rnd() * 40);
      const dividend = m * q;
      return {
        id: `bulk-om-dec-${i + 1}`,
        prompt: `${fmt(dividend / 10)} ÷ ${m} bölümünün sonucu kaçtır?`,
        answer: fmt(q / 10),
        distractors: texts(fmt(q / 10), [
          fmt((q * 10) / 10),
          fmt(q / 100),
          fmt(q / 10 + 1),
          fmt(q / 10 + 0.1),
        ]),
        explanation: `${fmt(dividend / 10)} sayısı ${dividend}/10 demektir. ${dividend} ÷ ${m} = ${q} olduğundan sonuç ${q}/10 = ${fmt(q / 10)} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FRAC,
  );
}

/* ---------------------------------------------------------------- */
/* Ondalık ve Kesirler: yüzde                                        */
/* ---------------------------------------------------------------- */

function genPercent() {
  run(
    38,
    (i) => {
      const p = pick([10, 20, 25, 40, 50, 60, 75, 80]);
      const mode = i % 4;
      if (mode === 0) {
        const base = 20 * (2 + Math.floor(rnd() * 18));
        const part = (base * p) / 100;
        if (!Number.isInteger(part)) return null;
        return {
          id: `bulk-om-pct-${i + 1}`,
          prompt: `${base} sayısının %${p}’i kaçtır?`,
          answer: String(part),
          distractors: nums(part, [base * p, base - part, part + base / 10, part + 10, base + p]),
          explanation: `Yüzde hesabında ${base} × ${p} ÷ 100 işlemi yapılır: ${base} × ${p} = ${base * p}, ${base * p} ÷ 100 = ${part}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const base = 20 * (2 + Math.floor(rnd() * 18));
        const part = (base * p) / 100;
        if (!Number.isInteger(part)) return null;
        return {
          id: `bulk-om-pct-${i + 1}`,
          prompt: `%${p}’i ${part} olan sayı kaçtır?`,
          answer: String(base),
          distractors: nums(base, [part * 100, base + part, part, base - part, part * 2]),
          explanation: `Sayıya x dersek x × ${p} ÷ 100 = ${part} olur. Buradan x = ${part} × 100 ÷ ${p} = ${base}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 2) {
        const base = 20 * (2 + Math.floor(rnd() * 15));
        const part = (base * p) / 100;
        if (!Number.isInteger(part)) return null;
        return {
          id: `bulk-om-pct-${i + 1}`,
          prompt: `${part} sayısı ${base} sayısının yüzde kaçıdır?`,
          answer: String(p),
          distractors: nums(p, [100 - p, p + 10, p - 5, p * 2, base - part, Math.round(p / 2)]),
          explanation: `Oran ${part} ÷ ${base} = ${fmt(part / base)} bulunur. Yüzdeye çevirmek için 100 ile çarpılır: ${fmt(part / base)} × 100 = ${p}.`,
          difficulty: difficultyAt(i),
        };
      }
      const base = 20 * (4 + Math.floor(rnd() * 16));
      const cut = (base * p) / 100;
      if (!Number.isInteger(cut)) return null;
      const last = base - cut;
      return {
        id: `bulk-om-pct-${i + 1}`,
        prompt: `${base} TL’lik bir ürüne %${p} indirim yapılırsa yeni fiyat kaç TL olur?`,
        answer: String(last),
        distractors: nums(last, [cut, base + cut, base - p, last + 10, base * p]),
        explanation: `İndirim tutarı ${base} × ${p} ÷ 100 = ${cut} TL’dir. Yeni fiyat ${base} − ${cut} = ${last} TL olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FRAC,
  );
}

/* ---------------------------------------------------------------- */
/* Ondalık ve Kesirler: oran orantı                                  */
/* ---------------------------------------------------------------- */

function genRatio() {
  run(
    40,
    (i) => {
      const mode = i % 4;
      if (mode === 0) {
        const a = 2 + Math.floor(rnd() * 4);
        const b = a + 1 + Math.floor(rnd() * 3);
        const k = 3 + Math.floor(rnd() * 9);
        const total = (a + b) * k;
        return {
          id: `bulk-om-rat-${i + 1}`,
          prompt: `Bir sınıfta kız sayısının erkek sayısına oranı ${a} : ${b}’dir. Sınıf mevcudu ${total} ise kız sayısı kaçtır?`,
          answer: String(a * k),
          distractors: nums(a * k, [b * k, total - a, k, a * k + k, total / a]),
          explanation: `Oran ${a} : ${b} olduğu için toplam ${a + b} parçadır. Bir parça ${total} ÷ ${a + b} = ${k} öğrenci, kız sayısı ${a} × ${k} = ${a * k} olur.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const a = 2 + Math.floor(rnd() * 3);
        const b = a + 1 + Math.floor(rnd() * 2);
        const k = 2 + Math.floor(rnd() * 6);
        const un = a * k;
        return {
          id: `bulk-om-rat-${i + 1}`,
          prompt: `Bir tarifte un ve şeker miktarları ${a} : ${b} oranındadır. ${un} bardak un kullanılırsa kaç bardak şeker gerekir?`,
          answer: String(b * k),
          distractors: nums(b * k, [a * k, b * k + a, k, un + b, b * a]),
          explanation: `Oranda ${a} birim una ${b} birim şeker düşer. ${un} ÷ ${a} = ${k} kat alındığı için şeker ${b} × ${k} = ${b * k} bardak olur.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 2) {
        const a = 3 + Math.floor(rnd() * 5);
        const b = a + 2 + Math.floor(rnd() * 5);
        const price = a * (4 + Math.floor(rnd() * 8));
        const answer = (price * b) / a;
        return {
          id: `bulk-om-rat-${i + 1}`,
          prompt: `${a} kalem ${price} TL ise ${b} kalem kaç TL’dir?`,
          answer: String(answer),
          distractors: nums(answer, [price + b, (price * a) / b, price * b, answer + price, price - b]),
          explanation: `Bir kalemin fiyatı ${price} ÷ ${a} = ${price / a} TL’dir. ${b} kalem için ${price / a} × ${b} = ${answer} TL ödenir.`,
          difficulty: difficultyAt(i),
        };
      }
      const workers = 2 + Math.floor(rnd() * 4);
      const more = workers + 1 + Math.floor(rnd() * 4);
      const days = more * (2 + Math.floor(rnd() * 4));
      if ((workers * days) % more !== 0) return null;
      const answer = (workers * days) / more;
      return {
        id: `bulk-om-rat-${i + 1}`,
        prompt: `${workers} işçi bir işi ${days} günde bitiriyor. Aynı işi ${more} işçi kaç günde bitirir?`,
        answer: String(answer),
        distractors: nums(answer, [days, (days * more) / workers, days + workers, days - more, more * workers]),
        explanation: `İşçi sayısı arttıkça süre azalır, yani ters orantı vardır. ${workers} × ${days} = ${workers * days} iş günü, ${workers * days} ÷ ${more} = ${answer} gün bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FRAC,
  );
}

/* ---------------------------------------------------------------- */
/* Ondalık ve Kesirler: kesir çarpma bölme                           */
/* ---------------------------------------------------------------- */

function genFracMulDiv() {
  run(
    35,
    (i) => {
      const mode = i % 3;
      if (mode === 0) {
        const n1 = 1 + Math.floor(rnd() * 5);
        const d1 = n1 + 1 + Math.floor(rnd() * 5);
        const n2 = 1 + Math.floor(rnd() * 5);
        const d2 = n2 + 1 + Math.floor(rnd() * 5);
        const num = n1 * n2;
        const den = d1 * d2;
        return {
          id: `bulk-om-fmd-${i + 1}`,
          prompt: `${n1}/${d1} × ${n2}/${d2} çarpımının sonucu kaçtır?`,
          answer: frac(num, den),
          distractors: fracDistractors(num, den, [
            [n1 + n2, d1 + d2],
            [den, num],
            [num + 1, den],
          ]),
          explanation: `Kesirlerde çarpma paylar ve paydalar ayrı çarpılarak yapılır: ${n1} × ${n2} = ${num}, ${d1} × ${d2} = ${den}. Sonuç ${num}/${den} = ${frac(num, den)}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const n1 = 1 + Math.floor(rnd() * 4);
        const d1 = n1 + 1 + Math.floor(rnd() * 4);
        const n2 = 1 + Math.floor(rnd() * 3);
        const d2 = n2 + 2 + Math.floor(rnd() * 4);
        const num = n1 * d2;
        const den = d1 * n2;
        return {
          id: `bulk-om-fmd-${i + 1}`,
          prompt: `${n1}/${d1} ÷ ${n2}/${d2} bölme işleminin sonucu kaçtır?`,
          answer: frac(num, den),
          distractors: fracDistractors(num, den, [
            [n1 * n2, d1 * d2],
            [den, num],
            [num, den + 1],
          ]),
          explanation: `Bölmede ikinci kesir ters çevrilip çarpılır: ${n1}/${d1} × ${d2}/${n2} = ${num}/${den} = ${frac(num, den)}.`,
          difficulty: difficultyAt(i),
        };
      }
      const n = 1 + Math.floor(rnd() * 3);
      const d = n + 2 + Math.floor(rnd() * 5);
      const k = 2 + Math.floor(rnd() * 8);
      const num = n * k;
      return {
        id: `bulk-om-fmd-${i + 1}`,
        prompt: `${n}/${d} kesri ${k} sayısı ile çarpılırsa sonuç kaç olur?`,
        answer: frac(num, d),
        distractors: fracDistractors(num, d, [
          [n, d * k],
          [n + k, d],
          [num + d, d],
        ]),
        explanation: `Tam sayı pay ile çarpılır: ${n} × ${k} = ${num}, payda ${d} değişmez. ${num}/${d} sadeleştirilince ${frac(num, d)} bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_FRAC,
  );
}

/* ---------------------------------------------------------------- */
/* Üçgenler: iç açı toplamı                                          */
/* ---------------------------------------------------------------- */

function genAngleSum() {
  run(
    40,
    (i) => {
      const mode = i % 4;
      if (mode === 0) {
        const a = 25 + Math.floor(rnd() * 55);
        const b = 20 + Math.floor(rnd() * 60);
        if (a + b >= 160) return null;
        const answer = 180 - a - b;
        return {
          id: `bulk-om-tri-${i + 1}`,
          prompt: `Bir üçgenin iki iç açısı ${a}° ve ${b}° ise üçüncü iç açısı kaç derecedir?`,
          answer: String(answer),
          distractors: nums(answer, [360 - a - b, a + b, 180 - a + b, answer + 10, answer - 10]),
          explanation: `Üçgenin iç açıları toplamı 180°’dir. ${a} + ${b} = ${a + b}, üçüncü açı 180 − ${a + b} = ${answer} derece olur.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const a = 30 + Math.floor(rnd() * 50);
        const b = 25 + Math.floor(rnd() * 50);
        if (a + b >= 155) return null;
        const answer = 180 - a - b;
        return {
          id: `bulk-om-tri-${i + 1}`,
          prompt: `Açılarından ikisi ${a}° ve ${b}° olan bir üçgende üçüncü açının ölçüsü kaç derecedir?`,
          answer: String(answer),
          distractors: nums(answer, [360 - a - b, a + b, 180 + a - b, answer + 5, answer - 5]),
          explanation: `İç açılar toplamı 180° olduğundan eksik açı 180° − (${a}° + ${b}°) = 180° − ${a + b}° = ${answer}° bulunur.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 2) {
        const a = 15 + Math.floor(rnd() * 65);
        if (a >= 85) return null;
        const answer = 90 - a;
        return {
          id: `bulk-om-tri-${i + 1}`,
          prompt: `Bir dik üçgende dar açılardan biri ${a}° ise diğer dar açı kaç derecedir?`,
          answer: String(answer),
          distractors: nums(answer, [180 - a, 360 - 90 - a, a, answer + 10, 90 + a]),
          explanation: `Dik üçgende açılar ${a}°, 90° ve diğer dar açıdır. ${a} + 90 = ${a + 90}, kalan açı 180 − ${a + 90} = ${answer} derecedir.`,
          difficulty: difficultyAt(i),
        };
      }
      const t = 2 * (20 + Math.floor(rnd() * 60));
      if (t >= 160) return null;
      const answer = (180 - t) / 2;
      return {
        id: `bulk-om-tri-${i + 1}`,
        prompt: `Tepe açısı ${t}° olan bir ikizkenar üçgende taban açılarından birinin ölçüsü kaç derecedir?`,
        answer: String(answer),
        distractors: nums(answer, [180 - t, t / 2, 180 - 2 * t, answer + 10, answer - 10]),
        explanation: `İkizkenar üçgende taban açıları eşittir. 180 − ${t} = ${180 - t}, bu değer ikiye bölünür: ${180 - t} ÷ 2 = ${answer}.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_TRI,
  );
}

/* ---------------------------------------------------------------- */
/* Üçgenler: üçgen eşitsizliği                                       */
/* ---------------------------------------------------------------- */

function genInequality() {
  run(
    38,
    (i) => {
      const a = 3 + Math.floor(rnd() * 9);
      const b = a + 2 + Math.floor(rnd() * 10);
      const max = a + b - 1;
      const min = b - a + 1;
      if (i % 2 === 0) {
        return {
          id: `bulk-om-ineq-${i + 1}`,
          prompt: `Kenar uzunlukları ${a} cm ve ${b} cm olan bir üçgende üçüncü kenar tam sayı olarak en fazla kaç santimetre olabilir?`,
          answer: String(max),
          distractors: nums(max, [a + b, b - a, max + 1, min, a + b + 1]),
          explanation: `Üçgen eşitsizliğine göre üçüncü kenar iki kenarın farkından büyük, toplamından küçüktür: ${b - a} < x < ${a + b}. Tam sayı olarak en büyük değer ${a + b} − 1 = ${max} olur.`,
          difficulty: difficultyAt(i),
        };
      }
      return {
        id: `bulk-om-ineq-${i + 1}`,
        prompt: `İki kenarı ${a} cm ve ${b} cm olan üçgende üçüncü kenar tam sayı olarak en az kaç santimetre olabilir?`,
        answer: String(min),
        distractors: nums(min, [b - a, a + b, min - 1, a + b - 1, a]),
        explanation: `Üçüncü kenar ${b} − ${a} = ${b - a} değerinden büyük olmalıdır. Tam sayı olarak en küçük değer ${b - a} + 1 = ${min} olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_TRI,
  );
}

/* ---------------------------------------------------------------- */
/* Üçgenler: Pisagor                                                 */
/* ---------------------------------------------------------------- */

const TRIPLES: Array<[number, number, number]> = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
  [7, 24, 25],
  [12, 16, 20],
  [10, 24, 26],
  [20, 21, 29],
  [15, 20, 25],
  [9, 40, 41],
  [12, 35, 37],
  [16, 30, 34],
  [18, 24, 30],
  [24, 32, 40],
];

function genPythagoras() {
  run(
    40,
    (i) => {
      const [a, b, c] = TRIPLES[i % TRIPLES.length];
      const variant = i % 20 >= 15 ? 1 : 0;
      if (i < 20) {
        const prompt =
          variant === 0
            ? `Dik kenar uzunlukları ${a} cm ve ${b} cm olan dik üçgende hipotenüs kaç santimetredir?`
            : `Bir dik üçgenin dik kenarları ${a} cm ile ${b} cm’dir. Bu üçgenin hipotenüsü kaç santimetredir?`;
        return {
          id: `bulk-om-pyth-${i + 1}`,
          prompt,
          answer: String(c),
          distractors: nums(c, [a + b, c + 1, c - 1, Math.abs(b - a), a + b - 1]),
          explanation: `Pisagor bağıntısı: ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}. Karekök alınınca hipotenüs ${c} cm bulunur.`,
          difficulty: difficultyAt(i),
        };
      }
      const prompt =
        variant === 0
          ? `Hipotenüsü ${c} cm, bir dik kenarı ${a} cm olan dik üçgende diğer dik kenar kaç santimetredir?`
          : `Bir dik üçgende hipotenüs ${c} cm, dik kenarlardan biri ${a} cm ise diğer dik kenar kaç santimetredir?`;
      return {
        id: `bulk-om-pyth-${i + 1}`,
        prompt,
        answer: String(b),
        distractors: nums(b, [a + c, c - a, b + 1, c + a, b - 1]),
        explanation: `Pisagor bağıntısında dik kenar çıkarılarak bulunur: ${c}² − ${a}² = ${c * c} − ${a * a} = ${c * c - a * a}. Karekök alınınca ${b} cm elde edilir.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_TRI,
  );
}

/* ---------------------------------------------------------------- */
/* Üçgenler: alan                                                    */
/* ---------------------------------------------------------------- */

function genArea() {
  run(
    40,
    (i) => {
      const mode = i % 3;
      if (mode === 0) {
        const base = 4 + Math.floor(rnd() * 17);
        const height = 2 * (2 + Math.floor(rnd() * 9));
        const answer = (base * height) / 2;
        return {
          id: `bulk-om-area-${i + 1}`,
          prompt: `Tabanı ${base} cm, yüksekliği ${height} cm olan üçgenin alanı kaç santimetrekaredir?`,
          answer: String(answer),
          distractors: nums(answer, [base * height, base + height, answer + base, answer - height, base * height + 2]),
          explanation: `Üçgenin alanı taban ile yüksekliğin çarpımının yarısıdır: ${base} × ${height} = ${base * height}, ${base * height} ÷ 2 = ${answer}.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const base = 4 + Math.floor(rnd() * 12);
        const height = 2 * (2 + Math.floor(rnd() * 8));
        const area = (base * height) / 2;
        return {
          id: `bulk-om-area-${i + 1}`,
          prompt: `Alanı ${area} santimetrekare, tabanı ${base} cm olan üçgenin yüksekliği kaç santimetredir?`,
          answer: String(height),
          distractors: nums(height, [area / base, area * 2, height * 2, height + base, area - base]),
          explanation: `Alan = taban × yükseklik ÷ 2 olduğundan yükseklik = 2 × alan ÷ taban. 2 × ${area} = ${area * 2}, ${area * 2} ÷ ${base} = ${height}.`,
          difficulty: difficultyAt(i),
        };
      }
      const a = 3 + Math.floor(rnd() * 9);
      const b = 2 * (2 + Math.floor(rnd() * 7));
      const answer = (a * b) / 2;
      return {
        id: `bulk-om-area-${i + 1}`,
        prompt: `Dik kenar uzunlukları ${a} cm ve ${b} cm olan dik üçgenin alanı kaç santimetrekaredir?`,
        answer: String(answer),
        distractors: nums(answer, [a * b, a + b, answer + a, answer - 1, a * b * 2]),
        explanation: `Dik kenarlar taban ve yükseklik görevi görür: ${a} × ${b} = ${a * b}, alan ${a * b} ÷ 2 = ${answer} santimetrekaredir.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_TRI,
  );
}

/* ---------------------------------------------------------------- */
/* Üçgenler: çevre                                                   */
/* ---------------------------------------------------------------- */

function genPerimeter() {
  run(
    38,
    (i) => {
      const mode = i % 3;
      if (mode === 0) {
        const a = 5 + Math.floor(rnd() * 12);
        const b = 6 + Math.floor(rnd() * 13);
        const c = 4 + Math.floor(rnd() * 15);
        if (a + b <= c || a + c <= b || b + c <= a) return null;
        const answer = a + b + c;
        return {
          id: `bulk-om-per-${i + 1}`,
          prompt: `Kenar uzunlukları ${a} cm, ${b} cm ve ${c} cm olan üçgenin çevresi kaç santimetredir?`,
          answer: String(answer),
          distractors: nums(answer, [a * b, a + b, answer + 1, answer - 1, b + c]),
          explanation: `Çevre üç kenarın toplamıdır: ${a} + ${b} + ${c} = ${answer} cm.`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const a = 5 + Math.floor(rnd() * 10);
        const b = 2 + Math.floor(rnd() * 12);
        const answer = 2 * a + b;
        return {
          id: `bulk-om-per-${i + 1}`,
          prompt: `Bir ikizkenar üçgende eşit kenarlar ${a} cm, taban ${b} cm ise çevresi kaç santimetredir?`,
          answer: String(answer),
          distractors: nums(answer, [a + 2 * b, a * b, 3 * a, answer + 1, a + b]),
          explanation: `İki eşit kenar ${a} cm olduğu için çevre ${a} + ${a} + ${b} = ${answer} cm bulunur.`,
          difficulty: difficultyAt(i),
        };
      }
      const a = 3 + Math.floor(rnd() * 15);
      const answer = 3 * a;
      return {
        id: `bulk-om-per-${i + 1}`,
        prompt: `Bir kenarı ${a} cm olan eşkenar üçgenin çevresi kaç santimetredir?`,
        answer: String(answer),
        distractors: nums(answer, [a + 3, a * a, answer + a, answer - a, 2 * a]),
        explanation: `Eşkenar üçgende üç kenar eşittir: ${a} × 3 = ${answer} cm.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_TRI,
  );
}

/* ---------------------------------------------------------------- */
/* Üçgenler: açı çeşitleri                                           */
/* ---------------------------------------------------------------- */

const ANGLE_TYPES = ['Dar açı', 'Dik açı', 'Geniş açı', 'Doğru açı'];

function angleType(degree: number): string {
  if (degree < 90) return 'Dar açı';
  if (degree === 90) return 'Dik açı';
  if (degree < 180) return 'Geniş açı';
  return 'Doğru açı';
}

function angleRule(degree: number): string {
  if (degree < 90) return `${degree}° 90°’den küçük olduğu için dar açıdır.`;
  if (degree === 90) return `${degree}° tam 90° olduğu için dik açıdır.`;
  if (degree < 180) return `${degree}° 90°’den büyük, 180°’den küçük olduğu için geniş açıdır.`;
  return `${degree}° tam 180° olduğu için doğru açıdır.`;
}

function genAngleTypes() {
  run(
    38,
    (i) => {
      const mode = i % 4;
      if (mode === 0) {
        const d = 10 + Math.floor(rnd() * 170);
        const answer = angleType(d);
        return {
          id: `bulk-om-atype-${i + 1}`,
          prompt: `Ölçüsü ${d}° olan bir açı hangi açı türüne girer?`,
          answer,
          distractors: ANGLE_TYPES.filter((value) => value !== answer),
          explanation: `Açı türü 90° ve 180° sınırlarına göre belirlenir. ${angleRule(d)}`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 1) {
        const a = 20 + Math.floor(rnd() * 50);
        const b = 15 + Math.floor(rnd() * 45);
        if (a + b >= 175) return null;
        const third = 180 - a - b;
        const answer = angleType(third);
        return {
          id: `bulk-om-atype-${i + 1}`,
          prompt: `Bir üçgenin iki açısı ${a}° ve ${b}° ise üçüncü açı hangi açı türüdür?`,
          answer,
          distractors: ANGLE_TYPES.filter((value) => value !== answer),
          explanation: `Üçüncü açı 180 − ${a} − ${b} = ${third} derecedir. ${angleRule(third)}`,
          difficulty: difficultyAt(i),
        };
      }
      if (mode === 2) {
        const d = 10 + Math.floor(rnd() * 75);
        const answer = 90 - d;
        return {
          id: `bulk-om-atype-${i + 1}`,
          prompt: `Ölçüsü ${d}° olan açının tümleri kaç derecedir?`,
          answer: String(answer),
          distractors: nums(answer, [180 - d, 90 + d, answer + 10, d, 180 - 2 * d]),
          explanation: `Tümler açıların toplamı 90°’dir. Bu yüzden tümleyen açı 90 − ${d} = ${answer} derecedir.`,
          difficulty: difficultyAt(i),
        };
      }
      const d = 30 + Math.floor(rnd() * 120);
      const answer = 180 - d;
      return {
        id: `bulk-om-atype-${i + 1}`,
        prompt: `Ölçüsü ${d}° olan açının bütünleri kaç derecedir?`,
        answer: String(answer),
        distractors: nums(answer, [90 - d, 180 + d, 360 - d, d, answer + 10]),
        explanation: `Bütünler açıların toplamı 180°’dir. Bütünleyen açı 180 − ${d} = ${answer} derece olur.`,
        difficulty: difficultyAt(i),
      };
    },
    TOPIC_TRI,
  );
}

/* ---------------------------------------------------------------- */
/* Üretim                                                            */
/* ---------------------------------------------------------------- */

genLinear();
genEqWord();
genBothSides();
genParen();
genNeg();
genEqFraction();

genFracAddSub();
genFracDecimal();
genDecimalOp();
genPercent();
genRatio();
genFracMulDiv();

genAngleSum();
genInequality();
genPythagoras();
genArea();
genPerimeter();
genAngleTypes();

export { questions };

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'Ortaokul::Matematik': {
    Denklemler: topicIds[TOPIC_EQ] ?? [],
    'Ondalık ve Kesirler': topicIds[TOPIC_FRAC] ?? [],
    Üçgenler: topicIds[TOPIC_TRI] ?? [],
  },
};
