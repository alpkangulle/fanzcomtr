# FANZ çalışma sürekliliği

Bu depo üzerinde işe başlamadan önce docs/PROJE_DURUMU.txt ve content/YENI_SANATCI_KURALLARI.txt dosyalarını okuyun. Kullanıcı bu belgeyi tamamlanan işler, SEO kuralları, yayın durumu ve sonraki aşamalar için sürekli güncel tutmamızı istedi.

Her anlamlı değişiklikle aynı commit içinde belgeyi güncelleyin. Doğrulanmış canlı sürümü, hazırlanmış sürümü, test sonucunu ve bekleyen yayın adımını ayrı yazın. Yayın gerçekleştiğini canlı symlink ve HTTP kontrolleriyle doğrulamadan "canlıda" demeyin. Yeni özellikler için ilgili kuralları ve sonraki adımı kaydedin; eski önemli kararları silmeyin. Kullanıcının elindeki metin belgesi bu dosyanın dışa aktarılan kopyasıdır.

Semicenk pilotu dışındaki sanatçı içeriklerini kullanıcı kapsamı olmadan topluca değiştirmeyin. Ayrıntılı içerik güncelleme sözleşmesi content/dynamic-content.md içindedir. SEO ve yayın kontrolleri docs/PROJE_DURUMU.txt içinde tanımlıdır.

Üretim derlemesi için SITE_ORIGIN=https://fanz.com.tr açıkça ayarlanmalıdır. HTML meta robots kontrolünün yanında X-Robots-Tag HTTP başlığını ve robots.txt/site haritası alan adını da kontrol edin. Build ile mevcut canlı sürümü karıştırmayın.

Testleri üretim veritabanının ayrı kopyasında çalıştırın; SEO_AUTOMATION_DISABLED=1 kullanın. Gizli anahtarları, kullanıcı mesajlarını veya kişisel bilgileri durum belgesine ve Git'e yazmayın. Ölçülmemiş hız/skor, Google indekslenmesi veya sıralama sonucu iddia etmeyin.
