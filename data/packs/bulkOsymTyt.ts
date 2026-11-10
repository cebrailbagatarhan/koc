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
const COURSE_NAME = 'TYT';

const T_SOZ = 'Sözcük ve Cümle Anlamı';
const T_PAR = 'Paragraf';
const T_DIL = 'Dil Bilgisi';
const T_YAZ = 'Yazım ve Noktalama';
const T_MAT = 'Temel Matematik';
const T_PRB = 'Problemler';
const T_GEO = 'Geometri';
const T_FIZ = 'Fizik';
const T_KIM = 'Kimya';
const T_BIY = 'Biyoloji';
const T_TAR = 'Tarih';
const T_COG = 'Coğrafya';
const T_FEL = 'Felsefe';

const questions: EmbeddedQuestionSeed[] = [];
const topicIds: Record<string, string[]> = {};
const usedBodies = new Set<string>();
const counters: Record<string, number> = {};

function nextId(prefix: string): string {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  return `bulk-tyt-${prefix}-${counters[prefix]}`;
}

function mc(input: {
  id: string;
  prompt: string;
  answer: string;
  distractors: string[];
  explanation: string;
  difficulty?: QuestionDifficulty;
  kind?: QuestionKind;
}): EmbeddedQuestionSeed {
  const options = shuffle([input.answer, ...input.distractors]);
  if (options.length !== 4 || new Set(options).size !== 4) {
    throw new Error(`Seçenek hatası: ${input.id}`);
  }
  return {
    id: input.id,
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: input.prompt,
    options,
    correctAnswer: input.answer,
    explanation: input.explanation,
    difficulty: input.difficulty ?? 'standard',
    questionKind: input.kind ?? 'multiple-choice',
  };
}

type Draft = {
  id: string;
  prompt: string;
  answer: string;
  distractors: string[];
  explanation: string;
  difficulty: QuestionDifficulty;
  kind?: QuestionKind;
};

function add(draft: Draft, topic: string): boolean {
  const key = `${draft.prompt}|${[draft.answer, ...draft.distractors].slice().sort().join('|')}`
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('tr-TR');
  if (usedBodies.has(key)) return false;
  usedBodies.add(key);
  questions.push(mc(draft));
  topicIds[topic] = [...(topicIds[topic] ?? []), draft.id];
  return true;
}

function run(count: number, make: (index: number) => Draft | null, topic: string) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 600) {
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
  while (out.length < 3 && step < 90) {
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

function distractorsFrom(pool: string[], answer: string, count = 3): string[] {
  const options = shuffle(pool.filter((item) => item !== answer));
  const out = options.slice(0, count);
  if (out.length < count) throw new Error(`havuz yetersiz: ${answer}`);
  return out;
}

function cap(text: string): string {
  return text.charAt(0).toLocaleUpperCase('tr-TR') + text.slice(1);
}

/* ---------------------------------------------------------------- */
/* Temel Matematik                                                   */
/* ---------------------------------------------------------------- */

function genTemelIslem() {
  run(
    35,
    (i) => {
      const kind = i % 5;
      const difficulty = difficultyAt(i);

      if (kind === 0) {
        const a = 7 + Math.floor(rnd() * 18);
        const b = 5 + Math.floor(rnd() * 15);
        const c = 3 + Math.floor(rnd() * 7);
        const d = 4 + Math.floor(rnd() * 18);
        const ans = (a + b) * c - d;
        return {
          id: nextId('mat'),
          difficulty,
          prompt: `(${a} + ${b}) × ${c} − ${d} işleminin sonucu kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [a + b * c - d, (a + b) * c + d, a + b * (c - d), ans + c]),
          explanation: `Önce parantez içi hesaplanır: ${a} + ${b} = ${a + b}. Sonra ${a + b} × ${c} = ${(a + b) * c} bulunur, ${d} çıkarılınca ${ans} kalır.`,
        };
      }

      if (kind === 1) {
        const a = 6 + Math.floor(rnd() * 10);
        const b = 2 + Math.floor(rnd() * 4);
        const k = 3 + Math.floor(rnd() * 7);
        const ans = a * a - b * b + k;
        return {
          id: nextId('mat'),
          difficulty,
          prompt: `${a}² − ${b}² + √${k * k} işleminin sonucu kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [a * a - b * b - k, (a - b) * (a - b) + k, a * a + b * b + k, ans - 2 * k]),
          explanation: `${a}² = ${a * a}, ${b}² = ${b * b} ve √${k * k} = ${k} olur. ${a * a} − ${b * b} = ${a * a - b * b}, buna ${k} eklenince ${ans} bulunur.`,
        };
      }

      if (kind === 2) {
        const b = pick([3, 4, 5, 6, 8]);
        const k = 4 + Math.floor(rnd() * 15);
        const x = b * k;
        const a = 1 + Math.floor(rnd() * (b - 1));
        const ans = a * k;
        return {
          id: nextId('mat'),
          difficulty,
          prompt: `${x} sayısının ${a}/${b} kadarı kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [x - ans, x / b, ans + b, x / a]),
          explanation: `${x} sayısı ${b} eşit parçaya ayrıldığında bir parça ${x} ÷ ${b} = ${k} olur. ${a} parça ${a} × ${k} = ${ans} eder.`,
        };
      }

      if (kind === 3) {
        const a = 3 + Math.floor(rnd() * 8);
        const b = 2 + Math.floor(rnd() * 6);
        const c = 4 + Math.floor(rnd() * 9);
        const d = 2 + Math.floor(rnd() * 6);
        const ans = -(a * b) - c * d;
        return {
          id: nextId('mat'),
          difficulty,
          prompt: `(−${a}) × ${b} + ${c} × (−${d}) işleminin sonucu kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [a * b - c * d, -a * b + c * d, ans - a, ans + b]),
          explanation: `(−${a}) × ${b} = −${a * b} ve ${c} × (−${d}) = −${c * d} olur. İki negatif sayı toplandığında −${a * b + c * d}, yani ${fmt(ans)} bulunur.`,
        };
      }

      const d = 6 + Math.floor(rnd() * 9);
      const q = 4 + Math.floor(rnd() * 20);
      const r = 1 + Math.floor(rnd() * (d - 1));
      const N = d * q + r;
      return {
        id: nextId('mat'),
        difficulty,
        prompt: `${N} sayısının ${d} ile bölümünden kalan kaçtır?`,
        answer: fmt(r),
        distractors: n3(r, [d - r, q, r + 1, d]),
        explanation: `${d} × ${q} = ${d * q} olduğundan ${N} − ${d * q} = ${r} kalır. Kalan, bölenden küçük olduğu için sonuç ${r} olur.`,
      };
    },
    T_MAT,
  );
}

function genYuzdeOran() {
  run(
    34,
    (i) => {
      const kind = i % 5;
      const difficulty = difficultyAt(i);

      if (kind === 0) {
        const N = (5 + Math.floor(rnd() * 36)) * 20;
        const a = (1 + Math.floor(rnd() * 9)) * 5;
        const ans = (N * a) / 100;
        return {
          id: nextId('mat'),
          difficulty,
          prompt: `${N} sayısının %${a} kadarı kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [N - ans, (N * a) / 10, ans + a, N / a]),
          explanation: `%${a} oranı ${a}/100 demektir. ${N} × ${a} ÷ 100 = ${ans} bulunur.`,
        };
      }

      if (kind === 1) {
        const N = (4 + Math.floor(rnd() * 30)) * 20;
        const a = (1 + Math.floor(rnd() * 8)) * 5;
        const ans = (N * (100 + a)) / 100;
        return {
          id: nextId('mat'),
          difficulty,
          prompt: `${N} TL olan bir ürünün fiyatı %${a} artırılırsa yeni fiyat kaç TL olur?`,
          answer: fmt(ans),
          distractors: n3(ans, [(N * a) / 100, N + a, (N * (100 - a)) / 100, ans - a]),
          explanation: `Artış tutarı ${N} × ${a} ÷ 100 = ${(N * a) / 100} TL’dir. Yeni fiyat ${N} + ${(N * a) / 100} = ${ans} TL olur.`,
        };
      }

      if (kind === 2) {
        const a = 2 + Math.floor(rnd() * 5);
        const b = 3 + Math.floor(rnd() * 6);
        if (a === b) return null;
        const k = 20 + Math.floor(rnd() * 30) * 5;
        const total = (a + b) * k;
        const small = Math.min(a, b) * k;
        return {
          id: nextId('mat'),
          difficulty,
          prompt: `${total} TL, ${a} ve ${b} sayılarıyla doğru orantılı paylaşılıyor. Küçük pay kaç TL’dir?`,
          answer: fmt(small),
          distractors: n3(small, [Math.max(a, b) * k, total / a, total / b, small + k]),
          explanation: `Toplam ${a} + ${b} = ${a + b} parçadır; bir parça ${total} ÷ ${a + b} = ${k} TL’dir. Küçük pay ${Math.min(a, b)} × ${k} = ${small} TL olur.`,
        };
      }

      if (kind === 3) {
        const p = pick([10, 20, 25, 40, 50, 80]);
        const total = (3 + Math.floor(rnd() * 18)) * 20;
        const part = (total * p) / 100;
        return {
          id: nextId('mat'),
          difficulty,
          prompt: `%${p}’si ${part} olan sayı kaçtır?`,
          answer: fmt(total),
          distractors: n3(total, [(part * 100) / (100 - p), part + p, (part * p) / 100, total + p]),
          explanation: `${part} sayının %${p}’si ise tamamı ${part} × 100 ÷ ${p} = ${total} olur.`,
        };
      }

      const b = (2 + Math.floor(rnd() * 20)) * 10;
      const p = (1 + Math.floor(rnd() * 9)) * 10;
      const a = (b * p) / 100;
      return {
        id: nextId('mat'),
        difficulty,
        prompt: `${a} sayısı ${b} sayısının yüzde kaçıdır?`,
        answer: fmt(p),
        distractors: n3(p, [100 - p, p + 10, p - 10, a]),
        explanation: `Oran ${a} ÷ ${b} = ${fmt(a / b)} olur; yüzdeye çevirmek için ${fmt(a / b)} × 100 = ${p} bulunur.`,
      };
    },
    T_MAT,
  );
}

/* ---------------------------------------------------------------- */
/* Problemler                                                        */
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
  [24, 8],
  [16, 48],
  [12, 6],
  [45, 90],
  [40, 10],
  [60, 30],
  [36, 12],
];

function genProblem() {
  run(
    35,
    (i) => {
      const kind = i % 5;
      const difficulty = difficultyAt(i);

      if (kind === 0) {
        const x = 3 + Math.floor(rnd() * 9);
        const y = 2 + Math.floor(rnd() * 8);
        const T = 40 + Math.floor(rnd() * 60);
        const total = 2 * T + 2 * y + x;
        if (total % 2 !== 0) return null;
        const v = (total - x - 2 * y) / 2;
        if (v <= 2) return null;
        const ans = v + x;
        return {
          id: nextId('prb'),
          difficulty,
          prompt: `Ali, Veli’den ${x} yaş büyüktür. ${y} yıl sonra yaşları toplamı ${total} olacaksa Ali bugün kaç yaşındadır?`,
          answer: fmt(ans),
          distractors: n3(ans, [v, ans + y, total - ans, ans - x]),
          explanation: `${y} yıl sonra yaşları toplamı ${total} ise bugünkü toplam ${total} − ${2 * y} = ${total - 2 * y} olur. Ali fazlalığı ${x} çıkarılınca iki eşit pay kalır: (${total - 2 * y} − ${x}) ÷ 2 = ${v}. Ali ${v} + ${x} = ${ans} yaşındadır.`,
        };
      }

      if (kind === 1) {
        const [a, b] = pick(WORK_PAIRS);
        const ans = (a * b) / (a + b);
        return {
          id: nextId('prb'),
          difficulty,
          prompt: `Bir işi A tek başına ${a} günde, B tek başına ${b} günde bitiriyor. İkisi birlikte çalışırsa aynı iş kaç günde biter?`,
          answer: fmt(ans),
          distractors: n3(ans, [(a + b) / 2, b - a, a + b, (a * b) / (b - a)]),
          explanation: `A bir günde 1/${a}, B 1/${b} kadar iş yapar. Birlikte bir günde 1/${a} + 1/${b} = ${a + b}/${a * b} iş biter; süre ${a * b} ÷ ${a + b} = ${ans} gün olur.`,
        };
      }

      if (kind === 2) {
        const a = (2 + Math.floor(rnd() * 5)) * 10;
        const b = (1 + Math.floor(rnd() * 4)) * 10;
        const p = (1 + Math.floor(rnd() * 5)) * 10;
        const ans = (a * p) / (a + b);
        if (!Number.isInteger(ans)) return null;
        return {
          id: nextId('prb'),
          difficulty,
          prompt: `%${p} tuz içeren ${a} litre çözeltiye ${b} litre saf su eklenmiştir. Yeni karışımın tuz oranı yüzde kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [p, (a * p) / (a - b), p - b, p / 2]),
          explanation: `Tuz miktarı ${a} × ${p} ÷ 100 = ${(a * p) / 100} litre olup değişmez. Yeni hacim ${a} + ${b} = ${a + b} litredir; oran ${(a * p) / 100} × 100 ÷ ${a + b} = ${ans} olur.`,
        };
      }

      if (kind === 3) {
        const k = 2 + Math.floor(rnd() * 5);
        const m = 3 + Math.floor(rnd() * 12);
        const x = 4 + Math.floor(rnd() * 20);
        const total = k * x + m;
        return {
          id: nextId('prb'),
          difficulty,
          prompt: `Bir sayının ${k} katının ${m} fazlası ${total} ise bu sayı kaçtır?`,
          answer: fmt(x),
          distractors: n3(x, [(total + m) / k, total / k, total - m, x + m]),
          explanation: `Denklem ${k}x + ${m} = ${total} biçimindedir. ${total} − ${m} = ${k * x}, ${k * x} ÷ ${k} = ${x} bulunur.`,
        };
      }

      const cost = (4 + Math.floor(rnd() * 26)) * 20;
      const p = (1 + Math.floor(rnd() * 9)) * 5;
      const sale = (cost * (100 + p)) / 100;
      return {
        id: nextId('prb'),
        difficulty,
        prompt: `Maliyeti ${cost} TL olan bir ürün ${sale} TL’ye satılmıştır. Bu satıştaki kâr yüzdesi kaçtır?`,
        answer: fmt(p),
        distractors: n3(p, [(sale * 100) / cost, 100 - p, p + 5, p - 5]),
        explanation: `Kâr ${sale} − ${cost} = ${sale - cost} TL’dir. Kâr yüzdesi maliyete göre hesaplanır: ${sale - cost} × 100 ÷ ${cost} = ${p} olur.`,
      };
    },
    T_PRB,
  );
}

const SPEED_PAIRS: Array<[number, number]> = [
  [40, 60],
  [30, 60],
  [20, 30],
  [10, 15],
  [12, 6],
  [20, 5],
  [60, 40],
  [15, 30],
  [45, 90],
  [24, 8],
  [16, 48],
  [80, 20],
  [40, 10],
  [90, 10],
  [36, 12],
  [72, 24],
];

function genHiz() {
  run(
    34,
    (i) => {
      const kind = i % 4;
      const difficulty = difficultyAt(i);

      if (kind === 0) {
        const v = (2 + Math.floor(rnd() * 18)) * 10;
        const t = 2 + Math.floor(rnd() * 5);
        const ans = v * t;
        return {
          id: nextId('prb'),
          difficulty,
          prompt: `Bir araç ${v} km/sa sabit hızla ${t} saat yol alıyor. Aldığı yol kaç kilometredir?`,
          answer: fmt(ans),
          distractors: n3(ans, [v + t, v / t, ans + t, ans - v]),
          explanation: `Yol = hız × zaman olduğundan ${v} × ${t} = ${ans} km bulunur.`,
        };
      }

      if (kind === 1) {
        const v = (3 + Math.floor(rnd() * 15)) * 10;
        const t = 2 + Math.floor(rnd() * 5);
        const x = v * t;
        return {
          id: nextId('prb'),
          difficulty,
          prompt: `${x} km’lik yolu ${v} km/sa sabit hızla giden bir araç yolculuğu kaç saatte tamamlar?`,
          answer: fmt(t),
          distractors: n3(t, [x * v, x - v, t + 1, x / (v * 2)]),
          explanation: `Zaman = yol ÷ hız olduğundan ${x} ÷ ${v} = ${t} saat bulunur.`,
        };
      }

      if (kind === 2) {
        const [v1, v2] = pick(SPEED_PAIRS);
        const ans = (2 * v1 * v2) / (v1 + v2);
        return {
          id: nextId('prb'),
          difficulty,
          prompt: `Bir araç gidişte ${v1} km/sa, dönüşte ${v2} km/sa hızla aynı yolu almıştır. Yolculuğun ortalama hızı kaç km/sa olur?`,
          answer: fmt(ans),
          distractors: n3(ans, [(v1 + v2) / 2, v1 + v2, Math.abs(v1 - v2), ans + 5]),
          explanation: `Eşit uzaklıkta ortalama hız 2 × ${v1} × ${v2} ÷ (${v1} + ${v2}) = ${ans} km/sa olur; hızların aritmetik ortalaması ${fmt((v1 + v2) / 2)} yanıltıcıdır.`,
        };
      }

      const v1 = (2 + Math.floor(rnd() * 10)) * 10;
      const v2 = (2 + Math.floor(rnd() * 10)) * 10;
      const t = 2 + Math.floor(rnd() * 4);
      const d = (v1 + v2) * t;
      return {
        id: nextId('prb'),
        difficulty,
        prompt: `Aralarında ${d} km bulunan iki araç aynı anda karşılıklı olarak hareket ediyor. Hızları ${v1} km/sa ve ${v2} km/sa ise kaç saat sonra karşılaşırlar?`,
        answer: fmt(t),
        distractors: n3(t, [d / v1, d / v2, t + 1, d / Math.abs(v1 - v2)]),
        explanation: `Yaklaşma hızı ${v1} + ${v2} = ${v1 + v2} km/sa olur. Karşılaşma süresi ${d} ÷ ${v1 + v2} = ${t} saat bulunur.`,
      };
    },
    T_PRB,
  );
}

/* ---------------------------------------------------------------- */
/* Geometri                                                          */
/* ---------------------------------------------------------------- */

function genAci() {
  run(
    35,
    (i) => {
      const kind = i % 5;
      const difficulty = difficultyAt(i);

      if (kind === 0) {
        const a = 30 + Math.floor(rnd() * 60);
        const b = 25 + Math.floor(rnd() * 50);
        const ans = 180 - a - b;
        if (ans < 20) return null;
        return {
          id: nextId('geo'),
          difficulty,
          prompt: `Bir üçgenin iki iç açısı ${a}° ve ${b}° ise üçüncü iç açısı kaç derecedir?`,
          answer: fmt(ans),
          distractors: n3(ans, [180 - a, 360 - a - b, a + b, ans + 10]),
          explanation: `Üçgenin iç açıları toplamı 180°’dir. ${a} + ${b} = ${a + b}, dolayısıyla üçüncü açı 180 − ${a + b} = ${ans}° olur.`,
        };
      }

      if (kind === 1) {
        const a = 30 + Math.floor(rnd() * 80);
        const ans = 180 - a;
        return {
          id: nextId('geo'),
          difficulty,
          prompt: `Bir açının ölçüsü ${a}° ise bu açıyla bütünler olan açının ölçüsü kaç derecedir?`,
          answer: fmt(ans),
          distractors: n3(ans, [90 - a, 360 - a, a, ans + 15]),
          explanation: `Bütünler açıların toplamı 180°’dir. Bu nedenle 180 − ${a} = ${ans}° bulunur; 90 − ${a} hesabı tümler açı içindir.`,
        };
      }

      if (kind === 2) {
        const n = pick([5, 6, 7, 8, 9, 10, 12]);
        const ans = (n - 2) * 180;
        return {
          id: nextId('geo'),
          difficulty,
          prompt: `Kenar sayısı ${n} olan bir çokgenin iç açıları toplamı kaç derecedir?`,
          answer: fmt(ans),
          distractors: n3(ans, [(n - 2) * 90, n * 180, 360, ans - 180]),
          explanation: `n kenarlı çokgen, bir köşeden çizilen köşegenlerle n − 2 üçgene ayrılır. ${n} kenar için (${n} − 2) × 180 = ${ans}° bulunur.`,
        };
      }

      if (kind === 3) {
        const n = pick([3, 4, 5, 6, 8, 9, 10, 12]);
        const ans = ((n - 2) * 180) / n;
        return {
          id: nextId('geo'),
          difficulty,
          prompt: `Bir düzgün ${n} kenarlı çokgenin bir iç açısının ölçüsü kaç derecedir?`,
          answer: fmt(ans),
          distractors: n3(ans, [360 / n, 180 - 360 / n, ans + 10, (n - 2) * 180]),
          explanation: `İç açılar toplamı (${n} − 2) × 180 = ${(n - 2) * 180}°’dir. Düzgün çokgende açılar eşit olduğundan bir açı ${(n - 2) * 180} ÷ ${n} = ${ans}° olur.`,
        };
      }

      const a = 20 + Math.floor(rnd() * 50);
      const ans = 90 - a;
      return {
        id: nextId('geo'),
        difficulty,
        prompt: `Bir dik üçgende dar açılardan birinin ölçüsü ${a}° ise diğer dar açının ölçüsü kaç derecedir?`,
        answer: fmt(ans),
        distractors: n3(ans, [180 - a, 90 + a, ans + 10, a]),
        explanation: `Dik üçgende açılar toplamı 180°, dik açı 90° olduğundan dar açıların toplamı 90°’dir. 90 − ${a} = ${ans}° bulunur.`,
      };
    },
    T_GEO,
  );
}

function genAlan() {
  run(
    34,
    (i) => {
      const kind = i % 5;
      const difficulty = difficultyAt(i);

      if (kind === 0) {
        const a = 4 + Math.floor(rnd() * 16);
        const b = 3 + Math.floor(rnd() * 14);
        const ans = a * b;
        return {
          id: nextId('geo'),
          difficulty,
          prompt: `Kenar uzunlukları ${a} cm ve ${b} cm olan dikdörtgenin alanı kaç cm²’dir?`,
          answer: fmt(ans),
          distractors: n3(ans, [2 * (a + b), a + b, ans + a, ans - b]),
          explanation: `Dikdörtgenin alanı kısa kenar ile uzun kenarın çarpımıdır: ${a} × ${b} = ${ans} cm². 2 × (${a} + ${b}) = ${2 * (a + b)} ise çevredir.`,
        };
      }

      if (kind === 1) {
        const t = 4 + Math.floor(rnd() * 14);
        const h = 3 + Math.floor(rnd() * 12);
        const ans = (t * h) / 2;
        if (!Number.isInteger(ans)) return null;
        return {
          id: nextId('geo'),
          difficulty,
          prompt: `Taban uzunluğu ${t} cm, bu tabana ait yüksekliği ${h} cm olan üçgenin alanı kaç cm²’dir?`,
          answer: fmt(ans),
          distractors: n3(ans, [t * h, (t + h) / 2, ans + t, ans - h]),
          explanation: `Üçgenin alanı taban ile yüksekliğin çarpımının yarısıdır: ${t} × ${h} ÷ 2 = ${ans} cm². Çarpımı ikiye bölmemek en sık yapılan hatadır.`,
        };
      }

      if (kind === 2) {
        const r = 2 + Math.floor(rnd() * 10);
        const ans = 3 * r * r;
        return {
          id: nextId('geo'),
          difficulty,
          prompt: `Yarıçapı ${r} cm olan dairenin alanı kaç cm²’dir? (π = 3 alınacaktır.)`,
          answer: fmt(ans),
          distractors: n3(ans, [2 * 3 * r, 3 * r, ans + r, 6 * r * r]),
          explanation: `Dairenin alanı π × r² formülüyle bulunur: 3 × ${r}² = 3 × ${r * r} = ${ans} cm². 2 × 3 × ${r} = ${6 * r} ise çevredir.`,
        };
      }

      if (kind === 3) {
        const a = 2 * (3 + Math.floor(rnd() * 8));
        const b = 2 * (1 + Math.floor(rnd() * 6));
        const h = 3 + Math.floor(rnd() * 9);
        const ans = ((a + b) / 2) * h;
        return {
          id: nextId('geo'),
          difficulty,
          prompt: `Alt tabanı ${a} cm, üst tabanı ${b} cm, yüksekliği ${h} cm olan yamuğun alanı kaç cm²’dir?`,
          answer: fmt(ans),
          distractors: n3(ans, [a + b, (a + b) * h, ans + h, ans - h]),
          explanation: `Yamuğun alanı (alt taban + üst taban) ÷ 2 × yükseklik ile bulunur: (${a} + ${b}) ÷ 2 = ${(a + b) / 2}, ${(a + b) / 2} × ${h} = ${ans} cm².`,
        };
      }

      const side = 3 + Math.floor(rnd() * 15);
      const cevre = 4 * side;
      const ans = side * side;
      return {
        id: nextId('geo'),
        difficulty,
        prompt: `Çevresi ${cevre} cm olan karenin alanı kaç cm²’dir?`,
        answer: fmt(ans),
        distractors: n3(ans, [cevre, cevre / 2, ans + side, 2 * side]),
        explanation: `Karenin dört kenarı eşit olduğundan bir kenar ${cevre} ÷ 4 = ${side} cm’dir. Alan ${side} × ${side} = ${ans} cm² olur.`,
      };
    },
    T_GEO,
  );
}

/* ---------------------------------------------------------------- */
/* Fizik                                                             */
/* ---------------------------------------------------------------- */

function genHareket() {
  run(
    35,
    (i) => {
      const kind = i % 5;
      const difficulty = difficultyAt(i);

      if (kind === 0) {
        const v = 2 + Math.floor(rnd() * 16);
        const t = 2 + Math.floor(rnd() * 8);
        const ans = v * t;
        return {
          id: nextId('fiz'),
          difficulty,
          prompt: `Sabit ${v} m/s hızla hareket eden bir cisim ${t} saniyede kaç metre yol alır?`,
          answer: fmt(ans),
          distractors: n3(ans, [v + t, v / t, ans + v, ans - t]),
          explanation: `Yol = hız × zaman bağıntısıyla ${v} × ${t} = ${ans} m bulunur.`,
        };
      }

      if (kind === 1) {
        const v1 = 2 + Math.floor(rnd() * 8);
        const dv = 2 + Math.floor(rnd() * 6);
        const t = 2 + Math.floor(rnd() * 6);
        const v2 = v1 + dv * t;
        const ans = dv;
        return {
          id: nextId('fiz'),
          difficulty,
          prompt: `Hızı ${v1} m/s olan bir cisim ${t} saniyede hızını ${v2} m/s’ye çıkarıyor. Cismin ivmesi kaç m/s²’dir?`,
          answer: fmt(ans),
          distractors: n3(ans, [v2 - v1 + t, v2 / t, (v2 - v1) * t, ans + 1]),
          explanation: `İvme, hız değişiminin geçen süreye oranıdır: (${v2} − ${v1}) ÷ ${t} = ${dv * t} ÷ ${t} = ${ans} m/s².`,
        };
      }

      if (kind === 2) {
        const t = 2 + Math.floor(rnd() * 7);
        const ans = 5 * t * t;
        return {
          id: nextId('fiz'),
          difficulty,
          prompt: `Durgun hâlden serbest bırakılan bir cisim ${t} saniyede kaç metre düşer? (g = 10 m/s², sürtünme yok.)`,
          answer: fmt(ans),
          distractors: n3(ans, [10 * t, 5 * t, ans / 2, 10 * t * t]),
          explanation: `Alınan yol h = ½ × g × t² bağıntısıyla bulunur: 0,5 × 10 × ${t * t} = ${ans} m. İvmenin kendisi 10 m/s² olduğu için 10 × ${t} sonucu yanlıştır.`,
        };
      }

      if (kind === 3) {
        const v = (2 + Math.floor(rnd() * 10)) * 10;
        const t = 2 + Math.floor(rnd() * 4);
        const x = v * t;
        return {
          id: nextId('fiz'),
          difficulty,
          prompt: `${x} km’lik yolu ${t} saatte alan bir aracın ortalama hızı kaç km/sa’dir?`,
          answer: fmt(v),
          distractors: n3(v, [x * t, x - t, v + 10, v / 2]),
          explanation: `Ortalama hız, alınan yolun geçen süreye bölümüdür: ${x} ÷ ${t} = ${v} km/sa.`,
        };
      }

      const kmh = pick([18, 36, 54, 72, 90, 108, 126, 144]);
      const ans = kmh / 3.6;
      return {
        id: nextId('fiz'),
        difficulty,
        prompt: `${kmh} km/sa hız kaç m/s’ye eşittir?`,
        answer: fmt(ans),
        distractors: n3(ans, [kmh / 10, kmh * 3.6, ans + 5, kmh / 2]),
        explanation: `km/sa değeri 3,6’ya bölünerek m/s’ye çevrilir: ${kmh} ÷ 3,6 = ${ans} m/s. 1 saat 3600 saniye, 1 km 1000 m olduğu için çarpan 3,6’dır.`,
      };
    },
    T_FIZ,
  );
}

