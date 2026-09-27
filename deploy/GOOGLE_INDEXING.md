# Google URL gönderimi

`sitemap.xml` yayımlanmış ve kanonik sanatçı, haber, konser, albüm ve şarkı sayfalarını listeler. Bu işleyici her çalıştığında site haritasını Search Console API'ye yollar. `--notify-all` ile listedeki henüz bildirilmeyen tüm URL'leri Indexing API'ye günlük kota dahilinde sırayla gönderir. Gönderim sonucu ve tarihi sunucudaki kalıcı durum dosyasında saklanır; ilk 200 URL'den sonra sonraki günlerde devam eder. Bu API'nin başarılı yanıtı dizine alınma garantisi değildir; Google resmî olarak müzik sayfaları için Indexing API desteği bildirmiyor.

## Kurulum

1. Search Console'da `https://fanz.com.tr/` veya `sc-domain:fanz.com.tr` mülkünün doğrulandığından emin olun. Servis hesabının `client_email` adresini mülke tam kullanıcı olarak ekleyin.
2. Google Cloud'da Search Console API ve Indexing API'yi etkinleştirin. Servis hesabı JSON anahtarını `/home/deploy/fans/shared/google-service-account.json` konumuna, yalnızca `deploy` okuyacak izinlerle yerleştirin. Anahtarı git deposuna koymayın.
3. `/home/deploy/fans/shared/runtime.env` dosyasına ekleyin:

   ```env
   GOOGLE_SERVICE_ACCOUNT_FILE=/home/deploy/fans/shared/google-service-account.json
   GOOGLE_SEARCH_CONSOLE_PROPERTY=https://fanz.com.tr/
   GOOGLE_INDEXING_DAILY_LIMIT=200
   ```

   Domain mülkü kullanılıyorsa özellik `sc-domain:fanz.com.tr` olmalıdır. Gerçek API kotası daha düşükse limiti düşürün.
4. `sudo cp /home/deploy/fans/current/deploy/google-submission.{service,timer} /etc/systemd/system/` ardından `sudo systemctl daemon-reload && sudo systemctl enable --now google-submission.timer` çalıştırın. İlk çalıştırma: `sudo systemctl start google-submission.service`; durum: `journalctl -u google-submission.service -n 100 --no-pager`.

Dry run: `SITE_ORIGIN=https://fanz.com.tr node deploy/submit-google-urls.mjs --dry-run`. Tekrar bildirim gerekiyorsa `--force` kullanın; günlük kota yine uygulanır. İndekse gerçekten giren sayfaları Search Console'un Sayfalar raporu ve URL Denetimi ile ayrıca kontrol edin.
