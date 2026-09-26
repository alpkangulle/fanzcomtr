"""QA-only verification, after seeding demo-test.sqlite."""
import sqlite3,urllib.request,subprocess,os
from html.parser import HTMLParser
artists=['semicenk','tarkan','mabel-matiz','manifest','sezen-aksu','duman','hadise','ceza']
base='http://127.0.0.1:3043'
def get(path):
 with urllib.request.urlopen(base+path,timeout=15) as r:
  assert r.status==200
  return r.read().decode()
root=get('/')
assert root.count('class="rail-page"')==9,root.count('class="rail-page"')
assert 'Demo içeriklerle keşfet.' in root
for a in artists:
 for section in ['', '/biyografi','/galeri','/haberler','/konserler','/albumler']:
  get('/'+a+section)
 for kind in ['haberler','konserler','albumler']:
  html=get('/'+a+'/'+kind+'/demo-'+kind)
  assert 'DEMO' in html and 'GERÇEK DUYURU DEĞİLDİR' in html
 assert 'TEMSİLİ TASARIM' in get('/images/demo-'+a+'.svg')
get('/demo-bilgisi')
path='/home/deploy/fans/qa/demo-test.sqlite'
c=sqlite3.connect(path)
assert c.execute("SELECT COUNT(*) FROM artist_entries WHERE id LIKE 'demo-%'").fetchone()[0]==24
before=c.execute('SELECT * FROM artist_content WHERE artist=?',('semicenk',)).fetchone()
assert 'DEMO' not in before[1]
assert c.execute("SELECT COUNT(*) FROM artist_entries WHERE slug='karisik-kaset-ep'").fetchone()[0]==1
c.close()
subprocess.run(['python3','deploy/seed-demo.py'],env={**os.environ,'DATABASE_PATH':path},check=True)
c=sqlite3.connect(path)
assert c.execute("SELECT COUNT(*) FROM artist_entries WHERE id LIKE 'demo-%'").fetchone()[0]==24
assert c.execute('SELECT * FROM artist_content WHERE artist=?',('semicenk',)).fetchone()==before
c.close()
print('PASS: 8 artists, 24 demo details, 8 SVG assets, 9 homepage groups, real content preserved, idempotent seed.')
