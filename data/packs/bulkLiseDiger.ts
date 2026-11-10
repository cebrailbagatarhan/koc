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
const BIO = 'Biyoloji';
const LIT = 'Edebiyat';
const HIST = 'Tarih';
const ENG = 'İngilizce';

const T_PROT = 'Protein Sentezi';
const T_DNA = 'DNA ve Kalıtım';
const T_RESP = 'Hücresel Solunum';
const T_NARR = 'Anlatmaya Bağlı Metinler';
const T_VOICE = 'Anlatıcı ve Bakış Açısı';
const T_POEM = 'Şiir Bilgisi';
const T_CHRON = 'Kronoloji';
const T_SOURCE = 'Tarihî Kaynaklar';
const T_CAUSE = 'Neden ve Sonuç';
const T_COND = 'Conditionals';
const T_CONJ = 'Bağlaçlar';
const T_ACAD = 'Academic Vocabulary';

const questions: EmbeddedQuestionSeed[] = [];
const topicIds: Record<string, string[]> = {};
const seenPrompts = new Set<string>();

type Draft = {
  prompt: string;
  answer: string;
  distractors: string[];
  explanation: string;
  difficulty: QuestionDifficulty;
};

function push(course: string, topic: string, id: string, draft: Draft) {
  const key = `${draft.prompt}|${draft.answer}`;
  if (seenPrompts.has(key)) throw new Error(`Tekrar eden soru: ${id} — ${draft.prompt}`);
  seenPrompts.add(key);
  questions.push(
    mc({
      id,
      levelName: LEVEL,
      courseName: course,
      prompt: draft.prompt,
      answer: draft.answer,
      distractors: draft.distractors,
      explanation: draft.explanation,
      difficulty: draft.difficulty,
    }),
  );
  topicIds[topic] = [...(topicIds[topic] ?? []), id];
}

function difficultyAt(index: number): QuestionDifficulty {
  const slot = index % 10;
  if (slot < 3) return 'easy';
  if (slot < 8) return 'standard';
  return 'hard';
}

function others(answer: string, pool: string[]): string[] {
  const out: string[] = [];
  for (const item of shuffle(pool)) {
    if (item === answer) continue;
    out.push(item);
    if (out.length === 3) break;
  }
  if (out.length < 3) throw new Error(`Çeldirici yetersiz: ${answer}`);
  return out;
}

function nums(answer: string, candidates: string[]): string[] {
  const out: string[] = [];
  for (const item of candidates) {
    if (item === answer) continue;
    if (out.includes(item)) continue;
    out.push(item);
    if (out.length === 3) break;
  }
  if (out.length < 3) throw new Error(`Sayı çeldiricisi yetersiz: ${answer}`);
  return out;
}

type Fact = [prompt: string, answer: string, pool: string, why: string];

function facts(course: string, topic: string, prefix: string, rows: Fact[]) {
  rows.forEach(([prompt, answer, pool, why], index) => {
    push(course, topic, `${prefix}-${index + 1}`, {
      prompt,
      answer,
      distractors: others(answer, pool.split('|')),
      explanation: why,
      difficulty: difficultyAt(index),
    });
  });
}

/* ---------------------------------------------------------------- */
/* Biyoloji: Protein Sentezi                                         */
/* ---------------------------------------------------------------- */

const AA =
  'Fenilalanin|Lösin|Serin|Tirozin|Sistein|Triptofan|Prolin|Histidin|Glutamin|Arginin|İzolösin|Metiyonin|Treonin|Asparagin|Lizin|Valin|Alanin|Aspartik asit|Glutamik asit|Glisin';
const ORG =
  'Ribozom|Golgi cisimciği|Çekirdekçik|Granüllü endoplazmik retikulum|Çekirdek|Lizozom|Kloroplast|Mitokondri';

facts(BIO, T_PROT, 'bulk-lb-kod', [
  [
    'mRNA’daki AUG kodonu hangi amino asidi şifreler?',
    'Metiyonin',
    AA,
    'Genetik kod tablosunda AUG kodonu metiyonini şifreler ve çeviriyi başlatan kodontur.',
  ],
  [
    'UUU kodonunun genetik kod tablosundaki karşılığı hangisidir?',
    'Fenilalanin',
    AA,
    'UUU kodonu fenilalanin amino asidini şifreler; kodon üç nükleotitten oluşur.',
  ],
  [
    'Translasyonda UUA kodonu hangi amino asidi getirir?',
    'Lösin',
    AA,
    'UUA kodonu lösin amino asidinin karşılığıdır; mRNA üzerindeki üçlü diziler amino asidi belirler.',
  ],
  [
    'mRNA’daki UCU kodonu hangi amino asidi şifreler?',
    'Serin',
    AA,
    'UCU kodonu serini şifreler; serin dört farklı kodonla kodlanabilen amino asitlerden biridir.',
  ],
  [
    'UAU kodonunun genetik kod tablosundaki karşılığı hangisidir?',
    'Tirozin',
    AA,
    'UAU kodonu tirozin amino asidini şifreler; kodonlar mRNA üzerinde okunur.',
  ],
  [
    'Translasyonda UGU kodonu hangi amino asidi getirir?',
    'Sistein',
    AA,
    'UGU kodonu sisteini şifreler; sistein sülfür bağlarıyla protein yapısına katkı sağlar.',
  ],
  [
    'mRNA’daki UGG kodonu hangi amino asidi şifreler?',
    'Triptofan',
    AA,
    'UGG kodonu triptofanı şifreler ve bu amino asidin tek kodonu UGG’dir.',
  ],
  [
    'CCU kodonunun genetik kod tablosundaki karşılığı hangisidir?',
    'Prolin',
    AA,
    'CCU kodonu prolin amino asidini şifreler; kodon okuma çerçevesi üçlü gruplarla ilerler.',
  ],
  [
    'Translasyonda CAU kodonu hangi amino asidi getirir?',
    'Histidin',
    AA,
    'CAU kodonu histidini şifreler; histidin proteinlerin yapısında yer alan bazik amino asitlerdendir.',
  ],
  [
    'mRNA’daki CAA kodonu hangi amino asidi şifreler?',
    'Glutamin',
    AA,
    'CAA kodonu glutamin amino asidini şifreler; baz eşleşmesi kodon-antikodon ilişkisiyle kurulur.',
  ],
  [
    'CGU kodonunun genetik kod tablosundaki karşılığı hangisidir?',
    'Arginin',
    AA,
    'CGU kodonu arginini şifreler; arginin altı farklı kodonla kodlanabilir.',
  ],
  [
    'Translasyonda AUU kodonu hangi amino asidi getirir?',
    'İzolösin',
    AA,
    'AUU kodonu izolösin amino asidini şifreler; kodonlar 5’ ucundan 3’ ucuna okunur.',
  ],
  [
    'mRNA’daki ACU kodonu hangi amino asidi şifreler?',
    'Treonin',
    AA,
    'ACU kodonu treonini şifreler; treonin dört kodonla kodlanan amino asitlerdendir.',
  ],
  [
    'AAU kodonunun genetik kod tablosundaki karşılığı hangisidir?',
    'Asparagin',
    AA,
    'AAU kodonu asparajini şifreler; asparajin proteinlerde yer alan polar amino asitlerdendir.',
  ],
  [
    'Translasyonda AAA kodonu hangi amino asidi getirir?',
    'Lizin',
    AA,
    'AAA kodonu lizini şifreler; lizin pozitif yüklü amino asitler arasında yer alır.',
  ],
  [
    'mRNA’daki GUU kodonu hangi amino asidi şifreler?',
    'Valin',
    AA,
    'GUU kodonu valini şifreler; valin dört kodonla kodlanan amino asitlerdendir.',
  ],
  [
    'GCU kodonunun genetik kod tablosundaki karşılığı hangisidir?',
    'Alanin',
    AA,
    'GCU kodonu alanini şifreler; alanin proteinlerin yapısında sık görülen amino asitlerdendir.',
  ],
  [
    'Translasyonda GAU kodonu hangi amino asidi getirir?',
    'Aspartik asit',
    AA,
    'GAU kodonu aspartik asidi şifreler; aspartik asit asidik özellik taşıyan amino asitlerdendir.',
  ],
  [
    'mRNA’daki GAA kodonu hangi amino asidi şifreler?',
    'Glutamik asit',
    AA,
    'GAA kodonu glutamik asidi şifreler; kodon ile amino asit arasındaki eşleşme tabloyla belirlenir.',
  ],
  [
    'GGU kodonunun genetik kod tablosundaki karşılığı hangisidir?',
    'Glisin',
    AA,
    'GGU kodonu glisini şifreler; glisin en küçük amino asit olarak bilinir.',
  ],
]);

facts(BIO, T_PROT, 'bulk-lb-aktr', [
  [
    'DNA’dan mRNA sentezlenmesine ne ad verilir?',
    'Transkripsiyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Transkripsiyonda DNA’nın kalıp ipliği okunarak mRNA üretilir; bu olay çekirdekte gerçekleşir.',
  ],
  [
    'mRNA’daki bilgiyle ribozomda protein üretilmesine ne denir?',
    'Translasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Translasyonda kodonlar amino asitlere çevrilir ve ribozomda peptit bağları kurulur.',
  ],
  [
    'DNA’nın kendini eşleyerek iki özdeş kopya oluşturmasına ne denir?',
    'Replikasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Replikasyonda DNA çifti açılır ve her ipliğin karşısına tamamlayıcı nükleotitler dizilir.',
  ],
  [
    'Hücre bölünmesi öncesinde DNA’nın çiftlenmesi hangi olaydır?',
    'Replikasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Bölünme öncesinde kalıtsal bilginin kopyalanması replikasyonla sağlanır.',
  ],
  [
    'Hangi olayda helikaz enzimi DNA çiftini açar?',
    'Replikasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Helikaz hidrojen bağlarını ayırarak replikasyon için kalıp iplikleri açığa çıkarır.',
  ],
  [
    'Hangi olayın sonunda iki özdeş DNA molekülü oluşur?',
    'Replikasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Replikasyon yarı korunumlu işler; her yeni DNA bir eski bir yeni iplik taşır.',
  ],
  [
    'Hangi olayın ürünü tek iplikli RNA molekülüdür?',
    'Transkripsiyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Transkripsiyonun ürünü mRNA’dır; RNA tek iplikli bir nükleik asittir.',
  ],
  [
    'Hangi olayda RNA polimeraz DNA’nın kalıp ipliğini okur?',
    'Transkripsiyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'RNA polimeraz kalıp ipliği 3’ ucundan 5’ ucuna okur ve mRNA’yı 5’ ucundan 3’ ucuna sentezler.',
  ],
  [
    'Hangi olayda tRNA görev alır?',
    'Translasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Translasyonda tRNA antikodonuyla kodonu eşler ve amino asidi ribozoma taşır.',
  ],
  [
    'Hangi olayda kodon ile antikodon eşleşmesi görülür?',
    'Translasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Kodon mRNA’da, antikodon tRNA’da bulunur; eşleşme translasyon sırasında gerçekleşir.',
  ],
  [
    'Hangi olayda amino asitler arasında peptit bağı kurulur?',
    'Translasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Peptit bağı ribozomda kurulur ve amino asitler polipeptit zincirine eklenir.',
  ],
  [
    'Hangi olay yarı korunumlu biçimde gerçekleşir?',
    'Replikasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Replikasyonda her yeni molekül bir kalıp bir yeni iplik içerdiği için yarı korunumlu denir.',
  ],
  [
    'Hangi olay sitoplazmada ribozom üzerinde gerçekleşir?',
    'Translasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Translasyon ribozomda yapılır; ribozom sitoplazmada ya da endoplazmik retikulumda bulunur.',
  ],
  [
    'Hangi olay protein sentezinin bilgi kopyalama aşamasıdır?',
    'Transkripsiyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Transkripsiyon DNA’daki bilgiyi mRNA’ya kopyalar; protein sentezinin ilk aşamasıdır.',
  ],
  [
    'Hangi olayda üçlü baz grupları amino asitlere çevrilir?',
    'Translasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Translasyonda her kodon bir amino asidi belirler ve protein dizisi oluşur.',
  ],
  [
    'Hangi olay çekirdekte başlayıp sitoplazmada tamamlanır?',
    'Transkripsiyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'mRNA çekirdekte sentezlenir, çekirdek zarından çıkar ve sitoplazmada okunur.',
  ],
  [
    'Hangi olayda serbest nükleotitler kalıp ipliğin karşısına dizilir?',
    'Replikasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Replikasyonda serbest deoksiribonükleotitler tamamlayıcı eşleşmeyle yeni ipliği oluşturur.',
  ],
  [
    'Hangi olayın gerçekleşmesi için DNA çiftinin açılması zorunludur?',
    'Transkripsiyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'RNA polimerazın kalıbı okuyabilmesi için DNA çiftinin açılması gerekir.',
  ],
  [
    'Hangi olayda genetik bilgi proteine dönüştürülür?',
    'Translasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Translasyon, nükleotit dizisindeki bilgiyi amino asit dizisine dönüştürür.',
  ],
  [
    'Hangi olayın hatası kalıtsal çeşitliliğe yol açabilir?',
    'Replikasyon',
    'Transkripsiyon|Translasyon|Replikasyon|Mutasyon',
    'Replikasyon sırasında oluşan eşleşme hatası mutasyona ve çeşitliliğe yol açabilir.',
  ],
]);

facts(BIO, T_PROT, 'bulk-lb-orgn', [
  [
    'Amino asitleri peptit bağıyla birleştiren organel hangisidir?',
    'Ribozom',
    ORG,
    'Ribozom, mRNA’daki kodonları okur ve amino asitleri peptit bağıyla birleştirir.',
  ],
  [
    'Salgılanacak proteinleri paketleyip zara sararak gönderen organel hangisidir?',
    'Golgi cisimciği',
    ORG,
    'Golgi cisimciği endoplazmik retikulumdan gelen proteinleri işler, paketler ve hedefe yollar.',
  ],
  [
    'Ribozom alt birimlerinin üretildiği çekirdek yapısı hangisidir?',
    'Çekirdekçik',
    ORG,
    'Çekirdekçik rRNA sentezler ve ribozom alt birimlerini bir araya getirir.',
  ],
  [
    'Proteinlerin ilk işlendiği zarlı kanal sistemi hangisidir?',
    'Granüllü endoplazmik retikulum',
    ORG,
    'Granüllü endoplazmik retikulumun yüzeyindeki ribozomlar proteinleri sentezler, sistem proteini katlar ve taşır.',
  ],
  [
    'DNA’nın bulunduğu ve mRNA’nın sentezlendiği yapı hangisidir?',
    'Çekirdek',
    ORG,
    'Çekirdek DNA’yı barındırır; transkripsiyon çekirdek içinde gerçekleşir.',
  ],
  [
    'Hücrede protein sentezinin yapıldığı en küçük birim hangisidir?',
    'Ribozom',
    ORG,
    'Ribozom zarsız bir organeldir ve protein sentezinin yapıldığı en küçük birimdir.',
  ],
  [
    'Salgı proteinlerinin hücre dışına gönderilmesinde görev alan organel hangisidir?',
    'Golgi cisimciği',
    ORG,
    'Salgı proteinleri Golgi cisimciğinde paketlenip zarla çevrilerek hücre dışına verilir.',
  ],
  [
    'Sitoplazmada serbest bulunarak hücre içi proteinleri sentezleyen yapı hangisidir?',
    'Ribozom',
    ORG,
    'Serbest ribozomlar sitoplazmada hücre içinde kullanılacak proteinleri sentezler.',
  ],
  [
    'Hücre içi sindirimden sorumlu organel hangisidir?',
    'Lizozom',
    ORG,
    'Lizozom sindirim enzimleri taşır ve hücre içi maddeleri parçalar; protein sentezinde görev almaz.',
  ],
  [
    'Fotosentez yapan organel hangisidir?',
    'Kloroplast',
    ORG,
    'Kloroplast klorofil taşır ve ışık enerjisiyle organik madde üretir.',
  ],
]);

facts(BIO, T_PROT, 'bulk-lb-trna', [
  [
    'tRNA’nın üçlü baz dizisine ne ad verilir?',
    'Antikodon',
    'Antikodon|Kodon|Gen|Kromozom',
    'tRNA üzerindeki üçlü diziye antikodon denir ve mRNA’daki kodonla eşleşir.',
  ],
  [
    'Bir tRNA molekülü bir seferde kaç amino asit taşır?',
    '1',
    '1|2|3|4',
    'Her tRNA yalnızca bir amino asit taşır; amino asit sayısı kodon sayısıyla belirlenir.',
  ],
  [
    'Ribozomda iki amino asit arasında hangi bağ kurulur?',
    'Peptit bağı',
    'Peptit bağı|Hidrojen bağı|Fosfodiester bağı|Glikozit bağı',
    'Amino asitler arasında peptit bağı kurulur ve polipeptit zinciri uzar.',
  ],
  [
    'Bir kodon kaç nükleotitten oluşur?',
    '3',
    '3|2|4|6',
    'Kodon üç nükleotitten oluşur; bu üçlü dizi bir amino asidi belirler.',
  ],
  [
    'Bir proteindeki amino asit sayısını belirleyen temel etken nedir?',
    'mRNA’daki kodon sayısı',
    'mRNA’daki kodon sayısı|tRNA sayısı|Ribozom sayısı|ATP miktarı',
    'Her kodon bir amino asidi belirlediği için amino asit sayısı kodon sayısına bağlıdır.',
  ],
  [
    'Protein sentezini başlatan kodon hangisidir?',
    'AUG',
    'AUG|UAA|UAG|UGA',
    'AUG başlatma kodonudur ve metiyonin amino asidini şifreler.',
  ],
  [
    'Durdurma kodonları hangileridir?',
    'UAA, UAG, UGA',
    'UAA, UAG, UGA|AUG, UAA, UAG|UGA, UGG, UAA|UUU, UUC, UUA',
    'UAA, UAG ve UGA durdurma kodonlarıdır; amino asit şifrelemezler.',
  ],
  [
    'Translasyonda kalıp olarak kullanılan molekül hangisidir?',
    'mRNA',
    'mRNA|tRNA|rRNA|DNA',
    'mRNA kodon dizisiyle amino asit sırasını belirleyen kalıptır.',
  ],
  [
    '90 nükleotitlik bir mRNA’da en fazla kaç amino asit şifrelenir?',
    '30',
    '30|45|90|60',
    '90 nükleotit üçlü gruplara ayrılır: 90 ÷ 3 = 30 kodon, yani en fazla 30 amino asit.',
  ],
  [
    'Beş kodonluk bir mRNA’da son kodon durdurma ise kaç amino asit bağlanır?',
    '4',
    '4|5|3|6',
    'Durdurma kodonu amino asit şifrelemez; 5 − 1 = 4 amino asit bağlanır.',
  ],
  [
    'Genetik kodun evrensel olması ne anlama gelir?',
    'Aynı kodonun çoğu canlıda aynı amino asidi şifrelemesi',
    'Aynı kodonun çoğu canlıda aynı amino asidi şifrelemesi|Her canlının kendine özgü kodonu olması|Kodonların proteine çevrilmemesi|Kodonların yalnızca bitkilerde bulunması',
    'Genetik kod evrenseldir; aynı kodon farklı canlılarda genellikle aynı amino asidi belirler.',
  ],
  [
    'Kodon ile antikodon arasındaki eşleşme hangi kurala göredir?',
    'Tamamlayıcı baz eşleşmesi',
    'Tamamlayıcı baz eşleşmesi|Rastgele eşleşme|Aynı bazların eşleşmesi|Baz sayısının eşitliği',
    'Antikodon, kodonun tamamlayıcısıdır; A-U ve G-C eşleşmesiyle bağlanır.',
  ],
  [
    'Yirmi amino asitlik bir polipeptit için en az kaç kodon okunur?',
    '20',
    '20|21|19|60',
    'Her amino asit bir kodonla belirlendiği için en az 20 kodon gerekir.',
  ],
  [
    'Translasyonda ribozom mRNA üzerinde hangi yönde ilerler?',
    '5’ ucundan 3’ ucuna doğru',
    '5’ ucundan 3’ ucuna doğru|3’ ucundan 5’ ucuna doğru|Ortadan uçlara doğru|Rastgele yönlerde',
    'Ribozom mRNA’yı 5’ ucundan 3’ ucuna doğru okur ve kodonları sırayla çevirir.',
  ],
  [
    'Amino asitlerin bağlanma sırasını belirleyen etken hangisidir?',
    'mRNA’daki kodon dizisi',
    'mRNA’daki kodon dizisi|Ribozomun büyüklüğü|tRNA sayısı|Hücrenin yaşı',
    'Kodon dizisi amino asit sırasını belirler; bu sıra proteinin işlevini doğrudan etkiler.',
  ],
  [
    'Protein sentezinde su açığa çıkmasının nedeni nedir?',
    'Peptit bağı kurulması',
    'Peptit bağı kurulması|Hidrojen bağlarının kopması|ATP’nin parçalanması|Baz eşleşmesi',
    'Amino asitler peptit bağıyla birleşirken bir molekül su açığa çıkar.',
  ],
]);

facts(BIO, T_PROT, 'bulk-lb-mut', [
  [
    'DNA’da bir bazın yerine başka bir bazın geçmesiyle oluşan mutasyon hangisidir?',
    'Nokta mutasyonu',
    'Nokta mutasyonu|Çerçeve kayması|Kromozom mutasyonu|Gen çoğalması',
    'Tek bir bazın değişmesi nokta mutasyonudur; okuma çerçevesi kaymaz.',
  ],
  [
    'Bir nükleotitin diziden çıkmasıyla oluşan mutasyon hangisidir?',
    'Çerçeve kayması',
    'Çerçeve kayması|Nokta mutasyonu|Kromozom mutasyonu|Sessiz mutasyon',
    'Nükleotit eksilmesi okuma çerçevesini kaydırır ve sonraki kodonların tümü değişir.',
  ],
  [
    'Amino asit dizisini değiştirmeyen mutasyona ne denir?',
    'Sessiz mutasyon',
    'Sessiz mutasyon|Anlamsız mutasyon|Çerçeve kayması|Kromozom mutasyonu',
    'Sessiz mutasyonda baz değişse de aynı amino asit şifrelenir, protein değişmez.',
  ],
  [
    'Bir kodonun durdurma kodonuna dönüşmesi neye yol açar?',
    'Proteinin erken sonlanması',
    'Proteinin erken sonlanması|Proteinin uzaması|Hiçbir etki olmaması|DNA’nın ikiye ayrılması',
    'Durdurma kodonu erken oluşursa çeviri kesilir ve eksik protein sentezlenir.',
  ],
  [
    'Mutasyonun yavruya aktarılması için hangi hücrelerde oluşması gerekir?',
    'Eşey ana hücrelerinde',
    'Eşey ana hücrelerinde|Deri hücrelerinde|Kas hücrelerinde|Kan hücrelerinde',
    'Yalnızca eşey hücrelerindeki mutasyonlar gametlerle yavruya aktarılır.',
  ],
  [
    'Vücut hücrelerinde oluşan mutasyon yavruya aktarılır mı?',
    'Aktarılmaz',
    'Aktarılmaz|Her zaman aktarılır|Yarısı aktarılır|Yalnızca kızlara aktarılır',
    'Somatik hücre mutasyonları gametlere geçmediği için kalıtsal değildir.',
  ],
  [
    'Kromozom sayısının değişmesiyle oluşan mutasyon hangisidir?',
    'Kromozom mutasyonu',
    'Kromozom mutasyonu|Nokta mutasyonu|Sessiz mutasyon|Gen mutasyonu',
    'Kromozom sayısı ya da yapısındaki değişmeler kromozom mutasyonu olarak adlandırılır.',
  ],
  [
    'DNA’daki değişimin proteinin işlevini bozmasının temel nedeni nedir?',
    'Amino asit dizisinin değişmesi',
    'Amino asit dizisinin değişmesi|Hücrenin küçülmesi|Ribozomun kaybolması|ATP üretiminin durması',
    'Amino asit dizisi değişince proteinin üç boyutlu yapısı ve işlevi bozulabilir.',
  ],
  [
    'Gen mutasyonu ile kromozom mutasyonu arasındaki temel fark nedir?',
    'Gen mutasyonunda nükleotit dizisi değişir',
    'Gen mutasyonunda nükleotit dizisi değişir|Gen mutasyonunda kromozom sayısı değişir|Kromozom mutasyonunda baz değişir|İkisi de yalnızca bitkilerde görülür',
    'Gen mutasyonu nükleotit düzeyinde, kromozom mutasyonu kromozomun yapı ya da sayısında olur.',
  ],
  [
    'Bir bazın eklenmesi hangi kodonları etkiler?',
    'Ekleme noktasından sonraki kodonları',
    'Ekleme noktasından sonraki kodonları|Yalnızca önceki kodonu|Hiçbir kodonu|Yalnızca ilk kodonu',
    'Baz eklenmesi okuma çerçevesini kaydırdığı için ekleme noktasından sonraki kodonlar değişir.',
  ],
  [
    'Mutasyonun protein üzerindeki etkisini belirleyen nedir?',
    'Değişimin hangi kodonda olduğu',
    'Değişimin hangi kodonda olduğu|Hücrenin büyüklüğü|Ribozom sayısı|DNA’nın uzunluğu',
    'Değişimin proteinin işlev bölgesinde olup olmaması etkinin büyüklüğünü belirler.',
  ],
  [
    'UV ışınları hangi yolla mutasyona yol açabilir?',
    'DNA’da hasar oluşturarak',
    'DNA’da hasar oluşturarak|Proteinleri doğrudan parçalayarak|Ribozomu büyüterek|Kromozom sayısını yarıya indirerek',
    'UV ışınları DNA’da hasar oluşturur; onarım hatalı yapılırsa mutasyon kalıcı olur.',
  ],
  [
    'Hücre bölünmesini denetleyen genlerin bozulması hangi sonuca yol açar?',
    'Kontrolsüz bölünme',
    'Kontrolsüz bölünme|Protein sentezinin durması|DNA’nın kaybolması|Hücrenin küçülmesi',
    'Bölünmeyi denetleyen genler bozulunca hücre kontrolsüz çoğalır.',
  ],
  [
    'Mutasyonların canlılar için önemi nedir?',
    'Kalıtsal çeşitlilik sağlaması',
    'Kalıtsal çeşitlilik sağlaması|Enerji üretimini artırması|Hücreyi küçültmesi|Proteinleri parçalaması',
    'Mutasyonlar yeni aleller oluşturarak kalıtsal çeşitliliğin kaynağı olur.',
  ],
  [
    'Aynı genin farklı dizilime sahip biçimlerine ne denir?',
    'Alel',
    'Alel|Kodon|Antikodon|Genom',
    'Aynı genin farklı versiyonlarına alel denir; aleller karakterin farklı biçimlerini belirler.',
  ],
  [
    'Mutasyon sonucu oluşan yeni özellik hangi koşulda kalıcı olur?',
    'Üreme hücresinde oluşursa',
    'Üreme hücresinde oluşursa|Kas hücresinde oluşursa|Deri hücresinde oluşursa|Kan hücresinde oluşursa',
    'Kalıcılık için mutasyonun gamet oluşturan hücrelerde bulunması gerekir.',
  ],
  [
    'Kimyasal maddelerin mutasyona yol açmasına ne denir?',
    'Mutajen etki',
    'Mutajen etki|Enzim etkisi|Hormon etkisi|Bağışıklık etkisi',
    'Mutasyon sıklığını artıran dış etkenlere mutajen denir.',
  ],
]);

/* ---------------------------------------------------------------- */
/* Biyoloji: DNA ve Kalıtım                                          */
/* ---------------------------------------------------------------- */

facts(BIO, T_DNA, 'bulk-lb-dna', [
  [
    'DNA’nın yapı birimine ne ad verilir?',
    'Nükleotit',
    'Nükleotit|Amino asit|Yağ asidi|Glikoz',
    'DNA nükleotitlerden oluşur; her nükleotit fosfat, şeker ve baz içerir.',
  ],
  [
    'Bir DNA nükleotidi hangi üç birimden oluşur?',
    'Fosfat, deoksiriboz ve azotlu baz',
    'Fosfat, deoksiriboz ve azotlu baz|Fosfat, riboz ve amino asit|Glikoz, baz ve protein|Yağ asidi, fosfat ve baz',
    'Nükleotit yapısında fosfat grubu, beş karbonlu şeker ve azotlu baz bulunur.',
  ],
  [
    'DNA’da bulunan şeker hangisidir?',
    'Deoksiriboz',
    'Deoksiriboz|Riboz|Glikoz|Sükroz',
    'DNA’nın şekeri deoksiribozdur; riboz ise RNA’da bulunur.',
  ],
  [
    'RNA’da bulunan şeker hangisidir?',
    'Riboz',
    'Riboz|Deoksiriboz|Glikoz|Maltoz',
    'RNA riboz şekeri taşır; bu fark DNA ile RNA’yı ayıran temel özelliktir.',
  ],
  [
    'DNA’da bulunmayan azotlu baz hangisidir?',
    'Urasil',
    'Urasil|Timin|Adenin|Guanin',
    'Urasil yalnızca RNA’da bulunur; DNA’da timin yer alır.',
  ],
  [
    'RNA’da bulunmayan azotlu baz hangisidir?',
    'Timin',
    'Timin|Urasil|Sitozin|Guanin',
    'Timin DNA’ya özgüdür; RNA’da onun yerine urasil bulunur.',
  ],
  [
    'DNA’nın iki ipliğini bir arada tutan bağ hangisidir?',
    'Hidrojen bağları',
    'Hidrojen bağları|Fosfodiester bağları|Peptit bağları|Glikozit bağları',
    'Karşılıklı bazlar arasında hidrojen bağları kurulur; A-T arasında iki, G-C arasında üç bağ vardır.',
  ],
  [
    'Nükleotitleri zincir boyunca bağlayan bağ hangisidir?',
    'Fosfodiester bağı',
    'Fosfodiester bağı|Hidrojen bağı|Peptit bağı|İyonik bağ',
    'Aynı iplikteki nükleotitler şeker ile fosfat arasındaki fosfodiester bağıyla bağlanır.',
  ],
  [
    'Adenin ve guanin hangi baz grubundadır?',
    'Pürin',
    'Pürin|Pirimidin|Karbonhidrat|Protein',
    'Adenin ve guanin iki halkalı pürin bazlarıdır.',
  ],
  [
    'Sitozin ve timin hangi baz grubundadır?',
    'Pirimidin',
    'Pirimidin|Pürin|Fosfat|Şeker',
    'Sitozin ve timin tek halkalı pirimidin bazlarıdır.',
  ],
  [
    'Gen kavramı hangi tanımla karşılık gelir?',
    'DNA üzerinde bir proteini şifreleyen nükleotit dizisi',
    'DNA üzerinde bir proteini şifreleyen nükleotit dizisi|Hücrenin enerji molekülü|Proteinlerin yapı taşı|Hücre zarının bir parçası',
    'Gen, DNA üzerinde belirli bir proteini ya da RNA’yı şifreleyen nükleotit dizisidir.',
  ],
  [
    'Kromozom nedir?',
    'DNA’nın proteinlerle paketlenmiş hâli',
    'DNA’nın proteinlerle paketlenmiş hâli|Hücrenin sıvı kısmı|Enerji üreten organel|Protein yapı taşı',
    'DNA histon proteinleriyle paketlenerek kromozomu oluşturur.',
  ],
  [
    'İnsan vücut hücresinde kaç kromozom bulunur?',
    '46',
    '46|23|44|48',
    'İnsan somatik hücresi diploittir ve 23 çift, yani 46 kromozom taşır.',
  ],
  [
    'İnsan üreme hücresinde kaç kromozom bulunur?',
    '23',
    '23|46|44|22',
    'Gametler haploittir; mayoz sonucu kromozom sayısı 46’dan 23’e iner.',
  ],
  [
    'DNA ile gen arasındaki ilişki nedir?',
    'Gen, DNA’nın işlevsel bir parçasıdır',
    'Gen, DNA’nın işlevsel bir parçasıdır|Gen, DNA’dan büyüktür|Gen ile DNA ilgisizdir|Gen yalnızca RNA’da bulunur',
    'Genler DNA molekülü üzerinde yer alan işlevsel bölgelerdir.',
  ],
  [
    'Prokaryot hücrelerde DNA nerede bulunur?',
    'Sitoplazmada',
    'Sitoplazmada|Çekirdekte|Mitokondride|Golgi cisimciğinde',
    'Prokaryotlarda zarla çevrili çekirdek yoktur; DNA sitoplazmadaki nükleoit bölgesinde bulunur.',
  ],
  [
    'Ökaryot hücrede DNA hangi organelde de bulunur?',
    'Mitokondri',
    'Mitokondri|Ribozom|Lizozom|Golgi cisimciği',
    'Mitokondri ve kloroplast kendi DNA’larını taşır; bu organellerde protein sentezi de yapılır.',
  ],
  [
    'DNA’nın iki ipliği arasındaki yön ilişkisi nedir?',
    'Antiparaleldir',
    'Antiparaleldir|Aynı yönlüdür|Rastgeledir|Dikeydir',
    'İki iplik antiparaleldir; biri 5’ ucundan 3’ ucuna, diğeri ters yönde uzanır.',
  ],
]);

const basePairs: Array<[number, number]> = [
  [300, 90],
  [400, 120],
  [500, 150],
  [600, 180],
  [240, 70],
  [360, 100],
  [480, 140],
  [200, 60],
  [320, 90],
  [440, 130],
  [560, 170],
  [280, 80],
  [400, 100],
  [520, 140],
  [640, 180],
  [360, 120],
  [480, 150],
  [600, 200],
  [240, 80],
  [720, 210],
];

basePairs.forEach(([total, a], index) => {
  const g = (total - 2 * a) / 2;
  const answer = String(g);
  const prompt =
    index % 2 === 0
      ? `Bir DNA molekülünde ${total} nükleotit vardır. Adenin sayısı ${a} ise guanin sayısı kaçtır?`
      : `Bir DNA molekülünde toplam ${total} nükleotit ve ${a} adenin bulunuyor. Bu molekülde kaç guanin vardır?`;
  push(BIO, T_DNA, `bulk-lb-baz-${index + 1}`, {
    prompt,
    answer,
    distractors: nums(answer, [String(g + 10), String(a), String(total - a), String(g + 20), String(total - 2 * a)]),
    explanation: `Adenin sayısı timine eşittir: ${a} + ${a} = ${2 * a}. Kalan ${total} − ${2 * a} = ${total - 2 * a} nükleotitin yarısı guanindir: ${g}.`,
    difficulty: difficultyAt(index),
  });
});

