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
const TR = 'Türkçe';
const SOS = 'Sosyal Bilgiler';

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

function fill(opts: {
  course: string;
  topic: string;
  slug: string;
  count: number;
  make: (attempt: number) => Draft | null;
}) {
  const abbr = opts.course === TR ? 'ot' : 'os';
  let made = 0;
  for (let attempt = 0; attempt < opts.count * 40 && made < opts.count; attempt += 1) {
    const draft = opts.make(attempt);
    if (!draft) continue;
    if (usedPrompts.has(draft.prompt)) continue;
    const options = [draft.answer, ...draft.distractors];
    if (options.length !== 4 || new Set(options).size !== 4) continue;
    usedPrompts.add(draft.prompt);
    made += 1;
    counters[opts.slug] = (counters[opts.slug] ?? 0) + 1;
    const id = `bulk-${abbr}-${opts.slug}-${counters[opts.slug]}`;
    bank.push(
      mc({
        id,
        levelName: LEVEL,
        courseName: opts.course,
        prompt: draft.prompt,
        answer: draft.answer,
        distractors: draft.distractors,
        explanation: draft.explanation,
        difficulty: difficultyAt(made - 1),
      }),
    );
    const byCourse = (buckets[`${LEVEL}::${opts.course}`] ??= {});
    (byCourse[opts.topic] ??= []).push(id);
  }
  if (made < opts.count) {
    throw new Error(`${opts.topic}/${opts.slug}: ${opts.count} yerine ${made} soru üretildi`);
  }
}

function upper(text: string): string {
  return text.charAt(0).toLocaleUpperCase('tr-TR') + text.slice(1);
}

function fmt(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace('.', ',');
}

