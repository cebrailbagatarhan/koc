export type QuestionDifficulty = 'easy' | 'standard' | 'hard';
export type QuestionKind = 'multiple-choice' | 'visual-choice' | 'reading' | 'sequence';

export type QuestionVisualSpec =
  | { kind: 'number-line'; min: number; max: number; points: number[]; highlight?: number }
  | { kind: 'bars'; labels: string[]; values: number[] }
  | { kind: 'icon-grid'; icon: string; count: number; groups?: number }
  | { kind: 'timeline'; items: Array<{ label: string; year: number }> }
  | { kind: 'chips'; items: string[] };

export type EmbeddedQuestionSeed = {
  id: string;
  levelName: string;
  courseName: string;
  topicIndex?: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  questionKind: QuestionKind;
  visual?: QuestionVisualSpec;
};

function distractNumbers(correct: number, steps = [1, -1, 2]): string[] {
  return [correct, ...steps.map((step) => correct + step)]
    .filter((value, index, all) => value >= 0 && all.indexOf(value) === index)
    .slice(0, 4)
    .map(String);
}

function numericQuestion(input: Omit<EmbeddedQuestionSeed, 'options' | 'correctAnswer'> & { answer: number; distractors?: number[] }): EmbeddedQuestionSeed {
  const values = input.distractors ?? distractNumbers(input.answer).map(Number);
  const options = [input.answer, ...values.filter((value) => value !== input.answer)]
    .slice(0, 4)
    .map(String);
  return { ...input, options, correctAnswer: String(input.answer) };
}

function makePrimaryMath(): EmbeddedQuestionSeed[] {
  const result: EmbeddedQuestionSeed[] = [];
  const additions = [[18, 7], [26, 15], [34, 28], [47, 16], [58, 24], [63, 19], [72, 17], [85, 14]];
  additions.forEach(([a, b], index) => {
    const answer = a + b;
    result.push(numericQuestion({
      id: `v10-im-add-${index + 1}`, levelName: 'İlkokul', courseName: 'Matematik', topicIndex: 0,
      prompt: `${a} + ${b} işleminin sonucu kaçtır?`, answer,
      distractors: [answer - 10, answer + 10, answer - 1],
      explanation: `${a} ile ${b} toplandığında ${answer} elde edilir.`, difficulty: index < 4 ? 'easy' : 'standard', questionKind: 'visual-choice',
      visual: { kind: 'bars', labels: [String(a), String(b)], values: [a, b] },
    }));
  });
  const multiplications = [[3, 5], [4, 6], [7, 3], [8, 4], [6, 6], [9, 5], [7, 8], [9, 7]];
  multiplications.forEach(([a, b], index) => {
    const answer = a * b;
    result.push(numericQuestion({
      id: `v10-im-mul-${index + 1}`, levelName: 'İlkokul', courseName: 'Matematik', topicIndex: 2,
      prompt: `${a} grup var ve her grupta ${b} nesne bulunuyor. Toplam kaç nesne vardır?`, answer,
      distractors: [a + b, answer - a, answer + b],
      explanation: `${a} × ${b} = ${answer}.`, difficulty: index < 4 ? 'easy' : 'standard', questionKind: 'visual-choice',
      visual: { kind: 'icon-grid', icon: '●', count: answer, groups: a },
    }));
  });
  [2, 4, 6, 8, 10, 12, 14, 16].forEach((value, index) => {
    const answer = value + 2;
    result.push(numericQuestion({
      id: `v10-im-line-${index + 1}`, levelName: 'İlkokul', courseName: 'Matematik', topicIndex: 1,
      prompt: `${value} sayısından sayı doğrusunda 2 adım sağa gidersek hangi sayıya ulaşırız?`, answer,
      distractors: [value - 2, value + 1, value + 3],
      explanation: 'Sayı doğrusunda sağa gitmek sayıyı büyütür.', difficulty: 'easy', questionKind: 'visual-choice',
      visual: { kind: 'number-line', min: Math.max(0, value - 2), max: value + 4, points: [value, answer], highlight: value },
    }));
  });
  return result;
}

const PRIMARY_TURKISH_WORDS = [
  ['hızlı', 'yavaş'], ['uzun', 'kısa'], ['sıcak', 'soğuk'], ['erken', 'geç'], ['açık', 'kapalı'],
  ['büyük', 'küçük'], ['genç', 'yaşlı'], ['temiz', 'kirli'], ['yakın', 'uzak'], ['kolay', 'zor'],
];

function makePrimaryTurkish(): EmbeddedQuestionSeed[] {
  return PRIMARY_TURKISH_WORDS.flatMap(([word, opposite], index) => [
    {
      id: `v10-it-ant-${index + 1}`, levelName: 'İlkokul', courseName: 'Türkçe', topicIndex: 0,
      prompt: `“${word}” kelimesinin zıt anlamlısı hangisidir?`, options: [opposite, word, 'güzel', 'doğru'], correctAnswer: opposite,
      explanation: `“${word}” ile “${opposite}” zıt anlamlıdır.`, difficulty: 'easy' as const, questionKind: 'multiple-choice' as const,
      visual: { kind: 'chips' as const, items: [word, opposite] },
    },
    {
      id: `v10-it-sentence-${index + 1}`, levelName: 'İlkokul', courseName: 'Türkçe', topicIndex: 1,
      prompt: `Aşağıdaki cümlelerden hangisinde “${word}” sözcüğü doğru bir bağlamda kullanılmıştır?`,
      options: [`Bu yol oldukça ${word}.`, `Masanın üzerinde ${word} var.`, `${word} kitabı içtim.`, `Kalemi ${word} duydum.`],
      correctAnswer: `Bu yol oldukça ${word}.`, explanation: 'Sözcük anlamına uygun bir sıfat görevinde kullanılmıştır.', difficulty: 'standard' as const, questionKind: 'reading' as const,
    },
  ]);
}

