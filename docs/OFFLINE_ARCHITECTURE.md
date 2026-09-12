# Offline-first eğitim mimarisi

Bu sürümde eğitim çekirdeği AI/API katmanından ayrılmıştır.

## Temel prensip

- Ders kataloğu, konu içeriği, quiz, kaynaklar ve ilerleme API anahtarı olmadan çalışır.
- `api/gemini.ts` yalnızca gelecekteki AI sağlayıcısı için boş bir adaptördür.
- Ekranlar doğrudan bir AI SDK'sına bağlı değildir.
- Kullanıcı kaynakları ve ilerleme verileri `storage/learningStore.ts` üzerinden okunur/yazılır.

## Neden şimdilik AsyncStorage?

Mevcut projede zaten kurulu olduğu için yeni native bağımlılık eklemeden çevrimdışı CRUD akışını doğrulamaya yarar. Veri erişimi tek dosyaya kapatıldığı için ekranların veri saklama teknolojisini bilmesine gerek yoktur.

## SQLite'a ne zaman geçilmeli?

Kaynaklar metin notlarının ötesine geçtiğinde SQLite daha doğru seçimdir. Özellikle şu ihtiyaçlarda geçiş yapılmalıdır:

- yüzlerce veya binlerce kaynak,
- ders/konu/etiket bazlı arama ve filtreleme,
- PDF sayfaları veya parçalanmış doküman indeksleri,
- soru bankası sürümleme,
- ayrıntılı öğrenme geçmişi ve tekrar planı,
- veri bütünlüğü gerektiren ilişkiler.

Önerilen tablolar:

- `levels`
- `courses`
- `topics`
- `sources`
- `source_chunks`
- `quiz_questions`
- `quiz_attempts`
- `study_sessions`
- `vocabulary`

Bu geçişte `storage/learningStore.ts` içindeki fonksiyonların imzası korunursa ekranlarda büyük bir değişiklik gerekmez.

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
