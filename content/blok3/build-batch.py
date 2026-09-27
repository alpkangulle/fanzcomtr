#!/usr/bin/env python3
"""Build a sourced BLOK3 batch from the verified 2026-09-27 Apple catalog."""
import json,os,re,sqlite3,unicodedata,requests
from pathlib import Path
items=json.loads(Path('content/blok3/apple-catalog.json').read_text())
con=sqlite3.connect(os.environ['DATABASE_PATH']);con.row_factory=sqlite3.Row
ops=[];artist='blok3';portrait='/images/artists/blok3.png';checked='27 Eylül 2026'
def slug(s):
 s=s.casefold().replace('ı','i').replace('ğ','g').replace('ş','s').replace('ç','c').replace('ö','o').replace('ü','u');s=unicodedata.normalize('NFKD',s)
 return re.sub('-+','-',re.sub('[^a-z0-9]+','-',s)).strip('-')
def rev(table,key):
 col={'artist_content':'artist','artist_entries':'id','artist_songs':'slug'}[table]
 row=con.execute(f'SELECT revision FROM {table} WHERE artist=? AND {col}=?',(artist,key)).fetchone()
 return row['revision'] if row else None
def add(kind,key,slugval,values):ops.append(dict(type='entry',id=key,kind=kind,slug=slugval,expectedRevision=rev('artist_entries',key),values={'status':'published',**values}))
base='https://music.apple.com/tr/artist/blok3/1633245914'
bio='''## BLOK3 kimdir?
BLOK3, gerçek adı Hakan Aydın olan Türkçe rap sanatçısıdır. Gebze’de doğan sanatçı, ilk kayıtlarından itibaren kısa ve doğrudan nakaratlarla ritmik rap anlatısını bir araya getirdi. Bu sayfa bir sanatçı hesabı değil, kayıtları ve duyuruları kaynaklarıyla derleyen bağımsız bir fan topluluğudur. Bir dinleyici olarak hangi şarkıdan başlamanın anlamlı olduğunu, yayınların birbirine nasıl bağlandığını ve güncel konser bilgisinin nerede teyit edileceğini burada bulabilirsin.

## İlk şarkılardan geniş dinleyici kitlesine
Apple Music kataloğunda 2021 tarihli WOW, OKEY OKEY, yallah ve WOUM BABY gibi ilk single’lar yer alır. 2022’de Patlat ve VUR, 2023’te AFFETMEM, BAYBAY, YAPTIRICAZ TIRNAKLARINI ve aklına ben gelicem ayrı yayınlar olarak geldi. Bu başlıklar bir albümün parçalarıymış gibi toplanmaz; her biri kendi yayın tarihi ve kapağıyla gösterilir. 2023 Pantene Altın Kelebek töreninin resmî görüntüsünde BLOK3’ün En İyi Rap Sanatçısı ödülü aldığı doğrulanıyor. Erken dönemin sert vuruşlu parçalarıyla sonraki duygusal anlatılar arasındaki farkı görmek için şarkı rehberi iyi bir başlangıçtır.

## OBSESIF ve Virtüöz dönemi
13 Eylül 2024’te yayımlanan 12 parçalık OBSESIF, BLOK3’ün ilk uzun albüm dönemini temsil eder. ZEHİRLİ GÜL, ESKİSİ GİBİ ve SEVMEYİ DENEMEDİN gibi kayıtlar albümün farklı yönlerini açar. 2025 tarihli dört parçalık Virtüöz EP, napıyosun mesela ?, git, Hako diyorlar ve keçi parçalarını bir araya getirdi. Single ile EP’de aynı kayıt varsa şarkı sayfasını ikiye bölmeden ilgili yayın bağını koruyoruz. Bu aradaki Keşke, Mosmor Perde ve KUSURA BAKMA single’ları kronolojinin başka duraklarıdır.

## KAYIP PERSONA ve güncel katalog
Apple Music’e göre KAYIP PERSONA, 5 Haziran 2026’da 13 parça ve yaklaşık 33 dakika olarak yayımlandı. Kayıp Kalp ile açılan listede Sebebi Yar, BABA, Kırgınım, Değiştiremezsin Yazılmışsa, Son Bi Dans, Sakin Ol Champ, Çok Güzel Gülüyorsun, Allah Allah ?, Her Gece ve daha önce duyulan kayıtlar da bulunur. Çok Güzel Gülüyorsun künyesinde Poizi ortak sanatçı olarak geçer. Yeniden albüme giren şarkıları yeni single gibi çoğaltmıyoruz. Albüm ve her şarkının kendi sayfasında resmî dinleme adresi, süre, kapak ve mevcutsa doğrulanmış video vardır.

## Konserler ve hayran topluluğu
2026 sonbaharı için Türkiye’nin farklı şehirlerinde duyurulan konserler resmî bilet sayfaları üzerinden ayrı ayrı arşivlenir. Tarih ve mekân değişebilir; yolculuk veya bilet kararı öncesinde ilgili organizatör sayfasını yeniden kontrol et. BLOK3 konserleri, albümleri, şarkıları ve haberleri arasında gezinirken metinlerdeki bağlantılar seni ilgili Fanz sayfasına götürür. Fan Club sohbetinde diğer dinleyicilerle buluşabilir, yorum ve beğenileri üye olmadan da kullanabilirsin. Kaynaklar bu metin için 27 Eylül 2026 tarihinde kontrol edildi.'''
sources='\n'.join([base,'https://www.tv2.com.tr/programlar/guncel/pantene-altin-kelebek-odulleri/kisa-klipler/en-iyi-rap-sanatcisi-blok3','https://www.bubilet.com.tr/sanatci/blok3-'])
ops.append(dict(type='biography',expectedRevision=rev('artist_content',artist),values=dict(biography=bio,sources=sources)))
release_map={};song_map={};track_set={}
for x in items:
 name=x['collectionName'];title=re.sub(r' - (Single|EP)$','',name);id=str(x['collectionId']);date=x['releaseDate'][:10];url=x['collectionViewUrl'];cover=f'/images/albums/blok3-{id}.jpg';count=x['trackCount'];fmt='Albüm' if count>5 else 'EP' if count>1 else 'Single';key='blok3-album-'+id;pathslug=slug(title)
 if pathslug in release_map:pathslug+='-'+id
 tracks=requests.get(f'https://itunes.apple.com/lookup?id={id}&entity=song&country=TR',timeout=20).json()['results'][1:]
 assert len(tracks)==count,(title,count,len(tracks))
 names=[t['trackName'] for t in tracks];track_set[id]=tracks;release_map[id]=(key,pathslug,title,date,url,cover,fmt)
 summary=f'BLOK3’ün {date} tarihli {fmt.lower()} yayını {title}; {count} parça, resmî kapak ve Apple Music dinleme kaydı.'
 before='Bu yayın, 2021–2023 arasındaki bağımsız single dizisinin parçasıdır.' if date<'2024-01-01' else 'OBSESIF çevresindeki 2024 kayıtlarıyla aynı dönemde yayımlanmıştır.' if date<'2025-01-01' else 'Virtüöz EP ve 2025 single’ları arasındaki dönemde yer alır.' if date<'2026-01-01' else 'KAYIP PERSONA dönemi kataloğunun bir parçasıdır.'
 middle=(f'Parça sırası: {", ".join(names)}. ' if count>1 else f'Bu tek şarkılık yayının parçası {names[0]}. ')
 nuance='Albüm listesi önceki EP ve single parçalarını da içerir; aynı kayıtları şarkı rehberinde yeni besteler gibi tekrar saymıyoruz. Poizi ortak kaydı yalnız ilgili şarkının künyesinde belirtilir.' if title=='KAYIP PERSONA' else 'Albüm sıralaması 12 ayrı parçadan oluşur; her biri süre ve kayıt bağlantısıyla şarkı rehberinde açılır.' if title=='OBSESIF' else 'Dört şarkılık EP, yeniden yayımlanan şarkıların ilk duyurularıyla ilişkilendirilir; bunlar arşivde ikinci bir şarkı kimliği oluşturmaz.' if fmt=='EP' else 'Şarkının başka bir albümde yeniden görünmesi bu özgün yayının tarihini değiştirmez.'
 body=f'''{title}, Apple Music kataloğunda {date} tarihinde yayımlanan BLOK3 {fmt.lower()} kaydıdır. {before} {middle}Yayının kendi kapağı ve dinleme bağlantısı, burada arşivlenen başlıkla eşleştirildi.\n\n{nuance} Yayınları tarih sırasıyla karşılaştırmak için BLOK3 albümleri bölümüne, parça düzeyindeki künye ve resmî videolar için BLOK3 şarkıları rehberine bakabilirsin. 2026 konserleri ve sanatçının biyografisi müziğin sahne ve kariyer bağlamını tamamlar.\n\nBu kayıt dinleme hizmetinin sanatçı ve parça sırasını aktarır; tam şarkı sözü veya kaynakta bulunmayan yapımcı bilgisi eklemez. Kontrol: {checked}.'''
 add('albumler',key,pathslug,dict(title=title,summary=summary,body=body,date=date,url=url,source=url,cover=cover,tracks='\n'.join(names),release_name=title,release_format=fmt,release_credits=x.get('artistName','BLOK3'),seo_title=f'BLOK3 {title} ({date[:4]}): {fmt}, Şarkılar ve Dinleme',seo_description=f'BLOK3 {title} {fmt.lower()}ü: {date} yayın tarihi, {count} şarkılık liste, resmî kapak ve Apple Music dinleme bağlantısı.'))
 for t in tracks:
  song_key=slug(t['trackName']);old=song_map.get(song_key)
  if old and (old['date']<date or (old['date']==date and old['albumTitle']=='KAYIP PERSONA')):continue
  duration=round(t.get('trackTimeMillis',0)/1000);assert duration>0
  credit=t.get('artistName','BLOK3');position=t['trackNumber'];song_url=t.get('trackViewUrl') or url
  desc=f'''{t['trackName']}, BLOK3’ün {date} tarihli {title} yayınının {position}. sırasında yer alıyor. Resmî Apple Music kaydı süreyi {duration//60} dakika {duration%60} saniye, sanatçı adını {credit} olarak listeliyor. Şarkıyı dinlemek için doğrudan kayıt bağlantısı kullanılır.\n\n{fmt} içindeki konumunu ve aynı dönemin diğer parçalarını görmek için {title} yayın sayfasına geçebilirsin. BLOK3 biyografisi ilk single’lardan 2026 albümüne uzanan çizgiyi anlatır; konser sayfalarında ise sahne takviminin güncel resmî bilet bağlantıları bulunur. Parça adı önceki bir single veya EP’de de geçiyorsa bunlar müzik kataloğunda ayrı yayınlardır, bu şarkıyı iki yeni beste olarak saymıyoruz.\n\nBurada sözler kopyalanmaz; dinleme hizmetinin söz ekranı erişime açıksa resmî bağlantıdan görülebilir. Kaynak kontrolü: {checked}.'''
  song_map[song_key]=dict(name=t['trackName'],slug=song_key,albumId=key,albumSlug=pathslug,albumTitle=title,date=date,cover=cover,position=position,credits=credit,duration=duration,url=song_url,description=desc,videoId=None,videoSource='')