const LIFE_SCENARIOS = [
  ['Karşıdan karşıya geçeceksin.', 'Yaya geçidini kullanmak', 'Araçların arasından koşmak', 'Virajdan geçmek', 'Telefona bakarak yürümek'],
  ['Yemekten önce ellerin kirli.', 'Ellerini sabunla yıkamak', 'Sadece suya bakmak', 'Hiçbir şey yapmamak', 'Ellerini kıyafete silmek'],
  ['Evde duman kokusu fark ettin.', 'Güvenli bir yetişkine haber vermek', 'Saklanmak', 'Ateşe yaklaşmak', 'Pencereyi kapatıp beklemek'],
  ['Bisiklete bineceksin.', 'Kask takmak', 'Gözleri kapatmak', 'Trafiğin ters yönüne gitmek', 'Ellerini gidondan çekmek'],
  ['Güneşli bir günde uzun süre dışarıdasın.', 'Su içmek ve güneşten korunmak', 'Hiç su içmemek', 'Kalın mont giymek', 'Gölgede asla durmamak'],
  ['Tanımadığın biri kişisel bilgini soruyor.', 'Paylaşmamak ve güvendiğin yetişkine söylemek', 'Adresini vermek', 'Şifreni söylemek', 'Telefonunu teslim etmek'],
  ['Arkadaşın düşüp yaralandı.', 'Bir yetişkinden yardım istemek', 'Onu yalnız bırakmak', 'Koşmasını istemek', 'Yarayı kirletmek'],
  ['Sınıfta ortak malzemeyi kullanacaksın.', 'Sırayla ve dikkatli kullanmak', 'Zorla almak', 'Kırmak', 'Saklamak'],
  ['Deprem sırasında sınıftasın.', 'Çök-kapan-tutun uygulamak', 'Pencereden atlamak', 'Asansöre koşmak', 'Dolapların yanına dikilmek'],
  ['Çöpleri atıyorsun.', 'Uygun çöp kutusunu kullanmak', 'Yere bırakmak', 'Parka atmak', 'Masada bırakmak'],
];

function makeLifeKnowledge(): EmbeddedQuestionSeed[] {
  return LIFE_SCENARIOS.flatMap((scenario, index) => {
    const [prompt, correct, wrong1, wrong2, wrong3] = scenario;
    return [0, 1].map((variant) => ({
      id: `v10-ih-${index + 1}-${variant + 1}`, levelName: 'İlkokul', courseName: 'Hayat Bilgisi', topicIndex: index % 3,
      prompt: variant === 0 ? `${prompt} En güvenli davranış hangisidir?` : `${prompt} Öncelikle ne yapmalısın?`,
      options: [correct, wrong1, wrong2, wrong3], correctAnswer: correct,
      explanation: `${correct}, güvenliği ve sağlığı önceleyen davranıştır.`, difficulty: variant === 0 ? 'easy' : 'standard', questionKind: 'visual-choice',
      visual: { kind: 'chips', items: ['🛡️ Güvenlik', '🧠 Düşün', '✅ Doğru seçim'] },
    }));
  });
}

const PRIMARY_ENGLISH = [
  ['apple', 'elma', '🍎'], ['book', 'kitap', '📘'], ['water', 'su', '💧'], ['school', 'okul', '🏫'], ['cat', 'kedi', '🐱'],
  ['dog', 'köpek', '🐶'], ['sun', 'güneş', '☀️'], ['moon', 'ay', '🌙'], ['house', 'ev', '🏠'], ['car', 'araba', '🚗'],
  ['tree', 'ağaç', '🌳'], ['bird', 'kuş', '🐦'], ['milk', 'süt', '🥛'], ['bread', 'ekmek', '🍞'], ['friend', 'arkadaş', '🧑‍🤝‍🧑'],
];

function makePrimaryEnglish(): EmbeddedQuestionSeed[] {
  return PRIMARY_ENGLISH.flatMap(([english, turkish, icon], index) => [
    {
      id: `v10-ii-en-${index + 1}`, levelName: 'İlkokul', courseName: 'İngilizce', topicIndex: index % 3,
      prompt: `${icon} “${turkish}” kelimesinin İngilizcesi hangisidir?`, options: [english, 'table', 'green', 'play'], correctAnswer: english,
      explanation: `${english} = ${turkish}.`, difficulty: 'easy' as const, questionKind: 'visual-choice' as const,
      visual: { kind: 'icon-grid' as const, icon, count: 1 },
    },
    {
      id: `v10-ii-tr-${index + 1}`, levelName: 'İlkokul', courseName: 'İngilizce', topicIndex: index % 3,
      prompt: `“${english}” kelimesinin Türkçesi hangisidir?`, options: [turkish, 'masa', 'yeşil', 'oyun'], correctAnswer: turkish,
      explanation: `${english} kelimesi Türkçede “${turkish}” anlamına gelir.`, difficulty: 'easy' as const, questionKind: 'multiple-choice' as const,
    },
  ]);
}

function makeMiddleMath(): EmbeddedQuestionSeed[] {
  const result: EmbeddedQuestionSeed[] = [];
  for (let x = 2; x <= 11; x += 1) {
    const a = (x % 4) + 2;
    const b = x + 3;
    const c = a * x + b;
    result.push(numericQuestion({
      id: `v10-om-eq-${x}`, levelName: 'Ortaokul', courseName: 'Matematik', topicIndex: 0,
      prompt: `${a}x + ${b} = ${c} olduğuna göre x kaçtır?`, answer: x, distractors: [x - 1, x + 1, x + 2],
      explanation: `Önce ${b} çıkarılır, sonra ${a}'e bölünür: x = ${x}.`, difficulty: x < 6 ? 'standard' : 'hard', questionKind: 'multiple-choice',
    }));
  }
  const percents = [[20, 150], [25, 240], [40, 90], [15, 200], [30, 350], [60, 80], [75, 120], [10, 450]];
  percents.forEach(([p, n], index) => {
    const answer = (p * n) / 100;
    result.push(numericQuestion({
      id: `v10-om-pct-${index + 1}`, levelName: 'Ortaokul', courseName: 'Matematik', topicIndex: 1,
      prompt: `${n} sayısının %${p}'i kaçtır?`, answer, distractors: [answer + 10, answer - 10, p],
      explanation: `${n} × ${p}/100 = ${answer}.`, difficulty: 'standard', questionKind: 'visual-choice',
      visual: { kind: 'bars', labels: ['Bütün', `%${p}`], values: [n, answer] },
    }));
  });
  [35, 48, 72, 105, 126, 144, 180, 216].forEach((angle, index) => {
    const answer = 180 - angle;
    result.push(numericQuestion({
      id: `v10-om-angle-${index + 1}`, levelName: 'Ortaokul', courseName: 'Matematik', topicIndex: 2,
      prompt: `Bir üçgende iki açının toplamı ${angle}° ise üçüncü açı kaç derecedir?`, answer,
      distractors: [angle, Math.abs(90 - angle), answer + 10], explanation: `Üçgenin iç açıları toplamı 180° olduğundan 180 - ${angle} = ${answer}°.`,
      difficulty: 'standard', questionKind: 'multiple-choice',
    }));
  });
  return result;
}

