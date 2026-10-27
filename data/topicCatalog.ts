export type TopicDefinition = {
  name: string;
  icon: string;
  summary: string;
  goals: string[];
  practicePrompt: string;
  questionIds: string[];
};

const key = (levelName: string, courseName: string) => `${levelName}::${courseName}`;

const TOPICS: Record<string, TopicDefinition[]> = {
  [key('İlkokul', 'Matematik')]: [
    {
      name: 'Toplama ve Çıkarma',
      icon: '➕',
      summary: 'Doğal sayılarla toplama ve çıkarma işlemlerini parçalara ayırarak güvenli ve kontrollü çöz.',
      goals: ['Basamak değerini kullan.', 'Zihinden kontrol yap.', 'Sonucu yaklaşık değerle karşılaştır.'],
      practicePrompt: '27 + 15 işlemini iki farklı yolla çöz ve sonuçları karşılaştır.',
      questionIds: ['im1'],
    },
    {
      name: 'Sayılar ve Kesirler',
      icon: '🍰',
      summary: 'Bütün, yarım ve parçaları sayı ilişkileriyle birlikte düşün.',
      goals: ['Bütün-parça ilişkisini kur.', 'Yarım ve çeyreği ayırt et.', 'Günlük örneklerle eşleştir.'],
      practicePrompt: '12 nesnenin yarısını ve çeyreğini ayrı ayrı göster.',
      questionIds: ['im2'],
    },
    {
      name: 'Çarpma Mantığı',
      icon: '✖️',
      summary: 'Çarpmayı aynı sayının tekrarlı toplamı olarak modelle.',
      goals: ['Gruplama yap.', 'Tekrarlı toplamayı yaz.', 'Çarpım sonucunu toplamayla doğrula.'],
      practicePrompt: '3 × 4 işlemini nesne grupları ve tekrarlı toplama ile göster.',
      questionIds: ['im3'],
    },
  ],
  [key('İlkokul', 'Türkçe')]: [
    {
      name: 'Sözcükte Anlam',
      icon: '🔤',
      summary: 'Sözcüklerin eş, zıt ve bağlama göre anlamlarını ayırt et.',
      goals: ['Zıt anlamlı kelimeleri bul.', 'Kelimeyi cümle içinde değerlendir.', 'Yakın anlamla zıt anlamı karıştırma.'],
      practicePrompt: 'Hızlı, büyük ve sıcak kelimelerinin zıt anlamlarını yaz.',
      questionIds: ['it1'],
    },
    {
      name: 'Adlar',
      icon: '🏷️',
      summary: 'Özel ad ve tür adını günlük örneklerle ayır.',
      goals: ['Kişi ve yer adlarını tanı.', 'Özel adların yazımını fark et.', 'Tür adlarıyla karşılaştır.'],
      practicePrompt: 'Çevrenden üç özel ad ve üç tür adı yaz.',
      questionIds: ['it2'],
    },
    {
      name: 'Cümlede Yapan Kişi',
      icon: '👤',
      summary: 'Basit cümlelerde işi yapan kişi veya varlığı bul.',
      goals: ['Eylemi belirle.', 'Kim/ne sorusunu sor.', 'Yapanla yapılan işi ayır.'],
      practicePrompt: '“Ece kitabı okudu.” cümlesinde yapanı ve yapılan işi yaz.',
      questionIds: ['it3'],
    },
  ],
  [key('İlkokul', 'Hayat Bilgisi')]: [
    {
      name: 'Trafik Güvenliği',
      icon: '🚦',
      summary: 'Yaya olarak trafikte güvenli davranışları tanı ve uygula.',
      goals: ['Yaya geçidini kullan.', 'Işıkları kontrol et.', 'Görüşü kapalı yerlerden geçme.'],
      practicePrompt: 'Okula giderken kullandığın güvenli geçiş noktalarını düşün.',
      questionIds: ['ih1'],
    },
    {
      name: 'Hijyen ve Sağlık',
      icon: '🧼',
      summary: 'Günlük hijyen alışkanlıklarının sağlıkla ilişkisini kur.',
      goals: ['Doğru zamanda el yıka.', 'Kişisel temizliğe dikkat et.', 'Sağlıklı rutini düzenli uygula.'],
      practicePrompt: 'Bugün yaptığın üç hijyen davranışını yaz.',
      questionIds: ['ih2'],
    },
    {
      name: 'Acil Durum ve Güvenlik',
      icon: '🆘',
      summary: 'Acil durumda güvenli yardım isteme ve riskten uzaklaşma adımlarını öğren.',
      goals: ['Panik yerine yardım iste.', 'Güvenilir yetişkine ulaş.', 'Kendini tehlikeye atma.'],
      practicePrompt: 'Evde bir acil durumda kimlerden yardım isteyebileceğini düşün.',
      questionIds: ['ih3'],
    },
  ],
  [key('İlkokul', 'İngilizce')]: [
    {
      name: 'Temel Kelimeler',
      icon: '🍎',
      summary: 'Günlük nesnelerin temel İngilizce karşılıklarını öğren.',
      goals: ['Kelimeyi görselle eşleştir.', 'Kısa cümlede kullan.', 'Sesli tekrar yap.'],
      practicePrompt: 'Apple, book ve water kelimeleriyle üç kısa cümle kur.',
      questionIds: ['ii1', 'ii3'],
    },
    {
      name: 'Selamlaşma',
      icon: '👋',
      summary: 'Basit selamlaşma ve hâl-hatır sorma kalıplarını kullan.',
      goals: ['How are you? kalıbını tanı.', 'Kısa cevap ver.', 'Kibar kapanış kullan.'],
      practicePrompt: 'Kendini tanıtan iki cümle ve bir hâl-hatır sorusu söyle.',
      questionIds: ['ii2'],
    },
    {
      name: 'Sınıf ve Günlük Yaşam',
      icon: '🎒',
      summary: 'Okul ve günlük yaşamda sık geçen kelimeleri kısa cümlelere taşı.',
      goals: ['Nesne adlarını öğren.', 'This is ... kalıbını kullan.', 'Kelimeyi bağlam içinde hatırla.'],
      practicePrompt: 'Sınıftaki üç nesnenin İngilizcesini söyle.',
      questionIds: [],
    },
  ],
  [key('Ortaokul', 'Matematik')]: [
    {
      name: 'Denklemler',
      icon: '🧮',
      summary: 'Bilinmeyeni yalnız bırakmak için eşitliğin iki tarafına aynı işlemi uygula.',
      goals: ['Bilinmeyeni belirle.', 'Ters işlemi doğru seç.', 'Çözümü yerine koyarak kontrol et.'],
      practicePrompt: '2x + 7 = 19 denklemini adım adım çöz.',
      questionIds: ['om1'],
    },
    {
      name: 'Ondalık ve Kesirler',
      icon: '½',
      summary: 'Ondalık gösterim ile kesir gösterimi arasında dönüşüm yap.',
      goals: ['Payda 10 ve 100 ilişkisini kullan.', 'Kesri sadeleştir.', 'Ondalık değeri karşılaştır.'],
      practicePrompt: '0,5; 0,25 ve 0,75 sayılarını kesre çevir.',
      questionIds: ['om2'],
    },
    {
      name: 'Üçgenler',
      icon: '🔺',
      summary: 'Üçgenin temel açı ve kenar özelliklerini kullan.',
      goals: ['İç açı toplamını bil.', 'Açı türlerini ayırt et.', 'Eksik açıyı hesapla.'],
      practicePrompt: 'Açıları 50° ve 60° olan üçgenin üçüncü açısını bul.',
      questionIds: ['om3'],
    },
  ],
  [key('Ortaokul', 'Türkçe')]: [
    {
      name: 'Cümlenin Ögeleri',
      icon: '🧩',
      summary: 'Cümlenin temel yargısını ve onu tamamlayan ögeleri ayırt et.',
      goals: ['Önce yüklemi bul.', 'Kim/ne sorusunu kullan.', 'Yer-yön bilgisini ayır.'],
      practicePrompt: '“Çocuklar bahçede oyun oynadı.” cümlesinin yüklemini bul.',
      questionIds: ['ot1'],
    },
    {
      name: 'Anlam İlişkileri',
      icon: '⚖️',
      summary: 'Karşılaştırma, neden-sonuç ve amaç gibi anlam ilişkilerini işaretlerden tanı.',
      goals: ['Karşılaştırma sözcüklerini fark et.', 'İki yargıyı ayır.', 'İlişki türünü kanıtla.'],
      practicePrompt: '“Bu film diğerinden daha kısa.” cümlesindeki karşılaştırmayı açıkla.',
      questionIds: ['ot2'],
    },
    {
      name: 'Paragrafta Ana Düşünce',
      icon: '📖',
      summary: 'Paragrafın bütününü kapsayan temel mesajı bul.',
      goals: ['Ayrıntıyla ana fikri ayır.', 'Paragrafın tamamını kapsa.', 'Dış bilgi ekleme.'],
      practicePrompt: 'Kısa bir paragraf seç ve ana düşüncesini tek cümleye indir.',
      questionIds: ['ot3'],
    },
  ],
  [key('Ortaokul', 'Fen Bilimleri')]: [
    {
      name: 'Madde ve Isı',
      icon: '🌡️',
      summary: 'Maddenin sıcaklıkla değişen özelliklerini ve hâl değişimlerini gözlemle.',
      goals: ['Kaynama ve erimeyi ayır.', 'Sıcaklık birimini doğru kullan.', 'Koşulların etkisini fark et.'],
      practicePrompt: 'Suyun kaynama ve donma sıcaklıklarını karşılaştır.',
      questionIds: ['of1'],
    },
    {
      name: 'Fotosentez ve Canlılar',
      icon: '🌿',
      summary: 'Bitkilerin ışık enerjisini kullanarak besin üretme sürecini temel girdilerle öğren.',
      goals: ['Karbondioksit kullanımını bil.', 'Işığın rolünü fark et.', 'Oksijen çıkışını ilişkilendir.'],
      practicePrompt: 'Fotosentezin üç girdisini ve iki çıktısını yaz.',
      questionIds: ['of2'],
    },
    {
      name: 'Kuvvet',
      icon: '💪',
      summary: 'Kuvveti hareketi değiştirebilen bir etki olarak düşün ve birimini öğren.',
      goals: ['Kuvvet birimini bil.', 'İtme ve çekmeyi ayır.', 'Harekete etkisini açıkla.'],
      practicePrompt: 'Günlük hayattan bir itme ve bir çekme örneği yaz.',
      questionIds: ['of3'],
    },
  ],
  [key('Ortaokul', 'Sosyal Bilgiler')]: [
    {
      name: 'Türkiye ve Yer Bilgisi',
      icon: '🇹🇷',
      summary: 'Türkiye ile ilgili temel yer, başkent ve bölge bilgisini harita üzerinde ilişkilendir.',
      goals: ['Başkenti bil.', 'Şehir ve ülke ayrımını yap.', 'Harita üzerinde konum düşün.'],
      practicePrompt: 'Türkiye haritasında başkenti ve yaşadığın ili işaretlediğini hayal et.',
      questionIds: ['os1'],
    },
    {
      name: 'Harita ve Yönler',
      icon: '🧭',
      summary: 'Temel yönleri harita ve günlük konum tariflerinde kullan.',
      goals: ['Kuzeyi referans al.', 'Doğu-batı ilişkisini bil.', 'Basit rota tarif et.'],
      practicePrompt: 'Bulunduğun yerden yakın bir noktaya yönleri kullanarak rota tarif et.',
      questionIds: ['os2'],
    },
    {
      name: 'Demokrasi ve Katılım',
      icon: '🗳️',
      summary: 'Seçim, temsil ve yurttaş katılımının temel işlevlerini öğren.',
      goals: ['Seçimin amacını bil.', 'Temsil kavramını açıkla.', 'Katılımın önemini düşün.'],
      practicePrompt: 'Sınıf temsilcisi seçiminin neden demokratik bir uygulama olduğunu yaz.',
      questionIds: ['os3'],
    },
  ],
  [key('Ortaokul', 'İngilizce')]: [
    {
      name: 'Simple Present',
      icon: '🕒',
      summary: 'Günlük rutinleri simple present ile anlat ve üçüncü tekil kişi kullanımına dikkat et.',
      goals: ['I/you/we/they yapısını kullan.', 'He/she/it ile -s ekini hatırla.', 'Rutin cümlesi kur.'],
      practicePrompt: 'She ile başlayan üç günlük rutin cümlesi yaz.',
      questionIds: ['oi1'],
    },
    {
      name: 'Frequency Words',
      icon: '🔁',
      summary: 'Always, usually, sometimes ve never gibi sıklık zarflarını günlük cümlelerde kullan.',
      goals: ['Anlamlarını ayırt et.', 'Cümlede yerini öğren.', 'Kendi rutinine uygula.'],
      practicePrompt: 'Usually ve never kullanarak iki cümle yaz.',
      questionIds: ['oi2'],
    },
    {
      name: 'Question Forms',
      icon: '❓',
      summary: 'Where, what, when gibi soru kelimeleriyle doğru soru yapıları kur.',
      goals: ['Soru kelimesini seç.', 'Do/does kullanımını tanı.', 'Kısa cevap üret.'],
      practicePrompt: 'Where ve what ile iki soru yaz.',
      questionIds: ['oi3'],
    },
  ],
  [key('Lise', 'Matematik')]: [
    {
      name: 'İkinci Dereceden Denklemler',
      icon: 'x²',
      summary: 'İkinci dereceden denklemleri çarpanlara ayırma ve kök mantığıyla çöz.',
      goals: ['Standart formu tanı.', 'Çarpanlara ayır.', 'Kökleri denklemde kontrol et.'],
      practicePrompt: 'x² - 7x + 12 = 0 denklemini çöz.',
      questionIds: ['lm1'],
    },
    {
      name: 'Fonksiyonlar',
      icon: 'ƒ',
      summary: 'Fonksiyonu bir girdiyi kurala göre çıktıya dönüştüren yapı olarak kullan.',
      goals: ['Girdi-çıktı ilişkisini kur.', 'Fonksiyon değerini hesapla.', 'Tanım kümesi fikrini ayır.'],
      practicePrompt: 'f(x)=3x-2 için f(4) değerini bul.',
      questionIds: ['lm2'],
    },
    {
      name: 'Logaritma',
      icon: 'log',
      summary: 'Logaritmayı üslü ifadelerin ters işlemi olarak yorumla.',
      goals: ['Üslü-logaritmik dönüşüm yap.', 'Tabanı doğru oku.', 'Temel değerleri hesapla.'],
      practicePrompt: 'log₁₀(100) ve log₂(8) değerlerini üslü biçim üzerinden bul.',
      questionIds: ['lm3'],
    },
  ],
  [key('Lise', 'Fizik')]: [
    {
      name: 'Kuvvet ve Newton Yasaları',
      icon: '⚙️',
      summary: 'Net kuvvet, kütle ve ivme arasındaki ilişkiyi Newton yasalarıyla kur.',
      goals: ['Net kuvveti hesapla.', 'F=ma ilişkisini kullan.', 'Denge durumunu yorumla.'],
      practicePrompt: 'Net kuvveti sıfır olan bir cismin hareketini iki farklı durumda açıkla.',
      questionIds: ['lf1'],
    },
    {
      name: 'İş ve Enerji',
      icon: '⚡',
      summary: 'İş ve enerji kavramlarını birimleri ve dönüşümleriyle birlikte ele al.',
      goals: ['Joule birimini bil.', 'Enerji türlerini ayır.', 'İş-enerji ilişkisini kur.'],
      practicePrompt: 'Günlük hayattan kinetik ve potansiyel enerjiye birer örnek yaz.',
      questionIds: ['lf2'],
    },
    {
      name: 'Hareket ve Sürat',
      icon: '🏃',
      summary: 'Yol, zaman ve sürat arasındaki oranı kullanarak hareketi nicel olarak yorumla.',
      goals: ['Sürat formülünü kullan.', 'Birim dönüşümü yap.', 'Ortalama sürati yorumla.'],
      practicePrompt: '120 km yolu 2 saatte alan aracın ortalama süratini bul.',
      questionIds: ['lf3'],
    },
  ],
  [key('Lise', 'Kimya')]: [
    {
      name: 'Atom Yapısı',
      icon: '⚛️',
      summary: 'Proton, nötron ve elektronun atom içindeki rollerini ve atom numarasını ilişkilendir.',
      goals: ['Atom numarasını protonla eşleştir.', 'Parçacık yüklerini bil.', 'Çekirdek-elektron ayrımını yap.'],
      practicePrompt: 'Atom numarası 8 olan nötr atomun proton ve elektron sayılarını yaz.',
      questionIds: ['lk1'],
    },
    {
      name: 'Elementler ve Periyodik Tablo',
      icon: '🧪',
      summary: 'Element sembollerini periyodik tablodaki kimlikleriyle eşleştir.',
      goals: ['Sembol-element eşleştir.', 'Grup ve periyot kavramını ayır.', 'Temel elementleri tanı.'],
      practicePrompt: 'Na, O ve Fe sembollerinin element adlarını yaz.',
      questionIds: ['lk2'],
    },
    {
      name: 'Asit, Baz ve pH',
      icon: '🧫',
      summary: 'pH ölçeğini kullanarak asidik, nötr ve bazik ortamları ayırt et.',
      goals: ['7 değerini nötr olarak bil.', '7 altı ve üstünü yorumla.', 'Günlük maddelerle ilişkilendir.'],
      practicePrompt: 'pH 3, 7 ve 10 olan üç çözeltinin türünü yaz.',
      questionIds: ['lk3'],
    },
  ],
  [key('Lise', 'Biyoloji')]: [
    {
      name: 'Protein Sentezi',
      icon: '🧬',
      summary: 'Ribozomun protein sentezindeki görevini temel genetik bilgi akışı içinde konumlandır.',
      goals: ['Ribozom görevini bil.', 'Protein sentezini hücre faaliyetiyle ilişkilendir.', 'Organel görevlerini ayır.'],
      practicePrompt: 'Ribozomun görevini bir cümleyle açıklayıp proteinle ilişkilendir.',
      questionIds: ['lb1'],
    },
    {
      name: 'DNA ve Kalıtım',
      icon: '🧬',
      summary: 'DNA’nın nükleotitlerden oluştuğunu ve kalıtsal bilgiyi taşıdığını öğren.',
      goals: ['Nükleotiti tanı.', 'DNA ile gen ilişkisini kur.', 'Kalıtsal bilgi kavramını açıkla.'],
      practicePrompt: 'DNA, gen ve nükleotit kavramlarını büyükten küçüğe ilişkilendir.',
      questionIds: ['lb2'],
    },
    {
      name: 'Hücresel Solunum',
      icon: '🔋',
      summary: 'Hücresel solunumda enerji üretimini ve mitokondrinin rolünü temel düzeyde açıkla.',
      goals: ['ATP kavramını tanı.', 'Mitokondri görevini bil.', 'Enerji üretimiyle ilişkilendir.'],
      practicePrompt: 'Mitokondrinin neden hücrenin enerji dönüşüm merkezi olarak anıldığını yaz.',
      questionIds: ['lb3'],
    },
  ],
  [key('Lise', 'Edebiyat')]: [
    {
      name: 'Anlatmaya Bağlı Metinler',
      icon: '📚',
      summary: 'Roman, hikâye ve masal gibi türleri olay, kişi, zaman ve mekân üzerinden tanı.',
      goals: ['Tür özelliklerini ayır.', 'Anlatı unsurlarını bul.', 'Metin türünü kanıtla.'],
      practicePrompt: 'Bir hikâyede olay, kişi, zaman ve mekân unsurlarını ayrı ayrı yaz.',
      questionIds: ['le1'],
    },
    {
      name: 'Anlatıcı ve Bakış Açısı',
      icon: '👁️',
      summary: 'Metinde olayları aktaran anlatıcıyı ve bilgi sınırlarını belirle.',
      goals: ['Anlatıcıyı tanı.', 'Bakış açısını ayır.', 'Metinden kanıt göster.'],
      practicePrompt: 'Okuduğun bir metinde anlatıcının kim olduğunu ve ne bildiğini yaz.',
      questionIds: ['le2'],
    },
    {
      name: 'Şiir Bilgisi',
      icon: '✒️',
      summary: 'Şiirde dize, kafiye ve redif gibi temel yapı unsurlarını ayırt et.',
      goals: ['Redifi tanı.', 'Kafiye ile farkını öğren.', 'Dize sonlarını karşılaştır.'],
      practicePrompt: 'İki dize sonu seçip tekrar eden ek veya kelimeleri incele.',
      questionIds: ['le3'],
    },
  ],
  [key('Lise', 'Tarih')]: [
    {
      name: 'Kronoloji',
      icon: '🗓️',
      summary: 'Tarihî olayları zaman sırasına yerleştirerek değişim ve sürekliliği daha görünür hâle getir.',
      goals: ['Olayları sırala.', 'Önce-sonra ilişkisi kur.', 'Dönemleri ayır.'],
      practicePrompt: 'Bildiğin üç tarihî olayı kronolojik sıraya koy.',
      questionIds: ['lt1'],
    },
    {
      name: 'Tarihî Kaynaklar',
      icon: '📜',
      summary: 'Birincil ve ikincil kaynakları üretildikleri zaman ve amaç üzerinden ayırt et.',
      goals: ['Birincil kaynağı tanı.', 'Kaynağın üretim zamanını sorgula.', 'Güvenilirliği değerlendirmeye başla.'],
      practicePrompt: 'Bir mektup ile tarih kitabını kaynak türü açısından karşılaştır.',
      questionIds: ['lt2'],
    },
    {
      name: 'Neden ve Sonuç',
      icon: '🔗',
      summary: 'Tarihî olayların tek nedene indirgenemeyeceğini, kısa ve uzun vadeli etkiler doğurabileceğini düşün.',
      goals: ['Nedenleri sınıflandır.', 'Sonuçları ayır.', 'Uzun vadeli etkiyi fark et.'],
      practicePrompt: 'Bir tarih olayının bir nedeni ve iki farklı sonucunu yaz.',
      questionIds: ['lt3'],
    },
  ],
  [key('Lise', 'İngilizce')]: [
    {
      name: 'Conditionals',
      icon: '🔀',
      summary: 'Gerçek veya olası durumları first conditional gibi temel koşul yapılarıyla ifade et.',
      goals: ['If-clause yapısını tanı.', 'Will + verb kullanımını ayır.', 'Olası sonuç cümlesi kur.'],
      practicePrompt: 'If I have time, ... ile başlayan üç cümle tamamla.',
      questionIds: ['li1'],
    },
    {
      name: 'Bağlaçlar',
      icon: '🔗',
      summary: 'However, therefore ve although gibi bağlaçların fikirler arasındaki ilişkiyi nasıl değiştirdiğini anla.',
      goals: ['Karşıtlık bağlacını tanı.', 'Neden-sonuç bağlacını ayır.', 'İki fikri bağla.'],
      practicePrompt: 'However kullanarak birbiriyle zıt iki cümleyi bağla.',
      questionIds: ['li2'],
    },
    {
      name: 'Academic Vocabulary',
      icon: '🧠',
      summary: 'Sık kullanılan akademik kelimeleri yakın anlamlarıyla birlikte öğren.',
      goals: ['Eş/yakın anlam eşleştir.', 'Kelimeyi bağlamda kullan.', 'Kısa tekrar kartı oluştur.'],
      practicePrompt: 'Essential ve necessary kelimelerini aynı anlamı koruyan iki cümlede kullan.',
      questionIds: ['li3'],
    },
  ],
  [key('ALES', 'Sayısal')]: [
    {
      name: 'Yüzde Problemleri',
      icon: '%',
      summary: 'Yüzdeyi parçanın bütüne oranı olarak modelleyip ters ve doğru orantılı soruları çöz.',
      goals: ['Yüzdeyi ondalığa çevir.', 'Bütünü bilinmeyen denklem kur.', 'Sonucu yaklaşık kontrol et.'],
      practicePrompt: 'Bir sayının %25’i 40 ise sayının tamamını bul.',
      questionIds: ['as1'],
    },
    {
      name: 'İşçi ve Hız Problemleri',
      icon: '⏱️',
      summary: 'İş miktarı, çalışan sayısı ve süre arasındaki ters orantıyı modelle.',
      goals: ['Toplam işi sabit düşün.', 'Ters orantıyı tanı.', 'Birim iş hızını kur.'],
      practicePrompt: '4 kişinin 9 günde bitirdiği işi 6 kişinin kaç günde bitireceğini modelle.',
      questionIds: ['as2'],
    },
    {
      name: 'Diziler ve Örüntüler',
      icon: '🔢',
      summary: 'Terimler arasındaki değişim kuralını bulup sonraki terimi tahmin et.',
      goals: ['Ardışık farkı/oranı incele.', 'Kuralı test et.', 'Sonraki terimi üret.'],
      practicePrompt: '5, 10, 20, 40 dizisinin kuralını ve sonraki iki terimini yaz.',
      questionIds: ['as3'],
    },
  ],
  [key('ALES', 'Sözel')]: [
    {
      name: 'Ana Düşünce',
      icon: '🎯',
      summary: 'Paragrafın tamamını kapsayan temel yargıyı ayrıntılardan ayır.',
      goals: ['Metnin bütününü kapsa.', 'Aşırı dar seçeneği ele.', 'Dış bilgi ekleme.'],
      practicePrompt: 'Okuduğun bir paragrafın ana düşüncesini 15 kelimeden kısa yaz.',
      questionIds: ['av1'],
    },
    {
      name: 'Bağlaç ve İlişki',
      icon: '↔️',
      summary: 'Bağlaçların cümleler arasındaki karşıtlık, neden veya koşul ilişkisini nasıl kurduğunu analiz et.',
      goals: ['Bağlacın yönünü bul.', 'Önceki ve sonraki yargıyı ayır.', 'İlişki türünü adlandır.'],
      practicePrompt: '“Buna karşın” ile iki zıt düşünceyi tek cümlede bağla.',
      questionIds: ['av2'],
    },
    {
      name: 'Çıkarım',
      icon: '🔎',
      summary: 'Metinde doğrudan söylenmeyen ama kanıtlarla desteklenen sonucu çıkar.',
      goals: ['Metindeki kanıtı bul.', 'Tahminle çıkarımı ayır.', 'Seçeneği metne dayandır.'],
      practicePrompt: 'Kısa bir metinden doğrudan yazılmayan tek bir sonucu çıkar ve kanıtını göster.',
      questionIds: ['av3'],
    },
  ],
};

export function getTopicsForCatalogCourse(levelName?: string, courseName?: string): TopicDefinition[] {
  if (!levelName || !courseName) return [];
  return TOPICS[key(levelName, courseName)] ?? [];
}

export function getTopic(levelName?: string, courseName?: string, topicName?: string) {
  if (!topicName) return undefined;
  return getTopicsForCatalogCourse(levelName, courseName).find((topic) => topic.name === topicName);
}

export function getQuestionIdsForTopic(levelName?: string, courseName?: string, topicName?: string) {
  return getTopic(levelName, courseName, topicName)?.questionIds ?? [];
}