facts(BIO, T_DNA, 'bulk-lb-soy', [
  [
    'Soyağacında anne ve baba sağlıklı, kız çocukları otozomal çekinik hastalıktan etkilenmiştir. Ebeveynlerin genotipi hangisidir?',
    'Aa × Aa',
    'Aa × Aa|AA × AA|AA × Aa|aa × aa',
    'Sağlıklı ebeveynlerden hasta çocuk doğması için ikisinin de taşıyıcı (Aa) olması gerekir.',
  ],
  [
    'Otozomal çekinik hastalıkta anne ve baba sağlıklı, çocuk hasta ise çocuğun genotipi hangisidir?',
    'aa',
    'aa|AA|Aa|A0',
    'Hastalık çekinik olduğu için ancak iki çekinik alel bir araya gelince (aa) ortaya çıkar.',
  ],
  [
    'İki taşıyıcı ebeveynin çocuğunun hasta olma olasılığı kaçtır?',
    '1/4',
    '1/4|1/2|3/4|1/8',
    'Aa × Aa çaprazlamasında aa genotipi 1/4 olasılıkla oluşur.',
  ],
  [
    'İki taşıyıcı ebeveynin sağlıklı çocuk sahibi olma olasılığı kaçtır?',
    '3/4',
    '3/4|1/4|1/2|1',
    'Aa × Aa çaprazlamasında AA, Aa ve aA sağlıklıdır; bu genotiplerin toplam olasılığı 3/4’tür.',
  ],
  [
    'X’e bağlı çekinik bir hastalıkta hasta erkek çocuk hastalık genini kimden alır?',
    'Annesinden',
    'Annesinden|Babasından|Kardeşinden|Dedesinden',
    'Erkek çocuk X kromozomunu anneden alır; hastalık geni bu X üzerinde taşınır.',
  ],
  [
    'Taşıyıcı anne ile sağlıklı babanın erkek çocuklarının hasta olma olasılığı kaçtır?',
    '1/2',
    '1/2|1/4|0|3/4',
    'Anne X taşıyıcısıdır; erkek çocuklar X’i anneden aldığı için yarısı hastalık genini alır.',
  ],
  [
    'Taşıyıcı anne ile sağlıklı babanın kız çocuklarının hasta olma olasılığı kaçtır?',
    '0',
    '0|1/2|1/4|1',
    'Kız çocuk babadan sağlıklı X alır; bu nedenle X’e bağlı çekinik hastalık görülmez.',
  ],
  [
    'Otozomal baskın hastalıkta hasta anne (Aa) ile sağlıklı babanın çocuklarının hasta olma olasılığı kaçtır?',
    '1/2',
    '1/2|1/4|3/4|0',
    'Aa × aa çaprazlamasında yarısı Aa (hasta), yarısı aa (sağlıklı) olur.',
  ],
  [
    'Soyağacında hastalığın her kuşakta görülmesi hangi kalıtım biçimini düşündürür?',
    'Otozomal baskın',
    'Otozomal baskın|Otozomal çekinik|X’e bağlı çekinik|Y’ye bağlı',
    'Baskın hastalık tek alelle ortaya çıktığı için kuşak atlamadan görülür.',
  ],
  [
    'Soyağacında hastalığın kuşak atlayarak görülmesi hangi kalıtım biçimini düşündürür?',
    'Otozomal çekinik',
    'Otozomal çekinik|Otozomal baskın|Y’ye bağlı|Mitokondriyal',
    'Çekinik hastalık taşıyıcı bireylerde görünmez, bu nedenle kuşak atlar.',
  ],
  [
    'Akraba evliliği hangi hastalıkların görülme sıklığını artırır?',
    'Çekinik hastalıklar',
    'Çekinik hastalıklar|Baskın hastalıklar|Enfeksiyon hastalıkları|Beslenme hastalıkları',
    'Akraba bireyler aynı çekinik aleli taşıma olasılığı yüksek olduğu için çekinik hastalıklar artar.',
  ],
  [
    'X’e bağlı çekinik hastalıkların erkeklerde daha sık görülmesinin nedeni nedir?',
    'Erkeklerde tek X kromozomu bulunması',
    'Erkeklerde tek X kromozomu bulunması|Erkeklerin daha uzun yaşaması|Y kromozomunun daha büyük olması|Erkeklerde mayozun olmaması',
    'Erkekte tek X olduğu için çekinik alel ikinci bir X ile bastırılamaz.',
  ],
  [
    'Soyağacında hastalığın yalnızca erkeklerde görülmesi en çok hangi kalıtımı düşündürür?',
    'X’e bağlı çekinik',
    'X’e bağlı çekinik|Otozomal baskın|Otozomal çekinik|Mitokondriyal',
    'Yalnızca erkeklerde görülme X’e bağlı çekinik kalıtımın tipik özelliğidir.',
  ],
  [
    'Hasta çocuğun anne ve babası sağlıklıysa hastalık geni hangi özelliktedir?',
    'Çekiniktir',
    'Çekiniktir|Baskındır|X’e bağlıdır|Y’ye bağlıdır',
    'Sağlıklı ebeveynde hastalık görünmediğine göre alel çekinik ve taşıyıcı durumdadır.',
  ],
  [
    'Otozomal çekinik hastalıkta taşıyıcı bireyde hastalık görülür mü?',
    'Görülmez, gen taşınır',
    'Görülmez, gen taşınır|Her zaman görülür|Yalnızca erkeklerde görülür|Yalnızca çocuklarda görülür',
    'Taşıyıcı birey bir baskın sağlıklı alel taşıdığı için hastalık belirtisi göstermez.',
  ],
  [
    'Y kromozomuna bağlı kalıtımda özellik kimden kime geçer?',
    'Babadan oğula',
    'Babadan oğula|Anneden kıza|Anneden oğula|Babadan kıza',
    'Y kromozomu yalnızca babadan oğula aktarıldığı için özellik erkeklerde görülür.',
  ],
]);

facts(BIO, T_DNA, 'bulk-lb-olas', [
  [
    'Aa × Aa çaprazlamasında çekinik fenotipli bireylerin oranı kaçtır?',
    '1/4',
    '1/4|1/2|3/4|1/16',
    'Aa × Aa çaprazlamasında genotipler 1 AA : 2 Aa : 1 aa olduğundan aa oranı 1/4’tür.',
  ],
  [
    'Aa × aa çaprazlamasında baskın fenotipli bireylerin oranı kaçtır?',
    '1/2',
    '1/2|1/4|3/4|1',
    'Aa × aa çaprazlamasında yarısı Aa (baskın), yarısı aa (çekinik) olur.',
  ],
  [
    'AA × aa çaprazlamasında çekinik fenotipli bireylerin oranı kaçtır?',
    '0',
    '0|1/4|1/2|1',
    'Tüm yavrular Aa genotipli olur; baskın alel bulunduğu için çekinik fenotip görülmez.',
  ],
  [
    'Aa × Aa çaprazlamasında heterozigot bireylerin oranı kaçtır?',
    '1/2',
    '1/2|1/4|3/4|0',
    'Aa × Aa çaprazlamasında Aa genotipi 2/4, yani 1/2 oranında oluşur.',
  ],
  [
    'Aa × Aa çaprazlamasında homozigot bireylerin oranı kaçtır?',
    '1/2',
    '1/2|1/4|3/4|1',
    'AA ve aa homozigotları toplam 1/4 + 1/4 = 1/2 oranındadır.',
  ],
  [
    'AaBb × AaBb çaprazlamasında aabb genotipli bireylerin oranı kaçtır?',
    '1/16',
    '1/16|1/4|1/8|3/16',
    'Her karakter için aa ve bb olasılığı 1/4’tür; 1/4 × 1/4 = 1/16.',
  ],
  [
    'AaBb × aabb çaprazlamasında AaBb genotipli bireylerin oranı kaçtır?',
    '1/4',
    '1/4|1/16|1/2|3/8',
    'Aa olasılığı 1/2, Bb olasılığı 1/2’dir; 1/2 × 1/2 = 1/4.',
  ],
  [
    'Aa × Aa çaprazlamasında 8 yavrudan kaçının baskın fenotipte olması beklenir?',
    '6',
    '6|4|2|8',
    'Baskın fenotip oranı 3/4’tür; 8 × 3/4 = 6 yavru beklenir.',
  ],
  [
    'Bb × Bb çaprazlamasında 4 yavrudan kaçının çekinik olması beklenir?',
    '1',
    '1|2|3|4',
    'Çekinik fenotip oranı 1/4’tür; 4 × 1/4 = 1 yavru beklenir.',
  ],
  [
    'Bir monohibrit çaprazlamada ikinci kuşaktaki fenotip oranı kaçtır?',
    '3:1',
    '3:1|1:1|9:3:3:1|1:2:1',
    'Aa × Aa çaprazlamasında fenotipler 3 baskın : 1 çekinik oranında görülür.',
  ],
  [
    'Bir dihibrit çaprazlamada ikinci kuşaktaki fenotip oranı kaçtır?',
    '9:3:3:1',
    '9:3:3:1|3:1|1:1|1:2:1',
    'AaBb × AaBb çaprazlamasında fenotipler 9:3:3:1 oranında dağılır.',
  ],
  [
    'Kontrol çaprazlaması hangi amaçla yapılır?',
    'Baskın fenotipli bireyin genotipini belirlemek',
    'Baskın fenotipli bireyin genotipini belirlemek|Çekinik bireyi yok etmek|Kromozom sayısını artırmak|Mutasyon oluşturmak',
    'Baskın fenotipli birey çekinik homozigotla çaprazlanır; yavrularda çekinik görülürse birey heterozigottur.',
  ],
  [
    'AaBb × AaBb çaprazlamasında A_B_ fenotipli bireylerin oranı kaçtır?',
    '9/16',
    '9/16|3/16|1/16|1/4',
    'Her karakterde baskın fenotip 3/4’tür; 3/4 × 3/4 = 9/16.',
  ],
  [
    'AaBb × AaBb çaprazlamasında A_bb fenotipli bireylerin oranı kaçtır?',
    '3/16',
    '3/16|9/16|1/16|1/4',
    'A_ olasılığı 3/4, bb olasılığı 1/4’tür; 3/4 × 1/4 = 3/16.',
  ],
  [
    'Aa × aa çaprazlamasında Aa genotipli bireylerin oranı kaçtır?',
    '1/2',
    '1/2|1/4|3/4|1',
    'Aa × aa çaprazlamasında yavruların yarısı Aa, yarısı aa olur.',
  ],
  [
    'Aa × Aa çaprazlamasında 12 yavrudan kaçının çekinik olması beklenir?',
    '3',
    '3|6|9|4',
    'Çekinik oranı 1/4’tür; 12 × 1/4 = 3 yavru beklenir.',
  ],
  [
    'AaBb × aabb çaprazlamasında aabb genotipli bireylerin oranı kaçtır?',
    '1/4',
    '1/4|1/16|1/2|3/8',
    'aa olasılığı 1/2, bb olasılığı 1/2’dir; 1/2 × 1/2 = 1/4.',
  ],
  [
    'AA × Aa çaprazlamasında çekinik fenotipli bireylerin oranı kaçtır?',
    '0',
    '0|1/4|1/2|1',
    'Her yavru en az bir A aleli alır; bu nedenle çekinik fenotip oluşmaz.',
  ],
]);

facts(BIO, T_DNA, 'bulk-lb-kav', [
  [
    'Aynı karakter için iki farklı alel taşıyan bireye ne denir?',
    'Heterozigot',
    'Heterozigot|Homozigot|Haploid|Diploid',
    'Alelleri farklı olan birey heterozigottur; örneğin Aa genotipi.',
  ],
  [
    'İki alelin de aynı olduğu bireye ne denir?',
    'Homozigot',
    'Homozigot|Heterozigot|Melez|Mutant',
    'AA ya da aa genotipli bireyler homozigottur; aleller birbirinin aynısıdır.',
  ],
  [
    'Fenotip nedir?',
    'Genotipin çevreyle etkileşimi sonucu görünen özellik',
    'Genotipin çevreyle etkileşimi sonucu görünen özellik|Bireyin alellerinin tümü|Kromozom sayısı|Protein sentez hızı',
    'Fenotip gözlenebilen özelliktir; genotip ile çevrenin ortak ürünüdür.',
  ],
  [
    'Genotip nedir?',
    'Bireyin sahip olduğu alellerin tümü',
    'Bireyin sahip olduğu alellerin tümü|Bireyin dış görünüşü|Hücrenin enerji düzeyi|Organel sayısı',
    'Genotip, bireyin kalıtsal yapısındaki alel bileşimidir.',
  ],
  [
    'Baskın alel genotipte nasıl gösterilir?',
    'Büyük harfle',
    'Büyük harfle|Küçük harfle|Rakamla|Sembolle',
    'Baskın alel büyük harfle (A), çekinik alel küçük harfle (a) gösterilir.',
  ],
  [
    'Çekinik alel genotipte nasıl gösterilir?',
    'Küçük harfle',
    'Küçük harfle|Büyük harfle|Rakamla|Yıldızla',
    'Çekinik alel küçük harfle yazılır ve ancak homozigot durumda fenotipte görünür.',
  ],
  [
    'Eşey kromozomları insanda hangileridir?',
    'X ve Y',
    'X ve Y|A ve B|1 ve 2|M ve N',
    'İnsanda 23. kromozom çifti eşey kromozomlarıdır ve X ile Y olarak adlandırılır.',
  ],
  [
    'Diploid hücrede her kromozomdan kaç tane bulunur?',
    'İki',
    'İki|Bir|Üç|Dört',
    'Diploid hücrede kromozomlar çift hâlindedir; biri anneden biri babadan gelir.',
  ],
  [
    'Haploid hücre nedir?',
    'Tek kromozom takımı taşıyan hücre',
    'Tek kromozom takımı taşıyan hücre|İki kromozom takımı taşıyan hücre|Kromozomsuz hücre|Çok çekirdekli hücre',
    'Gametler haploittir; mayoz sonucu kromozom sayısı yarıya iner.',
  ],
  [
    'Mendel’in ayrılma ilkesi neyi açıklar?',
    'Alellerin gametlere ayrı ayrı dağılması',
    'Alellerin gametlere ayrı ayrı dağılması|Kromozomların ikiye ayrılması|Genlerin birleşmesi|Mutasyonların oluşması',
    'Mayozda homolog kromozomlar ayrılır; her gamet alellerden yalnızca birini alır.',
  ],
  [
    'Bağımsız dağılım ilkesi hangi durumda geçerlidir?',
    'Genler farklı kromozomlarda ise',
    'Genler farklı kromozomlarda ise|Genler aynı kromozomda ise|Genler baskın ise|Genler çekinik ise',
    'Farklı kromozomlardaki genler mayozda birbirinden bağımsız dağılır.',
  ],
  [
    'Eş baskınlık nedir?',
    'İki alelin de fenotipte birlikte görünmesi',
    'İki alelin de fenotipte birlikte görünmesi|Bir alelin diğerini bastırması|Alellerin kaybolması|Genlerin çoğalması',
    'Eş baskınlıkta heterozigot bireyde iki alelin etkisi de fenotipte görülür.',
  ],
]);

/* ---------------------------------------------------------------- */
/* Biyoloji: Hücresel Solunum                                        */
/* ---------------------------------------------------------------- */

facts(BIO, T_RESP, 'bulk-lb-atp', [
  [
    'Hücrede doğrudan kullanılabilir enerji molekülü hangisidir?',
    'ATP',
    'ATP|DNA|Glikoz|Protein',
    'ATP, hücrenin işlerinde doğrudan kullanabildiği enerji molekülüdür.',
  ],
  [
    'ATP’nin açılımı nedir?',
    'Adenozin trifosfat',
    'Adenozin trifosfat|Adenin trifosfat|Amino trifosfat|Adenozin difosfat',
    'ATP adenozin trifosfat demektir; adenozin, riboz ve üç fosfat grubundan oluşur.',
  ],
  [
    'ATP’den bir fosfat kopması sonucu hangi molekül oluşur?',
    'ADP',
    'ADP|AMP|ATP|NADH',
    'ATP’den bir fosfat ayrılınca ADP oluşur ve enerji açığa çıkar.',
  ],
  [
    'ATP sentezine ne ad verilir?',
    'Fosforilasyon',
    'Fosforilasyon|Hidroliz|Oksidasyon|Fotosentez',
    'ADP’ye fosfat eklenerek ATP oluşmasına fosforilasyon denir.',
  ],
  [
    'Hücresel solunumun temel amacı nedir?',
    'ATP üretmek',
    'ATP üretmek|Oksijen üretmek|Glikoz sentezlemek|Protein parçalamak',
    'Solunumda besinlerdeki kimyasal enerji ATP’ye dönüştürülür.',
  ],
  [
    'Solunumda açığa çıkan enerjinin bir kısmı hangi biçimde kaybedilir?',
    'Isı',
    'Isı|Işık|Ses|Manyetizma',
    'Solunumda enerjinin bir bölümü ATP’ye aktarılır, kalanı ısı olarak açığa çıkar.',
  ],
  [
    'ATP’nin yapısında hangi şeker bulunur?',
    'Riboz',
    'Riboz|Deoksiriboz|Glikoz|Sükroz',
    'ATP’nin yapısında riboz şekeri, adenin bazı ve üç fosfat grubu bulunur.',
  ],
  [
    'Bir ATP molekülünde kaç fosfat grubu vardır?',
    '3',
    '3|2|1|4',
    'ATP’de üç fosfat grubu bulunur; adı da buradan gelir.',
  ],
  [
    'Hücrede ATP’nin sürekli üretilip tüketilmesinin nedeni nedir?',
    'Depolanamaması',
    'Depolanamaması|Zehirli olması|Çok büyük olması|DNA’ya bağlanması',
    'ATP uzun süre depolanamaz; hücre ihtiyaç duydukça üretir.',
  ],
  [
    'Hangi olay ATP harcamaz?',
    'Difüzyon',
    'Difüzyon|Aktif taşıma|Kas kasılması|Protein sentezi',
    'Difüzyon derişim farkıyla kendiliğinden gerçekleşir ve ATP gerektirmez.',
  ],
  [
    'Aktif taşıma neden ATP gerektirir?',
    'Derişim gradyanına karşı taşıma yapılması',
    'Derişim gradyanına karşı taşıma yapılması|Suyun taşınması|Baz eşleşmesi|Protein yıkımı',
    'Madde az yoğun ortamdan çok yoğun ortama taşındığı için enerji gerekir.',
  ],
  [
    'Oksijenli solunumda ATP üretiminin en büyük kısmı hangi evrede gerçekleşir?',
    'Elektron taşıma sistemi',
    'Elektron taşıma sistemi|Glikoliz|Krebs döngüsü|Fermentasyon',
    'Elektron taşıma sisteminde NADH ve FADH2’deki elektronlar ATP üretimini sürükler.',
  ],
  [
    'Glikolizde net kaç ATP kazanılır?',
    '2',
    '2|4|1|3',
    'Glikolizde 4 ATP üretilir, 2 ATP harcanır; net kazanç 2 ATP’dir.',
  ],
  [
    'Oksijenli solunumda bir glikozdan yaklaşık kaç ATP elde edilir?',
    'Yaklaşık 30',
    'Yaklaşık 30|Yaklaşık 2|Yaklaşık 10|Yaklaşık 100',
    'Glikoliz, Krebs ve elektron taşıma sistemi birlikte yaklaşık 30 ATP kazandırır.',
  ],
  [
    'ATP’nin yapısında azotlu baz olarak hangisi bulunur?',
    'Adenin',
    'Adenin|Timin|Urasil|Sitozin',
    'ATP’nin bazı adenindir; bu nedenle molekül adenozin trifosfat olarak adlandırılır.',
  ],
  [
    'Hangi organel ATP üretiminde yoğun görev alır?',
    'Mitokondri',
    'Mitokondri|Ribozom|Lizozom|Golgi cisimciği',
    'Mitokondride Krebs döngüsü ve elektron taşıma sistemi gerçekleşir; ATP üretimi burada yoğunlaşır.',
  ],
  [
    'ATP harcanan olaylara hangisi örnektir?',
    'Kas kasılması',
    'Kas kasılması|Su difüzyonu|Oksijen difüzyonu|Baz eşleşmesi',
    'Kas kasılması aktif bir olaydır ve doğrudan ATP tüketir.',
  ],
  [
    'ADP’ye fosfat eklenmesi için gereken enerji nereden sağlanır?',
    'Besinlerin yıkımından',
    'Besinlerin yıkımından|Güneş ışığından|Su molekülünden|Karbondioksitten',
    'Solunumla besinlerden elde edilen enerji ADP’yi ATP’ye çevirir.',
  ],
  [
    'Fotosentezde üretilen ATP hangi olayda kullanılır?',
    'Organik madde sentezinde',
    'Organik madde sentezinde|Oksijen tüketiminde|Protein yıkımında|DNA eşlenmesinde',
    'Fotosentezde ışık tepkimelerinde üretilen ATP, Kalvin döngüsünde organik madde yapımında kullanılır.',
  ],
  [
    'Hücrede enerji dönüşümü açısından solunumun önemi nedir?',
    'Besin enerjisini kullanılabilir hâle getirmesi',
    'Besin enerjisini kullanılabilir hâle getirmesi|Oksijen üretmesi|Glikoz sentezlemesi|Suyu parçalaması',
    'Solunum, besinlerdeki kimyasal enerjiyi hücrenin kullanabileceği ATP’ye dönüştürür.',
  ],
]);

facts(BIO, T_RESP, 'bulk-lb-evre', [
  [
    'Glikoliz nerede gerçekleşir?',
    'Sitoplazmada',
    'Sitoplazmada|Mitokondri matriksinde|Mitokondri iç zarında|Çekirdekte',
    'Glikoliz sitoplazmada gerçekleşir ve oksijen gerektirmez.',
  ],
  [
    'Krebs döngüsü nerede gerçekleşir?',
    'Mitokondri matriksinde',
    'Mitokondri matriksinde|Sitoplazmada|Çekirdekte|Golgi cisimciğinde',
    'Krebs döngüsü mitokondrinin sıvı kısmı olan matrikste işler.',
  ],
  [
    'Elektron taşıma sistemi nerede bulunur?',
    'Mitokondrinin iç zarında',
    'Mitokondrinin iç zarında|Sitoplazmada|Çekirdek zarında|Ribozomda',
    'Elektron taşıma sistemi mitokondrinin kıvrımlı iç zarında yer alır.',
  ],
  [
    'Glikolizde glikoz hangi maddeye parçalanır?',
    'Pirüvik asit',
    'Pirüvik asit|Asetil CoA|Laktik asit|Etil alkol',
    'Altı karbonlu glikoz, glikolizde iki adet üç karbonlu pirüvik aside ayrılır.',
  ],
  [
    'Glikoliz için oksijen gerekli midir?',
    'Hayır, gerekmez',
    'Hayır, gerekmez|Evet, zorunludur|Yalnızca bitkilerde gerekir|Yalnızca karanlıkta gerekir',
    'Glikoliz oksijensiz ortamda da gerçekleşen ilk evredir.',
  ],
  [
    'Krebs döngüsüne giren madde hangisidir?',
    'Asetil CoA',
    'Asetil CoA|Pirüvik asit|Glikoz|Laktik asit',
    'Pirüvik asitten oluşan asetil CoA Krebs döngüsüne girer.',
  ],
  [
    'Pirüvik asitten asetil CoA oluşurken hangi gaz açığa çıkar?',
    'Karbondioksit',
    'Karbondioksit|Oksijen|Azot|Hidrojen',
    'Pirüvik asidin oksidatif dekarboksilasyonunda karbondioksit açığa çıkar.',
  ],
  [
    'Elektron taşıma sisteminde son elektron alıcısı hangisidir?',
    'Oksijen',
    'Oksijen|Karbondioksit|NAD|FAD',
    'Elektronlar zincirin sonunda oksijene aktarılır; oksijen son elektron alıcısıdır.',
  ],
  [
    'Elektron taşıma sisteminde oksijenin görevi nedir?',
    'Elektronları alıp su oluşturmak',
    'Elektronları alıp su oluşturmak|Karbondioksit üretmek|Glikozu parçalamak|ATP’yi yıkmak',
    'Oksijen elektronları ve hidrojen iyonlarını alarak su oluşumunu sağlar.',
  ],
  [
    'Solunumun hangi evresinde en fazla ATP üretilir?',
    'Elektron taşıma sistemi',
    'Elektron taşıma sistemi|Glikoliz|Krebs döngüsü|Pirüvik oksidasyonu',
    'Elektron taşıma sisteminde oksidatif fosforilasyonla en fazla ATP üretilir.',
  ],
  [
    'Krebs döngüsünde hangi gaz açığa çıkar?',
    'Karbondioksit',
    'Karbondioksit|Oksijen|Azot|Metan',
    'Krebs döngüsünde karbon iskeleti yıkılırken karbondioksit açığa çıkar.',
  ],
  [
    'NADH ve FADH2 hangi evrelerde üretilir?',
    'Glikoliz ve Krebs döngüsü',
    'Glikoliz ve Krebs döngüsü|Yalnızca glikoliz|Yalnızca elektron taşıma sistemi|Yalnızca fermentasyon',
    'Glikoliz ve Krebs döngüsünde elektron taşıyıcıları indirgenerek NADH ve FADH2 oluşur.',
  ],
  [
    'Solunumun ilk evresi hangisidir?',
    'Glikoliz',
    'Glikoliz|Krebs döngüsü|Elektron taşıma sistemi|Fermentasyon',
    'Glikoliz glikozun parçalandığı ilk evredir ve sitoplazmada gerçekleşir.',
  ],
  [
    'Bir glikoz için Krebs döngüsü kaç kez döner?',
    '2',
    '2|1|4|3',
    'Glikozdan iki pirüvik asit ve iki asetil CoA oluştuğu için döngü iki kez döner.',
  ],
  [
    'Oksijenli solunumun toplam denklemi hangisidir?',
    'Glikoz + 6 O2 → 6 CO2 + 6 H2O + ATP',
    'Glikoz + 6 O2 → 6 CO2 + 6 H2O + ATP|Glikoz + 6 CO2 → 6 O2 + 6 H2O|Glikoz → 2 laktik asit|6 CO2 + 6 H2O → glikoz + 6 O2',
    'Bir glikoz altı oksijenle yıkılır; altı karbondioksit, altı su ve ATP açığa çıkar.',
  ],
  [
    'Solunumda su hangi evrede oluşur?',
    'Elektron taşıma sistemi',
    'Elektron taşıma sistemi|Glikoliz|Krebs döngüsü|Pirüvik oksidasyonu',
    'Elektron taşıma sisteminde oksijen hidrojenle birleşerek su oluşturur.',
  ],
  [
    'Mitokondrinin iç zarının kıvrımlı olmasının nedeni nedir?',
    'ATP üretim yüzeyini artırmak',
    'ATP üretim yüzeyini artırmak|Hacmi küçültmek|DNA’yı korumak|Suyu depolamak',
    'Krista adı verilen kıvrımlar yüzey alanını artırarak daha fazla ATP üretimine olanak verir.',
  ],
  [
    'Glikolizde NADH oluşur mu?',
    'Evet, 2 NADH oluşur',
    'Evet, 2 NADH oluşur|Hayır, oluşmaz|Evet, 4 NADH oluşur|Yalnızca bitkilerde oluşur',
    'Glikolizde iki NAD+ indirgenerek iki NADH oluşur.',
  ],
  [
    'Krebs döngüsünde açığa çıkan elektronlar hangi taşıyıcılara aktarılır?',
    'NADH ve FADH2',
    'NADH ve FADH2|ATP ve ADP|Oksijen ve su|Glikoz ve pirüvik asit',
    'Krebs döngüsünde elektronlar NADH ve FADH2’ye aktarılarak elektron taşıma sistemine taşınır.',
  ],
  [
    'Oksijenli solunumun gerçekleştiği organel hangisidir?',
    'Mitokondri',
    'Mitokondri|Kloroplast|Ribozom|Lizozom',
    'Krebs döngüsü ve elektron taşıma sistemi mitokondride gerçekleşir.',
  ],
]);

facts(BIO, T_RESP, 'bulk-lb-ferm', [
  [
    'Oksijensiz ortamda glikozun parçalanmasına ne denir?',
    'Fermentasyon',
    'Fermentasyon|Fotosentez|Oksidatif fosforilasyon|Replikasyon',
    'Fermentasyon oksijensiz ortamda glikozun kısmen parçalanmasıdır.',
  ],
  [
    'Fermentasyonda net kaç ATP kazanılır?',
    '2',
    '2|4|30|1',
    'Fermentasyon yalnızca glikoliz basamağını kapsadığı için net 2 ATP kazandırır.',
  ],
  [
    'İnsan kas hücrelerinde oksijensiz solunum sonucu hangi madde birikir?',
    'Laktik asit',
    'Laktik asit|Etil alkol|Asetik asit|Ürik asit',
    'Kas hücrelerinde pirüvik asit laktik aside indirgenir ve birikir.',
  ],
  [
    'Bira mayasında fermentasyon sonucu hangi ürünler oluşur?',
    'Etil alkol ve karbondioksit',
    'Etil alkol ve karbondioksit|Laktik asit ve su|Asetik asit ve oksijen|Glikoz ve ATP',
    'Mayada pirüvik asit etil alkole dönüşürken karbondioksit açığa çıkar.',
  ],
  [
    'Yoğurt üretiminde hangi fermentasyon türü kullanılır?',
    'Laktik asit fermentasyonu',
    'Laktik asit fermentasyonu|Alkol fermentasyonu|Bütirik asit fermentasyonu|Oksijenli solunum',
    'Yoğurt bakterileri süt şekerini laktik aside çevirir ve süt pıhtılaşır.',
  ],
  [
    'Hamurun kabarmasının nedeni nedir?',
    'Mayaların karbondioksit üretmesi',
    'Mayaların karbondioksit üretmesi|Suyun buharlaşması|Unun erimesi|Tuzun çözünmesi',
    'Alkol fermentasyonunda açığa çıkan karbondioksit hamuru kabartır.',
  ],
  [
    'Fermentasyonun oksijenli solunuma göre enerji verimi nasıldır?',
    'Daha düşüktür',
    'Daha düşüktür|Daha yüksektir|Eşittir|Sıfırdır',
    'Glikoz tam parçalanmadığı için fermentasyonun ATP verimi çok daha düşüktür.',
  ],
  [
    'Fermentasyon nerede gerçekleşir?',
    'Sitoplazmada',
    'Sitoplazmada|Mitokondride|Çekirdekte|Kloroplastta',
    'Fermentasyon glikoliz basamağıyla sitoplazmada gerçekleşir.',
  ],
  [
    'Laktik asit fermentasyonunda pirüvik asit neye dönüşür?',
    'Laktik aside',
    'Laktik aside|Etil alkole|Asetil CoA’ya|Glikoza',
    'Pirüvik asit NADH’tan elektron alarak laktik aside indirgenir.',
  ],
  [
    'Alkol fermentasyonunda pirüvik asit önce hangi maddeye dönüşür?',
    'Asetaldehit',
    'Asetaldehit|Laktik asit|Asetil CoA|Sitrik asit',
    'Pirüvik asit önce karbondioksit kaybederek asetaldehite, sonra etil alkole dönüşür.',
  ],
  [
    'Fermentasyonda NADH’ın görevi nedir?',
    'Pirüvik asidin indirgenmesini sağlamak',
    'Pirüvik asidin indirgenmesini sağlamak|ATP üretmek|Oksijen taşımak|Karbondioksit bağlamak',
    'NADH elektronlarını pirüvik aside vererek NAD+’ın yeniden kullanılmasını sağlar.',
  ],
  [
    'Ağır egzersizde kaslarda laktik asit birikmesinin sonucu nedir?',
    'Yorgunluk ve kas ağrısı',
    'Yorgunluk ve kas ağrısı|Kasların büyümesi|Oksijen üretimi|Kemik erimesi',
    'Laktik asit birikimi kaslarda yorgunluk ve ağrıya yol açar.',
  ],
  [
    'Oksijen borcu nedir?',
    'Biriken laktik asidin giderilmesi için gereken oksijen',
    'Biriken laktik asidin giderilmesi için gereken oksijen|Solunumun tamamen durması|ATP’nin tükenmesi|Karbondioksit birikmesi',
    'Egzersiz sonrası laktik asidin parçalanması için ek oksijene ihtiyaç duyulur.',
  ],
  [
    'Turşu yapımında hangi canlılar görev alır?',
    'Laktik asit bakterileri',
    'Laktik asit bakterileri|Bira mayaları|Algler|Mantarlar',
    'Turşuda laktik asit bakterileri şekeri laktik aside çevirerek ortamı asitleştirir.',
  ],
  [
    'Fermentasyon yapan canlılara hangisi örnektir?',
    'Bira mayası',
    'Bira mayası|İnsan sinir hücresi|Bitki kök hücresi|Kırmızı kan hücresi',
    'Bira mayası oksijensiz ortamda alkol fermentasyonu yapar.',
  ],
]);