const MIDDLE_TURKISH_PASSAGES = [
  ['Yağmur sabah boyunca sürdü. Öğleden sonra bulutlar dağıldı ve çocuklar parka çıktı.', 'Hava düzelince çocukların parka çıkması', 'Çocukların bütün gün evde kalması'],
  ['Mert, sınava son gece çalışmak yerine her gün yirmi dakika tekrar yaptı. Sınav günü kendini daha sakin hissetti.', 'Düzenli çalışmanın güven verdiği', 'Son gece çalışmanın en iyi yöntem olduğu'],
  ['Kütüphanede sessizlik, yalnızca kural olduğu için değil, herkesin okuduğunu anlayabilmesi için önemlidir.', 'Sessizliğin ortak çalışma ortamını koruduğu', 'Kütüphanede konuşmanın zorunlu olduğu'],
  ['Bir ağacı büyütmek yalnızca fidan dikmekle bitmez; düzenli sulama ve bakım da gerekir.', 'Sürekliliğin bakımda önemli olduğu', 'Fidanın bakıma ihtiyaç duymadığı'],
  ['Teknoloji doğru kullanıldığında öğrenmeyi hızlandırabilir; ancak dikkati dağıtan kullanım zamanı boşa harcatabilir.', 'Teknolojinin kullanım biçiminin önemli olduğu', 'Teknolojinin her durumda zararlı olduğu'],
  ['Bir problemi çözmeden önce soruda ne istendiğini anlamak, çoğu zaman işlemi yapmaktan daha önemlidir.', 'Problemi anlamanın çözümün temeli olduğu', 'İşlemlerin sorudan bağımsız olduğu'],
  ['Takım sporlarında yalnızca iyi oynamak değil, arkadaşlarının konumunu fark etmek de başarıyı artırır.', 'Takım çalışmasının bireysel beceriyi tamamladığı', 'Takım arkadaşlarının önemsiz olduğu'],
  ['Bir metni hızlı okumak her zaman iyi anlamak demek değildir. Gerektiğinde durup ana fikri kontrol etmek faydalıdır.', 'Anlama için okuma hızını ayarlamak gerektiği', 'En hızlı okuyan kişinin her şeyi anladığı'],
];

function makeMiddleTurkish(): EmbeddedQuestionSeed[] {
  return MIDDLE_TURKISH_PASSAGES.flatMap(([passage, correct, wrong], index) => [
    {
      id: `v10-ot-main-${index + 1}`, levelName: 'Ortaokul', courseName: 'Türkçe', topicIndex: 2,
      prompt: `Parçanın ana düşüncesi hangisidir?\n\n${passage}`, options: [correct, wrong, 'Metinde hiçbir düşünce savunulmamıştır.', 'Yalnızca bir tarih verilmiştir.'], correctAnswer: correct,
      explanation: 'Doğru seçenek parçanın tamamını kapsayan temel düşünceyi verir.', difficulty: 'standard' as const, questionKind: 'reading' as const,
    },
    {
      id: `v10-ot-evidence-${index + 1}`, levelName: 'Ortaokul', courseName: 'Türkçe', topicIndex: 1,
      prompt: `Bu parçadan çıkarılabilecek en güvenli yargı hangisidir?\n\n${passage}`, options: [correct, wrong, 'Metin bunun tam tersini kesin olarak söyler.', 'Parçada konuya ilişkin hiçbir ipucu yoktur.'], correctAnswer: correct,
      explanation: 'Çıkarım, metinde verilen bilgiyle doğrudan desteklenmelidir.', difficulty: 'hard' as const, questionKind: 'reading' as const,
    },
  ]);
}

const SCIENCE_FACTS = [
  ['Suyun deniz seviyesinde normal kaynama sıcaklığı kaç °C’dir?', '100', ['0', '50', '200'], 'Standart atmosfer basıncında su 100 °C civarında kaynar.'],
  ['Kuvvetin SI birimi hangisidir?', 'Newton', ['Joule', 'Watt', 'Pascal'], 'Kuvvetin SI birimi newtondur (N).'],
  ['Bitkiler fotosentez sırasında hangi gazı kullanır?', 'Karbondioksit', ['Oksijen', 'Azot', 'Helyum'], 'Fotosentezde karbondioksit ve su kullanılarak besin üretilir.'],
  ['Basit bir elektrik devresinde akımın oluşması için devre nasıl olmalıdır?', 'Kapalı', ['Açık', 'Kopuk', 'Yalıtılmış'], 'Akımın dolaşabilmesi için iletken yolun kapalı olması gerekir.'],
  ['Maddenin katı hâlden sıvı hâle geçmesine ne denir?', 'Erime', ['Donma', 'Yoğuşma', 'Süblimleşme'], 'Katıdan sıvıya geçiş erimedir.'],
  ['Dünya’nın doğal uydusu hangisidir?', 'Ay', ['Mars', 'Venüs', 'Güneş'], 'Ay, Dünya’nın doğal uydusudur.'],
  ['Ses boşlukta yayılır mı?', 'Hayır', ['Evet', 'Her zaman daha hızlı', 'Yalnız geceleri'], 'Ses mekanik dalgadır ve yayılmak için ortama ihtiyaç duyar.'],
  ['Bir cismin hareket durumunu değiştirebilen etkiye ne denir?', 'Kuvvet', ['Sıcaklık', 'Hacim', 'Yoğunluk'], 'Kuvvet hızın büyüklüğünü veya yönünü değiştirebilir.'],
  ['Buzun erimesi hangi tür değişime örnektir?', 'Fiziksel değişim', ['Kimyasal değişim', 'Nükleer değişim', 'Canlılık'], 'Maddenin kimliği değişmediği için fiziksel değişimdir.'],
  ['Besin zincirinin başlangıcında çoğunlukla hangi canlı grubu bulunur?', 'Üreticiler', ['Tüketiciler', 'Ayrıştırıcılar', 'Yırtıcılar'], 'Üreticiler ışık gibi kaynaklardan enerji kullanarak organik madde üretir.'],
];

function makeMiddleScience(): EmbeddedQuestionSeed[] {
  return SCIENCE_FACTS.flatMap(([prompt, correct, wrongs, explanation], index) => [0, 1].map((variant) => ({
    id: `v10-of-${index + 1}-${variant + 1}`, levelName: 'Ortaokul', courseName: 'Fen Bilimleri', topicIndex: index % 3,
    prompt: variant === 0 ? String(prompt) : `Bilgiyi uygula: ${prompt}`,
    options: [String(correct), ...(wrongs as string[])], correctAnswer: String(correct), explanation: String(explanation),
    difficulty: variant === 0 ? 'easy' : 'standard', questionKind: variant === 0 ? 'multiple-choice' : 'visual-choice',
    visual: variant === 1 ? { kind: 'chips', items: ['🔬 Gözlem', '🧪 Deney', '🧠 Sonuç'] } : undefined,
  })));
}

