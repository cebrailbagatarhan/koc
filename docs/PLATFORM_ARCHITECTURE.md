# Koç Platform Mimarisi

## Ayrım

Koç iki çalışma modunu birlikte taşır:

- **Local-first çekirdek:** ders kataloğu, yerel kaynaklar, quiz, tekrar, ustalık ve günlük plan cihazda çalışabilir.
- **Cloud platform:** hesap, cihazlar arası senkronizasyon, Premium entitlement, doğrulanmış merkezi soru bankası, gelişmiş AI üretimi ve admin operasyonları.

Cloud katmanı uygulamanın açılması için zorunlu değildir. Ağ veya hesap problemi temel offline öğrenmeyi kilitlememelidir.

## Güven sınırları

### Mobil/web istemci

İstemciye yalnız publishable Supabase key konur. Şunlar hiçbir zaman istemci bundle'ına girmez:

- Supabase service-role key,
- AI provider secret,
- RevenueCat webhook secret,
- soru bankasının sunucuda saklanan cevap anahtarı,
- yönetici bypass anahtarı.

### Supabase RLS

Kullanıcı verisi `auth.uid()` ile sınırlandırılır. Editör/reviewer/admin erişimi `private.koc_is_staff()` security-definer fonksiyonuyla kontrol edilir.

### Edge Functions

Kritik işlemler Edge Function üzerinden yapılır:

- abonelik webhook alımı ve entitlement güncelleme,
- merkezi soru cevap kontrolü,
- grounded AI üretim işi,
- usage quota artırımı,
- yayınlanmış içerik bundle üretimi,
- toplu soru importu ve otomatik kalite kontrolü.

## Soru bankası

Doğru cevap `koc_question_answers` tablosundadır ve normal öğrenci istemcisi bu tabloyu SELECT edemez. Öğrenciye soru + seçenek gönderilir; online çözümde cevap sunucuda kontrol edilir.

Offline paketlerde cevap doğal olarak cihazda bulunacaktır. Offline bundle'ın amacı hileye dayanıklı sınav güvenliği değil, kesintisiz çalışma deneyimidir. Resmî yüksek-riskli sınav gözetimi ayrı ürün problemidir.

### Kalite pipeline

1. Soru taslak olarak oluşturulur.
2. Otomatik validator çalışır:
   - seçenek tekrarları,
   - tek doğru cevap,
   - açıklama/cevap tutarlılığı,
   - aşırı benzer soru kontrolü,
   - kaynak citation varlığı,
   - format ve dil kontrolleri.
3. AI kaynaklı soru `review` kuyruğuna alınır.
4. Reviewer rubric puanları verir.
5. Yayınlanan soru gerçek kullanım istatistikleriyle izlenir.
6. Anomali/rapor durumunda soru tekrar review'a alınabilir.

## Grounded AI üretim hattı

Hedef mimari:

`kaynak -> extraction -> chunk -> retrieval -> prompt template -> model -> structured output -> citation validation -> artifact/draft -> kullanıcı`

Model çıktısında citation olarak yalnız modele gönderilen `chunk_id` değerleri kabul edilir. Bilinmeyen citation id gelirse çıktı yayınlanmaz veya “kaynak doğrulanamadı” olarak işaretlenir.

Soru üretiminde modelden serbest metin yerine JSON schema istenir:

```json
{
  "questions": [
    {
      "stem": "...",
      "difficulty": 3,
      "options": ["...", "...", "...", "..."],
      "correctIndex": 1,
      "explanation": "...",
      "citations": ["chunk_uuid"]
    }
  ]
}
```

Bu çıktı daha sonra validator'dan geçmeden merkezi soru bankasına giremez.

## Üyelik

Entitlement, ürün kimliğinden ayrıdır. Örneğin aylık ve yıllık iki farklı mağaza ürünü aynı `premium` entitlement'ını açabilir.

Kaynak gerçek akış:

`Apple/Google purchase -> RevenueCat event -> Edge Function -> koc_subscriptions + koc_entitlements`

Uygulama hızlı UI için RevenueCat SDK'dan entitlement okuyabilir; sunucu tarafı yetki isteyen işlemlerde Supabase entitlement aynası kullanılır.

## Kullanım kotası

AI kota kontrolü yalnız UI'da yapılmaz. Edge Function önce `koc_usage_periods` ve plan limitini kontrol eder, sonra modeli çağırır. Başarılı çağrıda gerçek token/metrik değerleri kaydedilir.

Maliyet gözlemi:

- provider/model,
- input/output token,
- işlem türü,
- kullanıcı/plan,
- tahmini maliyet,
- cache/reuse oranı.

## Admin paneli

Admin paneli ayrı web istemcisidir. Publishable key kullanır ve RLS'ye tabidir.

İlk modüller:

- Dashboard: kullanıcı, Premium, soru, review ve AI job sağlığı.
- Questions: arama/filtre, taslak/published/retired durum yönetimi.
- Review: AI/import sorularını rubric ile onaylama.
- Users: rol ve üyelik görünümü.
- AI Jobs: hata, model, token ve maliyet takibi.
- Feature Flags: özellik rollout kontrolü.
- Audit: yönetici değişiklik izi.

Service-role gerektiren toplu veya kritik eylemler admin tarayıcısından doğrudan DB'ye gönderilmez; JWT doğrulayan Edge Function çağrısı kullanılır.

## Ayrı Supabase projesi

Koç için ayrı bir Supabase projesi önerilir. Mevcut hesapta görülen başka uygulamaya ait tablolar (`products`, `contact_requests`) ile eğitim verisini aynı public şemaya karıştırmak operasyon ve güvenlik riskidir.

Repo içindeki `supabase/migrations` dosyaları Koç projesine uygulanmadan önce development branch/database üzerinde test edilmelidir.
