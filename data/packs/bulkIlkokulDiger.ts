import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { QuestionDifficulty } from '@/data/embeddedQuestionPackV10';

let seed = 20261111;
function rnd() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
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

const LEVEL = 'İlkokul';
const HAYAT = 'Hayat Bilgisi';
const INGILIZCE = 'İngilizce';

const TOPIC_TRAFIK = 'Trafik Güvenliği';
const TOPIC_HIJYEN = 'Hijyen ve Sağlık';
const TOPIC_ACIL = 'Acil Durum ve Güvenlik';
const TOPIC_KELIME = 'Temel Kelimeler';
const TOPIC_SELAM = 'Selamlaşma';
const TOPIC_SINIF = 'Sınıf ve Günlük Yaşam';

const questions: EmbeddedQuestionSeed[] = [];
const topicIds: Record<string, string[]> = {};
const usedPrompts = new Set<string>();

const NAMES = [
  'Ali', 'Ayşe', 'Mehmet', 'Zeynep', 'Can', 'Elif', 'Burak', 'Selin',
  'Emre', 'Deniz', 'Mert', 'Ece', 'Kaan', 'Ada', 'Ozan', 'İpek',
  'Baran', 'Sude', 'Yusuf', 'Naz', 'Ege', 'Melis', 'Arda', 'Duru',
  'Tuna', 'Sena', 'Berk', 'İrem', 'Alp', 'Ceyda', 'Kerem', 'Nil',
  'Onur', 'Simge', 'Tolga', 'Yasemin', 'Ufuk', 'Gizem', 'Hakan', 'Pelin',
];

type Row = {
  prompt: string;
  answer: string;
  wrong: string[];
  why: string;
};

function emit(config: {
  prefix: string;
  courseName: string;
  topic: string;
  count: number;
  rows: Row[];
}) {
  const { prefix, courseName, topic, count, rows } = config;
  for (let index = 0; index < count; index += 1) {
    const row = rows[index % rows.length];
    const name = NAMES[index % NAMES.length];
    const prompt = row.prompt.replace(/\{name\}/g, name);
    const explanation = row.why.replace(/\{name\}/g, name);
    const id = `${prefix}-${index + 1}`;
    const key = `${prompt}|${row.answer}`;
    if (usedPrompts.has(key)) throw new Error(`Tekrar eden soru: ${id}`);
    usedPrompts.add(key);

    const slot = questions.length % 10;
    const difficulty: QuestionDifficulty = slot < 3 ? 'easy' : slot < 8 ? 'standard' : 'hard';

    questions.push(
      mc({
        id,
        levelName: LEVEL,
        courseName,
        prompt,
        answer: row.answer,
        distractors: row.wrong,
        explanation,
        difficulty,
      }),
    );
    topicIds[topic] = [...(topicIds[topic] ?? []), id];
  }
}

/* ---------------------------------------------------------------- */
/* Hayat Bilgisi · Trafik Güvenliği                                  */
/* ---------------------------------------------------------------- */

const TRAFIK_GECIS: Row[] = [
  {
    prompt: '{name} okula gitmek için trafiğin yoğun olduğu caddeyi geçmek zorunda. En güvenli davranış hangisidir?',
    answer: 'Yaya geçidini kullanmak',
    wrong: ['Araçların arasından koşarak geçmek', 'Yolun en dar yerinden geçmek', 'Kaldırımdan yola aniden atlamak'],
    why: 'Yaya geçidi, sürücülerin yayayı görmek için yavaşladığı alandır; {name} burada güvenle geçebilir.',
  },
  {
    prompt: '{name} parka giderken dört yol ağzına geldi. Karşıya geçmeden önce ne yapmalıdır?',
    answer: 'Yaya ışığının yeşil yanmasını beklemek',
    wrong: ['Kırmızı ışıkta hızlıca geçmek', 'Araçların arkasından dolanmak', 'Koşarak yolu bir çırpıda geçmek'],
    why: 'Yaya ışığı yeşil olmadan yola adım atmak, sürücünün yayayı görmesini zorlaştırır.',
  },
  {
    prompt: '{name} markete giden yolda üst geçit görüyor. Bu durumda nasıl davranmalıdır?',
    answer: 'Üst geçidi kullanmak',
    wrong: ['Korkulukları aşıp yola inmek', 'Araçların arasından geçmek', 'Yolun ortasında beklemek'],
    why: 'Üst geçit yayayı araç yolundan tamamen ayırır; en güvenli geçiş yolu budur.',
  },
  {
    prompt: '{name} hastaneye giderken alt geçit görüyor. Alt geçit varken ne yapmalıdır?',
    answer: 'Alt geçidi kullanmak',
    wrong: ['Yolun üstünden koşmak', 'Trafik polisi yoksa karşıdan geçmek', 'Araçların arkasına saklanmak'],
    why: 'Alt geçit yayayı trafikten ayırır; {name} buradan karşıya güvenle geçer.',
  },
  {
    prompt: '{name} okul çıkışında trafik polisi görüyor. Polis geçiş için işaret verdiğinde ne yapmalıdır?',
    answer: 'Polisin işaretine uyup yaya geçidinden geçmek',
    wrong: ['Polisi görmezden gelip koşmak', 'Araçların önünden geçmek', 'Yolun ortasında durmak'],
    why: 'Trafik polisi geçişi düzenler; verdiği işaret o an için en güvenli geçiş zamanını gösterir.',
  },
  {
    prompt: '{name} görüşü kapalı bir virajın kenarında karşıya geçmek istiyor. Ne yapmalıdır?',
    answer: 'Görüşü açık başka bir geçiş noktasına yürümek',
    wrong: ['Virajın tam ortasından geçmek', 'Ses dinleyip hızlıca geçmek', 'Araç gelene kadar bekleyip koşmak'],
    why: 'Virajda sürücü yayayı geç görür; görüşü kapalı yerden geçmek kaza riskini artırır.',
  },
  {
    prompt: '{name} yol kenarında park etmiş araçların arasından geçmeyi düşünüyor. Doğru davranış hangisidir?',
    answer: 'Araçların arasından geçmemek',
    wrong: ['Araçların arasından hızla geçmek', 'Araçların altına bakıp geçmek', 'Araçların tamponuna dokunarak geçmek'],
    why: 'Park hâlindeki araçlar yayayı gizler; sürücü {name} fark etmeden hareket edebilir.',
  },
  {
    prompt: '{name} kaldırımı olmayan bir köy yolunda yürüyor. Yolun hangi tarafından yürümelidir?',
    answer: 'Yola bakan taraftan, yani soldan yürümek',
    wrong: ['Yolun sağ tarafından yürümek', 'Yolun tam ortasından yürümek', 'Araçların arkasından yürümek'],
    why: 'Kaldırım yoksa yaya, gelen aracı görebilmek için yolun solundan yürür.',
  },
  {
    prompt: '{name} otobüsten indi ve karşıya geçecek. Otobüsün çevresinde nasıl davranmalıdır?',
    answer: 'Otobüs uzaklaştıktan sonra yaya geçidinden geçmek',
    wrong: ['Otobüsün önünden koşarak geçmek', 'Otobüsün arkasından dolanmak', 'Otobüsün yanından yola çıkmak'],
    why: 'Otobüs, çevresindeki yayayı ve yaklaşan aracı gizler; otobüsün geçmesini beklemek gerekir.',
  },
  {
    prompt: '{name} kavşakta dönüş yapan bir araç görüyor. Yaya geçidinde ne yapmalıdır?',
    answer: 'Sürücüyle göz teması kurup geçmesini beklemek',
    wrong: ['Aracın önüne adım atmak', 'Aracın arkasından koşmak', 'Sürücüye el sallayıp yola çıkmak'],
    why: 'Dönüş yapan sürücünün görüş alanı dardır; göz teması ve bekleme {name} için güvenli geçiş sağlar.',
  },
  {
    prompt: '{name} kışın hava karardıktan sonra eve dönüyor. Görünürlüğünü artırmak için ne yapmalıdır?',
    answer: 'Açık renk giysi giymek',
    wrong: ['Koyu renk giysi giymek', 'Yolun ortasından yürümek', 'Kulaklıkla müzik dinlemek'],
    why: 'Açık renk giysi, sürücünün {name} fark etmesini kolaylaştırır.',
  },
  {
    prompt: '{name} yağmurlu havada yolu geçecek. Bu havada nelere dikkat etmelidir?',
    answer: 'Araçların fren mesafesinin uzadığını düşünüp daha dikkatli geçmek',
    wrong: ['Şemsiyeyi önüne tutup hızlıca geçmek', 'Yolu koşarak geçmek', 'Işık kırmızıyken geçmek'],
    why: 'Islak yolda araç daha geç durur; {name} geçişi aceleye getirmemelidir.',
  },
  {
    prompt: '{name} okul servisinden indi. Servis henüz hareket etmedi. Ne yapmalıdır?',
    answer: 'Servisin hareket etmesini bekleyip yolun karşısına geçmek',
    wrong: ['Servisin önünden geçmek', 'Servisin arkasından koşmak', 'Servisin yanından yola atlamak'],
    why: 'Servis aracı çevresini kapatır; hareket etmeden geçmek sürücünün görüşünü engeller.',
  },
  {
    prompt: '{name} hemzemin geçitte bariyerin kapalı olduğunu görüyor. Ne yapmalıdır?',
    answer: 'Bariyer açılana kadar beklemek',
    wrong: ['Bariyerin altından geçmek', 'Rayların üzerinden koşmak', 'Bariyeri kaldırıp geçmek'],
    why: 'Bariyer trenin yaklaştığını gösterir; beklemeden geçmek hayati risk taşır.',
  },
  {
    prompt: '{name} bisikletle yaya geçidinden karşıya geçecek. Doğru davranış hangisidir?',
    answer: 'Bisikletten inip yaya olarak geçmek',
    wrong: ['Bisikletle hızla geçmek', 'Bisikletle araçların arasından geçmek', 'Bisikletle kaldırımdan atlamak'],
    why: 'Yaya geçidinde bisikletten inmek, {name} hızını azaltır ve sürücünün onu görmesini kolaylaştırır.',
  },
];

const TRAFIK_ISIK: Row[] = [
  {
    prompt: '{name} yaya ışığının kırmızı yandığını görüyor. Ne yapmalıdır?',
    answer: 'Kaldırımda beklemek',
    wrong: ['Yola adım atmak', 'Araçların arasından geçmek', 'Koşarak karşıya geçmek'],
    why: 'Kırmızı yaya ışığı geçişin yasak olduğunu bildirir; bekleme süresi kısa olsa da yola çıkılmaz.',
  },
  {
    prompt: '{name} yeşil yaya ışığında geçişe başladı, ışık yanıp sönmeye başladı. Ne yapmalıdır?',
    answer: 'Başladığı geçişi tamamlamak',
    wrong: ['Geri dönüp koşmak', 'Yolun ortasında durup beklemek', 'Araçların arasına girmek'],
    why: 'Yanıp sönen ışık sürenin azaldığını gösterir; {name} geçişi tamamlamalı, yeni geçişe başlamamalıdır.',
  },
  {
    prompt: '{name} yeşil ışıkta yola adım atmadan önce ne yapmalıdır?',
    answer: 'Sağdan ve soldan araç gelip gelmediğini kontrol etmek',
    wrong: ['Doğrudan koşmak', 'Gözlerini kapatmak', 'Arkadaşına bakmak'],
    why: 'Işık yeşil olsa da dönüş yapan araç olabilir; {name} yine de yolu kontrol etmelidir.',
  },
  {
    prompt: '{name} yaya ışığı olmayan bir geçitte karşıya geçecek. Ne yapmalıdır?',
    answer: 'Araç ışığını ve yolu kontrol edip yaya geçidini kullanmak',
    wrong: ['Araç ışığı kırmızıysa hemen koşmak', 'Yolun ortasında durmak', 'Kaldırımdan yola atlamak'],
    why: 'Yaya ışığı yoksa {name} trafiği kendisi kontrol etmeli ve yaya geçidini kullanmalıdır.',
  },
  {
    prompt: '{name} trafik ışığında sarı ışığın yandığını görüyor. Bu ışık ne anlama gelir?',
    answer: 'Hazırlan, geçiş için bekle',
    wrong: ['Hemen geç', 'Geri dön', 'Yol tamamen serbest'],
    why: 'Sarı ışık geçişin sona erdiğini ve hazırlanma zamanını bildirir.',
  },
  {
    prompt: '{name} yaya ışığının hiç yanmadığını fark ediyor. Ne yapmalıdır?',
    answer: 'En güvenli geçiş noktasını bulup trafiği kontrol etmek',
    wrong: ['Işık yanana kadar yolda beklemek', 'Yolun ortasından geçmek', 'Araçların arasından koşmak'],
    why: 'Arızalı ışıkta {name} kendi güvenliğini sağlamalı ve görüşü açık bir noktadan geçmelidir.',
  },
  {
    prompt: '{name} trafik polisinin kolunu kaldırdığını görüyor. Bu işaret ne anlama gelir?',
    answer: 'Dur, geçiş yapma',
    wrong: ['Hemen geç', 'Koşarak ilerle', 'Bisikletle geç'],
    why: 'Polisin kaldırdığı kol, o yöndeki trafiği durdurma işaretidir.',
  },
  {
    prompt: '{name} yaya geçidinde beklerken araçların durduğunu görüyor. Yine de ne yapmalıdır?',
    answer: 'Araçların tamamen durduğundan emin olmak',
    wrong: ['Gözü kapalı geçmek', 'Araçlara sırtını dönmek', 'Koşarak geçmek'],
    why: 'Sürücü her zaman yayayı görmez; {name} araçların durduğunu görerek geçmelidir.',
  },
  {
    prompt: '{name} okul çıkışında ışıklı okul geçidini kullanacak. Bu geçitte ne yapmalıdır?',
    answer: 'Işığın yayalar için yeşil olmasını beklemek',
    wrong: ['Işığa bakmadan geçmek', 'Araçların arasından geçmek', 'Yolun ortasında oynamak'],
    why: 'Işıklı okul geçidinde yaya ışığı yeşil olduğunda geçiş güvenlidir.',
  },
  {
    prompt: '{name} karşıya geçerken yolu yarıladı ve ışık değişti. En doğru davranış hangisidir?',
    answer: 'Adımlarını hızlandırıp geçişi tamamlamak',
    wrong: ['Geri dönüp koşmak', 'Yolun ortasında durup beklemek', 'Araçların arasına girmek'],
    why: 'Yolun ortasında durmak ya da geri dönmek sürücüyü şaşırtır; {name} geçişini tamamlamalıdır.',
  },
  {
    prompt: '{name} ışıklı kavşakta yaya ışığı yeşilken dönüş yapan bir araç görüyor. Ne yapmalıdır?',
    answer: 'Aracın geçmesini beklemek',
    wrong: ['Aracın önüne çıkmak', 'Aracın arkasından koşmak', 'Sürücüye bağırmak'],
    why: 'Dönüş yapan sürücü yayayı geç görebilir; {name} aracın geçmesini beklemelidir.',
  },
  {
    prompt: '{name} ışığın yeşil olduğunu görünce koşmaya başlıyor. Bu davranış neden sakıncalıdır?',
    answer: 'Koşmak düşme ve ani araç çıkma riskini artırır',
    wrong: ['Koşmak zaman kazandırır', 'Koşmak ışığı değiştirir', 'Koşmak yolu kısaltır'],
    why: 'Koşan yaya dengesini kaybedebilir ve {name} ani bir aracı fark etmeyebilir.',
  },
  {
    prompt: '{name} yaya ışığında geri sayım gördüğünü söylüyor. Bu geri sayım ne işe yarar?',
    answer: 'Geçiş için kalan süreyi gösterir',
    wrong: ['Araç sayısını gösterir', 'Hava sıcaklığını gösterir', 'Yolun uzunluğunu gösterir'],
    why: 'Geri sayım, yayanın geçişe başlayıp başlamayacağına karar vermesini sağlar.',
  },
];