facts(BIO, T_RESP, 'bulk-lb-gaz', [
  [
    'Oksijenli solunumda karbondioksit hangi evrede açığa çıkar?',
    'Krebs döngüsü',
    'Krebs döngüsü|Glikoliz|Elektron taşıma sistemi|Fotosentez',
    'Karbon iskeletinin yıkıldığı Krebs döngüsünde karbondioksit açığa çıkar.',
  ],
  [
    'Solunumda tüketilen gaz hangisidir?',
    'Oksijen',
    'Oksijen|Karbondioksit|Azot|Hidrojen',
    'Oksijenli solunumda oksijen son elektron alıcısı olarak tüketilir.',
  ],
  [
    'Bitkiler fotosentezde hangi gazı tüketir?',
    'Karbondioksit',
    'Karbondioksit|Oksijen|Azot|Metan',
    'Fotosentezde karbondioksit kullanılarak organik madde üretilir.',
  ],
  [
    'Bitkiler solunumda hangi gazı açığa çıkarır?',
    'Karbondioksit',
    'Karbondioksit|Oksijen|Azot|Hidrojen',
    'Bitkiler de solunum yapar ve bu süreçte karbondioksit açığa çıkarır.',
  ],
  [
    'Solunum ile fotosentez arasındaki ilişki nedir?',
    'Ürünleri birbirinin girdisidir',
    'Ürünleri birbirinin girdisidir|Birbirini engeller|Aynı organelde olur|İkisi de ışık gerektirir',
    'Solunumun ürettiği karbondioksit ve su fotosentezde, fotosentezin ürettiği oksijen solunumda kullanılır.',
  ],
  [
    'Çizgili kas hücrelerinde mitokondri sayısının fazla olmasının nedeni nedir?',
    'Enerji ihtiyacının yüksek olması',
    'Enerji ihtiyacının yüksek olması|Kasılmanın yavaş olması|Oksijen üretimi|Protein depolanması',
    'Kas hücreleri çok enerji harcadığı için mitokondri sayısı fazladır.',
  ],
  [
    'Solunum hızını artıran etken hangisidir?',
    'Kas faaliyetinin artması',
    'Kas faaliyetinin artması|Ortam sıcaklığının düşmesi|Su içilmesi|Uyku hâli',
    'Kas faaliyeti arttıkça ATP ihtiyacı ve dolayısıyla solunum hızı artar.',
  ],
  [
    'Mitokondrinin kendi DNA’sı var mıdır?',
    'Evet, bulunur',
    'Evet, bulunur|Hayır, bulunmaz|Yalnızca bitkilerde bulunur|Yalnızca bakterilerde bulunur',
    'Mitokondri kendi DNA’sını ve ribozomlarını taşır; bu yüzden yarı bağımsızdır.',
  ],
  [
    'Oksijenli solunumda glikozdaki enerji hangi biçime dönüşür?',
    'ATP ve ısı',
    'ATP ve ısı|Yalnızca ışık|Yalnızca ses|Yalnızca hareket',
    'Glikozdaki kimyasal enerji ATP’ye aktarılır, bir kısmı ısı olarak açığa çıkar.',
  ],
  [
    'Oksijensiz solunum ile fermentasyon arasındaki fark nedir?',
    'Oksijensiz solunumda elektron taşıma zinciri kullanılır',
    'Oksijensiz solunumda elektron taşıma zinciri kullanılır|Fermentasyonda oksijen kullanılır|İkisi aynı olaydır|Fermentasyon mitokondride olur',
    'Oksijensiz solunumda son alıcı oksijen dışı bir madde olup elektron taşıma zinciri görev alır; fermentasyonda zincir yoktur.',
  ],
  [
    'Bitkilerde solunum hangi hücrelerde görülür?',
    'Tüm canlı hücrelerde',
    'Tüm canlı hücrelerde|Yalnızca yapraklarda|Yalnızca köklerde|Yalnızca çiçeklerde',
    'Solunum tüm canlı hücrelerde kesintisiz sürer.',
  ],
  [
    'Solunumda görev alan elektron taşıyıcısı hangisidir?',
    'NAD',
    'NAD|ATP|Glikoz|Klorofil',
    'NAD ve FAD elektron taşıyarak elektron taşıma sistemine katkı sağlar.',
  ],
  [
    'Karbondioksit hangi organelden çıkarak hücre dışına verilir?',
    'Mitokondri',
    'Mitokondri|Ribozom|Lizozom|Çekirdek',
    'Krebs döngüsü mitokondride gerçekleştiği için karbondioksit buradan çıkar.',
  ],
]);

const glucoseRuns = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25, 30, 40, 50];

glucoseRuns.forEach((n, index) => {
  const kind = index % 5;
  const frames = [
    {
      prompt: `Oksijenli solunumda ${n} glikoz molekülünün glikolizi sonucunda net kaç ATP kazanılır?`,
      answer: String(2 * n),
      why: `Bir glikozun glikolizinde net 2 ATP kazanılır: ${n} × 2 = ${2 * n}.`,
    },
    {
      prompt: `Oksijenli solunumda ${n} glikoz molekülü için Krebs döngüsü kaç kez döner?`,
      answer: String(2 * n),
      why: `Her glikoz iki asetil CoA ürettiği için döngü iki kez döner: ${n} × 2 = ${2 * n}.`,
    },
    {
      prompt: `Oksijenli solunumda ${n} glikoz molekülünden en fazla kaç karbondioksit açığa çıkar?`,
      answer: String(6 * n),
      why: `Bir glikozdan 6 CO2 çıkar: ${n} × 6 = ${6 * n}.`,
    },
    {
      prompt: `${n} glikoz molekülünün laktik asit fermentasyonundan net kaç ATP elde edilir?`,
      answer: String(2 * n),
      why: `Fermentasyonda glikoz başına net 2 ATP kazanılır: ${n} × 2 = ${2 * n}.`,
    },
    {
      prompt: `Oksijenli solunumda ${n} glikoz molekülü için kaç oksijen tüketilir?`,
      answer: String(6 * n),
      why: `Bir glikoz 6 O2 tüketir: ${n} × 6 = ${6 * n}.`,
    },
  ];
  const frame = frames[kind];
  push(BIO, T_RESP, `bulk-lb-hesap-${index + 1}`, {
    prompt: frame.prompt,
    answer: frame.answer,
    distractors: nums(frame.answer, [
      String(Number(frame.answer) + 2),
      String(Number(frame.answer) * 2),
      String(n),
      String(Number(frame.answer) - 2),
    ]),
    explanation: frame.why,
    difficulty: difficultyAt(index),
  });
});

/* ---------------------------------------------------------------- */
/* Edebiyat: Anlatmaya Bağlı Metinler                                */
/* ---------------------------------------------------------------- */

const TUR = 'Masal|Fabl|Destan|Hikâye|Roman|Mesnevi|Halk hikâyesi|Biyografi';
const AUTHOR =
  'Halit Ziya Uşaklıgil|Mehmet Rauf|Namık Kemal|Recaizade Mahmut Ekrem|Şemsettin Sami|Nabizade Nazım|Sabahattin Ali|Yaşar Kemal|Peyami Safa|Yakup Kadri Karaosmanoğlu|Refik Halit Karay|Ömer Seyfettin';
const WORK =
  'Taaşşuk-ı Talat ve Fitnat|İntibah|Cezmi|Araba Sevdası|Karabibik|Eylül|Mai ve Siyah|Aşk-ı Memnu';

facts(LIT, T_NARR, 'bulk-le-tur', [
  [
    'Olağanüstü olayların yer aldığı, yer ve zamanın belirsiz olduğu anonim anlatı türü hangisidir?',
    'Masal',
    TUR,
    'Masalda olağanüstü olaylar anlatılır; yer ve zaman belirsizdir, anlatı sözlü gelenekte yaşar.',
  ],
  [
    'Hayvanların kahraman olarak kullanıldığı ve sonunda ders verilen kısa anlatı türü hangisidir?',
    'Fabl',
    TUR,
    'Fablda hayvanlar kişileştirilir ve anlatının sonunda okuyucuya bir ders verilir.',
  ],
  [
    'Bir ulusun kahramanlıklarını olağanüstü ögelerle anlatan manzum tür hangisidir?',
    'Destan',
    TUR,
    'Destanlar ulusal kahramanlıkları olağanüstü ögelerle ve manzum biçimde anlatır.',
  ],
  [
    'Divan edebiyatında beyitlerle yazılan uzun anlatı türü hangisidir?',
    'Mesnevi',
    TUR,
    'Mesnevi beyitlerle yazılır, kafiyesi aa bb cc biçiminde ilerler ve uzun anlatılarda kullanılır.',
  ],
  [
    'Olay, kişi, yer ve zamanın geniş biçimde işlendiği uzun kurmaca tür hangisidir?',
    'Roman',
    TUR,
    'Romanda geniş bir olay örgüsü, çok sayıda kişi ve ayrıntılı yer-zaman betimlemesi bulunur.',
  ],
  [
    'Bir olayın ya da yaşam kesitinin kısa biçimde anlatıldığı tür hangisidir?',
    'Hikâye',
    TUR,
    'Hikâye kısa bir olayı ya da kesiti anlatır; kişi sayısı ve zaman dilimi romana göre dardır.',
  ],
  [
    'Nazım ve nesrin birlikte kullanıldığı, sözlü gelenekte yaşayan anlatı türü hangisidir?',
    'Halk hikâyesi',
    TUR,
    'Halk hikâyelerinde yer yer manzum bölümler bulunur ve anlatı sözlü gelenekte aktarılır.',
  ],
  [
    'Bir kişinin yaşamının başkası tarafından anlatıldığı tür hangisidir?',
    'Biyografi',
    TUR,
    'Biyografide bir kişinin yaşamı başka bir yazar tarafından kronolojik olarak anlatılır.',
  ],
  [
    'Yazarın kendi yaşamını anlattığı tür hangisidir?',
    'Otobiyografi',
    TUR,
    'Otobiyografide yazar kendi yaşamını birinci kişi ağzıyla aktarır.',
  ],
  [
    'Yaşananların günü gününe aktarıldığı yazı türü hangisidir?',
    'Günlük',
    TUR,
    'Günlükte olaylar yaşandığı gün yazılır; anlatım içten ve kişiseldir.',
  ],
  [
    'Bir konuyu kanıtlama amacı gütmeden, samimi bir dille işleyen tür hangisidir?',
    'Deneme',
    TUR,
    'Denemede yazar bir konudaki düşüncelerini kanıtlamaya çalışmadan, içten bir dille anlatır.',
  ],
  [
    'Bir görüşü kanıtlarla savunan bilimsel yazı türü hangisidir?',
    'Makale',
    TUR,
    'Makalede bir görüş tanıt, kanıt ve belgelerle desteklenerek savunulur.',
  ],
  [
    'Gezilen yerlerin izlenimlerini aktaran yazı türü hangisidir?',
    'Gezi yazısı',
    TUR,
    'Gezi yazısında yazar gördüğü yerleri, insanları ve izlenimlerini aktarır.',
  ],
  [
    'Bir konudaki görüşü kısa ve kesin bir dille veren gazete yazısı hangisidir?',
    'Fıkra',
    TUR,
    'Fıkra güncel bir konuyu kısa, etkili ve yazarın kendi görüşüyle ele alır.',
  ],
  [
    'Romanın hikâyeden en belirgin farkı nedir?',
    'Olay ve kişi kadrosunun daha geniş olması',
    'Olay ve kişi kadrosunun daha geniş olması|Daha kısa olması|Manzum yazılması|Tek kişiyle sınırlı olması',
    'Roman olay örgüsü, kişi sayısı ve zaman açısından hikâyeden çok daha geniştir.',
  ],
  [
    'Masalın gerçeklikle ilişkisi nasıldır?',
    'Olağanüstü ögelerle kurulmuş kurmaca bir dünyası vardır',
    'Olağanüstü ögelerle kurulmuş kurmaca bir dünyası vardır|Tarihî gerçeklere dayanır|Bilimsel verilerle kurulur|Günlük yaşamı belgeler',
    'Masal gerçek dünyayı yansıtmaz; olağanüstü olaylar ve varlıklarla kurmaca bir dünya oluşturur.',
  ],
  [
    'Destanların ortaya çıktığı dönem hangisidir?',
    'Yazının yaygın olmadığı sözlü kültür dönemi',
    'Yazının yaygın olmadığı sözlü kültür dönemi|Matbaanın yaygınlaştığı dönem|Romanın doğduğu dönem|Gazetenin çıktığı dönem',
    'Destanlar yazı öncesi sözlü kültürde oluşur ve kuşaktan kuşağa aktarılır.',
  ],
  [
    'Fablın sonunda yer alan ders bölümüne ne denir?',
    'Öğüt',
    'Öğüt|Serim|Düğüm|Çözüm',
    'Fabl kısa bir olayla bir öğüt verir; bu bölüm kıssadan hisse olarak da adlandırılır.',
  ],
  [
    'Hikâyede olayların ilk sunulduğu bölüm hangisidir?',
    'Serim',
    'Serim|Düğüm|Çözüm|Öğüt',
    'Serim bölümünde kişiler, yer ve zaman tanıtılır ve olay başlatılır.',
  ],
  [
    'Türk edebiyatında ilk roman hangisidir?',
    'Taaşşuk-ı Talat ve Fitnat',
    WORK,
    'Şemsettin Sami’nin 1872’de yayımladığı Taaşşuk-ı Talat ve Fitnat ilk Türk romanı kabul edilir.',
  ],
  [
    'Türk edebiyatında ilk edebî roman hangisidir?',
    'İntibah',
    WORK,
    'Namık Kemal’in İntibah adlı eseri ilk edebî roman olarak kabul edilir.',
  ],
  [
    'Türk edebiyatında ilk realist roman hangisidir?',
    'Araba Sevdası',
    WORK,
    'Recaizade Mahmut Ekrem’in Araba Sevdası romanı ilk realist roman sayılır.',
  ],
  [
    'Türk edebiyatında ilk köy romanı hangisidir?',
    'Karabibik',
    WORK,
    'Nabizade Nazım’ın Karabibik adlı eseri ilk köy romanı olarak bilinir.',
  ],
  [
    'Türk edebiyatında ilk tarihî roman hangisidir?',
    'Cezmi',
    WORK,
    'Namık Kemal’in Cezmi adlı eseri ilk tarihî roman kabul edilir.',
  ],
  [
    'Roman türünün en belirleyici özelliği hangisidir?',
    'Uzun soluklu kurmaca bir olay örgüsü sunması',
    'Uzun soluklu kurmaca bir olay örgüsü sunması|Yalnızca dörtlüklerle yazılması|Kahramanların hayvan olması|Sonunda ders vermesi',
    'Roman kurmaca bir olay örgüsünü geniş biçimde ve ayrıntılı olarak sunar.',
  ],
]);

facts(LIT, T_NARR, 'bulk-le-unsur', [
  [
    'Olayların geçtiği yere ne denir?',
    'Mekân',
    'Mekân|Zaman|Kişi|İzlek',
    'Mekân, olayların geçtiği yer ya da çevredir ve metnin atmosferini belirler.',
  ],
  [
    'Olay örgüsünün ilk basamağı hangisidir?',
    'Serim',
    'Serim|Düğüm|Çözüm|Öğüt',
    'Serimde kişiler ve çevre tanıtılır, olay başlatılır; ardından düğüm ve çözüm gelir.',
  ],
  [
    'Olayların düğümlendiği bölüm hangisidir?',
    'Düğüm',
    'Düğüm|Serim|Çözüm|Öğüt',
    'Düğümde çatışma belirginleşir ve olay karmaşıklaşır.',
  ],
  [
    'Sorunun çözüldüğü bölüm hangisidir?',
    'Çözüm',
    'Çözüm|Serim|Düğüm|Öğüt',
    'Çözüm bölümünde düğüm çözülür ve olay bir sonuca bağlanır.',
  ],
  [
    'Olayların geçtiği zaman dilimine ne denir?',
    'Zaman',
    'Zaman|Mekân|Kişi|İzlek',
    'Zaman, olayların geçtiği süreyi ve dönemi ifade eder.',
  ],
  [
    'Metnin merkezindeki kişiye ne denir?',
    'Başkişi',
    'Başkişi|Yan kişi|Anlatıcı|Yazar',
    'Başkişi olay örgüsünün merkezinde yer alır ve çatışmayı taşır.',
  ],
  [
    'Başkişiye karşı çıkan kişiye ne denir?',
    'Karşıt kişi',
    'Karşıt kişi|Başkişi|Anlatıcı|Yardımcı kişi',
    'Karşıt kişi başkişinin karşısında durur ve çatışmayı oluşturur.',
  ],
  [
    'Kişilerin dış görünüşünü veren betimleme hangisidir?',
    'Fiziksel betimleme',
    'Fiziksel betimleme|Ruhsal betimleme|Özetleme|Diyalog',
    'Fiziksel betimleme kişilerin boy, yüz ve giyim gibi dış özelliklerini anlatır.',
  ],
  [
    'Kişilerin iç dünyasını veren betimleme hangisidir?',
    'Ruhsal betimleme',
    'Ruhsal betimleme|Fiziksel betimleme|Özetleme|Diyalog',
    'Ruhsal betimleme kişilerin duygu, düşünce ve iç çatışmalarını aktarır.',
  ],
  [
    'Olayların mantıksal sırasına ne denir?',
    'Olay örgüsü',
    'Olay örgüsü|İzlek|Mekân|Bakış açısı',
    'Olay örgüsü, olayların neden-sonuç ilişkisi içinde sıralanmasıdır.',
  ],
  [
    'Metnin geçtiği toplumsal ortama ne denir?',
    'Sosyal çevre',
    'Sosyal çevre|Fiziksel çevre|Zaman|İzlek',
    'Sosyal çevre, kişilerin içinde yaşadığı toplumsal koşulları ve ilişkileri kapsar.',
  ],
  [
    'Anlatıda yer alan yardımcı kişilere ne denir?',
    'Yan kişiler',
    'Yan kişiler|Başkişi|Karşıt kişi|Anlatıcı',
    'Yan kişiler olay örgüsünü destekler, başkişinin özelliklerini görünür kılar.',
  ],
  [
    'Metnin iletmek istediği temel yargıya ne denir?',
    'Ana düşünce',
    'Ana düşünce|Yardımcı düşünce|Konu|İzlek',
    'Ana düşünce metnin okura iletmek istediği temel yargıdır.',
  ],
  [
    'Metinde ana düşünceyi destekleyen yargılara ne denir?',
    'Yardımcı düşünce',
    'Yardımcı düşünce|Ana düşünce|Konu|İzlek',
    'Yardımcı düşünceler ana düşünceyi açıklar ve destekler.',
  ],
  [
    'Metinde işlenen temel çatışma türlerinden biri hangisidir?',
    'İnsan ile doğa',
    'İnsan ile doğa|Yazar ile okur|Dize ile beyit|Ölçü ile durak',
    'Anlatıda kişinin kendisiyle, toplumla ya da doğayla çatışması işlenebilir.',
  ],
  [
    'Hikâyedeki kişi sayısı romana göre nasıldır?',
    'Daha azdır',
    'Daha azdır|Daha fazladır|Her zaman sıfırdır|Eşittir',
    'Hikâye kısa olduğu için kişi kadrosu romana göre dardır.',
  ],
  [
    'Zamanın belirsiz bırakılması hangi türde yaygındır?',
    'Masal',
    'Masal|Roman|Günlük|Makale',
    'Masalda “bir varmış bir yokmuş” gibi kalıplarla zaman ve yer belirsiz bırakılır.',
  ],
  [
    'Anlatıda olayların birbirini doğurmasına ne denir?',
    'Neden-sonuç zinciri',
    'Neden-sonuç zinciri|Betimleme|Diyalog|Özetleme',
    'Olay örgüsü, bir olayın bir sonrakini doğurduğu neden-sonuç zinciriyle ilerler.',
  ],
]);

facts(LIT, T_NARR, 'bulk-le-eser', [
  [
    'Aşk-ı Memnu romanı hangi yazara aittir?',
    'Halit Ziya Uşaklıgil',
    AUTHOR,
    'Aşk-ı Memnu, Servet-i Fünun döneminin romancısı Halit Ziya Uşaklıgil’in eseridir.',
  ],
  [
    'Mai ve Siyah romanı hangi yazara aittir?',
    'Halit Ziya Uşaklıgil',
    AUTHOR,
    'Mai ve Siyah, Halit Ziya Uşaklıgil’in Servet-i Fünun döneminde yazdığı romandır.',
  ],
  [
    'Eylül romanı hangi yazara aittir?',
    'Mehmet Rauf',
    AUTHOR,
    'Eylül, Mehmet Rauf’un ilk psikolojik roman olarak kabul edilen eseridir.',
  ],
  [
    'İntibah romanı hangi yazara aittir?',
    'Namık Kemal',
    AUTHOR,
    'İntibah, Namık Kemal’in Tanzimat döneminde yazdığı ilk edebî roman kabul edilen eseridir.',
  ],
  [
    'Cezmi romanı hangi yazara aittir?',
    'Namık Kemal',
    AUTHOR,
    'Cezmi, Namık Kemal’in ilk tarihî roman olarak bilinen eseridir.',
  ],
  [
    'Araba Sevdası romanı hangi yazara aittir?',
    'Recaizade Mahmut Ekrem',
    AUTHOR,
    'Araba Sevdası, Recaizade Mahmut Ekrem’in ilk realist roman sayılan eseridir.',
  ],
  [
    'Taaşşuk-ı Talat ve Fitnat hangi yazara aittir?',
    'Şemsettin Sami',
    AUTHOR,
    'Taaşşuk-ı Talat ve Fitnat, Şemsettin Sami’nin ilk Türk romanı kabul edilen eseridir.',
  ],
  [
    'Karabibik hangi yazara aittir?',
    'Nabizade Nazım',
    AUTHOR,
    'Karabibik, Nabizade Nazım’ın ilk köy romanı olarak bilinen eseridir.',
  ],
  [
    'Kürk Mantolu Madonna hangi yazara aittir?',
    'Sabahattin Ali',
    AUTHOR,
    'Kürk Mantolu Madonna, Sabahattin Ali’nin Cumhuriyet dönemi romanlarından biridir.',
  ],
  [
    'Kuyucaklı Yusuf hangi yazara aittir?',
    'Sabahattin Ali',
    AUTHOR,
    'Kuyucaklı Yusuf, Sabahattin Ali’nin Anadolu’yu konu alan romanıdır.',
  ],
  [
    'İnce Memed hangi yazara aittir?',
    'Yaşar Kemal',
    AUTHOR,
    'İnce Memed, Yaşar Kemal’in Çukurova’yı anlatan romanıdır.',
  ],
  [
    'Dokuzuncu Hariciye Koğuşu hangi yazara aittir?',
    'Peyami Safa',
    AUTHOR,
    'Dokuzuncu Hariciye Koğuşu, Peyami Safa’nın psikolojik romanlarından biridir.',
  ],
  [
    'Yaban romanı hangi yazara aittir?',
    'Yakup Kadri Karaosmanoğlu',
    AUTHOR,
    'Yaban, Yakup Kadri Karaosmanoğlu’nun Kurtuluş Savaşı dönemini anlatan romanıdır.',
  ],
  [
    'Memleket Hikâyeleri hangi yazara aittir?',
    'Refik Halit Karay',
    AUTHOR,
    'Memleket Hikâyeleri, Refik Halit Karay’ın Anadolu’yu konu alan hikâye kitabıdır.',
  ],
  [
    'Aşk-ı Memnu hangi edebî dönemin romanıdır?',
    'Servet-i Fünun',
    'Tanzimat|Servet-i Fünun|Milli Edebiyat|Cumhuriyet',
    'Aşk-ı Memnu, Servet-i Fünun döneminin bireyin iç dünyasına yönelen roman anlayışını taşır.',
  ],
  [
    'İntibah hangi edebî dönemin romanıdır?',
    'Tanzimat',
    'Tanzimat|Servet-i Fünun|Milli Edebiyat|Cumhuriyet',
    'İntibah, Tanzimat döneminde yazılmış ilk edebî roman kabul edilir.',
  ],
  [
    'Yaban hangi edebî dönemin romanıdır?',
    'Cumhuriyet',
    'Tanzimat|Servet-i Fünun|Milli Edebiyat|Cumhuriyet',
    'Yaban, Cumhuriyet döneminde yazılmış, Anadolu’ya yönelen romanlardan biridir.',
  ],
  [
    'Eylül hangi edebî dönemin romanıdır?',
    'Servet-i Fünun',
    'Tanzimat|Servet-i Fünun|Milli Edebiyat|Cumhuriyet',
    'Eylül, Servet-i Fünun döneminin psikolojik roman anlayışını temsil eder.',
  ],
  [
    'Türk edebiyatında ilk psikolojik roman hangisidir?',
    'Eylül',
    WORK,
    'Mehmet Rauf’un Eylül romanı kişilerin iç dünyasını merkeze aldığı için ilk psikolojik roman sayılır.',
  ],
  [
    'Servet-i Fünun romanında hangi anlayış öne çıkar?',
    'Bireyin iç dünyasına yönelen sanatlı anlatım',
    'Bireyin iç dünyasına yönelen sanatlı anlatım|Toplumu eğitme amacı|Sade halk dili|Destan geleneği',
    'Servet-i Fünun romancıları bireyin iç dünyasına yönelir ve sanatlı bir dil kullanır.',
  ],
  [
    'Tanzimat romanının ilk örneklerinde hangi amaç öne çıkar?',
    'Toplumu eğitmek',
    'Toplumu eğitmek|Bireyin bilinçaltını çözümlemek|Doğayı yüceltmek|Sözlü geleneği sürdürmek',
    'Tanzimat romancıları halkı eğitmeyi ve yeni düşünceleri yaymayı amaçlar.',
  ],
  [
    'Milli Edebiyat hikâyesinde hangi dil anlayışı benimsenmiştir?',
    'Sade, konuşma diline yakın Türkçe',
    'Sade, konuşma diline yakın Türkçe|Ağır ve süslü Osmanlıca|Yalnızca Arapça sözcükler|Yapay ve kapalı dil',
    'Milli Edebiyat döneminde sade ve konuşma diline yakın bir Türkçe benimsenir.',
  ],
  [
    'Cumhuriyet dönemi romanında hangi yönelim görülür?',
    'Toplumsal gerçekliğe ve Anadolu’ya yönelme',
    'Toplumsal gerçekliğe ve Anadolu’ya yönelme|Yalnızca saray çevresini anlatma|Divan geleneğine dönme|Masal kalıplarını sürdürme',
    'Cumhuriyet dönemi romanı Anadolu’ya ve toplumsal sorunlara yönelir.',
  ],
  [
    'Ömer Seyfettin hangi dönemin hikâyecisidir?',
    'Milli Edebiyat',
    'Tanzimat|Servet-i Fünun|Milli Edebiyat|Cumhuriyet',
    'Ömer Seyfettin sade dili ve millî konularıyla Milli Edebiyat döneminin hikâyecisidir.',
  ],
]);

facts(LIT, T_NARR, 'bulk-le-akim', [
  [
    'Akla ve kurallara dayanan sanat anlayışı hangi akımdır?',
    'Klasisizm',
    'Klasisizm|Romantizm|Realizm|Natüralizm',
    'Klasisizm akla, ölçüye ve kurallara dayanır; 17. yüzyılda Fransa’da gelişmiştir.',
  ],
  [
    'Duygu, hayal ve doğanın öne çıktığı akım hangisidir?',
    'Romantizm',
    'Romantizm|Klasisizm|Realizm|Parnasizm',
    'Romantizmde duygu, hayal ve doğa öne çıkar; bireyin özgürlüğü vurgulanır.',
  ],
  [
    'Gerçeği gözleme dayalı olarak yansıtan akım hangisidir?',
    'Realizm',
    'Realizm|Romantizm|Sembolizm|Fütürizm',
    'Realizm gözleme ve toplumsal gerçekliğe dayanır, abartıdan kaçınır.',
  ],
  [
    'İnsanı kalıtım ve çevrenin belirlediğini savunan akım hangisidir?',
    'Natüralizm',
    'Natüralizm|Klasisizm|Parnasizm|Sembolizm',
    'Natüralizm realizmin bilimsel uzantısıdır; kalıtım ve çevre belirleyici sayılır.',
  ],
  [
    'Sanat sanat içindir ilkesiyle biçime önem veren şiir akımı hangisidir?',
    'Parnasizm',
    'Parnasizm|Romantizm|Natüralizm|Fütürizm',
    'Parnasizmde biçim kusursuzluğu ve ölçü önemsenir; duygu geri planda kalır.',
  ],
  [
    'Sembollerle kapalı bir anlatımı benimseyen akım hangisidir?',
    'Sembolizm',
    'Sembolizm|Realizm|Klasisizm|Natüralizm',
    'Sembolizmde anlam doğrudan değil, semboller ve çağrışımlarla verilir.',
  ],
  [
    'Bilinçaltını ve rüyayı sanata taşıyan akım hangisidir?',
    'Sürrealizm',
    'Sürrealizm|Parnasizm|Realizm|Klasisizm',
    'Sürrealizm bilinçaltı, rüya ve otomatik yazıyla aklın denetimini aşmayı amaçlar.',
  ],
  [
    'Makineyi ve hızı yücelten akım hangisidir?',
    'Fütürizm',
    'Fütürizm|Sembolizm|Natüralizm|Romantizm',
    'Fütürizm sanayi, hız ve makineyi yücelterek geleneği reddeder.',
  ],
  [
    'Klasisizmin ünlü temsilcisi hangisidir?',
    'Racine',
    'Racine|Victor Hugo|Émile Zola|Honoré de Balzac',
    'Racine klasisizmin tragedyada öne çıkan temsilcisidir; diğer adlar farklı akımlara bağlıdır.',
  ],
  [
    'Realizmin öncü yazarları hangileridir?',
    'Balzac ve Stendhal',
    'Balzac ve Stendhal|Hugo ve Lamartine|Zola ve Maupassant|Verlaine ve Rimbaud',
    'Balzac ve Stendhal realizmin öncüleri sayılır; gözleme dayalı roman anlayışını geliştirmişlerdir.',
  ],
  [
    'Natüralizmin kurucusu kimdir?',
    'Émile Zola',
    'Émile Zola|Victor Hugo|Racine|Baudelaire',
    'Émile Zola natüralizmin kurucusu kabul edilir ve romanı bilimsel yönteme yaklaştırır.',
  ],
  [
    'Romantizmin öncü yazarı kimdir?',
    'Victor Hugo',
    'Victor Hugo|Racine|Émile Zola|Stendhal',
    'Victor Hugo romantizmin öncü yazarlarındandır; duygu ve hayal gücünü öne çıkarır.',
  ],
  [
    'Türk edebiyatında romantizm etkisi hangi dönemde görülür?',
    'Tanzimat',
    'Tanzimat|Servet-i Fünun|Milli Edebiyat|Cumhuriyet',
    'Tanzimat döneminde romantizmin duygu ve toplumcu anlayışı belirgin biçimde görülür.',
  ],
  [
    'Türk edebiyatında realizm etkisi hangi dönemde belirginleşir?',
    'Servet-i Fünun',
    'Servet-i Fünun|Tanzimat|Milli Edebiyat|Cumhuriyet',
    'Servet-i Fünun döneminde realist ve psikolojik roman anlayışı belirginleşir.',
  ],
  [
    'Parnasizmin Türk edebiyatındaki temsilcisi kimdir?',
    'Tevfik Fikret',
    'Tevfik Fikret|Ahmet Haşim|Mehmet Emin Yurdakul|Yahya Kemal',
    'Tevfik Fikret biçim özenine verdiği önemle parnasizmden etkilenmiştir.',
  ],
  [
    'Sembolizmin Türk edebiyatındaki temsilcisi kimdir?',
    'Ahmet Haşim',
    'Ahmet Haşim|Tevfik Fikret|Mehmet Akif Ersoy|Necip Fazıl Kısakürek',
    'Ahmet Haşim kapalı anlatımı ve sembolik şiir anlayışıyla sembolizme bağlanır.',
  ],
  [
    'Klasisizm hangi ülkede doğmuştur?',
    'Fransa',
    'Fransa|İngiltere|Almanya|İtalya',
    'Klasisizm 17. yüzyılda Fransa’da ortaya çıkmış ve kuralları belirlenmiştir.',
  ],
]);

/* ---------------------------------------------------------------- */
/* Edebiyat: Anlatıcı ve Bakış Açısı                                 */
/* ---------------------------------------------------------------- */

const VOICE = 'Birinci kişi anlatıcı|Hâkim anlatıcı|Gözlemci anlatıcı|Birinci kişi çoğul anlatıcı';

