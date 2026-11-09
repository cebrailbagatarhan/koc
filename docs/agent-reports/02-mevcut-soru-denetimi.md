# 02 · Mevcut Soru Denetimi

Kapsam: `QUESTION_BANK` (18 ders × 3 = 54), `embeddedQuestionPackV10` (390), `deterministicQuestionFactoryV104` (~300), `crossSubjectQuestionFactoryV105` (160) ≈ **900 soru**. Ölçüt: `docs/QUESTION_AUTHORING_SPEC.md`. Kod değiştirilmedi.

**Sonuç:** 54 elle yazılmış sorunun **cevap anahtarı temiz** (tek yanlış cevap yok). Asıl hasar üretilen paketlerde: **15 tekil gerçek hata**, **25 geçersiz içerik**, **~330 birebir/yakın kopya**, **~%95 yanlış konu etiketi** ve **%100 "cevap A" sapması**.

## 1. Gerçek hatalar — matematik / cevap anahtarı

| id | sorun | düzeltme |
|---|---|---|
| v10-om-angle-7 | İki açı toplamı 180° → üçüncü açı **0°** (dejenere üçgen, imkânsız) | Açı havuzundan 180 çıkar; üst sınır 170° |
| v10-om-angle-8 | Toplam 216° → cevap **−36°**; seçeneklerde negatif açı | 216 çıkar; `answer > 0` doğrulaması ekle |
| v104-om-ratio-2 | 9:18 → en sade **1:2**, cevap 1 iken anahtar **3** | Sadeleştirmeyi gcd ile hesapla (`first/gcd`) |
| v104-om-ratio-5 | 36:54 → **2:3**, cevap 2 iken anahtar **6** | Aynı düzeltme |
| v104-om-ratio-7 | 6:12 → **1:2**, cevap 1 iken anahtar **2** | Aynı düzeltme |
| v104-om-ratio-9 | 20:30 → **2:3**, cevap 2 iken anahtar **4** | Aynı düzeltme |
| v104-om-ratio-11 | 12:16 → **3:4**, cevap 3 iken anahtar **6** | Aynı düzeltme |
| v104-om-ratio-20 | 18:18 → **1:1**, cevap 1 iken anahtar **3** | Aynı düzeltme |

Not: `v104-om-ratio-*` üretiminde `first`/`second` aralarında asal değilse 20 sorunun 6'sı yanlış; kalan 14'ü tesadüfen doğru.

## 2. Bozuk seçenek kümeleri (4 benzersiz seçenek kuralı ihlali)

| id | sorun | düzeltme |
|---|---|---|
| v10-om-pct-1 | Seçenekler `30, 40, 20, 20` — "20" iki kez (çeldirici = yüzde değeri) | 3. çeldirici `answer/2` veya `answer+5` yap |
| v10-lm-root-7 | `|b| = 8 = cevap` → tekrar elenince **3 seçenek** | Çeldiriciyi `Math.abs(b)` yerine `c` türeviyle üret |
| v10-lm-root-8 | Aynı hata (`|b| = 10 = cevap`) → **3 seçenek** | Aynı düzeltme |
| v10-lm-f-1 | `f(x) = 4x + -1` (bozuk gösterim) **ve** iki kez `-20` | `b<0` için `- ${abs(b)}`; `answer+1` çakışmasını ayıkla |
| v10-lm-f-2 | `f(x) = 3x + 0` ve `answer-b` cevaba eşit → **3 seçenek** | `b = 0` üretme; seçenekleri `Set` ile doğrula |
| v10-lf-6-1 | `10 N, 2 kg → 5`; çeldiriciler `10, 0, 10` — "10" iki kez | `answer*2` yerine `answer*3` |
| v10-lf-6-2 | Aynı hata (varyant 2) | Aynı düzeltme |

Kök neden: `embeddedQuestionPackV10.ts:32` `numericQuestion` yalnızca `value !== answer` filtresi uygular, **kendi içinde tekrarı ayıklamaz**; V10 paketinde `validateQuestion` hiç çağrılmıyor (`:515`). V104/V105 doğruluyor, V10 doğrulamıyor — spec §1.1'deki "validator hata fırlatır" garantisi V10 için geçersiz.

