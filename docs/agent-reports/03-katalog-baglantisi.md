# 03 — Katalog / Konu Bağlantısı Denetimi

Kapsam: `data/courseCatalog.ts`, `topicCatalog.ts`, `topicLookup.ts`, `topicQuiz.ts`, `offlineContent.ts`, `storage/questionBankStore.ts`, `coachStore.ts`, `questionQualityStore.ts`, `app/level`, `app/course`, `app/topic`, `app/quiz`, `app/(tabs)/*`.
Özet: `data/packs/*.ts` **hiçbir yerde import edilmiyor** (dizin yok, `questionBankStore.ts:2-9,207-211` yalnızca 3 fabrikayı dolaşır). Yani bugünkü kodda paket dosyası yazmak tek başına **sıfır etki** üretir.

## 1. Paket var, `courseCatalog.ts` yok

- **Seed:** `questionBankStore.ts:185` legacy döngüsü yalnızca `getAllCourseKeys()` (18 çift) üzerinde; `:207-211` paket döngüsü sabit 3 fabrikadan gelir. Paket okunmadığı için ÖSYM/TYT soruları **DB'ye hiç yazılmaz**, sürüm anahtarı da değişmediği için (`:160-165`) hiçbir şey tetiklenmez.
- **Paket bağlanıp katalog güncellenmezse** (tahmini sonraki durum): paket döngüsü katalogdan bağımsız düz dizi olduğu için satırlar **yine de yazılır**, ama `getTopicsForCatalogCourse('ÖSYM','TYT')` → `[]` → `topicName = null` (`:212-215`).
- **Quiz sorgusu:** `getQuestionsFromDatabase` filtreyi `level_name/course_name` string'iyle yapar (`:288-303`); katalogla ilgisi yok. Satır varsa ders quizi döner, konu quizi (`topic_name = ?`) boş döner.
- **UI:** Ana ekran `LEVELS` döner (`(tabs)/index.tsx:6,59-61,175`) → ÖSYM kartı yok. Deep link `/level/ÖSYM` → `COURSES_BY_LEVEL['ÖSYM']` undefined → `[]` (`level/[levelName].tsx:9`) → başlık görünür, liste **boş**. `/course/ÖSYM/TYT` deep link çalışır (`getCourse` undefined, ikon fallback `course:16,39`), konu bölümü hiç basılmaz (`course:45`).
- Net: sorular DB'de durur, kullanıcı **hiçbir yerden ulaşamaz**.

## 2. Katalog var, `topicCatalog.ts` yok

- `topicName = null` (`questionBankStore.ts:212-215`; `topics.length === 0`).
- **Erişilebilir:** `/level/ÖSYM` ders kartları; ders ekranı (konu listesi hariç tüm araçlar `course:95-125`); **ders geneli quiz** (`/quiz/ÖSYM/TYT`, `getQuestionsFromDatabase` konu filtresi olmadan).
- **Erişilemez:** konu listesi (`course:45` koşulu false → blok tamamen gizli); konu ekranı (`getTopic` undefined → "Bu konu katalogda bulunamadı" `topic:30-39`); konu quizi; ustalık haritası (`coachStore.ts:222-225` yalnızca katalog konularını dolaşır → 0 satır); günlük plan (`goalPlanner.ts:88` `questionCount > 0` şartı); İngilizce sekmesi; kaynak ekranı konu seçici (`resources:28`).
- **Çalışır:** Günlük tekrar — id bazlı, katalogdan bağımsız (`questionBankStore.ts:309-318`, `review/index.tsx`).
- Konu soru sayısı **0** görünür.

## 3. Birleştirme noktaları

Tek darboğaz: `getTopicsForCatalogCourse` (`topicCatalog.ts:483-486`) — statik `TOPICS` döner, **birleştirme yok**. Tüketiciler:
`course:17` (a), `getTopic:488-491` + `getQuestionIdsForTopic:493-495` (b), `topicQuiz.ts:12` (c), `questionBankStore.ts:186,212` (topicName), `coachStore.ts:224` (ustalık+plan), `questionQualityStore.ts:60`, `english.tsx:37`, `resources:28`, `topicLookup.ts:9` (**ölü kod**, hiçbir yerden çağrılmıyor).

**Onaylanan uyumsuzluk:** konu ekranı sayımı `getQuizQuestionsForTopic` (`topic:17-20`) → `getQuizQuestions` (`offlineContent.ts:227-230`) yani **sadece legacy 18×3 banka**; quiz ekranı ise SQLite'tan yükler (`quiz:45-53`). Kullanıcı etkisi: paket konusunda buton "Quiz hazırlanıyor" + `disabled` (`topic:71-79`) iken quiz gerçekte dolu; legacy konuda "3" yazarken quiz 10 soru servis eder. Ayrıca ustalık `questionCount` katalog `questionIds`'ten gelir (`coachStore:237-246`), DB'den değil → kapsama/puan yanlış.

## 4. Sabit varsayımlar

