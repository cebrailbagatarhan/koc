# Koç tekrar motoru

Bu doküman `storage/reviewStore.ts` içindeki çevrimdışı tekrar mantığının ürün davranışını özetler.

## Amaç

Yanlış yapılan quiz sorularını kaybetmemek ve kullanıcının zayıf olduğu soruları giderek seyrekleşen aralıklarla yeniden karşısına çıkarmak.

## Zamanlama

- Yanlış cevap: yaklaşık 6 saat sonra tekrar.
- İlk doğru tekrar: 1 gün.
- Sonraki doğru tekrar: 3 gün.
- Sonraki doğru tekrar: 7 gün.
- Devam eden doğrular: yaklaşık 1.8x büyüyen aralıklar, en fazla 30 gün.
- Her yeni yanlış: doğru seri ve aralık sıfırlanır, soru kısa döngüye döner.

## Veri

`quiz_attempts` her cevabın tarihçesidir. `review_items` yalnızca tekrar planına alınmış soruların güncel durumunu tutar.

## Koç önerisi

Zayıf ders sıralaması `course_progress` içindeki toplam doğruluk oranından çıkarılır. Tekrar planındaki soru sayısı bu analize ek sinyal olarak gösterilir. Bu özellik tamamen yereldir ve AI gerektirmez.
