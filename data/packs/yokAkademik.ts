import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';
import type { TopicDefinition } from '@/data/topicCatalog';

export const LEVEL_NAME = 'YÖK';
export const COURSE_NAME = 'Akademik';

export const topics: TopicDefinition[] = [
  {
    name: 'İktisat ve İşletme',
    icon: '💼',
    summary:
      'Mikro iktisadın temel araçlarıyla piyasa davranışını, makro göstergeleri ve işletme muhasebesinin temel eşitliğini birlikte çöz.',
    goals: [
      'Arz-talep ve esneklik ilişkisini hasılat sonucuna bağla.',
      'Fayda ve maliyet türlerini tanımla.',
      'GSYH ile enflasyon türlerini ayırt et.',
      'Muhasebe eşitliğini ve pazarlama karmasını uygula.',
    ],
    practicePrompt:
      'Bir market ürününün fiyatı artsın: talep, toplam hasılat ve esneklik ilişkisini üç cümlede açıkla.',
    questionIds: [
      'yok-akademik-ikt-1',
      'yok-akademik-ikt-2',
      'yok-akademik-ikt-3',
      'yok-akademik-ikt-4',
      'yok-akademik-ikt-5',
      'yok-akademik-ikt-6',
      'yok-akademik-ikt-7',
      'yok-akademik-ikt-8',
      'yok-akademik-ikt-9',
      'yok-akademik-ikt-10',
      'yok-akademik-ikt-11',
      'yok-akademik-ikt-12',
    ],
  },
  {
    name: 'Hukuk Temelleri',
    icon: '⚖️',
    summary:
      'Hukukun kaynakları ve normlar hiyerarşisinden medeni, borçlar ve ceza hukukunun temel kavramlarına uzanan çerçeveyi kur.',
    goals: [
      'Normlar hiyerarşisini ve kaynak türlerini sırala.',
      'Ehliyet ve kişiliğin hukuki koşullarını ayırt et.',
      'Sözleşmenin kurulması ile temerrüdü ayır.',
      'Ceza hukukunun temel ilkelerini uygula.',
    ],
    practicePrompt:
      'Bir kişinin hangi anda tam ehliyetli olduğunu üç koşulu sayarak açıkla.',
    questionIds: [
      'yok-akademik-huk-1',
      'yok-akademik-huk-2',
      'yok-akademik-huk-3',
      'yok-akademik-huk-4',
      'yok-akademik-huk-5',
      'yok-akademik-huk-6',
      'yok-akademik-huk-7',
      'yok-akademik-huk-8',
      'yok-akademik-huk-9',
      'yok-akademik-huk-10',
      'yok-akademik-huk-11',
      'yok-akademik-huk-12',
    ],
  },
  {
    name: 'Mühendislik ve Temel Bilimler',
    icon: '⚙️',
    summary:
      'Malzeme, termodinamik, elektrik devreleri, istatistik ve algoritma karmaşıklığını tek bir nicel düşünme hattında birleştir.',
    goals: [
      'Gerilme ile gerinimi tanım ve birim düzeyinde ayırt et.',
      'Termodinamiğin birinci yasasını enerji dengesine uygula.',
      'Ohm ve Kirchhoff bağıntılarıyla devre çöz.',
      'Ortalama, standart sapma, olasılık ve Big-O hesabı yap.',
    ],
    practicePrompt:
      'Bir iletkenin direncini iki katına çıkarıp gerilimi sabit tutarsan akımın nasıl değiştiğini gerekçesiyle yaz.',
    questionIds: [
      'yok-akademik-mun-1',
      'yok-akademik-mun-2',
      'yok-akademik-mun-3',
      'yok-akademik-mun-4',
      'yok-akademik-mun-5',
      'yok-akademik-mun-6',
      'yok-akademik-mun-7',
      'yok-akademik-mun-8',
      'yok-akademik-mun-9',
      'yok-akademik-mun-10',
      'yok-akademik-mun-11',
      'yok-akademik-mun-12',
    ],
  },
];