function genKuvvet() {
  run(
    34,
    (i) => {
      const kind = i % 5;
      const difficulty = difficultyAt(i);

      if (kind === 0) {
        const m = 2 + Math.floor(rnd() * 10);
        const a = 2 + Math.floor(rnd() * 6);
        const ans = m * a;
        return {
          id: nextId('fiz'),
          difficulty,
          prompt: `Kütlesi ${m} kg olan bir cisme ${a} m/s² ivme kazandıran net kuvvet kaç newtondur?`,
          answer: fmt(ans),
          distractors: n3(ans, [m + a, m / a, ans + m, ans - a]),
          explanation: `Newton’ın ikinci yasasına göre F = m × a’dır. ${m} × ${a} = ${ans} N bulunur.`,
        };
      }

      if (kind === 1) {
        const m = 2 + Math.floor(rnd() * 40);
        const ans = m * 10;
        return {
          id: nextId('fiz'),
          difficulty,
          prompt: `Kütlesi ${m} kg olan bir cismin ağırlığı kaç newtondur? (g = 10 N/kg alınacaktır.)`,
          answer: fmt(ans),
          distractors: n3(ans, [m, m / 10, ans + 10, ans - m]),
          explanation: `Ağırlık, kütle ile yer çekimi ivmesinin çarpımıdır: ${m} × 10 = ${ans} N. Kütle ${m} kg olarak kalır, ağırlıkla karıştırılmamalıdır.`,
        };
      }

      if (kind === 2) {
        const f = (2 + Math.floor(rnd() * 18)) * 10;
        const x = 2 + Math.floor(rnd() * 9);
        const ans = f * x;
        return {
          id: nextId('fiz'),
          difficulty,
          prompt: `Bir cisme hareket doğrultusunda ${f} N’luk kuvvet ${x} metre boyunca uygulanıyor. Yapılan iş kaç joule olur?`,
          answer: fmt(ans),
          distractors: n3(ans, [f + x, f / x, ans / 2, ans + f]),
          explanation: `İş, kuvvet ile kuvvet yönünde alınan yolun çarpımıdır: ${f} × ${x} = ${ans} J.`,
        };
      }

      if (kind === 3) {
        const w = (3 + Math.floor(rnd() * 18)) * 100;
        const t = 2 + Math.floor(rnd() * 8);
        const ans = w / t;
        return {
          id: nextId('fiz'),
          difficulty,
          prompt: `Bir makine ${w} joule’lük işi ${t} saniyede yapıyor. Makinenin gücü kaç watt’tır?`,
          answer: fmt(ans),
          distractors: n3(ans, [w * t, w + t, ans / 2, ans + 10]),
          explanation: `Güç, birim zamanda yapılan iştir: ${w} ÷ ${t} = ${ans} W. İşin süreyle çarpılması gücü vermez.`,
        };
      }

      const k = (2 + Math.floor(rnd() * 12)) * 10;
      const x = 2 + Math.floor(rnd() * 8);
      const ans = k * x;
      return {
        id: nextId('fiz'),
        difficulty,
        prompt: `Yay sabiti ${k} N/m olan bir yay ${x} metre sıkıştırılırsa yayın uyguladığı kuvvet kaç newtondur?`,
        answer: fmt(ans),
        distractors: n3(ans, [k + x, k / x, ans / 2, ans + k]),
        explanation: `Hooke yasasına göre F = k × x’tir. ${k} × ${x} = ${ans} N bulunur; uzama miktarı metre cinsinden alınmalıdır.`,
      };
    },
    T_FIZ,
  );
}

/* ---------------------------------------------------------------- */
/* Kimya                                                             */
/* ---------------------------------------------------------------- */

type Element = { ad: string; sembol: string; z: number; a: number };

const ELEMENTS: Element[] = [
  { ad: 'hidrojen', sembol: 'H', z: 1, a: 1 },
  { ad: 'helyum', sembol: 'He', z: 2, a: 4 },
  { ad: 'lityum', sembol: 'Li', z: 3, a: 7 },
  { ad: 'karbon', sembol: 'C', z: 6, a: 12 },
  { ad: 'azot', sembol: 'N', z: 7, a: 14 },
  { ad: 'oksijen', sembol: 'O', z: 8, a: 16 },
  { ad: 'sodyum', sembol: 'Na', z: 11, a: 23 },
  { ad: 'magnezyum', sembol: 'Mg', z: 12, a: 24 },
  { ad: 'alüminyum', sembol: 'Al', z: 13, a: 27 },
  { ad: 'silisyum', sembol: 'Si', z: 14, a: 28 },
  { ad: 'fosfor', sembol: 'P', z: 15, a: 31 },
  { ad: 'kükürt', sembol: 'S', z: 16, a: 32 },
  { ad: 'klor', sembol: 'Cl', z: 17, a: 35 },
  { ad: 'argon', sembol: 'Ar', z: 18, a: 40 },
  { ad: 'potasyum', sembol: 'K', z: 19, a: 39 },
  { ad: 'kalsiyum', sembol: 'Ca', z: 20, a: 40 },
  { ad: 'demir', sembol: 'Fe', z: 26, a: 56 },
  { ad: 'bakır', sembol: 'Cu', z: 29, a: 64 },
  { ad: 'çinko', sembol: 'Zn', z: 30, a: 65 },
  { ad: 'gümüş', sembol: 'Ag', z: 47, a: 108 },
];

const SYMBOLS = ELEMENTS.map((element) => element.sembol);

