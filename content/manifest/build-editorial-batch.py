#!/usr/bin/env python3
"""Source-grounded, revisioned Manifest editorial expansion as of 2026-09-27."""
import json,os,sqlite3
from datetime import datetime
from pathlib import Path

db=sqlite3.connect(os.environ['DATABASE_PATH']);db.row_factory=sqlite3.Row
tr_month=['','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
def tarih(iso):
 d=datetime.fromisoformat(iso);return f'{d.day} {tr_month[d.month]} {d.year}'
release_notes={
 'zamansizdik':"Grubun ilk dönemine açılan bu kayıt, manifestival albümünden önce bağımsız bir single olarak dinleyiciye ulaştı. Albümde aynı adlı şarkı da yer alır; iki ayrı çıkış sayfası yerine bu single’ın tarihini ve albümdeki parça konumunu birlikte okumak daha açıklayıcıdır. Grubun ilk yayınından albüm aşamasına geçişini izlemek isteyenler için başlangıç noktasıdır.",
 'ariyo':"Zamansızdık’tan sonra ve manifestival albümünden önce gelen Arıyo, albümün şarkı listesinde de bulunur. Deluxe sürümdeki Arıyo (Zeki Arkun Remix) ise özgün kaydın farklı düzenlemesidir; tarih ve sürüm bilgilerini birbirinden ayırmak gerekir. Bu sayfa Nisan single’ının künyesine odaklanır.",
 'manifestival':"İlk albümün sırası Intro ile açılır; Snap, KTS, Arıyo ve Manifest’in ardından Zehir, Hayır, Zamansızdık, Yaşanacaksa, Durma ve Outro gelir. Parça listesi ve yayın tarihi Apple Music üzerinden kontrol edildi. Yaşanacaksa, Çıtır Kızlar’ın Yaşanacaksa Yaşanacak eserine dayanan yeni yorum olarak ayrıca not edilir. Albümün özgün sürümünü sonradan çıkan deluxe düzenlemelerle karıştırmıyoruz.",
 'manifestival-deluxe':"Bu sürüm ilk albümün 11 şarkısını koruyup beş ek düzenleme getirir: Rampapapam (Arem Ozguc & Arman Aydin Remix), Arıyo (Zeki Arkun Remix), Zehir (Motive Remix), Hayır (AYDEED Remix) ve Outro (Extended Version). Aynı özgün kayıtları iki kez yeni şarkıymış gibi saymıyoruz. Deluxe parça sırası ve süreleri Shazam ile MusicBrainz kayıtlarıyla karşılaştırıldı.",
 'ruya':"RÜYA, manifestival ve deluxe sürümün ardından 2025 sonbaharında yayımlanan ayrı bir single’dır. İlk albümün 11 şarkılık sırasına sonradan eklenmiş bir parça gibi gösterilmemesi diskografiyi doğru okumayı sağlar. Bu dönemi takip ederken Aralık ayında gelen Amatör kaydına da bakılabilir.",
 'amator':"Amatör, RÜYA’dan sonraki 2025 sonu yayınıdır. Apple Music’te bağımsız single olarak yer alması, onu manifestival albümündeki şarkılardan ayırır. Resmî YouTube videosu doğrulanan kayıtlar arasında olduğundan bu sayfadaki şarkı bağlantısı dinleme ve video bilgisine de götürür.",
 'basrol-sensin':"Başrol Sensin (1. Yıl Özel) adıyla çıkan kayıt, grubun 2026 başındaki yayın takviminde tek şarkılık bir sürümdür. Başlığındaki “1. Yıl Özel” ifadesi yayının resmî adının parçasıdır; albüm adı veya ayrı bir konser serisi değildir. Şubat sonundaki Manifest remiksiyle birlikte dönemin yayın sırasını görmeye yardımcı olur.",
 'manifest-arem-arman-remix':"Manifest (Arem & Arman Remix), manifestival albümündeki Manifest parçasıyla aynı ad kökünü taşır; ancak 27 Şubat 2026 tarihli ayrı düzenlemedir. Bu kaydı albümün 2025 orijinal parçasına dönüştürmeden, remiks kimliği ve kendi yayın tarihiyle listeliyoruz. Hemen ardından Mart ayında Zehir için başka bir Arem & Arman remiksi yayımlandı.",
 'zehir-arem-arman-remix':"Zehir (Arem & Arman Remix), aynı adlı albüm kaydının 6 Mart 2026 tarihli yeni düzenlemesidir. manifestival (deluxe) içindeki Zehir (Motive Remix) ile de aynı sürüm değildir. Zehir adına bağlı bu üç kayıt arasındaki ayrım, doğru şarkı sayfasına ve dinleme bağlantısına ulaşmak için önemlidir.",
 'daha-iyi':"Daha İyi, 2026 ilkbaharında yayımlanan tek şarkılık bağımsız kayıttır. manifestival albümü ve Şubat–Mart remiks dizisinden sonra geldiği için diskografide ayrı tutulur. Resmî YouTube videosu da doğrulanmış olduğundan şarkı sayfasında hem kayıt künyesi hem video bağlantısı bulunur.",
 'hileli':"Hileli’de Manifest’e Ajda Pekkan eşlik eder. Apple Music iki adı birlikte sanatçı olarak listeler; bu yüzden sayfa yalnız grubun solo single’ı gibi kurgulanmaz. Daha İyi’den sonra, Toz Pembe’den önce gelen bu Mayıs yayını iş birliklerinin diskografide nasıl gösterildiğine de örnektir.",
 'toz-pembe':"Toz Pembe, 3 Temmuz 2026 tarihli tek şarkılık Manifest yayınıdır. Hileli iş birliğinden sonraki döneme yerleşir; pVg canlı remiksinden daha erken çıkar. Şarkının doğrulanmış resmî YouTube videosu bulunduğu için ayrı şarkı sayfasından izleme ve dinleme bağlantılarına geçilebilir.",
 'pvg-manifest-live-remix':"pVg (Manifest Live Remix) kaydında Manifest, Motive ve Pango birlikte anılır. Başlıktaki “Live Remix” sürüm bilgisidir; kayıt yeni bir Manifest stüdyo albümü ya da manifestival’in ek parçası değildir. Temmuz 2026 yayın sırasını okurken Toz Pembe ile karıştırılmaması gerekir."
}
release_summaries={
 'zamansizdik':'Manifest’in 7 Şubat 2025 tarihli Zamansızdık single’ı, ilk albümden önceki başlangıç kaydı; yayın tarihi ve albüm bağlantısı.',
 'ariyo':'Manifest’in 11 Nisan 2025 tarihli Arıyo single’ı; özgün kayıt ile daha sonra yayımlanan Zeki Arkun remiksinin ayrımı.',
 'manifestival':'Manifest’in 13 Haziran 2025’te yayımladığı ilk albüm: 11 şarkılık sıra, yayın künyesi ve resmî dinleme bağlantısı.',
 'manifestival-deluxe':'Manifest’in 5 Eylül 2025 tarihli 16 parçalık deluxe albümü; ilk 11 şarkıya eklenen beş farklı düzenleme.',
 'ruya':'Manifest’in 3 Ekim 2025 tarihli RÜYA single’ı, ilk albüm sonrası bağımsız yayın; albümden ayrı künye ve dinleme adresi.',
 'amator':'Manifest’in 5 Aralık 2025 tarihli Amatör single’ı; resmî video, yayın künyesi ve RÜYA sonrası diskografi bağlamı.',
 'basrol-sensin':'Manifest’in 13 Şubat 2026 tarihli Başrol Sensin (1. Yıl Özel) single’ı; yayın adı, tarih ve şarkı bağlantısı.',
 'manifest-arem-arman-remix':'Manifest şarkısının 27 Şubat 2026 tarihli Arem & Arman remiksi; 2025 albüm kaydından ayrı bir sürüm.',
 'zehir-arem-arman-remix':'Zehir’in 6 Mart 2026 tarihli Arem & Arman remiksi; albümdeki özgün kayıt ve Motive remiksinden ayrı.',
 'daha-iyi':'Manifest’in 3 Nisan 2026 tarihli Daha İyi single’ı; kendi kapak görseli, resmî videosu ve dinleme bağlantısı.',
 'hileli':'Manifest ve Ajda Pekkan’ın 8 Mayıs 2026 tarihli ortak Hileli single’ı; iki sanatçı adıyla doğrulanan yayın.',
 'toz-pembe':'Manifest’in 3 Temmuz 2026 tarihli Toz Pembe single’ı; şarkı künyesi, resmî video ve dinleme adresi.',
 'pvg-manifest-live-remix':'Manifest, Motive ve Pango’nun 24 Temmuz 2026 tarihli pVg canlı remiksi; ortak sanatçı künyesi ve sürüm bilgisi.'
}
release_pairs={
 'zamansizdik':('Arıyo','manifestival'), 'ariyo':('Zamansızdık','manifestival (deluxe)'),
 'manifestival':('Zamansızdık','manifestival (deluxe)'), 'manifestival-deluxe':('manifestival','Arıyo (Zeki Arkun Remix)'),
 'ruya':('manifestival (deluxe)','Amatör'), 'amator':('RÜYA','Başrol Sensin (1. Yıl Özel)'),
 'basrol-sensin':('Amatör','Manifest (Arem & Arman Remix)'),
 'manifest-arem-arman-remix':('Manifest','Zehir (Arem & Arman Remix)'),
 'zehir-arem-arman-remix':('Zehir (Motive Remix)','Daha İyi'),
 'daha-iyi':('Zehir (Arem & Arman Remix)','Hileli'),
 'hileli':('Daha İyi','Toz Pembe'),
 'toz-pembe':('Hileli','pVg (Manifest Live Remix)'),
 'pvg-manifest-live-remix':('Toz Pembe','Manifest konserleri')
}
news_notes={
 'manifestival-yayinda':"Albüm, daha önce yayımlanan Zamansızdık ve Arıyo gibi kayıtları ilk uzunçalar çerçevesinde bir araya getiriyor. Intro ve Outro ile sınırlandırılmış 11 parçalık sıra, grubun ilk yayın yılını tek sayfada izlemenin yolunu açıyor. Haziran albümünün Eylül’de gelecek deluxe sürümünden hangi yönleriyle ayrıldığını da diskografi kayıtlarında açıkça gösteriyoruz.",
 'manifestival-deluxe-yayinda':"Beş ek düzenleme ilk albümün sırasını genişletiyor; özgün 11 parça ortadan kalkmıyor. Rampapapam, Arıyo, Zehir, Hayır ve Outro için eklenen sürümler, birbirinin yerine konacak yeni single tarihleri değildir. Dinleyici hangi kaydı açtığını anlamak için iki albümün ayrı parça listelerini karşılaştırabilir.",
 'ruya-single-yayinda':"İlk albümün genişletilmiş sürümünden sonraki RÜYA, kendi yayın sayfası olan bağımsız bir single. Bu tarih, 2025 katalog akışında Haziran albümü, Eylül deluxe sürümü ve Aralık Amatör yayını arasına düşüyor. Albüm kapağı ve dinleme adresi yayın kaydına aittir; haberin görseli genel grup portresi değildir.",
 'amator-single-yayinda':"Amatör, 2025 takvimini kapatan dönem yayınlarından biridir. Aynı adı taşıyan şarkının resmî videosu da doğrulandığı için haberden şarkı ayrıntısına geçmek mümkündür. RÜYA ile birlikte okunduğunda grubun manifestival sonrası yeni şarkıları albüm içine sonradan eklemeden nasıl yayımladığı görülür.",
 'daha-iyi-single-yayinda':"Daha İyi, 2026 baharındaki single sırasına ekleniyor. Şubat ve Mart aylarındaki remikslerden sonra gelen kayıt, kendi kapağı ve yayın tarihiyle bağımsız listelenir. Şarkının resmî videosu bulunan ayrıntı sayfası, yalnız tarih ve dinleme adresi yerine künyeyi de gösterir.",
 'manifest-ajda-pekkan-hileli':"Yayın künyesinde Manifest ile Ajda Pekkan birlikte görünür. Bu ayrıntı, parçayı yalnız Manifest’in solo şarkısı gibi etiketlememek ve ortak çalışmayı doğru adlandırmak için önemlidir. Mayıs 2026 tarihli Hileli, Daha İyi ile Toz Pembe arasındaki yayın sırasındadır.",
 'toz-pembe-single-yayinda':"Toz Pembe için hem tek şarkılık yayın hem resmî video kaydı bulunur. Temmuz başındaki tarih, ay sonundaki pVg canlı remiksiyle karıştırılmamalıdır. Haber kartındaki görsel kendi kapağına, şarkı sayfasındaki bağlantılar ise resmî dinleme ve video adreslerine gider.",
 'pvg-live-remix-yayinda':"Ortak sanatçı künyesinde Manifest, Motive ve Pango bir aradadır. “Live Remix” ibaresi yayının biçimini açıklar; grubun ilk albümüne yeni bir stüdyo şarkısı eklenmiş olduğu anlamına gelmez. Temmuz 2026 kataloğunda Toz Pembe’nin ardından gelen bu kayıt, ayrı single ve şarkı sayfalarında izlenebilir."
}
news_release={
 'manifestival-yayinda':'manifestival','manifestival-deluxe-yayinda':'manifestival (deluxe)',
 'ruya-single-yayinda':'RÜYA','amator-single-yayinda':'Amatör','daha-iyi-single-yayinda':'Daha İyi',
 'manifest-ajda-pekkan-hileli':'Hileli (Ajda Pekkan ile)',
 'toz-pembe-single-yayinda':'Toz Pembe','pvg-live-remix-yayinda':'pVg (Manifest Live Remix)'
}
song_notes={
 'intro':"Albümün açılışındaki Intro, 11 parçalık özgün sıranın ilk kaydıdır. Ardından Snap ve KTS gelir; bu sayfa onu ayrı bir single gibi sunmaz. Kısa süresine rağmen albüm akışındaki yerini görmek için parça listesinden devam edilebilir.",
 'snap':"Snap, Intro’dan sonra ikinci sırada yer alır. Onu KTS ve Arıyo izler; bu dizilim albümün Haziran 2025 sürümüne aittir. Single bağlantılarını arayan dinleyici için albümün kendi şarkı listesindeki konumu ayrıca belirtilir.",
 'kts':"KTS, manifestival albümünde üçüncü parçadır; öncesinde Snap, sonrasında Arıyo bulunur. İlk albümün 11 parçalık sırasını takip ederken bu kaydı remiks veya sonraki dönem single’larıyla karıştırmamak gerekir.",
 'ariyo':"Arıyo, Nisan 2025’te single olarak da yayımlandı ve Haziran’daki manifestival sırasına girdi. Deluxe albümündeki Arıyo (Zeki Arkun Remix) farklı bir düzenlemedir; bu sayfa özgün şarkının künye ve dinleme adresini taşır.",
 'manifest':"Grubun adını taşıyan Manifest, ilk albümün orta bölümündeki kayıttır. Sonradan çıkan Manifest (Arem & Arman Remix) ayrı tarih ve düzenlemeye sahiptir. Aynı adın iki farklı sürümü için katalogda ayrı kayıt tutulur.",
 'zehir':"Zehir’in özgün albüm kaydı Pango ile birlikte anılır. manifestival (deluxe) içinde Zehir (Motive Remix), 2026’da ayrıca Zehir (Arem & Arman Remix) yayımlanmıştır. Bu üç sürümün künyelerini ayrı sayfalarda karşılaştırmak gerekir.",
 'hayir':"Hayır, manifestival’in özgün şarkı listesinde Zehir’in ardından gelir. Deluxe sürümdeki Hayır (AYDEED Remix) onun başka bir düzenlemesidir. Bu kayıt özgün albüm sırasını ve Apple Music dinleme adresini esas alır.",
 'zamansizdik':"Zamansızdık’ın 7 Şubat 2025 single yayını grubun ilk dönemine uzanır; aynı şarkı ilk albümün parça listesinde de vardır. Burada albümdeki kayıt konumu gösterilir; çıkışa dair ayrıntı single sayfasındadır.",
 'yasanacaksa':"Yaşanacaksa, Çıtır Kızlar’ın Yaşanacaksa Yaşanacak eserine dayanan Manifest yorumudur. Bu nedenle özgün beste gibi tanıtılmaz. İlk albümün son bölümünde Zamansızdık ve Durma arasında yer alır.",
 'durma':"Durma, özgün manifestival listesinin kapanışına yaklaşırken Yaşanacaksa’dan sonra gelir. Outro’dan önceki bu parça, albüm sırasını sona kadar takip etmek isteyenler için önemli bir duraktır; bağımsız single yayını olarak gösterilmez.",
 'outro':"Outro, 11 parçalık manifestival albümünün kapanış kaydıdır. Deluxe sürümdeki Outro (Extended Version) aynı adın uzatılmış düzenlemesi olarak ayrı gösterilir. Şarkı arşivinde orijinal ve genişletilmiş kayıt birbirinin yerine geçmez.",
 'rampapapam-arem-ozguc-arman-aydin-remix':"Rampapapam (Arem Ozguc & Arman Aydin Remix), manifestival (deluxe) sürümüne eklenen beş düzenlemenin ilkidir. Orijinal 11 parçalık manifestival listesinde bulunmaz; bu nedenle çıkış tarihi deluxe yayının tarihidir.",
 'ariyo-zeki-arkun-remix':"Arıyo (Zeki Arkun Remix), Nisan 2025 single’ı ve Haziran albümündeki Arıyo ile aynı kayıt değildir. Deluxe parça listesi içindeki yeni düzenleme kendi süresi ve bağlantısıyla ayrı tutulur.",
 'zehir-motive-remix':"Zehir (Motive Remix), deluxe albümdeki ek düzenlemeler arasındadır. Albümdeki Pango’lu özgün Zehir ve 2026’daki Arem & Arman remiksiyle karıştırılmaması için sürüm adı eksiksiz korunur.",
 'hayir-aydeed-remix':"Hayır (AYDEED Remix), deluxe sürümde yer alan farklı bir düzenlemedir. Haziran 2025 albümündeki Hayır özgün kayıt olarak durur; burada Eylül tarihli deluxe yayındaki yeri ve kendi süresi gösterilir.",
 'outro-extended-version':"Outro (Extended Version), ilk albümün kapanış parçasının genişletilmiş sürümüdür. Deluxe listesindeki son ek kayıttır; özgün Outro için ilk albüm sayfasına bakılabilir.",
 'ruya':"RÜYA, manifestival (deluxe) sonrasında Ekim 2025’te ayrı single olarak yayımlandı. Albümün 16 parçalık genişletilmiş listesine sonradan eklenmez. Aralık ayında gelen Amatör ile yayın sırasını karşılaştırmak mümkündür.",
 'amator':"Amatör, Aralık 2025 tarihli bağımsız single’dır. Grubun resmî YouTube videosu doğrulanan parçalardan biridir; bu sayfada hem dinleme adresi hem video yer alır. RÜYA’dan sonraki dönemi temsil eder.",
 'basrol-sensin-1-yil-ozel':"Başrol Sensin (1. Yıl Özel) adındaki parantezli ifade resmî yayın adının parçasıdır. Şubat 2026 tarihli tek şarkılık kayıt, aynı ayın sonundaki Manifest remiksinden farklıdır.",
 'manifest-arem-arman-remix':"Manifest (Arem & Arman Remix), albümdeki Manifest şarkısının 2026 tarihli yeni düzenlemesidir. Şarkı adı benzer olsa da 2025 özgün albüm kaydıyla aynı künyeye sahip değildir.",
 'zehir-arem-arman-remix':"Zehir (Arem & Arman Remix), Mart 2026’da çıkan ayrı remiks sürümüdür. Deluxe albümdeki Zehir (Motive Remix) ve ilk albümdeki Zehir ile yayın tarihi ve düzenleme bilgisi bakımından ayrılır.",
 'daha-iyi':"Daha İyi, Nisan 2026 tek şarkılık Manifest yayınıdır. Doğrulanmış resmî video bağlantısı bu sayfadadır; şarkı, 2025 manifestival albümünün parçası gibi gösterilmez.",
 'hileli':"Hileli, Manifest ile Ajda Pekkan’ın birlikte adlandırıldığı Mayıs 2026 single’ıdır. Sanatçı künyesinde iki tarafın görünmesi, kaydı grubun solo parçalarından ayırır. Ardından gelen Toz Pembe başka bir yayındır.",
 'toz-pembe':"Toz Pembe, Temmuz 2026 başındaki bağımsız single’dır. Resmî müzik videosu doğrulanan parçalardan biridir; Apple Music dinleme kaydı ve video aynı sayfadan açılır. Ayın sonundaki pVg remiksiyle karıştırılmamalıdır.",
 'pvg-manifest-live-remix':"pVg (Manifest Live Remix), Manifest, Motive ve Pango’nun birlikte anıldığı ortak kayıttır. Adındaki canlı remiks ibaresi sürüm türünü belirtir; bunu grubun solo stüdyo albümü veya manifestival’e ek parça olarak göstermiyoruz."
}
ops=[]
for r in db.execute("SELECT * FROM artist_entries WHERE artist='manifest' AND status='published'"):
 slug=r['slug'];kind=r['kind']
 if kind=='albumler':
  assert slug in release_notes
  note=release_notes[slug];first,second=release_pairs[slug]
  is_album=slug in ('manifestival','manifestival-deluxe')
  format_='albüm' if is_album else 'single'
  body=(f"## Yayın ve bağlam\n{r['title']}, Manifest’in {tarih(r['date'])} tarihli {format_} yayınıdır. Apple Music kaydındaki sanatçı, biçim ve tarih bu arşivde esas alınır. {note}\n\n"
        f"## Şarkılar ve katalogdaki yeri\n"+(f"Bu sürümde {len(r['tracks'].splitlines())} parça bulunur; ayrıntılı sıralama aşağıdadır. " if is_album else f"Tek şarkılık yayın aşağıdaki parça bağlantısıyla kendi künye sayfasına gider. ")+f"Manifest şarkıları arasında bu kaydın dönemini görmek için {first} ve {second} sayfalarına da bakılabilir. Albüm ve remiksleri tarihlerine göre ayırmak, aynı parçayı yanlış bir yeni yayın gibi saymayı önler.\n\n"
        f"## Dinleme ve kaynak\nResmî Apple Music bağlantısı sayfanın sonunda yer alır. Parça listesi ilgili şarkı sayfalarına, Manifest üyeleri grup geçmişine, Manifest konserleri ise sahne duyurularına bağlanır. Kapak bu yayının Apple Music görseliyle eşleştirilmiştir; kaynak {tarih(r['date'])} tarihli kayıt üzerinden 27 Eylül 2026’da kontrol edildi.")
  description=(f"Manifest’in {r['title']} yayını: {tarih(r['date'])} çıkış tarihi, "+(f"{len(r['tracks'].splitlines())} parçalık liste" if is_album else "şarkı künyesi")+", resmî dinleme bağlantısı ve ilişkili diskografi kayıtları.")
 elif kind=='haberler':
  assert slug in news_notes
  release=news_release[slug]
  body=(f"## Gelişme\n{r['summary']} {news_notes[slug]}\n\n"
        f"## İlgili yayın\n{release} için diskografi sayfasında çıkış tarihi, sanatçı künyesi ve kapak; şarkı arşivinde ise ilgili kayıt ve varsa resmî video bulunur. Haber, dinleme kaydını tekrar eden boş bir duyuru olarak bırakılmadı: yayın sırasındaki yeri ve önceki/sonraki çalışmalarla ilişkisi burada açıklandı.\n\n"
        f"## Kaynak ve arşiv\nYayın bilgisi bağlantı verilen Apple Music kaydından 27 Eylül 2026’da kontrol edildi. Manifest üyeleri ve manifestival albümü grubun başlangıcını, Manifest şarkıları dönemler arasındaki geçişi, Manifest konserleri sahne duyurularını gösterir.")
  description=f"{r['summary']} Yayın bağlamı, ilgili şarkılar ve resmî dinleme kaynağıyla Manifest haber arşivinde."
 else:
  if slug=='konser-2026-06-06':
   body=("## İlk festival günü\nBiletix’in Manifestival Ankara duyurusunda 6–7 Haziran 2026 tarihleri ve Atatürk Orman Çiftliği yer alır. Bu sayfa iki günlük festivalin 6 Haziran gününe ayrılmış arşiv kaydıdır. Organizatör, Manifest için iki akşam özel sahne gösterisi ve gün boyunca başka etkinlikler duyurmuştur. Buradan grubun kesin sahne saatini veya geçmiş performansın gerçekleştiğini ayrıca teyit ettiğimiz sonucu çıkarılmamalıdır.\n\n"
         "## Mekân ve program\nAtatürk Orman Çiftliği, duyurudaki Ankara konumudur. Festival programı, giriş koşulları ve bilet türleri için resmî Biletix sayfası esas alınır. 7 Haziran için ayrı bir konser kaydı vardır; iki günü tek tarih gibi göstermiyoruz. Görsel organizatörün etkinlik afişidir.\n\n"
         "## Arşivde devam et\nManifest konserleri takviminden ikinci festival gününe, manifestival albümünden festivalle aynı adı taşıyan müzik yayınına, Manifest şarkıları sayfasından da kayıt künyelerine geçilebilir. Kaynak 27 Eylül 2026’da kontrol edildi.")
  elif slug=='konser-2026-06-07':
   body=("## İkinci festival günü\nManifestival Ankara duyurusundaki ikinci tarih 7 Haziran 2026’dır. Mekân yine Atatürk Orman Çiftliği olarak verilmiştir. Biletix’in iki günlük festival açıklaması, Manifest’in her akşam özel bir sahne gösterisi planladığını belirtir; fakat kesin grup sahne saati burada belgelenmediği için saat uydurulmaz.\n\n"
         "## 6 Haziran’dan farkı\nİlk gün ayrı bir konser arşivi kaydında tutulur. Böylece her tarihin kendi adresi, şehir ve mekân bilgisi vardır. Geçmiş etkinliğin fiilen gerçekleştiğine dair bağımsız teyit bu kayıtla iddia edilmez. Sayfadaki fotoğraf başka bir Manifest performansının açık kaynak arşivinden seçilmiştir; bu festival günündenmiş gibi gösterilmez.\n\n"
         "## Bağlantılar ve kaynak\nGüncel bilet veya organizatör bilgisi için resmî Biletix bağlantısı kullanılır. Manifest konserleri içinde başka tarihler, manifestival albümünde şarkı listesi, Manifest üyeleri sayfasında grup geçmişi bulunur. Kaynak 27 Eylül 2026’da kontrol edildi.")
  else:
   body=("## Londra konser duyurusu\nOVO Arena Wembley’in resmî etkinlik sayfası Manifest’i 16 Ekim 2026 Cuma günü Londra’da listeliyor. Salon duyurusunda XO da eşlikçi olarak anılıyor. 27 Eylül 2026 itibarıyla bu tarih gelecektedir; gerçekleşmiş konser fotoğrafı veya sonradan kesinleşmiş bir setlist varmış gibi anlatmıyoruz.\n\n"
         "## Yer ve saat bilgisi\nMekân OVO Arena Wembley’dir. Resmî sayfada etkinlik saati henüz kesin açıklanmadığı için takvim kaydında saat boş bırakıldı. Bilet, giriş ve yaş koşulları değişebileceğinden seyahat planlamadan önce salonun güncel sayfası kontrol edilmelidir. Sayfadaki görsel salonun duyuru fotoğrafından alınmıştır.\n\n"
         "## Manifest arşivi\nManifest konserleri sayfası geçmiş Ankara duyuruları ile yaklaşan Londra tarihini ayrı gösterir. manifestival albümü ve Manifest şarkıları bağlantıları, grubun yayımlanmış kayıtlarına götürür. Salon kaynağı 27 Eylül 2026’da kontrol edildi.")
  description=f"Manifest’in {tarih(r['date'])} {r['city']} konser duyurusu: {r['venue']}, resmî etkinlik kaynağı, program ve arşiv bilgileri."
 assert len(body)>700,(slug,len(body))
 values={'body':body,'seo_description':description}
 if kind=='albumler':values['summary']=release_summaries[slug]
 if kind=='haberler':values['summary']=r['summary']
 ops.append({'type':'entry','id':r['id'],'kind':kind,'slug':slug,'expectedRevision':r['revision'],'values':values})
for r in db.execute("SELECT slug,data,revision FROM artist_songs WHERE artist='manifest' AND status='published'"):
 data=json.loads(r['data']);slug=r['slug'];assert slug in song_notes,slug
 duration=f"{data['duration']//60} dakika {data['duration']%60} saniye"
 title=data['albumTitle']
 first=(f"Manifest’in {data['name']} kaydı {tarih(data['date'])} tarihli {title} yayınında yer alır. "
        f"Süre {duration}; resmî dinleme bağlantısı Apple Music kaydıdır.")
 second=song_notes[slug]
 third=("Şarkı sayfasındaki yayın bağlantısı parça listesini ve kapak kaynağını, Manifest şarkı rehberi diğer dönemleri, grup biyografisi ise Manifest’in kuruluş ve yayın kronolojisini gösterir. "
        "Doğrulanmış resmî video varsa ayrıca gösterilir; tam sözler için hizmetin kendi söz ekranı kullanılabilir.")
 data['description']=first+'\n\n'+second+'\n\n'+third
 assert len(data['description'])>370,(slug,len(data['description']))
 ops.append({'type':'song','slug':slug,'expectedRevision':r['revision'],'status':'published','values':data})
bio=db.execute("SELECT biography,sources,revision FROM artist_content WHERE artist='manifest'").fetchone()
biography=bio['biography'].replace("## Konserler ve sahne",'''## Manifest müziğine nereden başlamalı?
İlk dönemi kronolojik dinlemek isteyen biri önce Zamansızdık ve Arıyo single’larına, ardından 11 parçalık manifestival albümüne bakabilir. Albümün Intro ve Outro arasında kurduğu sıra, parçaları bağımsız single listesiyle karıştırmadan dinlemeye yardım eder. manifestival (deluxe) ilk albümün bütün kayıtlarını korur ve beş yeni düzenleme ekler; böylece Arıyo, Zehir, Hayır ve Outro’nun özgün sürümleriyle remiksleri karşılaştırılabilir.

2025 sonundaki RÜYA ve Amatör, ilk albüm dışındaki ayrı yayınlardır. 2026 arşivinde Daha İyi, Ajda Pekkan ile Hileli ve Toz Pembe farklı single dönemlerini gösterir. pVg (Manifest Live Remix) ise Motive ve Pango ile ortak kayıttır. Her şarkı sayfası tarih, süre, sanatçı künyesi, resmî dinleme adresi ve varsa doğrulanmış videoya gider; ayrı yayınları tek albüm sanmamak için diskografi bağlantıları korunur.

## Konserler ve sahne''')
assert len(biography)>2400
ops.append({'type':'biography','expectedRevision':bio['revision'],'values':{'biography':biography,'sources':bio['sources']}})
batch={'artist':'manifest','operations':ops}
Path('content/manifest/editorial-batch-20260927.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2)+'\n')
lengths={'entry_min':min(len(o['values']['body']) for o in ops if o['type']=='entry'),'song_min':min(len(o['values']['description']) for o in ops if o['type']=='song'),'bio':len(biography)}
print(json.dumps({'operations':len(ops),**lengths},ensure_ascii=False))
