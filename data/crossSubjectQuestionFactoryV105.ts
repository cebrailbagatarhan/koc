import type { EmbeddedQuestionSeed, QuestionDifficulty } from '@/data/embeddedQuestionPackV10';

type Fact = {
  prompt: string;
  correct: string;
  wrong: [string, string, string];
  explanation: string;
};

function rotate<T>(items: T[], offset: number) {
  if (!items.length) return items;
  const index = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
}

function makeQuestion(input: {
  id: string;
  levelName: string;
  courseName: string;
  topicIndex: number;
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  explanation: string;
  difficulty?: QuestionDifficulty;
}): EmbeddedQuestionSeed {
  const options = [input.correctAnswer, ...input.distractors]
    .filter((value, index, all) => value.trim().length > 0 && all.indexOf(value) === index)
    .slice(0, 4);

  if (options.length !== 4 || !options.includes(input.correctAnswer)) {
    throw new Error(`Invalid options for ${input.id}`);
  }

  return {
    id: input.id,
    levelName: input.levelName,
    courseName: input.courseName,
    topicIndex: input.topicIndex,
    prompt: input.prompt,
    options,
    correctAnswer: input.correctAnswer,
    explanation: input.explanation,
    difficulty: input.difficulty ?? 'standard',
    questionKind: 'multiple-choice',
  };
}

function validatePack(questions: EmbeddedQuestionSeed[]) {
  const ids = new Set<string>();
  for (const question of questions) {
    if (ids.has(question.id)) throw new Error(`Duplicate question id: ${question.id}`);
    ids.add(question.id);
    if (question.options.length !== 4 || new Set(question.options).size !== 4) {
      throw new Error(`Question must have four unique options: ${question.id}`);
    }
    if (!question.options.includes(question.correctAnswer)) {
      throw new Error(`Correct answer mismatch: ${question.id}`);
    }
  }
  return questions;
}

const PRIMARY_TURKISH_PAIRS: Array<[string, string]> = [
  ['hızlı', 'yavaş'], ['büyük', 'küçük'], ['uzun', 'kısa'], ['sıcak', 'soğuk'], ['erken', 'geç'],
  ['temiz', 'kirli'], ['yakın', 'uzak'], ['kolay', 'zor'], ['açık', 'kapalı'], ['genç', 'yaşlı'],
  ['ince', 'kalın'], ['hafif', 'ağır'], ['mutlu', 'üzgün'], ['dolu', 'boş'], ['sert', 'yumuşak'],
];

function makePrimaryTurkishFactory(): EmbeddedQuestionSeed[] {
  const pool = PRIMARY_TURKISH_PAIRS.flat();
  return PRIMARY_TURKISH_PAIRS.flatMap(([word, opposite], index) => {
    const distractors = pool.filter((item) => item !== word && item !== opposite);
    const wrong = rotate(distractors, index * 3).slice(0, 3);
    return [
      makeQuestion({
        id: `v105-it-ant-${index + 1}`,
        levelName: 'İlkokul',
        courseName: 'Türkçe',
        topicIndex: 0,
        prompt: `“${word}” kelimesinin zıt anlamlısı hangisidir?`,
        correctAnswer: opposite,
        distractors: wrong,
        explanation: `“${word}” ve “${opposite}” karşıt anlamlı kelimelerdir.`,
        difficulty: 'easy',
      }),
      makeQuestion({
        id: `v105-it-usage-${index + 1}`,
        levelName: 'İlkokul',
        courseName: 'Türkçe',
        topicIndex: 1,
        prompt: `Aşağıdaki cümlelerden hangisinde “${word}” kelimesi sıfat olarak doğru kullanılmıştır?`,
        correctAnswer: `Bu yol oldukça ${word}.`,
        distractors: [
          `Masada bir ${word} var.`,
          `Ben ${word} içtim.`,
          `${word} sesiyle uyudum.`,
        ],
        explanation: `“${word}” bu cümlede “yol” ismini niteleyen sıfat görevindedir.`,
        difficulty: 'standard',
      }),
    ];
  });
}

