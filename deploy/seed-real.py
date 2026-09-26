"""Publish the reviewed source-backed selection; preserve unrelated editorial edits."""
import os,sqlite3,json,time,unicodedata,re
from pathlib import Path
from datetime import datetime,timezone
root=Path(__file__).resolve().parents[1];path=Path(os.environ.get('DATABASE_PATH','/home/deploy/fans/shared/fans.sqlite'))
media=json.loads((root/'lib/artist-media.json').read_text())
concerts={
'semicenk':('2026-10-09','21:00','İzmir','Bornova Aşık Veysel Açıkhava Tiyatrosu','https://www.bubilet.com.tr/izmir/etkinlik/semicenk--konseri-/seans/279914'),
'ceza':('2026-10-10','21:00','Konya','Selçuklu Kongre Merkezi Açıkhava Sahnesi','https://www.biletix.com/etkinlik/5FMS2/ISTANBUL/tr/ceza-10-10-2026-konya'),
'mabel-matiz':('2026-11-07','21:00','İzmir','Bornova Aşık Veysel Açıkhava Tiyatrosu','https://www.biletix.com/etkinlik/5DTC4/TURKIYE/tr'),
'duman':('2026-10-23','21:00','İstanbul','Büyükçekmece Kültürpark Kemal Sunal Amfi Tiyatro','https://www.biletix.com/etkinlik/5AMAL/TURKIYE/tr/music-duman-23-10-2026-istanbul'),
'hadise':('2026-10-02','21:00','Ankara','Oran Açıkhava Sahnesi','https://www.bubilet.com.tr/ankara/etkinlik/hadise/seans/245435'),
'tarkan':('2026-01-24','','İstanbul','Volkswagen Arena','https://www.tarkan.com/event/volkswagen-arena-24-ocak/'),
'sezen-aksu':('2015-02-13','','Ankara','Congresium Ankara','https://www.biletix.com/etkinlik/STRK1/TURKIYE/en'),
'manifest':('2026-06-06','','Ankara','Atatürk Orman Çiftliği','https://www.biletix.com/etkinlik-grup/536572193/TURKIYE/tr/manifestival')}
names={'semicenk':'Semicenk','tarkan':'Tarkan','mabel-matiz':'Mabel Matiz','manifest':'Manifest','sezen-aksu':'Sezen Aksu','duman':'Duman','hadise':'Hadise','ceza':'Ceza'}
def slug(s):
 s=unicodedata.normalize('NFKD',s.lower().replace('ı','i')).encode('ascii','ignore').decode();return re.sub('[^a-z0-9]+','-',s).strip('-')
db=sqlite3.connect(path);db.execute('PRAGMA busy_timeout=5000')
backup=path.parent/('before-real-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%f')+'.sqlite');b=sqlite3.connect(backup);db.backup(b);b.close();os.chmod(backup,0o600)
now=int(time.time()*1000)
with db:
 db.execute("DELETE FROM artist_entries WHERE id LIKE 'demo-%'")
 for f in sorted((root/'deploy/real-content').glob('*-album.json')):
  a=json.loads(f.read_text());artist=a['artist'];name=names[artist];title=a['title'];cover='https://fans.wai.com.tr/images/albums/'+artist+'.jpg';source=a['url'];date=a['date']
  bio=f"{name} diskografisinden seçki: {title}, {date} tarihinde yayımlandı. Apple Music kataloğunda {a['count']} parçayla listeleniyor. Bu sayfada eser bilgileri, şarkı listesi, kaynaklı haberler ve konser kayıtları bir araya geliyor."
  db.execute("INSERT INTO artist_content(artist,biography,sources,updated,revision) VALUES(?,?,?,?,1) ON CONFLICT(artist) DO UPDATE SET biography=excluded.biography,sources=excluded.sources,updated=excluded.updated,revision=artist_content.revision+1 WHERE TRIM(artist_content.biography)='' OR artist_content.biography LIKE 'DEMO · %'",(artist,bio,source,now))
  for kind in ['albumler','haberler','konserler']:
   data=dict(id='real-'+artist+'-'+kind,artist=artist,kind=kind,slug=slug(title)+('-yayinda' if kind=='haberler' else ''),title=title,summary=f"{name} · {a['count']} parça · {date}",body=f"{name} imzalı {title}, {date} tarihinde yayımlandı. Apple Music kaydı {a['count']} parçadan oluşuyor.\n\nYayın bilgisi: {a.get('copyright','')}\n\nKaynak kontrolü: 26 Eylül 2026.",date=date,time='',city='',venue='',url=source,source=source,cover=cover,tracks='\n'.join(a['tracks']) if kind=='albumler' else '',status='published',revision=1,updated=now)
   if kind=='haberler':
    data.update(title=f'{name}: {title} yayımlandı',summary=f'Müzik arşivi · {date} tarihli albüm yayını.',body=f"{name}, {title} ile dinleyicilerle buluştu. Eserin Apple Music yayın tarihi {date}; katalogda {a['count']} parça yer alıyor.\n\nBu haber, belirtilen yayın tarihine ait bir arşiv kaydıdır. Albümün şarkı listesi ve dinleme bağlantısı sanatçının albümler bölümünde bulunabilir.\n\nKaynak kontrolü: 26 Eylül 2026.")
   if kind=='konserler':
    day,hour,city,venue,url=concerts[artist];past=day<'2026-09-26';event='Manifestival Ankara' if artist=='manifest' else name+' — '+city
    note='Geçmiş etkinlik duyurusunun arşiv kaydıdır; gerçekleşme teyidi veya güncel bilet duyurusu değildir.' if past else 'Etkinlik bilgileri kaynak sayfasındaki duyuruya göre listelenmiştir. Gitmeden önce güncel programı kontrol edin.'
    if artist=='ceza':note+=' Kaynakta etkinlik saati 21.00, Ceza sahne programı 22.00–23.30 olarak belirtiliyor.'
    if artist=='manifest':note+=' Festival duyurusu 6–7 Haziran tarihlerini kapsar; bu kayıt başlangıç günüdür.'
    data.update(slug='konser-'+day,title=event,date=day,time=hour,city=city,venue=venue,url=url,source=url,cover='https://fans.wai.com.tr'+media[artist]['src'],summary=day+' · '+venue,body=note+'\n\nGörsel sanatçının arşiv fotoğrafıdır, bu etkinlikte çekilmiş olduğu iddia edilmez.\n\nKaynak kontrolü: 26 Eylül 2026.')
   existing=db.execute('SELECT id FROM artist_entries WHERE artist=? AND kind=? AND slug=?',(artist,kind,data['slug'])).fetchone()
   if existing:
    # Existing sourced Semicenk EP: enrich missing artwork/tracks, do not replace editor text.
    db.execute("UPDATE artist_entries SET cover=CASE WHEN cover='' THEN ? ELSE cover END,tracks=CASE WHEN tracks='' THEN ? ELSE tracks END WHERE id=?",(data['cover'],data['tracks'],existing[0]))
   else:
    cols=list(data);db.execute('INSERT INTO artist_entries ('+','.join(cols)+') VALUES ('+','.join('?' for _ in cols)+') ON CONFLICT DO NOTHING',list(data.values()))
print('Real selection:',db.execute("SELECT artist,kind,COUNT(*) FROM artist_entries WHERE status='published' GROUP BY artist,kind").fetchall())
db.close()