video={'sebebi-yar':'69L-nKRY3ac','kayip-kalp':'A7ShtPRP2Mc','kusura-bakma':'Y9AXKgqGwN4','sakin-ol-champ':'ny_qAeiZ88I'}
for k,v in song_map.items():
 if k in video:v['videoId']=video[k];v['videoSource']='https://www.youtube.com/watch?v='+video[k]
 ops.append(dict(type='song',slug=k,expectedRevision=rev('artist_songs',k),status='published',values=v))
# News records use dated releases and one independently documented award.
news=[
 ('2023-12-03','altin-kelebek-2023','BLOK3, 2023 Altın Kelebek’te En İyi Rap Sanatçısı seçildi','https://www.tv2.com.tr/programlar/guncel/pantene-altin-kelebek-odulleri/kisa-klipler/en-iyi-rap-sanatcisi-blok3',None),
 ('2024-09-13','obsesif-albumu','BLOK3’ün 12 şarkılık OBSESIF albümü yayımlandı',next(x['collectionViewUrl'] for x in items if x['collectionName']=='OBSESIF'),'OBSESIF'),
 ('2025-07-18','virtuoz-ep','BLOK3, dört şarkılık Virtüöz EP’yi yayımladı',next(x['collectionViewUrl'] for x in items if x['collectionName']=='Virtüöz - EP'),'Virtüöz'),
 ('2026-06-05','kayip-persona-albumu','BLOK3’ün KAYIP PERSONA albümü 13 şarkıyla yayımlandı',next(x['collectionViewUrl'] for x in items if x['collectionName']=='KAYIP PERSONA'),'KAYIP PERSONA')]
