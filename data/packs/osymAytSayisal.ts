import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { TopicDefinition } from '@/data/topicCatalog';

export const LEVEL_NAME = 'ÖSYM';
export const COURSE_NAME = 'AYT Sayısal';

export const topics: TopicDefinition[] = [
  {
    name: 'Matematik',
    icon: '∫',
    summary:
      'Fonksiyon, polinom, ikinci derece denklem, trigonometri, logaritma, dizi, olasılık ve türev bilgisini çok adımlı AYT sorularında birleştir.',
    goals: [
      'İç içe fonksiyonda önce iç değeri hesapla.',
      'Kökler ile katsayılar arasındaki bağıntıyı kullan.',
      'Logaritma ile üslü ifadeyi birbirine çevir.',
      'Türevin işaretinden yerel ekstremumu bul.',
    ],
    practicePrompt:
      'x² − 5x + 6 = 0 denkleminin köklerini bulup kökler toplamı ve çarpımıyla sonucu doğrula.',
    questionIds: [
      'osym-ayt-mat-1',
      'osym-ayt-mat-2',
      'osym-ayt-mat-3',
      'osym-ayt-mat-4',
      'osym-ayt-mat-5',
      'osym-ayt-mat-6',
      'osym-ayt-mat-7',
      'osym-ayt-mat-8',
      'osym-ayt-mat-9',
      'osym-ayt-mat-10',
    ],
  },
  {
    name: 'Fizik',
    icon: '🧲',
    summary:
      'Vektör, Newton yasaları, momentum, elektrik alan-potansiyel, manyetizma, dalga ve modern fizik bilgisini nicel AYT sorularında kullan.',
    goals: [
      'Bileşke kuvveti yön bilgisiyle hesapla.',
      'Net kuvvetten ivmeye, ivmeden hıza geç.',
      'Elektrik alan, potansiyel ve kuvvet ilişkisini ayır.',
      'Dalga denkleminde periyot, frekans ve hızı bağla.',
    ],
    practicePrompt:
      'Periyodu 0,05 s ve dalga boyu 0,25 m olan dalganın frekansını ve yayılma hızını hesapla.',
    questionIds: [
      'osym-ayt-fiz-1',
      'osym-ayt-fiz-2',
      'osym-ayt-fiz-3',
      'osym-ayt-fiz-4',
      'osym-ayt-fiz-5',
      'osym-ayt-fiz-6',
      'osym-ayt-fiz-7',
      'osym-ayt-fiz-8',
      'osym-ayt-fiz-9',
      'osym-ayt-fiz-10',
    ],
  },
  {
    name: 'Kimya',
    icon: '⚗️',
    summary:
      'Gaz yasaları, çözelti derişimi, termokimya, kimyasal denge, organik bileşikler ve elektrokimyanın temel bağıntılarını kullan.',
    goals: [
      'Gaz yasalarında sabit kalan niceliği belirle.',
      'Derişimi mol ve hacimden hesapla.',
      'Dengede basınç ve sıcaklık etkisini yorumla.',
      'Yükseltgenme ve indirgenme kavramlarını ayır.',
    ],
    practicePrompt:
      '2 L’de 0,5 mol NaCl içeren çözeltinin derişimini hesapla, sonra 250 mL’sindeki mol sayısını bul.',
    questionIds: [
      'osym-ayt-kim-1',
      'osym-ayt-kim-2',
      'osym-ayt-kim-3',
      'osym-ayt-kim-4',
      'osym-ayt-kim-5',
      'osym-ayt-kim-6',
      'osym-ayt-kim-7',
      'osym-ayt-kim-8',
      'osym-ayt-kim-9',
      'osym-ayt-kim-10',
    ],
  },
  {
    name: 'Biyoloji',
    icon: '🌿',
    summary:
      'Protein sentezi, genetik çaprazlama, sistemler, bitki biyolojisi, ekoloji ve evrim temel bilgisini çok adımlı sorularda birleştir.',
    goals: [
      'Kodon ile amino asit sayısı arasındaki ilişkiyi kur.',
      'Çaprazlamada bağımsız olayların olasılığını çarp.',
      'Organ ve sistemlerin görevlerini ayırt et.',
      'Enerji aktarımı ve seçilim mekanizmalarını yorumla.',
    ],
    practicePrompt:
      'AaBb × aabb çaprazlamasında Aabb genotipinin olasılığını karakterlere ayırarak hesapla.',
    questionIds: [
      'osym-ayt-bio-1',
      'osym-ayt-bio-2',
      'osym-ayt-bio-3',
      'osym-ayt-bio-4',
      'osym-ayt-bio-5',
      'osym-ayt-bio-6',
      'osym-ayt-bio-7',
      'osym-ayt-bio-8',
      'osym-ayt-bio-9',
      'osym-ayt-bio-10',
    ],
  },
];