const ENGLISH_ITEMS: Array<[string, string, string]> = [
  ['go', 'goes', 'She'], ['play', 'plays', 'He'], ['read', 'reads', 'She'], ['watch', 'watches', 'He'],
  ['study', 'studies', 'She'], ['drink', 'drinks', 'He'], ['write', 'writes', 'She'], ['run', 'runs', 'He'],
  ['cook', 'cooks', 'She'], ['walk', 'walks', 'He'], ['work', 'works', 'She'], ['sleep', 'sleeps', 'He'],
  ['speak', 'speaks', 'She'], ['live', 'lives', 'He'], ['need', 'needs', 'She'],
];

function makeEnglishFactory(): EmbeddedQuestionSeed[] {
  return ENGLISH_ITEMS.flatMap(([base, third, subject], index) => [
    makeQuestion({
      id: `v105-li-present-${index + 1}`,
      levelName: index < 8 ? 'Ortaokul' : 'Lise',
      courseName: 'İngilizce',
      topicIndex: 0,
      prompt: `${subject} ___ every day.`,
      correctAnswer: third,
      distractors: [base, `${base}ing`, `to ${base}`],
      explanation: `Simple present tense üçüncü tekil kişide fiil “${third}” biçimini alır.`,
      difficulty: index < 8 ? 'easy' : 'standard',
    }),
    makeQuestion({
      id: `v105-li-modal-${index + 1}`,
      levelName: index < 8 ? 'Ortaokul' : 'Lise',
      courseName: 'İngilizce',
      topicIndex: 2,
      prompt: `${subject} can ___ very well.`,
      correctAnswer: base,
      distractors: [third, `${base}ing`, `${base}ed`],
      explanation: `“Can” modalından sonra fiilin yalın hâli kullanılır: “${base}”.`,
      difficulty: 'standard',
    }),
  ]);
}

const SCIENCE_FACTS: Fact[] = [
  { prompt: 'Kuvvetin SI birimi hangisidir?', correct: 'Newton', wrong: ['Joule', 'Watt', 'Pascal'], explanation: 'Kuvvetin SI birimi newtondur (N).' },
  { prompt: 'Elektrik akımının SI birimi hangisidir?', correct: 'Amper', wrong: ['Volt', 'Ohm', 'Watt'], explanation: 'Elektrik akımı amper (A) ile ölçülür.' },
  { prompt: 'Suyun normal atmosfer basıncında kaynama sıcaklığı kaç °C’dir?', correct: '100', wrong: ['0', '50', '200'], explanation: 'Standart atmosfer basıncında su yaklaşık 100 °C’de kaynar.' },
  { prompt: 'Katıdan sıvıya hâl değişimine ne denir?', correct: 'Erime', wrong: ['Donma', 'Yoğuşma', 'Buharlaşma'], explanation: 'Katının sıvıya dönüşmesi erimedir.' },
  { prompt: 'Gazdan sıvıya hâl değişimine ne denir?', correct: 'Yoğuşma', wrong: ['Erime', 'Donma', 'Süblimleşme'], explanation: 'Gazın sıvıya dönüşmesi yoğuşmadır.' },
  { prompt: 'Bitkiler fotosentez sırasında hangi gazı kullanır?', correct: 'Karbondioksit', wrong: ['Oksijen', 'Azot', 'Helyum'], explanation: 'Fotosentezde karbondioksit kullanılır.' },
  { prompt: 'Dünya’nın doğal uydusu hangisidir?', correct: 'Ay', wrong: ['Mars', 'Venüs', 'Güneş'], explanation: 'Ay, Dünya’nın doğal uydusudur.' },
  { prompt: 'Ses boşlukta yayılır mı?', correct: 'Hayır', wrong: ['Evet', 'Yalnız geceleri', 'Yalnız ışık varken'], explanation: 'Ses mekanik dalgadır ve yayılmak için maddesel ortama ihtiyaç duyar.' },
  { prompt: 'Bir cismin hareketini değiştirebilen etkiye ne denir?', correct: 'Kuvvet', wrong: ['Yoğunluk', 'Hacim', 'Sıcaklık'], explanation: 'Kuvvet cismin hızını veya yönünü değiştirebilir.' },
  { prompt: 'Besin zincirinin başlangıcında çoğunlukla hangi grup bulunur?', correct: 'Üreticiler', wrong: ['Tüketiciler', 'Yırtıcılar', 'Ayrıştırıcılar'], explanation: 'Üreticiler enerji akışının başlangıcında yer alır.' },
  { prompt: 'pH değeri 7 olan saf su hangi özelliktedir?', correct: 'Nötr', wrong: ['Asidik', 'Bazik', 'Radyoaktif'], explanation: 'pH 7 nötr kabul edilir.' },
  { prompt: 'Atom numarası hangi parçacık sayısına eşittir?', correct: 'Proton', wrong: ['Nötron', 'Elektron her durumda', 'Foton'], explanation: 'Atom numarası çekirdekteki proton sayısını gösterir.' },
  { prompt: 'Protein sentezinin gerçekleştiği temel organel hangisidir?', correct: 'Ribozom', wrong: ['Lizozom', 'Koful', 'Sentrozom'], explanation: 'Protein sentezi ribozomlarda gerçekleşir.' },
  { prompt: 'Hücresel solunumla en yakından ilişkili organel hangisidir?', correct: 'Mitokondri', wrong: ['Ribozom', 'Golgi', 'Kloroplast her hücrede'], explanation: 'Ökaryot hücrelerde ATP üretiminin büyük kısmı mitokondride gerçekleşir.' },
  { prompt: 'İş ve enerjinin SI birimi hangisidir?', correct: 'Joule', wrong: ['Newton', 'Pascal', 'Amper'], explanation: 'İş ve enerji joule (J) ile ölçülür.' },
];