for date,key,title,source,release in news:
 found=next((x for x in items if release and x['collectionName'].startswith(release)),None)
 cover=f'/images/albums/blok3-{found["collectionId"]}.jpg' if found else portrait
 detail=('Törenin resmî video kaydı ödülün BLOK3’e verildiğini doğruluyor. Ödül, 2023 yılı single dizisinin ardından sanatçının daha geniş bir dinleyiciye ulaştığı döneme denk geliyor. Bu haber yarışma sonucunu kayda geçirir; oy sayısı veya ödül konuşmasının doğrulanmamış bölümlerini aktarmıyoruz.' if not release else f'Apple Music, {release} yayınını {date} tarihiyle listeliyor. Kayıt {found["trackCount"]} parça içeriyor. Albümün veya EP’nin parça sırası, süresi ve resmî kapağı yayın arşivinde ayrı gösteriliyor; şarkıların ayrıntı sayfaları resmî dinleme adreslerine gidiyor.')
 summary=title+'. Kaynak, yayın tarihi ve ilgili arşiv bağlantılarıyla.'
 body=f'''{title}. {detail}\n\nBLOK3’ün önceki yayınları ile bu gelişmeyi karşılaştırmak için albüm ve single arşivine bakabilirsin. Şarkı rehberi yayınlara ait parçaları tek tek açar; sanatçı biyografisi ilk single’lardan sonraki albüm dönemine bağlam sağlar. Konser takviminde güncel etkinlik için daima bilet satıcısının resmî açıklaması esas alınır.\n\nHaber metni özgün bir kaynak özetidir; kaynak sayfasındaki haber veya şarkı sözleri kopyalanmamıştır. Kontrol tarihi: {checked}.'''
 add('haberler','blok3-news-'+key,key,dict(title=title,summary=summary,body=body,date=date,url=source,source=source,cover=cover,seo_title=title+' | BLOK3 Haberleri',seo_description=title+' Kaynaklı tarih, ilgili albüm ve şarkı bağlantılarıyla BLOK3 haber arşivinde.'))
