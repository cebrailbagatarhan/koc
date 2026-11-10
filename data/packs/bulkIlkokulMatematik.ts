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

const LEVEL = 'İlkokul';
const MATH = 'Matematik';
const TURKCE = 'Türkçe';

const questions: EmbeddedQuestionSeed[] = [];
const topicIds: Record<string, string[]> = {};
const usedPrompts = new Set<string>();

type Draft = {
  id: string;
  courseName: string;
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
      courseName: draft.courseName,
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

function difficultyAt(index: number): QuestionDifficulty {
  const slot = index % 10;
  if (slot < 3) return 'easy';
  if (slot < 8) return 'standard';
  return 'hard';
}

function uniqueOptions(answer: string, candidates: string[]): string[] {
  const seen = new Set([answer]);
  const result: string[] = [];
  for (const candidate of candidates) {
    if (result.length === 3) break;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      result.push(candidate);
    }
  }
  return result;
}

function uniqueNumbers(
  answer: number,
  candidates: number[],
  format: (value: number) => string = (value) => String(value),
): string[] {
  const result = uniqueOptions(
    format(answer),
    candidates.filter((value) => Number.isFinite(value) && value >= 0).map(format),
  );
  let step = 1;
  while (result.length < 3) {
    for (const value of [answer + step, answer - step]) {
      if (result.length === 3) break;
      if (value < 0) continue;
      const text = format(value);
      if (text !== format(answer) && !result.includes(text)) result.push(text);
    }
    step += 1;
  }
  return result;
}

function dec(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1).replace('.', ',');
}

function clock(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  return `${Math.floor(total / 60)}.${String(total % 60).padStart(2, '0')}`;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/* ---------------------------------------------------------------- */
/* Matematik: Toplama ve Çıkarma                                     */
/* ---------------------------------------------------------------- */

const TOPIC_ADD_SUB = 'Toplama ve Çıkarma';

function genAdd(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const a = 12 + Math.floor(rnd() * 78);
    const b = 11 + Math.floor(rnd() * 79);
    const sum = a + b;
    const prompt =
      made % 2 === 0
        ? `${a} ile ${b} sayılarının toplamı kaçtır?`
        : `Bir sepette ${a} elma, başka bir sepette ${b} elma vardır. İki sepette toplam kaç elma vardır?`;
    const ok = add(
      {
        id: `bulk-im-add-${made + 1}`,
        courseName: MATH,
        prompt,
        answer: String(sum),
        distractors: uniqueNumbers(sum, [sum + 1, sum - 1, sum + 10, sum - 10, sum + 9]),
        explanation: `${a} + ${b} işlemi ${sum} eder. Onlukları ayrı, birlikleri ayrı toplayınca da ${sum} bulunur.`,
        difficulty: difficultyAt(made),
      },
      TOPIC_ADD_SUB,
    );
    if (ok) made += 1;
  }
}

function genSub(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const a = 45 + Math.floor(rnd() * 55);
    const b = 12 + Math.floor(rnd() * 30);
    if (a - b < 8) continue;
    const diff = a - b;
    const prompt =
      made % 2 === 0
        ? `${a} sayısından ${b} çıkarılırsa sonuç kaç olur?`
        : `Bir otobüste ${a} yolcu vardı. Durakta ${b} yolcu indi. Otobüste kaç yolcu kaldı?`;
    const ok = add(
      {
        id: `bulk-im-sub-${made + 1}`,
        courseName: MATH,
        prompt,
        answer: String(diff),
        distractors: uniqueNumbers(diff, [diff + 1, diff - 1, a + b, diff + 10, diff - 10]),
        explanation: `${a} − ${b} = ${diff} olur. Sonucu ${diff} + ${b} = ${a} işlemiyle kontrol edebiliriz.`,
        difficulty: difficultyAt(made),
      },
      TOPIC_ADD_SUB,
    );
    if (ok) made += 1;
  }
}

function genMissingAddend(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const a = 14 + Math.floor(rnd() * 46);
    const answer = 13 + Math.floor(rnd() * 38);
    const total = a + answer;
    const prompt =
      made % 2 === 0
        ? `${a} + □ = ${total} eşitliğinde □ yerine hangi sayı gelmelidir?`
        : `Bir sayıya ${a} eklendiğinde ${total} oluyor. Bu sayı kaçtır?`;
    const ok = add(
      {
        id: `bulk-im-miss-${made + 1}`,
        courseName: MATH,
        prompt,
        answer: String(answer),
        distractors: uniqueNumbers(answer, [total + a, answer + 1, answer - 1, answer + 10, answer - 10]),
        explanation: `Toplamdan eklenen sayı çıkarılır: ${total} − ${a} = ${answer}. Kontrol: ${a} + ${answer} = ${total}.`,
        difficulty: difficultyAt(made),
      },
      TOPIC_ADD_SUB,
    );
    if (ok) made += 1;
  }
}

function genAddSubWord(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const a = 42 + Math.floor(rnd() * 48);
    const b = 15 + Math.floor(rnd() * 26);
    const c = 12 + Math.floor(rnd() * (a + b - 30));
    const answer = a + b - c;
    if (answer <= 5) continue;
    const prompt =
      made % 2 === 0
        ? `Bir kırtasiyede ${a} kalem vardı. ${b} kalem daha geldi, sonra ${c} kalem satıldı. Kırtasiyede kaç kalem kaldı?`
        : `Elif ${a} TL, Kerem ${b} TL biriktirdi. İkisi birlikte ${c} TL’lik bir oyuncak aldı. Kaç TL paraları kaldı?`;
    const ok = add(
      {
        id: `bulk-im-word-${made + 1}`,
        courseName: MATH,
        prompt,
        answer: String(answer),
        distractors: uniqueNumbers(answer, [a + b, a + b + c, answer + 1, answer - 1]),
        explanation: `Önce ${a} + ${b} = ${a + b} bulunur, sonra ${a + b} − ${c} = ${answer} kalır.`,
        difficulty: difficultyAt(made),
      },
      TOPIC_ADD_SUB,
    );
    if (ok) made += 1;
  }
}

function genTime(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const hour = 8 + Math.floor(rnd() * 9);
    const minute = 5 * Math.floor(rnd() * 12);
    const extra = 5 * (3 + Math.floor(rnd() * 17));
    const start = hour * 60 + minute;
    const end = start + extra;
    const answer = clock(end);
    const carry = minute + extra >= 60 ? `${hour}.${pad2(minute + extra)}` : '';
    const prompt =
      made % 2 === 0
        ? `Saat ${hour}.${pad2(minute)} iken ${extra} dakika sonra saat kaç olur?`
        : `Bir film saat ${hour}.${pad2(minute)} başladı ve ${extra} dakika sürdü. Film saat kaçta bitti?`;
    const ok = add(
      {
        id: `bulk-im-time-${made + 1}`,
        courseName: MATH,
        prompt,
        answer,
        distractors: uniqueOptions(answer, [
          clock(end + 10),
          clock(end - 10),
          clock(end + 60),
          clock(end - 60),
          carry,
          clock(end + 5),
          clock(end - 5),
        ]),
        explanation: `${hour}.${pad2(minute)} üzerine ${extra} dakika eklenir. ${extra} dakika = ${Math.floor(extra / 60)} saat ${extra % 60} dakika olduğundan saat ${answer} olur.`,
        difficulty: difficultyAt(made),
      },
      TOPIC_ADD_SUB,
    );
    if (ok) made += 1;
  }
}