const TRAFIK_ARAC: Row[] = [
  {
    prompt: '{name} babasının arabasına bindi. İlk yapması gereken nedir?',
    answer: 'Emniyet kemerini takmak',
    wrong: ['Camı tamamen açmak', 'Öne oturmak', 'Müzik açmak'],
    why: 'Emniyet kemeri ani frende {name} yaralanmasını önler.',
  },
  {
    prompt: '{name} on yaşında ve arabanın arka koltuğunda oturuyor. Neden arka koltukta oturmalıdır?',
    answer: 'Arka koltuk çocuklar için daha güvenlidir',
    wrong: ['Arka koltuk daha geniştir', 'Ön koltuk yasaktır', 'Arka koltukta kemer gerekmez'],
    why: 'Ön koltuktaki hava yastığı çocuklar için risk oluşturur; {name} arka koltukta daha güvenlidir.',
  },
  {
    prompt: '{name} okul servisinde ayakta durmak istiyor. Ne yapmalıdır?',
    answer: 'Koltuğa oturup kemerini takmak',
    wrong: ['Ayakta durup tutunmak', 'Koridorda yürümek', 'Kapıya yakın durmak'],
    why: 'Hareket hâlindeki serviste ayakta durmak düşme riskini artırır.',
  },
  {
    prompt: '{name} arabadan ineceği zaman kapıyı nasıl açmalıdır?',
    answer: 'Araç tamamen durduktan sonra, çevreyi kontrol ederek',
    wrong: ['Araç yavaşlarken açarak', 'Kapıyı hızla iterek', 'Geriye bakmadan'],
    why: 'Hareket hâlindeki araçtan inmek ve çevreyi kontrol etmemek tehlike yaratır.',
  },
  {
    prompt: '{name} bisiklete bineceği zaman ne takmalıdır?',
    answer: 'Kask takmak',
    wrong: ['Eldiven takmak', 'Güneş gözlüğü takmak', 'Şapka takmak'],
    why: 'Kask, düşme sırasında baş yaralanmasını önler.',
  },
  {
    prompt: '{name} bisikletini kullanmadan önce neyi kontrol etmelidir?',
    answer: 'Frenlerin ve lastiklerin çalıştığını',
    wrong: ['Zilin rengini', 'Sele örtüsünü', 'Gidon bandını'],
    why: 'Fren ve lastik kontrolü, {name} için güvenli sürüşün ilk adımıdır.',
  },
  {
    prompt: '{name} paten kayarken koruyucu ekipman kullanmak istemiyor. Neden kullanmalıdır?',
    answer: 'Düşmede diz ve dirsek yaralanmasını azaltır',
    wrong: ['Daha hızlı kaymak için', 'Daha şık görünmek için', 'Paten daha iyi dönsün diye'],
    why: 'Koruyucu ekipman, düşme anında darbe etkisini azaltır.',
  },
  {
    prompt: '{name} araba hareket ederken elini camdan çıkarıyor. Bu davranış neden tehlikelidir?',
    answer: 'Yakından geçen araç eline çarpabilir',
    wrong: ['Eli üşür', 'Sürücü kızar', 'Cam kırılır'],
    why: 'Araç hareket ederken dışarı uzatılan el, yakın geçen araçlar için ciddi risktir.',
  },
  {
    prompt: '{name} yolculuk sırasında sürücüyle sürekli konuşuyor. Bu davranışın sakıncası nedir?',
    answer: 'Sürücünün dikkatini dağıtır',
    wrong: ['Yolculuk uzar', 'Yakıt artar', 'Müzik durur'],
    why: 'Dikkati dağılan sürücü, {name} ve çevresi için risk oluşturur.',
  },
  {
    prompt: '{name} servis aracından inerken kapının önünde arkadaşları bekliyor. Ne yapmalıdır?',
    answer: 'Sırayla ve itişmeden inmek',
    wrong: ['Öne geçmek için koşmak', 'Kapıdan atlamak', 'Arkadaşlarını itmek'],
    why: 'İtişme, kapı önünde düşme ve sıkışma riskini artırır.',
  },
  {
    prompt: '{name} motosiklete binen ağabeyine kask takmadığını söylüyor. Kask neden gereklidir?',
    answer: 'Baş yaralanmasını önler',
    wrong: ['Saçı korur', 'Hava akımını artırır', 'Daha hızlı gitmeyi sağlar'],
    why: 'Kask, kaza anında baş ve yüz bölgesini koruyan en önemli ekipmandır.',
  },
  {
    prompt: '{name} araç koltuğundaki kemeri koltuğun altından geçiriyor. Bu kullanım neden yanlıştır?',
    answer: 'Kemer kaza anında koruma sağlamaz',
    wrong: ['Kemer daha rahat olur', 'Kemer daha uzun olur', 'Kemer rengi değişir'],
    why: 'Kemer doğru noktalardan geçmezse {name} ani frende tutulmaz.',
  },
  {
    prompt: '{name} okul servisine binerken sıraya giriyor. Servis gelmeden önce ne yapmalıdır?',
    answer: 'Kaldırımda, kapıdan uzakta beklemek',
    wrong: ['Yola doğru bir adım atmak', 'Servisin önünde durmak', 'Koşarak servise yetişmek'],
    why: 'Servis yaklaşırken yolda beklemek tehlikelidir; {name} kaldırımda beklemelidir.',
  },
];

const TRAFIK_YAYA: Row[] = [
  {
    prompt: '{name} kaldırımda yürüyor. Kaldırımda nasıl davranmalıdır?',
    answer: 'Kaldırımın ortasına yakın yürümek',
    wrong: ['Kaldırımın en kenarından yürümek', 'Yoldan yürümek', 'Koşarak yürümek'],
    why: 'Kaldırımın kenarına çok yakın yürümek, dengesini kaybeden {name} için risk oluşturur.',
  },
  {
    prompt: '{name} kaldırımda arkadaşlarıyla yürürken itişiyor. Bu davranışın sakıncası nedir?',
    answer: 'Yola düşme riski artar',
    wrong: ['Daha hızlı yürünür', 'Kaldırım genişler', 'Yol kısalır'],
    why: 'İtişme sırasında {name} dengesini kaybedip yola düşebilir.',
  },
  {
    prompt: '{name} topu yola kaçtığında arkasından koşmak istiyor. Ne yapmalıdır?',
    answer: 'Önce yolu kontrol edip yetişkinden yardım istemek',
    wrong: ['Hemen yola koşmak', 'Yolun ortasında durmak', 'Araçların arasına dalmak'],
    why: 'Topun peşinden kontrolsüz koşmak, {name} için en tehlikeli davranışlardan biridir.',
  },
  {
    prompt: '{name} yol kenarında arkadaşlarıyla oyun oynamak istiyor. Neden oynamamalıdır?',
    answer: 'Yol kenarı araç trafiğine ayrılmış alandır',
    wrong: ['Yol kenarı çok geniştir', 'Oyun alanı yasaktır', 'Yol kenarı serindir'],
    why: 'Yol kenarında oynayan {name} bir anda kendini aracın önünde bulabilir.',
  },
  {
    prompt: '{name} yolda yürürken kulaklıkla müzik dinliyor. Bu davranış neden sakıncalıdır?',
    answer: 'Korna ve araç sesini duyamaz',
    wrong: ['Müzik bozulur', 'Yürüme hızı artar', 'Kulaklık kırılır'],
    why: 'Kulaklık, {name} çevresindeki uyarı seslerini duymasını engeller.',
  },
  {
    prompt: '{name} telefona bakarak kaldırımda yürüyor. Bu davranışın riski nedir?',
    answer: 'Önündeki engelleri fark etmez',
    wrong: ['Pil çabuk biter', 'Yol uzar', 'Adımları sayar'],
    why: 'Ekrana bakan {name} kaldırımdaki çukur ya da direği göremez.',
  },
  {
    prompt: '{name} yaşlı bir komşusunu karşıdan karşıya geçiriyor. Nasıl yardım etmelidir?',
    answer: 'Koluna girip yavaşça ve güvenli noktadan geçirmek',
    wrong: ['Hızlı yürümesini söylemek', 'Yalnız bırakıp gitmek', 'Yolu koşarak geçirmek'],
    why: 'Yaşlı kişinin dengesi ve görüşü sınırlı olabilir; {name} yavaş ve güvenli geçiş sağlamalıdır.',
  },
  {
    prompt: '{name} okul çıkışında servislerin arasında oynuyor. Neden oynamamalıdır?',
    answer: 'Servis hareket ederse görünmez ve çarpılabilir',
    wrong: ['Servisler kirlenir', 'Oyun alanı dardır', 'Servis şoförü kızar'],
    why: 'Servislerin arasında kalan {name}, sürücünün görüş alanına girmez.',
  },
  {
    prompt: '{name} kaldırımda bisiklet sürmek istiyor. Neden sürmemelidir?',
    answer: 'Kaldırım yayalara aittir, çarpma riski vardır',
    wrong: ['Bisiklet yavaş gider', 'Kaldırım dardır', 'Bisiklet kirlenir'],
    why: 'Kaldırımda hızla giden bisiklet, yayalar ve {name} için tehlike oluşturur.',
  },
  {
    prompt: '{name} kaldırımda yürürken aniden duran birine çarpıyor. Ne yapmalıdır?',
    answer: 'Özür dileyip dikkatli yürümeye devam etmek',
    wrong: ['Karşı tarafı suçlamak', 'Koşarak uzaklaşmak', 'Yola doğru itmek'],
    why: 'Kibarca özür dilemek ve dikkatli yürümek, {name} çevresindekilerle güvenli paylaşım sağlar.',
  },
];

const TRAFIK_LEVHA: Row[] = [
  {
    prompt: '{name} yaya geçidi levhasını görüyor. Bu levha ne anlatır?',
    answer: 'Burada yaya geçidi olduğunu',
    wrong: ['Burada park yasağı olduğunu', 'Burada okul olduğunu', 'Burada bisiklet yolu olduğunu'],
    why: 'Mavi zeminli yaya geçidi levhası, sürücüye yaya geçidini bildirir.',
  },
  {
    prompt: '{name} okul geçidi levhasını görüyor. Sürücü bu levhayı görünce ne yapmalıdır?',
    answer: 'Yavaşlayıp yayaya yol vermek',
    wrong: ['Hızlanmak', 'Korna çalmak', 'Şerit değiştirmek'],
    why: 'Okul geçidi levhası çevrede çocuk olabileceğini bildirir; sürücü yavaşlar.',
  },
  {
    prompt: '{name} sekizgen kırmızı DUR levhasını görüyor. Bu levha ne ister?',
    answer: 'Aracın tamamen durmasını',
    wrong: ['Yavaşça geçmesini', 'Hızlanmasını', 'Park etmesini'],
    why: 'DUR levhası, sürücünün tam durup yolu kontrol etmesini zorunlu kılar.',
  },
  {
    prompt: '{name} mavi bisiklet levhasını görüyor. Bu levha neyi gösterir?',
    answer: 'Bisiklet yolunu',
    wrong: ['Yaya yolunu', 'Araç park yerini', 'Okul bahçesini'],
    why: 'Bisiklet sembollü mavi levha, bisikletlere ayrılmış yolu gösterir.',
  },
  {
    prompt: '{name} yaya giremez levhasını görüyor. Bu levha kime yöneliktir?',
    answer: 'Yayalara',
    wrong: ['Bisikletlere', 'Otobüslere', 'Kamyonlara'],
    why: 'Yaya giremez levhası, yayaların o yola girmemesi gerektiğini belirtir.',
  },
  {
    prompt: '{name} kırmızı çerçeveli üçgen bir levha görüyor. Bu levhalar ne tür bilgi verir?',
    answer: 'Tehlikeye karşı uyarı',
    wrong: ['Yasak', 'Zorunluluk', 'Park yeri'],
    why: 'Üçgen levhalar uyarı levhalarıdır; sürücüyü yaklaşan tehlikeye karşı uyarır.',
  },
  {
    prompt: '{name} mavi kare P levhasını görüyor. Bu levha neyi gösterir?',
    answer: 'Park yerini',
    wrong: ['Polis noktasını', 'Postaneyi', 'Piknik alanını'],
    why: 'P harfi park anlamına gelir; mavi kare levha park yerini gösterir.',
  },
  {
    prompt: '{name} hastane yakınındaki levhayı görüyor. Bu levha sürücüden ne ister?',
    answer: 'Gereksiz korna çalmamasını',
    wrong: ['Hızlanmasını', 'Yol değiştirmesini', 'Araçtan inmesini'],
    why: 'Hastane çevresinde gürültü hastaları rahatsız eder; korna çalınmaz.',
  },
  {
    prompt: '{name} ışıklı işaret cihazının yanıp söndüğünü görüyor. Ne yapmalıdır?',
    answer: 'Yavaşlayıp yolu kontrol etmek',
    wrong: ['Hızlanmak', 'Geri dönmek', 'Korna çalmak'],
    why: 'Yanıp sönen ışıklı cihaz, dikkatli olunması gerektiğini bildirir.',
  },
];

/* ---------------------------------------------------------------- */
/* Hayat Bilgisi · Hijyen ve Sağlık                                  */
/* ---------------------------------------------------------------- */

