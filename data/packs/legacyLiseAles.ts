import type { QuizQuestion } from '@/data/offlineContent';

export const bank: Record<string, QuizQuestion[]> = {
  'Lise::Matematik': [
    {
      id: 'lm1',
      question: 'x² − 5x + 6 = 0 denkleminin kökleri hangileridir?',
      options: ['1 ve 6', '−2 ve −3', '2 ve 3', '0 ve 5'],
      correctAnswer: '2 ve 3',
      explanation:
        'Çarpımları 6, toplamları 5 olan sayılar 2 ve 3’tür; denklem (x − 2)(x − 3) = 0 biçiminde çarpanlara ayrılır.',
    },
    {
      id: 'lm2',
      question: 'f(x) = 2x + 1 ise f(3) kaçtır?',
      options: ['7', '5', '9', '4'],
      correctAnswer: '7',
      explanation: 'f(3) = 2 × 3 + 1 = 7. Katsayı ile sabit terim yer değiştirilirse 5 gibi hatalı sonuç çıkar.',
    },
    {
      id: 'lm3',
      question: 'log₁₀(1000) kaçtır?',
      options: ['2', '3', '10', '100'],
      correctAnswer: '3',
      explanation: '10³ = 1000 olduğu için log₁₀(1000) = 3’tür; 10 ve 100 çeldiricileri taban ile sonucu karıştırır.',
    },
    {
      id: 'lm4',
      question: 'x² + 2x − 15 = 0 denkleminin köklerinden biri aşağıdakilerden hangisidir?',
      options: ['1', '5', '−3', '−5'],
      correctAnswer: '−5',
      explanation:
        'Çarpımları −15, toplamları −2 olan sayılar 3 ve −5’tir; denklem (x + 5)(x − 3) = 0 olur. −3 işaret hatasından doğan çeldiricidir.',
    },
    {
      id: 'lm5',
      question: 'Kökleri 1 ve 4 olan ikinci dereceden denklem aşağıdakilerden hangisidir?',
      options: [
        'x² + 5x + 4 = 0',
        'x² − 4x + 5 = 0',
        'x² − 5x + 4 = 0',
        'x² + 4x − 5 = 0',
      ],
      correctAnswer: 'x² − 5x + 4 = 0',
      explanation:
        'Kökler toplamı 1 + 4 = 5, çarpımı 1 × 4 = 4’tür; denklem x² − (toplam)x + çarpım = 0 olduğundan x² − 5x + 4 = 0 bulunur.',
    },
    {
      id: 'lm6',
      question: 'f(x) = x² − 3x + 2 ise f(−1) kaçtır?',
      options: ['6', '0', '4', '−4'],
      correctAnswer: '6',
      explanation:
        'f(−1) = (−1)² − 3 × (−1) + 2 = 1 + 3 + 2 = 6. Negatif değerin karesi alınmazsa 0 bulunur, bu yaygın işlem hatasıdır.',
    },
    {
      id: 'lm7',
      question: 'log₂(8) + log₃(9) toplamı kaçtır?',
      options: ['4', '5', '6', '17'],
      correctAnswer: '5',
      explanation:
        '2³ = 8 olduğu için log₂(8) = 3, 3² = 9 olduğu için log₃(9) = 2’dir; toplam 3 + 2 = 5 olur. 17, sayıların doğrudan toplanmasıyla çıkan çeldiricidir.',
    },
  ],
  'Lise::Fizik': [
    {
      id: 'lf1',
      question: 'Bir cisme etki eden net kuvvet sıfır ise cismin ivmesi için ne söylenebilir?',
      options: ['Sıfırdır', 'Sürekli artar', 'Kütleyle doğru orantılıdır', 'Her zaman 9,8 m/s² olur'],
      correctAnswer: 'Sıfırdır',
      explanation:
        'Newton’un ikinci yasası Fnet = m × a’dır; Fnet = 0 ise a = 0 olur. 9,8 m/s² yalnızca serbest düşmede geçerlidir.',
    },
    {
      id: 'lf2',
      question: 'Enerjinin SI birimi hangisidir?',
      options: ['Newton', 'Joule', 'Watt', 'Volt'],
      correctAnswer: 'Joule',
      explanation:
        'İş ve enerjinin SI birimi jouledür (J). Newton kuvvetin, watt gücün, volt ise gerilimin birimidir.',
    },
    {
      id: 'lf3',
      question: 'Sürat hangi iki büyüklüğün oranıdır?',
      options: ['Kuvvet / alan', 'Kütle / hacim', 'Yol / zaman', 'Enerji / zaman'],
      correctAnswer: 'Yol / zaman',
      explanation:
        'Ortalama sürat, alınan toplam yolun geçen toplam zamana bölünmesiyle bulunur. Enerji / zaman oranı ise gücü verir.',
    },
    {
      id: 'lf4',
      question: 'Kütlesi 4 kg olan bir cisme 12 N net kuvvet uygulanırsa cismin ivmesi kaç m/s² olur?',
      options: ['0,33', '8', '48', '3'],
      correctAnswer: '3',
      explanation:
        'a = F / m = 12 / 4 = 3 m/s². Kuvvet ile kütle çarpılırsa 48, oran ters kurulursa 0,33 bulunur.',
    },
    {
      id: 'lf5',
      question:
        'Aynı yönde 8 N ve 3 N, ters yönde 5 N kuvvetin etki ettiği cisme etkiyen net kuvvet kaç N’dur?',
      options: ['0', '6', '16', '11'],
      correctAnswer: '6',
      explanation:
        'Aynı yöndeki kuvvetler toplanır, ters yöndeki çıkarılır: 8 + 3 − 5 = 6 N. Ters yönü de toplamak 16 sonucunu verir.',
    },
    {
      id: 'lf6',
      question:
        'Yerden 5 m yükseklikteki 2 kg kütleli bir cismin yerçekimi potansiyel enerjisi kaç jouledür? (g = 10 m/s²)',
      options: ['100', '10', '25', '50'],
      correctAnswer: '100',
      explanation: 'Ep = m × g × h = 2 × 10 × 5 = 100 J. Yükseklik ile g çarpımı unutulursa 10 J gibi eksik değer çıkar.',
    },
    {
      id: 'lf7',
      question: '120 km yolu 2 saatte alan bir aracın ortalama sürati kaç km/sa’tir?',
      options: ['40', '60', '240', '80'],
      correctAnswer: '60',
      explanation: 'Ortalama sürat = yol / zaman = 120 / 2 = 60 km/sa. Bölme yerine çarpma yapılırsa 240 bulunur.',
    },
  ],
  'Lise::Kimya': [
    {
      id: 'lk1',
      question: 'Atom numarası hangi parçacık sayısına eşittir?',
      options: ['Proton sayısı', 'Nötron sayısı', 'Proton + nötron sayısı', 'Elektron + nötron sayısı'],
      correctAnswer: 'Proton sayısı',
      explanation:
        'Atom numarası çekirdekteki proton sayısıdır. Proton ve nötron sayılarının toplamı ise kütle numarasını verir.',
    },
    {
      id: 'lk2',
      question: 'Na hangi elementin sembolüdür?',
      options: ['Azot', 'Sodyum', 'Neon', 'Nikel'],
      correctAnswer: 'Sodyum',
      explanation:
        'Na sodyumun sembolüdür; azot N, neon Ne, nikel ise Ni ile gösterilir. Benzer baş harfler karıştırılmamalıdır.',
    },
    {
      id: 'lk3',
      question: 'pH değeri 7 olan saf su hangi özelliktedir?',
      options: ['Asidik', 'Bazik', 'Nötr', 'Tuzlu'],
      correctAnswer: 'Nötr',
      explanation:
        '25 °C civarında saf suyun pH değeri 7’dir ve nötr kabul edilir. 7’nin altı asidik, üstü bazik ortamdır.',
    },
    {
      id: 'lk4',
      question: 'Kütle numarası 23, atom numarası 11 olan nötr bir atomun nötron sayısı kaçtır?',
      options: ['11', '23', '34', '12'],
      correctAnswer: '12',
      explanation:
        'Nötron sayısı = kütle numarası − atom numarası = 23 − 11 = 12’dir. Atom numarasını nötron sayısı sanmak 11 çeldiricisini üretir.',
    },
    {
      id: 'lk5',
      question: 'Bir atomun çekirdeğinde hangi parçacıklar bulunur?',
      options: ['Proton ve nötron', 'Proton ve elektron', 'Yalnızca proton', 'Yalnızca nötron'],
      correctAnswer: 'Proton ve nötron',
      explanation:
        'Çekirdekte proton ile nötron birlikte yer alır; elektronlar çekirdeğin dışındaki katmanlarda bulunur.',
    },
    {
      id: 'lk6',
      question: 'Aşağıdaki element-sembol eşleştirmelerinden hangisi doğrudur?',
      options: ['Ca – Karbon', 'K – Potasyum', 'Fe – Flor', 'N – Nikel'],
      correctAnswer: 'K – Potasyum',
      explanation:
        'K potasyumun sembolüdür. Ca kalsiyum, Fe demir, N ise azottur; Flor F, Nikel Ni ile gösterilir.',
    },
    {
      id: 'lk7',
      question: 'pH değeri 3 olan bir çözelti için aşağıdakilerden hangisi doğrudur?',
      options: ['Baziktir', 'Nötrdür', 'Asidiktir', 'Tuz çözeltisidir'],
      correctAnswer: 'Asidiktir',
      explanation:
        'pH değeri 7’nin altında olan çözeltiler asidiktir; pH 3 asidik, pH 10 ise bazik ortamı gösterir.',
    },
  ],
  'Lise::Biyoloji': [
    {
      id: 'lb1',
      question: 'Protein sentezinde doğrudan görev alan organel hangisidir?',
      options: ['Ribozom', 'Lizozom', 'Koful', 'Sentrozom'],
      correctAnswer: 'Ribozom',
      explanation:
        'Ribozomlar mRNA’daki bilgiyi okuyup amino asitleri birleştirerek protein sentezler; lizozom sindirim, koful depolama yapar.',
    },
    {
      id: 'lb2',
      question: 'DNA’nın yapı birimi hangisidir?',
      options: ['Amino asit', 'Nükleotit', 'Yağ asidi', 'Glikoz'],
      correctAnswer: 'Nükleotit',
      explanation:
        'DNA, fosfat, şeker ve organik bazdan oluşan nükleotit birimlerinin zincirle bağlanmasıyla oluşur. Amino asit proteinin birimidir.',
    },
    {
      id: 'lb3',
      question: 'Hücresel solunumda ATP üretiminde önemli organel hangisidir?',
      options: ['Golgi aygıtı', 'Lizozom', 'Mitokondri', 'Çekirdekçik'],
      correctAnswer: 'Mitokondri',
      explanation:
        'Ökaryot hücrelerde oksijenli solunumun enerji üreten basamakları mitokondride gerçekleşir; Golgi aygıtı salgı paketlemesi yapar.',
    },
    {
      id: 'lb4',
      question: 'Protein sentezinde kalıtım bilgisini çekirdekten ribozoma taşıyan molekül hangisidir?',
      options: ['DNA', 'ATP', 'tRNA', 'mRNA'],
      correctAnswer: 'mRNA',
      explanation:
        'mRNA, DNA’daki bilgiyi ribozoma taşır; tRNA ise amino asitleri ribozoma getirir. ATP enerji taşıyıcısıdır.',
    },
    {
      id: 'lb5',
      question: 'Amino asitlerin ribozomda birbirine bağlanmasıyla oluşan bağ hangisidir?',
      options: ['Peptit bağı', 'Glikozit bağı', 'Ester bağı', 'Hidrojen bağı'],
      correctAnswer: 'Peptit bağı',
      explanation:
        'Amino asitler arasında kurulan peptit bağları polipeptit zincirini, yani proteinin temel yapısını oluşturur.',
    },
    {
      id: 'lb6',
      question: 'DNA üzerinde belirli bir proteini kodlayan anlamlı nükleotit dizisine ne denir?',
      options: ['Kromozom', 'Gen', 'Kodon', 'Nükleotit'],
      correctAnswer: 'Gen',
      explanation:
        'Gen, DNA üzerinde bir proteini kodlayan nükleotit dizisidir; kodon ise mRNA üzerindeki üçlü nükleotit grubudur.',
    },
    {
      id: 'lb7',
      question: 'Hücresel solunumda açığa çıkan enerjinin hücrede kullanılabilir biçimi hangisidir?',
      options: ['Glikoz', 'Nişasta', 'ATP', 'Protein'],
      correctAnswer: 'ATP',
      explanation:
        'Solunumla açığa çıkan enerji ATP’ye aktarılır ve hücre işlerinde buradan kullanılır. Glikoz ile nişasta enerji deposudur.',
    },
  ],
  'Lise::Edebiyat': [
    {
      id: 'le1',
      question: 'Roman, hikâye ve masal hangi temel grupta değerlendirilir?',
      options: [
        'Anlatmaya bağlı metinler',
        'Öğretici bilimsel metinler',
        'Resmî yazılar',
        'Söylev ve nutuklar',
      ],
      correctAnswer: 'Anlatmaya bağlı metinler',
      explanation:
        'Bu türlerde olay, kişi, zaman ve mekân gibi anlatı unsurları bulunduğu için anlatmaya bağlı metinler grubunda yer alırlar.',
    },
    {
      id: 'le2',
      question: 'Bir metinde olayları aktaran ses veya kişi hangi kavramla ifade edilir?',
      options: ['Kafiye', 'Anlatıcı', 'Ölçü', 'Konu'],
      correctAnswer: 'Anlatıcı',
      explanation:
        'Anlatıcı, olayları okuyucuya aktaran kurmaca sestir. Kafiye ve ölçü şiirin biçim özellikleridir.',
    },
    {
      id: 'le3',
      question: 'Şiirde dize sonlarında aynı görev ve anlamdaki ek ya da sözcük tekrarına ne denir?',
      options: ['Kafiye', 'Dize', 'Redif', 'Tema'],
      correctAnswer: 'Redif',
      explanation:
        'Aynı görev ve anlamdaki ek veya kelime tekrarı rediftir; yalnızca ses benzerliği ise kafiyeyi oluşturur.',
    },
    {
      id: 'le4',
      question: 'Masal türüyle ilgili aşağıdakilerden hangisi doğrudur?',
      options: [
        'Gerçekçi psikolojik çözümlemelere ağırlık verir.',
        'Yalnızca tarihî belgelere dayanır.',
        'Kahramanları her zaman sıradan insanlardır.',
        'Olağanüstü olay ve kişilere yer verir.',
      ],
      correctAnswer: 'Olağanüstü olay ve kişilere yer verir.',
      explanation:
        'Masallarda dev, peri, konuşan hayvan gibi gerçek dışı unsurlar bulunur ve kalıplaşmış başlangıç sözleri kullanılır.',
    },
    {
      id: 'le5',
      question: 'Roman ile hikâye arasındaki temel fark hangisidir?',
      options: [
        'Romanın olay örgüsünün daha geniş olması',
        'Romanın yalnızca manzum yazılması',
        'Hikâyenin kişi ve mekân içermemesi',
        'Romanın her zaman dörtlüklerle kurulması',
      ],
      correctAnswer: 'Romanın olay örgüsünün daha geniş olması',
      explanation:
        'Roman, hikâyeye göre daha uzun, çok katmanlı bir olay örgüsüne ve daha kalabalık bir kişi kadrosuna sahiptir.',
    },
    {
      id: 'le6',
      question: 'Anlatıcı olayları kendisi yaşıyorsa hangi bakış açısı kullanılır?',
      options: [
        'Üçüncü kişi (o) anlatımı',
        'Birinci kişi (ben) anlatımı',
        'İlahi bakış açısı',
        'Gözlemci bakış açısı',
      ],
      correctAnswer: 'Birinci kişi (ben) anlatımı',
      explanation:
        'Olayı yaşayan anlatıcı “ben” diye konuşur; bu, birinci kişi bakış açısıdır. Üçüncü kişi anlatımında anlatıcı olayın dışındadır.',
    },
    {
      id: 'le7',
      question: 'Şiirde dört dizeden oluşan bölüme ne denir?',
      options: ['Bent', 'Dize', 'Dörtlük', 'Ölçü'],
      correctAnswer: 'Dörtlük',
      explanation:
        'Dört dizeden oluşan şiir bölümü dörtlük olarak adlandırılır; dize tek satırı, ölçü ise dizelerdeki düzenli yapıyı ifade eder.',
    },
  ],
  'Lise::Tarih': [
    {
      id: 'lt1',
      question: 'Tarihî olayları zaman sırasına koymaya ne ad verilir?',
      options: ['Kronoloji', 'Coğrafya', 'Arkeometri', 'Etnografya'],
      correctAnswer: 'Kronoloji',
      explanation:
        'Kronoloji, olayların oluş sırasını ve tarihlerini düzenler; arkeometri ise buluntuların yaşını ölçen yöntemdir.',
    },
    {
      id: 'lt2',
      question: 'Bir olayı yaşandığı dönemde üretilmiş belge hangi tür kaynaktır?',
      options: ['İkincil kaynak', 'Birincil kaynak', 'Kurgu metin', 'Sözlük'],
      correctAnswer: 'Birincil kaynak',
      explanation:
        'Döneme ait mektup, kayıt ve fotoğraf gibi belgeler birincil kaynaktır; sonradan yazılan yorumlar ikincil kaynaktır.',
    },
    {
      id: 'lt3',
      question: 'Tarih çalışmasında neden-sonuç ilişkisi kurmanın amacı nedir?',
      options: [
        'Olayları yalnızca tarihleriyle sıralamak',
        'Kaynakların yazıldığı dili belirlemek',
        'Olayların nasıl ve niçin geliştiğini açıklamak',
        'Dönemleri kesin çizgilerle ayırmak',
      ],
      correctAnswer: 'Olayların nasıl ve niçin geliştiğini açıklamak',
      explanation:
        'Neden-sonuç ilişkisi, olayın hangi koşullarda ve niçin ortaya çıktığını, hangi sonuçları doğurduğunu açıklar; salt sıralama yeterli değildir.',
    },
    {
      id: 'lt4',
      question: 'Aşağıdaki olaylardan hangisi diğerlerinden daha önce gerçekleşmiştir?',
      options: [
        'Saltanatın kaldırılması',
        'Tanzimat Fermanı’nın ilanı',
        'I. Dünya Savaşı’nın başlaması',
        'İstanbul’un fethi',
      ],
      correctAnswer: 'İstanbul’un fethi',
      explanation:
        'İstanbul 1453’te fethedilmiştir; Tanzimat 1839, I. Dünya Savaşı 1914, saltanatın kaldırılması ise 1922 tarihlidir.',
    },
    {
      id: 'lt5',
      question: 'Aşağıdaki olaylardan hangisi Cumhuriyet’in ilanından (1923) sonra gerçekleşmiştir?',
      options: [
        'Saltanatın kaldırılması',
        'Halifeliğin kaldırılması',
        'Lozan Barış Antlaşması’nın imzalanması',
        'TBMM’nin açılması',
      ],
      correctAnswer: 'Halifeliğin kaldırılması',
      explanation:
        'Halifelik 1924’te kaldırılmıştır. TBMM 1920’de açılmış, saltanat 1922’de kaldırılmış, Lozan ise 1923’te imzalanmıştır.',
    },
    {
      id: 'lt6',
      question: 'Aşağıdakilerden hangisi birincil kaynak örneğidir?',
      options: [
        'Döneme ait bir mektup',
        'Konuyla ilgili bir ders kitabı',
        'Bir tarihçinin değerlendirme yazısı',
        'Bir ansiklopedi maddesi',
      ],
      correctAnswer: 'Döneme ait bir mektup',
      explanation:
        'Olayın yaşandığı dönemde üretilen mektup, belge veya fotoğraf birincil kaynaktır; sonradan yazılan yorum ve derlemeler ikincildir.',
    },
    {
      id: 'lt7',
      question: 'Bir tarihî olayın sonuçları değerlendirilirken aşağıdakilerden hangisi göz önünde bulundurulmalıdır?',
      options: [
        'Yalnızca olayın tarihinin ezberlenmesi',
        'Tek bir nedenin öne çıkarılması',
        'Kısa ve uzun vadeli etkilerin birlikte düşünülmesi',
        'Olayın günümüzle bağlantısının kurulmaması',
      ],
      correctAnswer: 'Kısa ve uzun vadeli etkilerin birlikte düşünülmesi',
      explanation:
        'Tarihî olaylar çok nedenlidir ve etkileri hemen bitmez; bu yüzden kısa vadeli sonuçlarla uzun vadeli değişim birlikte değerlendirilir.',
    },
  ],
  'Lise::İngilizce': [
    {
      id: 'li1',
      question: 'Choose the grammatically correct sentence.',
      options: [
        'If I have time, I will call you.',
        'If I will have time, I call you.',
        'If I had time, I will call you.',
        'If I have time, I called you.',
      ],
      correctAnswer: 'If I have time, I will call you.',
      explanation:
        'First conditional yapısında if-clause simple present, ana cümle will + fiil alır. If cümlesinde will kullanılmaz.',
    },
    {
      id: 'li2',
      question: '“However” bağlacı çoğunlukla hangi ilişkiyi kurar?',
      options: ['Neden', 'Karşıtlık', 'Amaç', 'Sıralama'],
      correctAnswer: 'Karşıtlık',
      explanation:
        'However, iki fikir arasında karşıtlık veya beklenmedik dönüş belirtir; neden-sonuç ilişkisi için therefore ya da because gerekir.',
    },
    {
      id: 'li3',
      question: 'Which word is closest in meaning to “essential”?',
      options: ['Optional', 'Rare', 'Necessary', 'Temporary'],
      correctAnswer: 'Necessary',
      explanation:
        'Essential ve necessary “gerekli, zorunlu” anlam alanında yakındır; optional ise karşıt anlamlıdır.',
    },
    {
      id: 'li4',
      question: 'If it ___ tomorrow, we will cancel the picnic.',
      options: ['rained', 'will rain', 'would rain', 'rains'],
      correctAnswer: 'rains',
      explanation:
        'First conditional’da if-clause simple present alır: If it rains, we will cancel. “Will rain” bu yapıda yanlıştır.',
    },
    {
      id: 'li5',
      question: 'I would travel more if I ___ more money.',
      options: ['have', 'had', 'will have', 'am having'],
      correctAnswer: 'had',
      explanation:
        'Second conditional gerçek dışı varsayım kurar: if-clause geçmiş biçim (had), ana cümle would + fiil olur.',
    },
    {
      id: 'li6',
      question: '___ it was raining heavily, they continued the match.',
      options: ['Although', 'Because', 'Therefore', 'So'],
      correctAnswer: 'Although',
      explanation:
        'İki yargı arasında karşıtlık olduğu için “Although” gerekir; “Because” ve “Therefore” neden-sonuç ilişkisi kurar.',
    },
    {
      id: 'li7',
      question: '“Significant” sözcüğünün anlamca en yakın karşılığı hangisidir?',
      options: ['Minor', 'Temporary', 'Important', 'Ordinary'],
      correctAnswer: 'Important',
      explanation:
        'Significant “önemli, kayda değer” anlamına gelir; minor ve ordinary bu anlamın karşıtıdır.',
    },
  ],
  'ALES::Sayısal': [
    {
      id: 'as1',
      question: 'Bir sayının %20’si 30 ise sayının tamamı kaçtır?',
      options: ['120', '150', '180', '200'],
      correctAnswer: '150',
      explanation:
        '0,20 × x = 30 ise x = 30 / 0,20 = 150’dir. Yüzdeyi doğrudan çarpmak 120 ya da 200 gibi hatalı sonuç verir.',
    },
    {
      id: 'as2',
      question: '3 kişi bir işi 12 günde bitiriyorsa, aynı hızla çalışan 6 kişi kaç günde bitirir?',
      options: ['3', '12', '6', '24'],
      correctAnswer: '6',
      explanation:
        'Toplam iş 3 × 12 = 36 kişi-gündür; 36 / 6 = 6 gün çıkar. Kişi sayısı iki katına çıkınca süre yarıya iner.',
    },
    {
      id: 'as3',
      question: '2, 6, 18, 54, ... dizisinin sonraki terimi nedir?',
      options: ['162', '108', '216', '72'],
      correctAnswer: '162',
      explanation:
        'Her terim bir öncekinin 3 katıdır: 54 × 3 = 162. Çarpanı 2 almak 108, 4 almak 216 çeldiricisini üretir.',
    },
    {
      id: 'as4',
      question: 'Bir ürünün fiyatı 400 TL’den 500 TL’ye çıkarılırsa fiyat yüzde kaç artmış olur?',
      options: ['20', '80', '125', '25'],
      correctAnswer: '25',
      explanation:
        'Artış 100 TL’dir ve artış eski fiyata bölünür: 100 / 400 = 0,25, yani %25. Yeni fiyata bölmek %20 çeldiricisini verir.',
    },
    {
      id: 'as5',
      question: 'Bir sayının %40’ı 72 ise bu sayı kaçtır?',
      options: ['28,8', '120', '180', '288'],
      correctAnswer: '180',
      explanation:
        '0,40 × x = 72 ise x = 72 / 0,40 = 180’dir. Sayının %40’ını almakla 0,40’a bölmek karıştırılırsa 28,8 bulunur.',
    },
    {
      id: 'as6',
      question: 'Bir işi A ustası 12 günde, B ustası 24 günde bitiriyor. İkisi birlikte çalışırsa iş kaç günde biter?',
      options: ['8', '6', '18', '36'],
      correctAnswer: '8',
      explanation:
        '1/12 + 1/24 = 3/24 = 1/8 olduğundan iş 8 günde biter. Sürelerin ortalaması alınırsa 18 çeldiricisi çıkar.',
    },
    {
      id: 'as7',
      question: '3, 7, 15, 31, ... biçiminde ilerleyen örüntüde sonraki terim kaçtır?',
      options: ['47', '63', '62', '64'],
      correctAnswer: '63',
      explanation:
        'Her terim bir öncekinin 2 katının 1 fazlasıdır: 31 × 2 + 1 = 63. Ardışık farklar 4, 8, 16, 32 olduğundan 31 + 32 = 63 de aynı sonucu verir.',
    },
  ],
  'ALES::Sözel': [
    {
      id: 'av1',
      question: 'Bir paragraf sorusunda ana düşünceyi bulurken en önemli ölçüt hangisidir?',
      options: [
        'Metnin bütününü kapsaması',
        'Yalnızca ilk cümleyi yinelemesi',
        'Metindeki bir örneği aktarması',
        'Konuyla ilgili dış bilgi eklemesi',
      ],
      correctAnswer: 'Metnin bütününü kapsaması',
      explanation:
        'Ana düşünce paragrafın tamamındaki temel yargıyı kapsar; tek bir cümleye veya örneğe dayanan seçenek yardımcı düşüncede kalır.',
    },
    {
      id: 'av2',
      question: '“Buna karşın” sözü cümleler arasında çoğunlukla hangi ilişkiyi kurar?',
      options: ['Örnekleme', 'Karşıtlık', 'Neden', 'Koşul'],
      correctAnswer: 'Karşıtlık',
      explanation:
        '“Buna karşın” önceki yargıyla zıtlık kurar; neden ilişkisi için “bu yüzden”, koşul için “eğer” gerekir.',
    },
    {
      id: 'av3',
      question: 'Bir çıkarım sorusunda doğru seçenek neye dayanmalıdır?',
      options: ['Kişisel görüşe', 'Genel kültüre', 'Metindeki kanıtlara', 'Tahmine'],
      correctAnswer: 'Metindeki kanıtlara',
      explanation:
        'Çıkarım metinde açıkça yazmasa da metindeki bilgilerle desteklenmelidir; dış bilgi veya tahmin geçerli dayanak değildir.',
    },
    {
      id: 'av4',
      question:
        'Kütüphaneler yalnızca kitap ödünç alınan yerler değildir. Pek çok kütüphane artık atölye, söyleşi ve sessiz çalışma alanlarıyla mahallenin ortak yaşam merkezi hâline gelmiştir. Bu dönüşüm, kütüphanelerin toplumsal bağları güçlendiren bir işlev kazandığını gösterir. Bu paragrafın ana düşüncesi hangisidir?',
      options: [
        'Kütüphanelerde kitap ödünç alma hizmeti giderek azalmaktadır.',
        'Atölye ve söyleşiler kütüphanelerin kuruluş amacıdır.',
        'Mahallelerde sessiz çalışma alanına duyulan ihtiyaç artmıştır.',
        'Kütüphaneler yeni işlevlerle toplumsal bağları güçlendiren merkezlere dönüşmüştür.',
      ],
      correctAnswer: 'Kütüphaneler yeni işlevlerle toplumsal bağları güçlendiren merkezlere dönüşmüştür.',
      explanation:
        'Paragraf, kütüphanelerin kitap dışı etkinliklerle mahallenin ortak yaşam merkezi hâline geldiğini ve bu yolla toplumsal bağları güçlendirdiğini savunur.',
    },
    {
      id: 'av5',
      question:
        'Bir metni hızlı okumak, her sözcüğü tek tek seslendirmek yerine gözün satır üzerinde daha geniş sıçramalarla ilerlemesini gerektirir. Ancak hız tek başına yeterli değildir; okunanın anlaşılıp anlaşılmadığı da düzenli olarak denetlenmelidir. Hız ile anlama arasında kurulan bu denge, okuma verimini belirleyen asıl etkendir. Bu paragrafın ana düşüncesi hangisidir?',
      options: [
        'Okuma verimi, hız ile anlama arasında kurulan dengeye bağlıdır.',
        'Hızlı okuma her sözcüğün seslendirilmesini zorunlu kılar.',
        'Anlama becerisi yalnızca okuma hızıyla ölçülür.',
        'Göz sıçramaları okuma hızını hiç etkilemez.',
      ],
      correctAnswer: 'Okuma verimi, hız ile anlama arasında kurulan dengeye bağlıdır.',
      explanation:
        'Paragraf, hızın tek başına yeterli olmadığını, anlama denetimiyle birlikte ele alındığında okuma verimini artırdığını vurgular.',
    },
    {
      id: 'av6',
      question:
        '“Raporun verileri eksiksizdi; ___ sonuç bölümü oldukça zayıftı.” cümlesinde boşluğa anlam ilişkisine en uygun bağlaç hangisidir?',
      options: ['bu nedenle', 'ancak', 'ayrıca', 'çünkü'],
      correctAnswer: 'ancak',
      explanation:
        'İlk yargı olumlu, ikinci yargı olumsuz olduğu için arada karşıtlık vardır; bu ilişkiyi “ancak” kurar.',
    },
    {
      id: 'av7',
      question:
        'Sabah 06.00 otobüsüyle yola çıkan Elif, aktarma yapmadan 09.30’da şehre vardı. Dönüş bileti için gişeye gittiğinde 10.00 seferinin dolu olduğunu, bir sonraki seferin 13.00’te kalkacağını öğrendi. Bu bilgilerden kesin olarak çıkarılabilecek yargı hangisidir?',
      options: [
        'Elif şehre planladığından erken varmıştır.',
        'Elif dönüşte başka bir araç kullanacaktır.',
        'Elif’in şehirde kalacağı süre uzayacaktır.',
        'Elif gidişte aktarma yapmak zorunda kalmıştır.',
      ],
      correctAnswer: 'Elif’in şehirde kalacağı süre uzayacaktır.',
      explanation:
        '10.00 seferi dolu olduğu için Elif en erken 13.00’te dönebilir; bu bekleme, şehirde geçireceği süreyi ister istemez uzatır.',
    },
  ],
};