## 3. Geçersiz içerik — şablon cümlenin kelime havuzuna zorla uygulanması

| id | sorun | düzeltme |
|---|---|---|
| v105-it-usage-13, -14, -10, -5 | Doğru şık "Bu yol oldukça **mutlu / üzgün / genç / geç**." — anlamsız; "geç/erken" sıfat değil zarf, soru kökü "sıfat olarak" diyor | Her kelimeye kendi cümlesini yaz ya da sıfat havuzunu ayır (mutlu/üzgün/genç/erken/geç çıkar) |
| v10-it-sentence-1..10 | Aynı kalıp: "Bu yol oldukça **erken / genç**."; çeldiriciler de ("Masanın üzerinde erken var.") anlamsız → dört şıkkın tamamı geçersiz | Kalıbı kelimeye göre kur; en az iki anlamlı çeldirici üret |
| v105-it-usage-1..15 | 15 sorunun tamamı aynı gövde ve aynı doğru şık kalıbı ("Bu yol oldukça X.") | Gövde çeşitlendir (en az 4 farklı kalıp) |

## 4. Sistemik kusurlar (tek tek sayılmadı, en yüksek risk)

| id / yer | sorun | düzeltme |
|---|---|---|
| Tüm üretilen sorular | **Doğru cevap her zaman 1. seçenek**: `options: [correctAnswer, ...distractors]` (`V105:27`, `V10:34`, `V10:86`) ve quiz ekranı seçenekleri karıştırmıyor (`app/quiz/[levelName]/[courseName].tsx:206`) | Üretimde seçenekleri deterministik karıştır (id tohumlu) veya UI'da shuffle et |
| `topicIndex: index % 3` (V10 Fen, Sosyal, Kimya, Biyoloji, Edebiyat, Tarih, İngilizce; V105 Fen/Sosyal/Tarih) | Konu etiketi içerikle ilgisiz: "Kuvvetin SI birimi" → *Fotosentez ve Canlılar*, "İhracat" → *Harita ve Yönler*, "Ses boşlukta yayılır mı" → *Fotosentez* | Her soruya konu adı **elle** verilsin; `index % n` yasak |
| v105-li-present-9..15 | Lise İngilizce'de "She ___ every day." → *Conditionals* konusuna düşüyor | Simple present soruları yalnız Ortaokul'a; Lise'de conditionals gövdesi kullan |
| v105-li-modal-1..15 | "can + fiil" soruları *Question Forms* / *Academic Vocabulary* konusunda | "Modal verbs" konusu aç veya mevcut konuya taşıma |
| v105-it-usage-* | Sıfat kullanımı soruları *Adlar* konusunda | *Sözcükte Anlam* veya yeni "Sıfatlar" konusu |
| v104-im-div-1..20 | Bölme soruları *Çarpma Mantığı* konusunda | "Bölme" konusu ekle |
| Açıklamalar | Çoğu yalnızca cevabı tekrar ediyor: "Doğru seçenek parçanın tamamını kapsayan temel düşünceyi verir." (V10 `ot-main` ×8, V105 `ot-main` ×10), "`{a} ile {b} toplandığında {answer} elde edilir." (28 soru), "`{english} = {turkish}`." (30 soru) | Açıklama ara işlemi/kanıtı göstersin: "İki açı 35+48=83°, 180−83=97°" |

## 5. Tekrarlar