const HIJYEN_EL: Row[] = [
  {
    prompt: '{name} yemek yemeden hemen önce ne yapmalıdır?',
    answer: 'Ellerini sabunla yıkamak',
    wrong: ['Ellerini üflemek', 'Ellerini elbisesine silmek', 'Ellerini sadece ıslatmak'],
    why: 'Ellerdeki mikroplar yemekle birlikte vücuda girer; sabunlu yıkama bunu engeller.',
  },
  {
    prompt: '{name} tuvaletten çıktıktan sonra ne yapmalıdır?',
    answer: 'Ellerini sabunla iyice yıkamak',
    wrong: ['Ellerini suyla ıslatmak', 'Ellerini hiç kurulamamak', 'Ellerine kolonya sürmek'],
    why: 'Tuvalet sonrası ellerde bakteri kalır; sabunlu yıkama temizliği sağlar.',
  },
  {
    prompt: '{name} bahçede top oynadıktan sonra içeri giriyor. İlk işi ne olmalıdır?',
    answer: 'Ellerini yıkamak',
    wrong: ['Doğruca sofraya oturmak', 'Elbisesini değiştirmek', 'Su içmek'],
    why: 'Dışarıda oynarken eller toz ve mikrop toplar; {name} önce ellerini yıkamalıdır.',
  },
  {
    prompt: '{name} hapşırdıktan sonra ellerini ne yapmalıdır?',
    answer: 'Sabunla yıkamak',
    wrong: ['Pantolonuna silmek', 'Yüzüne sürmek', 'Sadece sallamak'],
    why: 'Hapşırıkla ellerde kalan damlacıklar mikrop taşır; yıkama bunu temizler.',
  },
  {
    prompt: '{name} sokakta bir kedi sevdi. Eve gelince ne yapmalıdır?',
    answer: 'Ellerini sabunla yıkamak',
    wrong: ['Yüzüne dokunmak', 'Ellerini sallamak', 'Kediye tekrar dokunmak'],
    why: 'Hayvanların tüyü ve tükürüğü mikrop taşıyabilir; {name} ellerini yıkamalıdır.',
  },
  {
    prompt: '{name} çöp kutusuna çöp attı. Sonra ne yapmalıdır?',
    answer: 'Ellerini yıkamak',
    wrong: ['Yüzünü yıkamak', 'Ellerini silkelemek', 'Çöpü tekrar açmak'],
    why: 'Çöp kutusu mikrop barındırır; {name} attıktan sonra ellerini yıkamalıdır.',
  },
  {
    prompt: '{name} okuldan eve gelince ilk ne yapmalıdır?',
    answer: 'Ellerini sabunla yıkamak',
    wrong: ['Televizyonu açmak', 'Ödevini yapmak', 'Oyuncaklarını çıkarmak'],
    why: 'Okulda birçok yüzeye dokunan {name}, eve gelince ellerini yıkamalıdır.',
  },
  {
    prompt: '{name} ellerini ne kadar süre ovmalıdır?',
    answer: 'Yaklaşık yirmi saniye',
    wrong: ['İki saniye', 'Beş saniye', 'Yalnızca su altında tutmak'],
    why: 'Sabunun mikropları uzaklaştırması için ellerin en az yirmi saniye ovulması gerekir.',
  },
  {
    prompt: '{name} ellerini yıkarken ne kullanmalıdır?',
    answer: 'Sabun ve su',
    wrong: ['Sadece su', 'Sadece havlu', 'Sadece kolonya'],
    why: 'Sabun, yağ ve kiri çözerek mikropların ellerden uzaklaşmasını sağlar.',
  },
  {
    prompt: '{name} ellerini yıkarken en çok hangi bölgeyi ovmalıdır?',
    answer: 'Parmak aralarını ve tırnak altlarını',
    wrong: ['Sadece avuç içini', 'Sadece bileğini', 'Sadece parmak uçlarını'],
    why: 'Parmak araları ve tırnak altı, mikropların en çok biriktiği bölgelerdir.',
  },
  {
    prompt: '{name} ellerini yıkadıktan sonra ne yapmalıdır?',
    answer: 'Temiz havluyla kurulamak',
    wrong: ['Islak bırakmak', 'Elbisesine silmek', 'Sallayıp kurutmadan çıkmak'],
    why: 'Islak eller yeniden mikrop toplar; kurulama temizliği tamamlar.',
  },
  {
    prompt: '{name} sabunla ellerini ovarken musluğu açık bırakıyor. Bunun sakıncası nedir?',
    answer: 'Gereksiz su tüketilir',
    wrong: ['Sabun köpürmez', 'Eller kirlenir', 'Su ısınmaz'],
    why: 'Su kaynağı sınırlıdır; {name} sabunlarken musluğu kapatarak suyu korur.',
  },
  {
    prompt: '{name} hasta olan kardeşini ziyaret ettikten sonra ne yapmalıdır?',
    answer: 'Ellerini yıkamak',
    wrong: ['Yüzüne dokunmak', 'Kardeşinin yatağına oturmak', 'Odadan çıkmamak'],
    why: 'Hasta kişiyle temastan sonra yıkama, mikropların {name} ve başkalarına geçmesini azaltır.',
  },
  {
    prompt: '{name} yemek hazırlarken annesine yardım edecek. Önce ne yapmalıdır?',
    answer: 'Ellerini yıkamak',
    wrong: ['Önlük takmak', 'Saçını taramak', 'Bulaşık yıkamak'],
    why: 'Yemeğe dokunmadan önce el temizliği, besinlerin mikrop kapmasını önler.',
  },
  {
    prompt: '{name} elleri çatladığı için sabun kullanmak istemiyor. Ne yapmalıdır?',
    answer: 'Ilık su ve nemlendirici kullanarak yıkamaya devam etmek',
    wrong: ['Ellerini hiç yıkamamak', 'Sadece su kullanmak', 'Ellerini sürekli ıslatmak'],
    why: 'Ilık su ve nemlendirici, deriyi korurken el temizliğini sürdürmeyi sağlar.',
  },
];

const HIJYEN_BAKIM: Row[] = [
  {
    prompt: '{name} günde kaç kez dişlerini fırçalamalıdır?',
    answer: 'En az iki kez',
    wrong: ['Haftada bir kez', 'Ayda bir kez', 'Yalnızca tatlı yedikten sonra'],
    why: 'Diş sağlığı için sabah ve akşam olmak üzere günde en az iki kez fırçalama önerilir.',
  },
  {
    prompt: '{name} dişlerini ne kadar süre fırçalamalıdır?',
    answer: 'Yaklaşık iki dakika',
    wrong: ['On saniye', 'Yarım saat', 'Bir saniye'],
    why: 'İki dakikalık fırçalama, diş yüzeylerinin tamamının temizlenmesini sağlar.',
  },
  {
    prompt: '{name} diş hekimine ne sıklıkla kontrol için gitmelidir?',
    answer: 'Altı ayda bir',
    wrong: ['On yılda bir', 'Her gün', 'Yalnızca ağrı olunca'],
    why: 'Düzenli kontrol, diş çürüğünün erken fark edilmesini sağlar.',
  },
  {
    prompt: '{name} banyodan sonra ne yapmalıdır?',
    answer: 'Temiz havluyla kurulanmak',
    wrong: ['Islak giyinmek', 'Koşarak çıkmak', 'Havluyu yere atmak'],
    why: 'Kurulanmadan giyinmek, {name} üşütmesine ve cilt sorunlarına yol açabilir.',
  },
  {
    prompt: '{name} tırnakları uzadığında ne yapmalıdır?',
    answer: 'Düzenli olarak kesmek',
    wrong: ['Dişlemek', 'Uzatmaya devam etmek', 'Boya sürmek'],
    why: 'Uzun tırnaklarda kir birikir; düzenli kesim el temizliğini korur.',
  },
  {
    prompt: '{name} her gün aynı çorabı giymek istiyor. Neden değiştirmelidir?',
    answer: 'Terli çorap ayak sağlığını bozar',
    wrong: ['Çorap rengi solar', 'Çorap daralır', 'Çorap kaybolur'],
    why: 'Terli çorap nem ve bakteri oluşturur; {name} çorabını her gün değiştirmelidir.',
  },
  {
    prompt: '{name} saçları uzadığında ne yapmalıdır?',
    answer: 'Düzenli olarak yıkayıp taramak',
    wrong: ['Hiç dokunmamak', 'Sadece ıslatmak', 'Kesmeden bırakmak'],
    why: 'Düzenli yıkama ve tarama saç derisinin sağlıklı kalmasını sağlar.',
  },
  {
    prompt: '{name} spor yaptıktan sonra terli kıyafetiyle kalıyor. Bu neden sakıncalıdır?',
    answer: 'Terli kıyafet ciltte mikrop üretir',
    wrong: ['Kıyafet daralır', 'Kıyafet rengi değişir', 'Kıyafet ağırlaşır'],
    why: 'Terli kıyafet nemi tutar; {name} duş alıp temiz kıyafet giymelidir.',
  },
  {
    prompt: '{name} hapşırırken ne yapmalıdır?',
    answer: 'Dirseğiyle ağzını ve burnunu kapatmak',
    wrong: ['Ağzını açık bırakmak', 'Elleriyle yüzüne dokunmak', 'Arkadaşına doğru hapşırmak'],
    why: 'Dirsekle kapatmak, mikropların ellere ve çevreye yayılmasını azaltır.',
  },
  {
    prompt: '{name} hasta olduğunda hangi kişisel eşyasını başkasıyla paylaşmamalıdır?',
    answer: 'Diş fırçasını',
    wrong: ['Kalemini', 'Silgisini', 'Defterini'],
    why: 'Diş fırçası ağız yoluyla mikrop taşır; paylaşmak hastalığı bulaştırır.',
  },
  {
    prompt: '{name} tuvalete girerken ne yapmalıdır?',
    answer: 'Tuvalet kâğıdı ve sabunun olup olmadığını kontrol etmek',
    wrong: ['Kapıyı açık bırakmak', 'Ellerini yıkamadan girmek', 'Aynaya bakmak'],
    why: 'Önceden hazırlık, {name} temizlik alışkanlığını sürdürmesini sağlar.',
  },
  {
    prompt: '{name} yazın güneşe çıkarken ne yapmalıdır?',
    answer: 'Şapka takıp gölgede dinlenmek',
    wrong: ['Kalın kazak giymek', 'Öğlen güneşinde uzun süre kalmak', 'Su içmemek'],
    why: 'Şapka ve gölge, {name} güneş çarpmasından korur.',
  },
  {
    prompt: '{name} kulağını temizlemek için pamuklu çubuk sokmak istiyor. Neden sakıncalıdır?',
    answer: 'Kulak zarına zarar verebilir',
    wrong: ['Kulağı temizler', 'Duymayı artırır', 'Kulağı serinletir'],
    why: 'Kulak kanalına sokulan cisim zarı zedeleyebilir; {name} yalnızca dış kısmı silmelidir.',
  },
  {
    prompt: '{name} mendilini bir kez kullanıp cebine koyuyor. Doğru davranış nedir?',
    answer: 'Kullandığı mendili çöpe atmak',
    wrong: ['Mendili tekrar kullanmak', 'Mendili arkadaşına vermek', 'Mendili yatağa koymak'],
    why: 'Kullanılmış mendil mikrop taşır; {name} onu hemen çöpe atmalıdır.',
  },
  {
    prompt: '{name} banyo yapmadan önce neye dikkat etmelidir?',
    answer: 'Suyun sıcaklığını eliyle kontrol etmek',
    wrong: ['Suyu en sıcak ayara almak', 'Kapıyı açık bırakmak', 'Sabunu kullanmamak'],
    why: 'Sıcaklık kontrolü, {name} yanmasını önler.',
  },
];

const HIJYEN_BESIN: Row[] = [
  {
    prompt: '{name} sabah okula gitmeden önce ne yapmalıdır?',
    answer: 'Kahvaltı yapmak',
    wrong: ['Hiçbir şey yememek', 'Sadece şeker yemek', 'Sadece su içmek'],
    why: 'Kahvaltı, {name} gün boyu derslerde dikkatli olması için gerekli enerjiyi sağlar.',
  },
  {
    prompt: '{name} ara öğünde hangisini seçmelidir?',
    answer: 'Mevsim meyvesi',
    wrong: ['Cips', 'Çikolata', 'Gazlı içecek'],
    why: 'Meyve vitamin ve lif içerir; paketli atıştırmalıklar şeker ve tuz bakımından yüksektir.',
  },
  {
    prompt: '{name} susadığında hangisini içmelidir?',
    answer: 'Su',
    wrong: ['Gazlı içecek', 'Şekerli meyve suyu', 'Enerji içeceği'],
    why: 'Su, vücudun sıvı ihtiyacını şekersiz karşılayan en uygun içecektir.',
  },
  {
    prompt: '{name} her gün abur cubur yemek istiyor. Bu neden uygun değildir?',
    answer: 'Aşırı şeker ve tuz içerir',
    wrong: ['Çok ucuzdur', 'Çok renklidir', 'Çok küçüktür'],
    why: 'Abur cubur {name} için gerekli besinleri sağlamaz; aşırı tüketimi sağlığı bozar.',
  },
  {
    prompt: '{name} kahvaltıda süt yerine gazlı içecek içiyor. Daha iyi seçim hangisidir?',
    answer: 'Süt',
    wrong: ['Enerji içeceği', 'Şekerli çay', 'Limonata'],
    why: 'Süt, kemik gelişimi için gerekli kalsiyumu sağlar.',
  },
  {
    prompt: '{name} öğle yemeğini atlayıp akşam çok yemek istiyor. Neden öğün atlamamalıdır?',
    answer: 'Öğün atlamak düzensiz beslenmeye yol açar',
    wrong: ['Öğün atlamak zaman kazandırır', 'Öğün atlamak kilo aldırır', 'Öğün atlamak uyku getirir'],
    why: 'Düzenli öğünler, {name} enerjisinin gün boyu dengeli kalmasını sağlar.',
  },
  {
    prompt: '{name} tabağına yalnızca makarna alıyor. Tabağını nasıl dengelemelidir?',
    answer: 'Sebze ve protein eklemek',
    wrong: ['Daha fazla makarna almak', 'Tabağı boş bırakmak', 'Yalnızca ekmek almak'],
    why: 'Dengeli tabak, farklı besin gruplarından yeterli miktarda içerir.',
  },
  {
    prompt: '{name} günde kaç öğün düzenli yemek yemelidir?',
    answer: 'Üç ana öğün ve ara öğünler',
    wrong: ['Yalnızca bir öğün', 'Beş ana öğün', 'Yalnızca akşam'],
    why: 'Düzenli öğünler, {name} büyüme ve gelişimi için gerekli enerjiyi sağlar.',
  },
  {
    prompt: '{name} yemeklerine çok tuz ekliyor. Bunun sakıncası nedir?',
    answer: 'Aşırı tuz sağlığa zarar verir',
    wrong: ['Yemek daha hızlı pişer', 'Yemek daha renkli olur', 'Yemek daha az doyurur'],
    why: 'Aşırı tuz tüketimi ileride sağlık sorunlarına yol açar; {name} az tuz kullanmalıdır.',
  },
  {
    prompt: '{name} paketli bir ürün alırken neye bakmalıdır?',
    answer: 'Son kullanma tarihine',
    wrong: ['Ambalajın rengine', 'Rafın yüksekliğine', 'Fişin uzunluğuna'],
    why: 'Son kullanma tarihi geçmiş ürün, {name} için sağlık riski taşır.',
  },
  {
    prompt: '{name} kışın çilek yerine hangi meyveyi seçmelidir?',
    answer: 'Mevsiminde olan portakalı',
    wrong: ['Dondurulmuş pastayı', 'Şekerli meyve suyunu', 'Şuruplu konserveyi'],
    why: 'Mevsim meyvesi daha taze ve daha besleyicidir.',
  },
  {
    prompt: '{name} kahvaltıda beyaz ekmek yerine ne seçebilir?',
    answer: 'Tam buğday ekmeği',
    wrong: ['Kraker', 'Bisküvi', 'Simit'],
    why: 'Tam buğday ekmeği daha fazla lif içerir ve daha uzun süre tokluk sağlar.',
  },
  {
    prompt: '{name} bir avuçtan fazla kuru yemiş yiyor. Ne yapmalıdır?',
    answer: 'Porsiyonu bir avuçla sınırlamak',
    wrong: ['Tamamını bitirmek', 'Hiç yememek', 'Sadece tuzlu olanı seçmek'],
    why: 'Kuru yemiş besleyici ama enerjisi yüksektir; porsiyon kontrolü gerekir.',
  },
  {
    prompt: '{name} yemeğini çok hızlı yiyor. Bu neden sakıncalıdır?',
    answer: 'Fazla yemeye ve sindirim sorununa yol açar',
    wrong: ['Yemek soğur', 'Tabak kirlenir', 'Yemek uzar'],
    why: 'Yavaş yemek, {name} tokluk hissini zamanında fark etmesini sağlar.',
  },
  {
    prompt: '{name} gün içinde yeterince su içmediğini fark ediyor. Ne yapmalıdır?',
    answer: 'Yanında su bulundurup düzenli içmek',
    wrong: ['Yalnızca yemekte içmek', 'Susamayı beklemek', 'Sadece çay içmek'],
    why: 'Susama hissi geç ortaya çıkar; {name} düzenli su içmelidir.',
  },
];