function makeScienceFactory(): EmbeddedQuestionSeed[] {
  return SCIENCE_FACTS.flatMap((fact, index) => [
    makeQuestion({
      id: `v105-of-fact-${index + 1}`,
      levelName: 'Ortaokul',
      courseName: 'Fen Bilimleri',
      topicIndex: index % 3,
      prompt: fact.prompt,
      correctAnswer: fact.correct,
      distractors: fact.wrong,
      explanation: fact.explanation,
      difficulty: index < 8 ? 'easy' : 'standard',
    }),
    makeQuestion({
      id: `v105-of-apply-${index + 1}`,
      levelName: 'Ortaokul',
      courseName: 'Fen Bilimleri',
      topicIndex: index % 3,
      prompt: `Bilgiyi uygula: ${fact.prompt}`,
      correctAnswer: fact.correct,
      distractors: rotate(fact.wrong, 1),
      explanation: fact.explanation,
      difficulty: 'standard',
    }),
  ]);
}

const SOCIAL_FACTS: Fact[] = [
  { prompt: 'Türkiye’nin başkenti hangisidir?', correct: 'Ankara', wrong: ['İstanbul', 'İzmir', 'Bursa'], explanation: 'Türkiye’nin başkenti Ankara’dır.' },
  { prompt: 'Güneşin doğduğu ana yön hangisidir?', correct: 'Doğu', wrong: ['Batı', 'Kuzey', 'Güney'], explanation: 'Güneş doğu yönünden doğuyormuş gibi görünür.' },
  { prompt: 'Bir ürünün başka ülkeye satılmasına ne denir?', correct: 'İhracat', wrong: ['İthalat', 'Göç', 'Turizm'], explanation: 'Ülke dışına mal veya hizmet satışı ihracattır.' },
  { prompt: 'Başka ülkeden ürün alınmasına ne denir?', correct: 'İthalat', wrong: ['İhracat', 'Göç', 'Üretim'], explanation: 'Yurt dışından mal veya hizmet alımı ithalattır.' },
  { prompt: 'İnsanların bir yerden başka bir yere taşınmasına ne denir?', correct: 'Göç', wrong: ['Erozyon', 'Sanayi', 'İhracat'], explanation: 'İnsanların yer değiştirmesi göç olarak adlandırılır.' },
  { prompt: 'Bir yerin uzun yıllar gözlenen hava koşullarına ne denir?', correct: 'İklim', wrong: ['Hava olayı', 'Nüfus', 'Yer şekli'], explanation: 'İklim uzun dönemli hava koşullarının genel karakteridir.' },
  { prompt: 'Oy kullanmak hangi kavramla en yakından ilişkilidir?', correct: 'Demokratik katılım', wrong: ['Erozyon', 'Kuraklık', 'Sanayi'], explanation: 'Oy kullanmak demokratik katılım yollarından biridir.' },
  { prompt: 'Haritalarda kuzey genellikle hangi tarafta gösterilir?', correct: 'Üst', wrong: ['Alt', 'Sol', 'Sağ'], explanation: 'Standart haritalarda kuzey çoğunlukla üst taraftadır.' },
  { prompt: 'Doğal kaynakları gelecek kuşakları düşünerek kullanmak hangi kavramdır?', correct: 'Sürdürülebilirlik', wrong: ['İsraf', 'Kirlilik', 'Tüketim'], explanation: 'Kaynakların dengeli ve uzun vadeli kullanımı sürdürülebilirliktir.' },
  { prompt: 'Olayları zaman sırasıyla göstermede en uygun araç hangisidir?', correct: 'Zaman çizelgesi', wrong: ['Termometre', 'Pusula', 'Cetvel'], explanation: 'Zaman çizelgesi kronolojik sıralamayı görselleştirir.' },
  { prompt: 'Yön bulmada kullanılan araç hangisidir?', correct: 'Pusula', wrong: ['Termometre', 'Kronometre', 'Barometre'], explanation: 'Pusula manyetik kuzeyi göstererek yön bulmaya yardım eder.' },
  { prompt: 'Nüfusun belirli bir alandaki kişi sayısını ifade eden kavram hangisidir?', correct: 'Nüfus', wrong: ['İklim', 'İhracat', 'Erozyon'], explanation: 'Nüfus belirli bir yerde yaşayan insan sayısını ifade eder.' },
  { prompt: 'Toprağın su ve rüzgâr etkisiyle taşınmasına ne denir?', correct: 'Erozyon', wrong: ['Göç', 'İthalat', 'Sanayileşme'], explanation: 'Toprağın taşınması erozyondur.' },
  { prompt: 'Vatandaşların ortak karar süreçlerine katılması neyi güçlendirir?', correct: 'Demokrasiyi', wrong: ['Kuraklığı', 'Erozyonu', 'İzolasyonu'], explanation: 'Katılım demokratik yönetimi güçlendirir.' },
  { prompt: 'Üretim, dağıtım ve tüketim hangi alanla en yakından ilişkilidir?', correct: 'Ekonomi', wrong: ['Jeoloji', 'Astronomi', 'Dil bilgisi'], explanation: 'Üretim, dağıtım ve tüketim ekonomik faaliyetlerdir.' },
];