# Bubilet's artist list links to each individual current ticket page.
events=[
 ('2026-10-03','Antalya','Konyaaltı Belediyesi Atatürk Stadı','21:00','https://www.bubilet.com.tr/antalya/etkinlik/blok3-konseri/seans/285637'),
 ('2026-10-10','Ankara','Atatürk Orman Çiftliği Konser Alanı','21:30','https://www.bubilet.com.tr/ankara/etkinlik/blok3-turkiye-tour-2026/seans/284522'),
 ('2026-10-11','Adana','Mimar Sinan Açıkhava Tiyatrosu','21:00','https://www.bubilet.com.tr/adana/etkinlik/blok3--konseri/seans/286689'),
 ('2026-10-14','Bursa','Merinos Park','21:00','https://www.bubilet.com.tr/bursa/etkinlik/blok3-konseri-/seans/288191'),
 ('2026-10-16','Samsun','Doğu Park Amfi Tiyatro','21:00','https://www.bubilet.com.tr/samsun/etkinlik/--blok3-/seans/288875'),
 ('2026-10-17','Kayseri','KUMSmall AVM Açık Otopark','21:00','https://www.bubilet.com.tr/kayseri/etkinlik/-blok3-/seans/288871'),
 ('2026-10-18','Sakarya','Sapanca Festival ve Fuar Alanı','21:00','https://www.bubilet.com.tr/sakarya/etkinlik/blok3--/seans/288860'),
 ('2026-10-31','Eskişehir','Eskişehir Fuar ve Kongre Merkezi','21:00','https://www.bubilet.com.tr/eskisehir/etkinlik/-blok3-konseri--/seans/288197'),
 ('2026-11-21','Konya','KTO - Tüyap Fuar ve Kongre Merkezi','21:00','https://www.bubilet.com.tr/konya/etkinlik/blok3---konseri/seans/289780')]