const SOCIAL_FACTS = [
  ['Türkiye’nin başkenti hangisidir?', 'Ankara', ['İstanbul', 'İzmir', 'Bursa'], 'Türkiye’nin başkenti Ankara’dır.'],
  ['Güneşin doğduğu ana yön hangisidir?', 'Doğu', ['Batı', 'Kuzey', 'Güney'], 'Güneş genel yön bulmada doğu yönüyle ilişkilendirilir.'],
  ['Seçimlerde oy kullanmak hangi kavramla en yakından ilişkilidir?', 'Demokratik katılım', ['Erozyon', 'İklim', 'Sanayi'], 'Oy kullanmak demokratik katılım yollarından biridir.'],
  ['Haritalarda kuzey çoğunlukla hangi tarafta gösterilir?', 'Üst', ['Alt', 'Sol', 'Sağ'], 'Standart haritalarda kuzey genellikle üst taraftadır.'],
  ['Bir ürünün başka bir ülkeye satılmasına ne denir?', 'İhracat', ['İthalat', 'Göç', 'Turizm'], 'Ülke dışına mal satışı ihracattır.'],
  ['Nüfusun bir yerden başka bir yere taşınmasına ne denir?', 'Göç', ['Erozyon', 'Üretim', 'Seçim'], 'İnsanların yer değiştirmesi göç olarak adlandırılır.'],
  ['Vatandaşların ortak karar süreçlerine katılması neyi güçlendirir?', 'Demokrasiyi', ['Kuraklığı', 'Erozyonu', 'İzolasyonu'], 'Katılım, demokratik yönetimin temel unsurlarındandır.'],
  ['Bir yerin uzun yıllar boyunca gözlenen hava koşullarına ne denir?', 'İklim', ['Hava olayı', 'Nüfus', 'Yer şekli'], 'İklim uzun dönemli ortalama koşulları ifade eder.'],
  ['Doğal kaynakları gereksiz tüketmemek hangi davranışa örnektir?', 'Sürdürülebilirlik', ['İsraf', 'Kirlilik', 'Düzensizlik'], 'Kaynakları gelecek kuşakları düşünerek kullanmak sürdürülebilirliktir.'],
  ['Bir olayın gerçekleşme sırasını göstermek için en uygun araç hangisidir?', 'Zaman çizelgesi', ['Termometre', 'Pusula', 'Cetvel'], 'Zaman çizelgesi olayların kronolojik sırasını görselleştirir.'],
];

function makeMiddleSocial(): EmbeddedQuestionSeed[] {
  return SOCIAL_FACTS.flatMap(([prompt, correct, wrongs, explanation], index) => [0, 1].map((variant) => ({
    id: `v10-os-${index + 1}-${variant + 1}`, levelName: 'Ortaokul', courseName: 'Sosyal Bilgiler', topicIndex: index % 3,
    prompt: String(prompt), options: [String(correct), ...(wrongs as string[])], correctAnswer: String(correct), explanation: String(explanation),
    difficulty: variant === 0 ? 'easy' : 'standard', questionKind: variant === 0 ? 'multiple-choice' : 'visual-choice',
    visual: variant === 1 ? { kind: 'chips', items: ['🗺️ Yer', '🧭 Yön', '🏛️ Toplum'] } : undefined,
  })));
}

const MIDDLE_ENGLISH_GRAMMAR = [
  ['She ___ to school every day.', 'goes', ['go', 'going', 'gone'], 'Simple present üçüncü tekil kişide fiile -s/-es gelir.'],
  ['I ___ breakfast at 7 a.m.', 'have', ['has', 'having', 'had always'], 'I öznesiyle simple presentte “have” kullanılır.'],
  ['They ___ football on Saturdays.', 'play', ['plays', 'playing always', 'played every'], 'They ile fiilin yalın hâli kullanılır.'],
  ['He is ___ than his brother.', 'taller', ['tallest', 'more tall', 'tall'], 'İki kişi karşılaştırılırken comparative form “taller” kullanılır.'],
  ['We ___ watching a film now.', 'are', ['is', 'am', 'be'], 'Present continuous: we + are + V-ing.'],
  ['There ___ two books on the table.', 'are', ['is', 'am', 'be'], 'Çoğul isimle “there are” kullanılır.'],
  ['I have ___ apple.', 'an', ['a', 'the always', 'some one'], 'Sesli harfle başlayan tekil sayılabilir isimden önce “an” gelir.'],
  ['How ___ do you exercise?', 'often', ['many', 'old', 'much time'], 'Sıklık sormak için “How often” kullanılır.'],
  ['My sister can ___ very well.', 'swim', ['swims', 'swimming', 'swam'], 'Can modalından sonra fiilin yalın hâli gelir.'],
  ['We ___ not like noisy places.', 'do', ['does', 'are', 'is'], 'We ile simple present olumsuz yapıda “do not” kullanılır.'],
];

function makeMiddleEnglish(): EmbeddedQuestionSeed[] {
  return MIDDLE_ENGLISH_GRAMMAR.flatMap(([prompt, correct, wrongs, explanation], index) => [0, 1].map((variant) => ({
    id: `v10-oi-${index + 1}-${variant + 1}`, levelName: 'Ortaokul', courseName: 'İngilizce', topicIndex: index % 3,
    prompt: String(prompt), options: [String(correct), ...(wrongs as string[])], correctAnswer: String(correct), explanation: String(explanation),
    difficulty: variant === 0 ? 'standard' : 'hard', questionKind: variant === 0 ? 'multiple-choice' : 'visual-choice',
    visual: variant === 1 ? { kind: 'chips', items: String(prompt).split(' ') } : undefined,
  })));
}