facts(LIT, T_VOICE, 'bulk-le-anl', [
  [
    'Olayları “ben” diyerek aktaran anlatıcıya ne denir?',
    'Birinci kişi anlatıcı',
    VOICE,
    'Birinci kişi anlatıcı olayları kendi ağzından aktarır ve yalnızca bildiklerini anlatır.',
  ],
  [
    'Her şeyi bilen ve kişilerin iç dünyasını aktaran anlatıcıya ne denir?',
    'Hâkim anlatıcı',
    VOICE,
    'Hâkim anlatıcı kişilerin geçmişini, düşüncelerini ve duygularını bilir.',
  ],
  [
    'Yalnızca gözlemlediğini aktaran anlatıcıya ne denir?',
    'Gözlemci anlatıcı',
    VOICE,
    'Gözlemci anlatıcı bir kamera gibi yalnızca görüneni aktarır, iç dünyayı bilemez.',
  ],
  [
    'Kahraman anlatıcının bilgi sınırı nedir?',
    'Kendi bildikleriyle sınırlıdır',
    'Kendi bildikleriyle sınırlıdır|Her şeyi bilir|Yalnızca doğayı bilir|Geleceği bilir',
    'Kahraman anlatıcı olayları kendi bakışıyla aktardığı için bilgisi kişisel deneyimiyle sınırlıdır.',
  ],
  [
    'Hâkim anlatıcının temel özelliği nedir?',
    'Kişilerin iç dünyasını ve geçmişini bilmesi',
    'Kişilerin iç dünyasını ve geçmişini bilmesi|Yalnızca konuşmaları aktarması|Olayları yorumlamaması|Kendini gizlemesi',
    'Hâkim anlatıcı sınırsız bilgiyle kişilerin iç dünyasına ve geçmişine ulaşır.',
  ],
  [
    'Gözlemci anlatıcı hangi bilgiye ulaşamaz?',
    'Kişilerin iç dünyasına',
    'Kişilerin iç dünyasına|Olayların sırasına|Kişilerin dış görünüşüne|Konuşmalara',
    'Gözlemci anlatıcı iç dünyayı bilemez; yalnızca dışarıdan görüneni aktarır.',
  ],
  [
    'İlahi bakış açısı hangi anlatıcıyla eşleşir?',
    'Hâkim anlatıcı',
    VOICE,
    'İlahi bakış açısı her şeyi bilen hâkim anlatıcıya karşılık gelir.',
  ],
  [
    'Anlatıcının “ben” zamirini kullanması hangi bakış açısını gösterir?',
    'Birinci kişi',
    'Birinci kişi|Üçüncü kişi|Gözlemci|Çoğul',
    '“Ben” zamiri anlatıcının olayların içinde yer aldığını, yani birinci kişi bakış açısını gösterir.',
  ],
  [
    'Olayları dışarıdan izleyen bir tanık gibi aktarma hangi bakış açısıdır?',
    'Gözlemci bakış açısı',
    'Gözlemci bakış açısı|Hâkim bakış açısı|Birinci kişi bakış açısı|Çoğul bakış açısı',
    'Tanık konumundaki anlatıcı yalnızca gözlediklerini aktardığı için gözlemci bakış açısıdır.',
  ],
  [
    'Anlatıcı ile yazar arasındaki fark nedir?',
    'Anlatıcı kurmaca ses, yazar gerçek kişidir',
    'Anlatıcı kurmaca ses, yazar gerçek kişidir|İkisi aynı kişidir|Anlatıcı her zaman yazardır|Yazar metinde konuşmaz',
    'Anlatıcı yazarın yarattığı kurmaca bir sestir; yazar ise gerçek bir kişidir.',
  ],
  [
    'Birinci kişi anlatımın okura etkisi nedir?',
    'Olaylara yakınlık ve samimiyet kazandırır',
    'Olaylara yakınlık ve samimiyet kazandırır|Olayları uzaklaştırır|Bilgiyi sınırsızlaştırır|Zamanı belirsizleştirir',
    'Birinci kişi anlatım okuru olayların içine çeker ve samimi bir ton oluşturur.',
  ],
  [
    'Üçüncü kişi anlatımın sağladığı olanak nedir?',
    'Olayları geniş bir çerçevede sunma',
    'Olayları geniş bir çerçevede sunma|Yalnızca tek kişiyi anlatma|Zamanı kısaltma|Diyaloğu kaldırma',
    'Üçüncü kişi anlatıcı olayları ve kişileri daha geniş bir çerçevede sunabilir.',
  ],
  [
    'Anlatıcının yorum yapmadan aktarması hangi anlatım tutumudur?',
    'Nesnel anlatım',
    'Nesnel anlatım|Öznel anlatım|İronik anlatım|Lirik anlatım',
    'Nesnel anlatımda anlatıcı kişisel yargı bildirmez, gözlemlenebilir olanı aktarır.',
  ],
  [
    'Anlatıcının olaylara müdahale edip yorum yapması hangi tutumdur?',
    'Öznel anlatım',
    'Öznel anlatım|Nesnel anlatım|Gözlemci anlatım|Diyalog',
    'Öznel anlatımda anlatıcı kendi duygu ve yargılarını metne katar.',
  ],
  [
    'Anlatıcının güvenilmez olması ne demektir?',
    'Aktardıklarının gerçekle çelişebilmesi',
    'Aktardıklarının gerçekle çelişebilmesi|Hiç konuşmaması|Her şeyi bilmesi|Yalnızca diyalog kurması',
    'Güvenilmez anlatıcı bilgiyi eksik ya da çarpıtarak aktarır; okur metni sorgular.',
  ],
  [
    'Çoğul bakış açısı ne demektir?',
    'Aynı olayın birden çok kişi tarafından anlatılması',
    'Aynı olayın birden çok kişi tarafından anlatılması|Tek kişinin iç dünyası|Yazarın araya girmesi|Zamanın belirsizliği',
    'Çoğul bakış açısında aynı olay farklı kişilerin gözünden aktarılır.',
  ],
  [
    'Anlatıcının geçmişe dönerek anlatmasına ne denir?',
    'Geriye dönüş',
    'Geriye dönüş|Ön sezgi|Montaj|Özetleme',
    'Geriye dönüşte anlatı şimdiki zamandan geçmişe kırılır ve eksik bilgi tamamlanır.',
  ],
  [
    'Anlatıcının araya girip bilgi vermesine ne denir?',
    'Anlatıcı müdahalesi',
    'Anlatıcı müdahalesi|Diyalog|Betimleme|Özetleme',
    'Anlatıcı müdahalesinde anlatıcı akışı keserek açıklama ya da yorum yapar.',
  ],
  [
    'Bakış açısı değiştiğinde metinde ne değişir?',
    'Olayların sunuluş biçimi',
    'Olayların sunuluş biçimi|Olayların tarihi|Kişilerin adları|Metnin uzunluğu',
    'Bakış açısı, olayların kimin gözünden ve hangi bilgi sınırıyla anlatıldığını belirler.',
  ],
  [
    'Anlatıcının çocuk olması metne ne kazandırır?',
    'Saf ve sınırlı bir bakış',
    'Saf ve sınırlı bir bakış|Sınırsız bilgi|Nesnel bir ton|Tarihî bir derinlik',
    'Çocuk anlatıcı olayları eksik ve saf bir bakışla aktararak metne özgün bir ton katar.',
  ],
  [
    'Üçüncü kişi anlatıcı hangi zamirlerle konuşur?',
    'O ve onlar',
    'O ve onlar|Ben ve biz|Sen ve siz|Ben ve sen',
    'Üçüncü kişi anlatıcı “o” ve “onlar” zamirlerini kullanarak dışarıdan anlatır.',
  ],
  [
    'Birinci kişi anlatımda okur neyi bilemez?',
    'Anlatıcının bilmediği olayları',
    'Anlatıcının bilmediği olayları|Anlatıcının duygularını|Anlatıcının düşüncelerini|Anlatıcının gördüklerini',
    'Birinci kişi anlatıcı yalnızca kendi bildiklerini aktardığı için bilmediği olaylar okura kapalı kalır.',
  ],
  [
    'Anlatıcının olayları eksik aktarması hangi etkiyi yaratır?',
    'Belirsizlik ve merak',
    'Belirsizlik ve merak|Tam bilgi|Nesnellik|Durağanlık',
    'Eksik bilgi okurda boşluklar oluşturur ve merakı artırır.',
  ],
  [
    'Hâkim anlatıcı hangi metinlerde sık görülür?',
    'Klasik romanlarda',
    'Klasik romanlarda|Günlüklerde|Mektuplarda|Ansiklopedilerde',
    'Klasik roman geleneğinde her şeyi bilen hâkim anlatıcı yaygın olarak kullanılır.',
  ],
  [
    'Anlatıcının dili hangi unsura göre şekillenir?',
    'Bakış açısına ve konumuna',
    'Bakış açısına ve konumuna|Metnin sayfa sayısına|Kitabın boyutuna|Yayınevine',
    'Anlatıcının sözcük seçimi, bakış açısı ve toplumsal konumuyla biçimlenir.',
  ],
  [
    'Bilinçli bir anlatıcı seçimi metne ne kazandırır?',
    'Anlatıya tutarlı bir bakış',
    'Anlatıya tutarlı bir bakış|Konunun değişmesini|Zamanın kaybolmasını|Kişilerin azalmasını',
    'Tutarlı bir anlatıcı seçimi metnin bakışını ve bilgi sınırını düzenli kılar.',
  ],
]);

facts(LIT, T_VOICE, 'bulk-le-bakis', [
  [
    '“Sabah erken kalktım ve pencereyi açtım.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi anlatıcı',
    VOICE,
    '“Kalktım” ve “açtım” çekimleri anlatıcının olayın içinde olduğunu gösterir.',
  ],
  [
    '“Kapıyı açtı, içeri girdi, çantasını masaya bıraktı.” cümlesinde yalnızca görünenler aktarıldığına göre hangi anlatıcı vardır?',
    'Gözlemci anlatıcı',
    VOICE,
    'Eylemler dışarıdan izleniyor, iç dünya verilmiyor; bu gözlemci anlatıcının işaretidir.',
  ],
  [
    '“İçeri girdiğinde herkesin ona baktığını biliyor, korkusunu gizliyordu.” cümlesinde hangi anlatıcı vardır?',
    'Hâkim anlatıcı',
    VOICE,
    'Kişinin ne bildiği ve ne hissettiği aktarıldığı için anlatıcı her şeyi bilen konumdadır.',
  ],
  [
    '“Biz, mahallenin çocukları, her akşam burada toplanırdık.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi çoğul anlatıcı',
    VOICE,
    '“Biz” zamiri anlatıcının bir topluluğun içinde yer aldığını gösterir.',
  ],
  [
    '“Yıllar sonra o günü hatırladım ve gülümsedim.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi anlatıcı',
    VOICE,
    '“Hatırladım” ve “gülümsedim” çekimleri birinci kişi anlatıcıyı gösterir.',
  ],
  [
    '“Adam başını kaldırdı, saate baktı, sonra dışarı çıktı.” cümlesinde hangi anlatıcı vardır?',
    'Gözlemci anlatıcı',
    VOICE,
    'Yalnızca gözlenebilen hareketler aktarılmış, kişinin iç dünyasına girilmemiştir.',
  ],
  [
    '“Ne düşündüğünü kimseye söylemedi; içinde bir fırtına kopuyordu.” cümlesinde hangi anlatıcı vardır?',
    'Hâkim anlatıcı',
    VOICE,
    'Kişinin iç dünyası doğrudan bilindiği için anlatıcı hâkim konumdadır.',
  ],
  [
    '“Hepimiz aynı anda sustuk.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi çoğul anlatıcı',
    VOICE,
    '“Hepimiz” sözcüğü anlatıcının bir gruba dahil olduğunu gösterir.',
  ],
  [
    '“O gün yağmur yağıyordu; şemsiyemi unuttuğum için ıslandım.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi anlatıcı',
    VOICE,
    '“Unuttuğum” ve “ıslandım” ifadeleri olayı yaşayan anlatıcıyı gösterir.',
  ],
  [
    '“Kadın perdeyi araladı, sokağa baktı ve geri çekildi.” cümlesinde hangi anlatıcı vardır?',
    'Gözlemci anlatıcı',
    VOICE,
    'Anlatıcı yalnızca dışarıdan görülen hareketleri aktarmıştır.',
  ],
  [
    '“Bu haberi duyunca sevineceğini biliyordu.” cümlesinde hangi anlatıcı vardır?',
    'Hâkim anlatıcı',
    VOICE,
    'Gelecekteki duyguyu bilmek ancak her şeyi bilen anlatıcıyla mümkündür.',
  ],
  [
    '“Yolun sonunda bizi bir kalabalık bekliyordu.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi çoğul anlatıcı',
    VOICE,
    '“Bizi” zamiri anlatıcının bir grupla birlikte hareket ettiğini gösterir.',
  ],
  [
    '“Defteri açtım, tarihi yazdım ve sustum.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi anlatıcı',
    VOICE,
    'Eylemler birinci tekil kişi çekimiyle verildiği için anlatıcı olayın içindedir.',
  ],
  [
    '“Çocuk topu aldı, duvara fırlattı, camı kırdı.” cümlesinde hangi anlatıcı vardır?',
    'Gözlemci anlatıcı',
    VOICE,
    'Olay zinciri yalnızca dışarıdan gözlenen eylemlerle aktarılmıştır.',
  ],
  [
    '“Kimsenin bilmediği bir korkuyu her gece yeniden yaşıyordu.” cümlesinde hangi anlatıcı vardır?',
    'Hâkim anlatıcı',
    VOICE,
    'Kişinin gizli korkusunu bilmek hâkim anlatıcının sınırsız bilgisine işaret eder.',
  ],
  [
    '“Köyün çocukları olarak derenin kenarında oynardık.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi çoğul anlatıcı',
    VOICE,
    '“Oynardık” çekimi anlatıcının bir topluluğun parçası olduğunu gösterir.',
  ],
  [
    '“Ellerim titriyordu, mektubu katlayıp cebime koydum.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi anlatıcı',
    VOICE,
    'Anlatıcı kendi bedenindeki belirtiyi ve eylemini birinci kişiyle aktarır.',
  ],
  [
    '“Yaşlı adam kapıyı açtı ve hiçbir şey söylemeden içeri geçti.” cümlesinde hangi anlatıcı vardır?',
    'Gözlemci anlatıcı',
    VOICE,
    'Anlatıcı kişinin suskunluğunu gözlemler ama iç dünyasını bilmez.',
  ],
  [
    '“Yaptığı hatanın farkındaydı ama özür dilemeye cesaret edemedi.” cümlesinde hangi anlatıcı vardır?',
    'Hâkim anlatıcı',
    VOICE,
    'Kişinin farkındalığı ve korkusu doğrudan bilindiği için anlatıcı hâkimdir.',
  ],
  [
    '“Sabah olunca hep birlikte yola çıktık.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi çoğul anlatıcı',
    VOICE,
    '“Çıktık” çekimi anlatıcının bir grupla birlikte anlatıya katıldığını gösterir.',
  ],
  [
    '“Odaya girdiğimde lamba hâlâ yanıyordu.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi anlatıcı',
    VOICE,
    '“Girdiğimde” yan cümlesi anlatıcının olayı yaşayan kişi olduğunu gösterir.',
  ],
  [
    '“Masanın üstündeki bardağı aldı ve mutfağa götürdü.” cümlesinde hangi anlatıcı vardır?',
    'Gözlemci anlatıcı',
    VOICE,
    'Yalnızca görülen eylemler aktarılmış, kişinin niyeti verilmemiştir.',
  ],
  [
    '“Yarın her şeyin değişeceğini ikisi de bilmiyordu.” cümlesinde hangi anlatıcı vardır?',
    'Hâkim anlatıcı',
    VOICE,
    'Anlatıcı iki kişinin de bilmediği bir gerçeği bildiği için hâkim konumdadır.',
  ],
  [
    '“Bu şehre ilk kez birlikte gelmiştik.” cümlesinde hangi anlatıcı vardır?',
    'Birinci kişi çoğul anlatıcı',
    VOICE,
    '“Gelmiştik” çekimi anlatıcının bir grupla ortak geçmişini anlatır.',
  ],
]);

facts(LIT, T_VOICE, 'bulk-le-teknik', [
  [
    'Kişinin içinden geçenleri kesintisiz aktaran teknik hangisidir?',
    'İç monolog',
    'İç monolog|Bilinç akışı|Diyalog|Montaj',
    'İç monologda kişi düşüncelerini kendi içinden, kesintisiz biçimde dile getirir.',
  ],
  [
    'Düşüncelerin çağrışımlarla düzensiz aktarıldığı teknik hangisidir?',
    'Bilinç akışı',
    'Bilinç akışı|İç monolog|Diyalog|Betimleme',
    'Bilinç akışında düşünceler mantıksal sıra gözetmeden, çağrışımlarla akar.',
  ],
  [
    'Kişinin kendi kendine konuşması biçimindeki anlatım hangisidir?',
    'İç konuşma',
    'İç konuşma|Diyalog|Betimleme|Özetleme',
    'İç konuşmada kişi sesli düşünür gibi kendi kendine konuşur.',
  ],
  [
    'Olayların geçmişe dönülerek anlatılması hangi tekniktir?',
    'Geriye dönüş',
    'Geriye dönüş|Ön sezgi|Montaj|Özetleme',
    'Geriye dönüşte anlatı geçmişe kırılarak eksik bilgi tamamlanır.',
  ],
  [
    'Gelecekte olacakların sezdirilmesine ne denir?',
    'Ön sezgi',
    'Ön sezgi|Geriye dönüş|Montaj|İç çözümleme',
    'Ön sezgide sonraki olaylara dair ipuçları verilerek okurda beklenti oluşturulur.',
  ],
  [
    'Anlatının içinde ikinci bir öykünün anlatılması hangi tekniktir?',
    'Öykü içinde öykü',
    'Öykü içinde öykü|Montaj|Diyalog|Özetleme',
    'Öykü içinde öyküde ana anlatı kesilerek başka bir anlatı devreye girer.',
  ],
  [
    'Kişilerin karşılıklı konuşmalarına ne denir?',
    'Diyalog',
    'Diyalog|Monolog|Betimleme|Montaj',
    'Diyalogda iki ya da daha fazla kişi karşılıklı konuşur.',
  ],
  [
    'Yazarın kişilerin düşüncelerini üçüncü kişi ağzından vermesine ne denir?',
    'İç çözümleme',
    'İç çözümleme|İç monolog|Diyalog|Montaj',
    'İç çözümlemede anlatıcı kişinin iç dünyasını üçüncü kişi ağzıyla açıklar.',
  ],
  [
    'Mektup ve günlük gibi belgelerle olay aktarımı hangi tekniktir?',
    'Belge tekniği',
    'Belge tekniği|Montaj|Diyalog|Özetleme',
    'Belge tekniğinde mektup, günlük ya da gazete haberi gibi araçlar anlatıya katılır.',
  ],
  [
    'Farklı zaman ve mekân kesitlerinin yan yana getirilmesine ne denir?',
    'Montaj',
    'Montaj|Diyalog|Betimleme|İç monolog',
    'Montajda kopuk görünen kesitler yan yana getirilerek yeni bir anlam kurulur.',
  ],
  [
    'Bilinç akışı tekniği hangi yazarla özdeşleşir?',
    'James Joyce',
    'James Joyce|Victor Hugo|Émile Zola|Racine',
    'James Joyce bilinç akışı tekniğini romanlarında belirgin biçimde kullanmıştır.',
  ],
  [
    'İç monolog ile bilinç akışı arasındaki fark nedir?',
    'Bilinç akışında çağrışımlar düzensizdir',
    'Bilinç akışında çağrışımlar düzensizdir|İç monologda hiç düşünce yoktur|Bilinç akışı yalnızca şiirde görülür|İkisi aynı tekniktir',
    'İç monolog daha düzenli bir düşünce akışı sunarken bilinç akışı çağrışımlarla dağılır.',
  ],
  [
    'Diyalog tekniğinin okura sağladığı olanak nedir?',
    'Kişileri doğrudan tanıma',
    'Kişileri doğrudan tanıma|Zamanı durdurma|Anlatıcıyı kaldırma|Mekânı belirsizleştirme',
    'Diyalogda kişiler kendi sözleriyle göründüğü için okur onları doğrudan tanır.',
  ],
  [
    'Geriye dönüş tekniğinin amacı nedir?',
    'Geçmişle bugün arasında bağ kurma',
    'Geçmişle bugün arasında bağ kurma|Olayları hızlandırma|Kişileri azaltma|Mekânı değiştirme',
    'Geriye dönüş, bugünkü durumun nedenlerini geçmişe giderek açıklar.',
  ],
  [
    'Anlatının kronolojik sunulmaması hangi etkiyi yaratır?',
    'Merak ve gerilim',
    'Merak ve gerilim|Tam bilgi|Nesnellik|Durağanlık',
    'Zaman sırasının kırılması okurun bilgisini geciktirerek merak ve gerilim oluşturur.',
  ],
  [
    'Kişilerin dış görünüşünün ayrıntılı verilmesi hangi tekniktir?',
    'Betimleme',
    'Betimleme|Montaj|Diyalog|Özetleme',
    'Betimleme kişi, yer ya da nesnelerin görünüşünü ayrıntılı biçimde verir.',
  ],
  [
    'Olayların hızlı biçimde özetlenmesine ne denir?',
    'Özetleme',
    'Özetleme|Betimleme|Diyalog|Montaj',
    'Özetlemede uzun bir süre kısa biçimde anlatılarak anlatı hızlandırılır.',
  ],
  [
    'Anlatıcının kişilerin düşüncelerini okuyormuş gibi aktarması hangi bakış açısına bağlıdır?',
    'Hâkim bakış açısı',
    'Hâkim bakış açısı|Gözlemci bakış açısı|Birinci kişi bakış açısı|Çoğul bakış açısı',
    'Düşünceleri doğrudan bilmek ancak hâkim bakış açısıyla mümkündür.',
  ],
]);

facts(LIT, T_VOICE, 'bulk-le-yazar', [
  [
    'Kurmaca metinde anlatıcının kimliği nedir?',
    'Yazarın yarattığı kurmaca ses',
    'Yazarın yarattığı kurmaca ses|Yazarın kendisi|Okurun sesi|Yayıncının sesi',
    'Anlatıcı metnin içinde konuşan kurmaca sestir; yazarın kendisi değildir.',
  ],
  [
    'Yazarın görüşleri ile anlatıcının görüşleri her zaman aynı mıdır?',
    'Hayır, farklı olabilir',
    'Hayır, farklı olabilir|Evet, her zaman aynıdır|Yalnızca şiirde aynıdır|Yalnızca masalda aynıdır',
    'Anlatıcı kurgusal bir sestir; yazarın düşüncelerini aktarmak zorunda değildir.',
  ],
  [
    'Anlatıcının ironik tutumu ne sağlar?',
    'Söylenen ile kastedilen arasında fark oluşturur',
    'Söylenen ile kastedilen arasında fark oluşturur|Bilgiyi sınırlar|Zamanı durdurur|Kişileri azaltır',
    'İronide anlatıcı söylediğinin tersini kasteder ve okurdan çıkarım bekler.',
  ],
  [
    'Bir metinde birden fazla anlatıcı bulunabilir mi?',
    'Evet, bulunabilir',
    'Evet, bulunabilir|Hayır, bulunamaz|Yalnızca masallarda bulunur|Yalnızca şiirde bulunur',
    'Bölümler farklı kişilerce anlatılabilir; bu durumda metinde birden çok anlatıcı olur.',
  ],
  [
    'Anlatıcının kişiler hakkında yargı bildirmesi hangi tutumdur?',
    'Yorumcu tutum',
    'Yorumcu tutum|Nesnel tutum|Gözlemci tutum|Diyalog tutumu',
    'Yorumcu tutumda anlatıcı kişileri değerlendirir ve yargı bildirir.',
  ],
  [
    'Anlatıcının okura doğrudan seslenmesine ne denir?',
    'Okura seslenme',
    'Okura seslenme|İç monolog|Montaj|Özetleme',
    'Okura seslenmede anlatıcı anlatıyı keserek doğrudan okura hitap eder.',
  ],
  [
    'Üçüncü kişi anlatımda okur neyi öğrenebilir?',
    'Kişilerin iç dünyasını',
    'Kişilerin iç dünyasını|Yalnızca konuşmaları|Yalnızca mekânı|Hiçbir şeyi',
    'Hâkim üçüncü kişi anlatıcı kişilerin iç dünyasını okura aktarabilir.',
  ],
  [
    'Anlatıcının yaşlı olması metne ne kazandırır?',
    'Geçmişe dönük bir bakış',
    'Geçmişe dönük bir bakış|Sınırsız bilgi|Nesnel bir ton|Hızlı bir tempo',
    'Yaşlı anlatıcı olayları geriye dönerek ve deneyim süzgecinden geçirerek anlatır.',
  ],
  [
    'Anlatıcının mesleği metne ne kazandırır?',
    'Olaylara özgün bir bakış',
    'Olaylara özgün bir bakış|Konunun değişmesini|Zamanın kaybolmasını|Kişilerin azalmasını',
    'Anlatıcının mesleği, olayları hangi sözcüklerle ve hangi gözle gördüğünü etkiler.',
  ],
  [
    'Anlatıcının olayları kendi duygularıyla süslemesi hangi anlatım özelliğidir?',
    'Öznel anlatım',
    'Öznel anlatım|Nesnel anlatım|Gözlemci anlatım|Diyalog',
    'Duygu yüklü aktarım öznel anlatımın göstergesidir.',
  ],
  [
    'Anlatıcının tarafsız kalması hangi anlatım özelliğidir?',
    'Nesnel anlatım',
    'Nesnel anlatım|Öznel anlatım|İronik anlatım|Lirik anlatım',
    'Tarafsız anlatımda anlatıcı kişisel duygu ve yargı katmaz.',
  ],
  [
    'Anlatıcı seçimi metnin anlatım biçimini etkiler mi?',
    'Evet, belirleyici biçimde etkiler',
    'Evet, belirleyici biçimde etkiler|Hayır, hiç etkilemez|Yalnızca başlığı etkiler|Yalnızca sayfa sayısını etkiler',
    'Anlatıcı seçimi bilgi sınırını, tonu ve olayların sunuluşunu belirler.',
  ],
  [
    'Anlatıcının bilgi sınırı okurun merakını nasıl etkiler?',
    'Sınırlı bilgi merakı artırır',
    'Sınırlı bilgi merakı artırır|Sınırlı bilgi merakı bitirir|Bilgi sınırı etkisizdir|Sınırsız bilgi gerilim yaratır',
    'Okur anlatıcıdan fazlasını sezdiğinde boşlukları doldurmaya çalışır ve merak artar.',
  ],
  [
    'Anlatıcının olaylara tanık olması hangi bakış açısını doğurur?',
    'Birinci kişi bakış açısını',
    'Birinci kişi bakış açısını|Hâkim bakış açısını|Çoğul bakış açısını|Gözlemci bakış açısını',
    'Olayı yaşayan anlatıcı birinci kişi bakış açısıyla anlatır.',
  ],
  [
    'Anlatıcının kişilerle konuşarak bilgi toplaması hangi bakış açısıyla uyumludur?',
    'Gözlemci bakış açısıyla',
    'Gözlemci bakış açısıyla|Hâkim bakış açısıyla|Çoğul bakış açısıyla|İlahi bakış açısıyla',
    'Bilgiyi sorarak ve gözleyerek toplayan anlatıcı gözlemci konumundadır.',
  ],
  [
    'Anlatıcının güvenilirliğini belirleyen unsur nedir?',
    'Anlattıklarının tutarlılığı',
    'Anlattıklarının tutarlılığı|Metnin uzunluğu|Kişi sayısı|Bölüm sayısı',
    'Anlatıcının verdiği bilgiler metin içinde tutarlıysa güvenilirliği artar.',
  ],
]);

/* ---------------------------------------------------------------- */
/* Edebiyat: Şiir Bilgisi                                            */
/* ---------------------------------------------------------------- */

const UNIT = 'Dize|Beyit|Dörtlük|Bent';
const RHYME = 'Yarım kafiye|Tam kafiye|Zengin kafiye|Cinaslı kafiye';

facts(LIT, T_POEM, 'bulk-le-dize', [
  [
    'Şiirde her bir satıra ne denir?',
    'Dize',
    UNIT,
    'Şiirin her bir satırına dize (mısra) denir; dizeler şiirin en küçük anlam birimidir.',
  ],
  [
    'İki dizeden oluşan nazım birimine ne denir?',
    'Beyit',
    UNIT,
    'Beyit iki dizeden oluşan nazım birimidir ve divan şiirinde yaygın kullanılır.',
  ],
  [
    'Dört dizeden oluşan nazım birimine ne denir?',
    'Dörtlük',
    UNIT,
    'Dörtlük dört dizeden oluşur ve halk şiirinde temel nazım birimidir.',
  ],
  [
    'Hece ölçüsünde ölçü birimi nedir?',
    'Hece sayısı',
    'Hece sayısı|Hecelerin uzunluğu|Kelime sayısı|Dize sayısı',
    'Hece ölçüsünde dizelerdeki hece sayısının eşitliği esastır.',
  ],
  [
    'Aruz ölçüsünde ölçü birimi nedir?',
    'Hecelerin uzunluk ve kısalığı',
    'Hecelerin uzunluk ve kısalığı|Hece sayısı|Kelime sayısı|Kafiye sayısı',
    'Aruz ölçüsü açık ve kapalı hecelerin düzenine dayanır.',
  ],
  [
    'Halk şiirinde en yaygın ölçü hangisidir?',
    'Hece ölçüsü',
    'Hece ölçüsü|Aruz ölçüsü|Serbest ölçü|Duraksız ölçü',
    'Halk şiiri geleneğinde hece ölçüsü, özellikle 7, 8 ve 11’li kalıplar kullanılır.',
  ],
  [
    'Divan şiirinde en yaygın ölçü hangisidir?',
    'Aruz ölçüsü',
    'Aruz ölçüsü|Hece ölçüsü|Serbest ölçü|Duraklı ölçü',
    'Divan şiiri aruz ölçüsüyle yazılır; kalıplar Arap-Fars geleneğinden gelir.',
  ],
  [
    'Dize sonlarında anlamın bitmeyip sonraki dizeye geçmesine ne denir?',
    'Ulama',
    'Ulama|Durak|İmale|Zihaf',
    'Ulamada cümle dize sonunda tamamlanmaz, anlam sonraki dizeye taşınır.',
  ],
  [
    'Aruzda kısa hecenin uzun okunmasına ne denir?',
    'İmale',
    'İmale|Zihaf|Ulama|Durak',
    'İmale, ölçüye uydurmak için kısa hecenin uzun okunmasıdır.',
  ],
  [
    'Aruzda uzun hecenin kısa okunmasına ne denir?',
    'Zihaf',
    'Zihaf|İmale|Ulama|Durak',
    'Zihaf, ölçüye uydurmak için uzun hecenin kısa okunmasıdır.',
  ],
  [
    'Hece ölçüsünde sözcüklerin bölünmemesi kuralına ne denir?',
    'Durak',
    'Durak|Ulama|İmale|Zihaf',
    'Durak, dizede anlamın ve soluk almanın bölündüğü yerdir; sözcükler durakta bölünmez.',
  ],
  [
    'On birli hece ölçüsüyle yazılan halk şiiri nazım biçimi hangisidir?',
    'Koşma',
    'Koşma|Semai|Varsağı|Mani',
    'Koşma genellikle 11’li hece ölçüsüyle ve dörtlüklerle söylenir.',
  ],
  [
    'Sekizli hece ölçüsüyle yazılan halk şiiri nazım biçimi hangisidir?',
    'Semai',
    'Semai|Koşma|Destan|Rubai',
    'Semai 8’li hece ölçüsüyle söylenen halk şiiri biçimidir.',
  ],
  [
    'Mani kaç dizeden oluşur?',
    '4',
    '4|2|3|5',
    'Mani dört dizeden oluşur ve kafiye düzeni aaba biçimindedir.',
  ],
  [
    'Gazel hangi nazım birimiyle yazılır?',
    'Beyit',
    UNIT,
    'Gazel beyitlerle yazılır; beyit sayısı genellikle 5 ile 15 arasında değişir.',
  ],
  [
    'Rubai kaç dizeden oluşur?',
    '4',
    '4|2|3|6',
    'Rubai dört dizeden oluşan ve kendine özgü ölçüsü bulunan bir nazım biçimidir.',
  ],
  [
    'Mesnevi hangi nazım birimiyle yazılır?',
    'Beyit',
    UNIT,
    'Mesnevi beyitlerle yazılır ve kafiyesi aa bb cc biçiminde ilerler.',
  ],
  [
    'Sone hangi edebiyattan alınmıştır?',
    'Batı edebiyatı',
    'Batı edebiyatı|Halk edebiyatı|Divan edebiyatı|Arap edebiyatı',
    'Sone İtalyan ve Fransız edebiyatından alınmış, sonradan Türk şiirine girmiştir.',
  ],
  [
    'Türkü hangi nazım birimiyle yazılır?',
    'Dörtlük',
    UNIT,
    'Türküler dörtlüklerle söylenir ve genellikle bir nakarat bölümü bulunur.',
  ],
  [
    'Serbest şiirde hangi unsur zorunlu değildir?',
    'Ölçü ve kafiye',
    'Ölçü ve kafiye|Sözcükler|Dizeler|Anlam',
    'Serbest şiirde ölçü ve kafiye zorunluluğu yoktur; biçim şairin seçimine bırakılır.',
  ],
]);

facts(LIT, T_POEM, 'bulk-le-kafiye', [
  [
    'Dize sonlarında yalnızca tek ses benzerliğine ne denir?',
    'Yarım kafiye',
    RHYME,
    'Yarım kafiyede dize sonlarında yalnızca bir ses ortaktır.',
  ],
  [
    'Dize sonlarında iki ses benzerliğine ne denir?',
    'Tam kafiye',
    RHYME,
    'Tam kafiyede dize sonlarında iki ses ortak olduğu için benzerlik daha belirgindir.',
  ],
  [
    'Dize sonlarında üç ve daha fazla ses benzerliğine ne denir?',
    'Zengin kafiye',
    RHYME,
    'Zengin kafiyede üç ya da daha fazla ses ortaktır.',
  ],
  [
    'Yazılışı ve okunuşu aynı, anlamı farklı sözcüklerle yapılan kafiyeye ne denir?',
    'Cinaslı kafiye',
    RHYME,
    'Cinaslı kafiyede ses benzerliği anlam farklılığıyla birlikte kurulur.',
  ],
  [
    'Kafiyeden sonra gelen, aynı görevdeki ek ya da sözcük tekrarına ne denir?',
    'Redif',
    'Redif|Kafiye|Durak|Ulama',
    'Redif kafiyeden sonra gelir ve anlamca aynı görevde tekrar eder.',
  ],
  [
    'Redif ile kafiye arasındaki temel fark nedir?',
    'Redif anlamca aynıdır, kafiye ses benzerliğidir',
    'Redif anlamca aynıdır, kafiye ses benzerliğidir|İkisi aynı şeydir|Redif yalnızca şiirde bulunmaz|Kafiye her zaman rediftir',
    'Redifte aynı sözcük ya da ek tekrar eder; kafiyede yalnızca ses benzerliği vardır.',
  ],
  [
    '“Dağların ardında güneş söndü / Yolların sonunda umut söndü” dizelerinde tekrar eden “söndü” için hangisi doğrudur?',
    'Rediftir',
    'Rediftir|Tam kafiyedir|Zengin kafiyedir|Yarım kafiyedir',
    '“Söndü” sözcüğü iki dizede aynı görevde tekrarlandığı için rediftir.',
  ],
  [
    '“Bahçemizde güller açtı / Yüreğimde umut açtı” dizelerinde “açtı” için hangisi doğrudur?',
    'Rediftir',
    'Rediftir|Yarım kafiyedir|Cinaslı kafiyedir|Zengin kafiyedir',
    '“Açtı” aynı sözcük olarak tekrarlandığı için rediftir; öncesinde ses benzerliği yoktur.',
  ],
  [
    '“Sevdiğim bir gül idi / Gönlüm ona kul idi” dizelerinde “idi” için hangisi doğrudur?',
    'Rediftir',
    'Rediftir|Tam kafiyedir|Zengin kafiyedir|Cinaslı kafiyedir',
    '“İdi” iki dizede aynı görevde tekrarlandığı için rediftir; “gül/kul” ise tam kafiyedir.',
  ],
  [
    '“Gözüm” ve “sözüm” sözcükleri arasındaki kafiye türü nedir?',
    'Zengin kafiye',
    RHYME,
    '“Gözüm” ve “sözüm” sonlarında “özüm” sesleri ortaktır; dört ses benzerliği zengin kafiyedir.',
  ],
  [
    '“Yar” ve “kar” sözcükleri arasındaki kafiye türü nedir?',
    'Tam kafiye',
    RHYME,
    'İki sözcüğün sonunda “ar” sesleri ortaktır; iki ses benzerliği tam kafiyedir.',
  ],
  [
    '“Ben” ve “sen” sözcükleri arasındaki kafiye türü nedir?',
    'Tam kafiye',
    RHYME,
    '“Ben” ve “sen” sonunda “en” sesleri ortaktır; iki ses benzerliği tam kafiyedir.',
  ],
  [
    '“Dil” ve “gül” sözcükleri arasındaki kafiye türü nedir?',
    'Yarım kafiye',
    RHYME,
    'İki sözcükte ortak olan yalnızca “l” sesidir; tek ses benzerliği yarım kafiyedir.',
  ],
  [
    '“Kitap” ve “hitap” sözcükleri arasındaki kafiye türü nedir?',
    'Zengin kafiye',
    RHYME,
    'Sonlarında “tap” sesleri ortaktır; üç ses benzerliği zengin kafiyedir.',
  ],
  [
    'Kafiye şeması “aa bb cc” olan şiirde hangi kafiye düzeni vardır?',
    'Düz kafiye',
    'Düz kafiye|Çapraz kafiye|Sarma kafiye|Mani tipi kafiye',
    'İkili dizelerin kendi içinde kafiyelenmesi düz kafiye düzenidir.',
  ],
  [
    '“abab” düzeni hangi kafiye şemasıdır?',
    'Çapraz kafiye',
    'Çapraz kafiye|Düz kafiye|Sarma kafiye|Mani tipi kafiye',
    'Birinci dize üçüncüyle, ikinci dize dördüncüyle kafiyelenir; bu çapraz kafiyedir.',
  ],
  [
    '“abba” düzeni hangi kafiye şemasıdır?',
    'Sarma kafiye',
    'Sarma kafiye|Düz kafiye|Çapraz kafiye|Mani tipi kafiye',
    'Dış dizeler ve iç dizeler kendi arasında kafiyelenerek sarma düzeni oluşturur.',
  ],
  [
    'Mani tipi kafiye düzeni hangisidir?',
    'aaba',
    'aaba|abab|abba|aabb',
    'Manide ilk üç dize kafiyeli, dördüncü dize serbesttir: aaba.',
  ],
  [
    'Bir dörtlükte dizelerin son sesleri a, b, a, b ise hangi kafiye düzeni vardır?',
    'Çapraz kafiye',
    'Çapraz kafiye|Düz kafiye|Sarma kafiye|Mani tipi kafiye',
    'a-b-a-b düzeni çapraz kafiye olarak adlandırılır.',
  ],
]);

