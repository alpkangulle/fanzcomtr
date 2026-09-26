"""Integration checks. Run ONLY against an isolated QA database/server."""
import json, urllib.request, urllib.error, http.cookiejar
from datetime import datetime, timedelta, timezone
from pathlib import Path
base='http://127.0.0.1:3043'
jar=http.cookiejar.CookieJar()
client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
def req(path,data=None,auth=True,origin=base):
 headers={'Origin':origin}
 if data is not None: headers['Content-Type']='application/json'
 r=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=headers)
 try:
  with (client.open(r) if auth else urllib.request.urlopen(r)) as x:return x.status,x.read().decode()
 except urllib.error.HTTPError as e:return e.code,e.read().decode()
def expect(code,result):
 assert result[0]==code,(code,result)
 return json.loads(result[1]) if result[1].startswith('{') else result[1]
assert expect(200,req('/api/health'))['database']=='ok'
expect(401,req('/api/admin/entries?artist=semicenk',auth=False))
expect(403,req('/api/admin/entries',{},auth=False))
password=Path('/home/deploy/fans/shared/admin-initial-password.txt').read_text().strip()
expect(200,req('/api/admin/session',{'password':password}))
expect(403,req('/api/admin/entries',{},origin='https://invalid.example'))
for path in ['/semicenk','/semicenk/haberler','/semicenk/konserler','/semicenk/albumler','/admin/icerikler']:
 expect(200,req(path))
today=datetime.now(timezone(timedelta(hours=3))).date()
def fixture(kind,slug):
 return dict(id='',artist='semicenk',kind=kind,slug=slug,title='QA '+slug,summary='Test özeti',body='<script>alert(1)</script> Güvenli metin',date=today.isoformat(),time='',city='',venue='',url='',source='https://example.org/source',cover='',tracks='',status='draft',revision=0)
def save(d):return expect(200,req('/api/admin/entries',d))['entry']
x=fixture('haberler','qa-draft-news');x=save(x)
expect(404,req('/semicenk/haberler/qa-draft-news'))
assert 'QA qa-draft-news' not in expect(200,req('/semicenk/haberler'))
x['status']='published';old=x.copy();x=save(x)
expect(409,req('/api/admin/entries',old))
html=expect(200,req('/semicenk/haberler/qa-draft-news'))
assert '&lt;script&gt;' in html and '<script>alert(1)</script>' not in html
assert 'QA qa-draft-news' in expect(200,req('/semicenk'))
assert 'QA qa-draft-news' not in expect(200,req('/tarkan/haberler'))
invalid=x.copy();invalid['source']='javascript:alert(1)';expect(400,req('/api/admin/entries',invalid))
invalid=x.copy();invalid['date']='2026-02-30';expect(400,req('/api/admin/entries',invalid))
invalid=x.copy();invalid['source']='';expect(400,req('/api/admin/entries',invalid))
invalid=x.copy();invalid['slug']='renamed';expect(409,req('/api/admin/entries',invalid))
duplicate=fixture('haberler','qa-draft-news');expect(409,req('/api/admin/entries',duplicate))
x['status']='archived';save(x);expect(404,req('/semicenk/haberler/qa-draft-news'))
assert 'QA qa-draft-news' not in expect(200,req('/semicenk'))
for slug,offset in [('qa-late',30),('qa-soon',2),('qa-past',-10)]:
 c=fixture('konserler',slug);c.update(status='published',city='İstanbul',venue='Test salonu',time='20:30',date=(today+timedelta(days=offset)).isoformat());save(c)
html=expect(200,req('/semicenk/konserler'))
assert html.index('QA qa-soon')<html.index('QA qa-late')<html.index('QA qa-past')
assert 'QA qa-soon' in expect(200,req('/semicenk'))
a=fixture('albumler','qa-album');a.update(status='published',tracks='Test şarkısı 1\nTest şarkısı 2',url='https://example.org/listen');save(a)
html=expect(200,req('/semicenk/albumler/qa-album'));assert 'Test şarkısı 1' in html and 'Test şarkısı 2' in html
expect(404,req('/semicenk/albumler/missing'))
expect(200,req('/api/admin/session',{'action':'logout'}))
expect(401,req('/api/admin/entries?artist=semicenk'))
print('PASS: authentication, CSRF, draft visibility, publish/archive, isolation, validation, revision conflict, URL uniqueness, concert sorting, album tracks, escaped text, routes.')
