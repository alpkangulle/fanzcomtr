#!/usr/bin/env python3
"""Create revision-safe Sefo batches from checked Apple and official video catalogs."""
import json,re,sqlite3,unicodedata,os
from pathlib import Path
from datetime import datetime
catalog=json.loads(Path('content/sefo/apple-catalog.json').read_text())
tracks=json.loads(Path('content/sefo/tracks.json').read_text())
videos=json.loads(Path('content/sefo/official-videos.json').read_text())
db=sqlite3.connect(os.environ['DATABASE_PATH'])
artist='sefo';source='https://music.apple.com/tr/artist/sefo/1360733410'
def slug(s):
 s=s.casefold().translate(str.maketrans('ığşçöüı','igscoui'))
 s=''.join(c for c in unicodedata.normalize('NFKD',s) if not unicodedata.combining(c))
 return re.sub('-+','-',re.sub('[^a-z0-9]+','-',s)).strip('-')
def norm(s):
 s=re.sub(r'\s*\((Official.*?|prod\..*?|feat\..*?)\)','',s,flags=re.I)
 return slug(s).replace('-','')
def rev(table,key):
 col='artist' if table=='artist_content' else 'slug' if table=='artist_songs' else 'id'
 x=db.execute(f'SELECT revision FROM {table} WHERE artist=? AND {col}=?',(artist,key)).fetchone()
 return x[0] if x else None
ops=[]
def entry(kind,id,path,values):ops.append({'type':'entry','id':id,'kind':kind,'slug':path,'expectedRevision':rev('artist_entries',id),'values':{'status':'published',**values}})