facts(LIT, T_POEM, 'bulk-le-sanat', [
  [
    'Bir şeyi benzeriyle karşılaştırarak anlatma sanatı hangisidir?',
    'Teşbih',
    'Teşbih|İstiare|Teşhis|Kinaye',
    'Teşbihte benzeyen ve kendisine benzetilen, benzetme edatıyla birlikte verilir.',
  ],
  [
    'Benzetme ögelerinden birini kaldırıp benzetmeyi gizleme sanatı hangisidir?',
    'İstiare',
    'İstiare|Teşbih|Teşhis|Telmih',
    'İstiarede benzeyen ya da kendisine benzetilen verilmez; benzetme sezdirilir.',
  ],
  [
    'İnsan dışı varlıklara insan özelliği verme sanatı hangisidir?',
    'Teşhis',
    'Teşhis|İntak|Teşbih|Tenasüp',
    'Teşhiste insan dışı varlıklar insan gibi davranır ya da duyar.',
  ],
  [
    'İnsan dışı varlıkları konuşturma sanatı hangisidir?',
    'İntak',
    'İntak|Teşhis|İstiare|Kinaye',
    'İntakta insan dışı bir varlık konuşturulur; teşhisin ileri aşamasıdır.',
  ],
  [
    'Bir şeyi olduğundan çok gösterme sanatı hangisidir?',
    'Mübalağa',
    'Mübalağa|Kinaye|Telmih|Tenasüp',
    'Mübalağada abartma yapılarak etki güçlendirilir.',
  ],
  [
    'Bir sözü hem gerçek hem mecaz anlamıyla kullanma sanatı hangisidir?',
    'Kinaye',
    'Kinaye|Mübalağa|Teşbih|Hüsn-i talil',
    'Kinayede söz gerçek anlamıyla da düşünülebilir, asıl kastedilen mecaz anlamdır.',
  ],
  [
    'Bilerek bilmez görünüp gerçeği sezdirmeden anlatma sanatı hangisidir?',
    'Tecahül-i arif',
    'Tecahül-i arif|Hüsn-i talil|Kinaye|Telmih',
    'Tecahül-i arifte şair bir şeyi bilmediğini söyler ama aslında bilir; amaç etkiyi artırmaktır.',
  ],
  [
    'Güzel bir nedene bağlayarak akla aykırı sonuç üretme sanatı hangisidir?',
    'Hüsn-i talil',
    'Hüsn-i talil|Tecahül-i arif|Mübalağa|İntak',
    'Hüsn-i talilde olay, hayalî ve güzel bir nedene bağlanarak açıklanır.',
  ],
  [
    'Birbiriyle ilgili varlıkları birlikte anma sanatı hangisidir?',
    'Tenasüp',
    'Tenasüp|Telmih|Kinaye|Teşhis',
    'Tenasüpte aralarında anlam ilgisi bulunan sözcükler bir arada kullanılır.',
  ],
  [
    'Tarihî bir olaya ya da kişiye işaret etme sanatı hangisidir?',
    'Telmih',
    'Telmih|Tenasüp|Kinaye|İstiare',
    'Telmih, bilinen bir olaya ya da kişiye dolaylı gönderme yapar.',
  ],
  [
    'Bir sesin tekrarıyla ahenk sağlama sanatı hangisidir?',
    'Aliterasyon',
    'Aliterasyon|Asonans|Tenasüp|Teşhis',
    'Aliterasyonda ünsüz seslerin tekrarıyla ahenk oluşturulur.',
  ],
  [
    'Aynı ünlünün tekrarıyla ahenk sağlama sanatı hangisidir?',
    'Asonans',
    'Asonans|Aliterasyon|Tenasüp|İntak',
    'Asonansta ünlü seslerin tekrarı ahenk yaratır.',
  ],
  [
    '“Aslan gibi güçlü” ifadesinde hangi sanat vardır?',
    'Teşbih',
    'Teşbih|İstiare|Teşhis|Kinaye',
    '“Gibi” benzetme edatı kullanıldığı için bu ifade teşbihtir.',
  ],
  [
    '“Deniz bugün bize gülümsüyor” dizesinde hangi sanat vardır?',
    'Teşhis',
    'Teşhis|İntak|Teşbih|Telmih',
    'Denize insana özgü gülümseme özelliği verildiği için teşhis vardır.',
  ],
  [
    '“Bir of çeksem karşıki dağlar yıkılır” dizesinde hangi sanat vardır?',
    'Mübalağa',
    'Mübalağa|Kinaye|Teşhis|Tenasüp',
    'Dağların yıkılacağını söylemek abartma olduğu için mübalağa vardır.',
  ],
  [
    '“Ay, bulutların arasından utangaç bir çocuk gibi bakıyordu” dizesinde hangi iki sanat vardır?',
    'Teşbih ve teşhis',
    'Teşbih ve teşhis|İntak ve kinaye|Telmih ve tenasüp|Mübalağa ve cinas',
    '“Gibi” benzetme yaparken ayın bakması ve utanması kişileştirme oluşturur.',
  ],
  [
    'Teşbih ile istiare arasındaki fark nedir?',
    'İstiarede benzetme ögelerinden biri verilmez',
    'İstiarede benzetme ögelerinden biri verilmez|İstiarede benzetme yoktur|Teşbihte mecaz yoktur|İkisi aynı sanattır',
    'Teşbihte dört öge bulunur; istiarede benzeyen ya da kendisine benzetilen gizlenir.',
  ],
  [
    'Teşhis ile intak arasındaki fark nedir?',
    'İntakta konuşturma vardır',
    'İntakta konuşturma vardır|İntakta benzetme vardır|Teşhiste abartma vardır|İkisi aynı sanattır',
    'Teşhiste insan özelliği verilir; intakta bu varlık ayrıca konuşturulur.',
  ],
  [
    'Söz sanatlarının şiirdeki temel işlevi nedir?',
    'Anlatımı etkili ve çağrışımlı kılmak',
    'Anlatımı etkili ve çağrışımlı kılmak|Dize sayısını artırmak|Ölçüyü bozmak|Kafiyeyi kaldırmak',
    'Söz sanatları az sözle çok anlam oluşturur ve anlatımın etkisini artırır.',
  ],
  [
    '“Yüzün gül gibidir” ifadesinde hangi sanat vardır?',
    'Teşbih',
    'Teşbih|İstiare|Teşhis|Mübalağa',
    'Yüz güle benzetildiği ve “gibi” kullanıldığı için teşbih vardır.',
  ],
  [
    '“Gönlüm bir kuş gibi çırpınıyor” ifadesinde hangi sanat vardır?',
    'Teşbih',
    'Teşbih|İntak|Telmih|Tenasüp',
    'Gönül, kuşa benzetilerek ve “gibi” edatıyla verildiği için teşbih vardır.',
  ],
  [
    '“Şu karşıki dağda bir ateş yanar” dizesinde “ateş” hangi anlamda kullanılmış olabilir?',
    'Hem gerçek hem mecaz anlamda',
    'Hem gerçek hem mecaz anlamda|Yalnızca gerçek anlamda|Yalnızca terim anlamda|Yalnızca zıt anlamda',
    'Söz gerçek anlamıyla da düşünülebildiği için kinaye söz konusudur.',
  ],
]);

facts(LIT, T_POEM, 'bulk-le-bicim', [
  [
    'On birli hece ölçüsüyle söylenen aşk ve doğa konulu halk şiiri biçimi hangisidir?',
    'Koşma',
    'Koşma|Semai|Varsağı|Mani',
    'Koşma 11’li hece ölçüsüyle, dörtlüklerle ve genellikle aşk-doğa konularıyla söylenir.',
  ],
  [
    'Sekizli hece ölçüsüyle söylenen halk şiiri biçimi hangisidir?',
    'Semai',
    'Semai|Koşma|Destan|Rubai',
    'Semai 8’li hece ölçüsüyle söylenen, dörtlüklerden oluşan bir biçimdir.',
  ],
  [
    'Yiğitlik konusunu işleyen ve “bre” gibi ünlemler içeren halk şiiri biçimi hangisidir?',
    'Varsağı',
    'Varsağı|Semai|Koşma|Mani',
    'Varsağı yiğitçe bir söyleyişle ve “bre, behey” gibi ünlemlerle söylenir.',
  ],
  [
    'Toplumsal ve doğal olayları uzun biçimde anlatan halk şiiri biçimi hangisidir?',
    'Destan',
    'Destan|Koşma|Mani|Rubai',
    'Halk şiirindeki destan, uzun ve öyküleyici anlatımıyla olayları aktarır.',
  ],
  [
    'Divan şiirinde dört dizeden oluşan ve özel ölçüsü bulunan biçim hangisidir?',
    'Rubai',
    'Rubai|Tuyuğ|Gazel|Kaside',
    'Rubai dört dizeden oluşur ve kendine özgü aruz kalıplarıyla yazılır.',
  ],
  [
    'Divan şiirinde dörtlüklerle yazılan ve rubaiden farklı ölçüsü olan biçim hangisidir?',
    'Tuyuğ',
    'Tuyuğ|Rubai|Mesnevi|Gazel',
    'Tuyuğ dört dizeden oluşur; rubaiden ölçü ve kafiye düzeniyle ayrılır.',
  ],
  [
    'Divan şiirinde bir kişiyi övmek için yazılan biçim hangisidir?',
    'Kaside',
    'Kaside|Gazel|Mersiye|Mesnevi',
    'Kaside bir kişiyi, genellikle bir devlet büyüğünü övmek için yazılır.',
  ],
  [
    'Divan şiirinde aşk ve güzellik konularını işleyen biçim hangisidir?',
    'Gazel',
    'Gazel|Kaside|Mersiye|Tuyuğ',
    'Gazel aşk, güzellik ve şarap gibi konuları beyitlerle işler.',
  ],
  [
    'Divan şiirinde ölen birinin ardından yazılan biçim hangisidir?',
    'Mersiye',
    'Mersiye|Kaside|Gazel|Şehrengiz',
    'Mersiye ölen bir kişinin ardından duyulan acıyı anlatan nazım biçimidir.',
  ],
  [
    'Divan şiirinde bir şehri güzellikleriyle anlatan biçim hangisidir?',
    'Şehrengiz',
    'Şehrengiz|Mersiye|Kaside|Rubai',
    'Şehrengiz bir şehrin güzelliklerini ve güzellerini anlatan eserdir.',
  ],
  [
    'Manide işlenen konular hangileridir?',
    'Aşk, ayrılık ve özlem',
    'Aşk, ayrılık ve özlem|Savaş ve kahramanlık|Din ve tasavvuf|Bilim ve teknik',
    'Mani genellikle aşk, ayrılık ve özlem gibi duygusal konuları işler.',
  ],
  [
    'Koşmanın son dörtlüğünde şairin adının geçtiği bölüme ne denir?',
    'Tapşırma',
    'Tapşırma|Nakarat|Matla|Makta',
    'Tapşırma, koşmanın son dörtlüğünde şairin kendi adını söylediği bölümdür.',
  ],
  [
    'Türküde dörtlüklerden sonra tekrar eden bölüme ne denir?',
    'Nakarat',
    'Nakarat|Tapşırma|Matla|Makta',
    'Nakarat her dörtlükten sonra tekrarlanarak ezgiyi ve anlamı pekiştirir.',
  ],
  [
    'Ağıt hangi konuda söylenir?',
    'Ölüm ve acı',
    'Ölüm ve acı|Aşk ve sevinç|Savaş ve zafer|Doğa ve mevsim',
    'Ağıt ölüm, felaket gibi acı olayların ardından söylenen ezgili sözdür.',
  ],
  [
    'Ninni hangi amaçla söylenir?',
    'Çocuğu uyutmak',
    'Çocuğu uyutmak|Asker uğurlamak|Hasat kutlamak|Yağmur dilemek',
    'Ninni, çocuğu uyutmak için söylenen ve genellikle dörtlüklerden oluşan türdür.',
  ],
  [
    'Kasidenin övgü bölümüne ne denir?',
    'Methiye',
    'Methiye|Fahriye|Nesib|Makta',
    'Kasidede övgünün yapıldığı bölüm methiye olarak adlandırılır.',
  ],
  [
    'Kasidede şairin kendini övdüğü bölüme ne denir?',
    'Fahriye',
    'Fahriye|Methiye|Nesib|Matla',
    'Fahriyede şair kendi sanatını ve değerini öne çıkarır.',
  ],
  [
    'Gazelin ilk beytine ne denir?',
    'Matla',
    'Matla|Makta|Beytü’l-gazel|Nesib',
    'Gazelin ilk beytine matla denir; bu beyitte iki dize de kafiyelidir.',
  ],
  [
    'Gazelin son beytine ne denir?',
    'Makta',
    'Makta|Matla|Beytü’l-gazel|Fahriye',
    'Gazelin son beytine makta denir; şairin adı burada geçebilir.',
  ],
  [
    'Mesnevinin kafiye düzeni hangisidir?',
    'aa bb cc',
    'aa bb cc|abab|abba|aaba',
    'Mesnevi beyitleri kendi içinde kafiyelenir: aa bb cc dd biçiminde ilerler.',
  ],
  [
    'Gazelin en güzel beytine ne denir?',
    'Beytü’l-gazel',
    'Beytü’l-gazel|Matla|Makta|Fahriye',
    'Gazelin en güzel beyti beytü’l-gazel (şah beyit) olarak adlandırılır.',
  ],
]);

/* ---------------------------------------------------------------- */
/* Tarih: Kronoloji                                                  */
/* ---------------------------------------------------------------- */

const timeline: Array<[number, string]> = [
  [375, 'Kavimler Göçü'],
  [395, 'Roma İmparatorluğu’nun ikiye ayrılması'],
  [1071, 'Malazgirt Savaşı'],
  [1176, 'Miryokefalon Savaşı'],
  [1299, 'Osmanlı Devleti’nin kuruluşu'],
  [1326, 'Bursa’nın fethi'],
  [1402, 'Ankara Savaşı'],
  [1453, 'İstanbul’un fethi'],
  [1517, 'Mısır Seferi'],
  [1526, 'Mohaç Savaşı'],
  [1571, 'İnebahtı Savaşı'],
  [1699, 'Karlofça Antlaşması'],
  [1774, 'Küçük Kaynarca Antlaşması'],
  [1789, 'Fransız İhtilali'],
  [1808, 'Sened-i İttifak'],
  [1826, 'Yeniçeri Ocağı’nın kaldırılması'],
  [1839, 'Tanzimat Fermanı'],
  [1856, 'Islahat Fermanı'],
  [1876, 'I. Meşrutiyet’in ilanı'],
  [1908, 'II. Meşrutiyet’in ilanı'],
  [1912, 'Balkan Savaşları'],
  [1915, 'Çanakkale Savaşı'],
  [1919, 'Amasya Genelgesi'],
  [1920, 'TBMM’nin açılması'],
  [1922, 'Saltanatın kaldırılması'],
  [1923, 'Cumhuriyet’in ilanı'],
  [1926, 'Medeni Kanun’un kabulü'],
  [1928, 'Harf İnkılabı'],
  [1934, 'Soyadı Kanunu'],
  [1936, 'Montrö Boğazlar Sözleşmesi'],
  [1938, 'Atatürk’ün ölümü'],
  [1939, 'II. Dünya Savaşı’nın başlaması'],
  [1945, 'II. Dünya Savaşı’nın sona ermesi'],
  [1989, 'Berlin Duvarı’nın yıkılması'],
  [1991, 'Sovyetler Birliği’nin dağılması'],
  [2003, 'Türkiye’nin Avrupa Birliği’ne uyum yasalarını hızlandırması'],
];

const chronoFrames = [
  'Aşağıdaki olaylardan hangisi en önce gerçekleşmiştir?',
  'Aşağıdaki gelişmelerden hangisi zaman bakımından en eskidir?',
  'Kronolojik sıralamada aşağıdakilerden hangisi başta yer alır?',
  'Aşağıdaki olaylardan hangisi daha erken bir döneme aittir?',
];

for (let index = 0; index < 20; index += 1) {
  const [year, name] = timeline[index];
  const picks = [timeline[index + 4], timeline[index + 8], timeline[index + 12]];
  const prompt = chronoFrames[index % chronoFrames.length];
  push(HIST, T_CHRON, `bulk-lt-sira-${index + 1}`, {
    prompt,
    answer: name,
    distractors: picks.map(([, label]) => label),
    explanation: `${name} ${year} yılına aittir; diğer seçenekler ${picks
      .map(([y]) => y)
      .join(', ')} yıllarına ait olduğu için daha yenidir.`,
    difficulty: difficultyAt(index),
  });
}

const centuryYears = [375, 1071, 1176, 1299, 1402, 1453, 1517, 1571, 1699, 1774, 1789, 1839, 1876, 1908, 1914, 1923, 1938, 1945, 1989, 1991];

centuryYears.forEach((year, index) => {
  const century = Math.ceil(year / 100);
  const answer = `${century}. yüzyıl`;
  const prompt =
    index % 2 === 0
      ? `${year} yılı hangi yüzyıldadır?`
      : `Miladi ${year} yılı hangi yüzyıla denk gelir?`;
  push(HIST, T_CHRON, `bulk-lt-yuzyil-${index + 1}`, {
    prompt,
    answer,
    distractors: nums(answer, [`${century - 1}. yüzyıl`, `${century + 1}. yüzyıl`, `${century + 2}. yüzyıl`, `${century - 2}. yüzyıl`]),
    explanation: `${year} ÷ 100 işleminde bölüm ${Math.floor(year / 100)}, kalan sıfırdan büyük olduğu için yüzyıl ${Math.floor(year / 100)} + 1 = ${century} olur.`,
    difficulty: difficultyAt(index),
  });
});

facts(HIST, T_CHRON, 'bulk-lt-donem', [
  [
    'Yazının bulunmasından önceki döneme ne ad verilir?',
    'Tarih öncesi dönem',
    'Tarih öncesi dönem|Orta Çağ|Yeni Çağ|Yakın Çağ',
    'Yazı öncesi dönem tarih öncesi (prehistorik) olarak adlandırılır; bu dönem kalıntılarla incelenir.',
  ],
  [
    'Tarih çağlarının başlangıcı hangi olayla kabul edilir?',
    'Yazının bulunması',
    'Yazının bulunması|Ateşin bulunması|Tarımın başlaması|Tekerleğin bulunması',
    'Yazının bulunması tarih çağlarının başlangıcı sayılır; çünkü yazılı kayıt dönemi başlar.',
  ],
  [
    'Orta Çağ’ın sona ermesinde etkili olan olay hangisidir?',
    'İstanbul’un fethi',
    'İstanbul’un fethi|Kavimler Göçü|Fransız İhtilali|Coğrafi Keşifler',
    '1453’te İstanbul’un fethi Orta Çağ’ın kapanışı kabul edilir.',
  ],
  [
    'Yeni Çağ hangi olayla başlar?',
    'İstanbul’un fethi',
    'İstanbul’un fethi|Fransız İhtilali|Kavimler Göçü|Sanayi Devrimi',
    'Yeni Çağ 1453’te İstanbul’un fethiyle başlar.',
  ],
  [
    'Yakın Çağ hangi olayla başlar?',
    'Fransız İhtilali',
    'Fransız İhtilali|İstanbul’un fethi|Kavimler Göçü|Reform',
    '1789 Fransız İhtilali Yakın Çağ’ın başlangıcı kabul edilir.',
  ],
  [
    'İlk Çağ’ın sona ermesinde etkili olan gelişme hangisidir?',
    'Kavimler Göçü',
    'Kavimler Göçü|İstanbul’un fethi|Fransız İhtilali|Sanayi Devrimi',
    '375’teki Kavimler Göçü İlk Çağ’ın sona ermesinde belirleyici olmuştur.',
  ],
  [
    'Tarih öncesi dönemlerin sıralaması hangisidir?',
    'Taş, bakır, tunç, demir',
    'Taş, bakır, tunç, demir|Demir, tunç, taş, bakır|Tunç, taş, demir, bakır|Bakır, demir, taş, tunç',
    'Tarih öncesi dönemler kullanılan madenlere göre taş, bakır, tunç ve demir çağları biçiminde sıralanır.',
  ],
  [
    'Neolitik dönemin en önemli gelişmesi hangisidir?',
    'Tarımın başlaması',
    'Tarımın başlaması|Yazının bulunması|Matbaanın icadı|Ateşin söndürülmesi',
    'Neolitik dönemde tarım başlamış, yerleşik yaşam ve üretim ortaya çıkmıştır.',
  ],
  [
    'Orta Çağ’da Avrupa’da egemen olan düşünce sistemi hangisidir?',
    'Skolastik düşünce',
    'Skolastik düşünce|Pozitivizm|Rasyonalizm|Varoluşçuluk',
    'Orta Çağ Avrupa’sında dinî dogmalara dayanan skolastik düşünce egemendir.',
  ],
  [
    'Rönesans hangi ülkede başlamıştır?',
    'İtalya',
    'İtalya|Almanya|İngiltere|Fransa',
    'Rönesans 15. yüzyılda İtalya’da, özellikle Floransa çevresinde başlamıştır.',
  ],
  [
    'Reform hareketi hangi ülkede başlamıştır?',
    'Almanya',
    'Almanya|İtalya|İspanya|İngiltere',
    'Reform 16. yüzyılda Almanya’da Luther’in hareketiyle başlamıştır.',
  ],
  [
    'Aydınlanma Çağı’nın temel ilkesi hangisidir?',
    'Akıl ve bilim',
    'Akıl ve bilim|Kader ve teslimiyet|Gelenek ve görenek|Savaş ve fetih',
    'Aydınlanma düşüncesi aklı ve bilimsel yöntemi toplumsal yaşamın temeli sayar.',
  ],
  [
    'Sanayi Devrimi hangi ülkede başlamıştır?',
    'İngiltere',
    'İngiltere|Fransa|Almanya|İtalya',
    'Sanayi Devrimi 18. yüzyılın sonlarında İngiltere’de dokuma sanayisiyle başlamıştır.',
  ],
  [
    'Tanzimat Dönemi’nin temel özelliği nedir?',
    'Batılılaşma yönünde hukuki düzenlemeler yapılması',
    'Batılılaşma yönünde hukuki düzenlemeler yapılması|Saltanatın kaldırılması|Cumhuriyetin ilanı|Harf İnkılabı',
    'Tanzimat’ta hukuk, yönetim ve eğitim alanlarında Batılılaşma yönünde düzenlemeler yapılmıştır.',
  ],
  [
    'Meşrutiyet dönemlerinin ortak özelliği nedir?',
    'Anayasalı ve parlamentolu yönetimin benimsenmesi',
    'Anayasalı ve parlamentolu yönetimin benimsenmesi|Saltanatın kaldırılması|Tek partili yönetim|Toprak reformu',
    'I. ve II. Meşrutiyet’te anayasa ilan edilmiş ve meclis açılmıştır.',
  ],
]);

facts(HIST, T_CHRON, 'bulk-lt-zaman', [
  [
    'Bir yüzyıl kaç yıldan oluşur?',
    '100',
    '100|10|1000|50',
    'Yüzyıl yüz yıllık zaman dilimidir; bu nedenle 100 yıl sürer.',
  ],
  [
    'MÖ 300 ile MS 300 arasındaki süre kaç yıldır?',
    '600',
    '600|300|0|900',
    'MÖ 300’den MS 300’e geçerken sıfır noktası aşılır: 300 + 300 = 600 yıl.',
  ],
  [
    'MÖ 500 yılında yaşanan bir olay MS 100 yılındaki olaydan kaç yıl öncedir?',
    '600',
    '600|400|500|100',
    'MÖ 500 ile MS 100 arasında 500 + 100 = 600 yıl vardır.',
  ],
  [
    'On yıllık zaman dilimine ne ad verilir?',
    'Dekad',
    'Dekad|Yüzyıl|Çağ|Milenya',
    'On yıllık dilim dekad olarak adlandırılır.',
  ],
  [
    'MÖ tarihlerde sayı büyüdükçe olay ne olur?',
    'Daha eskiye gider',
    'Daha eskiye gider|Daha yeniye gider|Değişmez|Belirsizleşir',
    'MÖ tarihler sıfırdan geriye sayıldığı için büyük sayı daha eski olayı gösterir.',
  ],
  [
    '20. yüzyıl hangi yılları kapsar?',
    '1901-2000',
    '1901-2000|1900-1999|2000-2099|1910-2010',
    'Yüzyıllar 1’den başladığı için 20. yüzyıl 1901 ile 2000 arasındaki yılları kapsar.',
  ],
  [
    '15. yüzyıl hangi yılları kapsar?',
    '1401-1500',
    '1401-1500|1400-1499|1500-1599|1300-1399',
    '15. yüzyıl 1401’de başlar ve 1500’de sona erer.',
  ],
  [
    'Tarih şeridinde soldan sağa gidildikçe ne olur?',
    'Zamanda ilerlenir',
    'Zamanda ilerlenir|Zamanda geriye gidilir|Zaman durur|Sıralama bozulur',
    'Tarih şeritleri soldan sağa doğru eskiyen tarihten yeniye doğru düzenlenir.',
  ],
  [
    'Bir olayın yüzyılını bulmak için yıl 100’e bölünürken kalan varsa ne yapılır?',
    'Bölüm bir artırılır',
    'Bölüm bir artırılır|Bölüm bir azaltılır|Bölüm ikiye katlanır|Bölüm yok sayılır',
    'Kalan varsa olay yeni yüzyıla taşmıştır; bu nedenle bölüm bir artırılır.',
  ],
  [
    '1453 yılı için 1453 ÷ 100 işleminde bölüm 14’tür; olay hangi yüzyıldadır?',
    '15. yüzyıl',
    '15. yüzyıl|14. yüzyıl|16. yüzyıl|13. yüzyıl',
    'Kalan 53 olduğu için bölüm bir artırılır: 14 + 1 = 15. yüzyıl.',
  ],
  [
    'MÖ 2000 hangi yüzyıla denk gelir?',
    'MÖ 20. yüzyıl',
    'MÖ 20. yüzyıl|MÖ 2. yüzyıl|MÖ 21. yüzyıl|MÖ 200. yüzyıl',
    'MÖ 2000 yılı 2000 ÷ 100 = 20 olduğu için MÖ 20. yüzyıla denk gelir.',
  ],
  [
    'Çağ kavramı neyi ifade eder?',
    'Tarihin büyük dönemlere ayrılmasını',
    'Tarihin büyük dönemlere ayrılmasını|Tek bir olayın tarihini|Bir kişinin yaşamını|Bir ülkenin sınırlarını',
    'Çağ, tarihin belirleyici olaylarla ayrılan büyük dönemlerini ifade eder.',
  ],
  [
    'Kronoloji bilimi neyi inceler?',
    'Olayların zaman sırasını',
    'Olayların zaman sırasını|Olayların nedenlerini|Toplumların kültürünü|Yazıtların dilini',
    'Kronoloji olayları oluş sırasına göre düzenler ve tarihlendirme yapar.',
  ],
  [
    'Tarihî olayların sıralanmasında hangi ölçüt kullanılır?',
    'Gerçekleşme zamanı',
    'Gerçekleşme zamanı|Olayın önemi|Olayın yeri|Olayın katılımcı sayısı',
    'Kronolojik sıralama olayların gerçekleşme zamanına göre yapılır.',
  ],
  [
    'Takvimlerde başlangıç yılının farklı olmasının nedeni nedir?',
    'Toplumların kendi önemli olaylarını başlangıç alması',
    'Toplumların kendi önemli olaylarını başlangıç alması|Takvimlerin hepsinin aynı olması|Yılların eşit uzunlukta olmaması|Ayların sayılmaması',
    'Her toplum kendisi için önemli bir olayı takvim başlangıcı kabul etmiştir.',
  ],
]);

const eventCenturies: Array<[string, number]> = [
  ['Malazgirt Savaşı', 11],
  ['İstanbul’un fethi', 15],
  ['Tanzimat Fermanı', 19],
  ['Fransız İhtilali', 18],
  ['Cumhuriyet’in ilanı', 20],
  ['Kavimler Göçü', 4],
  ['Ankara Savaşı', 15],
  ['Karlofça Antlaşması', 17],
  ['II. Meşrutiyet’in ilanı', 20],
  ['Berlin Duvarı’nın yıkılması', 20],
  ['Coğrafi Keşifler’in başlangıcı', 15],
  ['Sanayi Devrimi', 18],
  ['Lozan Barış Antlaşması', 20],
];

eventCenturies.forEach(([event, century], index) => {
  const answer = `${century}. yüzyıl`;
  push(HIST, T_CHRON, `bulk-lt-olayyuzyil-${index + 1}`, {
    prompt: `${event} hangi yüzyılda gerçekleşmiştir?`,
    answer,
    distractors: nums(answer, [`${century - 1}. yüzyıl`, `${century + 1}. yüzyıl`, `${century + 2}. yüzyıl`, `${century - 2}. yüzyıl`]),
    explanation: `${event} ${century}. yüzyıla aittir; bu dönem ${(century - 1) * 100 + 1} ile ${century * 100} yılları arasını kapsar.`,
    difficulty: difficultyAt(index),
  });
});

/* ---------------------------------------------------------------- */
/* Tarih: Tarihî Kaynaklar                                           */
/* ---------------------------------------------------------------- */

const SOURCE_TYPE = 'Birincil kaynak|İkincil kaynak|Sözlü kaynak|Görsel kaynak';

