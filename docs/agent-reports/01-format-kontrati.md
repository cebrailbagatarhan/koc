# 01 — Soru Formatı Kontratı (kod doğrulamalı)

Kaynak: `data/embeddedQuestionPackV10.ts`, `deterministicQuestionFactoryV104.ts`, `crossSubjectQuestionFactoryV105.ts`, `storage/questionBankStore.ts`, `storage/adaptiveQuestionStore.ts`, `components/question-visual.tsx`, `app/quiz/[levelName]/[courseName].tsx`.

## 1. `EmbeddedQuestionSeed` alanları ve ne zaman kırılır

Tip: `embeddedQuestionPackV10.ts:11-23` — `id, levelName, courseName, prompt, options, correctAnswer, explanation, difficulty, questionKind` zorunlu; `topicIndex`, `visual` opsiyonel.

- **Seed anında fırlatan tek yer:** `validateQuestion` (`deterministicQuestionFactoryV104.ts:60-71`) ve `validatePack` (`crossSubjectQuestionFactoryV105.ts:49-62`). Bunlar yalnızca V104 (`:347-353`) ve V105 (`:318-319`) paketlerine uygulanır. V10 paketi **hiç doğrulanmaz** (`questionBankStore.ts:207-211` doğrudan geçirir).
- Seed anında fırlatan diğer yollar: `uniqueOptions` 4 benzersiz seçenek üretemezse (`v104:29-31`), `numericQuestion` cevabı seçeneklerde bulamazsa (`v104:42-44`), `makeQuestion` 4 seçenek kuramazsa (`v105:31-33`).
- **Sorgu anında fırlatmaz, sessizce siler:** `hydrateQuestion`, `is_correct=1` olan seçenek yoksa veya seçenek sayısı < 2 ise `null` döner (`questionBankStore.ts:249-250`) ve soru `filter` ile atılır (`:306`). Yani hatalı `correctAnswer` uygulamayı çökertmez; soru bankadan **görünmez olur**.
- **Render anında fırlatır:** yalnızca bozuk `visual` (bkz. §6).

## 2. Konu ataması

`questionBankStore.ts:212-215`:
```ts
const topics = getTopicsForCatalogCourse(question.levelName, question.courseName);
const topicName = topics.length ? topics[(question.topicIndex ?? 0) % topics.length]?.name ?? null : null;
```
- Konu listesi **sadece** `topicCatalog.ts:483-486` içindeki statik `TOPICS` kaydından gelir (`level::course` anahtarı). Paket dosyasındaki `export const topics` **hiçbir yerde okunmaz**.
- `topicIndex` katalog dizisinin indeksidir, paketin kendi dizisinin değil. Katalogda 3 konu varsa `0,1,2`; `3` yazarsan `3 % 3 = 0` ile **ilk konuya** düşer (hata yok, sessiz kayma).
- Negatif `topicIndex` → `topics[-1]` = `undefined` → `topicName = null` (hata yok).
- Katalogda o ders için konu yoksa → `topics.length === 0` → `topicName = null`. Soru **silinmez**, ders geneli quizde görünür (`:297-303`), konu quizinde görünmez (konu filtresi `topic_name = ?`, `:288-296`).
- Konu quizi ekranı `topicName`'i route'tan alır; eşleşme birebir string (`:291`).

## 3. Seçenek / doğru cevap karşılaştırması

- Seed: `is_correct = option === input.correctAnswer ? 1 : 0` — **birebir** eşitlik (`questionBankStore.ts:153`).
- Hydrate: doğru cevap = `is_correct=1` olan ilk satırın metni (`:249`).
- Runtime: `answer === question.correctAnswer` (`quiz.tsx:69`) ve `option === question.correctAnswer` (`:207-208`). **Trim, case-fold, sayı normalizasyonu YOK.** `"42 "`, `"42,0"`, `"ANKARA"` → hiçbir seçenek işaretlenmez, soru sessizce düşer.
- Tek normalizasyon `question-visual.tsx:11-29` içinde (`toLocaleLowerCase('tr-TR')`, `trim`, `,`→`.`) ama **ölü kod**: `hiddenAnswer` her zaman `undefined` iken render edilir (`:37`; `quiz.tsx:201`, `review/index.tsx:188`), yani görsel ancak cevap verildikten sonra çizilir ve maskeleme hiç çalışmaz.
- Aynı metinli iki seçenek DB'de kabul edilir (`PRIMARY KEY(question_id, option_index)`, `:101`); UI'da `key={option}` çakışır (`quiz.tsx:211`) ve ikisi de "doğru" boyanır.