bio="""## Sefo kimdir?
Sefo, gerçek adıyla Seyfullah Sağır, Samsun doğumlu Türk müzisyen ve söz yazarıdır. Kral Müzik biyografisi doğum tarihini 16 Mart 1998 olarak verir. Bu sayfa sanatçının resmî hesabı değil, yayınlarını ve duyurularını kaynaklarıyla takip eden bağımsız bir Fan Club topluluğudur. Sefo’nun müziğini yalnız bir hit üzerinden değil; ilk kayıtları, ortak çalışmaları, İmparator pt.1 ve yeni tekliler arasındaki değişimi birlikte okuyarak keşfedebilirsin.

## İlk teklilerden Bilmem Mi dönemine
Kral Müzik’in sanatçı künyesine göre Sefo, 2018’de Yalan ile başlayan yayınlarına 2019’da Poz, Up Down ve 362 gibi parçaları ekledi. Apple Music katalogunda 2020 tarihli Rest, Başa Sar, Nerdeyim?, Geri Gel ve Ardından; 2021’de İhtiyacım Yok, toz duman, Reynmen ile Bonita ve Bilmem Mi? görünüyor. Farklı platformların tarihlerinde küçük farklılıklar bulunabildiği için diskografide her yayının kendi Apple Music kaydındaki gün esas alınır. Bilmem Mi, Sony Music’in 2026 duyurusunda da sanatçının güçlü çıkışı olarak anılır.

## İş birlikleri ve albüm
2022–2023 döneminde Revart ile yarım kalır, CAPO ile ISABELLE, Jako ile kördüğüm, Aerro ile Gitti, Simge ile Görmem Böylesini gibi ortak kayıtlar yayımlandı. Şarkı sayfalarında diğer sanatçılar künye satırında kalır. 2024 tarihli on iki parçalık IMPARATOR pt.1, Apple Music’te müstakil albüm olarak yer alır; albümdeki ERKEN ve KAPALI KAPILAR gibi önceden tekli olarak yayımlanan adları yeni besteler gibi iki kere saymıyoruz. Albümün parça sırası kendi yayın sayfasındadır.

## 2025 ve 2026 kayıtları
2025’te Nar, derdim var, AFACAN, Afra ile Aşiyan ve Demet Akalın ile Yerinde Dur, kataloğun farklı seslerini gösterdi. Aynı yılın Yanıbaşımda remiks EP’si orijinal tekliden ayrı bir yayın olarak listelenir; sürümlerin adları şarkı rehberinde açıkça belirtilir. Sony Music Türkiye, 2026’da Sena Şahin ile Bi’ Bilsen, İrem Derici ile Senden Kalanlar, solo Yine Seni Severdim ve alter ego SXFO ile SIPANBABUR çalışmalarını ayrı duyurularla belgeledi. Bu dört şarkının farklı üretim ekipleri ve video kaynakları ilgili haber ve şarkı sayfalarında görülebilir. Türkiye’m ile İsyankar gibi 2026 kayıtları da resmî müzik kataloğunda yer alır.

## Konserler ve topluluk
27 Eylül 2026 kontrolünde Bubilet’in İstanbul Paribu Vadi Açıkhava için 3 Ekim, Biletix’in Konya Selçuklu Kongre Merkezi için 31 Ekim konser duyuruları yayındadır. Bu program gelecekte değişebilir; konser sayfasındaki saat ve koşulları bilet almadan önce organizatörde yeniden kontrol et. Fanz’daki Sefo arşivinde haberlerden şarkılara, albüm kapaklarından resmî videolara ve fan sohbetine geçebilirsin. Şarkı sözleri kopyalanmaz; dinleme platformundaki resmî söz görünümü kullanılabilir."""
biography_sources='\n'.join([source,'https://www.kralmuzik.com.tr/biyografisi/sefo','https://www.sonymusic.com.tr/haberler/sefo-sena-sahin-bi-bilsen/','https://www.sonymusic.com.tr/haberler/sefodan-yeni-sarki-sipanbabur/','https://www.bubilet.com.tr/istanbul/etkinlik/sefo-/seans/264337','https://www.biletix.com/etkinlik/5THY0/TURKIYE/tr'])
ops.append({'type':'biography','expectedRevision':rev('artist_content',artist),'values':{'biography':bio,'sources':biography_sources}})
releases={};songs={};guest=[]
for x in sorted(catalog,key=lambda y:y['releaseDate']):
 cid=str(x['collectionId']);date=x['releaseDate'][:10];title=re.sub(r' - (Single|EP)$','',x['collectionName']);names=[t['trackName'] for t in tracks[cid]]
 if len(names)!=x['trackCount']:raise ValueError((title,len(names),x['trackCount']))
 path=slug(title);id='sefo-album-'+cid;cover=f'/images/albums/sefo-{cid}.jpg';url=x['collectionViewUrl'];credits=x['artistName']
 fmt='Albüm' if len(names)>6 else 'EP' if len(names)>1 else 'Single'
 is_guest=not ('Sefo' in credits or 'SEFO' in credits)
 if is_guest:guest.append((title,credits))
 if not is_guest:
  if any(r['slug']==path for r in releases.values()):path+='-'+cid
  joined=', '.join(names[:5])+(' ve diğer parçalar' if len(names)>5 else '')
  era='ilk bağımsız yayınlar' if date<'2021' else 'Bilmem Mi çevresindeki çıkış dönemi' if date<'2022' else 'ortak çalışmaların genişlediği yıllar' if date<'2024' else 'IMPARATOR pt.1 çevresindeki albüm dönemi' if date<'2025' else 'yeni single ve ortak proje dönemi'
  focus=(f'{len(names)} parçalı {fmt.lower()} kaydında {joined} sırasıyla yer alıyor. Parça sırası albümün resmî kataloğundan alınmıştır; remiks adları orijinal kayıttan ayrı gösterilir.' if len(names)>1 else f'Tek parça {names[0]} adıyla yayımlandı. Şarkının süresi ve varsa resmî video bağlantısı ayrı şarkı sayfasında yer alır.')
  body=f'''{title}, Apple Music’in Sefo kataloğunda {date} tarihinde listelenen {fmt.lower()} yayınıdır. Künye {credits} adına kayıtlıdır; Sefo ile başka sanatçılar yan yana görünüyorsa ortak emek bu sayfada da korunur. {focus}\n\nBu yayın, Sefo’nun {era} içinde değerlendirilir. Albümde eski single ile aynı isimli parça bulunması yeni bir beste daha yaratmaz: diskografi yayınları ayırırken şarkı rehberi aynı kaydı tek bir ana başlıkta toplar. Kapağın kaynağı bu yayın künyesidir, konser afişi değildir.\n\n{title} içindeki parçaların tek tek künyelerini ve resmî videolarını Sefo şarkı rehberinde, kariyerin önceki ve sonraki evrelerini biyografide inceleyebilirsin. Konser takvimiyle müzik yayını tarihleri farklı kaynaklardan doğrulanır. Kaynak kontrolü: 27 Eylül 2026.'''
  summary=f'Sefo {title}: {date} tarihli {fmt.lower()} yayını; {len(names)} parça, özgün kapak, şarkı listesi ve resmî dinleme bağlantısı.'
  entry('albumler',id,path,{'title':title,'summary':summary,'body':body,'date':date,'url':url,'source':url,'cover':cover,'tracks':'\n'.join(names),'release_name':title,'release_format':fmt,'release_credits':credits,'seo_title':f'Sefo {title} ({date[:4]}): {fmt}, Şarkılar ve Dinleme','seo_description':f'Sefo {title} {fmt.lower()} yayını: {date} tarihi, {len(names)} şarkılık liste, resmî kapak, sanatçı künyesi ve Apple Music bağlantısı.'})
  releases[cid]={'id':id,'slug':path,'title':title,'date':date,'cover':cover,'url':url,'credits':credits}
 for t in tracks[cid]:
  name=t['trackName'];key=slug(name);
  if key=='turkiye-m' and date>='2026-01-01':key='turkiye-m-2026'
  duration=round(t.get('trackTimeMillis',0)/1000)
  if not key or duration<1:continue
  if key in songs:continue
  song_context={
   'sipanbabur':'Sony Music Türkiye bu kaydı Sefo’nun SXFO alter egosuyla düeti olarak duyurdu; söz ve müzik Sefo, düzenleme Furkan Karakılıç, miks Efe Can ve mastering Ludwig künyesiyle açıklandı.',
   'yine-seni-severdim':'Sony Music Türkiye’nin solo single duyurusunda söz ve müzik Sefo’ya, düzenleme Efe Can’a, gitar Doğukan Aydın’a ve mastering Ludwig’e atfedilir. Duyuru melodik rap ile pop etkisini birlikte tarif eder.',
   'senden-kalanlar':'Sefo ve İrem Derici’nin düetinin söz ve müziği Sefo’ya, düzenlemesi Aerro’ya atfedilir. Ecem Gündoğdu yönetimindeki resmî klip şarkı sayfasındaki video bağlantısında gösterilir.',
   'bi-bilsen-feat-sena-sahin':'Sefo ve Sena Şahin söz ve müzik künyesini paylaşır. Sony Music Türkiye düzenlemeyi Can VS ile Mehmet Erden’e atfeder; resmî klibin Rize’de çekildiğini belirtir.'
  }
  context=song_context.get(key)
  description=f'''{name}, Apple Music’te {date} tarihinde yayımlanan {title} kaydında {t['trackNumber']}. sırada yer alır. Platform sanatçı künyesini {t.get('artistName',credits)} olarak verir; ortak sanatçıların adı burada da korunur. Şarkının katalog süresi {duration//60} dakika {duration%60} saniyedir. {context or ''}\n\nYayının diğer parçaları ve kapağı için {title} diskografi kaydına, Sefo’nun bu dönemdeki müzik çizgisi için biyografiye geçebilirsin. Resmî YouTube kanalıyla doğrulanmış video varsa bu sayfada gösterilir; bulunmayan bir videonun yerine başka sanatçının fan yüklemesi eklenmez.\n\nBu arşiv kaydı dinleme künyesini aktarır; sözlerin tamamı kopyalanmaz. Apple Music’te şarkıyı açarak sunulduğu durumda söz ekranını görebilirsin. Kaynak kontrolü: 27 Eylül 2026.'''
  v={'name':name,'slug':key,'albumId':id,'albumSlug':path,'albumTitle':title,'date':date,'cover':cover,'position':t['trackNumber'],'credits':t.get('artistName',credits),'duration':duration,'url':t.get('trackViewUrl') or url,'description':description,'videoId':None,'videoSource':''}
  if is_guest:v['externalAlbumUrl']=url
  songs[key]=v