facts(HIST, T_SOURCE, 'bulk-lt-kaynak', [
  [
    'Olayın yaşandığı dönemde üretilen kaynaklara ne denir?',
    'Birincil kaynak',
    SOURCE_TYPE,
    'Birincil kaynak olayla çağdaştır ve olaya tanıklık eden dönemde üretilmiştir.',
  ],
  [
    'Olaydan sonra yazılan ve olayı yorumlayan kaynaklara ne denir?',
    'İkincil kaynak',
    SOURCE_TYPE,
    'İkincil kaynak olaydan sonra, var olan kaynaklara dayanılarak üretilir.',
  ],
  [
    'Bir savaş döneminde yazılmış mektup hangi kaynak türüdür?',
    'Birincil kaynak',
    SOURCE_TYPE,
    'Mektup olayın yaşandığı dönemde yazıldığı için birincil kaynaktır.',
  ],
  [
    'Günümüzde yazılmış bir tarih ders kitabı hangi kaynak türüdür?',
    'İkincil kaynak',
    SOURCE_TYPE,
    'Ders kitabı olaydan çok sonra, başka kaynaklara dayanılarak yazıldığı için ikincil kaynaktır.',
  ],
  [
    'Ferman hangi kaynak türüne girer?',
    'Birincil kaynak',
    SOURCE_TYPE,
    'Ferman dönemin yönetimi tarafından üretilen resmî bir belge olduğu için birincildir.',
  ],
  [
    'Sikke hangi kaynak türüne girer?',
    'Birincil kaynak',
    SOURCE_TYPE,
    'Sikke dönemin kendi elinden çıkan bir buluntu olduğu için birincil kaynaktır.',
  ],
  [
    'Kitabe hangi kaynak türüne girer?',
    'Birincil kaynak',
    SOURCE_TYPE,
    'Kitabe olayın döneminde taşa kazındığı için birincil kaynaktır.',
  ],
  [
    'Anı (hatırat) hangi kaynak türüdür?',
    'Birincil kaynak',
    SOURCE_TYPE,
    'Anı, olayı yaşayan kişinin kendi anlatımı olduğu için birincil kaynak sayılır.',
  ],
  [
    'Bir tarihçinin yazdığı makale hangi kaynak türüdür?',
    'İkincil kaynak',
    SOURCE_TYPE,
    'Makale, geçmiş olayı kaynaklara dayanarak yorumladığı için ikincil kaynaktır.',
  ],
  [
    'Ansiklopedi maddesi hangi kaynak türüdür?',
    'İkincil kaynak',
    SOURCE_TYPE,
    'Ansiklopedi maddesi derleme ve yorum içerdiği için ikincil kaynaktır.',
  ],
  [
    'Seyahatname hangi kaynak türüdür?',
    'Birincil kaynak',
    SOURCE_TYPE,
    'Seyahatname gezginin kendi gözlemlerine dayandığı için birincil kaynaktır.',
  ],
  [
    'Olay günü yayımlanan gazete haberi hangi kaynak türüdür?',
    'Birincil kaynak',
    SOURCE_TYPE,
    'Olay günü çıkan haber olayla çağdaş olduğu için birincil kaynaktır.',
  ],
  [
    'Birincil kaynağın temel özelliği nedir?',
    'Olayla çağdaş olması',
    'Olayla çağdaş olması|Sonradan yazılması|Yorum içermesi|Derleme olması',
    'Birincil kaynak olayın yaşandığı dönemde üretildiği için çağdaştır.',
  ],
  [
    'İkincil kaynağın temel özelliği nedir?',
    'Olaydan sonra üretilmiş olması',
    'Olaydan sonra üretilmiş olması|Olayla çağdaş olması|Devlet tarafından yazılması|Taşa kazınması',
    'İkincil kaynak olaydan sonra, önceki kaynaklardan yararlanılarak oluşturulur.',
  ],
  [
    'Birincil kaynaklar neden daha güvenilir sayılır?',
    'Olaya tanıklık etmesi',
    'Olaya tanıklık etmesi|Daha uzun olması|Daha yeni yazılması|Daha çok satılması',
    'Olayı doğrudan yaşayan ya da kaydeden kaynak tanıklığa dayandığı için güvenilirliği yüksektir.',
  ],
  [
    'Birincil kaynak da yanlı olabilir mi?',
    'Evet, olabilir',
    'Evet, olabilir|Hayır, olamaz|Yalnızca sözlü kaynak yanlıdır|Yalnızca ikincil kaynak yanlıdır',
    'Birincil kaynağı üreten kişi de çıkarı doğrultusunda aktarım yapabilir; bu yüzden eleştiri gerekir.',
  ],
  [
    'Sözlü kaynaklara hangisi örnektir?',
    'Efsane',
    'Efsane|Ferman|Sikke|Kitabe',
    'Efsane ve menkıbe kuşaktan kuşağa sözlü olarak aktarılan kaynaklardır.',
  ],
  [
    'Arkeolojik kazılarda bulunan eşyalar hangi kaynak türüdür?',
    'Birincil kaynak',
    SOURCE_TYPE,
    'Kazı buluntuları dönemin kendi maddi kalıntıları olduğu için birincil kaynaktır.',
  ],
  [
    'Nümizmatik hangi kaynakla ilgilenir?',
    'Sikkeler',
    'Sikkeler|Kitabeler|Armalar|Mühürler',
    'Nümizmatik bilimi sikkeleri inceleyerek dönem, hükümdar ve ekonomi hakkında bilgi üretir.',
  ],
  [
    'Epigrafi hangi kaynakla ilgilenir?',
    'Kitabeler',
    'Kitabeler|Sikkeler|Armalar|Eski yazılar',
    'Epigrafi taş, mermer gibi yüzeylere kazınmış yazıtları inceler.',
  ],
  [
    'Paleografya hangi alanı inceler?',
    'Eski yazılar',
    'Eski yazılar|Sikkeler|Armalar|Toprak adları',
    'Paleografya eski yazı biçimlerini okuyup tarihlendirmeyi amaçlar.',
  ],
  [
    'Diplomatik bilimi neyi inceler?',
    'Resmî belgeleri',
    'Resmî belgeleri|Sikkeleri|Kitabeleri|Sözlü gelenekleri',
    'Diplomatik ferman, antlaşma gibi resmî belgelerin biçim ve içerik özelliklerini inceler.',
  ],
  [
    'Kaynak eleştirisi neden yapılır?',
    'Kaynağın güvenilirliğini belirlemek',
    'Kaynağın güvenilirliğini belirlemek|Kaynağı çoğaltmak|Kaynağı saklamak|Kaynağı satmak',
    'Kaynak eleştirisi belgenin gerçekliğini, tarihini ve taraflılığını değerlendirir.',
  ],
]);

facts(HIST, T_SOURCE, 'bulk-lt-guven', [
  [
    'Bir kaynağın güvenilirliği değerlendirilirken ilk bakılacak özellik nedir?',
    'Olayla çağdaş olup olmadığı',
    'Olayla çağdaş olup olmadığı|Sayfa sayısı|Yazı tipi|Kapak tasarımı',
    'Kaynağın olayla çağdaş olması, tanıklığa dayanma olasılığını artırır.',
  ],
  [
    'Aynı olayı anlatan iki kaynak çelişiyorsa ne yapılır?',
    'Başka kaynaklarla karşılaştırılır',
    'Başka kaynaklarla karşılaştırılır|Biri rastgele seçilir|İkisi de yok sayılır|Yalnızca uzun olanı kullanılır',
    'Çelişki durumunda üçüncü kaynaklara başvurulur ve bilgiler karşılaştırılır.',
  ],
  [
    'Kaynağın yazarının olaya tanıklığı neden önemlidir?',
    'Bilginin doğrudan gözleme dayanması',
    'Bilginin doğrudan gözleme dayanması|Yazarın ünlü olması|Kitabın kalın olması|Dilin sade olması',
    'Tanık yazar bilgiyi doğrudan gözleminden aktardığı için hata payı azalır.',
  ],
  [
    'Resmî belgelerin güvenilirliği neden yüksektir?',
    'Devlet kaydı olması ve denetlenebilirliği',
    'Devlet kaydı olması ve denetlenebilirliği|Herkesin yazabilmesi|Sonradan düzenlenmesi|Yorum içermesi',
    'Resmî belgeler kayıt düzenine bağlı olduğu için denetlenebilir ve izlenebilir.',
  ],
  [
    'Bir kaynağın taraflı olması ne demektir?',
    'Olayı kendi çıkarı doğrultusunda aktarması',
    'Olayı kendi çıkarı doğrultusunda aktarması|Olayı eksiksiz aktarması|Belgeye dayanması|Tarafsız olması',
    'Taraflı kaynak, olayı kendi çıkarına uygun biçimde seçer ya da çarpıtır.',
  ],
  [
    'Sözlü kaynakların sınırlılığı nedir?',
    'Zamanla değişebilmesi',
    'Zamanla değişebilmesi|Yazılı olması|Devlet kaydı olması|Taşa kazınması',
    'Sözlü aktarımda ayrıntılar unutulur ya da değişir; bu nedenle dikkatli kullanılır.',
  ],
  [
    'Görsel kaynaklar hangi bilgiyi verir?',
    'Dönemin görünümü hakkında ipucu',
    'Dönemin görünümü hakkında ipucu|Kesin tarih listesi|Yasa metinleri|Nüfus sayıları',
    'Minyatür ve gravür gibi görseller dönemin giyim, mimari ve gündelik yaşamını yansıtır.',
  ],
  [
    'Arkeolojik buluntular hangi bilgiyi kesinleştirir?',
    'Maddi kültür ve yaşam biçimi',
    'Maddi kültür ve yaşam biçimi|Yöneticilerin adları|Antlaşma maddeleri|Vergi oranları',
    'Buluntular kullanılan araç gereçleri ve gündelik yaşamı somut biçimde gösterir.',
  ],
  [
    'Bir kaynağın tarihlendirilmesi neden gereklidir?',
    'Hangi döneme ait olduğunu belirlemek',
    'Hangi döneme ait olduğunu belirlemek|Kaynağı çoğaltmak|Kaynağı süslemek|Kaynağı çevirmek',
    'Tarih belirlenmeden kaynak olayla ilişkilendirilemez; bu nedenle tarihlendirme zorunludur.',
  ],
  [
    'Kaynak çeşitliliği tarihçiye ne kazandırır?',
    'Olayı çok yönlü değerlendirme',
    'Olayı çok yönlü değerlendirme|Tek bir görüşü kanıtlama|Daha kısa metin yazma|Kaynak toplamama',
    'Farklı türde kaynaklar olayın farklı yönlerini görme olanağı verir.',
  ],
  [
    'Bir kaynağın dili neden önemlidir?',
    'Yazıldığı dönemin anlayışını yansıtması',
    'Yazıldığı dönemin anlayışını yansıtması|Daha kolay okunması|Daha uzun olması|Daha yeni olması',
    'Kaynağın sözcük dağarcığı ve üslubu dönemin düşünce biçimini yansıtır.',
  ],
  [
    'Sahte belge nasıl anlaşılır?',
    'Yazı, mühür ve kâğıt özelliklerinin incelenmesiyle',
    'Yazı, mühür ve kâğıt özelliklerinin incelenmesiyle|Belgenin uzunluğuna bakılarak|Yazarın adına bakılarak|Başlığına bakılarak',
    'Belgenin malzemesi, yazısı ve mührü dönemiyle uyumlu değilse sahtelik düşünülür.',
  ],
  [
    'Kaynak olmadan tarih yazılabilir mi?',
    'Hayır, tarih kaynağa dayanır',
    'Hayır, tarih kaynağa dayanır|Evet, tahminle yazılır|Evet, şiirle yazılır|Evet, söylentiyle yazılır',
    'Tarih bilimi kaynağa dayanır; kaynaksız iddia tarih yazımı sayılmaz.',
  ],
  [
    'Birinci elden tanıklık hangi kaynakta bulunur?',
    'Günlük ve mektup',
    'Günlük ve mektup|Ders kitabı ve ansiklopedi|Makale ve tez|Belgesel film',
    'Günlük ve mektup olayı yaşayan kişinin doğrudan anlatımını içerir.',
  ],
  [
    'Tarihçinin kaynağı seçerken dikkat ettiği unsur nedir?',
    'Konuya uygunluğu ve güvenilirliği',
    'Konuya uygunluğu ve güvenilirliği|Sayfa sayısı|Kitabın rengi|Yazarın yaşı',
    'Kaynak, araştırılan konuya uygun ve güvenilir olmalıdır.',
  ],
  [
    'Fotoğraf hangi kaynak grubuna girer?',
    'Görsel kaynak',
    'Görsel kaynak|Sözlü kaynak|Yazılı kaynak|İşitsel kaynak',
    'Fotoğraf dönemin görünümünü kaydettiği için görsel kaynak sayılır.',
  ],
  [
    'Sonradan hazırlanan belgesel film hangi kaynak türüdür?',
    'İkincil kaynak',
    SOURCE_TYPE,
    'Belgesel olaydan sonra hazırlandığı ve yorum içerdiği için ikincil kaynaktır.',
  ],
  [
    'Kaynakların sınıflandırılmasında hangi ölçüt kullanılır?',
    'Üretildiği dönem ve biçim',
    'Üretildiği dönem ve biçim|Sayfa sayısı|Yazarın cinsiyeti|Kitabın fiyatı',
    'Kaynaklar üretildikleri döneme ve biçimlerine (yazılı, sözlü, görsel) göre sınıflandırılır.',
  ],
]);

facts(HIST, T_SOURCE, 'bulk-lt-bilim', [
  [
    'Sikkeleri inceleyen bilim dalı hangisidir?',
    'Nümizmatik',
    'Nümizmatik|Epigrafi|Paleografya|Heraldik',
    'Nümizmatik sikkeleri inceleyerek dönem ve ekonomi hakkında bilgi üretir.',
  ],
  [
    'Kitabeleri inceleyen bilim dalı hangisidir?',
    'Epigrafi',
    'Epigrafi|Nümizmatik|Paleografya|Diplomatik',
    'Epigrafi taş ve mermer yüzeylerdeki yazıtları okur ve değerlendirir.',
  ],
  [
    'Eski yazıları inceleyen bilim dalı hangisidir?',
    'Paleografya',
    'Paleografya|Epigrafi|Nümizmatik|Etnografya',
    'Paleografya eski yazı biçimlerini çözümler ve belgeleri tarihlendirir.',
  ],
  [
    'Armaları inceleyen bilim dalı hangisidir?',
    'Heraldik',
    'Heraldik|Sfragistika|Toponimi|Genealoji',
    'Heraldik armaları ve simgeleri inceleyerek aile ve devlet bağlarını çözümler.',
  ],
  [
    'Mühürleri inceleyen bilim dalı hangisidir?',
    'Sfragistika',
    'Sfragistika|Heraldik|Nümizmatik|Diplomatik',
    'Sfragistika mühürleri inceleyerek belgelerin gerçekliğini denetler.',
  ],
  [
    'Yer adlarını inceleyen bilim dalı hangisidir?',
    'Toponimi',
    'Toponimi|Etnografya|Filoloji|Genealoji',
    'Toponimi yer adlarının kökenini ve değişimini inceler.',
  ],
  [
    'Toplumların kültürünü inceleyen bilim dalı hangisidir?',
    'Etnografya',
    'Etnografya|Toponimi|Heraldik|Paleografya',
    'Etnografya toplumların gündelik yaşamını, geleneklerini ve maddi kültürünü inceler.',
  ],
  [
    'Dillerin tarihini inceleyen bilim dalı hangisidir?',
    'Filoloji',
    'Filoloji|Etnografya|Diplomatik|Nümizmatik',
    'Filoloji dillerin tarihsel gelişimini ve metinleri dil açısından inceler.',
  ],
  [
    'İnsanlığın maddi kalıntılarını inceleyen bilim dalı hangisidir?',
    'Arkeoloji',
    'Arkeoloji|Filoloji|Heraldik|Toponimi',
    'Arkeoloji kazılarla çıkarılan maddi kalıntıları inceleyerek geçmişi aydınlatır.',
  ],
  [
    'Zamanı ve takvimleri inceleyen bilim dalı hangisidir?',
    'Kronoloji',
    'Kronoloji|Diplomatik|Etnografya|Sfragistika',
    'Kronoloji olayları zaman sırasına yerleştirir ve tarihlendirme yapar.',
  ],
  [
    'Resmî belgeleri inceleyen bilim dalı hangisidir?',
    'Diplomatik',
    'Diplomatik|Paleografya|Heraldik|Toponimi',
    'Diplomatik ferman ve antlaşma gibi resmî belgelerin biçimini ve gerçekliğini inceler.',
  ],
  [
    'Aile kökenlerini inceleyen alan hangisidir?',
    'Genealoji',
    'Genealoji|Toponimi|Sfragistika|Etnografya',
    'Genealoji (şecere) ailelerin kökenini ve akrabalık bağlarını araştırır.',
  ],
  [
    'Nüfus yapısını sayılarla inceleyen alan hangisidir?',
    'Demografi',
    'Demografi|Genealoji|Heraldik|Filoloji',
    'Demografi nüfusun yapısını, artışını ve dağılımını sayısal olarak inceler.',
  ],
  [
    'Bir savaşın yerini belirlemede hangi alanlardan yararlanılır?',
    'Arkeoloji ve tarihî coğrafya',
    'Arkeoloji ve tarihî coğrafya|Nümizmatik ve heraldik|Filoloji ve etnografya|Paleografya ve diplomatik',
    'Savaş alanındaki buluntular ve coğrafi özellikler birlikte değerlendirilerek yer belirlenir.',
  ],
  [
    'Bir yapının hangi döneme ait olduğunu belirlemede hangi yöntem kullanılır?',
    'Radyokarbon tarihlendirme',
    'Radyokarbon tarihlendirme|Nümizmatik analiz|Heraldik çözümleme|Toponimi incelemesi',
    'Organik kalıntılarda radyokarbon yöntemiyle yaklaşık yaş belirlenebilir.',
  ],
  [
    'Yazıtların okunmasında hangi bilim dalı önceliklidir?',
    'Epigrafi',
    'Epigrafi|Demografi|Genealoji|Etnografya',
    'Yazıtların çözümlenmesi epigrafinin temel çalışma alanıdır.',
  ],
  [
    'Sikkelerden hangi bilgi elde edilir?',
    'Hükümdar, dönem ve ekonomi',
    'Hükümdar, dönem ve ekonomi|İklim koşulları|Yazılı yasalar|Nüfus sayıları',
    'Sikkelerin üzerindeki ad ve simgeler hükümdarı, basım tarihi ise dönemi ve ekonomiyi gösterir.',
  ],
  [
    'Eski haritaları inceleyen alan hangisidir?',
    'Tarihî coğrafya',
    'Tarihî coğrafya|Sfragistika|Heraldik|Filoloji',
    'Tarihî coğrafya eski haritalar ve yer adları üzerinden mekânın geçmişini inceler.',
  ],
  [
    'Bir belgenin hangi kurumdan çıktığını anlamak için hangi bilim dalına başvurulur?',
    'Diplomatik',
    'Diplomatik|Etnografya|Toponimi|Demografi',
    'Diplomatik belgenin biçim, mühür ve kalıp özelliklerinden kaynağını belirler.',
  ],
  [
    'Kadın ve erkek giyim farklarını geçmişte incelemek için hangi kaynak grubu en uygundur?',
    'Görsel kaynaklar',
    'Görsel kaynaklar|Sikkeler|Kitabeler|Fermanlar',
    'Minyatür ve gravür gibi görsel kaynaklar giyim ve gündelik yaşamı doğrudan gösterir.',
  ],
]);

const SOURCE_GROUP = 'Sözlü kaynak|Yazılı kaynak|Görsel kaynak|Görsel-işitsel kaynak';

facts(HIST, T_SOURCE, 'bulk-lt-grup', [
  [
    'Menkıbe hangi kaynak grubundadır?',
    'Sözlü kaynak',
    SOURCE_GROUP,
    'Menkıbe sözlü olarak aktarılan dinî nitelikli anlatı olduğu için sözlü kaynaktır.',
  ],
  [
    'Efsane hangi kaynak grubundadır?',
    'Sözlü kaynak',
    SOURCE_GROUP,
    'Efsane kuşaktan kuşağa sözlü aktarıldığı için sözlü kaynak sayılır.',
  ],
  [
    'Destan hangi kaynak grubundadır?',
    'Sözlü kaynak',
    SOURCE_GROUP,
    'Destan yazı öncesi sözlü gelenekte oluştuğu için sözlü kaynaktır.',
  ],
  [
    'Ferman hangi kaynak grubundadır?',
    'Yazılı kaynak',
    SOURCE_GROUP,
    'Ferman yazılı bir resmî belge olduğu için yazılı kaynak grubundadır.',
  ],
  [
    'Antlaşma metni hangi kaynak grubundadır?',
    'Yazılı kaynak',
    SOURCE_GROUP,
    'Antlaşma metni yazılı olarak kayda geçirildiği için yazılı kaynaktır.',
  ],
  [
    'Vakfiye hangi kaynak grubundadır?',
    'Yazılı kaynak',
    SOURCE_GROUP,
    'Vakfiye bir vakfın kuruluşunu kaydeden yazılı belgedir.',
  ],
  [
    'Şehname hangi kaynak grubundadır?',
    'Yazılı kaynak',
    SOURCE_GROUP,
    'Şehname yazılı bir edebî ve tarihî metin olduğu için yazılı kaynaktır.',
  ],
  [
    'Minyatür hangi kaynak grubundadır?',
    'Görsel kaynak',
    SOURCE_GROUP,
    'Minyatür dönemin görünümünü resmeden görsel bir kaynaktır.',
  ],
  [
    'Eski harita hangi kaynak grubundadır?',
    'Görsel kaynak',
    SOURCE_GROUP,
    'Harita mekânın görsel temsili olduğu için görsel kaynak sayılır.',
  ],
  [
    'Heykel hangi kaynak grubundadır?',
    'Görsel kaynak',
    SOURCE_GROUP,
    'Heykel dönemin sanat ve görünümüne dair görsel bilgi verir.',
  ],
  [
    'Film hangi kaynak grubundadır?',
    'Görsel-işitsel kaynak',
    SOURCE_GROUP,
    'Film hem görüntü hem ses içerdiği için görsel-işitsel kaynaktır.',
  ],
  [
    'Ses kaydı hangi kaynak grubundadır?',
    'Görsel-işitsel kaynak',
    SOURCE_GROUP,
    'Ses kaydı işitsel içerik taşıdığı için görsel-işitsel kaynak grubunda değerlendirilir.',
  ],
  [
    'Kitabe hangi kaynak grubundadır?',
    'Yazılı kaynak',
    SOURCE_GROUP,
    'Kitabe taşa kazınmış yazı olduğu için yazılı kaynak grubundadır.',
  ],
  [
    'Günlük hangi kaynak grubundadır?',
    'Yazılı kaynak',
    SOURCE_GROUP,
    'Günlük yazılı olarak tutulduğu için yazılı kaynaktır.',
  ],
  [
    'Sözlü kaynakların ortak özelliği nedir?',
    'Kuşaktan kuşağa aktarılması',
    'Kuşaktan kuşağa aktarılması|Kâğıda basılması|Devlet arşivinde saklanması|Taşa kazınması',
    'Sözlü kaynaklar yazı yerine anlatım yoluyla kuşaktan kuşağa geçer.',
  ],
  [
    'Yazılı kaynakların ortak özelliği nedir?',
    'Kayıt altına alınmış olması',
    'Kayıt altına alınmış olması|Sadece söylenmesi|Yalnızca resmedilmesi|Hiç değişmemesi',
    'Yazılı kaynaklar metin olarak kaydedildiği için sonradan incelenebilir.',
  ],
  [
    'Görsel kaynaklara hangisi örnektir?',
    'Minyatür',
    'Minyatür|Ferman|Seyahatname|Vakfiye',
    'Minyatür görsel bir anlatım aracı olduğu için görsel kaynaktır.',
  ],
  [
    'Sözlü kaynak hangi dönemde daha çok kullanılır?',
    'Yazının yaygın olmadığı dönemlerde',
    'Yazının yaygın olmadığı dönemlerde|Matbaanın yaygınlaştığı dönemde|Gazetenin çıktığı dönemde|Arşivlerin kurulduğu dönemde',
    'Yazı yaygın değilken bilgi sözlü aktarımla korunur ve sonraki kuşaklara geçer.',
  ],
  [
    'Bir kaynağın sözlü olması güvenilirliğini nasıl etkiler?',
    'Zamanla değişebildiği için dikkat gerektirir',
    'Zamanla değişebildiği için dikkat gerektirir|Güvenilirliği artırır|Hiç etkilemez|Kaynağı geçersiz kılar',
    'Sözlü aktarımda ekleme ve unutma olabileceği için kaynak karşılaştırmalı kullanılır.',
  ],
  [
    'Seyahatname hangi kaynak grubundadır?',
    'Yazılı kaynak',
    SOURCE_GROUP,
    'Seyahatname yazıya geçirilmiş gözlemlerden oluştuğu için yazılı kaynaktır.',
  ],
  [
    'Anı hangi kaynak grubundadır?',
    'Yazılı kaynak',
    SOURCE_GROUP,
    'Anı yazılı olarak kaleme alındığı için yazılı kaynak grubundadır.',
  ],
  [
    'Belgesel hangi kaynak grubundadır?',
    'Görsel-işitsel kaynak',
    SOURCE_GROUP,
    'Belgesel görüntü ve ses içerdiği için görsel-işitsel kaynak grubundadır.',
  ],
  [
    'Arşiv belgesi hangi kaynak grubundadır?',
    'Yazılı kaynak',
    SOURCE_GROUP,
    'Arşiv belgesi yazılı ve resmî bir kayıt olduğu için yazılı kaynaktır.',
  ],
]);

/* ---------------------------------------------------------------- */
/* Tarih: Neden ve Sonuç                                             */
/* ---------------------------------------------------------------- */

facts(HIST, T_CAUSE, 'bulk-lt-neden', [
  [
    'Kavimler Göçü’nün sonucu hangisidir?',
    'Roma İmparatorluğu’nun ikiye ayrılması',
    'Roma İmparatorluğu’nun ikiye ayrılması|Yazının bulunması|Matbaanın icadı|Sanayi Devrimi',
    'Kavimler Göçü Roma’yı sarsmış, 395’te imparatorluk Doğu ve Batı olarak ikiye ayrılmıştır.',
  ],
  [
    'Coğrafi Keşifler’in sonucu hangisidir?',
    'Ticaret yollarının Atlas Okyanusu’na kayması',
    'Ticaret yollarının Atlas Okyanusu’na kayması|Yazının bulunması|Feodalitenin güçlenmesi|Kavimler Göçü’nün başlaması',
    'Yeni deniz yolları bulununca Akdeniz limanları yerine okyanus kıyıları öne çıkmıştır.',
  ],
  [
    'Fransız İhtilali’nin yaydığı temel düşünce hangisidir?',
    'Milliyetçilik ve eşitlik',
    'Milliyetçilik ve eşitlik|Feodalite ve kast|Skolastik düşünce|Mutlak monarşi',
    'İhtilal özgürlük, eşitlik ve milliyetçilik düşüncelerini yayarak ulus devletleri etkilemiştir.',
  ],
  [
    'Sanayi Devrimi’nin toplumsal sonucu hangisidir?',
    'Kentleşme ve işçi sınıfının doğuşu',
    'Kentleşme ve işçi sınıfının doğuşu|Kavimler Göçü|Feodalitenin doğuşu|Yazının bulunması',
    'Fabrikaların kurulması kentlere göçü ve ücretli işçi sınıfını doğurmuştur.',
  ],
  [
    'Matbaanın yaygınlaşmasının sonucu hangisidir?',
    'Bilginin hızlı yayılması',
    'Bilginin hızlı yayılması|Kâğıdın yasaklanması|Yazının unutulması|Ticaretin durması',
    'Matbaa kitap üretimini ucuzlatmış, bilginin yayılmasını hızlandırmıştır.',
  ],
  [
    'İstanbul’un fethinin sonucu hangisidir?',
    'Orta Çağ’ın kapanması',
    'Orta Çağ’ın kapanması|İlk Çağ’ın başlaması|Yazının bulunması|Reform’un sona ermesi',
    '1453’te İstanbul’un fethiyle Orta Çağ kapanmış ve Yeni Çağ başlamıştır.',
  ],
  [
    'Coğrafi Keşifler’in Osmanlı ekonomisine etkisi ne olmuştur?',
    'İpek Yolu ticaretinin azalması',
    'İpek Yolu ticaretinin azalması|Tarımın tamamen bitmesi|Nüfusun yarıya inmesi|Yazının kullanılmaması',
    'Yeni ticaret yolları Akdeniz ve İpek Yolu üzerinden geçen ticareti zayıflatmıştır.',
  ],
  [
    'I. Dünya Savaşı’nın sonucu hangisidir?',
    'İmparatorlukların dağılması',
    'İmparatorlukların dağılması|Matbaanın icadı|Feodalitenin doğuşu|Kavimler Göçü',
    'Savaş sonunda Osmanlı, Avusturya-Macaristan ve Rus imparatorlukları dağılmıştır.',
  ],
  [
    'Lozan Barış Antlaşması’nın sonucu hangisidir?',
    'Yeni Türk devletinin uluslararası alanda tanınması',
    'Yeni Türk devletinin uluslararası alanda tanınması|Saltanatın kaldırılması|TBMM’nin açılması|Amasya Genelgesi’nin yayımlanması',
    'Lozan’la Türkiye’nin bağımsızlığı ve sınırları uluslararası düzeyde kabul edilmiştir.',
  ],
  [
    'Kapitülasyonların kaldırılmasının sonucu nedir?',
    'Ekonomik bağımsızlığın güçlenmesi',
    'Ekonomik bağımsızlığın güçlenmesi|Toprakların küçülmesi|Ordunun dağılması|Meclisin kapanması',
    'Kapitülasyonlar kalkınca yabancı ayrıcalıkları sona ermiş ve ekonomi üzerinde denetim güçlenmiştir.',
  ],
  [
    'Harf İnkılabı’nın amacı nedir?',
    'Okuryazarlığın artırılması',
    'Okuryazarlığın artırılması|Nüfusun azaltılması|Tarımın geliştirilmesi|Ordunun güçlendirilmesi',
    'Yeni alfabe öğrenme ve yayma sürecini kolaylaştırarak okuryazarlığı artırmayı amaçlamıştır.',
  ],
  [
    'Medeni Kanun’un kabulünün sonucu nedir?',
    'Kadın-erkek eşitliğinde hukuki düzenleme yapılması',
    'Kadın-erkek eşitliğinde hukuki düzenleme yapılması|Saltanatın kaldırılması|Harf değişikliği|Tekke ve zaviyelerin kapatılması',
    'Medeni Kanun evlilik, miras ve aile hukukunda eşitlik ilkesini getirmiştir.',
  ],
  [
    'Tanzimat Fermanı’nın ilan nedenlerinden biri nedir?',
    'Avrupa devletlerinin iç işlere karışmasını önlemek',
    'Avrupa devletlerinin iç işlere karışmasını önlemek|Cumhuriyeti ilan etmek|Saltanatı kaldırmak|Harf İnkılabını yapmak',
    'Ferman, Avrupa devletlerinin azınlık haklarını bahane ederek iç işlere karışmasını önlemeyi amaçlar.',
  ],
  [
    'Osmanlı’da tımar sisteminin bozulmasının sonucu nedir?',
    'Vergi düzeninin ve askerî gücün zayıflaması',
    'Vergi düzeninin ve askerî gücün zayıflaması|Yazının bulunması|Sanayinin doğuşu|Meşrutiyetin ilanı',
    'Tımar bozulunca toprak düzeni ve tımarlı asker kaynağı sarsılmış, devlet güç kaybetmiştir.',
  ],
  [
    'Reform hareketinin sonucu hangisidir?',
    'Katolik Kilisesi’nin bölünmesi',
    'Katolik Kilisesi’nin bölünmesi|Roma’nın kurulması|Feodalitenin doğuşu|Kavimler Göçü',
    'Reform sonucunda Protestan kiliseleri doğmuş ve Batı Hristiyanlığı bölünmüştür.',
  ],
  [
    'Rönesans’ın temel nedeni hangisidir?',
    'Antik kültürün yeniden incelenmesi',
    'Antik kültürün yeniden incelenmesi|Yazının bulunması|Feodalitenin güçlenmesi|Kavimler Göçü',
    'Antik Yunan ve Roma metinlerinin incelenmesi hümanist düşünceyi ve Rönesans’ı doğurmuştur.',
  ],
  [
    'Aydınlanma düşüncesinin siyasi sonucu hangisidir?',
    'Anayasal düzenlerin ortaya çıkması',
    'Anayasal düzenlerin ortaya çıkması|Feodalitenin güçlenmesi|Yazının unutulması|Ticaretin durması',
    'Aydınlanma düşüncesi ihtilalleri ve anayasal yönetimleri hazırlamıştır.',
  ],
  [
    'II. Dünya Savaşı’nın sonucu hangisidir?',
    'Birleşmiş Milletler’in kurulması',
    'Birleşmiş Milletler’in kurulması|Milletler Cemiyeti’nin kurulması|Kavimler Göçü|Matbaanın icadı',
    'Savaş sonrasında uluslararası barışı korumak için Birleşmiş Milletler kurulmuştur.',
  ],
  [
    'Berlin Duvarı’nın yıkılmasının sonucu nedir?',
    'Soğuk Savaş’ın sona ermesi',
    'Soğuk Savaş’ın sona ermesi|I. Dünya Savaşı’nın başlaması|Feodalitenin doğuşu|Yazının bulunması',
    '1989’da duvarın yıkılması Doğu-Batı bloklaşmasını çözmüş ve Soğuk Savaş sona ermiştir.',
  ],
  [
    'Sanayi Devrimi’nin çevresel sonucu nedir?',
    'Kentlerde çevre sorunlarının artması',
    'Kentlerde çevre sorunlarının artması|Ormanların tamamen yok olması|İklimin durması|Suyun tükenmesi',
    'Fabrikaların yoğunlaştığı kentlerde hava ve su kirliliği artmıştır.',
  ],
  [
    'Yeniçeri Ocağı’nın kaldırılmasının amacı nedir?',
    'Merkezî otoriteyi güçlendirmek',
    'Merkezî otoriteyi güçlendirmek|Toprakları genişletmek|Meşrutiyeti ilan etmek|Kapitülasyonları artırmak',
    'Ocağın siyasete karışması ve ıslah edilememesi, kaldırılmasının temel nedeni olmuştur.',
  ],
  [
    'Sened-i İttifak’ın imzalanmasının nedeni nedir?',
    'Ayanların desteğini kazanmak',
    'Ayanların desteğini kazanmak|Cumhuriyeti ilan etmek|Harf değişikliği yapmak|Meclisi kapatmak',
    'II. Mahmut, ayanlarla anlaşarak merkezî otoritesini güvence altına almayı amaçlamıştır.',
  ],
]);

