# KoçumAI

KoçumAI, İlkokul, Ortaokul, Lise ve ALES seviyeleri için ders, konu anlatımı, soru çözümü, kaynak kütüphanesi, tekrar ve ilerleme akışları sunan Expo Router tabanlı offline-first bir mobil eğitim uygulamasıdır.

> **Durum:** Uygulama API anahtarı olmadan tamamen çevrimdışı çalışır. AI sağlayıcı entegrasyonu bilinçli olarak kapalıdır; `api/gemini.ts` yalnızca gelecekteki bir sağlayıcı için boş bir adaptördür (`AI_FEATURES_ENABLED = false`).

Mimari ayrıntılar için [docs/OFFLINE_ARCHITECTURE.md](docs/OFFLINE_ARCHITECTURE.md) dosyasına bakın.

## Kurulum

Node.js ve Expo geliştirme ortamı gerekir.

~~~bash
npm ci
npm start
~~~

Android, iOS veya web hedefi Expo arayüzünden seçilebilir. Herhangi bir `.env` veya API anahtarı gerekmez.

## Güvenlik

İstemci kodunda (Expo paketine giren her şey) sağlayıcı credential'ı, public provider-key değişkeni veya doğrudan sağlayıcı SDK'sı bulunmamalıdır. İleride AI eklenirse sağlayıcı anahtarı yalnızca sunucu tarafında secret store'da tutulmalı, istemci güvenilir bir backend proxy'ye bağlanmalıdır (authentication, kullanıcı/IP rate limit'i, istek boyutu sınırı, şema doğrulama ve hassas log redaction ile).

## Kontroller

~~~bash
npm run lint
npm run test:security
npx tsc --noEmit
~~~

`test:security`, istemci kaynaklarına sağlayıcı credential'ı, public provider-key değişkeni veya doğrudan sağlayıcı SDK'sı eklenmesini engeller.