# Official @sefo362 channel; title and version must both match.
manual={'bilmem-mi':'eFutYdmi2gc','affettim':'dSs6wwJLWYM','turkiyem':'CTckqh0TFrg','yanibasimda':'uSmVp98bml8','imparator':'jPQRFQU4Uis','kendini-kurtar':'NXzlzDEA0os','basa-sar':None,'bonita':None,'bi-bilsen-feat-sena-sahin':'JOfvzqBiYVs','mirame-bilmem-mi-remix-feat-aerro':'8lWIcczhXLI','kilit-feat-aerro':'9bm4PsqbQ3Y','turkiye-m-2026':'CTckqh0TFrg'}
video_map={};
for v in videos:
 title=v['title'];core=re.sub(r'^Sefo\s*[,–-]\s*','',title,flags=re.I)
 core=re.sub(r'\s*\((?:Official Video|Official Audio|prod\..*?)\).*','',core,flags=re.I)
 if ' - ' in core:core=core.rsplit(' - ',1)[-1]
 key=slug(core)
 if key in songs and key not in video_map:video_map[key]=v
for key,vid in manual.items():
 if key in video_map and vid is None:del video_map[key]
 if vid and key in songs:video_map[key]=next(v for v in videos if v['id']==vid)
video_map.pop('turkiye-m',None)
for key,v in video_map.items():songs[key]['videoId']=v['id'];songs[key]['videoSource']=v['source']
for key,value in songs.items():ops.append({'type':'song','slug':key,'expectedRevision':rev('artist_songs',key),'status':'published','values':value})