/* ---------------------------------------------------------------- */
/* Matematik: Sayılar ve Kesirler                                    */
/* ---------------------------------------------------------------- */

const TOPIC_NUMBERS = 'Sayılar ve Kesirler';

function genFraction(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const half = made % 2 === 0;
    if (half) {
      const n = 2 * (5 + Math.floor(rnd() * 21));
      const answer = n / 2;
      const ok = add(
        {
          id: `bulk-im-frac-${made + 1}`,
          courseName: MATH,
          prompt: `${n} nesnenin yarısı kaç nesnedir?`,
          answer: String(answer),
          distractors: uniqueNumbers(answer, [n, answer + 1, answer - 1, n * 2]),
          explanation: `Yarım, bütünün iki eşit parçasından biridir: ${n} ÷ 2 = ${answer}.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_NUMBERS,
      );
      if (ok) made += 1;
    } else {
      const n = 4 * (3 + Math.floor(rnd() * 23));
      const answer = n / 4;
      const ok = add(
        {
          id: `bulk-im-frac-${made + 1}`,
          courseName: MATH,
          prompt: `${n} kalemin çeyreği kaç kalemdir?`,
          answer: String(answer),
          distractors: uniqueNumbers(answer, [n / 2, answer + 1, answer - 1, n]),
          explanation: `Çeyrek, bütünün dört eşit parçasından biridir: ${n} ÷ 4 = ${answer}.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_NUMBERS,
      );
      if (ok) made += 1;
    }
  }
}

function genDecimal(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    if (made % 2 === 0) {
      const x = 1 + Math.floor(rnd() * 9);
      const y = 1 + Math.floor(rnd() * 9);
      const answer = (x + y) / 10;
      const text = dec(answer);
      const ok = add(
        {
          id: `bulk-im-dec-${made + 1}`,
          courseName: MATH,
          prompt: `0,${x} + 0,${y} ondalık işleminin sonucu nedir?`,
          answer: text,
          distractors: uniqueNumbers(answer, [answer + 0.1, answer - 0.1, answer + 1, answer - 1], dec),
          explanation: `Ondalık kısımlar toplanır: ${x} + ${y} = ${x + y}; sonuç ${text} olur.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_NUMBERS,
      );
      if (ok) made += 1;
    } else {
      const wholeA = 3 + Math.floor(rnd() * 6);
      const wholeB = 1 + Math.floor(rnd() * (wholeA - 1));
      const tenthA = 3 + Math.floor(rnd() * 7);
      const tenthB = 1 + Math.floor(rnd() * (tenthA - 1));
      const answer = (wholeA * 10 + tenthA - (wholeB * 10 + tenthB)) / 10;
      const text = dec(answer);
      const ok = add(
        {
          id: `bulk-im-dec-${made + 1}`,
          courseName: MATH,
          prompt: `${wholeA},${tenthA} − ${wholeB},${tenthB} ondalık işleminin farkı nedir?`,
          answer: text,
          distractors: uniqueNumbers(answer, [answer + 0.1, answer - 0.1, answer + 1, answer - 1], dec),
          explanation: `Tam kısımlar ve ondalık kısımlar ayrı ayrı çıkarılır: ${wholeA},${tenthA} − ${wholeB},${tenthB} = ${text}.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_NUMBERS,
      );
      if (ok) made += 1;
    }
  }
}

function genMoney(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    if (made % 2 === 0) {
      const price = 3 + Math.floor(rnd() * 7);
      const amount = 3 + Math.floor(rnd() * 7);
      const item = pick(['simit', 'poğaça', 'börek']);
      const answer = price * amount;
      const ok = add(
        {
          id: `bulk-im-money-${made + 1}`,
          courseName: MATH,
          prompt: `Bir ${item} ${price} TL’dir. ${amount} ${item} alan bir kişi kaç TL öder?`,
          answer: String(answer),
          distractors: uniqueNumbers(answer, [answer + price, answer - price, price + amount, answer + 1]),
          explanation: `Her ${item} ${price} TL olduğu için ${amount} × ${price} = ${answer} TL ödenir.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_NUMBERS,
      );
      if (ok) made += 1;
    } else {
      const wallet = 60 + Math.floor(rnd() * 41);
      const price = 4 + Math.floor(rnd() * 6);
      const amount = 3 + Math.floor(rnd() * 6);
      if (price * amount >= wallet - 10) continue;
      const spent = price * amount;
      const answer = wallet - spent;
      const ok = add(
        {
          id: `bulk-im-money-${made + 1}`,
          courseName: MATH,
          prompt: `${wallet} TL parası olan biri, tanesi ${price} TL olan ${amount} kalem alıyor. Kaç TL parası kalır?`,
          answer: String(answer),
          distractors: uniqueNumbers(answer, [spent, answer + price, answer + 1, answer - 10]),
          explanation: `${amount} × ${price} = ${spent} TL harcanır; ${wallet} − ${spent} = ${answer} TL kalır.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_NUMBERS,
      );
      if (ok) made += 1;
    }
  }
}

function genOrdering(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const numbers: number[] = [];
    while (numbers.length < 4) {
      const value = 21 + Math.floor(rnd() * 79);
      if (!numbers.includes(value)) numbers.push(value);
    }
    const sorted = [...numbers].sort((left, right) => left - right);
    const biggest = made % 2 === 0;
    const answer = biggest ? sorted[3] : sorted[0];
    const distractors = numbers.filter((value) => value !== answer).map(String);
    const ok = add(
      {
        id: `bulk-im-order-${made + 1}`,
        courseName: MATH,
        prompt: biggest
          ? 'Aşağıdaki sayılardan en büyüğü hangisidir?'
          : 'Aşağıdaki sayılardan en küçüğü hangisidir?',
        answer: String(answer),
        distractors,
        explanation: `Sayılar küçükten büyüğe ${sorted.join(' < ')} biçiminde sıralanır; bu yüzden en ${biggest ? 'büyük' : 'küçük'} sayı ${answer} olur.`,
        difficulty: difficultyAt(made),
      },
      TOPIC_NUMBERS,
    );
    if (ok) made += 1;
  }
}