function makeSocialFactory(): EmbeddedQuestionSeed[] {
  return SOCIAL_FACTS.flatMap((fact, index) => [
    makeQuestion({
      id: `v105-os-fact-${index + 1}`,
      levelName: 'Ortaokul',
      courseName: 'Sosyal Bilgiler',
      topicIndex: index % 3,
      prompt: fact.prompt,
      correctAnswer: fact.correct,
      distractors: fact.wrong,
      explanation: fact.explanation,
      difficulty: index < 8 ? 'easy' : 'standard',
    }),
    makeQuestion({
      id: `v105-os-apply-${index + 1}`,
      levelName: 'Ortaokul',
      courseName: 'Sosyal Bilgiler',
      topicIndex: index % 3,
      prompt: `Kavramı seç: ${fact.prompt}`,
      correctAnswer: fact.correct,
      distractors: rotate(fact.wrong, 2),
      explanation: fact.explanation,
      difficulty: 'standard',
    }),
  ]);
}

const HISTORY_FACTS: Fact[] = [
  { prompt: 'Tarihî olayları gerçekleşme sırasına koymaya ne denir?', correct: 'Kronoloji', wrong: ['Coğrafya', 'Arkeoloji', 'Ekonomi'], explanation: 'Kronoloji olayların zaman sırasını inceler.' },
  { prompt: 'Olayın yaşandığı dönemde üretilmiş belge hangi kaynak türüne örnektir?', correct: 'Birincil kaynak', wrong: ['İkincil kaynak', 'Kurgu kaynak', 'Sözlük maddesi her durumda'], explanation: 'Olayın döneminden kalan belgeler birincil kaynak olabilir.' },
  { prompt: 'Bir tarihçinin daha önceki kaynakları yorumlayarak yazdığı eser genellikle hangi türdür?', correct: 'İkincil kaynak', wrong: ['Birincil kaynak', 'Arkeolojik buluntu', 'Doğal kaynak'], explanation: 'Sonradan yapılan yorum ve sentezler ikincil kaynak niteliğindedir.' },
  { prompt: 'Bir olayın ortaya çıkmasına yol açan etkenlere ne denir?', correct: 'Neden', wrong: ['Sonuç', 'Kronoloji', 'Harita'], explanation: 'Bir olayın ortaya çıkmasını hazırlayan etkenler nedenlerdir.' },
  { prompt: 'Bir olaydan sonra ortaya çıkan etkilere ne denir?', correct: 'Sonuç', wrong: ['Neden', 'Kaynak', 'Dönem'], explanation: 'Olayın ardından oluşan etkiler sonuçlardır.' },
  { prompt: 'Tarihî bir iddiayı değerlendirirken en güçlü yaklaşım hangisidir?', correct: 'Birden fazla kaynağı karşılaştırmak', wrong: ['Tek kaynağa koşulsuz inanmak', 'Kaynak tarihini önemsememek', 'Kanıt aramamak'], explanation: 'Kaynakları karşılaştırmak güvenilirliği değerlendirmeyi güçlendirir.' },
  { prompt: 'Bir belgenin kim tarafından ve ne zaman üretildiğini sorgulamak hangi beceridir?', correct: 'Kaynak değerlendirme', wrong: ['Ezberleme', 'Tahmin', 'Harita çizme'], explanation: 'Kaynağın üreticisi ve zamanı güvenilirlik değerlendirmesinin parçasıdır.' },
  { prompt: 'Tarihî olayları tek bir nedene bağlamak neden sakıncalıdır?', correct: 'Olayların çoğu çok nedenlidir', wrong: ['Tüm olaylar rastlantıdır', 'Nedenler önemsizdir', 'Tarih yalnız tarihlerden oluşur'], explanation: 'Tarihî olaylar çoğu zaman birden fazla etkenin birleşimiyle ortaya çıkar.' },
  { prompt: 'Bir olayın uzun yıllar sonra devam eden etkisine ne denebilir?', correct: 'Uzun vadeli sonuç', wrong: ['Anlık neden', 'Kaynak türü', 'Coğrafi yön'], explanation: 'Etkiler kısa veya uzun vadede ortaya çıkabilir.' },
  { prompt: 'Tarih çalışmasında kanıtın temel işlevi nedir?', correct: 'İddiaları desteklemek', wrong: ['Soruları kaldırmak', 'Tüm yorumları eşitlemek', 'Tarihi değiştirmek'], explanation: 'Kanıt tarihî iddiaların dayanağını oluşturur.' },
];

