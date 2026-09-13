import type { EmbeddedQuestionSeed } from '@/data/embeddedQuestionPackV10';

type Fact = {
  prompt: string;
  correct: string;
  wrong: [string, string, string];
  explanation: string;
};

function build(courseName: string, prefix: string, facts: Fact[]): EmbeddedQuestionSeed[] {
  return facts.map((fact, index) => ({
    id: `v106-${prefix}-${index + 1}`,
    levelName: 'Lise',
    courseName,
    topicIndex: index % 3,
    prompt: fact.prompt,
    options: [fact.correct, ...fact.wrong],
    correctAnswer: fact.correct,
    explanation: fact.explanation,
    difficulty: index >= 7 ? 'hard' : 'standard',
    questionKind: 'multiple-choice',
  }));
}

const physics: Fact[] = [
  { prompt: 'Net kuvvet sıfırsa cismin ivmesi nedir?', correct: 'Sıfırdır', wrong: ['Kesinlikle artar', 'Kesinlikle azalır', 'Hızla aynıdır'], explanation: 'F_net = m·a olduğundan net kuvvet sıfırsa ivme sıfırdır.' },
  { prompt: 'Newton’un ikinci yasası hangisidir?', correct: 'F = m·a', wrong: ['P = F/A', 'v = x·t', 'E = m·g'], explanation: 'Net kuvvet, kütle ve ivme F = m·a bağıntısıyla ilişkilidir.' },
  { prompt: 'Kinetik enerji hangi iki büyüklüğe bağlıdır?', correct: 'Kütle ve hız', wrong: ['Basınç ve sıcaklık', 'Hacim ve yoğunluk', 'Akım ve gerilim'], explanation: 'E_k = 1/2·m·v² bağıntısı kütle ve hıza bağlıdır.' },
  { prompt: 'Yerçekimi potansiyel enerjisi ne zaman artar?', correct: 'Yükseklik arttığında', wrong: ['Yükseklik azaldığında her zaman', 'Kütle sıfır olduğunda', 'Zaman geçtiğinde'], explanation: 'Yakın Dünya yüzeyinde E_p = m·g·h olduğundan yükseklik arttıkça artar.' },
  { prompt: 'Ortalama sürat nasıl hesaplanır?', correct: 'Toplam yol / toplam zaman', wrong: ['Toplam zaman / toplam yol', 'Kütle / hacim', 'Kuvvet / alan'], explanation: 'Ortalama sürat toplam yolun toplam zamana oranıdır.' },
  { prompt: 'Gücün fiziksel tanımı hangisidir?', correct: 'Birim zamanda yapılan iş', wrong: ['Birim hacimdeki kütle', 'Toplam yol', 'Kuvvetin alanla çarpımı'], explanation: 'Güç P = W/t bağıntısıyla işin yapılma hızını ifade eder.' },
  { prompt: 'Basıncın SI birimi hangisidir?', correct: 'Pascal', wrong: ['Joule', 'Newton', 'Watt'], explanation: 'Basıncın SI birimi pascaldır.' },
  { prompt: 'Yoğunluk hangi bağıntıyla hesaplanır?', correct: 'Kütle / hacim', wrong: ['Hacim / kütle', 'Kuvvet / alan', 'Yol / zaman'], explanation: 'Yoğunluk d = m/V bağıntısıyla hesaplanır.' },
  { prompt: 'Sabit hızlı doğrusal harekette ivme nedir?', correct: 'Sıfırdır', wrong: ['Daima pozitiftir', 'Daima negatiftir', 'Hıza eşittir'], explanation: 'Hız vektörü değişmiyorsa ivme sıfırdır.' },
  { prompt: 'Mekanik iş için gerekli koşul hangisidir?', correct: 'Kuvvet doğrultusunda yer değiştirme bileşeni olması', wrong: ['Yer değiştirme olmaması', 'Kütlenin değişmesi', 'Zamanın sıfır olması'], explanation: 'İş, kuvvetin yer değiştirme doğrultusundaki bileşeniyle ilişkilidir.' },
];