function genUnit(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    if (made % 2 === 0) {
      const n = 2 + Math.floor(rnd() * 40);
      const answer = n * 100;
      const ok = add(
        {
          id: `bulk-im-unit-${made + 1}`,
          courseName: MATH,
          prompt: `${n} metre kaç santimetredir?`,
          answer: String(answer),
          distractors: uniqueNumbers(answer, [n * 10, n * 1000, answer + 10, answer - 10]),
          explanation: `1 metre 100 santimetredir: ${n} × 100 = ${answer} santimetre.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_NUMBERS,
      );
      if (ok) made += 1;
    } else {
      const n = 2 + Math.floor(rnd() * 30);
      const answer = n * 1000;
      const ok = add(
        {
          id: `bulk-im-unit-${made + 1}`,
          courseName: MATH,
          prompt: `${n} kilogram kaç gramdır?`,
          answer: String(answer),
          distractors: uniqueNumbers(answer, [n * 100, n * 10, answer + 100, answer - 100]),
          explanation: `1 kilogram 1000 gramdır: ${n} × 1000 = ${answer} gram.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_NUMBERS,
      );
      if (ok) made += 1;
    }
  }
}

/* ---------------------------------------------------------------- */
/* Matematik: Çarpma Mantığı                                         */
/* ---------------------------------------------------------------- */

const TOPIC_MULT = 'Çarpma Mantığı';

function genMultiply(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const a = 3 + Math.floor(rnd() * 7);
    const b = 3 + Math.floor(rnd() * 7);
    const product = a * b;
    const prompt =
      made % 2 === 0
        ? `${a} × ${b} çarpma işleminin sonucu nedir?`
        : `Her birinde ${b} şeker bulunan ${a} poşette toplam kaç şeker vardır?`;
    const ok = add(
      {
        id: `bulk-im-mul-${made + 1}`,
        courseName: MATH,
        prompt,
        answer: String(product),
        distractors: uniqueNumbers(product, [product + a, product - a, a + b, product + 1]),
        explanation: `${a} × ${b} = ${product} olur; ${b} sayısı ${a} kez toplandığında da ${product} bulunur.`,
        difficulty: difficultyAt(made),
      },
      TOPIC_MULT,
    );
    if (ok) made += 1;
  }
}

function genDivide(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const b = 3 + Math.floor(rnd() * 7);
    const q = 3 + Math.floor(rnd() * 7);
    const total = b * q;
    const prompt =
      made % 2 === 0
        ? `${total} ÷ ${b} bölme işleminde bölüm kaçtır?`
        : `${total} kalem ${b} öğrenciye eşit olarak paylaştırılırsa her öğrenci kaç kalem alır?`;
    const ok = add(
      {
        id: `bulk-im-div-${made + 1}`,
        courseName: MATH,
        prompt,
        answer: String(q),
        distractors: uniqueNumbers(q, [q + 1, q - 1, total - b, b]),
        explanation: `${b} × ${q} = ${total} olduğundan ${total} ÷ ${b} = ${q} bulunur.`,
        difficulty: difficultyAt(made),
      },
      TOPIC_MULT,
    );
    if (ok) made += 1;
  }
}

function genRemainder(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const b = 4 + Math.floor(rnd() * 6);
    const q = 4 + Math.floor(rnd() * 6);
    const r = 1 + Math.floor(rnd() * (b - 1));
    const total = b * q + r;
    const prompt =
      made % 2 === 0
        ? `${total} ÷ ${b} işleminde kalan kaçtır?`
        : `${total} şeker ${b} çocuğa eşit olarak dağıtılırsa kaç şeker artar?`;
    const ok = add(
      {
        id: `bulk-im-rem-${made + 1}`,
        courseName: MATH,
        prompt,
        answer: String(r),
        distractors: uniqueNumbers(r, [r + 1, b - r, q, r - 1]),
        explanation: `${b} × ${q} = ${b * q}; ${total} − ${b * q} = ${r} olduğundan kalan ${r} olur.`,
        difficulty: difficultyAt(made),
      },
      TOPIC_MULT,
    );
    if (ok) made += 1;
  }
}

function genMultiplyWord(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    if (made % 2 === 0) {
      const boxes = 3 + Math.floor(rnd() * 7);
      const perBox = 4 + Math.floor(rnd() * 6);
      const answer = boxes * perBox;
      const ok = add(
        {
          id: `bulk-im-mulw-${made + 1}`,
          courseName: MATH,
          prompt: `Bir kutuda ${perBox} kalem vardır. ${boxes} kutuda toplam kaç kalem vardır?`,
          answer: String(answer),
          distractors: uniqueNumbers(answer, [answer + boxes, answer - boxes, boxes + perBox, answer + 1]),
          explanation: `Her kutuda ${perBox} kalem olduğu için ${boxes} × ${perBox} = ${answer} kalem vardır.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_MULT,
      );
      if (ok) made += 1;
    } else {
      const rows = 4 + Math.floor(rnd() * 6);
      const perRow = 4 + Math.floor(rnd() * 5);
      const extra = 3 + Math.floor(rnd() * 8);
      const answer = rows * perRow + extra;
      const ok = add(
        {
          id: `bulk-im-mulw-${made + 1}`,
          courseName: MATH,
          prompt: `Bir sınıfta ${rows} sıra vardır ve her sırada ${perRow} öğrenci oturmaktadır. ${extra} öğrenci daha gelirse sınıfta kaç öğrenci olur?`,
          answer: String(answer),
          distractors: uniqueNumbers(answer, [rows * perRow, answer + 1, answer - 1, rows + perRow + extra]),
          explanation: `${rows} × ${perRow} = ${rows * perRow} öğrenci vardır; ${extra} öğrenci eklenince ${rows * perRow} + ${extra} = ${answer} olur.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_MULT,
      );
      if (ok) made += 1;
    }
  }
}

