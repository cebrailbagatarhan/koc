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
const PHYS = 'Fizik';
const CHEM = 'Kimya';

const T_FORCE = 'Kuvvet ve Newton Yasaları';
const T_ENERGY = 'İş ve Enerji';
const T_MOTION = 'Hareket ve Sürat';
const T_ATOM = 'Atom Yapısı';
const T_ELEM = 'Elementler ve Periyodik Tablo';
const T_ACID = 'Asit, Baz ve pH';

const G = 10;

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
      courseName: draft.id.startsWith('bulk-lf') ? PHYS : CHEM,
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
  while (made < count && guard < count * 400) {
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

function texts(answer: string, candidates: string[]): string[] {
  const seen = new Set([answer]);
  const out: string[] = [];
  for (const text of candidates) {
    if (out.length === 3) break;
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  if (out.length < 3) throw new Error(`çeldirici yetersiz: ${answer}`);
  return out;
}

function otherNames(answer: string, pool: string[]): string[] {
  const out: string[] = [];
  for (const name of shuffle(pool)) {
    if (name === answer) continue;
    out.push(name);
    if (out.length === 3) break;
  }
  if (out.length < 3) throw new Error(`isim çeldiricisi yetersiz: ${answer}`);
  return out;
}

/* ---------------------------------------------------------------- */
/* Fizik: Kuvvet ve Newton Yasaları                                  */
/* ---------------------------------------------------------------- */

function genNetForce() {
  run(
    28,
    (i) => {
      const f1 = 5 * (3 + Math.floor(rnd() * 8));
      const f2 = 5 * (1 + Math.floor(rnd() * 8));
      const same = i % 2 === 0;
      const total = f1 + f2;
      const diff = Math.abs(f1 - f2);
      if (diff === 0) return null;
      const answer = same ? total : diff;
      const prompt = same
        ? i % 4 === 0
          ? `Sürtünmesiz yatay düzlemde duran bir cisme aynı yönde ${f1} N ve ${f2} N büyüklüğünde iki kuvvet uygulanıyor. Cisme etki eden net kuvvet kaç N’dur?`
          : `Bir cisme aynı doğrultuda ve aynı yönde ${f1} N ile ${f2} N büyüklüğünde kuvvetler etki ediyor. Net kuvvetin büyüklüğü kaç N’dur?`
        : i % 4 === 1
          ? `Bir cisme zıt yönlerde ${f1} N ve ${f2} N büyüklüğünde kuvvetler etki ediyor. Net kuvvetin büyüklüğü kaç N’dur?`
          : `Doğuya ${f1} N, batıya ${f2} N büyüklüğünde kuvvet uygulanan bir cismin üzerindeki net kuvvetin büyüklüğü kaç N’dur?`;
      const explanation = same
        ? `Aynı yöndeki kuvvetler toplanır: ${f1} + ${f2} = ${total} N.`
        : `Zıt yönlü kuvvetler çıkarılır: ${Math.max(f1, f2)} − ${Math.min(f1, f2)} = ${diff} N.`;
      return {
        id: `bulk-lf-net-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: texts(fmt(answer), [fmt(total), fmt(diff), fmt(f1), fmt(f2), fmt(total + 10)]),
        explanation,
        difficulty: difficultyAt(i),
      };
    },
    T_FORCE,
  );
}

function genFmaAccel() {
  run(
    28,
    (i) => {
      const a = 2 + Math.floor(rnd() * 7);
      const m = 2 + Math.floor(rnd() * 9);
      const f = m * a;
      const prompt =
        i % 2 === 0
          ? `Kütlesi ${m} kg olan bir cisme ${f} N büyüklüğünde net kuvvet etki ediyor. Cismin ivmesi kaç m/s² olur?`
          : `Sürtünmesiz yatay düzlemdeki ${m} kg kütleli cisme ${f} N net kuvvet uygulanıyor. Cismin kazandığı ivme kaç m/s²’dir?`;
      return {
        id: `bulk-lf-acc-${i + 1}`,
        prompt,
        answer: fmt(a),
        distractors: texts(fmt(a), [
          fmt(f + m),
          fmt(Math.abs(f - m)),
          fmt(f * m),
          fmt(f + m + a),
          fmt(a * 2 + 1),
        ]),
        explanation: `Newton’ın ikinci yasası F = m · a olduğundan a = F ÷ m = ${f} ÷ ${m} = ${a} m/s².`,
        difficulty: difficultyAt(i),
      };
    },
    T_FORCE,
  );
}

function genFmaForce() {
  run(
    26,
    (i) => {
      const m = 2 + Math.floor(rnd() * 9);
      const a = 2 + Math.floor(rnd() * 7);
      const f = m * a;
      const prompt =
        i % 2 === 0
          ? `Kütlesi ${m} kg olan bir cismin ivmesi ${a} m/s² ise cisme etki eden net kuvvet kaç N’dur?`
          : `${m} kg kütleli bir cisim ${a} m/s² ivme ile hareket ediyor. Cisme etki eden net kuvvet kaç N’dur?`;
      return {
        id: `bulk-lf-force-${i + 1}`,
        prompt,
        answer: fmt(f),
        distractors: texts(fmt(f), [fmt(m + a), fmt(m * a + m), fmt(Math.abs(m - a)), fmt(m * a + a)]),
        explanation: `Net kuvvet F = m · a = ${m} × ${a} = ${f} N.`,
        difficulty: difficultyAt(i),
      };
    },
    T_FORCE,
  );
}

function genFmaMass() {
  run(
    26,
    (i) => {
      const m = 2 + Math.floor(rnd() * 9);
      const a = 2 + Math.floor(rnd() * 7);
      const f = m * a;
      const prompt =
        i % 2 === 0
          ? `Etki eden net kuvvet ${f} N olduğunda ivmesi ${a} m/s² olan cismin kütlesi kaç kg’dır?`
          : `${f} N net kuvvetin etkisindeki bir cisim ${a} m/s² ivme kazanıyor. Cismin kütlesi kaç kg’dır?`;
      return {
        id: `bulk-lf-mass-${i + 1}`,
        prompt,
        answer: fmt(m),
        distractors: texts(fmt(m), [fmt(f * a), fmt(f + a), fmt(Math.abs(f - a)), fmt(f * a + a)]),
        explanation: `F = m · a eşitliğinden m = F ÷ a = ${f} ÷ ${a} = ${m} kg.`,
        difficulty: difficultyAt(i),
      };
    },
    T_FORCE,
  );
}

function genWeight() {
  run(
    25,
    (i) => {
      const m = 2 + Math.floor(rnd() * 19);
      const weight = m * G;
      if (i % 2 === 0) {
        const prompt =
          i % 4 === 0
            ? `Kütlesi ${m} kg olan bir cismin Dünya üzerindeki ağırlığı kaç N’dur? (g = 10 m/s²)`
            : `${m} kg kütleli bir cismin ağırlığı kaç N’dur? (g = 10 m/s²)`;
        return {
          id: `bulk-lf-weight-${i + 1}`,
          prompt,
          answer: fmt(weight),
          distractors: texts(fmt(weight), [fmt(m), fmt(m * 100), fmt(m / 10), fmt(weight + G)]),
          explanation: `Ağırlık kütle ile yer çekimi ivmesinin çarpımıdır: G = m · g = ${m} × 10 = ${weight} N.`,
          difficulty: difficultyAt(i),
        };
      }
      const prompt = `Ağırlığı ${weight} N olan bir cismin kütlesi kaç kg’dır? (g = 10 m/s²)`;
      return {
        id: `bulk-lf-weight-${i + 1}`,
        prompt,
        answer: fmt(m),
        distractors: texts(fmt(m), [fmt(weight), fmt(weight * 10), fmt(weight / 100), fmt(weight / 10 + 10)]),
        explanation: `G = m · g olduğundan m = G ÷ g = ${weight} ÷ 10 = ${m} kg.`,
        difficulty: difficultyAt(i),
      };
    },
    T_FORCE,
  );
}

/* ---------------------------------------------------------------- */
/* Fizik: İş ve Enerji                                               */
/* ---------------------------------------------------------------- */

function genWork() {
  run(
    30,
    (i) => {
      const f = 5 * (2 + Math.floor(rnd() * 8));
      const x = 2 * (1 + Math.floor(rnd() * 9));
      const w = f * x;
      const prompt =
        i % 2 === 0
          ? `Yatay düzlemde bir cisim, ${f} N büyüklüğündeki kuvvetle kuvvet yönünde ${x} m sürükleniyor. Bu kuvvetin yaptığı iş kaç J’dür?`
          : `${f} N’luk sabit bir kuvvet, cismi kendi yönünde ${x} m boyunca hareket ettiriyor. Kuvvetin yaptığı iş kaç J’dür?`;
      return {
        id: `bulk-lf-work-${i + 1}`,
        prompt,
        answer: fmt(w),
        distractors: texts(fmt(w), [fmt(f + x), fmt(w / 2), fmt(w + f), fmt(w - x)]),
        explanation: `İş, kuvvet ile yolun çarpımıdır: W = F · x = ${f} × ${x} = ${w} J.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ENERGY,
  );
}

function genKinetic() {
  run(
    28,
    (i) => {
      const m = 2 * (1 + Math.floor(rnd() * 5));
      const v = 2 * (1 + Math.floor(rnd() * 5));
      const ek = (m * v * v) / 2;
      const prompt =
        i % 2 === 0
          ? `Kütlesi ${m} kg olan bir cisim ${v} m/s süratle hareket ediyor. Cismin kinetik enerjisi kaç J’dür?`
          : `${m} kg kütleli bir araç ${v} m/s süratle giderken kaç J kinetik enerjiye sahiptir?`;
      return {
        id: `bulk-lf-kin-${i + 1}`,
        prompt,
        answer: fmt(ek),
        distractors: texts(fmt(ek), [fmt(m * v), fmt(m * v * v), fmt((m * v) / 2), fmt(m * v * v + m * v)]),
        explanation: `Kinetik enerji Ek = ½ · m · v² = ½ × ${m} × ${v}² = ${ek} J.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ENERGY,
  );
}

function genPotential() {
  run(
    27,
    (i) => {
      const m = 2 + Math.floor(rnd() * 9);
      const h = 2 + Math.floor(rnd() * 9);
      const ep = m * G * h;
      const prompt =
        i % 2 === 0
          ? `Kütlesi ${m} kg olan bir cisim yerden ${h} m yükseklikte duruyor. Cismin yer çekimi potansiyel enerjisi kaç J’dür? (g = 10 m/s²)`
          : `${m} kg kütleli bir cisim yerden ${h} m yükseğe çıkarılıyor. Kazandığı potansiyel enerji kaç J’dür? (g = 10 m/s²)`;
      return {
        id: `bulk-lf-pot-${i + 1}`,
        prompt,
        answer: fmt(ep),
        distractors: texts(fmt(ep), [fmt(m * h), fmt(m * 5 * h), fmt(m * 20 * h), fmt(m * h * 3)]),
        explanation: `Potansiyel enerji Ep = m · g · h = ${m} × 10 × ${h} = ${ep} J.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ENERGY,
  );
}

function genPower() {
  run(
    26,
    (i) => {
      const p = 20 + 10 * Math.floor(rnd() * 18);
      const t = 2 + Math.floor(rnd() * 9);
      const w = p * t;
      const prompt =
        i % 2 === 0
          ? `Bir makine ${t} saniyede ${w} J iş yapıyor. Bu makinenin gücü kaç W’dur?`
          : `${w} J’lük işi ${t} saniyede yapan bir motorun gücü kaç W’dur?`;
      return {
        id: `bulk-lf-power-${i + 1}`,
        prompt,
        answer: fmt(p),
        distractors: texts(fmt(p), [fmt(w * t), fmt(w + t), fmt(w / (2 * t)), fmt(p * 2)]),
        explanation: `Güç, birim zamanda yapılan iştir: P = W ÷ t = ${w} ÷ ${t} = ${p} W.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ENERGY,
  );
}

function genEnergyConservation() {
  run(
    22,
    (i) => {
      const m = 2 + Math.floor(rnd() * 9);
      const h = 2 + Math.floor(rnd() * 9);
      const ek = m * G * h;
      const prompt =
        i % 2 === 0
          ? `Sürtünmelerin önemsiz olduğu bir ortamda ${h} m yükseklikten serbest bırakılan ${m} kg kütleli cisim yere çarptığı anda kaç J kinetik enerjiye sahip olur? (g = 10 m/s²)`
          : `Hava direncinin yok sayıldığı ortamda ${m} kg kütleli bir taş ${h} m yükseklikten düşüyor. Taşın yere ulaştığı andaki kinetik enerjisi kaç J’dür? (g = 10 m/s²)`;
      return {
        id: `bulk-lf-cons-${i + 1}`,
        prompt,
        answer: fmt(ek),
        distractors: texts(fmt(ek), [fmt(m * h), fmt(m * 5 * h), fmt(m * 20 * h), fmt(m * h * 4)]),
        explanation: `Düşerken potansiyel enerji kinetik enerjiye dönüşür: Ek = m · g · h = ${m} × 10 × ${h} = ${ek} J.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ENERGY,
  );
}

/* ---------------------------------------------------------------- */
/* Fizik: Hareket ve Sürat                                           */
/* ---------------------------------------------------------------- */

function genSpeed() {
  run(
    28,
    (i) => {
      const v = 5 + Math.floor(rnd() * 21);
      const t = 2 + Math.floor(rnd() * 9);
      const x = v * t;
      const prompt =
        i % 2 === 0
          ? `Bir bisikletli ${x} metrelik yolu ${t} saniyede alıyor. Bisikletlinin sürati kaç m/s’dir?`
          : `${x} m’lik parkuru ${t} saniyede tamamlayan bir koşucunun sürati kaç m/s’dir?`;
      return {
        id: `bulk-lf-speed-${i + 1}`,
        prompt,
        answer: fmt(v),
        distractors: texts(fmt(v), [fmt(x * t), fmt(x + t), fmt(v / 2), fmt(x - t)]),
        explanation: `Sürat, alınan yolun zamana oranıdır: v = x ÷ t = ${x} ÷ ${t} = ${v} m/s.`,
        difficulty: difficultyAt(i),
      };
    },
    T_MOTION,
  );
}

function genDistance() {
  run(
    27,
    (i) => {
      const v = 5 + Math.floor(rnd() * 21);
      const t = 2 + Math.floor(rnd() * 11);
      const x = v * t;
      const prompt =
        i % 2 === 0
          ? `Sürati ${v} m/s olan bir araç ${t} saniyede kaç metre yol alır?`
          : `${v} m/s sabit süratle giden bir kamyon ${t} saniyede kaç metre ilerler?`;
      return {
        id: `bulk-lf-dist-${i + 1}`,
        prompt,
        answer: fmt(x),
        distractors: texts(fmt(x), [fmt(v + t), fmt(x * 2), fmt(x - v), fmt(v * t + t)]),
        explanation: `Yol = sürat × zaman: x = v · t = ${v} × ${t} = ${x} m.`,
        difficulty: difficultyAt(i),
      };
    },
    T_MOTION,
  );
}

function genTime() {
  run(
    26,
    (i) => {
      const v = 5 + Math.floor(rnd() * 16);
      const t = 3 + Math.floor(rnd() * 13);
      const x = v * t;
      const prompt =
        i % 2 === 0
          ? `Sürati ${v} m/s olan bir araç ${x} metrelik yolu kaç saniyede alır?`
          : `${v} m/s süratle giden bir otobüs ${x} m’lik mesafeyi kaç saniyede tamamlar?`;
      return {
        id: `bulk-lf-time-${i + 1}`,
        prompt,
        answer: fmt(t),
        distractors: texts(fmt(t), [fmt(x * v), fmt(x + v), fmt(t * 2), fmt(t + 1)]),
        explanation: `Zaman = yol ÷ sürat: t = x ÷ v = ${x} ÷ ${v} = ${t} s.`,
        difficulty: difficultyAt(i),
      };
    },
    T_MOTION,
  );
}

function genAverageSpeed() {
  run(
    27,
    (i) => {
      const v1 = 30 + 10 * Math.floor(rnd() * 10);
      const v2 = 30 + 10 * Math.floor(rnd() * 10);
      if (v1 === v2) return null;
      const t1 = 1;
      const t2 = 2;
      const x1 = v1 * t1;
      const x2 = v2 * t2;
      const totalPath = x1 + x2;
      const totalTime = t1 + t2;
      if (totalPath % totalTime !== 0) return null;
      const answer = totalPath / totalTime;
      const prompt =
        i % 3 === 0
          ? `Bir araç ilk ${x1} km’lik yolu ${t1} saatte, sonraki ${x2} km’lik yolu ${t2} saatte alıyor. Aracın yol boyunca ortalama sürati kaç km/sa’tir?`
          : i % 3 === 1
            ? `Bir otobüs güzergâhın ${x1} km’lik bölümünü ${t1} saatte, ${x2} km’lik bölümünü ${t2} saatte geçiyor. Otobüsün ortalama sürati kaç km/sa’tir?`
            : `Bir kamyon ${x1} km’yi ${t1} saatte, ardından ${x2} km’yi ${t2} saatte gidiyor. Kamyonun tüm yol için ortalama sürati kaç km/sa’tir?`;
      return {
        id: `bulk-lf-avg-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: texts(fmt(answer), [
          fmt((v1 + v2) / 2),
          fmt(v1),
          fmt(v2),
          fmt(totalPath / 2),
        ]),
        explanation: `Ortalama sürat toplam yolun toplam zamana oranıdır: (${x1} + ${x2}) ÷ ${totalTime} = ${answer} km/sa.`,
        difficulty: difficultyAt(i),
      };
    },
    T_MOTION,
  );
}

function genUnitConvert() {
  const values = [18, 36, 54, 72, 90, 108, 126, 144, 162, 180, 198, 216, 234];
  const used = new Set<string>();
  run(
    26,
    (i) => {
      const value = pick(values);
      const variant = i % 2;
      const key = `${value}-${variant}`;
      if (used.has(key)) return null;
      used.add(key);
      const answer = value / 3.6;
      const prompt =
        variant === 0
          ? `Sürati ${value} km/sa olan bir aracın sürati kaç m/s’dir?`
          : `Bir otobüs saatte ${value} km yol alıyor. Otobüsün sürati kaç m/s’dir?`;
      return {
        id: `bulk-lf-conv-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: texts(fmt(answer), [fmt(value * 3.6), fmt(value / 2), fmt(value / 10), fmt(value / 5)]),
        explanation: `km/sa değeri 3,6’ya bölünerek m/s bulunur: ${value} ÷ 3,6 = ${fmt(answer)} m/s.`,
        difficulty: difficultyAt(i),
      };
    },
    T_MOTION,
  );
}

/* ---------------------------------------------------------------- */
/* Kimya: Atom Yapısı                                                */
/* ---------------------------------------------------------------- */

function genProton() {
  run(
    30,
    (i) => {
      const z = 1 + Math.floor(rnd() * 20);
      const n = 1 + Math.floor(rnd() * 20);
      const a = z + n;
      const prompt =
        i % 2 === 0
          ? `Kütle numarası ${a}, nötron sayısı ${n} olan bir atomun proton sayısı kaçtır?`
          : `Bir atomun çekirdeğinde ${n} nötron vardır ve kütle numarası ${a}’dır. Bu atomun proton sayısı kaçtır?`;
      return {
        id: `bulk-lk-proton-${i + 1}`,
        prompt,
        answer: fmt(z),
        distractors: texts(fmt(z), [fmt(a + n), fmt(n), fmt(a), fmt(a + n + 1)]),
        explanation: `Kütle numarası proton ve nötron sayılarının toplamıdır: ${a} − ${n} = ${z} proton.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ATOM,
  );
}

function genNeutron() {
  run(
    30,
    (i) => {
      const z = 1 + Math.floor(rnd() * 20);
      const n = 1 + Math.floor(rnd() * 20);
      const a = z + n;
      const prompt =
        i % 2 === 0
          ? `Atom numarası ${z}, kütle numarası ${a} olan bir atomun nötron sayısı kaçtır?`
          : `Proton sayısı ${z} ve kütle numarası ${a} olan tanecikte kaç nötron bulunur?`;
      return {
        id: `bulk-lk-neutron-${i + 1}`,
        prompt,
        answer: fmt(n),
        distractors: texts(fmt(n), [fmt(a + z), fmt(z), fmt(a), fmt(a + z + 1)]),
        explanation: `Nötron sayısı = kütle numarası − proton sayısı = ${a} − ${z} = ${n}.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ATOM,
  );
}

function genElectron() {
  const charges = [2, 1, -1, -2];
  run(
    29,
    (i) => {
      const z = 3 + Math.floor(rnd() * 18);
      const charge = charges[i % charges.length];
      const electrons = z - charge;
      if (electrons < 1) return null;
      const chargeText = charge > 0 ? `+${charge}` : `−${Math.abs(charge)}`;
      const prompt =
        i % 2 === 0
          ? `Atom numarası ${z} olan bir iyonun yükü ${chargeText}’dir. Bu iyonun elektron sayısı kaçtır?`
          : `Proton sayısı ${z} olan bir tanecik ${chargeText} yüklü ise kaç elektronu vardır?`;
      const explanation =
        charge > 0
          ? `Pozitif yük elektron kaybı demektir: ${z} − ${charge} = ${electrons} elektron.`
          : `Negatif yük elektron kazancı demektir: ${z} + ${Math.abs(charge)} = ${electrons} elektron.`;
      return {
        id: `bulk-lk-electron-${i + 1}`,
        prompt,
        answer: fmt(electrons),
        distractors: texts(fmt(electrons), [
          fmt(z),
          fmt(z + charge),
          fmt(z + 2 * charge),
          fmt(z - 2 * charge),
        ]),
        explanation,
        difficulty: difficultyAt(i),
      };
    },
    T_ATOM,
  );
}

function genIsotope() {
  run(
    28,
    (i) => {
      const z = 3 + Math.floor(rnd() * 16);
      const n1 = 2 + Math.floor(rnd() * 6);
      const n2 = n1 + 1 + Math.floor(rnd() * 4);
      const a1 = z + n1;
      const a2 = z + n2;
      const total = n1 + n2;
      const prompt =
        i % 2 === 0
          ? `Bir elementin kütle numaraları ${a1} ve ${a2} olan iki izotopu vardır. Proton sayısı ${z} olduğuna göre bu izotopların nötron sayıları toplamı kaçtır?`
          : `Proton sayısı ${z} olan bir elementin ${a1} ve ${a2} kütle numaralı izotoplarındaki nötronların toplam sayısı kaçtır?`;
      return {
        id: `bulk-lk-isotope-${i + 1}`,
        prompt,
        answer: fmt(total),
        distractors: texts(fmt(total), [fmt(a1 + a2), fmt(a1 + a2 - z), fmt(a2 - a1), fmt(total + 1)]),
        explanation: `Nötronlar: (${a1} − ${z}) + (${a2} − ${z}) = ${n1} + ${n2} = ${total}.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ATOM,
  );
}

/* ---------------------------------------------------------------- */
/* Kimya: Elementler ve Periyodik Tablo                              */
/* ---------------------------------------------------------------- */

type Element = {
  sym: string;
  name: string;
  z: number;
  period: number;
  group: number;
  cls: string;
};

const ELEMENTS: Element[] = [
  { sym: 'H', name: 'Hidrojen', z: 1, period: 1, group: 1, cls: 'Ametal' },
  { sym: 'He', name: 'Helyum', z: 2, period: 1, group: 18, cls: 'Soy gaz' },
  { sym: 'Li', name: 'Lityum', z: 3, period: 2, group: 1, cls: 'Metal' },
  { sym: 'Be', name: 'Berilyum', z: 4, period: 2, group: 2, cls: 'Metal' },
  { sym: 'B', name: 'Bor', z: 5, period: 2, group: 13, cls: 'Yarı metal' },
  { sym: 'C', name: 'Karbon', z: 6, period: 2, group: 14, cls: 'Ametal' },
  { sym: 'N', name: 'Azot', z: 7, period: 2, group: 15, cls: 'Ametal' },
  { sym: 'O', name: 'Oksijen', z: 8, period: 2, group: 16, cls: 'Ametal' },
  { sym: 'F', name: 'Flor', z: 9, period: 2, group: 17, cls: 'Ametal' },
  { sym: 'Ne', name: 'Neon', z: 10, period: 2, group: 18, cls: 'Soy gaz' },
  { sym: 'Na', name: 'Sodyum', z: 11, period: 3, group: 1, cls: 'Metal' },
  { sym: 'Mg', name: 'Magnezyum', z: 12, period: 3, group: 2, cls: 'Metal' },
  { sym: 'Al', name: 'Alüminyum', z: 13, period: 3, group: 13, cls: 'Metal' },
  { sym: 'Si', name: 'Silisyum', z: 14, period: 3, group: 14, cls: 'Yarı metal' },
  { sym: 'P', name: 'Fosfor', z: 15, period: 3, group: 15, cls: 'Ametal' },
  { sym: 'S', name: 'Kükürt', z: 16, period: 3, group: 16, cls: 'Ametal' },
  { sym: 'Cl', name: 'Klor', z: 17, period: 3, group: 17, cls: 'Ametal' },
  { sym: 'Ar', name: 'Argon', z: 18, period: 3, group: 18, cls: 'Soy gaz' },
  { sym: 'K', name: 'Potasyum', z: 19, period: 4, group: 1, cls: 'Metal' },
  { sym: 'Ca', name: 'Kalsiyum', z: 20, period: 4, group: 2, cls: 'Metal' },
  { sym: 'Ti', name: 'Titanyum', z: 22, period: 4, group: 4, cls: 'Metal' },
  { sym: 'Cr', name: 'Krom', z: 24, period: 4, group: 6, cls: 'Metal' },
  { sym: 'Mn', name: 'Manganez', z: 25, period: 4, group: 7, cls: 'Metal' },
  { sym: 'Fe', name: 'Demir', z: 26, period: 4, group: 8, cls: 'Metal' },
  { sym: 'Ni', name: 'Nikel', z: 28, period: 4, group: 10, cls: 'Metal' },
  { sym: 'Cu', name: 'Bakır', z: 29, period: 4, group: 11, cls: 'Metal' },
  { sym: 'Zn', name: 'Çinko', z: 30, period: 4, group: 12, cls: 'Metal' },
  { sym: 'Br', name: 'Brom', z: 35, period: 4, group: 17, cls: 'Ametal' },
  { sym: 'Kr', name: 'Kripton', z: 36, period: 4, group: 18, cls: 'Soy gaz' },
  { sym: 'Ag', name: 'Gümüş', z: 47, period: 5, group: 11, cls: 'Metal' },
  { sym: 'Sn', name: 'Kalay', z: 50, period: 5, group: 14, cls: 'Metal' },
  { sym: 'I', name: 'İyot', z: 53, period: 5, group: 17, cls: 'Ametal' },
  { sym: 'Xe', name: 'Ksenon', z: 54, period: 5, group: 18, cls: 'Soy gaz' },
  { sym: 'Ba', name: 'Baryum', z: 56, period: 6, group: 2, cls: 'Metal' },
  { sym: 'Au', name: 'Altın', z: 79, period: 6, group: 11, cls: 'Metal' },
  { sym: 'Hg', name: 'Cıva', z: 80, period: 6, group: 12, cls: 'Metal' },
  { sym: 'Pb', name: 'Kurşun', z: 82, period: 6, group: 14, cls: 'Metal' },
];

const MAIN_GROUPS = [1, 2, 13, 14, 15, 16, 17, 18];

function genSymbolName() {
  const used = new Set<string>();
  run(
    30,
    (i) => {
      const element = pick(ELEMENTS);
      if (used.has(element.name)) return null;
      used.add(element.name);
      const prompt =
        i % 2 === 0
          ? `Sembolü ${element.sym} olan elementin adı nedir?`
          : `Periyodik tabloda ${element.sym} sembolüyle gösterilen element hangisidir?`;
      return {
        id: `bulk-lk-symbol-${i + 1}`,
        prompt,
        answer: element.name,
        distractors: otherNames(element.name, ELEMENTS.map((item) => item.name)),
        explanation: `${element.sym} sembolü ${element.name} elementine aittir; atom numarası ${element.z}’dir.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ELEM,
  );
}

function genPeriod() {
  const used = new Set<string>();
  run(
    32,
    (i) => {
      const element = pick(ELEMENTS);
      if (used.has(element.name)) return null;
      used.add(element.name);
      const prompt =
        i % 2 === 0
          ? `${element.name} elementi periyodik tabloda kaçıncı periyotta yer alır?`
          : `Atom numarası ${element.z} olan ${element.name} elementi hangi periyotta bulunur?`;
      const answer = `${element.period}. periyot`;
      return {
        id: `bulk-lk-period-${i + 1}`,
        prompt,
        answer,
        distractors: texts(answer, [1, 2, 3, 4, 5, 6].map((value) => `${value}. periyot`)),
        explanation: `Atom numarası ${element.z} olan ${element.name} elementi ${element.period}. periyotta yer alır.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ELEM,
  );
}

function genGroup() {
  const mainGroup = ELEMENTS.filter((element) => MAIN_GROUPS.includes(element.group));
  const used = new Set<string>();
  run(
    26,
    (i) => {
      const element = pick(mainGroup);
      if (used.has(element.name)) return null;
      used.add(element.name);
      const prompt =
        i % 2 === 0
          ? `${element.name} elementi periyodik tabloda hangi grupta yer alır?`
          : `${element.sym} sembollü element periyodik tablonun hangi grubundadır?`;
      const answer = `${element.group}. grup`;
      return {
        id: `bulk-lk-group-${i + 1}`,
        prompt,
        answer,
        distractors: texts(answer, MAIN_GROUPS.map((value) => `${value}. grup`)),
        explanation: `${element.name} elementinin atom numarası ${element.z} olup ${element.group}. grupta bulunur.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ELEM,
  );
}

function genElementClass() {
  const used = new Set<string>();
  run(
    29,
    (i) => {
      const element = pick(ELEMENTS);
      if (used.has(element.name)) return null;
      used.add(element.name);
      const prompt =
        i % 2 === 0
          ? `${element.name} elementi hangi sınıfa girer?`
          : `${element.sym} sembolüyle gösterilen element hangi gruptandır?`;
      return {
        id: `bulk-lk-class-${i + 1}`,
        prompt,
        answer: element.cls,
        distractors: texts(element.cls, ['Metal', 'Ametal', 'Soy gaz', 'Yarı metal']),
        explanation: `${element.name} elementi periyodik tabloda ${element.cls.toLowerCase()} olarak sınıflandırılır.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ELEM,
  );
}

/* ---------------------------------------------------------------- */
/* Kimya: Asit, Baz ve pH                                            */
/* ---------------------------------------------------------------- */

const POW = ['', '10⁻¹', '10⁻²', '10⁻³', '10⁻⁴', '10⁻⁵'];
const CONC = [0, 0.1, 0.01, 0.001, 0.0001, 0.00001];

function genPhAcid() {
  const acids = ['HCl', 'HNO3', 'HBr', 'HClO4'];
  const used = new Set<string>();
  run(
    16,
    (i) => {
      const acid = pick(acids);
      const n = 1 + Math.floor(rnd() * 4);
      const key = `${acid}-${n}`;
      if (used.has(key)) return null;
      used.add(key);
      const prompt =
        i % 2 === 0
          ? `${fmt(CONC[n])} M ${acid} çözeltisinin pH değeri kaçtır?`
          : `${fmt(CONC[n])} mol/L ${acid} çözeltisinde pH kaç olur?`;
      return {
        id: `bulk-lk-phacid-${i + 1}`,
        prompt,
        answer: fmt(n),
        distractors: texts(fmt(n), [fmt(14 - n), fmt(n + 7), fmt(7 - n), fmt(n + 1)]),
        explanation: `${acid} kuvvetli asittir ve tam iyonlaşır; H⁺ derişimi ${POW[n]} M olur. pH = ${n}.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ACID,
  );
}

function genPhBase() {
  const bases = ['NaOH', 'KOH', 'LiOH'];
  const used = new Set<string>();
  run(
    15,
    (i) => {
      const base = pick(bases);
      const n = 1 + Math.floor(rnd() * 5);
      const key = `${base}-${n}`;
      if (used.has(key)) return null;
      used.add(key);
      const prompt =
        i % 2 === 0
          ? `${fmt(CONC[n])} M ${base} çözeltisinin pH değeri kaçtır?`
          : `${fmt(CONC[n])} mol/L ${base} çözeltisinde pH kaç olur?`;
      const answer = 14 - n;
      return {
        id: `bulk-lk-phbase-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: texts(fmt(answer), [fmt(n), fmt(14 + n), fmt(n + 7), fmt(7 - n)]),
        explanation: `${base} kuvvetli bazdır; OH⁻ derişimi ${POW[n]} M olduğundan pOH = ${n}, pH = 14 − ${n} = ${answer}.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ACID,
  );
}

function genPhClassify() {
  const acidText = 'Asidiktir ve turnusolü kırmızıya çevirir';
  const baseText = 'Baziktir ve turnusolü maviye çevirir';
  const neutralText = 'Nötrdür ve turnusolün rengini değiştirmez';
  const extraText = 'Baziktir ve fenolftaleini renksiz bırakır';
  const used = new Set<string>();
  run(
    22,
    (i) => {
      const p = 1 + Math.floor(rnd() * 13);
      const variant = i % 2;
      const key = `${p}-${variant}`;
      if (used.has(key)) return null;
      used.add(key);
      const answer = p < 7 ? acidText : p > 7 ? baseText : neutralText;
      const prompt =
        variant === 0
          ? `pH değeri ${p} olan bir çözelti için aşağıdakilerden hangisi doğrudur?`
          : `Oda sıcaklığında pH değeri ${p} olarak ölçülen bir çözelti için hangisi doğrudur?`;
      const explanation =
        p < 7
          ? `pH = ${p} değeri 7’den küçüktür; çözelti asidiktir ve turnusolü kırmızıya çevirir.`
          : p > 7
            ? `pH = ${p} değeri 7’den büyüktür; çözelti baziktir ve turnusolü maviye çevirir.`
            : `pH = 7 olduğundan çözelti nötrdür ve turnusolün rengini değiştirmez.`;
      return {
        id: `bulk-lk-phclass-${i + 1}`,
        prompt,
        answer,
        distractors: [acidText, baseText, neutralText, extraText].filter((text) => text !== answer).slice(0, 3),
        explanation,
        difficulty: difficultyAt(i),
      };
    },
    T_ACID,
  );
}

function genNeutralize() {
  const acids = [
    { formula: 'HCl', h: 1 },
    { formula: 'HNO3', h: 1 },
    { formula: 'H2SO4', h: 2 },
    { formula: 'H3PO4', h: 3 },
  ];
  const bases = [
    { formula: 'NaOH', o: 1 },
    { formula: 'KOH', o: 1 },
    { formula: 'Ca(OH)2', o: 2 },
    { formula: 'Ba(OH)2', o: 2 },
  ];
  const moles = [0.1, 0.2, 0.3, 0.4, 0.5];
  run(
    23,
    (i) => {
      const acid = pick(acids);
      const base = pick(bases);
      const amount = pick(moles);
      const answer = (amount * acid.h) / base.o;
      const prompt =
        i % 2 === 0
          ? `${fmt(amount)} mol ${acid.formula} çözeltisini tam olarak nötrleştirmek için kaç mol ${base.formula} gerekir?`
          : `${fmt(amount)} mol ${acid.formula} ile tam nötrleşecek ${base.formula} miktarı kaç moldür?`;
      return {
        id: `bulk-lk-neutral-${i + 1}`,
        prompt,
        answer: fmt(answer),
        distractors: texts(fmt(answer), [
          fmt(amount * acid.h),
          fmt(amount / base.o),
          fmt(amount * base.o),
          fmt(amount * 2),
          fmt(amount * 3),
          fmt(amount / 2),
          fmt(amount / 3),
          fmt(amount + 0.1),
        ]),
        explanation: `${acid.formula} ${acid.h} H⁺, ${base.formula} ${base.o} OH⁻ verir. Gerekli mol = ${fmt(amount)} × ${acid.h} ÷ ${base.o} = ${fmt(answer)} mol.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ACID,
  );
}

function genIndicator() {
  const table = [
    { name: 'Turnusol', medium: 'asidik', color: 'Kırmızı' },
    { name: 'Turnusol', medium: 'bazik', color: 'Mavi' },
    { name: 'Turnusol', medium: 'nötr', color: 'Mor' },
    { name: 'Fenolftalein', medium: 'asidik', color: 'Renksiz' },
    { name: 'Fenolftalein', medium: 'bazik', color: 'Pembe' },
    { name: 'Fenolftalein', medium: 'nötr', color: 'Renksiz' },
    { name: 'Metil oranj', medium: 'asidik', color: 'Kırmızı' },
    { name: 'Metil oranj', medium: 'bazik', color: 'Sarı' },
    { name: 'Metil oranj', medium: 'nötr', color: 'Turuncu' },
    { name: 'Bromtimol mavisi', medium: 'asidik', color: 'Sarı' },
    { name: 'Bromtimol mavisi', medium: 'bazik', color: 'Mavi' },
    { name: 'Bromtimol mavisi', medium: 'nötr', color: 'Yeşil' },
  ];
  const colors = ['Kırmızı', 'Mavi', 'Pembe', 'Sarı', 'Renksiz', 'Mor', 'Yeşil', 'Turuncu'];
  const used = new Set<string>();
  run(
    20,
    (i) => {
      const row = pick(table);
      const variant = i % 3;
      const key = `${row.name}-${row.medium}-${variant}`;
      if (used.has(key)) return null;
      used.add(key);
      const prompt =
        variant === 0
          ? `${row.name} indikatörü ${row.medium} ortamda hangi rengi alır?`
          : variant === 1
            ? `${row.medium} bir çözeltiye damlatılan ${row.name} indikatörü hangi rengi verir?`
            : `${row.name} indikatörünün ${row.medium} ortamdaki rengi nedir?`;
      return {
        id: `bulk-lk-ind-${i + 1}`,
        prompt,
        answer: row.color,
        distractors: otherNames(row.color, colors),
        explanation: `${row.name} indikatörü ${row.medium} ortamda ${row.color.toLowerCase()} rengi verir.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ACID,
  );
}

function genAcidBaseMatch() {
  const table = [
    { formula: 'HCl', cls: 'Asit' },
    { formula: 'H2SO4', cls: 'Asit' },
    { formula: 'HNO3', cls: 'Asit' },
    { formula: 'H3PO4', cls: 'Asit' },
    { formula: 'CH3COOH', cls: 'Asit' },
    { formula: 'H2CO3', cls: 'Asit' },
    { formula: 'HBr', cls: 'Asit' },
    { formula: 'HF', cls: 'Asit' },
    { formula: 'NaOH', cls: 'Baz' },
    { formula: 'KOH', cls: 'Baz' },
    { formula: 'Ca(OH)2', cls: 'Baz' },
    { formula: 'NH3', cls: 'Baz' },
    { formula: 'Mg(OH)2', cls: 'Baz' },
    { formula: 'Al(OH)3', cls: 'Baz' },
    { formula: 'Ba(OH)2', cls: 'Baz' },
    { formula: 'NaCl', cls: 'Tuz' },
    { formula: 'CaCO3', cls: 'Tuz' },
    { formula: 'KNO3', cls: 'Tuz' },
    { formula: 'NH4Cl', cls: 'Tuz' },
    { formula: 'CaO', cls: 'Oksit' },
  ];
  const used = new Set<string>();
  run(
    20,
    (i) => {
      const row = pick(table);
      if (used.has(row.formula)) return null;
      used.add(row.formula);
      const prompt =
        i % 2 === 0
          ? `${row.formula} bileşiği hangi sınıfa girer?`
          : `Formülü ${row.formula} olan bileşik hangi gruptandır?`;
      return {
        id: `bulk-lk-match-${i + 1}`,
        prompt,
        answer: row.cls,
        distractors: texts(row.cls, ['Asit', 'Baz', 'Tuz', 'Oksit']),
        explanation: `${row.formula} bileşiği ${row.cls.toLowerCase()} sınıfında yer alır.`,
        difficulty: difficultyAt(i),
      };
    },
    T_ACID,
  );
}

/* ---------------------------------------------------------------- */
/* Üretim                                                            */
/* ---------------------------------------------------------------- */

genNetForce();
genFmaAccel();
genFmaForce();
genFmaMass();
genWeight();

genWork();
genKinetic();
genPotential();
genPower();
genEnergyConservation();

genSpeed();
genDistance();
genTime();
genAverageSpeed();
genUnitConvert();

genProton();
genNeutron();
genElectron();
genIsotope();

genSymbolName();
genPeriod();
genGroup();
genElementClass();

genPhAcid();
genPhBase();
genPhClassify();
genNeutralize();
genIndicator();
genAcidBaseMatch();

export { questions };

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'Lise::Fizik': {
    [T_FORCE]: topicIds[T_FORCE] ?? [],
    [T_ENERGY]: topicIds[T_ENERGY] ?? [],
    [T_MOTION]: topicIds[T_MOTION] ?? [],
  },
  'Lise::Kimya': {
    [T_ATOM]: topicIds[T_ATOM] ?? [],
    [T_ELEM]: topicIds[T_ELEM] ?? [],
    [T_ACID]: topicIds[T_ACID] ?? [],
  },
};