function genAtom() {
  run(
    35,
    (i) => {
      const kind = i % 5;
      const difficulty = difficultyAt(i);
      const el = pick(ELEMENTS);

      if (kind === 0) {
        const ans = el.a - el.z;
        return {
          id: nextId('kim'),
          difficulty,
          prompt: `Kütle numarası ${el.a}, proton sayısı ${el.z} olan bir atomun nötron sayısı kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [el.a + el.z, el.z, el.a, ans + 2]),
          explanation: `Kütle numarası proton ve nötron sayılarının toplamıdır. Nötron sayısı ${el.a} − ${el.z} = ${ans} olur.`,
        };
      }

      if (kind === 1) {
        return {
          id: nextId('kim'),
          difficulty,
          prompt: `${cap(el.ad)} elementinin atom numarası (proton sayısı) kaçtır?`,
          answer: fmt(el.z),
          distractors: n3(el.z, [el.a, el.a - el.z, el.z + 2, el.z - 1]),
          explanation: `${el.ad} elementinin sembolü ${el.sembol} olup atom numarası ${el.z}’dir. Atom numarası proton sayısına eşittir; ${el.a} ise kütle numarasıdır.`,
        };
      }

      if (kind === 2) {
        const ans = el.z;
        return {
          id: nextId('kim'),
          difficulty,
          prompt: `Kütle numarası ${el.a}, nötron sayısı ${el.a - el.z} olan atomun proton sayısı kaçtır?`,
          answer: fmt(ans),
          distractors: n3(ans, [el.a, el.a - el.z, el.z + 1, el.a + el.z]),
          explanation: `Proton sayısı kütle numarasından nötron sayısı çıkarılarak bulunur: ${el.a} − ${el.a - el.z} = ${el.z}.`,
        };
      }

      if (kind === 3) {
        return {
          id: nextId('kim'),
          difficulty,
          prompt: `Nötr bir ${el.ad} atomunda kaç elektron bulunur?`,
          answer: fmt(el.z),
          distractors: n3(el.z, [el.a, el.a - el.z, el.z + 3, el.z - 2]),
          explanation: `Nötr atomda elektron sayısı proton sayısına eşittir. ${el.ad} atomunun proton sayısı ${el.z} olduğundan elektron sayısı da ${el.z}’dir.`,
        };
      }

      return {
        id: nextId('kim'),
        difficulty,
        prompt: `Atom numarası ${el.z} olan elementin sembolü aşağıdakilerden hangisidir?`,
        answer: el.sembol,
        distractors: distractorsFrom(SYMBOLS, el.sembol),
        explanation: `Atom numarası ${el.z} olan element ${el.ad} elementidir ve sembolü ${el.sembol} biçiminde yazılır.`,
      };
    },
    T_KIM,
  );
}

type Substance = { ad: string; formül: string; M: number };

const SUBSTANCES: Substance[] = [
  { ad: 'su', formül: 'H2O', M: 18 },
  { ad: 'karbondioksit', formül: 'CO2', M: 44 },
  { ad: 'oksijen gazı', formül: 'O2', M: 32 },
  { ad: 'azot gazı', formül: 'N2', M: 28 },
  { ad: 'metan', formül: 'CH4', M: 16 },
  { ad: 'sodyum hidroksit', formül: 'NaOH', M: 40 },
  { ad: 'kalsiyum karbonat', formül: 'CaCO3', M: 100 },
  { ad: 'sülfürik asit', formül: 'H2SO4', M: 98 },
  { ad: 'amonyak', formül: 'NH3', M: 17 },
  { ad: 'glikoz', formül: 'C6H12O6', M: 180 },
  { ad: 'etanol', formül: 'C2H5OH', M: 46 },
  { ad: 'hidrojen gazı', formül: 'H2', M: 2 },
  { ad: 'kükürt dioksit', formül: 'SO2', M: 64 },
  { ad: 'kalsiyum oksit', formül: 'CaO', M: 56 },
  { ad: 'magnezyum oksit', formül: 'MgO', M: 40 },
];

function genMol() {
  run(
    34,
    (i) => {
      const kind = i % 5;
      const difficulty = difficultyAt(i);
      const s = pick(SUBSTANCES);

      if (kind === 0) {
        const n = 2 + Math.floor(rnd() * 5);
        const ans = n * s.M;
        return {
          id: nextId('kim'),
          difficulty,
          prompt: `${n} mol ${s.ad} (${s.formül}) kaç gramdır? (Mol kütlesi ${s.M} g/mol alınacaktır.)`,
          answer: fmt(ans),
          distractors: n3(ans, [s.M / n, n + s.M, ans + s.M, ans / 2]),
          explanation: `Kütle, mol sayısı ile mol kütlesinin çarpımıdır: ${n} × ${s.M} = ${ans} gram.`,
        };
      }

      if (kind === 1) {
        const n = 2 + Math.floor(rnd() * 5);
        const m = n * s.M;
        return {
          id: nextId('kim'),
          difficulty,
          prompt: `${m} gram ${s.ad} (${s.formül}) kaç moldür? (Mol kütlesi ${s.M} g/mol alınacaktır.)`,
          answer: fmt(n),
          distractors: n3(n, [m * s.M, m - s.M, n + 1, m / (2 * s.M)]),
          explanation: `Mol sayısı, kütlenin mol kütlesine bölümüdür: ${m} ÷ ${s.M} = ${n} mol.`,
        };
      }

      if (kind === 2) {
        const other = pick(SUBSTANCES);
        const n1 = 1 + Math.floor(rnd() * 3);
        const n2 = 1 + Math.floor(rnd() * 3);
        const ans = n1 * s.M + n2 * other.M;
        return {
          id: nextId('kim'),
          difficulty,
          prompt: `${n1} mol ${s.formül} ile ${n2} mol ${other.formül} karıştırılıyor. Karışımın toplam kütlesi kaç gramdır? (Mol kütleleri sırasıyla ${s.M} ve ${other.M} g/mol.)`,
          answer: fmt(ans),
          distractors: n3(ans, [(n1 + n2) * (s.M + other.M), n1 * s.M, n2 * other.M, ans + s.M]),
          explanation: `Her bileşenin kütlesi ayrı hesaplanır: ${n1} × ${s.M} = ${n1 * s.M}, ${n2} × ${other.M} = ${n2 * other.M}. Toplam ${n1 * s.M} + ${n2 * other.M} = ${ans} gramdır.`,
        };
      }

      if (kind === 3) {
        const m1 = (1 + Math.floor(rnd() * 4)) * s.M;
        const m2 = (1 + Math.floor(rnd() * 3)) * s.M;
        const ans = m1 / s.M + m2 / s.M;
        return {
          id: nextId('kim'),
          difficulty,
          prompt: `${m1} gram ve ${m2} gram ${s.ad} (${s.formül}) aynı kapta karıştırılıyor. Kaptaki toplam madde miktarı kaç moldür? (Mol kütlesi ${s.M} g/mol.)`,
          answer: fmt(ans),
          distractors: n3(ans, [(m1 + m2) / (2 * s.M), ans + 1, (m1 + m2) * s.M, ans / 2]),
          explanation: `Mol sayıları toplanır: ${m1} ÷ ${s.M} = ${m1 / s.M} ve ${m2} ÷ ${s.M} = ${m2 / s.M}. Toplam ${m1 / s.M} + ${m2 / s.M} = ${ans} mol olur.`,
        };
      }

      const n = 2 + Math.floor(rnd() * 4);
      const m = n * s.M;
      return {
        id: nextId('kim'),
        difficulty,
        prompt: `${n} mol ${s.ad} ${m} gram geldiğine göre bu maddenin mol kütlesi kaç g/mol’dür?`,
        answer: fmt(s.M),
        distractors: n3(s.M, [m * n, m - n, s.M / 2, s.M + 10]),
        explanation: `Mol kütlesi, kütlenin mol sayısına bölümüdür: ${m} ÷ ${n} = ${s.M} g/mol.`,
      };
    },
    T_KIM,
  );
}

/* ---------------------------------------------------------------- */
/* Sözcük ve Cümle Anlamı                                            */
/* ---------------------------------------------------------------- */

type Row = { p: string; a: string; d: [string, string, string]; e: string };

function emitRows(rows: Row[], prefix: string, topic: string, kind?: QuestionKind) {
  rows.forEach((row, index) => {
    const id = nextId(prefix);
    add(
      {
        id,
        prompt: row.p,
        answer: row.a,
        distractors: row.d,
        explanation: row.e,
        difficulty: difficultyAt(index),
        kind,
      },
      topic,
    );
  });
}

const SOZ_ANLAM: Row[] = [
  {
    p: 'Öğretmen, öğrencinin sorusunu duyunca yüzünde belirgin bir sevinç oluştu.\n\nBu cümlede “belirgin” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Açıkça görülen',
    d: ['Gizli kalan', 'Kısa süren', 'Abartılı olan'],
    e: 'Sözcük, yüzde oluşan sevincin kolayca fark edildiğini anlatır; bu nedenle “açıkça görülen” anlamına gelir.',
  },
  {
    p: 'Uzun süre susan çocuk, sonunda içindekini bir çırpıda anlattı.\n\nBu cümlede “çırpıda” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Duraklamadan',
    d: ['Çekinerek', 'Sırayla', 'Sesini yükselterek'],
    e: '“Bir çırpıda” kalıbı, işin ara verilmeden kısa sürede yapıldığını bildirir; burada duraklamadan anlatmayı karşılar.',
  },
  {
    p: 'Kentin eski mahalleleri, yeni yapılar arasında giderek silikleşiyor.\n\nBu cümlede “silikleşmek” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Belirsizleşmek',
    d: ['Çoğalmak', 'Değer kazanmak', 'Genişlemek'],
    e: 'Eski mahallelerin yeni yapılar arasında ayırt edilemez duruma gelmesi anlatıldığından sözcük “belirsizleşmek” anlamındadır.',
  },
  {
    p: 'Sergideki tablolar, sanatçının ilk dönemine ait izler taşıyor.\n\nBu cümlede “iz” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Belirti',
    d: ['Eleştiri', 'Kopya', 'Ölçü'],
    e: 'Tabloların ilk dönemi hatırlatan özellikler taşıması söz konusudur; “iz” burada “belirti” anlamıyla kullanılmıştır.',
  },
  {
    p: 'Bu konuda söylenenlerin hepsi havada kaldı; kimse kanıt sunmadı.\n\nBu cümlede “havada kalmak” sözünün anlamı aşağıdakilerden hangisidir?',
    a: 'Sonuca bağlanmamak',
    d: ['Unutulmak', 'Abartılmak', 'Yasaklanmak'],
    e: 'Kanıt sunulmadığı için söylenenlerin sonuçsuz kaldığı belirtiliyor; deyim “sonuca bağlanmamak” anlamındadır.',
  },
  {
    p: 'Köyün çocukları, dere kenarında kendi oyunlarını kurup akşama kadar oyalanıyordu.\n\nBu cümlede “oyalanmak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Vakit geçirmek',
    d: ['Yorulmak', 'Kaybolmak', 'Tartışmak'],
    e: 'Çocukların akşama kadar oyunla meşgul olması anlatıldığı için sözcük “vakit geçirmek” anlamındadır.',
  },
  {
    p: 'Annesinin sözleri, genç adamın kafasındaki kuşkuyu iyice körükledi.\n\nBu cümlede “körüklemek” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Artırmak',
    d: ['Gidermek', 'Saklamak', 'Paylaşmak'],
    e: 'Kuşkunun güçlendiği anlatıldığından “körüklemek” burada “artırmak” anlamıyla kullanılmıştır.',
  },
  {
    p: 'Yazar, roman kişilerinin konuşmalarını olduğu gibi aktarmak yerine onları yoğunlaştırıyor.\n\nBu cümlede “yoğunlaştırmak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Özlü duruma getirmek',
    d: ['Uzatmak', 'Süslemek', 'Çevirmek'],
    e: 'Konuşmaların olduğu gibi verilmediği, daha az sözle anlatıldığı belirtiliyor; bu da “özlü duruma getirmek” demektir.',
  },
  {
    p: 'Kütüphanedeki raflar, tozlu ciltlerle dolup taşıyordu.\n\nBu cümlede “cilt” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Kitap kapağı',
    d: ['Kâğıt yığını', 'Raf bölmesi', 'Yazı takımı'],
    e: 'Rafta duran kitaplardan söz edildiğine göre “cilt”, kitabın kapağını ve kaplamasını karşılar.',
  },
  {
    p: 'Sokaktaki gürültü, ders çalışan çocuğun dikkatini dağıttı.\n\nBu cümlede “dağıtmak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Bozmak',
    d: ['Toplamak', 'Artırmak', 'Yönlendirmek'],
    e: 'Dikkatin toplanmış durumdan çıkması anlatıldığı için sözcük “bozmak” anlamındadır.',
  },
  {
    p: 'Ustasının elini gören çırak, işin inceliğini yavaş yavaş kavradı.\n\nBu cümlede “kavramak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Anlamak',
    d: ['Yakalamak', 'Ezberlemek', 'Reddetmek'],
    e: 'İşin inceliğinin zamanla anlaşılması anlatıldığından sözcük burada “anlamak” anlamıyla kullanılmıştır.',
  },
  {
    p: 'Yolculuk boyunca kimse konuşmadı; herkes kendi dünyasına çekilmişti.\n\nBu cümlede “çekilmek” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Kapanmak',
    d: ['Yakınlaşmak', 'Açılmak', 'Karışmak'],
    e: 'Kimsenin konuşmaması ve herkesin kendi dünyasına yönelmesi, içe kapanmayı anlatır.',
  },
  {
    p: 'Belediye, meydandaki tarihî çeşmeyi onarmak için kolları sıvadı.\n\nBu cümlede “kolları sıvamak” sözünün anlamı aşağıdakilerden hangisidir?',
    a: 'İşe girişmek',
    d: ['Yardım istemek', 'Beklemeye geçmek', 'İşi bırakmak'],
    e: 'Onarım işine başlandığı belirtildiğinden deyim “işe girişmek, çalışmaya başlamak” anlamındadır.',
  },
  {
    p: 'Yeni işinde kısa sürede sivrildi; herkes ondan söz ediyordu.\n\nBu cümlede “sivrilmek” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Öne çıkmak',
    d: ['Yalnızlaşmak', 'Gerilemek', 'Alışmak'],
    e: 'Herkesin ondan söz etmesi, işinde dikkat çektiğini gösterir; “sivrilmek” burada “öne çıkmak” anlamındadır.',
  },
  {
    p: 'Bu yıl hasat, beklenenden erken olgunlaştı.\n\nBu cümlede “olgunlaşmak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Ürün vermeye hazır duruma gelmek',
    d: ['Çürümek', 'Kurumak', 'Azalmak'],
    e: 'Hasattan söz edildiğine göre ürünün toplanmaya hazır duruma gelmesi anlatılmaktadır.',
  },
  {
    p: 'Öğrenciler, projeyi teslim etmeden önce taslağı gözden geçirdi.\n\nBu cümlede “gözden geçirmek” sözünün anlamı aşağıdakilerden hangisidir?',
    a: 'Denetleyip düzeltmek',
    d: ['Ezberlemek', 'Kısaltmak', 'Başkasına vermek'],
    e: 'Teslimden önce taslağın yeniden incelenmesi anlatıldığından deyim “denetleyip düzeltmek” anlamındadır.',
  },
  {
    p: 'Kasabanın tek fırını, sabahın erken saatlerinde dumanı tüten ekmeklerle doluyordu.\n\nBu cümlede “tütmek” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Dumanı yükselmek',
    d: ['Yanmak', 'Kurumak', 'Soğumak'],
    e: 'Fırından yeni çıkan ekmeklerin dumanının yükselmesi anlatılır; sözcük “dumanı yükselmek” anlamındadır.',
  },
  {
    p: 'Konuşmasının sonunda dinleyicilere ince bir gönderme yaptı.\n\nBu cümlede “gönderme” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Üstü kapalı anıştırma',
    d: ['Teşekkür', 'Uyarı', 'Övgü'],
    e: '“İnce” sıfatı, sözün dolaylı söylendiğini gösterir; gönderme burada üstü kapalı anıştırma anlamındadır.',
  },
  {
    p: 'Yıllardır biriken eşyaları elden çıkarmak kolay olmadı.\n\nBu cümlede “elden çıkarmak” sözünün anlamı aşağıdakilerden hangisidir?',
    a: 'Satıp kurtulmak',
    d: ['Onarmak', 'Saklamak', 'Taşımak'],
    e: 'Biriken eşyalardan kurtulmak anlatıldığına göre deyim “satmak ya da verip kurtulmak” anlamındadır.',
  },
  {
    p: 'Çocuk, annesinin eteğine yapışmış, bir adım geri kalmıyordu.\n\nBu cümlede “yapışmak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Sımsıkı tutunmak',
    d: ['Yaklaşmak', 'Dayanmak', 'Saklanmak'],
    e: 'Çocuğun bir adım bile ayrılmaması, annesine sımsıkı tutunduğunu gösterir.',
  },
  {
    p: 'Öğretmen, sınıfın gürültüsünü bastırmak için sesini yükseltti.\n\nBu cümlede “bastırmak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Etkisiz kılmak',
    d: ['Artırmak', 'Kaydetmek', 'Saklamak'],
    e: 'Gürültünün azaltılmak istendiği anlatıldığından sözcük “etkisini kırmak, etkisiz kılmak” anlamındadır.',
  },
  {
    p: 'Bu roman, okuru ilk sayfadan itibaren içine alan bir anlatıma sahip.\n\nBu cümlede “içine almak” sözünün anlamı aşağıdakilerden hangisidir?',
    a: 'Etkisi altına almak',
    d: ['Bilgilendirmek', 'Güldürmek', 'Yormak'],
    e: 'Okurun ilk sayfadan itibaren romanın etkisine girmesi anlatıldığından söz “etkisi altına almak” anlamındadır.',
  },
  {
    p: 'Bahçedeki gül fidanları, ilkbaharda bolca tomurcuk verdi.\n\nBu cümlede “tomurcuk” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Henüz açmamış çiçek',
    d: ['Olgun meyve', 'Kuru yaprak', 'Toprak altı gövde'],
    e: 'Gül fidanının ilkbaharda çiçeğe dönüşecek bölümler vermesi anlatılır; tomurcuk açmamış çiçektir.',
  },
  {
    p: 'Küçük kız, oyuncak bebeğini özenle sarıp sarmaladı.\n\nBu cümlede “sarıp sarmalamak” sözünün anlamı aşağıdakilerden hangisidir?',
    a: 'Örtüp korumak',
    d: ['Temizlemek', 'Fırlatmak', 'Satmak'],
    e: 'Bebeğin özenle örtülmesi anlatıldığı için deyim “örtüp korumak” anlamındadır.',
  },
  {
    p: 'Bu tür eleştiriler, yazarın üretkenliğini baltalıyor.\n\nBu cümlede “baltalamak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Zayıflatmak',
    d: ['Artırmak', 'Hızlandırmak', 'Yönlendirmek'],
    e: 'Eleştirilerin üretkenliği olumsuz etkilemesi anlatıldığından sözcük “zayıflatmak” anlamındadır.',
  },
  {
    p: 'Sabahtan beri çalışan işçiler, öğle vakti gölgeye sığındı.\n\nBu cümlede “sığınmak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Korunmak için gitmek',
    d: ['Dinlenmek', 'Koşmak', 'Bakınmak'],
    e: 'Güneşten korunma amacı öne çıktığı için sözcük “korunmak amacıyla bir yere gitmek” anlamındadır.',
  },
  {
    p: 'Mahallenin yaşlıları, akşamları kahvehanede toplanıp söyleşirdi.\n\nBu cümlede “söyleşmek” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Sohbet etmek',
    d: ['Tartışmak', 'Susmak', 'Çalışmak'],
    e: 'Kahvehanede toplanan yaşlıların karşılıklı konuşması anlatıldığından sözcük “sohbet etmek” anlamındadır.',
  },
  {
    p: 'Öğrencinin yanıtı, sorunun asıl amacını ıskaladı.\n\nBu cümlede “ıskalamak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Kaçırmak',
    d: ['Vurgulamak', 'Açıklamak', 'Yakalamak'],
    e: 'Yanıtın sorunun amacına ulaşamaması anlatıldığı için sözcük “kaçırmak” anlamındadır.',
  },
  {
    p: 'Yeni açılan sergi, kentin sanat ortamına canlılık kattı.\n\nBu cümlede “canlılık” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Hareket',
    d: ['Sessizlik', 'Düzen', 'Karmaşa'],
    e: 'Serginin sanat ortamını hareketlendirmesi anlatıldığından sözcük “hareket, canlılık” anlamındadır.',
  },
  {
    p: 'Bu konuda yazılanlar birbirini tutmuyor; kaynaklar çelişiyor.\n\nBu cümlede “çelişmek” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Birbirine aykırı düşmek',
    d: ['Birleşmek', 'Yinelenmek', 'Tamamlanmak'],
    e: 'Kaynakların birbirini tutmaması, aralarında aykırılık bulunduğunu gösterir.',
  },
  {
    p: 'Küçük dükkânın sahibi, müşterisine her zaman güler yüz gösterirdi.\n\nBu cümlede “güler yüz göstermek” sözünün anlamı aşağıdakilerden hangisidir?',
    a: 'Sıcak davranmak',
    d: ['Sert bakmak', 'Suskun kalmak', 'Acele etmek'],
    e: 'Dükkân sahibinin müşteriye ilgili ve sıcak davranması anlatıldığından deyim bu anlama gelir.',
  },
  {
    p: 'Uzun süren kuraklık, tarlaları çatlatmıştı.\n\nBu cümlede “çatlatmak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Kuruyup yarmak',
    d: ['Sulamak', 'Düzeltmek', 'Kapatmak'],
    e: 'Kuraklığın toprakta yarıklar oluşturması anlatıldığından sözcük “kuruyup yarmak” anlamındadır.',
  },
  {
    p: 'Genç yazar, ilk kitabında ustalarının etkisinden sıyrılamamış.\n\nBu cümlede “sıyrılamamak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Kurtulamamak',
    d: ['Etkilenmemek', 'Yararlanamamak', 'Vazgeçmemek'],
    e: 'Yazarın ustalarının etkisinde kaldığı belirtildiğine göre sözcük “kurtulamamak” anlamındadır.',
  },
  {
    p: 'Haber, kentte hızla yayıldı; herkes aynı şeyi konuşuyordu.\n\nBu cümlede “yayılmak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Geniş bir alana ulaşmak',
    d: ['Durmak', 'Bölünmek', 'Gizlenmek'],
    e: 'Haberin kentin her yerinde duyulması anlatıldığından sözcük “geniş bir alana ulaşmak” anlamındadır.',
  },
  {
    p: 'Bu yöntem, sorunu çözmekten çok ötelemeye yarıyor.\n\nBu cümlede “ötelemek” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Ertelemek',
    d: ['Hızlandırmak', 'Küçültmek', 'Açıklamak'],
    e: 'Yöntemin sorunu çözmediği, ileri bir tarihe bıraktığı anlatıldığından sözcük “ertelemek” anlamındadır.',
  },
  {
    p: 'Çocuklar, kumdan kalelerini dalgalara karşı korumaya çalıştı.\n\nBu cümlede “korumak” sözcüğünün anlamı aşağıdakilerden hangisidir?',
    a: 'Zarar görmesini önlemek',
    d: ['Süslemek', 'Ölçmek', 'Bırakmak'],
    e: 'Kalelerin dalgalarla bozulmasının engellenmeye çalışılması, zarar görmesini önleme anlamını verir.',
  },
];

const SOZ_CUMLE: Row[] = [
  {
    p: 'Bir kitabı yeniden okumak, aynı kitabı okumak değildir; çünkü okur da değişir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Okuma deneyimi, okurun değişmesiyle birlikte farklılaşır.',
    d: [
      'İyi kitaplar ilk okumada anlaşılamaz.',
      'Okur, okuduğu kitabı unutmaya eğilimlidir.',
      'Kitaplar her dönemde aynı ilgiyi görür.',
    ],
    e: 'Cümle, kitabın aynı kalmasına karşın okurun değiştiğini, bu yüzden ikinci okumanın farklı bir deneyim olduğunu söyler.',
  },
  {
    p: 'Ustalaşmak, bilmediğini fark etmeyi öğrenmekle başlar.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Ustalık, kişinin kendi bilgi sınırlarını görmesini gerektirir.',
    d: [
      'Ustalar bildiklerini paylaşmaktan kaçınır.',
      'Bir işte ustalaşmak kısa sürede gerçekleşir.',
      'Bilgi eksikliği çalışmayla giderilemez.',
    ],
    e: 'Cümle, ustalığın ilk adımını bilgi eksikliğini fark etmeye bağladığı için doğru yargı bu sınırları görmeyle ilgilidir.',
  },
  {
    p: 'Bir kenti tanımak için haritasına değil, sabah saatlerinde sokaklarına bakmak gerekir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Kentlerin gündelik yaşamı, çizili sınırlarından çok gözlemlenerek anlaşılır.',
    d: [
      'Haritalar kentlerin konumunu yanlış gösterir.',
      'Kentler yalnızca sabahları kalabalık olur.',
      'Bir kenti tanımak için uzun süre orada yaşamak gerekir.',
    ],
    e: 'Cümle, haritayı yetersiz bularak sabah sokaklarını, yani gündelik yaşamı gözlemeyi önerir.',
  },
  {
    p: 'Bir sorunun doğru yanıtı, çoğu zaman sorunun doğru kurulmasına bağlıdır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Sorunun iyi tanımlanması, çözümü kolaylaştırır.',
    d: [
      'Her sorunun tek bir doğru yanıtı vardır.',
      'Yanlış sorular yanıtlanamaz.',
      'Soruların kurulması yanıtlardan daha uzun sürer.',
    ],
    e: 'Cümle, yanıtın niteliğini sorunun kuruluşuna bağladığı için doğru tanımlamanın çözümü kolaylaştırdığı anlaşılır.',
  },
  {
    p: 'Sessizlik, bir konuşmanın en yoğun bölümü olabilir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Susmak, kimi zaman söylenenlerden daha çok şey anlatır.',
    d: [
      'Konuşmalar sessizlikle başlamalıdır.',
      'Sessiz insanlar konuşmayı sevmez.',
      'Uzun konuşmalar anlaşılmayı zorlaştırır.',
    ],
    e: 'Sessizliğin konuşmanın en yoğun bölümü sayılması, susmanın anlam taşıdığını gösterir.',
  },
  {
    p: 'Bir bahçeyi ayakta tutan şey, çiçeklerden çok toprağın kendisidir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Görünen sonuçlar, görünmeyen temellere dayanır.',
    d: [
      'Çiçekler bahçenin en değerli bölümüdür.',
      'Toprak her bölgede aynı verimliliği gösterir.',
      'Bahçe bakımı yalnızca sulamayla sınırlıdır.',
    ],
    e: 'Çiçeklerin varlığını toprağa bağlayan cümle, görünenin arkasındaki temeli vurgular.',
  },
  {
    p: 'Bir yazıyı kısaltmak, çoğu zaman onu yeniden yazmaktır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Kısaltma, metnin yeniden ele alınmasını gerektirir.',
    d: [
      'Kısa yazılar uzun yazılardan değerlidir.',
      'Yazarlar gereksiz sözcük kullanmaz.',
      'Uzun metinler kısaltılamaz.',
    ],
    e: 'Kısaltmanın yeniden yazmaya benzetilmesi, metnin baştan ele alınması gerektiğini anlatır.',
  },
  {
    p: 'Bir öğretmenin en zor işi, öğrencinin sorusunu kendi sorusuna dönüştürmesini sağlamaktır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Öğrenmenin ön koşulu, öğrencinin soru sormayı öğrenmesidir.',
    d: [
      'Öğretmenler soruların yanıtını vermekten kaçınmalıdır.',
      'Öğrenciler en çok kolay soruları sever.',
      'Soru sormak dersin süresini uzatır.',
    ],
    e: 'Cümle, öğrencinin soruyu sahiplenmesini öğretmenin en zor işi sayar; bu da soru sormanın öğrenmenin koşulu olduğunu gösterir.',
  },
  {
    p: 'Bir yolu kısaltmanın en iyi yolu, onu iyi bilmektir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Bir işte yetkinlik, gereksiz adımları ortadan kaldırır.',
    d: [
      'Kısa yollar her zaman güvenlidir.',
      'Yol bilgisi zamanla unutulur.',
      'Uzun yollar daha çok deneyim kazandırır.',
    ],
    e: 'Yolu iyi bilmenin onu kısaltması, yetkinliğin gereksiz adımları azalttığını anlatır.',
  },
  {
    p: 'Bir toplumun belleği, yalnızca yazdıklarında değil, söylediklerinde de saklıdır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Sözlü aktarım da toplumsal hafızanın parçasıdır.',
    d: [
      'Yazılı belgeler güvenilir değildir.',
      'Sözlü kültür yazılı kültürden üstündür.',
      'Toplumlar geçmişlerini unutmaya eğilimlidir.',
    ],
    e: 'Cümle, belleğin hem yazılı hem sözlü ürünlerde yaşadığını söyleyerek sözlü aktarımı da kapsama alır.',
  },
  {
    p: 'Bir makinenin gücü, en zayıf parçasının dayanıklılığı kadardır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Bütünün dayanıklılığı, en kırılgan parçaya bağlıdır.',
    d: [
      'Makineler parçalarından daha değerlidir.',
      'Sağlam parçalar makineyi yavaşlatır.',
      'Her makine zamanla bozulur.',
    ],
    e: 'Gücün en zayıf parçayla sınırlanması, bütünün dayanıklılığının en kırılgan ögeye bağlı olduğunu gösterir.',
  },
  {
    p: 'Bir kentin kimliği, anıtlarından çok sakinlerinin alışkanlıklarında okunur.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Kentleri anlatan asıl öge, orada yaşayanların gündelik davranışlarıdır.',
    d: [
      'Anıtlar kentler için gereksiz yapılardır.',
      'Kentler yalnızca nüfuslarıyla değerlendirilir.',
      'Sakinler kentin yapılarını değiştirir.',
    ],
    e: 'Cümle, anıtları geri plana atarak kent kimliğini sakinlerin alışkanlıklarında arar.',
  },
  {
    p: 'Bir sorunu anlatamıyorsan, onu henüz anlamamışsın demektir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Anlatabilme, anlamanın göstergesidir.',
    d: [
      'Anlatım becerisi doğuştan gelir.',
      'Her sorun sözle anlatılmalıdır.',
      'Anlamak için yazmak zorunludur.',
    ],
    e: 'Anlatamamanın anlamamaya bağlanması, açık anlatımı anlamanın ölçütü durumuna getirir.',
  },
  {
    p: 'Bir sözcüğün anlamı, kullanıldığı cümlede belirginleşir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Sözcükler tek başına değil, bağlam içinde anlam kazanır.',
    d: [
      'Sözcüklerin sözlük anlamı yanıltıcıdır.',
      'Her sözcüğün tek bir anlamı vardır.',
      'Cümleler sözcüklerden bağımsızdır.',
    ],
    e: 'Anlamın cümlede belirginleşmesi, bağlamın anlamı belirlediğini gösterir.',
  },
  {
    p: 'Bir işi bitirmenin en zor yanı, ona başlamaktır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Başlama aşaması, işin en çok direnç gösteren bölümüdür.',
    d: [
      'İşler kısa sürede tamamlanmalıdır.',
      'Başlanan her iş kolayca biter.',
      'Uzun işler daha çok emek ister.',
    ],
    e: 'Başlamanın en zor yan olarak gösterilmesi, işin en dirençli aşamasının başlangıç olduğunu anlatır.',
  },
  {
    p: 'Bir ölçü aletinin değeri, ölçtüğü şeyin büyüklüğüyle değil, güvenilirliğiyle ölçülür.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Ölçmenin değeri, sonucun güvenilirliğine bağlıdır.',
    d: [
      'Büyük nicelikler ölçülemez.',
      'Her ölçüm aynı kesinliktedir.',
      'Ölçü aletleri sık sık değiştirilmelidir.',
    ],
    e: 'Cümle, aletin değerini ölçülen büyüklükten bağımsız tutup güvenilirliğe bağlar.',
  },
  {
    p: 'Bir fotoğraf, çekildiği anı değil, çekenin o ana bakışını gösterir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Fotoğraf, çekenin seçimlerini yansıtır.',
    d: [
      'Fotoğraflar gerçeği olduğu gibi aktarır.',
      'Fotoğrafçılık teknik bilgi gerektirmez.',
      'Her an fotoğraflanmaya değerdir.',
    ],
    e: 'Anın değil bakışın gösterildiği söylenerek fotoğrafın öznel seçimleri yansıttığı belirtilir.',
  },
  {
    p: 'Bir düşünceyi savunmak, onu karşıt görüşlerle sınamayı gerektirir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Bir görüşün sağlamlığı, karşıt görüşlerle sınanarak anlaşılır.',
    d: [
      'Karşıt görüşler her zaman yanlıştır.',
      'Düşünce savunmak tartışmayı gereksiz kılar.',
      'Her görüş eşit ölçüde doğrudur.',
    ],
    e: 'Savunmanın karşıt görüşlerle sınanmaya bağlanması, sağlamlığın bu sınamayla ortaya çıktığını gösterir.',
  },
  {
    p: 'Bir kentin trafiği, oradaki insanların zamanı nasıl harcadığını gösterir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Ulaşım düzeni, gündelik yaşamın örgütlenmesine ilişkin bilgi verir.',
    d: [
      'Trafik yoğunluğu yalnızca nüfusa bağlıdır.',
      'Kentlerde zaman hızlı geçer.',
      'Ulaşım sorunları kısa sürede çözülür.',
    ],
    e: 'Trafiğin zaman kullanımını göstermesi, ulaşım düzeninin gündelik yaşamı yansıttığı anlamına gelir.',
  },
  {
    p: 'Bir bahçıvan, bitkilerin büyümesini hızlandıramaz; yalnızca koşulları düzeltebilir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Doğal süreçler, uygun koşullar sağlanarak desteklenir.',
    d: [
      'Bahçıvanlar bitkilerin gelişimini durdurabilir.',
      'Bitkiler hiçbir bakıma gereksinim duymaz.',
      'Büyüme yalnızca sulamaya bağlıdır.',
    ],
    e: 'Büyümenin hızlandırılamaması ama koşulların düzeltilebilmesi, doğal süreçlerin ancak desteklenebildiğini anlatır.',
  },
  {
    p: 'Bir yanıtın değeri, soruyu ne kadar ileri taşıdığıyla ölçülür.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Yanıtlar, yeni sorular açtıkları ölçüde anlam kazanır.',
    d: [
      'Kısa yanıtlar uzun yanıtlardan iyidir.',
      'Her sorunun yanıtı kolayca bulunur.',
      'Sorular yanıtlardan daha önemlidir.',
    ],
    e: 'Yanıtın değerinin soruyu ilerletmeye bağlanması, yeni sorular açmayı ölçüt yapar.',
  },
  {
    p: 'Bir toplumun mutfağı, tarihinin en sessiz tanığıdır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Yemek kültürü, toplumun geçmişine ilişkin izler taşır.',
    d: [
      'Mutfaklar tarih boyunca değişmemiştir.',
      'Yemek tarifleri yazıyla korunur.',
      'Toplumlar yemeklerini komşularından öğrenir.',
    ],
    e: 'Mutfak, tarihin sessiz tanığı olarak sunulduğuna göre yemek kültürü geçmişe ait izler barındırır.',
  },
  {
    p: 'Bir müziği anlamak için notaları bilmek gerekmez; dinlemek yeterlidir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Müzikten anlamak, teknik bilgiye bağlı değildir.',
    d: [
      'Nota bilgisi müzik eğitiminde gereksizdir.',
      'Herkes müzik eğitimi almalıdır.',
      'Dinleyici notalardan daha önemlidir.',
    ],
    e: 'Nota bilmenin gerekli olmadığı söylenerek müziği anlamanın teknik bilgiden bağımsız olduğu belirtilir.',
  },
  {
    p: 'Bir gölün derinliği, yüzeyinin durgunluğundan anlaşılmaz.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Görünüş, altta yatan durumu her zaman yansıtmaz.',
    d: [
      'Durgun göller her zaman derindir.',
      'Göllerin derinliği ölçülemez.',
      'Yüzeydeki dalgalar derinliği artırır.',
    ],
    e: 'Durgun yüzeyin derinliği göstermemesi, görünüşün altındaki durumu yansıtmadığını anlatır.',
  },
  {
    p: 'Bir borcun en ağır kısmı, ödenmediği sürede büyüyen kısmıdır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Gecikme, yükümlülüğün ağırlığını artırır.',
    d: [
      'Borçlar zamanla kendiliğinden silinir.',
      'Her borç kısa sürede ödenir.',
      'Ödeme planı borcu azaltmaz.',
    ],
    e: 'Borcu ağırlaştıran şeyin ödenmeyen süre olduğu söylenerek gecikmenin yükü artırdığı belirtilir.',
  },
  {
    p: 'Bir çocuğun sorusu, çoğu zaman bir yetişkinin yanıtından daha öğreticidir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Sorular, yanıtlardan daha çok düşünme olanağı sunabilir.',
    d: [
      'Yetişkinler çocukların sorularını yanıtlamaz.',
      'Çocuklar soru sormayı sonradan öğrenir.',
      'Yanıtlar her zaman eksik kalır.',
    ],
    e: 'Çocuk sorusunun yanıttan öğretici bulunması, soruların düşünmeyi daha çok tetiklediğini gösterir.',
  },
  {
    p: 'Bir yapının sağlamlığı, ilk günkü hâlinden çok yıllar sonraki durumuyla anlaşılır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Dayanıklılık, zaman içinde sınanarak ortaya çıkar.',
    d: [
      'Yeni yapılar her zaman sağlamdır.',
      'Eski yapılar onarılamaz.',
      'Sağlamlık yalnızca malzemeye bağlıdır.',
    ],
    e: 'Sağlamlığın yıllar sonraki durumla ölçülmesi, dayanıklılığın zamanla sınandığını anlatır.',
  },
  {
    p: 'Bir haritanın ölçeği büyüdükçe gösterdiği alan küçülür.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Ayrıntı arttıkça kapsanan alan daralır.',
    d: [
      'Büyük ölçekli haritalar daha az ayrıntı verir.',
      'Haritalar her zaman aynı ölçekte çizilir.',
      'Ölçek, haritanın rengini belirler.',
    ],
    e: 'Ölçek büyüdükçe alanın küçülmesi, ayrıntı ile kapsam arasında ters bir ilişki olduğunu gösterir.',
  },
  {
    p: 'Bir sözün etkisi, söylendiği yer ve zamana göre değişir.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Aynı söz, farklı koşullarda farklı sonuç doğurabilir.',
    d: [
      'Sözler her ortamda aynı etkiyi yaratır.',
      'Zamanla sözler anlamını yitirir.',
      'Etkili konuşmak için yüksek ses gerekir.',
    ],
    e: 'Etkinin yere ve zamana bağlanması, aynı sözün koşullara göre farklı sonuç verebileceğini gösterir.',
  },
  {
    p: 'Bir öğrencinin en iyi öğretmeni, kendi yanlışlarıdır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Hatalar, öğrenmede belirleyici bir kaynak oluşturur.',
    d: [
      'Öğretmenler öğrencilere yeterince yardım etmez.',
      'Yanlış yapmamak başarının koşuludur.',
      'Öğrenciler hatalarını kolayca unutur.',
    ],
    e: 'Yanlışların en iyi öğretmen sayılması, hataların öğrenmede belirleyici bir kaynak olduğunu anlatır.',
  },
  {
    p: 'Bir kentin gecesi, gündüzünden daha çok şey anlatır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Kent yaşamının kimi yönleri ancak gece görünür olur.',
    d: [
      'Gündüzleri kentler boş kalır.',
      'Gece yaşamı her kentte aynıdır.',
      'Kentler geceleri daha kalabalıktır.',
    ],
    e: 'Gecenin daha çok şey anlatması, kimi kent olgularının ancak gece ortaya çıktığını gösterir.',
  },
  {
    p: 'Bir işi seven kişi, onun yorgunluğunu değil, ayrıntısını anlatır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Sevgi, dikkati ayrıntılara yöneltir.',
    d: [
      'Sevilen işler yorucu değildir.',
      'Her iş ayrıntı gerektirir.',
      'Yorgunluk, işin sevilmediğini gösterir.',
    ],
    e: 'Seven kişinin yorgunluk yerine ayrıntıyı anlatması, sevginin dikkati ayrıntıya yönelttiğini gösterir.',
  },
  {
    p: 'Bir yanıtı acele vermek, çoğu zaman yanlış sormaktan doğar.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Yanıtın aceleye gelmesi, sorunun iyi kurulmamasıyla ilgilidir.',
    d: [
      'Acele eden kişiler her zaman yanılır.',
      'Sorular yanıtlardan sonra kurulur.',
      'Yavaş yanıt vermek her zaman doğrudur.',
    ],
    e: 'Acele yanıtın yanlış soruya bağlanması, sorunun kuruluşunu yanıtın niteliğinin kaynağı yapar.',
  },
  {
    p: 'Bir toplumun en sağlam yapısı, kuşaklar arası aktarımdır.\n\nBu cümleden çıkarılabilecek yargı aşağıdakilerden hangisidir?',
    a: 'Deneyimin kuşaktan kuşağa geçmesi, toplumu ayakta tutar.',
    d: [
      'Genç kuşaklar eski deneyimlere ilgi duymaz.',
      'Toplumlar yalnızca yazılı belgelerle ayakta kalır.',
      'Kuşaklar arası farklar azalmaktadır.',
    ],
    e: 'Aktarımın en sağlam yapı sayılması, deneyimin kuşaklar arası geçişinin toplumu ayakta tuttuğunu anlatır.',
  },
];

/* ---------------------------------------------------------------- */
/* Paragraf                                                          */
/* ---------------------------------------------------------------- */

const PAR_ANA: Row[] = [
  {
    p: 'Okul bahçeleri çoğu yerde teneffüsün boşaltıldığı beton alanlar olarak düzenleniyor. Oysa çocuk, koşarken ve tırmanırken kendi bedenini tanımayı öğreniyor. Ağaç gölgesinde kurulan basit oyunlar, sınıfta anlatılan kuralları paylaşma becerisine dönüşüyor. Sıraya girme, sırasını bekleme ve yenilgiyi kabullenme de bu oyunların içinde, farkına varılmadan öğreniliyor. Bu nedenle bahçe düzenlemesi bir süsleme işi değil, eğitimin parçası sayılmalı.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Okul bahçeleri, oyun yoluyla beceri geliştirecek biçimde eğitimin parçası olarak düzenlenmelidir.',
    d: [
      'Beton bahçeler bakım açısından daha ekonomiktir.',
      'Teneffüs süreleri oyun oynamak için yetersizdir.',
      'Ağaç dikimi okul bütçesinde öncelik taşımamaktadır.',
    ],
    e: 'Parça, bahçenin oyun ve paylaşma becerisi kazandırdığını söyleyip düzenlemenin eğitimin parçası olduğu sonucuna varır.',
  },
  {
    p: 'Kentin bisiklet yolları çoğu zaman birkaç caddeyle sınırlı kalıyor. Yol, bir yerde başlayıp aniden kesildiğinde sürücü kendini araç trafiğinin içinde buluyor. Bu kopukluk, bisikleti güvenli bir ulaşım aracı olmaktan çıkarıyor. Kesintili bir yol, bisikleti gündelik işler için kullanmayı da güçleştiriyor; sürücü her seferinde araç trafiğine girmeyi göze alamıyor. Kullanımın artması için yolların birbirine bağlanması, yani kesintisiz bir ağ oluşması gerekiyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Bisikletin güvenli ulaşım aracı olması, yolların kesintisiz bir ağ oluşturmasına bağlıdır.',
    d: [
      'Bisiklet yolları araç yollarından daha geniş olmalıdır.',
      'Bisiklet kullanımı yalnızca gençler arasında yaygındır.',
      'Bisiklet yolu yapımı cadde genişletmeyi gerektirir.',
    ],
    e: 'Parça, kopuk yolların güvenliği bozduğunu belirtip çözümü kesintisiz ağa bağlar.',
  },
  {
    p: 'Ders çalışırken elle not alan öğrenciler, bilgisayarda yazanlara göre konuyu daha iyi hatırlıyor. Bunun nedeni, yazarken duyulanların kendi cümlelerle yeniden kurulmasıdır. Klavyede yapılan hızlı kayıt ise çoğu zaman sözlerin olduğu gibi aktarılmasıyla kalıyor. Duyduğunu olduğu gibi yazan öğrenci, içerik üzerinde düşünmeye fırsat bulamıyor. Yavaş yazmak, öğrenciyi seçmeye ve özetlemeye zorlayarak anlamayı derinleştiriyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Elle not almanın yavaşlığı, öğrencinin konuyu seçip özetlemesini sağlayarak öğrenmeyi güçlendirir.',
    d: [
      'Bilgisayar kullanımı derslerde sınırlandırılmalıdır.',
      'El yazısı, klavye kullanımından daha estetik bir beceridir.',
      'Öğrenciler duyduklarını olduğu gibi yazmaya eğilimlidir.',
    ],
    e: 'Parça, elle yazmanın yavaşlığını seçme ve özetleme fırsatı olarak değerlendirip öğrenmeyi güçlendirdiği sonucuna varır.',
  },
  {
    p: 'Deniz kaplumbağaları yumurtadan çıktıkları kumsalı yıllar sonra bulup yumurtluyor. Bu dönüş, kumsalın karanlık ve sessiz kalmasına bağlı. Yapay ışıklar yavruların denizi bulmasını güçleştiriyor, şezlonglar ise yuvalama alanını daraltıyor. Kumsala bırakılan atıklar da yavrunun denize ulaşma şansını azaltıyor. Bu nedenle koruma çalışmaları, yuvalama döneminde kumsalın kullanımını düzenlemekle başlıyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Kumsallardaki ışık ve kullanım düzenlemeleri, deniz kaplumbağalarının varlığını sürdürmesinde belirleyicidir.',
    d: [
      'Deniz kaplumbağaları yalnızca belirli bir kumsalda yaşar.',
      'Turizm gelirleri koruma çalışmalarına aktarılmalıdır.',
      'Yavru kaplumbağaların denize ulaşma oranı her yıl artmaktadır.',
    ],
    e: 'Parça, ışık ve kumsal kullanımının türün sürmesini etkilediğini söyleyerek basit önlemlerin belirleyiciliğini vurgular.',
  },
  {
    p: 'Müzelerde eserlerin cam arkasında sergilenmesi, onları korurken ziyaretçiyi uzaklaştırıyor. Oysa dokunma duyusunu işe koşan sergiler, ziyaretçinin nesneyle bağ kurmasını sağlıyor. Kopya eserlerle kurulan dokunma alanları, özgün eseri riske atmadan bu bağı kurmanın yolunu açıyor. Sergi tasarımı böylece yalnızca görsel değil bedensel bir deneyime dönüşüyor. Koruma ile erişim arasındaki denge, tasarımın asıl sorunu hâline geliyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Müzeler, kopya ve dokunma alanlarıyla koruma ile erişim arasında denge kurmalıdır.',
    d: [
      'Cam vitrinler eserlerin görünürlüğünü azaltmaktadır.',
      'Ziyaretçiler müzelerde en çok heykellerle ilgilenmektedir.',
      'Özgün eserler hiçbir koşulda sergilenmemelidir.',
    ],
    e: 'Parça, dokunma yoluyla bağ kurmayı savunurken korumayı da gözetir; çözümü iki gereksinim arasında denge kurmak olarak sunar.',
  },
  {
    p: 'Yerel üretici pazarları, ürünün tarladan tezgâha kısa sürede ulaşmasını sağlıyor. Aracı sayısı azaldıkça üreticinin payı artıyor, ürün fiyatı düşüyor. Ancak pazarın sürekliliği, satıcının her hafta aynı yerde olmasına bağlı. Alıcı da üretici de bir sonraki haftayı güvenle beklemediğinde pazar işlevini yitiriyor. Bugün kurulup yarın kaldırılan bir pazar, alışveriş alışkanlığı oluşturamıyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Yerel pazarların yararı, düzenli ve sürekli kurulmaları ölçüsünde gerçekleşir.',
    d: [
      'Üretici pazarları büyük marketlerden daha ucuzdur.',
      'Tarım ürünlerinin fiyatı mevsimlere göre değişir.',
      'Aracılar üreticinin kazancını artırmaktadır.',
    ],
    e: 'Parça, kısa tedarik zincirinin yararını anlattıktan sonra sürekliliği koşul olarak öne çıkarır.',
  },
  {
    p: 'Kütüphanelerdeki sessizlik kuralı, çoğu zaman bir nezaket ölçüsü sanılıyor. Oysa kural, aynı masada çalışan farklı hızlardaki okurların birbirini beklememesini sağlıyor. Ses, dikkati dağıtarak okuma süresini uzatıyor; sessizlik ise herkesin kendi temposunu korumasına olanak tanıyor. Bu yüzden kural, kimseyi susturmak için değil, çalışma hakkını eşitlemek için var. Kuralın işlevi, ortak kullanılan bir mekânda eşitlik sağlamaktır.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Kütüphanedeki sessizlik kuralı, ortak mekânda herkesin kendi temposuyla çalışmasını sağlar.',
    d: [
      'Kütüphanelerde grup çalışması yasaklanmalıdır.',
      'Sessizlik kuralına uymayan okurlar uyarılmalıdır.',
      'Okuma hızı kişiden kişiye değişmektedir.',
    ],
    e: 'Parça, kuralı nezaket değil işlev üzerinden açıklayıp ortak mekânda eşitlik sağladığını belirtir.',
  },
  {
    p: 'Sazlıklar, suyun içindeki fazla besin maddesini tutarak gölün kirlenmesini yavaşlatıyor. Kökleri toprağı tutuyor, sapları dalgayı kırıyor. Kuşlar için barınak, balıklar için üreme alanı olan sazlıklar, kıyıyı dalga aşındırmasından da koruyor. Buna karşın sazlık alanlar çoğu zaman kurutulup yerleşime açılıyor. Kısa vadede kazanç gibi görünen bu uygulama, gölün kendini temizleme gücünü elinden alıyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Sazlıkların kurutulması, gölün doğal temizlenme yeteneğini zayıflatır.',
    d: [
      'Göllerdeki kirlilik yalnızca tarımsal gübrelerden kaynaklanır.',
      'Sazlık alanlar yerleşim için elverişli arazilerdir.',
      'Dalga erozyonu kıyı şeridini daraltmaktadır.',
    ],
    e: 'Parça, sazlığın temizleme işlevini anlattıktan sonra kurutmanın bu gücü ortadan kaldırdığı sonucuna varır.',
  },
  {
    p: 'Bozulan bir eşyayı onarmak, çoğu zaman yenisini almaktan daha çok emek istiyor. Yine de onarım, eşyanın nasıl yapıldığını öğretiyor. Bir düğmeyi diken çocuk, kumaşın dokusunu ve dikişin mantığını fark ediyor. Bozulan bir musluğu tamir eden yetişkin, su tesisatının nasıl işlediğini öğreniyor; bir sonraki arızada tamirci çağırmadan sorunu görebiliyor. Bu bilgi birikimi, tüketim alışkanlıklarını da yavaşlatıyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Onarım, eşyanın yapısını tanıtarak hem bilgi hem de ölçülü tüketim kazandırır.',
    d: [
      'Yeni ürünler onarılmış ürünlerden daha dayanıklıdır.',
      'Dikiş öğrenmek çocuklar için zorunlu olmalıdır.',
      'Onarım maliyeti yeni ürün fiyatını aşmaktadır.',
    ],
    e: 'Parça, onarımın emek yoğun olduğunu kabul eder ama bilgi ve ölçülü tüketim kazandırdığını öne çıkarır.',
  },
  {
    p: 'Toplu taşımada aktarma yapmak, yolcu için yalnızca araç değiştirmek değildir. Bekleme süresi, yürüme mesafesi ve durakta geçen belirsizlik toplam yolculuk süresine ekleniyor. Aktarma noktaları birbirine yakın kurulduğunda bu yük azalıyor. Aynı durakta bekleyen yolcu, hangi aracın önce geleceğini bilmediğinde süreyi daha uzun hissediyor. Bu nedenle hat planlaması, araç sayısı kadar aktarma düzenine de bakmalı.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Toplu taşıma planlamasında aktarma düzeni, yolculuk süresi kadar önemlidir.',
    d: [
      'Yolcular aktarma yapmaktan kaçınmaktadır.',
      'Araç sayısının artırılması bekleme süresini kısaltır.',
      'Duraklar arası mesafe kısa tutulmalıdır.',
    ],
    e: 'Parça, aktarmanın yolculuk süresine ek yük getirdiğini gösterip planlamada aktarma düzenine bakılması gerektiği sonucuna varır.',
  },
  {
    p: 'Sokak ağaçları, yaz aylarında kaldırım sıcaklığını belirgin biçimde düşürüyor. Gölge, asfaltın ısıyı tutmasını engelliyor; yapraklar ise havadaki tozu tutuyor. Ancak kökler için ayrılan alan dar tutulduğunda ağaç kısa sürede kuruyor. Kaldırım altına sıkışan kök suya ulaşamadığı için gövde zayıflıyor. Dikim kadar, ağacın altındaki toprağın korunması da gerekiyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Sokak ağaçlarının yararı, kök alanının korunmasıyla birlikte düşünülmelidir.',
    d: [
      'Ağaçlar kaldırım genişliğini azaltmaktadır.',
      'Yaz sıcaklıkları kentlerde her yıl artmaktadır.',
      'Toz tutan bitkiler sağlık için zararlıdır.',
    ],
    e: 'Parça, ağacın serinletme yararını anlattıktan sonra kök alanının korunmasını koşul olarak belirtir.',
  },
  {
    p: 'Apartman bahçeleri, çoğu zaman çamaşır ve bisiklet için ayrılmış dar alanlar olarak kalıyor. Oysa ortak bir sebze tarhı, komşuların birbirini tanımasını sağlıyor. Kimin ne zaman sulama yapacağı konuşulurken kurulan ilişki, apartman yaşamının soğukluğunu azaltıyor. Ortak bir işin sorumluluğu paylaşıldığında komşular birbirinin adını öğreniyor. Küçük bir düzenleme, komşuluğu yeniden kurmanın aracı olabiliyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Ortak bahçe düzenlemeleri, apartmanda komşuluk ilişkilerini canlandırabilir.',
    d: [
      'Apartman bahçeleri otopark olarak kullanılmalıdır.',
      'Sebze yetiştirmek uzmanlık gerektiren bir iştir.',
      'Komşuluk ilişkileri kentlerde tamamen bitmiştir.',
    ],
    e: 'Parça, ortak tarhın komşular arasında ilişki kurduğunu örnekleyerek küçük düzenlemelerin komşuluğu canlandırdığını söyler.',
  },
  {
    p: 'Yöresel yemek tarifleri uzun süre kulaktan kulağa aktarıldı. Ancak kuşaklar arasındaki kopukluk, ölçüsüz anlatımların unutulmasına yol açıyor. Tarifleri yazıya geçirmek, yemeğin yalnızca malzemesini değil hazırlanış gerekçesini de koruyor. Hangi malzemenin neden önce eklendiği yazıldığında yemek taklit edilebilir olmaktan çıkıp anlaşılır hâle geliyor. Yazıya geçirilen tarif, bir topluluğun mutfak belleğini sonraki kuşaklara taşıyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Yöresel tariflerin yazıya geçirilmesi, mutfak belleğinin korunmasını sağlar.',
    d: [
      'Yöresel yemekler turistik amaçla sunulmalıdır.',
      'Genç kuşaklar yemek yapmayı öğrenmeye isteksizdir.',
      'Yazılı tarifler sözlü anlatımdan daha kısa olur.',
    ],
    e: 'Parça, sözlü aktarımın koptuğunu belirtip yazıya geçirmenin belleği koruduğu sonucuna ulaşır.',
  },
  {
    p: 'Mahalle spor kulüpleri, çocukların yeteneklerini ölçmek için seçmelere başvuruyor. Oysa kulübün asıl işlevi, henüz yeteneğini göstermemiş çocuğa da yer açması. Sırayla oynama, yenilgiyi kabullenme ve takım arkadaşını bekleme, seçme sınavında ölçülemeyen kazanımlar. Bu kazanımlar yalnızca düzenli katılımla, haftalar içinde ediniliyor. Kulüp, yetenek avcılığından çok mahallenin ortak alanı olmalı.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Mahalle spor kulüpleri, yetenek seçmekten çok herkese yer açan ortak alanlar olmalıdır.',
    d: [
      'Seçmeler çocukların özgüvenini zedelemektedir.',
      'Takım sporları bireysel sporlardan üstündür.',
      'Kulüplerin bütçesi yeterli değildir.',
    ],
    e: 'Parça, seçmenin ölçemediği kazanımları öne çıkararak kulübün ortak alan işlevini savunur.',
  },
  {
    p: 'Kuş göç yolları, yıllar boyunca düzenli kayıtla izleniyor. Bu kayıtlar, iklim değişiminin etkisini göstermede önemli bir araç. Göç tarihleri birkaç gün kaydığında bunun nedenini anlamak için uzun soluklu veri gerekiyor. Tek bir yılın gözlemi yanıltıcı olurken, kesintisiz kayıt eğilimi görünür kılıyor. Kaydı tutan gönüllülerin sürekliliği, verinin değerini belirliyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Göç gibi süreçlerde eğilimin görülmesi, kesintisiz ve uzun süreli kayda bağlıdır.',
    d: [
      'Kuş türlerinin sayısı her yıl azalmaktadır.',
      'Göç tarihleri yalnızca sıcaklıkla belirlenir.',
      'Amatör gözlemciler kayıtları yanlış toplamaktadır.',
    ],
    e: 'Parça, tek yılın yanıltıcılığını vurgulayıp eğilimin ancak kesintisiz kayıtla görülebildiğini belirtir.',
  },
  {
    p: 'Mutfak atıklarının çöpe gitmesi, hem taşıma hem depolama yükü oluşturuyor. Oysa bu atıklar kompostlaştırıldığında toprak için besin kaynağına dönüşüyor. Bir mahallede kurulan küçük kompost alanı, bahçe toprağını gübrelemek için yeterli olabiliyor. Ayrıştırma alışkanlığı kısa sürede yerleştiğinde çöp miktarı belirgin biçimde azalıyor. Atığı sorun olarak görmek yerine döngünün parçası saymak gerekiyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Mutfak atıkları, çöp olarak değil döngünün parçası olarak değerlendirilmelidir.',
    d: [
      'Kompost yapımı belediye hizmeti olmalıdır.',
      'Bahçe toprağı kimyasal gübreyle beslenmelidir.',
      'Atık taşıma maliyeti her yıl düşmektedir.',
    ],
    e: 'Parça, atığın yük olduğu saptamasını tersine çevirip kompostla besin kaynağına dönüştüğünü gösterir.',
  },
  {
    p: 'Öğretmenlerin mesleki dayanışma ağları, çoğu zaman resmî toplantıların dışında kuruluyor. Bir öğretmenin sınıfta işe yarayan yöntemini paylaşması, diğerinin haftalarca süren denemesini kısaltıyor. Bu paylaşım yazılı bir kaynağa dönüşmediğinde ise kişinin ayrılmasıyla birlikte kayboluyor. Oysa aynı yöntem, birkaç satırlık bir notla yıllarca kullanılabilir. Deneyimin kalıcı olması için kayda geçmesi gerekiyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Öğretmen deneyiminin kalıcı olması, yazılı kayda geçirilmesine bağlıdır.',
    d: [
      'Resmî toplantılar öğretmenlerin zamanını almaktadır.',
      'Sınıf yöntemleri her okulda aynı sonucu verir.',
      'Genç öğretmenler deneyimli meslektaşlarından yararlanmaz.',
    ],
    e: 'Parça, paylaşımın yararını kabul eder; kalıcılığı ise kayda geçirme koşuluna bağlar.',
  },
  {
    p: 'Cam atölyelerinde kırık parçalar uzun süre çöp sayıldı. Bugün bu parçalar eritilip yeniden biçimlendiriliyor. Dönüşüm, atölyenin malzeme maliyetini düşürürken tasarıma da yeni bir sınır getiriyor. Çünkü eldeki kırık parçanın rengi ve kalınlığı, yeni ürünün biçimini belirliyor. Tasarımcı, malzemenin söylediğini dinlemeyi öğreniyor; kısıt beklenmedik bir anlatım olanağına dönüşüyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Geri dönüştürülen malzemenin getirdiği kısıt, tasarımda yeni anlatım olanakları doğurabilir.',
    d: [
      'Cam atölyeleri maliyet nedeniyle kapanmaktadır.',
      'Kırık cam hiçbir koşulda yeniden kullanılamaz.',
      'Sanatçılar malzeme seçiminde tamamen özgürdür.',
    ],
    e: 'Parça, dönüşümün maliyeti düşürdüğünü söyler ama asıl vurgusu kısıtın yaratıcılığa dönüşmesidir.',
  },
  {
    p: 'Deniz fenerleri artık gemilere yol göstermek için tek başına yeterli değil. Uydu sistemleri konum bilgisini çok daha kesin veriyor. Yine de fener, kıyıya yaklaşan tekne için görsel bir işaret olmayı sürdürüyor. Elektronik sistemlerin kesildiği durumlarda bu basit işaret, hayati bir yedek işlevi görüyor. Bu yüzden eski teknolojiler, yeni sistemlerin yanında işlevini tümüyle yitirmiyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Teknolojik sistemlerin yanında basit ve bağımsız işaretler yedek işlev taşır.',
    d: [
      'Uydu sistemleri deniz taşımacılığını gereksiz kılmıştır.',
      'Deniz fenerleri müzeye dönüştürülmelidir.',
      'Kıyıya yaklaşan tekneler için hız sınırı uygulanmalıdır.',
    ],
    e: 'Parça, fenerin eski işlevini yitirdiğini kabul eder ama elektronik sistem kesildiğinde yedek olduğunu vurgular.',
  },
  {
    p: 'Arıcılık, koloninin çevresindeki çiçek çeşitliliğine bağlı. Tek tür bitkinin ekildiği geniş alanlar, arının beslenme düzenini bozuyor. Farklı zamanlarda açan bitkilerin bulunduğu bir arazi ise koloniye kesintisiz besin sağlıyor. Arıların beslenme düzeni, koloninin gücünü ve kışı çıkarma şansını belirliyor. Bu nedenle bal verimi, kovan sayısından çok çevredeki bitki çeşitliliğiyle ilgili; kovan sayısını artırmak, çevrede besin yoksa verimi yükseltmiyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Bal verimi, kovan sayısından çok çevredeki bitki çeşitliliğine bağlıdır.',
    d: [
      'Arıcılık yalnızca kırsal alanlarda yapılabilir.',
      'Tek tür ekim, tarımsal verimi artıran bir yöntemdir.',
      'Kovan sayısının artması bal üretimini düşürür.',
    ],
    e: 'Parça, tek tür ekimin sakıncasını gösterip verimi bitki çeşitliliğine bağlayarak kovan sayısını geri plana atar.',
  },
  {
    p: 'Okul kütüphanelerinde kitapların kapalı dolapta tutulması, onları korur ama okuru uzaklaştırır. Açık raf düzeni, öğrencinin kitabı eline alıp karıştırmasına olanak tanıyor. Rafta yan yana duran kapaklar, öğrencinin ne okuyacağına karar vermesini kolaylaştırıyor. Kapalı dolapta seçim yapmak için katalog bilgisi gerekiyor; bu da öğrenciyi kitaptan uzaklaştırıyor. Koruma kaygısı, erişimi engelleyecek biçimde öne çıkarılmamalı.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Kütüphanede koruma kaygısı, öğrencinin kitaba erişimini engellememelidir.',
    d: [
      'Kitapların kapalı dolapta tutulması en doğru yöntemdir.',
      'Öğrenciler kütüphanede kitap okumaya ilgi göstermez.',
      'Kapak tasarımı kitabın içeriğinden önemlidir.',
    ],
    e: 'Parça, koruma ile erişim arasındaki gerilimi kurup erişimin önüne geçilmemesi gerektiği sonucuna varır.',
  },
  {
    p: 'Tren istasyonlarında bekleme salonları çoğu zaman sert banklarla döşeniyor. Uzun bekleyen yolcu için bu düzen, dinlenmeyi değil bir an önce ayrılmayı teşvik ediyor. Oysa istasyon, yolculuğun parçası olan bir mekân. Oturma düzeni, ışık ve ısınma gibi ayrıntılar, yolculuğun niteliğini belirliyor. Yolcu, beklediği yerde kendini güvende hissettiğinde yolculuk daha az yorucu oluyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'İstasyonların fiziksel düzeni, yolculuk deneyiminin niteliğini belirleyen bir etkendir.',
    d: [
      'Yolcular istasyonlarda uzun süre beklemekten hoşlanır.',
      'Bekleme salonları yolcu sayısına göre yapılmalıdır.',
      'Tren yolculuğu otobüs yolculuğundan konforludur.',
    ],
    e: 'Parça, oturma düzeni gibi ayrıntıların yolculuğun niteliğini belirlediğini söyleyerek istasyonu yolculuğun parçası sayar.',
  },
  {
    p: 'Kentlerde yağmur suyu çoğu zaman kanalizasyona yönlendirilip uzaklaştırılıyor. Oysa çatılarda toplanan su, bahçe sulamasında kullanılabilir. Bu düzen, hem su faturasını düşürüyor hem de kanalizasyonun yükünü azaltıyor. Sağanak sırasında kanala binen yük azaldığında su baskını riski de düşüyor. Hasadın yaygınlaşması için basit depolama çözümlerinin konutlarda yer bulması gerekiyor.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Yağmur suyunun konutlarda toplanması, hem su tasarrufu hem altyapı rahatlaması sağlar.',
    d: [
      'Kanalizasyon sistemleri yenilenmelidir.',
      'Bahçe sulaması için şebeke suyu kullanılmalıdır.',
      'Yağış miktarı kentlere göre değişmektedir.',
    ],
    e: 'Parça, hasadın iki yararını sıralayıp yaygınlaşmasını basit depolama çözümlerine bağlar.',
  },
  {
    p: 'Yerel gazetelerin sararmış sayfaları, büyük olayların yanı sıra gündelik yaşamın ayrıntısını da saklıyor. Bir dükkân açılışı, bir okul töreni, bir mahalle tartışması yalnızca bu sayfalarda kalmış olabiliyor. Dijital arşivler bu ayrıntıyı çoğu zaman kapsamıyor. Çünkü dijital kayıt çoğunlukla büyük ve sansasyonel habere yöneliyor. Kent tarihini yazacak olanlar için bu sayfalar başvuru kaynağı değerinde.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    a: 'Yerel gazete arşivleri, kent tarihinin gündelik ayrıntısını koruyan kaynaklardır.',
    d: [
      'Dijital arşivler basılı arşivlerden daha kapsamlıdır.',
      'Yerel gazeteler yalnızca duyuru yayımlar.',
      'Kent tarihi yalnızca büyük olaylarla yazılır.',
    ],
    e: 'Parça, gündelik ayrıntının yalnızca yerel gazetelerde kaldığını belirterek bu arşivleri kaynak değerinde görür.',
  },
];

type AkisRow = { s: [string, string, string, string]; bad: number; e: string };

const PAR_AKIS: AkisRow[] = [
  {
    s: [
      'Okul servislerinin güzergâhı çoğu zaman harita üzerindeki en kısa yol üzerinden planlanıyor ve sabah trafiği hesaba katılmıyor.',
      'Oysa kısa güzergâh, sabah saatlerinde en yoğun trafiği de içerebildiği için yolculuğu beklenenden uzun süre uzatıyor.',
      'Servis aracının lastikleri her ay düzenli olarak kontrol edilmeli ve basınç değerleri kayda geçirilmelidir.',
      'Bu nedenle güzergâh seçiminde mesafe kadar trafik akışı da hesaplanmalı ve plan her dönem yenilenmelidir.',
    ],
    bad: 2,
    e: 'Parça güzergâh planlamasını tartışırken lastik bakımı ayrı bir konudur; üçüncü cümle akışı bozar.',
  },
  {
    s: [
      'Semt pazarının kurulduğu alan, akşam saatlerinde tezgâhlar kalkınca boş bir meydana dönüşüyor.',
      'Tezgâhların bıraktığı atık, ertesi gün için ciddi bir temizlik yükü oluşturuyor ve belediyenin ekibini sabahın erken saatlerinde meşgul ediyor.',
      'Pazarcı esnafı için erken saatte mal indirmek, günün en yorucu işi olmayı sürdürüyor.',
      'Bu yükü azaltmak için satıcılara ayrıştırma kutuları sağlanması ve alanın gece temizlenmesi öneriliyor.',
    ],
    bad: 2,
    e: 'Parça, pazar alanında kalan atığın yarattığı temizlik yükünü anlatır; mal indirmenin yorgunluğu konu dışıdır.',
  },
  {
    s: [
      'Altyazılı film izlemek, izleyicinin görüntü ile yazı arasında sürekli dikkat bölmesini gerektiriyor.',
      'Dublaj ise sesin oyunculukla uyumunu ayrı bir sorun olarak gündeme getiriyor ve çeviri kararlarını öne çıkarıyor.',
      'Sinema salonlarının koltuk düzeni, seyirci sayısına ve salonun biçimine göre ayarlanıyor.',
      'Bu nedenle tercih, izleyicinin hangi zorluğu göze aldığına göre değişiyor ve filmden alınan tat da buna bağlı oluyor.',
    ],
    bad: 2,
    e: 'Parça altyazı ile dublajın izleyiciye yüklediği farklı zorlukları karşılaştırır; koltuk düzeni bu tartışmaya girmez.',
  },
  {
    s: [
      'Ev bitkileri, bulundukları odanın nem dengesini ve hava kalitesini doğrudan etkiliyor; kışın kalorifer bu dengeyi bozuyor.',
      'Sulama sıklığı, bitkinin türüne, saksının büyüklüğüne ve odanın sıcaklığına göre değişiyor.',
      'Balkon mobilyalarının ahşap olması, dış mekânda bakımı kolaylaştıran bir seçim olarak öne çıkıyor.',
      'Bu yüzden her bitki için aynı sulama takvimini uygulamak yanıltıcı sonuçlar doğuruyor; kök çürüklüğü çoğu zaman fazla sulamadan kaynaklanıyor.',
    ],
    bad: 2,
    e: 'Parça sulama sıklığının bitkiye göre değiştiğini anlatır; balkon mobilyası konuyla ilgisizdir.',
  },
  {
    s: [
      'Dağ yollarındaki boya işaretleri, sisli ve karlı havada yön bulmayı belirgin biçimde kolaylaştırıyor.',
      'İşaretlerin belirli aralıklarla yenilenmesi rotanın güvenilirliğini koruyor; solmuş bir işaret yürüyüşçüyü yanlış yola sürükleyebiliyor.',
      'Dağcılar için hafif çadır seçimi, taşıma yükünü azaltan önemli bir etken olarak görülüyor.',
      'Bu nedenle işaretleme çalışmaları, kış koşulları başlamadan önce sezon başında yapılmalı ve rotalar duyurulmalı.',
    ],
    bad: 2,
    e: 'Parça rota işaretlerinin işlevini ve yenilenmesini anlatır; çadır seçimi ayrı bir konudur.',
  },
  {
    s: [
      'Konteyner taşımacılığı, yükün aktarma sırasında daha az elleçlenmesini sağlıyor; her aktarma yükün yeniden tartılmasını gerektiriyor.',
      'Standart ölçüler, farklı araçlar arasında aktarmayı hızlandırıyor ve bekleme süresini kısaltıyor.',
      'Gemi yakıt fiyatları mevsimlere göre dalgalanıyor ve taşıma maliyetini ayrı bir kalem olarak etkiliyor.',
      'Bu nedenle taşıma maliyeti, elleçleme sayısı azaldıkça belirgin biçimde düşüyor; limandaki bekleme süresi de bu hesaba katılıyor.',
    ],
    bad: 2,
    e: 'Parça elleçleme sayısının maliyete etkisini tartışır; yakıt fiyatlarının dalgalanması bu zincirin dışındadır.',
  },
  {
    s: [
      'Hamurun kabarması, mayanın sıcaklıkla kurduğu ilişkiye ve unun niteliğine bağlı.',
      'Hamur soğuk ortamda bekletildiğinde kabarma gecikiyor, ekmek istenen hacme ulaşmıyor; bu durumda dinlenme süresi uzatılıyor.',
      'Fırıncılık mesleği çoğu yerde aileden öğreniliyor ve ustalık yıllar içinde birikiyor.',
      'Bu yüzden hamurun dinleneceği ortamın sıcaklığı her aşamada ölçülmeli ve kayda geçirilmelidir.',
    ],
    bad: 2,
    e: 'Parça mayalanmanın sıcaklığa bağlılığını anlatır; mesleğin nasıl öğrenildiği konu dışıdır.',
  },
  {
    s: [
      'Dijital fotoğraflar çoğu zaman telefonun belleğinde birikip unutuluyor; binlerce kare arasından seçim yapmak zorlaşıyor.',
      'Seçilip basılan fotoğraflar ise albümde tekrar tekrar bakılan bir yere dönüşüyor.',
      'Fotoğraf makinelerinin lensleri, çekim yapılacak ışığa ve konuya göre seçiliyor.',
      'Bu nedenle yılda bir kez seçki yapmak, birikmiş görüntüyü anıya çeviriyor ve arşivi küçültüyor.',
    ],
    bad: 2,
    e: 'Parça biriken dijital görüntünün seçkiyle anıya dönüşmesini anlatır; lens seçimi teknik bir ayrıntıdır.',
  },
  {
    s: [
      'Parklarda çimlerin çok kısa biçilmesi kökün güneşten zarar görmesine yol açıyor; kısa kesilen çim suyu daha hızlı kaybediyor.',
      'Biçme yüksekliğinin mevsime göre ayarlanması, çimin dayanıklılığını artırıyor ve kökün gölgelenmesini sağlıyor.',
      'Parklardaki bankların rengi çoğu kentte aynı olacak biçimde standartlaştırılıyor.',
      'Bu yüzden bakım planı, biçme sıklığından çok biçme yüksekliğine odaklanmalı.',
    ],
    bad: 2,
    e: 'Parça biçme yüksekliğinin çim sağlığına etkisini anlatır; bank rengi konuyla ilgisizdir.',
  },
  {
    s: [
      'Provanın ilk günlerinde metnin yüksek sesle okunması, oyuncunun ritmi bulmasını sağlıyor.',
      'Okuma sırasında yapılan duraklamalar, metnin nerede zorlandığını gösteriyor ve oyuncunun nerede nefes alacağını belirliyor.',
      'Tiyatro salonlarının akustiği, sahne biçimine ve seyirci kapasitesine göre değişiyor.',
      'Bu nedenle ilk okuma, ezberden önce yapılması gereken bir aşama; metin anlaşılmadan yapılan ezber oyunculuğu mekanikleştiriyor.',
    ],
    bad: 2,
    e: 'Parça metni yüksek sesle okumanın prova sürecindeki yerini anlatır; salon akustiği ayrı bir konudur.',
  },
  {
    s: [
      'Gözetleme kuleleri, dumanı uzaktan görerek erken uyarı sağlıyor; dumanın rengi yangının türü hakkında bilgi veriyor.',
      'Kulelerin görüş alanı, arazinin eğimine ve ağaç örtüsünün yoğunluğuna göre hesaplanıyor.',
      'Yangın söndürme uçaklarının kapasitesi her yıl artıyor ve müdahale süresi kısalıyor.',
      'Bu yüzden kule yerleşimi kör nokta bırakmayacak biçimde planlanmalı; yeni yerleşim alanları görüş alanını değiştirebiliyor.',
    ],
    bad: 2,
    e: 'Parça kulelerin görüş alanı ve yerleşimini tartışır; uçak kapasitesi farklı bir başlıktır.',
  },
  {
    s: [
      'Süt ürünlerinin bozulmadan taşınması, kesintisiz bir soğuk zincire bağlı; zincirin ilk halkası sağımdan hemen sonra başlıyor.',
      'Zincirin tek bir halkasında sıcaklık yükseldiğinde ürünün raf ömrü belirgin biçimde kısalıyor.',
      'Süt üreticileri çoğunlukla kooperatifler aracılığıyla satış yapıyor ve zincirin ilk halkasını kendi tesislerinde kuruyor.',
      'Bu nedenle taşıma araçlarında sıcaklık kaydı tutulmalı ve denetim düzenli yapılmalı.',
    ],
    bad: 2,
    e: 'Parça soğuk zincirin kesintisizliğini savunur; satış örgütlenmesi bu tartışmaya girmez.',
  },
  {
    s: [
      'Okul bahçesinde öğle saatlerinde gölge bulmak neredeyse olanaksız hâle geliyor.',
      'Gölgelik, çocuğun teneffüste güneş altında kalma süresini kısaltıyor; öğle arasında açık alanda oynayan çocuklar için bu süre belirleyici.',
      'Okul binasının cephesi her yıl boyanıyor ve bu iş yaz tatiline denk getiriliyor.',
      'Bu yüzden gölgelik yerleşimi güneşin geliş yönüne göre yapılmalı ve altına oturma alanı eklenmeli.',
    ],
    bad: 2,
    e: 'Parça gölgeliğin işlevini ve yerleşimini anlatır; cephe boyama konuyla ilgisizdir.',
  },
  {
    s: [
      'Mahallede kurulan tamir atölyesi, bisikletin kullanım ömrünü uzatıyor; küçük bir ayar zincirin ve frenin ömrünü artırıyor.',
      'Atölyede öğrenilen basit onarımlar, sürücünün yolda kalma kaygısını azaltıyor.',
      'Bisiklet yarışları her yıl farklı kentlerde düzenleniyor ve geniş kitlelere ulaşıyor.',
      'Bu nedenle atölyelerin sayısı bisiklet kullanımını doğrudan etkiliyor; lastiği patladığında tamirci bulamayan sürücü bisikleti bırakıyor.',
    ],
    bad: 2,
    e: 'Parça tamir atölyelerinin bisiklet kullanımına etkisini anlatır; yarış takvimi ayrı bir konudur.',
  },
  {
    s: [
      'Bir çalgının akordu, tellerin gerginliğiyle doğrudan ilişkili; teller zamanla esnediği için bu denge bozuluyor.',
      'Nem oranı değiştiğinde ahşap gövde genişleyip akort kayıyor; bu nedenle konser öncesi kontrol yapılıyor.',
      'Konser salonlarının sahne ışıkları çalgıların rengini ve parlaklığını etkiliyor.',
      'Bu yüzden çalgı, kullanılmadığında nemi dengeli bir yerde saklanmalı ve düzenli olarak akort edilmelidir.',
    ],
    bad: 2,
    e: 'Parça akordu etkileyen nem dengesini anlatır; sahne ışığının renk etkisi konu dışıdır.',
  },
  {
    s: [
      'Kargo paketlerinde kullanılan dolgu malzemesi, kutunun hacmini gereğinden çok büyütüyor.',
      'Büyüyen hacim, taşıma sırasında daha çok araç kapasitesi istiyor; aynı araca daha az paket yüklenebiliyor.',
      'Kargo şirketleri teslimat sürelerini kısaltmak için birbiriyle yarışıyor ve paket sayısı her yıl artıyor.',
      'Bu yüzden paketleme, ürünü koruyacak en küçük hacimle yapılmalı ve dolgu maddesi gereksiz yere artırılmamalı.',
    ],
    bad: 2,
    e: 'Parça paket hacminin taşıma kapasitesine etkisini tartışır; teslimat süresi yarışı başka bir konudur.',
  },
  {
    s: [
      'Barınaklarda gönüllü çalışanlar, hayvanların insanla bağ kurmasını kolaylaştırıyor ve günlük bakım yükünü paylaşıyor.',
      'Düzenli gezdirme, barınakta kalan köpeklerin kaygısını azaltıyor; gezdirilen köpeklerin sahiplenilme oranı da artıyor.',
      'Barınakların bulunduğu arsalar genellikle kent dışında ve ulaşımı zor yerlerde.',
      'Bu nedenle gönüllü katkısı, barınak hizmetinin niteliğini yükseltiyor ve bakım maliyetini düşürüyor.',
    ],
    bad: 2,
    e: 'Parça gönüllü emeğin barınak hizmetine katkısını anlatır; arsa konumu ayrı bir tartışmadır.',
  },
  {
    s: [
      'Tren raylarının belirli aralıklarla ölçülmesi, aşınmayı erken gösteriyor; ölçüm sonuçları bakım planına girdi oluşturuyor.',
      'Küçük bir eğrilik, yüksek hızda titreşimi artırarak yolculuğu bozuyor ve rayın daha hızlı yıpranmasına yol açıyor.',
      'Tren biletleri artık çoğunlukla çevrim içi kanallardan alınıyor.',
      'Bu yüzden bakım, arıza sonrası değil düzenli ölçümle yapılmalı; ölçüm aralığı kullanım yoğunluğuna göre belirlenmeli.',
    ],
    bad: 2,
    e: 'Parça ray ölçümünün bakım açısından değerini anlatır; bilet satış biçimi konuyla ilgisizdir.',
  },
  {
    s: [
      'Havuz suyunda klor dengesi bozulduğunda suyun berraklığı hızla azalıyor; dip temizliği de aksıyor.',
      'Berraklık azaldığında yüzücünün görüşü kısıtlanıyor ve güvenlik riski artıyor; çocuk havuzlarında bu denge daha sık kontrol ediliyor.',
      'Havuzlarda kullanılan bone renkleri kulüplere göre değişiyor ve yarışmalarda takım rengini belirliyor.',
      'Bu nedenle klor düzeyi günlük olarak ölçülmeli ve sonuçlar kaydedilmeli.',
    ],
    bad: 2,
    e: 'Parça klor dengesinin su berraklığına etkisini anlatır; bone rengi konu dışıdır.',
  },
  {
    s: [
      'Yürüyüş parkuru, kentlinin doğayla kurduğu en kolay bağı oluşturuyor; kentte yaşayan biri için doğaya çıkmak saatler sürmüyor.',
      'Parkurun işaretlenmesi, yeni başlayanların yönünü kaybetmesini önlüyor; işaretler parkurun zorluk derecesini de bildiriyor.',
      'Kent ormanlarındaki ağaç türleri bölgeye ve iklime göre değişiyor.',
      'Bu yüzden parkur bakımı, kullanıcı sayısı arttıkça daha sık yapılmalı ve aşınan bölümler yenilenmeli.',
    ],
    bad: 2,
    e: 'Parça parkurun erişilebilirliğini ve bakımını anlatır; ağaç türü çeşitliliği başka bir konudur.',
  },
  {
    s: [
      'Kitabın kâğıdı, sayfanın arkasının görünmesini engelleyecek kalınlıkta olmalı; ders kitabında bu ölçüt daha da öne çıkıyor.',
      'İnce kâğıt, kitabın ağırlığını azaltırken okunabilirliği düşürüyor; arka sayfanın yazısı ön sayfayı kirletiyor.',
      'Yayınevleri yeni yazarlara kapılarını giderek kapatıyor ve baskı sayısını artırıyor.',
      'Bu yüzden kâğıt seçimi, kitabın kullanım amacına göre yapılmalı ve maliyet hesabı buna göre kurulmalı.',
    ],
    bad: 2,
    e: 'Parça kâğıt kalınlığının okunabilirliğe etkisini tartışır; yayınevlerinin yazar politikası konu dışıdır.',
  },
  {
    s: [
      'Yaz aylarında sokak hayvanları için temiz su bulmak giderek zorlaşıyor; kurak günlerde bu sorun daha da belirginleşiyor.',
      'Kaldırıma yerleştirilen kaplar suya erişimi kolaylaştırıyor; gölgeye konan bir kap suyun daha uzun süre serin kalmasını sağlıyor.',
      'Sokak hayvanlarının sayısı mahalleden mahalleye değişiyor ve kimi mahallede belirgin biçimde artıyor.',
      'Bu yüzden kapların düzenli temizlenmesi sağlık açısından zorunlu; temizlenmeyen kap larva kaynağına dönüşüyor.',
    ],
    bad: 2,
    e: 'Parça su kaplarının erişimi kolaylaştırmasını ve temizliğini anlatır; hayvan sayısı konu dışıdır.',
  },
  {
    s: [
      'Okullarda ayrıştırma kutularının konması tek başına yeterli olmuyor; kutu fark edilmediğinde atık yine çöpe gidiyor.',
      'Kutunun nereye konduğu, öğrencinin onu kullanıp kullanmamasını belirliyor; koridorun sonundaki kutu çoğu zaman görülmüyor.',
      'Geri dönüşüm tesisleri çoğunlukla kent merkezinin dışında kuruluyor ve taşıma mesafesi maliyeti artırıyor.',
      'Bu yüzden kutular, atığın oluştuğu yere en yakın noktaya yerleştirilmeli ve üzerindeki görseller anlaşılır olmalı.',
    ],
    bad: 2,
    e: 'Parça kutunun yerinin kullanımı belirlediğini anlatır; tesis konumu ayrı bir tartışmadır.',
  },
];

function genParAkis() {
  const numerals = ['I', 'II', 'III', 'IV'];
  const stems = [
    'Bu parçada numaralanmış cümlelerden hangisi anlam akışını bozmaktadır?',
    'Bu parçada numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
    'Bu parçada numaralanmış cümlelerden hangisi parçanın bütünlüğünü bozmaktadır?',
  ];
  PAR_AKIS.forEach((row, index) => {
    const body = row.s
      .map((sentence, position) => {
        const extra = position === 3 ? ` ${PAR_EK_AKIS[index]}` : '';
        return `(${numerals[position]}) ${sentence}${extra}`;
      })
      .join(' ');
    add(
      {
        id: nextId('par'),
        prompt: `${body}\n\n${stems[index % stems.length]}`,
        answer: `${numerals[row.bad]}. cümle`,
        distractors: numerals.filter((_, position) => position !== row.bad).map((item) => `${item}. cümle`),
        explanation: row.e,
        difficulty: difficultyAt(index),
        kind: 'reading',
      },
      T_PAR,
    );
  });
}

const PAR_BASLIK: Row[] = [
  {
    p: 'Kovana dönen arı, besin bulduğu yönü dansla anlatıyor. Dansın yönü güneşe göre ayarlanıyor, süresi ise uzaklığı bildiriyor. Karanlık kovanda başka türlü iletişim kurulamadığı için bu dans tek araç oluyor. İzleyen arılar dansı birkaç kez tekrarlatıp yolu ezberliyor. Dansın süresi uzadıkça besinin uzakta olduğu anlaşılıyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Arıların Dansla Haberleşmesi',
    d: ['Kovanın Isısı', 'Bal Üretiminin Maliyeti', 'Arı Türlerinin Dağılımı'],
    e: 'Parçanın tamamı, arıların yön ve uzaklığı dansla bildirmesini anlattığı için başlık haberleşmeyle ilgilidir.',
  },
  {
    p: 'Eski bir cep saatinin içinde yüzlerce küçük parça bulunuyor. Tamirci önce hangi parçanın durduğunu anlamak için saati dinliyor. Ardından parçaları sırayla söküp her birini ayrı ayrı temizliyor. Sabır isteyen bu iş, saatin yeniden çalışmasıyla son buluyor. Tamirci, işin sonunda hangi parçanın neden aşındığını da öğrenmiş oluyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Bir Saatin Sabırla Onarılması',
    d: ['Saatlerin Tarihçesi', 'Zaman Ölçümünde Değişim', 'Eski Eşyaların Değeri'],
    e: 'Parça, tamircinin saati dinleyip parçalarını temizleyerek çalıştırmasını anlatır; başlık onarımla ilgilidir.',
  },
  {
    p: 'Yamaç paraşütünde kalkış, koşmaktan çok rüzgârı okumaya bağlı. Pilot, kanadın üstünde oluşan hava akımını elle hissediyor. Rüzgâr yönü uygun değilse beklemek gerekiyor. Bu yüzden deneyimli pilotlar, uçuştan önce uzun süre havayı izliyor. Beklemek, kanadı yıpratarak uçmaktan daha az zaman alıyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Uçuş Öncesi Rüzgârı Okumak',
    d: ['Paraşüt Kanadının Yapısı', 'Yükseklik Korkusu', 'Dağ Turizminin Gelişimi'],
    e: 'Parça, kalkışın rüzgârı okumaya bağlı olduğunu ve pilotların havayı izlediğini anlatır.',
  },
  {
    p: 'Kışın kuşlar için en büyük sorun besin bulmak değil, donmuş suya ulaşmaktır. Bahçeye konan bir su kabı, kar altında kalan kaynakların yerini tutuyor. Kabın her gün tazelenmesi ve temizlenmesi gerekiyor. Böylece kuşlar enerjilerini su aramakla harcamıyor. Kap gölgede tutulduğunda su daha uzun süre donmuyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Kışın Kuşlara Su Sağlamak',
    d: ['Kuş Göçlerinin Zamanı', 'Bahçe Düzenlemesi', 'Kışın Bitki Bakımı'],
    e: 'Parça, kışın kuşlar için suyun önemini ve kap bakımını anlattığından başlık su sağlamayla ilgilidir.',
  },
  {
    p: 'Deniz kabukları, kıyıya vardıklarında çoğu zaman kırılmış oluyor. Koleksiyoncu, sağlam kabuğu bulmak için dalganın çekildiği anı bekliyor. Her kabuğun hangi canlıya ait olduğunu anlamak ayrı bir bilgi istiyor. Bu yüzden koleksiyon, biriktirmekten çok tanımayı gerektiriyor. Tanıdıkça kıyıdaki her kırık parça bir bilgiye dönüşüyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Kabuk Toplamak ve Tanımak',
    d: ['Deniz Canlılarının Göçü', 'Kıyı Erozyonu', 'Dalga Yüksekliği Ölçümü'],
    e: 'Parça, kabuk toplamanın tanımayı gerektirdiğini anlatır; başlık toplama ve tanıma üzerinedir.',
  },
  {
    p: 'Çömlekçi çarkında kil, merkezden kaçtığı anda biçim bozuluyor. Usta, parmaklarını hafifçe bastırarak kili merkezde tutuyor. Kabın duvarı inceldikçe dokunuşun şiddeti azalıyor. Bu yüzden çırak, biçimden önce dokunuşun dozunu öğreniyor. Doz kaçtığında kap çarkta bir anda yamuluyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Çömlekçi Çarkında Dokunuşun Dozu',
    d: ['Kilin Kimyasal Yapısı', 'Seramik Fırınlarının Isısı', 'El Sanatlarının Turizmi'],
    e: 'Parça, çarkta biçimi belirleyen şeyin dokunuşun dozu olduğunu anlattığından başlık bu konudadır.',
  },
  {
    p: 'Gökdelenlerde asansör sayısı, kat sayısından çok çalışan insan sayısına göre hesaplanıyor. Sabah saatlerinde herkes aynı yöne gitmek istediği için kuyruk oluşuyor. Bekleme süresini kısaltmak için katlara ayrılmış asansör grupları kullanılıyor. Bu düzen, yolculuğun toplam süresini belirgin biçimde düşürüyor. Aynı sayıda asansör, doğru gruplandığında daha çok kişi taşıyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Asansör Düzeninde Bekleme Süresi',
    d: ['Gökdelenlerin Deprem Güvenliği', 'Bina Cephelerinin Tasarımı', 'Kentlerde Ofis Kiraları'],
    e: 'Parça, asansör sayısının ve gruplanmasının bekleme süresini nasıl belirlediğini anlatır.',
  },
  {
    p: 'Köy kahvaltısında sofraya konan ürünlerin çoğu aynı bahçeden geliyor. Domates, peynir ve ekmek arasındaki mesafe kısa olduğu için tat farklı oluyor. Sofranın zenginliği, ürün sayısından çok tazelikten geliyor. Bu yüzden kahvaltı, bir yemekten çok üretim biçiminin görünüşü. Sofrada ne varsa, bahçede ne yetiştiği anlaşılıyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Sofrada Tazeliğin Payı',
    d: ['Köyden Kente Göç', 'Ekmek Yapımının Tarihi', 'Hayvancılıkta Verim'],
    e: 'Parça, kahvaltı sofrasındaki farkı tazeliğe ve kısa mesafeye bağlar.',
  },
  {
    p: 'Tren yolculuğunda pencere kenarı, manzaradan çok zaman duygusuyla ilgili. Hareket hâlindeki tren, geçen yeri geriye doğru kaydırıyor. Yolcu bu kaymayı izlerken yolculuğun süresini daha kısa algılıyor. Bu nedenle pencere, trenin en çok tercih edilen yeri oluyor. Aynı süre, koridorda ayakta geçtiğinde çok daha uzun hissediliyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Pencereden Bakmanın Etkisi',
    d: ['Tren Hatlarının Planlanması', 'Ray Bakımının Önemi', 'İstasyon Mimarisi'],
    e: 'Parça, pencere kenarının zaman algısını değiştirmesini anlattığı için başlık bununla ilgilidir.',
  },
  {
    p: 'Sokak fotoğrafçısı, ilginç bir anı beklerken çoğu zaman boş kareler çekiyor. İyi kare, ışığın ve insanın aynı anda uygun yere geldiği anda doğuyor. Fotoğrafçı bunu şansa bırakmamak için aynı köşede saatlerce bekliyor. Sabır, bu işin görünmeyen malzemesi. Beklemeyen fotoğrafçı, en çok karşılaştığı sahneyi kaçırıyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Sokak Fotoğrafında Sabır',
    d: ['Fotoğraf Makinesi Seçimi', 'Kentlerde Kalabalık', 'Görüntü İşleme Teknikleri'],
    e: 'Parça, iyi karenin doğması için beklemeyi ve sabrı öne çıkarır.',
  },
  {
    p: 'Bitki çayı demlerken suyun sıcaklığı, tadı belirleyen en önemli etken. Kaynar su, nane gibi ince yapraklı bitkilerde acı bir tat bırakıyor. Kök ve kabuklardan yapılan çaylar ise daha sıcak su istiyor. Bu yüzden demleme süresi bitkinin hangi bölümünden geldiğine göre ayarlanmalı. Aynı bitki, yanlış sıcaklıkta demlendiğinde beklenen etkiyi göstermiyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Demlemede Sıcaklık ve Süre',
    d: ['Şifalı Bitkilerin Tarihi', 'Bahçede Bitki Yetiştirme', 'Çay Bardaklarının Biçimi'],
    e: 'Parça, su sıcaklığı ve demleme süresinin bitkiye göre ayarlanmasını anlatır.',
  },
  {
    p: 'Eski plaklarda kayıt, iğnenin oluğu izlemesiyle okunuyor. Toz, iğnenin yolunu bozduğu için her çalımdan önce yüzey temizleniyor. Plak ne kadar çok çalınırsa oluk o kadar aşınıyor. Bu nedenle koleksiyoncular az çalınmış kayıtları arıyor. Aşınmış bir plak, en iyi sistemde bile çıtırtıyla çalıyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Plağın Ömrünü Belirleyen Aşınma',
    d: ['Müzik Türlerinin Gelişimi', 'Ses Kayıt Stüdyoları', 'Konser Salonlarının Akustiği'],
    e: 'Parça, plağın aşınmasını ve az çalınmış kayıtların aranmasını anlattığından başlık aşınmayla ilgilidir.',
  },
  {
    p: 'Satranç kulübünde yeni başlayanlar önce taşların değerini öğreniyor. Ancak oyunun asıl dersi, hamlenin sonucunu önceden görmek. Usta oyuncular taş değişimini hesaplarken rakibin yanıtını da düşünüyor. Bu yüzden kulüpte oynanan hazırlık maçları, ezberden çok hesap yapmayı öğretiyor. Hesabı öğrenen oyuncu, ezberlediği açılışları da anlamlı kullanıyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Satrançta Hamleyi Önceden Görmek',
    d: ['Satranç Turnuvaları', 'Taşların Tarihçesi', 'Çocuklarda Dikkat Süresi'],
    e: 'Parça, oyunun asıl dersinin hamlenin sonucunu önceden görmek olduğunu belirtir.',
  },
  {
    p: 'Şehir efsaneleri, doğruluğu araştırılmadan anlatılmaya devam ediyor. Anlatıcı, hikâyeyi her seferinde biraz daha ilginç hâle getiriyor. Dinleyici ise tanıdık bir yer adı duyduğunda hikâyeye daha kolay inanıyor. Bu yüzden efsanenin gücü, kanıtından değil anlatımından geliyor. Aynı hikâye başka bir mahallede anlatıldığında inandırıcılığını yitiriyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Efsanenin Gücü Anlatımından Gelir',
    d: ['Kent Tarihinin Kaynakları', 'Söylentilerin Hukuku', 'Mahalle Adlarının Kökeni'],
    e: 'Parça, efsanenin inandırıcılığını kanıta değil anlatıma bağlar.',
  },
  {
    p: 'Yürüyüş ayakkabısında en önemli ölçü, ayağın boyu değil genişliği. Uzun yürüyüşte ayak hafifçe şiştiği için dar ayakkabı tırnağı zorluyor. Tabanın sertliği ise arazinin yapısına göre seçiliyor. Bu nedenle ayakkabı, akşam saatlerinde denenerek alınmalı. Sabah denenen ayakkabı, gün içinde ayak şiştiğinde sıkmaya başlıyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Ayakkabı Seçiminde Ölçü ve Zamanlama',
    d: ['Doğa Yürüyüşü Rotaları', 'Ayak Sağlığında Beslenme', 'Spor Giyiminde Moda'],
    e: 'Parça, ayakkabı seçiminde genişlik ve deneme zamanının belirleyici olduğunu anlatır.',
  },
  {
    p: 'Kukla atölyesinde her kukla, oynatıcısının eline göre ayarlanıyor. İplerin uzunluğu, eklemlerin serbestliği oyuncunun hareketine göre değişiyor. Hazır kukla ile oynamak bu yüzden zorlaşıyor. Atölyede üretim, tasarımdan çok bedenin ölçüsüne uyum işi. Aynı kukla, başka bir oyuncunun elinde beklenen hareketi vermiyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Kuklanın Oyuncuya Uyarlanması',
    d: ['Geleneksel Oyun Türleri', 'Sahne Işıklandırması', 'Çocuk Tiyatrosunun Tarihi'],
    e: 'Parça, kuklanın oynatıcının eline ve hareketine göre ayarlanmasını anlatır.',
  },
  {
    p: 'Balıkçı barınağı, teknelerin barınmasından çok günlük yaşamın düzenini kuruyor. Ağlar burada onarılıyor, yakıt burada alınıyor, haber burada dolaşıyor. Barınağın düzeni bozulduğunda teknelerin çalışma saatleri de değişiyor. Bu yüzden barınak, bir tesis değil bir çalışma ortamı. Sabah kimin önce denize açılacağı bile burada belirleniyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Barınağın Gündelik İşleyişi',
    d: ['Balık Fiyatlarının Değişimi', 'Deniz Taşımacılığı', 'Kıyı Turizmi'],
    e: 'Parça, barınağın ağ onarımı ve yakıt gibi gündelik işleri düzenlediğini anlatır.',
  },
  {
    p: 'El dokuma halıda desen, dokuyucunun belleğinden çıkıyor. Aynı desen iki dokuyucuda birebir aynı olmuyor. İlmek sıklığı ve renk geçişleri kişinin el alışkanlığını yansıtıyor. Bu yüzden halının değeri, kusursuzluğunda değil kişisel izlerinde aranıyor. Ustalar, bu izlerden halının hangi yörede dokunduğunu anlıyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Halıda Kişisel İzler',
    d: ['Halı Ticaretinin Gelişimi', 'Doğal Boyarmaddeler', 'Dokuma Tezgâhlarının Tarihi'],
    e: 'Parça, aynı desenin kişiye göre değişmesini ve değerin bu izlerde aranmasını anlatır.',
  },
  {
    p: 'Kış bahçesi, cam yüzeyi sayesinde gün ışığını toplayıp ısıyı tutuyor. Ancak yaz aylarında aynı cam yüzey aşırı ısınmaya yol açıyor. Gölgeleme perdesi ve havalandırma, mevsimlere göre ayarlanması gereken unsurlar. Bu yüzden kış bahçesi, sabit değil mevsimle birlikte kullanılan bir mekân. Yazın kapalı kalan bir kış bahçesi, kullanılmayan bir odaya dönüşüyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Mevsime Göre Ayarlanan Mekân',
    d: ['Cam Üretim Teknikleri', 'Bahçe Sulama Sistemleri', 'Konut Fiyatlarının Belirleyicileri'],
    e: 'Parça, kış bahçesinin mevsime göre gölgeleme ve havalandırmayla kullanıldığını anlatır.',
  },
  {
    p: 'Okul gazetesi, haber toplamaktan çok seçmeyi öğretiyor. Öğrenci, hangi olayın haber değeri taşıdığına karar verirken ölçüt geliştiriyor. Yazının uzunluğu, sayfa düzeni ve başlık seçimi birlikte düşünülüyor. Bu yüzden gazete, yazma kadar düzenleme becerisi de kazandırıyor. Kısaltılan her cümle, öğrenciye neyin gereksiz olduğunu gösteriyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Okul Gazetesinde Seçme ve Düzenleme',
    d: ['Basının Tarihsel Gelişimi', 'Öğrencilerde Okuma Alışkanlığı', 'Okul Yönetimi'],
    e: 'Parça, gazetenin haber seçmeyi ve düzenlemeyi öğrettiğini anlatır.',
  },
  {
    p: 'Bisiklet turu planlarken en çok sorulan soru mesafe oluyor. Oysa yükselti farkı, aynı mesafeyi çok daha yorucu hâle getiriyor. Rüzgâr yönü de günün hangi saatinde yola çıkılacağını belirliyor. Bu yüzden plan, haritadaki çizgiden çok koşulların hesabına dayanıyor. Aynı yol, ters yönde gidildiğinde bambaşka bir tur oluyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Turu Belirleyen Koşullar',
    d: ['Bisiklet Bakımı', 'Yol Güvenliği Kuralları', 'Turizmde Bisiklet Kiralama'],
    e: 'Parça, mesafeden çok yükselti ve rüzgâr gibi koşulların turu belirlediğini söyler.',
  },
  {
    p: 'Müzik festivali hazırlığında sahne kurulumu en sona bırakılıyor. Oysa ses düzeninin denenmesi, programın akışını belirliyor. Bir gecikme, bütün grupların sahne saatlerini kaydırıyor. Bu yüzden festival yönetimi, programı kurulum takvimine göre kuruyor. Kurulum takvimi tutmayan bir festivalde en iyi gruplar bile boş salona çıkabiliyor.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?',
    a: 'Kurulum Takviminin Programı Belirlemesi',
    d: ['Festival Alanının Seçimi', 'Müzik Gruplarının Geliri', 'Seyirci Sayısının Artışı'],
    e: 'Parça, ses düzeni denemelerinin gecikmesinin programı kaydırdığını, yani takvimin belirleyici olduğunu anlatır.',
  },
];

const PAR_EK_ANA: string[] = [
  'Teneffüs zili çaldığında çocukların büyük bölümü, gölgesi ve oturma yeri olmayan beton bir alana çıkıyor; bu alan günün en kalabalık anını taşıyor.',
  'Kentte bisiklet kullananların sayısı her yıl artıyor, ancak güvenli yollar aynı hızda çoğalmıyor.',
  'Ders sırasında öğrencilerin defterlerine ne yazdığı, eğitimde çoğu zaman göz ardı edilen bir ayrıntı.',
  'Yaz aylarında kumsalların büyük bölümü şezlong, şemsiye ve gece ışıklandırmasıyla dolduruluyor; kıyı şeridi gün batımından sonra da kullanılıyor.',
  'Bir müzeyi gezdikten sonra akılda kalanlar, çoğu zaman okunan etiketler değil nesneyle kurulan bağ oluyor.',
  'Kentlerde üretici pazarları son yıllarda yeniden yaygınlaşıyor ve her hafta yeni bir kuruluş alanı açılıyor.',
  'Kütüphaneye gelen herkes aynı hızda okumuyor, aynı süreyle kalmıyor ve aynı sessizliği istemiyor.',
  'Göl kıyısındaki sazlıklar, çoğu zaman bakılmayan, kenarda kalmış bir görüntü olarak duruyor.',
  'Evlerde bozulan eşyalar çoğu zaman tamir edilmeden atılıyor ve yerine hemen yenisi satın alınıyor.',
  'Kentte bir uçtan diğerine gitmek, çoğu zaman birden fazla aracı ve uzun bir beklemeyi gerektiriyor.',
  'Yaz sıcaklarında kaldırımda yürümek, gölgeli bir caddede yürümekten çok daha yorucu oluyor; yaşlılar bu yüzden güzergâhını değiştiriyor.',
  'Apartmanda yaşayan komşular çoğu zaman birbirinin adını bile bilmeden yıllarca aynı binada kalıyor.',
  'Yöresel yemekler, çoğu zaman tarif defterine geçirilmeden kuşaktan kuşağa aktarılıyor.',
  'Mahallelerde çocukların spor yapabileceği boş alanlar hızla azalıyor, yerlerini yeni binalar alıyor.',
  'Göç dönemlerinde kuş sayımı yapan gönüllüler, yıllar öncesine uzanan düzenli defterler tutuyor.',
  'Kentlerde her gün tonlarca mutfak atığı toplanıyor ve taşınması için ayrı bir emek harcanıyor.',
  'Öğretmenlerin sınıfta geliştirdiği yöntemler, çoğu zaman dört duvar arasında kalıp kayboluyor.',
  'Atölyelerde kırılan cam, uzun süre atık olarak birikiyor ve ayrı bir depolama alanı istiyor.',
  'Kıyıya yaklaşan bir tekne için en güvenilir işaret, çoğu zaman en eski olanı oluyor.',
  'Bal üreticileri, verim düşüklüğünü çoğu zaman kovan sayısına bağlayarak çözüm arıyor.',
  'Öğrencinin kitaba ulaşması, okul kütüphanesindeki düzenin ilk ve en belirleyici sınavı.',
  'İstasyonda geçen süre, yolculuğun toplam süresinin önemli bir bölümünü oluşturuyor.',
  'Kentlerde yağmur suyu çoğu zaman atık olarak görülüp kanala gönderiliyor ve bir kaynak olarak değerlendirilmiyor.',
  'Kentlerin geçmişi çoğu zaman büyük olaylarla anlatılıyor, gündelik ayrıntı geri planda kalıyor.',
];

const PAR_EK_BASLIK: string[] = [
  'Kovandaki iş bölümü tek bir bireyin değil topluluğun bilgisiyle yürüyor; kovana dönen arı, dansı izleyenlere yiyeceğin yönünü ve uzaklığını kısa sürede öğretiyor, böylece kovan ortak bir bellekle çalışıyor.',
  'Bozulan bir saatin tamiri çoğu zaman yenisini almaktan daha uzun sürüyor ama tamirciye parçaların nasıl işlediğini öğretiyor; bu bilgi, bir sonraki arızayı belirgin biçimde kolaylaştırıyor.',
  'Havayı okumak, yamaç paraşütünde teknik bilgiden önce gelen ve yıllar içinde ancak deneyimle gelişen, sabır isteyen bir beceri olarak öne çıkıyor.',
  'Kışın bahçeye konan bir kap, kuşlar için besin kadar değerli bir kaynak oluyor; düzenli bakım bahçeyi kış boyunca canlı tutuyor ve kuşları bahçeye alıştırıyor.',
  'Kıyıda toplanan her kabuk, bir canlının yaşam öyküsünü ve kıyının geçmişini taşıyor; bu yüzden koleksiyon, sessiz bir arşiv gibi okunmayı bekliyor.',
  'Çarkın dönüş hızı sabit kalsa da ellerin verdiği karar her turda yeniden alınıyor ve kabın biçimi tam o anda ortaya çıkıyor; usta, kile ne kadar bastıracağını sürekli tartıyor.',
  'Asansör bekleme süresi bir binanın günlük işleyişini sanıldığından çok daha fazla etkiliyor; sabah saatlerinde bu süre, çalışanların bütün gününü biçimlendiriyor.',
  'Sofraya konan her ürünün nerede ve ne zaman yetiştiği, tadı kadar sofradaki sohbeti ve günün temposunu da biçimlendiriyor.',
  'Pencereden geçen manzara değiştikçe yolculuğun uzunluğu da yolcunun gözünde değişiyor; zaman, pencereden bakınca çok daha hızlı akıyor.',
  'Sokakta geçen saatler çoğu zaman tek bir kare için harcanıyor ve bu emek çekilen fotoğrafta hiç görünmüyor; sabır, işin görünmeyen malzemesi olarak kalıyor.',
  'Demleme, bitkinin yapısına göre değişen ölçülerle yapılan küçük bir kimya denemesi gibi sabır ve dikkat istiyor.',
  'Plak dinlemek, kaydın yanı sıra onu koruma alışkanlığını da beraberinde getiriyor; dinleyici her çalımda biraz daha dikkatli oluyor.',
  'Kulüpte geçen saatler, oyuncunun kendi hamlelerini başkasının gözüyle görmesini sağlıyor ve hesap yapma alışkanlığını belirgin biçimde hızlandırıyor.',
  'Efsaneler bir mahallenin ortak belleğini biçimlendiriyor ve kuşaktan kuşağa ağızdan ağza, her anlatımda biraz daha değişerek aktarılıyor.',
  'Ayak sağlığı, uzun yürüyüşlerde yorgunluktan önce gelen ve çoğu zaman ancak dönüş yolunda fark edilen bir sorun olarak kalıyor.',
  'Kuklanın hareketi oyuncunun el alışkanlığıyla biçimleniyor; aynı kukla her gösteride yeniden kuruluyor, yeniden ayarlanıyor ve oyuncunun ritmine göre değişiyor, bu yüzden hazır kukla işe yaramıyor.',
  'Barınak, sabahın erken saatlerinde başlayan bir iş bölümüyle gün boyu çalışıyor; akşam sayımı yapılmadan gün kapanmıyor ve nöbet devredilmiyor.',
  'Dokuma, bir deseni değil bir elin alışkanlığını ve bir yörenin belleğini kayda geçiriyor; bu izler yıllar sonra da rahatça okunuyor.',
  'Mevsim değiştikçe aynı mekân farklı biçimlerde kullanılıyor; bu esneklik, sabit bir oda yerine mevsimle birlikte değişen bir yaşam alanı kuruyor.',
  'Gazete çıkarmak, yazının yanı sıra ekip çalışmasını, sayfa düzenini ve sorumluluk almayı da öğretiyor; her sayı bir ekip işi olarak çıkıyor.',
  'Tur planı, yolda karşılaşılan koşullara göre sürekli değişiyor; bu yüzden esneklik, mesafeyi hesaplamaktan daha çok işe yarıyor.',
  'Festival hazırlığı, sahne sanatlarıyla lojistiğin aynı takvimde buluştuğu, saatlerin hiç şaşmadığı ve her grubun sırasını bildiği bir iş olarak yürüyor.',
];

const PAR_EK_AKIS: string[] = [
  'Bu hesap, velilerin de bildiği bir konu hâline geliyor.',
  'Alanın temizliği, ertesi gün kurulacak pazarın da ön koşulu oluyor.',
  'Bu tercih, film seçimini de belirliyor.',
  'Bu denge, odanın günlük kullanımına göre değişiyor.',
  'Boya, kar altında kaldığında görünürlüğünü yitiriyor.',
  'Bu hesap, taşıma şirketlerinin planlamasında belirleyici oluyor.',
  'Bu ölçüm, ekmeğin her partide aynı olmasını sağlıyor.',
  'Bu seçki, arşivin geleceğini de belirliyor ve yıllar sonra neyin hatırlanacağını şimdiden kararlaştırıyor.',
  'Biçme kararı, çimin türüne göre de değişiyor.',
  'Bu okuma, provanın geri kalanını biçimlendiriyor.',
  'Bu görüş açısı, mevsim değiştikçe yeniden hesaplanıyor.',
  'Bu kayıt, ürünün hangi aşamada bozulduğunu gösteriyor.',
  'Gölgeliğin biçimi, bahçenin kullanımını da değiştiriyor.',
  'Atölye, mahallenin buluşma noktasına dönüşüyor.',
  'Akort, çalgının yaşına göre farklı sıklıkta yapılıyor.',
  'Bu hesap, kargo ücretlerine de yansıyor ve müşterinin ödediği tutarı doğrudan etkiliyor.',
  'Gönüllü sayısı, barınağın günlük işleyişini ve hayvanların gezdirilme sıklığını belirliyor.',
  'Ölçüm kayıtları, yıllar içinde karşılaştırma olanağı veriyor.',
  'Bu denge, yüzücü sağlığını doğrudan etkiliyor.',
  'Bu bakım, parkurun ömrünü uzatıyor.',
  'Bu seçim, kitabın maliyetini ve ömrünü belirliyor.',
  'Bu erişim, mahalledeki hayvan sayısını da etkiliyor.',
  'Bu yerleşim, ayrıştırma oranını belirgin biçimde artırıyor.',
];

function genParAna() {
  emitRows(
    PAR_ANA.map((row, index) => ({ ...row, p: `${PAR_EK_ANA[index]} ${row.p}` })),
    'par',
    T_PAR,
    'reading',
  );
}

function genParBaslik() {
  emitRows(
    PAR_BASLIK.map((row, index) => ({ ...row, p: `${PAR_EK_BASLIK[index]} ${row.p}` })),
    'par',
    T_PAR,
    'reading',
  );
}

/* ---------------------------------------------------------------- */
/* Dil Bilgisi                                                       */
/* ---------------------------------------------------------------- */

type EkRow = { c: string; w: string; t: string; e: string };

const DIL_EK: EkRow[] = [
  {
    c: 'Kitap okumak, insanın kendini tanımasına yardım eder.',
    w: 'okumak',
    t: 'İsim-fiil',
    e: '“-mak” eki eylemi adlaştırdığı için “okumak” cümlede özne görevinde bir isim-fiildir.',
  },
  {
    c: 'Koşan çocuk, annesini görünce duraksadı.',
    w: 'koşan',
    t: 'Sıfat-fiil',
    e: '“-an” ekiyle kurulan “koşan” sözcüğü çocuğu nitelediğinden sıfat-fiildir.',
  },
  {
    c: 'Gülerek yanımıza geldi ve yerine oturdu.',
    w: 'gülerek',
    t: 'Zarf-fiil',
    e: '“-erek” eki eylemi zarf biçiminde bağladığı için “gülerek” zarf-fiildir.',
  },
  {
    c: 'Yazdığı mektubu uzun süre sakladı.',
    w: 'yazdığı',
    t: 'Sıfat-fiil',
    e: '“-dık” ekiyle kurulan “yazdığı” sözcüğü mektubu nitelediğinden sıfat-fiildir.',
  },
  {
    c: 'Sabahtan beri çalışmaktan çok yoruldu.',
    w: 'çalışmaktan',
    t: 'İsim-fiil',
    e: '“-mak” ekiyle adlaşan sözcük, hâl eki alarak isim-fiil görevinde kullanılmıştır.',
  },
  {
    c: 'Kapıyı açınca içeriye soğuk hava doldu.',
    w: 'açınca',
    t: 'Zarf-fiil',
    e: '“-ınca” eki eylemi zaman zarfı yaptığı için “açınca” zarf-fiildir.',
  },
  {
    c: 'Bu konuda söylenecek söz kalmadı.',
    w: 'söylenecek',
    t: 'Sıfat-fiil',
    e: '“-acak” ekiyle kurulan sözcük “söz”ü nitelediğinden sıfat-fiildir.',
  },
  {
    c: 'Yüzmeyi çocukken öğrenmiş.',
    w: 'yüzmeyi',
    t: 'İsim-fiil',
    e: '“-me” ekiyle adlaşan “yüzmeyi” sözcüğü belirtili nesne görevinde bir isim-fiildir.',
  },
  {
    c: 'Bakmayınca göremezsin, dikkatli olmalısın.',
    w: 'bakmayınca',
    t: 'Zarf-fiil',
    e: '“-mayınca” eki koşul bildiren zarf kurduğu için sözcük zarf-fiildir.',
  },
  {
    c: 'Kırılan cam, rüzgârla birlikte sarsıldı.',
    w: 'kırılan',
    t: 'Sıfat-fiil',
    e: '“-an” ekiyle kurulan sözcük camı nitelediğinden sıfat-fiil görevindedir.',
  },
  {
    c: 'Dinlemek, anlamanın ilk adımıdır.',
    w: 'dinlemek',
    t: 'İsim-fiil',
    e: '“-mak” eki eylemi adlaştırmış, sözcük cümlede özne olmuştur.',
  },
  {
    c: 'Otobüs gelince herkes ayağa kalktı.',
    w: 'gelince',
    t: 'Zarf-fiil',
    e: '“-ince” eki zaman anlamlı zarf kurduğundan “gelince” zarf-fiildir.',
  },
  {
    c: 'Tanıdık bir yüz görmek istedi.',
    w: 'tanıdık',
    t: 'Sıfat-fiil',
    e: '“-dık” ekiyle kurulan sözcük “yüz”ü nitelediği için sıfat-fiil görevindedir.',
  },
  {
    c: 'Yazmayı bırakınca kalemi masaya koydu.',
    w: 'yazmayı',
    t: 'İsim-fiil',
    e: '“-ma” ekiyle adlaşan sözcük nesne görevinde kullanılmış bir isim-fiildir.',
  },
  {
    c: 'Gülümseyerek kapıyı açtı ve bizi içeri buyur etti.',
    w: 'gülümseyerek',
    t: 'Zarf-fiil',
    e: '“-erek” eki eylemi durum zarfı yaptığından sözcük zarf-fiildir.',
  },
  {
    c: 'Okunacak kitap listesi giderek uzuyor.',
    w: 'okunacak',
    t: 'Sıfat-fiil',
    e: '“-acak” ekiyle kurulan sözcük kitabı nitelediğinden sıfat-fiildir.',
  },
  {
    c: 'Koşmak, dizlere iyi gelen bir alışkanlıktır.',
    w: 'koşmak',
    t: 'İsim-fiil',
    e: '“-mak” eki eylemi adlaştırmış, sözcük cümlede özne görevini üstlenmiştir.',
  },
  {
    c: 'Hazırlanan yemek kısa sürede bitti.',
    w: 'hazırlanan',
    t: 'Sıfat-fiil',
    e: '“-an” ekiyle kurulan sözcük yemeği nitelediği için sıfat-fiil görevindedir.',
  },
  {
    c: 'Konuşmadan dinlemek her zaman zordur.',
    w: 'konuşmadan',
    t: 'Zarf-fiil',
    e: '“-madan” eki eylemi durum zarfı olarak bağladığından sözcük zarf-fiildir.',
  },
  {
    c: 'Soruları çözmeden sınava girmeyin.',
    w: 'çözmeden',
    t: 'Zarf-fiil',
    e: '“-meden” eki koşul ve durum bildiren zarf kurduğu için sözcük zarf-fiildir.',
  },
  {
    c: 'Sevdiği şarkıyı alçak sesle mırıldandı.',
    w: 'sevdiği',
    t: 'Sıfat-fiil',
    e: '“-dik” ekiyle kurulan sözcük şarkıyı nitelediğinden sıfat-fiildir.',
  },
  {
    c: 'Beklemekten başka çare kalmamıştı.',
    w: 'beklemekten',
    t: 'İsim-fiil',
    e: '“-mak” ekiyle adlaşan sözcük hâl eki alarak isim-fiil görevinde kullanılmıştır.',
  },
  {
    c: 'Görüşmek üzere erkenden ayrıldılar.',
    w: 'görüşmek',
    t: 'İsim-fiil',
    e: '“-mek” eki eylemi adlaştırdığı için sözcük isim-fiil görevindedir.',
  },
  {
    c: 'Ağlayarak uyandı ve yanındakine sarıldı.',
    w: 'ağlayarak',
    t: 'Zarf-fiil',
    e: '“-arak” eki eylemi durum zarfı yaptığından “ağlayarak” zarf-fiildir.',
  },
];

function genDilEk() {
  const types = ['İsim-fiil', 'Sıfat-fiil', 'Zarf-fiil', 'Çekimli fiil'];
  DIL_EK.forEach((row, index) => {
    add(
      {
        id: nextId('dil'),
        prompt: `${row.c}\n\nBu cümlede “${row.w}” sözcüğü hangi görevde kullanılmıştır?`,
        answer: row.t,
        distractors: types.filter((item) => item !== row.t),
        explanation: row.e,
        difficulty: difficultyAt(index),
      },
      T_DIL,
    );
  });
}

type OgeRow = { c: string; w: string; t: string; e: string };

const DIL_OGE: OgeRow[] = [
  {
    c: 'Küçük çocuk, bahçedeki topu duvara attı.',
    w: 'duvara',
    t: 'Dolaylı tümleç',
    e: '“-a” yönelme eki alan “duvara” sözü yüklemin yöneldiği yeri bildirdiğinden dolaylı tümleçtir.',
  },
  {
    c: 'Yağmur, akşam saatlerinde bastırdı.',
    w: 'akşam saatlerinde',
    t: 'Zarf tümleci',
    e: 'Zaman bildiren “akşam saatlerinde” sözü yüklemi belirttiği için zarf tümlecidir.',
  },
  {
    c: 'Öğrenciler sınav sonuçlarını merakla bekliyordu.',
    w: 'sınav sonuçlarını',
    t: 'Nesne',
    e: 'Belirtme eki alan ve “neyi” sorusuna yanıt veren söz, belirtili nesnedir.',
  },
  {
    c: 'Bu sabah erken kalkan herkes yola çıktı.',
    w: 'Bu sabah',
    t: 'Zarf tümleci',
    e: '“Ne zaman” sorusuna yanıt veren “bu sabah” sözü zaman zarfı görevindedir.',
  },
  {
    c: 'Kütüphaneci, raflardaki kitapları düzenledi.',
    w: 'Kütüphaneci',
    t: 'Özne',
    e: '“Düzenleyen kim” sorusuna yanıt veren ve yüklemi etkileyen söz öznedir.',
  },
  {
    c: 'Uzun bir aradan sonra kasabaya döndü.',
    w: 'kasabaya',
    t: 'Dolaylı tümleç',
    e: 'Yönelme ekiyle kurulan ve yüklemin yöneldiği yeri bildiren söz dolaylı tümleçtir.',
  },
  {
    c: 'Sokaktaki gürültü herkesi rahatsız etti.',
    w: 'herkesi',
    t: 'Nesne',
    e: '“Kimi” sorusuna yanıt veren ve belirtme eki taşıyan söz belirtili nesnedir.',
  },
  {
    c: 'Çocuklar bahçede top oynuyordu.',
    w: 'bahçede',
    t: 'Dolaylı tümleç',
    e: 'Bulunma eki alan “bahçede” sözü yer bildirerek yüklemi tamamladığından dolaylı tümleçtir.',
  },
  {
    c: 'Yorgun yolcular, otobüste uyuyakaldı.',
    w: 'Yorgun yolcular',
    t: 'Özne',
    e: 'Yüklemin bildirdiği işi yapan öge olan “yorgun yolcular” cümlenin öznesidir.',
  },
  {
    c: 'Kitabı masanın üstüne bıraktı.',
    w: 'masanın üstüne',
    t: 'Dolaylı tümleç',
    e: 'Yönelme ekiyle kurulan ve yüklemin yöneldiği yeri gösteren söz dolaylı tümleçtir.',
  },
  {
    c: 'Sabahın ilk ışıklarıyla balıkçılar denize açıldı.',
    w: 'Sabahın ilk ışıklarıyla',
    t: 'Zarf tümleci',
    e: 'Zaman bildiren bu söz yüklemin ne zaman gerçekleştiğini belirttiği için zarf tümlecidir.',
  },
  {
    c: 'Öğretmen, tahtaya bir tarih yazdı.',
    w: 'tahtaya',
    t: 'Dolaylı tümleç',
    e: '“Nereye” sorusuna yanıt veren ve yönelme eki taşıyan söz dolaylı tümleçtir.',
  },
  {
    c: 'Rüzgâr, penceredeki perdeyi savurdu.',
    w: 'penceredeki perdeyi',
    t: 'Nesne',
    e: '“Neyi” sorusuna yanıt veren ve belirtme eki alan söz belirtili nesnedir.',
  },
  {
    c: 'Küçük kız, oyuncak bebeğini sıkıca tutuyordu.',
    w: 'sıkıca',
    t: 'Zarf tümleci',
    e: '“Nasıl” sorusuna yanıt veren “sıkıca” sözü durum zarfı görevindedir.',
  },
  {
    c: 'Bu akşam misafirler erken gelecek.',
    w: 'misafirler',
    t: 'Özne',
    e: '“Gelen kim” sorusuna yanıt veren söz, cümlenin öznesidir.',
  },
  {
    c: 'Yaşlı adam, uzun süre pencereden baktı.',
    w: 'uzun süre',
    t: 'Zarf tümleci',
    e: 'Süre bildiren “uzun süre” sözü yüklemin zamanını belirttiği için zarf tümlecidir.',
  },
  {
    c: 'Mektubu, sabah postaneye götürdü.',
    w: 'Mektubu',
    t: 'Nesne',
    e: '“Neyi” sorusuna yanıt veren ve belirtme eki taşıyan söz belirtili nesnedir.',
  },
  {
    c: 'Yeni açılan kafe, mahallenin sakinlerini memnun etti.',
    w: 'Yeni açılan kafe',
    t: 'Özne',
    e: 'Memnun olma işini gerçekleştiren öge olan “yeni açılan kafe” cümlenin öznesidir.',
  },
  {
    c: 'Çocuk, oyuncaklarını dolaba koydu.',
    w: 'dolaba',
    t: 'Dolaylı tümleç',
    e: 'Yönelme eki alan ve yüklemin yöneldiği yeri bildiren söz dolaylı tümleçtir.',
  },
  {
    c: 'Konuklar, salonda sohbet ediyordu.',
    w: 'salonda',
    t: 'Dolaylı tümleç',
    e: 'Bulunma ekiyle kurulan yer bildiren söz, dolaylı tümleç görevindedir.',
  },
  {
    c: 'Haber, kısa sürede bütün köye yayıldı.',
    w: 'kısa sürede',
    t: 'Zarf tümleci',
    e: 'Zaman bildiren “kısa sürede” sözü yüklemi belirttiğinden zarf tümlecidir.',
  },
  {
    c: 'Öğrenciler, öğretmenin sorusunu dikkatle dinledi.',
    w: 'öğretmenin sorusunu',
    t: 'Nesne',
    e: '“Neyi” sorusuna yanıt veren ve belirtme eki taşıyan söz belirtili nesnedir.',
  },
  {
    c: 'Bahçıvan, kuruyan dalları budadı.',
    w: 'Bahçıvan',
    t: 'Özne',
    e: 'Budama işini yapan öge olan “bahçıvan” cümlenin öznesidir.',
  },
];

function genDilOge() {
  const pool = ['Özne', 'Nesne', 'Dolaylı tümleç', 'Zarf tümleci'];
  DIL_OGE.forEach((row, index) => {
    add(
      {
        id: nextId('dil'),
        prompt: `${row.c}\n\nBu cümlede “${row.w}” sözü cümlenin hangi öğesidir?`,
        answer: row.t,
        distractors: distractorsFrom(pool, row.t),
        explanation: row.e,
        difficulty: difficultyAt(index),
      },
      T_DIL,
    );
  });
}

type BozukRow = { c: string; t: string; e: string };

const DIL_BOZUK: BozukRow[] = [
  {
    c: 'Öğrenciler sınavda çok çalıştı ve başarılı oldu.',
    t: 'Özne ile yüklem arasında uyumsuzluk',
    e: 'Özne çoğul (“öğrenciler”) olduğu hâlde yüklem tekil kalmıştır; “oldular” olmalıydı.',
  },
  {
    c: 'Toplantıya katılanlar, kararı oybirliğiyle kabul etti.',
    t: 'Özne ile yüklem arasında uyumsuzluk',
    e: 'Çoğul özneye karşın yüklem tekil çekimlenmiştir; “kabul ettiler” biçiminde olmalıydı.',
  },
  {
    c: 'Kalabalık, alanı doldurdu ve sloganlar attılar.',
    t: 'Özne ile yüklem arasında uyumsuzluk',
    e: 'İkinci yüklemin öznesi de “kalabalık”tır; tekil özneyle “attılar” uyuşmaz.',
  },
  {
    c: 'Konuklar salona girdi ve yerlerine oturdular.',
    t: 'Özne ile yüklem arasında uyumsuzluk',
    e: 'Birinci yüklem tekil, ikincisi çoğul çekimlenmiştir; yüklemler aynı özneye uygun olmalıydı.',
  },
  {
    c: 'Çocuklar bahçeye çıktı ve oyun oynamaya başladı.',
    t: 'Özne ile yüklem arasında uyumsuzluk',
    e: 'Çoğul özne iki yüklemi de etkilediğinden “çıktılar” ve “başladılar” olmalıydı.',
  },
  {
    c: 'Öğretmenler, yeni programı inceledi ve görüşlerini bildirdi.',
    t: 'Özne ile yüklem arasında uyumsuzluk',
    e: 'Çoğul özneyle kullanılan yüklemler tekil kalmıştır; “incelediler, bildirdiler” olmalıydı.',
  },
  {
    c: 'Yukarıya doğru yükselen balonu uzun süre izledik.',
    t: 'Gereksiz sözcük kullanımı',
    e: '“Yükselmek” zaten yukarı doğru hareketi anlatır; “yukarıya doğru” sözü gereksizdir.',
  },
  {
    c: 'Kitabı geri iade etmek için mağazaya gitti.',
    t: 'Gereksiz sözcük kullanımı',
    e: '“İade” sözcüğü geri vermeyi içerdiği için “geri” sözü gereksiz kullanılmıştır.',
  },
  {
    c: 'Kendi öz düşüncesini açıkça dile getirdi.',
    t: 'Gereksiz sözcük kullanımı',
    e: '“Öz” sözcüğü “kendi” anlamını taşıdığından ikisinin birlikte kullanımı gereksizdir.',
  },
  {
    c: 'Yaklaşık yirmi kadar öğrenci geziye katıldı.',
    t: 'Gereksiz sözcük kullanımı',
    e: '“Yaklaşık” ve “kadar” aynı işlevi görür; ikisinin birlikte kullanılması gereksizdir.',
  },
  {
    c: 'İki taraf karşılıklı olarak anlaşmaya vardı.',
    t: 'Gereksiz sözcük kullanımı',
    e: '“Karşılıklı” sözcüğü iki tarafın eylemini zaten anlatır; “olarak” gereksizdir.',
  },
  {
    c: 'En sonunda nihayet karar verdi.',
    t: 'Gereksiz sözcük kullanımı',
    e: '“En sonunda” ile “nihayet” aynı anlamı taşıdığından biri gereksizdir.',
  },
  {
    c: 'Yağmur yağdığı için şemsiyesini açtı ve sırılsıklam ıslandı.',
    t: 'Mantık (anlam) hatası',
    e: 'Şemsiye açan kişinin sırılsıklam ıslanması çelişkilidir; neden-sonuç ilişkisi bozulmuştur.',
  },
  {
    c: 'Çok çalıştığı için sınavdan düşük not aldı.',
    t: 'Mantık (anlam) hatası',
    e: 'Çok çalışmanın sonucu düşük not olamaz; neden ile sonuç birbirine aykırıdır.',
  },
  {
    c: 'Hasta olduğu için sabah koşusuna çıktı.',
    t: 'Mantık (anlam) hatası',
    e: 'Hastalık, koşuya çıkmanın nedeni olarak gösterilemez; neden-sonuç bağı yanlıştır.',
  },
  {
    c: 'Uyumadığı için sabah çok dinç uyandı.',
    t: 'Mantık (anlam) hatası',
    e: 'Uykusuzluğun dinçlik doğurması beklenmez; iki bölüm arasında anlam çelişkisi vardır.',
  },
  {
    c: 'Yemeği hiç sevmediği için tabağını silip süpürdü.',
    t: 'Mantık (anlam) hatası',
    e: 'Sevmeme ile tabağı bitirme birbiriyle çelişir; cümlenin anlamı kendi içinde tutarsızdır.',
  },
  {
    c: 'Trafik yoğun olduğu için eve herkesten önce vardı.',
    t: 'Mantık (anlam) hatası',
    e: 'Yoğun trafik gecikmeye yol açar; “herkesten önce varma” sonucu bu nedenle bağdaşmaz.',
  },
  {
    c: 'Sınavdan kaldığını duyunca etekleri zil çaldı.',
    t: 'Deyimin yanlış kullanımı',
    e: '“Etekleri zil çalmak” sevinç anlamı taşır; üzücü bir durumda kullanılması deyimi bozar.',
  },
  {
    c: 'Ödül aldığını duyunca küplere bindi.',
    t: 'Deyimin yanlış kullanımı',
    e: '“Küplere binmek” öfkelenmeyi anlatır; sevinç bağlamında kullanılması anlamı bozar.',
  },
  {
    c: 'Yardım gelmeyince etekleri zil çaldı.',
    t: 'Deyimin yanlış kullanımı',
    e: 'Yardımın gelmemesi üzüntü doğurur; sevinç bildiren deyim bu bağlama uymaz.',
  },
  {
    c: 'İşini kaybettiğini duyunca ağzı kulaklarına vardı.',
    t: 'Deyimin yanlış kullanımı',
    e: '“Ağzı kulaklarına varmak” çok sevinmeyi anlatır; iş kaybı bu anlamla çelişir.',
  },
  {
    c: 'Sınavı kazandığını öğrenince burnundan soludu.',
    t: 'Deyimin yanlış kullanımı',
    e: '“Burnundan solumak” öfkeyi anlatır; sevinçli bir haberle birlikte kullanılamaz.',
  },
];

function genDilBozuk() {
  const types = [
    'Özne ile yüklem arasında uyumsuzluk',
    'Gereksiz sözcük kullanımı',
    'Mantık (anlam) hatası',
    'Deyimin yanlış kullanımı',
  ];
  DIL_BOZUK.forEach((row, index) => {
    add(
      {
        id: nextId('dil'),
        prompt: `${row.c}\n\nBu cümledeki anlatım bozukluğunun nedeni aşağıdakilerden hangisidir?`,
        answer: row.t,
        distractors: types.filter((item) => item !== row.t),
        explanation: row.e,
        difficulty: difficultyAt(index),
      },
      T_DIL,
    );
  });
}

/* ---------------------------------------------------------------- */
/* Yazım ve Noktalama                                                */
/* ---------------------------------------------------------------- */

const YAZIM_PAIRS: Array<[string, string]> = [
  ['her şey', 'herşey'],
  ['birçok', 'bir çok'],
  ['hiçbir', 'hiç bir'],
  ['birkaç', 'bir kaç'],
  ['yalnız', 'yanlız'],
  ['yanlış', 'yalnış'],
  ['kavanoz', 'kavonoz'],
  ['şoför', 'şöför'],
  ['orijinal', 'orjinal'],
  ['sürpriz', 'süpriz'],
  ['mütevazı', 'mütevazi'],
  ['egzoz', 'egsoz'],
  ['pekiyi', 'pek iyi'],
  ['birdenbire', 'birden bire'],
  ['ilkbahar', 'ilk bahar'],
  ['başvuru', 'baş vuru'],
  ['hoş geldiniz', 'hoşgeldiniz'],
  ['birbirine', 'bir birine'],
  ['her gün', 'hergün'],
  ['art arda', 'ardarda'],
  ['şu an', 'şuan'],
  ['bir an', 'biran'],
  ['hafta sonu', 'haftasonu'],
  ['yanı sıra', 'yanısıra'],
  ['bir türlü', 'birtürlü'],
  ['göz ardı', 'gözardı'],
  ['herkes', 'her kez'],
  ['birbiriyle', 'bir biriyle'],
  ['kirpik', 'kiprik'],
  ['domates', 'domatez'],
  ['maydanoz', 'maydonoz'],
  ['pantolon', 'pantalon'],
  ['konservatuvar', 'konservatuar'],
  ['şemsiye', 'şemşiye'],
  ['yalnızca', 'yanlızca'],
];

function genYazim() {
  const stems = [
    'Aşağıdaki sözcüklerden hangisinin yazımı doğrudur?',
    'Aşağıdaki sözcüklerden hangisi doğru yazılmıştır?',
  ];
  YAZIM_PAIRS.forEach(([correct, wrong], index) => {
    const others = [1, 2, 3].map((step) => YAZIM_PAIRS[(index + step) % YAZIM_PAIRS.length][1]);
    add(
      {
        id: nextId('yaz'),
        prompt: stems[index % 2],
        answer: correct,
        distractors: others,
        explanation: `Yazım kılavuzuna göre doğru biçim “${correct}”tür; “${others[0]}”, “${others[1]}” ve “${others[2]}” yazımları yanlıştır.`,
        difficulty: difficultyAt(index),
      },
      T_YAZ,
    );
  });
}

type NoktaRow = { c: string; i: string; f: string; e: string };

const NOKTA_ROWS: NoktaRow[] = [
  {
    c: 'Masaya kalem, defter ve silgi koydu.',
    i: 'virgül',
    f: 'Eş görevli sözcükleri ayırmak',
    e: 'Virgül burada aynı görevdeki “kalem, defter, silgi” sözcüklerini birbirinden ayırmıştır.',
  },
  {
    c: 'Pazardan elma, armut ve ayva aldı.',
    i: 'virgül',
    f: 'Eş görevli sözcükleri ayırmak',
    e: 'Sıralanan nesneler aynı görevde olduğundan virgül eş görevli sözcükleri ayırma işlevindedir.',
  },
  {
    c: 'Raflara roman, öykü ve şiir dizdi.',
    i: 'virgül',
    f: 'Eş görevli sözcükleri ayırmak',
    e: 'Virgül, aynı görevde sıralanan tür adlarını birbirinden ayırmak için kullanılmıştır.',
  },
  {
    c: 'Bahçede gül, menekşe ve lale yetiştiriyor.',
    i: 'virgül',
    f: 'Eş görevli sözcükleri ayırmak',
    e: 'Çiçek adları eş görevli olduğu için virgül bu sözcükleri ayırma işlevi görür.',
  },
  {
    c: 'Kutuda kalem, silgi, cetvel vardı.',
    i: 'virgül',
    f: 'Eş görevli sözcükleri ayırmak',
    e: 'Virgül, aynı görevde sıralanan nesne adlarını birbirinden ayırmıştır.',
  },
  {
    c: 'Vitrinde tabak, bardak ve sürahi sergileniyor.',
    i: 'virgül',
    f: 'Eş görevli sözcükleri ayırmak',
    e: 'Sıralanan nesneler eş görevli olduğundan virgül ayırma işlevindedir.',
  },
  {
    c: 'Sabah erken kalktı, kahvaltı yaptı, evden çıktı.',
    i: 'virgül',
    f: 'Sıralı cümleleri ayırmak',
    e: 'Virgül burada art arda sıralanan üç ayrı cümleyi birbirinden ayırmaktadır.',
  },
  {
    c: 'Yağmur yağdı, yollar kapandı.',
    i: 'virgül',
    f: 'Sıralı cümleleri ayırmak',
    e: 'İki bağımsız cümle virgülle birbirine bağlanmış, virgül sıralı cümleleri ayırmıştır.',
  },
  {
    c: 'Kitabı açtı, ilk sayfayı okudu.',
    i: 'virgül',
    f: 'Sıralı cümleleri ayırmak',
    e: 'Virgül, öznesi aynı olan iki ayrı cümleyi birbirinden ayırma görevindedir.',
  },
  {
    c: 'Kapı çaldı, herkes sustu.',
    i: 'virgül',
    f: 'Sıralı cümleleri ayırmak',
    e: 'İki cümle sıralandığı için virgül bunları birbirinden ayırmıştır.',
  },
  {
    c: 'Ali edebiyatı, tarihi; Ayşe matematiği, fiziği seviyor.',
    i: 'noktalı virgül',
    f: 'Sıralı cümleleri ayırmak',
    e: 'Cümlelerin içinde virgül bulunduğu için bunları ayırmada noktalı virgül kullanılmıştır.',
  },
  {
    c: 'Kışın kar, tipi; yazın sıcak, kuraklık görülür.',
    i: 'noktalı virgül',
    f: 'Sıralı cümleleri ayırmak',
    e: 'Virgülle ayrılmış bölümleri olan iki cümle noktalı virgülle birbirinden ayrılmıştır.',
  },
  {
    c: 'Sabah erken kalktı, koştu; akşam erken yattı.',
    i: 'noktalı virgül',
    f: 'Sıralı cümleleri ayırmak',
    e: 'Noktalı virgül, kendi içinde virgül taşıyan cümleleri ayırmak için kullanılmıştır.',
  },
  {
    c: 'Bir yanda dağlar, ormanlar; öte yanda düzlükler, bataklıklar uzanıyordu.',
    i: 'noktalı virgül',
    f: 'Sıralı cümleleri ayırmak',
    e: 'Karşıtlık oluşturan iki bölüm, içlerindeki virgüller nedeniyle noktalı virgülle ayrılmıştır.',
  },
  {
    c: 'Öğrenciler soruları çözdü, tartıştı; öğretmen yanıtları değerlendirdi.',
    i: 'noktalı virgül',
    f: 'Sıralı cümleleri ayırmak',
    e: 'Virgül içeren cümleleri ayırmada noktalı virgül kullanıldığı görülmektedir.',
  },
  {
    c: 'Şunları getir: ekmek, süt ve yumurta.',
    i: 'iki nokta',
    f: 'Açıklama veya örnek sıralamak',
    e: 'İki nokta, kendisinden sonra sıralanacak örnekleri bildirmek için kullanılmıştır.',
  },
  {
    c: 'Tek bir söz söyledi: geliyorum.',
    i: 'iki nokta',
    f: 'Açıklama veya örnek sıralamak',
    e: 'İki noktadan sonra söylenen söz, önceki cümlenin açıklaması niteliğindedir.',
  },
  {
    c: 'Kutuda üç şey vardı: kalem, silgi, cetvel.',
    i: 'iki nokta',
    f: 'Açıklama veya örnek sıralamak',
    e: 'İki nokta, “üç şey” ifadesinin neler olduğunu sıralamak için kullanılmıştır.',
  },
  {
    c: 'İki tür okur vardır: not alanlar ve yalnızca okuyanlar.',
    i: 'iki nokta',
    f: 'Açıklama veya örnek sıralamak',
    e: 'İki nokta, öncesindeki genel ifadeyi açıklayan sıralamayı başlatmaktadır.',
  },
  {
    c: 'Şu kuralı unutma: erken kalkan yol alır.',
    i: 'iki nokta',
    f: 'Açıklama veya örnek sıralamak',
    e: 'İki nokta, kendisinden sonra gelen açıklayıcı sözü duyurmak için kullanılmıştır.',
  },
  {
    c: 'Ankara’ya yarın gidiyoruz.',
    i: 'kesme işareti',
    f: 'Özel ada gelen eki ayırmak',
    e: 'Özel ada gelen yönelme eki kesme işaretiyle ayrılmıştır.',
  },
  {
    c: 'İzmir’in sokaklarını akşamüstü gezdi.',
    i: 'kesme işareti',
    f: 'Özel ada gelen eki ayırmak',
    e: '“İzmir” özel adına gelen tamlayan eki kesme işaretiyle ayrılmıştır.',
  },
  {
    c: 'Kitabı Mehmet’e verdi.',
    i: 'kesme işareti',
    f: 'Özel ada gelen eki ayırmak',
    e: 'Kişi adına gelen yönelme eki kesme işaretiyle ayrılır.',
  },
  {
    c: 'Atatürk’ün sözleri hâlâ okunuyor.',
    i: 'kesme işareti',
    f: 'Özel ada gelen eki ayırmak',
    e: 'Özel ada gelen ilgi eki kesme işaretiyle ayrılmıştır.',
  },
  {
    c: 'Bu yıl 23 Nisan’ı coşkuyla kutladık.',
    i: 'kesme işareti',
    f: 'Özel ada gelen eki ayırmak',
    e: 'Belirli gün adına gelen belirtme eki kesme işaretiyle ayrılmıştır.',
  },
  {
    c: 'Kitabın adı “Küçük Prens”ti.',
    i: 'tırnak işareti',
    f: 'Alıntıyı göstermek',
    e: 'Eser adı tırnak içine alınarak alıntı olduğu belirtilmiştir.',
  },
  {
    c: 'Öğretmen “susun” dedi.',
    i: 'tırnak işareti',
    f: 'Alıntıyı göstermek',
    e: 'Başkasının sözü olduğu gibi aktarıldığı için tırnak içine alınmıştır.',
  },
  {
    c: 'Dergide “Kent ve İnsan” başlıklı bir yazı çıktı.',
    i: 'tırnak işareti',
    f: 'Alıntıyı göstermek',
    e: 'Yazı başlığı tırnak içine alınarak alıntılandığı gösterilmiştir.',
  },
  {
    c: '“Gel” dedi ve kapıyı gösterdi.',
    i: 'tırnak işareti',
    f: 'Alıntıyı göstermek',
    e: 'Doğrudan aktarılan söz tırnak içinde verilmiştir.',
  },
  {
    c: 'Yıllar sonra onu gördüm ve...',
    i: 'üç nokta',
    f: 'Tamamlanmamışlık bildirmek',
    e: 'Cümle bilerek bitirilmediği için üç nokta kullanılmıştır.',
  },
  {
    c: 'Kim bilir şimdi nerede...',
    i: 'üç nokta',
    f: 'Tamamlanmamışlık bildirmek',
    e: 'Sözün sürdürülmediği, bitmediği üç noktayla gösterilmiştir.',
  },
  {
    c: 'Sözünü bitirmedi: “Ben de...”',
    i: 'üç nokta',
    f: 'Tamamlanmamışlık bildirmek',
    e: 'Konuşmacının sözü yarım bırakıldığı için üç nokta kullanılmıştır.',
  },
  {
    c: 'Dağlar, ovalar, ırmaklar...',
    i: 'üç nokta',
    f: 'Tamamlanmamışlık bildirmek',
    e: 'Sıralamanın sürdürülebileceği, tamamlanmadığı üç noktayla belirtilmiştir.',
  },
  {
    c: 'Ve sonunda her şey...',
    i: 'üç nokta',
    f: 'Tamamlanmamışlık bildirmek',
    e: 'Cümle bitirilmediği, anlatımın sürdürülmediği üç noktayla gösterilmiştir.',
  },
];

function genNoktalama() {
  const pool = [
    'Eş görevli sözcükleri ayırmak',
    'Sıralı cümleleri ayırmak',
    'Açıklama veya örnek sıralamak',
    'Alıntıyı göstermek',
    'Özel ada gelen eki ayırmak',
    'Tamamlanmamışlık bildirmek',
  ];
  NOKTA_ROWS.forEach((row, index) => {
    add(
      {
        id: nextId('yaz'),
        prompt: `${row.c}\n\nBu cümlede ${row.i} hangi amaçla kullanılmıştır?`,
        answer: row.f,
        distractors: distractorsFrom(pool, row.f),
        explanation: row.e,
        difficulty: difficultyAt(index),
      },
      T_YAZ,
    );
  });
}

/* ---------------------------------------------------------------- */
/* Biyoloji                                                          */
/* ---------------------------------------------------------------- */

type KavramRow = { q: string; a: string; e: string };

const ORGANELLER = [
  'Ribozom',
  'Mitokondri',
  'Kloroplast',
  'Lizozom',
  'Golgi cisimciği',
  'Çekirdek',
  'Koful',
  'Endoplazmik retikulum',
  'Hücre çeperi',
  'Hücre zarı',
  'Sentriyol',
  'Çekirdekçik',
  'Kromozom',
  'Kromoplast',
  'Lökoplast',
  'Çekirdek porları',
  'Sitoplazma',
];

const HUCRE_GOREV: KavramRow[] = [
  {
    q: 'Mitokondrinin temel görevi aşağıdakilerden hangisidir?',
    a: 'Oksijenli solunumla ATP üretmek',
    e: 'Mitokondri, besinlerin oksijenle parçalanmasından enerji elde eder.',
  },
  {
    q: 'Ribozomun temel görevi aşağıdakilerden hangisidir?',
    a: 'Amino asitlerden protein sentezlemek',
    e: 'Ribozom, mRNA’daki bilgiye göre amino asitleri birleştirir.',
  },
  {
    q: 'Golgi cisimciğinin temel görevi aşağıdakilerden hangisidir?',
    a: 'Salgı maddelerini paketleyip salgılamak',
    e: 'Golgi, üretilen maddeleri paketleyerek hücre dışına gönderir.',
  },
  {
    q: 'Lizozomun temel görevi aşağıdakilerden hangisidir?',
    a: 'Hücre içi maddeleri sindirmek',
    e: 'Lizozom, sindirim enzimleriyle hücre içi parçalanmayı sağlar.',
  },
  {
    q: 'Kloroplastın temel görevi aşağıdakilerden hangisidir?',
    a: 'Işık enerjisiyle besin üretmek',
    e: 'Kloroplast, fotosentezle ışık enerjisini kimyasal enerjiye çevirir.',
  },
  {
    q: 'Kofulun temel görevi aşağıdakilerden hangisidir?',
    a: 'Su ve atık maddeleri depolamak',
    e: 'Koful, hücrede su, besin ve atık maddeleri depolar.',
  },
  {
    q: 'Çekirdeğin temel görevi aşağıdakilerden hangisidir?',
    a: 'Kalıtım maddesini koruyup yönetmek',
    e: 'Çekirdek, DNA’yı barındırır ve hücredeki olayları yönetir.',
  },
  {
    q: 'Hücre zarının temel görevi aşağıdakilerden hangisidir?',
    a: 'Madde geçişini seçici olarak denetlemek',
    e: 'Hücre zarı seçici geçirgendir; hangi maddenin geçeceğini belirler.',
  },
  {
    q: 'Hücre çeperinin temel görevi aşağıdakilerden hangisidir?',
    a: 'Hücreye destek ve koruma sağlamak',
    e: 'Bitki hücresindeki çeper, hücreye biçim ve dayanıklılık kazandırır.',
  },
  {
    q: 'Endoplazmik retikulumun temel görevi aşağıdakilerden hangisidir?',
    a: 'Hücre içinde madde iletmek',
    e: 'Endoplazmik retikulum, hücre içinde kanal sistemi oluşturur.',
  },
  {
    q: 'Sentriyolün temel görevi aşağıdakilerden hangisidir?',
    a: 'Bölünmede iğ ipliklerini oluşturmak',
    e: 'Sentriyol, hücre bölünmesi sırasında iğ ipliklerini düzenler.',
  },
  {
    q: 'Çekirdekçiğin temel görevi aşağıdakilerden hangisidir?',
    a: 'Ribozom alt birimlerini üretmek',
    e: 'Çekirdekçik, ribozomun yapısına giren alt birimleri üretir.',
  },
  {
    q: 'Sitoplazmanın temel görevi aşağıdakilerden hangisidir?',
    a: 'Tepkimelere ortam oluşturmak',
    e: 'Sitoplazma, hücre içi tepkimelerin gerçekleştiği sıvı ortamdır.',
  },
  {
    q: 'Kromozomun temel görevi aşağıdakilerden hangisidir?',
    a: 'Kalıtım bilgisini taşımak',
    e: 'Kromozom, DNA ve proteinlerden oluşur ve kalıtım bilgisini taşır.',
  },
  {
    q: 'Kromoplastın temel görevi aşağıdakilerden hangisidir?',
    a: 'Renk maddelerini depolamak',
    e: 'Kromoplast, çiçek ve meyvelere rengini veren pigmentleri taşır.',
  },
  {
    q: 'Lökoplastın temel görevi aşağıdakilerden hangisidir?',
    a: 'Nişasta depolamak',
    e: 'Lökoplast, renksiz bir plastit olup nişasta depolar.',
  },
  {
    q: 'Çekirdek porlarının temel görevi aşağıdakilerden hangisidir?',
    a: 'Çekirdek ile sitoplazma arasında geçiş sağlamak',
    e: 'Porlar, çekirdek zarındaki açıklıklar olup madde geçişini sağlar.',
  },
  {
    q: 'Hücre zarındaki reseptörlerin temel görevi aşağıdakilerden hangisidir?',
    a: 'Uyarıları algılayıp hücreye iletmek',
    e: 'Reseptörler, dış ortamdan gelen kimyasal uyarıları tanır.',
  },
];

const HUCRE_ORGANEL: KavramRow[] = [
  {
    q: 'Protein sentezinin gerçekleştiği organel hangisidir?',
    a: 'Ribozom',
    e: 'Protein sentezi ribozomda, mRNA’nın okunmasıyla gerçekleşir.',
  },
  {
    q: 'Oksijenli solunumla ATP üretiminin gerçekleştiği organel hangisidir?',
    a: 'Mitokondri',
    e: 'Enerji üretimi büyük ölçüde mitokondride gerçekleşir.',
  },
  {
    q: 'Fotosentezin gerçekleştiği organel hangisidir?',
    a: 'Kloroplast',
    e: 'Klorofil taşıyan kloroplast, ışık enerjisiyle besin üretir.',
  },
  {
    q: 'Hücre içi sindirimin gerçekleştiği organel hangisidir?',
    a: 'Lizozom',
    e: 'Sindirim enzimleri lizozomda bulunur ve hücre içi sindirimi yapar.',
  },
  {
    q: 'Salgı maddelerinin paketlendiği organel hangisidir?',
    a: 'Golgi cisimciği',
    e: 'Golgi, salgı ürünlerini paketleyip zara gönderir.',
  },
  {
    q: 'Kalıtım maddesinin bulunduğu yapı hangisidir?',
    a: 'Çekirdek',
    e: 'DNA çekirdek içinde bulunur ve buradan yönetilir.',
  },
  {
    q: 'Su ve atık maddelerin depolandığı yapı hangisidir?',
    a: 'Koful',
    e: 'Koful, hücrenin depo bölmesi olarak çalışır.',
  },
  {
    q: 'Hücre içinde madde iletimini sağlayan kanal sistemi hangisidir?',
    a: 'Endoplazmik retikulum',
    e: 'Endoplazmik retikulum, zarlı kanallarla madde taşır.',
  },
  {
    q: 'Bitki hücresine destek veren yapı hangisidir?',
    a: 'Hücre çeperi',
    e: 'Selüloz yapılı çeper, bitki hücresine dayanıklılık verir.',
  },
  {
    q: 'Hücreye madde giriş çıkışını denetleyen yapı hangisidir?',
    a: 'Hücre zarı',
    e: 'Zar, seçici geçirgenliğiyle madde alışverişini düzenler.',
  },
  {
    q: 'Bölünme sırasında iğ ipliklerini oluşturan yapı hangisidir?',
    a: 'Sentriyol',
    e: 'Sentriyoller, hayvan hücrelerinde bölünme iğini oluşturur.',
  },
  {
    q: 'Ribozom üretiminden sorumlu yapı hangisidir?',
    a: 'Çekirdekçik',
    e: 'Çekirdekçik, ribozom alt birimlerinin üretildiği yerdir.',
  },
  {
    q: 'Kalıtım bilgisini taşıyan yapı hangisidir?',
    a: 'Kromozom',
    e: 'Kromozomlar DNA’yı taşıyarak kalıtımı sağlar.',
  },
  {
    q: 'Bitki hücrelerinde renk maddelerini depolayan plastit hangisidir?',
    a: 'Kromoplast',
    e: 'Kromoplast, sarı ve kırmızı pigmentleri depolar.',
  },
  {
    q: 'Bitki hücrelerinde nişasta depolayan plastit hangisidir?',
    a: 'Lökoplast',
    e: 'Lökoplast renksizdir ve nişasta depolamada görevlidir.',
  },
  {
    q: 'Çekirdek ile sitoplazma arasındaki geçişi sağlayan yapı hangisidir?',
    a: 'Çekirdek porları',
    e: 'Çekirdek zarındaki porlar madde geçişine olanak tanır.',
  },
  {
    q: 'Hücrede tepkimelerin gerçekleştiği sıvı ortam hangisidir?',
    a: 'Sitoplazma',
    e: 'Sitoplazma, organelleri sarar ve tepkimelere ortam olur.',
  },
];

const EKO_KAVRAM: KavramRow[] = [
  {
    q: 'Aynı türden bireylerin oluşturduğu topluluğa ne denir?',
    a: 'Popülasyon',
    e: 'Belirli bir alanda yaşayan aynı tür bireyler popülasyonu oluşturur.',
  },
  {
    q: 'Bir alandaki farklı popülasyonların bütününe ne denir?',
    a: 'Komünite',
    e: 'Farklı türlerin popülasyonları bir araya gelerek komüniteyi kurar.',
  },
  {
    q: 'Canlılar ile cansız çevrenin oluşturduğu bütüne ne denir?',
    a: 'Ekosistem',
    e: 'Ekosistem, canlı toplulukları ile cansız ortamın birlikte işleyişidir.',
  },
  {
    q: 'Bir türün yaşadığı yere ne denir?',
    a: 'Habitat',
    e: 'Habitat, bir türün barındığı fiziksel ortamdır.',
  },
  {
    q: 'Bir türün yaşamını sürdürme biçimine ne denir?',
    a: 'Ekolojik niş',
    e: 'Niş, türün beslenme ve barınma biçimini kapsar.',
  },
  {
    q: 'Fotosentezle besin üreten canlılara ne denir?',
    a: 'Üretici',
    e: 'Üreticiler, ışık enerjisiyle organik besin üretir.',
  },
  {
    q: 'Ölü maddeleri parçalayan canlılara ne denir?',
    a: 'Ayrıştırıcı',
    e: 'Ayrıştırıcılar, ölü organik maddeleri inorganik hâle getirir.',
  },
  {
    q: 'Ortamın taşıyabileceği en yüksek birey sayısına ne denir?',
    a: 'Taşıma kapasitesi',
    e: 'Taşıma kapasitesi, ortamın sunduğu kaynaklarla sınırlıdır.',
  },
  {
    q: 'İki türün karşılıklı yarar sağladığı ilişkiye ne denir?',
    a: 'Mutualizm',
    e: 'Mutualizmde iki tür de bu birliktelikten yarar görür.',
  },
  {
    q: 'Bir türün diğerine zarar vererek yaşamasına ne denir?',
    a: 'Parazitlik',
    e: 'Parazit, üzerinde yaşadığı canlıdan beslenerek ona zarar verir.',
  },
  {
    q: 'Aynı kaynağı kullanan bireylerin yarışına ne denir?',
    a: 'Rekabet',
    e: 'Rekabet, sınırlı kaynak için bireyler arasındaki yarıştır.',
  },
  {
    q: 'Yalnızca belirli bir bölgede yaşayan türlere ne denir?',
    a: 'Endemik tür',
    e: 'Endemik türler, doğal olarak yalnızca bir bölgede bulunur.',
  },
  {
    q: 'Zararlı maddelerin canlıda artmasına ne denir?',
    a: 'Biyolojik birikim',
    e: 'Biyolojik birikim, zararlı maddelerin besin zincirinde yoğunlaşmasıdır.',
  },
  {
    q: 'Enerjinin bir canlıdan diğerine aktarılmasına ne denir?',
    a: 'Besin zinciri',
    e: 'Besin zinciri, enerji akışını üreticiden tüketiciye doğru gösterir.',
  },
  {
    q: 'Bir alandaki tür çeşitliliğine ne denir?',
    a: 'Biyoçeşitlilik',
    e: 'Biyoçeşitlilik, bir alandaki tür ve gen çeşitliliğini anlatır.',
  },
  {
    q: 'Karbonun canlı ve cansız ortam arasında dolaşımına ne denir?',
    a: 'Karbon döngüsü',
    e: 'Karbon döngüsü, karbonun atmosfer, toprak ve canlılar arasında geçişidir.',
  },
  {
    q: 'Yeni girdiği ortamda hızla çoğalan türlere ne denir?',
    a: 'İstilacı tür',
    e: 'İstilacı türler, yeni ortamda dengeyi bozacak hızda çoğalır.',
  },
];

const EKO_TANIM: KavramRow[] = [
  {
    q: 'Popülasyon kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Aynı türden bireylerin oluşturduğu topluluk',
    e: 'Popülasyon, aynı türün belirli bir alandaki bireylerinden oluşur.',
  },
  {
    q: 'Komünite kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Bir alandaki farklı popülasyonların bütünü',
    e: 'Komünite, aynı alanda yaşayan farklı türlerin toplamıdır.',
  },
  {
    q: 'Ekosistem kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Canlılar ile cansız çevrenin oluşturduğu bütün',
    e: 'Ekosistem, canlı ve cansız ögelerin karşılıklı etkileşimidir.',
  },
  {
    q: 'Habitat kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Bir türün yaşadığı yer',
    e: 'Habitat, türün barındığı ortamın fiziksel özelliklerini anlatır.',
  },
  {
    q: 'Ekolojik niş kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Bir türün yaşamını sürdürme biçimi',
    e: 'Niş, türün kaynakları kullanma ve çevreyle ilişki kurma biçimidir.',
  },
  {
    q: 'Üretici kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Fotosentezle besin üreten canlı',
    e: 'Üreticiler, inorganik maddelerden organik besin sentezler.',
  },
  {
    q: 'Ayrıştırıcı kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Ölü maddeleri parçalayan canlı',
    e: 'Ayrıştırıcılar, ölü organik maddeleri ayrıştırarak döngüye katar.',
  },
  {
    q: 'Taşıma kapasitesi kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Ortamın taşıyabileceği en yüksek birey sayısı',
    e: 'Taşıma kapasitesi, kaynaklar tükendiğinde ulaşılan üst sınırdır.',
  },
  {
    q: 'Mutualizm kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'İki türün karşılıklı yarar sağladığı ilişki',
    e: 'Mutualizmde her iki tür de birliktelikten yarar sağlar.',
  },
  {
    q: 'Parazitlik kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Bir türün diğerine zarar vererek yaşaması',
    e: 'Parazit, konak canlıdan yararlanırken ona zarar verir.',
  },
  {
    q: 'Rekabet kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Aynı kaynağı kullanan bireylerin yarışı',
    e: 'Rekabet, sınırlı kaynaklar için verilen yaşam mücadelesidir.',
  },
  {
    q: 'Endemik tür kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Yalnızca belirli bir bölgede yaşayan tür',
    e: 'Endemik türler başka bölgelerde doğal olarak bulunmaz.',
  },
  {
    q: 'Biyolojik birikim kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Zararlı maddelerin canlıda artması',
    e: 'Zararlı maddeler besin zincirinde üst basamaklarda yoğunlaşır.',
  },
  {
    q: 'Besin zinciri kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Enerjinin bir canlıdan diğerine aktarılması',
    e: 'Besin zinciri, enerjinin üreticiden tüketiciye geçişini gösterir.',
  },
  {
    q: 'Biyoçeşitlilik kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Bir alandaki tür çeşitliliği',
    e: 'Biyoçeşitlilik, türlerin ve genlerin çeşitliliğini kapsar.',
  },
  {
    q: 'Karbon döngüsü kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Karbonun canlı ve cansız ortam arasında dolaşımı',
    e: 'Karbon, fotosentez ve solunum yoluyla ortamlar arasında dolaşır.',
  },
  {
    q: 'İstilacı tür kavramının tanımı aşağıdakilerden hangisidir?',
    a: 'Yeni girdiği ortamda hızla çoğalan tür',
    e: 'İstilacı tür, yeni ortamda dengeyi bozacak biçimde çoğalır.',
  },
];

function emitKavram(rows: KavramRow[], pool: string[], prefix: string, topic: string) {
  rows.forEach((row, index) => {
    add(
      {
        id: nextId(prefix),
        prompt: row.q,
        answer: row.a,
        distractors: distractorsFrom(pool, row.a),
        explanation: row.e,
        difficulty: difficultyAt(index),
      },
      topic,
    );
  });
}

/* ---------------------------------------------------------------- */
/* Tarih                                                             */
/* ---------------------------------------------------------------- */

type Olay = { ad: string; y: number };

const OLAYLAR: Olay[] = [
  { ad: 'Tanzimat Fermanı’nın ilanı', y: 1839 },
  { ad: 'Islahat Fermanı’nın ilanı', y: 1856 },
  { ad: 'I. Meşrutiyet’in ilanı', y: 1876 },
  { ad: 'II. Meşrutiyet’in ilanı', y: 1908 },
  { ad: 'Mustafa Kemal’in Samsun’a çıkışı', y: 1919 },
  { ad: 'Erzurum Kongresi', y: 1919 },
  { ad: 'Sivas Kongresi', y: 1919 },
  { ad: 'Misak-ı Millî’nin kabulü', y: 1920 },
  { ad: 'TBMM’nin açılması', y: 1920 },
  { ad: 'İstiklal Marşı’nın kabulü', y: 1921 },
  { ad: 'Sakarya Meydan Muharebesi', y: 1921 },
  { ad: 'Saltanatın kaldırılması', y: 1922 },
  { ad: 'Büyük Taarruz', y: 1922 },
  { ad: 'Lozan Barış Antlaşması', y: 1923 },
  { ad: 'Cumhuriyet’in ilanı', y: 1923 },
  { ad: 'Halifeliğin kaldırılması', y: 1924 },
  { ad: 'Tevhid-i Tedrisat Kanunu', y: 1924 },
  { ad: 'Şapka Kanunu', y: 1925 },
  { ad: 'Türk Medeni Kanunu’nun kabulü', y: 1926 },
  { ad: 'Harf Devrimi', y: 1928 },
  { ad: 'Kadınlara belediye seçimlerinde seçme ve seçilme hakkı verilmesi', y: 1930 },
  { ad: 'Üniversite Reformu', y: 1933 },
  { ad: 'Soyadı Kanunu', y: 1934 },
  { ad: 'Kadınlara milletvekili seçme ve seçilme hakkı verilmesi', y: 1934 },
  { ad: 'Montrö Boğazlar Sözleşmesi', y: 1936 },
  { ad: 'Atatürk’ün vefatı', y: 1938 },
  { ad: 'Hatay’ın Türkiye’ye katılması', y: 1939 },
];

function permute3(items: string[]): string[][] {
  const out: string[][] = [];
  for (let first = 0; first < 3; first += 1) {
    for (let second = 0; second < 3; second += 1) {
      for (let third = 0; third < 3; third += 1) {
        if (first !== second && second !== third && first !== third) {
          out.push([items[first], items[second], items[third]]);
        }
      }
    }
  }
  return out;
}

function genTarKronoloji() {
  const numerals = ['I', 'II', 'III'];
  run(
    24,
    (i) => {
      const picks = shuffle(OLAYLAR).slice(0, 3);
      if (new Set(picks.map((item) => item.y)).size !== 3) return null;
      const sorted = [...picks].sort((left, right) => left.y - right.y);
      const correct = sorted.map((item) => numerals[picks.indexOf(item)]).join(' – ');
      const options = permute3(numerals).map((order) => order.join(' – '));
      const distractors = options.filter((item) => item !== correct).slice(0, 3);
      return {
        id: nextId('tar'),
        difficulty: difficultyAt(i),
        kind: 'sequence' as QuestionKind,
        prompt: `Aşağıda numaralanmış olayların kronolojik sırası aşağıdakilerden hangisidir?\n\nI. ${picks[0].ad}\nII. ${picks[1].ad}\nIII. ${picks[2].ad}`,
        answer: correct,
        distractors,
        explanation: `${sorted[0].ad} (${sorted[0].y}), ${sorted[1].ad} (${sorted[1].y}) ve ${sorted[2].ad} (${sorted[2].y}) sırasıyla gerçekleşmiştir; doğru sıralama ${correct} olur.`,
      };
    },
    T_TAR,
  );
}

function genTarYil() {
  run(
    23,
    (i) => {
      const olay = pick(OLAYLAR);
      const years = [...new Set(OLAYLAR.filter((item) => item.y !== olay.y).map((item) => item.y))];
      const others = shuffle(years).slice(0, 3);
      if (others.length < 3) return null;
      return {
        id: nextId('tar'),
        difficulty: difficultyAt(i),
        prompt: `${olay.ad} hangi yıl gerçekleşmiştir?`,
        answer: String(olay.y),
        distractors: others.map((year) => String(year)),
        explanation: `${olay.ad}, ${olay.y} yılında gerçekleşmiştir; diğer seçenekler farklı olayların yıllarıdır.`,
      };
    },
    T_TAR,
  );
}

const TAR_INKILAP: Row[] = [
  {
    p: 'Saltanatın kaldırılmasıyla devlet başkanlığı görevi hangi kuruma geçmiştir?',
    a: 'TBMM',
    d: ['Padişah divanı', 'Meclis-i Mebusan', 'Şûra-yı Devlet'],
    e: '1 Kasım 1922’de saltanat kaldırılmış, devlet başkanlığı yetkisi TBMM’ye geçmiştir.',
  },
  {
    p: 'Halifeliğin kaldırılması hangi alanda yapılan düzenlemelerin parçasıdır?',
    a: 'Laiklik',
    d: ['Ekonomi', 'Ulaşım', 'Tarım'],
    e: '3 Mart 1924’te halifelik kaldırılarak din ile devlet işlerinin ayrılması yolunda adım atılmıştır.',
  },
  {
    p: 'Tevhid-i Tedrisat Kanunu hangi alanı düzenlemiştir?',
    a: 'Eğitim ve öğretim',
    d: ['Sağlık', 'Ulaşım', 'Ticaret'],
    e: 'Kanun, bütün eğitim kurumlarını tek çatı altında toplayarak öğretim birliği sağlamıştır.',
  },
  {
    p: 'Türk Medeni Kanunu hazırlanırken hangi ülkenin kanunundan yararlanılmıştır?',
    a: 'İsviçre',
    d: ['Fransa', 'Almanya', 'İtalya'],
    e: '1926’da kabul edilen Türk Medeni Kanunu, İsviçre Medeni Kanunu örnek alınarak hazırlanmıştır.',
  },
  {
    p: 'Soyadı Kanunu ile kaldırılan unvanlar aşağıdakilerden hangisidir?',
    a: 'Ağa, bey, paşa gibi unvanlar',
    d: ['Askerî rütbeler', 'Meslek adları', 'Akrabalık adları'],
    e: '1934’te çıkarılan kanunla ağa, bey, paşa gibi unvanlar kaldırılmış, herkese soyadı alma zorunluluğu getirilmiştir.',
  },
  {
    p: 'Harf Devrimi ile hangi alfabe kabul edilmiştir?',
    a: 'Latin alfabesi',
    d: ['Arap alfabesi', 'Kiril alfabesi', 'Yunan alfabesi'],
    e: '1928’de Latin esaslı Türk alfabesi kabul edilerek yazıda birlik sağlanmıştır.',
  },
  {
    p: 'Montrö Boğazlar Sözleşmesi ile yetkisi sona eren kurum hangisidir?',
    a: 'Boğazlar Komisyonu',
    d: ['Milletler Cemiyeti', 'Düyun-u Umumiye', 'Reji İdaresi'],
    e: '1936’da imzalanan sözleşmeyle Boğazlar Komisyonu kaldırılmış, denetim Türkiye’ye geçmiştir.',
  },
  {
    p: 'Kabotaj Kanunu hangi alanda düzenleme getirmiştir?',
    a: 'Deniz ticareti',
    d: ['Demir yolu işletmesi', 'Havacılık', 'Kara yolu taşımacılığı'],
    e: 'Kabotaj Kanunu, Türk karasularında taşıma hakkını Türk gemilerine tanımıştır.',
  },
  {
    p: 'Millet Mektepleri hangi amacı gerçekleştirmek için açılmıştır?',
    a: 'Okuma yazma öğretmek',
    d: ['Meslek edindirmek', 'Asker yetiştirmek', 'Yabancı dil öğretmek'],
    e: 'Millet Mektepleri, yeni alfabeyle okuma yazma öğretmek üzere açılmıştır.',
  },
  {
    p: 'İzmir İktisat Kongresi hangi amaçla toplanmıştır?',
    a: 'Ekonomik kalkınmanın esaslarını belirlemek',
    d: ['Barış antlaşması imzalamak', 'Anayasa hazırlamak', 'Seçim yapmak'],
    e: '1923’te toplanan kongrede ülkenin ekonomik kalkınma ilkeleri belirlenmiştir.',
  },
  {
    p: 'Aşar vergisinin kaldırılması en çok hangi kesimi rahatlatmıştır?',
    a: 'Köylüleri',
    d: ['Tüccarları', 'Memurları', 'Esnafı'],
    e: 'Tarım ürünlerinden alınan aşar vergisinin kaldırılması köylünün yükünü azaltmıştır.',
  },
  {
    p: 'Türk Tarih Kurumu hangi amacı gerçekleştirmek için kurulmuştur?',
    a: 'Tarih araştırmalarını yürütmek',
    d: ['Dil araştırmalarını yürütmek', 'Müze koleksiyonu toplamak', 'Arşiv düzenlemek'],
    e: 'Kurum, Türk tarihinin bilimsel yöntemlerle araştırılması amacıyla kurulmuştur.',
  },
  {
    p: 'Türk Dil Kurumu hangi amacı gerçekleştirmek için kurulmuştur?',
    a: 'Dil araştırmalarını yürütmek',
    d: ['Tarih araştırmalarını yürütmek', 'Eğitim programı hazırlamak', 'Güzel sanatları desteklemek'],
    e: 'Kurum, Türkçenin özleşmesi ve dil araştırmaları amacıyla çalışmalar yürütmüştür.',
  },
  {
    p: 'Sakarya Meydan Muharebesi sonrasında Türkiye ile hangi ülke arasında antlaşma imzalanmıştır?',
    a: 'Fransa',
    d: ['Yunanistan', 'İtalya', 'İngiltere'],
    e: 'Sakarya sonrası 1921’de Fransa ile Ankara Antlaşması imzalanmıştır.',
  },
  {
    p: 'Büyük Taarruz sonucunda kurtarılan liman kenti hangisidir?',
    a: 'İzmir',
    d: ['Antalya', 'Mersin', 'Trabzon'],
    e: '26 Ağustos 1922’de başlayan taarruz, 9 Eylül’de İzmir’in kurtarılmasıyla sonuçlanmıştır.',
  },
  {
    p: 'Misak-ı Millî hangi mecliste kabul edilmiştir?',
    a: 'Son Osmanlı Mebusan Meclisi',
    d: ['TBMM', 'Erzurum Kongresi', 'Sivas Kongresi'],
    e: 'Misak-ı Millî, 28 Ocak 1920’de son Osmanlı Mebusan Meclisi’nde kabul edilmiştir.',
  },
  {
    p: 'Erzurum Kongresi’nin toplanmasını sağlayan cemiyet hangisidir?',
    a: 'Doğu Anadolu Müdafaa-i Hukuk Cemiyeti',
    d: ['Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti', 'Karakol Cemiyeti', 'Millî Kongre Cemiyeti'],
    e: 'Kongre, Doğu Anadolu Müdafaa-i Hukuk Cemiyeti tarafından bölgesel olarak toplanmıştır.',
  },
  {
    p: 'Sivas Kongresi’nde kurulan cemiyet hangisidir?',
    a: 'Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti',
    d: ['Doğu Anadolu Müdafaa-i Hukuk Cemiyeti', 'Karakol Cemiyeti', 'Millî Kongre Cemiyeti'],
    e: 'Sivas Kongresi’nde bölgesel cemiyetler birleştirilerek Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti kurulmuştur.',
  },
  {
    p: 'Cumhuriyet’in ilanından sonra kabul edilen ilk anayasa hangisidir?',
    a: '1924 Anayasası',
    d: ['1921 Anayasası', '1876 Kanun-i Esasi', '1961 Anayasası'],
    e: '1921 Anayasası cumhuriyetten önce kabul edilmişti; cumhuriyet sonrası ilk anayasa 1924 Anayasası’dır.',
  },
  {
    p: 'Şapka Kanunu hangi alanda düzenleme getirmiştir?',
    a: 'Kıyafet',
    d: ['Eğitim', 'Vergi', 'Yerleşim'],
    e: '1925’te çıkarılan kanun, başlık ve kıyafet alanında düzenleme yapmıştır.',
  },
  {
    p: 'Tekke ve zaviyelerin kapatılması hangi alanla ilgilidir?',
    a: 'Dinî kurumlar',
    d: ['Askerî kurumlar', 'Sağlık kurumları', 'Ulaşım kurumları'],
    e: '1925’te tekke, zaviye ve türbelerin kapatılması dinî kurumlar alanındaki düzenlemedir.',
  },
  {
    p: 'Ölçü birimlerinde yapılan değişikliğin amacı nedir?',
    a: 'Ölçülerde birlik sağlamak',
    d: ['Vergi gelirini artırmak', 'Ticareti sınırlamak', 'Üretimi azaltmak'],
    e: 'Uzunluk ve ağırlık ölçülerinin değiştirilmesi, ülke içinde ölçü birliği sağlamayı amaçlamıştır.',
  },
  {
    p: 'Kadınlara milletvekili seçme ve seçilme hakkı hangi yıl tanınmıştır?',
    a: '1934',
    d: ['1930', '1926', '1938'],
    e: 'Kadınlara milletvekili seçme ve seçilme hakkı 1934’te tanınmıştır; 1930’da yalnızca belediye seçimlerinde hak verilmişti.',
  },
];

function genTarInkilap() {
  TAR_INKILAP.forEach((row, index) => {
    add(
      {
        id: nextId('tar'),
        prompt: row.p,
        answer: row.a,
        distractors: row.d,
        explanation: row.e,
        difficulty: difficultyAt(index),
      },
      T_TAR,
    );
  });
}

/* ---------------------------------------------------------------- */
/* Coğrafya                                                          */
/* ---------------------------------------------------------------- */

type Kavram2 = { k: string; t: string };

const COG_IKLIM: Kavram2[] = [
  { k: 'Akdeniz iklimi', t: 'Yazları sıcak ve kurak, kışları ılık ve yağışlı geçen iklim' },
  { k: 'Karadeniz iklimi', t: 'Her mevsim yağışlı, nem oranı yüksek iklim' },
  { k: 'Karasal iklim', t: 'Kışları soğuk, yazları sıcak, yağışın az olduğu iklim' },
  { k: 'Marmara geçiş iklimi', t: 'Akdeniz ile Karadeniz iklimleri arasında geçiş özelliği gösteren iklim' },
  { k: 'Doğu Anadolu iklimi', t: 'Kışları çok uzun ve sert, kar örtüsü kalın olan iklim' },
  { k: 'Güneydoğu Anadolu iklimi', t: 'Yazları çok sıcak ve kurak, kışları ılıman geçen iklim' },
  { k: 'Muson iklimi', t: 'Yazın bol yağış, kışın kuraklık getiren mevsimlik rüzgâr iklimi' },
  { k: 'Ekvatoral iklim', t: 'Yıl boyu yüksek sıcaklık ve düzenli yağış görülen iklim' },
  { k: 'Çöl iklimi', t: 'Yıllık yağışın çok az, günlük sıcaklık farkının çok yüksek olduğu iklim' },
  { k: 'Step iklimi', t: 'İlkbahar yağışlarıyla yeşeren kısa ot örtüsünün görüldüğü yarı kurak iklim' },
  { k: 'Tundra iklimi', t: 'Toprağın alt katmanının sürekli donmuş kaldığı soğuk iklim' },
  { k: 'Kutup iklimi', t: 'Sıcaklığın yıl boyu sıfırın altında seyrettiği iklim' },
];

const COG_NUFUS: Kavram2[] = [
  { k: 'Nüfus yoğunluğu', t: 'Bir alanda yaşayan kişi sayısının alanın yüzölçümüne bölümü' },
  { k: 'Tarımsal nüfus yoğunluğu', t: 'Kırsal nüfusun tarım alanına bölümü' },
  { k: 'Doğal nüfus artışı', t: 'Doğum sayısı ile ölüm sayısı arasındaki fark' },
  { k: 'Göç', t: 'İnsanların yaşadıkları yeri kalıcı olarak değiştirmesi' },
  { k: 'İç göç', t: 'Ülke sınırları içinde yerleşim yeri değiştirme' },
  { k: 'Dış göç', t: 'Ülke sınırları dışına yerleşmek üzere gitme' },
  { k: 'Mevsimlik göç', t: 'Yalnızca belirli bir dönem için yer değiştirme' },
  { k: 'Beyin göçü', t: 'Nitelikli iş gücünün başka ülkeye yerleşmesi' },
  { k: 'Nüfus piramidi', t: 'Yaş ve cinsiyete göre nüfus dağılımını gösteren grafik' },
  { k: 'Bağımlı nüfus', t: 'Çalışma çağı dışında kalan nüfus' },
  { k: 'Kentleşme', t: 'Kent nüfusunun toplam nüfus içindeki payının artması' },
  { k: 'Nüfus sayımı', t: 'Nüfusun sayı ve özelliklerinin belirli bir tarihte tespit edilmesi' },
];

const COG_YER: Kavram2[] = [
  { k: 'Delta ovası', t: 'Akarsuyun denize ulaştığı yerde taşıdığı alüvyonla oluşturduğu düzlük' },
  { k: 'Falez', t: 'Dalgaların kıyıyı aşındırmasıyla oluşan dik yamaç' },
  { k: 'Tombolo', t: 'Kıyıya yakın bir adanın karaya bağlanmasıyla oluşan kıyı oku' },
  { k: 'Lagün', t: 'Kıyı okuyla denizden ayrılmış sığ su birikintisi' },
  { k: 'Obruk', t: 'Kalkerli arazide çökmeyle oluşan çukur' },
  { k: 'Traverten', t: 'Kalsiyum karbonatın çökelmesiyle oluşan basamaklı yapı' },
  { k: 'Peribacası', t: 'Sel sularının tüflü arazide oluşturduğu sivri kaya biçimi' },
  { k: 'Sirk gölü', t: 'Buzul aşındırmasıyla oluşan çukurun suyla dolması' },
  { k: 'Moren', t: 'Buzulun taşıyıp biriktirdiği malzeme' },
  { k: 'Menderes', t: 'Akarsuyun eğimin azaldığı yerde kıvrılarak akması' },
  { k: 'Plato', t: 'Çevresine göre yüksek ve geniş düzlük' },
];

/* ---------------------------------------------------------------- */
/* Felsefe                                                           */
/* ---------------------------------------------------------------- */

const FEL_BILGI: Kavram2[] = [
  { k: 'Bilgi felsefesi', t: 'Bilginin kaynağını, sınırlarını ve doğruluğunu inceleyen alan' },
  { k: 'Rasyonalizm', t: 'Bilginin kaynağını akla dayandıran görüş' },
  { k: 'Empirizm', t: 'Bilginin kaynağını deney ve duyuya dayandıran görüş' },
  { k: 'Septisizm', t: 'Kesin bilginin olanaksız olduğunu savunan görüş' },
  { k: 'Dogmatizm', t: 'Sorgulamadan kabul edilen kesin yargılara dayanan görüş' },
  { k: 'Kritisizm', t: 'Bilginin deney ile aklın birlikte işleyişiyle oluştuğunu savunan görüş' },
  { k: 'Analitik yargı', t: 'Yüklemin öznede zaten bulunduğu, deney gerektirmeyen yargı' },
  { k: 'Sentetik yargı', t: 'Bilgimizi artıran ve deneye dayanan yargı' },
  { k: 'Apriori bilgi', t: 'Deneyden önce gelen bilgi' },
  { k: 'Aposteriori bilgi', t: 'Deney sonrasında elde edilen bilgi' },
  { k: 'Hakikat', t: 'Bir yargının gerçekle uygunluğu' },
  { k: 'Tutarlılık', t: 'Yargılar arasında çelişki bulunmaması' },
];

const FEL_AHLAK: Kavram2[] = [
  { k: 'Etik', t: 'Ahlaki değerleri ve eylemleri inceleyen felsefe alanı' },
  { k: 'Ahlaki özgürlük', t: 'İnsanın eylemlerini kendi iradesiyle seçebilmesi' },
  { k: 'Determinizm', t: 'Eylemlerin nedenlerle belirlendiğini savunan görüş' },
  { k: 'İndeterminizm', t: 'İnsanın eylemlerinde tamamen özgür olduğunu savunan görüş' },
  { k: 'Ödev ahlakı', t: 'Eylemlerin sonucuna değil ödeve uygunluğuna bakılmasını isteyen görüş' },
  { k: 'Faydacılık', t: 'En çok kişiye en çok yarar sağlayan eylemin doğru olduğunu savunan görüş' },
  { k: 'Hedonizm', t: 'Hazzı en yüksek iyi sayan görüş' },
  { k: 'Erdem ahlakı', t: 'İyi yaşamın erdemlerle kurulduğunu savunan görüş' },
  { k: 'Vicdan', t: 'Kişinin kendi eylemlerini ahlaki açıdan yargılaması' },
  { k: 'Ahlaki sorumluluk', t: 'Kişinin eylemlerinin sonuçlarını üstlenmesi' },
  { k: 'Evrensel ahlak yasası', t: 'Herkes için geçerli olabilecek ahlak ilkesi' },
  { k: 'Ahlaki değer', t: 'Eylemleri iyi ya da kötü kılan ölçüt' },
];

const FEL_ALAN: Kavram2[] = [
  { k: 'Ontoloji', t: 'Varlığın ne olduğunu ve varlık türlerini inceleyen alan' },
  { k: 'Mantık', t: 'Düşünmenin doğru biçimlerini inceleyen alan' },
  { k: 'Estetik', t: 'Güzeli ve sanat eserini inceleyen alan' },
  { k: 'Siyaset felsefesi', t: 'Devlet, iktidar ve yönetim biçimlerini inceleyen alan' },
  { k: 'Din felsefesi', t: 'Din olgusunu akıl yoluyla inceleyen alan' },
  { k: 'Bilim felsefesi', t: 'Bilimin yöntemini ve temel kavramlarını inceleyen alan' },
  { k: 'Metafizik', t: 'Deneyin ötesindeki varlığı konu edinen alan' },
  { k: 'Teoloji', t: 'Tanrı ve inanç konularını inanç temelinde ele alan alan' },
  { k: 'Aksiyoloji', t: 'Değerleri inceleyen felsefe alanı' },
  { k: 'Diyalektik', t: 'Karşıtlıklar yoluyla ilerleyen düşünme yöntemi' },
  { k: 'Hermeneutik', t: 'Yorumlama ve anlamayı konu edinen yaklaşım' },
];

function genKavramCift(rows: Kavram2[], prefix: string, topic: string, ters: number) {
  const terms = rows.map((row) => row.k);
  const defs = rows.map((row) => row.t);
  rows.forEach((row, index) => {
    add(
      {
        id: nextId(prefix),
        prompt: `${row.t}\n\nBu tanım aşağıdaki kavramlardan hangisine aittir?`,
        answer: row.k,
        distractors: distractorsFrom(terms, row.k),
        explanation: `Tanımda verilen özellikler “${row.k}” kavramına aittir; diğer seçenekler farklı kavramları karşılar.`,
        difficulty: difficultyAt(index),
      },
      topic,
    );
  });
  rows.slice(0, ters).forEach((row, index) => {
    add(
      {
        id: nextId(prefix),
        prompt: `“${row.k}” kavramının tanımı aşağıdakilerden hangisidir?`,
        answer: row.t,
        distractors: distractorsFrom(defs, row.t),
        explanation: `“${row.k}” kavramı, ${row.t} biçiminde tanımlanır.`,
        difficulty: difficultyAt(index + 5),
      },
      topic,
    );
  });
}

/* ---------------------------------------------------------------- */
/* Üretim                                                            */
/* ---------------------------------------------------------------- */

genTemelIslem();
genYuzdeOran();
genProblem();
genHiz();
genAci();
genAlan();
genHareket();
genKuvvet();
genAtom();
genMol();

emitRows(SOZ_ANLAM, 'soz', T_SOZ, 'reading');
emitRows(SOZ_CUMLE, 'soz', T_SOZ, 'reading');

genParAna();
genParAkis();
genParBaslik();

genDilEk();
genDilOge();
genDilBozuk();

genYazim();
genNoktalama();

emitKavram(HUCRE_GOREV, HUCRE_GOREV.map((row) => row.a), 'biy', T_BIY);
emitKavram(HUCRE_ORGANEL, ORGANELLER, 'biy', T_BIY);
emitKavram(EKO_KAVRAM, EKO_KAVRAM.map((row) => row.a), 'biy', T_BIY);
emitKavram(EKO_TANIM, EKO_TANIM.map((row) => row.a), 'biy', T_BIY);

genTarKronoloji();
genTarYil();
genTarInkilap();

genKavramCift(COG_IKLIM, 'cog', T_COG, 12);
genKavramCift(COG_NUFUS, 'cog', T_COG, 11);
genKavramCift(COG_YER, 'cog', T_COG, 11);

genKavramCift(FEL_BILGI, 'fel', T_FEL, 12);
genKavramCift(FEL_AHLAK, 'fel', T_FEL, 11);
genKavramCift(FEL_ALAN, 'fel', T_FEL, 11);

export { questions };

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'ÖSYM::TYT': {
    'Sözcük ve Cümle Anlamı': topicIds[T_SOZ] ?? [],
    Paragraf: topicIds[T_PAR] ?? [],
    'Dil Bilgisi': topicIds[T_DIL] ?? [],
    'Yazım ve Noktalama': topicIds[T_YAZ] ?? [],
    'Temel Matematik': topicIds[T_MAT] ?? [],
    Problemler: topicIds[T_PRB] ?? [],
    Geometri: topicIds[T_GEO] ?? [],
    Fizik: topicIds[T_FIZ] ?? [],
    Kimya: topicIds[T_KIM] ?? [],
    Biyoloji: topicIds[T_BIY] ?? [],
    Tarih: topicIds[T_TAR] ?? [],
    Coğrafya: topicIds[T_COG] ?? [],
    Felsefe: topicIds[T_FEL] ?? [],
  },
};
