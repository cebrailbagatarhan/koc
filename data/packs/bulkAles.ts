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
/* Ortak yapı                                                        */
/* ---------------------------------------------------------------- */

const LEVEL = 'ALES';
const NUM = 'Sayısal';
const VER = 'Sözel';

const T_PCT = 'Yüzde Problemleri';
const T_WRK = 'İşçi ve Hız Problemleri';
const T_SEQ = 'Diziler ve Örüntüler';
const T_MAIN = 'Ana Düşünce';
const T_CONJ = 'Bağlaç ve İlişki';
const T_INF = 'Çıkarım';

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

function add(draft: Draft, topic: string, course: string): boolean {
  const key = `${draft.prompt}|${[draft.answer, ...draft.distractors].slice().sort().join('|')}`;
  if (usedPrompts.has(key)) return false;
  usedPrompts.add(key);
  questions.push(
    mc({
      id: draft.id,
      levelName: LEVEL,
      courseName: course,
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

function run(count: number, make: (index: number) => Draft | null, topic: string, course: string) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 400) {
    guard += 1;
    const draft = make(made);
    if (!draft) continue;
    if (add(draft, topic, course)) made += 1;
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
  const rounded = Math.round(value * 100) / 100;
  const text = String(rounded).replace('.', ',');
  return text.replace('-', '−');
}

function n3(answer: number, candidates: number[]): string[] {
  const seen = new Set([fmt(answer)]);
  const out: string[] = [];
  for (const value of candidates) {
    if (out.length === 3) break;
    if (!Number.isFinite(value)) continue;
    if (Math.abs(value) > 1000000) continue;
    if (value === 0 && answer !== 0) continue;
    const text = fmt(value);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  let step = 1;
  while (out.length < 3 && step < 80) {
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

/* ---------------------------------------------------------------- */
/* Yüzde artış / azalış                                              */
/* ---------------------------------------------------------------- */

function genPctInc() {
  run(
    34,
    (i) => {
      const id = `bulk-as-pctinc-${i + 1}`;
      const P = (5 + Math.floor(rnd() * 36)) * 20;
      const a = 5 + Math.floor(rnd() * 15) * 5;
      const kind = i % 3;

      if (kind === 0) {
        const inc = (P * a) / 100;
        const ans = P + inc;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Etiket fiyatı ${P} TL olan bir ürüne %${a} zam yapılmıştır. Ürünün yeni fiyatı kaç TL’dir?`,
          answer: fmt(ans),
          distractors: n3(ans, [inc, P + a, P - inc, ans + a]),
          explanation: `Zam tutarı ${P} × ${a} ÷ 100 = ${fmt(inc)} TL’dir. Yeni fiyat ${P} + ${fmt(inc)} = ${fmt(ans)} TL olur.`,
        };
      }

      if (kind === 1) {
        const dec = (P * a) / 100;
        const ans = P - dec;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Etiket fiyatı ${P} TL olan bir ürüne %${a} indirim uygulanmıştır. Ürün kaç TL’ye satılır?`,
          answer: fmt(ans),
          distractors: n3(ans, [dec, P + dec, P - a, ans - a]),
          explanation: `İndirim tutarı ${P} × ${a} ÷ 100 = ${fmt(dec)} TL’dir. Ödenecek tutar ${P} − ${fmt(dec)} = ${fmt(ans)} TL’dir.`,
        };
      }

      const b = 5 + Math.floor(rnd() * 8) * 5;
      const after = (P * (100 + a)) / 100;
      const ans = (after * (100 - b)) / 100;
      if (!Number.isInteger(ans)) return null;
      const naive = (P * (100 + a - b)) / 100;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `Fiyatı ${P} TL olan bir ürünün fiyatı önce %${a} artırılmış, sonra artırılmış fiyat üzerinden %${b} indirilmiştir. Son fiyat kaç TL’dir?`,
        answer: fmt(ans),
        distractors: n3(ans, [naive, (P * (100 - b)) / 100, after, ans + b]),
        explanation: `İlk artıştan sonra fiyat ${P} × ${100 + a} ÷ 100 = ${fmt(after)} TL olur. İndirim bu fiyat üzerinden yapıldığı için son fiyat ${fmt(after)} × ${100 - b} ÷ 100 = ${fmt(ans)} TL’dir. Yüzdeler doğrudan toplanamaz.`,
      };
    },
    T_PCT,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Yüzde tersi: bütünü bulma                                         */
/* ---------------------------------------------------------------- */

function genPctReverse() {
  run(
    33,
    (i) => {
      const id = `bulk-as-pctrev-${i + 1}`;
      const a = pick([10, 20, 25, 40, 50, 60, 75, 80]);
      const total = (3 + Math.floor(rnd() * 20)) * 100;
      const kind = i % 3;

      if (kind === 0) {
        const part = (total * a) / 100;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Bir sayının %${a}’si ${part} ise sayının tamamı kaçtır?`,
          answer: fmt(total),
          distractors: n3(total, [(part * 100) / (100 - a), (part * a) / 100, part + a, (part * (100 + a)) / 100]),
          explanation: `Parça ${part}, bütünün %${a}’sidir. Bütün ${part} × 100 ÷ ${a} = ${total} olur; burada bölme yerine 100 − ${a} kullanmak yanıltıcıdır.`,
        };
      }

      if (kind === 1) {
        const price = (total * (100 - a)) / 100;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Fiyatı %${a} indirimle ${price} TL’ye düşen bir ürünün indirimsiz fiyatı kaç TL’dir?`,
          answer: fmt(total),
          distractors: n3(total, [(price * (100 + a)) / 100, (price * 100) / a, price + (price * a) / 100]),
          explanation: `İndirimli fiyat, eski fiyatın %${100 - a}’idir. Eski fiyat ${price} × 100 ÷ ${100 - a} = ${total} TL olur.`,
        };
      }

      const price = (total * (100 + a)) / 100;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `%${a} zamla ${price} TL olan bir ürünün zamdan önceki fiyatı kaç TL’dir?`,
        answer: fmt(total),
        distractors: n3(total, [(price * (100 - a)) / 100, (price * 100) / a, price - (price * a) / 100]),
        explanation: `Zamlı fiyat, eski fiyatın %${100 + a}’idir. Eski fiyat ${price} × 100 ÷ ${100 + a} = ${total} TL olur.`,
      };
    },
    T_PCT,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Kâr - zarar                                                       */
/* ---------------------------------------------------------------- */

function genProfit() {
  run(
    33,
    (i) => {
      const id = `bulk-as-profit-${i + 1}`;
      const C = (5 + Math.floor(rnd() * 36)) * 20;
      const a = 10 + Math.floor(rnd() * 9) * 5;
      const kind = i % 3;

      if (kind === 0) {
        const ans = (C * (100 + a)) / 100;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Maliyeti ${C} TL olan bir ürün %${a} kârla satılmıştır. Satış fiyatı kaç TL’dir?`,
          answer: fmt(ans),
          distractors: n3(ans, [(C * a) / 100, (C * (100 - a)) / 100, C + a]),
          explanation: `Kâr tutarı ${C} × ${a} ÷ 100 = ${fmt((C * a) / 100)} TL’dir. Satış fiyatı ${C} + ${fmt((C * a) / 100)} = ${fmt(ans)} TL olur.`,
        };
      }

      if (kind === 1) {
        const S = (C * (100 + a)) / 100;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Maliyeti ${C} TL olan bir ürün ${S} TL’ye satılmıştır. Bu satıştaki kâr yüzdesi kaçtır?`,
          answer: fmt(a),
          distractors: n3(a, [a + 5, a - 5, 100 - a, (S * 100) / C]),
          explanation: `Kâr ${S} − ${C} = ${S - C} TL’dir. Kâr yüzdesi ${S - C} × 100 ÷ ${C} = ${a} olur; oran maliyete göre kurulur.`,
        };
      }

      const S = (C * (100 + a)) / 100;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `%${a} kârla ${S} TL’ye satılan bir ürünün maliyeti kaç TL’dir?`,
        answer: fmt(C),
        distractors: n3(C, [S - (S * a) / 100, (S * 100) / a, S + (S * a) / 100]),
        explanation: `Satış fiyatı maliyetin %${100 + a}’idir. Maliyet ${S} × 100 ÷ ${100 + a} = ${C} TL olur.`,
      };
    },
    T_PCT,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Karışım                                                           */
/* ---------------------------------------------------------------- */

function genMixture() {
  run(
    33,
    (i) => {
      const id = `bulk-as-mix-${i + 1}`;
      const kind = i % 3;

      if (kind === 0) {
        const a = (2 + Math.floor(rnd() * 4)) * 10;
        const b = (2 + Math.floor(rnd() * 4)) * 10;
        const p = (1 + Math.floor(rnd() * 5)) * 10;
        const q = (1 + Math.floor(rnd() * 5)) * 10;
        if (a === b || p === q) return null;
        const ans = (a * p + b * q) / (a + b);
        if (!Number.isInteger(ans * 2)) return null;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `%${p} tuz içeren ${a} litre çözelti ile %${q} tuz içeren ${b} litre çözelti karıştırılmıştır. Yeni karışımın tuz oranı yüzde kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [(p + q) / 2, p + q, (a * p) / (a + b), ans + 5]),
          explanation: `Tuz miktarları ${a} × ${p} ÷ 100 = ${fmt((a * p) / 100)} ve ${b} × ${q} ÷ 100 = ${fmt((b * q) / 100)} litredir. Toplam tuz ${fmt((a * p + b * q) / 100)} litre, toplam çözelti ${a + b} litredir; oran ${fmt((a * p + b * q) / 100)} × 100 ÷ ${a + b} = ${fmt(ans)} olur.`,
        };
      }

      if (kind === 1) {
        const a = (2 + Math.floor(rnd() * 4)) * 10;
        const b = (1 + Math.floor(rnd() * 4)) * 10;
        const p = (1 + Math.floor(rnd() * 5)) * 10;
        const ans = (a * p) / (a + b);
        if (!Number.isInteger(ans * 2)) return null;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `%${p} tuz içeren ${a} litre çözeltiye ${b} litre saf su eklenmiştir. Yeni karışımın tuz oranı yüzde kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [p, (a * p) / (a - b), Math.abs(p - b), p / 2]),
          explanation: `Tuz miktarı değişmez: ${a} × ${p} ÷ 100 = ${fmt((a * p) / 100)} litre. Yeni hacim ${a} + ${b} = ${a + b} litredir; oran ${fmt((a * p) / 100)} × 100 ÷ ${a + b} = ${fmt(ans)} olur.`,
        };
      }

      const a = (3 + Math.floor(rnd() * 4)) * 10;
      const b = (1 + Math.floor(rnd() * 3)) * 10;
      const p = (1 + Math.floor(rnd() * 5)) * 10;
      if (a <= b) return null;
      const ans = (a * p) / (a - b);
      if (!Number.isInteger(ans * 2)) return null;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `%${p} tuz içeren ${a} litre çözeltiden ${b} litre su buharlaştırılmıştır. Kalan çözeltinin tuz oranı yüzde kaçtır?`,
        answer: fmt(ans),
        distractors: n3(ans, [p, (a * p) / (a + b), p + b, ans - 5]),
        explanation: `Buharlaşan suyla tuz kaybı olmaz; tuz ${a} × ${p} ÷ 100 = ${fmt((a * p) / 100)} litredir. Kalan hacim ${a} − ${b} = ${a - b} litredir; oran ${fmt((a * p) / 100)} × 100 ÷ ${a - b} = ${fmt(ans)} olur.`,
      };
    },
    T_PCT,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* İşçi - havuz                                                      */
/* ---------------------------------------------------------------- */

const WORK_PAIRS: Array<[number, number]> = [
  [6, 12],
  [10, 15],
  [12, 24],
  [8, 24],
  [15, 30],
  [20, 30],
  [9, 18],
  [4, 12],
  [5, 20],
  [30, 20],
  [24, 8],
  [16, 48],
  [12, 6],
  [20, 5],
  [45, 90],
  [18, 9],
  [40, 10],
  [60, 30],
];

function genWork() {
  run(
    34,
    (i) => {
      const id = `bulk-as-work-${i + 1}`;
      const [x, y] = WORK_PAIRS[Math.floor(i / 4) % WORK_PAIRS.length];
      const kind = i % 4;
      const together = (x * y) / (x + y);

      if (kind === 0) {
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Bir işi A işçisi tek başına ${x} günde, B işçisi tek başına ${y} günde bitiriyor. İkisi birlikte çalışırsa iş kaç günde biter?`,
          answer: fmt(together),
          distractors: n3(together, [x + y, (x + y) / 2, together + 2, Math.abs(y - x)]),
          explanation: `A bir günde 1/${x}, B bir günde 1/${y} iş yapar. Birlikte bir günde 1/${x} + 1/${y} = ${fmt(1 / x + 1 / y)} iş biter; süre ${x} × ${y} ÷ (${x} + ${y}) = ${fmt(together)} gündür.`,
        };
      }

      if (kind === 1) {
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Bir işi iki işçi birlikte ${fmt(together)} günde bitiriyor. İşçilerden biri bu işi tek başına ${x} günde bitirdiğine göre diğeri tek başına kaç günde bitirir?`,
          answer: fmt(y),
          distractors: n3(y, [x + together, together * 2, x, x - together]),
          explanation: `Birlikte bir günde 1/${fmt(together)} iş biter, biri 1/${x} iş yapar. Diğeri 1/${fmt(together)} − 1/${x} = 1/${y} iş yapar; süre ${y} gündür.`,
        };
      }

      if (kind === 2) {
        const big = Math.max(x, y);
        const small = Math.min(x, y);
        const ans = (big * small) / (big - small);
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Bir havuzu dolduran musluk havuzu ${small} saatte dolduruyor, boşaltan musluk ise dolu havuzu ${big} saatte boşaltıyor. İkisi birlikte açıldığında boş havuz kaç saatte dolar?`,
          answer: fmt(ans),
          distractors: n3(ans, [(big * small) / (big + small), big - small, big + small, ans + 2]),
          explanation: `Bir saatte dolan kısım 1/${small}, boşalan kısım 1/${big} olur. Net dolum 1/${small} − 1/${big} = ${fmt(1 / small - 1 / big)}; süre ${big} × ${small} ÷ (${big} − ${small}) = ${fmt(ans)} saattir.`,
        };
      }

      let k = 1;
      let ans = 0;
      for (let step = 1; step < x; step += 1) {
        if (((x - step) * y) % x === 0) {
          k = step;
          ans = step + ((x - step) * y) / x;
          break;
        }
      }
      if (ans === 0) return null;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `Bir işi A işçisi ${x} günde, B işçisi ${y} günde bitiriyor. A tek başına ${k} gün çalışıp işten ayrılıyor, kalan işi B tamamlıyor. İş toplam kaç günde biter?`,
        answer: fmt(ans),
        distractors: n3(ans, [k + y, ans + 2, y, x + k]),
        explanation: `A ${k} günde işin ${k}/${x}’ünü bitirir; kalan ${x - k}/${x}’lük bölümü B, ${y} × ${x - k} ÷ ${x} = ${fmt(((x - k) * y) / x)} günde tamamlar. Toplam süre ${k} + ${fmt(((x - k) * y) / x)} = ${fmt(ans)} gündür.`,
      };
    },
    T_WRK,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Ters orantı                                                       */
/* ---------------------------------------------------------------- */

function divisorsOf(value: number): number[] {
  const out: number[] = [];
  for (let k = 2; k <= 12; k += 1) {
    if (value % k === 0) out.push(k);
  }
  return out;
}

function genInverse() {
  run(
    33,
    (i) => {
      const id = `bulk-as-inv-${i + 1}`;
      const n = 2 + Math.floor(rnd() * 9);
      const d = 4 + Math.floor(rnd() * 17);
      const options = divisorsOf(n * d).filter((value) => value !== n);
      if (!options.length) return null;
      const m = pick(options);
      const ans = (n * d) / m;
      if (ans === d) return null;
      const kind = i % 3;

      if (kind === 0) {
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Aynı verimle çalışan ${n} işçi bir işi ${d} günde bitiriyor. Bu işçilerden ${m} tanesi aynı işi kaç günde bitirir?`,
          answer: fmt(ans),
          distractors: n3(ans, [(d * m) / n, d + m - n, d * m, d - m + n]),
          explanation: `İşçi sayısı ile süre ters orantılıdır: ${n} × ${d} = ${m} × süre. Süre ${n} × ${d} ÷ ${m} = ${fmt(ans)} gündür. Doğru orantı kurup ${d} × ${m} ÷ ${n} demek yanıltıcıdır.`,
        };
      }

      if (kind === 1) {
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Aynı hızla çalışan ${n} makine ${d} saatte ${n * d * 2} parça üretiyor. ${m} makine aynı hızla aynı sayıda parçayı kaç saatte üretir?`,
          answer: fmt(ans),
          distractors: n3(ans, [(d * m) / n, d + (m - n), d * 2, ans + 3]),
          explanation: `Makine sayısı artarken süre ters orantılı azalır: ${n} × ${d} = ${m} × süre. Süre ${fmt(ans)} saattir.`,
        };
      }

      const v1 = pick([40, 60, 80, 100, 120]);
      const t = 2 + Math.floor(rnd() * 5);
      const total = v1 * t;
      const speeds = [60, 70, 80, 90, 100, 110, 120, 150, 160, 180].filter(
        (value) => value !== v1 && total % value === 0 && total / value !== t,
      );
      if (!speeds.length) return null;
      const v2 = pick(speeds);
      const ans2 = total / v2;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `Bir araç bir yolu saatte ${v1} km hızla ${t} saatte alıyor. Aynı yolu saatte ${v2} km hızla kaç saatte alır?`,
        answer: fmt(ans2),
        distractors: n3(ans2, [(t * v2) / v1, t + 1, Math.abs(v2 - v1), t * 2]),
        explanation: `Yol ${v1} × ${t} = ${total} km’dir. Yeni süre ${total} ÷ ${v2} = ${fmt(ans2)} saattir; hız artarken süre ters orantılı olarak azalır.`,
      };
    },
    T_WRK,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Hız - yol - zaman                                                 */
/* ---------------------------------------------------------------- */

function genSpeed() {
  run(
    33,
    (i) => {
      const id = `bulk-as-speed-${i + 1}`;
      const v = 30 + Math.floor(rnd() * 10) * 10;
      const t = 2 + Math.floor(rnd() * 6);
      const kind = i % 4;

      if (kind === 0) {
        const d = v * t;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Saatte ${v} km hızla giden bir araç ${t} saatte kaç km yol alır?`,
          answer: fmt(d),
          distractors: n3(d, [v + t, d + v, d - t, v / t]),
          explanation: `Yol = hız × zaman olduğundan ${v} × ${t} = ${d} km bulunur.`,
        };
      }

      if (kind === 1) {
        const hours = 2 + Math.floor(rnd() * 4);
        const d = v * hours;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `${d} km’lik bir yolu saatte ${v} km hızla giden bir araç yolculuğu kaç saatte tamamlar?`,
          answer: fmt(hours),
          distractors: n3(hours, [d * v, hours + 1, v / d, d - v]),
          explanation: `Zaman = yol ÷ hız olduğundan ${d} ÷ ${v} = ${hours} saat bulunur.`,
        };
      }

      if (kind === 2) {
        const hours = 2 + Math.floor(rnd() * 4);
        const d = v * hours;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `${d} km’lik yolu ${hours} saatte alan bir aracın ortalama hızı saatte kaç km’dir?`,
          answer: fmt(v),
          distractors: n3(v, [d * hours, v + 10, v - 10, hours]),
          explanation: `Hız = yol ÷ zaman olduğundan ${d} ÷ ${hours} = ${v} km/sa bulunur.`,
        };
      }

      const v1 = 40 + Math.floor(rnd() * 6) * 10;
      const v2 = 50 + Math.floor(rnd() * 6) * 10;
      const sure = 2 + Math.floor(rnd() * 3);
      const ans = (v1 + v2) * sure;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `Aralarında ${ans} km bulunan iki noktadan aynı anda birbirine doğru hareket eden araçların hızları saatte ${v1} km ve ${v2} km’dir. Araçlar kaç saat sonra karşılaşır?`,
        answer: fmt(sure),
        distractors: n3(sure, [ans / v1, ans / v2, sure + 1, v1 + v2]),
        explanation: `Yaklaşma hızı ${v1} + ${v2} = ${v1 + v2} km/sa’dir. Süre ${ans} ÷ ${v1 + v2} = ${sure} saat olur.`,
      };
    },
    T_WRK,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Ortalama hız                                                      */
/* ---------------------------------------------------------------- */

const SPEED_PAIRS: Array<[number, number]> = [
  [60, 120],
  [40, 60],
  [30, 60],
  [20, 30],
  [40, 120],
  [60, 90],
  [80, 120],
  [100, 150],
  [45, 90],
  [24, 48],
  [15, 30],
  [36, 72],
  [90, 180],
  [12, 24],
];

function genAvgSpeed() {
  run(
    33,
    (i) => {
      const id = `bulk-as-avgs-${i + 1}`;
      const kind = i % 2;

      if (kind === 0) {
        const [v1, v2] = SPEED_PAIRS[i % SPEED_PAIRS.length];
        const dist = (2 + Math.floor(rnd() * 9)) * 60;
        const ans = (2 * v1 * v2) / (v1 + v2);
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Bir araç ${dist} km’lik yolu saatte ${v1} km hızla gidip aynı yolu saatte ${v2} km hızla dönmüştür. Aracın yol boyunca ortalama hızı saatte kaç km’dir?`,
          answer: fmt(ans),
          distractors: n3(ans, [(v1 + v2) / 2, v1 + v2, Math.abs(v2 - v1), ans + 8]),
          explanation: `Gidiş ve dönüş yolları eşit olduğundan ortalama hız harmonik ortalamadır: 2 × ${v1} × ${v2} ÷ (${v1} + ${v2}) = ${fmt(ans)} km/sa. Hızların aritmetik ortalaması olan ${fmt((v1 + v2) / 2)} yanlış sonuçtur.`,
        };
      }

      const v1 = 40 + Math.floor(rnd() * 5) * 10;
      const v2 = 60 + Math.floor(rnd() * 5) * 10;
      const t1 = 2 + Math.floor(rnd() * 3);
      const t2 = 1 + Math.floor(rnd() * 3);
      if (t1 === t2) return null;
      const ans = (v1 * t1 + v2 * t2) / (t1 + t2);
      if (!Number.isInteger(ans)) return null;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `Bir araç yolculuğunun ilk ${t1} saatini saatte ${v1} km, sonraki ${t2} saatini saatte ${v2} km hızla tamamlamıştır. Yolculuk boyunca ortalama hızı saatte kaç km’dir?`,
        answer: fmt(ans),
        distractors: n3(ans, [(v1 + v2) / 2, v1 + v2, ans + 5, ans - 5]),
        explanation: `Alınan yollar ${v1} × ${t1} = ${v1 * t1} km ve ${v2} × ${t2} = ${v2 * t2} km’dir. Ortalama hız ${v1 * t1 + v2 * t2} ÷ ${t1 + t2} = ${fmt(ans)} km/sa olur.`,
      };
    },
    T_WRK,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Ardışık sayılar                                                   */
/* ---------------------------------------------------------------- */

function genConsecutive() {
  run(
    34,
    (i) => {
      const id = `bulk-as-cons-${i + 1}`;
      const kind = i % 4;

      if (kind === 0) {
        const n = 3 + Math.floor(rnd() * 5);
        const a = 1 + Math.floor(rnd() * 40);
        const S = n * a + (n * (n - 1)) / 2;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Ardışık ${n} tam sayının toplamı ${S}’dir. Bu sayıların en küçüğü kaçtır?`,
          answer: fmt(a),
          distractors: n3(a, [a + 1, a - 1, a + n - 1, S / n]),
          explanation: `Sayılar ${a}, ${a + 1}, ... biçiminde yazılırsa toplam ${n} × ${a} + ${(n * (n - 1)) / 2} = ${S} olur. Buradan en küçük sayı ${a} bulunur.`,
        };
      }

      if (kind === 1) {
        const m = 3 + Math.floor(rnd() * 20) * 2;
        const S = 3 * m;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Ardışık üç tek sayının toplamı ${S}’dir. Bu sayıların ortancası kaçtır?`,
          answer: fmt(m),
          distractors: n3(m, [m + 2, m - 2, m + 1, S / 3 + 2]),
          explanation: `Ardışık tek sayılar ${m - 2}, ${m}, ${m + 2} biçimindedir; toplam 3 × ${m} = ${S} olduğundan ortanca sayı ${m} olur.`,
        };
      }

      if (kind === 2) {
        const n = 3 + Math.floor(rnd() * 4);
        const a = 2 * (1 + Math.floor(rnd() * 20));
        const S = n * a + n * (n - 1);
        const big = a + 2 * (n - 1);
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Ardışık ${n} çift sayının toplamı ${S}’dir. Bu sayıların en büyüğü kaçtır?`,
          answer: fmt(big),
          distractors: n3(big, [a, big + 2, big - 2, S / n]),
          explanation: `Sayılar ${a}’dan başlayıp ikişer arttığı için en büyüğü ${a} + 2 × ${n - 1} = ${big} olur; toplam ${S} bu değerle tutarlıdır.`,
        };
      }

      const a = 1 + Math.floor(rnd() * 30);
      const D = 2 * a + 1;
      const big = a + 1;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `Ardışık iki tam sayının kareleri farkı ${D}’dir. Bu sayılardan büyüğü kaçtır?`,
        answer: fmt(big),
        distractors: n3(big, [a, D, big + 1, D - a]),
        explanation: `Sayılar ${a} ve ${big} olsun. Kareler farkı ${big}² − ${a}² = ${big + a} = ${D} olur. Buradan büyük sayı ${big} bulunur.`,
      };
    },
    T_SEQ,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Aritmetik dizi                                                    */