const chemistry: Fact[] = [
  { prompt: 'Atom numarası hangi parçacık sayısına eşittir?', correct: 'Proton', wrong: ['Nötron', 'Foton', 'Molekül'], explanation: 'Atom numarası çekirdekteki proton sayısıdır.' },
  { prompt: 'Nötr atomda proton ve elektron sayıları nasıldır?', correct: 'Eşittir', wrong: ['Proton daha fazladır', 'Elektron daha fazladır', 'İlişkisizdir'], explanation: 'Nötr atomda toplam pozitif ve negatif yük dengededir.' },
  { prompt: 'pH değeri 7’den küçük çözelti genel olarak nasıldır?', correct: 'Asidik', wrong: ['Bazik', 'Nötr', 'Metal'], explanation: 'Yaklaşık oda sıcaklığında pH 7 altı asidik kabul edilir.' },
  { prompt: 'pH değeri 7 olan saf su genel olarak nasıldır?', correct: 'Nötr', wrong: ['Asidik', 'Bazik', 'Metal'], explanation: 'Saf su yaklaşık pH 7 ile nötrdür.' },
  { prompt: 'Kimyasal tepkimelerde toplam kütlenin korunmasına ne denir?', correct: 'Kütlenin korunumu yasası', wrong: ['Ohm yasası', 'Hooke yasası', 'Boyle yasası'], explanation: 'Kapalı sistemde tepkime öncesi ve sonrası toplam kütle korunur.' },
  { prompt: 'Bir elementin kimyasal özelliklerini taşıyan temel birim nedir?', correct: 'Atom', wrong: ['Hücre', 'Doku', 'Karışım'], explanation: 'Elementlerin temel kimyasal birimi atomdur.' },
  { prompt: 'NaCl bileşiğinin yaygın adı nedir?', correct: 'Sofra tuzu', wrong: ['Karbon dioksit', 'Amonyak', 'Kireç taşı'], explanation: 'Sodyum klorür günlük hayatta sofra tuzudur.' },
  { prompt: 'O₂ maddesi nasıl sınıflandırılır?', correct: 'Element molekülü', wrong: ['Bileşik', 'Karışım', 'İyonik kristal'], explanation: 'O₂ yalnız oksijen atomlarından oluşur.' },
  { prompt: 'Aynı gruptaki elementler genellikle hangi açıdan benzerlik gösterir?', correct: 'Kimyasal özellikler', wrong: ['Atom numarası', 'Kütle numarası', 'Her zaman fiziksel hâl'], explanation: 'Benzer değerlik elektron düzenleri benzer kimyasal özelliklere yol açabilir.' },
  { prompt: 'Çözücü artarken çözünen sabit kalırsa derişim genellikle ne olur?', correct: 'Azalır', wrong: ['Artar', 'Değişmez', 'Sıfırlanır'], explanation: 'Aynı çözünen daha fazla çözücü içinde dağıldığında derişim azalır.' },
];

const biology: Fact[] = [
  { prompt: 'Protein sentezinin temel hücresel yapısı hangisidir?', correct: 'Ribozom', wrong: ['Lizozom', 'Koful', 'Sentrozom'], explanation: 'Protein sentezi ribozomlarda gerçekleşir.' },
  { prompt: 'Ökaryot hücrelerde hücresel solunumun büyük bölümü nerede gerçekleşir?', correct: 'Mitokondri', wrong: ['Ribozom', 'Golgi aygıtı', 'Lizozom'], explanation: 'ATP üretiminin büyük bölümü mitokondride gerçekleşir.' },
  { prompt: 'DNA’nın temel yapı birimi nedir?', correct: 'Nükleotit', wrong: ['Amino asit', 'Monosakkarit', 'Yağ asidi'], explanation: 'DNA nükleotitlerden oluşur.' },
  { prompt: 'Gen en iyi nasıl tanımlanır?', correct: 'DNA üzerindeki işlevsel kalıtsal bilgi bölgesi', wrong: ['Hücrenin tamamı', 'Bir organel', 'Yalnız bir protein'], explanation: 'Gen belirli bir ürün veya işlevle ilişkili DNA bölgesidir.' },
  { prompt: 'Fotosentezde temel ışık yakalayıcı pigment hangisidir?', correct: 'Klorofil', wrong: ['Hemoglobin', 'Melanin', 'Keratin'], explanation: 'Klorofil ışık enerjisinin soğurulmasında temel pigmenttir.' },
  { prompt: 'Mitoz bölünmenin temel sonucu nedir?', correct: 'İki yavru hücre oluşması', wrong: ['Dört haploid hücre oluşması', 'DNA’nın yok olması', 'Kromozomların tamamen kaybolması'], explanation: 'Mitoz sonunda iki yavru hücre oluşur.' },
  { prompt: 'Mayozun temel önemi nedir?', correct: 'Gametlerde kromozom sayısını yarıya indirmesi', wrong: ['Tüm hücreleri diploid yapması', 'Protein sentezini durdurması', 'Solunumu bitirmesi'], explanation: 'Mayoz gamet oluşumunda kromozom sayısını yarıya indirir ve çeşitliliğe katkı sağlar.' },
  { prompt: 'Enzimlerin temel görevi nedir?', correct: 'Biyokimyasal tepkimeleri hızlandırmak', wrong: ['Kromozom sayısını artırmak', 'Enerjiyi yok etmek', 'Her tepkimede tamamen tüketilmek'], explanation: 'Enzimler biyolojik katalizörlerdir.' },
  { prompt: 'Ekosistemde üreticilerin temel özelliği nedir?', correct: 'Organik besin üretebilmeleri', wrong: ['Yalnız etçil olmaları', 'Enerji kullanmamaları', 'Tümünün hareketli olması'], explanation: 'Üreticiler inorganik maddelerden organik madde oluşturabilir.' },
  { prompt: 'Homeostazi neyi ifade eder?', correct: 'İç dengenin belirli sınırlar içinde korunmasını', wrong: ['Kalıtsal bilginin yok edilmesini', 'Büyümenin durmasını', 'Tüm hücrelerin aynı işi yapmasını'], explanation: 'Homeostazi iç ortamın dengede tutulmasıdır.' },
];