## 4. Yinelenen id (legacy ↔ paketler)

- Tüm gömülü sorular tek pakette: `EMBEDDED_PACKAGE_ID = 'embedded-core'` (`:14`), legacy de aynı pakete yazılır (`:133`).
- Sıra: legacy (18 ders × 3 = 54 soru, `:185-205`) → V10/V104/V105 (`:207-230`).
- Çakışma → `question_bank.id` PRIMARY KEY (`:73`) ihlali → `INSERT` reddeder → `withTransactionAsync` geri alır (`:168-237`); `app_meta` sürümü de yazılmaz.
- Görünen sonuç **çökme değil**: `app/_layout.tsx:22-24` sadece `console.warn`; quiz ekranında `Promise.all` reddedilir, `questionSet` boş kalır → "doğrulanmış soru yok" ekranı (`quiz.tsx:45-57,128-141`). Her açılışta tekrar dener ve tekrar başarısız olur.
- id'ler **kararlı olmalı**: `quiz_attempts.question_id` FK'sız (`reviewStore.ts:60-68`), id değişirse geçmiş/adaptive istatistik öksüz kalır (silinmez).

## 5. `EMBEDDED_PACKAGE_VERSION`

- Değer `4` (`questionBankStore.ts:15`), kapı: `Number(current?.value ?? 0) === EMBEDDED_PACKAGE_VERSION` ise **hiç seed etmez** (`:160-165`).
- Eşitse yeni içerik yüklenmez; kurulu cihazlar eski bankada kalır. Bu yüzden içerik değişince **artırılmalı**.
- Artırılınca tüm gömülü satırlar silinip yeniden yazılır (`:178-183`) → düzeltmeler, `correctAnswer` ve konu atamaları yayılır; id'ler aynı kalırsa geçmiş korunur.
- Sürüm ayrıca `getQuestionBankStats().packageVersion` ile raporlanır (`:338`).

## 6. Görsel spec ve çökme riskleri

`visual_json` `JSON.parse` edilip **şekil doğrulaması yapılmadan** cast edilir (`questionBankStore.ts:252-259`); tip güvencesi runtime'da yoktur.
- **Gerçek çökme:** tanınmayan `kind` veya `items` yok → son `else` dalında `visual.items.map` (`question-visual.tsx:137-139`). Aynı şekilde `bars`'ta `values` yok (`:67`) veya `number-line`'da `points` yok (`:44`) → `undefined.map`.
- `number-line` aralık dışı nokta **çökmez**, %0-100'e kırpılır (`:45`). `highlight` `points` içinde değilse sessizce vurgusuz kalır (strict `===`, `:46`). Boş `points` → boş çizim, çökme yok.
- `bars` label/value uzunluğu uyuşmazsa çökmez; eksik label yerine indeks basılır (`:74`).
- `icon-grid` `count` 1..60 aralığına kırpılır (`:93`); NaN → 0 ikon, çökme yok.
- `timeline` yıla göre sıralar (`:112`); boş dizi sorunsuz. Aynı `point` değeri tekrarı → React duplicate key uyarısı (`:49`).

## 7. Spec'in kaçırdığı / yanlış söylediği yerler

