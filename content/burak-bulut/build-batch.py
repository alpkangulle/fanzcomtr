#!/usr/bin/env python3
"""Build Burak Bulut archive batches from Apple catalog and checked primary sources."""
import json,os,re,sqlite3,unicodedata,requests
from pathlib import Path
items=json.loads(Path('content/burak-bulut/apple-catalog.json').read_text())
con=sqlite3.connect(os.environ['DATABASE_PATH']);con.row_factory=sqlite3.Row
artist='burak-bulut';base='https://music.apple.com/tr/artist/burak-bulut/841584918'
def slug(s):
 s=s.casefold().translate(str.maketrans('ığşçöü','igscou'))
 s=unicodedata.normalize('NFKD',s)
 return re.sub('-+','-',re.sub('[^a-z0-9]+','-',s)).strip('-')
def revision(table,key):
 col='artist' if table=='artist_content' else 'slug' if table=='artist_songs' else 'id'
 r=con.execute(f'SELECT revision FROM {table} WHERE artist=? AND {col}=?',(artist,key)).fetchone()
 return r['revision'] if r else None
ops=[]
def entry(kind,id,path,values):
 ops.append({'type':'entry','id':id,'kind':kind,'slug':path,'expectedRevision':revision('artist_entries',id),'values':{'status':'published',**values}})
