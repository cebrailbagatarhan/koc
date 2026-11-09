import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { TopicDefinition } from '@/data/topicCatalog';

export const LEVEL_NAME = 'ÖSYM';
export const COURSE_NAME = 'TYT';

export const topics: TopicDefinition[] = [
  {
    name: 'Tarih',
    icon: '📜',
    summary: 'Osmanlı kuruluş, yükselme ve duraklama dönemlerini; Kurtuluş Savaşı’nı, inkılapları ve Atatürk ilkelerini kronoloji ve neden-sonuç ilişkisiyle çözümle.',
    goals: [
      'Olayları dönemlerine ve tarihlerine göre sırala.',
      'Antlaşmaların siyasi sonuçlarını ayırt et.',
      'İnkılap ve ilkeleri uygulama alanlarıyla eşleştir.',
    ],
    practicePrompt: 'Kurtuluş Savaşı’nın dönüm noktalarını tarihleriyle birlikte kronolojik olarak yaz.',
    questionIds: [
      'osym-tyt-tar-1',
      'osym-tyt-tar-2',
      'osym-tyt-tar-3',
      'osym-tyt-tar-4',
      'osym-tyt-tar-5',
      'osym-tyt-tar-6',
      'osym-tyt-tar-7',
      'osym-tyt-tar-8',
      'osym-tyt-tar-9',
      'osym-tyt-tar-10',
      'osym-tyt-tar-11',
      'osym-tyt-tar-12',
    ],
  },
  {
    name: 'Coğrafya',
    icon: '🗺️',
    summary: 'İklim tiplerini, yer şekillerini, nüfus-yerleşme özelliklerini ve ekonomik faaliyetleri Türkiye coğrafyası ve harita bilgisiyle birlikte yorumla.',
    goals: [
      'İklim tipini bitki örtüsü ve yağış rejimiyle eşleştir.',
      'Yer şeklinin oluşum sürecini belirle.',
      'Harita ölçeğinin etkilerini ayırt et.',
    ],
    practicePrompt: 'Türkiye’de görülen üç iklim tipini yağış rejimi ve bitki örtüsüyle karşılaştır.',
    questionIds: [
      'osym-tyt-cog-1',
      'osym-tyt-cog-2',
      'osym-tyt-cog-3',
      'osym-tyt-cog-4',
      'osym-tyt-cog-5',
      'osym-tyt-cog-6',
      'osym-tyt-cog-7',
      'osym-tyt-cog-8',
      'osym-tyt-cog-9',
      'osym-tyt-cog-10',
      'osym-tyt-cog-11',
      'osym-tyt-cog-12',
    ],
  },
  {
    name: 'Felsefe',
    icon: '🤔',
    summary: 'Bilgi, varlık, ahlak ve siyaset felsefesinin temel görüşlerini; mantık ilkelerini ve felsefenin işlevini kavramlar üzerinden ayırt et.',
    goals: [
      'Felsefi görüşü savunduğu ilkeyle eşleştir.',
      'Ahlak görüşlerini ölçütlerine göre ayır.',
      'Akıl yürütme biçimlerini örnekten tanı.',
    ],
    practicePrompt: 'Rasyonalizm ile empirizmin bilgi anlayışını birer örnekle karşılaştır.',
    questionIds: [
      'osym-tyt-fel-1',
      'osym-tyt-fel-2',
      'osym-tyt-fel-3',
      'osym-tyt-fel-4',
      'osym-tyt-fel-5',
      'osym-tyt-fel-6',
      'osym-tyt-fel-7',
      'osym-tyt-fel-8',
      'osym-tyt-fel-9',
      'osym-tyt-fel-10',
      'osym-tyt-fel-11',
      'osym-tyt-fel-12',
    ],
  },
];