- `LEVELS` 4 seviye (`courseCatalog.ts:14-61`), `COURSES_BY_LEVEL:63-65`, `getAllCourseKeys:72-76` (18 çift). Ana ekran `index:57-61`, profil `profile:65`, hedefler `goals:61,158` → hepsi iterasyon, **sayı varsayımı yok** (additive güvenli). `level:19` `numColumns={2}` kozmetik.
- **Ders adı varsayımı:** `english.tsx:8` (`name === 'İngilizce'`), `course:18` `isEnglish`, `chat/[courseName]:58` sert ret → YÖKDİL/Akademik İngilizce sınavı olduğu hâlde TalkLab'a giremez.
- `offlineContent.ts:16-95` `LESSONS_BY_COURSE` **yalnızca ders adıyla** anahtarlı (`getLessonSeed:223-225`) → yeni derslerde ders özeti boş; `QUESTION_BANK:99-190` `level::course` 18 anahtar → yeni derslerde legacy 0 soru.
- `EMBEDDED_PACKAGE_VERSION = 4` kapısı (`:15,160-165`).
- Rota: `router.push(\`/course/${levelName}/${item.name}\`)` (`level:26`, `course:101,108,115`) encode edilmiyor; "AYT Sayısal" / "AYT Eşit Ağırlık" boşluklu, "YÖKDİL" noktalı İ içeriyor — deep link/redirect kırılgan.
- `index:81` varsayılan `/level/Ortaokul`; `_layout.tsx:26-32` İngilizce sekmesi sabit.

## 5. Önerilen minimal düzenlemeler (additive)

1. `courseCatalog.ts`: `LEVELS` sonuna iki seviye ekle (mevcut indeksler değişmesin).
2. `topicCatalog.ts`: paket `topics` dizilerini **runtime** import edip `PACK_TOPICS` kaydı kur; `getTopicsForCatalogCourse` içinde `[...(TOPICS[key] ?? []), ...(PACK_TOPICS[key] ?? [])]` döndür. **Statik önce** → mevcut `topicIndex` anlamı korunur.
3. `questionBankStore.ts`: paket sorularını dolaşan yeni döngü; `topicName`'i `topics.find(t => t.questionIds.includes(q.id))` ile ata (topicIndex'e güvenme), bulunamazsa `topicIndex % topics.length`. Legacy döngüsüne dokunma.
4. Aynı dosya: `EMBEDDED_PACKAGE_VERSION` → `5`. Paketleri aynı `embedded-core` paketine yaz (silme/yeniden yazma tutarlı kalır).
5. `topic/[topicName].tsx`: sayımı `getQuestionsFromDatabase(level, course, topicName)` ile async yap (veya `topicQuiz`'e DB yolu ekle). Konu quizi butonu böylece gerçek sayıyı gösterir.
6. (Opsiyonel) `english.tsx:8`, `course:18`, `chat:58`: `İngilizce | YÖKDİL | Akademik` kümesi.

**Veri riski:** sürüm bump'ı `embedded-core` satırlarını siler (`:178-183`) ve yeniden yazar. id'ler sabitse `quiz_attempts`/`review_items` korunur (FK yok). **Kritik:** iki pakette aynı id → PK ihlali → tüm transaction geri alınır → mevcut kullanıcı **tüm bankasını kaybeder** ve hata yutulur (`app/_layout.tsx:22-24`). Seed öncesi id çakışma kontrolü şart.

## 6. Planındaki kötü fikirler

- **"YÖK" seviye olarak yanlış.** YÖK bir kurum; sınav YÖKDİL. Ayrıca ÖSYM/YÖK'ü İlkokul/Ortaokul/Lise ile kardeş yapmak "Eğitim seviyesi" alanını bozar (`profile:63-78`). Tek "Sınav" seviyesi + ders olarak TYT/AYT/KPSS/YÖKDİL daha temiz.
- **AYT Sayısal + AYT Eşit Ağırlık ayrı ders:** aynı Matematik konuları iki kez sayılır → ustalık/plan çift kayıt, kullanıcı aynı konuyu iki yerde görür. Tek "AYT" dersi + şube etiketi öner.
- **Paket `topicIndex`'ine güvenmek:** birleşik dizide sıra değişince eski sorular sessizce başka konuya kayar. id eşleşmesi kullan.
- **Spec'e güvenmek:** "konular `getTopicsForCatalogCourse` ile birleşir" (`SPEC:165`) ve `scripts/validate-question-packs.ts` (`SPEC:147`) **kodda yok** (`scripts/` yalnızca 2 dosya). Spec'i kod gerçeğine göre düzelt.
- **Paket başına ayrı `package_id` + ayrı meta anahtarı:** sürüm kapısı olmadan eski içerik kalır.
- **Sürümü artırmamak:** hiçbir kullanıcı yeni soruyu görmez.
- **Ders ekleyip konu eklememek:** ders ekranı boş açılır, "soru bankası hazırlanıyor" ile karışır.

## yapılacaklar (öncelik sırası)

1. `questionBankStore.ts`: paket import + döngü + `topicName` id eşleşmesiyle.
2. `questionBankStore.ts:15`: `EMBEDDED_PACKAGE_VERSION = 5`.
3. Seed öncesi global id çakışma kontrolü (transaction'ı koru).
4. `topicCatalog.ts`: `PACK_TOPICS` + `getTopicsForCatalogCourse` birleştirme (statik önce).
5. `courseCatalog.ts`: ÖSYM/YÖK (veya tek "Sınav") seviyelerini ekle.
6. `topic/[topicName].tsx`: sayımı SQLite'tan al (buton/etiket tutarlılığı).
7. Ustalık `questionCount`'unu katalog yerine DB'den türet (`coachStore.ts:237-246`).
8. `english.tsx` / `course` / `chat`: İngilizce ders adı kümesini genişlet.
9. Rota parametrelerini `encodeURIComponent` ile üret (boşluklu ders adları).
10. `QUESTION_AUTHORING_SPEC.md` §4/§5'i gerçek koda göre güncelle; `data/packs/` dizinini oluştur.