function makeHighMath(): EmbeddedQuestionSeed[] {
  const result: EmbeddedQuestionSeed[] = [];
  for (let x = -5; x <= 6; x += 1) {
    const a = (Math.abs(x) % 3) + 2;
    const b = x + 4;
    const answer = a * x + b;
    result.push(numericQuestion({
      id: `v10-lm-f-${x + 6}`, levelName: 'Lise', courseName: 'Matematik', topicIndex: 0,
      prompt: `f(x) = ${a}x + ${b} olduğuna göre f(${x}) kaçtır?`, answer,
      distractors: [answer + a, answer - b, answer + 1], explanation: `x yerine ${x} yazılır: ${a}·(${x}) + ${b} = ${answer}.`,
      difficulty: 'standard', questionKind: 'visual-choice', visual: { kind: 'number-line', min: -6, max: 8, points: [x], highlight: x },
    }));
  }
  const roots = [[1, -5, 6], [1, -7, 12], [1, -9, 20], [1, -11, 30], [1, -13, 42], [1, -15, 56], [1, -8, 15], [1, -10, 21]];
  roots.forEach(([a, b, c], index) => {
    const disc = b * b - 4 * a * c;
    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
    const answer = r1 + r2;
    result.push(numericQuestion({
      id: `v10-lm-root-${index + 1}`, levelName: 'Lise', courseName: 'Matematik', topicIndex: 1,
      prompt: `x² ${b < 0 ? '-' : '+'} ${Math.abs(b)}x + ${c} = 0 denkleminin kökleri toplamı kaçtır?`, answer,
      distractors: [r1 * r2, answer + 1, Math.abs(b)], explanation: `Kökler toplamı -b/a = ${answer}.`, difficulty: 'hard', questionKind: 'multiple-choice',
    }));
  });
  const probabilities = [[1, 6], [2, 6], [3, 8], [4, 10], [5, 12], [2, 5], [3, 10], [7, 20]];
  probabilities.forEach(([favorable, total], index) => {
    const fraction = `${favorable}/${total}`;
    result.push({
      id: `v10-lm-prob-${index + 1}`, levelName: 'Lise', courseName: 'Matematik', topicIndex: 2,
      prompt: `${total} eş olasılıklı durumun ${favorable} tanesi istenen durumsa olasılık kaçtır?`,
      options: [fraction, `${total}/${favorable}`, `${favorable}/${total + 1}`, `${favorable + 1}/${total}`], correctAnswer: fraction,
      explanation: `Olasılık = istenen durum / tüm durum = ${favorable}/${total}.`, difficulty: 'standard', questionKind: 'visual-choice',
      visual: { kind: 'icon-grid', icon: '●', count: total, groups: favorable },
    });
  });
  return result;
}

const PHYSICS_NUMERIC = [
  ['Bir araç 120 m yolu 20 s’de alıyor. Ortalama sürati kaç m/s’dir?', 6, 'v = yol / zaman = 120 / 20 = 6 m/s.'],
  ['Kütlesi 4 kg olan cisme 3 m/s² ivme kazandıran net kuvvet kaç N’dur?', 12, 'F = m·a = 4·3 = 12 N.'],
  ['20 N kuvvet bir cismi kuvvet yönünde 5 m hareket ettiriyor. Yapılan iş kaç J’dür?', 100, 'W = F·x = 20·5 = 100 J.'],
  ['12 V gerilim altında 4 Ω dirençten geçen akım kaç A’dır?', 3, 'I = V/R = 12/4 = 3 A.'],
  ['2 kg kütle 5 m/s hızla hareket ediyor. Kinetik enerjisi kaç J’dür?', 25, 'Ek = 1/2·m·v² = 1/2·2·25 = 25 J.'],
  ['10 N kuvvet 2 kg cisme etki ediyor. İvme kaç m/s² olur?', 5, 'a = F/m = 10/2 = 5 m/s².'],
  ['60 W gücündeki cihaz 10 s çalışırsa kaç J enerji kullanır?', 600, 'E = P·t = 60·10 = 600 J.'],
  ['30 m/s hızla 4 s giden araç kaç metre yol alır?', 120, 'x = v·t = 30·4 = 120 m.'],
  ['5 Ω ve 10 Ω direnç seri bağlıysa eşdeğer direnç kaç Ω olur?', 15, 'Seri bağlı dirençler toplanır: 5 + 10 = 15 Ω.'],
  ['200 J iş 20 s’de yapılıyor. Güç kaç W’dır?', 10, 'P = W/t = 200/20 = 10 W.'],
];

function makePhysics(): EmbeddedQuestionSeed[] {
  return PHYSICS_NUMERIC.flatMap(([prompt, answerValue, explanation], index) => {
    const answer = Number(answerValue);
    return [0, 1].map((variant) => numericQuestion({
      id: `v10-lf-${index + 1}-${variant + 1}`, levelName: 'Lise', courseName: 'Fizik', topicIndex: index % 3,
      prompt: String(prompt), answer, distractors: [answer + 5, Math.max(0, answer - 5), answer * 2], explanation: String(explanation),
      difficulty: variant === 0 ? 'standard' : 'hard', questionKind: variant === 0 ? 'multiple-choice' : 'visual-choice',
      visual: variant === 1 ? { kind: 'bars', labels: ['Veri', 'Sonuç'], values: [Math.max(1, Math.min(answer, 100)), Math.max(1, Math.min(answer / 2, 100))] } : undefined,
    }));
  });
}

const CHEMISTRY_FACTS = [
  ['Atom numarası hangi parçacık sayısına eşittir?', 'Proton', ['Nötron', 'Molekül', 'İzotop'], 'Atom numarası çekirdekteki proton sayısını verir.'],
  ['pH değeri 7 olan saf su nasıl sınıflandırılır?', 'Nötr', ['Asidik', 'Bazik', 'Metal'], '25 °C civarında saf suyun pH’ı yaklaşık 7’dir.'],
  ['NaCl bileşiğinin yaygın adı hangisidir?', 'Sofra tuzu', ['Şeker', 'Sirke', 'Karbonat'], 'NaCl sodyum klorürdür ve sofra tuzunun temel bileşenidir.'],
  ['H₂O molekülünde kaç hidrojen atomu vardır?', '2', ['1', '3', '4'], 'Formüldeki alt indis iki hidrojen atomunu gösterir.'],
  ['Periyodik tabloda aynı gruptaki elementler genellikle ne bakımından benzerlik gösterir?', 'Kimyasal özellikler', ['Kütle numarası', 'Nötron sayısı', 'Fiziksel boyut kesinliği'], 'Aynı gruptaki elementlerin değerlik elektron düzenleri benzerdir.'],
  ['Asitler mavi turnusol kâğıdını hangi renge çevirir?', 'Kırmızı', ['Mavi', 'Yeşil', 'Siyah'], 'Asidik ortam mavi turnusolü kırmızıya çevirir.'],
  ['Bir mol madde yaklaşık kaç temel tanecik içerir?', '6,02×10²³', ['3,14×10⁸', '9,81×10²', '1×10³'], 'Avogadro sayısı yaklaşık 6,02×10²³ mol⁻¹’dir.'],
  ['Elektronun elektrik yükü nasıldır?', 'Negatif', ['Pozitif', 'Nötr', 'Değişmez yükü yok'], 'Elektron negatif yüklüdür.'],
  ['Kimyasal tepkimede toplam kütlenin korunması hangi yasayla ifade edilir?', 'Kütlenin korunumu', ['Ohm yasası', 'Hooke yasası', 'Kepler yasası'], 'Kapalı sistemde tepkime öncesi ve sonrası toplam kütle eşittir.'],
  ['O₂ molekülü kaç oksijen atomundan oluşur?', '2', ['1', '3', '4'], 'O₂ iki oksijen atomundan oluşan iki atomlu moleküldür.'],
];