const HIJYEN_YASAM: Row[] = [
  {
    prompt: '{name} dokuz yaşında ve her sabah erken kalkıyor. Kaç saat uyumalıdır?',
    answer: 'Yaklaşık dokuz-on bir saat',
    wrong: ['Dört-beş saat', 'On dört saat', 'İki-üç saat'],
    why: 'Bu yaştaki çocukların büyüme ve öğrenme için dokuz-on bir saat uykuya ihtiyacı vardır.',
  },
  {
    prompt: '{name} her gece farklı saatte yatıyor. Bunun sakıncası nedir?',
    answer: 'Uyku düzeni bozulur',
    wrong: ['Oda büyür', 'Yatak değişir', 'Sabah erken olur'],
    why: 'Her gün aynı saatte yatmak, {name} uykuya dalmasını kolaylaştırır.',
  },
  {
    prompt: '{name} yatmadan hemen önce tabletle oyun oynuyor. Bu neden uygun değildir?',
    answer: 'Ekran ışığı uykuya dalmayı zorlaştırır',
    wrong: ['Tablet ısınır', 'Oyun uzun sürer', 'Pil biter'],
    why: 'Ekran ışığı uyku düzenini etkiler; {name} yatmadan önce ekranı bırakmalıdır.',
  },
  {
    prompt: '{name} boş zamanında açık havada oynamak istiyor. Bu neden yararlıdır?',
    answer: 'Hareket etmek kasları ve kemikleri güçlendirir',
    wrong: ['Ödev yerine geçer', 'Uykuyu azaltır', 'Yemek yemeyi önler'],
    why: 'Açık hava oyunu, {name} için hem hareket hem de güneş ışığı sağlar.',
  },
  {
    prompt: '{name} günde ne kadar hareket etmelidir?',
    answer: 'En az bir saat',
    wrong: ['Beş dakika', 'On dakika', 'Hiç hareket etmemeli'],
    why: 'Günde en az bir saat hareket, çocukların sağlıklı gelişimi için önerilir.',
  },
  {
    prompt: '{name} ders çalışırken saatlerce ekrana bakıyor. Ne yapmalıdır?',
    answer: 'Yirmi dakikada bir gözlerini dinlendirmek',
    wrong: ['Ekranı yaklaştırmak', 'Işıkları kapatmak', 'Gözlerini ovmak'],
    why: 'Kısa molalar, {name} göz yorgunluğunu azaltır.',
  },
  {
    prompt: '{name} masada eğilerek yazı yazıyor. Bu duruşun sakıncası nedir?',
    answer: 'Sırt ve boyun ağrısına yol açar',
    wrong: ['Yazı hızlanır', 'Kalem kayar', 'Defter büyür'],
    why: 'Dik oturmak, {name} omurga sağlığını korur.',
  },
  {
    prompt: '{name} sırt çantasını tek omzunda taşıyor. Neden iki omuzda taşımalıdır?',
    answer: 'Yük dengeli dağılır',
    wrong: ['Çanta hafifler', 'Çanta renk değiştirir', 'Çanta büyür'],
    why: 'Tek omuzda taşınan ağır çanta, omurgada eğriliğe yol açabilir.',
  },
  {
    prompt: '{name} uzun süre oturduğunda ne yapmalıdır?',
    answer: 'Kalkıp kısa süre hareket etmek',
    wrong: ['Daha çok oturmak', 'Uyumak', 'Yemek yemek'],
    why: 'Ara ara hareket etmek kan dolaşımını düzenler.',
  },
  {
    prompt: '{name} asansör yerine merdiveni kullanmayı seçiyor. Bu davranış neden yararlıdır?',
    answer: 'Kalp ve kasları çalıştırır',
    wrong: ['Zaman kaybettirir', 'Yorar ve zarar verir', 'Ayakkabıyı eskitir'],
    why: 'Merdiven çıkmak günlük harekete katkı sağlar.',
  },
  {
    prompt: '{name} hastalandığında okula gitmek istiyor. Ne yapmalıdır?',
    answer: 'Dinlenip iyileşmeyi beklemek',
    wrong: ['Koşarak okula gitmek', 'İlaç içip spor yapmak', 'Su içmemek'],
    why: 'Dinlenme, {name} bağışıklığının toparlanmasını ve hastalığın yayılmamasını sağlar.',
  },
  {
    prompt: '{name} spor yaparken su içmeyi unutuyor. Ne yapmalıdır?',
    answer: 'Ara ara su içmek',
    wrong: ['Hiç su içmemek', 'Sadece spor sonunda içmek', 'Gazlı içecek içmek'],
    why: 'Terle kaybedilen sıvı, {name} spor sırasında düzenli su içmesiyle yerine konur.',
  },
  {
    prompt: '{name} akşam yemeğinden sonra hemen yatağa giriyor. Ne yapmalıdır?',
    answer: 'Yatmadan önce kısa bir süre beklemek',
    wrong: ['Hemen uyumak', 'Koşu yapmak', 'Tatlı yemek'],
    why: 'Yemekten hemen sonra yatmak sindirimi zorlaştırır.',
  },
];

/* ---------------------------------------------------------------- */
/* Hayat Bilgisi · Acil Durum ve Güvenlik                            */
/* ---------------------------------------------------------------- */

const ACIL_ARAMA: Row[] = [
  {
    prompt: '{name} evde bir yangın çıktığını görüyor. Kime haber vermelidir?',
    answer: '112 acil çağrı merkezini arayıp yetişkine haber vermek',
    wrong: ['Arkadaşına mesaj atmak', 'Sosyal medyada paylaşmak', 'Kimseye söylememek'],
    why: '112, yangın ve sağlık gibi acil durumlarda yardımı en hızlı yönlendiren numaradır.',
  },
  {
    prompt: '{name} sokakta baygın birini görüyor. Ne yapmalıdır?',
    answer: '112’yi arayıp yerini bildirmek',
    wrong: ['Fotoğraf çekmek', 'Yalnız başına taşımak', 'Görmezden gelmek'],
    why: 'Acil çağrı, sağlık ekibinin olay yerine en kısa sürede ulaşmasını sağlar.',
  },
  {
    prompt: '{name} 112’yi aradığında ilk neyi söylemelidir?',
    answer: 'Ne olduğunu ve adresini',
    wrong: ['Adını ve okulunu', 'Hava durumunu', 'Öğretmeninin adını'],
    why: 'Görevlinin doğru yönlendirme yapması için olay ve adres bilgisi şarttır.',
  },
  {
    prompt: '{name} 112’yi aradığında görevli soru soruyor. Ne yapmalıdır?',
    answer: 'Sakin cevap verip soruları yanıtlamak',
    wrong: ['Telefonu hemen kapatmak', 'Yüksek sesle bağırmak', 'Şaka yapmak'],
    why: 'Görevlinin soruları, yardımın doğru yere gitmesi için gereklidir.',
  },
  {
    prompt: '{name} arkadaşına şaka olsun diye 112’yi arıyor. Bu neden yanlıştır?',
    answer: 'Acil yardım hattını meşgul eder',
    wrong: ['Telefon bozulur', 'Kontör biter', 'Hat kapanır'],
    why: 'Gereksiz aramalar, gerçekten yardıma ihtiyacı olan kişilerin ulaşmasını geciktirir.',
  },
  {
    prompt: '{name} 112’yi aradıktan sonra ne yapmalıdır?',
    answer: 'Görevli kapatana kadar hatta kalmak',
    wrong: ['Hemen kapatmak', 'Telefonu yere bırakmak', 'Başka numara aramak'],
    why: 'Görevli ek bilgi isteyebilir; hatta kalmak yardımın yönlendirilmesini kolaylaştırır.',
  },
  {
    prompt: '{name} evdeki adresini bilmediğini fark ediyor. Ne yapmalıdır?',
    answer: 'Adresini ve yakın çevresini öğrenmek',
    wrong: ['Adresi uydurmak', 'Adres sormamak', 'Yalnızca adını söylemek'],
    why: 'Acil durumda adres bilgisi, yardımın hızla ulaşmasını sağlar.',
  },
  {
    prompt: '{name} ormanda yürüyüşte kayboluyor. Ne yapmalıdır?',
    answer: 'Güvenli bir yerde kalıp 112’yi aramak',
    wrong: ['Rastgele koşmak', 'Sesini kaybedene kadar bağırmak', 'Suyu takip etmek'],
    why: 'Yerinde kalıp yardım istemek, arama ekibinin {name} bulmasını kolaylaştırır.',
  },
  {
    prompt: '{name} depremden sonra yaralı birini görüyor. Ne yapmalıdır?',
    answer: 'Yetişkine haber verip 112’yi aramak',
    wrong: ['Yaralıyı kucaklayıp koşmak', 'Fotoğraf çekmek', 'Oyun oynamaya devam etmek'],
    why: 'Yaralıyı hareket ettirmek zarar verebilir; doğru adım yardım çağırmaktır.',
  },
  {
    prompt: '{name} trafik kazası görüyor. Ne yapmalıdır?',
    answer: 'Güvenli mesafede durup 112’yi aramak',
    wrong: ['Kaza yerine koşmak', 'Araçların arasına girmek', 'Yolun ortasında durmak'],
    why: 'Kaza yerinde ikinci bir kaza riski vardır; {name} güvenli mesafede kalmalıdır.',
  },
  {
    prompt: '{name} bir arkadaşının nefes almakta zorlandığını görüyor. Ne yapmalıdır?',
    answer: 'Hemen bir yetişkine haber vermek',
    wrong: ['Su içirmeye çalışmak', 'Sırtına vurmak', 'Beklemek'],
    why: 'Nefes sorunu acil bir durumdur; {name} en hızlı şekilde yetişkin yardımı istemelidir.',
  },
  {
    prompt: '{name} elektrik çarpan birini görüyor. İlk ne yapmalıdır?',
    answer: 'Elektriği kesmesi için yetişkin çağırmak',
    wrong: ['Kişiyi elle çekmek', 'Üzerine su dökmek', 'Yanına oturmak'],
    why: 'Elektrik akımı {name} de çarpabilir; önce akım kesilmelidir.',
  },
  {
    prompt: '{name} acil bir durumda panikleyip bağırıyor. Daha etkili davranış hangisidir?',
    answer: 'Sakin kalıp kısa ve net bilgi vermek',
    wrong: ['Sürekli bağırmak', 'Kaçıp saklanmak', 'Telefonu kapatmak'],
    why: 'Sakin iletişim, yardımın daha hızlı planlanmasını sağlar.',
  },
  {
    prompt: '{name} evde gaz kokusu alıyor. Ne yapmalıdır?',
    answer: 'Elektrik düğmelerine dokunmadan evden çıkıp yetişkine haber vermek',
    wrong: ['Işıkları açmak', 'Pencereyi kapatıp beklemek', 'Çakmağı yakıp kontrol etmek'],
    why: 'Kıvılcım gazı tutuşturabilir; {name} hemen güvenli alana çıkmalıdır.',
  },
  {
    prompt: '{name} komşusunun evinden duman çıktığını görüyor. Ne yapmalıdır?',
    answer: 'Yangını yetişkinlere haber verip 112’yi aramak',
    wrong: ['İçeri girip söndürmeye çalışmak', 'Kova ile su taşımak', 'Bekleyip izlemek'],
    why: 'Yangına müdahale yetişkinlerin işidir; {name} güvenli yerden haber vermelidir.',
  },
];