function numOptions(answer: number, candidates: number[]): string[] {
  const seen = new Set([fmt(answer)]);
  const out: string[] = [];
  for (const value of candidates) {
    if (out.length === 3) break;
    if (!Number.isFinite(value) || value <= 0) continue;
    const text = fmt(value);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  if (out.length < 3) throw new Error(`çeldirici yetersiz: ${answer}`);
  return out;
}

/* ---------------------------------------------------------------- */
/* Türkçe 1: Cümlenin Ögeleri                                        */
/* ---------------------------------------------------------------- */

type ElemRow = { z: string; s: string; y: string; n: string; f: string; q: string };

const ELEM_ROWS: ElemRow[] = [
  { z: 'Dün akşam', s: 'Ali', y: 'kütüphanede', n: 'kalın romanı', f: 'bitirdi', q: 'neyi' },
  { z: 'Sabah', s: 'öğrenciler', y: 'sınıfta', n: 'ödevi', f: 'tamamladı', q: 'neyi' },
  { z: 'Geçen hafta', s: 'annem', y: 'mutfakta', n: 'mercimek çorbasını', f: 'pişirdi', q: 'neyi' },
  { z: 'Akşamüstü', s: 'bahçıvan', y: 'bahçede', n: 'kuru dalları', f: 'topladı', q: 'neyi' },
  { z: 'Bu yıl', s: 'köylüler', y: 'tarlada', n: 'buğdayı', f: 'biçti', q: 'neyi' },
  { z: 'Sabahın erken saatinde', s: 'balıkçılar', y: 'limanda', n: 'ağları', f: 'onardı', q: 'neyi' },
  { z: 'Öğleden sonra', s: 'küçük kedi', y: 'koltukta', n: 'yumağı', f: 'kovaladı', q: 'neyi' },
  { z: 'Dün', s: 'öğretmen', y: 'koridorda', n: 'nöbetçi öğrenciyi', f: 'uyardı', q: 'kimi' },
  { z: 'Akşam', s: 'babam', y: 'balkonda', n: 'çayı', f: 'demledi', q: 'neyi' },
  { z: 'Hafta sonu', s: 'çocuklar', y: 'parkta', n: 'uçurtmayı', f: 'uçurdu', q: 'neyi' },
  { z: 'Sabahleyin', s: 'postacı', y: 'sokakta', n: 'mektupları', f: 'dağıttı', q: 'neyi' },
  { z: 'Kışın', s: 'dedem', y: 'sobanın yanında', n: 'eski gazeteyi', f: 'okudu', q: 'neyi' },
  { z: 'Öğle vakti', s: 'işçiler', y: 'şantiyede', n: 'tuğlaları', f: 'taşıdı', q: 'neyi' },
  { z: 'Bu sabah', s: 'kuaför', y: 'dükkânda', n: 'müşterinin saçını', f: 'kesti', q: 'neyi' },
  { z: 'Dün gece', s: 'bekçi', y: 'avluda', n: 'demir kapıyı', f: 'kilitledi', q: 'neyi' },
  { z: 'Yazın', s: 'turistler', y: 'sahilde', n: 'gün batımını', f: 'izledi', q: 'neyi' },
  { z: 'Az önce', s: 'garson', y: 'masada', n: 'boş bardakları', f: 'topladı', q: 'neyi' },
  { z: 'Sabaha karşı', s: 'fırıncı', y: 'fırında', n: 'hamuru', f: 'yoğurdu', q: 'neyi' },
  { z: 'Öğleye doğru', s: 'müdür', y: 'toplantı salonunda', n: 'yeni planı', f: 'açıkladı', q: 'neyi' },
  { z: 'Geçen ay', s: 'marangoz', y: 'atölyede', n: 'eski masayı', f: 'onardı', q: 'neyi' },
  { z: 'Akşamüstü', s: 'çoban', y: 'yaylada', n: 'koyunları', f: 'otlattı', q: 'neyi' },
  { z: 'Bu akşam', s: 'teyzem', y: 'bahçede', n: 'çiçekleri', f: 'suladı', q: 'neyi' },
  { z: 'Öğleden sonra', s: 'çıraklar', y: 'dükkânda', n: 'rafları', f: 'düzenledi', q: 'neyi' },
  { z: 'Dün sabah', s: 'şoför', y: 'durakta', n: 'otobüsü', f: 'temizledi', q: 'neyi' },
  { z: 'Kış akşamı', s: 'komşular', y: 'salonda', n: 'eski fotoğrafları', f: 'inceledi', q: 'neyi' },
  { z: 'Bu hafta', s: 'kaptan', y: 'teknede', n: 'haritayı', f: 'kontrol etti', q: 'neyi' },
  { z: 'Erken saatte', s: 'sporcular', y: 'salonda', n: 'ağırlıkları', f: 'kaldırdı', q: 'neyi' },
  { z: 'Dün', s: 'hemşire', y: 'odada', n: 'hastanın yarasını', f: 'temizledi', q: 'neyi' },
  { z: 'Akşam', s: 'aşçı', y: 'mutfakta', n: 'tencereyi', f: 'yıkadı', q: 'neyi' },
  { z: 'Sabah', s: 'öğrenciler', y: 'bahçede', n: 'fidanları', f: 'dikti', q: 'neyi' },
];

fill({
  course: TR,
  topic: 'Cümlenin Ögeleri',
  slug: 'yuklem',
  count: 30,
  make: (attempt) => {
    const r = ELEM_ROWS[attempt % ELEM_ROWS.length];
    const sentence = `${r.z} ${r.s} ${r.y} ${r.n} ${r.f}.`;
    return {
      prompt: `“${sentence}” cümlesinin yüklemi hangisidir?`,
      answer: r.f,
      distractors: [r.s, r.y, r.n],
      explanation: `“${r.f}” sözcüğü zaman ve kişi eki taşıyan çekimli bir fiildir; cümlede yargıyı bildirdiği için yüklemdir.`,
    };
  },
});

fill({
  course: TR,
  topic: 'Cümlenin Ögeleri',
  slug: 'ozne',
  count: 29,
  make: (attempt) => {
    const r = ELEM_ROWS[attempt % ELEM_ROWS.length];
    const sentence = `${r.z} ${r.s} ${r.y} ${r.n} ${r.f}.`;
    return {
      prompt: `“${sentence}” cümlesinde özne hangisidir?`,
      answer: r.s,
      distractors: [r.n, r.y, r.f],
      explanation: `Yükleme “kim, ne?” sorusu sorulduğunda “${r.s}” yanıtı alınır; işi yapan öğe öznedir.`,
    };
  },
});

fill({
  course: TR,
  topic: 'Cümlenin Ögeleri',
  slug: 'nesne',
  count: 29,
  make: (attempt) => {
    const r = ELEM_ROWS[attempt % ELEM_ROWS.length];
    const sentence = `${r.z} ${r.s} ${r.y} ${r.n} ${r.f}.`;
    return {
      prompt: `“${sentence}” cümlesinde belirtili nesne hangisidir?`,
      answer: r.n,
      distractors: [r.s, r.y, r.f],
      explanation: `Yükleme “${r.q}?” sorusu sorulduğunda “${r.n}” yanıtı gelir; belirtme eki aldığı için bu öğe belirtili nesnedir.`,
    };
  },
});

fill({
  course: TR,
  topic: 'Cümlenin Ögeleri',
  slug: 'tumlec',
  count: 29,
  make: (attempt) => {
    const r = ELEM_ROWS[attempt % ELEM_ROWS.length];
    const sentence = `${upper(r.s)} ${r.y} ${r.n} ${r.f}.`;
    return {
      prompt: `“${sentence}” cümlesinde yer tamlayıcısı hangisidir?`,
      answer: r.y,
      distractors: [r.s, r.n, r.f],
      explanation: `Yükleme “nerede?” sorusu sorulduğunda “${r.y}” yanıtı alınır; yer bildiren bu öğe yer tamlayıcısıdır.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Türkçe 2: Anlam İlişkileri                                        */
/* ---------------------------------------------------------------- */

type CmpRow = { a: string; b: string; bEk: string; prop: string };

const CMP_ROWS: CmpRow[] = [
  { a: 'Ali', b: 'Mehmet', bEk: 'Mehmet’ten', prop: 'uzundur' },
  { a: 'Bu kitap', b: 'o kitap', bEk: 'o kitaptan', prop: 'kalındır' },
  { a: 'Kış', b: 'yaz', bEk: 'yazdan', prop: 'soğuktur' },
  { a: 'Tren', b: 'otobüs', bEk: 'otobüsten', prop: 'hızlıdır' },
  { a: 'Ayşe', b: 'kardeşi', bEk: 'kardeşinden', prop: 'erken kalkar' },
  { a: 'Bu yol', b: 'diğer yol', bEk: 'diğer yoldan', prop: 'kısadır' },
  { a: 'Portakal', b: 'limon', bEk: 'limondan', prop: 'tatlıdır' },
  { a: 'Sınıfımız', b: 'komşu sınıf', bEk: 'komşu sınıftan', prop: 'geniştir' },
  { a: 'Bugünkü hava', b: 'dünkü hava', bEk: 'dünkü havadan', prop: 'serindir' },
  { a: 'Mavi kazak', b: 'siyah kazak', bEk: 'siyah kazaktan', prop: 'ucuzdur' },
  { a: 'Bu sınav', b: 'önceki sınav', bEk: 'önceki sınavdan', prop: 'kolaydı' },
  { a: 'Kedimiz', b: 'komşunun köpeği', bEk: 'komşunun köpeğinden', prop: 'sakindir' },
  { a: 'Yaz tatili', b: 'kış tatili', bEk: 'kış tatilinden', prop: 'uzundur' },
  { a: 'Bu film', b: 'izlediğimiz film', bEk: 'izlediğimiz filmden', prop: 'sürükleyiciydi' },
  { a: 'Zeynep', b: 'ablası', bEk: 'ablasından', prop: 'çalışkandır' },
  { a: 'Bakır', b: 'demir', bEk: 'demirden', prop: 'yumuşaktır' },
  { a: 'Bu çanta', b: 'okul çantası', bEk: 'okul çantasından', prop: 'ağırdır' },
  { a: 'Sabah trafiği', b: 'akşam trafiği', bEk: 'akşam trafiğinden', prop: 'sakindi' },
  { a: 'Karpuz', b: 'kavun', bEk: 'kavundan', prop: 'suludur' },
  { a: 'Bu problem', b: 'önceki problem', bEk: 'önceki problemden', prop: 'zordur' },
  { a: 'Emre', b: 'kuzeni', bEk: 'kuzeninden', prop: 'hızlı koşar' },
  { a: 'Kütüphane', b: 'sınıf', bEk: 'sınıftan', prop: 'sessizdi' },
  { a: 'Bu makine', b: 'eski makine', bEk: 'eski makineden', prop: 'verimli çalışıyor' },
  { a: 'Şubat', b: 'ocak', bEk: 'ocaktan', prop: 'kısa sürer' },
];

fill({
  course: TR,
  topic: 'Anlam İlişkileri',
  slug: 'karsilastirma',
  count: 24,
  make: (attempt) => {
    const r = CMP_ROWS[attempt % CMP_ROWS.length];
    const sentence = `${r.a}, ${r.bEk} daha ${r.prop}.`;
    const d1 = CMP_ROWS[(attempt + 3) % CMP_ROWS.length];
    const d2 = CMP_ROWS[(attempt + 8) % CMP_ROWS.length];
    const d3 = CMP_ROWS[(attempt + 14) % CMP_ROWS.length];
    return {
      prompt: `“${sentence}” cümlesinde karşılaştırma hangi iki varlık arasında yapılmıştır?`,
      answer: `${r.a} ile ${r.b}`,
      distractors: [`${d1.a} ile ${d1.b}`, `${d2.a} ile ${d2.b}`, `${d3.a} ile ${d3.b}`],
      explanation: `“Daha ${r.prop}” ifadesi iki varlığı aynı ölçüte göre kıyaslar; bu cümlede kıyas ${r.a} ile ${r.b} arasındadır.`,
    };
  },
});

type CauseRow = { neden: string; sonuc: string };

const CAUSE_ROWS: CauseRow[] = [
  { neden: 'Hava çok soğuduğu için', sonuc: 'okullar tatil edildi' },
  { neden: 'Yağmur yağdığı için', sonuc: 'maç ertelendi' },
  { neden: 'Otobüs geç kaldığı için', sonuc: 'toplantıya yetişemedim' },
  { neden: 'Elektrikler kesildiği için', sonuc: 'derslere ara verildi' },
  { neden: 'Yol kapalı olduğu için', sonuc: 'kargo gecikti' },
  { neden: 'Sınavı iyi geçtiği için', sonuc: 'ailesi onu ödüllendirdi' },
  { neden: 'Kitap bulunamadığı için', sonuc: 'sunum ertelendi' },
  { neden: 'Ses çok yüksek olduğu için', sonuc: 'komşular rahatsız oldu' },
  { neden: 'Su kaynakları azaldığı için', sonuc: 'bahçe sulaması yasaklandı' },
  { neden: 'Trafik yoğun olduğu için', sonuc: 'eve geç vardık' },
  { neden: 'Hasta olduğu için', sonuc: 'okula gitmedi' },
  { neden: 'Fırın bozulduğu için', sonuc: 'ekmek yetişmedi' },
  { neden: 'Rüzgâr şiddetli olduğu için', sonuc: 'uçurtma uçurulamadı' },
  { neden: 'Parası yetmediği için', sonuc: 'bisikleti alamadı' },
  { neden: 'Yağış az olduğu için', sonuc: 'baraj seviyesi düştü' },
  { neden: 'Sıcaklık arttığı için', sonuc: 'kar hızla eridi' },
  { neden: 'Işıklar yetersiz olduğu için', sonuc: 'fotoğraf bulanık çıktı' },
  { neden: 'Erken kalktığı için', sonuc: 'otobüsü yakaladı' },
  { neden: 'Yolu bilmediği için', sonuc: 'yanlış sokağa girdi' },
  { neden: 'Formu eksik doldurduğu için', sonuc: 'başvurusu kabul edilmedi' },
  { neden: 'Hava rüzgârlı olduğu için', sonuc: 'vapur seferleri iptal edildi' },
  { neden: 'Telefonu kapalı olduğu için', sonuc: 'ona ulaşamadım' },
  { neden: 'Süt ekşidiği için', sonuc: 'tatlıyı yeniden yaptı' },
  { neden: 'Sıra bozulduğu için', sonuc: 'oyun yeniden başladı' },
];

fill({
  course: TR,
  topic: 'Anlam İlişkileri',
  slug: 'neden-sonuc',
  count: 24,
  make: (attempt) => {
    const r = CAUSE_ROWS[attempt % CAUSE_ROWS.length];
    const sentence = `${r.neden} ${r.sonuc}.`;
    const d1 = CAUSE_ROWS[(attempt + 4) % CAUSE_ROWS.length];
    const d2 = CAUSE_ROWS[(attempt + 9) % CAUSE_ROWS.length];
    return {
      prompt: `“${sentence}” cümlesinde neden bildiren bölüm hangisidir?`,
      answer: r.neden,
      distractors: [r.sonuc, d1.neden, d2.neden],
      explanation: `“${r.neden}” bölümü işin niçin olduğunu söyler; “${r.sonuc}” ise bu nedenin doğurduğu sonuçtur.`,
    };
  },
});

type PurposeRow = { amac: string; eylem: string };

const PURPOSE_ROWS: PurposeRow[] = [
  { amac: 'Sınavı kazanmak için', eylem: 'her gün düzenli çalıştı' },
  { amac: 'Sağlıklı kalmak için', eylem: 'her sabah yürüyüş yaptı' },
  { amac: 'Borçlarını ödemek için', eylem: 'fazla mesai yaptı' },
  { amac: 'Kitabı bitirmek için', eylem: 'gece geç saate kadar okudu' },
  { amac: 'Takımı güçlendirmek için', eylem: 'yeni oyuncular aldı' },
  { amac: 'Bahçeyi güzelleştirmek için', eylem: 'çiçekler dikti' },
  { amac: 'Daha iyi görmek için', eylem: 'gözlük kullanmaya başladı' },
  { amac: 'Su tasarrufu sağlamak için', eylem: 'muslukları yeniledi' },
  { amac: 'Sergiye yetişmek için', eylem: 'sabah erken yola çıktı' },
  { amac: 'Yeni bir dil öğrenmek için', eylem: 'kursa yazıldı' },
  { amac: 'Ailesini görmek için', eylem: 'memlekete gitti' },
  { amac: 'Notlarını düzeltmek için', eylem: 'öğretmeninden yardım istedi' },
  { amac: 'Daha hızlı gitmek için', eylem: 'kestirme yolu seçti' },
  { amac: 'Evini ısıtmak için', eylem: 'odun aldı' },
  { amac: 'Yemek yapmak için', eylem: 'markete uğradı' },
  { amac: 'Arkadaşını uyarmak için', eylem: 'onu aradı' },
  { amac: 'Projeyi yetiştirmek için', eylem: 'hafta sonu da çalıştı' },
  { amac: 'Daha iyi uyumak için', eylem: 'akşam çayı içmeyi bıraktı' },
  { amac: 'Bisikleti tamir etmek için', eylem: 'yedek parça aldı' },
  { amac: 'Konsere hazırlanmak için', eylem: 'her akşam prova yaptı' },
  { amac: 'Yaşlı komşusuna yardım etmek için', eylem: 'alışverişini yaptı' },
  { amac: 'Sıcaktan korunmak için', eylem: 'gölgeye oturdu' },
  { amac: 'Tasarruf etmek için', eylem: 'gereksiz alışverişi bıraktı' },
];

fill({
  course: TR,
  topic: 'Anlam İlişkileri',
  slug: 'amac-sonuc',
  count: 23,
  make: (attempt) => {
    const r = PURPOSE_ROWS[attempt % PURPOSE_ROWS.length];
    const sentence = `${r.amac} ${r.eylem}.`;
    const d1 = PURPOSE_ROWS[(attempt + 3) % PURPOSE_ROWS.length];
    const d2 = PURPOSE_ROWS[(attempt + 7) % PURPOSE_ROWS.length];
    return {
      prompt: `“${sentence}” cümlesinde amaç bildiren bölüm hangisidir?`,
      answer: r.amac,
      distractors: [r.eylem, d1.amac, d2.amac],
      explanation: `“${r.amac}” bölümü yapılan işin hangi amaçla yapıldığını bildirir; “${r.eylem}” ise gerçekleştirilen eylemdir.`,
    };
  },
});

type ConditionRow = { kosul: string; sonuc: string };

const CONDITION_ROWS: ConditionRow[] = [
  { kosul: 'Yağmur yağarsa', sonuc: 'maç ertelenir' },
  { kosul: 'Erken kalkarsan', sonuc: 'otobüse yetişirsin' },
  { kosul: 'Ödevini bitirirsen', sonuc: 'parka gidebilirsin' },
  { kosul: 'Sütü kaynatmazsan', sonuc: 'bozulur' },
  { kosul: 'Yeterince çalışırsan', sonuc: 'sınavı kazanırsın' },
  { kosul: 'Hava açarsa', sonuc: 'pikniğe gideriz' },
  { kosul: 'Kitabı okursan', sonuc: 'konuyu daha iyi anlarsın' },
  { kosul: 'Trafik olmazsa', sonuc: 'eve erken varırız' },
  { kosul: 'Suyu düzenli vermezsen', sonuc: 'çiçekler solar' },
  { kosul: 'Işıkları kapatırsan', sonuc: 'elektrik tasarrufu sağlarsın' },
  { kosul: 'Soruyu dikkatli okursan', sonuc: 'hatayı fark edersin' },
  { kosul: 'Erken yatarsan', sonuc: 'sabah dinç uyanırsın' },
  { kosul: 'Buzdolabına koymazsan', sonuc: 'yemek bozulur' },
  { kosul: 'Planlı çalışırsan', sonuc: 'zamanını verimli kullanırsın' },
  { kosul: 'Yağmur dinerse', sonuc: 'yürüyüşe çıkarız' },
  { kosul: 'Doğru adresi yazarsan', sonuc: 'mektup yerine ulaşır' },
  { kosul: 'Spor yaparsan', sonuc: 'kasların güçlenir' },
  { kosul: 'Sınavda acele etmezsen', sonuc: 'hata yapma riskin azalır' },
  { kosul: 'Bahçeyi sulamazsan', sonuc: 'çimler kurur' },
  { kosul: 'Kask takarsan', sonuc: 'bisiklet sürerken güvende olursun' },
  { kosul: 'Kitabı kütüphaneye götürürsen', sonuc: 'ceza almazsın' },
  { kosul: 'Telefonu şarj edersen', sonuc: 'yol boyunca kullanabilirsin' },
  { kosul: 'Konuyu tekrar edersen', sonuc: 'bilgiler kalıcı olur' },
];

fill({
  course: TR,
  topic: 'Anlam İlişkileri',
  slug: 'kosul',
  count: 23,
  make: (attempt) => {
    const r = CONDITION_ROWS[attempt % CONDITION_ROWS.length];
    const sentence = `${r.kosul} ${r.sonuc}.`;
    const d1 = CONDITION_ROWS[(attempt + 3) % CONDITION_ROWS.length];
    const d2 = CONDITION_ROWS[(attempt + 8) % CONDITION_ROWS.length];
    return {
      prompt: `“${sentence}” cümlesinde koşul bildiren bölüm hangisidir?`,
      answer: r.kosul,
      distractors: [r.sonuc, d1.kosul, d2.kosul],
      explanation: `“${r.kosul}” bölümü “-sa/-se” ekiyle bir şart ortaya koyar; “${r.sonuc}” bu şart gerçekleşirse olacak durumdur.`,
    };
  },
});

type IdiomRow = { soz: string; anlam: string };

const IDIOM_ROWS: IdiomRow[] = [
  { soz: 'Göz atmak', anlam: 'kısa bir süre bakmak' },
  { soz: 'Kulak kabartmak', anlam: 'dikkatle dinlemek' },
  { soz: 'Ağzı kulaklarına varmak', anlam: 'çok sevinmek' },
  { soz: 'Eli kulağında olmak', anlam: 'çok yakında gerçekleşmek' },
  { soz: 'Burnu büyümek', anlam: 'kendini üstün görmek' },
  { soz: 'Can kulağıyla dinlemek', anlam: 'büyük bir dikkatle dinlemek' },
  { soz: 'Gözü kara olmak', anlam: 'cesur davranmak' },
  { soz: 'Dili tutulmak', anlam: 'heyecandan konuşamaz olmak' },
  { soz: 'İçi rahat etmek', anlam: 'kaygısı ortadan kalkmak' },
  { soz: 'Yüreği ağzına gelmek', anlam: 'çok korkmak' },
  { soz: 'Pabucu dama atılmak', anlam: 'değerini yitirmek' },
  { soz: 'Etekleri zil çalmak', anlam: 'çok sevinçli olmak' },
  { soz: 'Kaşları çatılmak', anlam: 'öfkelenmek, hoşnutsuzluk göstermek' },
  { soz: 'Ağzı açık kalmak', anlam: 'şaşkınlıktan ne yapacağını bilememek' },
  { soz: 'Suya sabuna dokunmamak', anlam: 'tartışmalı konulardan uzak durmak' },
  { soz: 'Bir çuval inciri berbat etmek', anlam: 'iyi giden işi bozmak' },
  { soz: 'Kafasına koymak', anlam: 'bir işi yapmaya kesin karar vermek' },
  { soz: 'Gözü yükseklerde olmak', anlam: 'çok büyük hedefler peşinde olmak' },
  { soz: 'Ayakları yere basmamak', anlam: 'gerçeklerden kopuk düşünmek' },
  { soz: 'Dişini sıkmak', anlam: 'zorluğa sabırla dayanmak' },
  { soz: 'Kalbi kırılmak', anlam: 'gücenmek, incinmek' },
  { soz: 'Yol göstermek', anlam: 'rehberlik etmek, öncülük etmek' },
  { soz: 'Sözünü tutmak', anlam: 'verdiği sözü yerine getirmek' },
];

fill({
  course: TR,
  topic: 'Anlam İlişkileri',
  slug: 'deyim',
  count: 23,
  make: (attempt) => {
    const r = IDIOM_ROWS[attempt % IDIOM_ROWS.length];
    const d1 = IDIOM_ROWS[(attempt + 4) % IDIOM_ROWS.length];
    const d2 = IDIOM_ROWS[(attempt + 9) % IDIOM_ROWS.length];
    const d3 = IDIOM_ROWS[(attempt + 15) % IDIOM_ROWS.length];
    return {
      prompt: `“${r.soz}” sözünün cümledeki anlamı hangisidir?`,
      answer: r.anlam,
      distractors: [d1.anlam, d2.anlam, d3.anlam],
      explanation: `“${r.soz}” kalıplaşmış bir sözdür ve gerçek anlamıyla değil, “${r.anlam}” anlamıyla kullanılır.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Türkçe 3: Paragrafta Ana Düşünce                                  */
/* ---------------------------------------------------------------- */

type Theme = {
  konu: string;
  title: string;
  intro: string;
  detail: string;
  examples: string[];
  main: string;
};

const THEMES: Theme[] = [
  {
    konu: 'kitap okuma alışkanlığı',
    title: 'Kitapların Açtığı Kapılar',
    intro: 'Düzenli kitap okumak, insanın dünyaya bakışını yavaş yavaş değiştirir.',
    detail: 'Okuyan kişi, kendi çevresinin dışındaki hayatları da tanıma fırsatı bulur.',
    examples: [
      'Bir öğrenci, roman okudukça yeni sözcükler öğrenir ve bunları günlük konuşmasında kullanır.',
      'Kütüphanede geçirilen bir saat, birçok farklı konuda fikir sahibi olmayı sağlar.',
      'Her akşam yarım saat okuyan biri, yıl sonunda onlarca kitabı bitirmiş olur.',
      'Bir öyküde anlatılan olay, okurun kendi yaşadıklarına başka bir açıdan bakmasını sağlar.',
    ],
    main: 'Düzenli okumak, insanın hem söz varlığını hem de düşünme biçimini geliştirir.',
  },
  {
    konu: 'düzenli spor yapmanın sağlığa etkisi',
    title: 'Hareketin Getirdiği Sağlık',
    intro: 'Her gün yapılan kısa bir yürüyüş bile bedeni ve zihni olumlu etkiler.',
    detail: 'Hareket eden bir beden, gün boyunca daha az yorgunluk hisseder.',
    examples: [
      'Sabahları yirmi dakika yürüyen bir öğrenci, derslerde daha kolay odaklanır.',
      'Düzenli yüzme, solunum kaslarını güçlendirir ve nefes almayı kolaylaştırır.',
      'Haftada üç gün bisiklete binen bir kişi, merdiven çıkarken zorlanmaz.',
      'Oyun oynarken koşup zıplayan çocuklar, gün sonunda daha rahat uyur.',
    ],
    main: 'Düzenli hareket, beden sağlığını korurken dikkat ve uyku düzenini de iyileştirir.',
  },
  {
    konu: 'su tasarrufu',
    title: 'Bir Damlanın Değeri',
    intro: 'Su, sınırsız bir kaynak değildir ve her damlası dikkatle kullanılmalıdır.',
    detail: 'Evde alınacak küçük önlemler, yıllık su tüketimini ciddi biçimde azaltır.',
    examples: [
      'Diş fırçalarken musluğu kapatmak, günde birkaç litre suyu kurtarır.',
      'Bozuk musluk tamir edildiğinde aylık su faturası da düşer.',
      'Bahçe sulamasını akşam saatlerine almak, buharlaşmayla kaybolan suyu azaltır.',
      'Duş süresini kısaltmak, bir ailede yılda tonlarca su tasarrufu sağlar.',
    ],
    main: 'Küçük günlük alışkanlıklar, su kaynaklarının korunmasında büyük fark yaratır.',
  },
  {
    konu: 'geri dönüşüm',
    title: 'Atığın İkinci Hayatı',
    intro: 'Kullanılmış kâğıt, cam ve plastik aslında çöp değil, yeni bir ürünün ham maddesidir.',
    detail: 'Ayrıştırılan atıklar, doğaya karışmadan yeniden üretime katılır.',
    examples: [
      'Bir ton kâğıdın geri dönüştürülmesi, onlarca ağacın kesilmesini önler.',
      'Cam şişeler eritilerek yeniden şişe hâline getirilebilir.',
      'Plastik kutular ayrı toplandığında denize ulaşan atık miktarı azalır.',
      'Okullarda kurulan toplama kutuları, öğrencilere ayrıştırma alışkanlığı kazandırır.',
    ],
    main: 'Atıkları ayrıştırmak, doğal kaynakları korumanın en kolay yollarından biridir.',
  },
  {
    konu: 'empati kurmak',
    title: 'Kendini Yerine Koymak',
    intro: 'Bir olayı anlamanın ilk adımı, karşımızdaki kişinin yerine kendimizi koymaktır.',
    detail: 'Empati kuran kişi, yargılamadan önce dinlemeyi öğrenir.',
    examples: [
      'Arkadaşının üzgün olduğunu fark eden bir öğrenci, önce onu dinler.',
      'Tartışma sırasında karşısındakinin sözünü kesmeyen kişi, sorunu daha kolay çözer.',
      'Yeni gelen bir öğrenciye yol gösteren çocuk, onun çekingenliğini anlar.',
      'Bir hata yapan arkadaşına kızmadan önce nedenini soran kişi, ilişkisini güçlendirir.',
    ],
    main: 'Empati, ilişkileri güçlendiren ve anlaşmazlıkları azaltan temel bir beceridir.',
  },
  {
    konu: 'planlı çalışma',
    title: 'Küçük Adımların Gücü',
    intro: 'Büyük hedefler, günlük küçük ve düzenli adımlarla gerçekleşir.',
    detail: 'Çalışmasını planlayan öğrenci, ne zaman ne yapacağını bilir.',
    examples: [
      'Her gün yarım saat tekrar yapan bir öğrenci, sınav haftasında paniğe kapılmaz.',
      'Yapılacaklar listesi tutan kişi, işlerini son güne bırakmaz.',
      'Bir konuyu üç güne bölen öğrenci, son gece ezber yapmak zorunda kalmaz.',
      'Mola saatlerini de planlayan biri, çalışırken daha verimli olur.',
    ],
    main: 'Düzenli ve planlı çalışmak, başarıyı şansa bırakmadan hedefe ulaşmayı sağlar.',
  },
  {
    konu: 'doğayı gözlemlemek',
    title: 'Yakındaki Dünya',
    intro: 'Doğa, gözlemlemeyi bilen için her gün yeni bir ayrıntı sunar.',
    detail: 'Bir ağacın yapraklarındaki değişim, mevsimlerin takvimi gibidir.',
    examples: [
      'Bahçedeki karıncaların taşıdığı yiyecekler, onların çalışma düzenini gösterir.',
      'Sabah açan çiçeklerin akşam kapanması, ışığın etkisini ortaya koyar.',
      'Göçmen kuşların sonbaharda sürü hâlinde gitmesi, mevsim değişimini haber verir.',
      'Bir ağacın gövdesindeki halkalar, onun kaç yaşında olduğunu anlatır.',
    ],
    main: 'Doğayı dikkatle gözlemlemek, canlıların yaşam düzenini anlamayı kolaylaştırır.',
  },
  {
    konu: 'teknolojiyi bilinçli kullanmak',
    title: 'Ekranın Ölçüsü',
    intro: 'Teknoloji hayatı kolaylaştırır, ancak kullanım süresi denetlenmezse zarar verir.',
    detail: 'Ekran başında geçen uzun saatler, gözleri ve dikkati yorar.',
    examples: [
      'Ders çalışırken telefonu başka odada bırakan öğrenci, işini daha kısa sürede bitirir.',
      'Yatmadan bir saat önce ekranı kapatmak, uykuya geçişi kolaylaştırır.',
      'Oyun süresini önceden belirleyen çocuk, arkadaşlarıyla oynamaya da zaman ayırır.',
      'İnternette karşılaştığı bilgiyi kaynağından kontrol eden kişi, yanlış habere kanmaz.',
    ],
    main: 'Teknolojiden yararlanmak, onu ölçülü ve bilinçli kullanmayı gerektirir.',
  },
  {
    konu: 'trafikte güvenlik',
    title: 'Yolda Dikkat',
    intro: 'Trafikte güvenlik, herkesin kurallara uymasıyla başlar.',
    detail: 'Bir saniyelik dikkatsizlik, telafisi zor sonuçlara yol açabilir.',
    examples: [
      'Yaya geçidini kullanan kişi, kendisini sürücüler için görünür kılar.',
      'Bisiklet sürerken kask takan çocuk, olası bir düşmede korunur.',
      'Otobüsten inerken önce yolu kontrol eden yolcu, tehlikeyi önler.',
      'Kavşağa yaklaşırken hızını azaltan sürücü, ani fren yapmak zorunda kalmaz.',
    ],
    main: 'Trafik kurallarına uymak, hem kendi hem de başkalarının hayatını korur.',
  },
  {
    konu: 'para biriktirme',
    title: 'Kumbaranın Dersi',
    intro: 'Para yönetmeyi öğrenmek, küçük yaşta atılan bir adımdır.',
    detail: 'Nereye ne kadar harcadığını bilen kişi, gereksiz alışverişten kaçınır.',
    examples: [
      'Harçlığının bir kısmını ayıran öğrenci, istediği kitabı kendi parasıyla alır.',
      'Alışverişe liste ile giden kişi, ihtiyacı olmayan ürünleri almaz.',
      'Büyük bir oyuncak için üç ay biriktiren çocuk, sabretmeyi öğrenir.',
      'Harcamalarını deftere yazan kişi, ay sonunda parasının nereye gittiğini görür.',
    ],
    main: 'Küçük birikimler, sabırlı ve planlı harcama alışkanlığı kazandırır.',
  },
  {
    konu: 'evcil hayvan bakımı',
    title: 'Bir Canın Sorumluluğu',
    intro: 'Evcil bir hayvan edinmek, bir canlının yaşamından sorumlu olmak demektir.',
    detail: 'Beslenme, temizlik ve ilgi her gün düzenli olarak yapılmalıdır.',
    examples: [
      'Kedinin mamasını her sabah aynı saatte veren çocuk, düzen kurmayı öğrenir.',
      'Köpeğini her akşam gezdiren kişi, hayvanının hareket ihtiyacını karşılar.',
      'Kuşun kafesini haftada bir temizleyen çocuk, sağlığı için gerekli bakımı yapar.',
      'Tatilde hayvanını yalnız bırakmayan aile, ona emanet bilinciyle yaklaşır.',
    ],
    main: 'Bir hayvanın bakımını üstlenmek, sorumluluk ve düzenli ilgi gerektirir.',
  },
  {
    konu: 'müzelerin önemi',
    title: 'Geçmişin Saklandığı Yer',
    intro: 'Müzeler, bir toplumun geçmişini gelecek kuşaklara aktaran yerlerdir.',
    detail: 'Sergilenen eşyalar, yaşanmış dönemlerin günlük hayatını gösterir.',
    examples: [
      'Bir çömlek parçası, o dönemde kullanılan kapların biçimini anlatır.',
      'Eski bir mektup, geçmişte insanların nasıl haberleştiğini ortaya koyar.',
      'Müzedeki dokuma örnekleri, o yörenin el sanatlarını tanıtır.',
      'Rehber eşliğinde gezilen bir sergi, eşyaların hikâyesini canlandırır.',
    ],
    main: 'Müzeler, geçmişi belgeleyerek toplumun kültürel birikimini korur.',
  },
];

function paraFull(theme: Theme, variant: number): string {
  return `${theme.intro} ${theme.detail} ${theme.examples[variant % theme.examples.length]}`;
}

fill({
  course: TR,
  topic: 'Paragrafta Ana Düşünce',
  slug: 'ana-dusunce',
  count: 29,
  make: (attempt) => {
    const theme = THEMES[attempt % THEMES.length];
    const variant = Math.floor(attempt / THEMES.length);
    const text = paraFull(theme, variant);
    const d1 = THEMES[(attempt + 3) % THEMES.length];
    const d2 = THEMES[(attempt + 5) % THEMES.length];
    const d3 = THEMES[(attempt + 8) % THEMES.length];
    return {
      prompt: `${text} Bu paragrafın ana düşüncesi hangisidir?`,
      answer: theme.main,
      distractors: [d1.main, d2.main, d3.main],
      explanation: `Paragraftaki örneklerin hepsi ${theme.konu} konusunu işler; bu örneklerden çıkan ortak yargı “${theme.main}” cümlesidir.`,
    };
  },
});

fill({
  course: TR,
  topic: 'Paragrafta Ana Düşünce',
  slug: 'paragraf-tamamlama',
  count: 29,
  make: (attempt) => {
    const theme = THEMES[attempt % THEMES.length];
    const variant = Math.floor(attempt / THEMES.length);
    const text = paraFull(theme, variant);
    const answer = theme.examples[(variant + 1) % theme.examples.length];
    const d1 = THEMES[(attempt + 2) % THEMES.length];
    const d2 = THEMES[(attempt + 6) % THEMES.length];
    const d3 = THEMES[(attempt + 10) % THEMES.length];
    return {
      prompt: `${text} Bu paragrafın sonuna aşağıdakilerden hangisi getirilirse anlam bütünlüğü sağlanır?`,
      answer,
      distractors: [
        d1.examples[variant % d1.examples.length],
        d2.examples[variant % d2.examples.length],
        d3.examples[(variant + 1) % d3.examples.length],
      ],
      explanation: `Paragraf ${theme.konu} konusunu sürdürdüğü için sonraki cümle de bu konuya bağlı kalmalıdır; öteki seçenekler başka konulara geçer.`,
    };
  },
});

fill({
  course: TR,
  topic: 'Paragrafta Ana Düşünce',
  slug: 'baslik',
  count: 29,
  make: (attempt) => {
    const theme = THEMES[attempt % THEMES.length];
    const variant = Math.floor(attempt / THEMES.length) + 2;
    const text = paraFull(theme, variant);
    const d1 = THEMES[(attempt + 1) % THEMES.length];
    const d2 = THEMES[(attempt + 4) % THEMES.length];
    const d3 = THEMES[(attempt + 9) % THEMES.length];
    return {
      prompt: `${text} Bu paragrafa en uygun başlık hangisidir?`,
      answer: theme.title,
      distractors: [d1.title, d2.title, d3.title],
      explanation: `Paragrafın bütünü ${theme.konu} ile ilgilidir; bu nedenle başlık da bu konuyu yansıtan “${theme.title}” olmalıdır.`,
    };
  },
});

fill({
  course: TR,
  topic: 'Paragrafta Ana Düşünce',
  slug: 'konu',
  count: 29,
  make: (attempt) => {
    const theme = THEMES[attempt % THEMES.length];
    const variant = Math.floor(attempt / THEMES.length) + 3;
    const text = paraFull(theme, variant);
    const d1 = THEMES[(attempt + 2) % THEMES.length];
    const d2 = THEMES[(attempt + 7) % THEMES.length];
    const d3 = THEMES[(attempt + 11) % THEMES.length];
    return {
      prompt: `${text} Bu paragrafta üzerinde durulan konu hangisidir?`,
      answer: theme.konu,
      distractors: [d1.konu, d2.konu, d3.konu],
      explanation: `Paragraftaki ayrıntıların ortak noktası ${theme.konu} olduğu için paragrafın konusu budur.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Sosyal Bilgiler 1: Türkiye ve Yer Bilgisi                         */
/* ---------------------------------------------------------------- */

type Province = { il: string; bolge: string };

const PROVINCES: Province[] = [
  { il: 'Bursa', bolge: 'Marmara' },
  { il: 'Kocaeli', bolge: 'Marmara' },
  { il: 'Edirne', bolge: 'Marmara' },
  { il: 'Çanakkale', bolge: 'Marmara' },
  { il: 'Balıkesir', bolge: 'Marmara' },
  { il: 'Tekirdağ', bolge: 'Marmara' },
  { il: 'İzmir', bolge: 'Ege' },
  { il: 'Manisa', bolge: 'Ege' },
  { il: 'Aydın', bolge: 'Ege' },
  { il: 'Denizli', bolge: 'Ege' },
  { il: 'Muğla', bolge: 'Ege' },
  { il: 'Kütahya', bolge: 'Ege' },
  { il: 'Afyonkarahisar', bolge: 'Ege' },
  { il: 'Antalya', bolge: 'Akdeniz' },
  { il: 'Adana', bolge: 'Akdeniz' },
  { il: 'Mersin', bolge: 'Akdeniz' },
  { il: 'Hatay', bolge: 'Akdeniz' },
  { il: 'Isparta', bolge: 'Akdeniz' },
  { il: 'Kahramanmaraş', bolge: 'Akdeniz' },
  { il: 'Ankara', bolge: 'İç Anadolu' },
  { il: 'Konya', bolge: 'İç Anadolu' },
  { il: 'Kayseri', bolge: 'İç Anadolu' },
  { il: 'Eskişehir', bolge: 'İç Anadolu' },
  { il: 'Sivas', bolge: 'İç Anadolu' },
  { il: 'Nevşehir', bolge: 'İç Anadolu' },
  { il: 'Trabzon', bolge: 'Karadeniz' },
  { il: 'Samsun', bolge: 'Karadeniz' },
  { il: 'Rize', bolge: 'Karadeniz' },
  { il: 'Ordu', bolge: 'Karadeniz' },
  { il: 'Tokat', bolge: 'Karadeniz' },
  { il: 'Zonguldak', bolge: 'Karadeniz' },
  { il: 'Erzurum', bolge: 'Doğu Anadolu' },
  { il: 'Van', bolge: 'Doğu Anadolu' },
  { il: 'Kars', bolge: 'Doğu Anadolu' },
  { il: 'Malatya', bolge: 'Doğu Anadolu' },
  { il: 'Elazığ', bolge: 'Doğu Anadolu' },
  { il: 'Gaziantep', bolge: 'Güneydoğu Anadolu' },
  { il: 'Şanlıurfa', bolge: 'Güneydoğu Anadolu' },
  { il: 'Diyarbakır', bolge: 'Güneydoğu Anadolu' },
  { il: 'Mardin', bolge: 'Güneydoğu Anadolu' },
];

const REGION_NAMES = [
  'Marmara',
  'Ege',
  'Akdeniz',
  'İç Anadolu',
  'Karadeniz',
  'Doğu Anadolu',
  'Güneydoğu Anadolu',
];

function otherRegions(region: string): string[] {
  return REGION_NAMES.filter((name) => name !== region);
}

fill({
  course: SOS,
  topic: 'Türkiye ve Yer Bilgisi',
  slug: 'il-bolge',
  count: 20,
  make: (attempt) => {
    const row = PROVINCES[attempt % PROVINCES.length];
    const [d1, d2, d3] = otherRegions(row.bolge).slice(attempt % 3, (attempt % 3) + 3);
    const chosen = [d1, d2, d3].length === 3 ? [d1, d2, d3] : otherRegions(row.bolge).slice(0, 3);
    return {
      prompt: `“${row.il}” ili hangi coğrafi bölgede yer alır?`,
      answer: row.bolge,
      distractors: chosen,
      explanation: `${row.il}, ${row.bolge} Bölgesi sınırları içinde yer alır; coğrafi bölgeler doğal ve beşerî ölçütlere göre belirlenmiştir.`,
    };
  },
});

fill({
  course: SOS,
  topic: 'Türkiye ve Yer Bilgisi',
  slug: 'bolge-il',
  count: 29,
  make: (attempt) => {
    const row = PROVINCES[attempt % PROVINCES.length];
    const sameRegion = PROVINCES.filter((p) => p.bolge === row.bolge && p.il !== row.il);
    const answer = sameRegion[attempt % sameRegion.length];
    const others = PROVINCES.filter((p) => p.bolge !== row.bolge);
    const d1 = others[(attempt * 3) % others.length];
    const d2 = others[(attempt * 5 + 7) % others.length];
    const d3 = others[(attempt * 7 + 13) % others.length];
    return {
      prompt: `“${row.il}” ili ile aynı coğrafi bölgede yer alan il hangisidir?`,
      answer: answer.il,
      distractors: [d1.il, d2.il, d3.il],
      explanation: `${row.il} ve ${answer.il} aynı bölgede, ${row.bolge} Bölgesi’nde yer alır; öteki iller farklı bölgelere aittir.`,
    };
  },
});

type Feature = { bolge: string; tur: string; metin: string };

const FEATURES: Feature[] = [
  { bolge: 'İç Anadolu', tur: 'iklim', metin: 'karasal iklim görülür; yazlar sıcak ve kurak, kışlar soğuk geçer' },
  { bolge: 'İç Anadolu', tur: 'yağış', metin: 'yıllık yağış azdır, bozkır bitki örtüsü yaygındır' },
  { bolge: 'İç Anadolu', tur: 'yeryüzü', metin: 'geniş platolar ve kapalı havzalar yer alır' },
  { bolge: 'İç Anadolu', tur: 'tarım', metin: 'buğday ve şeker pancarı üretimi öne çıkar' },
  { bolge: 'Karadeniz', tur: 'iklim', metin: 'her mevsim yağışlı, ılıman bir iklim görülür' },
  { bolge: 'Karadeniz', tur: 'yağış', metin: 'yıllık yağış fazladır ve nem oranı yüksektir' },
  { bolge: 'Karadeniz', tur: 'yeryüzü', metin: 'dağlar kıyıya paralel uzandığı için kıyıdan iç kesime geçiş zordur' },
  { bolge: 'Karadeniz', tur: 'tarım', metin: 'çay ve fındık üretimi öne çıkar' },
  { bolge: 'Akdeniz', tur: 'iklim', metin: 'yazlar sıcak ve kurak, kışlar ılık ve yağışlı geçer' },
  { bolge: 'Akdeniz', tur: 'yağış', metin: 'yağış kış aylarında yoğunlaşır' },
  { bolge: 'Akdeniz', tur: 'yeryüzü', metin: 'kıyıda geniş ovalar, iç kesimde Toros Dağları yer alır' },
  { bolge: 'Akdeniz', tur: 'tarım', metin: 'turunçgil yetiştiriciliği ve seracılık yaygındır' },
  { bolge: 'Ege', tur: 'iklim', metin: 'Akdeniz iklimi görülür; yazlar sıcak, kışlar ılıktır' },
  { bolge: 'Ege', tur: 'yağış', metin: 'dağların denize dik uzanması yağışın iç kesime ulaşmasını sağlar' },
  { bolge: 'Ege', tur: 'yeryüzü', metin: 'dağlar kıyıya dik uzanır, ovalar doğu-batı doğrultusundadır' },
  { bolge: 'Ege', tur: 'tarım', metin: 'incir, üzüm ve zeytin üretimi öne çıkar' },
  { bolge: 'Marmara', tur: 'iklim', metin: 'Karadeniz ile Akdeniz iklimleri arasında geçiş özelliği gösterir' },
  { bolge: 'Marmara', tur: 'yağış', metin: 'yağış yılın bütün aylarına dağılmıştır' },
  { bolge: 'Marmara', tur: 'yeryüzü', metin: 'dağlar alçak, platolar geniştir' },
  { bolge: 'Marmara', tur: 'tarım', metin: 'ayçiçeği ve zeytin üretimi yaygındır' },
  { bolge: 'Doğu Anadolu', tur: 'iklim', metin: 'sert karasal iklim görülür; kışlar uzun ve çok soğuktur' },
  { bolge: 'Doğu Anadolu', tur: 'yağış', metin: 'kar yağışı fazladır ve kar yerde uzun süre kalır' },
  { bolge: 'Doğu Anadolu', tur: 'yeryüzü', metin: 'Türkiye’nin en yüksek dağları ve platoları bu bölgededir' },
  { bolge: 'Doğu Anadolu', tur: 'tarım', metin: 'hayvancılık ve kayısı üretimi öne çıkar' },
  { bolge: 'Güneydoğu Anadolu', tur: 'iklim', metin: 'karasal iklim görülür; yazlar çok sıcak ve kuraktır' },
  { bolge: 'Güneydoğu Anadolu', tur: 'yağış', metin: 'yağış azdır, kuraklık belirgindir' },
  { bolge: 'Güneydoğu Anadolu', tur: 'yeryüzü', metin: 'platolar geniş yer kaplar, GAP sulama alanları bulunur' },
  { bolge: 'Güneydoğu Anadolu', tur: 'tarım', metin: 'pamuk ve antep fıstığı üretimi öne çıkar' },
];

const FEATURE_LABEL: Record<string, string> = {
  iklim: 'iklim',
  yağış: 'yağış',
  yeryüzü: 'yeryüzü şekilleri',
  tarım: 'tarım',
};

fill({
  course: SOS,
  topic: 'Türkiye ve Yer Bilgisi',
  slug: 'bolge-ozellik',
  count: 28,
  make: (attempt) => {
    const row = FEATURES[attempt % FEATURES.length];
    const sameKind = FEATURES.filter((f) => f.tur === row.tur && f.bolge !== row.bolge);
    const d1 = sameKind[attempt % sameKind.length];
    const d2 = sameKind[(attempt + 2) % sameKind.length];
    const d3 = sameKind[(attempt + 4) % sameKind.length];
    return {
      prompt: `${row.bolge} Bölgesi’nin ${FEATURE_LABEL[row.tur]} özelliği hangisidir?`,
      answer: row.metin,
      distractors: [d1.metin, d2.metin, d3.metin],
      explanation: `${row.bolge} Bölgesi’nde ${row.metin}; bu durum bölgenin konumu ve yeryüzü şekilleriyle açıklanır.`,
    };
  },
});

type Economy = { il: string; urun: string; d: string[] };

const ECONOMY: Economy[] = [
  { il: 'Ordu', urun: 'fındık', d: ['Konya', 'Antalya', 'İzmir'] },
  { il: 'Rize', urun: 'çay', d: ['Konya', 'Manisa', 'Gaziantep'] },
  { il: 'Aydın', urun: 'incir', d: ['Erzurum', 'Samsun', 'Konya'] },
  { il: 'Manisa', urun: 'üzüm', d: ['Rize', 'Erzurum', 'Mersin'] },
  { il: 'Malatya', urun: 'kayısı', d: ['Rize', 'Muğla', 'Kocaeli'] },
  { il: 'Gaziantep', urun: 'antep fıstığı', d: ['Rize', 'Bolu', 'İzmir'] },
  { il: 'Şanlıurfa', urun: 'pamuk', d: ['Rize', 'Erzurum', 'Bursa'] },
  { il: 'Muğla', urun: 'zeytin', d: ['Rize', 'Konya', 'Samsun'] },
  { il: 'Antalya', urun: 'turunçgil', d: ['Erzurum', 'Konya', 'Samsun'] },
  { il: 'Samsun', urun: 'tütün', d: ['Konya', 'Antalya', 'Bursa'] },
  { il: 'Konya', urun: 'şeker pancarı', d: ['Rize', 'Antalya', 'Trabzon'] },
  { il: 'Afyonkarahisar', urun: 'mermer', d: ['Rize', 'Antalya', 'Samsun'] },
  { il: 'Trabzon', urun: 'balıkçılık', d: ['Konya', 'Gaziantep', 'Denizli'] },
  { il: 'Bursa', urun: 'otomotiv', d: ['Erzurum', 'Rize', 'Mardin'] },
  { il: 'Denizli', urun: 'tekstil', d: ['Erzurum', 'Rize', 'Konya'] },
  { il: 'Kütahya', urun: 'seramik', d: ['Rize', 'Antalya', 'Mardin'] },
  { il: 'Eskişehir', urun: 'bor madeni', d: ['Rize', 'Antalya', 'Trabzon'] },
  { il: 'Batman', urun: 'petrol', d: ['Rize', 'Konya', 'Bursa'] },
  { il: 'Isparta', urun: 'elma', d: ['Rize', 'Samsun', 'Trabzon'] },
  { il: 'Isparta', urun: 'gül', d: ['Rize', 'Konya', 'Samsun'] },
  { il: 'Antalya', urun: 'muz', d: ['Erzurum', 'Konya', 'Samsun'] },
  { il: 'Edirne', urun: 'ayçiçeği', d: ['Rize', 'Antalya', 'Muğla'] },
  { il: 'Edirne', urun: 'pirinç', d: ['Rize', 'Konya', 'Antalya'] },
  { il: 'Afyonkarahisar', urun: 'haşhaş', d: ['Rize', 'Antalya', 'Samsun'] },
  { il: 'Aydın', urun: 'kestane', d: ['Konya', 'Erzurum', 'Gaziantep'] },
  { il: 'Muğla', urun: 'bal', d: ['Konya', 'Mardin', 'Şanlıurfa'] },
  { il: 'Mersin', urun: 'çilek', d: ['Erzurum', 'Konya', 'Rize'] },
  { il: 'Diyarbakır', urun: 'mercimek', d: ['Rize', 'Antalya', 'Muğla'] },
  { il: 'Adana', urun: 'karpuz', d: ['Rize', 'Erzurum', 'Kocaeli'] },
  { il: 'Kastamonu', urun: 'sarımsak', d: ['Antalya', 'Konya', 'İzmir'] },
];

fill({
  course: SOS,
  topic: 'Türkiye ve Yer Bilgisi',
  slug: 'ekonomi',
  count: 30,
  make: (attempt) => {
    const row = ECONOMY[attempt % ECONOMY.length];
    return {
      prompt: `“${row.urun}” üretiminde öne çıkan il hangisidir?`,
      answer: row.il,
      distractors: row.d,
      explanation: `${row.il}, ${row.urun} üretiminde öne çıkan iller arasındadır; bölgenin iklimi ve toprak yapısı bu üretimi destekler.`,
    };
  },
});

type Neighbor = { ulke: string; yon: string };

const COMPASS = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı'];

const NEIGHBORS: Neighbor[] = [
  { ulke: 'Yunanistan', yon: 'batı' },
  { ulke: 'Bulgaristan', yon: 'kuzeybatı' },
  { ulke: 'Gürcistan', yon: 'kuzeydoğu' },
  { ulke: 'Ermenistan', yon: 'doğu' },
  { ulke: 'İran', yon: 'doğu' },
  { ulke: 'Irak', yon: 'güneydoğu' },
  { ulke: 'Suriye', yon: 'güney' },
  { ulke: 'Azerbaycan’ın Nahçıvan bölgesi', yon: 'doğu' },
];

const NEIGHBOR_EXTRA: Draft[] = [
  {
    prompt: 'Türkiye ile en uzun kara sınırına sahip komşu ülke hangisidir?',
    answer: 'Suriye',
    distractors: ['Yunanistan', 'Gürcistan', 'Bulgaristan'],
    explanation: 'Türkiye’nin en uzun kara sınırı Suriye ile olan sınırdır; bu sınır yaklaşık dokuz yüz kilometre uzunluğundadır.',
  },
  {
    prompt: 'Aşağıdaki ülkelerden hangisi Türkiye’nin doğu yönündeki komşularından biridir?',
    answer: 'İran',
    distractors: ['Yunanistan', 'Bulgaristan', 'Suriye'],
    explanation: 'İran, Türkiye’nin doğu yönünde yer alan komşularından biridir; Yunanistan batıda, Bulgaristan kuzeybatıda, Suriye güneydedir.',
  },
];

fill({
  course: SOS,
  topic: 'Türkiye ve Yer Bilgisi',
  slug: 'komsu-ulke',
  count: 10,
  make: (attempt) => {
    if (attempt < NEIGHBORS.length) {
      const row = NEIGHBORS[attempt];
      const others = COMPASS.filter((dir) => dir !== row.yon).slice(0, 3);
      return {
        prompt: `${row.ulke} Türkiye’nin hangi yönündeki komşusudur?`,
        answer: row.yon,
        distractors: others,
        explanation: `${row.ulke}, Türkiye’nin ${row.yon} yönündeki komşusudur; sınır komşuluğu ticaret ve ulaşım ilişkilerini de etkiler.`,
      };
    }
    return NEIGHBOR_EXTRA[attempt - NEIGHBORS.length] ?? null;
  },
});

/* ---------------------------------------------------------------- */
/* Sosyal Bilgiler 2: Harita ve Yönler                               */
/* ---------------------------------------------------------------- */

const DIRS = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı'];

function dirOptions(answer: string, seedIndex: number): string[] {
  const out: string[] = [];
  for (let step = 1; out.length < 3 && step < 9; step += 1) {
    const candidate = DIRS[(seedIndex + step * 3) % 8];
    if (candidate === answer) continue;
    if (out.includes(candidate)) continue;
    out.push(candidate);
  }
  return out;
}

const YON_CASES: Array<{ prompt: string; answer: string; note: string }> = [];

for (let i = 0; i < 8; i += 1) {
  const answer = DIRS[(i + 4) % 8];
  YON_CASES.push({
    prompt: `“${DIRS[i]}” yönünün tam karşısındaki yön hangisidir?`,
    answer,
    note: `Bir yön ile karşısındaki yön arasında 180 derecelik açı vardır; bu nedenle ${DIRS[i]} yönünün karşısı ${answer} olur.`,
  });
}

for (let i = 0; i < 4; i += 1) {
  const answer = DIRS[i * 2 + 1];
  YON_CASES.push({
    prompt: `“${DIRS[i * 2]}” ile “${DIRS[(i * 2 + 2) % 8]}” yönleri arasındaki ara yön hangisidir?`,
    answer,
    note: `İki ana yönün tam ortasında ara yön bulunur; ${DIRS[i * 2]} ile ${DIRS[(i * 2 + 2) % 8]} arasındaki ara yön ${answer} olur.`,
  });
}

for (let i = 0; i < 8; i += 1) {
  const answer = DIRS[(i + 2) % 8];
  YON_CASES.push({
    prompt: `“${DIRS[i]}” yönüne bakan bir kişi sağına döndüğünde hangi yöne bakar?`,
    answer,
    note: `Sağa dönüş 90 derecelik bir dönüştür; ${DIRS[i]} yönüne bakan kişi sağına döndüğünde ${answer} yönüne bakar.`,
  });
}

for (let i = 0; i < 8; i += 1) {
  const answer = DIRS[(i + 6) % 8];
  YON_CASES.push({
    prompt: `“${DIRS[i]}” yönüne bakan bir kişi soluna döndüğünde hangi yöne bakar?`,
    answer,
    note: `Sola dönüş 90 derecelik bir dönüştür; ${DIRS[i]} yönüne bakan kişi soluna döndüğünde ${answer} yönüne bakar.`,
  });
}

YON_CASES.push({
  prompt: 'Güneş’in doğduğu yön hangisidir?',
  answer: 'doğu',
  note: 'Güneş sabahları doğudan doğar; bu nedenle doğu yönü gün doğusu olarak da adlandırılır.',
});
YON_CASES.push({
  prompt: 'Öğle vakti gölgesi kuzeye düşen bir yerde Güneş hangi yöndedir?',
  answer: 'güney',
  note: 'Gölge kuzeye düşüyorsa Güneş karşı taraftadır; bu durumda Güneş güney yönünde bulunur.',
});

fill({
  course: SOS,
  topic: 'Harita ve Yönler',
  slug: 'yon',
  count: 30,
  make: (attempt) => {
    const item = YON_CASES[attempt];
    if (!item) return null;
    return {
      prompt: item.prompt,
      answer: item.answer,
      distractors: dirOptions(item.answer, attempt),
      explanation: item.note,
    };
  },
});

type RotaCase = { d1: string; d2: string; answer: string };

const ROTA_CASES: RotaCase[] = [];
const ROTA_PAIRS = [
  { a: 'kuzey', b: 'doğu', answer: 'kuzeydoğu' },
  { a: 'kuzey', b: 'batı', answer: 'kuzeybatı' },
  { a: 'güney', b: 'doğu', answer: 'güneydoğu' },
  { a: 'güney', b: 'batı', answer: 'güneybatı' },
];

for (const pair of ROTA_PAIRS) {
  for (const first of [3, 5, 6, 8]) {
    for (const second of [4, 7]) {
      ROTA_CASES.push({ d1: `${first} km ${pair.a}`, d2: `${second} km ${pair.b}`, answer: pair.answer });
    }
  }
}

fill({
  course: SOS,
  topic: 'Harita ve Yönler',
  slug: 'rota',
  count: 29,
  make: (attempt) => {
    const item = ROTA_CASES[attempt];
    if (!item) return null;
    return {
      prompt: `Bir yürüyüşçü başlangıç noktasından önce ${item.d1} yönünde, sonra ${item.d2} yönünde yürüyor. Son konumu başlangıç noktasına göre hangi yöndedir?`,
      answer: item.answer,
      distractors: dirOptions(item.answer, attempt + 3),
      explanation: `İki ayrı yöndeki hareket birleştiğinde konum ${item.answer} yönüne düşer; çünkü ${item.d1} ve ${item.d2} aynı çeyrekte yer alır.`,
    };
  },
});

type ScaleCase = { den: number; len: number };

const SCALE_CASES: ScaleCase[] = [];
for (const den of [50000, 100000, 200000, 250000, 400000, 500000]) {
  for (const len of [2, 3, 4, 5, 6, 8]) {
    SCALE_CASES.push({ den, len });
  }
}

fill({
  course: SOS,
  topic: 'Harita ve Yönler',
  slug: 'olcek',
  count: 29,
  make: (attempt) => {
    const item = SCALE_CASES[attempt];
    if (!item) return null;
    const km = (item.len * item.den) / 100000;
    return {
      prompt: `Ölçeği 1/${item.den} olan bir haritada iki nokta arasındaki uzaklık ${item.len} cm’dir. Bu iki nokta arasındaki gerçek uzaklık kaç km’dir?`,
      answer: `${fmt(km)} km`,
      distractors: numOptions(km, [km * 10, km / 10, km + 1, km * 2]).map((v) => `${v} km`),
      explanation: `${item.len} cm × ${item.den} = ${item.len * item.den} cm gerçek uzaklık eder; 100000 cm 1 km olduğu için sonuç ${fmt(km)} km bulunur.`,
    };
  },
});

type LegendRow = { sembol: string; anlam: string };

const LEGEND_ROWS: LegendRow[] = [
  { sembol: 'mavi renk', anlam: 'deniz, göl ve akarsu gibi su örtüsünü' },
  { sembol: 'yeşil renk', anlam: 'ova, orman ve bitki örtüsünü' },
  { sembol: 'kahverengi renk', anlam: 'dağlık ve yüksek alanları' },
  { sembol: 'eş yükselti eğrisi', anlam: 'aynı yükseltideki noktaları birleştiren çizgiyi' },
  { sembol: 'kırmızı kesik çizgi', anlam: 'ülke sınırlarını' },
  { sembol: 'üçgen işareti', anlam: 'dağların en yüksek noktasını' },
  { sembol: 'küçük daire', anlam: 'yerleşim yerlerini' },
  { sembol: 'siyah çizgi ve çentikler', anlam: 'demir yolunu' },
  { sembol: 'taralı mavi alan', anlam: 'bataklık ve sazlık alanları' },
  { sembol: 'ölçek çubuğu', anlam: 'haritadaki uzunluğun gerçek uzunluğa oranını' },
  { sembol: 'pusula gülü', anlam: 'haritanın yönünü ve kuzeyi' },
  { sembol: 'noktalı alan', anlam: 'kumul ve çöl alanlarını' },
];

fill({
  course: SOS,
  topic: 'Harita ve Yönler',
  slug: 'lejant',
  count: 29,
  make: (attempt) => {
    const row = LEGEND_ROWS[attempt % LEGEND_ROWS.length];
    const round = Math.floor(attempt / LEGEND_ROWS.length);
    const stems = [
      `Haritalarda ${row.sembol} hangi bilgiyi verir?`,
      `Bir haritada ${row.sembol} neyi gösterir?`,
      `${row.sembol} harita üzerinde hangi anlama gelir?`,
    ];
    const stem = stems[round % stems.length];
    const d1 = LEGEND_ROWS[(attempt + 3) % LEGEND_ROWS.length];
    const d2 = LEGEND_ROWS[(attempt + 6) % LEGEND_ROWS.length];
    const d3 = LEGEND_ROWS[(attempt + 9) % LEGEND_ROWS.length];
    return {
      prompt: stem,
      answer: row.anlam,
      distractors: [d1.anlam, d2.anlam, d3.anlam],
      explanation: `Harita lejantında ${row.sembol} ${row.anlam} göstermek için kullanılır; işaretler haritanın okunmasını kolaylaştırır.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Sosyal Bilgiler 3: Demokrasi ve Katılım                           */
/* ---------------------------------------------------------------- */

type ConceptRow = { ad: string; tanim: string };

const DEMO_ROWS: ConceptRow[] = [
  { ad: 'demokrasi', tanim: 'halkın seçtiği temsilciler aracılığıyla yönetime katıldığı yönetim biçimi' },
  { ad: 'egemenlik', tanim: 'devlet gücünü kullanma yetkisi' },
  { ad: 'çoğunluk yönetimi', tanim: 'kararların en fazla oyu alan görüşe göre alınması' },
  { ad: 'azınlık hakları', tanim: 'az oyu alan görüşlerin de düşüncesini açıklayabilmesi' },
  { ad: 'hukuk devleti', tanim: 'devletin kendi koyduğu kurallara kendisinin de uyması' },
  { ad: 'kuvvetler ayrılığı', tanim: 'yasama, yürütme ve yargı görevlerinin ayrı organlara verilmesi' },
  { ad: 'sivil toplum', tanim: 'devletten bağımsız, gönüllü kurulan örgütlenmeler' },
  { ad: 'anayasa', tanim: 'devletin temel kurallarını ve vatandaş haklarını belirleyen en üst yasa' },
  { ad: 'katılım', tanim: 'bireylerin karar süreçlerinde söz sahibi olması' },
  { ad: 'temsil', tanim: 'halk adına karar vermek üzere seçilen kişinin bu görevi yürütmesi' },
  { ad: 'eşitlik', tanim: 'herkesin yasa önünde aynı haklara sahip olması' },
  { ad: 'özgürlük', tanim: 'kişinin başkalarına zarar vermeden istediğini yapabilmesi' },
  { ad: 'halk oylaması', tanim: 'halkın bir konuda doğrudan oy kullanarak karar vermesi' },
  { ad: 'şeffaflık', tanim: 'yönetim kararlarının ve harcamaların halka açık olması' },
  { ad: 'hesap verebilirlik', tanim: 'yöneticilerin yaptıkları işlerin hesabını halka vermesi' },
];

fill({
  course: SOS,
  topic: 'Demokrasi ve Katılım',
  slug: 'demokrasi',
  count: 29,
  make: (attempt) => {
    const row = DEMO_ROWS[attempt % DEMO_ROWS.length];
    const round = Math.floor(attempt / DEMO_ROWS.length);
    const stems = [
      `“${row.ad}” kavramının anlamı hangisidir?`,
      `Aşağıdakilerden hangisi “${row.ad}” kavramını açıklar?`,
    ];
    const d1 = DEMO_ROWS[(attempt + 2) % DEMO_ROWS.length];
    const d2 = DEMO_ROWS[(attempt + 5) % DEMO_ROWS.length];
    const d3 = DEMO_ROWS[(attempt + 9) % DEMO_ROWS.length];
    return {
      prompt: stems[round % stems.length],
      answer: row.tanim,
      distractors: [d1.tanim, d2.tanim, d3.tanim],
      explanation: `Doğru tanım “${row.tanim}”dir; ${row.ad} bu içeriği taşır, öteki seçenekler farklı kavramları anlatır.`,
    };
  },
});

const ELECTION_ROWS: ConceptRow[] = [
  { ad: 'oy kullanma yaşı', tanim: 'on sekiz yaşını doldurmuş olmak' },
  { ad: 'gizli oy', tanim: 'oy verme işleminin kimse görmeden yapılması' },
  { ad: 'açık sayım', tanim: 'oyların herkesin önünde sayılması' },
  { ad: 'seçim', tanim: 'yöneticilerin oy çokluğuyla belirlenmesi' },
  { ad: 'temsilci', tanim: 'seçmenler adına karar veren kişi' },
  { ad: 'seçmen', tanim: 'oy verme hakkı bulunan vatandaş' },
  { ad: 'aday', tanim: 'seçime katılmak için başvuran kişi' },
  { ad: 'sandık kurulu', tanim: 'oy verme işlemini yürüten görevliler' },
  { ad: 'Yüksek Seçim Kurulu', tanim: 'seçimlerin düzenini ve güvenliğini sağlayan kurum' },
  { ad: 'seçim dönemi', tanim: 'milletvekili seçimlerinin yapıldığı beş yıllık süre' },
  { ad: 'sınıf temsilcisi', tanim: 'sınıfın görüşlerini öğretmene ve okul yönetimine taşıyan öğrenci' },
  { ad: 'eşit oy ilkesi', tanim: 'her seçmenin yalnızca bir oy kullanması' },
  { ad: 'serbest seçim', tanim: 'seçmenin baskı altında kalmadan karar vermesi' },
  { ad: 'katılım oranı', tanim: 'seçmenlerin ne kadarının oy kullandığını gösteren oran' },
  { ad: 'seçim sonucu', tanim: 'sandıktan çıkan oyların sayımıyla ortaya çıkan sonuç' },
];

fill({
  course: SOS,
  topic: 'Demokrasi ve Katılım',
  slug: 'secim',
  count: 29,
  make: (attempt) => {
    const row = ELECTION_ROWS[attempt % ELECTION_ROWS.length];
    const round = Math.floor(attempt / ELECTION_ROWS.length);
    const stems = [
      `“${row.ad}” ne anlama gelir?`,
      `Aşağıdakilerden hangisi “${row.ad}” ile ilgili doğru bir açıklamadır?`,
    ];
    const d1 = ELECTION_ROWS[(attempt + 3) % ELECTION_ROWS.length];
    const d2 = ELECTION_ROWS[(attempt + 6) % ELECTION_ROWS.length];
    const d3 = ELECTION_ROWS[(attempt + 10) % ELECTION_ROWS.length];
    return {
      prompt: stems[round % stems.length],
      answer: row.tanim,
      distractors: [d1.tanim, d2.tanim, d3.tanim],
      explanation: `${row.ad}, “${row.tanim}” anlamına gelir; seçimlerde bu ilke ve kurallar güvenilir sonuç için gereklidir.`,
    };
  },
});

const RIGHT_ROWS: ConceptRow[] = [
  { ad: 'eğitim hakkı', tanim: 'herkesin ücretsiz temel eğitim görme hakkı' },
  { ad: 'sağlık hakkı', tanim: 'herkesin sağlık hizmetlerinden yararlanma hakkı' },
  { ad: 'yaşama hakkı', tanim: 'kişinin vücut bütünlüğünün korunması' },
  { ad: 'ifade özgürlüğü', tanim: 'düşünceleri yasal yollarla açıklayabilme' },
  { ad: 'dilekçe hakkı', tanim: 'istek ve şikâyetleri yetkili kuruma yazılı bildirme' },
  { ad: 'seçme ve seçilme hakkı', tanim: 'yönetime oy vererek katılma' },
  { ad: 'konut dokunulmazlığı', tanim: 'konutun yasada belirtilen durumlar dışında aranamaması' },
  { ad: 'özel hayatın gizliliği', tanim: 'kişinin özel yaşamının korunması' },
  { ad: 'çalışma hakkı', tanim: 'iş bulma ve uygun koşullarda çalışma imkânı' },
  { ad: 'din ve vicdan özgürlüğü', tanim: 'inancını özgürce yaşama' },
  { ad: 'çocuk hakları', tanim: 'çocukların oyun, eğitim ve korunma güvencesi' },
  { ad: 'toplantı ve gösteri yürüyüşü hakkı', tanim: 'yasal sınırlar içinde bir araya gelebilme' },
  { ad: 'mülkiyet hakkı', tanim: 'sahip olunan mal üzerinde tasarruf edebilme' },
  { ad: 'adil yargılanma hakkı', tanim: 'savunma yapma ve mahkemeye erişme' },
  { ad: 'haberleşme özgürlüğü', tanim: 'iletişimin gizliliğinin korunması' },
];

fill({
  course: SOS,
  topic: 'Demokrasi ve Katılım',
  slug: 'hak',
  count: 29,
  make: (attempt) => {
    const row = RIGHT_ROWS[attempt % RIGHT_ROWS.length];
    const round = Math.floor(attempt / RIGHT_ROWS.length);
    const stems = [
      `“${row.ad}” hangi hakkı ifade eder?`,
      `Aşağıdakilerden hangisi “${row.ad}” kapsamında yer alır?`,
    ];
    const d1 = RIGHT_ROWS[(attempt + 3) % RIGHT_ROWS.length];
    const d2 = RIGHT_ROWS[(attempt + 6) % RIGHT_ROWS.length];
    const d3 = RIGHT_ROWS[(attempt + 9) % RIGHT_ROWS.length];
    return {
      prompt: stems[round % stems.length],
      answer: row.tanim,
      distractors: [d1.tanim, d2.tanim, d3.tanim],
      explanation: `${row.ad}, “${row.tanim}” anlamına gelir; temel haklar anayasa ile güvence altına alınmıştır.`,
    };
  },
});

const INSTITUTION_ROWS: ConceptRow[] = [
  { ad: 'Türkiye Büyük Millet Meclisi', tanim: 'yasa yapmak ve bütçeyi onaylamak' },
  { ad: 'Cumhurbaşkanlığı', tanim: 'devleti yönetmek ve yasaları uygulamak' },
  { ad: 'mahkemeler', tanim: 'uyuşmazlıkları çözmek ve adaleti sağlamak' },
  { ad: 'Anayasa Mahkemesi', tanim: 'yasaların anayasaya uygunluğunu denetlemek' },
  { ad: 'Sayıştay', tanim: 'kamu harcamalarını denetlemek' },
  { ad: 'Yüksek Seçim Kurulu', tanim: 'seçimleri yönetmek ve sonuçları açıklamak' },
  { ad: 'belediye', tanim: 'şehrin temizlik, su ve ulaşım hizmetlerini yürütmek' },
  { ad: 'muhtarlık', tanim: 'mahallenin nüfus ve ikamet işlemlerine aracılık etmek' },
  { ad: 'valilik', tanim: 'ilde devlet hizmetlerinin yürütülmesini sağlamak' },
  { ad: 'kaymakamlık', tanim: 'ilçede devlet hizmetlerinin yürütülmesini sağlamak' },
  { ad: 'Milli Eğitim Bakanlığı', tanim: 'eğitim ve öğretim hizmetlerini planlamak' },
  { ad: 'Sağlık Bakanlığı', tanim: 'hastane ve sağlık hizmetlerini düzenlemek' },
  { ad: 'Kızılay', tanim: 'afetlerde yardım toplamak ve kan bağışı sağlamak' },
  { ad: 'TEMA', tanim: 'erozyonla mücadele etmek ve ağaçlandırma yapmak' },
  { ad: 'TÜBİTAK', tanim: 'bilimsel araştırmaları desteklemek' },
];

fill({
  course: SOS,
  topic: 'Demokrasi ve Katılım',
  slug: 'kurum',
  count: 29,
  make: (attempt) => {
    const row = INSTITUTION_ROWS[attempt % INSTITUTION_ROWS.length];
    const round = Math.floor(attempt / INSTITUTION_ROWS.length);
    const stems = [
      `“${row.ad}” kurumunun temel görevi hangisidir?`,
      `Aşağıdakilerden hangisi “${row.ad}” kurumunun görevleri arasında yer alır?`,
    ];
    const d1 = INSTITUTION_ROWS[(attempt + 3) % INSTITUTION_ROWS.length];
    const d2 = INSTITUTION_ROWS[(attempt + 7) % INSTITUTION_ROWS.length];
    const d3 = INSTITUTION_ROWS[(attempt + 11) % INSTITUTION_ROWS.length];
    return {
      prompt: stems[round % stems.length],
      answer: row.tanim,
      distractors: [d1.tanim, d2.tanim, d3.tanim],
      explanation: `${row.ad} kurumunun görevi “${row.tanim}”dir; her kurum kamu hizmetinin bir bölümünü yürütür.`,
    };
  },
});

/* ---------------------------------------------------------------- */
/* Dışa aktarım                                                      */
/* ---------------------------------------------------------------- */

export const questions: EmbeddedQuestionSeed[] = bank;
export const topicQuestionIds: Record<string, Record<string, string[]>> = buckets;
