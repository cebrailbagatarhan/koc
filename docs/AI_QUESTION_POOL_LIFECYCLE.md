# AI Soru Havuzu Yaşam Döngüsü

## Amaç

AI modeli kaliteli soru ürettiğinde soru doğrudan ortak bankaya yazılmaz. Önce kısa ömürlü aday havuzuna girer, doğrulanır ve ancak kapasite/kalite kurallarını geçerse herkesin gördüğü yayın havuzuna alınır.

Akış:

`AI -> candidate -> validator -> admission -> published pool -> usage score -> retire/archive`

## Varsayılan sınırlar

Her konu için varsayılan aktif yayın limiti **300 soru**. Bu sayı veritabanının teknik kapasitesinden çok ürün kalitesini ve operasyon maliyetini sınırlar.

- `max_published = 300`: kullanıcıların erişebildiği aktif soru sayısı.
- `max_candidates = 1000`: aynı konu için bekleyen AI adaylarının operasyon hedefi.
- `min_quality_score = 88`: yayın için minimum kalite.
- `auto_publish_score = 95`: ileride otomatik yayın politikasında kullanılacak üst eşik.
- `min_novelty_score = 0.82`: benzer/tekrar soruları engelleme eşiği.
- `replacement_margin = 3`: havuz doluyken yeni soru eski en zayıf sorudan belirgin biçimde iyi olmalı.
- Taslak/inceleme adayları 14 gün, rejected/expired adaylar 30 gün sonra temizlenir.

Bu değerler konu bazında değiştirilebilir. Örneğin geniş ALES konu aileleri 500, dar bir ilkokul kazanımı 120 aktif soruyla sınırlandırılabilir.

## Neden sabit bir global maksimum yok?

Bir milyon yayınlanmış soru teknik olarak PostgreSQL için olağan dışı değildir; sorun veri hacminden önce içerik kalitesi, tekrar oranı, indeks maliyeti ve editoryal operasyondur. Bu yüzden limit konu bazlıdır.

Örnek:

- 100 aktif konu x 300 = 30.000 aktif soru.
- 300 aktif konu x 300 = 90.000 aktif soru.
- 1.000 aktif konu x 300 = 300.000 aktif soru.

Retired sorular kullanıcıya servis edilmez; performans ve geçmiş analizleri için tutulabilir.

## Yayın kapısı

Bir AI adayı ancak:

1. kalite puanı eşiğini geçerse,
2. novelty eşiğini geçerse,
3. grounded/citation doğrulaması başarılıysa,
4. tam 4 benzersiz seçenek ve geçerli doğru seçenek taşıyorsa,
5. fingerprint ile aynı konuda duplicate değilse

yayın için değerlendirilebilir.

Havuz doluysa yeni adayın admission skoru:

`quality * 0.70 + novelty * 20 + grounded_bonus(10)`

ile hesaplanır. Yeni soru, aktif havuzdaki en düşük utility skorundan en az `replacement_margin` kadar iyi değilse reddedilir. Daha iyiyse en düşük utility soru `retired` olur ve yeni soru yayınlanır.

## Kullanım sonrası kalite

Yayınlanan sorunun utility skoru zaman içinde yalnız ilk AI kalite skoruna bağlı kalmamalı. Planlanan güncelleme:

- doğru cevap oranı,
- çözüm süresi,
- discrimination,
- report oranı,
- çok kolay/çok zor anomalisi,
- son gösterim zamanı,
- son 30/90 günlük kullanım

ile yeniden hesaplanır.

Hedef formül örneği:

`utility = static_quality * 0.35 + discrimination * 25 + health * 20 + freshness * 10 + usage_confidence * 10`

İlk gün utility başlangıçta admission skorundan gelir.

## Saklama politikası

**Published:** otomatik silinmez. Önce `retired` olur.

**Retired:** en az 180 gün tutulabilir; aktif attempt veya report geçmişi varsa daha uzun saklanır.

**AI candidate:** kısa ömürlü staging verisidir. Rejected/expired kayıtlar günlük prune edilir.

**Generation jobs:** maliyet ve audit için özet metadata uzun süre tutulabilir; büyük request/response payload'ları ayrı retention politikasına tabi olmalıdır.

**Prompt/output ham verisi:** mümkünse kalıcı soru tablosuna kopyalanmamalı; yalnız gerekli audit alanları tutulmalıdır.

## Queue ve Cron

AI üretim işleri için Supabase Queues uygundur. Queue istemciye açılmamalı; Edge Function/service tarafı tüketmeli.

Önerilen kuyruklar:

- `koc_question_generate`
- `koc_question_validate`
- `koc_question_recompute_quality`

Günlük Cron:

- candidate retention temizliği,
- utility score yeniden hesaplama,
- uzun süre hiç kullanılmayan retired içerik raporu,
- cron geçmiş kayıtlarının kendi retention'ı.

Supabase Cron/pg_cron geçmişi de sınırsız bırakılmamalıdır; `cron.job_run_details` düzenli temizlenmelidir.

## Yetkilendirme

Mobil istemci AI adayını doğrudan `koc_questions` tablosuna INSERT edemez.

- aday oluşturma: server/Edge Function,
- validator: server/worker,
- publish/admission: yalnız server-side DB function,
- öğrenciler: yalnız `published` soruları SELECT eder,
- cevap anahtarı: öğrenciye doğrudan SELECT verilmez,
- admin/reviewer: review ve policy yönetimi.

## Uygulama zamanı

Bu dosyadaki SQL şu an `supabase/drafts` altında tutuluyor. Koç için ayrı Supabase projesi bağlandığında:

1. development branch/database oluştur,
2. Supabase CLI ile yeni migration oluştur,
3. draft SQL'i migration içine taşı,
4. test candidate/publish/prune akışını çalıştır,
5. advisors çalıştır,
6. RLS ve function izinlerini tekrar denetle,
7. sonra production'a uygula.

Canlıdaki mevcut tek Supabase projesinin Koç'a ait olduğu doğrulanmadığı için bu tasarım oraya uygulanmamalıdır.
