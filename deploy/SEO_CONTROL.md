# FANZ SEO merkezi

ATALIWeb kaynak arşivindeki işlevler FANZ'ın Next.js/SQLite mimarisine, sanatçı odaklı olarak uyarlandı.

- /admin/seo: sanatçı/bölüm seçimi, başlık/açıklama/tanıtım şablonu, site içi bağlantılar, toplu önizleme/uygulama/varsayılana dönüş.
- Tekil mevcut URL üzerinde upsert; aynı şablon ikinci kez uygulandığında mükerrer sayfa oluşmaz. Biyografiler ve editoryal kayıtlar silinmez.
- Google Search Console site haritası ve Google Indexing API tüm yayın URL bildirimleri ayrı açılıp kapatılır.
- IndexNow tek ortak uç noktayla katılımcı motorlara gönderir. Anahtar dosyası yalnızca düz anahtar içerir.
- Günlük limit sağlayıcı başına deneme sayısıdır; Türkiye takvim gününde yenilenir. Hatalar kalıcı kuyrukta artan gecikmeyle tekrar denenir. Aynı sürüm tekrar bildirilmez; değişen lastmod yeniden kuyruklanır. Site haritasından kaldırılan URL için Google URL_DELETED gönderilir.
- İçerik/biyografi/SEO kaydından sonra arka plan bildirimi tetiklenir. SEO_AUTOMATION_DISABLED=1 test ortamında otomatik tetiklemeyi kapatır.
- 15 dakikalık systemd zamanlayıcısı ve panelden elle çalıştırma aynı DB kilidini kullanır. Sağlayıcı hatası diğer sağlayıcıyı durdurmaz.
- Google anahtarı yalnızca SQLite dosyasının yanındaki google-service-account.json dosyasında, 0600 izinle saklanır; panel yanıtında ve Git'te bulunmaz.
- Kaynak WebP optimizasyonu; orijinaller korunur. Daha küçük WebP dosyaları destekleyen tarayıcılara aynı görsel adreslerinden sunulur. Fotoğraf kaynak/atıf bilgileri değiştirilmez.
- Telefon/WhatsApp düğmeleri ve üç düzenlenebilir sanatçı yan alanı.

## Canlıya alma

Sunucuda root olarak:

    sudo bash /home/deploy/fans/releases/20260927-seo-panel/deploy/install-seo-control.sh

Betik önce mevcut aktivasyon sürecinin yedek/migration/sağlık/geri dönüş adımlarını uygular. Ardından yeni zamanlayıcıyı kurar; eski google-submission.timer varsa çift gönderimi önlemek için devre dışı bırakır. SEO ayarları migration sırasında açılır; servis hesabı eksikse Google kuyruğu açıklayıcı hata durumunda bekler. IndexNow anahtarı otomatik oluşturulur.

Panelde kendi Google servis hesabı JSON dosyanı yükle, doğrulanmış Search Console mülkünü seç. Google Cloud API etkinleştirmeleri ve servis hesabının mülk yetkisi ayrı gereklidir. Arşiv bu anahtarı içermiyor. Google API kabulü dizine alınma veya sıralama kanıtı değildir.

Kontrol:

    systemctl status seo-control.timer --no-pager
    journalctl -u seo-control.service -n 30 --no-pager

Geri dönüş: önce seo-control.timer durdurulur; önceki release aktive edilir. Eklemeli SEO tabloları eski kodla uyumludur. Orijinal görseller yerinde kalır. Kaynak sürümden eski uygulamaya dönülmesi Google/IndexNow'a gönderilmiş bildirimleri geri alamaz.

## Referans

Arşiv: ataliweb-kaynak-arsivi-20260920(2).zip. PHP dosyaları doğrudan çalıştırılmadı; mevcut platform için işlevsel uyarlama yazıldı. Konum çoğaltma, kullanıcının seçimiyle sanatçı/bölüm şablonlarına dönüştürüldü. Mevcut canonical, noindex, SSR, kaynak bilgileri ve mobil akış korunur.


## Doğrulama (27 Eylül 2026)

- Üretim derlemesi ve TypeScript başarılı.
- Node testinde dış servislere gitmeden Google/IndexNow kabulü, sağlayıcı başına günlük sınır, tekrar bildirmeme, kaldırılan URL, 429, kilit ve 0600 anahtar dosyası doğrulandı.
- Ayrı QA veritabanı ve yalnızca localhost:3043 üzerinde oturumsuz 401, farklı Origin 403, şablon önizleme/uygulama/mükerrerlik/geri dönüş, SSR başlık ve tanıtım metni, 87 URL site haritası ve özel sayfaların dışlanması doğrulandı.
- 18 görselin daha küçük WebP sürümü hazırlandı; toplam 2.777.135 bayt tasarruf. WebP destekli istek WebP, diğer istek orijinal PNG aldı. Orijinaller değiştirilmedi.
- Gerçek Google anahtarı olmadan dış Google bildirimi denenmedi. Kuyruk sağlayıcı testleri taklit yanıtlarla yapıldı.


## 27 Eylül 2026 — URL bildirimi düzeltmesi

Yayın yolu `/home/deploy/fans/current` bir symlink olduğundan Node'un `import.meta.url` değeri gerçek release yoluna çözülür. Eski giriş koşulu systemd tarafından mutlak `current` yolu ile çalıştırıldığında sessizce atlanıyordu. Giriş koşulu gerçek yol eşitliğiyle düzeltildi. İçerik importer'ı başarılı transaction sonrasında aynı işleyiciyi arka planda tetikler; 15 dakikalık timer kaçan veya dışarıdan eklenen kayıtları yakalar. Kuyruk ve fingerprint tekrar bildirimi önler. QA kopyasında symlink komutu 231 URL okudu ve importer sonrası last_run kaydı oluştu. Başlık ve meta açıklamaları değiştirilmez.

Google bildirimi açık kalabilir; gerçek gönderim için Google Cloud servis hesabı JSON dosyası, Search Console mülk yetkisi ve ilgili API etkinleştirmesi gerekir. Dosya yoksa kuyruk hata durumunda bekler ve otomatik tekrar dener. Giriş anahtarı Git'e yazılmaz. Google'ın belirttiği Indexing API kapsamı JobPosting ve BroadcastEvent sayfalarıdır; FANZ'ın diğer URL bildirimleri kullanıcı tercihiyle yapılandırılmıştır. API yanıtı dizine alınma anlamına gelmez.
Servis hesabı yüklenince bekleyen hatalar hemen yeniden sıraya alınır. Yeni yayımlanan URL, ilk arşiv taramasındaki URL'lerden önce işlenir.

Google yayın kotası America/Los_Angeles takvim gününe göre tutulur. Google'ın gece yarısı Türkiye saatiyle yaz döneminde 10.00, kış döneminde 11.00 olur. Panelin günlük kullanım satırı ilgili sağlayıcının gününü gösterir. Google proje kotası varsayılan 200/gün; kullanıcı FANZ için 180/gün istedi. Yeni sürümün aktivasyon betiği başarılı sağlık kontrolünden sonra mevcut ayarları koruyarak günlük sınırı 180'e çevirir.
