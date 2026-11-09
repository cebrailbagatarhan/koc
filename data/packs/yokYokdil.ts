import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { TopicDefinition } from '@/data/topicCatalog';

export const LEVEL_NAME = 'YÖK';
export const COURSE_NAME = 'YÖKDİL';

export const topics: TopicDefinition[] = [
  {
    name: 'Fen Bilimleri',
    icon: '🔬',
    summary:
      'Fizik, kimya ve biyoloji metinlerinde akademik sözcükleri, yapı kalıplarını ve çıkarım sorularını birlikte çöz.',
    goals: [
      'Akademik sözcüğü sözcük türüne göre ayırt et.',
      'Bağlaç ve edat kalıplarını cümlenin mantığıyla eşleştir.',
      'Parçada söylenmeyen ama kanıtlanabilen yargıyı seç.',
      'Çeviri maddesinde zaman, edilgenlik ve özne ilişkisini koru.',
    ],
    practicePrompt:
      'Bir bilimsel özetten iki akademik sıfat seç ve her birini kendi cümlenle kullan.',
    questionIds: [
      'yok-yokdil-fen-1',
      'yok-yokdil-fen-2',
      'yok-yokdil-fen-3',
      'yok-yokdil-fen-4',
      'yok-yokdil-fen-5',
      'yok-yokdil-fen-6',
      'yok-yokdil-fen-7',
      'yok-yokdil-fen-8',
      'yok-yokdil-fen-9',
      'yok-yokdil-fen-10',
      'yok-yokdil-fen-11',
      'yok-yokdil-fen-12',
    ],
  },
  {
    name: 'Sağlık Bilimleri',
    icon: '🩺',
    summary:
      'Tıp ve sağlık metinlerinde akademik sözcükleri, koşul ve dilek yapılarını, kanıta dayalı çıkarımı çöz.',
    goals: [
      'Klinik bağlamda doğru akademik sözcüğü seç.',
      'Üçüncü tip koşul ve dilek kipi yapılarını kur.',
      'Parçadaki kanıtı yazarın tutumuyla birleştir.',
      'Çeviride edilgen yapıyı ve nedensellik zincirini koru.',
    ],
    practicePrompt:
      'Bir klinik çalışma özetini okuyup sonucu tek cümleyle, kendi sözcüklerinle yaz.',
    questionIds: [
      'yok-yokdil-sag-1',
      'yok-yokdil-sag-2',
      'yok-yokdil-sag-3',
      'yok-yokdil-sag-4',
      'yok-yokdil-sag-5',
      'yok-yokdil-sag-6',
      'yok-yokdil-sag-7',
      'yok-yokdil-sag-8',
      'yok-yokdil-sag-9',
      'yok-yokdil-sag-10',
      'yok-yokdil-sag-11',
      'yok-yokdil-sag-12',
    ],
  },
  {
    name: 'Sosyal Bilimler',
    icon: '🏛️',
    summary:
      'Tarih, iktisat ve hukuk metinlerinde akademik sözcükleri, devrik yapıları ve yazarın örtük yargısını çöz.',
    goals: [
      'Sosyal bilim sözcüklerini bağlama göre ayırt et.',
      'Devrik ve vurgu yapılarını tanı.',
      'Önceki görüş ile yeni bulguyu karşılaştır.',
      'Çeviride karşıtlık ve sonuç ilişkisini doğru kur.',
    ],
    practicePrompt:
      'Bir tarih paragrafındaki eski ve yeni görüşü iki ayrı cümleyle karşılaştır.',
    questionIds: [
      'yok-yokdil-sos-1',
      'yok-yokdil-sos-2',
      'yok-yokdil-sos-3',
      'yok-yokdil-sos-4',
      'yok-yokdil-sos-5',
      'yok-yokdil-sos-6',
      'yok-yokdil-sos-7',
      'yok-yokdil-sos-8',
      'yok-yokdil-sos-9',
      'yok-yokdil-sos-10',
      'yok-yokdil-sos-11',
      'yok-yokdil-sos-12',
    ],
  },
];