export const questions: EmbeddedQuestionSeed[] = [
  {
    id: 'yok-akademik-ikt-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Diğer koşullar sabitken bir malın fiyatı artarsa o malın talep edilen miktarı nasıl değişir?',
    options: ['Azalır', 'Artar', 'Değişmez', 'Önce artar, sonra azalır'],
    correctAnswer: 'Azalır',
    explanation:
      'Talep kanununa göre fiyat ile talep edilen miktar ters yönlü hareket eder; diğer etkenler sabitken fiyat artışı talep edilen miktarı düşürür.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'Bir kararın fırsat maliyeti neyi ifade eder?',
    options: [
      'Kararın toplam parasal giderini',
      'Karardan elde edilen toplam faydayı',
      'Vazgeçilen en iyi alternatifin değerini',
      'Karar için harcanan zamanın piyasa fiyatını',
    ],
    correctAnswer: 'Vazgeçilen en iyi alternatifin değerini',
    explanation:
      'Fırsat maliyeti, bir seçim yapıldığında vazgeçilen en iyi alternatifin değeridir; yalnızca ödenen para değil, kaçırılan getiri de hesaba katılır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Bir işletmenin varlıkları 120.000 TL, borçları 45.000 TL ise özkaynakları kaç TL’dir?',
    options: ['165.000', '120.000', '45.000', '75.000'],
    correctAnswer: '75.000',
    explanation:
      'Muhasebe temel eşitliği Varlıklar = Borçlar + Özkaynaklar biçimindedir; buradan özkaynak 120.000 − 45.000 = 75.000 TL bulunur.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Talebinin fiyat esnekliği mutlak değerce 2,5 olan bir malda satıcı fiyatı artırırsa toplam hasılat nasıl değişir?',
    options: ['Azalır', 'Artar', 'Değişmez', 'Önce artar, sonra azalır'],
    correctAnswer: 'Azalır',
    explanation:
      'Esnek talepte (mutlak değer 1’den büyük) fiyat artışı, talep edilen miktarı fiyattan daha büyük oranda düşürür; bu nedenle toplam hasılat azalır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'Azalan marjinal fayda ilkesi aşağıdakilerden hangisini söyler?',
    options: [
      'Toplam fayda, tüketim arttıkça her zaman azalır.',
      'Tüketilen miktar arttıkça ek birimin sağladığı fayda azalır.',
      'Bir malın fiyatı düştükçe toplam fayda artar.',
      'Tüketici her zaman en pahalı malı tercih eder.',
    ],
    correctAnswer: 'Tüketilen miktar arttıkça ek birimin sağladığı fayda azalır.',
    explanation:
      'Marjinal fayda son tüketilen birimin ek faydasıdır ve miktar arttıkça azalır; toplam fayda ise marjinal fayda pozitif kaldığı sürece artmaya devam eder.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'Gayrisafi yurt içi hasıla (GSYH) tanımı aşağıdakilerden hangisidir?',
    options: [
      'Bir ülkede belirli bir dönemde yapılan tüm satışların toplamı',
      'Bir ülke vatandaşlarının dünyanın her yerinde ürettiği değerlerin toplamı',
      'Bir ülkede üretilen ara malların piyasa değeri',
      'Bir ülkede belirli bir dönemde üretilen nihai mal ve hizmetlerin piyasa değeri',
    ],
    correctAnswer:
      'Bir ülkede belirli bir dönemde üretilen nihai mal ve hizmetlerin piyasa değeri',
    explanation:
      'GSYH ülke sınırları içindeki üretimi kapsar ve ara malları çifte sayımı önlemek için dışarıda bırakır; vatandaşların yurt dışı üretimini kapsayan gösterge ise GSMH’dır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'Aşağıdakilerden hangisi kısa dönemde sabit maliyettir?',
    options: [
      'Üretimde kullanılan hammadde gideri',
      'Fabrika binasının kira gideri',
      'Üretim hattındaki saatlik işçi ücreti',
      'Üretim miktarına göre tüketilen elektrik gideri',
    ],
    correctAnswer: 'Fabrika binasının kira gideri',
    explanation:
      'Sabit maliyet üretim miktarından bağımsızdır; kira, üretim sıfır olsa da ödenir. Hammadde, saatlik işçilik ve üretime bağlı elektrik ise değişken maliyettir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Ham petrol fiyatlarının yükselmesiyle üretim girdileri pahalanmış ve genel fiyat düzeyi artmıştır. Bu artış hangi enflasyon türüne örnektir?',
    options: [
      'Talep enflasyonu',
      'Yapısal enflasyon',
      'Maliyet enflasyonu',
      'Mevsimsel enflasyon',
    ],
    correctAnswer: 'Maliyet enflasyonu',
    explanation:
      'Girdi fiyatlarındaki artış üretim maliyetlerini yükselterek fiyatları artırır; bu maliyet enflasyonudur. Talep enflasyonu ise toplam talebin üretimi aşmasından doğar.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Talep esnekliğiyle ilgili,\nI. Talebin fiyat esnekliği sıfır olan bir malda fiyat artışı toplam hasılatı artırır.\nII. Bir malın yakın ikame malları çoğaldıkça talebi daha esnek hâle gelir.\nIII. Gelir arttıkça düşük (fakir) malın talebi artar.\nyargılarından hangileri doğrudur?',
    options: ['Yalnız I', 'Yalnız II', 'II ve III', 'I ve II'],
    correctAnswer: 'I ve II',
    explanation:
      'Esneklik sıfırken miktar değişmediği için fiyat artışı hasılatı artırır (I). İkame olanakları arttıkça tüketici fiyata daha duyarlı olur (II). Düşük malda gelir artışı talebi azaltır (III yanlış).',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Çift taraflı kayıt ve muhasebe eşitliğiyle ilgili,\nI. Her işlem en az iki hesabı etkiler.\nII. Varlık hesaplarındaki artış borç tarafına kaydedilir.\nIII. Özkaynak, varlıklardan borçlar çıkarılarak bulunur.\nyargılarından hangileri doğrudur?',
    options: ['I, II ve III', 'Yalnız I', 'I ve II', 'II ve III'],
    correctAnswer: 'I, II ve III',
    explanation:
      'Çift taraflı kayıtta her işlem en az iki hesaba yazılır, varlık artışı borç tarafına kaydedilir ve eşitlik gereği özkaynak varlıklardan borçların çıkarılmasıyla bulunur.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt:
      'Bir ülkede nominal GSYH 2023’te 100, 2024’te 200 birimdir. GSYH deflatörü 2023’te 100, 2024’te 125 ise 2024’te reel GSYH yüzde kaç artmıştır?',
    options: ['%25', '%60', '%75', '%100'],
    correctAnswer: '%60',
    explanation:
      'Reel GSYH nominal değerin deflatöre bölünmesiyle bulunur: 2023 için 100, 2024 için 200 ÷ 1,25 = 160. Artış (160 − 100) ÷ 100 = %60’tır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-ikt-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 0,
    prompt: 'Tam rekabet piyasasında kârını maksimize eden firma hangi koşulda üretim yapar?',
    options: [
      'Fiyat ortalama maliyete eşitken',
      'Marjinal hasılat sıfırken',
      'Marjinal maliyet fiyata eşitken',
      'Toplam hasılat toplam maliyetten küçükken',
    ],
    correctAnswer: 'Marjinal maliyet fiyata eşitken',
    explanation:
      'Kâr maksimizasyonunda marjinal hasılat marjinal maliyete eşittir; tam rekabette fiyat marjinal hasılata eşit olduğundan koşul fiyat = marjinal maliyet olur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Normlar hiyerarşisine göre aşağıdakilerden hangisi kanunun üstünde yer alır?',
    options: ['Anayasa', 'Yönetmelik', 'Cumhurbaşkanlığı kararnamesi', 'Bakanlık genelgesi'],
    correctAnswer: 'Anayasa',
    explanation:
      'Normlar hiyerarşisinin en üstünde Anayasa bulunur; kanunlar Anayasaya, cumhurbaşkanlığı kararnamesi ve yönetmelikler ise kanuna aykırı olamaz.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Ayırt etme gücüne sahip, ergin ve kısıtlı olmayan bir kişi için aşağıdakilerden hangisi doğrudur?',
    options: [
      'Sınırlı ehliyetsizdir.',
      'Ehliyetsizdir.',
      'Tam ehliyetlidir.',
      'Fiil ehliyeti yalnız evlilikle kazanılır.',
    ],
    correctAnswer: 'Tam ehliyetlidir.',
    explanation:
      'Erginlik, ayırt etme gücü ve kısıtlı olmama fiil ehliyetinin üç koşuludur; bu koşulları birlikte taşıyan kişi tam ehliyetlidir.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Medeni hukuka göre gerçek kişilik hangi anda başlar?',
    options: ['Nüfusa kayıtla', 'Ergin olmakla', 'Evlenmeyle', 'Sağ olarak doğmakla'],
    correctAnswer: 'Sağ olarak doğmakla',
    explanation:
      'Kişilik, çocuğun sağ olarak tamamıyla doğduğu anda başlar ve ölümle sona erer; sağ doğmak koşuluyla ana rahmine düşme anından itibaren de hak ehliyeti vardır.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Resmî Gazete’de yayımlanan bir kanun, yürürlük tarihi belirtilmemişse ne zaman yürürlüğe girer?',
    options: ['Yayım günü', 'Yayımından 45 gün sonra', 'Yayımından 30 gün sonra', 'Cumhurbaşkanının onayıyla'],
    correctAnswer: 'Yayımından 45 gün sonra',
    explanation:
      'Yürürlük tarihi gösterilmeyen kanunlar, Resmî Gazete’de yayımlandıktan 45 gün sonra yürürlüğe girer; bu süre kanunun bilinmesi için tanınmıştır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Borçlar hukukunda bir sözleşme kural olarak nasıl kurulur?',
    options: [
      'Yazılı belge düzenlenmesiyle',
      'Noterde onaylanmasıyla',
      'Tarafların fiilen ifada bulunmasıyla',
      'Öneri ve kabulün karşılıklı ve birbirine uygun açıklanmasıyla',
    ],
    correctAnswer: 'Öneri ve kabulün karşılıklı ve birbirine uygun açıklanmasıyla',
    explanation:
      'Sözleşme, tarafların karşılıklı ve birbirine uygun irade açıklamalarıyla, yani öneri (icap) ile kabulün uyuşmasıyla kurulur; kural olarak şekil şartı aranmaz.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Borçlunun temerrüde düşmesi için kural olarak aşağıdakilerden hangisi gerekir?',
    options: [
      'Borcu ifa etmemesi ve kendisine ihtar edilmesi',
      'Borcu vadesinden önce ifa etmesi',
      'Alacaklının ifayı kabul etmemesi',
      'Sözleşmenin yazılı yapılmış olması',
    ],
    correctAnswer: 'Borcu ifa etmemesi ve kendisine ihtar edilmesi',
    explanation:
      'Borçlu temerrüdü için borcun muaccel olması, ifa edilmemesi ve kural olarak alacaklının ihtarı gerekir; alacaklının ifayı kabul etmemesi ise alacaklı temerrüdüdür.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Ceza hukukunda kanunilik ilkesi neyi ifade eder?',
    options: [
      'Ceza yalnız hâkim takdiriyle belirlenir.',
      'Suç ve cezalar yalnızca kanunla konulabilir.',
      'Her suç için yalnızca para cezası verilir.',
      'Ceza sorumluluğu aileye devredilebilir.',
    ],
    correctAnswer: 'Suç ve cezalar yalnızca kanunla konulabilir.',
    explanation:
      'Kanunilik ilkesi, suç ve cezanın önceden kanunla belirlenmesini zorunlu kılar; kıyas yoluyla suç veya ceza yaratılamaz.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt: 'Aşağıdakilerden hangisi hukukun yardımcı kaynakları arasında yer alır?',
    options: ['Anayasa', 'Yönetmelik', 'Bilimsel görüşler', 'Milletlerarası andlaşma'],
    correctAnswer: 'Bilimsel görüşler',
    explanation:
      'Yardımcı kaynaklar bağlayıcı olmayan, yorumda başvurulan kaynaklardır: bilimsel görüşler ve yargı kararları. Anayasa, andlaşma ve yönetmelik ise bağlayıcı kaynaklardır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Bir hukuk kuralı, tarafların aksini kararlaştırmasına izin vermiyorsa bu kural hangi niteliktedir?',
    options: ['Tamamlayıcı', 'Yorumlayıcı', 'İzin verici', 'Emredici'],
    correctAnswer: 'Emredici',
    explanation:
      'Emredici kurallar tarafların iradesiyle değiştirilemez ve aksine sözleşme yapılamaz; tamamlayıcı kurallar ise taraflar aksini kararlaştırmadıkça uygulanır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Medeni hukukta ehliyetle ilgili,\nI. Ayırt etme gücü bulunmayan kişi fiil ehliyetine sahip değildir.\nII. Ayırt etme gücüne sahip küçük, kural olarak sınırlı ehliyetsizdir.\nIII. Fiil ehliyeti için yalnızca ergin olmak yeterlidir.\nyargılarından hangileri doğrudur?',
    options: ['I ve II', 'Yalnız I', 'Yalnız III', 'I, II ve III'],
    correctAnswer: 'I ve II',
    explanation:
      'Fiil ehliyeti erginlik, ayırt etme gücü ve kısıtlı olmama koşullarının birlikte gerçekleşmesine bağlıdır; bu yüzden III yanlıştır. Ayırt etme gücü olmayan kişi ehliyetsiz, ayırt etme gücüne sahip küçük ise sınırlı ehliyetsizdir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Ceza hukukunun temel ilkeleriyle ilgili,\nI. Suç ve cezada kanunilik ilkesi geçerlidir.\nII. Ceza sorumluluğu kusur sorumluluğuna dayanır.\nIII. Ceza sorumluluğu kişiseldir, başkasına devredilemez.\nyargılarından hangileri doğrudur?',
    options: ['Yalnız I', 'I, II ve III', 'I ve III', 'II ve III'],
    correctAnswer: 'I, II ve III',
    explanation:
      'Üç yargı da ceza hukukunun temel ilkeleridir: kanunilik, kusur sorumluluğu ve cezanın kişiselliği. Ceza, failin kendi kusuruna dayanır ve mirasçılara geçmez.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-huk-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 1,
    prompt:
      'Anayasa hukukunun temel ilkeleriyle ilgili,\nI. Hukuk devletinde idarenin işlemleri yargı denetimine tabidir.\nII. Kuvvetler ayrılığı, yasama, yürütme ve yargının ayrı organlarca kullanılmasını ifade eder.\nIII. Eşitlik ilkesi, aynı durumdaki kişilere farklı davranılmasını zorunlu kılar.\nyargılarından hangileri doğrudur?',
    options: ['Yalnız II', 'II ve III', 'I ve II', 'I, II ve III'],
    correctAnswer: 'I ve II',
    explanation:
      'Hukuk devleti idarenin yargısal denetimini gerektirir (I); kuvvetler ayrılığı ise devlet organları arasındaki görev paylaşımıdır (II). Eşitlik ilkesi aynı durumdakilere aynı davranılmasını gerektirdiği için III yanlıştır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-1',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Bir çubuğa uygulanan çekme kuvvetinin kesit alanına bölünmesiyle bulunan gerilmenin SI birimi hangisidir?',
    options: ['Pascal (N/m²)', 'Newton (N)', 'Joule (J)', 'Metre (m)'],
    correctAnswer: 'Pascal (N/m²)',
    explanation:
      'Gerilme, kuvvetin alana bölümü olduğundan birimi N/m², yani Pascal’dır. Newton kuvvet birimidir; gerilmenin birimi değildir.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-2',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Direnci 4 Ω olan bir iletkenden 3 A akım geçiyorsa iletkenin uçları arasındaki gerilim kaç volttur?',
    options: ['0,75', '1,33', '7', '12'],
    correctAnswer: '12',
    explanation:
      'Ohm yasasına göre gerilim akım ile direncin çarpımıdır: V = I × R = 3 × 4 = 12 V.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-3',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: '4, 6, 8, 10, 12 sayılarının aritmetik ortalaması kaçtır?',
    options: ['6', '7', '8', '10'],
    correctAnswer: '8',
    explanation:
      'Sayıların toplamı 40, eleman sayısı 5 olduğundan aritmetik ortalama 40 ÷ 5 = 8’dir.',
    difficulty: 'easy',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-4',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: 'Bir malzemenin birim şekil değiştirmesi (gerinim) için hangisi doğrudur?',
    options: [
      'Birimi Newton’dur.',
      'Birimi Pascal’dır.',
      'Her zaman gerilmeden büyüktür.',
      'Birimsiz (boyutsuz) bir büyüklüktür.',
    ],
    correctAnswer: 'Birimsiz (boyutsuz) bir büyüklüktür.',
    explanation:
      'Gerinim, uzunluktaki değişimin ilk uzunluğa oranıdır; iki uzunluğun bölümü olduğu için birimsizdir. Gerilme ise N/m², yani Pascal ile ifade edilir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-5',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Bir sisteme 200 J ısı verilmiş ve sistem çevreye 50 J iş yapmıştır. Sistemin iç enerjisindeki değişim kaç joule’dür?',
    options: ['−150', '50', '150', '250'],
    correctAnswer: '150',
    explanation:
      'Termodinamiğin birinci yasası ΔU = Q − W biçimindedir; buradan ΔU = 200 − 50 = 150 J bulunur. 250 J, işin yanlışlıkla eklenmesiyle oluşan çeldiricidir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-6',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: 'Kirchhoff akım yasası neyi ifade eder?',
    options: [
      'Bir düğüme giren akımların toplamı, çıkan akımların toplamına eşittir.',
      'Bir çevredeki gerilim düşümlerinin toplamı sıfırdır.',
      'Akım her zaman gerilimle ters orantılıdır.',
      'Direnç sıcaklıkla her zaman azalır.',
    ],
    correctAnswer: 'Bir düğüme giren akımların toplamı, çıkan akımların toplamına eşittir.',
    explanation:
      'Akım yasası yükün korunumunun ifadesidir: bir düğüme giren akım toplamı, çıkan akım toplamına eşittir. Gerilim düşümlerinin toplamının sıfır olması ise gerilim yasasıdır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-7',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt: '2, 4, 4, 4, 5, 5, 7, 9 veri kümesinin standart sapması kaçtır?',
    options: ['√2', '2', '4', '8'],
    correctAnswer: '2',
    explanation:
      'Ortalama 40 ÷ 8 = 5’tir. Sapmaların kareleri toplamı 32, varyans 32 ÷ 8 = 4, standart sapma √4 = 2’dir.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-8',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      '52 kartlık standart bir desteden rastgele bir kart çekildiğinde kartın kupa olma olasılığı kaçtır?',
    options: ['1/13', '1/52', '1/4', '1/2'],
    correctAnswer: '1/4',
    explanation:
      'Destede 13 kupa kartı vardır; istenen olasılık 13/52 = 1/4’tür. 1/13, tek bir kupa kartının çekilme olasılığıyla karıştırılmamalıdır.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-9',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Birleştirme sıralaması (merge sort) algoritmasının en kötü durum zaman karmaşıklığı hangisidir?',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 'O(n log n)',
    explanation:
      'Dizi her adımda ikiye bölündüğü için log n düzey oluşur ve her düzeyde birleştirme O(n) sürer; toplam maliyet O(n log n)’dir. O(n²) ise kabarcık sıralaması gibi algoritmaların en kötü durumudur.',
    difficulty: 'standard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-10',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Gerilme ve gerinimle ilgili,\nI. Gerilme, kuvvetin kesit alanına bölünmesiyle bulunur.\nII. Gerinim, uzunluktaki değişimin ilk uzunluğa oranıdır.\nIII. Elastik bölgede gerilme ile gerinim doğru orantılıdır.\nyargılarından hangileri doğrudur?',
    options: ['I, II ve III', 'Yalnız I', 'I ve II', 'II ve III'],
    correctAnswer: 'I, II ve III',
    explanation:
      'İlk iki yargı gerilme ve gerinimin tanımlarıdır; elastik bölgede Hooke yasası gereği gerilme gerinimle doğru orantılıdır.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-11',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'İdeal gazlarda termodinamiğin birinci yasasıyla ilgili,\nI. İzotermal süreçte iç enerji değişimi sıfırdır.\nII. Adyabatik süreçte sistemle çevre arasında ısı alışverişi yoktur.\nIII. İzobarik süreçte basınç sabit kalır.\nyargılarından hangileri doğrudur?',
    options: ['Yalnız I', 'I, II ve III', 'I ve III', 'II ve III'],
    correctAnswer: 'I, II ve III',
    explanation:
      'İdeal gazın iç enerjisi yalnızca sıcaklığa bağlıdır; izotermal süreçte sıcaklık sabit olduğu için ΔU = 0’dır. Adyabatik süreçte ısı alışverişi yoktur, izobarik süreçte ise basınç sabittir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
  {
    id: 'yok-akademik-mun-12',
    levelName: LEVEL_NAME,
    courseName: COURSE_NAME,
    topicIndex: 2,
    prompt:
      'Artan sırada 1.000.000 elemanlı bir dizide ikili arama (binary search) en kötü durumda yaklaşık kaç karşılaştırma yapar?',
    options: ['10', '20', '1.000', '1.000.000'],
    correctAnswer: '20',
    explanation:
      'Her adımda arama aralığı yarıya iner; 2²⁰ yaklaşık 1.000.000 olduğundan en kötü durumda yaklaşık 20 karşılaştırma yeterlidir ve karmaşıklık O(log n)’dir.',
    difficulty: 'hard',
    questionKind: 'multiple-choice',
  },
];