facts(HIST, T_CAUSE, 'bulk-lt-vade', [
  [
    'İstanbul’un fethinin uzun vadeli sonucu hangisidir?',
    'Yeni Çağ’ın başlaması ve Osmanlı’nın imparatorluğa dönüşmesi',
    'Yeni Çağ’ın başlaması ve Osmanlı’nın imparatorluğa dönüşmesi|Bir günlük kutlama yapılması|Surların onarılması|Gemilerin yakılması',
    'Fetih sonrası Osmanlı yeni bir çağ açmış ve imparatorluk yapısına geçmiştir.',
  ],
  [
    'Fransız İhtilali’nin uzun vadeli sonucu hangisidir?',
    'Ulus devletlerin yaygınlaşması',
    'Ulus devletlerin yaygınlaşması|Bir yıllık ekonomik durgunluk|Sınırların değişmemesi|Monarşilerin güçlenmesi',
    'İhtilalin yaydığı milliyetçilik uzun vadede ulus devletlerin kurulmasını hızlandırmıştır.',
  ],
  [
    'Coğrafi Keşifler’in kısa vadeli sonucu nedir?',
    'Yeni ticaret yollarının açılması',
    'Yeni ticaret yollarının açılması|Sanayi toplumunun doğuşu|Ulus devletlerin kurulması|Feodalitenin sona ermesi',
    'Keşiflerin hemen ardından yeni deniz yolları ticarette kullanılmaya başlanmıştır.',
  ],
  [
    'Sanayi Devrimi’nin uzun vadeli sonucu nedir?',
    'Üretim ve toplum yapısının değişmesi',
    'Üretim ve toplum yapısının değişmesi|Bir haftalık iş durması|Tek bir fabrikanın kapanması|Bir geminin batması',
    'Sanayileşme üretim biçimini, kentleşmeyi ve toplumsal sınıfları kalıcı biçimde değiştirmiştir.',
  ],
  [
    'Bir olayın kısa vadeli sonucu nasıl ayırt edilir?',
    'Olaydan hemen sonra görülen değişikliklerle',
    'Olaydan hemen sonra görülen değişikliklerle|Yüzyıllar sonraki yapısal değişimlerle|Kaynak sayısıyla|Yazar sayısıyla',
    'Kısa vadeli sonuç olayın hemen ardından gözlenen değişikliklerdir.',
  ],
  [
    'Bir olayın uzun vadeli sonucu nasıl ayırt edilir?',
    'Kuşaklar boyunca süren yapısal değişikliklerle',
    'Kuşaklar boyunca süren yapısal değişikliklerle|Bir günlük etkilerle|Olayın katılımcı sayısıyla|Olayın yerine bakılarak',
    'Uzun vadeli sonuç, kuşaklar boyunca süren ve yapıyı değiştiren etkidir.',
  ],
  [
    'Savaşların uzun vadeli sonuçlarına hangisi örnektir?',
    'Sınırların ve devlet yapılarının yeniden kurulması',
    'Sınırların ve devlet yapılarının yeniden kurulması|Cephede bir günlük ateşkes|Bir köprünün onarılması|Bir garnizonun taşınması',
    'Savaşlar sonrasında antlaşmalarla sınırlar ve devlet yapıları yeniden düzenlenir.',
  ],
  [
    'Bir antlaşmanın kısa vadeli sonucu hangisidir?',
    'Taraflar arasındaki çatışmanın sona ermesi',
    'Taraflar arasındaki çatışmanın sona ermesi|Yeni bir uygarlığın doğması|Toplum yapısının tümüyle değişmesi|Dillerin yok olması',
    'Antlaşma imzalandığında çatışma hemen sona erer; yapısal etkiler daha sonra görülür.',
  ],
  [
    'Teknolojik buluşların uzun vadeli etkisi hangisidir?',
    'Günlük yaşam biçiminin dönüşmesi',
    'Günlük yaşam biçiminin dönüşmesi|Bir günlük kullanım|Kısa süreli moda|Geçici bir heves',
    'Buluşlar zamanla çalışma, ulaşım ve iletişim alışkanlıklarını kalıcı biçimde değiştirir.',
  ],
  [
    'Osmanlı’nın gerilemesinde iç neden hangisidir?',
    'Merkezî otoritenin zayıflaması',
    'Merkezî otoritenin zayıflaması|Coğrafi Keşifler’in başlaması|Sanayi Devrimi’nin yaşanması|Fransız İhtilali’nin çıkması',
    'Taht kavgaları ve eyaletlerde güç boşluğu merkezî otoriteyi zayıflatmıştır.',
  ],
  [
    'Osmanlı’nın gerilemesinde dış neden hangisidir?',
    'Ticaret yollarının değişmesi',
    'Ticaret yollarının değişmesi|Tımar sisteminin bozulması|Taht kavgaları|Eyalet isyanları',
    'Coğrafi Keşifler’le ticaret yolları değişmiş, Osmanlı’nın ekonomik gücü azalmıştır.',
  ],
  [
    'I. Dünya Savaşı’nın Osmanlı açısından sonucu nedir?',
    'Devletin sona ermesi ve topraklarının işgali',
    'Devletin sona ermesi ve topraklarının işgali|Yeni topraklar kazanması|Sanayide atılım yapması|Tarımda makineleşmesi',
    'Savaş sonunda Osmanlı yenilmiş, Mondros ile toprakları işgal edilmiştir.',
  ],
  [
    'Kurtuluş Savaşı’nın sonucu hangisidir?',
    'Bağımsız Türkiye Cumhuriyeti’nin kurulması',
    'Bağımsız Türkiye Cumhuriyeti’nin kurulması|Saltanatın güçlenmesi|Kapitülasyonların genişlemesi|Meclisin kapatılması',
    'Kurtuluş Savaşı bağımsızlıkla sonuçlanmış ve 1923’te Cumhuriyet kurulmuştur.',
  ],
  [
    'Kentleşmenin sonucu hangisidir?',
    'Kırsal nüfusun azalması',
    'Kırsal nüfusun azalması|Tarımın tamamen bitmesi|Nüfusun azalması|Ulaşımın durması',
    'Kentlere göç arttıkça kırsal nüfus oranı azalır ve kent hizmetlerine talep artar.',
  ],
  [
    'Bir nedenin birden fazla sonuç doğurmasına hangisi örnektir?',
    'İstanbul’un fethinin siyasi ve kültürel sonuçlar doğurması',
    'İstanbul’un fethinin siyasi ve kültürel sonuçlar doğurması|Bir antlaşmanın tek maddesi olması|Bir savaşın tek gün sürmesi|Bir kentin adının değişmemesi',
    'Fetih hem siyasi dengeleri hem de bilim ve sanat ortamını etkilemiştir.',
  ],
  [
    'Bir sonucun birden fazla nedeni olmasına hangisi örnektir?',
    'Osmanlı’nın gerilemesinde iç ve dış etkenlerin birlikte rol oynaması',
    'Osmanlı’nın gerilemesinde iç ve dış etkenlerin birlikte rol oynaması|Bir savaşın tek nedene bağlanması|Bir antlaşmanın tek maddesi olması|Bir kentin tek kurucusu olması',
    'Gerileme hem iç yönetim sorunlarından hem de dış ekonomik değişimlerden kaynaklanmıştır.',
  ],
]);

facts(HIST, T_CAUSE, 'bulk-lt-antlasma', [
  [
    'Osmanlı’nın ilk büyük toprak kaybını belgeleyen antlaşma hangisidir?',
    'Karlofça Antlaşması',
    'Karlofça Antlaşması|Küçük Kaynarca Antlaşması|Berlin Antlaşması|Lozan Antlaşması',
    '1699 Karlofça Antlaşması Osmanlı’nın ilk büyük çaplı toprak kaybını belgeler.',
  ],
  [
    'Kırım’a bağımsızlık veren antlaşma hangisidir?',
    'Küçük Kaynarca Antlaşması',
    'Küçük Kaynarca Antlaşması|Karlofça Antlaşması|Paris Antlaşması|Ayastefanos Antlaşması',
    '1774 Küçük Kaynarca Antlaşması Kırım’a bağımsızlık tanımıştır.',
  ],
  [
    'Osmanlı’nın Avrupa devleti sayıldığı antlaşma hangisidir?',
    'Paris Antlaşması',
    'Paris Antlaşması|Karlofça Antlaşması|Berlin Antlaşması|Sevr Antlaşması',
    '1856 Paris Antlaşması ile Osmanlı Devleti Avrupa devletleri arasında sayılmıştır.',
  ],
  [
    'Osmanlı’dan en fazla toprak koparan antlaşma hangisidir?',
    'Berlin Antlaşması',
    'Berlin Antlaşması|Paris Antlaşması|Karlofça Antlaşması|Mondros Ateşkesi',
    '1878 Berlin Antlaşması Balkanlar’da geniş toprakların kaybına yol açmıştır.',
  ],
  [
    'Osmanlı’yı fiilen sona erdiren antlaşma hangisidir?',
    'Sevr Antlaşması',
    'Sevr Antlaşması|Lozan Antlaşması|Mondros Ateşkesi|Mudanya Ateşkesi',
    '1920 Sevr Antlaşması Osmanlı topraklarını paylaştırarak devleti fiilen sona erdirmiştir.',
  ],
  [
    'Türkiye’nin bağımsızlığını uluslararası alanda tanıyan antlaşma hangisidir?',
    'Lozan Antlaşması',
    'Lozan Antlaşması|Sevr Antlaşması|Mondros Ateşkesi|Ankara Antlaşması',
    '1923 Lozan Antlaşması yeni Türk devletinin bağımsızlığını ve sınırlarını tanıtmıştır.',
  ],
  [
    'Boğazlar üzerinde Türkiye’nin egemenliğini sağlayan antlaşma hangisidir?',
    'Montrö Boğazlar Sözleşmesi',
    'Montrö Boğazlar Sözleşmesi|Lozan Antlaşması|Sevr Antlaşması|Paris Antlaşması',
    '1936 Montrö Sözleşmesi Boğazlar yönetimini Türkiye’ye bırakmıştır.',
  ],
  [
    'Mudanya Ateşkesi hangi savaşın sonunda imzalanmıştır?',
    'Kurtuluş Savaşı',
    'Kurtuluş Savaşı|I. Dünya Savaşı|Balkan Savaşları|Kırım Savaşı',
    '1922 Mudanya Ateşkesi Kurtuluş Savaşı’nın silahlı aşamasını sona erdirmiştir.',
  ],
  [
    'Fransa ile imzalanan ve Güney Cephesi’ni kapatan antlaşma hangisidir?',
    'Ankara Antlaşması',
    'Ankara Antlaşması|Kars Antlaşması|Gümrü Antlaşması|Moskova Antlaşması',
    '1921 Ankara Antlaşması Fransa ile imzalanmış ve Güney Cephesi kapanmıştır.',
  ],
  [
    'Doğu sınırını belirleyen antlaşma hangisidir?',
    'Kars Antlaşması',
    'Kars Antlaşması|Ankara Antlaşması|Mudanya Ateşkesi|Lozan Antlaşması',
    '1921 Kars Antlaşması Doğu sınırını büyük ölçüde kesinleştirmiştir.',
  ],
  [
    'Ermenistan ile imzalanan ilk antlaşma hangisidir?',
    'Gümrü Antlaşması',
    'Gümrü Antlaşması|Kars Antlaşması|Moskova Antlaşması|Ankara Antlaşması',
    '1920 Gümrü Antlaşması Ermenistan ile imzalanan ilk antlaşmadır.',
  ],
  [
    'Sovyet Rusya ile imzalanan ilk antlaşma hangisidir?',
    'Moskova Antlaşması',
    'Moskova Antlaşması|Kars Antlaşması|Gümrü Antlaşması|Ankara Antlaşması',
    '1921 Moskova Antlaşması TBMM ile Sovyet Rusya arasındaki ilk antlaşmadır.',
  ],
  [
    'Ayastefanos Antlaşması yerine imzalanan antlaşma hangisidir?',
    'Berlin Antlaşması',
    'Berlin Antlaşması|Paris Antlaşması|Karlofça Antlaşması|Sevr Antlaşması',
    '1878 Berlin Antlaşması, ağır koşullu Ayastefanos Antlaşması’nın yerine imzalanmıştır.',
  ],
  [
    'Kırım Savaşı sonrasında imzalanan antlaşma hangisidir?',
    'Paris Antlaşması',
    'Paris Antlaşması|Berlin Antlaşması|Küçük Kaynarca Antlaşması|Karlofça Antlaşması',
    '1856 Paris Antlaşması Kırım Savaşı’nı sona erdirmiştir.',
  ],
  [
    'Sırbistan ve Karadağ’a bağımsızlık veren antlaşma hangisidir?',
    'Berlin Antlaşması',
    'Berlin Antlaşması|Paris Antlaşması|Karlofça Antlaşması|Lozan Antlaşması',
    '1878 Berlin Antlaşması ile Sırbistan, Karadağ ve Romanya bağımsız olmuştur.',
  ],
  [
    'Türkiye’nin Milletler Cemiyeti’ne üye olduğu yıl hangisidir?',
    '1932',
    '1932|1923|1936|1945',
    'Türkiye 1932’de Milletler Cemiyeti’ne üye olmuştur.',
  ],
  [
    'Türkiye’nin NATO’ya üye olduğu yıl hangisidir?',
    '1952',
    '1952|1945|1936|1960',
    'Türkiye 1952’de NATO’ya üye olmuştur.',
  ],
  [
    'Trablusgarp Savaşı’nı sona erdiren antlaşma hangisidir?',
    'Uşi Antlaşması',
    'Uşi Antlaşması|Londra Antlaşması|Bükreş Antlaşması|Berlin Antlaşması',
    '1912 Uşi (Ouchy) Antlaşması Trablusgarp Savaşı’nı sona erdirmiştir.',
  ],
]);

facts(HIST, T_CAUSE, 'bulk-lt-degisim', [
  [
    'Osmanlı’da toprak yönetiminde tımardan iltizama geçiş neyi gösterir?',
    'Ekonomik yapıdaki değişimi',
    'Ekonomik yapıdaki değişimi|Dilin değişmesini|Sınırların genişlemesini|Nüfusun artmasını',
    'Tımarın yerini iltizamın alması vergi toplama ve toprak işletmesinde yapısal bir değişimdir.',
  ],
  [
    'Cumhuriyet’le birlikte hukuk alanındaki değişim nedir?',
    'Laik hukuk düzeninin benimsenmesi',
    'Laik hukuk düzeninin benimsenmesi|Dinî hukukun güçlenmesi|Mahkemelerin kapatılması|Yazının yasaklanması',
    'Medeni Kanun’la birlikte hukuk düzeni laik temellere oturtulmuştur.',
  ],
  [
    'Değişim ile süreklilik arasındaki fark nedir?',
    'Değişim dönüşümü, süreklilik devamlılığı ifade eder',
    'Değişim dönüşümü, süreklilik devamlılığı ifade eder|İkisi aynı şeydir|Değişim yalnızca savaşlarda olur|Süreklilik yalnızca ekonomide olur',
    'Değişim yapının dönüşmesini, süreklilik ise benzer unsurların devam etmesini anlatır.',
  ],
  [
    'Bir toplumda sürekliliğe hangisi örnektir?',
    'Dil ve geleneklerin kuşaklar arası aktarımı',
    'Dil ve geleneklerin kuşaklar arası aktarımı|Saltanatın kaldırılması|Harf İnkılabı|Medeni Kanun’un kabulü',
    'Dil ve gelenekler kuşaklar boyunca aktarılarak süreklilik oluşturur.',
  ],
  [
    'Saltanatın kaldırılması hangi alanda değişimdir?',
    'Siyasi yönetim',
    'Siyasi yönetim|Tarım|Ulaşım|Sağlık',
    'Saltanatın kaldırılması yönetim biçiminde köklü bir siyasi değişimdir.',
  ],
  [
    'Harf İnkılabı hangi alanda değişimdir?',
    'Kültürel ve iletişim alanı',
    'Kültürel ve iletişim alanı|Askerî alan|Tarım alanı|Maden alanı',
    'Yazı değişikliği okuma yazma ve iletişim pratiklerini dönüştürmüştür.',
  ],
  [
    'Aşar vergisinin kaldırılması hangi alanda değişimdir?',
    'Ekonomik alan',
    'Ekonomik alan|Dinî alan|Askerî alan|Hukuk alanı',
    'Aşar vergisinin kaldırılması köylünün üzerindeki vergi yükünü değiştiren ekonomik bir düzenlemedir.',
  ],
  [
    'Tekke ve zaviyelerin kapatılması hangi alanda değişimdir?',
    'Dinî ve toplumsal alan',
    'Dinî ve toplumsal alan|Ekonomik alan|Askerî alan|Ulaşım alanı',
    'Tekke ve zaviyelerin kapatılması dinî kurumların toplumsal işlevini değiştirmiştir.',
  ],
  [
    'Osmanlı’dan Cumhuriyet’e geçişte süreklilik gösteren unsur hangisidir?',
    'Tarıma dayalı üretim yapısı',
    'Tarıma dayalı üretim yapısı|Saltanatın sürmesi|Hilafetin sürmesi|Kapitülasyonların sürmesi',
    'Yönetim biçimi değişse de ekonominin tarıma dayalı yapısı uzun süre devam etmiştir.',
  ],
  [
    'Osmanlı’da divan geleneğinin sürmesi neyi gösterir?',
    'Yönetim kültüründeki devamlılığı',
    'Yönetim kültüründeki devamlılığı|Ekonominin çöküşünü|Sınırların daralmasını|Nüfusun azalmasını',
    'Divan benzeri danışma kurullarının devam etmesi yönetim kültüründe sürekliliğe işaret eder.',
  ],
  [
    'Kentleşmenin hızlanması hangi alanda değişimdir?',
    'Toplumsal yapı',
    'Toplumsal yapı|Hukuk|Din|Dil',
    'Kentleşme nüfusun yerleşim biçimini ve toplumsal ilişkileri değiştirir.',
  ],
  [
    'Sanayi Devrimi’nin Osmanlı’ya etkisi hangi alanda görülür?',
    'Üretim ve ticaret',
    'Üretim ve ticaret|Dil ve alfabe|Din ve inanç|Ordu düzeni',
    'Ucuz fabrika ürünleri yerli üretimi sarsmış, ticaret dengesi değişmiştir.',
  ],
  [
    'Bir dönemin kendi içinde tutarlılık göstermesi neyi ifade eder?',
    'Sürekliliği',
    'Sürekliliği|Değişimi|Çöküşü|Belirsizliği',
    'Dönem içinde benzer kurum ve uygulamaların sürmesi sürekliliği ifade eder.',
  ],
  [
    'Tarihî sürekliliği kanıtlayan unsur hangisidir?',
    'Benzer kurum ve uygulamaların devam etmesi',
    'Benzer kurum ve uygulamaların devam etmesi|Tüm kurumların kaldırılması|Nüfusun sıfıra inmesi|Sınırların yok olması',
    'Kurum ve uygulamaların benzer biçimde sürmesi sürekliliğin kanıtıdır.',
  ],
]);

facts(HIST, T_CAUSE, 'bulk-lt-kurum', [
  [
    'Osmanlı’da devlet işlerinin görüşüldüğü meclise ne denir?',
    'Divan-ı Hümayun',
    'Divan-ı Hümayun|Meclis-i Mebusan|Enderun|Medrese',
    'Divan-ı Hümayun devlet işlerinin görüşüldüğü en yüksek karar organıdır.',
  ],
  [
    'Osmanlı’da mali işlerden sorumlu divan üyesi kimdir?',
    'Defterdar',
    'Defterdar|Kazasker|Nişancı|Reisülküttap',
    'Defterdar gelir ve giderleri yöneterek mali işlerden sorumlu olmuştur.',
  ],
  [
    'Osmanlı’da adalet ve eğitim işlerinden sorumlu divan üyesi kimdir?',
    'Kazasker',
    'Kazasker|Defterdar|Nişancı|Şeyhülislam',
    'Kazasker adalet ve eğitim alanlarındaki işleri yürütmüştür.',
  ],
  [
    'Osmanlı’da fethedilen toprakların kayıtlarını tutan görevli kimdir?',
    'Nişancı',
    'Nişancı|Defterdar|Kazasker|Beylerbeyi',
    'Nişancı tapu ve tahrir kayıtlarını tutarak toprak düzenini kayda geçirmiştir.',
  ],
  [
    'Osmanlı’da divanın dış işleri sorumlusu kimdir?',
    'Reisülküttap',
    'Reisülküttap|Nişancı|Defterdar|Kazasker',
    'Reisülküttap yazışma ve dış ilişkiler işlerini yürütmüştür.',
  ],
  [
    'Osmanlı’da dinî konularda en yetkili kişi kimdir?',
    'Şeyhülislam',
    'Şeyhülislam|Kazasker|Nişancı|Defterdar',
    'Şeyhülislam dinî konularda fetva veren en yetkili kişidir.',
  ],
  [
    'Osmanlı’da eyaletlerin yönetiminden sorumlu görevli kimdir?',
    'Beylerbeyi',
    'Beylerbeyi|Nişancı|Reisülküttap|Şeyhülislam',
    'Beylerbeyi eyaletin yönetiminden ve düzeninden sorumlu tutulmuştur.',
  ],
  [
    'Osmanlı’da tımar sisteminin temel işlevi nedir?',
    'Toprağı işletip asker yetiştirmek',
    'Toprağı işletip asker yetiştirmek|Vergi toplamayı yasaklamak|Şehirleri kurmak|Deniz ticaretini yönetmek',
    'Tımar sistemi üretimi sürdürürken tımarlı sipahi adı verilen askerleri beslemiştir.',
  ],
  [
    'Osmanlı’da loncaların işlevi nedir?',
    'Esnaf arasında düzen ve denetim sağlamak',
    'Esnaf arasında düzen ve denetim sağlamak|Asker yetiştirmek|Vergi affı vermek|Toprak dağıtmak',
    'Loncalar üretim standartlarını ve fiyat düzenini denetleyerek esnaf arasında düzen sağlar.',
  ],
  [
    'Osmanlı’da vakıfların işlevi nedir?',
    'Eğitim, sağlık ve hayır hizmetleri sunmak',
    'Eğitim, sağlık ve hayır hizmetleri sunmak|Ordu kurmak|Sınırları genişletmek|Vergi toplamak',
    'Vakıflar okul, hastane, çeşme gibi kamusal hizmetleri finanse etmiştir.',
  ],
  [
    'Osmanlı’da Enderun’un işlevi nedir?',
    'Devlet görevlisi yetiştirmek',
    'Devlet görevlisi yetiştirmek|Toprak dağıtmak|Vergi toplamak|Deniz ticareti yapmak',
    'Enderun saray içinde devlet görevlisi yetiştiren eğitim kurumudur.',
  ],
  [
    'Osmanlı’da medresenin işlevi nedir?',
    'Din ve bilim eğitimi vermek',
    'Din ve bilim eğitimi vermek|Asker yetiştirmek|Vergi toplamak|Ticaret yapmak',
    'Medreseler din, hukuk ve pozitif bilimler alanında eğitim vermiştir.',
  ],
  [
    'Osmanlı’da Yeniçeri Ocağı’nın işlevi nedir?',
    'Merkezî ordunun çekirdeğini oluşturmak',
    'Merkezî ordunun çekirdeğini oluşturmak|Vergi toplamak|Toprak dağıtmak|Eğitim vermek',
    'Yeniçeri Ocağı merkezî ordunun temel gücü olarak görev yapmıştır.',
  ],
]);

/* ---------------------------------------------------------------- */
/* İngilizce: Conditionals                                           */
/* ---------------------------------------------------------------- */

facts(ENG, T_COND, 'bulk-li-first', [
  [
    'If it ___ tomorrow, we will cancel the picnic.',
    'rains',
    'rains|rained|would rain|will rain',
    'First conditional yapısında if bölümünde present simple kullanılır: if it rains.',
  ],
  [
    'If you ___ hard, you will pass the exam.',
    'study',
    'study|studied|would study|will study',
    'If bölümü geniş zaman alır; sonuç bölümünde will + fiil bulunur.',
  ],
  [
    'If she ___ early, she will catch the bus.',
    'leaves',
    'leaves|left|would leave|will leave',
    'First conditional if bölümünde üçüncü tekil kişi -s eki alır: if she leaves.',
  ],
  [
    'We will go out if the rain ___.',
    'stops',
    'stops|stopped|would stop|will stop',
    'If bölümü present simple ile kurulur; temel cümlede will kullanılır.',
  ],
  [
    'If he ___ the truth, he will tell us.',
    'knows',
    'knows|knew|would know|will know',
    'Gerçekleşmesi olası bir durum anlatıldığı için if bölümü geniş zamandadır.',
  ],
  [
    'If they ___ the match, they will celebrate.',
    'win',
    'win|won|would win|will win',
    'First conditional yapısında if bölümünde will kullanılmaz; yalın hâl gelir.',
  ],
  [
    'I will call you if I ___ late.',
    'am',
    'am|was|would be|will be',
    'If bölümünde “be” fiili geniş zamanda “am” biçimini alır.',
  ],
  [
    'If the weather ___ nice, we will walk to school.',
    'is',
    'is|was|would be|will be',
    'First conditional if bölümünde “be” fiili “is” olarak kullanılır.',
  ],
  [
    'She will buy the dress if it ___ on sale.',
    'is',
    'is|was|would be|will be',
    'Koşul bölümü geniş zamanla kurulur; indirimde olma durumu olasıdır.',
  ],
  [
    'If you ___ your homework, you can go out.',
    'finish',
    'finish|finished|would finish|will finish',
    'If bölümü geniş zaman alır; sonuç bölümünde modal fiil kullanılabilir.',
  ],
  [
    'If we ___ time, we will visit the museum.',
    'have',
    'have|had|would have|will have',
    'First conditional if bölümünde “have” yalın hâlde kullanılır.',
  ],
  [
    'The plant will die if you ___ it.',
    'do not water',
    'do not water|did not water|would not water|will not water',
    'Olumsuz if bölümü geniş zamanda “do not + fiil” ile kurulur.',
  ],
  [
    'If he ___ harder, he will succeed.',
    'tries',
    'tries|tried|would try|will try',
    'Üçüncü tekil kişide fiil -es eki alır: if he tries.',
  ],
  [
    'You will miss the train if you ___.',
    'do not hurry',
    'do not hurry|did not hurry|would not hurry|will not hurry',
    'If bölümü geniş zamanla kurulur; olumsuzluk “do not” ile yapılır.',
  ],
  [
    'If it ___ cold, we will stay inside.',
    'gets',
    'gets|got|would get|will get',
    'Hava durumuna ilişkin olası durum first conditional ile anlatılır.',
  ],
  [
    'If she ___ me, I will help her.',
    'asks',
    'asks|asked|would ask|will ask',
    'If bölümünde present simple, sonuç bölümünde will + fiil bulunur.',
  ],
  [
    'We will start the meeting if everyone ___.',
    'arrives',
    'arrives|arrived|would arrive|will arrive',
    'Koşul gerçekleşebilir olduğu için if bölümü geniş zamandadır.',
  ],
  [
    'If they ___ enough money, they will travel.',
    'save',
    'save|saved|would save|will save',
    'First conditional yapısında if bölümü will almaz; yalın fiil gelir.',
  ],
  [
    'If you ___ this button, the machine will start.',
    'press',
    'press|pressed|would press|will press',
    'If bölümü geniş zamanla kurulur ve sonuç will ile verilir.',
  ],
  [
    'I will be surprised if he ___.',
    'comes',
    'comes|came|would come|will come',
    'Koşul bölümünde geniş zaman kullanılır; temel cümlede will bulunur.',
  ],
  [
    'If the bus ___ late, we will take a taxi.',
    'is',
    'is|was|would be|will be',
    'If bölümünde “be” fiili geniş zamanda “is” biçimindedir.',
  ],
  [
    'If you ___ the instructions, you will not make mistakes.',
    'read',
    'read|readed|would read|will read',
    'If bölümünde fiil yalın hâlde kullanılır; “will” yalnızca sonuç bölümüne gelir.',
  ],
]);

facts(ENG, T_COND, 'bulk-li-second', [
  [
    'If I ___ rich, I would travel the world.',
    'were',
    'were|am|is|will be',
    'Second conditional varsayım bildirdiği için “were” tüm öznelerle kullanılabilir.',
  ],
  [
    'If she ___ harder, she would pass the exam.',
    'studied',
    'studied|studies|would study|has studied',
    'Second conditional if bölümünde past simple kullanılır.',
  ],
  [
    'If we ___ a car, we would drive to the coast.',
    'had',
    'had|have|would have|will have',
    'Gerçek olmayan varsayımda if bölümü geçmiş zamanla kurulur.',
  ],
  [
    'I would help you if I ___ how.',
    'knew',
    'knew|know|would know|will know',
    'If bölümü past simple alır; sonuç bölümünde would + fiil bulunur.',
  ],
  [
    'If he ___ more careful, he would not make mistakes.',
    'were',
    'were|is|will be|has been',
    'Varsayımsal durumda “be” fiili “were” biçimini alır.',
  ],
  [
    'If they ___ the answer, they would tell us.',
    'knew',
    'knew|know|would know|have known',
    'Second conditional if bölümünde geçmiş zaman kullanılır.',
  ],
  [
    'What would you do if you ___ a million lira?',
    'won',
    'won|win|would win|will win',
    'Gerçek dışı varsayım sorulduğu için if bölümü past simple olur.',
  ],
  [
    'If I ___ you, I would apologize.',
    'were',
    'were|am|will be|have been',
    '“If I were you” kalıbı öğüt verirken kullanılan sabit bir second conditional yapısıdır.',
  ],
  [
    'She would come to the party if she ___ invited.',
    'were',
    'were|is|will be|has been',
    'Edilgen yapıda “were invited” biçimi varsayımı anlatır.',
  ],
  [
    'If we ___ nearer, we would walk to work.',
    'lived',
    'lived|live|would live|will live',
    'If bölümü past simple ile kurulur; sonuç would ile verilir.',
  ],
  [
    'If it ___ warmer, we would swim.',
    'were',
    'were|is|will be|has been',
    'Şu anda gerçek olmayan hava durumu varsayımı “were” ile kurulur.',
  ],
  [
    'He would buy the house if he ___ enough money.',
    'had',
    'had|has|would have|will have',
    'Second conditional if bölümünde “have” fiilinin geçmiş biçimi kullanılır.',
  ],
  [
    'If you ___ me, I would explain everything.',
    'asked',
    'asked|ask|would ask|have asked',
    'If bölümü geçmiş zaman, sonuç bölümü would + fiil olur.',
  ],
  [
    'If they ___ more, they would improve.',
    'practised',
    'practised|practise|would practise|have practised',
    'Varsayımsal koşulda if bölümü past simple alır.',
  ],
  [
    'I would be happier if I ___ more free time.',
    'had',
    'had|have|would have|will have',
    'Gerçek olmayan durum ikinci koşul cümlesiyle anlatılır.',
  ],
  [
    'If she ___ English, she would work abroad.',
    'spoke',
    'spoke|speaks|would speak|has spoken',
    'If bölümünde geçmiş zaman biçimi kullanılır.',
  ],
  [
    'If we ___ the map, we would not be lost.',
    'had',
    'had|have|would have|will have',
    'Second conditional if bölümünde “have” fiili “had” olur.',
  ],
  [
    'If he ___ the truth, he would admit it.',
    'knew',
    'knew|knows|would know|has known',
    'Varsayımsal koşulda if bölümü past simple ile kurulur.',
  ],
  [
    'You would feel better if you ___ more water.',
    'drank',
    'drank|drink|would drink|have drunk',
    'If bölümü geçmiş zaman alır; sonuç bölümü would + fiil olur.',
  ],
  [
    'If I ___ taller, I would play basketball.',
    'were',
    'were|am|will be|have been',
    'Boy uzunluğu gibi değişmeyen durumlar “were” ile varsayılır.',
  ],
]);

facts(ENG, T_COND, 'bulk-li-tip', [
  [
    '“If you heat ice, it melts.” cümlesi hangi koşul cümlesidir?',
    'Zero conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Her zaman geçerli bilimsel bir sonuç verildiği için bu cümle zero conditionaldır.',
  ],
  [
    '“If it rains, we will stay at home.” cümlesi hangi koşul cümlesidir?',
    'First conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Gelecekte gerçekleşmesi olası bir durum will ile anlatıldığı için first conditionaldır.',
  ],
  [
    '“If I had more time, I would learn Spanish.” cümlesi hangi koşul cümlesidir?',
    'Second conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Şu anda gerçek olmayan bir varsayım would ile anlatıldığı için second conditionaldır.',
  ],
  [
    '“If you press this key, the program closes.” cümlesi hangi koşul cümlesidir?',
    'Zero conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Her seferinde aynı sonucu veren genel bir durum olduğu için zero conditionaldır.',
  ],
  [
    '“If she calls, I will tell her the news.” cümlesi hangi koşul cümlesidir?',
    'First conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Gelecekteki olası bir durum ve sonucu will ile verildiği için first conditionaldır.',
  ],
  [
    '“If they lived here, they would join us.” cümlesi hangi koşul cümlesidir?',
    'Second conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Gerçek olmayan bir varsayım past simple + would ile kurulduğu için second conditionaldır.',
  ],
  [
    '“Water boils if you heat it to 100 degrees.” cümlesi hangi koşul cümlesidir?',
    'Zero conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Bilimsel olarak her zaman geçerli bir sonuç verildiği için zero conditionaldır.',
  ],
  [
    '“If we leave now, we will catch the train.” cümlesi hangi koşul cümlesidir?',
    'First conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Gerçekleşmesi olası bir durum ve sonucu will ile anlatıldığı için first conditionaldır.',
  ],
  [
    '“If he were taller, he would reach the shelf.” cümlesi hangi koşul cümlesidir?',
    'Second conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Gerçek dışı bir varsayım “were” ve “would” ile kurulduğu için second conditionaldır.',
  ],
  [
    '“If you mix blue and yellow, you get green.” cümlesi hangi koşul cümlesidir?',
    'Zero conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Her zaman geçerli bir sonuç verildiği için zero conditionaldır.',
  ],
  [
    '“I will help you if you ask me.” cümlesi hangi koşul cümlesidir?',
    'First conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Geleceğe dönük olası bir koşul ve sonucu will ile verildiği için first conditionaldır.',
  ],
  [
    '“If I knew her number, I would call her.” cümlesi hangi koşul cümlesidir?',
    'Second conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Gerçek olmayan bir durum past simple + would ile anlatıldığı için second conditionaldır.',
  ],
  [
    '“Plants die if they get no water.” cümlesi hangi koşul cümlesidir?',
    'Zero conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Genel geçer bir neden-sonuç ilişkisi verildiği için zero conditionaldır.',
  ],
]);

