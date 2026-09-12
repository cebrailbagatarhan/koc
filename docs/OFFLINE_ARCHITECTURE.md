# Offline-first eğitim mimarisi

Bu sürümde eğitim çekirdeği AI/API katmanından ayrılmıştır. Uygulamanın ders, quiz, kaynak, ilerleme ve İngilizce pratik akışları API anahtarı olmadan çalışır.

## Temel prensip

- Ders kataloğu, konu içeriği, quiz, kaynaklar ve ilerleme çevrimdışı çalışır.
- `api/gemini.ts` yalnızca gelecekteki AI sağlayıcısı için boş bir adaptördür.
- Ekranlar doğrudan bir AI SDK'sına bağlı değildir.
- Kullanıcı kaynakları ve ilerleme verileri `storage/learningStore.ts` üzerinden okunur/yazılır.
- Kalıcı ilişkisel veri `expo-sqlite` ile `koc-learning.db` içinde tutulur.

## SQLite kaynak kütüphanesi v2

`storage/database.ts` uygulamanın yerel veri tabanını oluşturur ve aşağıdaki yapıları yönetir:

- `sources`: ders/kurs kaynağının ana kaydı,
- `source_chunks`: aranabilir metin parçaları,
- `source_chunks_fts`: cihaz destekliyorsa FTS5 tam metin indeksi,
- `course_progress`: ders bazlı oturum ve quiz ilerlemesi,
- `activity_stats`: çalışma serisi ve toplam çalışma aksiyonu,
- `app_meta`: şema/migrasyon bilgisi.

SQLite WAL modu ve foreign key desteği açılır. FTS5 kullanılamayan bir cihaz/platform varsa arama otomatik olarak normal `LIKE` sorgusuna düşer; kaynak kütüphanesi tamamen kırılmaz.

## Eski verinin korunması

Önceki sürümdeki AsyncStorage anahtarları ilk SQLite açılışında otomatik olarak içeri alınır:

- `koc.sources.v1`
- `koc.progress.v1`
- `koc.activity.v1`

Migrasyon `app_meta` içinde işaretlenir ve tekrar tekrar çalışmaz. Eski AsyncStorage kayıtları migrasyon sırasında silinmez; böylece ilk geçişte geri dönüş güvenliği korunur.

## Dosya ve PDF kaynakları

`services/sourceIngestion.ts` sistem belge seçicisini kullanır ve seçilen kaynağı uygulamanın kalıcı belge alanındaki `learning-sources` klasörüne kopyalar.

- Maksimum dosya boyutu: 25 MB.
- TXT, Markdown, CSV, JSON, XML ve benzeri metin dosyalarının içeriği cihazda okunur.
- Okunan metin en fazla 250.000 karakter olacak şekilde alınır ve yaklaşık 1.200 karakterlik, örtüşmeli parçalara bölünür.
- PDF ve diğer ikili dosyalar kalıcı olarak saklanır; başlık, ders, konu ve kullanıcının notu indekslenir.
- PDF iç metnini güvenilir biçimde çıkarmak için ayrıca bir PDF parser gerekir. Bu sürüm sahte/bozuk metin üretmek yerine PDF'yi dosya + metadata kaynağı olarak tutar.

## Yerel arama ve gelecekte RAG

Kaynak ekranı başlık, konu, not ve çıkarılmış dosya metni üzerinde arama yapar. `getRelevantSourceChunks(levelName, courseName, query)` fonksiyonu, ileride bir AI sağlayıcısı bağlandığında yalnızca ilgili yerel kaynak parçalarının modele verilmesi için hazırdır.

Böylece gelecekteki akış şu şekilde kalır:

`ders -> yerel kaynaklar -> ilgili chunk araması -> opsiyonel AI sağlayıcısı`

AI kapalıyken de ilk üç katman çalışmaya devam eder.

## Veri sahipliği ayrımı

Uygulamayla gelen içerik ile kullanıcının verisi ayrı tutulur:

- `data/courseCatalog.ts` ve `data/offlineContent.ts`: uygulamayla paketlenen eğitim içeriği,
- SQLite: kullanıcının kaynakları, ilerlemesi, çalışma serisi ve ileride kişisel soru/kelime verisi,
- cihaz dosya sistemi: kullanıcının eklediği PDF ve diğer dosyaların asıl kopyaları.

Bu ayrım daha sonra hesap/senkronizasyon eklendiğinde yerel verinin sunucuya taşınmasını kolaylaştırır.

## Sonraki tablo genişlemeleri

Sistem büyüdüğünde aynı SQLite veri tabanına şu tablolar eklenebilir:

- `levels`
- `courses`
- `topics`
- `quiz_questions`
- `quiz_attempts`
- `study_sessions`
- `vocabulary`
- `review_schedule`

Ekranlar `storage/learningStore.ts` üzerinden çalıştığı için bu genişlemelerde UI katmanının doğrudan SQL bilmesine gerek yoktur.

## TalkLab birleşimi

TalkLab'den taşınan fikirler:

- çalışma serisi,
- ilerleme ölçümü,
- çevrimdışı quiz fallback yaklaşımı,
- İngilizce için rol/senaryo pratiği,
- yerel kişisel kaynak/vocabulary yaklaşımı.

Koç'tan korunan omurga:

- eğitim seviyesi -> ders -> çalışma modu,
- tüm mevcut dersler,
- Expo Router tabanlı ekran yapısı.