news=[
 ('2026-06-26','sipanbabur','Sefo ve SXFO, SIPANBABUR ile yeni bir ses deniyor','6782922492','https://www.sonymusic.com.tr/haberler/sefodan-yeni-sarki-sipanbabur/','Sefo’nun SXFO alter egosuyla buluştuğu SIPANBABUR, Sony Music Türkiye’nin 26 Haziran 2026 duyurusuyla yayımlandı. Şirket şarkının söz ve müziğini Sefo’ya, düzenlemesini Furkan Karakılıç’a, miksini Efe Can’a ve mastering aşamasını Ludwig’e atfediyor.','Duyuruda Türkçe rap ile K-Pop öğelerinin birlikte düşünüldüğü anlatılıyor. Bu yaklaşım 2026’daki solo Yine Seni Severdim ve düet Bi’ Bilsen kayıtlarından farklı bir yön açıyor.'),
 ('2026-04-17','yine-seni-severdim','Sefo’nun Yine Seni Severdim single’ı yayımlandı','1893349490','https://www.sonymusic.com.tr/haberler/sefodan-yeni-sarki-yine-seni-severdim/','Sony Music Türkiye, Yine Seni Severdim’i 17 Nisan 2026 tarihli solo single olarak duyurdu. Söz ve müzik Sefo’ya, düzenleme Efe Can’a ait; gitarda Doğukan Aydın bulunuyor.','Şarkı duyurusu bir geçmiş ilişkiye dönük melankolik anlatımı vurguluyor. Katalogdaki tarihi ve kapağı düet Senden Kalanlar’dan ayrı tutulur.'),
 ('2026-03-20','senden-kalanlar','Sefo ve İrem Derici’nin Senden Kalanlar düeti çıktı','1884870614','https://www.sonymusic.com.tr/haberler/sefo-ve-irem-dericiden-beklenen-duet/','Sony Music Türkiye, Sefo ve İrem Derici’nin Senden Kalanlar çalışmasını 20 Mart 2026’da duyurdu. Şarkının söz ve müziği Sefo’ya, düzenlemesi Aerro’ya atfedilir.','Duyuru klibin yönetmenini Ecem Gündoğdu olarak veriyor. Ortak sanatçı künyesi şarkı ve yayın sayfasında birlikte korunur.'),
 ('2026-01-23','bi-bilsen','Sefo ve Sena Şahin’den Bi’ Bilsen: yeni ortak kayıt','1868446378','https://www.sonymusic.com.tr/haberler/sefo-sena-sahin-bi-bilsen/','Bi’ Bilsen, Sefo ve Sena Şahin’in 23 Ocak 2026 tarihli ortak çalışmasıdır. Sony Music Türkiye duyurusu söz ve müziği iki sanatçıya, düzenlemeyi Can VS ve Mehmet Erden’e atfeder.','Şirket, klibin Rize’de karlı bir yaylada çekildiğini belirtir ve parçayı Bilmem Mi’ye müzikal bir gönderme çerçevesinde sunar.'),
 ('2024-04-25','imparator-pt-1','Sefo’nun on iki parçalık IMPARATOR pt.1 albümü','1742575563',None,'Apple Music, IMPARATOR pt.1 albümünü 25 Nisan 2024 tarihli on iki parçalık yayın olarak listeliyor. Parça adları, kapak ve dinleme bağlantısı resmî albüm künyesiyle eşleştirilir.','ERKEN ve KAPALI KAPILAR gibi daha önce tekli halinde duyulmuş adlar albüm listesinde ayrıca görünür; bu şarkıların ayrı besteler olduğu iddia edilmez.')]