bio="""## Burak Bulut kimdir?
Burak Bulut, Türkçe pop şarkılarını solo kayıtlar ve farklı sanatçılarla ortak çalışmalar halinde yayımlayan müzisyendir. Bu sayfa sanatçının resmî hesabı değil, yayınları ve duyuruları kaynaklarıyla karşılaştıran bağımsız bir Fan Club topluluğudur. Diskografide bir şarkının ilk single yayını ile daha sonra girdiği albüm ayrı yayınlar olarak, şarkının kendisi ise tek bir künye altında gösterilir.

## İlk kayıtlar ve Kurtuluş Kuş ile şarkılar
Apple Music kataloğu Oluruna Bırak ve Kara Bahtım gibi ilk solo yayınlardan 2021 dönemindeki Nabız, Leyla Mecnun, Baba Yak, Herkes Duydu ve İçime Ata Ata kayıtlarına uzanır. Kurtuluş Kuş ile ortak çalışmalar, Burak Bulut’un kataloğunun önemli bir bölümünü oluşturur; Ebru Yaşar ve Mustafa Ceceli gibi isimlerin yer aldığı kayıtlar da kendi sanatçı künyesiyle gösterilir. Ortak kayıtlarda şarkıyı yalnız Burak Bulut’a aitmiş gibi sunmuyoruz. Şarkı rehberinde her parçanın çıkış tarihi, yayın adı, süresi ve Apple Music dinleme adresi bulunur.

## Kehribar, Manolya ve Gözlerin Silah
2023’te Kehribar, Manolya ve Cano 2 gibi tekliler; 2024’te Medcezir, Anılara Dalarız, Yeniden Sevemem ve Kurtuluş Kuş ile altı parçalık Gözlerin Silah EP kataloğu genişletti. Akustik veya remiks sürümleri aynı beste olsa da ayrı kayıt olarak açıkça adlandırılır. Gözlerin Silah, ortak bir EP’dir; konuk kaydı yüzünden başka sanatçının bütünüyle ilgisiz yayınları bu arşive taşınmaz. Bu dönemin yayın kapakları albüm ve single sayfalarında, parçaların künye ayrıntıları şarkı sayfalarında bulunur.

## Solo dönem ve Mona Lisa
2025’te Özür Dilerim, Yasemin, İhanet, Sevda Treni, Enkaz ve Herkes Gibi gibi single’lar yayımlandı. Apple Music’te 20 Şubat 2026 tarihli Mona Lisa albümü on şarkı olarak listeleniyor. 2026 boyunca Ama Başaramadım, Bir Sigara Yaktım, Diva, Ah Be Manolya ve 25 Eylül tarihli Git O Yüzden gibi yayınlar da sanatçı sayfasında yer aldı. Aynı şarkı single ile albümde varsa ayrı yeni beste sayılmıyor; yayınlar arasında doğru bağlantı kuruluyor.

## Üretim, sahne ve kaynaklar
MESAM Vizyon röportajında Bulut, okul sonrası babasının dükkânının üst katındaki amatör stüdyoda çalıştığını ve müziğe ilgisini anlatıyor. Aynı söyleşide Kurtuluş Kuş ile Sevmedim Deme filmindeki oyunculuğuna değiniyor. Söyleşideki geleceğe dönük hazırlıkları olmuş bitmiş yayın gibi aktarmıyoruz. 2026 sonbaharı Niğde ve İstanbul konserleri güncel bilet sayfalarıyla ayrı ayrı izlenir; tarih, saat ve koşullar değişebileceğinden bilet alırken organizatörün son açıklaması esas alınmalıdır. Burak Bulut haberleri, konserleri ve müzik yayınları arasında gezerek kaynakları karşılaştırabilirsin. Kontrol: 27 Eylül 2026."""
sources='\n'.join([base,'https://mesamvizyon.com/roportajlar/muzik-cocuklukta-kurdugum-bir-hayaldi-simdi-her-gun-yasiyorum','https://www.bubilet.com.tr/sanatci/burak-bulut'])
ops.append({'type':'biography','expectedRevision':revision('artist_content',artist),'values':{'biography':bio,'sources':sources}})
release={};songs={}
for x in items:
 title=re.sub(r' - (Single|EP)$','',x['collectionName']);date=x['releaseDate'][:10];cid=str(x['collectionId']);url=x['collectionViewUrl'];cover=f'/images/albums/burak-bulut-{cid}.jpg'
 key='burak-bulut-album-'+cid;path=slug(title)
 if path in (v['path'] for v in release.values()):path+='-'+cid
 tracks=requests.get(f'https://itunes.apple.com/lookup?id={cid}&entity=song&country=TR',timeout=20).json()['results'][1:]
 if len(tracks)!=x['trackCount']:raise ValueError((title,len(tracks),x['trackCount']))
 names=[t['trackName'] for t in tracks];fmt='Albüm' if len(tracks)>6 else 'EP' if len(tracks)>1 else 'Single'
 release[cid]={'id':key,'path':path,'title':title,'date':date,'url':url,'cover':cover,'tracks':names,'format':fmt}
 era='ilk solo kayıtlarının bulunduğu' if date<'2021-01-01' else 'Kurtuluş Kuş ile ortak şarkıların öne çıktığı' if date<'2023-01-01' else 'Kehribar ve Manolya gibi yayınların çevresindeki' if date<'2024-01-01' else 'Gözlerin Silah EP döneminin' if date<'2025-01-01' else 'solo teklilerin genişlediği' if date<'2026-01-01' else 'Mona Lisa albümünün ve sonraki yayınların yer aldığı'
 role='ortak sanatçılarla kaydedilen' if x['artistName']!='Burak Bulut' else 'solo'
 track_line=f'Parça sırası: {", ".join(names)}.' if len(names)>1 else f'Yayında {names[0]} adlı tek kayıt bulunur.'
 special=('On parçalık albümde, daha önce single olarak duyulan kayıtlarla albüm içindeki parçaları ayrı birer yeni beste gibi çoğaltmıyoruz. Parça sıralaması ve farklı kapak, bu albüm sayfasının temel künyesidir.' if title=='Mona Lisa' else 'Altı parçalık bu ortak EP, Burak Bulut ile Kurtuluş Kuş’un aynı projedeki kayıtlarını bir araya getirir; ortak sanatçı bilgisini şarkı düzeyinde de koruyoruz.' if title=='Gözlerin Silah' else f'{title}, {era} katalog içinde {role} bir yayındır. İlk single ve daha sonraki albüm kaydının tarihi birbirine karıştırılmaz.')
 body=f'''{title}, Apple Music’in Burak Bulut kataloğunda {date} tarihinde listelenen {fmt.lower()} yayınıdır. {track_line} Sanatçı künyesi {x['artistName']} olarak geçer; ortak kayıtlarda diğer sanatçıların emeği görünür tutulur. Resmî dinleme bağlantısı ve bu yayına ait kapak aşağıdadır.\n\n{special} Parça sayfaları süreyi, dinleme bağlantısını ve varsa doğrulanmış resmî videoyu ayrı verir. Yayının önceki ve sonraki müzik çizgisini görmek için Burak Bulut biyografisine, diğer kayıtları karşılaştırmak için diskografiye ve şarkı rehberine gidebilirsin.\n\nKatalog kaydı şarkının yayın künyesini doğrular; şarkı sözü, kayıt süreci veya yapımcı hakkında kaynakta bulunmayan ayrıntı eklenmez. Kaynak kontrolü: 27 Eylül 2026.'''
 entry('albumler',key,path,{'title':title,'summary':f'Burak Bulut {title}: {date} tarihli {fmt.lower()} yayını; {len(names)} şarkı, farklı resmî kapak ve Apple Music dinleme bağlantısı.','body':body,'date':date,'url':url,'source':url,'cover':cover,'tracks':'\n'.join(names),'release_name':title,'release_format':fmt,'release_credits':x['artistName'],'seo_title':f'Burak Bulut {title} ({date[:4]}): {fmt}, Şarkılar ve Dinleme','seo_description':f'Burak Bulut {title} {fmt.lower()} yayını: {date}, {len(names)} şarkılık liste, sanatçı künyesi, resmî kapak ve Apple Music bağlantısı.'})
 for t in tracks:
  name=t['trackName'];skey=slug(name);duration=round(t.get('trackTimeMillis',0)/1000)
  if not skey or duration<=0:continue
  old=songs.get(skey)
  if old and old['date']<=date:continue
  desc=f'''{name}, Apple Music’te {date} tarihinde yayımlanan {title} kaydının {t['trackNumber']}. parçasıdır. Hizmetteki sanatçı künyesi {t.get('artistName',x['artistName'])}, süresi {duration//60} dakika {duration%60} saniye olarak görünüyor. Şarkıyı dinlemek için resmî Apple Music kayıt bağlantısını açabilirsin.\n\n{fmt} yayınındaki yerini, şarkı listesini ve kapağı {title} sayfasında incele. Burak Bulut biyografisi ortak projelerden Mona Lisa dönemine uzanan çizgiyi anlatır; konser sayfalarında yalnız doğrulanmış güncel etkinlikler bulunur. Aynı parça başka yayında yeniden listelenirse bu kayıt ayrı bir yeni beste sayılmaz.\n\nBurada tam sözler kopyalanmaz; hizmette sunuluyorsa dinleme ekranından açılabilir. Kaynak kontrolü: 27 Eylül 2026.'''
  songs[skey]={'name':name,'slug':skey,'albumId':key,'albumSlug':path,'albumTitle':title,'date':date,'cover':cover,'position':t['trackNumber'],'credits':t.get('artistName',x['artistName']),'duration':duration,'url':t.get('trackViewUrl') or url,'description':desc,'videoId':None,'videoSource':''}