function makeChemistry(): EmbeddedQuestionSeed[] {
  return CHEMISTRY_FACTS.flatMap(([prompt, correct, wrongs, explanation], index) => [0, 1].map((variant) => ({
    id: `v10-lk-${index + 1}-${variant + 1}`, levelName: 'Lise', courseName: 'Kimya', topicIndex: index % 3,
    prompt: String(prompt), options: [String(correct), ...(wrongs as string[])], correctAnswer: String(correct), explanation: String(explanation),
    difficulty: variant === 0 ? 'standard' : 'hard', questionKind: variant === 0 ? 'multiple-choice' : 'visual-choice',
    visual: variant === 1 ? { kind: 'chips', items: ['⚛️ Atom', '🧪 Madde', '🔗 Bağ'] } : undefined,
  })));
}

const BIOLOGY_FACTS = [
  ['Hücrenin enerji üretiminde öne çıkan organeli hangisidir?', 'Mitokondri', ['Ribozom', 'Golgi aygıtı', 'Lizozom'], 'Mitokondri hücresel solunum ve ATP üretiminde temel rol oynar.'],
  ['Protein sentezinin gerçekleştiği yapı hangisidir?', 'Ribozom', ['Koful', 'Sentrozom', 'Hücre duvarı'], 'Ribozomlar protein sentezler.'],
  ['DNA’nın temel yapı birimi hangisidir?', 'Nükleotit', ['Amino asit', 'Yağ asidi', 'Monosakkarit'], 'DNA nükleotitlerden oluşur.'],
  ['Fotosentez hangi organelde gerçekleşir?', 'Kloroplast', ['Mitokondri', 'Çekirdek', 'Ribozom'], 'Bitki hücrelerinde fotosentez kloroplastta gerçekleşir.'],
  ['İnsanda oksijenin büyük kısmını taşıyan kan hücresi hangisidir?', 'Alyuvar', ['Akyuvar', 'Trombosit', 'Nöron'], 'Alyuvarlardaki hemoglobin oksijen taşır.'],
  ['Kalıtsal bilginin temel taşıyıcısı hangisidir?', 'DNA', ['ATP', 'Su', 'Glikoz'], 'DNA kalıtsal bilgiyi taşır.'],
  ['Ekosistemde organik atıkları parçalayarak madde döngüsüne katkı sağlayanlar hangileridir?', 'Ayrıştırıcılar', ['Üreticiler', 'Birincil tüketiciler', 'Yalnız yırtıcılar'], 'Ayrıştırıcılar organik maddeleri parçalar.'],
  ['Bitki hücresini hayvan hücresinden ayıran yapılardan biri hangisidir?', 'Hücre duvarı', ['Hücre zarı', 'Sitoplazma', 'Ribozom'], 'Bitki hücrelerinde selüloz yapılı hücre duvarı bulunur.'],
  ['Sinir sisteminin temel işlevsel hücresi hangisidir?', 'Nöron', ['Alyuvar', 'Osteosit', 'Kas lifi'], 'Nöronlar uyarıları iletir.'],
  ['Enzimlerin temel görevi nedir?', 'Tepkimeleri hızlandırmak', ['DNA’yı yok etmek', 'Enerjiyi tamamen tüketmek', 'Suyu dondurmak'], 'Enzimler aktivasyon enerjisini düşüren biyolojik katalizörlerdir.'],
];

function makeBiology(): EmbeddedQuestionSeed[] {
  return BIOLOGY_FACTS.flatMap(([prompt, correct, wrongs, explanation], index) => [0, 1].map((variant) => ({
    id: `v10-lb-${index + 1}-${variant + 1}`, levelName: 'Lise', courseName: 'Biyoloji', topicIndex: index % 3,
    prompt: String(prompt), options: [String(correct), ...(wrongs as string[])], correctAnswer: String(correct), explanation: String(explanation),
    difficulty: variant === 0 ? 'standard' : 'hard', questionKind: variant === 0 ? 'multiple-choice' : 'visual-choice',
    visual: variant === 1 ? { kind: 'chips', items: ['🧬 Bilgi', '🔬 Yapı', '⚙️ Görev'] } : undefined,
  })));
}

const LITERATURE_FACTS = [
  ['Bir olay çevresinde gelişen, kişi-yer-zaman unsurlarını kullanan kısa anlatı türü hangisidir?', 'Hikâye', ['Makale', 'Sözlük', 'Dilekçe'], 'Hikâye olay çevresinde gelişen kısa anlatı türüdür.'],
  ['Şiirde dizelerin bir araya gelerek oluşturduğu kümeye ne denir?', 'Bent', ['Paragraf', 'Başlık', 'Dipnot'], 'Birden çok dize bent oluşturabilir.'],
  ['Bir metinde anlatıcının olayların içinde kahraman olarak yer aldığı bakış açısı hangisidir?', 'Kahraman anlatıcı', ['İlahi anlatıcı', 'Gözlemci anlatıcı', 'Nesnel başlık'], 'Birinci kişi anlatımında anlatıcı olayın içindedir.'],
  ['Bir düşünceyi kanıtlama amacı taşıyan öğretici yazı türlerinden biri hangisidir?', 'Makale', ['Masal', 'Tekerleme', 'Ninni'], 'Makale düşünceyi açıklama ve kanıtlama amacı taşıyabilir.'],
  ['İnsan dışındaki varlıklara insan özelliği verilmesine ne denir?', 'Kişileştirme', ['Abartma', 'Karşıtlık', 'Eksiltme'], 'Kişileştirmede insan özelliği başka varlıklara aktarılır.'],
  ['Bir sözcüğün gerçek anlamından uzaklaşarak başka bir anlamda kullanılmasına ne denir?', 'Mecaz', ['Terim', 'Özel ad', 'Ünlü düşmesi'], 'Mecaz kullanımda sözcük gerçek anlamından uzaklaşır.'],
  ['Romanı hikâyeden ayıran genel özelliklerden biri hangisidir?', 'Daha geniş olay ve kişi örgüsü', ['Mutlaka şiir biçiminde yazılması', 'Tek cümleden oluşması', 'Yalnız gerçek kişileri anlatması'], 'Roman genellikle daha geniş olay örgüsü ve kişi kadrosuna sahiptir.'],
  ['Sahnelenmek üzere yazılan edebî türe ne denir?', 'Tiyatro', ['Deneme', 'Biyografi', 'Gezi yazısı'], 'Tiyatro metinleri sahnelenmek amacıyla yazılır.'],
  ['Yazarın kendi yaşamını anlattığı türe ne denir?', 'Otobiyografi', ['Biyografi', 'Masal', 'Fabl'], 'Otobiyografide kişi kendi yaşamını anlatır.'],
  ['Hayvanların konuşturulduğu ve çoğu zaman ders veren kısa anlatı türü hangisidir?', 'Fabl', ['Makale', 'Roman', 'Söyleşi'], 'Fabllarda hayvanlar kişileştirilir ve çoğunlukla öğüt bulunur.'],
];