| id | sorun | düzeltme |
|---|---|---|
| v10-of-1-2, v10-os-1-2, v10-lk-1-2, v10-lb-1-2, v10-le-1-2, v10-oi-1-2, v10-lf-1-2, v10-ih-1-2 | Varyant 2, varyant 1'in **aynı gövde + aynı seçenek + aynı cevabı**; tek fark "Bilgiyi uygula:" öneki (80 soru) | Varyant üretme; farklı kurgu/sayı üret |
| v10-lt-year-1-b … -6-b, v10-lt-order-1-b … -5-b | `result.map(... id + '-b')` ile **11 birebir kopya** (aynı yıl, aynı seçenekler) | Kopyalamayı kaldır; ikinci turda farklı olay seç |
| v105-of-apply-*, v105-os-apply-*, v105-lt-reason-* | "Bilgiyi uygula / Kavramı seç / Tarihsel düşünme:" önekli 40 kopya | Aynı |
| v105-of-fact-1..13 ↔ v10-of-*, v10-lk-*, v10-lb-*, v10-lf-2 | Aynı 13 fen olgusu iki pakette (Kuvvet birimi, kaynama, fotosentez, pH 7, atom numarası, ribozom, mitokondri, Joule…) | Tek kaynak havuzu; paket başına olgu tekrarı yasak |
| v105-os-fact-* ↔ v10-os-* | 10 sosyal olgu birebir (başkent, doğu, ihracat, göç, iklim, oy, kuzey, sürdürülebilirlik, zaman çizelgesi, demokrasi) | Aynı |
| v105-it-ant-1..10 ↔ v10-it-ant-1..10 ↔ it1 | "“hızlı” kelimesinin zıt anlamlısı" üç pakette aynı | Aynı |
| v104-im-add-* / v10-im-add-* / im1; v104-om-eq-* / v10-om-eq-* / om1; v104-om-pct-* / v10-om-pct-* / as1 | Aynı gövde şablonu, sadece sayı değişiyor (~150 soru: "+ işleminin sonucu", "%N'i kaçtır", "iki açının toplamı") | Şablon başına en fazla 3 soru; kurgu değişmeli |
| v10-ot-main-* / v10-ot-evidence-*; v10-av-main-* / v10-av-infer-*; v105-ot-main-* / v105-av-main-* | Aynı parça + **aynı doğru şık**; "çıkarım" sorusunun cevabı ana düşünce (28 soru) | Çıkarım sorusuna metinde yazmayan, kanıtla desteklenen ayrı yargı yaz |
| v105 reading parça 2-7 ↔ v10 MIDDLE_TURKISH_PASSAGES 3,4,5,6,7,8 | 6 parça yeniden yazılmış kopya (hızlı okuma, takım, teknoloji, problem, ağaç, kütüphane) | Parça havuzunu tekilleştir |

## 6. Belirsizlik / tahmin edilebilirlik

| id | sorun | düzeltme |
|---|---|---|
| v10-lt-order-1..5 (+ -b) | 4 şıktan 2'si "İkisi aynı yıl", "Tarih verilemez" → **2 gerçek seçenek, %50 şans** | 4 gerçek olay; "hangisi daha önce" yerine sıralama sor |
| v10-ot-main-*, v10-av-*, v105-ot-main-* | 1 gerçek çeldirici + 2 absürt meta şık ("Metinde hiçbir düşünce savunulmamıştır.") | 3 gerçek, yakın ama yanlış ana düşünce yaz |
| v10-of-7-1, v105-of-fact-8 | "Ses boşlukta yayılır mı? → Hayır / Evet" → iki şık | Soruyu "Ses neden boşlukta yayılmaz?" biçimine çevir |
| os3, lt3, le-7-1, v105-lt-core-6 | Absürt çeldirici ("Saatleri değiştirmek", "Sayıları yuvarlamak", "Nesnel başlık") ve **en uzun şık doğru** | Aynı uzunlukta, aynı dilbilgisel formda çeldirici |
| ot1 | Şıklarda "masa" var, cümlede "masaya" geçiyor — paralel değil | Şıkkı "masaya" yap veya "masa"yı çıkar |
| v10-le-2-1 | "Dizelerin oluşturduğu küme → **Bent**"; "dörtlük" de savunulabilir | Kökü netleştir: "dört dizeden oluşan bölüm" → dörtlük |

## 7. İmla, biçim, sayı

