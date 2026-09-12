# Koç Ürün ve Büyüme Stratejisi

## Konumlandırma

Koç, klasik bir soru bankası veya genel amaçlı AI sohbet uygulaması değildir. Üç katmanı tek öğrenme döngüsünde birleştirir:

1. **Doğrulanmış soru bankası:** editoryal kalite kontrolünden geçen, konu ve zorlukla etiketlenmiş sorular.
2. **Kaynak zekâsı:** öğrencinin PDF, not ve diğer kaynaklarından alıntı/citation göstererek özet, kart, quiz ve açıklama üretme.
3. **Kişisel koç:** yanlış hafızası, aralıklı tekrar, konu ustalığı, hedef tarihi ve günlük plan.

Ana vaat: **“Kaynağından öğren, kaliteli sorularla sınavına hazırlan.”**

## Ürün ilkeleri

- AI çıktısı doğrudan “doğrulanmış soru” sayılmaz.
- Her AI sorusu mümkün olduğunda kaynak pasajına bağlanır.
- Soru kalitesi yalnız dilbilgisiyle değil; doğruluk, tek doğru cevap, distractor kalitesi, müfredat/konu uyumu ve gerçek kullanıcı istatistikleriyle ölçülür.
- Ücretsiz ürün gerçekten işe yarar; Premium öğrenmeyi engelleyen yapay can/enerji sistemleri yerine daha fazla derinlik, kaynak analizi ve içerik kalitesi sunar.
- Offline çekirdek korunur. Hesap ve bulut özellikleri geldiğinde cihazdaki çalışma tamamen kullanılamaz hâle gelmemelidir.

## Soru bankası kalite hattı

Soru yaşam döngüsü:

`taslak -> otomatik kontrol -> editör incelemesi -> yayın -> gerçek kullanım ölçümü -> revizyon/emeklilik`

Kaynak türleri:

- `curated`: insan tarafından yazılmış veya lisanslı soru.
- `ai`: AI tarafından kaynaklardan oluşturulmuş taslak.
- `import`: yetkili veri aktarımı.
- `user`: kullanıcının özel çalışma alanında oluşturulmuş, genel bankaya yayınlanmayan soru.

Doğrulanmış rozet için asgari koşullar:

- doğru cevabın tek ve açık olması,
- açıklamanın cevapla tutarlı olması,
- seçeneklerin birbirinden ayırt edilebilir olması,
- konu ve zorluk etiketinin doğru olması,
- kaynak-temelli soruda citation bulunması,
- kritik içerikte editör/reviewer onayı.

Gerçek kullanımda izlenecek ölçüler:

- doğru cevap oranı (item difficulty),
- üst/alt başarı grubu ayırt etme gücü,
- distractor seçilme dağılımı,
- soru raporlama oranı,
- soru başına ortalama çözüm süresi,
- revizyon sonrası performans değişimi.

## Notebook-benzeri Kaynak Zekâsı

Arayüz modeli üç alanı takip eder:

- **Sources:** PDF/not/metin kaynaklarını seç, etiketle ve filtrele.
- **Ask:** yalnız seçili kaynaklardan ilgili pasajları bul; AI bağlıysa cevap citation ile gelsin.
- **Studio:** özet, çalışma rehberi, flashcard, quiz ve ileride sesli özet üret.

V7'de bunun offline/deterministik temeli vardır. Bulut AI aşamasında retrieval sonucu modele bağlanır; modelin cevabı yine kaynak chunk kimlikleriyle geri dönmek zorundadır.

AI üretiminde kullanıcı şunları seçebilmelidir:

- konu/kaynak seçimi,
- soru sayısı,
- kolay/orta/zor veya sınav seviyesi,
- soru türü,
- “sadece kaynağa bağlı kal” modu,
- sınav tarzı (örn. ALES mantığı gibi ürün içi tanımlı profiller).

## Üyelik modeli

### Free

- temel ders ve konu kataloğu,
- sınırlı ama anlamlı doğrulanmış soru bankası,
- yanlış hafızası, aralıklı tekrar ve temel günlük plan,
- yerel not/PDF saklama ve cihazda mümkün olan kaynak işleme,
- Kaynak Stüdyosu için düşük bir bulut AI kotası (AI aktif edildiğinde).

### Premium

- doğrulanmış soru bankasının tamamı,
- ileri seviye kaynak-temelli AI üretimi ve daha yüksek adil kullanım limiti,
- kaynaklar arası karşılaştırma ve derin açıklama,
- gelişmiş deneme/sınav modu,
- hedef odaklı ayrıntılı plan ve konu analitiği,
- cihazlar arası bulut senkronizasyonu,
- ileride sesli/video çalışma çıktıları.

Fiyat uygulama içinde sabitlenmemelidir. App Store/Google Play ürünleri ve uzak plan kataloğu üzerinden yönetilmelidir; yerel para birimi ve mağaza fiyat katmanları A/B testleriyle optimize edilir.

## Ödeme mimarisi

Mobil dijital abonelikte mağaza ödeme sistemleri kullanılmalıdır. Ürün mimarisi RevenueCat benzeri bir entitlement katmanını destekleyecek şekilde tasarlanır:

`App Store / Play Billing -> RevenueCat -> webhook -> Supabase entitlement mirror -> uygulama feature gate`

Tarayıcı/admin hiçbir zaman App Store/Play receipt doğrulamasını kendi başına yapmaz. Sunucu webhook/event kaydı kaynak gerçektir.

## Aktivasyon hunisi

İlk 3-5 dakikada kullanıcı şu değeri görmelidir:

1. hedef/seviye seç,
2. bir konu seç veya PDF ekle,
3. üç tanı sorusu çöz,
4. kişisel plan + ilk zayıf konu + ilk kaynak kartı görün.

Kullanıcıdan ödeme istemeden önce en az bir “aha” anı yaşatılmalıdır.

## Büyüme kanalları

- sınav/konu bazlı kaliteli ücretsiz web içerikleri ve SEO,
- paylaşılabilir çalışma paketleri (telif ve gizlilik kontrolleriyle),
- öğretmen/öğrenci referans döngüsü,
- kısa “bir soruyu neden yanlış yaptın?” sosyal içerikleri,
- dönemsel sınav kampanyaları ve hedef planları,
- ileride okul/öğretmen paketleri.

## Başarı metrikleri

North-star metrik yalnız günlük açılış değildir: **haftalık anlamlı öğrenme ilerlemesi**.

Takip edilecek temel metrikler:

- haftalık çözülen doğrulanmış soru,
- ustalık seviyesi yükselen konu sayısı,
- yanlış tekrar tamamlama oranı,
- kaynak yükleyen kullanıcının Studio aktivasyonu,
- Free -> Premium dönüşümü,
- Premium 4/8/12 hafta retention,
- AI maliyeti / aktif Premium kullanıcı,
- doğrulanmış soru başına raporlama oranı.

## Yol haritası

1. V7: PDF metin çıkarımı + Kaynak Stüdyosu + İngilizce merkezi.
2. V8: hesap/üyelik veri modeli + soru kalite sistemi + admin panel temeli.
3. V9: RevenueCat + Supabase auth/sync + gerçek entitlement feature gates.
4. V10: sunucu tarafı grounded AI generation pipeline ve kullanım kotası.
5. V11: soru analitiği, otomatik kalite değerlendirmesi ve editör review queue.
6. V12: gelişmiş sınav simülasyonu, paylaşılan notebook/paketler ve öğretmen araçları.