export const questions: EmbeddedQuestionSeed[] = [
  {
    id: 'osym-ayt-mat-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'f(x) = 3x + 1 olmak üzere f(f(2)) değeri kaçtır?',
    options: ['7', '22', '24', '29'],
    correctAnswer: '22',
    explanation:
      'Önce iç fonksiyon hesaplanır: f(2) = 3·2 + 1 = 7. Ardından f(7) = 3·7 + 1 = 22 bulunur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-mat-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'P(x) = 2x² − 5x + 1 polinomu için P(−1) değeri kaçtır?',
    options: ['−2', '6', '7', '8'],
    correctAnswer: '8',
    explanation:
      'P(−1) = 2·(−1)² − 5·(−1) + 1 = 2 + 5 + 1 = 8 olur; negatif değerin karesi pozitiftir.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-mat-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'x² − 5x + 6 = 0 denkleminin kökleri x₁ ve x₂ olduğuna göre x₁² + x₂² kaçtır?',
    options: ['5', '6', '13', '25'],
    correctAnswer: '13',
    explanation:
      'Kökler 2 ve 3’tür, karelerinin toplamı 4 + 9 = 13 olur. Bağıntıyla da (x₁ + x₂)² − 2x₁x₂ = 25 − 12 = 13 bulunur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-mat-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: '0° < x < 90° ve tan x = 3/4 olduğuna göre sin x + cos x kaçtır?',
    options: ['12/25', '5/7', '1', '7/5'],
    correctAnswer: '7/5',
    explanation:
      '3-4-5 dik üçgeninde karşı kenar 3, komşu kenar 4, hipotenüs 5’tir; sin x = 3/5 ve cos x = 4/5 olduğundan toplam 7/5 olur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-mat-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'log₂16 + log₃(1/9) işleminin sonucu kaçtır?',
    options: ['−2', '2', '4', '6'],
    correctAnswer: '2',
    explanation:
      'log₂16 = 4 ve log₃(1/9) = −2 olduğundan sonuç 4 + (−2) = 2’dir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-mat-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'İlk terimi 4, ortak farkı 3 olan aritmetik dizinin ilk 10 teriminin toplamı kaçtır?',
    options: ['155', '170', '175', '190'],
    correctAnswer: '175',
    explanation:
      'a₁₀ = 4 + 9·3 = 31’dir. Toplam S₁₀ = 10·(a₁ + a₁₀)/2 = 10·35/2 = 175 bulunur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-mat-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Bir torbada 3 kırmızı ve 5 mavi top vardır. Torbadan geri konulmadan art arda iki top çekildiğinde ikisinin de kırmızı olma olasılığı kaçtır?',
    options: ['3/28', '9/64', '3/8', '15/28'],
    correctAnswer: '3/28',
    explanation:
      'İlk çekilişte olasılık 3/8, ikinci çekilişte 2/7’dir. Çarpım 6/56 = 3/28 olur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-mat-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'f(x) = x³ − 3x fonksiyonunun yerel minimum değeri kaçtır?',
    options: ['−2', '0', '2', '4'],
    correctAnswer: '−2',
    explanation:
      'Türev 3x² − 3 olup x = 1 ve x = −1 kritik noktalarıdır. x = 1’de ikinci türev pozitif olduğundan yerel minimum f(1) = 1 − 3 = −2’dir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-mat-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'x² − 6x + k = 0 denklemi için\nI. k = 12 iken iki farklı gerçek kökü vardır.\nII. k = 9 iken çift katlı kökü vardır.\nIII. k = 5 iken kökleri 1 ve 5’tir.\nifadelerinden hangileri doğrudur?',
    options: ['Yalnız I', 'Yalnız II', 'II ve III', 'I, II ve III'],
    correctAnswer: 'II ve III',
    explanation:
      'k = 12 için diskriminant 36 − 48 = −12 negatif olduğundan gerçek kök yoktur ve I yanlıştır. k = 9’da diskriminant sıfırdır; k = 5’te denklem (x − 1)(x − 5) = 0 biçiminde çarpanlara ayrılır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-mat-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'f(x) = log₂(x − 1) fonksiyonu için\nI. Tanım kümesi x > 1’dir.\nII. f(3) = 1’dir.\nIII. f(9) = 4’tür.\nifadelerinden hangileri doğrudur?',
    options: ['Yalnız I', 'II ve III', 'I ve II', 'I ve III'],
    correctAnswer: 'I ve II',
    explanation:
      'Logaritmanın tanımlı olması için x − 1 > 0 gerekir ve f(3) = log₂2 = 1’dir. f(9) = log₂8 = 3 olduğundan III yanlıştır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Aynı doğrultuda ve zıt yönde etki eden iki kuvvetin bileşkesi 4 N’dur. Büyük kuvvet 10 N olduğuna göre küçük kuvvet kaç N’dur?',
    options: ['4', '6', '8', '14'],
    correctAnswer: '6',
    explanation:
      'Zıt yönlü kuvvetlerde bileşke, büyük kuvvetten küçüğü çıkarılarak bulunur: 10 − F = 4 ise F = 6 N’dur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Sürtünmeli yatay düzlemde 5 kg kütleli bir cisme 20 N’luk yatay kuvvet uygulanıyor. Cisme etkiyen sürtünme kuvveti 5 N olduğuna göre cismin ivmesi kaç m/s²’dir?',
    options: ['3', '4', '5', '15'],
    correctAnswer: '3',
    explanation:
      'Net kuvvet 20 − 5 = 15 N’dur. Newton’un ikinci yasasına göre a = 15/5 = 3 m/s² olur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Kütlesi 2 kg olan bir cisim 6 m/s hızla hareket etmektedir. Cismin momentumu kaç kg·m/s’dir?',
    options: ['3', '8', '12', '24'],
    correctAnswer: '12',
    explanation: 'Momentum p = m·v = 2·6 = 12 kg·m/s olarak bulunur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Elektrik alan şiddeti 2 × 10⁵ N/C olan bir bölgede 4 × 10⁻⁶ C’luk yük bulunmaktadır. Bu yüke etki eden elektriksel kuvvet kaç N’dur?',
    options: ['0,08', '0,2', '0,4', '0,8'],
    correctAnswer: '0,8',
    explanation:
      'F = q·E = 4 × 10⁻⁶ · 2 × 10⁵ = 8 × 10⁻¹ = 0,8 N’dur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Potansiyel farkı 40 V olan iki nokta arasında 2 × 10⁻⁶ C’luk yük taşınıyor. Elektriksel kuvvetlerin yaptığı iş kaç joule olur?',
    options: ['2 × 10⁻⁵', '8 × 10⁻⁵', '4 × 10⁻⁴', '8 × 10⁻⁴'],
    correctAnswer: '8 × 10⁻⁵',
    explanation:
      'W = q·V = 2 × 10⁻⁶ · 40 = 80 × 10⁻⁶ = 8 × 10⁻⁵ joule bulunur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Manyetik alan şiddeti 0,2 T olan bir bölgede alana dik konumdaki 0,5 m uzunluğundaki telden 4 A’lik akım geçmektedir. Tele etki eden manyetik kuvvet kaç N’dur?',
    options: ['0,04', '0,2', '0,4', '0,8'],
    correctAnswer: '0,4',
    explanation: 'F = B·I·L = 0,2 · 4 · 0,5 = 0,4 N’dur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Periyodu 0,05 s ve dalga boyu 0,25 m olan bir dalganın yayılma hızı kaç m/s’dir?',
    options: ['0,2', '5', '20', '80'],
    correctAnswer: '5',
    explanation:
      'Frekans f = 1/T = 1/0,05 = 20 Hz’dir. Hız v = λ·f = 0,25 · 20 = 5 m/s olur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Eşik enerjisi 2 eV olan bir metale 7 eV enerjili fotonlar düşürülüyor. Kopan elektronların maksimum kinetik enerjisi kaç eV’tur?',
    options: ['2', '5', '7', '9'],
    correctAnswer: '5',
    explanation:
      'Kinetik enerji, gelen foton enerjisinden eşik enerjisi çıkarılarak bulunur: 7 − 2 = 5 eV.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Sürtünmesiz yatay düzlemde durmakta olan 2 kg kütleli cisme 4 s boyunca 6 N’luk sabit yatay kuvvet uygulanıyor. Buna göre\nI. Cismin ivmesi 3 m/s²’dir.\nII. Cismin 4 s sonundaki hızı 24 m/s’dir.\nIII. Cismin 4 s sonundaki momentumu 24 kg·m/s’dir.\nyargılarından hangileri doğrudur?',
    options: ['Yalnız I', 'Yalnız II', 'II ve III', 'I ve III'],
    correctAnswer: 'I ve III',
    explanation:
      'İvme 6/2 = 3 m/s², hız 3·4 = 12 m/s ve momentum 2·12 = 24 kg·m/s olur. Hız 12 m/s olduğu için II yanlıştır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-fiz-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Elektrik alan ve potansiyel ile ilgili\nI. Elektrik alan çizgileri pozitif yükten çıkar, negatif yükte sonlanır.\nII. Eş potansiyel yüzeyler elektrik alan çizgilerine diktir.\nIII. Bir yük eş potansiyel yüzey üzerinde taşınırsa elektriksel iş yapılır.\nyargılarından hangileri doğrudur?',
    options: ['I ve II', 'Yalnız I', 'II ve III', 'I ve III'],
    correctAnswer: 'I ve II',
    explanation:
      'Eş potansiyel yüzeyde potansiyel farkı sıfır olduğu için W = q·ΔV = 0’dır ve iş yapılmaz. Bu nedenle III yanlış, I ve II doğrudur.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Sabit sıcaklıkta 2 L hacmindeki bir gazın basıncı 3 atm’dir. Hacim 4 L’ye çıkarılırsa basınç kaç atm olur?',
    options: ['0,5', '1', '1,5', '6'],
    correctAnswer: '1,5',
    explanation:
      'Boyle yasasına göre P₁·V₁ = P₂·V₂ yazılır: 3·2 = P₂·4 ise P₂ = 1,5 atm bulunur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      '2 L’lik çözeltide 0,5 mol NaCl çözünmüştür. Bu çözeltinin molar derişimi kaç mol/L’dir?',
    options: ['0,25', '0,5', '1', '4'],
    correctAnswer: '0,25',
    explanation: 'Molar derişim M = n/V = 0,5/2 = 0,25 mol/L olarak hesaplanır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: 'ΔH = −180 kJ olan bir tepkime için aşağıdakilerden hangisi doğrudur?',
    options: [
      'Tepkime ortamdan ısı alır.',
      'Tepkime ortama ısı verir.',
      'Ürünlerin entalpisi girenlerinkinden büyüktür.',
      'Tepkimenin aktivasyon enerjisi sıfırdır.',
    ],
    correctAnswer: 'Tepkime ortama ısı verir.',
    explanation:
      'ΔH’nin negatif olması tepkimenin ekzotermik olduğunu gösterir; tepkime ortama ısı verir ve ürünlerin entalpisi girenlerden küçük olur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'H₂(g) + I₂(g) ⇌ 2HI(g) tepkimesinin denge sabiti Kc = 64’tür. Dengede [H₂] = [I₂] = 1 mol/L olduğuna göre [HI] kaç mol/L’dir?',
    options: ['2', '4', '8', '16'],
    correctAnswer: '8',
    explanation:
      'Kc = [HI]²/([H₂]·[I₂]) olduğundan [HI]² = 64·1·1 = 64 ve [HI] = 8 mol/L bulunur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      '0,1 mol bir alkan tam olarak yakıldığında 0,3 mol CO₂ oluşuyor. Buna göre alkan molekülündeki hidrojen atomu sayısı kaçtır?',
    options: ['6', '7', '8', '10'],
    correctAnswer: '8',
    explanation:
      '0,1 mol alkandan 0,3 mol CO₂ oluştuğuna göre molekülde 3 karbon vardır. Alkan formülü C₃H₈ olup hidrojen sayısı 8’dir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Zn(k) → Zn²⁺(suda) + 2e⁻ değişimine göre 0,2 mol Zn tamamen yükseltgendiğinde açığa çıkan elektronun mol sayısı kaçtır?',
    options: ['0,4', '0,6', '0,8', '1,2'],
    correctAnswer: '0,4',
    explanation:
      'Her çinko atomu 2 elektron verdiğinden açığa çıkan elektron 0,2·2 = 0,4 moldür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: 'Aşağıdaki çözeltilerden hangisinin derişimi 0,5 mol/L’dir?',
    options: [
      '1 L’de 0,2 mol NaCl çözünmüş',
      '2 L’de 0,6 mol NaCl çözünmüş',
      '0,5 L’de 0,2 mol NaCl çözünmüş',
      '4 L’de 2 mol NaCl çözünmüş',
    ],
    correctAnswer: '4 L’de 2 mol NaCl çözünmüş',
    explanation:
      '4 L’de 2 mol için M = 2/4 = 0,5 mol/L’dir. Diğer seçenekler sırasıyla 0,2; 0,3 ve 0,4 mol/L derişim verir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      '2H₂(g) + O₂(g) → 2H₂O(s) + 572 kJ tepkimesi için\nI. Tepkime ekzotermiktir.\nII. 1 mol H₂O oluştuğunda 286 kJ ısı açığa çıkar.\nIII. Tepkimenin ΔH değeri +572 kJ’dür.\nyargılarından hangileri doğrudur?',
    options: ['Yalnız I', 'Yalnız II', 'II ve III', 'I ve II'],
    correctAnswer: 'I ve II',
    explanation:
      'Isı ürünler tarafında verildiği için tepkime ekzotermik ve ΔH = −572 kJ’dür; bu yüzden III yanlıştır. 2 mol su için 572 kJ ise 1 mol su için 286 kJ açığa çıkar.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + ısı dengesi için\nI. Basınç artırılırsa NH₃ derişimi artar.\nII. Sıcaklık artırılırsa denge sabiti Kc artar.\nIII. Katalizör eklenmesi dengeyi ürünler yönüne kaydırır.\nyargılarından hangileri doğrudur?',
    options: ['Yalnız I', 'Yalnız II', 'I ve II', 'II ve III'],
    correctAnswer: 'Yalnız I',
    explanation:
      'Basınç artışı mol sayısı küçük olan ürünler yönünü destekler. Tepkime ısı veren yönde olduğundan sıcaklık artışı Kc’yi küçültür; katalizör ise denge konumunu değiştirmez.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-kim-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Elektrokimya ile ilgili\nI. Yükseltgenme elektron kaybıdır.\nII. Galvanik hücrede anot negatif kutuptur.\nIII. İndirgenme potansiyeli küçük olan yarı hücre katottur.\nyargılarından hangileri doğrudur?',
    options: ['Yalnız II', 'II ve III', 'Yalnız III', 'I ve II'],
    correctAnswer: 'I ve II',
    explanation:
      'Yükseltgenme elektron kaybıdır ve galvanik hücrede anot negatiftir. Katot, indirgenme potansiyeli büyük olan yarı hücre olduğu için III yanlıştır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      '60 nükleotitlik bir mRNA’da durdurucu kodon bulunmadığına göre bu mRNA’dan sentezlenen polipeptitte kaç amino asit bulunur?',
    options: ['15', '20', '30', '60'],
    correctAnswer: '20',
    explanation:
      'Her amino asit üç nükleotitlik bir kodonla şifrelenir. Bu nedenle 60/3 = 20 amino asit bulunur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      'AaBb genotipli bir birey ile aabb genotipli bir birey çaprazlanıyor. Aabb genotipli yavru oluşma olasılığı kaçtır? (Genler bağımsızdır.)',
    options: ['1/16', '1/8', '1/4', '1/2'],
    correctAnswer: '1/4',
    explanation:
      'Aa × aa çaprazında Aa olasılığı 1/2, Bb × bb çaprazında bb olasılığı 1/2’dir. Genler bağımsız olduğundan olasılık 1/2 · 1/2 = 1/4 olur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Kanda oksijen taşımakla görevli hücre aşağıdakilerden hangisidir?',
    options: ['Alyuvar', 'Akyuvar', 'Trombosit', 'Kan plazması'],
    correctAnswer: 'Alyuvar',
    explanation:
      'Alyuvarlar yapılarındaki hemoglobin ile oksijeni bağlayıp taşır. Akyuvarlar savunmada, trombositler ise pıhtılaşmada görev alır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      'AaBb × AaBb çaprazlamasında her iki karakter bakımından da baskın fenotipli yavru oranı kaçtır? (Genler bağımsız, tam baskındır.)',
    options: ['1/16', '3/16', '1/4', '9/16'],
    correctAnswer: '9/16',
    explanation:
      'Her karakter için baskın fenotip olasılığı 3/4’tür. Bağımsız olduklarından 3/4 · 3/4 = 9/16 bulunur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      'Bir bitkide stomaların kapanması sırasında bekçi (kilit) hücrelerinde aşağıdakilerden hangisi gerçekleşir?',
    options: [
      'Turgor basıncı artar.',
      'Su girişi hızlanır.',
      'Fotosentez hızı artar.',
      'Turgor basıncı azalır.',
    ],
    correctAnswer: 'Turgor basıncı azalır.',
    explanation:
      'Stoma kapanırken bekçi hücreleri su kaybederek turgor basıncını düşürür ve büzülür. Gevşeyen hücreler arasındaki açıklık kapanır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      'Bir besin zincirinde üreticilerin topladığı enerji 1000 kcal’dir. Enerji aktarımı %10 kabul edilirse üçüncü trofik düzeydeki canlılara aktarılan enerji kaç kcal olur?',
    options: ['1', '10', '100', '1000'],
    correctAnswer: '10',
    explanation:
      'Her basamakta enerjinin %10’u aktarılır: 1000 → 100 → 10 kcal. Üçüncü trofik düzey 10 kcal alır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      '90 nükleotitlik bir mRNA’dan sentezlenen polipeptitte kaç peptit bağı bulunur? (Durdurucu kodon yoktur.)',
    options: ['28', '29', '31', '90'],
    correctAnswer: '29',
    explanation:
      '90 nükleotit 30 kodon ve 30 amino asit verir. n amino asit birbirine n − 1 bağla bağlandığından 30 − 1 = 29 peptit bağı oluşur.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      'Bir bakteri popülasyonunda antibiyotik kullanımı arttıkça dirençli bireylerin oranının artması hangi mekanizmayla açıklanır?',
    options: [
      'Doğal seçilim',
      'Yapay seçilim',
      'Lamarkçı kalıtım',
      'Mutasyonların yönlendirilmesi',
    ],
    correctAnswer: 'Doğal seçilim',
    explanation:
      'Antibiyotik, direnç geni taşıyan bireyleri avantajlı duruma getirir ve bu bireyler daha çok çoğalır. Popülasyonda direnç oranının artması doğal seçilimle açıklanır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      'AaBb × AaBb çaprazlamasında (genler bağımsız, tam baskın)\nI. AAbb genotipli yavru oranı 1/16 olur.\nII. Aabb genotipli yavru oranı 1/8 olur.\nIII. aabb genotipli yavru oranı 1/4 olur.\nyargılarından hangileri doğrudur?',
    options: ['I ve II', 'Yalnız I', 'II ve III', 'I, II ve III'],
    correctAnswer: 'I ve II',
    explanation:
      'AAbb için 1/4 · 1/4 = 1/16, Aabb için 2/4 · 1/4 = 1/8 olasılık vardır. aabb oranı ise 1/4 · 1/4 = 1/16 olduğundan III yanlıştır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-bio-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      'Protein sentezi ile ilgili\nI. Transkripsiyon ökaryot hücrelerde çekirdekte gerçekleşir.\nII. Translasyon ribozomda gerçekleşir.\nIII. Bir mRNA molekülü yalnızca bir kez translasyona uğrayabilir.\nyargılarından hangileri doğrudur?',
    options: ['Yalnız II', 'Yalnız III', 'II ve III', 'I ve II'],
    correctAnswer: 'I ve II',
    explanation:
      'Aynı mRNA birden fazla ribozom tarafından okunabildiği (polizom) için III yanlıştır. Transkripsiyon çekirdekte, translasyon ribozomda gerçekleşir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
];
