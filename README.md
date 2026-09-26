# Fanz — sanatçı topluluk platformu

Bu depo, çalışan Fans uygulamasının bağımsız Next.js kaynak kodudur. `alpkangulle/wai.com.tr` içindeki `apps/fans` ağacından 27 Eylül 2026'da dosya içerikleri doğrulanarak ayrıldı. Bundan sonraki Fans geliştirmeleri burada tutulur.

**Şu anki yayın:** https://fans.wai.com.tr — VPS üzerindeki `/home/deploy/fans/current` ve paylaşılan SQLite/medya dizini.

**Hedef domain:** `fanz.com.tr`. DNS, HTTPS, Nginx, `SITE_ORIGIN`, canonical/sitemap ve eski adresten 301 geçişi tamamlanana kadar yeni domain canlı kabul edilmez. Bu GitHub deposuna kod yüklemek sunucuyu otomatik yayımlamaz.

Next.js + Node 22 + SQLite. Marka geçicidir; `lib/site-config.ts` üzerinden yönetilir.

## Başlatma

- Node.js 22.13+; sunucu sürümü 22.23.2.
- `npm ci`
- `.env.example` temel alınarak güvenli ortam değişkenlerini ayarla.
- `npm run db:migrate`
- `npm run build`
- `npm start` (yalnızca 127.0.0.1:3042)

`deploy/bootstrap.mjs` sunucuda bir kez güvenli yönetici parolası ve imza anahtarı üretir. Değerleri loglamaz. Ortam ayarları `/home/deploy/fans/shared/runtime.env`, ilk parola aynı dizinde `admin-initial-password.txt` dosyasındadır. Dosyalar 0600, dizin 0700 tutulur. Bu dosyaları Git'e ekleme.

## Yönetim

`/admin` yönetici girişi, biyografi ve kaynak bağlantısı düzenleme. Yönetici oturumu 8 saatlik imzalı HttpOnly/SameSite çerezle tutulur. Giriş denemesi sınırı sunucu veritabanındadır. Sitelerden gelen kimlik başlıkları yetki sağlamaz. Moderasyon aynı yönetici oturumuyla çalışır.

## Yayın

`deploy/install-nginx.sh` yalnızca yeni Fans servisini, nginx vhost'unu ve sertifikasını kurar. Mevcut siteleri değiştirmez. Yönetici yetkisiyle çalıştırılmalıdır. Var olan Fans vhost'unu otomatik olarak ezmez. Uygulama build ve sağlık kontrolü tamamlanmadan DNS/HTTPS yayınına geçmez. SSL başarısız olursa vhost uygulamayı HTTP'den sunmaz.

Yeni domain: `SITE_ORIGIN`, nginx `server_name`, sertifika ve gerekiyorsa yönlendirmeleri değiştir. Misafir/yönetici çerezleri yeni domainde yeniden oluşturulur. Veritabanı uygulama kodundan ayrı tutulur. Mevcut noindex geliştirme boyunca korunur.

## Veri ve geri dönüş

Sites verisi, `deploy/import-sites.mjs` ile yalnızca tam ve doğrulanmış dışa aktarma dosyasından aktarılır. Dışa aktarma dosyaları ve SQLite verileri Git'e eklenmez. Eski Sites yayını korunur. Domain yayını sonrasındaki yeni veriler ayrı olduğundan otomatik çift yönlü senkronizasyon yoktur.

SQLite bu ilk tek-sunuculu sürüm içindir. TV trafiği öncesinde kapasite, yedek/geri yükleme ve gerçek zamanlı altyapı ayrıca doğrulanmalıdır. Bu yayın lansmana hazır ilan edilmez.
