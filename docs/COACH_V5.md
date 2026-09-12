# Koç V5 — Günlük plan ve konu ustalığı

## Ürün amacı

Koç artık yalnızca ders, konu, quiz ve tekrar ekranları sunmaz. Yerel öğrenme geçmişinden kullanıcının o gün ne yapması gerektiğini çıkaran bir çalışma rotası üretir.

## Tasarım ilkeleri

- **Seri ile günlük hedef ayrıdır.** Seri, o gün gerçek bir öğrenme eylemi yapılınca sürer; günlük planın tamamlanması seri için zorunlu değildir.
- **Tekrar önce gelir.** Bekleyen aralıklı tekrarlar varsa günlük planın ilk adımı bunlardır.
- **Zayıf konu görünürdür.** Quiz doğruluğu, soru kapsamı ve bekleyen tekrarlar konu ustalığına yansır.
- **İlerleme de korunur.** Kullanıcının en son çalıştığı derste başlanmamış bir konu varsa günlük plana yeni ilerleme adımı eklenir.
- **Offline-first.** Planlama ve ustalık hesabı yalnızca cihazdaki SQLite verisiyle yapılır; API gerekmez.

## Ustalık seviyeleri

`storage/coachStore.ts` konu bazında şu seviyeleri üretir:

1. `not-started` — henüz quiz denemesi yok.
2. `needs-work` — doğruluk düşük veya bekleyen tekrar var.
3. `familiar` — temel doğruluk oluştu ancak yeterli tekrar yok.
4. `proficient` — yüksek doğruluk ve yeterli pratik var.
5. `mastered` — konu sorularında tam doğruluk, yeterli tekrar ve bekleyen açık tekrar yok.

Kullanıcıya 0–100 arası bir konu puanı gösterilir. Bu puan sınav notu değildir; çalışma önceliği ve öğrenme durumu sinyalidir.

## Günlük plan

Plan en fazla üç görev içerir:

- **Tekrar:** bugün zamanı gelen yanlış sorular.
- **Güçlendir:** çalışılmış konular arasında en çok desteğe ihtiyaç duyan konu.
- **İlerle:** son çalışılan derste henüz başlanmamış uygun bir konu.

Plan SQLite içindeki `daily_plan_tasks` tablosunda gün bazında sabitlenir. Böylece gün içinde performans değişse bile görev listesi sürekli yer değiştirmez.

## Devam et

`topic_visits` tablosu en son açılan konuyu tutar. Ana ekran kullanıcının son kaldığı konuya tek dokunuşla dönmesini sağlar.

## İlham alınan ürün desenleri

Bu sürümde herhangi bir uygulamanın kodu veya görsel tasarımı kopyalanmadı. Yalnızca yaygın öğrenme ürünü desenleri Koç mimarisine uyarlandı:

- konu/skill mastery seviyeleri,
- zayıf alanlara kişiselleştirilmiş pratik,
- ayrı günlük hedef ve seri mekanikleri,
- son kaldığın yerden devam etme,
- kısa, eyleme dönük günlük çalışma rotası.

## Sonraki mantıklı katmanlar

- konu ustalığını kaynak/PDF chunk performansıyla ilişkilendirmek,
- sınav tarihi girildiğinde plan yoğunluğunu artırmak,
- konu önkoşullarıyla öğrenme yolu oluşturmak,
- farklı soru tipleri (çoktan seçmeli, doğru/yanlış, yazılı cevap, eşleştirme),
- yerel bildirimleri günlük plana göre zamanlamak.