1. **`data/packs/*.ts` kontratı kodda yok.** Seed yalnızca üç fabrika importunu dolaşır (`questionBankStore.ts:2-9,207-211`). `data/packs/` dizini mevcut değil; yeni dosya yazmak **hiçbir şey yapmaz**.
2. **`getTopicsForCatalogCourse` paket konularını birleştirmez** (`topicCatalog.ts:483-486`). Spec §5 son cümlesi ve §2.1/4 yanlış: paketin `topics` dizisi dekoratif, `topicIndex` katalog sırasına göre yorumlanır.
3. **ÖSYM/YÖK katalogda yok.** `LEVELS` yalnızca İlkokul/Ortaokul/Lise/ALES (`courseCatalog.ts:14-61`). `getAllCourseKeys()` **18** anahtar döner (spec "19" diyor; `offlineContent` 18×3=54 soru). `levelName: 'ÖSYM'` sorular DB'ye yazılır ama UI'da gezilemez (`app/level/[levelName].tsx:9` `COURSES_BY_LEVEL`) ve `topicName` null olur.
4. **Doğrulayıcı script yok.** `scripts/` içinde sadece `check-client-secrets.mjs`, `reset-project.js`. `scripts/validate-question-packs.ts` yok; spec §4'te sayılan kontrollerin (topicIndex sınırı, `questionIds` tutarlılığı, toplam sayılar, konu adı tekrarı) hiçbiri kodda yok. `node ...ts` zaten çalışmaz.
5. **`validateQuestion`/`validatePack` yalnızca 4 işi yapar:** boş prompt/explanation, 4 benzersiz seçenek, cevabın seçeneklerde olması, paket içi id tekrarı. `levelName`/`courseName` katalog eşleşmesi, `topicIndex` sınırı, `questionIds`, `visual` şekli **denetlenmez**.
6. **"Uygulama açılışta çöker" yanlış.** Hatalar transaction'ı geri alır, `_layout.tsx:22-24` yutar; kullanıcı boş banka görür. Hata sessizdir, bu yüzden daha tehlikelidir.
7. **V10 paketi doğrulanmıyor** — spec'in "validateQuestion fırlatır" ifadesi V10 için geçersiz; orada tek koruma hydrate'in sessiz `null`'ı.
8. **`questionKind: 'visual-choice'` + `visual` yok** kombinasyonu kodda denetlenmez; görsel alan boş çizilir (`quiz.tsx:199-202`), zararsız ama tutarsız.
9. Spec'in "seçenekler `A)` öneki içermemeli" kuralı kodda zorlanmaz; UI önek basmıyor (`quiz.tsx:220`), yani önek yazılırsa **kullanıcıya görünür** ve cevap eşleşmesi yine birebir kalır.
10. Küçük ama gerçek: `ORDER BY difficulty ASC` (`:292,300`) alfabetik sıralar → `easy, hard, standard`; adaptive seçimde "hard" ortadan önce gelir (`adaptiveQuestionStore.ts:45-63`).

## 8. Soru yazan ajan için 10 satırlık kontrol listesi

1. `id` global olarak tekil ve **asla değişmeyen** bir şema (`osym-tyt-mat-0001`); legacy `im1/om1/lf1` ile çakışma yok.
2. `options` tam 4 eleman, hepsi birebir farklı, önek (`A)`) yok, emoji yok.
3. `correctAnswer`, `options` elemanlarından **karakter karakter aynı** kopya (boşluk, büyük/küçük harf, `,`/`.` farkı yok).
4. `prompt` ve `explanation` boş/whitespace değil; açıklama çözümü gösterir.
5. `levelName`/`courseName` **yalnızca** `courseCatalog.ts` içindeki 18 çiftten biri (ÖSYM/YÖK yok).
6. `topicIndex`, `topicCatalog.ts`'deki o dersin konu sayısına göre `0..n-1`; taşma modülo ile sessizce kayar.
7. `difficulty` ∈ `easy|standard|hard`; `questionKind` ∈ 4 değer; `visual-choice` kullanıyorsan `visual` dolu.
8. `visual` kullanacaksan `kind` 5 değerden biri ve ilgili alanlar eksiksiz (`bars`: `values`, `number-line`: `points`); `labels.length === values.length`.
9. Sayılar metin olarak `String(n)` ile aynı biçimde yazılır (`2,5` ↔ `"2,5"` tutarlı; `2.50` yazma).
10. İçerik değiştiyse `EMBEDDED_PACKAGE_VERSION` (`questionBankStore.ts:15`) artırılır; aksi halde kimse yeni soruyu görmez.