/* ---------------------------------------------------------------- */

function genArith() {
  run(
    33,
    (i) => {
      const id = `bulk-as-arith-${i + 1}`;
      const a1 = 1 + Math.floor(rnd() * 10);
      const d = 2 + Math.floor(rnd() * 6);
      const n = 5 + Math.floor(rnd() * 11);
      const kind = i % 4;

      if (kind === 0) {
        const an = a1 + (n - 1) * d;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `İlk terimi ${a1}, ortak farkı ${d} olan aritmetik dizinin ${n}. terimi kaçtır?`,
          answer: fmt(an),
          distractors: n3(an, [a1 + n * d, an - d, a1 * n, an + d]),
          explanation: `Aritmetik dizide ${n}. terim ${a1} + (${n} − 1) × ${d} = ${a1} + ${(n - 1) * d} = ${an} olur.`,
        };
      }

      if (kind === 1) {
        const small = 4 + Math.floor(rnd() * 6);
        const d2 = 2 + Math.floor(rnd() * 4);
        const a0 = 1 + Math.floor(rnd() * 8);
        const S = (small * (2 * a0 + (small - 1) * d2)) / 2;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `İlk terimi ${a0}, ortak farkı ${d2} olan aritmetik dizinin ilk ${small} teriminin toplamı kaçtır?`,
          answer: fmt(S),
          distractors: n3(S, [small * a0, S + small, (small * (2 * a0 + small * d2)) / 2, S - d2]),
          explanation: `Toplam ${small} ÷ 2 × (2 × ${a0} + ${small - 1} × ${d2}) = ${small} ÷ 2 × ${2 * a0 + (small - 1) * d2} = ${S} olur.`,
        };
      }

      if (kind === 2) {
        const d3 = 2 + Math.floor(rnd() * 5);
        const a3 = 3 + Math.floor(rnd() * 15);
        const a7 = a3 + 4 * d3;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Bir aritmetik dizinin 3. terimi ${a3}, 7. terimi ${a7}’dir. Bu dizinin ortak farkı kaçtır?`,
          answer: fmt(d3),
          distractors: n3(d3, [a7 - a3, (a7 - a3) / 2, d3 + 1, d3 - 1]),
          explanation: `3. terimden 7. terime dört adım vardır: ${a7} − ${a3} = ${a7 - a3}. Ortak fark ${a7 - a3} ÷ 4 = ${d3} olur.`,
        };
      }

      const d4 = 2 + Math.floor(rnd() * 4);
      const first = 1 + Math.floor(rnd() * 8);
      const count = 5 + Math.floor(rnd() * 8);
      const last = first + (count - 1) * d4;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `İlk terimi ${first}, ortak farkı ${d4} olan aritmetik dizide ${last} terimi kaçıncı terimdir?`,
        answer: fmt(count),
        distractors: n3(count, [count + 1, count - 1, last - first, last / d4]),
        explanation: `${last} = ${first} + (n − 1) × ${d4} yazılır. Buradan n − 1 = ${(last - first) / d4} ve n = ${count} bulunur.`,
      };
    },
    T_SEQ,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Geometrik dizi                                                    */
/* ---------------------------------------------------------------- */

function genGeom() {
  run(
    33,
    (i) => {
      const id = `bulk-as-geom-${i + 1}`;
      const a1 = 2 + Math.floor(rnd() * 4);
      const r = 2 + Math.floor(rnd() * 2);
      const n = 4 + Math.floor(rnd() * 3);
      const kind = i % 4;

      if (kind === 0) {
        const an = a1 * Math.pow(r, n - 1);
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `İlk terimi ${a1}, ortak çarpanı ${r} olan geometrik dizinin ${n}. terimi kaçtır?`,
          answer: fmt(an),
          distractors: n3(an, [a1 * Math.pow(r, n), a1 + (n - 1) * r, an / r, an * r]),
          explanation: `Geometrik dizide ${n}. terim ${a1} × ${r}^${n - 1} = ${an} olur; terim her adımda ${r} ile çarpılarak büyür.`,
        };
      }

      if (kind === 1) {
        const a2 = a1 * r;
        const a5 = a1 * Math.pow(r, 4);
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Bir geometrik dizinin 2. terimi ${a2}, 5. terimi ${a5}’tir. Bu dizinin ortak çarpanı kaçtır?`,
          answer: fmt(r),
          distractors: n3(r, [a5 / a2, r + 1, r - 1, (a5 - a2) / 3]),
          explanation: `2. terimden 5. terime üç çarpım vardır: ${a5} ÷ ${a2} = ${a5 / a2}. Ortak çarpan ${a5 / a2} sayısının küp kökü olan ${r}’dir.`,
        };
      }

      if (kind === 2) {
        const S = (a1 * (Math.pow(r, n) - 1)) / (r - 1);
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `İlk terimi ${a1}, ortak çarpanı ${r} olan geometrik dizinin ilk ${n} teriminin toplamı kaçtır?`,
          answer: fmt(S),
          distractors: n3(S, [a1 * Math.pow(r, n), S - a1, S + r, a1 * n]),
          explanation: `Toplam ${a1} × (${r}^${n} − 1) ÷ (${r} − 1) = ${a1} × ${Math.pow(r, n) - 1} ÷ ${r - 1} = ${S} olur.`,
        };
      }

      const a3 = a1 * r * r;
      const a5 = a1 * Math.pow(r, 4);
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `Bir geometrik dizinin ilk terimi ${a1}, üçüncü terimi ${a3}’tür. Bu dizinin beşinci terimi kaçtır?`,
        answer: fmt(a5),
        distractors: n3(a5, [a3 * 2, a3 + 2 * r, a5 / r, a1 * Math.pow(r, 5)]),
        explanation: `Ortak çarpan ${a3} ÷ ${a1} = ${r * r} sayısının karekökü olan ${r}’dir. Beşinci terim ${a3} × ${r * r} = ${a5} olur.`,
      };
    },
    T_SEQ,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Örüntü kuralı                                                     */