facts(ENG, T_COND, 'bulk-li-anlam', [
  [
    'First conditional cümlesinin sonuç bölümünde hangi yapı kullanılır?',
    'will + fiilin yalın hâli',
    'will + fiilin yalın hâli|would + fiilin yalın hâli|past simple|present perfect',
    'First conditionalda sonuç bölümü “will + fiil” ile kurulur.',
  ],
  [
    'Second conditional cümlesinin sonuç bölümünde hangi yapı kullanılır?',
    'would + fiilin yalın hâli',
    'would + fiilin yalın hâli|will + fiilin yalın hâli|present simple|past perfect',
    'Second conditionalda sonuç bölümü “would + fiil” ile kurulur.',
  ],
  [
    'First conditional hangi durumu anlatır?',
    'Gelecekte gerçekleşmesi olası durumu',
    'Gelecekte gerçekleşmesi olası durumu|Geçmişte olmayan durumu|Her zaman geçerli bilimsel sonucu|Şu anda gerçek olmayan varsayımı',
    'First conditional gerçekleşme olasılığı bulunan gelecek durumlar için kullanılır.',
  ],
  [
    'Second conditional hangi durumu anlatır?',
    'Şu anda gerçek olmayan varsayımsal durumu',
    'Şu anda gerçek olmayan varsayımsal durumu|Gelecekte kesin olacak durumu|Geçmişte tamamlanmış olayı|Her zaman geçerli kuralı',
    'Second conditional gerçekleşmeyen ya da gerçek olmayan varsayımları anlatır.',
  ],
  [
    'Zero conditional hangi ilişkiyi anlatır?',
    'Her zaman geçerli neden-sonuç ilişkisi',
    'Her zaman geçerli neden-sonuç ilişkisi|Gelecekteki olasılık|Geçmişteki pişmanlık|Nazik bir rica',
    'Zero conditionalda koşul gerçekleştiğinde sonuç her zaman aynı olur.',
  ],
  [
    '“If + present simple, present simple” yapısı hangi koşul tipidir?',
    'Zero conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'İki bölümde de geniş zaman kullanılması zero conditionalın işaretidir.',
  ],
  [
    '“If + past simple, would + fiil” yapısı hangi koşul tipidir?',
    'Second conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Past simple ile would birleşimi second conditionalı oluşturur.',
  ],
  [
    '“If + present simple, will + fiil” yapısı hangi koşul tipidir?',
    'First conditional',
    'Zero conditional|First conditional|Second conditional|Third conditional',
    'Geniş zaman ve will birleşimi first conditionalın yapısıdır.',
  ],
  [
    '“If I were you” ifadesinin anlamı nedir?',
    'Senin yerinde olsam',
    'Senin yerinde olsam|Ben seninleydim|Sen benim yerimdeydin|Ben seni gördüm',
    'Bu kalıp öğüt verirken “senin yerinde olsam” anlamında kullanılır.',
  ],
  [
    'Second conditionalda “were” biçiminin tüm öznelerle kullanılmasının nedeni nedir?',
    'Varsayım anlamını güçlendirmek',
    'Varsayım anlamını güçlendirmek|Geçmiş zamanı göstermek|Çoğul özne gerektirmek|Emir anlamı vermek',
    '“Were” biçimi gerçek dışılık ve varsayım anlamını belirginleştirir.',
  ],
  [
    'First conditional cümlesinde if bölümünde hangi zaman kullanılır?',
    'Present simple',
    'Present simple|Past simple|Present perfect|Future simple',
    'If bölümünde geniş zaman, sonuç bölümünde will kullanılır.',
  ],
  [
    'Koşul cümlesinde “unless” hangi anlamı verir?',
    'Eğer ... değilse',
    'Eğer ... değilse|Eğer ... ise|Çünkü|Buna rağmen',
    '“Unless” olumsuz koşul bildirir ve “if not” anlamına gelir.',
  ],
]);

/* ---------------------------------------------------------------- */
/* İngilizce: Bağlaçlar                                              */
/* ---------------------------------------------------------------- */

facts(ENG, T_CONJ, 'bulk-li-however', [
  [
    'The weather was cold; ___, we went for a walk.',
    'however',
    'however|therefore|because|so',
    'İki cümle arasında karşıtlık olduğu için “however” gelir.',
  ],
  [
    'The exam was difficult; ___, most students passed.',
    'however',
    'however|therefore|because|so',
    'Zorluk ile başarı arasındaki karşıtlık “however” ile kurulur.',
  ],
  [
    'She studied hard; ___, she failed the test.',
    'however',
    'however|therefore|because|so',
    'Beklenenin tersi bir sonuç verildiği için karşıtlık bağlacı gerekir.',
  ],
  [
    'The hotel was expensive; ___, it was very comfortable.',
    'however',
    'however|therefore|because|so',
    'Olumsuz bir özelliğe karşıt olumlu özellik eklendiği için “however” kullanılır.',
  ],
  [
    'He is only sixteen; ___, he speaks four languages.',
    'however',
    'however|therefore|because|so',
    'Yaş ile dil bilgisi arasındaki karşıtlık “however” ile anlatılır.',
  ],
  [
    'The traffic was heavy; ___, we reached the airport on time.',
    'however',
    'however|therefore|because|so',
    'Yoğun trafiğe karşın zamanında varılması karşıtlık ilişkisidir.',
  ],
  [
    'The book is long; ___, it is easy to read.',
    'however',
    'however|therefore|because|so',
    'Uzunluk ile kolay okunurluk arasında karşıtlık vardır.',
  ],
  [
    'I like the city; ___, I would not live there.',
    'however',
    'however|therefore|because|so',
    'Sevme ile orada yaşamama arasındaki karşıtlık “however” gerektirir.',
  ],
  [
    'The team played well; ___, they lost the final.',
    'however',
    'however|therefore|because|so',
    'İyi oyun ile yenilgi arasındaki karşıtlık “however” ile verilir.',
  ],
  [
    'The phone is old; ___, it works perfectly.',
    'however',
    'however|therefore|because|so',
    'Eski olma ile sorunsuz çalışma arasında karşıtlık bulunur.',
  ],
  [
    'She was tired; ___, she finished the report.',
    'however',
    'however|therefore|because|so',
    'Yorgunluğa karşın işin bitirilmesi karşıtlık ilişkisidir.',
  ],
  [
    'The instructions were clear; ___, many people made mistakes.',
    'however',
    'however|therefore|because|so',
    'Açık yönergeye karşın hata yapılması karşıtlık bildirir.',
  ],
  [
    'The film received bad reviews; ___, it became very popular.',
    'however',
    'however|therefore|because|so',
    'Olumsuz eleştiri ile popülerlik arasındaki karşıtlık “however” ile kurulur.',
  ],
  [
    'He had little experience; ___, he got the job.',
    'however',
    'however|therefore|because|so',
    'Az deneyime karşın işe alınma karşıtlık ilişkisidir.',
  ],
  [
    'The room was small; ___, it was clean and bright.',
    'however',
    'however|therefore|because|so',
    'Küçüklük ile temizlik arasındaki karşıtlık “however” gerektirir.',
  ],
]);

facts(ENG, T_CONJ, 'bulk-li-therefore', [
  [
    'He studied every day; ___, he passed the exam.',
    'therefore',
    'therefore|however|although|because',
    'Düzenli çalışma sonucun nedenidir; sonuç bağlacı “therefore” gelir.',
  ],
  [
    'It was raining heavily; ___, the match was cancelled.',
    'therefore',
    'therefore|however|although|because',
    'Yağmur maçın iptalinin nedenidir; sonuç bağlacı kullanılır.',
  ],
  [
    'She missed the bus; ___, she was late for work.',
    'therefore',
    'therefore|however|although|because',
    'Otobüsü kaçırma gecikmenin nedeni olduğu için “therefore” gelir.',
  ],
  [
    'The company lost money; ___, it had to close a factory.',
    'therefore',
    'therefore|however|although|because',
    'Zarar fabrika kapatmanın nedenidir; sonuç bağlacı gerekir.',
  ],
  [
    'The roads were icy; ___, the school was closed.',
    'therefore',
    'therefore|however|although|because',
    'Buzlu yol okulun kapanmasına yol açtığı için sonuç bağlacı kullanılır.',
  ],
  [
    'He forgot his passport; ___, he could not board the plane.',
    'therefore',
    'therefore|however|although|because',
    'Pasaport unutma uçağa binememenin nedenidir.',
  ],
  [
    'The demand increased; ___, prices went up.',
    'therefore',
    'therefore|however|although|because',
    'Talep artışı fiyat yükselişinin nedenidir; sonuç bağlacı gelir.',
  ],
  [
    'She practised daily; ___, her English improved quickly.',
    'therefore',
    'therefore|however|although|because',
    'Günlük çalışma gelişmenin nedeni olduğu için “therefore” kullanılır.',
  ],
  [
    'The bridge was damaged; ___, traffic was diverted.',
    'therefore',
    'therefore|however|although|because',
    'Köprünün hasarı trafiğin yönlendirilmesine yol açmıştır.',
  ],
  [
    'They saved for years; ___, they bought a house.',
    'therefore',
    'therefore|however|although|because',
    'Yıllarca birikim yapma ev almanın nedenidir.',
  ],
  [
    'The water was polluted; ___, swimming was banned.',
    'therefore',
    'therefore|however|although|because',
    'Kirlilik yüzme yasağının nedeni olduğu için sonuç bağlacı gelir.',
  ],
  [
    'He ignored the warning; ___, the machine broke down.',
    'therefore',
    'therefore|however|although|because',
    'Uyarıyı yok sayma makinenin bozulmasına yol açmıştır.',
  ],
  [
    'The population grew; ___, new schools were built.',
    'therefore',
    'therefore|however|although|because',
    'Nüfus artışı yeni okul yapımının nedenidir.',
  ],
  [
    'She spoke quietly; ___, nobody heard her.',
    'therefore',
    'therefore|however|although|because',
    'Sessiz konuşma duyulmamasının nedenidir; sonuç bağlacı kullanılır.',
  ],
]);

facts(ENG, T_CONJ, 'bulk-li-although', [
  [
    '___ it was raining, they continued the match.',
    'Although',
    'Although|Because|Therefore|However',
    'Karşıtlık bildiren bir yan cümle gerektiği için “Although” gelir.',
  ],
  [
    '___ he was tired, he finished the work.',
    'Although',
    'Although|Because|Therefore|However',
    'Yorgunluğa karşın işin bitmesi ödün verme ilişkisidir.',
  ],
  [
    '___ she studied hard, she did not pass.',
    'Although',
    'Although|Because|Therefore|However',
    'Çalışmaya karşın başarısızlık karşıtlık bildirir.',
  ],
  [
    '___ the car is old, it runs smoothly.',
    'Although',
    'Although|Because|Therefore|However',
    'Eski olma ile sorunsuz çalışma arasındaki karşıtlık “Although” ile kurulur.',
  ],
  [
    '___ the price was high, they bought the house.',
    'Although',
    'Although|Because|Therefore|However',
    'Yüksek fiyata karşın satın alma karşıtlık ilişkisidir.',
  ],
  [
    '___ he apologized, she was still upset.',
    'Although',
    'Although|Because|Therefore|However',
    'Özür dilemeye karşın kırgınlığın sürmesi karşıtlıktır.',
  ],
  [
    '___ the team lost, the fans applauded.',
    'Although',
    'Although|Because|Therefore|However',
    'Yenilgiye karşın alkışlanması ödün verme ilişkisidir.',
  ],
  [
    '___ I was hungry, I did not eat anything.',
    'Although',
    'Although|Because|Therefore|However',
    'Açlığa karşın yemek yememe karşıtlık bildirir.',
  ],
  [
    '___ the weather was bad, the flight took off.',
    'Although',
    'Although|Because|Therefore|However',
    'Kötü havaya karşın uçuşun yapılması karşıtlıktır.',
  ],
  [
    '___ she is young, she is very experienced.',
    'Although',
    'Although|Because|Therefore|However',
    'Genç olma ile deneyim arasındaki karşıtlık “Although” gerektirir.',
  ],
  [
    '___ the book is short, it is difficult.',
    'Although',
    'Although|Because|Therefore|However',
    'Kısa olma ile zorluk arasındaki karşıtlık “Although” ile verilir.',
  ],
  [
    '___ he practised a lot, his pronunciation stayed poor.',
    'Although',
    'Although|Because|Therefore|However',
    'Çok çalışmaya karşın telaffuzun düzelmemesi karşıtlık ilişkisidir.',
  ],
  [
    '___ the room was noisy, I managed to sleep.',
    'Although',
    'Although|Because|Therefore|However',
    'Gürültüye karşın uyuyabilme ödün verme ilişkisidir.',
  ],
  [
    '___ they had little money, they were happy.',
    'Although',
    'Although|Because|Therefore|However',
    'Az paraya karşın mutluluk karşıtlık bildirir.',
  ],
  [
    '___ the task was simple, nobody completed it.',
    'Although',
    'Although|Because|Therefore|However',
    'Basitliğe karşın tamamlanmaması karşıtlık ilişkisidir.',
  ],
]);

facts(ENG, T_CONJ, 'bulk-li-islev', [
  [
    '“However” hangi ilişkiyi kurar?',
    'Karşıtlık',
    'Karşıtlık|Neden|Sonuç|Ekleme',
    '“However” iki karşıt fikri birbirine bağlar.',
  ],
  [
    '“Therefore” hangi ilişkiyi kurar?',
    'Sonuç',
    'Sonuç|Karşıtlık|Ekleme|Karşılaştırma',
    '“Therefore” bir nedenin sonucunu bildirir.',
  ],
  [
    '“Although” hangi ilişkiyi kurar?',
    'Karşıtlık ve ödün verme',
    'Karşıtlık ve ödün verme|Neden|Sonuç|Ekleme',
    '“Although” bir duruma karşın gerçekleşen sonucu anlatır.',
  ],
  [
    '“Because” hangi ilişkiyi kurar?',
    'Neden',
    'Neden|Sonuç|Karşıtlık|Ekleme',
    '“Because” bir sonucun nedenini bildirir.',
  ],
  [
    '“Moreover” hangi ilişkiyi kurar?',
    'Ekleme',
    'Ekleme|Karşıtlık|Neden|Sonuç',
    '“Moreover” önceki fikre yeni bir bilgi ekler.',
  ],
  [
    '“In addition” hangi ilişkiyi kurar?',
    'Ekleme',
    'Ekleme|Sonuç|Karşıtlık|Karşılaştırma',
    '“In addition” ek bilgi verildiğini gösterir.',
  ],
  [
    '“Whereas” hangi ilişkiyi kurar?',
    'Karşılaştırma',
    'Karşılaştırma|Neden|Sonuç|Ekleme',
    '“Whereas” iki durumu karşılaştırarak karşıtlık kurar.',
  ],
  [
    '“Nevertheless” hangi ilişkiyi kurar?',
    'Karşıtlık',
    'Karşıtlık|Ekleme|Neden|Sonuç',
    '“Nevertheless” önceki olumsuzluğa karşın sonucu bildirir.',
  ],
  [
    '“On the other hand” hangi ilişkiyi kurar?',
    'Karşılaştırma',
    'Karşılaştırma|Neden|Sonuç|Ekleme',
    '“On the other hand” karşıt görüşü sunmak için kullanılır.',
  ],
  [
    '“As a result” hangi ilişkiyi kurar?',
    'Sonuç',
    'Sonuç|Neden|Karşıtlık|Ekleme',
    '“As a result” bir sonucun bildirildiğini gösterir.',
  ],
  [
    '“Despite” hangi yapıyla kullanılır?',
    'İsim ya da isim grubuyla',
    'İsim ya da isim grubuyla|Tam cümleyle|Fiilin yalın hâliyle|Soru cümlesiyle',
    '“Despite” kendisinden sonra isim ya da isim grubu alır, tam cümle almaz.',
  ],
  [
    '“Because” ile “because of” arasındaki fark nedir?',
    '“Because” cümle, “because of” isim alır',
    '“Because” cümle, “because of” isim alır|İkisi aynıdır|“Because of” cümle alır|“Because” isim alır',
    '“Because” tam cümleyle, “because of” isim grubuyla kullanılır.',
  ],
]);

facts(ENG, T_CONJ, 'bulk-li-birlestir', [
  [
    '“I was tired. I finished the report.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'Although I was tired, I finished the report.',
    'Although I was tired, I finished the report.|Although I was tired, but I finished the report.|However I was tired, I finished the report.|Because I was tired, I finished the report.',
    '“Although” yan cümle kurar ve ardından “but” gelmez; karşıtlık doğru biçimde verilir.',
  ],
  [
    '“It was raining. We stayed at home.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'It was raining, so we stayed at home.',
    'It was raining, so we stayed at home.|It was raining, because we stayed at home.|It was raining, although we stayed at home.|It was raining, however we stayed at home.',
    'Yağmur evde kalmanın nedenidir; sonuç bağlacı “so” doğru kullanımdır.',
  ],
  [
    '“She studied hard. She passed the exam.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'She studied hard; therefore, she passed the exam.',
    'She studied hard; therefore, she passed the exam.|She studied hard; however, she passed the exam.|She studied hard; although, she passed the exam.|She studied hard, because she passed the exam.',
    'Çalışma sınavı geçmenin nedenidir; “therefore” sonucu bildirir.',
  ],
  [
    '“The food was expensive. It was delicious.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'The food was expensive; however, it was delicious.',
    'The food was expensive; however, it was delicious.|The food was expensive; therefore, it was delicious.|The food was expensive, so it was delicious.|The food was expensive because it was delicious.',
    'Pahalılık ile lezzet arasında karşıtlık vardır; “however” doğru bağlaçtır.',
  ],
  [
    '“He was ill. He went to school.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'Although he was ill, he went to school.',
    'Although he was ill, he went to school.|Although he was ill, but he went to school.|However he was ill, he went to school.|Because he was ill, he went to school.',
    'Hastalığa karşın okula gitme karşıtlığı “Although” ile kurulur ve “but” eklenmez.',
  ],
  [
    '“The road was closed. We took another route.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'The road was closed, so we took another route.',
    'The road was closed, so we took another route.|The road was closed, because we took another route.|The road was closed, although we took another route.|The road was closed; however, we took another route.',
    'Yolun kapanması başka güzergâh seçilmesinin nedenidir; “so” sonucu verir.',
  ],
  [
    '“I called him twice. He did not answer.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'I called him twice; however, he did not answer.',
    'I called him twice; however, he did not answer.|I called him twice; therefore, he did not answer.|I called him twice, so he did not answer.|I called him twice because he did not answer.',
    'Arama ile cevap vermeme arasında karşıtlık bulunduğu için “however” gelir.',
  ],
  [
    '“She was late. She missed the first part.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'She was late; therefore, she missed the first part.',
    'She was late; therefore, she missed the first part.|She was late; however, she missed the first part.|She was late, although she missed the first part.|She was late because she missed the first part.',
    'Gecikme ilk bölümü kaçırmanın nedenidir; “therefore” sonucu bildirir.',
  ],
  [
    '“The test was easy. Many students failed.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'Although the test was easy, many students failed.',
    'Although the test was easy, many students failed.|Although the test was easy, but many students failed.|However the test was easy, many students failed.|Because the test was easy, many students failed.',
    'Kolaylığa karşın başarısızlık karşıtlık ilişkisidir; “Although” doğru bağlaçtır.',
  ],
  [
    '“He worked all night. He was exhausted.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'He worked all night; therefore, he was exhausted.',
    'He worked all night; therefore, he was exhausted.|He worked all night; however, he was exhausted.|He worked all night, although he was exhausted.|He worked all night because he was exhausted.',
    'Bütün gece çalışma bitkinliğin nedenidir; sonuç bağlacı “therefore” gelir.',
  ],
  [
    '“The price was high. We bought the car.” cümlelerini doğru birleştiren seçenek hangisidir?',
    'Although the price was high, we bought the car.',
    'Although the price was high, we bought the car.|Although the price was high, but we bought the car.|However the price was high, we bought the car.|Because the price was high, we bought the car.',
    'Yüksek fiyata karşın satın alma karşıtlığı “Although” ile anlatılır.',
  ],
]);

/* ---------------------------------------------------------------- */
/* İngilizce: Academic Vocabulary                                    */
/* ---------------------------------------------------------------- */

facts(ENG, T_ACAD, 'bulk-li-esanlam', [
  [
    'The word “essential” is closest in meaning to ___.',
    'necessary',
    'necessary|optional|rare|temporary',
    '“Essential” zorunlu ve gerekli anlamına gelir; en yakın karşılık “necessary”dir.',
  ],
  [
    'The word “significant” is closest in meaning to ___.',
    'important',
    'important|tiny|silent|ordinary',
    '“Significant” önemli ve kayda değer anlamındadır; karşılığı “important”dır.',
  ],
  [
    'The word “demonstrate” is closest in meaning to ___.',
    'show',
    'show|hide|refuse|delay',
    '“Demonstrate” göstermek anlamına gelir; en yakın karşılık “show”dur.',
  ],
  [
    'The word “obtain” is closest in meaning to ___.',
    'get',
    'get|lose|borrow|destroy',
    '“Obtain” elde etmek anlamındadır; karşılığı “get”tir.',
  ],
  [
    'The word “sufficient” is closest in meaning to ___.',
    'enough',
    'enough|little|empty|extra',
    '“Sufficient” yeterli anlamına gelir; en yakın karşılık “enough”tur.',
  ],
  [
    'The word “approximately” is closest in meaning to ___.',
    'about',
    'about|exactly|never|instead',
    '“Approximately” yaklaşık anlamındadır; karşılığı “about”tur.',
  ],
  [
    'The word “analyse” is closest in meaning to ___.',
    'examine',
    'examine|ignore|copy|hide',
    '“Analyse” ayrıntılı incelemek anlamına gelir; karşılığı “examine”dır.',
  ],
  [
    'The word “crucial” is closest in meaning to ___.',
    'vital',
    'vital|minor|slow|unclear',
    '“Crucial” çok önemli anlamındadır; en yakın karşılık “vital”dir.',
  ],
  [
    'The word “evidence” is closest in meaning to ___.',
    'proof',
    'proof|guess|opinion|rumour',
    '“Evidence” kanıt anlamına gelir; karşılığı “proof”tur.',
  ],
  [
    'The word “indicate” is closest in meaning to ___.',
    'suggest',
    'suggest|deny|forbid|remove',
    '“Indicate” göstermek ya da işaret etmek anlamındadır; karşılığı “suggest”tir.',
  ],
  [
    'The word “require” is closest in meaning to ___.',
    'need',
    'need|avoid|reduce|share',
    '“Require” gerektirmek anlamındadır; en yakın karşılık “need”dir.',
  ],
  [
    'The word “numerous” is closest in meaning to ___.',
    'many',
    'many|few|single|empty',
    '“Numerous” çok sayıda anlamına gelir; karşılığı “many”dir.',
  ],
  [
    'The word “reduce” is closest in meaning to ___.',
    'decrease',
    'decrease|increase|expand|repeat',
    '“Reduce” azaltmak anlamındadır; karşılığı “decrease”tir.',
  ],
  [
    'The word “method” is closest in meaning to ___.',
    'approach',
    'approach|result|error|opinion',
    '“Method” yöntem anlamına gelir; en yakın karşılık “approach”tur.',
  ],
  [
    'The word “consequence” is closest in meaning to ___.',
    'result',
    'result|cause|reason|purpose',
    '“Consequence” sonuç anlamındadır; karşılığı “result”tur.',
  ],
  [
    'The word “advantage” is closest in meaning to ___.',
    'benefit',
    'benefit|damage|danger|cost',
    '“Advantage” avantaj anlamına gelir; en yakın karşılık “benefit”tir.',
  ],
  [
    'The word “complex” is closest in meaning to ___.',
    'complicated',
    'complicated|simple|short|empty',
    '“Complex” karmaşık anlamındadır; karşılığı “complicated”dır.',
  ],
  [
    'The word “occur” is closest in meaning to ___.',
    'happen',
    'happen|prevent|delay|repeat',
    '“Occur” meydana gelmek anlamındadır; karşılığı “happen”dir.',
  ],
  [
    'The word “maintain” is closest in meaning to ___.',
    'keep',
    'keep|lose|break|change',
    '“Maintain” sürdürmek anlamına gelir; en yakın karşılık “keep”tir.',
  ],
  [
    'The word “reveal” is closest in meaning to ___.',
    'disclose',
    'disclose|conceal|cover|hide',
    '“Reveal” açığa çıkarmak anlamındadır; karşılığı “disclose”tur.',
  ],
  [
    'The word “determine” is closest in meaning to ___.',
    'decide',
    'decide|doubt|delay|deny',
    '“Determine” belirlemek anlamına gelir; en yakın karşılık “decide”dır.',
  ],
  [
    'The word “assist” is closest in meaning to ___.',
    'help',
    'help|prevent|ignore|refuse',
    '“Assist” yardım etmek anlamındadır; karşılığı “help”tir.',
  ],
  [
    'The word “purchase” is closest in meaning to ___.',
    'buy',
    'buy|sell|rent|return',
    '“Purchase” satın almak anlamına gelir; karşılığı “buy”dur.',
  ],
  [
    'The word “utilize” is closest in meaning to ___.',
    'use',
    'use|waste|hide|break',
    '“Utilize” kullanmak anlamındadır; en yakın karşılık “use”tur.',
  ],
]);

facts(ENG, T_ACAD, 'bulk-li-zit', [
  [
    'The opposite of “increase” is ___.',
    'decrease',
    'decrease|expand|raise|grow',
    '“Increase” artmak, karşıtı ise azalmak anlamındaki “decrease”tir.',
  ],
  [
    'The opposite of “accept” is ___.',
    'refuse',
    'refuse|receive|approve|allow',
    '“Accept” kabul etmek, karşıtı reddetmek anlamındaki “refuse”dur.',
  ],
  [
    'The opposite of “ancient” is ___.',
    'modern',
    'modern|historic|old|past',
    '“Ancient” antik ve çok eski, karşıtı ise “modern”dir.',
  ],
  [
    'The opposite of “temporary” is ___.',
    'permanent',
    'permanent|brief|short|recent',
    '“Temporary” geçici, karşıtı kalıcı anlamındaki “permanent”tır.',
  ],
  [
    'The opposite of “complex” is ___.',
    'simple',
    'simple|detailed|difficult|lengthy',
    '“Complex” karmaşık, karşıtı ise “simple”dır.',
  ],
  [
    'The opposite of “abundant” is ___.',
    'scarce',
    'scarce|plentiful|common|enough',
    '“Abundant” bol, karşıtı ise kıt anlamındaki “scarce”dir.',
  ],
  [
    'The opposite of “advantage” is ___.',
    'disadvantage',
    'disadvantage|benefit|profit|strength',
    '“Advantage” avantaj, karşıtı ise dezavantaj anlamındaki “disadvantage”tır.',
  ],
  [
    'The opposite of “major” is ___.',
    'minor',
    'minor|main|large|chief',
    '“Major” büyük ve önemli, karşıtı ise “minor”dır.',
  ],
  [
    'The opposite of “artificial” is ___.',
    'natural',
    'natural|plastic|modern|complex',
    '“Artificial” yapay, karşıtı ise doğal anlamındaki “natural”dır.',
  ],
  [
    'The opposite of “include” is ___.',
    'exclude',
    'exclude|contain|add|cover',
    '“Include” içermek, karşıtı ise dışlamak anlamındaki “exclude”dur.',
  ],
  [
    'The opposite of “possible” is ___.',
    'impossible',
    'impossible|probable|likely|certain',
    '“Possible” olası, karşıtı ise olanaksız anlamındaki “impossible”dır.',
  ],
  [
    'The opposite of “optimistic” is ___.',
    'pessimistic',
    'pessimistic|hopeful|positive|confident',
    '“Optimistic” iyimser, karşıtı ise kötümser anlamındaki “pessimistic”tir.',
  ],
]);

facts(ENG, T_ACAD, 'bulk-li-baglam', [
  [
    'The results were ___, so they supported the hypothesis.',
    'significant',
    'significant|silent|empty|minor',
    'Sonuçların hipotezi desteklemesi, anlamlı ve önemli olduklarını gösterir.',
  ],
  [
    'The team used a new ___ to collect the data.',
    'method',
    'method|result|error|opinion',
    'Veri toplamak için izlenen yol “method” sözcüğüyle ifade edilir.',
  ],
  [
    'There is not ___ evidence to prove the claim.',
    'sufficient',
    'sufficient|equal|similar|recent',
    'İddiayı kanıtlamak için yeterli kanıt gerektiğinden “sufficient” gelir.',
  ],
  [
    'The two groups showed ___ results.',
    'similar',
    'similar|absent|equal to|unable',
    'İki grubun sonuçlarının birbirine benzemesi “similar” ile anlatılır.',
  ],
  [
    'The report ___ that the population is growing.',
    'indicates',
    'indicates|refuses|prevents|reduces',
    'Rapor bir durumu işaret ettiği için “indicates” uygun düşer.',
  ],
  [
    'We need to ___ the data before drawing conclusions.',
    'analyse',
    'analyse|ignore|copy|hide',
    'Sonuç çıkarmadan önce verilerin incelenmesi gerekir.',
  ],
  [
    'The main ___ of the study is its small sample.',
    'limitation',
    'limitation|benefit|result|method',
    'Küçük örneklem çalışmanın sınırlılığı olduğu için “limitation” gelir.',
  ],
  [
    'The experiment was ___ three times.',
    'repeated',
    'repeated|reduced|refused|removed',
    'Deneyin üç kez yapılması “repeated” sözcüğüyle anlatılır.',
  ],
  [
    'The author ___ a clear conclusion at the end.',
    'reaches',
    'reaches|refuses|removes|reduces',
    'Metin sonunda bir sonuca varmak “reach a conclusion” kalıbıyla verilir.',
  ],
  [
    'The data ___ that the theory is correct.',
    'suggest',
    'suggest|refuse|prevent|remove',
    'Veriler bir sonucu işaret ettiği için “suggest” kullanılır.',
  ],
  [
    'The costs ___ by 20 percent last year.',
    'increased',
    'increased|decreased|remained|removed',
    'Maliyetlerin yüzde 20 artması “increased” ile anlatılır.',
  ],
  [
    'The study ___ the effect of light on plants.',
    'examines',
    'examines|ignores|refuses|removes',
    'Bir etkinin araştırılması “examines” fiiliyle ifade edilir.',
  ],
  [
    'Researchers must ___ their sources carefully.',
    'evaluate',
    'evaluate|ignore|copy|remove',
    'Kaynakların güvenilirliğini değerlendirmek için “evaluate” gerekir.',
  ],
  [
    'The findings are ___ with earlier research.',
    'consistent',
    'consistent|absent|unable|equal',
    'Bulguların önceki araştırmalarla uyumlu olması “consistent” ile anlatılır.',
  ],
  [
    'A ___ number of students took part in the survey.',
    'considerable',
    'considerable|tiny|empty|absent',
    'Katılımcı sayısının azımsanmayacak ölçüde olması “considerable” ile verilir.',
  ],
  [
    'The team will ___ the results next week.',
    'publish',
    'publish|prevent|refuse|remove',
    'Sonuçların yayımlanması “publish” fiiliyle anlatılır.',
  ],
]);

facts(ENG, T_ACAD, 'bulk-li-tanim', [
  [
    'Which word means “to examine something carefully”?',
    'analyse',
    'analyse|ignore|repeat|remove',
    'Bir şeyi ayrıntılı incelemek “analyse” fiilinin tanımıdır.',
  ],
  [
    'Which word means “important enough to be noticed”?',
    'significant',
    'significant|silent|temporary|empty',
    'Dikkat çekecek kadar önemli olan şey “significant” sıfatıyla anlatılır.',
  ],
  [
    'Which word means “as much as is needed”?',
    'sufficient',
    'sufficient|scarce|extra|empty',
    'Gerektiği kadar olan miktar “sufficient” ile ifade edilir.',
  ],
  [
    'Which word means “a way of doing something”?',
    'method',
    'method|result|error|opinion',
    'Bir işi yapma yolu “method” sözcüğünün tanımıdır.',
  ],
  [
    'Which word means “facts that prove something”?',
    'evidence',
    'evidence|opinion|rumour|guess',
    'Bir şeyi kanıtlayan olgular “evidence” olarak adlandırılır.',
  ],
  [
    'Which word means “a result of an action”?',
    'consequence',
    'consequence|cause|reason|purpose',
    'Bir eylemin ortaya çıkardığı sonuç “consequence”dır.',
  ],
  [
    'Which word means “a good effect or profit”?',
    'advantage',
    'advantage|damage|danger|cost',
    'Olumlu etki ya da kazanç “advantage” sözcüğüyle anlatılır.',
  ],
  [
    'Which word means “difficult to understand”?',
    'complex',
    'complex|simple|short|clear',
    'Anlaşılması zor olan şey “complex” sıfatıyla tanımlanır.',
  ],
  [
    'Which word means “to happen”?',
    'occur',
    'occur|prevent|delay|remove',
    'Bir olayın meydana gelmesi “occur” fiiliyle ifade edilir.',
  ],
  [
    'Which word means “to keep something at the same level”?',
    'maintain',
    'maintain|reduce|remove|refuse',
    'Bir şeyi aynı düzeyde tutmak “maintain” fiilinin anlamıdır.',
  ],
  [
    'Which word means “to make something known”?',
    'reveal',
    'reveal|conceal|hide|cover',
    'Bir şeyi açığa çıkarmak “reveal” fiiliyle anlatılır.',
  ],
  [
    'Which word means “to find out something for certain”?',
    'determine',
    'determine|doubt|delay|deny',
    'Kesin olarak belirlemek “determine” fiilinin anlamıdır.',
  ],
  [
    'Which word means “to help someone”?',
    'assist',
    'assist|prevent|refuse|ignore',
    'Birine yardım etmek “assist” fiiliyle ifade edilir.',
  ],
  [
    'Which word means “to judge the value of something”?',
    'evaluate',
    'evaluate|ignore|copy|remove',
    'Bir şeyin değerini yargılamak “evaluate” fiilinin tanımıdır.',
  ],
]);

export { questions };

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'Lise::Biyoloji': {
    [T_PROT]: topicIds[T_PROT] ?? [],
    [T_DNA]: topicIds[T_DNA] ?? [],
    [T_RESP]: topicIds[T_RESP] ?? [],
  },
  'Lise::Edebiyat': {
    [T_NARR]: topicIds[T_NARR] ?? [],
    [T_VOICE]: topicIds[T_VOICE] ?? [],
    [T_POEM]: topicIds[T_POEM] ?? [],
  },
  'Lise::Tarih': {
    [T_CHRON]: topicIds[T_CHRON] ?? [],
    [T_SOURCE]: topicIds[T_SOURCE] ?? [],
    [T_CAUSE]: topicIds[T_CAUSE] ?? [],
  },
  'Lise::İngilizce': {
    [T_COND]: topicIds[T_COND] ?? [],
    [T_CONJ]: topicIds[T_CONJ] ?? [],
    [T_ACAD]: topicIds[T_ACAD] ?? [],
  },
};