for i,(date,city,venue,time,url) in enumerate(events):
 # Bubilet posters could not be fetched from the server. Distinct official BLOK3
 # release images fill the cards, with a plainly stated non-event attribution.
 art=items[-1-i] if i<len(items) else items[0];cover=f'/images/albums/blok3-{art["collectionId"]}.jpg'
 title=f'BLOK3 {city} konseri: {date} · {venue}'
 summary=f'BLOK3 {city} konseri {date} tarihinde {venue} için Bubilet’te duyuruldu; resmî bilet sayfasını incele.'
 body=f'''BLOK3’ün {city} konseri, Bubilet’in güncel etkinlik listesinde {date} tarihi ve {venue} mekânıyla yer alıyor. Listelenen konser saati {time}; kapı açılışı, oturma/ayakta alan düzeni, yaş sınırı ve bilet sınıfları için aşağıdaki resmî etkinlik sayfasındaki son bilgiyi kontrol et. Bu arşiv kaydı, duyurunun {checked} tarihindeki durumunu yansıtır; etkinliğin gerçekleştiğini önceden iddia etmez.\n\nSanatçının güncel dönemini dinlemek istersen KAYIP PERSONA albümüne, önceki kayıtlar için OBSESIF ve Virtüöz yayınlarına gidebilirsin. BLOK3 şarkı rehberi parçaları süreleriyle, sanatçı biyografisi ise yayınların kronolojisiyle gösterir. Diğer şehirler ve tarihler BLOK3 konserleri sayfasında ayrı kartlardır.\n\nKartta kullanılan resim {art['collectionName']} için resmî yayın kapağıdır; {city} konserinin afişi veya sahne fotoğrafı olarak sunulmaz. İptal, erteleme veya mekân değişikliği için bilet sağlayıcısının güncel duyurusu esas alınır.'''
 key='blok3-event-'+date+'-'+slug(city)
 add('konserler',key,'konser-'+date+'-'+slug(city),dict(title=title,summary=summary,body=body,date=date,time=time,city=city,venue=venue,url=url,source=url,cover=cover,event_status='scheduled',event_country='TR',event_timezone='Europe/Istanbul',seo_title=f'BLOK3 {city} Konseri {date}: {venue} ve Biletler',seo_description=f'BLOK3 {city} konseri {date} tarihinde {venue} mekânında duyuruldu. Saat {time}; güncel program ve bilet koşulları için resmî sayfa.'))
batch={'artist':artist,'operations':ops}
Path('content/blok3/batch-20260927.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'operations':len(ops),'entries':sum(x['type']=='entry' for x in ops),'songs':sum(x['type']=='song' for x in ops),'news':len(news),'concerts':len(events)},ensure_ascii=False))
