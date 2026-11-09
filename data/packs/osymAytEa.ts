import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { TopicDefinition } from '@/data/topicCatalog';

export const LEVEL_NAME = 'ÖSYM';
export const COURSE_NAME = 'AYT Eşit Ağırlık';

export const topics: TopicDefinition[] = [
  {
    name: 'Matematik',
    icon: '📈',
    summary:
      'Fonksiyon, polinom, denklem-eşitsizlik, olasılık, istatistik ve sayma bilgisini tek adımlı işlemlerden çok adımlı yorumlara taşı.',
    goals: [
      'Bileşke fonksiyonda önce iç değeri hesapla.',
      'Polinomda katsayılar toplamını P(1) ile bul.',
      'Eşitsizliğin işaret tablosunu köklerle kur.',
      'Ortalama ile medyanı ayırt et.',
    ],
    practicePrompt:
      '5, 7, 8, 10, 15 verisinin ortalamasını ve medyanını hesaplayıp farkını yorumla.',
    questionIds: [
      'osym-ayt-ea-mat-1',
      'osym-ayt-ea-mat-2',
      'osym-ayt-ea-mat-3',
      'osym-ayt-ea-mat-4',
      'osym-ayt-ea-mat-5',
      'osym-ayt-ea-mat-6',
      'osym-ayt-ea-mat-7',
      'osym-ayt-ea-mat-8',
      'osym-ayt-ea-mat-9',
      'osym-ayt-ea-mat-10',
    ],
  },
  {
    name: 'Edebiyat',
    icon: '📚',
    summary:
      'İslamiyet öncesi sözlü ürünlerden Cumhuriyet şiirine uzanan dönemleri, nazım biçimlerini ve sanatçı-eser eşleştirmelerini kur.',
    goals: [
      'Dönemlerin dil ve tema anlayışını ayırt et.',
      'Nazım biçimini beyit-dörtlük düzeninden tanı.',
      'Sanatçıyı eseri ve dönemiyle birlikte eşleştir.',
      'Ölçü, kafiye ve redif basamaklarını çöz.',
    ],
    practicePrompt:
      'Bir gazel ile bir koşmayı ölçü, birim ve tema bakımından üç maddede karşılaştır.',
    questionIds: [
      'osym-ayt-ea-edb-1',
      'osym-ayt-ea-edb-2',
      'osym-ayt-ea-edb-3',
      'osym-ayt-ea-edb-4',
      'osym-ayt-ea-edb-5',
      'osym-ayt-ea-edb-6',
      'osym-ayt-ea-edb-7',
      'osym-ayt-ea-edb-8',
      'osym-ayt-ea-edb-9',
      'osym-ayt-ea-edb-10',
    ],
  },
  {
    name: 'Tarih',
    icon: '🏛️',
    summary:
      'Osmanlı siyasi ve sosyal düzeninden Kurtuluş Savaşı’na, inkılaplardan yirminci yüzyıl dünya tarihine kadar neden-sonuç zincirini kur.',
    goals: [
      'Antlaşmaları sonuçlarıyla birlikte sınıflandır.',
      'Kurtuluş Savaşı belgelerini kronolojik sıraya diz.',
      'İnkılapları ilgili Atatürk ilkesiyle eşleştir.',
      'Yirminci yüzyıl düzenini kurumlar üzerinden oku.',
    ],
    practicePrompt:
      'Amasya Genelgesi, Erzurum Kongresi ve Sivas Kongresi’nin yetki ve amaç farkını yaz.',
    questionIds: [
      'osym-ayt-ea-tar-1',
      'osym-ayt-ea-tar-2',
      'osym-ayt-ea-tar-3',
      'osym-ayt-ea-tar-4',
      'osym-ayt-ea-tar-5',
      'osym-ayt-ea-tar-6',
      'osym-ayt-ea-tar-7',
      'osym-ayt-ea-tar-8',
      'osym-ayt-ea-tar-9',
      'osym-ayt-ea-tar-10',
    ],
  },
  {
    name: 'Coğrafya',
    icon: '🌍',
    summary:
      'Türkiye’nin fiziki yapısı ile beşeri ve ekonomik coğrafyasını ilişkilendir; dünya bölgelerini, doğal afetleri ve çevre sorunlarını yorumla.',
    goals: [
      'İklim tipini yağış rejiminden tanı.',
      'Yer şekillerinin ekonomik faaliyete etkisini kur.',
      'Göçte itici ve çekici nedenleri ayır.',
      'Afet ve çevre sorunlarında nedeni sonuçtan ayır.',
    ],
    practicePrompt:
      'Karadeniz kıyısı ile Tuz Gölü çevresini yağış rejimi ve tarım ürünü bakımından karşılaştır.',
    questionIds: [
      'osym-ayt-ea-cog-1',
      'osym-ayt-ea-cog-2',
      'osym-ayt-ea-cog-3',
      'osym-ayt-ea-cog-4',
      'osym-ayt-ea-cog-5',
      'osym-ayt-ea-cog-6',
      'osym-ayt-ea-cog-7',
      'osym-ayt-ea-cog-8',
      'osym-ayt-ea-cog-9',
      'osym-ayt-ea-cog-10',
    ],
  },
];