const ACIL_ADIM: Row[] = [
  {
    prompt: '{name} sınıfta deprem sarsıntısını hissediyor. İlk ne yapmalıdır?',
    answer: 'Çök, kapan, tutun hareketini yapmak',
    wrong: ['Pencereye koşmak', 'Asansöre binmek', 'Merdivenlere koşmak'],
    why: 'Sağlam bir masa altında çöküp kapanmak, düşen cisimlerden korur.',
  },
  {
    prompt: '{name} deprem sırasında pencerenin yanında duruyor. Ne yapmalıdır?',
    answer: 'Pencereden uzaklaşıp sağlam bir yere geçmek',
    wrong: ['Camı açmak', 'Pencereden dışarı bakmak', 'Balkona çıkmak'],
    why: 'Sarsıntıda cam kırılabilir; {name} camdan uzak durmalıdır.',
  },
  {
    prompt: '{name} deprem bittikten sonra asansöre binmek istiyor. Neden binmemelidir?',
    answer: 'Elektrik kesilirse asansörde kalabilir',
    wrong: ['Asansör yavaştır', 'Asansör kirlidir', 'Asansör ses yapar'],
    why: 'Deprem sonrası asansör arıza yapabilir; merdiven kullanılmalıdır.',
  },
  {
    prompt: '{name} binadan çıkarken merdivenleri kullanıyor. Nasıl inmeli?',
    answer: 'Sakin ve sırayla, korkuluktan tutunarak',
    wrong: ['Koşarak ve iterek', 'Asansörle', 'Basamakları atlayarak'],
    why: 'Panikle koşmak düşme ve sıkışmaya yol açar.',
  },
  {
    prompt: '{name} yangın sırasında kapıyı açmadan önce ne yapmalıdır?',
    answer: 'Kapının sıcak olup olmadığını elinin tersiyle kontrol etmek',
    wrong: ['Kapıyı tekmelemek', 'Pencereyi kırmak', 'Yüksek sesle bağırmak'],
    why: 'Sıcak kapı arkasında yangın olduğunu gösterir; {name} başka çıkış aramalıdır.',
  },
  {
    prompt: '{name} dumanla dolu bir koridorda ilerlemek zorunda. Nasıl hareket etmelidir?',
    answer: 'Eğilerek, yere yakın ilerlemek',
    wrong: ['Ayakta koşmak', 'Zıplayarak ilerlemek', 'Gözlerini kapatıp yürümek'],
    why: 'Duman yükselir; yere yakın hava daha temizdir.',
  },
  {
    prompt: '{name} kıyafeti tutuştuğunda ne yapmalıdır?',
    answer: 'Dur, yat, yuvarlan hareketini yapmak',
    wrong: ['Koşmaya devam etmek', 'Elleriyle söndürmeye çalışmak', 'Pencereye koşmak'],
    why: 'Koşmak alevi büyütür; yere yatıp yuvarlanmak alevi boğar.',
  },
  {
    prompt: '{name} sel sırasında suyun içinden geçmek istiyor. Neden geçmemelidir?',
    answer: 'Akıntı insanı sürükleyebilir',
    wrong: ['Su soğuktur', 'Ayakkabı ıslanır', 'Yol uzar'],
    why: 'Sel suyu göründüğünden derin ve hızlı olabilir.',
  },
  {
    prompt: '{name} sel başladığında nereye gitmelidir?',
    answer: 'Yüksek ve güvenli bir yere',
    wrong: ['Bodruma', 'Köprü altına', 'Su kenarına'],
    why: 'Yüksek yer, su seviyesinin yükselmesinden korur.',
  },
  {
    prompt: '{name} gaz kokusu aldığında ışığı açmak istiyor. Neden açmamalıdır?',
    answer: 'Kıvılcım gazı patlatabilir',
    wrong: ['Ampul patlar', 'Elektrik kesilir', 'Oda karanlık olur'],
    why: 'Elektrik düğmesi kıvılcım üretir; gaz varsa patlama riski doğar.',
  },
  {
    prompt: '{name} açık alanda yıldırım düşerken ne yapmalıdır?',
    answer: 'Alçak bir yere çöküp açık alandan uzaklaşmak',
    wrong: ['Ağacın altına sığınmak', 'Şemsiye açmak', 'Koşarak eve gitmek'],
    why: 'Ağaç ve açık alan yıldırım için risklidir; {name} alçakta ve kapalı alanda olmalıdır.',
  },
  {
    prompt: '{name} parmağını kestiğinde ne yapmalıdır?',
    answer: 'Temiz bir bezle baskı uygulayıp yetişkine haber vermek',
    wrong: ['Yarayı toprakla kapatmak', 'Parmağını sallamak', 'Yarayı emmek'],
    why: 'Baskı kanamayı azaltır; temiz bez yaranın mikrop kapmasını önler.',
  },
  {
    prompt: '{name} elini sıcak tencereye değdirip yaktı. İlk ne yapmalıdır?',
    answer: 'Yanan bölgeyi soğuk su altında tutmak',
    wrong: ['Diş macunu sürmek', 'Buz koymak', 'Yanığı ovmak'],
    why: 'Soğuk su, yanık bölgedeki ısıyı azaltır ve hasarı sınırlar.',
  },
  {
    prompt: '{name} bir odada kilitli kalıyor. Ne yapmalıdır?',
    answer: 'Sakin kalıp yetişkinlere seslenmek',
    wrong: ['Kapıyı tekmelemek', 'Pencereyi kırmak', 'Saklanmak'],
    why: 'Sakin seslenmek, {name} güvenli şekilde bulunmasını sağlar.',
  },
  {
    prompt: '{name} ıslak elle prize dokunmak üzere. Ne yapmalıdır?',
    answer: 'Prize dokunmamak ve yetişkine haber vermek',
    wrong: ['Hızlıca dokunmak', 'Eli kurulayıp dokunmak', 'Priz kapağını açmak'],
    why: 'Islak elle prize dokunmak elektrik çarpmasına yol açar.',
  },
];

const ACIL_YABANCI: Row[] = [
  {
    prompt: '{name} okul çıkışında tanımadığı biri ona araba ile gitmeyi teklif ediyor. Ne yapmalıdır?',
    answer: 'Teklifi reddedip güvenilir bir yetişkine haber vermek',
    wrong: ['Arabaya binmek', 'Adresini vermek', 'Birlikte gitmek'],
    why: 'Tanımadık kişiyle gitmek büyük bir risktir; {name} durumu güvendiği birine anlatmalıdır.',
  },
  {
    prompt: '{name} parkta tanımadığı biri ona şeker veriyor. Ne yapmalıdır?',
    answer: 'Teşekkür edip almamak',
    wrong: ['Hemen yemek', 'Alıp arkadaşına vermek', 'Poşeti açmak'],
    why: 'Tanımadık kişiden yiyecek almak güvenli değildir.',
  },
  {
    prompt: '{name} eve giderken tanımadığı biri “annen beni gönderdi” diyor. Ne yapmalıdır?',
    answer: 'Önce annesini arayıp doğrulamak',
    wrong: ['Hemen arabaya binmek', 'Adresini göstermek', 'Birlikte yürümek'],
    why: 'Söylenen söz doğrulanmadan {name} yabancıyla gitmemelidir.',
  },
  {
    prompt: '{name} evde yalnızken kapı çalıyor. Ne yapmalıdır?',
    answer: 'Kapıyı açmadan yetişkine haber vermek',
    wrong: ['Kapıyı açmak', 'Adını söylemek', 'Anahtarı vermek'],
    why: 'Yalnızken kapıyı açmak güvenli değildir; {name} önce ailesini aramalıdır.',
  },
  {
    prompt: '{name} internette tanımadığı biriyle sohbet ediyor. Neyi paylaşmamalıdır?',
    answer: 'Ev adresini',
    wrong: ['Sevdiği rengi', 'En sevdiği oyunu', 'Okuduğu kitabı'],
    why: 'Kişisel bilgiler, {name} güvenliği için gizli tutulmalıdır.',
  },
  {
    prompt: '{name} alışveriş merkezinde ailesini kaybediyor. Kime başvurmalıdır?',
    answer: 'Görevliye veya güvenlik görevlisine',
    wrong: ['Yoldan geçen herkese', 'Tek başına dışarı çıkmaya', 'Asansörde beklemeye'],
    why: 'Görevli ve güvenlik çalışanları, {name} ailesine ulaşmasında yardımcı olur.',
  },
  {
    prompt: '{name} kalabalıkta ailesini kaybettiğinde ne yapmalıdır?',
    answer: 'Önceden belirlenen buluşma noktasında beklemek',
    wrong: ['Rastgele koşmak', 'Otobüse binmek', 'Sokak sokak aramak'],
    why: 'Sabit bir noktada beklemek, ailenin {name} bulmasını kolaylaştırır.',
  },
  {
    prompt: '{name} ailesinin telefon numarasını ezbere bilmiyor. Neden öğrenmelidir?',
    answer: 'Kaybolduğunda iletişim kurabilmek için',
    wrong: ['Sınavda sorulacağı için', 'Numara uzun olduğu için', 'Telefon şarjı için'],
    why: 'Acil durumda numarayı bilmek, {name} ailesine hemen ulaşmasını sağlar.',
  },
  {
    prompt: '{name} asansörde tanımadığı biriyle yalnız kalıyor. Ne yapmalıdır?',
    answer: 'Asansörden inip kalabalık bir yere geçmek',
    wrong: ['Konuşmaya devam etmek', 'Adresini söylemek', 'Kapıyı tutmak'],
    why: 'Rahatsız olduğunda {name} ortamdan ayrılmalı ve güvenli bir yere geçmelidir.',
  },
  {
    prompt: '{name} tanımadığı biri fotoğrafını çekmek istiyor. Ne yapmalıdır?',
    answer: 'İzin vermeyip yetişkine söylemek',
    wrong: ['Poz vermek', 'Adresini yazmak', 'Telefonunu vermek'],
    why: 'Tanımadık kişiye fotoğraf izni vermek, {name} gizliliği için uygun değildir.',
  },
  {
    prompt: '{name} tanımadığı biri “arabanın yanında bir şey unuttum, gel” diyor. Ne yapmalıdır?',
    answer: 'Gitmeyip oradan uzaklaşmak',
    wrong: ['Yardım etmek için gitmek', 'Arabaya bakmak', 'Çantasını vermek'],
    why: 'Bu tür bahaneler çocuğu uzak bir yere çekmek için kullanılabilir.',
  },
  {
    prompt: '{name} tanımadığı biri onu eve davet ediyor. Ne yapmalıdır?',
    answer: 'Reddedip ailesine haber vermek',
    wrong: ['Kısa süreliğine gitmek', 'Adresi almak', 'Yemek yemek'],
    why: 'Tanımadık kişinin evine gitmek güvenli değildir.',
  },
  {
    prompt: '{name} tanımadığı biri “bu aramızda sır olsun” diyor. Ne yapmalıdır?',
    answer: 'Sırrı kabul etmeyip güvendiği birine anlatmak',
    wrong: ['Sırrı saklamak', 'Arkadaşına anlatmak', 'Gülüp geçmek'],
    why: 'Yetişkinden saklanması istenen konu, {name} güvenliği için mutlaka paylaşılmalıdır.',
  },
  {
    prompt: '{name} tanımadığı birinden hediye alıyor ve karşılığında bir yere gitmesi isteniyor. Ne yapmalıdır?',
    answer: 'Hediyeyi almadan oradan uzaklaşmak',
    wrong: ['Hediyeyi alıp gitmek', 'Adresini vermek', 'Teşekkür edip beklemek'],
    why: 'Hediye karşılığında bir yere gitmek istenmesi güvenli olmayan bir durumdur.',
  },
];

const ACIL_EV: Row[] = [
  {
    prompt: '{name} evde prize bir tel sokmak istiyor. Neden yapmamalıdır?',
    answer: 'Elektrik çarpar',
    wrong: ['Priz kirlenir', 'Tel erir', 'Işık söner'],
    why: 'Prize yabancı cisim sokmak elektrik çarpmasına yol açar.',
  },
  {
    prompt: '{name} ilaç dolabını açıp ilaçları karıştırıyor. Neden yapmamalıdır?',
    answer: 'Yanlış ilaç zehirlenmeye yol açar',
    wrong: ['İlaçlar karışır', 'Dolap kirlenir', 'Kutular açılmaz'],
    why: 'İlaçlar yalnızca yetişkin gözetiminde ve doğru dozda kullanılmalıdır.',
  },
  {
    prompt: '{name} mutfakta bıçakla oynamak istiyor. Ne yapmalıdır?',
    answer: 'Bıçağa dokunmamak',
    wrong: ['Bıçağı arkadaşına vermek', 'Bıçağı koşarak taşımak', 'Bıçağı yere atmak'],
    why: 'Kesici aletler çocuklar için ciddi yaralanma riski taşır.',
  },
  {
    prompt: '{name} ocakta kaynayan tencereye uzanıyor. Ne yapmalıdır?',
    answer: 'Tencereye dokunmadan yetişkinden yardım istemek',
    wrong: ['Tencerenin sapından tutmak', 'Kapağı açmak', 'Suyu dökmek'],
    why: 'Sıcak tencere yanıklara yol açar; {name} uzak durmalıdır.',
  },
  {
    prompt: '{name} ıslak zeminde koşuyor. Bu neden tehlikelidir?',
    answer: 'Kayıp düşebilir',
    wrong: ['Zemin kurur', 'Ayakkabı kaybolur', 'Su azalır'],
    why: 'Islak zemin kaygan olur; {name} yavaş ve dikkatli yürümelidir.',
  },
  {
    prompt: '{name} balkon korkuluğuna tırmanmak istiyor. Neden yapmamalıdır?',
    answer: 'Düşme riski çok yüksektir',
    wrong: ['Korkuluk kirlenir', 'Balkon daralır', 'Komşu kızar'],
    why: 'Korkuluğa tırmanmak, {name} için hayati risk taşır.',
  },
  {
    prompt: '{name} merdivenlerden hızlı inmek istiyor. Ne yapmalıdır?',
    answer: 'Korkuluktan tutunarak yavaş inmek',
    wrong: ['İkişer basamak atlamak', 'Koşarak inmek', 'Sırtüstü kaymak'],
    why: 'Merdivenlerde koşmak düşme ve yaralanma riskini artırır.',
  },
  {
    prompt: '{name} kibrit bulup yakmak istiyor. Neden yapmamalıdır?',
    answer: 'Yangın çıkabilir',
    wrong: ['Kibrit biter', 'Kutu kirlenir', 'Kokusu kalır'],
    why: 'Ateşle oynamak kontrolsüz yangına yol açabilir.',
  },
  {
    prompt: '{name} plastik poşeti başına geçiriyor. Bu neden tehlikelidir?',
    answer: 'Nefes almasını engelleyebilir',
    wrong: ['Poşet yırtılır', 'Saçı kirlenir', 'Poşet ısınır'],
    why: 'Plastik poşet başa geçirildiğinde boğulma riski oluşur.',
  },
  {
    prompt: '{name} açık pencerenin kenarına çıkıyor. Ne yapmalıdır?',
    answer: 'Pencere kenarından uzaklaşmak',
    wrong: ['Dışarı bakmak için eğilmek', 'Perdeye tutunmak', 'Arkadaşını çağırmak'],
    why: 'Açık pencere kenarı düşme riski taşır.',
  },
  {
    prompt: '{name} küçük bir oyuncak parçasını ağzına götürüyor. Neden yapmamalıdır?',
    answer: 'Soluk yolunu tıkayabilir',
    wrong: ['Oyuncak kırılır', 'Dişleri güçlenir', 'Ağzı kurur'],
    why: 'Küçük parçaların yutulması boğulma tehlikesi yaratır.',
  },
  {
    prompt: '{name} banyoda kaymamak için ne yapmalıdır?',
    answer: 'Kaymayan paspas kullanmak',
    wrong: ['Koşarak girmek', 'Sabunu yere bırakmak', 'Suyu açık bırakmak'],
    why: 'Kaymayan paspas, ıslak zeminde {name} düşmesini önler.',
  },
  {
    prompt: '{name} elektrikli ısıtıcıya çok yaklaşıyor. Ne yapmalıdır?',
    answer: 'Isıtıcıdan güvenli mesafede durmak',
    wrong: ['Üzerine örtü koymak', 'Yakınında oturmak', 'Fişini çekmek'],
    why: 'Isıtıcı yanık ve yangın riski oluşturur; {name} uzak durmalıdır.',
  },
  {
    prompt: '{name} kapıyı hızla kapatırken parmağını sıkıştırıyor. Bundan korunmak için ne yapmalıdır?',
    answer: 'Kapıyı yavaş kapatıp parmaklarını uzak tutmak',
    wrong: ['Kapıyı tekmelemek', 'Kapıyı hızla çekmek', 'Parmağını kapıya koymak'],
    why: 'Kapıyı yavaş kapatmak, parmak sıkışması riskini azaltır.',
  },
];

/* ---------------------------------------------------------------- */
/* İngilizce · Temel Kelimeler                                       */
/* ---------------------------------------------------------------- */

