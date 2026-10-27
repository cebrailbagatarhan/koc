# Ürün yönü: offline-first kişisel eğitim koçu

Koç uygulamasının çekirdeği üç yerel sinyali birleştirir:

1. **Çalışma geçmişi:** hangi derse ne kadar dönüldüğü.
2. **Quiz performansı:** hangi soruların doğru/yanlış yapıldığı ve tekrar aralığı.
3. **Kişisel kaynaklar:** kullanıcının eklediği not ve dosyalar.

Bunlar AI olmadan temel koçluk üretmek için yeterlidir: günlük tekrar, zayıf ders önceliği, kaynak odaklı çalışma ve ilerleme görünümü.

Gelecekte AI eklendiğinde sağlayıcının görevi çekirdeği değiştirmek değil, bu yerel veriyi kullanarak açıklama, soru üretimi ve kaynak özetleme gibi ek yetenekler sağlamaktır.

Önerilen sonraki ürün adımları:

- konu kataloğunu derslerin altına kalıcı biçimde eklemek,
- PDF metin çıkarımını güvenilir bir parser ile cihazda veya isteğe bağlı sunucu işleminde yapmak,
- hedef/takvim sistemi (`learning_goals`) eklemek,
- kaynak chunk'larından otomatik yerel çalışma kartları üretmek,
- hesap/senkronizasyon eklenirse yerel-first davranışı korumak.
