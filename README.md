# KoçumAI

KoçumAI, farklı eğitim seviyelerinde ders seçimi, konu anlatımı/sohbet ve soru çözümü akışlarını deneyen Expo Router tabanlı bir mobil eğitim prototipidir.

> **Durum:** Deneysel prototip. İlkokul, ortaokul, lise ve ALES navigasyonu uygulanmıştır. AI özellikleri bu repository'de bulunan bir model değildir; güvenilir bir backend proxy gerektirir ve proxy yapılandırılmadığında güvenli biçimde hata verir.

## Uygulanan Akış

1. Eğitim seviyesi seçilir: İlkokul, Ortaokul, Lise veya ALES.
2. Seviyeye göre ders seçilir.
3. Kullanıcı konu anlatımı/sohbet ya da soru çözümü ekranına gider.
4. Sohbet ekranı metin ve isteğe bağlı görseli backend proxy'ye gönderir.
5. Quiz ekranı proxy'nin doğrulanmış soru yanıtını gösterir.

Dosya tabanlı route yapısı:

- app/(tabs)/index.tsx: seviye seçimi
- app/level/[levelName].tsx: seviyeye göre dersler
- app/course/[levelName]/[courseName].tsx: konu anlatımı veya quiz seçimi
- app/chat/[levelName]/[courseName].tsx: metin/görsel sohbet
- app/quiz/[levelName]/[courseName].tsx: soru çözümü
- api/gemini.ts: istemci ile güvenilir proxy arasındaki sözleşme

Ders listeleri şu an kaynak kod içinde sabittir; bir içerik yönetim sistemi veya doğrulanmış müfredat veri tabanı yoktur.

## Kurulum

Node.js ve Expo geliştirme ortamı gerekir.

~~~bash
npm ci
cp .env.example .env
npm start
~~~

Android, iOS veya web hedefi Expo arayüzünden seçilebilir.

## AI Güvenlik Mimarisi

Mobil uygulamada Gemini/Google sağlayıcı anahtarı veya doğrudan sağlayıcı SDK'sı bulunmamalıdır. .env yalnız public proxy URL'sini içerir:

~~~dotenv
EXPO_PUBLIC_AI_PROXY_URL=https://your-ai-proxy.example.com
~~~

Production URL'si HTTPS olmalıdır; düz HTTP yalnız localhost ve 127.0.0.1 için kabul edilir. Sağlayıcı anahtarı backend secret store'da tutulmalı; backend authentication, kullanıcı/IP rate limit'i, request-size sınırı, şema doğrulama ve hassas log redaction uygulamalıdır.

İstemcinin beklediği endpoint ve yanıt şemaları [proxy sözleşmesinde](docs/ai-proxy.md) tanımlıdır. Bu backend repository'ye dahil değildir.

## Kontroller

~~~bash
npm run lint
npm run test:security
~~~

test:security, istemci kaynaklarına sağlayıcı credential'ı, public provider-key değişkeni veya doğrudan sağlayıcı SDK'sı eklenmesini engeller.

## Veri ve Gizlilik

Sohbet ekranındaki görseller gönderilmeden önce istemcide Base64'e çevrilir ve proxy'ye aktarılır. Production kullanımı öncesinde açık kullanıcı rızası, saklama süresi, içerik silme politikası ve çocuklara ait veriler için hukuki/ürün incelemesi gerekir. Proxy, ham istemleri ve görselleri varsayılan olarak loglamamalıdır.

## Bilinen Sınırlar

- Production AI backend'i yoktur; AI akışları proxy olmadan çalışmaz.
- Eğitim içeriğinin pedagojik doğrulaması ve kaynak gösterimi yapılmamıştır.
- Kullanıcı hesabı, ilerleme senkronizasyonu ve öğretmen paneli yoktur.
- Component/E2E testleri ile gerçek cihaz ekran görüntüleri henüz eklenmemiştir.
- Erişilebilirlik ve çocuk güvenliği incelemesi tamamlanmamıştır.

## Yol Haritası

- Gerçek cihaz ekran görüntüleri ve kısa demo
- Authentication/rate-limit içeren server-side AI proxy
- Müfredat sürümü, kaynak ve editoryal onay bilgisi olan içerik modeli
- Component ve navigasyon testleri
- Erişilebilirlik, gizlilik ve çocuk güvenliği incelemesi
- Öğrenci ilerleme takibi ve veli/öğretmen görünümü
