export type LessonSeed = {
  title: string;
  summary: string;
  points: string[];
  practicePrompt: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

const LESSONS_BY_COURSE: Record<string, LessonSeed> = {
  Matematik: {
    title: 'Problem çözme yaklaşımı',
    summary: 'Soruyu küçük adımlara bölmek, verilenleri ve isteneni ayırmak çoğu matematik sorusunu sadeleştirir.',
    points: ['Verilen bilgileri işaretle.', 'İstenen sonucu tek cümleyle yaz.', 'Uygun işlem veya bağıntıyı seç.', 'Sonucu mantık kontrolünden geçir.'],
    practicePrompt: 'Bugün çözdüğün bir soruda verilen, istenen ve kullandığın işlemi üç satırda yaz.',
  },
  Türkçe: {
    title: 'Anlamı bağlamdan çıkarma',
    summary: 'Bir sözcüğün veya cümlenin anlamını değerlendirirken yalnızca tek kelimeye değil, bulunduğu cümlenin bütününe bakılır.',
    points: ['Anahtar sözcükleri bul.', 'Olumlu/olumsuz tonu belirle.', 'Cümlenin önceki ve sonraki kısmıyla bağlantı kur.', 'Seçeneği metindeki kanıtla eşleştir.'],
    practicePrompt: 'Kısa bir paragrafta ana düşünceyi bir cümleyle özetle.',
  },
  'Hayat Bilgisi': {
    title: 'Güvenli ve sağlıklı günlük yaşam',
    summary: 'Sağlıklı alışkanlıklar; düzenli uyku, hijyen, dengeli beslenme ve güvenli davranışlarla birlikte düşünülür.',
    points: ['Ellerini gerektiğinde yıka.', 'Trafik ve ev güvenliği kurallarına uy.', 'Gün içinde su içmeyi unutma.', 'Acil durumda güvenilir bir yetişkinden yardım iste.'],
    practicePrompt: 'Bugün uyguladığın iki sağlıklı alışkanlığı yaz.',
  },
  İngilizce: {
    title: 'Everyday English',
    summary: 'Kısa ve doğru kalıpları sık tekrar etmek, günlük İngilizce konuşma hızını ve özgüveni artırır.',
    points: ['Kısa cümlelerle başla.', 'Her gün 3-5 kelimeyi cümle içinde kullan.', 'Soru kalıplarını sesli tekrar et.', 'Yanlış yapmaktan kaçınmak yerine iletişimi sürdür.'],
    practicePrompt: 'Write three sentences about your day in English.',
  },
  'Fen Bilimleri': {
    title: 'Bilimsel düşünme',
    summary: 'Bilimsel bir soruyu incelerken gözlem, hipotez, deney ve sonuç adımları birbirinden ayrılır.',
    points: ['Soruyu açık tanımla.', 'Değişkenleri ayır.', 'Ölçülebilir veri topla.', 'Sonucun hipotezi destekleyip desteklemediğini kontrol et.'],
    practicePrompt: 'Günlük hayattan gözlemleyebileceğin bir olay için basit bir hipotez kur.',
  },
  'Sosyal Bilgiler': {
    title: 'Toplum, çevre ve neden-sonuç',
    summary: 'Sosyal olayları değerlendirirken yer, zaman, insanlar ve olayların birbirini nasıl etkilediği birlikte ele alınır.',
    points: ['Olayın nerede ve ne zaman olduğunu belirle.', 'Kimlerin etkilendiğini düşün.', 'Neden ve sonuçları ayır.', 'Farklı bakış açılarını karşılaştır.'],
    practicePrompt: 'Yaşadığın çevredeki bir değişimin iki nedenini ve iki sonucunu yaz.',
  },
  Fizik: {
    title: 'Kuvvet ve hareket',
    summary: 'Hareket problemlerinde yön, büyüklük, birim ve referans noktası doğru kurulmadan formül seçmek hataya yol açar.',
    points: ['Verilen büyüklüklerin birimlerini yaz.', 'Yön bilgisini belirle.', 'Bilinen ve bilinmeyenleri ayır.', 'Sonucun fiziksel olarak anlamlı olup olmadığını kontrol et.'],
    practicePrompt: 'Bir hareket sorusunda hız ile sürat arasındaki farkı kendi cümlenle açıkla.',
  },
  Kimya: {
    title: 'Atom ve periyodik düşünme',
    summary: 'Elementlerin özellikleri atom yapısıyla ilişkilidir; periyodik tablo bu benzerlik ve değişimleri düzenli biçimde gösterir.',
    points: ['Atom numarasının proton sayısını verdiğini hatırla.', 'Periyot ve grup bilgisini ayır.', 'Metaller ve ametallerin genel özelliklerini karşılaştır.', 'Kimyasal sembolleri doğru kullan.'],
    practicePrompt: 'Bir element seç ve atom numarası, sembolü ve grubunu not et.',
  },
  Biyoloji: {
    title: 'Hücreyi sistem olarak düşünmek',
    summary: 'Hücre organelleri birbirinden bağımsız değil, ortak yaşam faaliyetlerini sürdüren bir sistemin parçalarıdır.',
    points: ['Organelleri görevleriyle eşleştir.', 'Bitki ve hayvan hücresi farklarını ayır.', 'Madde ve enerji akışını düşün.', 'Yapı ile görev arasındaki ilişkiyi kur.'],
    practicePrompt: 'Mitokondri ve ribozomun görevlerini birer cümleyle karşılaştır.',
  },
  Edebiyat: {
    title: 'Metni dönem ve tür içinde okuma',
    summary: 'Bir edebî metin, yalnızca konusu ile değil; türü, dili, anlatıcısı ve yazıldığı dönemin özellikleriyle birlikte değerlendirilir.',
    points: ['Metnin türünü belirle.', 'Anlatıcı ve bakış açısını incele.', 'Dil ve üslup özelliklerini not et.', 'Dönem özellikleriyle bağlantı kur.'],
    practicePrompt: 'Okuduğun bir metnin türünü ve bunu gösteren iki özelliği yaz.',
  },
  Tarih: {
    title: 'Kronoloji ve neden-sonuç',
    summary: 'Tarih çalışırken olayları ezberlemek yerine kronoloji, nedenler, sonuçlar ve değişim-süreklilik ilişkisi kurmak daha kalıcıdır.',
    points: ['Olayları zaman sırasına koy.', 'Kısa ve uzun vadeli nedenleri ayır.', 'Sonuçların kimleri etkilediğini belirle.', 'Birincil ve ikincil kaynak ayrımını bil.'],
    practicePrompt: 'Bir tarih olayını seç ve bir neden, bir sonuç, bir de uzun vadeli etkisini yaz.',
  },
  Sayısal: {
    title: 'Sayısal akıl yürütme',
    summary: 'ALES sayısal sorularında işlem hızından önce problemdeki ilişkileri doğru modellemek önemlidir.',
    points: ['Verileri sadeleştir.', 'Oran ve değişimleri tabloya dök.', 'Gereksiz bilgiyi ayır.', 'Sonucu yaklaşık değerle kontrol et.'],
    practicePrompt: 'Bir oran problemini denklem kurmadan önce sözel olarak modelle.',
  },
  Sözel: {
    title: 'Paragraf akıl yürütme',
    summary: 'ALES sözel sorularında doğru seçenek, metnin söylediğini en iyi karşılayan seçenektir; dış bilgi eklenmez.',
    points: ['Ana düşünceyi belirle.', 'Bağlaçların yön değiştiren etkisine dikkat et.', 'Aşırı genelleme yapan seçenekleri ele.', 'Cevabı metindeki ifadeyle kanıtla.'],
    practicePrompt: 'Bir paragraf okuyup ana düşüncesini en fazla 15 kelimeyle yaz.',
  },
};

const key = (level: string, course: string) => `${level}::${course}`;

const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  [key('İlkokul', 'Matematik')]: [
    { id: 'im1', question: '27 + 15 işleminin sonucu kaçtır?', options: ['32', '42', '52', '41'], correctAnswer: '42', explanation: '27 + 10 = 37, 37 + 5 = 42.' },
    { id: 'im2', question: 'Bir düzinenin yarısı kaçtır?', options: ['4', '5', '6', '8'], correctAnswer: '6', explanation: 'Bir düzine 12’dir; 12’nin yarısı 6’dır.' },
    { id: 'im3', question: 'Aşağıdakilerden hangisi 3 × 4 ile aynıdır?', options: ['3 + 4', '4 + 4 + 4', '3 + 3', '4 + 3 + 2'], correctAnswer: '4 + 4 + 4', explanation: '3 × 4, üç tane 4’ün toplamıdır.' },
  ],
  [key('İlkokul', 'Türkçe')]: [
    { id: 'it1', question: '“Hızlı” kelimesinin zıt anlamlısı hangisidir?', options: ['Yavaş', 'Çabuk', 'Erken', 'Yakın'], correctAnswer: 'Yavaş', explanation: 'Hızlı ve yavaş zıt anlamlıdır.' },
    { id: 'it2', question: 'Aşağıdakilerden hangisi bir özel addır?', options: ['şehir', 'kitap', 'Ankara', 'masa'], correctAnswer: 'Ankara', explanation: 'Ankara belirli bir şehir adıdır ve özel addır.' },
    { id: 'it3', question: '“Ali top oynadı.” cümlesinde işi yapan kimdir?', options: ['Ali', 'top', 'oynadı', 'kimse'], correctAnswer: 'Ali', explanation: 'Cümlede eylemi yapan kişi Ali’dir.' },
  ],
  [key('İlkokul', 'Hayat Bilgisi')]: [
    { id: 'ih1', question: 'Karşıdan karşıya geçerken en güvenli yer hangisidir?', options: ['Yaya geçidi', 'Viraj', 'Park etmiş araçların arası', 'Yolun herhangi bir yeri'], correctAnswer: 'Yaya geçidi', explanation: 'Yaya geçidi, yayaların güvenli geçişi için ayrılmıştır.' },
    { id: 'ih2', question: 'Ellerimizi ne zaman yıkamak doğrudur?', options: ['Sadece sabah', 'Yemekten önce ve sonra', 'Haftada bir', 'Sadece okulda'], correctAnswer: 'Yemekten önce ve sonra', explanation: 'El hijyeni mikropların yayılmasını azaltır.' },
    { id: 'ih3', question: 'Acil bir durumda ilk olarak ne yapmalıyız?', options: ['Gizlenmek', 'Güvenilir bir yetişkinden yardım istemek', 'Koşarak uzaklaşmak', 'Hiçbir şey yapmamak'], correctAnswer: 'Güvenilir bir yetişkinden yardım istemek', explanation: 'Güvenli yardım istemek doğru ilk adımdır.' },
  ],
  [key('İlkokul', 'İngilizce')]: [
    { id: 'ii1', question: '“Elma” kelimesinin İngilizcesi hangisidir?', options: ['Apple', 'Table', 'Water', 'School'], correctAnswer: 'Apple', explanation: 'Apple, “elma” demektir.' },
    { id: 'ii2', question: '“How are you?” sorusuna uygun cevap hangisidir?', options: ['I am fine, thanks.', 'Blue.', 'At school.', 'Five.'], correctAnswer: 'I am fine, thanks.', explanation: 'Bu kalıp “Nasılsın?” sorusuna verilen temel yanıtlardan biridir.' },
    { id: 'ii3', question: '“Book” kelimesinin Türkçesi hangisidir?', options: ['Kalem', 'Kitap', 'Defter', 'Çanta'], correctAnswer: 'Kitap', explanation: 'Book, “kitap” demektir.' },
  ],
  [key('Ortaokul', 'Matematik')]: [
    { id: 'om1', question: '3x + 5 = 20 ise x kaçtır?', options: ['3', '5', '10', '15'], correctAnswer: '5', explanation: '3x = 15 olduğundan x = 5.' },
    { id: 'om2', question: '0,25 sayısının kesir karşılığı hangisidir?', options: ['1/2', '1/4', '2/5', '3/4'], correctAnswer: '1/4', explanation: '0,25 = 25/100 = 1/4.' },
    { id: 'om3', question: 'Bir üçgenin iç açılar toplamı kaç derecedir?', options: ['90', '180', '270', '360'], correctAnswer: '180', explanation: 'Öklid geometrisinde üçgenin iç açıları toplamı 180°’dir.' },
  ],
  [key('Ortaokul', 'Türkçe')]: [
    { id: 'ot1', question: '“Kitapları masaya bıraktım.” cümlesinde yüklem hangisidir?', options: ['Kitapları', 'masaya', 'bıraktım', 'masa'], correctAnswer: 'bıraktım', explanation: 'Cümlenin yargısını bildiren sözcük “bıraktım”dır.' },
    { id: 'ot2', question: 'Aşağıdakilerden hangisi karşılaştırma bildirir?', options: ['Bu kitap diğerinden daha sürükleyici.', 'Bugün yağmur yağdı.', 'Kapıyı kapattı.', 'Yarın geleceğim.'], correctAnswer: 'Bu kitap diğerinden daha sürükleyici.', explanation: '“Daha” ifadesi iki kitap arasında karşılaştırma kurar.' },
    { id: 'ot3', question: 'Bir paragrafta ana düşünce nedir?', options: ['Metnin temel mesajı', 'En uzun cümle', 'İlk kelime', 'Yazarın adı'], correctAnswer: 'Metnin temel mesajı', explanation: 'Ana düşünce paragrafın okuyucuya vermek istediği temel yargıdır.' },
  ],
  [key('Ortaokul', 'Fen Bilimleri')]: [
    { id: 'of1', question: 'Saf su deniz seviyesinde yaklaşık kaç °C’de kaynar?', options: ['0', '50', '100', '150'], correctAnswer: '100', explanation: 'Standart atmosfer basıncında saf su yaklaşık 100 °C’de kaynar.' },
    { id: 'of2', question: 'Fotosentez için bitkilerin kullandığı gaz hangisidir?', options: ['Oksijen', 'Karbondioksit', 'Azot', 'Helyum'], correctAnswer: 'Karbondioksit', explanation: 'Bitkiler fotosentez sırasında karbondioksit kullanır ve oksijen açığa çıkarır.' },
    { id: 'of3', question: 'Kuvvetin SI birimi hangisidir?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 'Newton', explanation: 'Kuvvetin SI birimi newtondur (N).' },
  ],
  [key('Ortaokul', 'Sosyal Bilgiler')]: [
    { id: 'os1', question: 'Türkiye’nin başkenti hangisidir?', options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'], correctAnswer: 'Ankara', explanation: 'Türkiye Cumhuriyeti’nin başkenti Ankara’dır.' },
    { id: 'os2', question: 'Haritalarda yön bulmada temel olarak hangi yön üst tarafta gösterilir?', options: ['Kuzey', 'Güney', 'Doğu', 'Batı'], correctAnswer: 'Kuzey', explanation: 'Standart haritalarda üst taraf kuzeyi gösterir.' },
    { id: 'os3', question: 'Demokratik toplumlarda seçimlerin temel amacı nedir?', options: ['Temsilcileri belirlemek', 'Vergileri kaldırmak', 'Okulları kapatmak', 'Saatleri değiştirmek'], correctAnswer: 'Temsilcileri belirlemek', explanation: 'Seçimler yurttaşların temsilcilerini belirlemesinin temel araçlarından biridir.' },
  ],
  [key('Ortaokul', 'İngilizce')]: [
    { id: 'oi1', question: 'Choose the correct sentence.', options: ['She goes to school every day.', 'She go to school every day.', 'She going school every day.', 'She gone to school every day.'], correctAnswer: 'She goes to school every day.', explanation: 'Simple present üçüncü tekil kişide fiile -s gelir.' },
    { id: 'oi2', question: '“Usually” ne anlama gelir?', options: ['Asla', 'Genellikle', 'Şimdi', 'Dün'], correctAnswer: 'Genellikle', explanation: 'Usually, sıklık bildiren “genellikle” anlamındadır.' },
    { id: 'oi3', question: 'Which one is a question?', options: ['Where do you live?', 'I live in Ankara.', 'Open the door.', 'What a nice day!'], correctAnswer: 'Where do you live?', explanation: '“Where do you live?” yer bilgisi soran bir soru cümlesidir.' },
  ],
  [key('Lise', 'Matematik')]: [
    { id: 'lm1', question: 'x² - 5x + 6 = 0 denkleminin kökleri hangileridir?', options: ['2 ve 3', '1 ve 6', '-2 ve -3', '0 ve 5'], correctAnswer: '2 ve 3', explanation: '(x-2)(x-3)=0 olduğundan kökler 2 ve 3’tür.' },
    { id: 'lm2', question: 'f(x)=2x+1 ise f(3) kaçtır?', options: ['5', '6', '7', '8'], correctAnswer: '7', explanation: 'f(3)=2·3+1=7.' },
    { id: 'lm3', question: 'log₁₀(1000) kaçtır?', options: ['2', '3', '10', '100'], correctAnswer: '3', explanation: '10³=1000 olduğu için log₁₀(1000)=3.' },
  ],
  [key('Lise', 'Fizik')]: [
    { id: 'lf1', question: 'Net kuvvet sıfırsa cismin ivmesi ne olur?', options: ['Sıfır', 'Artar', 'Azalır', 'Her zaman 9,8 m/s²'], correctAnswer: 'Sıfır', explanation: 'Newton’un ikinci yasasına göre Fnet = m·a; Fnet=0 ise a=0.' },
    { id: 'lf2', question: 'Enerjinin SI birimi hangisidir?', options: ['Newton', 'Joule', 'Watt', 'Volt'], correctAnswer: 'Joule', explanation: 'Enerji ve işin SI birimi jouledür (J).' },
    { id: 'lf3', question: 'Sürat hangi iki büyüklüğün oranıdır?', options: ['Yol / zaman', 'Kuvvet / alan', 'Kütle / hacim', 'Enerji / zaman'], correctAnswer: 'Yol / zaman', explanation: 'Ortalama sürat toplam yolun toplam zamana oranıdır.' },
  ],
  [key('Lise', 'Kimya')]: [
    { id: 'lk1', question: 'Atom numarası hangi parçacık sayısına eşittir?', options: ['Proton', 'Nötron', 'Elektron + nötron', 'Kütle numarası'], correctAnswer: 'Proton', explanation: 'Atom numarası çekirdekteki proton sayısını verir.' },
    { id: 'lk2', question: 'Na hangi elementin sembolüdür?', options: ['Sodyum', 'Azot', 'Neon', 'Nikel'], correctAnswer: 'Sodyum', explanation: 'Na, sodyumun kimyasal sembolüdür.' },
    { id: 'lk3', question: 'pH değeri 7 olan saf su hangi özelliktedir?', options: ['Nötr', 'Asidik', 'Bazik', 'Tuzlu'], correctAnswer: 'Nötr', explanation: '25 °C civarında saf suyun pH değeri yaklaşık 7’dir ve nötr kabul edilir.' },
  ],
  [key('Lise', 'Biyoloji')]: [
    { id: 'lb1', question: 'Protein sentezinde doğrudan görev alan organel hangisidir?', options: ['Ribozom', 'Lizozom', 'Koful', 'Sentrozom'], correctAnswer: 'Ribozom', explanation: 'Ribozomlar mRNA bilgisini kullanarak protein sentezler.' },
    { id: 'lb2', question: 'DNA’nın yapı birimi hangisidir?', options: ['Nükleotit', 'Amino asit', 'Yağ asidi', 'Glikoz'], correctAnswer: 'Nükleotit', explanation: 'DNA, nükleotit adı verilen birimlerden oluşur.' },
    { id: 'lb3', question: 'Hücresel solunumda ATP üretiminde önemli organel hangisidir?', options: ['Mitokondri', 'Golgi aygıtı', 'Çekirdekçik', 'Lizozom'], correctAnswer: 'Mitokondri', explanation: 'Ökaryot hücrelerde aerobik solunumun önemli basamakları mitokondride gerçekleşir.' },
  ],
  [key('Lise', 'Edebiyat')]: [
    { id: 'le1', question: 'Roman, hikâye ve masal hangi temel grupta değerlendirilir?', options: ['Anlatmaya bağlı metinler', 'Öğretici bilimsel metinler', 'Resmî yazılar', 'Sadece şiir'], correctAnswer: 'Anlatmaya bağlı metinler', explanation: 'Bu türlerde olay, kişi, zaman ve mekân gibi anlatı unsurları bulunur.' },
    { id: 'le2', question: 'Bir metinde olayları aktaran ses veya kişi hangi kavramla ifade edilir?', options: ['Anlatıcı', 'Kafiye', 'Ölçü', 'Başlık'], correctAnswer: 'Anlatıcı', explanation: 'Anlatıcı, olayları okuyucuya aktaran kurmaca sestir.' },
    { id: 'le3', question: 'Şiirde aynı görev ve anlamdaki ek ya da sözcük tekrarına ne denir?', options: ['Redif', 'Tema', 'Mecaz', 'Dize'], correctAnswer: 'Redif', explanation: 'Dize sonlarında aynı görev ve anlamdaki ek veya kelime tekrarına redif denir.' },
  ],
  [key('Lise', 'Tarih')]: [
    { id: 'lt1', question: 'Tarihî olayları zaman sırasına koymaya ne ad verilir?', options: ['Kronoloji', 'Coğrafya', 'Arkeometri', 'Etnografya'], correctAnswer: 'Kronoloji', explanation: 'Kronoloji olayların oluş sırasını ve tarihlerini düzenler.' },
    { id: 'lt2', question: 'Bir olayı yaşandığı dönemde üretilmiş belge hangi tür kaynaktır?', options: ['Birincil kaynak', 'İkincil kaynak', 'Kurgu', 'Sözlük'], correctAnswer: 'Birincil kaynak', explanation: 'Döneme ait mektup, kayıt, fotoğraf gibi belgeler birincil kaynaktır.' },
    { id: 'lt3', question: 'Tarih çalışmasında neden-sonuç ilişkisi kurmanın amacı nedir?', options: ['Olayları açıklamak', 'Sadece tarih ezberlemek', 'Harita çizmek', 'Sayıları yuvarlamak'], correctAnswer: 'Olayları açıklamak', explanation: 'Neden-sonuç ilişkisi olayların nasıl ve niçin geliştiğini anlamaya yardımcı olur.' },
  ],
  [key('Lise', 'İngilizce')]: [
    { id: 'li1', question: 'Choose the grammatically correct sentence.', options: ['If I have time, I will call you.', 'If I will have time, I call you.', 'If I had time, I will call you.', 'If I have time, I called you.'], correctAnswer: 'If I have time, I will call you.', explanation: 'First conditional yapısında if-clause simple present, ana cümle will + fiil alır.' },
    { id: 'li2', question: '“However” bağlacı çoğunlukla hangi ilişkiyi kurar?', options: ['Karşıtlık', 'Neden', 'Amaç', 'Sıralama'], correctAnswer: 'Karşıtlık', explanation: 'However, iki fikir arasında karşıtlık veya beklenmedik dönüş belirtir.' },
    { id: 'li3', question: 'Which word is closest in meaning to “essential”?', options: ['Necessary', 'Optional', 'Rare', 'Temporary'], correctAnswer: 'Necessary', explanation: 'Essential ve necessary “gerekli/zorunlu” anlam alanında yakındır.' },
  ],
  [key('ALES', 'Sayısal')]: [
    { id: 'as1', question: 'Bir sayının %20’si 30 ise sayının tamamı kaçtır?', options: ['120', '150', '180', '200'], correctAnswer: '150', explanation: '0,20 × x = 30 ise x = 150.' },
    { id: 'as2', question: '3 kişi bir işi 12 günde bitiriyorsa, aynı hızla çalışan 6 kişi kaç günde bitirir?', options: ['3', '6', '12', '24'], correctAnswer: '6', explanation: 'Kişi sayısı iki katına çıkınca süre yarıya iner: 12/2=6.' },
    { id: 'as3', question: '2, 6, 18, 54, ... dizisinin sonraki terimi nedir?', options: ['72', '108', '162', '216'], correctAnswer: '162', explanation: 'Her terim bir öncekinin 3 katıdır; 54×3=162.' },
  ],
  [key('ALES', 'Sözel')]: [
    { id: 'av1', question: 'Bir paragraf sorusunda ana düşünceyi bulurken en önemli ölçüt hangisidir?', options: ['Metnin bütününü kapsaması', 'En uzun seçenek olması', 'İlk cümleyi aynen tekrar etmesi', 'Dış bilgi içermesi'], correctAnswer: 'Metnin bütününü kapsaması', explanation: 'Ana düşünce paragrafın tamamındaki temel yargıyı kapsar.' },
    { id: 'av2', question: '“Buna karşın” sözü cümleler arasında çoğunlukla hangi ilişkiyi kurar?', options: ['Karşıtlık', 'Örnekleme', 'Neden', 'Koşul'], correctAnswer: 'Karşıtlık', explanation: '“Buna karşın” önceki yargıyla zıtlık kurar.' },
    { id: 'av3', question: 'Bir çıkarım sorusunda doğru seçenek neye dayanmalıdır?', options: ['Metindeki kanıtlara', 'Kişisel görüşe', 'Genel kültüre', 'Tahmine'], correctAnswer: 'Metindeki kanıtlara', explanation: 'Çıkarım metinde açıkça yazmasa da metindeki bilgilerden mantıksal olarak desteklenmelidir.' },
  ],
};

export const ENGLISH_SCENARIOS = [
  {
    id: 'daily',
    title: '👋 Günlük Tanışma',
    opening: 'Hi! Nice to meet you. What is your name?',
    prompts: ['Where are you from?', 'What do you like doing after school?', 'What is your favorite food?', 'Tell me one thing about your day.'],
    phrases: ['My name is ...', 'I am from ...', 'I like ...', 'My favorite ... is ...'],
  },
  {
    id: 'restaurant',
    title: '🍽️ Restoran',
    opening: 'Hello! Welcome. What would you like to drink?',
    prompts: ['Would you like to order now?', 'What would you like to eat?', 'Would you like anything else?', 'How was your meal?'],
    phrases: ['I would like ...', 'Can I have ...?', 'That is all, thank you.', 'It was delicious.'],
  },
  {
    id: 'shopping',
    title: '🛍️ Alışveriş',
    opening: 'Hello! Can I help you find something?',
    prompts: ['What are you looking for?', 'What size do you need?', 'Would you like to try it on?', 'Do you like this one?'],
    phrases: ['I am looking for ...', 'I need size ...', 'Can I try this on?', 'How much is it?'],
  },
  {
    id: 'travel',
    title: '✈️ Seyahat',
    opening: 'Hi! Where are you traveling today?',
    prompts: ['Do you have your ticket?', 'How many bags do you have?', 'What time is your flight?', 'Are you excited about your trip?'],
    phrases: ['I am traveling to ...', 'Here is my ticket.', 'I have one bag.', 'My flight is at ...'],
  },
];

export function getLessonSeed(courseName?: string): LessonSeed | undefined {
  return courseName ? LESSONS_BY_COURSE[courseName] : undefined;
}

export function getQuizQuestions(levelName?: string, courseName?: string): QuizQuestion[] {
  if (!levelName || !courseName) return [];
  return QUESTION_BANK[key(levelName, courseName)] ?? [];
}