export const topicQuestionIds: Record<string, Record<string, string[]>> = {
  'Lise::Matematik': {
    'İkinci Dereceden Denklemler': ['lm1', 'lm4', 'lm5'],
    Fonksiyonlar: ['lm2', 'lm6'],
    Logaritma: ['lm3', 'lm7'],
  },
  'Lise::Fizik': {
    'Kuvvet ve Newton Yasaları': ['lf1', 'lf4', 'lf5'],
    'İş ve Enerji': ['lf2', 'lf6'],
    'Hareket ve Sürat': ['lf3', 'lf7'],
  },
  'Lise::Kimya': {
    'Atom Yapısı': ['lk1', 'lk4', 'lk5'],
    'Elementler ve Periyodik Tablo': ['lk2', 'lk6'],
    'Asit, Baz ve pH': ['lk3', 'lk7'],
  },
  'Lise::Biyoloji': {
    'Protein Sentezi': ['lb1', 'lb4', 'lb5'],
    'DNA ve Kalıtım': ['lb2', 'lb6'],
    'Hücresel Solunum': ['lb3', 'lb7'],
  },
  'Lise::Edebiyat': {
    'Anlatmaya Bağlı Metinler': ['le1', 'le4', 'le5'],
    'Anlatıcı ve Bakış Açısı': ['le2', 'le6'],
    'Şiir Bilgisi': ['le3', 'le7'],
  },
  'Lise::Tarih': {
    Kronoloji: ['lt1', 'lt4', 'lt5'],
    'Tarihî Kaynaklar': ['lt2', 'lt6'],
    'Neden ve Sonuç': ['lt3', 'lt7'],
  },
  'Lise::İngilizce': {
    Conditionals: ['li1', 'li4', 'li5'],
    Bağlaçlar: ['li2', 'li6'],
    'Academic Vocabulary': ['li3', 'li7'],
  },
  'ALES::Sayısal': {
    'Yüzde Problemleri': ['as1', 'as4', 'as5'],
    'İşçi ve Hız Problemleri': ['as2', 'as6'],
    'Diziler ve Örüntüler': ['as3', 'as7'],
  },
  'ALES::Sözel': {
    'Ana Düşünce': ['av1', 'av4', 'av5'],
    'Bağlaç ve İlişki': ['av2', 'av6'],
    Çıkarım: ['av3', 'av7'],
  },
};