function makeLiterature(): EmbeddedQuestionSeed[] {
  return LITERATURE_FACTS.flatMap(([prompt, correct, wrongs, explanation], index) => [0, 1].map((variant) => ({
    id: `v10-le-${index + 1}-${variant + 1}`, levelName: 'Lise', courseName: 'Edebiyat', topicIndex: index % 3,
    prompt: String(prompt), options: [String(correct), ...(wrongs as string[])], correctAnswer: String(correct), explanation: String(explanation),
    difficulty: variant === 0 ? 'standard' : 'hard', questionKind: variant === 0 ? 'multiple-choice' : 'reading',
  })));
}

const HISTORY_EVENTS = [
  { label: 'İstanbul’un Fethi', year: 1453 },
  { label: 'Fransız İhtilali', year: 1789 },
  { label: 'TBMM’nin Açılması', year: 1920 },
  { label: 'Cumhuriyetin İlanı', year: 1923 },
  { label: 'Harf İnkılabı', year: 1928 },
  { label: 'Türkiye’nin NATO’ya Katılması', year: 1952 },
];

function makeHistory(): EmbeddedQuestionSeed[] {
  const result: EmbeddedQuestionSeed[] = [];
  HISTORY_EVENTS.forEach((event, index) => {
    const options = [event.year, event.year - 1, event.year + 1, event.year + 10].map(String);
    result.push({
      id: `v10-lt-year-${index + 1}`, levelName: 'Lise', courseName: 'Tarih', topicIndex: index % 3,
      prompt: `${event.label} hangi yılda gerçekleşmiştir?`, options, correctAnswer: String(event.year),
      explanation: `${event.label}, ${event.year} yılında gerçekleşmiştir.`, difficulty: index < 2 ? 'standard' : 'easy', questionKind: 'visual-choice',
      visual: { kind: 'timeline', items: HISTORY_EVENTS.slice(Math.max(0, index - 1), Math.min(HISTORY_EVENTS.length, index + 2)) },
    });
  });
  for (let index = 0; index < HISTORY_EVENTS.length - 1; index += 1) {
    const first = HISTORY_EVENTS[index];
    const second = HISTORY_EVENTS[index + 1];
    result.push({
      id: `v10-lt-order-${index + 1}`, levelName: 'Lise', courseName: 'Tarih', topicIndex: index % 3,
      prompt: 'Aşağıdaki olaylardan hangisi daha önce gerçekleşmiştir?', options: [first.label, second.label, 'İkisi aynı yıl', 'Tarih verilemez'], correctAnswer: first.label,
      explanation: `${first.year}, ${second.year} yılından öncedir.`, difficulty: 'standard', questionKind: 'sequence',
      visual: { kind: 'timeline', items: [first, second] },
    });
  }
  return [...result, ...result.map((question, index) => ({ ...question, id: `${question.id}-b`, difficulty: 'hard' as const }))];
}

const HIGH_ENGLISH = [
  ['If I ___ enough time, I will call you.', 'have', ['had', 'has', 'having'], 'First conditional: if + simple present, will + verb.'],
  ['The book ___ by many students every year.', 'is read', ['reads', 'readed', 'is reading always'], 'Passive voice: be + past participle.'],
  ['She has lived here ___ 2020.', 'since', ['for', 'during', 'from always'], '“Since” başlangıç noktasıyla kullanılır.'],
  ['By the time we arrived, the film ___.', 'had started', ['starts', 'has start', 'was start'], 'Geçmişte başka bir olaydan önce tamamlanan eylem için past perfect kullanılır.'],
  ['I wish I ___ more free time.', 'had', ['have', 'will have', 'having'], 'Şimdiki duruma yönelik dilekte “wish + past simple” kullanılır.'],
  ['Neither Ali nor his friends ___ ready.', 'are', ['is', 'was', 'be'], 'Yakın özne çoğul olduğu için “are” uygundur.'],
  ['This is the place ___ we first met.', 'where', ['who', 'which person', 'whose'], 'Yer bildiren relative clause için “where” kullanılır.'],
  ['You ___ smoke here; it is prohibited.', 'mustn’t', ['don’t have to', 'could', 'might'], 'Yasak ifade etmek için “mustn’t” kullanılır.'],
  ['The more you practice, the ___ you become.', 'better', ['best', 'good', 'wellest'], 'The more..., the better... karşılaştırma yapısıdır.'],
  ['She asked me where I ___.', 'lived', ['live now', 'will live', 'am living yesterday'], 'Reported speech içinde zaman uyumu gereği “lived” uygundur.'],
];

function makeHighEnglish(): EmbeddedQuestionSeed[] {
  return HIGH_ENGLISH.flatMap(([prompt, correct, wrongs, explanation], index) => [0, 1].map((variant) => ({
    id: `v10-li-${index + 1}-${variant + 1}`, levelName: 'Lise', courseName: 'İngilizce', topicIndex: index % 3,
    prompt: String(prompt), options: [String(correct), ...(wrongs as string[])], correctAnswer: String(correct), explanation: String(explanation),
    difficulty: variant === 0 ? 'standard' : 'hard', questionKind: variant === 0 ? 'multiple-choice' : 'visual-choice',
    visual: variant === 1 ? { kind: 'chips', items: String(prompt).replace('___', '_____').split(' ') } : undefined,
  })));
}