/* ---------------------------------------------------------------- */

function genPattern() {
  run(
    17,
    (i) => {
      const id = `bulk-as-pat-${i + 1}`;
      const family = i % 6;
      const shift = 2 + (Math.floor(i / 6) % 3);

      if (family === 0) {
        const c = 1 + Math.floor(rnd() * 5);
        const terms = [1, 2, 3, 4, 5].map((k) => k * k + c);
        const ans = 36 + c;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `${terms.join(', ')}, ... biçiminde ilerleyen bir sayı örüntüsünün sonraki terimi kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [ans + 2, ans - 2, terms[4] + 9, ans + 4]),
          explanation: `Terimler sırasıyla 1² + ${c}, 2² + ${c}, 3² + ${c} ... biçimindedir. Altıncı terim 6² + ${c} = ${ans} olur.`,
        };
      }

      if (family === 1) {
        const terms = [1, 2, 3, 4, 5].map((k) => shift * k * (k + 1));
        const ans = 42 * shift;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `${terms.join(', ')}, ... biçiminde ilerleyen bir sayı örüntüsünün sonraki terimi kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [ans - 2, ans + 2, ans - 6, ans / 2]),
          explanation: `Terimler ${shift} × n × (n + 1) kuralıyla üretilmiştir. Altıncı terim ${shift} × 6 × 7 = ${ans} olur.`,
        };
      }

      if (family === 2) {
        const base = 2 + Math.floor(rnd() * 3);
        const ratio = 2 + Math.floor(rnd() * 2);
        const terms = [0, 1, 2, 3, 4].map((k) => base * Math.pow(ratio, k));
        const ans = base * Math.pow(ratio, 5);
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `${terms.join(', ')}, ... biçiminde ilerleyen bir sayı örüntüsünün sonraki terimi kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [ans + ratio, ans - ratio, terms[4] + ratio, ans / ratio]),
          explanation: `Her terim bir öncekinin ${ratio} katıdır. Sonraki terim ${terms[4]} × ${ratio} = ${ans} olur.`,
        };
      }

      if (family === 3) {
        const start = 2 + Math.floor(rnd() * 4);
        const add = 1 + Math.floor(rnd() * 4);
        const terms = [start];
        for (let k = 0; k < 4; k += 1) terms.push(terms[k] * 2 + add);
        const ans = terms[4] * 2 + add;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `${terms.join(', ')}, ... biçiminde ilerleyen bir sayı örüntüsünün sonraki terimi kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [terms[4] + add, ans - add, ans + 2, terms[4] * 3]),
          explanation: `Kural, her terimi ikiyle çarpıp ${add} eklemektir: ${terms[4]} × 2 + ${add} = ${ans} olur.`,
        };
      }

      if (family === 4) {
        const base = 5 + 2 * (Math.floor(i / 6) % 3);
        const terms = [1, 2, 3, 4, 5].map((k) => (base * k * (k + 1)) / 2);
        const ans = 21 * base;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `${terms.join(', ')}, ... biçiminde ilerleyen bir sayı örüntüsünün sonraki terimi kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [ans - 3, ans + 3, ans - base, ans + base]),
          explanation: `Terimler ${base} çarpanıyla birikimli toplam biçiminde ilerler. Altıncı terim ${base} × (1 + 2 + 3 + 4 + 5 + 6) = ${ans} olur.`,
        };
      }

      const terms = [1, 2, 3, 4, 5].map((k) => shift * k * k * k);
      const ans = 216 * shift;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `${terms.join(', ')}, ... biçiminde ilerleyen bir sayı örüntüsünün sonraki terimi kaçtır?`,
        answer: fmt(ans),
        distractors: n3(ans, [125 * shift, ans - shift, ans + shift, 200 * shift]),
        explanation: `Terimler ${shift} × n³ kuralıyla üretilmiştir. Altıncı terim ${shift} × 216 = ${ans} olur.`,
      };
    },
    T_SEQ,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Yaş problemi                                                      */
/* ---------------------------------------------------------------- */

function genAge() {
  run(
    17,
    (i) => {
      const id = `bulk-as-age-${i + 1}`;
      const kind = i % 4;

      if (kind === 0) {
        const child = 6 + Math.floor(rnd() * 9);
        const k = 2 + Math.floor(rnd() * 3);
        const y = 3 + Math.floor(rnd() * 10);
        const parent = k * child + (k - 1) * y;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Bir babanın yaşı ${parent}, oğlunun yaşı ${child}’dir. Kaç yıl sonra babanın yaşı oğlunun yaşının ${k} katı olur?`,
          answer: fmt(y),
          distractors: n3(y, [y + 2, y - 2, y + 4, parent - child]),
          explanation: `${y} yıl sonra baba ${parent} + ${y} = ${parent + y}, oğul ${child} + ${y} = ${child + y} yaşında olur. ${parent + y} = ${k} × ${child + y} eşitliği sağlandığı için yanıt ${y} yıldır.`,
        };
      }

      if (kind === 1) {
        const small = 5 + Math.floor(rnd() * 12);
        const diff = 2 + Math.floor(rnd() * 8);
        const S = 2 * small + diff;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `İki kardeşin yaşları toplamı ${S}, yaşları farkı ${diff}’tir. Büyük kardeş kaç yaşındadır?`,
          answer: fmt(small + diff),
          distractors: n3(small + diff, [small, S / 2, small + diff + 2, diff]),
          explanation: `Büyük kardeşin yaşı (${S} + ${diff}) ÷ 2 = ${small + diff} olur; küçük kardeş ise ${small} yaşındadır.`,
        };
      }

      if (kind === 2) {
        const child = 6 + Math.floor(rnd() * 10);
        const y = 2 + Math.floor(rnd() * 4);
        const ratio = 2 + Math.floor(rnd() * 3);
        const parent = ratio * (child - y) + y;
        return {
          id,
          difficulty: difficultyAt(i),
          prompt: `Bir babanın yaşı ${parent}, oğlunun yaşı ${child}’dir. ${y} yıl önce babanın yaşı oğlunun yaşının kaç katıydı?`,
          answer: fmt(ratio),
          distractors: n3(ratio, [ratio + 1, ratio - 1, parent / child, ratio + 2]),
          explanation: `${y} yıl önce baba ${parent - y}, oğul ${child - y} yaşındaydı. Oran ${parent - y} ÷ ${child - y} = ${ratio} olur.`,
        };
      }

      const y = 3 + Math.floor(rnd() * 6);
      const z = 2 + Math.floor(rnd() * 6);
      const k = 2 + Math.floor(rnd() * 2);
      const x = (y + k * z) / (k - 1);
      if (!Number.isInteger(x)) return null;
      return {
        id,
        difficulty: difficultyAt(i),
        prompt: `Bir kişinin ${y} yıl sonraki yaşı, ${z} yıl önceki yaşının ${k} katı olacaktır. Bu kişi bugün kaç yaşındadır?`,
        answer: fmt(x),
        distractors: n3(x, [x + 2, x - 2, y + z, x + 5]),
        explanation: `Bugünkü yaş x olsun: x + ${y} = ${k} × (x − ${z}). Buradan ${k}x − x = ${y} + ${k * z}, yani ${k - 1}x = ${y + k * z} ve x = ${x} bulunur.`,
      };
    },
    T_SEQ,
    NUM,
  );
}

/* ---------------------------------------------------------------- */
/* Sözel metin birimleri                                             */
/* ---------------------------------------------------------------- */

type Unit = {
  s: [string, string, string, string, string, string, string, string];
  a: string;
  c: string;
  v: string;
  e: string;
  b: 'açıklama' | 'tartışma';
};

