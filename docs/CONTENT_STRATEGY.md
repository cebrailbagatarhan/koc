# Koç içerik stratejisi

Koç'un çekirdek öğrenme içeriği dış PDF veya anlık AI üretimine bağlı değildir.

## Kaynak önceliği

1. **Gömülü doğrulanmış soru bankası** — APK ile birlikte gelir ve ilk açılışta SQLite'a seed edilir.
2. **Sunucudan sürümlü içerik paketleri** — ileride admin panelinde onaylanan içerik cihaz veritabanına senkronize edilir.
3. **Kullanıcı kaynakları / PDF** — kişisel çalışma, arama ve kaynak-temelli AI için yardımcı katmandır.
4. **AI üretimi** — taslak ve kişiselleştirme katmanıdır; doğrulanmış merkezi soruların yerine geçmez.

## Kalite ilkesi

Bir soru `verified` olmadan merkezi kaliteli soru bankası olarak sunulmaz. Her soru seviye, ders, konu, zorluk, seçenekler, doğru cevap, açıklama, sürüm ve kaynak/inceleme metadatası taşımaya hazır olmalıdır.

PDF ayrıştırma bozuk veya düşük güvenliyse uygulama soru uydurmak yerine üretimi durdurur.
