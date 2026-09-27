# FANZ — Her sanatçı için çalışma standardı
Güncelleme: 27 Eylül 2026

Kullanıcı kararı: Semicenk pilotunda geliştirilen ve Manifest'te uygulanan içerik, görsel, Fan Club kimliği, sayfa düzeni ve SEO yaklaşımı seçilen her sanatçıya uygulanacak. Aynı metinler kopyalanmayacak; her sanatçı için ayrı kaynak araştırması yapılacak. Sanatçılar sırayla ele alınacak; mevcut tamamlanma durumu varsayılmayacak.

## İçerik ve sayfa standardı
- Biyografi, haberler, konserler, albüm/EP/single/remiks, şarkılar, resmî klip/canlı video, galeri ve kaynaklar birlikte ele alınır.
- Doğal ve özgün Türkçe; içeriğe özgü giriş, yararlı açıklama, aranabilir başlık, farklı SEO açıklaması ve bağlamsal iç bağlantılar kullanılır. Kelime sayısı hedef değildir.
- Sanatçı kökü Fan Club/topluluk kimliğini taşır. Resmî sanatçı sitesi, eski sahiplik, üye faaliyeti veya gerçekleşmemiş etkinlik iddiası üretilmez.
- Her yayının kendi resmî kapağı, haberin konusuyla ilişkili görsel, konserin resmî afişi tercih edilir. Özel görsel hızla bulunamazsa araştırmayı uzatmadan sanatçının kaynak ve kullanım bilgisi doğrulanmış farklı bir fotoğrafı seçilir. Boş veya kırık görsel yayımlanmaz; aynı sanatçının aynı kart sırasında aynı fotoğraf, farklı URL ya da kırpım kopyası tekrarlanmaz. Kaynak, kullanım hakkı, boyut, canlı yüklenme ve doğru alt metin kontrol edilir; sanatçı portresi konserden çekilmiş gibi sunulmaz.
- Kaynaklı tarih, albüm/şarkı eşleşmesi ve kredi bilgisi doğrulanır. Deluxe sürümlerin ortak şarkıları çoğaltılmaz; konuk şarkı başka sanatçının tüm albümünün aktarılmasına yol açmaz.
- Konserin duyurulması gerçekleştiğini kanıtlamaz. İptal, erteleme ve yeni tarih; liste, bilet çağrısı ve JSON-LD üzerinde tutarlı gösterilir. Saat bilinmiyorsa uydurulmaz.
- Tam şarkı sözü, kopya haber, doğrulanmamış iddia veya sahte güncellik kullanılmaz. Resmî dinleme/video bağlantıları tercih edilir.
- Tüm mevcut ve sonradan eklenen sanatçıların kök, bölüm, haber, konser, albüm ve şarkı sayfalarında misafirler adını ve mesajını yazarak üye olmadan yorum gönderebilir; yorum onaylanana kadar görünmez. İçerik ve onaylı yorum beğenisi üyelik gerektirmez; misafir için tarayıcı çereziyle tekil ve geri alınabilir kayıt tutulur. Sanatçı akış kartındaki beğeni ve yorum da aynı kurala uyar. Ortak yorum bileşeni ve API hedef doğrulaması yeni sanatçı eklenirken de kontrol edilir.
- Mobil kullanım, okunabilirlik ve mevcut ortak sayfa düzeni korunur. Otomasyonun tasarım değişikliği yapması bu standardın parçası değildir.

## Yayın kalite kapısı
Her değişen gerçek HTTPS sayfasında içerik, benzersiz başlık/açıklama, self-canonical, tek H1, robots meta ve X-Robots-Tag, paylaşım görseli, uygun JSON-LD, sitemap ve bağlamsal bağlantılar kontrol edilir. Hazırlanmış, test edilmiş ve canlıda doğrulanmış sonuçlar ayrı yazılır. Google indekslemesi veya gerçek cihaz testi yapılmadan yapılmış sayılmaz.

## Güvenli içerik güncellemesi
Önce AGENTS.md, docs/PROJE_DURUMU.txt ve content/dynamic-content.md okunur; current symlink hedefi çözülür. İçerik, revision kontrolü ve yedek içeren deploy/update-artist-content.py ile önce --dry-run, sonra atomik uygulanır. Elle yapılan düzenlemeler ve diğer sanatçıların kayıtları ezilmez.
Desteklenen türler entry, song, video ve biography'dir. Yeni sanatçı için importer desteği ayrıca doğrulanır; mevcut destek yalnızca Semicenk ve Manifest'tir.
Statik galeri/arayüz gibi desteklenmeyen değişiklikler kaynaklarıyla bekleyen iş olarak saklanır. Otomasyon kod, şema, statik katalog, tasarım, bağımlılık veya sunucu ayarı değiştirmez; deploy/restart/yetki genişletme yapmaz.
Her anlamlı geliştirmede bu standart ve ana durum belgesi gerekiyorsa birlikte güncellenir; AGENTS.md'nin aynı commit kuralı korunur.

## Otomasyon ve kayıt standardı
Her sanatçı için otomasyon ayrıca yetkilendirilir; bu karar tüm sanatçılar için kendiliğinden görev oluşturmaz. Semicenk ve Manifest görevleri etkindir.
Her görev tüm kategorileri araştırır, önce mevcut veri ve son başarılı kategori kontrolüyle karşılaştırır. Gecikmiş indeksleme için örtüşen pencere kullanır; tekrar kayıt oluşturmaz.
Kaynak URL'leri, kontrol zamanı, uygulanan kayıt kimlikleri, gerçek yayın URL'leri, yedek ve bekleyen işler kalıcı kayıtta tutulur. Erişim hatasında başarılı kontrol zamanı ilerletilmez. Yeni bilgi yoksa boş içerik üretilmez.
Manifest kayıt yolu: /home/deploy/fans/shared/content-state/manifest.json
Manifest batch/bekleyen işler: /home/deploy/fans/shared/content-state/manifest/
Semicenk otomasyonu: 6ab9187d75e4819186a6e9a450332317
Manifest otomasyonu: 6ab94eb28478819186a33883b46e091e
Her ikisi: Europe/Istanbul, 08.00 ve 20.00, 12 saat aralık.
Manifest'in ilk planlanan çalışması: 28 Eylül 2026 08.00. Kurulum, başarılı araştırma veya içerik yayını sayılmaz.