| id | sorun | düzeltme |
|---|---|---|
| v10-as-pct-1..12, v104-as-pct-*, v104-om-pct-*, v10-om-pct-* | `%20'i`, `%10'i`, `%30'i` — sayı okunuşuna göre ek yanlış (≈22 soru) | `%20'si`, `%10'u`, `%30'u`, `%40'ı`, `%50'si` (kural tablosu) |
| v104-im-sub-1..20 | `23'dan … kalır` — "yirmi üç" → **23'ten** (≈18 soru) | Eki sayının okunuşuna göre üret |
| v10-om-eq-*, v104-om-eq-* | `2'e bölünür`, `6'e bölünür` — **2'ye**, **6'ya** (12 soru) | Aynı kural |
| Tüm şablonlar | ASCII kesme: `4'e`, `23'dan`; spec `’` istiyor | `’` kullan |
| v104-lm-log-1..20 | `log_2(8)` — LaTeX benzeri alt çizgi; spec yasaklıyor | `log₂(8)` veya "2 tabanında log 8" |
| v10-lm-f-1 | `f(x) = 4x + -1` | `f(x) = 4x − 1` |
| v10-ii-en-* , v10-ih-*, v10-of-*-2 | Gövde/çipte emoji (🍎, 🛡️, 🔬); ÖSYM/YÖK'te yasak, İlkokul'da sınırda | Emojiyi yalnız `visual` alanına koy, gövdeye koyma |
| im1 | Seçenekler `32, 42, 52, 41` — sırasız, 41 kalıbı bozuyor | `32, 41, 42, 52` gibi artan sıra |
| v10-lm-root-* | `x² - 5x` ASCII eksi | `x² − 5x` |

## 8. Kapsam boşlukları

| ders / konu | durum | öneri |
|---|---|---|
| İlkokul::İngilizce · **Sınıf ve Günlük Yaşam** | `questionIds: []` — **tek sıfır sorulu konu** | En az 6 soru |
| Hayat Bilgisi, Fizik, Kimya, Biyoloji, Edebiyat | Ders başına ~23 soru (~7/konu); V104/V105 bu derslere hiç soru üretmiyor | Ders başına 40+ |
| Ortaokul::Türkçe | 29 soru; 16'sı aynı 8 parçanın kopyası | Gerçek 30 parça |
| Fen Bilimleri / Sosyal Bilgiler | 53 soru ama 30'u kopya; konu dağılımı bozuk (9/10 yanlış konu) | Konu başına dengeli |
| ÖSYM (TYT, AYT Sayısal, AYT Eşit Ağırlık, KPSS), YÖK (YÖKDİL, Akademik) | `courseCatalog.ts`'te **yok**; spec §5'te var. Bu derslere yazılan soru **görünmez** olur | Yeni içerikten önce katalog + konu tanımı ekle |
| Tüm dersler | Elle yazılmış 54 sorunun **tamamı** üretilen paketlerce kopyalanmış (im1, it1, of1-3, lk1-3, lb1-3, li1, om1, as1, av1…) | Yeni içerik mevcut 54'ü tekrar etmesin |
| `scripts/validate-question-packs.ts` | Spec §4'te var, **dosya yok**; spec §3 "19 ders" diyor, gerçek 18 | Doğrulayıcıyı yaz, spec'i düzelt |

## 9. Yeni içerik için kaçınılacak 10 hata

1. **Doğru cevabı 1. sıraya koymak** — şu an 900 sorunun %100'ü A; seçenekleri tohumlu karıştır.
2. **Aynı gövdeyi önekle ikinci kez üretmek** ("Bilgiyi uygula:", "Kavramı seç:") — 120+ kopya.
3. **`topicIndex = index % 3`** ile konu atamak — içerikle ilgisiz etiket.
4. **Tek cümle kalıbını tüm kelime havuzuna uygulamak** ("Bu yol oldukça mutlu.").
5. **Çeldirici çakışmasını kontrol etmemek** (`30,40,20,20` / `10,0,10` / 3 seçenekli sorular).
6. **Fiziksel/mantıksal olmayan değerler** (216° → −36°, 180° → 0°, negatif uzunluk).
7. **"En sade hâli" derken sadeleştirmeyi hesaplamamak** (gcd yok).
8. **Absürt veya paralel olmayan çeldirici** ("Saatleri değiştirmek", "Nötr yükü yok").
9. **Açıklamada çözümü değil cevabı tekrarlamak** ("Doğru cevap X'tir.").
10. **Türkçe ek/biçim savrukluğu**: `%20'i`, `23'dan`, `log_2`, ASCII kesme, emoji, `2.5` yerine `2,5` disiplini.