const literature: Fact[] = [
  { prompt: 'Roman ve hikâyede olayları aktaran kişi ya da sese ne denir?', correct: 'Anlatıcı', wrong: ['Redif', 'Kafiye', 'Ölçü'], explanation: 'Olayları okura aktaran ses anlatıcıdır.' },
  { prompt: 'Birinci tekil kişiyle, olayın içinden yapılan anlatım hangi anlatıcıya örnektir?', correct: 'Kahraman anlatıcı', wrong: ['İlahi anlatıcı zorunlu', 'Gözlemci anlatıcı zorunlu', 'Redif'], explanation: 'Olayın içindeki kişinin ben diliyle anlatması kahraman anlatıcıya örnek olabilir.' },
  { prompt: 'Dize sonlarında görev ve anlamı aynı ek veya kelime tekrarına ne denir?', correct: 'Redif', wrong: ['Kafiye', 'Tema', 'Anlatıcı'], explanation: 'Aynı görev ve anlamdaki tekrarlar rediftir.' },
  { prompt: 'Şiirde ses benzerliğine dayalı uyuma ne denir?', correct: 'Kafiye', wrong: ['Redif', 'Olay örgüsü', 'Mekân'], explanation: 'Dize sonlarındaki ses benzerliği kafiye oluşturur.' },
  { prompt: 'Anlatıda olayların gerçekleştiği çevreye ne denir?', correct: 'Mekân', wrong: ['Tema', 'Kafiye', 'Ölçü'], explanation: 'Olayların geçtiği yer veya çevre mekândır.' },
  { prompt: 'Metnin temel duygu veya düşünce eksenine ne denir?', correct: 'Tema', wrong: ['Mekân', 'Anlatıcı', 'Redif'], explanation: 'Tema eserin temel duygu veya düşünce eksenidir.' },
  { prompt: 'Olayların neden-sonuç ilişkisi içinde sıralanmış bütününe ne denir?', correct: 'Olay örgüsü', wrong: ['Kafiye', 'Redif', 'Ölçü'], explanation: 'Birbirine bağlı olayların düzeni olay örgüsüdür.' },
  { prompt: 'Masalın ayırt edici özelliklerinden biri hangisidir?', correct: 'Olağanüstü unsurlara yer verebilmesi', wrong: ['Yalnız bilimsel gerçekleri anlatması', 'Her zaman gerçek kişileri işlemesi', 'Kaynakça zorunluluğu'], explanation: 'Masallar olağanüstü kişi ve olaylara yer verebilir.' },
  { prompt: 'Romanın hikâyeye göre genel özelliklerinden biri hangisidir?', correct: 'Daha geniş kişi, zaman ve olay örgüsüne sahip olabilmesi', wrong: ['Hikâyede olay bulunmaması', 'Romanın mutlaka şiir olması', 'Hikâyede anlatıcı olmaması'], explanation: 'Roman genellikle hikâyeye göre daha geniş ve ayrıntılı bir anlatı yapısına sahiptir.' },
  { prompt: 'Kişilerin iç dünyasını da bilen anlatıcı bakış açısı hangisidir?', correct: 'İlahi (hâkim) bakış açısı', wrong: ['Kahraman anlatıcı', 'Yalnız gözlemci bakış açısı', 'Redifli anlatım'], explanation: 'Hâkim anlatıcı kişilerin iç dünyaları hakkında da bilgi verebilir.' },
];

export function getHighSchoolCoreQuestionPackV106(): EmbeddedQuestionSeed[] {
  return [
    ...build('Fizik', 'lf', physics),
    ...build('Kimya', 'lk', chemistry),
    ...build('Biyoloji', 'lb', biology),
    ...build('Edebiyat', 'le', literature),
  ];
}