for date,key,title,cid,source_news,detail,context in news:
 album=releases[cid];src=source_news or album['url'];body=f'''{detail}\n\n{context} İlgili single veya albümün kapağı ve şarkı listesi diskografi sayfasındadır. Şarkı sayfasında süre, künye, Apple Music bağlantısı ve doğrulanan resmî YouTube videosu bulunur; Sefo biyografisi de bu yayının diğer dönemlerle bağlantısını kurar.\n\nBu haber, kaynakların yayın tarihi ve kredi bilgileri karşılaştırılarak özgün biçimde hazırlandı. Geleceğe dair kesin olmayan vaat veya kaynakta bulunmayan şarkı sözü eklenmedi. Kaynak kontrolü: 27 Eylül 2026.'''
 entry('haberler','sefo-news-'+key,key,{'title':title,'summary':f'{title} Yayın tarihi, sanatçı künyesi, kapak ve ilgili şarkı bağlantılarıyla.','body':body,'date':date,'url':album['url'],'source':src,'cover':album['cover'],'seo_title':title+' | Sefo Haberleri','seo_description':f'{title} {date} tarihli resmî duyuru, müzik künyesi, resmî video ve Sefo arşiv bağlantıları.'})
events=[('2026-10-03','İstanbul','Paribu Vadi Açıkhava','21:00','https://www.bubilet.com.tr/istanbul/etkinlik/sefo-/seans/264337','6782922492'),('2026-10-31','Konya','Selçuklu Kongre Merkezi Anadolu Sahne','20:30','https://www.biletix.com/etkinlik/5THY0/TURKIYE/tr','1893349490')]
for date,city,venue,time,url,cid in events:
 album=releases[cid];title=f'Sefo {city} konseri: {date} · {venue}'
 body=f'''Sefo’nun {city} konseri, resmî bilet sayfasında {date} günü saat {time} ve {venue} mekânıyla duyuruluyor. Bu arşiv kaydı 27 Eylül 2026 tarihli program kontrolüdür; konserin gerçekleştiği iddiası değildir. Saat, mekân ve bilet koşulları değişebileceği için bilet almadan önce organizatörün aynı bağlantıdaki güncel duyurusuna bak.\n\nSahne repertuvarı resmî programda verilmediğinden belirli şarkıların seslendirileceğini söylemiyoruz. Sefo’nun Bilmem Mi’den 2026 teklilerine uzanan kayıtları şarkı rehberinde, IMPARATOR pt.1 ve diğer yayınlar diskografide yer alır. Başka şehirlerdeki doğrulanmış tarihler konser bölümünde ayrı gösterilir.\n\nBu karttaki görsel {album['title']} adlı yayın kapağıdır; {city} konserinin afişi veya gerçekleşmiş sahne karesi değildir. İptal/erteleme ve giriş koşullarında bilet sağlayıcısının son açıklaması esas alınır.'''
 entry('konserler','sefo-event-'+date+'-'+slug(city),'konser-'+date+'-'+slug(city),{'title':title,'summary':f'{date} {city} Sefo konseri: {venue}, saat {time}; resmî bilet ve etkinlik koşulları.','body':body,'date':date,'time':time,'city':city,'venue':venue,'url':url,'source':url,'cover':album['cover'],'event_status':'scheduled','event_country':'TR','event_timezone':'Europe/Istanbul','seo_title':f'Sefo {city} Konseri {date}: {venue} ve Biletler','seo_description':f'Sefo {city} konseri {date}, saat {time}: {venue}. Güncel program, giriş ve bilet koşulları için resmî sayfa.'})
Path('content/sefo/match-report.json').write_text(json.dumps({'releases':len(releases),'guest':guest,'songs':len(songs),'videos':len(video_map),'unmatched':[{'slug':s['slug'],'name':s['name']} for s in songs.values() if not s['videoId']],'matched':{k:v['source'] for k,v in video_map.items()}},ensure_ascii=False,indent=2)+'\n')
for i in range(0,len(ops),95):Path(f'content/sefo/batch-{i//95+1}-20260927.json').write_text(json.dumps({'artist':'sefo','operations':ops[i:i+95]},ensure_ascii=False,indent=2)+'\n')
print('releases',len(releases),'songs',len(songs),'videos',len(video_map),'news',len(news),'events',len(events),'batches',(len(ops)+94)//95,'guest',guest)
