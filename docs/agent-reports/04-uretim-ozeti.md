# Üretim Özeti — ÖSYM / YÖK Soru Paketleri

Tarih: 9 Kasım 2026 · Paket sürümü: `EMBEDDED_PACKAGE_VERSION = 5`

## Sonuç

| Ölçü | Önce | Sonra |
|---|---|---|
| Toplam soru | ~1.000 (726'sı tekrar üretimi) | **1.195** |
| Yerleşik banka (18 ders) | 54 (ders başına 3) | **126** (ders başına 7) |
| ÖSYM/YÖK sorusu | 0 | **343** |
| Konu sayısı | 60 | **86** |
| Soruya bağlı olmayan konu | 1 | **0** |
| Doğrulama hatası | 4 geçersiz soru + 6 yanlış cevap | **0** |

Seviye dağılımı: İlkokul 232 · Ortaokul 281 · Lise 211 · ALES 128 · **ÖSYM 271** · **YÖK 72**.

## Ajanlar ve çıktıları

### Denetim (3 ajan, kod değiştirmedi)

| Ajan | Rapor | Kritik bulgu |
|---|---|---|
| Format denetimi | `01-format-kontrati.md` | Birebir olmayan `correctAnswer` soruyu **sessizce** görünmez yapıyor; yinelenen id tüm seed transaction'ını geri alıyor |
| Mevcut içerik denetimi | `02-mevcut-soru-denetimi.md` | 15 gerçek hata, 4 geçersiz soru; **doğru cevap her zaman A şıkkında** |
| Katalog bağlantısı | `03-katalog-baglantisi.md` | `data/packs/` hiçbir yerden import edilmiyordu; konu listesi paket konularını birleştirmiyordu |

### Üretim (9 ajan, 343 soru)

| Paket | Dosya | Soru | Konular |
|---|---|---|---|
| TYT Türkçe | `osymTytTurkce.ts` | 40 | Sözcük ve Cümle Anlamı, Paragraf, Dil Bilgisi, Yazım ve Noktalama |
| TYT Matematik | `osymTytMatematik.ts` | 39 | Temel Matematik, Problemler, Geometri |
| TYT Fen | `osymTytFen.ts` | 36 | Fizik, Kimya, Biyoloji |
| TYT Sosyal | `osymTytSosyal.ts` | 36 | Tarih, Coğrafya, Felsefe |
| AYT Sayısal | `osymAytSayisal.ts` | 40 | Matematik, Fizik, Kimya, Biyoloji |
| AYT Eşit Ağırlık | `osymAytEa.ts` | 40 | Matematik, Edebiyat, Tarih, Coğrafya |
| KPSS | `osymKpss.ts` | 40 | Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık |
| YÖKDİL | `yokYokdil.ts` | 36 | Fen, Sağlık, Sosyal Bilimler (akademik İngilizce) |
| YÖK Akademik | `yokAkademik.ts` | 36 | İktisat-İşletme, Hukuk, Mühendislik |

Doğru şık dağılımı: A %25 · B %26 · C %26 · D %23. Zorluk: ~%25 kolay, %50 orta, %25 zor.

### İyileştirme (2 ajan)

| Dosya | İş |
|---|---|
| `legacyIlkokulOrtaokul.ts` + `legacyLiseAles.ts` | Yerleşik banka 54 → 126 soru; mevcut id'ler korundu, her konuya en az 2 soru |
| `embeddedQuestionPackV10.ts`, `deterministicQuestionFactoryV104.ts`, `crossSubjectQuestionFactoryV105.ts` | gcd hatası (6 yanlış cevap), dejenere üçgenler, 4 benzersiz seçenek ihlalleri, kopya gövdeler; V10'a eksik olan doğrulama eklendi |

## Yapılan kod değişiklikleri

| Dosya | Değişiklik |
|---|---|
| `data/courseCatalog.ts` | `ÖSYM` (TYT, AYT Sayısal, AYT Eşit Ağırlık, KPSS) ve `YÖK` (YÖKDİL, Akademik) seviyeleri |
| `data/osymYokPack.ts` | 9 paketi birleştiren, id/seçenek doğrulaması yapan yeni modül |
| `data/legacyQuestionBankV11.ts` | Yerleşik banka genişletmesini birleştiren yeni modül |
| `data/topicCatalog.ts` | Paket konularını ve yeni soru id'lerini mevcut konulara birleştirir |
| `data/offlineContent.ts` | `getQuizQuestions` önce genişletilmiş bankaya bakar |
| `storage/questionBankStore.ts` | Yeni paket seed'e eklendi, sürüm 5, konu ataması **id üzerinden**, seçenekler deterministik karıştırılır |
| `app/topic/.../[topicName].tsx` | Konu quizi sayısı artık SQLite'tan okunur (eskiden yalnız 3'lü bankadan) |
| `scripts/validate-question-packs.ts` | Yeni doğrulayıcı (yeni paket + yerleşik banka formatı) |
| `docs/QUESTION_AUTHORING_SPEC.md` | Soru yazım sözleşmesi |

## Bilinen sınırlar

- V10/V104/V105 hâlâ şablon üretimi: 726 sorunun bir kısmı aynı kalıbın farklı sayılarla tekrarı. İçerik doğru ama çeşitlilik sınırlı.
- `topicIndex` alanı yeni paketlerde yalnızca doğrulama amaçlı; konu ataması `questionIds` üzerinden yapılır.
- Doğrulayıcı dil bilgisi/anlam denetimi yapamaz; her paket ajanı cevapları elle kontrol etti, ancak bağımsız bir editoryal gözden geçirme hâlâ gerekli.
- Uygulama içi görsel test yapılmadı (`node_modules` yok, Expo çalıştırılmadı).