export const questions: EmbeddedQuestionSeed[] = [
  {
    id: 'osym-tyt-tar-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Osmanlı Devleti’nin kuruluş döneminde, 1302 yılında Bizans kuvvetlerine karşı kazanılan savaş aşağıdakilerden hangisidir?',
    options: [
      'Koyunhisar Savaşı',
      'Sırp Sındığı Savaşı',
      'Niğbolu Savaşı',
      'Varna Savaşı',
    ],
    correctAnswer: 'Koyunhisar Savaşı',
    explanation:
      'Koyunhisar (Bapheus) Savaşı 1302’de Osman Bey ile Bizans kuvvetleri arasında yapılmıştır. Sırp Sındığı 1364, Niğbolu 1396 ve Varna 1444 tarihli olduğu için kuruluş dönemine girmez.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Rumeli’de kalıcı yerleşmenin ilk adımı sayılan Çimpe Kalesi hangi padişah döneminde Osmanlı topraklarına katılmıştır?',
    options: ['Osman Bey', 'I. Murat', 'Orhan Bey', 'Yıldırım Bayezid'],
    correctAnswer: 'Orhan Bey',
    explanation:
      'Çimpe Kalesi 1353’te Orhan Bey döneminde, Süleyman Paşa’nın çabalarıyla alınmıştır. Bu kale Osmanlı’nın Rumeli’deki ilk üssü sayılır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Aşağıdaki olayları kronolojik olarak sıralayınız.\nI. İstanbul’un fethi\nII. Ankara Savaşı\nIII. Karlofça Antlaşması',
    options: ['I – II – III', 'II – I – III', 'II – III – I', 'III – II – I'],
    correctAnswer: 'II – I – III',
    explanation:
      'Ankara Savaşı 1402, İstanbul’un fethi 1453, Karlofça Antlaşması 1699 tarihlidir. En erken olay II, ardından I, en son III gelir.',
    difficulty: 'standard',
    questionKind: 'sequence',
  },
  {
    id: 'osym-tyt-tar-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'İstanbul’u 1453’te fethederek Bizans İmparatorluğu’na son veren ve “Fatih” unvanını alan Osmanlı padişahı kimdir?',
    options: [
      'Yıldırım Bayezid',
      'I. Selim',
      'Kanuni Sultan Süleyman',
      'II. Mehmet',
    ],
    correctAnswer: 'II. Mehmet',
    explanation:
      'İstanbul 1453’te II. Mehmet döneminde fethedilmiş, bu başarısı nedeniyle padişaha “Fatih” unvanı verilmiştir. Yıldırım Bayezid İstanbul’u kuşatmış ancak alamamıştır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Yavuz Sultan Selim’in 1517’de Mısır’ı fethetmesinin Osmanlı Devleti açısından sonucu aşağıdakilerden hangisidir?',
    options: [
      'Halifeliğin Osmanlı Devleti’ne geçmesi',
      'Osmanlı Devleti’nin ilk kez Akdeniz’e açılması',
      'Tımarlı sipahi sisteminin kaldırılması',
      'Kapitülasyonların ilk kez verilmesi',
    ],
    correctAnswer: 'Halifeliğin Osmanlı Devleti’ne geçmesi',
    explanation:
      'Ridaniye Savaşı’nın ardından Memlûk Devleti yıkılmış, halifelik ve kutsal emanetler Osmanlı’ya geçmiştir. Akdeniz’e açılma ve kapitülasyonlar daha önceki dönemlere aittir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Osmanlı Devleti’nde duraklama döneminin başlangıcı kabul edilen ve 1606’da Avusturya ile imzalanan antlaşma hangisidir?',
    options: [
      'Karlofça Antlaşması',
      'Kasr-ı Şirin Antlaşması',
      'Vasvar Antlaşması',
      'Zitvatorok Antlaşması',
    ],
    correctAnswer: 'Zitvatorok Antlaşması',
    explanation:
      'Zitvatorok Antlaşması 1606’da imzalanmış ve Osmanlı’nın Avusturya karşısındaki üstünlüğü sona ermiştir. Karlofça 1699’da imzalanmış olup gerileme döneminin başlangıcı sayılır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Karlofça Antlaşması’nın (1699) Osmanlı tarihindeki yeri aşağıdakilerden hangisiyle açıklanır?',
    options: [
      'Yükselme döneminin başlangıcı olması ve sınırların genişlemesi',
      'Gerileme döneminin başlangıcı sayılması ve ilk büyük toprak kaybı olması',
      'Kuruluş döneminde beylikten devlete geçişi sağlaması',
      'Duraklama döneminde sınırların korunmasını sağlaması',
    ],
    correctAnswer:
      'Gerileme döneminin başlangıcı sayılması ve ilk büyük toprak kaybı olması',
    explanation:
      'Karlofça’da Macaristan, Erdel ve Podolya gibi geniş topraklar kaybedilmiş; bu antlaşma gerileme döneminin başlangıcı kabul edilmiştir. Duraklama dönemi 1606 Zitvatorok ile başlar.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Kurtuluş Savaşı’nın gerekçesini, amacını ve yöntemini ilk kez birlikte ortaya koyan belge aşağıdakilerden hangisidir?',
    options: [
      'Erzurum Kongresi kararları',
      'Sivas Kongresi kararları',
      'Amasya Genelgesi',
      'Misak-ı Millî',
    ],
    correctAnswer: 'Amasya Genelgesi',
    explanation:
      'Amasya Genelgesi’nde (22 Haziran 1919) “Milletin istiklalini yine milletin azim ve kararı kurtaracaktır” denilerek savaşın amacı ve yöntemi ilk kez açıklanmıştır. Kongre kararları bu genelgeden sonra alınmıştır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'Misak-ı Millî hangi mecliste kabul edilmiştir?',
    options: [
      'Son Osmanlı Mebusan Meclisi',
      'Birinci TBMM',
      'Erzurum Kongresi',
      'Sivas Kongresi',
    ],
    correctAnswer: 'Son Osmanlı Mebusan Meclisi',
    explanation:
      'Misak-ı Millî 28 Ocak 1920’de Son Osmanlı Mebusan Meclisi’nde kabul edilmiştir. TBMM 23 Nisan 1920’de açıldığı için bu kararı alamazdı.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Kurtuluş Savaşı ile ilgili aşağıdakilerden hangileri askeri nitelikli gelişmedir?\nI. Sakarya Savaşı\nII. Mudanya Ateşkes Antlaşması\nIII. Büyük Taarruz',
    options: ['Yalnız I', 'Yalnız II', 'I ve II', 'I ve III'],
    correctAnswer: 'I ve III',
    explanation:
      'Sakarya Savaşı (1921) ve Büyük Taarruz (1922) cephede kazanılmış askeri başarılardır. Mudanya Ateşkes Antlaşması ise 1922’de imzalanan diplomatik bir belgedir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'Saltanatın kaldırılması hangi tarihte gerçekleşmiştir?',
    options: ['29 Ekim 1923', '1 Kasım 1922', '3 Mart 1924', '24 Temmuz 1923'],
    correctAnswer: '1 Kasım 1922',
    explanation:
      'Saltanat 1 Kasım 1922’de TBMM kararıyla kaldırılmıştır. 29 Ekim 1923 cumhuriyetin ilanı, 3 Mart 1924 ise halifeliğin kaldırılması tarihidir.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-tar-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Atatürk ilkelerinden hangisi, özel girişimin yetersiz kaldığı ekonomik alanlarda devletin yatırım yapmasını ve planlama yapmasını öngörür?',
    options: ['Halkçılık', 'Laiklik', 'Devletçilik', 'İnkılapçılık'],
    correctAnswer: 'Devletçilik',
    explanation:
      'Devletçilik ilkesi 1930’lu yıllarda sanayi planları ve devlet eliyle kurulan fabrikalarla uygulanmıştır. Amaç, özel sermayenin gücünün yetmediği alanlarda kalkınmayı hızlandırmaktır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Türkiye’nin en yüksek dağı aşağıdakilerden hangisidir?',
    options: ['Erciyes Dağı', 'Ağrı Dağı', 'Süphan Dağı', 'Kaçkar Dağı'],
    correctAnswer: 'Ağrı Dağı',
    explanation:
      'Ağrı Dağı 5137 metre yükseltiyle Türkiye’nin en yüksek noktasıdır. Diğerleri Anadolu’nun yüksek dağları olmakla birlikte bu değere ulaşmaz.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Yazları sıcak ve kurak, kışları ılık ve yağışlı geçen; doğal bitki örtüsü maki olan iklim tipi hangisidir?',
    options: [
      'Karadeniz iklimi',
      'Karasal iklim',
      'Muson iklimi',
      'Akdeniz iklimi',
    ],
    correctAnswer: 'Akdeniz iklimi',
    explanation:
      'Akdeniz ikliminde yaz kuraklığı belirgindir, yağış kışa toplanır ve maki bu koşullarda gelişir. Karadeniz iklimi her mevsim yağışlı, karasal iklim ise kışları soğuktur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Her mevsim yağışlı olan ve doğal bitki örtüsü gür ormanlardan oluşan iklim tipi Türkiye’de en belirgin olarak hangi kıyıda görülür?',
    options: [
      'Doğu Karadeniz kıyıları',
      'Antalya kıyıları',
      'İzmir kıyıları',
      'Güneydoğu Anadolu’nun iç kesimleri',
    ],
    correctAnswer: 'Doğu Karadeniz kıyıları',
    explanation:
      'Doğu Karadeniz kıyıları yıl boyunca nemli hava kütlelerinin etkisinde kaldığı için her mevsim yağış alır. Antalya ve İzmir kıyılarında Akdeniz iklimi görülür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Kalkerli arazilerde yer altı sularının kayacı eritmesiyle oluşan şekillere karstik şekil denir. Buna göre aşağıdakilerden hangisi karstik şekildir?',
    options: ['Barkan', 'Sirk gölü', 'Obruk', 'Moren'],
    correctAnswer: 'Obruk',
    explanation:
      'Obruk, kalkerin erimesiyle oluşan çukur bir karstik şekildir. Barkan rüzgârla, sirk gölü ve moren ise buzullaşmayla oluşur.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Bir akarsuyun denize ulaştığı yerde taşıdığı alüvyonları biriktirmesiyle oluşan düz araziye ne ad verilir?',
    options: ['Birikinti konisi', 'Vadi', 'Delta ovası', 'Sirk'],
    correctAnswer: 'Delta ovası',
    explanation:
      'Akarsu denize döküldüğü yerde hızı azaldığı için yükünü biriktirir ve delta ovası oluşur. Birikinti konisi dağ eteğinde, sirk ise buzul aşındırmasıyla oluşur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Türkiye’de kilometrekareye düşen kişi sayısı bakımından nüfus yoğunluğu en fazla olan bölge hangisidir?',
    options: [
      'Marmara Bölgesi',
      'İç Anadolu Bölgesi',
      'Karadeniz Bölgesi',
      'Doğu Anadolu Bölgesi',
    ],
    correctAnswer: 'Marmara Bölgesi',
    explanation:
      'Sanayi, ticaret ve aldığı göç nedeniyle Marmara Bölgesi’nde nüfus yoğunluğu en yüksektir. Doğu Anadolu ise yüz ölçümü geniş, nüfusu görece az olduğu için yoğunluğu en düşük bölgedir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Türkiye’nin yüz ölçümü bakımından en büyük gölü hangisidir?',
    options: ['Tuz Gölü', 'Beyşehir Gölü', 'Eğirdir Gölü', 'Van Gölü'],
    correctAnswer: 'Van Gölü',
    explanation:
      'Van Gölü yaklaşık 3713 kilometrekarelik alanıyla Türkiye’nin en büyük gölüdür. Tuz Gölü ikinci sırada yer alır ve suları tuzlu olduğu için canlı çeşitliliği azdır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Harita ölçeği küçüldükçe haritada aşağıdakilerden hangisi gerçekleşir?',
    options: [
      'Ayrıntı artar, gösterilen alan küçülür.',
      'Ayrıntı azalır, gösterilen alan büyür.',
      'Ayrıntı ve gösterilen alan değişmez.',
      'Ayrıntı artar, gösterilen alan büyür.',
    ],
    correctAnswer: 'Ayrıntı azalır, gösterilen alan büyür.',
    explanation:
      'Ölçek küçüldükçe aynı harita üzerinde daha geniş bir alan gösterilir, bu yüzden ayrıntı azalır. Büyük ölçekli haritalar küçük alanları ayrıntılı verir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Tarım, hayvancılık ve madencilik gibi doğrudan doğal kaynaklardan yararlanmaya dayanan faaliyetler hangi ekonomik faaliyet grubunda yer alır?',
    options: [
      'İkincil faaliyetler',
      'Üçüncül faaliyetler',
      'Birincil faaliyetler',
      'Dördüncül faaliyetler',
    ],
    correctAnswer: 'Birincil faaliyetler',
    explanation:
      'Doğal kaynaklardan ham madde elde edilmesine dayanan tarım, hayvancılık ve madencilik birincil faaliyetlerdir. Sanayi ikincil, hizmet sektörü ise üçüncül grupta yer alır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Türkiye’de karasal iklimin etkili olduğu iç bölgelerde doğal bitki örtüsü genellikle hangisidir?',
    options: ['Step', 'Maki', 'Orman', 'Tundra'],
    correctAnswer: 'Step',
    explanation:
      'İlkbahar yağışlarıyla yeşeren, yaz kuraklığında kuruyan otsu bitki topluluğuna step (bozkır) denir ve iç bölgelerin tipik örtüsüdür. Maki Akdeniz, orman ise nemli kıyıların bitki örtüsüdür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Türkiye’nin yer şekilleriyle ilgili aşağıdaki yargılardan hangileri doğrudur?\nI. Ortalama yükselti batıdan doğuya doğru artar.\nII. Dağlar kuzey ve güney kıyılarında kıyıya paralel uzanır.\nIII. Ülkenin tamamı alçak ovalarla kaplıdır.',
    options: ['Yalnız III', 'II ve III', 'Yalnız II', 'I ve II'],
    correctAnswer: 'I ve II',
    explanation:
      'Türkiye’de ortalama yükselti batıdan doğuya artar; Kuzey Anadolu ve Toros dağları kıyıya paralel uzanır. Ülke topraklarının önemli bir bölümü dağlık ve platoluktur, bu nedenle III yanlıştır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-cog-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Haritalarda aynı yükseltiye sahip noktaları birleştiren eğrilere ne ad verilir?',
    options: ['İzoterm', 'İzohips', 'İzobar', 'İzohyet'],
    correctAnswer: 'İzohips',
    explanation:
      'İzohips (eş yükselti eğrisi) aynı yükseltideki noktaları birleştirir. İzoterm eş sıcaklık, izobar eş basınç, izohyet ise eş yağış eğrileridir.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Bilginin kaynağının akıl olduğunu, duyuların yanıltıcı olabileceğini savunan görüş aşağıdakilerden hangisidir?',
    options: ['Empirizm', 'Septisizm', 'Rasyonalizm', 'Sensualizm'],
    correctAnswer: 'Rasyonalizm',
    explanation:
      'Rasyonalizm, kesin bilgiye akıl yürütmeyle ulaşılabileceğini savunur; Descartes bu görüşün önde gelen temsilcisidir. Empirizm ve sensualizm bilginin kaynağını duyuya dayandırır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Bilginin kaynağının duyu deneyi olduğunu savunan Locke ve Hume hangi felsefi akım içinde değerlendirilir?',
    options: ['Rasyonalizm', 'Empirizm', 'Kritisizm', 'Entüisyonizm'],
    correctAnswer: 'Empirizm',
    explanation:
      'Empirizm, bilginin deney ve gözlemden doğduğunu savunur; Locke ve Hume bu akımın temsilcileridir. Rasyonalizm bilgiyi akla, entüisyonizm ise sezgiye dayandırır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Kant’ın, bilgide hem deneyin hem aklın payı bulunduğunu savunan ve bilgiyi eleştirel bir süzgeçten geçiren görüşü hangisidir?',
    options: ['Kritisizm', 'Dogmatizm', 'Septisizm', 'Materyalizm'],
    correctAnswer: 'Kritisizm',
    explanation:
      'Kant’a göre bilgi, duyu verilerinin aklın kalıplarıyla işlenmesiyle oluşur; bu yaklaşım kritisizm olarak adlandırılır. Dogmatizm sorgulamadan kabul etmeyi, septisizm ise kesin bilgiyi reddetmeyi ifade eder.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Hazzı en yüksek iyi sayan ve Aristippos’a dayandırılan ahlak görüşü aşağıdakilerden hangisidir?',
    options: ['Ödev ahlakı', 'Faydacılık', 'Egoizm', 'Hedonizm'],
    correctAnswer: 'Hedonizm',
    explanation:
      'Hedonizm, eylemin değerini haz verip vermemesine göre belirler ve Aristippos’un görüşleriyle anılır. Ödev ahlakı eylemin sonucuna değil ödeve uygunluğuna bakar.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Kant’ın ahlak anlayışına göre bir eylemin ahlaki değeri neye bağlıdır?',
    options: [
      'Eylemin sonucunun yararlı olmasına',
      'Eylemin toplumda çoğunlukla onaylanmasına',
      'Eylemin ödev bilinciyle yapılmasına',
      'Eylemin haz vermesine',
    ],
    correctAnswer: 'Eylemin ödev bilinciyle yapılmasına',
    explanation:
      'Kant için ahlaki değer, eylemin sonucunda değil ödev bilinciyle yapılmasında aranır; bu nedenle koşulsuz buyruğa uygunluk ölçüttür. Yarar ve haz sonuca bakan ölçütlerdir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Varlığın tek bir ilkeden açıklanabileceğini savunan görüşe ne ad verilir?',
    options: ['Monizm', 'Düalizm', 'Pluralizm', 'Nihilizm'],
    correctAnswer: 'Monizm',
    explanation:
      'Monizm varlığı tek bir ilkeye indirger; materyalizm ve idealizm birer monist yaklaşımdır. Düalizm iki, pluralizm ise birden çok ilke kabul eder.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Tanrı’nın evreni yarattığını ancak yarattıktan sonra evrene müdahale etmediğini savunan görüş hangisidir?',
    options: ['Teizm', 'Panteizm', 'Ateizm', 'Deizm'],
    correctAnswer: 'Deizm',
    explanation:
      'Deizmde Tanrı ilk nedendir, evreni yaratmıştır ama işleyişine karışmaz. Teizmde Tanrı evrene müdahale eder, panteizmde ise Tanrı evrenle özdeştir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      '“İnsan özgür doğar, oysa her yerde zincire vurulmuştur.” sözüyle toplum sözleşmesini savunan filozof kimdir?',
    options: [
      'Thomas Hobbes',
      'Jean-Jacques Rousseau',
      'John Locke',
      'Platon',
    ],
    correctAnswer: 'Jean-Jacques Rousseau',
    explanation:
      'Bu söz Rousseau’nun “Toplum Sözleşmesi” adlı eserinde yer alır ve bireyin özgürlüğünü toplumsal düzenle uzlaştırmayı amaçlar. Hobbes ve Locke da toplum sözleşmesini işlemiş ancak bu ifade Rousseau’ya aittir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Platon’un “Devlet” adlı eseri, ideal bir toplum düzeni kurguladığı için hangi yazın türüne örnek gösterilir?',
    options: ['Ütopya', 'Destan', 'Tragedya', 'Deneme'],
    correctAnswer: 'Ütopya',
    explanation:
      'Ütopya, var olan düzeni eleştirerek ideal bir toplum tasarlayan eserlerin türüdür; Platon’un “Devlet”i ve More’un “Utopia”sı bu türün örnekleridir. Destan ve tragedya edebî türlerdir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Genel bir öncülden zorunlu olarak tikel bir sonuca ulaşan akıl yürütme biçimi hangisidir?',
    options: ['Tümevarım', 'Tümdengelim', 'Analoji', 'Sezgi'],
    correctAnswer: 'Tümdengelim',
    explanation:
      'Tümdengelimde öncüller doğruysa sonuç zorunlu olarak doğrudur; matematikteki ispatlar bu biçime dayanır. Tümevarımda tek tek gözlemlerden genel yargıya varılır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Felsefenin işleviyle ilgili aşağıdaki yargılardan hangileri doğrudur?\nI. Kavramları açıklığa kavuşturur.\nII. Yerleşik kanıları eleştirel biçimde sorgular.\nIII. Deneysel yöntemle kesin sonuçlar üretmeyi amaçlar.',
    options: ['Yalnız III', 'I ve III', 'I ve II', 'II ve III'],
    correctAnswer: 'I ve II',
    explanation:
      'Felsefe kavramları netleştirir ve kanıları eleştirel biçimde sorgular. Deneysel yöntemle kesin sonuç üretmek bilimin işidir, bu nedenle III yanlıştır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'osym-tyt-fel-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: 'Siyaset felsefesinde “meşruiyet” kavramı neyi ifade eder?',
    options: [
      'İktidarın zor kullanma gücünü',
      'Devletin sınırlarının genişliğini',
      'Yönetilenlerin yönetime katılma oranını',
      'İktidarın yönetilenlerce haklı ve kabul edilebilir görülmesini',
    ],
    correctAnswer: 'İktidarın yönetilenlerce haklı ve kabul edilebilir görülmesini',
    explanation:
      'Meşruiyet, iktidarın dayanağının yönetilenlerce kabul edilmesini anlatır; yalnızca zor kullanma gücü meşruiyet doğurmaz. Katılma oranı ise siyasal katılımla ilgilidir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
];