const UNITS: Unit[] = [
  {
    s: [
      'Kentlerde boş arsaların sebze bahçesine dönüştürülmesi, hem gıda üretimini hem de mahalle dayanışmasını güçlendiriyor.',
      'Bu dönüşüm, uzun mesafeli taşımacılığa duyulan bağımlılığı azalttığı için karbon salımını da düşürüyor.',
      'Lizbon’da bir mahalle, atıl bir otoparkı üç yıl içinde yüz elli hanenin yararlandığı bir üretim alanına çevirdi.',
      'Ancak bu bahçelerin kira baskısı karşısında kalıcılığı, mülkiyet düzenlemelerine bağlı olduğu için güvence altında değil.',
      'Bu nedenle kent bahçeleri, ancak imar planlarına yerleştirildiğinde kalıcı bir kamusal hizmete dönüşebilir.',
      'Bahçelerin sulama ihtiyacı çoğunlukla yağmur suyu hasadıyla karşılanıyor.',
      'Toprak analizi yapılmadan kurulan bahçelerde verim ilk yılda düşük kalıyor.',
      'Kompost uygulaması, bahçe atığını toprağa geri kazandırıyor.',
    ],
    a: 'Kent bahçeleri, gıda üretimini ve mahalle dayanışmasını güçlendiren bir çözümdür.',
    c: 'Kent bahçelerinin sürekliliği, hukuki güvenceye bağlıdır.',
    v: 'Boş arsaların tarıma elverişli olduğu kabul edilmektedir.',
    e: 'kent bahçelerinin kira baskısı karşısında korumasız bırakılması',
    b: 'tartışma',
  },
  {
    s: [
      'Düzenli uyku saatlerinin, uyku süresinden bağımsız olarak dikkat ve bellek üzerinde belirleyici bir etkisi var.',
      'Beyin, aynı saatlerde uykuya geçmeyi beklediği için biyolojik ritim bu düzenle uyumlu çalışıyor.',
      'Bir üniversite araştırmasında, her gün aynı saatte yatan öğrencilerin ders başarısı belirgin biçimde yüksek çıktı.',
      'Ne var ki vardiyalı çalışanlar için bu düzeni kurmak, çoğu zaman iş koşulları nedeniyle olanaksızlaşıyor.',
      'Bu yüzden uyku önerileri, kişinin çalışma koşulları gözetilerek verilmelidir.',
      'Ekran ışığı, uykuya geçiş süresini ortalama yirmi dakika uzatabiliyor.',
      'Hafta sonu geç yatmak, hafta içi kurulan düzeni birkaç günde bozabiliyor.',
      'Oda sıcaklığının serin tutulması, uykuya geçişi kolaylaştırıyor.',
    ],
    a: 'Uyku saatinin düzenliliği, süresi kadar önemlidir.',
    c: 'Uyku önerileri kişinin çalışma düzenine göre uyarlanmalıdır.',
    v: 'Biyolojik ritmin düzenli saatlerle uyumlu çalıştığı varsayılmaktadır.',
    e: 'herkes için geçerli tek tip uyku önerileri',
    b: 'tartışma',
  },
  {
    s: [
      'Okuma alışkanlığı, çocuklukta görülen bir etkinlikten çok, yetişkinlikte sürdürülen bir ilişki biçimi olarak ele alınmalı.',
      'Okuma, ancak kişinin merak ettiği konularla karşılaştığında süreklilik kazanıyor.',
      'Kütüphanelerde yürütülen serbest seçim uygulamaları, öğrencilerin okuma süresini iki katına çıkardı.',
      'Buna karşın okul programlarında okuma çoğunlukla ödevle özdeşleştirildiği için bu merak geri planda kalıyor.',
      'Dolayısıyla okuma eğitimi, metin seçiminde öğrenciye söz hakkı tanıdığı ölçüde amacına ulaşır.',
      'Sınıf kitaplıklarının çeşitliliği, bu süreçte belirleyici rol oynuyor.',
      'Öğretmenin okuduğu kitabı sınıfta tartışmak, öğrencinin metne ilgisini artırıyor.',
      'Okuma listeleri, öğrencinin kendi seçimini engellediğinde işlevini yitiriyor.',
    ],
    a: 'Okuma alışkanlığı, metin seçiminde özgürlük tanındığında kalıcılaşır.',
    c: 'Okuma ödevle özdeşleştirildiğinde merak zayıflamaktadır.',
    v: 'Öğrencinin ilgi duyduğu konuları kendisinin seçebildiği varsayılmaktadır.',
    e: 'okumanın ödevle özdeşleştirilmesi',
    b: 'tartışma',
  },
  {
    s: [
      'Kentsel gürültü, işitme kaybı yaratmayan düzeylerde bile sağlığı etkileyen görünmez bir kirlilik türüdür.',
      'Sürekli orta düzeydeki ses, bedende stres tepkisini tetikleyerek uykuyu ve tansiyonu bozuyor.',
      'Ana yol kenarında yaşayan çocuklarda dikkat testi puanlarının belirgin biçimde düşük olduğu saptandı.',
      'Ancak gürültü ölçümleri çoğu kentte yalnızca belirli noktalarda yapıldığı için sorunun yaygınlığı bilinmiyor.',
      'Bu nedenle gürültü haritaları, kent sağlığı planlamasının zorunlu bir parçası olmalıdır.',
      'Ağaç şeritleri, yol gürültüsünü birkaç desibel azaltabiliyor.',
      'Gece saatlerinde yükselen ses düzeyi, uyku bölünmelerini belirgin biçimde çoğaltıyor.',
      'Kulaklıkla müzik dinlemek, gürültüye bağlı işitme kaybını artırabiliyor.',
    ],
    a: 'Kentsel gürültü, sanıldığından daha geniş bir sağlık sorunudur.',
    c: 'Gürültünün yaygınlığı, ölçümlerin sınırlılığı nedeniyle tam olarak bilinmemektedir.',
    v: 'Orta düzeydeki sesin de sağlığı bozduğu kabul edilmektedir.',
    e: 'gürültü ölçümlerinin sınırlı tutulması',
    b: 'açıklama',
  },
  {
    s: [
      'El sanatları, yalnızca geçmişten kalan bir miras değil, bugünün ekonomisinde yer tutan bir üretim alanıdır.',
      'Atölyede üretilen her parça, seri üretimin tekdüzeliğinden ayrıldığı için alıcı buluyor.',
      'Dokumacılıkla geçinen bir köyde, ürünlerin çevrim içi satışa açılması hane gelirini üç katına çıkardı.',
      'Yine de bu üretim biçimi, ham madde maliyetleri karşısında direnç göstermekte zorlanıyor.',
      'Dolayısıyla el sanatlarının yaşaması, üreticinin girdiye erişiminin kolaylaştırılmasına bağlı.',
      'Ustaların çoğu, mesleğe başlamayı aile içinde öğrenmiş.',
      'Ürünlerin özgün deseni, alıcının gözünde fiyat farkını haklı çıkarıyor.',
      'Genç ustaların yetişmesi, atölyelerin açık kalmasına bağlı.',
    ],
    a: 'El sanatları, desteklendiğinde ekonomik değer üreten bir alandır.',
    c: 'El sanatlarının sürmesi girdi maliyetlerine bağlıdır.',
    v: 'El emeği ürünlerin alıcı bulduğu varsayılmaktadır.',
    e: 'el sanatlarında ham madde maliyetlerinin göz ardı edilmesi',
    b: 'açıklama',
  },
  {
    s: [
      'Müzelerin eğitim işlevi, sergilenen nesneleri korumaktan çok onları yorumlanabilir kılmaya dayanıyor.',
      'Ziyaretçi bir nesnenin hikâyesini kurabildiğinde müze deneyimi kalıcı bir öğrenmeye dönüşüyor.',
      'Rehberli atölye çalışmalarına katılan öğrenciler, sergiyi gezdikten bir ay sonra ayrıntıları hatırladı.',
      'Ancak sergiler çoğunlukla uzman diliyle düzenlendiği için bu yorumlama çabası yarıda kalıyor.',
      'Bu yüzden müze metinleri, ziyaretçinin soru sormasını sağlayacak biçimde yazılmalıdır.',
      'Sesli rehber uygulamaları, bu açığı kısmen kapatıyor.',
      'Sergi salonlarının sırası, ziyaretçinin konuyu adım adım kurmasını sağlayacak biçimde düzenleniyor.',
      'Ziyaretçi sayısının artması, sergi düzeninin yeniden gözden geçirilmesini gerektiriyor.',
    ],
    a: 'Müzelerin eğitici gücü, nesneleri yorumlanabilir kılmaktan geçer.',
    c: 'Uzman dili, ziyaretçinin yorum kurmasını güçleştirmektedir.',
    v: 'Ziyaretçinin nesneyle kişisel bir bağ kurabildiği varsayılmaktadır.',
    e: 'sergi metinlerinin yalnızca uzman diline dayanması',
    b: 'tartışma',
  },
  {
    s: [
      'Makine çevirisinin gelişmesi, çevirmenlik mesleğini ortadan kaldırmıyor; görevini yeniden tanımlıyor.',
      'Otomatik çeviri, kalıplaşmış metinlerde hızlı sonuç verdiği için rutin işleri devralıyor.',
      'Bir yayınevi, teknik kılavuzların ilk taslağını makineyle çevirip ardından editör denetiminden geçiriyor.',
      'Ne var ki deyim, mizah ve kültürel gönderme içeren metinlerde makine çıktısı hâlâ yetersiz kalıyor.',
      'Bu nedenle çevirmenin işi, giderek dil aktarmadan çok anlam denetimine kayıyor.',
      'Sektörde çeviri sonrası düzenleme işleri hızla artıyor.',
      'Teknik metinlerde terim tutarlılığı, çeviri kalitesini belirleyen ölçütlerin başında geliyor.',
      'Çeviri belleği araçları, yinelenen ifadelerin tutarlı kalmasını sağlıyor.',
    ],
    a: 'Makine çevirisi, çevirmenin rolünü ortadan kaldırmak yerine dönüştürmektedir.',
    c: 'Çevirmenlik, anlam denetimi yönünde bir dönüşüm geçirmektedir.',
    v: 'Makine çıktısının insan denetimine gereksinim duyduğu kabul edilmektedir.',
    e: 'makine çevirisinin sınırsız yeterlilik iddiası',
    b: 'tartışma',
  },
  {
    s: [
      'Bisikletin ulaşım aracı olarak yaygınlaşması, yalnızca bisiklet yolu yapımıyla gerçekleşmiyor.',
      'İnsanların güvenli ve kesintisiz bir güzergâh bulabildiği kentlerde bisiklet kullanımı belirgin biçimde artıyor.',
      'Kopenhag’da ayrı yolların birbirine bağlanmasından sonra günlük bisikletli sayısı iki katına çıktı.',
      'Ancak park yerlerinin yetersizliği, bisikleti günlük işlerde kullanmayı zorlaştırıyor.',
      'Dolayısıyla bisiklet politikası, güzergâh ve park imkânını birlikte ele almalıdır.',
      'İş yerlerinde duş ve dolap bulunması, kullanımı kolaylaştıran etkenler arasında.',
      'Kış aylarında yolların temizlenmesi, bisiklet kullanımının sürekliliğini etkiliyor.',
      'Bisiklet sayısının artması, trafikte görünürlük sorununu da beraberinde getiriyor.',
    ],
    a: 'Bisiklet kullanımı, güvenli güzergâh ve park imkânıyla birlikte artar.',
    c: 'Yalnızca bisiklet yolu yapmak kullanımı artırmaya yetmez.',
    v: 'İnsanların güvenli güzergâh aradığı varsayılmaktadır.',
    e: 'ulaşım planlamasının tek öğeye indirgenmesi',
    b: 'açıklama',
  },
  {
    s: [
      'Gıda israfının büyük bölümü tüketici sofrasında değil, tedarik zincirinin erken aşamalarında oluşuyor.',
      'Ürünün biçimsel ölçütlere uymaması, hasat sonrasında daha satılmadan ayrılmasına yol açıyor.',
      'Bir market zinciri, eğri sebzeleri ayrı reyonda satmaya başladığında israf oranı belirgin biçimde düştü.',
      'Buna karşın tüketici alışkanlıkları, ürünün görünüşüne göre seçim yapmayı sürdürüyor.',
      'Bu yüzden israfı azaltmak, yalnızca lojistik değil aynı zamanda algı sorununu çözmeyi gerektiriyor.',
      'Evde yapılan israfın önemli kısmı, alışverişin plansız yapılmasından kaynaklanıyor.',
      'Son tüketim tarihi etiketleri, ürünün gerçekte ne kadar süre yenilebilir olduğunu tam yansıtmıyor.',
      'Porsiyon büyüklüğü, tabakta kalan yemek miktarını doğrudan etkiliyor.',
    ],
    a: 'Gıda israfını azaltmak için tedarik zinciri ve tüketici algısı birlikte ele alınmalıdır.',
    c: 'Ürünün görünüşüne dayalı seçim, israfı sürdüren etkenlerden biridir.',
    v: 'Biçimsel ölçütlerin israfı artırdığı kabul edilmektedir.',
    e: 'ürünlerin yalnızca görünüşüne göre seçilmesi',
    b: 'açıklama',
  },
  {
    s: [
      'Denizlerdeki plastik kirliliğinin kaynağı çoğunlukla karadaki kullanım alışkanlıklarıdır.',
      'Akarsularla taşınan atıklar, okyanuslardaki birikimin büyük bölümünü oluşturuyor.',
      'Bir kıyı kentinde yağmur suyu ızgaralarına konulan filtreler, denize ulaşan atık miktarını azalttı.',
      'Ancak temizleme çalışmaları, kirliliğin oluşumunu engellemediği için kalıcı çözüm sağlamıyor.',
      'Bu nedenle kıyı temizliği, kaynağında önleme politikalarıyla birlikte yürütülmelidir.',
      'Deniz canlılarının plastiği gıda sanması, zincirin tamamını etkiliyor.',
      'Kıyı yerleşimlerinde atık su arıtma kapasitesi, denize ulaşan kirliliğin ölçüsünü belirliyor.',
      'Balıkçılık ağlarından kopan parçalar, kıyıya vuran atığın önemli bölümünü oluşturuyor.',
    ],
    a: 'Deniz kirliliğiyle mücadele, kaynağında önlemeyi gerektirir.',
    c: 'Yalnızca temizlik çalışmaları kirliliği önlemede yetersizdir.',
    v: 'Karadaki kullanımın deniz kirliliğinin temel kaynağı olduğu varsayılmaktadır.',
    e: 'deniz kirliliğinin yalnızca temizlikle çözülmeye çalışılması',
    b: 'tartışma',
  },
  {
    s: [
      'Kütüphane binalarının tasarımı, okuma davranışını sessizce yönlendiren bir etkiye sahip.',
      'Işığın ve oturma düzeninin doğru kurulduğu mekânlarda kullanıcılar daha uzun süre kalıyor.',
      'Bir şehir kütüphanesi, rafları azaltıp çalışma alanlarını genişlettiğinde ziyaretçi sayısı arttı.',
      'Ne var ki bu düzenleme, kitaba erişimi kolaylaştırmak yerine kitapları depoya taşıma eğilimi doğuruyor.',
      'Dolayısıyla kütüphane tasarımı, çalışma ve okuma işlevlerini dengelemek zorunda.',
      'Sessiz bölmelerin camla ayrılması, bu dengeyi kurmanın yollarından biri.',
      'Koleksiyonun büyüklüğü, mekânın kullanım biçimini tek başına açıklamaya yetmiyor.',
      'Gece açık kalan salonlar, öğrencilerin mekânı kullanma biçimini değiştirdi.',
    ],
    a: 'Kütüphane tasarımı, çalışma ve okuma işlevlerini dengelemelidir.',
    c: 'Çalışma alanlarının genişletilmesi kitaba erişimi zayıflatabilir.',
    v: 'Mekân düzeninin kullanıcı davranışını etkilediği varsayılmaktadır.',
    e: 'kütüphane tasarımında rafların geri plana atılması',
    b: 'tartışma',
  },
  {
    s: [
      'Geleneksel mutfak, tariflerden çok yöntemlerin kuşaktan kuşağa aktarılmasıyla yaşıyor.',
      'Yemeğin tadı, kullanılan malzemeden çok hazırlanış sırasına ve süresine bağlı.',
      'Bir aşçı, kurutma yöntemini yazıya geçirmediği için aynı tarif iki köyde farklı sonuç veriyor.',
      'Ancak yazılı tarif eksikliği, yöntemin kaybolmasını hızlandırıyor.',
      'Bu nedenle geleneksel mutfağın korunması, yöntemlerin kayda geçirilmesini gerektiriyor.',
      'Yöresel ürünlerin coğrafi işaretle tescillenmesi, bu kaydın bir parçası.',
      'Yöresel ürünlerin mevsimi, yemeğin hazırlanış takvimini de belirliyor.',
      'Bakır kapların kalaylanması, yemek tadını etkileyen eski bir yöntemdir.',
    ],
    a: 'Geleneksel mutfağın sürmesi, yöntemlerin kayda geçirilmesine bağlıdır.',
    c: 'Sözlü aktarım, yöntemin korunmasında yetersiz kalmaktadır.',
    v: 'Yöntemin tariften daha belirleyici olduğu varsayılmaktadır.',
    e: 'geleneksel tariflerin yazıya geçirilmemesi',
    b: 'açıklama',
  },
  {
    s: [
      'Sokak hayvanlarının bakımı, hayvanseverlerin kişisel çabasına bırakıldığında kent ölçeğinde sürdürülemiyor.',
      'Beslenme ve kısırlaştırma hizmetleri düzenli yürütülmediğinde sokakta yaşayan hayvan sayısı hızla artıyor.',
      'Bir ilçede belediyenin kısırlaştırma programı iki yılda sokak hayvanı sayısını belirgin biçimde azalttı.',
      'Buna karşın bu hizmetler çoğunlukla gönüllü bağışlarla yürüdüğü için süreklilik kazanmıyor.',
      'Dolayısıyla sorunun çözümü, hizmetin kurumsal bütçeye bağlanmasından geçiyor.',
      'Kısırlaştırılan hayvanların işaretlenmesi, izlemeyi kolaylaştırıyor.',
      'Beslenme noktalarının sayısı, hayvanların kent içindeki dağılımını etkiliyor.',
      'Kısırlaştırma sonrası bakım, programın başarısını belirleyen aşamadır.',
    ],
    a: 'Sokak hayvanları sorunu, kurumsal ve sürekli hizmetle çözülebilir.',
    c: 'Gönüllü bağışlara dayanan hizmetler kalıcı olamamaktadır.',
    v: 'Düzenli kısırlaştırmanın hayvan sayısını azalttığı varsayılmaktadır.',
    e: 'sokak hayvanları bakımının kişisel çabaya bırakılması',
    b: 'tartışma',
  },
  {
    s: [
      'Dikkat süresinin kısalması, çoğunlukla teknolojinin tek başına yarattığı bir sonuç olarak sunuluyor.',
      'Oysa dikkat, ortamın uyaran yoğunluğuna göre biçimlenen bir beceridir.',
      'Sessiz bir odada çalışan öğrenciler, aynı süre boyunca kesintisiz çalışmada daha başarılı oldu.',
      'Ancak günlük yaşamın büyük bölümü, bildirimlerle kesilen ortamlarda geçiyor.',
      'Bu nedenle dikkati geliştirmek, yalnızca irade değil ortam tasarımı sorunudur.',
      'Çalışma masasının sadeleştirilmesi, kesintileri azaltmanın en kolay yolu.',
      'Bildirimlerin kapatılması, kesintisiz çalışma süresini belirgin biçimde uzatıyor.',
      'Uzun toplantılar, katılımcıların dikkatini ilk yarım saatten sonra dağıtıyor.',
    ],
    a: 'Dikkat süresi, ortam tasarımıyla doğrudan ilişkilidir.',
    c: 'Dikkat sorununu yalnızca teknolojiye bağlamak eksik bir açıklamadır.',
    v: 'Ortamın dikkat üzerinde belirleyici etkisi olduğu kabul edilmektedir.',
    e: 'dikkat sorununun tek nedene indirgenmesi',
    b: 'tartışma',
  },
  {
    s: [
      'Harita okuma, bir kâğıdı değil bir mekânı anlama becerisidir.',
      'Simgelerin anlamını bilmek, yön bulmanın yalnızca ilk adımıdır.',
      'Arazide yürüyen bir grup, haritadaki yükselti eğrilerini okumadığı için patikayı bulmakta zorlandı.',
      'Ne var ki sayısal haritalar, yön duygusunu zayıflatabildiği için bu becerinin yerini tam olarak almıyor.',
      'Dolayısıyla harita eğitimi, araç kullanımından bağımsız düşünülmemeli.',
      'Pusula ve haritanın birlikte kullanımı, en güvenilir yöntem olmayı sürdürüyor.',
      'Yön bulma becerisi, arazide tekrarlandıkça kalıcı hâle geliyor.',
      'Ölçek bilgisi, iki nokta arasındaki gerçek uzaklığı hesaplamayı sağlıyor.',
    ],
    a: 'Harita okuma, mekânı anlamaya dayanan bir beceridir.',
    c: 'Sayısal araçlar, yön bulma becerisinin yerini tam olarak tutmamaktadır.',
    v: 'Simgelerin anlaşılmasının yön bulmaya yetmediği varsayılmaktadır.',
    e: 'harita okumanın yalnızca araç kullanımı sayılması',
    b: 'açıklama',
  },
  {
    s: [
      'Amatör astronomlar, gökyüzü gözlemlerinde profesyonel araştırmalara katkı sağlayabiliyor.',
      'Geniş zaman dilimlerine yayılan gözlemler, tek bir gözlemevinin yakalayamayacağı değişimleri ortaya çıkarıyor.',
      'Bir kuyruklu yıldızın parlaklık değişimi, amatörlerin düzenli kayıtlarıyla belgelendi.',
      'Ancak kayıtların ortak bir ölçüte göre tutulmaması, verilerin karşılaştırılmasını güçleştiriyor.',
      'Bu nedenle amatör gözlem ağları, ortak bir kayıt standardı geliştirmeye yöneliyor.',
      'Basit teleskoplar, bu tür gözlemler için çoğu zaman yeterli oluyor.',
      'Gözlem defterlerinin düzenli tutulması, verilerin sonradan incelenmesini kolaylaştırıyor.',
      'Şehir ışıkları, derin gökyüzü gözlemlerini giderek güçleştiriyor.',
    ],
    a: 'Amatör astronomlar, ortak ölçütler geliştirdiklerinde bilime katkı sunar.',
    c: 'Kayıtların ortak ölçüte bağlanması, verilerin karşılaştırılmasını kolaylaştıracaktır.',
    v: 'Amatör gözlemlerin bilimsel değer taşıdığı varsayılmaktadır.',
    e: 'amatör gözlem kayıtlarında ortak ölçüt bulunmaması',
    b: 'açıklama',
  },
  {
    s: [
      'Kâğıt tüketimini azaltma çabaları, çoğunlukla dijitalleşmeyle özdeşleştiriliyor.',
      'Oysa dijital araçların ürettiği atık ve enerji tüketimi, hesaba katılmadığında tablo eksik kalıyor.',
      'Bir kurum, belgelerini dijitale taşıdıktan sonra sunucu enerji giderlerinin arttığını gördü.',
      'Buna karşın kâğıdın geri dönüşüm oranı, birçok ülkede hâlâ düşük düzeyde.',
      'Dolayısıyla tüketim tartışması, kâğıt ve dijitalin toplam etkisi üzerinden yürütülmeli.',
      'Çift taraflı baskı, kâğıt kullanımını yarıya indirebiliyor.',
      'Ofislerde kullanılan kâğıdın önemli bölümü tek kullanımlık çıktılardan oluşuyor.',
      'Dijital arşivlerin yedeklenmesi, kâğıdın sağladığı güvenceyi tam olarak karşılamıyor.',
    ],
    a: 'Kâğıt tüketimi tartışması, dijitalin toplam etkisini de içermelidir.',
    c: 'Dijitalleşmenin çevresel etkisi, sanıldığı kadar düşük olmayabilir.',
    v: 'Dijital araçların da kaynak tükettiği kabul edilmektedir.',
    e: 'dijitalleşmenin koşulsuz çözüm sayılması',
    b: 'tartışma',
  },
  {
    s: [
      'Çocuk oyunlarının en değerli yanı, kuralların oyun sırasında yeniden müzakere edilebilmesidir.',
      'Bu esneklik, çocuğun hem uzlaşma hem de kural kurma becerisini birlikte geliştiriyor.',
      'Bahçede oynayan çocukların, kuralları kendi aralarında değiştirerek çatışmayı çözdüğü gözlendi.',
      'Ancak ekran başındaki oyunlarda kurallar yazılım tarafından belirlendiği için bu müzakere ortadan kalkıyor.',
      'Bu yüzden oyun alanları, çocuğun kural değiştirebildiği serbestliği korumalı.',
      'Yetişkin müdahalesi, oyunun bu işlevini çoğu zaman zayıflatıyor.',
      'Oyun alanlarının sayısı, çocukların açık havada geçirdiği süreyi doğrudan etkiliyor.',
      'Oyun kurallarının çocuklar arasında aktarılması, kültürün en eski biçimlerinden biridir.',
    ],
    a: 'Serbest oyun, çocuğun kural kurma becerisini geliştirir.',
    c: 'Kuralları yazılımın belirlediği oyunlar bu beceriyi sınırlamaktadır.',
    v: 'Çocuğun kuralları değiştirebildiğinde öğrendiği varsayılmaktadır.',
    e: 'oyunun yetişkin denetimine bırakılması',
    b: 'tartışma',
  },
  {
    s: [
      'Arıcılık, bal üretiminden çok bitki örtüsünün sürmesine yaptığı katkıyla değerlendirilmeli.',
      'Tozlaşma sayesinde meyve bahçelerinde verim belirgin biçimde artıyor.',
      'Bir yörede kovan sayısı artırıldığında elma bahçelerinde ürün miktarı iki katına çıktı.',
      'Ne var ki bilinçsiz ilaçlama, kolonilerin toplu kaybına yol açabiliyor.',
      'Dolayısıyla tarım politikası, arıcılığı ilaçlama takvimiyle birlikte planlamalı.',
      'Kovanların yerleştirilmesi, rüzgâr yönüne göre yapılıyor.',
      'Kovanların gölgelenmesi, sıcak bölgelerde koloni kaybını azaltıyor.',
      'Bal verimi, bulunulan yörenin çiçeklenme takvimine göre değişiyor.',
    ],
    a: 'Arıcılık, tarımsal verimi destekleyen bir etkinliktir.',
    c: 'İlaçlama takvimiyle arıcılığın birlikte planlanması gerekmektedir.',
    v: 'Tozlaşmanın verimi artırdığı kabul edilmektedir.',
    e: 'ilaçlamanın arıcılıktan bağımsız planlanması',
    b: 'açıklama',
  },
  {
    s: [
      'Ses kayıt arşivleri, yazılı belgelerin aktaramadığı ayrıntıları koruyor.',
      'Bir konuşmanın tonu ve duraksamaları, metne geçirildiğinde kaybolan anlam katmanları taşıyor.',
      'Bir radyo arşivi, yarım kalan cümleler sayesinde bir dönemin konuşma alışkanlığını belgeledi.',
      'Ancak manyetik bantların bozulması, kayıtların önemli bölümünü kalıcı olarak yok ediyor.',
      'Bu nedenle sayısallaştırma, arşivlerin öncelikli işi hâline gelmiş durumda.',
      'Kayıtların açık erişime açılması, araştırmacıların işini kolaylaştırıyor.',
      'Kayıtların kimlik bilgileri, arşivin kullanılabilirliğini belirleyen temel öğedir.',
      'Manyetik bantların saklama koşulları, kaydın ömrünü belirliyor.',
    ],
    a: 'Ses arşivleri, yazılı belgelerin taşıyamadığı anlam katmanlarını korur.',
    c: 'Sayısallaştırma, arşivlerin korunması için zorunlu hâle gelmiştir.',
    v: 'Ses kaydının metinden daha fazla bilgi taşıdığı varsayılmaktadır.',
    e: 'ses arşivlerinde bant bozulmasına karşı önlem alınmaması',
    b: 'açıklama',
  },
  {
    s: [
      'Toplu taşımanın cazip hâle gelmesi, araç sayısını artırmaktan çok bekleme süresini kısaltmaya bağlı.',
      'Yolcu, hattın sıklığına güvendiğinde otomobilini bırakmaya daha istekli oluyor.',
      'Bir kentte sefer aralığı on dakikaya indirildiğinde hat kullanımı belirgin biçimde arttı.',
      'Buna karşın aktarma noktalarındaki uzun beklemeler, bu güveni zedeliyor.',
      'Dolayısıyla hat planlaması, sefer sıklığı ve aktarma süresi birlikte düşünülerek yapılmalı.',
      'Tek bilet uygulaması, aktarmayı yolcu açısından kolaylaştırıyor.',
      'Durak bilgilendirme ekranları, yolcunun hattı kullanma kararını kolaylaştırıyor.',
      'Gece seferlerinin azlığı, vardiyalı çalışanların ulaşımını güçleştiriyor.',
    ],
    a: 'Toplu taşımanın çekiciliği, bekleme süresinin kısalığına bağlıdır.',
    c: 'Aktarma noktalarındaki gecikmeler, yolcunun güvenini azaltmaktadır.',
    v: 'Yolcunun sefer sıklığına göre araç seçimi yaptığı varsayılmaktadır.',
    e: 'toplu taşımada yalnızca araç sayısının artırılması',
    b: 'tartışma',
  },
  {
    s: [
      'Yağmur suyu hasadı, kuraklıkla mücadelede en ucuz ve en hızlı sonuç veren yöntemlerden biridir.',
      'Çatılardan toplanan su, bahçe sulamasında kullanılarak şebeke yükünü azaltıyor.',
      'Bir okulda kurulan toplama sistemi, bahçe sulamasının tamamını karşıladı.',
      'Ancak depolama alanlarının maliyeti, yöntemin yaygınlaşmasını yavaşlatıyor.',
      'Bu nedenle hasat sistemleri, yeni yapılarda tasarıma baştan dâhil edilmeli.',
      'Filtre bakımı, su kalitesini korumanın temel koşulu.',
      'Toplama yüzeyinin genişliği, elde edilen su miktarını doğrudan belirliyor.',
      'İlk yağışla gelen su, çatı yüzeyindeki tozu taşıdığı için ayrı toplanıyor.',
    ],
    a: 'Yağmur suyu hasadı, doğru planlandığında etkili bir çözümdür.',
    c: 'Depolama maliyeti, yöntemin yaygınlaşmasını sınırlamaktadır.',
    v: 'Toplanan suyun sulamada kullanılabildiği varsayılmaktadır.',
    e: 'yağmur suyu hasadının yapı tasarımının dışında tutulması',
    b: 'açıklama',
  },
  {
    s: [
      'Fotoğraf, gerçeği olduğu gibi kaydetmez; çerçeveye gireni seçerek kurar.',
      'Kadraj, neyin dışarıda bırakıldığına dair verdiği kararla anlam üretiyor.',
      'Bir savaş fotoğrafının kenarındaki boşluk, karede görünenin ötesine dair ipucu veriyor.',
      'Ne var ki izleyici, fotoğrafı çoğu zaman doğrudan bir kanıt olarak okuma eğiliminde.',
      'Bu yüzden görsel okuryazarlık, çerçevenin dışında kalanı sormayı gerektiriyor.',
      'Alt yazılar, fotoğrafın anlamını belirgin biçimde yönlendirebiliyor.',
      'Aynı sahnenin iki farklı kadrajı, birbirine karşıt anlamlar üretebiliyor.',
      'Fotoğrafın çekildiği an, karenin anlamını belirleyen en güçlü öğedir.',
    ],
    a: 'Fotoğraf, seçme yoluyla anlam kuran bir temsil biçimidir.',
    c: 'Fotoğrafı doğrudan kanıt saymak eksik bir okumadır.',
    v: 'Kadrajın anlam ürettiği kabul edilmektedir.',
    e: 'fotoğrafın tartışmasız kanıt sayılması',
    b: 'tartışma',
  },
  {
    s: [
      'El yazısının terk edilmesi, yalnızca bir araç değişikliği değil bilişsel bir dönüşümdür.',
      'Yazarken harfleri kurma çabası, bilginin bellekte daha iyi tutunmasını sağlıyor.',
      'Notlarını elle tutan öğrenciler, aynı dersi dinleyenlere göre kavramları daha iyi hatırladı.',
      'Ancak ders süreleri kısaldıkça hızlı yazma zorunluluğu bu avantajı azaltıyor.',
      'Dolayısıyla tartışma, araç seçiminden çok notun nasıl tutulduğuyla ilgili.',
      'Klavye hızı, uzun metinlerde belirgin üstünlük sağlıyor.',
      'Not tutma biçimi, öğrencinin dersi dinleme alışkanlığını da etkiliyor.',
      'Defter düzeni, konuların sonradan hatırlanmasını kolaylaştırıyor.',
    ],
    a: 'El yazısı, öğrenmeyi destekleyen bilişsel bir etkinliktir.',
    c: 'Yazma hızının artması, el yazısının öğrenme avantajını zayıflatabilir.',
    v: 'Harfleri kurma çabasının belleği güçlendirdiği varsayılmaktadır.',
    e: 'el yazısı tartışmasının araç seçimine indirgenmesi',
    b: 'tartışma',
  },
  {
    s: [
      'Kuş göçü, mevsim değişimine verilen basit bir tepki değil, kuşaklar boyu aktarılan bir yön bulma becerisidir.',
      'Genç kuşlar, manyetik alan ve yıldız konumundan yararlanarak rotalarını belirliyor.',
      'İşaretlenen leyleklerin izlediği hat, yıllar içinde çok az değişti.',
      'Ancak iklim değişikliği, göç zamanlamasını böceklerin çoğalma dönemiyle uyumsuz hâle getiriyor.',
      'Bu nedenle göç takvimindeki kaymalar, türlerin beslenme düzenini doğrudan etkiliyor.',
      'Kıyı sulak alanları, göç yollarındaki en önemli konaklama noktalarıdır.',
      'Göç yollarındaki ışık kirliliği, gece uçan kuşların yönünü şaşırtabiliyor.',
      'Göç döneminde beslenme alanlarının korunması, türlerin yolculuğunu kolaylaştırıyor.',
    ],
    a: 'Kuş göçü, kalıtımla aktarılan bir yön bulma becerisine dayanır.',
    c: 'İklim değişikliği, göç eden türlerin beslenmesini olumsuz etkilemektedir.',
    v: 'Kuşların yön bulmada birden çok ipucundan yararlandığı varsayılmaktadır.',
    e: 'kuş göçünün yalnızca mevsimlik tepki sayılması',
    b: 'açıklama',
  },
  {
    s: [
      'Yavaş şehir hareketi, kent yaşamını yalnızca hız üzerinden değerlendirmeye bir itirazdır.',
      'Hareket, yerel üretimi ve yaya ölçeğini korumayı öne çıkarıyor.',
      'Bir ilçede açılan yerel pazar, üreticinin ürününü aracısız satmasını sağladı.',
      'Ne var ki bu yaklaşım, turizm baskısı altında kolayca bir tanıtım etiketine dönüşebiliyor.',
      'Dolayısıyla hareketin anlamı, uygulamada yerel üreticiye sağladığı yararla ölçülmeli.',
      'Yaya yollarının genişletilmesi, hareketin en görünür adımlarından biridir.',
      'Yerel pazarın sürekliliği, üreticinin üretim planını güvenle yapmasını sağlıyor.',
      'Yerel üretici sayısının azalması, hareketin sürdürülebilirliğini zayıflatıyor.',
    ],
    a: 'Yavaş şehir hareketi, yerel üretimi koruduğu ölçüde anlam kazanır.',
    c: 'Hareketin tanıtım etiketine dönüşme riski bulunmaktadır.',
    v: 'Yerel üretimin korunmasının kent yaşamını iyileştirdiği varsayılmaktadır.',
    e: 'yavaş şehir hareketinin tanıtım etiketine dönüşmesi',
    b: 'tartışma',
  },
  {
    s: [
      'Zanaat eğitimi, bilginin sözle aktarılamayan bölümünü görünür kılıyor.',
      'Usta, çırağa yalnızca tekniği değil malzemeyle kurulan ilişkiyi de aktarıyor.',
      'Bir marangoz atölyesinde çıraklar, ahşabın nemini dokunarak anlamayı öğreniyor.',
      'Ancak sertifika programları, bu tür sezgisel bilgiyi ölçemediği için çoğu zaman göz ardı ediyor.',
      'Bu yüzden zanaat eğitimi, atölye ortamını koruyacak biçimde düzenlenmeli.',
      'Usta sayısının azalması, aktarımın sürekliliğini tehdit ediyor.',
      'Atölyede geçirilen süre, tekniğin öğrenilmesinde en belirleyici etkendir.',
      'Aletlerin bakımı, işin niteliğini belirleyen görünmez bir ustalık göstergesidir.',
    ],
    a: 'Zanaat eğitimi, atölyede aktarılan sezgisel bilgiye dayanır.',
    c: 'Sertifika programları, zanaat bilgisinin bir bölümünü ölçememektedir.',
    v: 'Bazı bilgilerin yalnızca uygulamayla aktarılabildiği varsayılmaktadır.',
    e: 'zanaat bilgisinin ölçülebilir beceriye indirgenmesi',
    b: 'tartışma',
  },
  {
    s: [
      'Radyo, görüntünün yokluğunu bir kısıt değil bir anlatım olanağı olarak kullanıyor.',
      'Dinleyici, sesin bıraktığı boşluğu kendi imgeleriyle dolduruyor.',
      'Bir radyo tiyatrosu, tek bir ses efektiyle dinleyicide güçlü bir mekân duygusu uyandırdı.',
      'Ancak yayın sürelerinin kısalması, uzun anlatı biçimlerini geri plana itiyor.',
      'Dolayısıyla radyo anlatıcılığı, süre baskısı altında biçim değiştiriyor.',
      'Podcast yayıncılığı, bu anlatı geleneğini dijital ortama taşıdı.',
      'Ses kaydının stüdyoda kurgulanması, anlatının ritmini belirliyor.',
      'Dinleyici mektupları, yayın içeriğinin biçimlenmesinde belirleyici oldu.',
    ],
    a: 'Radyo, görüntüsüzlüğü anlatım zenginliğine dönüştürür.',
    c: 'Yayın sürelerinin kısalması, uzun anlatıları sınırlamaktadır.',
    v: 'Dinleyicinin sesle mekân kurabildiği varsayılmaktadır.',
    e: 'yayın sürelerinin anlatı biçimlerini daraltması',
    b: 'açıklama',
  },
  {
    s: [
      'Bitki ıslahı, doğanın kendiliğinden yaptığı seçilimi insan eliyle hızlandırma çabasıdır.',
      'Verim artışı, tek bir özelliğin öne çıkarılmasıyla sağlanıyor.',
      'Kuraklığa dayanıklı bir buğday çeşidi, on yıllık seçilim sonunda geliştirildi.',
      'Ancak tek özelliğe odaklanmak, çeşidin başka hastalıklara duyarlı kalmasına yol açabiliyor.',
      'Bu nedenle ıslah programları, dayanıklılığı bütün olarak değerlendirmeli.',
      'Yerel çeşitlerin korunması, genetik çeşitlilik açısından önem taşıyor.',
      'Tarla denemeleri, laboratuvar sonuçlarının gerçek koşullarda sınanmasını sağlıyor.',
      'Tohumluk dağıtımı, yeni çeşitlerin tarlaya ulaşmasını sağlıyor.',
    ],
    a: 'Bitki ıslahında tek özelliğe odaklanmak risklidir.',
    c: 'Verim odaklı ıslah, hastalıklara duyarlılığı artırabilir.',
    v: 'Seçilimin istenen özelliği kalıcı kıldığı varsayılmaktadır.',
    e: 'bitki ıslahında tek özelliğe odaklanılması',
    b: 'tartışma',
  },
  {
    s: [
      'Spor sakatlanmalarının çoğu, kondisyon eksikliğinden çok antrenman düzenindeki ani değişimlerden kaynaklanıyor.',
      'Kaslar, yük artışına kademeli uyum sağladığında sakatlanma riski azalıyor.',
      'Bir koşu grubunda haftalık mesafenin yüzde ondan fazla artırılmaması kuralı sakatlıkları belirgin biçimde düşürdü.',
      'Ne var ki yarışma takvimi, sporcuyu bu sınırı aşmaya zorlayabiliyor.',
      'Dolayısıyla antrenman planı, takvim baskısından bağımsız kurulmalı.',
      'Isınma süresinin kısalığı, en sık görülen hata olmayı sürdürüyor.',
      'Antrenman sonrası dinlenme süresi, kasların toparlanmasında belirleyici rol oynuyor.',
      'Isınma hareketleri, kasın yüklenmeye hazırlanmasını sağlıyor.',
    ],
    a: 'Sakatlanmaların önlenmesi, antrenman yükünün kademeli artırılmasına bağlıdır.',
    c: 'Yarışma takvimi, antrenman sınırlarını zorlayabilmektedir.',
    v: 'Kasların artan yüke kademeli uyum sağladığı varsayılmaktadır.',
    e: 'yarışma takviminin antrenman yükünü zorlaması',
    b: 'açıklama',
  },
  {
    s: [
      'Gölge oyunu, perdeye yansıyan görüntüden çok oyuncunun sesiyle kurduğu dünyaya dayanıyor.',
      'Tek bir figür, sesin değişmesiyle onlarca karaktere dönüşüyor.',
      'Bir usta, aynı tasviri üç ayrı sesle oynayarak dinleyicide farklı kişiler yaratıyor.',
      'Ancak genç izleyici, görüntüye alıştığı için ses oyununa daha az dikkat ediyor.',
      'Bu nedenle gölge oyununun aktarımı, ses tekniğinin öğretilmesini gerektiriyor.',
      'Perde boyutu, oyunun izleyiciyle kurduğu mesafeyi belirliyor.',
      'Perde arkasındaki ışık kaynağı, figürün gölgesinin keskinliğini belirliyor.',
      'Perde ölçüsü, figürlerin izleyici tarafından algılanma biçimini etkiliyor.',
    ],
    a: 'Gölge oyununun özü, sesle kurulan anlatımdır.',
    c: 'Ses tekniğinin öğretilmemesi, oyunun aktarımını zayıflatmaktadır.',
    v: 'İzleyicinin ses değişimini karakter olarak algıladığı varsayılmaktadır.',
    e: 'gölge oyununun görsel gösteriye indirgenmesi',
    b: 'tartışma',
  },
  {
    s: [
      'Dijital arşivleme, belgeyi kopyalamak değil okunabilir tutmayı üstlenmek demektir.',
      'Dosya biçimleri hızla eskidiği için bugün açılan bir belge yarın açılmayabiliyor.',
      'Bir kurum, on yıl önce kaydettiği raporların bir bölümünü açamadığını fark etti.',
      'Buna karşın biçim dönüştürme işlemleri, belgenin aslına sadakatini tartışmalı hâle getiriyor.',
      'Dolayısıyla arşivleme, biçim ve özgünlük arasında bir denge kurmayı gerektiriyor.',
      'Açık kaynaklı biçimler, uzun vadeli erişim açısından avantaj sağlıyor.',
      'Yedekleme düzeni, arşivin beklenmedik kayıplara karşı korunmasını sağlıyor.',
      'Üst veri eksikliği, belgelerin aranmasını neredeyse olanaksız kılıyor.',
    ],
    a: 'Dijital arşivleme, belgenin gelecekte okunabilirliğini güvenceye almalıdır.',
    c: 'Biçim dönüştürme, belgenin özgünlüğünü tartışmalı kılabilir.',
    v: 'Dosya biçimlerinin zamanla kullanımdan kalktığı kabul edilmektedir.',
    e: 'dijital arşivlemede erişilebilirliğin gözetilmemesi',
    b: 'tartışma',
  },
  {
    s: [
      'Kahve, bir içecek olmanın ötesinde kentte buluşma biçimlerini düzenleyen bir kurumdur.',
      'Kahvehaneler, farklı mesleklerden insanların aynı masada konuşmasını sağlıyor.',
      'Bir mahallede açılan kahve dükkânı, kısa sürede yerel haberlerin dolaştığı bir yere dönüştü.',
      'Ancak zincir işletmelerin yaygınlaşması, bu tür mahalle işlevini zayıflatıyor.',
      'Bu nedenle kahve kültürü tartışması, mekânın toplumsal işleviyle ilgilidir.',
      'Sabah saatlerinde masaların paylaşılması, bu işlevin en belirgin göstergesidir.',
      'Mekânın oturma düzeni, masalar arasındaki sohbetin süresini etkiliyor.',
      'Kavurma derecesi, içeceğin tadını belirleyen en temel değişkendir.',
    ],
    a: 'Kahve mekânları, kentin toplumsal ilişkilerini düzenler.',
    c: 'Zincir işletmeler, mahalle kahvehanelerinin işlevini zayıflatmaktadır.',
    v: 'Ortak mekânların insanları bir araya getirdiği varsayılmaktadır.',
    e: 'kahve mekânlarının toplumsal işlevinin yok sayılması',
    b: 'açıklama',
  },
  {
    s: [
      'Bir köprünün başarısı, açıklığının uzunluğundan çok yükü nasıl dağıttığıyla ölçülür.',
      'Taşıyıcı sistem, yükü ayaklara aktararak yapının kendi ağırlığını dengeliyor.',
      'Asma bir köprüde kabloların gerilimi, tabliyenin salınımını sınırlayacak biçimde hesaplanıyor.',
      'Ancak bakım ihmal edildiğinde en sağlam sistem bile beklenenden kısa sürede yoruluyor.',
      'Dolayısıyla köprü güvenliği, tasarım kadar düzenli denetimi de gerektiriyor.',
      'Rüzgâr tüneli denemeleri, salınım riskini önceden görmeyi sağlıyor.',
      'Korozyon denetimi, yapının taşıyıcı sistemindeki yorulmayı erken gösteriyor.',
      'Genleşme derzleri, sıcaklık değişiminin yapıya verdiği zararı sınırlıyor.',
    ],
    a: 'Köprü güvenliği, tasarım ve düzenli bakımın birlikte yürütülmesine bağlıdır.',
    c: 'Bakımı ihmal edilen bir köprü, tasarımı iyi olsa da risk taşır.',
    v: 'Yük dağıtımının yapının ömrünü belirlediği varsayılmaktadır.',
    e: 'köprü bakımının tasarımdan ayrı düşünülmesi',
    b: 'açıklama',
  },
  {
    s: [
      'Rüzgâr enerjisi, kurulumu tamamlandığında yakıt gerektirmeyen bir üretim biçimidir.',
      'Türbinin ürettiği elektrik, rüzgârın sürekliliğine bağlı olduğu için dalgalı bir seyir izliyor.',
      'Bir bölgede türbinlerin yıllık üretimi, rüzgâr ölçümlerine dayanılarak önceden tahmin edildi.',
      'Ne var ki üretimdeki dalgalanma, şebekenin dengeleme kapasitesini zorluyor.',
      'Bu nedenle rüzgâr yatırımları, depolama çözümleriyle birlikte planlanmalı.',
      'Türbin kanatlarının geri dönüşümü, sektörün çözemediği sorunlardan biridir.',
      'Türbin yerleşimi, komşu türbinlerin ürettiği elektriği azaltabiliyor.',
      'Kanat uzunluğu, türbinin birim zamanda ürettiği elektriği belirliyor.',
    ],
    a: 'Rüzgâr enerjisi, depolama çözümleriyle birlikte planlanmalıdır.',
    c: 'Üretimdeki dalgalanma, şebeke için dengeleme ihtiyacı doğurmaktadır.',
    v: 'Rüzgâr ölçümlerinin üretimi önceden kestirebildiği varsayılmaktadır.',
    e: 'enerji planlamasında depolamanın hesaba katılmaması',
    b: 'tartışma',
  },
  {
    s: [
      'Çocuk edebiyatı, anlatının basitleştirilmesi değil çocuğun dünyasına uygun kurulması demektir.',
      'Çocuk, metinde kendi sorularına karşılık bulduğunda okumayı sürdürüyor.',
      'Resimli bir kitapta boş bırakılan ayrıntılar, çocuğun kendi hikâyesini kurmasına olanak tanıdı.',
      'Ancak yetişkinlerin seçtiği kitaplar, çoğu zaman ders verme amacı taşıdığı için bu alanı daraltıyor.',
      'Dolayısıyla çocuk edebiyatı, öğüt vermeden anlatmayı başardığında etkili oluyor.',
      'Şiir kitapları, çocuk okurların en az yöneldiği tür olmayı sürdürüyor.',
      'Kitabın puntosu ve satır aralığı, çocuğun okuma isteğini etkiliyor.',
      'Çeviri kitaplar, çocuğun farklı kültürleri tanımasını sağlıyor.',
    ],
    a: 'Çocuk edebiyatı, öğüt vermeden anlatabildiğinde etkilidir.',
    c: 'Ders verme amacı, çocuk edebiyatının alanını daraltmaktadır.',
    v: 'Çocuğun metinde kendi sorusuna karşılık aradığı varsayılmaktadır.',
    e: 'çocuk kitabının öğüt aracı sayılması',
    b: 'tartışma',
  },
  {
    s: [
      'Sesli kitaplar, okuma edimini gözden kulağa taşıyarak yeni bir dinleyici kitlesi oluşturuyor.',
      'Yolculuk ve ev işi gibi zamanlarda dinleme, okumaya ayrılan süreyi artırıyor.',
      'Bir kütüphane, sesli kitap koleksiyonunu genişlettiğinde ödünç alma sayısında artış gördü.',
      'Ancak dinleme hızının artırılması, anlamlandırmayı güçleştirebiliyor.',
      'Bu nedenle sesli kitap, basılı okumanın yerine değil yanına konumlanmalı.',
      'Anlatıcının sesi, metnin anlamını belirgin biçimde etkiliyor.',
      'Anlatıcının vurguları, metnin mizahını duyulur kılıyor.',
      'Kulaklıkla dinleme, metne odaklanmayı kolaylaştıran bir alışkanlıktır.',
    ],
    a: 'Sesli kitaplar, basılı okumayı tamamlayan bir araçtır.',
    c: 'Dinleme hızının aşırı artırılması, anlamayı zayıflatabilir.',
    v: 'Dinlemenin de okuma kadar anlam kurduğu varsayılmaktadır.',
    e: 'sesli kitabın basılı okumanın yerine konması',
    b: 'açıklama',
  },
  {
    s: [
      'Şehir planlaması, harita üzerinde çizilen sınırlardan çok insanların gündelik güzergâhlarını düzenler.',
      'Bir sokağın genişliği, orada kurulan ilişkilerin niteliğini belirliyor.',
      'Yaya öncelikli düzenlenen bir caddede esnaf geliri, araç odaklı düzenlemeye göre arttı.',
      'Ancak planlama kararları uzun vadeli olduğu için sonuçları geç görülüyor.',
      'Dolayısıyla katılım, planlamanın sonuçlarını önceden tartışmanın tek yolu.',
      'Kaldırım genişliği, erişilebilirlik açısından en çok tartışılan ölçüttür.',
      'Kaldırımların sürekliliği, yaşlı yayaların güzergâh seçimini belirliyor.',
      'Yeşil alanların dağılımı, mahalleler arasındaki yaşam kalitesi farkını belirliyor.',
    ],
    a: 'Şehir planlaması, gündelik yaşam pratiklerini biçimlendirir.',
    c: 'Planlama kararlarının sonuçları gecikmeli olarak görülmektedir.',
    v: 'Sokak düzeninin toplumsal ilişkileri etkilediği varsayılmaktadır.',
    e: 'şehir planlamasının katılımdan yoksun yürütülmesi',
    b: 'tartışma',
  },
  {
    s: [
      'Toprak erozyonu, yavaş ilerlediği için çoğu zaman ancak verim düştüğünde fark ediliyor.',
      'Bitki örtüsünün zayıflaması, yağmur damlalarının toprağı sürüklemesini kolaylaştırıyor.',
      'Eğimli bir arazide teraslama yapıldığında yıllık toprak kaybı belirgin biçimde azaldı.',
      'Ne var ki kısa vadeli kazanç için yapılan derin sürüm, erozyonu hızlandırıyor.',
      'Bu nedenle tarımsal destekler, toprağı koruyan yöntemleri ödüllendirmeli.',
      'Erozyonla taşınan toprak, akarsuların taşıma kapasitesini de artırıyor.',
      'Eğim ve yağış rejimi, toprak kaybının hızını birlikte belirliyor.',
      'Anızın tarlada bırakılması, rüzgârla taşınan toprağı azaltıyor.',
    ],
    a: 'Toprak erozyonuyla mücadele, koruyucu tarım yöntemlerine bağlıdır.',
    c: 'Kısa vadeli kazanç kaygısı, erozyonu artıran uygulamalara yol açmaktadır.',
    v: 'Bitki örtüsünün toprağı tuttuğu kabul edilmektedir.',
    e: 'tarım desteklerinin toprağı korumaması',
    b: 'açıklama',
  },
  {
    s: [
      'Müzik eğitimi, yetenekli öğrencileri ayıklamak yerine herkesin işitme becerisini geliştirmeyi amaçlamalı.',
      'Kulak, düzenli alıştırmayla ayırt etme yetisini zamanla kazanıyor.',
      'Bir okulda haftada iki saatlik toplu müzik dersi, öğrencilerin ritim becerisini belirgin biçimde artırdı.',
      'Ancak ders saatlerinin azaltılması, bu gelişimin sürekliliğini kesintiye uğratıyor.',
      'Dolayısıyla müzik eğitimi, süreklilik sağlandığında kalıcı bir beceriye dönüşüyor.',
      'Toplu çalma, dinleme alışkanlığını da güçlendiriyor.',
      'Toplu çalmanın gerektirdiği eşzamanlılık, dikkat becerisini de geliştiriyor.',
      'Enstrüman çalmak, el becerisiyle işitme arasında bağ kuruyor.',
    ],
    a: 'Müzik eğitimi, süreklilik sağlandığında kalıcı beceri kazandırır.',
    c: 'Ders saatlerinin azaltılması, müzik becerisinin gelişimini kesintiye uğratmaktadır.',
    v: 'İşitme becerisinin alıştırmayla geliştiği varsayılmaktadır.',
    e: 'müziğin yalnızca yetenekli öğrencilere ayrılması',
    b: 'tartışma',
  },
];