const WORDS: Array<[string, string]> = [
  ['elma', 'apple'],
  ['kitap', 'book'],
  ['su', 'water'],
  ['masa', 'table'],
  ['sandalye', 'chair'],
  ['kalem', 'pencil'],
  ['defter', 'notebook'],
  ['kapı', 'door'],
  ['pencere', 'window'],
  ['okul', 'school'],
  ['öğretmen', 'teacher'],
  ['öğrenci', 'student'],
  ['arkadaş', 'friend'],
  ['ev', 'house'],
  ['anne', 'mother'],
  ['baba', 'father'],
  ['kedi', 'cat'],
  ['köpek', 'dog'],
  ['kuş', 'bird'],
  ['balık', 'fish'],
  ['ekmek', 'bread'],
  ['süt', 'milk'],
  ['peynir', 'cheese'],
  ['yumurta', 'egg'],
  ['el', 'hand'],
  ['göz', 'eye'],
  ['ayak', 'foot'],
  ['baş', 'head'],
  ['güneş', 'sun'],
  ['ağaç', 'tree'],
];

const WORD_OFFSETS = [7, 13, 19];

const KELIME_TR_EN: Row[] = WORDS.map(([tr, en], index) => ({
  prompt: `{name} “${tr}” kelimesinin İngilizcesini öğreniyor. Doğru kelime hangisidir?`,
  answer: en,
  wrong: WORD_OFFSETS.map((offset) => WORDS[(index + offset) % WORDS.length][1]),
  why: `“${tr}” kelimesinin İngilizcesi “${en}” olarak yazılır.`,
}));

const KELIME_EN_TR: Row[] = WORDS.map(([tr, en], index) => ({
  prompt: `{name} “${en}” kelimesinin Türkçe karşılığını arıyor. Doğru karşılık hangisidir?`,
  answer: tr,
  wrong: WORD_OFFSETS.map((offset) => WORDS[(index + offset) % WORDS.length][0]),
  why: `“${en}” kelimesinin Türkçe karşılığı “${tr}” kelimesidir.`,
}));

const COLORS: Array<[string, string]> = [
  ['red', 'kırmızı'],
  ['blue', 'mavi'],
  ['green', 'yeşil'],
  ['yellow', 'sarı'],
  ['black', 'siyah'],
  ['white', 'beyaz'],
  ['orange', 'turuncu'],
  ['purple', 'mor'],
  ['pink', 'pembe'],
  ['brown', 'kahverengi'],
];

const KELIME_RENK: Row[] = COLORS.map(([en, tr], index) => ({
  prompt: `{name} boyama kitabında “${tr}” rengini kullanacak. Bu rengin İngilizcesi hangisidir?`,
  answer: en,
  wrong: [1, 3, 5].map((step) => COLORS[(index + step) % COLORS.length][0]),
  why: `Türkçede “${tr}” olan rengin İngilizcesi “${en}” kelimesidir.`,
}));

const NUMBERS: Array<[string, number]> = [
  ['one', 1],
  ['two', 2],
  ['three', 3],
  ['four', 4],
  ['five', 5],
  ['six', 6],
  ['seven', 7],
  ['eight', 8],
  ['nine', 9],
  ['ten', 10],
  ['eleven', 11],
  ['twelve', 12],
  ['twenty', 20],
];

const KELIME_SAYI: Row[] = NUMBERS.map(([en, value], index) => ({
  prompt: `{name} İngilizce dersinde “${en}” kelimesinin hangi sayıyı gösterdiğini öğreniyor. Doğru sayı hangisidir?`,
  answer: String(value),
  wrong: [1, 4, 7].map((step) => String(NUMBERS[(index + step) % NUMBERS.length][1])),
  why: `İngilizcede “${en}” kelimesi ${value} sayısını gösterir.`,
}));

const PLURALS: Row[] = [
  {
    prompt: '{name} “one book, two ___” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'books',
    wrong: ['book', 'bookes', 'book’s'],
    why: '“Book” tekil, “books” çoğuldur; iki kitaptan söz edildiği için çoğul kullanılır.',
  },
  {
    prompt: '{name} “one pen, three ___” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'pens',
    wrong: ['pen', 'pennes', 'pen’s'],
    why: '“Pen” kelimesine yalnızca “-s” eklenir ve “pens” olur.',
  },
  {
    prompt: '{name} “one cat, four ___” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'cats',
    wrong: ['cat', 'cates', 'cat’s'],
    why: '“Cat” kelimesi çoğulda “cats” biçimine girer.',
  },
  {
    prompt: '{name} “one dog, two ___” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'dogs',
    wrong: ['dog', 'doges', 'dog’s'],
    why: '“Dog” kelimesine “-s” eklenir ve “dogs” olur.',
  },
  {
    prompt: '{name} “one apple, six ___” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'apples',
    wrong: ['apple', 'applees', 'apple’s'],
    why: '“Apple” kelimesi çoğulda “apples” olarak yazılır.',
  },
  {
    prompt: '{name} “one car, five ___” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'cars',
    wrong: ['car', 'car’s', 'carres'],
    why: '“Car” kelimesine “-s” eklenir ve “cars” olur.',
  },
  {
    prompt: '{name} “one box, two ___” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'boxes',
    wrong: ['boxs', 'box', 'box’s'],
    why: '“x” ile biten kelimelere “-es” eklenir; “box” kelimesi “boxes” olur.',
  },
  {
    prompt: '{name} “one bus, three ___” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'buses',
    wrong: ['buss', 'bus’s', 'buse'],
    why: '“s” ile biten kelimelere “-es” eklenir; “bus” kelimesi “buses” olur.',
  },
  {
    prompt: '{name} “one child, two ___” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'children',
    wrong: ['childs', 'childes', 'childrens'],
    why: '“Child” kelimesi düzensiz bir çoğuldur; çoğulu “children” biçimindedir.',
  },
];

/* ---------------------------------------------------------------- */
/* İngilizce · Selamlaşma                                            */
/* ---------------------------------------------------------------- */

const SELAM_DIYALOG: Row[] = [
  {
    prompt: '{name} sabah okula girdiğinde öğretmenine “Good morning!” dedi. Öğretmenin uygun cevabı hangisidir?',
    answer: 'Good morning!',
    wrong: ['Good night!', 'Goodbye!', 'See you!'],
    why: 'Sabah kullanılan “Good morning!” selamına aynı ifadeyle karşılık verilir.',
  },
  {
    prompt: '{name} arkadaşına “Hello!” diyor. Arkadaşının uygun cevabı hangisidir?',
    answer: 'Hello!',
    wrong: ['Good night!', 'Thank you!', 'Sorry!'],
    why: '“Hello!” selamına en doğal karşılık yine “Hello!” ifadesidir.',
  },
  {
    prompt: '{name} “How are you?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'I am fine, thank you.',
    wrong: ['My name is Ali.', 'I am nine.', 'It is a book.'],
    why: '“How are you?” hâl hatır sorusudur; “I am fine, thank you.” uygun cevaptır.',
  },
  {
    prompt: '{name} yeni bir arkadaşıyla tanışıyor ve “What is your name?” diye soruyor. Arkadaşı ne cevap verir?',
    answer: 'My name is Zeynep.',
    wrong: ['I am fine.', 'It is blue.', 'I am nine years old.'],
    why: '“What is your name?” sorusu isim sorar; cevap “My name is ...” kalıbıyla verilir.',
  },
  {
    prompt: '{name} “Nice to meet you.” diyor. Karşı tarafın uygun cevabı hangisidir?',
    answer: 'Nice to meet you too.',
    wrong: ['I am sorry.', 'Good night.', 'You are welcome.'],
    why: 'Tanışma ifadesine “Nice to meet you too.” diyerek karşılık verilir.',
  },
  {
    prompt: '{name} “How old are you?” sorusunu duyuyor. Uygun cevap hangisidir?',
    answer: 'I am nine years old.',
    wrong: ['I am fine.', 'It is a pencil.', 'I am from Turkey.'],
    why: '“How old are you?” yaş sorar; cevap “I am ... years old.” kalıbıyla verilir.',
  },
  {
    prompt: '{name} “Where are you from?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'I am from Turkey.',
    wrong: ['I am ten.', 'My name is Ali.', 'I am happy.'],
    why: '“Where are you from?” nereden geldiğini sorar; “I am from ...” kalıbı kullanılır.',
  },
  {
    prompt: '{name} öğleden sonra karşılaştığı komşusuna selam veriyor. Uygun selamlaşma hangisidir?',
    answer: 'Good afternoon!',
    wrong: ['Good morning!', 'Good night!', 'Goodbye!'],
    why: 'Öğleden sonra için “Good afternoon!” ifadesi kullanılır.',
  },
  {
    prompt: '{name} akşam misafirleri karşılarken hangi ifadeyi kullanmalıdır?',
    answer: 'Good evening!',
    wrong: ['Good morning!', 'Good afternoon!', 'Good night!'],
    why: 'Akşam karşılaşmalarda “Good evening!” denir.',
  },
  {
    prompt: '{name} yatmadan önce annesine ne söylemelidir?',
    answer: 'Good night!',
    wrong: ['Good morning!', 'Good afternoon!', 'Hello!'],
    why: 'Gece yatmadan önce “Good night!” denir.',
  },
  {
    prompt: '{name} “How are you today?” sorusuna mutlu olduğunu söyleyerek cevap veriyor. Uygun cevap hangisidir?',
    answer: 'I am happy.',
    wrong: ['I am a book.', 'It is red.', 'I am nine.'],
    why: 'Duygu bildirmek için “I am happy.” gibi “I am + sıfat” kalıbı kullanılır.',
  },
  {
    prompt: '{name} arkadaşına “Are you OK?” diye soruyor. Arkadaşı iyi olduğunu söylüyor. Uygun cevap hangisidir?',
    answer: 'Yes, I am OK.',
    wrong: ['Yes, it is.', 'No, thank you.', 'I am from Ankara.'],
    why: '“Are you ...?” sorusuna kısa cevap “Yes, I am.” kalıbıyla verilir.',
  },
  {
    prompt: '{name} “What is your favourite colour?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'My favourite colour is blue.',
    wrong: ['My name is blue.', 'I am blue.', 'It is a blue.'],
    why: 'Renk tercihi “My favourite colour is ...” kalıbıyla söylenir.',
  },
  {
    prompt: '{name} arkadaşına “Do you like apples?” diye soruyor. Arkadaşı sevdiğini söylüyor. Uygun cevap hangisidir?',
    answer: 'Yes, I do.',
    wrong: ['Yes, I am.', 'Yes, it is.', 'Yes, she does.'],
    why: '“Do you ...?” sorusuna kısa cevap “Yes, I do.” biçiminde verilir.',
  },
  {
    prompt: '{name} arkadaşına “See you tomorrow.” diyor. Arkadaşının uygun cevabı hangisidir?',
    answer: 'See you.',
    wrong: ['Good morning.', 'Thank you.', 'I am fine.'],
    why: '“See you tomorrow.” ifadesine “See you.” diyerek karşılık verilir.',
  },
];

const SELAM_CEVAP: Row[] = [
  {
    prompt: '{name} sınıfa girerken öğretmenini selamlıyor. Hangisi uygun bir selamlamadır?',
    answer: 'Good morning, teacher.',
    wrong: ['Good night, teacher.', 'Sorry, teacher.', 'Thank you, teacher.'],
    why: 'Sabah sınıfa girerken öğretmene “Good morning” denir.',
  },
  {
    prompt: '{name} yeni tanıştığı birine kendini tanıtıyor. Hangisi uygundur?',
    answer: 'Hello, my name is Ali.',
    wrong: ['Hello, I am fine.', 'Hello, it is a book.', 'Hello, I am nine years.'],
    why: 'Kendini tanıtırken “My name is ...” kalıbı kullanılır.',
  },
  {
    prompt: '{name} arkadaşının hasta olduğunu duyuyor. Ne söylemelidir?',
    answer: 'Get well soon.',
    wrong: ['Happy birthday!', 'Good luck!', 'Well done!'],
    why: 'Hasta birine iyi dilek için “Get well soon.” denir.',
  },
  {
    prompt: '{name} arkadaşına yardım etti, arkadaşı “Thank you.” dedi. {name} ne cevap vermelidir?',
    answer: 'You are welcome.',
    wrong: ['I am sorry.', 'Good night.', 'See you.'],
    why: '“Thank you.” ifadesine “You are welcome.” diyerek karşılık verilir.',
  },
  {
    prompt: '{name} doğum günü partisinde arkadaşına iyi dilek iletiyor. Hangisi uygundur?',
    answer: 'Happy birthday!',
    wrong: ['Good morning!', 'Get well soon!', 'You are welcome!'],
    why: 'Doğum gününde “Happy birthday!” denir.',
  },
  {
    prompt: '{name} sabah okula girerken kapıdaki görevliye ne söylemelidir?',
    answer: 'Good morning!',
    wrong: ['Good night!', 'Goodbye!', 'Sorry!'],
    why: 'Sabah karşılaşmalarda “Good morning!” kullanılır.',
  },
  {
    prompt: '{name} okuldan ayrılırken arkadaşına ne söylemelidir?',
    answer: 'Goodbye!',
    wrong: ['Hello!', 'Good morning!', 'Thank you!'],
    why: 'Ayrılırken “Goodbye!” denir.',
  },
  {
    prompt: '{name} öğretmeninden yardım isterken hangi ifadeyi kullanmalıdır?',
    answer: 'Can you help me, please?',
    wrong: ['Give me that.', 'I am fine.', 'Good night.'],
    why: 'Kibar yardım isteme kalıbı “Can you help me, please?” biçimindedir.',
  },
  {
    prompt: '{name} sınıfa girmek için izin isterken hangi ifadeyi kullanmalıdır?',
    answer: 'May I come in?',
    wrong: ['I am nine.', 'It is a book.', 'Goodbye!'],
    why: 'Sınıfa girmek için izin “May I come in?” sorusuyla istenir.',
  },
  {
    prompt: '{name} yeni biriyle tanıştırıldığında ne söylemelidir?',
    answer: 'Nice to meet you.',
    wrong: ['Good night.', 'You are welcome.', 'I am sorry.'],
    why: 'Tanışmada “Nice to meet you.” ifadesi kullanılır.',
  },
  {
    prompt: '{name} yanlışlıkla arkadaşına çarptı. Ne söylemelidir?',
    answer: 'I am sorry.',
    wrong: ['Thank you.', 'Good morning.', 'Happy birthday!'],
    why: 'Hata yapıldığında özür için “I am sorry.” denir.',
  },
  {
    prompt: '{name} arkadaşı özür dilediğinde ne cevap vermelidir?',
    answer: 'That is OK.',
    wrong: ['Good night.', 'See you.', 'Happy birthday!'],
    why: 'Özre karşılık “That is OK.” ifadesi kullanılır.',
  },
  {
    prompt: '{name} akşam eve gelen misafiri kapıda karşılıyor. Hangisi uygundur?',
    answer: 'Good evening!',
    wrong: ['Good morning!', 'Good afternoon!', 'Goodbye!'],
    why: 'Akşam karşılamasında “Good evening!” denir.',
  },
  {
    prompt: '{name} telefonda kendini tanıtarak konuşmaya başlıyor. Hangisi uygundur?',
    answer: 'Hello, this is Ali.',
    wrong: ['Good night, this is Ali.', 'Sorry, this is Ali.', 'Thank you, this is Ali.'],
    why: 'Telefonda kendini tanıtma kalıbı “Hello, this is ...” biçimindedir.',
  },
  {
    prompt: '{name} yeni yıl için arkadaşına iyi dilek iletiyor. Hangisi uygundur?',
    answer: 'Happy New Year!',
    wrong: ['Happy birthday!', 'Get well soon!', 'Good morning!'],
    why: 'Yeni yıl dileği “Happy New Year!” ifadesiyle iletilir.',
  },
];

