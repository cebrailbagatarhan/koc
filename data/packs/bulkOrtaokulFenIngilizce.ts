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
/* Ortak altyapı                                                     */
/* ---------------------------------------------------------------- */

const LEVEL = 'Ortaokul';
const FEN = 'Fen Bilimleri';
const ING = 'İngilizce';

const T_ISI = 'Madde ve Isı';
const T_FOT = 'Fotosentez ve Canlılar';
const T_KUV = 'Kuvvet';
const T_SP = 'Simple Present';
const T_FREQ = 'Frequency Words';
const T_Q = 'Question Forms';

const bank: EmbeddedQuestionSeed[] = [];
const buckets: Record<string, Record<string, string[]>> = {};
const counters: Record<string, number> = {};
const usedPrompts = new Set<string>();

type Draft = {
  prompt: string;
  answer: string;
  distractors: string[];
  explanation: string;
};

function difficultyAt(index: number): QuestionDifficulty {
  const slot = index % 10;
  if (slot < 3) return 'easy';
  if (slot < 8) return 'standard';
  return 'hard';
}

function add(course: string, topic: string, slug: string, draft: Draft, index: number) {
  if (usedPrompts.has(draft.prompt)) throw new Error(`Tekrar eden soru: ${slug}-${index + 1}`);
  usedPrompts.add(draft.prompt);
  const options = [draft.answer, ...draft.distractors];
  if (options.length !== 4 || new Set(options).size !== 4) {
    throw new Error(`Seçenek hatası: ${slug}-${index + 1}`);
  }
  counters[slug] = (counters[slug] ?? 0) + 1;
  const prefix = course === FEN ? 'of' : 'oi';
  const id = `bulk-${prefix}-${slug}-${counters[slug]}`;
  bank.push(
    mc({
      id,
      levelName: LEVEL,
      courseName: course,
      prompt: draft.prompt,
      answer: draft.answer,
      distractors: draft.distractors,
      explanation: draft.explanation,
      difficulty: difficultyAt(index),
    }),
  );
  const byCourse = (buckets[`${LEVEL}::${course}`] ??= {});
  (byCourse[topic] ??= []).push(id);
}

function emit(config: {
  course: string;
  topic: string;
  slug: string;
  count: number;
  make: (index: number) => Draft;
}) {
  for (let index = 0; index < config.count; index += 1) {
    add(config.course, config.topic, config.slug, config.make(index), index);
  }
}

function fmt(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace('.', ',');
}