videos={'git-o-yuzden':'vlZXJp0wkE8','ama-basaramadim':'m-gADGCCLmw','bir-sigara-yaktim':'ZUe3MX9Y8tg','ozur-dilerim':'WX0g3F7PD0g','ah-be-manolya':'KF6SfC6Q-ZA'}
for key,video_id in videos.items():
 if key in songs:
  songs[key]['videoId']=video_id;songs[key]['videoSource']='https://www.youtube.com/watch?v='+video_id
for key,value in songs.items():
 ops.append({'type':'song','slug':key,'expectedRevision':revision('artist_songs',key),'status':'published','values':value})
# Original source summaries; dates match publication, not today's archive-check date.
news=[
 ('2026-09-25','git-o-yuzden','Burak Bulut’un Git O Yüzden single’ı yayımlandı','6814192630','Apple Music son yayın olarak Git O Yüzden’i 25 Eylül 2026 tarihiyle listeliyor. Bu tarih yeni albümün değil, tek şarkılık yayının tarihidir. Şarkının kendi kapağı ve dinleme adresi katalog kaydıyla eşleşir.','Burak Bulut’un 2026’da Mona Lisa sonrasındaki solo yayınları arasında yeni bir single olarak yer alıyor.'),
 ('2026-08-07','ah-be-manolya','Burak Bulut’un Ah Be Manolya single’ı resmî videosuyla yayımlandı','6797579433','Apple Music, Ah Be Manolya single kaydını 7 Ağustos 2026 tarihiyle listeliyor. Sanatçının resmî YouTube kanalındaki video 6 Ağustos’ta açılmış; müzik hizmetinin yayın tarihiyle video yükleme tarihi ayrı olgulardır.','Manolya başlıklı önceki ortak kayıtla aynı yayın olarak sayılmayan bu tekli kendi kapak ve künyesine sahiptir.'),
 ('2026-02-20','mona-lisa','Burak Bulut’un on şarkılık Mona Lisa albümü yayımlandı','1876191868','Apple Music, Mona Lisa albümünü 20 Şubat 2026 tarihli on parçalık bir yayın olarak gösteriyor. Albümün kendi sırası, kapak görseli ve dinleme adresi diskografi sayfasında ayrı tutulur.','2025’in solo single dizisinden sonra gelen albüm, yeniden yayımlanan şarkıları yeni besteler gibi çoğaltmadan incelenir.'),
 ('2025-06-01','mesam-roportaji','Burak Bulut, müzik yolculuğunu MESAM Vizyon söyleşisinde anlattı',None,'MESAM Vizyon söyleşisinde sanatçı, müzikle çocukluk yıllarındaki bağını ve okul sonrasında amatör stüdyoda çalıştığı dönemi anlatıyor. Kurtuluş Kuş ile Sevmedim Deme filminde yer alışını da değerlendiriyor.','Röportajın sayfasında açık bir yayın günü doğrulanmadığından bu kayıt haber olarak tarihlendirilmeyecek.')
]
for date,path,title,cid,detail,context in news[:3]:
 x=release[cid];source=x['url'];cover=x['cover']
 body=f'''{title}. {detail}\n\n{context} Burak Bulut diskografisinde yayının parça listesini, ayrı şarkı rehberinde süre ve sanatçı künyesini inceleyebilirsin. Biyografide Kurtuluş Kuş ile ortak dönem ve solo albüm süreci; konser bölümünde ise duyurulmuş güncel tarihler bulunur.\n\nBu haber resmî yayın künyesinden hazırlanmış özgün bir özettir. Şarkı sözleri veya kaynakta olmayan klip ve yapımcı bilgileri eklenmedi. Kaynak kontrolü: 27 Eylül 2026.'''
 entry('haberler','burak-bulut-news-'+path,path,{'title':title,'summary':f'{title} Resmî yayın tarihi, kapak, şarkı listesi ve ilgili arşiv bağlantılarıyla.','body':body,'date':date,'url':source,'source':source,'cover':cover,'seo_title':title+' | Burak Bulut Haberleri','seo_description':f'{title} {date} tarihli resmî yayın kaydı, şarkı künyesi ve Burak Bulut arşiv bağlantıları.'})
