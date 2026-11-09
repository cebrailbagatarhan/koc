import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { TopicDefinition } from '@/data/topicCatalog';

export const LEVEL_NAME = 'ÖSYM';
export const COURSE_NAME = 'TYT';

export const topics: TopicDefinition[] = [
  {
    name: 'Fizik',
    icon: '⚛️',
    summary:
      'Hareket, kuvvet-denge, iş-güç-enerji, basınç, ısı-sıcaklık, elektrik, optik ve dalgalarda temel bağıntıları birimleriyle birlikte kullan.',
    goals: [
      'Sürat ile hız, kütle ile ağırlık arasındaki farkı ayırt et.',
      'Net kuvvet ile ivme arasındaki ilişkiyi kur.',
      'İş ve gücü joule ve watt cinsinden hesapla.',
      'Basınç, ısı ve elektrik enerjisi sorularında birimleri dönüştür.',
    ],
    practicePrompt:
      '200 kg kütleli bir yükü 5 m yükselten vincin yaptığı işi ve 10 saniyedeki gücünü hesapla (g = 10 m/s²).',
    questionIds: [
      'osym-tyt-fiz-1',
      'osym-tyt-fiz-2',
      'osym-tyt-fiz-3',
      'osym-tyt-fiz-4',
      'osym-tyt-fiz-5',
      'osym-tyt-fiz-6',
      'osym-tyt-fiz-7',
      'osym-tyt-fiz-8',
      'osym-tyt-fiz-9',
      'osym-tyt-fiz-10',
      'osym-tyt-fiz-11',
      'osym-tyt-fiz-12',
    ],
  },
  {
    name: 'Kimya',
    icon: '🧪',
    summary:
      'Atom yapısı, periyodik özellikler, kimyasal bağ, mol kavramı, karışımların ayrılması, asit-baz ve tepkime denkleştirme konularını niceliksel olarak ilişkilendir.',
    goals: [
      'Elektron diziliminden proton ve elektron sayısını çıkar.',
      'Mol, kütle, tanecik sayısı ve hacim arasında dönüşüm yap.',
      'Karışımı ayırmak için uygun yöntem sırasını seç.',
      'Tepkime denklemini denkleştirip katsayıları mol oranına çevir.',
    ],
    practicePrompt:
      '0,5 mol CO₂ için kütleyi, molekül sayısını ve normal koşullardaki hacmi ayrı ayrı hesapla.',
    questionIds: [
      'osym-tyt-kim-1',
      'osym-tyt-kim-2',
      'osym-tyt-kim-3',
      'osym-tyt-kim-4',
      'osym-tyt-kim-5',
      'osym-tyt-kim-6',
      'osym-tyt-kim-7',
      'osym-tyt-kim-8',
      'osym-tyt-kim-9',
      'osym-tyt-kim-10',
      'osym-tyt-kim-11',
      'osym-tyt-kim-12',
    ],
  },
  {
    name: 'Biyoloji',
    icon: '🧬',
    summary:
      'Hücre ve organeller, canlıların sınıflandırılması, hücre bölünmesi, Mendel kalıtımı, ekoloji, insan sistemleri ve enzimlerin çalışma ilkelerini kavra.',
    goals: [
      'Organellerin görevlerini birbirine karıştırmadan eşleştir.',
      'Mitoz ile mayozun kromozom sayısına etkisini ayırt et.',
      'Monohibrit ve dihibrit çaprazlamada olasılık hesapla.',
      'Enzim etkinliğini sıcaklık ve pH ile ilişkilendir.',
    ],
    practicePrompt:
      'Ss × Ss çaprazlamasının genotip ve fenotip oranlarını Punnett karesiyle yaz.',
    questionIds: [
      'osym-tyt-biy-1',
      'osym-tyt-biy-2',
      'osym-tyt-biy-3',
      'osym-tyt-biy-4',
      'osym-tyt-biy-5',
      'osym-tyt-biy-6',
      'osym-tyt-biy-7',
      'osym-tyt-biy-8',
      'osym-tyt-biy-9',
      'osym-tyt-biy-10',
      'osym-tyt-biy-11',
      'osym-tyt-biy-12',
    ],
  },
];