const SELAM_TANITIM: Row[] = [
  {
    prompt: '{name} kendini İngilizce tanıtıyor. “Benim adım Ayşe.” cümlesinin İngilizcesi hangisidir?',
    answer: 'My name is Ayşe.',
    wrong: ['My name are Ayşe.', 'I name is Ayşe.', 'My name am Ayşe.'],
    why: 'İsim bildiren kalıp “My name is ...” biçimindedir; “name” tekil olduğu için “is” kullanılır.',
  },
  {
    prompt: '{name} “Ben dokuz yaşındayım.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I am nine years old.',
    wrong: ['I is nine years old.', 'I are nine years old.', 'I nine years old am.'],
    why: '“I” öznesiyle her zaman “am” kullanılır: I am nine years old.',
  },
  {
    prompt: '{name} “Ben öğrenciyim.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I am a student.',
    wrong: ['I is a student.', 'I are a student.', 'I student am.'],
    why: '“I” ile “am” kullanılır ve meslek belirtilirken “a” eklenir.',
  },
  {
    prompt: '{name} “Ben Türkiye’denim.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I am from Turkey.',
    wrong: ['I is from Turkey.', 'I from am Turkey.', 'I are from Turkey.'],
    why: 'Ülke belirtirken “I am from ...” kalıbı kullanılır.',
  },
  {
    prompt: '{name} “Ben İngilizce öğreniyorum.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I am learning English.',
    wrong: ['I is learning English.', 'I learning am English.', 'I are learning English.'],
    why: 'Şimdiki zaman “am + fiil-ing” yapısıyla kurulur: I am learning English.',
  },
  {
    prompt: '{name} “Bu benim arkadaşım.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'This is my friend.',
    wrong: ['This are my friend.', 'This am my friend.', 'This my friend is.'],
    why: 'Yakındaki tek kişi için “This is ...” kalıbı kullanılır.',
  },
  {
    prompt: '{name} “Benim bir kedim var.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I have a cat.',
    wrong: ['I has a cat.', 'I am a cat.', 'I having a cat.'],
    why: 'Sahiplik “have” fiiliyle anlatılır; “I” ile “have” kullanılır.',
  },
  {
    prompt: '{name} “Ben okula gidiyorum.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I go to school.',
    wrong: ['I goes to school.', 'I going to school.', 'I am go to school.'],
    why: '“I” öznesiyle geniş zaman fiili yalın hâlde kullanılır: I go to school.',
  },
  {
    prompt: '{name} “Benim en sevdiğim renk mavi.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'My favourite colour is blue.',
    wrong: ['My favourite colour are blue.', 'My favourite colour am blue.', 'My favourite blue is colour.'],
    why: 'Tek bir renk anlatıldığı için “is” kullanılır.',
  },
  {
    prompt: '{name} “Ben dördüncü sınıfa gidiyorum.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I am in the fourth grade.',
    wrong: ['I is in the fourth grade.', 'I in the fourth grade am.', 'I are in the fourth grade.'],
    why: 'Sınıf belirtirken “I am in the ... grade.” kalıbı kullanılır.',
  },
  {
    prompt: '{name} “Ben mutluyum.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I am happy.',
    wrong: ['I is happy.', 'I are happy.', 'I happy am.'],
    why: '“I” öznesi “am” yardımcı fiiliyle kullanılır.',
  },
  {
    prompt: '{name} “Benim bir köpeğim var.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I have a dog.',
    wrong: ['I has a dog.', 'I am a dog.', 'I having a dog.'],
    why: '“I” öznesiyle sahiplik “have” fiiliyle anlatılır.',
  },
  {
    prompt: '{name} “Ben sabahları erken kalkarım.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I get up early in the morning.',
    wrong: ['I gets up early in the morning.', 'I getting up early in the morning.', 'I am get up early in the morning.'],
    why: '“I” ile geniş zaman fiili “-s” almaz: I get up early.',
  },
  {
    prompt: '{name} “Ben parkta oynarım.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I play in the park.',
    wrong: ['I plays in the park.', 'I playing in the park.', 'I am play in the park.'],
    why: '“I” öznesiyle fiil yalın hâlde kullanılır: I play.',
  },
  {
    prompt: '{name} “Ben on yaşındayım.” cümlesini İngilizceye çeviriyor. Doğru cümle hangisidir?',
    answer: 'I am ten years old.',
    wrong: ['I is ten years old.', 'I are ten years old.', 'I ten years am old.'],
    why: 'Yaş belirtirken “I am ... years old.” kalıbı kullanılır.',
  },
];

const SELAM_VEDA: Row[] = [
  {
    prompt: '{name} arkadaşına “Goodbye!” diyor. Arkadaşı nasıl karşılık vermelidir?',
    answer: 'Goodbye!',
    wrong: ['Hello!', 'Good morning!', 'Thank you!'],
    why: 'Vedalaşma ifadesine “Goodbye!” diyerek karşılık verilir.',
  },
  {
    prompt: '{name} “See you later.” diyor. Bunun Türkçe anlamı hangisidir?',
    answer: 'Sonra görüşürüz.',
    wrong: ['İyi geceler.', 'Günaydın.', 'Teşekkür ederim.'],
    why: '“See you later.” ifadesi “Sonra görüşürüz.” anlamına gelir.',
  },
  {
    prompt: '{name} öğretmenine “Have a nice day.” diyor. Öğretmenin uygun cevabı hangisidir?',
    answer: 'You too.',
    wrong: ['Good night.', 'I am nine.', 'It is a book.'],
    why: 'İyi dileğe “You too.” diyerek karşılık verilir.',
  },
  {
    prompt: '{name} “Good night.” ifadesini öğreniyor. Bu ifade ne zaman kullanılır?',
    answer: 'Gece yatmadan önce',
    wrong: ['Sabah kalkınca', 'Öğle yemeğinde', 'Okula girerken'],
    why: '“Good night.” ifadesi gece, yatmadan önce kullanılır.',
  },
  {
    prompt: '{name} arkadaşına “Take care.” diyor. Bu ifadenin anlamı hangisidir?',
    answer: 'Kendine iyi bak.',
    wrong: ['İyi eğlenceler.', 'Geçmiş olsun.', 'Hoş geldin.'],
    why: '“Take care.” ifadesi “Kendine iyi bak.” anlamına gelir.',
  },
  {
    prompt: '{name} “See you tomorrow.” ifadesini duyuyor. Bu ifade ne anlama gelir?',
    answer: 'Yarın görüşürüz.',
    wrong: ['Bugün görüşürüz.', 'Dün görüştük.', 'Hiç görüşmeyiz.'],
    why: '“Tomorrow” yarın anlamına gelir; ifade “Yarın görüşürüz.” demektir.',
  },
  {
    prompt: '{name} arkadaşına “Bye bye!” diyor. Arkadaşı nasıl cevap verebilir?',
    answer: 'Bye!',
    wrong: ['Good morning!', 'Hello!', 'Thank you!'],
    why: '“Bye bye!” ifadesine “Bye!” diyerek karşılık verilir.',
  },
  {
    prompt: '{name} “Have a good weekend.” diyor. Uygun cevap hangisidir?',
    answer: 'You too, thanks.',
    wrong: ['Good night.', 'I am sorry.', 'It is red.'],
    why: 'İyi dileğe “You too, thanks.” diyerek karşılık verilir.',
  },
  {
    prompt: '{name} okuldan çıkarken öğretmenine ne söylemelidir?',
    answer: 'Goodbye, teacher.',
    wrong: ['Good morning, teacher.', 'Hello, teacher.', 'Thank you, teacher.'],
    why: 'Okuldan ayrılırken “Goodbye” denir.',
  },
  {
    prompt: '{name} eve gitmesi gerektiğini söylüyor. Hangisi uygun bir kapanıştır?',
    answer: 'I must go now. See you.',
    wrong: ['I am fine, thank you.', 'My name is Ali.', 'It is a pencil.'],
    why: 'Ayrılık bildiren kapanış “I must go now. See you.” biçimindedir.',
  },
  {
    prompt: '{name} “See you next week.” ifadesinin anlamını arıyor. Doğru anlam hangisidir?',
    answer: 'Gelecek hafta görüşürüz.',
    wrong: ['Geçen hafta görüştük.', 'Her gün görüşürüz.', 'Hiç görüşmeyiz.'],
    why: '“Next week” gelecek hafta anlamına gelir.',
  },
  {
    prompt: '{name} arkadaşına “Have a safe trip.” diyor. Uygun cevap hangisidir?',
    answer: 'Thank you.',
    wrong: ['Good night.', 'I am nine.', 'See you yesterday.'],
    why: 'İyi yolculuk dileğine “Thank you.” diyerek karşılık verilir.',
  },
  {
    prompt: '{name} gece yatmadan önce annesine ne söylemelidir?',
    answer: 'Good night, mum.',
    wrong: ['Good morning, mum.', 'Good afternoon, mum.', 'Hello, mum.'],
    why: 'Gece yatmadan önce “Good night.” denir.',
  },
  {
    prompt: '{name} “Farewell” kelimesinin anlamını öğreniyor. Bu kelime hangi anlama gelir?',
    answer: 'Elveda',
    wrong: ['Merhaba', 'Günaydın', 'Teşekkürler'],
    why: '“Farewell” kelimesi “Elveda” anlamına gelen bir veda sözcüğüdür.',
  },
];

/* ---------------------------------------------------------------- */
/* İngilizce · Sınıf ve Günlük Yaşam                                 */
/* ---------------------------------------------------------------- */

const SINIF_NESNE: Row[] = [
  {
    prompt: '{name} sınıfta yazı yazmak için kullanılan aracın İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'pencil',
    wrong: ['ruler', 'eraser', 'bag'],
    why: 'Yazı yazılan kalemin İngilizcesi “pencil” kelimesidir.',
  },
  {
    prompt: '{name} uzunluk ölçmek için kullanılan cetvelin İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'ruler',
    wrong: ['pencil', 'glue', 'clock'],
    why: 'Cetvelin İngilizcesi “ruler” kelimesidir.',
  },
  {
    prompt: '{name} yanlış yazdığı yeri silmek için kullanılan nesnenin İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'eraser',
    wrong: ['crayon', 'ruler', 'map'],
    why: 'Silginin İngilizcesi “eraser” kelimesidir.',
  },
  {
    prompt: '{name} kitaplarını taşıdığı çantanın İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'bag',
    wrong: ['desk', 'board', 'clock'],
    why: 'Okul çantasının İngilizcesi “bag” kelimesidir.',
  },
  {
    prompt: '{name} öğretmenin yazı yazdığı tahtanın İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'board',
    wrong: ['bag', 'chair', 'glue'],
    why: 'Sınıf tahtasının İngilizcesi “board” kelimesidir.',
  },
  {
    prompt: '{name} üzerinde ders çalıştığı masanın İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'desk',
    wrong: ['door', 'window', 'map'],
    why: 'Çalışma masasının İngilizcesi “desk” kelimesidir.',
  },
  {
    prompt: '{name} oturduğu sandalyenin İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'chair',
    wrong: ['desk', 'board', 'book'],
    why: 'Sandalyenin İngilizcesi “chair” kelimesidir.',
  },
  {
    prompt: '{name} boyama yaparken kullandığı pastel boyanın İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'crayon',
    wrong: ['eraser', 'glue', 'ruler'],
    why: 'Pastel boyanın İngilizcesi “crayon” kelimesidir.',
  },
  {
    prompt: '{name} kâğıt kesmek için kullandığı makasın İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'scissors',
    wrong: ['pencil', 'bag', 'clock'],
    why: 'Makasın İngilizcesi “scissors” kelimesidir.',
  },
  {
    prompt: '{name} kâğıt yapıştırmak için kullandığı yapıştırıcının İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'glue',
    wrong: ['eraser', 'crayon', 'map'],
    why: 'Yapıştırıcının İngilizcesi “glue” kelimesidir.',
  },
  {
    prompt: '{name} not aldığı defterin İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'notebook',
    wrong: ['newspaper', 'picture', 'letter'],
    why: 'Defterin İngilizcesi “notebook” kelimesidir.',
  },
  {
    prompt: '{name} sınıfın duvarındaki saatin İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'clock',
    wrong: ['calendar', 'window', 'chair'],
    why: 'Duvar saatinin İngilizcesi “clock” kelimesidir.',
  },
  {
    prompt: '{name} sınıf duvarındaki Türkiye haritasının İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'map',
    wrong: ['picture', 'poster', 'letter'],
    why: 'Haritanın İngilizcesi “map” kelimesidir.',
  },
  {
    prompt: '{name} sınıfta araştırma yaptığı bilgisayarın İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'computer',
    wrong: ['television', 'telephone', 'radio'],
    why: 'Bilgisayarın İngilizcesi “computer” kelimesidir.',
  },
  {
    prompt: '{name} sınıfın girişindeki kapının İngilizcesini arıyor. Doğru kelime hangisidir?',
    answer: 'door',
    wrong: ['window', 'wall', 'floor'],
    why: 'Kapının İngilizcesi “door” kelimesidir.',
  },
];

