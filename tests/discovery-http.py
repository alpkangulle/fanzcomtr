"""Run only against the isolated four-test.sqlite and localhost:3043."""
import sqlite3,uuid,urllib.request
from datetime import datetime,timedelta,timezone
from html.parser import HTMLParser
path='/home/deploy/fans/qa/four-test.sqlite'
c=sqlite3.connect(path)
today=datetime.now(timezone(timedelta(hours=3))).date()
for kind in ['haberler','konserler','albumler']:
 for i in range(14):
  slug='qa-discovery-'+kind+'-'+str(i)
  date=(today+timedelta(days=i+1 if kind=='konserler' else -i)).isoformat()
  c.execute('INSERT INTO artist_entries (id,artist,kind,slug,title,date,status,updated) VALUES (?,?,?,?,?,?,?,?)',(str(uuid.uuid4()),'semicenk',kind,slug,slug,date,'published',i))
for slug,status,date in [('qa-hidden','draft',today.isoformat()),('qa-archived','archived',today.isoformat()),('qa-past','published',(today-timedelta(days=1)).isoformat())]:
 c.execute('INSERT INTO artist_entries (id,artist,kind,slug,title,date,status,updated) VALUES (?,?,?,?,?,?,?,?)',(str(uuid.uuid4()),'semicenk','konserler',slug,slug,date,status,99))
c.commit();c.close()
with urllib.request.urlopen('http://127.0.0.1:3043/',timeout=15) as r:
 assert r.status==200
 html=r.read().decode()
class Links(HTMLParser):
 def __init__(self):super().__init__();self.hrefs=[]
 def handle_starttag(self,tag,attrs):
  if tag=='a':self.hrefs.append(dict(attrs).get('href',''))
p=Links();p.feed(html)
for kind in ['haberler','konserler','albumler']:
 links=[s for s in p.hrefs if '/'+kind+'/qa-discovery-' in s]
 unique=list(dict.fromkeys(links))
 assert len(unique)==12,(kind,unique)
 assert [s.rsplit('-',1)[1] for s in unique]==[str(i) for i in range(12)],unique
for hidden in ['qa-hidden','qa-archived','qa-past']:
 assert hidden not in html,hidden
assert 'discovery-feed' in html and 'artist-rail' in html
assert html.count('class="rail-page"')==10,html.count('class="rail-page"')
for pth in ['/semicenk','/semicenk/albumler','/admin/icerikler','/api/health']:
 with urllib.request.urlopen('http://127.0.0.1:3043'+pth,timeout=15) as r:assert r.status==200
print('PASS: published-only discovery, 12 records per section in four-card groups, news/album recency, upcoming concert sorting, draft/archive/past exclusion, artist routes.')