export const questions: EmbeddedQuestionSeed[] = [
  {
    id: 'osym-ayt-ea-mat-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'f(x) = 2x + 3 olmak üzere f(f(1)) değeri kaçtır?',
    options: ['10', '12', '13', '16'],
    correctAnswer: '13',
    explanation:
      'İç fonksiyon önce hesaplanır: f(1) = 2·1 + 3 = 5. Ardından f(5) = 2·5 + 3 = 13 bulunur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-mat-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'P(x) = x³ − 2x² + 4 polinomu için P(2) değeri kaçtır?',
    options: ['0', '4', '6', '8'],
    correctAnswer: '4',
    explanation:
      'P(2) = 2³ − 2·2² + 4 = 8 − 8 + 4 = 4 olur; iki terim birbirini götürür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-mat-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'P(x) = (2x − 1)(x + 3)² polinomunun katsayılar toplamı kaçtır?',
    options: ['8', '10', '14', '16'],
    correctAnswer: '16',
    explanation:
      'Katsayılar toplamı P(1)’e eşittir: P(1) = (2 − 1)(1 + 3)² = 1·16 = 16.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-mat-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'x² − 5x + 6 < 0 eşitsizliğinin çözüm kümesi aşağıdakilerden hangisidir?',
    options: [
      '2 < x < 3',
      'x < 2 veya x > 3',
      '−3 < x < −2',
      'x < 2',
    ],
    correctAnswer: '2 < x < 3',
    explanation:
      'İfade (x − 2)(x − 3) biçiminde çarpanlara ayrılır. Başkatsayı pozitif olduğundan ifade köklerin arasında negatiftir: 2 < x < 3.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-mat-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Bir torbada 3 kırmızı, 5 mavi bilye vardır. Rastgele iki bilye çekildiğinde ikisinin de kırmızı olma olasılığı kaçtır?',
    options: ['1/8', '1/4', '3/28', '3/14'],
    correctAnswer: '3/28',
    explanation:
      'İki bilye C(8, 2) = 28 farklı biçimde seçilir. İkisinin de kırmızı olduğu durum sayısı C(3, 2) = 3 olduğundan olasılık 3/28’dir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-mat-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'İçinde 4 beyaz, 6 siyah bilye bulunan torbadan geri konulmaksızın iki bilye çekiliyor. Bilyelerden birinin beyaz, diğerinin siyah olma olasılığı kaçtır?',
    options: ['4/15', '8/15', '1/2', '3/5'],
    correctAnswer: '8/15',
    explanation:
      'Sıra iki türlü olabilir: (4/10)·(6/9) + (6/10)·(4/9) = 24/90 + 24/90 = 48/90 = 8/15.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-mat-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      '5, 7, 8, 10, 15 veri grubunun aritmetik ortalaması ile medyanı arasındaki fark kaçtır?',
    options: ['1', '2', '3', '4'],
    correctAnswer: '1',
    explanation:
      'Ortalama (5 + 7 + 8 + 10 + 15) ÷ 5 = 45 ÷ 5 = 9, sıralı veride medyan 8’dir. Fark 9 − 8 = 1 olur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-mat-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Yedi kişilik bir grubun yaş ortalaması 20’dir. Gruba yaşı 28 olan bir kişi katılırsa grubun yeni yaş ortalaması kaç olur?',
    options: ['19,5', '20', '20,5', '21'],
    correctAnswer: '21',
    explanation:
      'Mevcut yaş toplamı 7·20 = 140’tır. Yeni toplam 140 + 28 = 168, kişi sayısı 8 olduğundan ortalama 168 ÷ 8 = 21 olur.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-mat-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Beş farklı kitap, üç farklı rafa her rafa en az bir kitap gelecek biçimde kaç farklı şekilde yerleştirilebilir?',
    options: ['90', '120', '150', '180'],
    correctAnswer: '150',
    explanation:
      'Tüm dağıtımlar 3⁵ = 243’tür. Bir rafın boş kaldığı 3·2⁵ = 96 durum çıkarılır, iki rafın boş kaldığı 3 durum geri eklenir: 243 − 96 + 3 = 150.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-mat-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'A, B, C, D, E harfleriyle, A ile B yan yana olacak biçimde kaç farklı beş harfli diziliş yazılabilir?',
    options: ['24', '48', '60', '120'],
    correctAnswer: '48',
    explanation:
      'A ile B tek blok sayılırsa blok ve üç harf 4! = 24 biçimde dizilir. Blok içinde AB veya BA olabileceğinden 24·2 = 48 bulunur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'İslamiyet öncesi Türk edebiyatında ölen bir kişinin ardından söylenen ağıt niteliğindeki şiirlere ne ad verilir?',
    options: ['Sagu', 'Koşuk', 'Sav', 'Destan'],
    correctAnswer: 'Sagu',
    explanation:
      'Sagu, ölüm üzerine duyulan acıyı anlatan ağıt türüdür. Koşuk lirik ve doğa şiiri, sav ise atasözü niteliğindeki sözdür.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Türk dilinin bilinen ilk yazılı belgeleri sayılan ve Göktürkler dönemine ait olan eser hangisidir?',
    options: [
      'Kutadgu Bilig',
      'Divanü Lügati’t-Türk',
      'Atabetü’l-Hakayık',
      'Orhun Yazıtları',
    ],
    correctAnswer: 'Orhun Yazıtları',
    explanation:
      'Orhun Yazıtları sekizinci yüzyılda Göktürkler tarafından dikilmiştir. Diğer üç eser Karahanlılar döneminde, İslamiyet sonrasında yazılmıştır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Dört dizeden oluşan, kendine özgü aruz kalıplarıyla yazılan ve daha çok felsefi düşüncelerin işlendiği divan nazım biçimi hangisidir?',
    options: ['Gazel', 'Rubai', 'Kaside', 'Mesnevi'],
    correctAnswer: 'Rubai',
    explanation:
      'Rubai dört dizeden oluşur ve ahreb-ahrem adı verilen özel kalıplarla yazılır. Gazel, kaside ve mesnevi beyitlerle kurulur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Genellikle 33 ile 99 beyit arasında yazılan, bir kişiyi övmek amacı taşıyan ve nesib, girizgâh, methiye, fahriye bölümlerinden oluşan nazım biçimi hangisidir?',
    options: ['Mesnevi', 'Gazel', 'Kaside', 'Murabba'],
    correctAnswer: 'Kaside',
    explanation:
      'Kaside beyitlerle yazılan övgü şiiridir ve belirtilen dört bölümden kurulur. Gazel aşk ve güzellik, mesnevi ise uzun öykü anlatımı için kullanılır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Tanzimat Dönemi’nde yazılan ilk yerli tiyatro eseri ile yazarı hangisinde verilmiştir?',
    options: [
      'Şair Evlenmesi — İbrahim Şinasi',
      'Vatan Yahut Silistre — Namık Kemal',
      'İntibah — Namık Kemal',
      'Eylül — Mehmet Rauf',
    ],
    correctAnswer: 'Şair Evlenmesi — İbrahim Şinasi',
    explanation:
      'Şair Evlenmesi 1860’ta yayımlanan ilk yerli tiyatro eseridir ve İbrahim Şinasi’ye aittir. Diğer seçeneklerdeki eserler roman veya daha sonraki dönem ürünüdür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: '“Mai ve Siyah” ile “Aşk-ı Memnu” romanlarının yazarı kimdir?',
    options: ['Mehmet Rauf', 'Tevfik Fikret', 'Cenab Şahabettin', 'Halit Ziya Uşaklıgil'],
    correctAnswer: 'Halit Ziya Uşaklıgil',
    explanation:
      'Her iki roman da Servet-i Fünun Dönemi’nde Halit Ziya Uşaklıgil tarafından yazılmıştır. Tevfik Fikret ve Cenab Şahabettin dönemin şairleridir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Türk edebiyatında ilk psikolojik roman kabul edilen “Eylül”ün yazarı kimdir?',
    options: ['Halit Ziya Uşaklıgil', 'Recaizade Mahmut Ekrem', 'Mehmet Rauf', 'Namık Kemal'],
    correctAnswer: 'Mehmet Rauf',
    explanation:
      'Eylül romanı Mehmet Rauf’a aittir ve kişilerin iç dünyasını öne çıkardığı için ilk psikolojik roman sayılır. Recaizade Mahmut Ekrem’in Araba Sevdası ilk realist roman denemesidir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Milli Edebiyat Dönemi’nin görüşlerini yayımlayan “Genç Kalemler” dergisinde öne çıkan sanatçılar hangisinde birlikte verilmiştir?',
    options: [
      'Ömer Seyfettin, Ali Canip Yöntem, Ziya Gökalp',
      'Tevfik Fikret, Cenab Şahabettin, Halit Ziya Uşaklıgil',
      'Namık Kemal, Ziya Paşa, İbrahim Şinasi',
      'Yahya Kemal, Ahmet Haşim, Yakup Kadri Karaosmanoğlu',
    ],
    correctAnswer: 'Ömer Seyfettin, Ali Canip Yöntem, Ziya Gökalp',
    explanation:
      'Genç Kalemler dergisi sade dil ve milli konular görüşünü Ömer Seyfettin, Ali Canip Yöntem ve Ziya Gökalp çevresinde savunmuştur. İkinci seçenek Servet-i Fünun, üçüncü seçenek Tanzimat sanatçılarıdır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Aşağıdaki sanatçı-dönem eşleştirmelerinden hangisi yanlıştır?',
    options: [
      'Tevfik Fikret — Servet-i Fünun',
      'Yunus Emre — Divan edebiyatı',
      'Ömer Seyfettin — Milli Edebiyat',
      'Namık Kemal — Tanzimat',
    ],
    correctAnswer: 'Yunus Emre — Divan edebiyatı',
    explanation:
      'Yunus Emre tasavvufi halk edebiyatının en büyük şairidir; divan edebiyatına bağlı değildir. Diğer üç eşleştirme dönem özellikleriyle tutarlıdır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-edb-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Halk edebiyatında koşma ile semai arasındaki temel fark hangisinde doğru verilmiştir?',
    options: [
      'Koşma 8’li, semai 11’li hecedir.',
      'İkisi de aruz ölçüsüyle yazılır.',
      'Semai yalnızca ağıt konusunu işler.',
      'Koşma 11’li, semai 8’li hecedir.',
    ],
    correctAnswer: 'Koşma 11’li, semai 8’li hecedir.',
    explanation:
      'Koşma genellikle 11’li, semai ise 8’li hece ölçüsüyle söylenir. İkisi de hece ölçüsüne dayanır ve dörtlüklerle kurulur.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-tar-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'İstanbul 1453’te fethedilerek Osmanlı Devleti’nin başkenti yapılmıştır. Bu fetih hangi padişah döneminde gerçekleşmiştir?',
    options: ['II. Mehmet', 'II. Murat', 'Yıldırım Bayezid', 'Kanuni Sultan Süleyman'],
    correctAnswer: 'II. Mehmet',
    explanation:
      'İstanbul’u 1453’te fetheden II. Mehmet’tir ve bu nedenle Fatih unvanını almıştır. II. Murat fetihten önce, Kanuni ise çok sonra tahtta bulunmuştur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-tar-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Kurtuluş Savaşı’nın gerekçesini, amacını ve yöntemini ilk kez ortaya koyan belge hangisidir?',
    options: [
      'Erzurum Kongresi kararları',
      'Sivas Kongresi kararları',
      'Amasya Genelgesi',
      'Misak-ı Millî',
    ],
    correctAnswer: 'Amasya Genelgesi',
    explanation:
      'Amasya Genelgesi 22 Haziran 1919’da yayımlanmış ve savaşın nedenini, hedefini ve izlenecek yolu ilk kez açıklamıştır. Kongre kararları ve Misak-ı Millî daha sonraki aşamalardır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-tar-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: '1839’da ilan edilen Tanzimat Fermanı’nın hazırlanmasında etkili olan devlet adamı kimdir?',
    options: ['Âli Paşa', 'Mustafa Reşit Paşa', 'Fuat Paşa', 'Mithat Paşa'],
    correctAnswer: 'Mustafa Reşit Paşa',
    explanation:
      'Tanzimat Fermanı’nı hazırlayan ve Gülhane’de okuyan devlet adamı Mustafa Reşit Paşa’dır. Mithat Paşa ise 1876’da Kanun-i Esasi’nin hazırlanmasında öne çıkmıştır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-tar-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Kırım’ın bağımsız olduğunun kabul edildiği ve Rusya’ya Karadeniz’de ticaret gemisi bulundurma hakkı tanındığı antlaşma hangisidir?',
    options: ['Karlofça', 'Pasarofça', 'Belgrad', 'Küçük Kaynarca'],
    correctAnswer: 'Küçük Kaynarca',
    explanation:
      '1774 Küçük Kaynarca Antlaşması ile Kırım’a bağımsızlık verilmiş ve Rusya’ya Karadeniz’de ticaret hakkı tanınmıştır. Karlofça ve Pasarofça Avusturya ile yapılan antlaşmalardır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-tar-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Kurtuluş Savaşı’nda Batı Cephesi’nde kazanılan, “son savunma savaşı” olarak anılan ve Türk ordusunun taarruza geçişini hazırlayan savaş hangisidir?',
    options: ['I. İnönü', 'II. İnönü', 'Sakarya', 'Büyük Taarruz'],
    correctAnswer: 'Sakarya',
    explanation:
      'Sakarya Savaşı 23 Ağustos-13 Eylül 1921’de kazanılmış ve savunmadan taarruza geçişin zeminini hazırlamıştır. Büyük Taarruz ise 1922’de yapılan taarruz harekâtıdır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-tar-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki inkılaplardan hangisi 3 Mart 1924’te gerçekleştirilen düzenlemeler arasında yer alır?',
    options: [
      'Halifeliğin kaldırılması',
      'Saltanatın kaldırılması',
      'Medeni Kanun’un kabulü',
      'Harf İnkılabı',
    ],
    correctAnswer: 'Halifeliğin kaldırılması',
    explanation:
      '3 Mart 1924’te halifelik kaldırılmış, Tevhid-i Tedrisat Kanunu çıkarılmış ve Şer’iye ve Evkaf Vekâleti kapatılmıştır. Saltanat 1922’de, Medeni Kanun 1926’da, Harf İnkılabı 1928’de gerçekleşmiştir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-tar-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: 'Türk kadınlarına milletvekili seçme ve seçilme hakkı hangi yıl verilmiştir?',
    options: ['1926', '1934', '1930', '1936'],
    correctAnswer: '1934',
    explanation:
      'Kadınlara milletvekili seçme ve seçilme hakkı 1934’te tanınmıştır. 1930’da belediye seçimlerine, 1933’te muhtarlık seçimlerine katılma hakkı verilmişti.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-tar-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Aşağıdaki olayları kronolojik olarak sıralayınız.\nI. İstanbul’un fethi\nII. Ankara Savaşı\nIII. Karlofça Antlaşması\nIV. Tanzimat Fermanı',
    options: [
      'I – II – III – IV',
      'II – I – IV – III',
      'II – III – I – IV',
      'II – I – III – IV',
    ],
    correctAnswer: 'II – I – III – IV',
    explanation:
      'Ankara Savaşı 1402, İstanbul’un fethi 1453, Karlofça Antlaşması 1699, Tanzimat Fermanı 1839 tarihlidir. Buna göre sıra II – I – III – IV olur.',
    difficulty: 'hard',
    questionKind: 'sequence',
  },
  {
    id: 'osym-ayt-ea-tar-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Atatürk ilkelerinden hangisi, özel sektörün gerçekleştiremediği büyük yatırımların devlet eliyle yapılmasını öngörür?',
    options: ['Halkçılık', 'Devletçilik', 'Milliyetçilik', 'İnkılapçılık'],
    correctAnswer: 'Devletçilik',
    explanation:
      'Devletçilik ilkesi, ekonomik kalkınmada devletin öncü ve yatırımcı rol üstlenmesini öngörür. Halkçılık toplumsal eşitliği, inkılapçılık ise yenileşmenin sürekliliğini anlatır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-tar-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'II. Dünya Savaşı sonrasında 1947’de ABD’nin Batı Avrupa ülkelerinin ekonomik kalkınmasına yardım amacıyla uyguladığı program hangisidir?',
    options: ['Truman Doktrini', 'Schuman Planı', 'Marshall Planı', 'Molotov Planı'],
    correctAnswer: 'Marshall Planı',
    explanation:
      'Marshall Planı 1947’de Batı Avrupa’ya ekonomik yardım sağlamak üzere yürürlüğe girmiştir. Truman Doktrini askeri yardımı, Molotov Planı ise Doğu Bloku’nun karşı örgütlenmesini ifade eder.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Türkiye’de yazları sıcak ve kurak, kışları ılık ve yağışlı geçen iklim tipi hangisidir?',
    options: ['Akdeniz iklimi', 'Karadeniz iklimi', 'Karasal iklim', 'Muson iklimi'],
    correctAnswer: 'Akdeniz iklimi',
    explanation:
      'Akdeniz ikliminde yazlar sıcak ve kurak, kışlar ılık ve yağışlıdır. Karadeniz ikliminde yağış her mevsime yayılır, karasal iklimde ise kışlar soğuk geçer.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Tamamı Türkiye sınırları içinde kalan en uzun akarsu hangisidir?',
    options: ['Fırat', 'Sakarya', 'Yeşilırmak', 'Kızılırmak'],
    correctAnswer: 'Kızılırmak',
    explanation:
      'Kızılırmak kaynağından denize döküldüğü yere kadar Türkiye sınırları içinde kalan en uzun akarsudur. Fırat ülke dışına taşan bir akarsudur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Türkiye’nin yüzey alanı en büyük gölü hangisidir?',
    options: ['Beyşehir Gölü', 'Tuz Gölü', 'Van Gölü', 'Eğirdir Gölü'],
    correctAnswer: 'Van Gölü',
    explanation:
      'Van Gölü yaklaşık 3.700 kilometrekarelik alanıyla Türkiye’nin en büyük gölüdür. Tuz Gölü ikinci sırada yer alır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Doğu Karadeniz kıyılarında yağışın her mevsime yayılmasının temel nedeni nedir?',
    options: [
      'Nemli hava kütlelerinin kıyıya paralel dağlarda yükselmesi',
      'Yaz aylarında sıcaklığın çok yükselmesi',
      'Kış aylarında kar yağışının etkili olması',
      'Buharlaşmanın yıl boyunca çok az olması',
    ],
    correctAnswer: 'Nemli hava kütlelerinin kıyıya paralel dağlarda yükselmesi',
    explanation:
      'Karadeniz üzerinden gelen nemli hava, kıyıya paralel dağlara çarparak yükselir ve orografik yağış oluşturur. Bu nedenle yağış yıl boyunca görülür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt:
      'Çukurova’da pamuk, Doğu Karadeniz’de fındık, Ege kıyılarında zeytin yetiştirilmesi öncelikle hangi faktörle açıklanır?',
    options: ['Toprak türü', 'Sulama imkânları', 'Ulaşım olanakları', 'İklim koşulları'],
    correctAnswer: 'İklim koşulları',
    explanation:
      'Her ürünün istediği sıcaklık ve nem isteği farklıdır; bu nedenle dağılımında iklim belirleyicidir. Sulama ve toprak ikincil etkenlerdir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Türkiye’de nüfusun kıyı kesimlerinde daha yoğun olmasının başlıca nedeni nedir?',
    options: [
      'Yüzey şekillerinin engebeli olması',
      'İklimin daha ılıman ve ekonomik faaliyetlerin çeşitli olması',
      'Karasal iklimin etkili olması',
      'Tarım alanlarının sınırlı olması',
    ],
    correctAnswer: 'İklimin daha ılıman ve ekonomik faaliyetlerin çeşitli olması',
    explanation:
      'Kıyılarda iklim ılımandır; ticaret, sanayi ve turizm gibi faaliyetler çeşitlendiği için nüfus yoğunlaşır. Engebeli yüzey ve karasal iklim ise nüfusu seyrekleştirir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Aşağıdakilerden hangisi Türkiye’de iç göçün itici nedenleri arasında yer alır?',
    options: [
      'Kırsal alanda iş imkânlarının sınırlı olması',
      'Şehirlerde eğitim ve sağlık hizmetlerinin gelişmiş olması',
      'Şehirlerde sanayi tesislerinin bulunması',
      'Kıyı kentlerinde turizmin gelişmesi',
    ],
    correctAnswer: 'Kırsal alanda iş imkânlarının sınırlı olması',
    explanation:
      'İtici nedenler insanı bulunduğu yerden uzaklaştırır; kırsalda iş imkânının sınırlı olması böyle bir nedendir. Diğer seçenekler kentlerin çekici özellikleridir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Türkiye’de deprem riskinin yüksek olduğu alanların ortak özelliği nedir?',
    options: [
      'Volkanik dağların bulunması',
      'Yer şekillerinin düz olması',
      'Aktif fay hatlarının bulunması',
      'Yağış miktarının fazla olması',
    ],
    correctAnswer: 'Aktif fay hatlarının bulunması',
    explanation:
      'Depremler yer kabuğundaki kırık hatları boyunca oluşur; Kuzey Anadolu ve Doğu Anadolu fayları bu nedenle risklidir. Düzlük veya yağış miktarı deprem riskini belirlemez.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Aşağıdaki ülke-iklim eşleştirmelerinden hangisi yanlıştır?',
    options: [
      'Endonezya — muson iklimi',
      'Mısır — çöl iklimi',
      'Brezilya — tropikal iklim',
      'Norveç — Akdeniz iklimi',
    ],
    correctAnswer: 'Norveç — Akdeniz iklimi',
    explanation:
      'Norveç yüksek enlemde yer aldığı için ılıman okyanus ve boreal iklim özellikleri gösterir; Akdeniz iklimi görülmez. Diğer eşleştirmeler kuşak koşullarıyla uyumludur.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-ayt-ea-cog-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 3,
    prompt: 'Bir akarsuyun hidroelektrik potansiyelinin yüksek olması öncelikle hangi iki faktöre bağlıdır?',
    options: [
      'Yağış rejimi ve toprak türü',
      'Eğim ve debi',
      'Havza genişliği ve bitki örtüsü',
      'Sıcaklık ve buharlaşma',
    ],
    correctAnswer: 'Eğim ve debi',
    explanation:
      'Enerji, düşü yüksekliği ile taşınan su miktarının çarpımına bağlıdır. Bu nedenle eğimli yatak ve yüksek debi potansiyeli artırır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
];