function makeHistoryFactory(): EmbeddedQuestionSeed[] {
  return HISTORY_FACTS.flatMap((fact, index) => [
    makeQuestion({
      id: `v105-lt-core-${index + 1}`,
      levelName: 'Lise',
      courseName: 'Tarih',
      topicIndex: index % 3,
      prompt: fact.prompt,
      correctAnswer: fact.correct,
      distractors: fact.wrong,
      explanation: fact.explanation,
      difficulty: 'standard',
    }),
    makeQuestion({
      id: `v105-lt-reason-${index + 1}`,
      levelName: 'Lise',
      courseName: 'Tarih',
      topicIndex: index % 3,
      prompt: `Tarihsel düşünme: ${fact.prompt}`,
      correctAnswer: fact.correct,
      distractors: rotate(fact.wrong, 1),
      explanation: fact.explanation,
      difficulty: index < 5 ? 'standard' : 'hard',
    }),
  ]);
}

function makeReadingFactory(): EmbeddedQuestionSeed[] {
  const passages = [
    ['Düzenli tekrar yapan öğrenci, bilgiyi yalnız sınavdan önce değil uzun süre boyunca hatırlayabilir.', 'Düzenli tekrar kalıcılığı artırabilir'],
    ['Bir metni hızlı okumak her zaman iyi anlamak değildir; gerektiğinde durup ana fikri kontrol etmek yararlıdır.', 'Anlamak için okuma hızını ayarlamak gerekir'],
    ['Takım çalışmasında kişinin kendi görevini yapması kadar arkadaşlarının ihtiyaçlarını fark etmesi de önemlidir.', 'Takım başarısı iş birliğine bağlıdır'],
    ['Teknoloji amaçlı kullanıldığında öğrenmeyi kolaylaştırabilir; dikkatsiz kullanım ise zamanı boşa harcatabilir.', 'Teknolojinin etkisi kullanım biçimine bağlıdır'],
    ['Bir problemi çözmeden önce sorunun ne istediğini belirlemek, yanlış işlem yapma olasılığını azaltır.', 'Problemi doğru anlamak çözümün temelidir'],
    ['Bir ağacı dikmek başlangıçtır; büyümesi için düzenli bakım, su ve uygun koşullar gerekir.', 'Süreklilik bakımın önemli parçasıdır'],
    ['Kütüphanedeki sessizlik yalnız kural değildir; başkalarının da dikkatini korumasına yardım eder.', 'Sessizlik ortak çalışma ortamını korur'],
    ['Plan yapmak tek başına yeterli değildir; plana uygun küçük adımları düzenli uygulamak gerekir.', 'Planın değeri düzenli uygulamayla artar'],
    ['Bir görüşü değerlendirirken yalnız sonucu değil, sonuca götüren kanıtları da incelemek gerekir.', 'Bir görüşün dayanakları da değerlendirilmelidir'],
    ['Hata yapmak öğrenmenin sonu değildir; hatanın nedenini bulmak sonraki denemeyi güçlendirebilir.', 'Hataları analiz etmek öğrenmeye katkı sağlar'],
  ];

  return passages.flatMap(([passage, main], index) => [
    makeQuestion({
      id: `v105-ot-main-${index + 1}`,
      levelName: 'Ortaokul',
      courseName: 'Türkçe',
      topicIndex: 2,
      prompt: `Parçanın ana düşüncesi hangisidir?\n\n${passage}`,
      correctAnswer: main,
      distractors: [
        'Metin yalnızca bir tarih vermektedir',
        'Metin bunun tam tersini savunmaktadır',
        'Parçada hiçbir temel düşünce yoktur',
      ],
      explanation: 'Ana düşünce parçanın tamamını kapsayan temel yargıdır.',
      difficulty: 'standard',
    }),
    makeQuestion({
      id: `v105-av-main-${index + 1}`,
      levelName: 'ALES',
      courseName: 'Sözel',
      topicIndex: 0,
      prompt: `Bu parçadan çıkarılabilecek en güvenli yargı hangisidir?\n\n${passage}`,
      correctAnswer: main,
      distractors: [
        'Parçada desteklenmeyen kesin bir genelleme yapılmalıdır',
        'Metindeki ayrıntılar ana düşünceden bağımsızdır',
        'Metin hiçbir sonuca izin vermez',
      ],
      explanation: 'Güvenli çıkarım, metindeki bilgiyle doğrudan desteklenmelidir.',
      difficulty: 'hard',
    }),
  ]);
}

export function getCrossSubjectQuestionPackV105(): EmbeddedQuestionSeed[] {
  return validatePack([
    ...makePrimaryTurkishFactory(),
    ...makeEnglishFactory(),
    ...makeScienceFactory(),
    ...makeSocialFactory(),
    ...makeHistoryFactory(),
    ...makeReadingFactory(),
  ]);
}
