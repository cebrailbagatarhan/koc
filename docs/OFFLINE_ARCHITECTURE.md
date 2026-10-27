# Offline-first eğitim mimarisi

Bu sürümde eğitim çekirdeği AI/API katmanından ayrılmıştır. Uygulamanın ders, quiz, kaynak, ilerleme, tekrar ve İngilizce pratik akışları API anahtarı olmadan çalışır.

## Temel prensip

- Ders kataloğu, konu içeriği, quiz, kaynaklar, ilerleme ve tekrar çevrimdışı çalışır.
- `api/gemini.ts` yalnızca gelecekteki AI sağlayıcısı için boş bir adaptördür.
- Ekranlar doğrudan bir AI SDK'sına bağlı değildir.
- Kullanıcı kaynakları ve ilerleme verileri `storage/learningStore.ts` üzerinden okunur/yazılır.
- Quiz geçmişi ve aralıklı tekrar planı `storage/reviewStore.ts` üzerinden yönetilir.
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

## Koç tekrar motoru v3

`storage/reviewStore.ts` quiz sonuçlarını kalıcı öğrenme sinyaline dönüştürür. İki ek tablo aynı SQLite veri tabanında ihtiyaç olduğunda güvenli biçimde oluşturulur:

- `quiz_attempts`: her soru denemesini, seçilen cevabı, doğruluk durumunu ve zamanı tutar,
- `review_items`: yanlış yapılan soruların aralıklı tekrar planını tutar.

Davranış:

- Yanlış cevaplanan soru otomatik olarak tekrar planına girer.
- İlk yanlışta soru yaklaşık 6 saat sonra tekrar için hazır olur.
- Tekrar sırasında doğru cevaplanan soru 1 gün sonrasına taşınır.
- Sonraki doğrular aralığı yaklaşık 3 gün, 7 gün ve giderek daha uzun süreye çıkarır; üst sınır 30 gündür.
- Tekrar sırasında yeniden yanlış yapılırsa aralık sıfırlanır ve soru kısa döngüye geri döner.
- Normal quizde daha önce tekrar planına girmiş bir sorunun doğru çözülmesi de tekrar aralığını ilerletir.

`getReviewDashboard()` toplam bekleyen tekrar sayısını, takip edilen soru sayısını, sonraki tekrar zamanını ve en zayıf dersleri hesaplar. Bu veri ana sayfa ve ilerleme ekranındaki yerel “koç önerisi” kartlarını besler.

Bu motor yapay zekâ değildir; kullanıcının gerçek soru geçmişinden deterministik ve cihaz içi öneri üretir. İleride AI eklenirse bu sinyaller modele bağlam olarak verilebilir, fakat temel koçluk AI olmadan çalışır.

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

Koçluk sinyali için paralel akış:

`quiz cevabı -> deneme geçmişi -> yanlış/tekrar planı -> zayıf ders analizi -> günlük tekrar`

## Veri sahipliği ayrımı

Uygulamayla gelen içerik ile kullanıcının verisi ayrı tutulur:

- `data/courseCatalog.ts` ve `data/offlineContent.ts`: uygulamayla paketlenen eğitim içeriği,
- SQLite: kullanıcının kaynakları, ilerlemesi, quiz geçmişi, tekrar planı ve çalışma serisi,
- cihaz dosya sistemi: kullanıcının eklediği PDF ve diğer dosyaların asıl kopyaları.

Bu ayrım daha sonra hesap/senkronizasyon eklendiğinde yerel verinin sunucuya taşınmasını kolaylaştırır.

## Sonraki tablo genişlemeleri

Sistem büyüdüğünde aynı SQLite veri tabanına şu tablolar eklenebilir:

- `levels`
- `courses`
- `topics`
- `quiz_questions`
- `study_sessions`
- `vocabulary`
- `learning_goals`

Kaynak/ilerleme ekranları storage katmanları üzerinden çalıştığı için bu genişlemelerde UI katmanının doğrudan SQL bilmesine gerek yoktur.

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