const SINIF_THIS: Row[] = [
  {
    prompt: '{name} elinde tuttuğu kalemi göstererek “___ is my pencil.” diyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'This',
    wrong: ['That', 'These', 'Those'],
    why: 'Yakındaki tek nesne için “This” kullanılır.',
  },
  {
    prompt: '{name} sınıfın önündeki uzak tahtayı göstererek “___ is a board.” diyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'That',
    wrong: ['This', 'These', 'Those'],
    why: 'Uzaktaki tek nesne için “That” kullanılır.',
  },
  {
    prompt: '{name} masasının üzerindeki kalemleri göstererek “___ are my pencils.” diyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'These',
    wrong: ['This', 'That', 'Those'],
    why: 'Yakındaki birden çok nesne için “These” kullanılır.',
  },
  {
    prompt: '{name} karşı raftaki kitapları göstererek “___ are my books.” diyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'Those',
    wrong: ['This', 'That', 'These'],
    why: 'Uzaktaki birden çok nesne için “Those” kullanılır.',
  },
  {
    prompt: '{name} yakındaki tek bir nesneyi işaret etmek istiyor. Hangi kelimeyi kullanmalıdır?',
    answer: 'this',
    wrong: ['that', 'these', 'those'],
    why: 'Yakındaki tek nesne “this” ile gösterilir.',
  },
  {
    prompt: '{name} uzaktaki tek bir nesneyi işaret etmek istiyor. Hangi kelimeyi kullanmalıdır?',
    answer: 'that',
    wrong: ['this', 'these', 'those'],
    why: 'Uzaktaki tek nesne “that” ile gösterilir.',
  },
  {
    prompt: '{name} yakındaki birden çok nesneyi işaret etmek istiyor. Hangi kelimeyi kullanmalıdır?',
    answer: 'these',
    wrong: ['this', 'that', 'those'],
    why: 'Yakındaki çoğul nesneler “these” ile gösterilir.',
  },
  {
    prompt: '{name} uzaktaki birden çok nesneyi işaret etmek istiyor. Hangi kelimeyi kullanmalıdır?',
    answer: 'those',
    wrong: ['this', 'that', 'these'],
    why: 'Uzaktaki çoğul nesneler “those” ile gösterilir.',
  },
  {
    prompt: '{name} “this” ve “that” arasındaki farkı öğreniyor. Doğru açıklama hangisidir?',
    answer: 'this yakın, that uzak nesne içindir',
    wrong: ['this uzak, that yakın nesne içindir', 'ikisi de yalnızca çoğul içindir', 'ikisi de yalnızca insanlar içindir'],
    why: '“this” yakındaki, “that” uzaktaki tek nesneyi gösterir.',
  },
  {
    prompt: '{name} “What is this?” sorusunu duyuyor. Uygun cevap hangisidir?',
    answer: 'It is a book.',
    wrong: ['They are books.', 'Yes, it is.', 'I am a book.'],
    why: 'Tek nesne sorulduğunda “It is a ...” kalıbıyla cevap verilir.',
  },
  {
    prompt: '{name} “What are these?” sorusunu duyuyor. Uygun cevap hangisidir?',
    answer: 'They are books.',
    wrong: ['It is a book.', 'This is a book.', 'I am a book.'],
    why: 'Çoğul nesne sorulduğunda “They are ...” kalıbı kullanılır.',
  },
  {
    prompt: '{name} “Is this your pen?” sorusuna olumlu cevap veriyor. Uygun cevap hangisidir?',
    answer: 'Yes, it is.',
    wrong: ['Yes, they are.', 'No, it is not.', 'Yes, I am.'],
    why: '“Is this ...?” sorusuna kısa olumlu cevap “Yes, it is.” biçimindedir.',
  },
  {
    prompt: '{name} “Are those your books?” sorusuna olumsuz cevap veriyor. Uygun cevap hangisidir?',
    answer: 'No, they are not.',
    wrong: ['No, it is not.', 'Yes, they are.', 'No, I am not.'],
    why: 'Çoğul özneyle olumsuz kısa cevap “No, they are not.” biçimindedir.',
  },
];

const SINIF_BEAM: Row[] = [
  {
    prompt: '{name} “I ___ a student.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'am',
    wrong: ['is', 'are', 'be'],
    why: '“I” öznesiyle her zaman “am” kullanılır.',
  },
  {
    prompt: '{name} “She ___ my friend.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'is',
    wrong: ['am', 'are', 'be'],
    why: '“She” öznesiyle “is” kullanılır.',
  },
  {
    prompt: '{name} “They ___ in the classroom.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'are',
    wrong: ['am', 'is', 'be'],
    why: '“They” çoğul öznesiyle “are” kullanılır.',
  },
  {
    prompt: '{name} “He ___ nine years old.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'is',
    wrong: ['am', 'are', 'be'],
    why: '“He” öznesiyle “is” kullanılır.',
  },
  {
    prompt: '{name} “We ___ happy today.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'are',
    wrong: ['am', 'is', 'be'],
    why: '“We” çoğul öznesiyle “are” kullanılır.',
  },
  {
    prompt: '{name} “It ___ a cat.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'is',
    wrong: ['am', 'are', 'be'],
    why: '“It” öznesiyle “is” kullanılır.',
  },
  {
    prompt: '{name} “You ___ my best friend.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'are',
    wrong: ['am', 'is', 'be'],
    why: '“You” öznesiyle “are” kullanılır.',
  },
  {
    prompt: '{name} “My mother ___ a teacher.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'is',
    wrong: ['am', 'are', 'be'],
    why: 'Tek kişiyi anlatan “My mother” öznesiyle “is” kullanılır.',
  },
  {
    prompt: '{name} “The books ___ on the desk.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'are',
    wrong: ['am', 'is', 'be'],
    why: '“The books” çoğul özne olduğu için “are” kullanılır.',
  },
  {
    prompt: '{name} “I ___ from Turkey.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'am',
    wrong: ['is', 'are', 'be'],
    why: '“I” öznesi “am” ile kullanılır.',
  },
  {
    prompt: '{name} “Ali and Ayşe ___ students.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'are',
    wrong: ['am', 'is', 'be'],
    why: 'İki kişi birlikte anlatıldığı için çoğul “are” kullanılır.',
  },
  {
    prompt: '{name} “The weather ___ sunny today.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'is',
    wrong: ['am', 'are', 'be'],
    why: '“The weather” tekil özne olduğu için “is” kullanılır.',
  },
  {
    prompt: '{name} “I” öznesiyle hangi yardımcı fiilin kullanıldığını öğreniyor. Doğru seçenek hangisidir?',
    answer: 'am',
    wrong: ['is', 'are', 'be'],
    why: 'İngilizcede “I” öznesi her zaman “am” yardımcı fiilini alır.',
  },
];

const SINIF_ESLES: Row[] = [
  {
    prompt: '{name} “How old are you?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'I am eight.',
    wrong: ['I am from Ankara.', 'It is a ruler.', 'My name is Ali.'],
    why: 'Yaş sorusuna “I am ...” kalıbıyla cevap verilir.',
  },
  {
    prompt: '{name} “Where are you from?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'I am from Turkey.',
    wrong: ['I am eight.', 'It is a ruler.', 'Yes, I do.'],
    why: 'Yer sorusuna “I am from ...” kalıbıyla cevap verilir.',
  },
  {
    prompt: '{name} “What colour is it?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'It is blue.',
    wrong: ['It is a ruler.', 'I am blue.', 'Yes, it is.'],
    why: 'Renk sorusuna “It is + renk” kalıbıyla cevap verilir.',
  },
  {
    prompt: '{name} “What is this?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'It is a ruler.',
    wrong: ['It is blue.', 'I am eight.', 'They are rulers.'],
    why: 'Tek nesne sorusuna “It is a ...” kalıbıyla cevap verilir.',
  },
  {
    prompt: '{name} “Is this your bag?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'Yes, it is.',
    wrong: ['Yes, they are.', 'Yes, I am.', 'Yes, she is.'],
    why: '“Is this ...?” sorusuna kısa cevap “Yes, it is.” biçimindedir.',
  },
  {
    prompt: '{name} “How many books are there?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'Five books.',
    wrong: ['Five years old.', 'Five o’clock.', 'Five times.'],
    why: '“How many” sorusu sayı ister; “Five books.” uygun cevaptır.',
  },
  {
    prompt: '{name} “Do you like milk?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'Yes, I do.',
    wrong: ['Yes, I am.', 'Yes, it is.', 'Yes, I can.'],
    why: '“Do you ...?” sorusuna kısa cevap “Yes, I do.” biçimindedir.',
  },
  {
    prompt: '{name} “What time is it?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'It is nine o’clock.',
    wrong: ['It is nine years.', 'I am nine.', 'Nine books.'],
    why: 'Saat sorusuna “It is ... o’clock.” kalıbıyla cevap verilir.',
  },
  {
    prompt: '{name} “How are you?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'I am fine, thank you.',
    wrong: ['I am nine.', 'It is fine.', 'Yes, I am.'],
    why: 'Hâl hatır sorusuna “I am fine, thank you.” diye cevap verilir.',
  },
  {
    prompt: '{name} “What is your name?” sorusuna cevap veriyor. Uygun cevap hangisidir?',
    answer: 'My name is Ali.',
    wrong: ['I am nine.', 'It is a pencil.', 'I am from Turkey.'],
    why: 'İsim sorusuna “My name is ...” kalıbıyla cevap verilir.',
  },
];

const SINIF_GUNLUK: Row[] = [
  {
    prompt: '{name} “I go to school in the ___.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'morning',
    wrong: ['night', 'evening', 'bed'],
    why: 'Okula sabah gidildiği için “morning” kelimesi uygundur.',
  },
  {
    prompt: '{name} “I brush my teeth ___ I go to bed.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'before',
    wrong: ['after', 'under', 'between'],
    why: 'Dişler yatmadan önce fırçalanır; “before” önce anlamına gelir.',
  },
  {
    prompt: '{name} “We have lunch at ___.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'noon',
    wrong: ['night', 'midnight', 'morning'],
    why: 'Öğle yemeği “noon” yani öğle vaktinde yenir.',
  },
  {
    prompt: '{name} “I ___ my homework after school.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'do',
    wrong: ['make', 'play', 'eat'],
    why: 'Ödev yapmak İngilizcede “do homework” olarak söylenir.',
  },
  {
    prompt: '{name} “I ___ up at seven o’clock.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'get',
    wrong: ['do', 'make', 'take'],
    why: 'Yataktan kalkmak “get up” kalıbıyla anlatılır.',
  },
  {
    prompt: '{name} “I ___ breakfast at eight o’clock.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'have',
    wrong: ['do', 'take', 'get'],
    why: 'Kahvaltı yapmak “have breakfast” kalıbıyla söylenir.',
  },
  {
    prompt: '{name} “I ___ TV in the evening.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'watch',
    wrong: ['look', 'see', 'read'],
    why: 'Televizyon izlemek “watch TV” kalıbıyla anlatılır.',
  },
  {
    prompt: '{name} “I ___ to bed at nine o’clock.” cümlesini tamamlıyor. Boşluğa hangi kelime gelmelidir?',
    answer: 'go',
    wrong: ['get', 'do', 'make'],
    why: 'Yatağa gitmek “go to bed” kalıbıyla söylenir.',
  },
];

/* ---------------------------------------------------------------- */
/* Üretim                                                            */
/* ---------------------------------------------------------------- */

emit({ prefix: 'bulk-ih-gecis', courseName: HAYAT, topic: TOPIC_TRAFIK, count: 30, rows: TRAFIK_GECIS });
emit({ prefix: 'bulk-ih-isik', courseName: HAYAT, topic: TOPIC_TRAFIK, count: 25, rows: TRAFIK_ISIK });
emit({ prefix: 'bulk-ih-arac', courseName: HAYAT, topic: TOPIC_TRAFIK, count: 25, rows: TRAFIK_ARAC });
emit({ prefix: 'bulk-ih-yaya', courseName: HAYAT, topic: TOPIC_TRAFIK, count: 20, rows: TRAFIK_YAYA });
emit({ prefix: 'bulk-ih-levha', courseName: HAYAT, topic: TOPIC_TRAFIK, count: 17, rows: TRAFIK_LEVHA });

emit({ prefix: 'bulk-ih-el', courseName: HAYAT, topic: TOPIC_HIJYEN, count: 30, rows: HIJYEN_EL });
emit({ prefix: 'bulk-ih-bakim', courseName: HAYAT, topic: TOPIC_HIJYEN, count: 30, rows: HIJYEN_BAKIM });
emit({ prefix: 'bulk-ih-besin', courseName: HAYAT, topic: TOPIC_HIJYEN, count: 30, rows: HIJYEN_BESIN });
emit({ prefix: 'bulk-ih-yasam', courseName: HAYAT, topic: TOPIC_HIJYEN, count: 27, rows: HIJYEN_YASAM });

emit({ prefix: 'bulk-ih-arama', courseName: HAYAT, topic: TOPIC_ACIL, count: 30, rows: ACIL_ARAMA });
emit({ prefix: 'bulk-ih-adim', courseName: HAYAT, topic: TOPIC_ACIL, count: 30, rows: ACIL_ADIM });
emit({ prefix: 'bulk-ih-yabanci', courseName: HAYAT, topic: TOPIC_ACIL, count: 28, rows: ACIL_YABANCI });
emit({ prefix: 'bulk-ih-ev', courseName: HAYAT, topic: TOPIC_ACIL, count: 28, rows: ACIL_EV });

emit({ prefix: 'bulk-ii-kelime', courseName: INGILIZCE, topic: TOPIC_KELIME, count: 30, rows: KELIME_TR_EN });
emit({ prefix: 'bulk-ii-tercume', courseName: INGILIZCE, topic: TOPIC_KELIME, count: 30, rows: KELIME_EN_TR });
emit({ prefix: 'bulk-ii-renk', courseName: INGILIZCE, topic: TOPIC_KELIME, count: 20, rows: KELIME_RENK });
emit({ prefix: 'bulk-ii-sayi', courseName: INGILIZCE, topic: TOPIC_KELIME, count: 20, rows: KELIME_SAYI });
emit({ prefix: 'bulk-ii-cogul', courseName: INGILIZCE, topic: TOPIC_KELIME, count: 17, rows: PLURALS });

emit({ prefix: 'bulk-ii-diyalog', courseName: INGILIZCE, topic: TOPIC_SELAM, count: 30, rows: SELAM_DIYALOG });
emit({ prefix: 'bulk-ii-cevap', courseName: INGILIZCE, topic: TOPIC_SELAM, count: 30, rows: SELAM_CEVAP });
emit({ prefix: 'bulk-ii-tanitim', courseName: INGILIZCE, topic: TOPIC_SELAM, count: 30, rows: SELAM_TANITIM });
emit({ prefix: 'bulk-ii-veda', courseName: INGILIZCE, topic: TOPIC_SELAM, count: 27, rows: SELAM_VEDA });

emit({ prefix: 'bulk-ii-nesne', courseName: INGILIZCE, topic: TOPIC_SINIF, count: 30, rows: SINIF_NESNE });
emit({ prefix: 'bulk-ii-this', courseName: INGILIZCE, topic: TOPIC_SINIF, count: 25, rows: SINIF_THIS });
emit({ prefix: 'bulk-ii-beam', courseName: INGILIZCE, topic: TOPIC_SINIF, count: 25, rows: SINIF_BEAM });
emit({ prefix: 'bulk-ii-esles', courseName: INGILIZCE, topic: TOPIC_SINIF, count: 20, rows: SINIF_ESLES });
emit({ prefix: 'bulk-ii-gunluk', courseName: INGILIZCE, topic: TOPIC_SINIF, count: 16, rows: SINIF_GUNLUK });

export { questions };

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'İlkokul::Hayat Bilgisi': {
    'Trafik Güvenliği': topicIds[TOPIC_TRAFIK] ?? [],
    'Hijyen ve Sağlık': topicIds[TOPIC_HIJYEN] ?? [],
    'Acil Durum ve Güvenlik': topicIds[TOPIC_ACIL] ?? [],
  },
  'İlkokul::İngilizce': {
    'Temel Kelimeler': topicIds[TOPIC_KELIME] ?? [],
    'Selamlaşma': topicIds[TOPIC_SELAM] ?? [],
    'Sınıf ve Günlük Yaşam': topicIds[TOPIC_SINIF] ?? [],
  },
};