export const questions: EmbeddedQuestionSeed[] = [
  {
    id: 'yok-yokdil-fen-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nThe researchers collected a ___ amount of data before drawing any conclusion.',
    options: ['substance', 'substantial', 'substantially', 'substantiate'],
    correctAnswer: 'substantial',
    explanation:
      'Boşlukta “amount” ismini niteleyen bir sıfat gerekir; “substantial” (önemli ölçüde büyük) sıfattır. “Substance” isim, “substantially” zarf, “substantiate” ise fiildir ve hiçbiri ismi niteleyemez.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-fen-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nScientists generally ___ the recent decline in biodiversity to habitat loss and climate change.',
    options: ['contribute', 'distribute', 'attribute', 'allocate'],
    correctAnswer: 'attribute',
    explanation:
      '“Attribute X to Y” kalıbı “X’in nedenini Y’ye bağlamak” anlamına gelir ve cümledeki “to” edatı bu kalıbı doğrular. “Contribute to” ve “allocate to” farklı anlamlar taşır, “distribute” ise bu yapıda “to” ile kullanılmaz.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-fen-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nInitially dismissed as speculation, the hypothesis gradually became ___ as new evidence accumulated.',
    options: ['compelled', 'compulsion', 'compulsory', 'compelling'],
    correctAnswer: 'compelling',
    explanation:
      '“Become” fiilinden sonra sıfat gelir; “compelling” (ikna edici) bu bağlama uyar. “Compelled” çekimli fiil, “compulsion” isim, “compulsory” ise “zorunlu” anlamıyla buradaki kanıt ilişkisine uymaz.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-fen-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nPure water ___ at 100 degrees Celsius at sea level.',
    options: ['boils', 'boil', 'boiled', 'have boiled'],
    correctAnswer: 'boils',
    explanation:
      'Özne “pure water” üçüncü tekil olduğu için geniş zamanda fiil -s alır: “boils”. “Boil” özne-fiil uyumunu, “boiled” ve “have boiled” ise genel geçerliği bildiren zamanı bozar.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-fen-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nThe experiment was repeated three times ___ the results could be verified independently.',
    options: ['although', 'so that', 'unless', 'despite'],
    correctAnswer: 'so that',
    explanation:
      'Boşluktan sonra amaç bildiren tam bir cümle geldiği için “so that” gerekir. “Despite” isim öbeği alır, “unless” koşul kurar, “although” ise karşıtlık bildirir ve amaç ilişkisini vermez.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-fen-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nHad the sample not been contaminated, the measurements ___ discarded.',
    options: ['would not be', 'will not be', 'would not have been', 'had not been'],
    correctAnswer: 'would not have been',
    explanation:
      '“Had ... been” devrik yapısı geçmişe dönük üçüncü tip koşul kurar ve ana cümle “would have + V3” ile tamamlanır. “Would not be” ikinci tip koşula, “will not be” ise zaman bakımından uyumsuz bir yapıya aittir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-fen-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki cümleyi anlam ve dilbilgisi bakımından en uygun biçimde tamamlayan seçeneği bulunuz.\n\nThe new telescope is far more sensitive than its predecessor, ___.',
    options: [
      'it allows astronomers detecting objects that were previously invisible',
      'allowing astronomers to detect objects that were previously invisible',
      'allows astronomers to detect objects previously invisible',
      'and allowing astronomers detect objects that were previously invisible',
    ],
    correctAnswer: 'allowing astronomers to detect objects that were previously invisible',
    explanation:
      'Virgülden sonra bağımsız bir cümle gelmemelidir; “allowing” eki sonucu bildiren zarf cümleciği kurar. “Allow” fiili “to + V” ister, bu yüzden “detecting” ve yalın “detect” yanlıştır; üçüncü seçenek ise bağlaçsız ikinci bir yüklem oluşturur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-fen-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki cümleyi anlam ve dilbilgisi bakımından en uygun biçimde tamamlayan seçeneği bulunuz.\n\nNot until the samples had been analysed ___ the anomaly in the readings.',
    options: ['did the team notice', 'the team noticed', 'the team did notice', 'noticed the team'],
    correctAnswer: 'did the team notice',
    explanation:
      'Cümle “Not until” ile başladığında ana cümlede devrik yapı zorunludur; yardımcı fiil öznenin önüne geçer. Bu nedenle yalnızca “did the team notice” dilbilgisel olarak doğrudur.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-fen-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki cümleyi anlam ve dilbilgisi bakımından en uygun biçimde tamamlayan seçeneği bulunuz.\n\nThe data ___ from the satellite were consistent with the earlier climate model.',
    options: ['obtaining', 'obtain', 'were obtained', 'obtained'],
    correctAnswer: 'obtained',
    explanation:
      '“The data ... were consistent” ana yüklemi zaten vardır; boşluğa sıfat işlevli geçmiş ortaç gelmelidir: “obtained from the satellite”. “Were obtained” ikinci bir yüklem yaratır, “obtaining” ise edilgen anlamı vermez.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-fen-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki parçayı okuyup soruyu cevaplayınız.\n\nFor decades, engineers assumed that increasing the thickness of a bridge deck would always make it safer. Recent tests on scale models suggest otherwise. Beyond a certain point, additional mass increases the stress that the structure places on its own foundations, and the extra weight can amplify vibrations caused by wind. The researchers therefore argue that design should focus on how material is distributed rather than on how much of it is used. Their models indicate that a lighter deck, reinforced at critical joints, may outlast a heavier one.\n\nAccording to the passage, why can a thicker deck be less safe?',
    options: [
      'Because thicker decks are more expensive to maintain.',
      'Because scale models cannot represent real bridges accurately.',
      'Because the extra mass increases stress on the foundations and can amplify wind vibrations.',
      'Because wind speeds have risen sharply in recent decades.',
    ],
    correctAnswer:
      'Because the extra mass increases stress on the foundations and can amplify wind vibrations.',
    explanation:
      'Parça, fazla kütlenin yapının kendi temellerine bindirdiği yükü artırdığını ve rüzgârın yol açtığı titreşimleri büyütebildiğini söyler. Diğer seçenekler metinde ele alınmayan konulardır.',
    difficulty: 'easy',
    questionKind: 'reading',
  },
  {
    id: 'yok-yokdil-fen-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki parçayı okuyup soruyu cevaplayınız.\n\nAstronomers have detected thousands of planets outside our solar system, but most are observed indirectly: the planet dims its star slightly as it passes in front of it. This method favours large planets in tight orbits, because they block more light and do so frequently. Small, distant planets produce signals too faint for current instruments. As a result, the catalogue of known exoplanets is systematically biased toward worlds very unlike our own, and any statistical claim about how common Earth-like planets are must be treated with caution.\n\nIt can be inferred from the passage that current exoplanet catalogues ___.',
    options: [
      'may give a misleading impression of how typical Earth-like planets are',
      'contain no information about planets smaller than Earth',
      'are based entirely on direct photographs of distant worlds',
      'have already been corrected for the bias of the detection method',
    ],
    correctAnswer: 'may give a misleading impression of how typical Earth-like planets are',
    explanation:
      'Metin, küçük ve uzak gezegenlerin sinyallerinin zayıf kaldığını ve kataloğun bizimkine benzemeyen dünyalara doğru yanlı olduğunu belirtir; bundan Dünya benzeri gezegenlerin yaygınlığına ilişkin istatistiklerin yanıltıcı olabileceği çıkar. İkinci ve üçüncü seçenek metinle çelişir, dördüncü seçenek ise metinde yoktur.',
    difficulty: 'standard',
    questionKind: 'reading',
  },
  {
    id: 'yok-yokdil-fen-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki İngilizce cümleyi Türkçeye çeviriniz.\n\nThe findings suggest that the reaction is highly sensitive to temperature.',
    options: [
      'Bulgular, tepkimenin sıcaklığa göre duyarlı olması gerektiğini göstermektedir.',
      'Bulgular, sıcaklığın tepkimeye karşı son derece duyarlı olduğunu göstermektedir.',
      'Bulgular, tepkimenin sıcaklıkla duyarlı hale geldiğini göstermektedir.',
      'Bulgular, tepkimenin sıcaklığa son derece duyarlı olduğunu göstermektedir.',
    ],
    correctAnswer: 'Bulgular, tepkimenin sıcaklığa son derece duyarlı olduğunu göstermektedir.',
    explanation:
      '“Suggest that” yan cümlesi düz bir önerme aktarır; “highly sensitive to temperature” ise “sıcaklığa son derece duyarlı” demektir. Birinci seçenek gereklilik, ikinci seçenek özne değişimi, üçüncü seçenek ise “hale gelmek” anlamı ekler.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nThe study reported a strong ___ between air pollution and respiratory illness.',
    options: ['correlate', 'correlated', 'correlational', 'correlation'],
    correctAnswer: 'correlation',
    explanation:
      '“A strong” sıfat tamlamasından sonra isim gerekir; “correlation” (ilişki) doğru biçimdir. Diğer seçenekler fiil veya sıfat biçiminde olduğu için isim görevini üstlenemez.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nThe trial was designed to ___ the effectiveness of the new drug against a placebo.',
    options: ['assess', 'assume', 'assure', 'attach'],
    correctAnswer: 'assess',
    explanation:
      '“Assess” (değerlendirmek) bir ilacın etkinliğini ölçme anlamını verir. “Assume” varsaymak, “assure” güvence vermek demektir; “attach” ise “to” edatı olmadan bu yapıda kullanılmaz.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nThe symptoms were so ___ that the physicians could not agree on a single diagnosis.',
    options: ['ambitious', 'ambiguous', 'ambivalent', 'amphibious'],
    correctAnswer: 'ambiguous',
    explanation:
      '“Ambiguous” (belirsiz, birden fazla biçimde yorumlanabilen) semptomların tek tanıya izin vermemesini açıklar. “Ambitious” hevesli, “ambivalent” ikircikli duygu, “amphibious” ise hem karada hem suda yaşayan anlamına gelir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nA nurse ___ the patient’s blood pressure twice a day.',
    options: ['measure', 'measuring', 'measures', 'is measure'],
    correctAnswer: 'measures',
    explanation:
      'Özne “a nurse” üçüncü tekil olduğundan geniş zamanda fiil -s alır. “Measuring” cümleyi yüklemsiz bırakır, “is measure” ise yardımcı fiille yalın fiili yan yana getirir.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nThe patient had been complaining of fatigue for weeks ___ the doctors finally ordered a blood test.',
    options: ['before', 'since', 'during', 'while'],
    correctAnswer: 'before',
    explanation:
      'İki olayın zaman sırasını bildiren bir bağlaç gerekir; “before” bu ilişkiyi kurar. “Since” bu anlamda geçmiş zamanlı yan cümleyle kullanılmaz, “during” isim öbeği ister, “while” ise eşzamanlılık bildirir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\n___ the drug had been tested extensively on animals, its long-term effects on humans remained unknown.',
    options: ['Because', 'Unless', 'Therefore', 'Although'],
    correctAnswer: 'Although',
    explanation:
      'İki yargı arasında karşıtlık vardır: hayvanlarda kapsamlı biçimde test edilmiş olmasına rağmen insanlardaki uzun vadeli etkileri bilinmiyordu. “Because” neden, “Unless” koşul bildirir; “Therefore” ise yan cümle kuramayan bir zarftır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki cümleyi anlam ve dilbilgisi bakımından en uygun biçimde tamamlayan seçeneği bulunuz.\n\nThe researchers recruited 400 volunteers, ___.',
    options: [
      'half of them had a family history of diabetes',
      'half of who had a family history of diabetes',
      'half of whom had a family history of diabetes',
      'half of which had a family history of diabetes',
    ],
    correctAnswer: 'half of whom had a family history of diabetes',
    explanation:
      'Virgülden sonra bağımsız bir cümle gelmemelidir; insanlar için edat sonrası “whom” ile kurulan ilgi cümlesi gerekir. “Them” virgülle bağlanamaz, “who” edattan sonra yanlıştır, “which” ise cansız varlıklar içindir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki cümleyi anlam ve dilbilgisi bakımından en uygun biçimde tamamlayan seçeneği bulunuz.\n\nHad the infection been detected earlier, ___.',
    options: [
      'the treatment would be far less invasive',
      'the treatment would have been far less invasive',
      'the treatment will be far less invasive',
      'the treatment had been far less invasive',
    ],
    correctAnswer: 'the treatment would have been far less invasive',
    explanation:
      '“Had + V3” geçmişe dönük üçüncü tip koşul kurar ve ana cümlede “would have + V3” ister. Diğer seçenekler koşul ile sonuç arasındaki zaman uyumunu bozar.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki cümleyi anlam ve dilbilgisi bakımından en uygun biçimde tamamlayan seçeneği bulunuz.\n\nThe report recommends that every patient ___ a follow-up appointment within two weeks.',
    options: ['schedules', 'scheduled', 'is scheduling', 'schedule'],
    correctAnswer: 'schedule',
    explanation:
      '“Recommend that” yan cümlesinde İngilizcede dilek kipi (subjunctive) kullanılır ve fiil yalın hâlde gelir. Bu nedenle üçüncü tekil özneden sonra bile “schedule” doğrudur; -s eki ve diğer çekimler bu kuralı bozar.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sag-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki parçayı okuyup soruyu cevaplayınız.\n\nSleep researchers have long warned that chronic sleep deprivation weakens the immune system. A recent study of 1,200 adults offers a more precise picture. Participants who slept fewer than six hours a night were four times more likely to catch a cold than those who slept seven hours or more. The authors stress that the effect was independent of age, diet and exercise. They recommend that adults treat sleep as a medical priority rather than a luxury, and that employers consider later start times for shift workers.\n\nAccording to the passage, participants who slept fewer than six hours a night ___.',
    options: [
      'were four times more likely to catch a cold',
      'were less likely to catch a cold than the others',
      'had a stronger immune response than the others',
      'slept more than seven hours at the weekend',
    ],
    correctAnswer: 'were four times more likely to catch a cold',
    explanation:
      'Parça, altı saatten az uyuyanların soğuk algınlığına yakalanma olasılığının dört kat fazla olduğunu doğrudan bildirir. Diğer seçenekler bu bulgunun tersini söyler ya da metinde geçmeyen bir ayrıntı ekler.',
    difficulty: 'easy',
    questionKind: 'reading',
  },
  {
    id: 'yok-yokdil-sag-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki parçayı okuyup soruyu cevaplayınız.\n\nSleep researchers have long warned that chronic sleep deprivation weakens the immune system. A recent study of 1,200 adults offers a more precise picture. Participants who slept fewer than six hours a night were four times more likely to catch a cold than those who slept seven hours or more. The authors stress that the effect was independent of age, diet and exercise. They recommend that adults treat sleep as a medical priority rather than a luxury, and that employers consider later start times for shift workers.\n\nIt can be inferred from the passage that the authors would most probably agree that ___.',
    options: [
      'diet is the main cause of recurring colds',
      'working hours can have consequences for public health',
      'sleeping more than seven hours is harmful',
      'the study failed to control for age and exercise',
    ],
    correctAnswer: 'working hours can have consequences for public health',
    explanation:
      'Yazarların işverenlere vardiya başlangıçlarını geciktirmelerini önermesi, çalışma düzeninin sağlık üzerinde etkili olduğunu kabul ettiklerini gösterir. İkinci seçenek metnin tersini söyler, üçüncü seçenek metinle çelişir, dördüncü seçenek ise parçada reddedilir.',
    difficulty: 'standard',
    questionKind: 'reading',
  },
  {
    id: 'yok-yokdil-sag-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aşağıdaki Türkçe cümleyi İngilizceye çeviriniz.\n\nBu bulgular, erken teşhisin tedavi süresini kısalttığını ortaya koymaktadır.',
    options: [
      'These findings are suggested by early diagnosis, which shortens the duration of treatment.',
      'These findings suggest early diagnosis to shorten the duration of treatment.',
      'These findings suggest that early diagnosis shortens the duration of treatment.',
      'These findings suggest that early diagnosis is shortened by the duration of treatment.',
    ],
    correctAnswer: 'These findings suggest that early diagnosis shortens the duration of treatment.',
    explanation:
      '“Suggest that” yan cümlesi düz özne-yüklem sırası ister; “early diagnosis shortens the duration of treatment” kaynak cümlenin anlamını korur. Birinci seçenek edilgen yapıyla anlamı tersine çevirir, ikinci seçenekte “suggest” fiili “to” almaz, dördüncü seçenek ise özne ile nesneyi yer değiştirir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nThe historian describes the treaty as a ___ moment that shaped the region for a century.',
    options: ['decisive', 'decided', 'decision', 'decisively'],
    correctAnswer: 'decisive',
    explanation:
      '“Moment” ismini niteleyen bir sıfat gerekir; “decisive” (belirleyici) bu görevi üstlenir. “Decision” isim, “decisively” zarf, “decided” ise bu anlamda sıfat olarak kullanılmaz.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nRapid urbanisation has placed considerable ___ on the country’s transport infrastructure.',
    options: ['strenuous', 'strain', 'restrain', 'straining'],
    correctAnswer: 'strain',
    explanation:
      '“Place a strain on something” kalıbı “bir şeye yük bindirmek” anlamına gelir ve boşlukta isim gerekir. “Strenuous” sıfat, “restrain” fiil, “straining” ise ulaç olduğu için isim görevini üstlenemez.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nThe economist’s argument rests on the ___ assumption that markets always correct themselves.',
    options: ['dutiful', 'dual', 'dubious', 'durable'],
    correctAnswer: 'dubious',
    explanation:
      '“Dubious assumption” (kuşkulu varsayım) yazarın bu kabule mesafeli yaklaştığını gösterir. “Dutiful” görevine bağlı, “dual” ikili, “durable” ise dayanıklı anlamına gelir ve hiçbiri eleştirel tonu vermez.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nIn the fourth century, the Roman Empire ___ into eastern and western halves.',
    options: ['divided', 'was dividing', 'has divided', 'was divided'],
    correctAnswer: 'was divided',
    explanation:
      'İmparatorluk kendi kendine bölünmediği için edilgen yapı gerekir: “was divided”. “Divided” etken ve nesnesiz kalır, “was dividing” süreklilik bildirir, “has divided” ise geçmişteki olayla zaman bakımından uyuşmaz.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\nThe government introduced the new tax ___ reduce inequality between regions.',
    options: ['for to', 'so to', 'in order to', 'in order that'],
    correctAnswer: 'in order to',
    explanation:
      'Amaç bildiren ve ardından yalın fiil alan yapı “in order to”dur. “For to” ve “so to” İngilizcede kullanılmaz; “in order that” ise ardından özne ve yüklem içeren tam cümle ister.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki cümlede boş bırakılan yere uygun düşen ifadeyi bulunuz.\n\n___ the reforms had been implemented, unemployment continued to rise.',
    options: ['Although', 'Despite', 'Because of', 'Nevertheless'],
    correctAnswer: 'Although',
    explanation:
      'Boşluktan sonra özne ve yüklem içeren tam cümle geldiği için bağlaç gerekir: “Although”. “Despite” ve “Because of” isim öbeği alır, “Nevertheless” ise cümleleri virgülle bağlayan bir zarftır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki cümleyi anlam ve dilbilgisi bakımından en uygun biçimde tamamlayan seçeneği bulunuz.\n\nThe census data, ___ in 1927, are still used by demographers today.',
    options: ['collecting', 'collect', 'was collected', 'collected'],
    correctAnswer: 'collected',
    explanation:
      'Ana yüklem “are” olduğu için boşluğa sıfat işlevli geçmiş ortaç gelir: “collected in 1927”. “Was collected” ikinci bir yüklem yaratır, “collecting” ise edilgen anlamı vermez.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki cümleyi anlam ve dilbilgisi bakımından en uygun biçimde tamamlayan seçeneği bulunuz.\n\nSo influential ___ that his ideas reshaped the discipline for decades.',
    options: ['his work was', 'was his work', 'did his work be', 'his work had been'],
    correctAnswer: 'was his work',
    explanation:
      '“So + sıfat” cümle başında kullanıldığında devrik yapı zorunludur; yardımcı fiil öznenin önüne geçer: “So influential was his work that...”. Diğer seçenekler bu devrik yapıyı kurmaz.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki cümleyi anlam ve dilbilgisi bakımından en uygun biçimde tamamlayan seçeneği bulunuz.\n\nNeither the merchants nor the guild ___ willing to accept the new tariff.',
    options: ['were', 'was', 'have been', 'are'],
    correctAnswer: 'was',
    explanation:
      '“Neither ... nor” yapısında fiil kendisine en yakın özneye uyar; “the guild” tekil olduğu için “was” gerekir. “Were” ve “are” çoğul çekimdir, “have been” ise geçmişteki tutumla zaman bakımından uyuşmaz.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-yokdil-sos-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki parçayı okuyup soruyu cevaplayınız.\n\nIn the eighteenth century, most European towns relied on a single market square for both commerce and public debate. Historians once treated this arrangement as evidence of simple, undifferentiated civic life. More recent work challenges that view. Records from Lyon show that different trades occupied the square on different days, and that women, though excluded from formal guild meetings, dominated the early-morning produce trade. The square, in other words, was not a single public sphere but several overlapping ones, each with its own rules of access.\n\nAccording to the passage, recent research suggests that the market square ___.',
    options: [
      'served only as a place of commerce',
      'excluded women from every kind of trade',
      'contained several overlapping public spheres',
      'was controlled by a single merchant guild',
    ],
    correctAnswer: 'contained several overlapping public spheres',
    explanation:
      'Parçanın son cümlesi, meydanın tek bir kamusal alan değil, her biri kendi erişim kurallarına sahip birkaç örtüşen alan olduğunu belirtir. Diğer seçenekler metnin verdiği ayrıntılarla çelişir.',
    difficulty: 'easy',
    questionKind: 'reading',
  },
  {
    id: 'yok-yokdil-sos-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki parçayı okuyup soruyu cevaplayınız.\n\nIn the eighteenth century, most European towns relied on a single market square for both commerce and public debate. Historians once treated this arrangement as evidence of simple, undifferentiated civic life. More recent work challenges that view. Records from Lyon show that different trades occupied the square on different days, and that women, though excluded from formal guild meetings, dominated the early-morning produce trade. The square, in other words, was not a single public sphere but several overlapping ones, each with its own rules of access.\n\nIt can be inferred from the passage that earlier historians ___.',
    options: [
      'underestimated the complexity of urban civic life',
      'had access to more detailed local records',
      'based their work mainly on the city of Lyon',
      'paid too much attention to the produce trade',
    ],
    correctAnswer: 'underestimated the complexity of urban civic life',
    explanation:
      'Eski tarihçiler meydanı “basit ve farklılaşmamış” kamusal yaşamın kanıtı saymıştı; yeni kayıtlar bu tablonun eksik olduğunu gösterir, yani karmaşıklığı olduğundan az görmüşlerdir. Diğer seçenekler metindeki kanıtlarla desteklenmez.',
    difficulty: 'standard',
    questionKind: 'reading',
  },
  {
    id: 'yok-yokdil-sos-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki İngilizce cümleyi Türkçeye çeviriniz.\n\nThe reforms were intended to reduce inequality, yet they widened the gap between rich and poor.',
    options: [
      'Reformlar eşitsizliği azaltmak istedi, bu yüzden zengin ile yoksul arasındaki uçurum büyüdü.',
      'Reformlar zengin ile yoksul arasındaki uçurumu azaltmak için eşitsizliği büyüttü.',
      'Reformlar eşitsizliği azaltmış olsaydı zengin ile yoksul arasındaki uçurum büyüyecekti.',
      'Reformlar eşitsizliği azaltmayı amaçlıyordu, ancak zengin ile yoksul arasındaki uçurumu büyüttü.',
    ],
    correctAnswer:
      'Reformlar eşitsizliği azaltmayı amaçlıyordu, ancak zengin ile yoksul arasındaki uçurumu büyüttü.',
    explanation:
      '“Be intended to” amaç bildirir, “yet” ise beklenmeyen sonucu veren karşıtlık bağlacıdır; dördüncü seçenek bu iki ilişkiyi korur. Birinci seçenek “yet”i nedene çevirir, ikinci seçenek özne ile nesneyi karıştırır, üçüncü seçenek ise koşul anlamı ekler.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
];