function makeAlesNumeric(): EmbeddedQuestionSeed[] {
  const result: EmbeddedQuestionSeed[] = [];
  for (let index = 1; index <= 12; index += 1) {
    const total = 80 + index * 10;
    const percent = [10, 20, 25, 30, 40, 50][index % 6];
    const answer = (total * percent) / 100;
    result.push(numericQuestion({
      id: `v10-as-pct-${index}`, levelName: 'ALES', courseName: 'Sayısal', topicIndex: 0,
      prompt: `Bir grubun %${percent}'i ${answer} kişi olduğuna göre grubun tamamı kaç kişidir?`, answer: total,
      distractors: [total - 10, total + 10, answer], explanation: `${answer} = %${percent} ise bütün ${answer} × 100 / ${percent} = ${total}.`,
      difficulty: index < 5 ? 'standard' : 'hard', questionKind: 'visual-choice', visual: { kind: 'bars', labels: [`%${percent}`, '%100'], values: [answer, total] },
    }));
  }
  for (let index = 1; index <= 12; index += 1) {
    const speed = 40 + index * 5;
    const time = (index % 4) + 2;
    const answer = speed * time;
    result.push(numericQuestion({
      id: `v10-as-speed-${index}`, levelName: 'ALES', courseName: 'Sayısal', topicIndex: 1,
      prompt: `Saatte ${speed} km hızla giden araç ${time} saatte kaç km yol alır?`, answer,
      distractors: [speed + time, answer - speed, answer + speed], explanation: `Yol = hız × zaman = ${speed} × ${time} = ${answer} km.`,
      difficulty: 'standard', questionKind: 'visual-choice', visual: { kind: 'number-line', min: 0, max: answer, points: [0, answer], highlight: answer },
    }));
  }
  return result;
}

const ALES_PASSAGES = [
  ['Bir yöntemin hızlı olması, her durumda doğru sonuç vereceği anlamına gelmez. Özellikle karmaşık problemlerde önce varsayımları kontrol etmek gerekir.', 'Hız kadar yöntemin dayandığı varsayımları kontrol etmek de önemlidir.'],
  ['Bir şehrin toplu taşımasını geliştirmek yalnızca yeni araç almakla sınırlı değildir; hatların insanların gerçek hareketlerine göre planlanması gerekir.', 'Ulaşım planlamasında kullanım alışkanlıkları dikkate alınmalıdır.'],
  ['Bilgiye erişimin kolaylaşması, doğru bilgiyi seçme sorumluluğunu azaltmaz; tersine kaynak değerlendirmesini daha önemli hâle getirir.', 'Bilgi bolluğu kaynak değerlendirme ihtiyacını artırır.'],
  ['Bir araştırmada çok sayıda veri toplamak tek başına yeterli değildir. Verinin soruyla ilişkili olması ve doğru yöntemle yorumlanması gerekir.', 'Verinin niteliği ve yorum yöntemi en az miktarı kadar önemlidir.'],
  ['Düzenli tekrar, bilgiyi yalnızca yeniden görmek değildir; hatırlamaya çalışmak ve hataları fark etmek öğrenmeyi güçlendirir.', 'Aktif hatırlama ve hata farkındalığı tekrarın etkisini artırır.'],
  ['Bir kurumun başarısını yalnızca tek bir göstergeyle değerlendirmek yanıltıcı olabilir; farklı göstergeler birlikte incelenmelidir.', 'Değerlendirmede birden fazla ölçüt kullanmak gerekir.'],
  ['Yeni bir teknoloji ilk bakışta verimliliği artırabilir; ancak kullanıcıların alışkanlıkları ve eğitim ihtiyacı hesaba katılmazsa beklenen sonuç alınamayabilir.', 'Teknolojinin başarısı kullanıcı uyumuna da bağlıdır.'],
  ['Bir metindeki ayrıntılar ana düşünceyi desteklemek için vardır; ayrıntılara takılıp bütünü kaçırmak yorum hatasına yol açabilir.', 'Ana düşünceyi belirlerken ayrıntı-bütün ilişkisi kurulmalıdır.'],
  ['Karar vermeden önce farklı seçeneklerin kısa ve uzun vadeli sonuçlarını düşünmek, acele seçimin doğuracağı sorunları azaltabilir.', 'Kararlarda zaman içindeki sonuçlar birlikte değerlendirilmelidir.'],
  ['Bir ekipte görevlerin açık tanımlanması çatışmayı tamamen ortadan kaldırmaz ama belirsizlikten doğan sorunları önemli ölçüde azaltır.', 'Açık görev tanımı belirsizlik kaynaklı sorunları azaltır.'],
];

function makeAlesVerbal(): EmbeddedQuestionSeed[] {
  return ALES_PASSAGES.flatMap(([passage, mainIdea], index) => [
    {
      id: `v10-av-main-${index + 1}`, levelName: 'ALES', courseName: 'Sözel', topicIndex: 0,
      prompt: `Bu parçanın ana düşüncesi hangisidir?\n\n${passage}`,
      options: [mainIdea, 'Metin yalnızca bir tanım vermektedir.', 'Metin konuya ilişkin kesin bir yasak koymaktadır.', 'Metinde savunulan bir düşünce yoktur.'], correctAnswer: mainIdea,
      explanation: 'Ana düşünce parçanın bütününü kapsayan yargıdır.', difficulty: 'standard', questionKind: 'reading',
    },
    {
      id: `v10-av-infer-${index + 1}`, levelName: 'ALES', courseName: 'Sözel', topicIndex: 1,
      prompt: `Bu parçadan aşağıdakilerden hangisi çıkarılabilir?\n\n${passage}`,
      options: [mainIdea, 'Parçada anlatılan konu her koşulda geçersizdir.', 'Yazar hiçbir ölçüt önermemektedir.', 'Metindeki sonuçlar yalnız geçmişe aittir.'], correctAnswer: mainIdea,
      explanation: 'Çıkarım, parçada verilen gerekçelerle desteklenir.', difficulty: 'hard', questionKind: 'reading',
    },
  ]);
}

export function getEmbeddedQuestionPackV10(): EmbeddedQuestionSeed[] {
  return [
    ...makePrimaryMath(),
    ...makePrimaryTurkish(),
    ...makeLifeKnowledge(),
    ...makePrimaryEnglish(),
    ...makeMiddleMath(),
    ...makeMiddleTurkish(),
    ...makeMiddleScience(),
    ...makeMiddleSocial(),
    ...makeMiddleEnglish(),
    ...makeHighMath(),
    ...makePhysics(),
    ...makeChemistry(),
    ...makeBiology(),
    ...makeLiterature(),
    ...makeHistory(),
    ...makeHighEnglish(),
    ...makeAlesNumeric(),
    ...makeAlesVerbal(),
  ];
}