export const questions: EmbeddedQuestionSeed[] = [
  {
    id: 'osym-tyt-fiz-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'Bir otomobil 150 metrelik yolu 10 saniyede alıyor. Bu otomobilin ortalama sürati kaç m/s’dir?',
    options: ['12', '20', '15', '10'],
    correctAnswer: '15',
    explanation:
      'Ortalama sürat, alınan yolun geçen süreye bölümüdür: 150 ÷ 10 = 15 m/s. Yön bilgisi verilmediği için burada sürat hesaplanır, hız değil.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Düz bir yolda hareket eden bir aracın hızı 4 saniyede 6 m/s’den 18 m/s’ye çıkıyor. Aracın ortalama ivmesi kaç m/s²’dir?',
    options: ['1,5', '3', '4,5', '12'],
    correctAnswer: '3',
    explanation:
      'İvme, hız değişiminin geçen süreye bölümüdür: a = (18 − 6) ÷ 4 = 3 m/s². Hız değişimini süreye bölmeden yazmak 12 değerini verir, bu en sık yapılan hatadır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Sürtünmesiz yatay düzlemde durmakta olan 5 kg kütleli bir cisme 20 N’luk sabit net kuvvet uygulanıyor. Cismin ivmesi kaç m/s²’dir?',
    options: ['4', '0,25', '20', '100'],
    correctAnswer: '4',
    explanation:
      'Newton’ın ikinci yasasına göre F = m·a olduğundan a = F ÷ m = 20 ÷ 5 = 4 m/s² olur. Kuvveti kütleyle çarpmak 100 değerini verir ve birim olarak da tutarsızdır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Sürtünmesiz yatay düzlemde hareket eden bir cisim için\n\nI. Net kuvvet sıfır ise cisim kesinlikle durur.\nII. Net kuvvet sabit ise cisim sabit ivmeyle hareket eder.\nIII. Net kuvvet sıfırdan farklı ise cismin hızı değişir.\n\nyargılarından hangileri doğrudur?',
    options: ['Yalnız I', 'Yalnız II', 'I ve III', 'II ve III'],
    correctAnswer: 'II ve III',
    explanation:
      'Net kuvvet sıfırsa ivme sıfırdır; cisim duruyorsa durur, hareket ediyorsa sabit hızla devam eder, bu yüzden I yanlıştır. F = m·a olduğundan sabit net kuvvet sabit ivme verir (II); sıfırdan farklı net kuvvet hız vektörünü mutlaka değiştirir (III).',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Bir vinç, 200 kg kütleli bir yükü sabit hızla 5 m yukarı çıkarıyor. (g = 10 m/s², sürtünmeler önemsiz.) Vincin yüke uyguladığı kuvvetin yaptığı iş kaç kJ’dür?',
    options: ['1', '5', '10', '20'],
    correctAnswer: '10',
    explanation:
      'Sabit hızla çıkarken net kuvvet sıfırdır, vinç kuvveti yükün ağırlığına eşittir: F = m·g = 200 × 10 = 2000 N. Yapılan iş W = F·x = 2000 × 5 = 10 000 J = 10 kJ’dür; kütleyi (200 kg) doğrudan kuvvet yerine koymak hatalı biçimde 1 kJ verir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Bir asansör, 600 kg kütleli kabini sabit hızla 12 m yukarı 8 saniyede çıkarıyor. (g = 10 m/s², sürtünmeler önemsiz.) Asansör motorunun gücü en az kaç kW’tır?',
    options: ['4,5', '9', '18', '72'],
    correctAnswer: '9',
    explanation:
      'Yapılan iş W = m·g·h = 600 × 10 × 12 = 72 000 J’dür. Güç, işin süreye bölümüdür: P = 72 000 ÷ 8 = 9000 W = 9 kW. İşi süreye bölmeyi unutmak 72 değerini verir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'İçinde 0,5 m yüksekliğinde su bulunan açık bir kabın tabanına suyun uyguladığı basınç kaç Pa’dır? (Suyun yoğunluğu 1000 kg/m³, g = 10 m/s², su durgun.)',
    options: ['5000', '500', '1000', '50 000'],
    correctAnswer: '5000',
    explanation:
      'Sıvı basıncı yalnızca derinliğe ve sıvının özkütlesine bağlıdır: P = ρ·g·h = 1000 × 10 × 0,5 = 5000 Pa. Kabın biçimi ve içindeki suyun toplam kütlesi bu basıncı değiştirmez.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Kütlesi 2 kg olan suyun sıcaklığı 10 °C’den 30 °C’ye yükseltiliyor. Suyun aldığı ısı kaç kJ’dür? (Suyun öz ısısı 4,2 kJ/kg·°C)',
    options: ['42', '84', '168', '336'],
    correctAnswer: '168',
    explanation:
      'Alınan ısı Q = m·c·ΔT bağıntısıyla bulunur. Sıcaklık değişimi ΔT = 30 − 10 = 20 °C olduğundan Q = 2 × 4,2 × 20 = 168 kJ’dür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Direnci 20 Ω olan bir iletkenin uçları arasındaki gerilim 40 V’tur. İletkenden geçen akım şiddeti kaç A’dır?',
    options: ['0,5', '20', '800', '2'],
    correctAnswer: '2',
    explanation:
      'Ohm yasasına göre I = U ÷ R = 40 ÷ 20 = 2 A’dır. Gerilimi dirence bölmek yerine çarpmak 800 değerini verir; bu değerin birimi de amper olmaz.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Bir elektrikli ısıtıcı 220 V gerilim altında 5 A akım çekmektedir. Isıtıcı 10 dakika çalıştığında harcadığı elektrik enerjisi kaç kJ’dür?',
    options: ['66', '660', '6600', '110'],
    correctAnswer: '660',
    explanation:
      'Güç P = U·I = 220 × 5 = 1100 W’tır. Süre 10 dakika = 600 s olduğundan enerji E = P·t = 1100 × 600 = 660 000 J = 660 kJ’dür.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Odak uzaklığı 10 cm olan ince kenarlı bir merceğin 15 cm uzağına bir cisim yerleştiriliyor. Cismin görüntüsü mercekten kaç cm uzakta oluşur?',
    options: ['30', '6', '15', '60'],
    correctAnswer: '30',
    explanation:
      'İnce kenarlı mercekte 1/f = 1/a + 1/b yazılır: 1/10 = 1/15 + 1/b, buradan 1/b = 1/10 − 1/15 = 1/30 ve b = 30 cm bulunur. Görüntü gerçek ve terstir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fiz-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Bir dalga kaynağı 4 saniyede 20 tam dalga üretiyor. Bu dalgaların yayılma hızı 10 m/s olduğuna göre dalga boyu kaç m’dir?',
    options: ['0,5', '5', '50', '2'],
    correctAnswer: '2',
    explanation:
      'Frekans, saniyedeki dalga sayısıdır: f = 20 ÷ 4 = 5 Hz. Dalga boyu λ = v ÷ f = 10 ÷ 5 = 2 m’dir; periyodu (0,2 s) dalga boyu sanmak 50 değerini verir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Nötr bir X atomunun temel hâl elektron dizilimi 1s² 2s² 2p⁶ 3s² şeklindedir. Bu atomun proton sayısı kaçtır?',
    options: ['10', '12', '14', '20'],
    correctAnswer: '12',
    explanation:
      'Nötr atomda proton sayısı elektron sayısına eşittir. Dizilimdeki elektronlar toplandığında 2 + 2 + 6 + 2 = 12 proton bulunur; bu atom Mg elementidir.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Periyodik sistemde aynı grupta yukarıdan aşağıya inildiğinde atom yarıçapı ve iyonlaşma enerjisi nasıl değişir?',
    options: [
      'Yarıçap artar, iyonlaşma enerjisi azalır',
      'Yarıçap azalır, iyonlaşma enerjisi artar',
      'Yarıçap artar, iyonlaşma enerjisi artar',
      'Yarıçap azalır, iyonlaşma enerjisi azalır',
    ],
    correctAnswer: 'Yarıçap artar, iyonlaşma enerjisi azalır',
    explanation:
      'Aşağı inildikçe katman sayısı arttığı için atom yarıçapı büyür. Değerlik elektronu çekirdekten uzaklaştığından koparılması kolaylaşır ve iyonlaşma enerjisi azalır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'NaCl bileşiğinde Na⁺ ve Cl⁻ iyonlarını bir arada tutan etkileşim aşağıdakilerden hangisidir?',
    options: ['Kovalent bağ', 'Metalik bağ', 'İyonik bağ', 'Hidrojen bağı'],
    correctAnswer: 'İyonik bağ',
    explanation:
      'Na elektron vererek Na⁺, Cl elektron alarak Cl⁻ iyonuna dönüşür. Zıt yüklü iyonlar arasındaki elektrostatik çekim iyonik bağı oluşturur; bu bağ moleküller arasında değil iyonlar arasındadır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      '1 mol CO₂ gazı için (C: 12, O: 16, Avogadro sayısı: 6,02 × 10²³)\n\nI. 44 gramdır.\nII. 6,02 × 10²³ tane CO₂ molekülü içerir.\nIII. Normal koşullarda 11,2 litre hacim kaplar.\n\nyargılarından hangileri doğrudur?',
    options: ['Yalnız I', 'Yalnız III', 'II ve III', 'I ve II'],
    correctAnswer: 'I ve II',
    explanation:
      'CO₂’nin mol kütlesi 12 + 2 × 16 = 44 g/mol olduğundan 1 mol 44 g’dır (I). Bir molde Avogadro sayısı kadar molekül bulunur (II). Normal koşullarda 1 mol gaz 22,4 L kapladığı için III yanlıştır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: '0,5 mol su kaç tane H₂O molekülü içerir? (Avogadro sayısı: 6,02 × 10²³)',
    options: ['3,01 × 10²³', '6,02 × 10²³', '0,5 × 10²³', '12,04 × 10²³'],
    correctAnswer: '3,01 × 10²³',
    explanation:
      'Bir molde Avogadro sayısı kadar tanecik bulunur. Mol sayısı ile Avogadro sayısı çarpılır: 0,5 × 6,02 × 10²³ = 3,01 × 10²³ molekül. Mol sayısını doğrudan tanecik sayısı sanmak en sık yapılan hatadır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Kum ve tuzdan oluşan bir karışımdan hem kumu hem de tuzu ayrı ayrı elde etmek için hangi işlem sırası uygulanmalıdır?',
    options: [
      'Süzme – buharlaştırma – suda çözme',
      'Suda çözme – süzme – buharlaştırma',
      'Ayırma hunisi – süzme – buharlaştırma',
      'Buharlaştırma – suda çözme – süzme',
    ],
    correctAnswer: 'Suda çözme – süzme – buharlaştırma',
    explanation:
      'Karışıma su eklenince tuz çözünür, kum çözünmez. Süzgeç kumu tutar; süzüntü buharlaştırıldığında tuz kristalleri geri kazanılır. Ayırma hunisi birbiriyle karışmayan sıvılar için kullanılır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      '25 °C’de 0,005 mol/L H₂SO₄ çözeltisinin pH değeri kaçtır? (H₂SO₄ suda tamamen iyonlaşmaktadır.)',
    options: ['2,3', '12', '2', '1'],
    correctAnswer: '2',
    explanation:
      'H₂SO₄ iki proton verdiği için [H⁺] = 2 × 0,005 = 0,010 mol/L olur. pH = −log(0,010) = 2’dir; iki protonu hesaba katmamak 2,3 değerini verir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      '25 °C’de pH değeri 11 olan bir sulu çözeltide OH⁻ iyonlarının derişimi kaç mol/L’dir?',
    options: ['1 × 10⁻¹¹', '1 × 10⁻⁸', '1 × 10³', '1 × 10⁻³'],
    correctAnswer: '1 × 10⁻³',
    explanation:
      '25 °C’de pH + pOH = 14 olduğundan pOH = 14 − 11 = 3’tür. Buradan [OH⁻] = 10⁻³ = 1 × 10⁻³ mol/L bulunur; pH değerini doğrudan OH⁻ derişimi sanmak 1 × 10⁻¹¹ hatasına götürür.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'C₃H₈ + O₂ → CO₂ + H₂O denklemi en küçük tam sayı katsayılarla denkleştirildiğinde O₂’nin katsayısı kaç olur?',
    options: ['3', '5', '4', '7'],
    correctAnswer: '5',
    explanation:
      'Denklem C₃H₈ + 5O₂ → 3CO₂ + 4H₂O biçiminde denkleştirilir. Her iki tarafta 3 C, 8 H ve 10 O bulunur; bu nedenle O₂’nin katsayısı 5’tir. CO₂’nin katsayısı 3, H₂O’nunki 4’tür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      '2Al + 3Cl₂ → 2AlCl₃ tepkimesine göre 0,4 mol Al tamamen harcandığında kaç gram AlCl₃ oluşur? (Al: 27, Cl: 35,5)',
    options: ['53,4', '26,7', '13,35', '106,8'],
    correctAnswer: '53,4',
    explanation:
      'Katsayılar 2 : 2 olduğundan 0,4 mol Al’den 0,4 mol AlCl₃ oluşur. AlCl₃’ün mol kütlesi 27 + 3 × 35,5 = 133,5 g/mol, kütle 0,4 × 133,5 = 53,4 g’dır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Atom numarası 17 olan Cl elementinin klorür iyonunun (Cl⁻) elektron dizilimi aşağıdakilerden hangisidir?',
    options: [
      '1s² 2s² 2p⁶ 3s² 3p⁵',
      '1s² 2s² 2p⁶ 3s² 3p⁴',
      '1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹',
      '1s² 2s² 2p⁶ 3s² 3p⁶',
    ],
    correctAnswer: '1s² 2s² 2p⁶ 3s² 3p⁶',
    explanation:
      'Nötr Cl atomunda 17 elektron vardır ve dizilim 3p⁵ ile biter. Cl⁻ iyonu bir elektron daha aldığı için dizilim 3p⁶ ile tamamlanır ve toplam 18 elektrona ulaşır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-kim-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Bir öğrenci aynı sıcaklıkta hazırlanan 0,1 mol/L HCl ve 0,1 mol/L CH₃COOH çözeltilerinin pH değerlerini pH metreyle ölçüyor. HCl çözeltisinde pH = 1, CH₃COOH çözeltisinde pH = 3 okunuyor. Bu sonuçlara göre aşağıdaki yorumlardan hangisi doğrudur?',
    options: [
      'İki asit de suda aynı oranda iyonlaşmıştır',
      'CH₃COOH çözeltisinde H⁺ iyonu bulunmaz',
      'CH₃COOH zayıf bir asittir, suda kısmen iyonlaşır',
      'HCl çözeltisinin derişimi daha düşüktür',
    ],
    correctAnswer: 'CH₃COOH zayıf bir asittir, suda kısmen iyonlaşır',
    explanation:
      'Derişimler eşit olduğu hâlde HCl çözeltisinin pH’ı daha küçüktür; yani H⁺ derişimi daha yüksektir. HCl kuvvetli asit olarak tamamen iyonlaşırken CH₃COOH zayıf asit olarak kısmen iyonlaşır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: 'Hücrede protein sentezinin gerçekleştiği organel aşağıdakilerden hangisidir?',
    options: ['Ribozom', 'Mitokondri', 'Golgi cisimciği', 'Lizozom'],
    correctAnswer: 'Ribozom',
    explanation:
      'Amino asitler ribozomda peptit bağıyla birleştirilerek proteine dönüştürülür. Mitokondri enerji üretiminde, golgi cisimciği salgı maddelerinin paketlenmesinde, lizozom ise hücre içi sindirimde görev alır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki organellerden hangisi fotosentez yapan bir bitki hücresinde bulunur, hayvan hücresinde bulunmaz?',
    options: ['Mitokondri', 'Ribozom', 'Kloroplast', 'Golgi cisimciği'],
    correctAnswer: 'Kloroplast',
    explanation:
      'Kloroplast fotosentezin yapıldığı, klorofil taşıyan organeldir ve hayvan hücrelerinde bulunmaz. Mitokondri, ribozom ve golgi cisimciği hem bitki hem hayvan hücrelerinde görülür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Mitoz bölünme sonucunda oluşan hücrelerin kromozom sayısı ana hücreninkine göre nasıldır?',
    options: [
      'Ana hücrenin yarısıdır',
      'Ana hücrenin iki katıdır',
      'Ana hücrenin dörtte biridir',
      'Ana hücre ile aynıdır',
    ],
    correctAnswer: 'Ana hücre ile aynıdır',
    explanation:
      'Mitozda DNA bir kez eşlenir ve kardeş kromatitler bir kez ayrılır. Bu nedenle oluşan iki hücre, ana hücreyle aynı kromozom sayısına ve aynı kalıtsal yapıya sahiptir.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      '2n = 24 kromozomlu bir hücre mayoz bölünme geçirdiğinde oluşan hücrelerin kromozom sayısı kaçtır?',
    options: ['24', '12', '6', '48'],
    correctAnswer: '12',
    explanation:
      'Mayozda homolog kromozomlar birbirinden ayrıldığı için kromozom sayısı yarıya iner. 24 kromozomlu ana hücreden 12 kromozomlu dört hücre oluşur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Bezelyelerde sarı tohum rengi (S), yeşil tohum rengine (s) baskındır. Heterozigot sarı tohumlu iki bezelye çaprazlandığında oluşan bireylerin sarı tohumlu olma oranı kaçtır?',
    options: ['3/4', '1/4', '1/2', '1/3'],
    correctAnswer: '3/4',
    explanation:
      'Ss × Ss çaprazlamasında genotipler 1 SS : 2 Ss : 1 ss, yani 3 : 1 oranında dağılır. Baskın özelliği gösterenlerin oranı 3/4’tür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Bezelyelerde A ve B genleri bağımsız olarak kalıtılmaktadır. AaBb × AaBb çaprazlamasında her iki özellik bakımından da baskın fenotip gösteren bireylerin oranı kaçtır?',
    options: ['1/16', '3/16', '9/16', '3/4'],
    correctAnswer: '9/16',
    explanation:
      'Tek bir gen için Aa × Aa çaprazlamasında baskın fenotip oranı 3/4’tür. Genler bağımsız olduğundan olasılıklar çarpılır: 3/4 × 3/4 = 9/16.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Bir besin zincirinde üst basamaklara aktarılan enerji miktarı giderek azalır. Bu azalmanın temel nedeni aşağıdakilerden hangisidir?',
    options: [
      'Besin zincirindeki canlı sayısının giderek azalması',
      'Üreticilerin güneş enerjisinin tamamını kimyasal enerjiye dönüştürmesi',
      'Ayrıştırıcıların enerjiyi doğrudan üreticilere aktarması',
      'Canlıların enerjinin bir kısmını yaşamsal faaliyetlerinde kullanıp ısı olarak kaybetmesi',
    ],
    correctAnswer: 'Canlıların enerjinin bir kısmını yaşamsal faaliyetlerinde kullanıp ısı olarak kaybetmesi',
    explanation:
      'Her canlı aldığı enerjinin bir bölümünü solunumla kendi yaşamsal faaliyetlerinde kullanır ve önemli bir kısmını ısı olarak çevreye verir. Bu nedenle bir sonraki basamağa enerjinin yalnızca küçük bir bölümü aktarılır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: 'Aşağıdakilerden hangisi bir popülasyonu tanımlar?',
    options: [
      'Bir ormandaki tüm canlılar',
      'Bir göldeki tüm sazan balıkları',
      'Bir göldeki bütün balık türleri',
      'Bir ormandaki canlılar ve cansız çevre',
    ],
    correctAnswer: 'Bir göldeki tüm sazan balıkları',
    explanation:
      'Popülasyon, belirli bir alanda yaşayan aynı türe ait bireylerin topluluğudur; aynı göldeki bütün sazan balıkları bu tanıma uyar. Farklı türlerin bir arada bulunması komüniteyi, canlı ve cansız çevrenin birlikte ele alınması ekosistemi oluşturur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: 'İnce bağırsak duvarında bulunan villusların temel görevi aşağıdakilerden hangisidir?',
    options: [
      'Besinlerin kimyasal sindirimini başlatmak',
      'Sindirim enzimlerini salgılamak',
      'İnce bağırsağın emilim yüzeyini artırmak',
      'Kalın bağırsağa su geçişini sağlamak',
    ],
    correctAnswer: 'İnce bağırsağın emilim yüzeyini artırmak',
    explanation:
      'Villuslar ince bağırsağın iç yüzey alanını çok artırarak besin monomerlerinin kana emilimini hızlandırır. Enzim salgılamak pankreas ve bağırsak bezlerinin, kimyasal sindirimi başlatmak ise mide ve pankreas salgılarının işidir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Enzimler için\n\nI. Tepkimenin aktivasyon enerjisini düşürür.\nII. Tepkimeden önce ve sonra yapısı değişmeden kalır.\nIII. Tepkime sırasında harcanır ve miktarı azalır.\n\nyargılarından hangileri doğrudur?',
    options: ['I ve II', 'Yalnız I', 'II ve III', 'I, II ve III'],
    correctAnswer: 'I ve II',
    explanation:
      'Enzimler aktivasyon enerjisini düşürerek tepkimeyi hızlandırır (I) ve tepkime sonunda değişmeden kalır (II). Tepkimede harcanmadıkları için III yanlıştır; “enzim tepkimede harcanır” yaygın bir kavram yanılgısıdır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Bezelyelerde uzun gövde (U) kısa gövdeye (u) baskındır. Uzun gövdeli iki bezelyenin çaprazlanmasından 240 uzun ve 80 kısa gövdeli birey elde edilmiştir. Ebeveynlerin genotipleri aşağıdakilerden hangisidir?',
    options: ['UU × UU', 'UU × Uu', 'Uu × uu', 'Uu × Uu'],
    correctAnswer: 'Uu × Uu',
    explanation:
      '240 : 80 oranı 3 : 1’dir ve bu oran ancak iki heterozigotun çaprazlanmasında (Uu × Uu) ortaya çıkar. UU bireyler çekinik özellik gösteren yavru veremeyeceği için diğer seçenekler elenir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-biy-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Bir öğrenci ezilmiş taze karaciğer parçalarını eşit miktarda hidrojen peroksit çözeltisine koyup oluşan gaz kabarcıklarını sayıyor. Gözlemleri şöyledir: 0 °C’de çok az kabarcık, 25 °C’de çok sayıda kabarcık, 80 °C’de hiç kabarcık yok. Bu gözlemlere göre aşağıdaki yorumlardan hangisi doğrudur?',
    options: [
      '0 °C’de enzim molekülleri tamamen parçalanmıştır',
      '80 °C’de enzimin yapısı bozulduğu için tepkime gerçekleşmemiştir',
      'Sıcaklık arttıkça enzim etkinliği sürekli artar',
      'Enzim tepkimede harcandığı için 80 °C’de tükenmiştir',
    ],
    correctAnswer: '80 °C’de enzimin yapısı bozulduğu için tepkime gerçekleşmemiştir',
    explanation:
      'Karaciğerdeki katalaz enzimi düşük sıcaklıkta yavaş, uygun sıcaklıkta hızlı çalışır. 80 °C’de protein yapısı bozulduğu (denatürasyon) için etkinlik tamamen kaybolur; 0 °C’de ise yapı bozulmaz, yalnızca tepkime yavaşlar.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
];