function nums(answer: number, candidates: number[]): string[] {
  const seen = new Set([fmt(answer)]);
  const out: string[] = [];
  for (const value of candidates) {
    if (out.length === 3) break;
    if (!Number.isFinite(value)) continue;
    const text = fmt(value);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  if (out.length < 3) throw new Error(`Çeldirici yetersiz: ${answer}`);
  return out;
}

function cap(text: string): string {
  return text.charAt(0).toLocaleUpperCase('en-US') + text.slice(1);
}

function lower(text: string): string {
  return text.toLocaleLowerCase('tr-TR');
}

function others(list: string[], answer: string, count = 3): string[] {
  return list.filter((item) => item !== answer).slice(0, count);
}

/* ---------------------------------------------------------------- */
/* Fen 1: Madde ve Isı · Hâl değişimi                                */
/* ---------------------------------------------------------------- */

const HAL_TERMS = ['Erime', 'Donma', 'Buharlaşma', 'Yoğuşma', 'Süblimleşme', 'Kırağılaşma'];

const HAL_REASON: Record<string, string> = {
  Erime: 'katı hâlden sıvı hâle geçer',
  Donma: 'sıvı hâlden katı hâle geçer',
  Buharlaşma: 'sıvı hâlden gaz hâline geçer',
  Yoğuşma: 'gaz hâlden sıvı hâle geçer',
  Süblimleşme: 'katı hâlden doğrudan gaz hâline geçer',
  Kırağılaşma: 'gaz hâlden doğrudan katı hâle geçer',
};

const HAL_ROWS: Array<[string, string]> = [
  ['Buzun oda sıcaklığında suya dönüşmesi', 'Erime'],
  ['Suyun buzdolabında buz hâline gelmesi', 'Donma'],
  ['Islanan çamaşırın kuruması', 'Buharlaşma'],
  ['Kışın pencere camında su damlacıklarının oluşması', 'Yoğuşma'],
  ['Naftalinin dolapta doğrudan gaz hâline geçmesi', 'Süblimleşme'],
  ['Soğuk havada su buharının doğrudan buz kristaline dönüşmesi', 'Kırağılaşma'],
  ['Çaydanlıktaki suyun kaynayarak buhar olması', 'Buharlaşma'],
  ['Buzdolabından çıkarılan şişenin yüzeyinde su birikmesi', 'Yoğuşma'],
  ['Eritilen çikolatanın sıvı hâle gelmesi', 'Erime'],
  ['Suyun dondurucuda katılaşması', 'Donma'],
  ['Açık kaptaki kolonyanın zamanla azalması', 'Buharlaşma'],
  ['Sabah çimenlerin üzerinde çiy damlacıklarının oluşması', 'Yoğuşma'],
  ['Kuru buzun oda sıcaklığında gaz hâline geçmesi', 'Süblimleşme'],
  ['Karlı havada su buharının buz kristalleri hâlinde birikmesi', 'Kırağılaşma'],
  ['Sıcak tavadaki tereyağının erimesi', 'Erime'],
  ['Buz kalıbındaki suyun donması', 'Donma'],
  ['Islak saçın zamanla kuruması', 'Buharlaşma'],
];

emit({
  course: FEN,
  topic: T_ISI,
  slug: 'hal',
  count: 34,
  make: (index) => {
    const row = HAL_ROWS[index % HAL_ROWS.length];
    const round = Math.floor(index / HAL_ROWS.length);
    const stems = [
      `“${row[0]}” olayında gerçekleşen hâl değişimi hangisidir?`,
      `“${row[0]}” olayı hangi hâl değişimine örnektir?`,
    ];
    const answer = row[1];
    const start = HAL_TERMS.indexOf(answer);
    return {
      prompt: stems[round % stems.length],
      answer,
      distractors: [1, 2, 3].map((step) => HAL_TERMS[(start + step) % HAL_TERMS.length]),
      explanation: `${row[0]} olayında madde ${HAL_REASON[answer]}; bu nedenle olay ${lower(answer)} olarak adlandırılır.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 2: Madde ve Isı · Kaynama ve donma noktası                    */
/* ---------------------------------------------------------------- */

emit({
  course: FEN,
  topic: T_ISI,
  slug: 'kay',
  count: 34,
  make: (index) => {
    const low = -20 + index;
    const high = 60 + 2 * index;
    const branch = index % 3;
    let temp: number;
    if (branch === 0) temp = low - 4 - (index % 6);
    else if (branch === 1) temp = Math.round((low + high) / 2);
    else temp = high + 5 + (index % 8);
    const state = temp < low ? 'Katı' : temp < high ? 'Sıvı' : 'Gaz';
    const states = ['Katı', 'Sıvı', 'Gaz'];
    return {
      prompt: `Donma noktası ${low} °C, kaynama noktası ${high} °C olan bir madde ${temp} °C'de hangi hâlde bulunur?`,
      answer: state,
      distractors: [...others(states, state), 'Plazma'],
      explanation: `${temp} °C, donma noktası ${low} °C'nin ${temp < low ? 'altında' : 'üstünde'}, kaynama noktası ${high} °C'nin ${temp < high ? 'altında' : 'üstünde'} kaldığı için madde ${lower(state)} hâldedir.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 3: Madde ve Isı · Isı ve sıcaklık farkı                       */
/* ---------------------------------------------------------------- */

emit({
  course: FEN,
  topic: T_ISI,
  slug: 'isi',
  count: 33,
  make: (index) => {
    const first = index % 30 === 0 ? 5 : -10 + (index % 30);
    const second = first + 6 + (index % 11);
    const answer = second - first;
    return {
      prompt: `Bir maddenin sıcaklığı ${first} °C'den ${second} °C'ye yükselmiştir. Bu maddenin sıcaklığı kaç °C artmıştır?`,
      answer: fmt(answer),
      distractors: nums(answer, [first + second, second, answer + 10, answer + 5, answer - 5]),
      explanation: `Sıcaklık artışı son sıcaklıktan ilk sıcaklığın çıkarılmasıyla bulunur: ${second} − (${first}) = ${answer} °C.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 4: Madde ve Isı · Genleşme ve büzülme                         */
/* ---------------------------------------------------------------- */

const GEN_ROWS: Array<[string, string]> = [
  ['Yazın elektrik tellerinin sarkması', 'Genleşme'],
  ['Kışın elektrik tellerinin gerginleşmesi', 'Büzülme'],
  ['Sıcak çay konulan ince cam bardağın çatlaması', 'Genleşme'],
  ['Tren rayları arasında boşluk bırakılması', 'Genleşme'],
  ['Köprü ek yerlerinde boşluk bırakılması', 'Genleşme'],
  ['Sıcak günde araba lastiğindeki hava basıncının artması', 'Genleşme'],
  ['Sıkışan metal kavanoz kapağının sıcak suya batırılınca açılması', 'Genleşme'],
  ['Soğutulan metal bilyenin çapının küçülmesi', 'Büzülme'],
  ['Termometredeki sıvının sıcakta yükselmesi', 'Genleşme'],
  ['Kışın iyice gerginleşen telefon telinin kopması', 'Büzülme'],
  ['Yazın asfalt yolda dalgalanma oluşması', 'Genleşme'],
  ['Sıcak havayla şişen balonun büyümesi', 'Genleşme'],
  ['Soğukta lastiğin hava basıncının düşmesi', 'Büzülme'],
  ['Sıcak suya konulan metal kaşığın sapının uzaması', 'Genleşme'],
  ['Kışın çamaşır ipinin kısalması', 'Büzülme'],
  ['Yazın ahşap kapı ve pencerelerin sıkışması', 'Genleşme'],
  ['Soğutulan balonun küçülmesi', 'Büzülme'],
];

emit({
  course: FEN,
  topic: T_ISI,
  slug: 'gen',
  count: 33,
  make: (index) => {
    const row = GEN_ROWS[index % GEN_ROWS.length];
    const round = Math.floor(index / GEN_ROWS.length);
    const stems = [
      `“${row[0]}” olayında madde hangi davranışı gösterir?`,
      `“${row[0]}” durumunun nedeni aşağıdakilerden hangisidir?`,
    ];
    return {
      prompt: stems[round % stems.length],
      answer: row[1],
      distractors: ['Genleşme', 'Büzülme', 'Erime', 'Donma'].filter((item) => item !== row[1]),
      explanation: `${row[0]} sırasında madde ${row[1] === 'Genleşme' ? 'ısı alır, tanecikleri arasındaki uzaklık artar ve hacmi büyür' : 'ısı verir, tanecikleri birbirine yaklaşır ve hacmi küçülür'}; bu nedenle olay ${lower(row[1])} olarak adlandırılır.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 5: Fotosentez ve Canlılar · Girdi ve çıktı                    */
/* ---------------------------------------------------------------- */

const FOT_TERMS = ['Işık', 'Karbondioksit', 'Su', 'Oksijen', 'Glikoz', 'Klorofil'];

const FOT_ROLE: Record<string, string> = {
  Işık: 'ışık enerjisi olmadan klorofil besin üretemez',
  Karbondioksit: 'karbondioksit fotosentezin karbon kaynağıdır',
  Su: 'su fotosentezde hidrojen kaynağı olarak kullanılır',
  Oksijen: 'oksijen fotosentez sonucunda açığa çıkan gazdır',
  Glikoz: 'glikoz fotosentezle üretilen besindir',
  Klorofil: 'klorofil ışık enerjisini soğuran yeşil pigmenttir',
};

const FOT_ROWS: Array<[string, string]> = [
  ['Işık almayan yaprağın nişasta üretmemesi', 'Işık'],
  ['Kapalı kaptaki bitkinin ortamdaki karbondioksiti azaltması', 'Karbondioksit'],
  ['Sulanmayan bitkinin yapraklarının solması', 'Su'],
  ['Güneş altındaki su bitkisinden oksijen kabarcıklarının çıkması', 'Oksijen'],
  ['Yaprağın yeşil rengiyle güneş ışığını soğurması', 'Klorofil'],
  ['Bitkinin güneş altında glikoz üretmesi', 'Glikoz'],
  ['Işık şiddeti artırılan bitkide oksijen çıkışının hızlanması', 'Işık'],
  ['Karbondioksit verilen ortamda fotosentezin hızlanması', 'Karbondioksit'],
  ['Toprağı kuru bırakılan bitkide fotosentezin durması', 'Su'],
  ['Karanlık ortamdaki bitkinin oksijen vermemesi', 'Işık'],
  ['Yapraktaki klorofil azaldıkça fotosentezin yavaşlaması', 'Klorofil'],
  ['Su bitkisinin bulunduğu kaba karbondioksit eklenince kabarcık sayısının artması', 'Karbondioksit'],
  ['Öğleden sonra yaprakta nişasta birikmesi', 'Glikoz'],
  ['Sulama yapıldıktan sonra solmuş yaprakların canlanması', 'Su'],
  ['Güneş görmeyen bodrumdaki bitkinin sararması', 'Işık'],
  ['Yaprak alt yüzeyindeki gözeneklerden oksijen çıkışı', 'Oksijen'],
  ['Bitkinin ürettiği besini kökünde depolaması', 'Glikoz'],
];

emit({
  course: FEN,
  topic: T_FOT,
  slug: 'fot',
  count: 34,
  make: (index) => {
    const row = FOT_ROWS[index % FOT_ROWS.length];
    const round = Math.floor(index / FOT_ROWS.length);
    const stems = [
      `“${row[0]}” gözlemi fotosentez için hangisinin gerekli olduğunu gösterir?`,
      `Bir öğrenci “${row[0]}” gözlemini yapmıştır. Bu gözlem hangi faktörle ilgilidir?`,
    ];
    return {
      prompt: stems[round % stems.length],
      answer: row[1],
      distractors: others(FOT_TERMS, row[1]),
      explanation: `${row[0]} gözlemi ${lower(row[1])} faktörünü öne çıkarır; çünkü ${FOT_ROLE[row[1]]}.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 6: Fotosentez ve Canlılar · Solunum karşılaştırması           */
/* ---------------------------------------------------------------- */

const SOL_TERMS = ['Fotosentez', 'Solunum', 'Hem fotosentez hem solunum', 'İkisi de değil'];

const SOL_NOTE: Record<string, string> = {
  Fotosentez: 'bitki klorofil ve ışık yardımıyla karbondioksit ve sudan glikoz üretir, oksijen açığa çıkarır',
  Solunum: 'canlı hücreler glikozu oksijenle parçalayarak enerji elde eder, karbondioksit ve su açığa çıkarır',
  'Hem fotosentez hem solunum': 'bitkilerde iki olay da aynı hücrede gerçekleşir, ancak girdileri ve çıktıları farklıdır',
  'İkisi de değil': 'bu olay ne fotosentezin ne solunumun özelliğidir',
};

const SOL_ROWS: Array<[string, string]> = [
  ['Karbondioksit kullanılır', 'Fotosentez'],
  ['Oksijen kullanılır', 'Solunum'],
  ['Glikoz üretilir', 'Fotosentez'],
  ['Glikoz parçalanır', 'Solunum'],
  ['Klorofil görev alır', 'Fotosentez'],
  ['Mitokondride gerçekleşir', 'Solunum'],
  ['Kloroplastta gerçekleşir', 'Fotosentez'],
  ['Işık enerjisi kimyasal enerjiye dönüştürülür', 'Fotosentez'],
  ['Besindeki enerji açığa çıkar', 'Solunum'],
  ['Oksijen açığa çıkar', 'Fotosentez'],
  ['Karbondioksit açığa çıkar', 'Solunum'],
  ['Su kullanılır', 'Fotosentez'],
  ['Tüm canlılarda görülür', 'Solunum'],
  ['Bitkilerde gündüz gerçekleşir', 'Hem fotosentez hem solunum'],
  ['Hücrede gerçekleşir', 'Hem fotosentez hem solunum'],
  ['Canlılarda enerji dönüşümü sağlar', 'Hem fotosentez hem solunum'],
  ['Sindirim enzimleriyle besin parçalanması', 'İkisi de değil'],
];

emit({
  course: FEN,
  topic: T_FOT,
  slug: 'sol',
  count: 33,
  make: (index) => {
    const row = SOL_ROWS[index % SOL_ROWS.length];
    const round = Math.floor(index / SOL_ROWS.length);
    const stems = [
      `“${row[0]}” bilgisi hangi olayla ilgilidir?`,
      `“${row[0]}” özelliği hangi olaya aittir?`,
    ];
    return {
      prompt: stems[round % stems.length],
      answer: row[1],
      distractors: others(SOL_TERMS, row[1]),
      explanation: `${row[0]} özelliği ${lower(row[1])} ile açıklanır; ${SOL_NOTE[row[1]]}.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 7: Fotosentez ve Canlılar · Besin zinciri                     */
/* ---------------------------------------------------------------- */

const ZINCIR_ROWS: string[][] = [
  ['ot', 'tavşan', 'tilki', 'kartal'],
  ['buğday', 'fare', 'yılan', 'şahin'],
  ['yosun', 'su piresi', 'balık', 'balıkçıl'],
  ['çimen', 'çekirge', 'kurbağa', 'yılan'],
  ['mısır', 'tırtıl', 'serçe', 'atmaca'],
  ['alg', 'midye', 'yengeç', 'martı'],
  ['meşe', 'sincap', 'sansar', 'baykuş'],
  ['pirinç', 'çekirge', 'kertenkele', 'yılan'],
  ['çiçek', 'arı', 'örümcek', 'kuş'],
  ['deniz yosunu', 'karides', 'sardalya', 'yunus'],
  ['buğday', 'cırcır böceği', 'kır faresi', 'tilki'],
  ['çam', 'sinek', 'örümcek', 'sığırcık'],
  ['su yosunu', 'salyangoz', 'balık', 'fok'],
  ['yonca', 'arı', 'kurbağa', 'yılan'],
  ['kavak', 'tırtıl', 'sığırcık', 'atmaca'],
  ['plankton', 'hamsi', 'uskumru', 'yunus'],
  ['ot', 'keçi', 'kurt', 'kartal'],
];

emit({
  course: FEN,
  topic: T_FOT,
  slug: 'zincir',
  count: 33,
  make: (index) => {
    const chain = ZINCIR_ROWS[index % ZINCIR_ROWS.length];
    const round = Math.floor(index / ZINCIR_ROWS.length);
    const text = chain.join(' → ');
    const producer = round % 2 === 0;
    const answer = producer ? chain[0] : chain[1];
    const stems = producer
      ? [`“${text}” besin zincirinde üretici canlı hangisidir?`, `“${text}” zincirinde besin üreten ilk halka hangisidir?`]
      : [`“${text}” besin zincirinde birincil tüketici hangisidir?`, `“${text}” zincirinde üreticiden hemen sonra gelen canlı hangisidir?`];
    return {
      prompt: stems[round % 2],
      answer,
      distractors: chain.filter((item) => item !== answer).slice(0, 3),
      explanation: producer
        ? `${text} zincirinde kendi besinini üreten canlı ${chain[0]} olduğu için üretici odur; diğerleri besinini hazır alır.`
        : `${text} zincirinde üretici ${chain[0]}, ondan beslenen ilk canlı ise ${chain[1]} olduğu için birincil tüketici ${chain[1]} olur.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 8: Fotosentez ve Canlılar · Canlı grupları                    */
/* ---------------------------------------------------------------- */

const GRUP_TERMS = ['Bitki', 'Hayvan', 'Mantar', 'Bakteri'];

const GRUP_NOTE: Record<string, string> = {
  Bitki: 'kendi besinini fotosentezle üreten çok hücreli bir canlı',
  Hayvan: 'besinini hazır alan ve genellikle hareket edebilen çok hücreli bir canlı',
  Mantar: 'besinini hazır alan, klorofili bulunmayan bir canlı',
  Bakteri: 'çekirdeği olmayan tek hücreli bir canlı',
};

const GRUP_ROWS: Array<[string, string]> = [
  ['meşe ağacı', 'Bitki'],
  ['karayosunu', 'Bitki'],
  ['eğrelti otu', 'Bitki'],
  ['buğday', 'Bitki'],
  ['lale', 'Bitki'],
  ['çam ağacı', 'Bitki'],
  ['kaktüs', 'Bitki'],
  ['şapkalı mantar', 'Mantar'],
  ['maya mantarı', 'Mantar'],
  ['küf mantarı', 'Mantar'],
  ['yarasa', 'Hayvan'],
  ['yunus', 'Hayvan'],
  ['kurbağa', 'Hayvan'],
  ['deniz yıldızı', 'Hayvan'],
  ['toprak solucanı', 'Hayvan'],
  ['yoğurt bakterisi', 'Bakteri'],
  ['süt asidi bakterisi', 'Bakteri'],
];

emit({
  course: FEN,
  topic: T_FOT,
  slug: 'canli',
  count: 33,
  make: (index) => {
    const row = GRUP_ROWS[index % GRUP_ROWS.length];
    const round = Math.floor(index / GRUP_ROWS.length);
    const stems = [
      `“${row[0]}” hangi canlı grubunda yer alır?`,
      `“${row[0]}” canlısı aşağıdaki gruplardan hangisine aittir?`,
    ];
    return {
      prompt: stems[round % stems.length],
      answer: row[1],
      distractors: others(GRUP_TERMS, row[1]),
      explanation: `${row[0]} ${GRUP_NOTE[row[1]]} olduğu için ${lower(row[1])} grubunda değerlendirilir.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 9: Kuvvet · Kuvvet birimi ve ölçümü                           */
/* ---------------------------------------------------------------- */

const BOLME_DEGERLERI = [0.5, 1, 2, 2.5, 3, 4, 5];

emit({
  course: FEN,
  topic: T_KUV,
  slug: 'birim',
  count: 27,
  make: (index) => {
    const step = BOLME_DEGERLERI[index % BOLME_DEGERLERI.length];
    const count = 4 + (index % 9);
    const answer = step * count;
    return {
      prompt: `Bir dinamometrede her bölme ${fmt(step)} N'yi göstermektedir. Dinamometre ${count} bölme uzadığına göre ölçülen kuvvet kaç N'dir?`,
      answer: fmt(answer),
      distractors: nums(answer, [step * (count + 1), step * (count - 1), step * (count + 2), count + step, 2 * answer]),
      explanation: `Kuvvet, bölme değeri ile bölme sayısının çarpımıdır: ${fmt(step)} × ${count} = ${fmt(answer)} N. Kuvvetin birimi Newton'dur.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 10: Kuvvet · Net kuvvet                                       */
/* ---------------------------------------------------------------- */

emit({
  course: FEN,
  topic: T_KUV,
  slug: 'net',
  count: 27,
  make: (index) => {
    if (index < 14) {
      const a = 6 + ((index * 3) % 30);
      const b = 3 + ((index * 5) % 20);
      const answer = a + b;
      return {
        prompt: `Aynı doğrultuda ve aynı yönde ${a} N ile ${b} N'luk kuvvetlerin etkisi altındaki cismin net kuvveti kaç N'dir?`,
        answer: fmt(answer),
        distractors: nums(answer, [a - b, b, a, answer + 4, a * b]),
        explanation: `Aynı yöndeki kuvvetler toplanır: ${a} + ${b} = ${answer} N. Net kuvvet cismi bu yönde hareket ettirir.`,
      };
    }
    const a = 24 + ((index * 5) % 50);
    const b = 4 + ((index * 3) % 18);
    const answer = Math.abs(a - b);
    return {
      prompt: `Aynı doğrultuda ve zıt yönde ${a} N ile ${b} N'luk kuvvetlerin etkisi altındaki cismin net kuvveti kaç N'dir?`,
      answer: fmt(answer),
      distractors: nums(answer, [a + b, a, b, answer + 3]),
      explanation: `Zıt yöndeki kuvvetler çıkarılır: ${a} − ${b} = ${answer} N. Net kuvvet büyük kuvvetin yönündedir.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 11: Kuvvet · Sürtünme kuvveti                                 */
/* ---------------------------------------------------------------- */

const SURT_TERMS = ['Artar', 'Azalır', 'Değişmez', 'Sıfır olur'];

const SURT_ROWS: Array<[string, string]> = [
  ['Yüzeyin pürüzlü hâle getirilmesi', 'Artar'],
  ['Yüzeyin yağlanması', 'Azalır'],
  ['Cismin üzerine ek yük konması', 'Artar'],
  ['Buzlu zeminde yürünmesi', 'Azalır'],
  ['Tekerlere kış lastiği takılması', 'Artar'],
  ['Kapı menteşesinin yağlanması', 'Azalır'],
  ['Kızağın altına mum sürülmesi', 'Azalır'],
  ['Kamyona yük yüklenmesi', 'Artar'],
  ['Makine parçaları arasına rulman konması', 'Azalır'],
  ['Taşın zımpara kâğıdıyla pürüzlendirilmesi', 'Artar'],
  ['Temas eden yüzey alanının büyütülmesi', 'Değişmez'],
  ['Yüzeye talaş serpilmesi', 'Artar'],
  ['Islak zeminde yürünmesi', 'Azalır'],
];

emit({
  course: FEN,
  topic: T_KUV,
  slug: 'surt',
  count: 26,
  make: (index) => {
    const row = SURT_ROWS[index % SURT_ROWS.length];
    const round = Math.floor(index / SURT_ROWS.length);
    const stems = [
      `“${row[0]}” durumunda iki yüzey arasındaki sürtünme kuvveti nasıl değişir?`,
      `“${row[0]}” örneğinde sürtünme kuvveti için hangisi söylenebilir?`,
    ];
    const why =
      row[1] === 'Artar'
        ? 'yüzeyler birbirine daha çok tutunur ve hareketi zorlaştıran kuvvet büyür'
        : row[1] === 'Azalır'
          ? 'yüzeyler arasındaki pürüzler azalır ve hareketi zorlaştıran kuvvet küçülür'
          : 'temas eden yüzey alanı değişse de sürtünme kuvveti yüzey alanına bağlı değildir';
    return {
      prompt: stems[round % stems.length],
      answer: row[1],
      distractors: others(SURT_TERMS, row[1]),
      explanation: `${row[0]} durumunda ${why}; bu nedenle sürtünme kuvveti ${lower(row[1])}.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 12: Kuvvet · Denge                                            */
/* ---------------------------------------------------------------- */

emit({
  course: FEN,
  topic: T_KUV,
  slug: 'denge',
  count: 26,
  make: (index) => {
    const left = 7 + index;
    const right = 2 + (index % 7);
    const answer = left - right;
    return {
      prompt: `Eşit kollu bir terazinin sol kefesinde ${left} kg, sağ kefesinde ${right} kg yük vardır. Terazi dengede değildir. Dengeyi sağlamak için sağ kefeye kaç kg yük eklenmelidir?`,
      answer: fmt(answer),
      distractors: nums(answer, [left + right, right, left, answer + 2]),
      explanation: `Kefeler arasındaki fark ${left} − ${right} = ${answer} kg'dır. Bu kadar yük sağ kefeye eklenirse iki kefe eşitlenir ve terazi dengelenir.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Fen 13: Kuvvet · Basit makineler                                  */
/* ---------------------------------------------------------------- */

const MAKINE_TERMS = ['Kaldıraç', 'Eğik düzlem', 'Makara', 'Çıkrık'];

const MAKINE_NOTE: Record<string, string> = {
  Kaldıraç: 'bir destek noktası çevresinde dönen çubukla kuvvet aktaran bir araçtır',
  'Eğik düzlem': 'bir yükün daha küçük kuvvetle yükseltilmesini sağlayan eğimli bir yüzeydir',
  Makara: 'çevresine sarılan iple kuvvetin yönünü değiştiren tekerlektir',
  Çıkrık: 'bir eksen çevresinde dönen kol ile silindirden oluşan araçtır',
};

const MAKINE_ROWS: Array<[string, string]> = [
  ['makas', 'Kaldıraç'],
  ['tahterevalli', 'Kaldıraç'],
  ['el arabası', 'Kaldıraç'],
  ['cımbız', 'Kaldıraç'],
  ['kayık küreği', 'Kaldıraç'],
  ['rampa', 'Eğik düzlem'],
  ['vida', 'Eğik düzlem'],
  ['balta', 'Eğik düzlem'],
  ['burgu', 'Eğik düzlem'],
  ['tornavida', 'Çıkrık'],
  ['kuyu çıkrığı', 'Çıkrık'],
  ['direksiyon', 'Çıkrık'],
  ['bayrak direği makarası', 'Makara'],
  ['inşaat vinci', 'Makara'],
];

emit({
  course: FEN,
  topic: T_KUV,
  slug: 'makine',
  count: 27,
  make: (index) => {
    const row = MAKINE_ROWS[index % MAKINE_ROWS.length];
    const round = Math.floor(index / MAKINE_ROWS.length);
    const stems = [
      `“${row[0]}” hangi basit makine türüne örnektir?`,
      `Günlük yaşamda kullanılan “${row[0]}” hangi basit makine grubunda yer alır?`,
    ];
    return {
      prompt: stems[round % stems.length],
      answer: row[1],
      distractors: others(MAKINE_TERMS, row[1]),
      explanation: `${row[0]} ${MAKINE_NOTE[row[1]]}; bu nedenle ${lower(row[1])} grubunda yer alır.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* İngilizce 1: Simple Present · Boşluk doldurma                     */
/* ---------------------------------------------------------------- */

type VerbRow = { base: string; third: string; ing: string; past: string; phrase: string };

const SP_VERBS: VerbRow[] = [
  { base: 'go', third: 'goes', ing: 'going', past: 'went', phrase: 'to school by bus' },
  { base: 'watch', third: 'watches', ing: 'watching', past: 'watched', phrase: 'TV in the evening' },
  { base: 'study', third: 'studies', ing: 'studying', past: 'studied', phrase: 'English every night' },
  { base: 'play', third: 'plays', ing: 'playing', past: 'played', phrase: 'football on Sundays' },
  { base: 'do', third: 'does', ing: 'doing', past: 'did', phrase: 'homework after dinner' },
  { base: 'brush', third: 'brushes', ing: 'brushing', past: 'brushed', phrase: 'teeth twice a day' },
  { base: 'eat', third: 'eats', ing: 'eating', past: 'ate', phrase: 'breakfast at seven' },
  { base: 'write', third: 'writes', ing: 'writing', past: 'wrote', phrase: 'a letter to a friend' },
  { base: 'help', third: 'helps', ing: 'helping', past: 'helped', phrase: 'a friend with homework' },
  { base: 'wash', third: 'washes', ing: 'washing', past: 'washed', phrase: 'the dishes after lunch' },
  { base: 'catch', third: 'catches', ing: 'catching', past: 'caught', phrase: 'the bus at eight' },
  { base: 'carry', third: 'carries', ing: 'carrying', past: 'carried', phrase: 'a heavy bag to school' },
  { base: 'fly', third: 'flies', ing: 'flying', past: 'flew', phrase: 'to Ankara every month' },
  { base: 'finish', third: 'finishes', ing: 'finishing', past: 'finished', phrase: 'work at six' },
  { base: 'miss', third: 'misses', ing: 'missing', past: 'missed', phrase: 'the morning train' },
  { base: 'fix', third: 'fixes', ing: 'fixing', past: 'fixed', phrase: 'bikes in the garage' },
  { base: 'tidy', third: 'tidies', ing: 'tidying', past: 'tidied', phrase: 'the room on Saturdays' },
];

const SINGULAR_SUBJECTS = ['She', 'He', 'Ali', 'My brother', 'Zeynep', 'My father', 'The teacher'];
const PLURAL_SUBJECTS = ['They', 'We', 'I', 'My friends', 'The students', 'You', 'My parents'];

emit({
  course: ING,
  topic: T_SP,
  slug: 'sp',
  count: 34,
  make: (index) => {
    const verb = SP_VERBS[index % SP_VERBS.length];
    const singular = index < SP_VERBS.length;
    const subject = singular ? SINGULAR_SUBJECTS[index % 7] : PLURAL_SUBJECTS[index % 7];
    const answer = singular ? verb.third : verb.base;
    const wrongForm = singular ? verb.base : verb.third;
    return {
      prompt: `“${subject} ___ ${verb.phrase}.” cümlesinde boşluğa hangi seçenek gelmelidir?`,
      answer,
      distractors: [wrongForm, verb.ing, verb.past],
      explanation: `${subject} öznesi ${singular ? 'üçüncü tekil kişi olduğu için fiil “-s” eki alır ve “' + verb.third + '” biçiminde kullanılır' : 'çoğul ya da birinci kişi olduğu için fiil yalın hâlde, “' + verb.base + '” biçiminde kullanılır'}.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* İngilizce 2: Simple Present · Üçüncü tekil kişi                   */
/* ---------------------------------------------------------------- */

emit({
  course: ING,
  topic: T_SP,
  slug: 'ucuncu',
  count: 33,
  make: (index) => {
    const verb = SP_VERBS[index % SP_VERBS.length];
    const subject = index % 2 === 0 ? 'She' : 'He';
    const stems = [
      `“I ${verb.phrase}.” cümlesini “${subject}” öznesiyle söylemek için boşluğa hangisi gelmelidir? “${subject} ___.”`,
      `“We ${verb.phrase}.” cümlesini “${subject}” öznesiyle anlatan seçenek hangisidir? “${subject} ___.”`,
    ];
    return {
      prompt: stems[Math.floor(index / SP_VERBS.length) % stems.length],
      answer: verb.third,
      distractors: [verb.base, verb.ing, verb.past],
      explanation: `${subject} üçüncü tekil kişi olduğu için “${verb.base}” fiili “${verb.third}” biçimine girer; “I” ve “we” öznelerinde fiil yalın hâlde kalır.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* İngilizce 3: Simple Present · Olumsuz cümle                       */
/* ---------------------------------------------------------------- */

emit({
  course: ING,
  topic: T_SP,
  slug: 'olumsuz',
  count: 33,
  make: (index) => {
    const verb = SP_VERBS[index % SP_VERBS.length];
    const singular = index < SP_VERBS.length;
    const subject = singular ? SINGULAR_SUBJECTS[index % 7] : PLURAL_SUBJECTS[index % 7];
    const answer = singular ? `doesn't ${verb.base}` : `don't ${verb.base}`;
    const wrongAux = singular ? `don't ${verb.base}` : `doesn't ${verb.base}`;
    return {
      prompt: `“${subject} ___ ${verb.phrase}.” cümlesini olumsuz yapmak için boşluğa hangisi gelmelidir?`,
      answer,
      distractors: [wrongAux, `not ${verb.base}`, singular ? `isn't ${verb.base}` : `aren't ${verb.base}`],
      explanation: `${subject} ${singular ? 'üçüncü tekil kişi olduğu için olumsuzlukta “doesn’t” kullanılır ve fiil yalın kalır' : 'çoğul ya da birinci kişi olduğu için olumsuzlukta “don’t” kullanılır ve fiil yalın kalır'}: ${answer} ${verb.phrase}.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* İngilizce 4: Frequency Words · Zarfın yeri                        */
/* ---------------------------------------------------------------- */

const FREQ_ADVERBS = ['always', 'usually', 'often', 'sometimes', 'never', 'rarely', 'seldom', 'hardly ever'];

const FREQ_ROWS: Array<{ subject: string; phrase: string }> = [
  { subject: 'She', phrase: 'goes to school by bus' },
  { subject: 'He', phrase: 'watches TV in the evening' },
  { subject: 'Ali', phrase: 'does his homework after dinner' },
  { subject: 'My sister', phrase: 'brushes her teeth twice a day' },
  { subject: 'The teacher', phrase: 'checks our homework' },
  { subject: 'My father', phrase: 'drinks coffee in the morning' },
  { subject: 'Zeynep', phrase: 'walks to school' },
  { subject: 'My brother', phrase: 'plays football on Sundays' },
  { subject: 'She', phrase: 'reads a book before bed' },
  { subject: 'He', phrase: 'catches the bus at eight' },
  { subject: 'My mother', phrase: 'cooks dinner in the evening' },
  { subject: 'Ahmet', phrase: 'tidies his room on Saturdays' },
  { subject: 'My grandmother', phrase: 'visits us at the weekend' },
  { subject: 'The bus driver', phrase: 'starts work at six' },
  { subject: 'She', phrase: 'studies English every night' },
  { subject: 'My cousin', phrase: 'rides a bike to school' },
  { subject: 'He', phrase: 'feeds the cat in the morning' },
];

emit({
  course: ING,
  topic: T_FREQ,
  slug: 'freq-yer',
  count: 34,
  make: (index) => {
    const row = FREQ_ROWS[index % FREQ_ROWS.length];
    const round = Math.floor(index / FREQ_ROWS.length);
    const adverb = round === 0 ? FREQ_ADVERBS[index % 8] : FREQ_ADVERBS[(index + 3) % 8];
    const correct = `${row.subject} ${adverb} ${row.phrase}.`;
    return {
      prompt: `“${row.subject} ${row.phrase}.” cümlesine “${adverb}” zarfını doğru yere yerleştiren seçenek hangisidir?`,
      answer: correct,
      distractors: [
        `${row.subject} ${row.phrase} ${adverb}.`,
        `${cap(adverb)} ${row.subject} ${row.phrase}.`,
        `${row.subject} is ${adverb} ${row.phrase}.`,
      ],
      explanation: `Sıklık zarfları özneden sonra, asıl fiilden önce gelir; bu nedenle doğru sıralama “${correct}” biçimindedir.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* İngilizce 5: Frequency Words · Anlama göre seçim                  */
/* ---------------------------------------------------------------- */

const FREQ_MEANING: Record<string, string> = {
  always: 'her zaman',
  usually: 'genellikle',
  often: 'sık sık',
  sometimes: 'bazen',
  rarely: 'nadiren',
  never: 'hiçbir zaman',
  seldom: 'pek seyrek',
  'hardly ever': 'neredeyse hiç',
};

const FREQ_CLOZE: Array<{ sentence: string; answer: string }> = [
  { sentence: 'Ali ___ forgets his keys; he has lost them five times this month.', answer: 'often' },
  { sentence: 'My mother ___ cooks on Sundays; she never misses it.', answer: 'always' },
  { sentence: 'I ___ eat fast food; maybe twice a year.', answer: 'rarely' },
  { sentence: 'She ___ walks to school, but sometimes she takes the bus.', answer: 'usually' },
  { sentence: 'He ___ drinks coffee at night because he cannot sleep afterwards.', answer: 'never' },
  { sentence: 'We ___ visit our grandparents at the weekend, but not every week.', answer: 'sometimes' },
  { sentence: 'The bus is ___ late in winter; it happens almost every day.', answer: 'often' },
  { sentence: 'My brother ___ gets up before seven; he is an early riser.', answer: 'always' },
  { sentence: 'They ___ go to the cinema; only once or twice a year.', answer: 'rarely' },
  { sentence: 'I ___ do my homework after dinner, but yesterday I did it before.', answer: 'usually' },
  { sentence: 'She ___ eats meat because she is a vegetarian.', answer: 'never' },
  { sentence: 'We ___ play football after school when the weather is good.', answer: 'sometimes' },
  { sentence: 'He ___ checks his phone in the morning; it is the first thing he does.', answer: 'always' },
  { sentence: 'My sister ___ takes the train to work, but this week she is driving.', answer: 'usually' },
  { sentence: 'They ___ travel abroad; they have visited only two countries.', answer: 'rarely' },
  { sentence: 'I ___ forget my umbrella, so I often get wet in the rain.', answer: 'often' },
  { sentence: 'The shop ___ opens at nine, but on Sundays it opens at ten.', answer: 'usually' },
];

emit({
  course: ING,
  topic: T_FREQ,
  slug: 'freq-sec',
  count: 33,
  make: (index) => {
    const row = FREQ_CLOZE[index % FREQ_CLOZE.length];
    const round = Math.floor(index / FREQ_CLOZE.length);
    const stems = [
      `Boşluğa anlamca en uygun sıklık zarfını seç: “${row.sentence}”`,
      `“${row.sentence}” cümlesinde boşluğa hangi sıklık zarfı gelmelidir?`,
    ];
    return {
      prompt: stems[round % stems.length],
      answer: row.answer,
      distractors: others(FREQ_ADVERBS, row.answer),
      explanation: `“${row.answer}” zarfı “${FREQ_MEANING[row.answer]}” anlamına gelir; cümledeki ipucu bu sıklık derecesini gösterir.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* İngilizce 6: Frequency Words · Kelime anlamı                      */
/* ---------------------------------------------------------------- */

const KELIME_ROWS: Array<[string, string]> = [
  ['wake up', 'uyanmak'],
  ['get dressed', 'giyinmek'],
  ['brush teeth', 'diş fırçalamak'],
  ['have breakfast', 'kahvaltı yapmak'],
  ['catch the bus', 'otobüse yetişmek'],
  ['do homework', 'ödev yapmak'],
  ['go to bed', 'yatmaya gitmek'],
  ['take a shower', 'duş almak'],
  ['tidy the room', 'odayı toplamak'],
  ['feed the cat', 'kediyi beslemek'],
  ['ride a bike', 'bisiklete binmek'],
  ['watch TV', 'televizyon izlemek'],
  ['visit grandparents', 'büyükanne ve büyükbabayı ziyaret etmek'],
  ['play chess', 'satranç oynamak'],
  ['walk to school', 'okula yürümek'],
  ['have lunch', 'öğle yemeği yemek'],
  ['do the dishes', 'bulaşıkları yıkamak'],
];

emit({
  course: ING,
  topic: T_FREQ,
  slug: 'kelime',
  count: 33,
  make: (index) => {
    const row = KELIME_ROWS[index % KELIME_ROWS.length];
    const round = Math.floor(index / KELIME_ROWS.length);
    const stems = [
      `“${row[0]}” ifadesinin Türkçe karşılığı hangisidir?`,
      `Günlük rutinlerle ilgili “${row[0]}” ifadesinin anlamı hangisidir?`,
    ];
    return {
      prompt: stems[round % stems.length],
      answer: row[1],
      distractors: others(KELIME_ROWS.map((item) => item[1]), row[1]),
      explanation: `“${row[0]}” ifadesi Türkçede “${row[1]}” anlamına gelir ve günlük rutin anlatılırken kullanılır.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* İngilizce 7: Question Forms · Do / Does                           */
/* ---------------------------------------------------------------- */

type SoruRow = {
  subject: string;
  phrase: string;
  singular: boolean;
  base: string;
  third: string;
};

const DODOES_ROWS: SoruRow[] = [
  { subject: 'she', phrase: 'go to school by bus', singular: true, base: 'go', third: 'goes' },
  { subject: 'they', phrase: 'play football on Sundays', singular: false, base: 'play', third: 'plays' },
  { subject: 'he', phrase: 'watch TV in the evening', singular: true, base: 'watch', third: 'watches' },
  { subject: 'we', phrase: 'do our homework after dinner', singular: false, base: 'do', third: 'does' },
  { subject: 'Ali', phrase: 'study English every night', singular: true, base: 'study', third: 'studies' },
  { subject: 'the students', phrase: 'eat lunch at school', singular: false, base: 'eat', third: 'eats' },
  { subject: 'my brother', phrase: 'brush his teeth twice a day', singular: true, base: 'brush', third: 'brushes' },
  { subject: 'you', phrase: 'read books before bed', singular: false, base: 'read', third: 'reads' },
  { subject: 'Zeynep', phrase: 'help her mother in the kitchen', singular: true, base: 'help', third: 'helps' },
  { subject: 'the children', phrase: 'wash the dishes after lunch', singular: false, base: 'wash', third: 'washes' },
  { subject: 'he', phrase: 'catch the bus at eight', singular: true, base: 'catch', third: 'catches' },
  { subject: 'they', phrase: 'carry heavy bags to school', singular: false, base: 'carry', third: 'carries' },
  { subject: 'my sister', phrase: 'fly to Ankara every month', singular: true, base: 'fly', third: 'flies' },
  { subject: 'we', phrase: 'finish work at six', singular: false, base: 'finish', third: 'finishes' },
  { subject: 'the teacher', phrase: 'check our homework every day', singular: true, base: 'check', third: 'checks' },
  { subject: 'your parents', phrase: 'go to the market on Saturdays', singular: false, base: 'go', third: 'goes' },
  { subject: 'she', phrase: 'tidy her room on Saturdays', singular: true, base: 'tidy', third: 'tidies' },
];

emit({
  course: ING,
  topic: T_Q,
  slug: 'dodoes',
  count: 34,
  make: (index) => {
    const row = DODOES_ROWS[index % DODOES_ROWS.length];
    const round = Math.floor(index / DODOES_ROWS.length);
    const aux = row.singular ? 'Does' : 'Do';
    const wrongAux = row.singular ? 'Do' : 'Does';
    const be = row.singular ? 'Is' : 'Are';
    const correct = `${aux} ${row.subject} ${row.base} ${row.phrase}?`;
    const stems = [
      `“${cap(row.subject)} ${row.phrase}.” cümlesini soru biçimine çeviren doğru seçenek hangisidir?`,
      `“${cap(row.subject)} ${row.phrase}.” ifadesinin doğru soru hâli hangisidir?`,
    ];
    return {
      prompt: stems[round % stems.length],
      answer: correct,
      distractors: [
        `${wrongAux} ${row.subject} ${row.base} ${row.phrase}?`,
        `${aux} ${row.subject} ${row.third} ${row.phrase}?`,
        `${be} ${row.subject} ${row.base} ${row.phrase}?`,
      ],
      explanation: `${cap(row.subject)} ${row.singular ? 'üçüncü tekil kişi olduğu için soruda “Does” yardımcı fiili kullanılır ve asıl fiil yalın kalır' : 'çoğul kişi olduğu için soruda “Do” yardımcı fiili kullanılır ve asıl fiil yalın kalır'}: ${correct}`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* İngilizce 8: Question Forms · Where / What / When / Who           */
/* ---------------------------------------------------------------- */

const WH_TERMS = ['Where', 'What', 'When', 'Who'];

const WH_ROWS: Array<{ word: string; clue: string; rest: string }> = [
  { word: 'When', clue: 'At seven o’clock', rest: 'does the lesson start' },
  { word: 'Where', clue: 'In the library', rest: 'does she study' },
  { word: 'What', clue: 'A sandwich', rest: 'do you eat for lunch' },
  { word: 'Who', clue: 'My uncle', rest: 'helps you with maths' },
  { word: 'When', clue: 'On Monday', rest: 'do they play football' },
  { word: 'Where', clue: 'In Ankara', rest: 'does your grandmother live' },
  { word: 'What', clue: 'English and maths', rest: 'do you study at school' },
  { word: 'Who', clue: 'My sister', rest: 'cooks dinner in your family' },
  { word: 'When', clue: 'In the morning', rest: 'does he brush his teeth' },
  { word: 'Where', clue: 'At the bus stop', rest: 'do they wait' },
  { word: 'What', clue: 'A bike', rest: 'does he want for his birthday' },
  { word: 'Who', clue: 'Mr Aydın', rest: 'teaches you science' },
  { word: 'When', clue: 'At nine', rest: 'does the shop open' },
  { word: 'Where', clue: 'In the kitchen', rest: 'is your mother' },
  { word: 'What', clue: 'Basketball', rest: 'do they play after school' },
  { word: 'Who', clue: 'My friends', rest: 'do you meet at the park' },
  { word: 'When', clue: 'In summer', rest: 'do you visit your grandparents' },
];

const WH_KIND: Record<string, string> = {
  When: 'zaman',
  Where: 'yer',
  What: 'nesne ya da eylem',
  Who: 'kişi',
};

emit({
  course: ING,
  topic: T_Q,
  slug: 'wh',
  count: 33,
  make: (index) => {
    const row = WH_ROWS[index % WH_ROWS.length];
    const round = Math.floor(index / WH_ROWS.length);
    const stems = [
      `“___ ${row.rest}?” sorusunun cevabı “${row.clue}” olduğuna göre boşluğa hangi soru kelimesi gelmelidir?`,
      `Cevabı “${row.clue}” olan “___ ${row.rest}?” sorusu hangi soru kelimesiyle başlamalıdır?`,
    ];
    return {
      prompt: stems[round % stems.length],
      answer: row.word,
      distractors: others(WH_TERMS, row.word),
      explanation: `“${row.clue}” ifadesi ${WH_KIND[row.word]} bildirdiği için soru “${row.word}” kelimesiyle kurulur: ${row.word} ${row.rest}?`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* İngilizce 9: Question Forms · Kısa cevap                          */
/* ---------------------------------------------------------------- */

const SHORT_ROWS: Array<{ question: string; pronoun: string; aux: string; be: string }> = [
  { question: 'Does she like apples?', pronoun: 'she', aux: 'does', be: 'is' },
  { question: 'Do they play tennis?', pronoun: 'they', aux: 'do', be: 'are' },
  { question: 'Does he go to school by bus?', pronoun: 'he', aux: 'does', be: 'is' },
  { question: 'Do you like milk?', pronoun: 'I', aux: 'do', be: 'am' },
  { question: 'Does your brother watch TV?', pronoun: 'he', aux: 'does', be: 'is' },
  { question: 'Do the students study English?', pronoun: 'they', aux: 'do', be: 'are' },
  { question: 'Does Zeynep live in İzmir?', pronoun: 'she', aux: 'does', be: 'is' },
  { question: 'Do we need a ticket?', pronoun: 'we', aux: 'do', be: 'are' },
  { question: 'Does the shop open at nine?', pronoun: 'it', aux: 'does', be: 'is' },
  { question: 'Do your friends play football?', pronoun: 'they', aux: 'do', be: 'are' },
  { question: 'Does Ali do his homework?', pronoun: 'he', aux: 'does', be: 'is' },
  { question: 'Do they eat breakfast at school?', pronoun: 'they', aux: 'do', be: 'are' },
  { question: 'Does your mother cook dinner?', pronoun: 'she', aux: 'does', be: 'is' },
  { question: 'Do the children like ice cream?', pronoun: 'they', aux: 'do', be: 'are' },
  { question: 'Does he speak English?', pronoun: 'he', aux: 'does', be: 'is' },
  { question: 'Do you walk to school?', pronoun: 'I', aux: 'do', be: 'am' },
  { question: 'Does your sister ride a bike?', pronoun: 'she', aux: 'does', be: 'is' },
];

emit({
  course: ING,
  topic: T_Q,
  slug: 'kisa',
  count: 33,
  make: (index) => {
    const row = SHORT_ROWS[index % SHORT_ROWS.length];
    const round = Math.floor(index / SHORT_ROWS.length);
    const stems = [
      `“${row.question}” sorusuna verilebilecek doğru kısa cevap hangisidir?`,
      `“${row.question}” sorusunun kısa cevabı hangi seçenekte doğru verilmiştir?`,
    ];
    const correct = `Yes, ${row.pronoun} ${row.aux}.`;
    return {
      prompt: stems[round % stems.length],
      answer: correct,
      distractors: [
        `Yes, ${row.pronoun} ${row.aux === 'does' ? 'do' : 'does'}.`,
        `Yes, ${row.pronoun} ${row.be}.`,
        `Yes, ${row.pronoun} ${row.aux} not.`,
      ],
      explanation: `Soru “${row.aux === 'does' ? 'Does' : 'Do'}” ile başladığı için kısa cevapta aynı yardımcı fiil yinelenir: “${correct}”`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Dışa aktarım                                                      */
/* ---------------------------------------------------------------- */

export const questions: EmbeddedQuestionSeed[] = bank;
export const topicQuestionIds: Record<string, Record<string, string[]>> = buckets;