# Date-free MESAM interview remains biography source, never fabricate a news date.
events=[
 ('2026-10-16','Niğde','Casablanca Bistro Pub','21:00','https://www.bubilet.com.tr/nigde/etkinlik/burak--bulut-konseri-/seans/288901'),
 ('2026-10-30','İstanbul','Bostancı Gösteri Merkezi','21:00','https://www.bubilet.com.tr/istanbul/etkinlik/-burak-bulut-konseri-/seans/288814')]
art=['6797579433','6786302170']
for i,(date,city,venue,time,url) in enumerate(events):
 cover=release[art[i]]['cover'];album=release[art[i]]
 title=f'Burak Bulut {city} konseri: {date} · {venue}'
 body=f'''Burak Bulut’un {city} konseri, Bubilet’in resmî bilet sayfasında {date} günü saat {time} ve {venue} mekânıyla duyuruluyor. Bu arşiv kaydı 27 Eylül 2026 tarihinde kontrol edilen programı yansıtır; ilerideki etkinliğin gerçekleştiği iddiası değildir. Bilet almadan önce aynı sayfadaki yaş sınırı, giriş düzeni, güncel ücret ve organizatör duyurusunu yeniden oku.\n\nKonserin repertuvarı için doğrulanmış bir şarkı listesi açıklanmadı; belirli parçaların sahnede seslendirileceği söylenmez. Burak Bulut’un Mona Lisa albümünü ve 2026 single’larını müzik yayınları bölümünde, şarkıların resmî bağlantılarını ayrı şarkı rehberinde bulabilirsin. Diğer şehirler ve duyurular konser takviminde izlenir.\n\nKarttaki görsel {album['title']} adlı resmî yayın kapağıdır; {city} konserinin afişi veya gerçekleşmiş sahne görüntüsü değildir. İptal, erteleme ve mekân değişikliği için Bubilet veya organizatörün son açıklaması esas alınır.'''
 path=f'konser-{date}-{slug(city)}'
 entry('konserler','burak-bulut-event-'+date+'-'+slug(city),path,{'title':title,'summary':f'{date} {city} Burak Bulut konseri: {venue}, saat {time}; resmî Bubilet bilet ve koşul sayfası.','body':body,'date':date,'time':time,'city':city,'venue':venue,'url':url,'source':url,'cover':cover,'event_status':'scheduled','event_country':'TR','event_timezone':'Europe/Istanbul','seo_title':f'Burak Bulut {city} Konseri {date}: {venue} ve Biletler','seo_description':f'Burak Bulut {city} konseri {date}, saat {time}: {venue}. Güncel program, yaş sınırı ve bilet koşulları için resmî sayfa.'})
# Importer maximum: 100 operations; keep releases and their songs in ordered chunks.
for i in range(0,len(ops),95):
 Path(f'content/burak-bulut/batch-{i//95+1}-20260927.json').write_text(json.dumps({'artist':artist,'operations':ops[i:i+95]},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'releases':len(release),'songs':len(songs),'news':3,'concerts':2,'batches':(len(ops)+94)//95,'operations':len(ops)},ensure_ascii=False))
