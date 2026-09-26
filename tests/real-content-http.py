import urllib.request,sqlite3,os
base=os.environ.get('TEST_ORIGIN','http://127.0.0.1:3043');db=sqlite3.connect(os.environ['DATABASE_PATH']);db.row_factory=sqlite3.Row
artists=['semicenk','tarkan','mabel-matiz','manifest','sezen-aksu','duman','hadise','ceza'];entries=list(db.execute("SELECT * FROM artist_entries WHERE status='published'"));count=0
for path in ['/','/gorsel-kaynaklari']+['/'+a+s for a in artists for s in ['','/biyografi','/galeri','/haberler','/albumler','/konserler']]+['/'+e['artist']+'/'+e['kind']+'/'+e['slug'] for e in entries]:
 s=urllib.request.urlopen(base+path).read().decode();assert 'Demo görünüm' not in s and '/images/demo-' not in s and 'DEMO ·' not in s,path;count+=1
for a in artists:
 for kind in ['haberler','albumler','konserler']:assert sum(e['artist']==a and e['kind']==kind for e in entries)==1,(a,kind)
for e in entries:
 assert e['source'].startswith('https://'),e['id'];u=e['cover'].replace('https://fans.wai.com.tr',base);r=urllib.request.urlopen(u);assert r.headers.get_content_type().startswith('image/'),u
assert db.execute("SELECT count(*) FROM artist_entries WHERE id LIKE 'demo-%'").fetchone()[0]==0
print('PASS:',count,'pages, 24 sourced entries and their images; no visible demo content')
