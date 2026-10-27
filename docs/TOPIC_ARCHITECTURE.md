# Konu tabanlı öğrenme mimarisi (v4)

Koç v4 ile eğitim omurgası `seviye -> ders -> konu -> kaynak/quiz/tekrar` biçimine genişletilir.

## Konu kataloğu

`data/topicCatalog.ts` uygulamayla paketlenen başlangıç konu kataloğudur. Bu katalog resmî müfredatın sabit bir kopyası değildir; uygulamanın çevrimdışı çalışma omurgasıdır ve daha sonra sürümlenebilir.

Her konu şu alanları taşır:

- konu adı ve ikon,
- kısa yerel açıklama,
- çalışma hedefleri,
- mini çalışma görevi,
- yerel soru bankasındaki soru kimliği eşleşmeleri.

Bu ayrım sayesinde konu yapısı değiştiğinde kullanıcı verisini veya SQLite şemasını değiştirmek gerekmez.

## Kaynak ilişkisi

SQLite `sources.topic_name` alanı konu bağlantısının kalıcı tarafıdır. Kullanıcı katalogdaki bir konuyu tek dokunuşla seçebilir veya özel bir konu adı yazabilir.

Konu ekranından kaynak eklemeye geçildiğinde seçili konu route parametresi olarak kaynak ekranına taşınır. Bu nedenle PDF/not doğrudan doğru konuya bağlanır.

## Konu çalışma ekranı

`app/topic/[levelName]/[courseName]/[topicName].tsx`:

- konu özetini ve hedeflerini gösterir,
- mini çalışma görevi verir,
- yalnızca o konuya bağlı kişisel kaynakları getirir,
- konu quizine geçiş verir,
- konuya kaynak/PDF ekleme akışını başlatır.

## Konu quizi

`data/topicQuiz.ts`, mevcut `offlineContent` soru bankasını konu kataloğundaki `questionIds` ile filtreler. Aynı soru kimlikleri v3 tekrar motoru tarafından da kullanıldığı için yanlış soru hafızası bozulmaz.

Akış:

`konu -> konu soruları -> quiz_attempts -> review_items -> günlük tekrar`

Konuya henüz soru bağlanmamışsa uygulama API çağırmaz veya sahte soru üretmez; konu ekranı soru bankasının hazırlanmakta olduğunu gösterir.

## Veri sahipliği

- `data/topicCatalog.ts`: uygulamanın sürümlenebilir konu omurgası,
- `data/offlineContent.ts`: paketli ders/soru içeriği,
- SQLite `sources`: kullanıcının not/PDF/dosyaları,
- SQLite `quiz_attempts` ve `review_items`: kullanıcının performans ve tekrar verisi.

Bu model ileride sunucu senkronizasyonu veya opsiyonel AI eklense bile çevrimdışı çekirdeği bağımsız tutar.