function genRepeatedAdd(count: number) {
  let made = 0;
  let guard = 0;
  while (made < count && guard < count * 40) {
    guard += 1;
    const b = 3 + Math.floor(rnd() * 17);
    if (made % 2 === 0) {
      const answer = `4 × ${b}`;
      const ok = add(
        {
          id: `bulk-im-rep-${made + 1}`,
          courseName: MATH,
          prompt: `${b} + ${b} + ${b} + ${b} toplamı hangi çarpma işlemine eşittir?`,
          answer,
          distractors: uniqueOptions(answer, [`3 × ${b}`, `5 × ${b}`, `4 + ${b}`]),
          explanation: `${b} sayısı dört kez toplandığı için toplam 4 × ${b} = ${4 * b} olur.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_MULT,
      );
      if (ok) made += 1;
    } else {
      const answer = 5 * b;
      const ok = add(
        {
          id: `bulk-im-rep-${made + 1}`,
          courseName: MATH,
          prompt: `${b} + ${b} + ${b} + ${b} + ${b} toplamının sonucu kaçtır?`,
          answer: String(answer),
          distractors: uniqueNumbers(answer, [4 * b, 6 * b, b + 5, answer + 5]),
          explanation: `${b} sayısı beş kez toplanır: 5 × ${b} = ${answer}.`,
          difficulty: difficultyAt(made),
        },
        TOPIC_MULT,
      );
      if (ok) made += 1;
    }
  }
}

/* ---------------------------------------------------------------- */
/* Türkçe veri tabloları                                             */
/* ---------------------------------------------------------------- */

const ANTONYM_PAIRS: Array<[string, string]> = [
  ['büyük', 'küçük'],
  ['uzun', 'kısa'],
  ['sıcak', 'soğuk'],
  ['açık', 'kapalı'],
  ['hızlı', 'yavaş'],
  ['temiz', 'kirli'],
  ['kolay', 'zor'],
  ['erken', 'geç'],
  ['ağır', 'hafif'],
  ['yukarı', 'aşağı'],
  ['ileri', 'geri'],
  ['doğru', 'yanlış'],
  ['güzel', 'çirkin'],
  ['zengin', 'yoksul'],
  ['genç', 'yaşlı'],
  ['ıslak', 'kuru'],
  ['kalın', 'ince'],
  ['derin', 'sığ'],
  ['ucuz', 'pahalı'],
  ['az', 'çok'],
  ['boş', 'dolu'],
  ['aydınlık', 'karanlık'],
  ['sessiz', 'gürültülü'],
  ['mutlu', 'üzgün'],
  ['cesur', 'korkak'],
  ['dost', 'düşman'],
  ['içeri', 'dışarı'],
  ['sabah', 'akşam'],
  ['başlangıç', 'son'],
  ['tatlı', 'acı'],
  ['sert', 'yumuşak'],
  ['dar', 'geniş'],
  ['alçak', 'yüksek'],
  ['yakın', 'uzak'],
  ['taze', 'bayat'],
  ['giriş', 'çıkış'],
  ['gece', 'gündüz'],
  ['yeni', 'eski'],
  ['önce', 'sonra'],
  ['gülmek', 'ağlamak'],
  ['almak', 'vermek'],
  ['başlamak', 'bitirmek'],
];

const SYNONYM_PAIRS: Array<[string, string]> = [
  ['konut', 'ev'],
  ['hekim', 'doktor'],
  ['talebe', 'öğrenci'],
  ['sürat', 'hız'],
  ['beyaz', 'ak'],
  ['siyah', 'kara'],
  ['hediye', 'armağan'],
  ['yürek', 'kalp'],
  ['akıl', 'us'],
  ['hatıra', 'anı'],
  ['vatan', 'yurt'],
  ['millet', 'ulus'],
  ['cevap', 'yanıt'],
  ['fakir', 'yoksul'],
  ['sene', 'yıl'],
  ['asır', 'yüzyıl'],
  ['imkân', 'olanak'],
  ['kent', 'şehir'],
  ['güç', 'kuvvet'],
  ['cesaret', 'yiğitlik'],
  ['doğa', 'tabiat'],
  ['kıymet', 'değer'],
  ['sorun', 'mesele'],
  ['anlam', 'mana'],
  ['fayda', 'yarar'],
  ['görev', 'vazife'],
  ['özlem', 'hasret'],
  ['konuk', 'misafir'],
  ['kıyafet', 'giysi'],
  ['yöntem', 'usul'],
  ['önder', 'lider'],
  ['temel', 'esas'],
];

const IDIOMS: Array<[string, string]> = [
  ['eli açık', 'cömert'],
  ['gözü kara', 'cesur'],
  ['ağzı açık kalmak', 'çok şaşırmak'],
  ['göz atmak', 'kısaca bakmak'],
  ['can kulağıyla dinlemek', 'dikkatle dinlemek'],
  ['eli kulağında', 'çok yakında gerçekleşecek'],
  ['burnu büyümek', 'kibirlenmek'],
  ['ağzı kulaklarına varmak', 'çok sevinmek'],
  ['gözü yolda kalmak', 'gelmesini beklemek'],
  ['kulak kabartmak', 'duymaya çalışmak'],
  ['parmak ısırtmak', 'hayran bırakmak'],
  ['dil dökmek', 'ikna etmeye çalışmak'],
  ['eli boş dönmek', 'bir şey alamadan dönmek'],
  ['gözden kaybolmak', 'görünmez olmak'],
  ['sırt çevirmek', 'ilgiyi kesmek'],
  ['kafa yormak', 'çok düşünmek'],
  ['ağzından baklayı çıkarmak', 'sakladığı şeyi söylemek'],
  ['iğne ipliğe dönmek', 'çok zayıflamak'],
  ['burnundan solumak', 'çok sinirlenmek'],
  ['dili varmamak', 'söylemeye çekinmek'],
  ['yüreği ağzına gelmek', 'çok korkmak'],
  ['aklına yatmak', 'mantıklı bulmak'],
  ['göz kulak olmak', 'dikkat edip kollamak'],
  ['içi rahatlamak', 'kaygısı bitmek'],
  ['gözüne uyku girmemek', 'uyuyamamak'],
  ['el üstünde tutmak', 'çok değer vermek'],
  ['canı sıkılmak', 'huzursuz olmak'],
  ['kulağına küpe olmak', 'ders almak'],
  ['aklı başından gitmek', 'şaşkına dönmek'],
  ['dizlerinin bağı çözülmek', 'çok yorulmak'],
  ['yüzü kızarmak', 'utanmak'],
  ['ağzı dili bağlanmak', 'heyecandan konuşamamak'],
  ['burnunun dikine gitmek', 'kendi bildiğini yapmak'],
];

const PROVERBS: Array<[string, string]> = [
  ['Damlaya damlaya göl olur.', 'Azar azar biriken şeyler zamanla çoğalır.'],
  ['Ağaç yaşken eğilir.', 'Alışkanlıklar küçük yaşta kolayca kazanılır.'],
  ['Bir elin nesi var, iki elin sesi var.', 'Birlikte çalışanlar daha çok iş başarır.'],
  ['Sabreden derviş muradına ermiş.', 'Beklemeyi bilen sonunda istediğine ulaşır.'],
  ['Dost kara günde belli olur.', 'Gerçek dost zor günde yanında olandır.'],
  ['Yuvarlanan taş yosun tutmaz.', 'Sık sık yer değiştiren kişi kalıcı birikim yapamaz.'],
  ['Akıl yaşta değil baştadır.', 'Doğru düşünmek yaşla değil akılla olur.'],
  ['Tatlı dil yılanı deliğinden çıkarır.', 'Yumuşak sözle herkes ikna edilebilir.'],
  ['Ne ekersen onu biçersin.', 'Yaptığın davranışın karşılığını görürsün.'],
  ['Görünen köy kılavuz istemez.', 'Apaçık olan şey anlatılmadan anlaşılır.'],
  ['Sütten ağzı yanan yoğurdu üfleyerek yer.', 'Bir kez zarar gören sonra daha dikkatli davranır.'],
  ['İşleyen demir ışıldar.', 'Çalışan kişi bilgisini ve becerisini korur.'],
  ['Komşu komşunun külüne muhtaçtır.', 'İnsanlar birbirine yardım etmek zorundadır.'],
  ['Her koyun kendi bacağından asılır.', 'Herkes kendi davranışından sorumludur.'],
  ['Kedi uzanamadığı ciğere mundar der.', 'Elde edemediği şeyi kötüler.'],
  ['Acele işe şeytan karışır.', 'Acele edilen işte hata olur.'],
];

const WORD_SENTENCES: Array<[string, string]> = [
  ['bahçe', 'Bahçedeki güller sabah açtı.'],
  ['kitap', 'Kütüphaneden aldığım kitap çok akıcıydı.'],
  ['deniz', 'Deniz bugün çok sakin görünüyordu.'],
  ['bulut', 'Gökyüzündeki bulut yağmura dönüştü.'],
  ['kalem', 'Yeni kalemim yazarken elimi yormuyor.'],
  ['sokak', 'Sokak lambaları akşam yandı.'],
  ['öğretmen', 'Öğretmen tahtaya yeni bir soru yazdı.'],
  ['kedi', 'Kedi pencerenin önünde uyuyor.'],
  ['yağmur', 'Yağmur sabaha kadar dinmedi.'],
  ['tren', 'Tren istasyona tam saatinde geldi.'],
  ['çiçek', 'Çiçekleri her sabah sularım.'],
  ['masa', 'Masanın üstünde açık bir defter var.'],
  ['güneş', 'Güneş dağların ardından yükseldi.'],
  ['nehir', 'Nehir köyün ortasından geçiyor.'],
  ['rüzgar', 'Rüzgar ağaçların yapraklarını savurdu.'],
  ['defter', 'Defterime bugünkü dersi özetledim.'],
  ['kuş', 'Kuşlar kışın sıcak ülkelere gider.'],
  ['yol', 'Yolun kenarında sarı çiçekler var.'],
  ['kapı', 'Kapı gıcırdayınca herkes başını çevirdi.'],
  ['pencere', 'Pencereyi açınca oda serinledi.'],
  ['ayakkabı', 'Ayakkabımın bağcığı yolda çözüldü.'],
  ['şemsiye', 'Şemsiyesini unutunca yağmurda ıslandı.'],
  ['ekmek', 'Fırından sıcak ekmek aldık.'],
  ['süt', 'Sütü buz gibi içmeyi severim.'],
  ['köpek', 'Köpek bahçe kapısında bekliyor.'],
  ['ağaç', 'Ağaç bu yıl bol meyve verdi.'],
  ['okul', 'Okulun bahçesi sabah çok kalabalıktı.'],
  ['arkadaş', 'Arkadaşım bana kırmızı bir kalem verdi.'],
  ['gökyüzü', 'Gökyüzü akşamüstü turuncuya döndü.'],
  ['saat', 'Saat beşte buluşmaya karar verdik.'],
  ['tarla', 'Tarlada buğdaylar sararmaya başladı.'],
  ['çanta', 'Çantasını sıranın üstüne bıraktı.'],
];

const PROPER_NAMES = [
  'Ece',
  'Kerem',
  'Zeynep',
  'Ahmet',
  'Elif',
  'Mert',
  'Ankara',
  'İzmir',
  'Bursa',
  'Konya',
  'Türkiye',
  'Van',
  'Sakarya',
  'Pamukkale',
  'Kızılırmak',
  'Ağrı',
  'Fırat',
  'Ege',
  'Akdeniz',
  'Karadeniz',
  'Marmara',
  'Erciyes',
  'Sinop',
  'Antalya',
  'Kayseri',
  'Trabzon',
  'Edirne',
  'Rize',
  'Bolu',
  'Nevşehir',
];

const COMMON_NOUNS = [
  'masa',
  'kalem',
  'defter',
  'kapı',
  'pencere',
  'kitap',
  'çanta',
  'sandalye',
  'halı',
  'perde',
  'bardak',
  'tabak',
  'kaşık',
  'çatal',
  'yastık',
  'battaniye',
  'ayna',
  'lamba',
  'tablo',
  'vazo',
  'sürahi',
  'tencere',
  'sehpa',
  'dolap',
];

const LOWER_SENTENCES = [
  'bugün okula erken gittim.',
  'kardeşim bahçede oynuyor.',
  'akşam yemeği saat yedide hazır.',
  'bu kitabı kütüphaneden aldım.',
  'yağmur birden bastırdı.',
  'öğretmen sınıfa yeni bir harita astı.',
  'babam işten geç döndü.',
  'kedim pencerenin önünde uyuyor.',
  'pazartesi günü sınavımız var.',
  'arkadaşlarımla parka gittik.',
  'masanın üstünde bir mektup buldum.',
  'deniz bugün çok sakin.',
  'çiçekleri her sabah suluyorum.',
  'sabah kahvaltıda peynir yedim.',
  'otobüs durakta beş dakika bekledi.',
  'kütüphanede sessiz olmak gerekir.',
  'bisikletimin lastiği patladı.',
  'gökyüzü akşamüstü turuncuya döndü.',
  'annem bize kek yaptı.',
  'bu soruyu çözmek için biraz düşündüm.',
  'okulun bahçesinde top oynadık.',
  'kışın hava çok soğuk olur.',
  'defterime bugünkü dersi yazdım.',
  'sokakta sarı yapraklar birikmiş.',
  'teyzem bize misafirliğe geldi.',
  'rüzgar perdeleri havalandırdı.',
  'fırından sıcak ekmek aldık.',
  'kuşlar kışın sıcak ülkelere gider.',
];

const QUESTION_SENTENCES = [
  'Bu kitabı kim getirdi',
  'Saat kaçta buluşacağız',
  'Neden bu kadar geç kaldın',
  'Hangi yolu izlemeliyiz',
  'Sen de bizimle gelir misin',
  'Bu soruyu nasıl çözdün',
  'Kardeşin kaç yaşında',
  'Nerede oturuyorsunuz',
  'Yarın hava güzel olacak mı',
  'Çantanı neden unuttun',
  'Bunu bana kim söyledi',
  'Kaç tane kalem kaldı',
  'Ne zaman döneceksin',
];

const EXCLAIM_SENTENCES = [
  'Ne kadar güzel bir gün',
  'Aman dikkat et',
  'Bu ne büyük bir sürpriz',
  'Çok sevindim',
  'Yazık oldu',
  'Ne kadar hızlı koşuyor',
  'Eyvah anahtarı unuttum',
  'Harika bir haber bu',
  'Ne sıcak bir hava',
  'Aferin sana',
  'Çabuk buraya gel',
  'Bu ne güzel bir manzara',
  'Of çok yoruldum',
];

const STATEMENT_SENTENCES = [
  'Bugün hava çok güzel',
  'Kitabımı masaya bıraktım',
  'Yarın okula erken gideceğim',
  'Kardeşim topu bahçeye attı',
  'Annem akşam yemeği hazırladı',
  'Bu sabah erken kalktım',
  'Otobüs durakta durdu',
  'Öğretmen yeni bir konu anlattı',
  'Bahçedeki çiçekler açtı',
  'Kedim kanepede uyuyor',
  'Sınavımız pazartesi günü',
  'Arkadaşım bana kitap verdi',
  'Deniz bugün çok sakin',
  'Pencereden dışarı baktım',
  'Babam arabayı yıkadı',
  'Sokakta çocuklar oynuyor',
  'Tren istasyona geldi',
  'Dışarıda yağmur yağıyor',
  'Masayı birlikte kurduk',
  'Kütüphaneden kitap aldım',
  'Gökyüzünde bulutlar var',
  'Bugün ders çalıştım',
  'Sepette elmalar var',
  'Kardeşim resim çizdi',
  'Yolun sonunda bir fırın var',
  'Akşam erken yattım',
];

const WORDS = [
  'kitap',
  'kalem',
  'defter',
  'çanta',
  'masa',
  'sandalye',
  'pencere',
  'kelebek',
  'öğrenci',
  'öğretmen',
  'bilgisayar',
  'telefon',
  'şemsiye',
  'ayakkabı',
  'karpuz',
  'domates',
  'salatalık',
  'patates',
  'çiçek',
  'bulut',
  'deniz',
  'orman',
  'yıldız',
  'güneş',
  'köpek',
  'kedi',
  'balık',
  'tavşan',
  'kaplumbağa',
  'timsah',
  'aslan',
  'zürafa',
  'ekmek',
  'peynir',
  'zeytin',
  'çilek',
  'kiraz',
  'üzüm',
  'fındık',
  'ceviz',
];

type SubjectItem = { cumle: string; yapan: string; nesneler: string[] };

const SUBJECTS: SubjectItem[] = [
  { cumle: 'Ece kitabı okudu.', yapan: 'Ece', nesneler: ['kitabı'] },
  { cumle: 'Kerem topu bahçeye attı.', yapan: 'Kerem', nesneler: ['topu', 'bahçeye'] },
  { cumle: 'Zeynep çiçekleri suladı.', yapan: 'Zeynep', nesneler: ['çiçekleri'] },
  { cumle: 'Ahmet pencereyi açtı.', yapan: 'Ahmet', nesneler: ['pencereyi'] },
  { cumle: 'Elif defterine resim çizdi.', yapan: 'Elif', nesneler: ['defterine', 'resim'] },
  { cumle: 'Mert bisikleti tamir etti.', yapan: 'Mert', nesneler: ['bisikleti'] },
  { cumle: 'Ayşe sütü bardağa döktü.', yapan: 'Ayşe', nesneler: ['sütü', 'bardağa'] },
  { cumle: 'Can kapıyı yavaşça kapattı.', yapan: 'Can', nesneler: ['kapıyı'] },
  { cumle: 'Selin masayı sildi.', yapan: 'Selin', nesneler: ['masayı'] },
  { cumle: 'Burak çorbayı ısıttı.', yapan: 'Burak', nesneler: ['çorbayı'] },
  { cumle: 'Deniz bahçede top oynadı.', yapan: 'Deniz', nesneler: ['bahçede', 'top'] },
  { cumle: 'Efe çantasını okula götürdü.', yapan: 'Efe', nesneler: ['çantasını', 'okula'] },
  { cumle: 'İrem kuşlara yem verdi.', yapan: 'İrem', nesneler: ['kuşlara', 'yem'] },
  { cumle: 'Kaan radyoyu kapattı.', yapan: 'Kaan', nesneler: ['radyoyu'] },
  { cumle: 'Nazlı ödevini bitirdi.', yapan: 'Nazlı', nesneler: ['ödevini'] },
  { cumle: 'Ozan duvarı maviye boyadı.', yapan: 'Ozan', nesneler: ['duvarı'] },
  { cumle: 'Pınar kurabiye pişirdi.', yapan: 'Pınar', nesneler: ['kurabiye'] },
  { cumle: 'Serkan odasını topladı.', yapan: 'Serkan', nesneler: ['odasını'] },
  { cumle: 'Tuğba mektubu postaya verdi.', yapan: 'Tuğba', nesneler: ['mektubu', 'postaya'] },
  { cumle: 'Umut saati duvara astı.', yapan: 'Umut', nesneler: ['saati', 'duvara'] },
  { cumle: 'Yağmur saksıyı balkona taşıdı.', yapan: 'Yağmur', nesneler: ['saksıyı', 'balkona'] },
  { cumle: 'Berk halıyı süpürdü.', yapan: 'Berk', nesneler: ['halıyı'] },
  { cumle: 'Ceren limonatayı içti.', yapan: 'Ceren', nesneler: ['limonatayı'] },
  { cumle: 'Çağla perdeyi yıkadı.', yapan: 'Çağla', nesneler: ['perdeyi'] },
  { cumle: 'Doruk kovayı doldurdu.', yapan: 'Doruk', nesneler: ['kovayı'] },
  { cumle: 'Ebru tabloyu astı.', yapan: 'Ebru', nesneler: ['tabloyu'] },
  { cumle: 'Fırat odunları kırdı.', yapan: 'Fırat', nesneler: ['odunları'] },
  { cumle: 'Gizem sırayı temizledi.', yapan: 'Gizem', nesneler: ['sırayı'] },
  { cumle: 'Hakan arabayı yıkadı.', yapan: 'Hakan', nesneler: ['arabayı'] },
  { cumle: 'Işıl keki fırına koydu.', yapan: 'Işıl', nesneler: ['keki', 'fırına'] },
  { cumle: 'Jale bahçeyi suladı.', yapan: 'Jale', nesneler: ['bahçeyi'] },
  { cumle: 'Kutay balonu patlattı.', yapan: 'Kutay', nesneler: ['balonu'] },
  { cumle: 'Lale vitrini süsledi.', yapan: 'Lale', nesneler: ['vitrini'] },
  { cumle: 'Murat ayakkabısını bağladı.', yapan: 'Murat', nesneler: ['ayakkabısını'] },
  { cumle: 'Nihal çayı demledi.', yapan: 'Nihal', nesneler: ['çayı'] },
  { cumle: 'Onur tavanı onardı.', yapan: 'Onur', nesneler: ['tavanı'] },
  { cumle: 'Özge çiçeği vazoya koydu.', yapan: 'Özge', nesneler: ['çiçeği', 'vazoya'] },
  { cumle: 'Rana saçını taradı.', yapan: 'Rana', nesneler: ['saçını'] },
  { cumle: 'Sinan bisikletiyle gezdi.', yapan: 'Sinan', nesneler: ['bisikletiyle'] },
  { cumle: 'Şule defterini kapladı.', yapan: 'Şule', nesneler: ['defterini'] },
];

/* ---------------------------------------------------------------- */
/* Türkçe üreticiler                                                 */
/* ---------------------------------------------------------------- */

const TOPIC_WORD_MEANING = 'Sözcükte Anlam';
const TOPIC_NOUNS = 'Adlar';
const TOPIC_SUBJECT = 'Cümlede Yapan Kişi';

const VOWELS = 'aeıioöuü';

function vowelCount(word: string): number {
  let count = 0;
  for (const letter of word.toLocaleLowerCase('tr-TR')) {
    if (VOWELS.includes(letter)) count += 1;
  }
  return count;
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toLocaleUpperCase('tr-TR') + text.slice(1);
}

function genAntonym(count: number) {
  const chosen = shuffle(ANTONYM_PAIRS).slice(0, count);
  const pool = ANTONYM_PAIRS.flat();
  chosen.forEach(([word, antonym], index) => {
    const candidates = shuffle(pool.filter((item) => item !== word && item !== antonym));
    const prompt =
      index % 2 === 0
        ? `“${word}” sözcüğünün zıt anlamlısı hangisidir?`
        : `“${word}” kelimesinin karşıt anlamı hangi seçenekte verilmiştir?`;
    add(
      {
        id: `bulk-it-ant-${index + 1}`,
        courseName: TURKCE,
        prompt,
        answer: antonym,
        distractors: uniqueOptions(antonym, candidates),
        explanation: `“${word}” ile “${antonym}” anlamca birbirinin karşıtıdır; biri varken diğeri olamaz.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_WORD_MEANING,
    );
  });
}

function genSynonym(count: number) {
  const chosen = shuffle(SYNONYM_PAIRS).slice(0, count);
  const pool = SYNONYM_PAIRS.flat();
  chosen.forEach(([word, synonym], index) => {
    const candidates = shuffle(pool.filter((item) => item !== word && item !== synonym));
    const prompt =
      index % 2 === 0
        ? `“${word}” sözcüğünün eş anlamlısı hangisidir?`
        : `“${word}” kelimesiyle aynı anlama gelen sözcük hangi seçenektedir?`;
    add(
      {
        id: `bulk-it-syn-${index + 1}`,
        courseName: TURKCE,
        prompt,
        answer: synonym,
        distractors: uniqueOptions(synonym, candidates),
        explanation: `“${word}” ve “${synonym}” aynı anlamı taşıdığı için eş anlamlıdır.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_WORD_MEANING,
    );
  });
}

function genIdiom(count: number) {
  const chosen = shuffle(IDIOMS).slice(0, count);
  const meanings = IDIOMS.map(([, anlam]) => anlam);
  chosen.forEach(([deyim, anlam], index) => {
    const prompt =
      index % 2 === 0
        ? `“${deyim}” deyiminin anlamı hangi seçenekte doğru verilmiştir?`
        : `“${deyim}” sözüyle anlatılmak istenen nedir?`;
    add(
      {
        id: `bulk-it-dey-${index + 1}`,
        courseName: TURKCE,
        prompt,
        answer: anlam,
        distractors: uniqueOptions(anlam, shuffle(meanings)),
        explanation: `“${deyim}” deyimi “${anlam}” anlamına gelir; cümlede bu anlamda kullanılır.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_WORD_MEANING,
    );
  });
}

function genWordSentence(count: number) {
  const chosen = shuffle(WORD_SENTENCES).slice(0, count);
  const allSentences = WORD_SENTENCES.map(([, sentence]) => sentence);
  chosen.forEach(([word, sentence], index) => {
    const candidates = shuffle(
      allSentences.filter(
        (item) => item !== sentence && !item.toLocaleLowerCase('tr-TR').includes(word.toLocaleLowerCase('tr-TR')),
      ),
    );
    const prompt =
      index % 2 === 0
        ? `“${word}” sözcüğünün geçtiği cümle hangisidir?`
        : `Aşağıdaki cümlelerden hangisinde “${word}” kelimesi kullanılmıştır?`;
    add(
      {
        id: `bulk-it-sen-${index + 1}`,
        courseName: TURKCE,
        prompt,
        answer: sentence,
        distractors: uniqueOptions(sentence, candidates),
        explanation: `“${sentence}” cümlesinde “${word}” sözcüğü yer alır; diğer seçeneklerde bu sözcük geçmez.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_WORD_MEANING,
    );
  });
}

function genProverb(count: number) {
  const chosen = shuffle(PROVERBS).slice(0, count);
  const meanings = PROVERBS.map(([, anlam]) => anlam);
  chosen.forEach(([soz, anlam], index) => {
    add(
      {
        id: `bulk-it-ata-${index + 1}`,
        courseName: TURKCE,
        prompt: `“${soz}” atasözünün anlamı hangi seçenekte verilmiştir?`,
        answer: anlam,
        distractors: uniqueOptions(anlam, shuffle(meanings)),
        explanation: `“${soz}” atasözü “${anlam}” düşüncesini anlatmak için kullanılır.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_WORD_MEANING,
    );
  });
}

function genProperNoun(count: number) {
  const proper = shuffle(PROPER_NAMES);
  const common = shuffle(COMMON_NOUNS);
  let properIndex = 0;
  let commonIndex = 0;
  for (let index = 0; index < count; index += 1) {
    const askProper = index % 2 === 0;
    const target = askProper
      ? proper[properIndex++ % proper.length]
      : common[commonIndex++ % common.length];
    const pool = askProper ? common : proper;
    const offset = (index * 5) % pool.length;
    const others = [pool[offset], pool[(offset + 7) % pool.length], pool[(offset + 13) % pool.length]];
    add(
      {
        id: `bulk-it-ad-${index + 1}`,
        courseName: TURKCE,
        prompt: askProper
          ? 'Aşağıdaki sözcüklerden hangisi özel addır?'
          : 'Aşağıdaki sözcüklerden hangisi tür adıdır?',
        answer: target,
        distractors: uniqueOptions(target, others),
        explanation: askProper
          ? `“${target}” tek bir varlığa verilmiş özel addır; diğer seçenekler aynı türden birçok varlığa verilen tür adlarıdır.`
          : `“${target}” aynı türden birçok varlığa verilen tür adıdır; diğer seçenekler tek bir varlığa verilen özel adlardır.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_NOUNS,
    );
  }
}

function genCapital(count: number) {
  const chosen = shuffle(LOWER_SENTENCES).slice(0, count);
  chosen.forEach((base, index) => {
    const words = base.split(' ');
    const correct = capitalizeFirst(base);
    const second = [words[0], capitalizeFirst(words[1]), ...words.slice(2)].join(' ');
    const third = [words[0], words[1], capitalizeFirst(words[2]), ...words.slice(3)].join(' ');
    add(
      {
        id: `bulk-it-buy-${index + 1}`,
        courseName: TURKCE,
        prompt: `“${base}” cümlesinin büyük harf kuralına uygun yazımı hangisidir?`,
        answer: correct,
        distractors: uniqueOptions(correct, [second, third, base]),
        explanation: `Cümle büyük harfle başlar: “${correct}” yazımı doğrudur; öteki seçeneklerde cümle ortasındaki sözcükler büyük harfle yazılmıştır.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_NOUNS,
    );
  });
}

function genPunctuation(count: number) {
  const questionCount = Math.ceil(count / 2);
  const exclaimCount = count - questionCount;
  const questionsPool = shuffle(QUESTION_SENTENCES);
  const exclaimPool = shuffle(EXCLAIM_SENTENCES);
  for (let index = 0; index < count; index += 1) {
    const askQuestion = index < questionCount;
    const target = askQuestion ? questionsPool[index] : exclaimPool[index - questionCount];
    const others = shuffle(STATEMENT_SENTENCES).slice(0, 3);
    add(
      {
        id: `bulk-it-nok-${index + 1}`,
        courseName: TURKCE,
        prompt: askQuestion
          ? 'Aşağıdaki cümlelerden hangisinin sonuna soru işareti (?) konulmalıdır?'
          : 'Aşağıdaki cümlelerden hangisinin sonuna ünlem işareti (!) konulmalıdır?',
        answer: target,
        distractors: uniqueOptions(target, others),
        explanation: askQuestion
          ? `“${target}” cümlesi soru anlamı taşıdığı için sonuna “?” konur; öteki cümleler haber cümlesidir.`
          : `“${target}” cümlesi duygu bildirdiği için sonuna “!” konur; öteki cümleler haber cümlesidir.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_NOUNS,
    );
  }
}

function genSyllable(count: number) {
  const pool = shuffle(WORDS.filter((word) => vowelCount(word) >= 2));
  for (let index = 0; index < count; index += 1) {
    const word = pool[index];
    const answer = vowelCount(word);
    add(
      {
        id: `bulk-it-hec-${index + 1}`,
        courseName: TURKCE,
        prompt: index % 2 === 0 ? `“${word}” sözcüğü kaç hecelidir?` : `“${word}” kelimesi kaç heceden oluşur?`,
        answer: String(answer),
        distractors: uniqueNumbers(answer, [answer + 1, answer - 1, answer + 2, answer - 2]),
        explanation: `“${word}” sözcüğünde ${answer} ünlü harf vardır; her ünlü bir hece oluşturduğu için ${answer} hecedir.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_NOUNS,
    );
  }
}

function genVowelConsonant(count: number) {
  const pool = shuffle(WORDS);
  for (let index = 0; index < count; index += 1) {
    const word = pool[index];
    const vowels = vowelCount(word);
    const consonants = word.length - vowels;
    const askVowel = index % 2 === 0;
    const answer = askVowel ? vowels : consonants;
    add(
      {
        id: `bulk-it-hrf-${index + 1}`,
        courseName: TURKCE,
        prompt: askVowel
          ? `“${word}” sözcüğünde kaç ünlü harf vardır?`
          : `“${word}” sözcüğündeki ünsüz harf sayısı kaçtır?`,
        answer: String(answer),
        distractors: uniqueNumbers(answer, [answer + 1, answer - 1, answer + 2, vowels + consonants - answer]),
        explanation: `“${word}” sözcüğünde ${vowels} ünlü ve ${consonants} ünsüz harf bulunur.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_NOUNS,
    );
  }
}

function genSubject(count: number) {
  const combos: Array<{ item: SubjectItem; variant: number }> = [];
  for (const item of SUBJECTS) {
    for (let variant = 0; variant < 4; variant += 1) combos.push({ item, variant });
  }
  const chosen = shuffle(combos).slice(0, count);
  chosen.forEach(({ item, variant }, index) => {
    const prompts = [
      `“${item.cumle}” cümlesinde işi yapan kimdir?`,
      `“${item.cumle}” cümlesinde eylemi gerçekleştiren hangi seçenekte verilmiştir?`,
      `“${item.cumle}” cümlesinde “kim” sorusunun yanıtı hangisidir?`,
      `“${item.cumle}” cümlesinde işi yapan varlık hangisidir?`,
    ];
    const otherNames = shuffle(SUBJECTS.filter((entry) => entry.yapan !== item.yapan).map((entry) => entry.yapan));
    add(
      {
        id: `bulk-it-ypn-${index + 1}`,
        courseName: TURKCE,
        prompt: prompts[variant],
        answer: item.yapan,
        distractors: uniqueOptions(item.yapan, [...item.nesneler, ...otherNames]),
        explanation: `“${item.cumle}” cümlesinde işi yapan varlık “${item.yapan}” olur; “kim?” sorusu bu yanıtı verir.`,
        difficulty: difficultyAt(index),
      },
      TOPIC_SUBJECT,
    );
  });
}

/* ---------------------------------------------------------------- */
/* Üretim                                                            */
/* ---------------------------------------------------------------- */

genAdd(35);
genSub(35);
genMissingAddend(30);
genAddSubWord(25);
genTime(25);

genFraction(38);
genDecimal(28);
genMoney(28);
genOrdering(28);
genUnit(28);

genMultiply(40);
genDivide(35);
genRemainder(30);
genMultiplyWord(25);
genRepeatedAdd(20);

genAntonym(30);
genSynonym(30);
genIdiom(30);
genWordSentence(28);
genProverb(15);

genProperNoun(30);
genCapital(28);
genPunctuation(25);
genSyllable(25);
genVowelConsonant(25);

genSubject(134);

export { questions };

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'İlkokul::Matematik': {
    'Toplama ve Çıkarma': topicIds[TOPIC_ADD_SUB] ?? [],
    'Sayılar ve Kesirler': topicIds[TOPIC_NUMBERS] ?? [],
    'Çarpma Mantığı': topicIds[TOPIC_MULT] ?? [],
  },
  'İlkokul::Türkçe': {
    'Sözcükte Anlam': topicIds[TOPIC_WORD_MEANING] ?? [],
    'Adlar': topicIds[TOPIC_NOUNS] ?? [],
    'Cümlede Yapan Kişi': topicIds[TOPIC_SUBJECT] ?? [],
  },
};