const SHAPES: number[][] = [
  [0, 1, 2, 3, 4, 5, 6],
  [0, 1, 2, 3, 4, 5, 7],
  [0, 1, 2, 3, 4, 6, 7],
  [0, 1, 2, 3, 5, 6, 7],
];

function para(unit: Unit, variant: number) {
  const idx = SHAPES[variant % SHAPES.length];
  return { text: idx.map((k) => unit.s[k]).join(' '), idx };
}

function unitAt(index: number, offset: number): Unit {
  return UNITS[(index + offset) % UNITS.length];
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLocaleLowerCase('tr-TR') + text.slice(1);
}

const LEADS = [
  'Ancak ',
  'Ne var ki ',
  'Buna karşın ',
  'Yine de ',
  'Oysa ',
  'Bu nedenle ',
  'Dolayısıyla ',
  'Bu yüzden ',
  'Çünkü ',
  'Zira ',
];

function stripLead(text: string): string {
  for (const lead of LEADS) {
    if (text.startsWith(lead)) return text.slice(lead.length);
  }
  return text;
}

const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/* ---------------------------------------------------------------- */
/* Ana düşünce                                                       */
/* ---------------------------------------------------------------- */

function genMain() {
  run(
    40,
    (i) => {
      const unit = unitAt(i, 0);
      const p = para(unit, Math.floor(i / 10) % 4);
      return {
        id: `bulk-av-main-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${p.text}\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?`,
        answer: unit.a,
        distractors: [unit.s[2], unit.s[3], unitAt(i, 11).a],
        explanation: `Parçanın bütünü “${unit.a}” yargısını desteklemektedir. “${unit.s[2]}” yalnızca bir örnektir, “${unit.s[3]}” ise konunun sınırını belirten bir ayrıntıdır; ikisi de parçanın tamamını kapsamaz.`,
      };
    },
    T_MAIN,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Yardımcı düşünce                                                  */
/* ---------------------------------------------------------------- */

function genSupport() {
  run(
    35,
    (i) => {
      const unit = unitAt(i, 3);
      const variant = Math.floor(i / 9) % 4;
      const p = para(unit, variant);
      const missing = [0, 1, 2, 3, 4, 5, 6, 7].filter((k) => !p.idx.includes(k))[0];
      const mentioned = p.idx.filter((k) => k !== 0).slice(0, 3);
      return {
        id: `bulk-av-sup-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${p.text}\n\nBu parçada aşağıdakilerden hangisine değinilmemiştir?`,
        answer: unit.s[missing],
        distractors: mentioned.map((k) => unit.s[k]),
        explanation: `Parçada ${mentioned.map((k) => `“${unit.s[k].slice(0, 40)}...”`).join(', ')} ifadeleri yer almaktadır. Ancak “${unit.s[missing].slice(0, 60)}...” cümlesi bu parçanın kapsamı dışında kalmıştır.`,
      };
    },
    T_MAIN,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Anlatım biçimi                                                    */
/* ---------------------------------------------------------------- */

function genStyle() {
  run(
    24,
    (i) => {
      const unit = unitAt(i, 5);
      const p = para(unit, Math.floor(i / 8) % 4);
      const others = ['açıklama', 'tartışma', 'betimleme', 'öyküleme'].filter((x) => x !== unit.b);
      return {
        id: `bulk-av-style-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${p.text}\n\nBu parçanın anlatım biçimi ağırlıklı olarak aşağıdakilerden hangisidir?`,
        answer: unit.b,
        distractors: others,
        explanation: `Parçada bir görüş öne sürülüp gerekçelerle savunulmakta, karşı görüş sınırlandırılmakta ve bir sonuca bağlanmaktadır. Bu düzenleme ${unit.b} anlatımının belirgin özelliğidir; olay anlatımı ya da ayrıntılı betimleme yoktur.`,
      };
    },
    T_MAIN,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Tutarlılık                                                        */
/* ---------------------------------------------------------------- */

function genCoherence() {
  run(
    18,
    (i) => {
      const unit = unitAt(i, 7);
      const p = para(unit, Math.floor(i / 6) % 4);
      const foreign = unitAt(i, 13).s[2];
      const pos = 2 + (i % 3);
      const list = p.idx.slice(0, 6).map((k) => unit.s[k]);
      list.splice(pos, 0, foreign);
      const numbered = list.map((text, k) => `${ROM[k]}. ${text}`).join(' ');
      const wrong = ROM.filter((r) => r !== ROM[pos]).slice(0, 3);
      return {
        id: `bulk-av-coh-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${numbered}\n\nBu parçada numaralanmış cümlelerden hangisi anlatımın akışını bozmaktadır?`,
        answer: ROM[pos],
        distractors: wrong,
        explanation: `${ROM[pos]}. cümle “${foreign.slice(0, 55)}...” biçiminde konuyla ilgisiz bir başka konuya geçmektedir. Diğer cümleler aynı konunun gerekçe, örnek ve sonuç zincirini sürdürmektedir.`,
      };
    },
    T_MAIN,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Çıkarım                                                           */
/* ---------------------------------------------------------------- */

function genInference() {
  run(
    40,
    (i) => {
      const unit = unitAt(i, 1);
      const p = para(unit, Math.floor(i / 10) % 4);
      return {
        id: `bulk-av-inf-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${p.text}\n\nBu parçadan çıkarılabilecek en kapsamlı yargı aşağıdakilerden hangisidir?`,
        answer: unit.c,
        distractors: [unit.s[2], unitAt(i, 9).c, unit.s[5]],
        explanation: `Parçadaki gerekçeler “${unit.c}” yargısını desteklemektedir. Diğer seçenekler ya tek bir örneğe dayanır ya da parçanın sözünü etmediği bir konuya aittir.`,
      };
    },
    T_INF,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Varsayım                                                          */
/* ---------------------------------------------------------------- */

function genAssumption() {
  run(
    38,
    (i) => {
      const unit = unitAt(i, 4);
      const p = para(unit, Math.floor(i / 10) % 4);
      return {
        id: `bulk-av-asm-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${p.text}\n\nYazarın bu parçadaki görüşünü savunurken dayandığı varsayım aşağıdakilerden hangisidir?`,
        answer: unit.v,
        distractors: [unitAt(i, 6).v, unitAt(i, 12).v, unit.s[3]],
        explanation: `Yazarın öne sürdüğü sonuç, “${unit.v}” kabulü olmadan geçerlilik kazanmaz; bu nedenle söz konusu kabul, savunmanın zorunlu dayanağıdır. Diğer seçenekler parçada savunulan görüşün dışında kalır.`,
      };
    },
    T_INF,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Eleştiri                                                          */
/* ---------------------------------------------------------------- */

function genCritique() {
  run(
    38,
    (i) => {
      const unit = unitAt(i, 2);
      const p = para(unit, Math.floor(i / 10) % 4);
      return {
        id: `bulk-av-crt-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${p.text}\n\nYazarın bu parçada eleştirdiği durum aşağıdakilerden hangisidir?`,
        answer: unit.e,
        distractors: [unitAt(i, 8).e, unitAt(i, 15).e, unitAt(i, 21).e],
        explanation: `Parçada olumlu bulunan uygulamaya karşı çıkılan nokta “${unit.e}” olarak belirtilmiştir. Diğer seçenekler başka metinlerin eleştiri konularıdır.`,
      };
    },
    T_INF,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Paragraf tamamlama                                                */
/* ---------------------------------------------------------------- */

function genCompletion() {
  run(
    40,
    (i) => {
      const unit = unitAt(i, 6);
      const p = para(unit, Math.floor(i / 10) % 4);
      const full = [...p.idx, ...([0, 1, 2, 3, 4, 5, 6, 7].filter((k) => !p.idx.includes(k)))];
      const cut = 1 + (i % 6);
      const removed = unit.s[full[cut]];
      const text = full.map((k, n) => (n === cut ? '_____' : unit.s[k])).join(' ');
      return {
        id: `bulk-av-cmp-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${text}\n\nBu parçada boş bırakılan yere anlam akışına göre aşağıdakilerden hangisi getirilmelidir?`,
        answer: removed,
        distractors: [unitAt(i, 10).s[1], unitAt(i, 17).s[2], unitAt(i, 23).s[4]],
        explanation: `Boşluğun bulunduğu yerde parçanın gerekçe zinciri kesintiye uğramaktadır. “${removed.slice(0, 60)}...” cümlesi bu boşluğu doldurarak önceki ve sonraki yargı arasındaki bağı kurar.`,
      };
    },
    T_CONJ,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Sıralama                                                          */
/* ---------------------------------------------------------------- */

function orderText(seq: number[]): string {
  return seq.map((d) => ROM[d]).join(' - ');
}

function genOrder() {
  run(
    37,
    (i) => {
      const unit = unitAt(i, 8);
      const p = para(unit, Math.floor(i / 10) % 4);
      const four = p.idx.slice(0, 6).map((k) => unit.s[k]);
      const perm = shuffle([0, 1, 2, 3, 4, 5]);
      const display = perm.map((c) => four[c]);
      const numbered = display.map((text, k) => `${ROM[k]}. ${text}`).join(' ');
      const answer = orderText([0, 1, 2, 3, 4, 5].map((c) => perm.indexOf(c)));
      const cands = new Set<string>();
      let guard = 0;
      while (cands.size < 3 && guard < 300) {
        guard += 1;
        const p2 = shuffle([0, 1, 2, 3, 4, 5]);
        const text = orderText(p2);
        if (text !== answer) cands.add(text);
      }
      return {
        id: `bulk-av-ord-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${numbered}\n\nBu parçada numaralanmış cümlelerin anlamlı bir bütün oluşturacak biçimde sıralanışı aşağıdakilerden hangisidir?`,
        answer,
        distractors: [...cands],
        explanation: `Parça önce konuyu ortaya koyan yargıyla başlar, ardından gerekçeyi, sonra sınırlayıcı karşıtlığı ve en sonunda sonucu sıralar. Bu akış ${answer} sırasına karşılık gelir.`,
      };
    },
    T_CONJ,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Bağlaç ve ilişki                                                  */
/* ---------------------------------------------------------------- */

function genConjunction() {
  run(
    40,
    (i) => {
      const unit = unitAt(i, 9);
      const kind = i % 3;
      const first = unit.s[0];

      if (kind === 0) {
        const second = lowerFirst(stripLead(unit.s[3]));
        const correct = pick(['Buna karşın', 'Ne var ki', 'Ancak', 'Yine de', 'Oysa']);
        const wrong = ['Bu nedenle', 'Dolayısıyla', 'Örneğin'];
        return {
          id: `bulk-av-con-${i + 1}`,
          difficulty: difficultyAt(i),
          prompt: `${first}\n\n_____ ${second}\n\nBu parçada boş bırakılan yere anlam akışına göre aşağıdakilerden hangisi getirilmelidir?`,
          answer: correct,
          distractors: wrong,
          explanation: `İlk cümlede olumlu bir durum dile getirilirken ikinci cümlede bunu sınırlayan aykırı bir durum belirtilmiştir. Bu karşıtlık ilişkisini “${correct}” bağlacı kurar; sonuç bildiren bağlaçlar anlam akışını bozar.`,
        };
      }

      if (kind === 1) {
        const second = lowerFirst(stripLead(unit.s[1]));
        const correct = pick(['Çünkü', 'Zira']);
        const wrong = ['Buna karşın', 'Örneğin', 'Sonuç olarak'];
        return {
          id: `bulk-av-con-${i + 1}`,
          difficulty: difficultyAt(i),
          prompt: `${first}\n\n_____ ${second}\n\nBu parçada boş bırakılan yere anlam akışına göre aşağıdakilerden hangisi getirilmelidir?`,
          answer: correct,
          distractors: wrong,
          explanation: `İkinci cümle, ilk cümlede öne sürülen yargının gerekçesini vermektedir. Neden ilişkisini kuran bağlaç “${correct}” olur; karşıtlık ya da örnekleme bağlacı bu işlevi karşılamaz.`,
        };
      }

      const second = lowerFirst(stripLead(unit.s[4]));
      const correct = pick(['Bu nedenle', 'Dolayısıyla', 'Bu yüzden', 'Sonuç olarak']);
      const wrong = ['Buna karşın', 'Örneğin', 'Ayrıca'];
      return {
        id: `bulk-av-con-${i + 1}`,
        difficulty: difficultyAt(i),
        prompt: `${first}\n\n_____ ${second}\n\nBu parçada boş bırakılan yere anlam akışına göre aşağıdakilerden hangisi getirilmelidir?`,
        answer: correct,
        distractors: wrong,
        explanation: `İlk cümledeki saptama, ikinci cümlede bir sonuca bağlanmaktadır. Bu sonuç ilişkisini “${correct}” bağlacı kurar; karşıtlık bildiren bağlaç anlamı tersine çevirir.`,
      };
    },
    T_CONJ,
    VER,
  );
}

/* ---------------------------------------------------------------- */
/* Üretim                                                            */
/* ---------------------------------------------------------------- */

genPctInc();
genPctReverse();
genProfit();
genMixture();
genWork();
genInverse();
genSpeed();
genAvgSpeed();
genConsecutive();
genArith();
genGeom();
genPattern();
genAge();

genMain();
genSupport();
genStyle();
genCoherence();
genInference();
genAssumption();
genCritique();
genCompletion();
genOrder();
genConjunction();

export { questions };

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'ALES::Sayısal': {
    'Yüzde Problemleri': topicIds[T_PCT] ?? [],
    'İşçi ve Hız Problemleri': topicIds[T_WRK] ?? [],
    'Diziler ve Örüntüler': topicIds[T_SEQ] ?? [],
  },
  'ALES::Sözel': {
    'Ana Düşünce': topicIds[T_MAIN] ?? [],
    'Bağlaç ve İlişki': topicIds[T_CONJ] ?? [],
    Çıkarım: topicIds[T_INF] ?? [],
  },
};
