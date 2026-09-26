"""QA smoke tests for content views and artist rankings."""
import os,urllib.request,urllib.error,json,sqlite3,http.cookiejar
base=os.environ.get('TEST_ORIGIN','http://127.0.0.1:3043');db=sqlite3.connect(os.environ['DATABASE_PATH']);db.row_factory=sqlite3.Row
entry=db.execute("SELECT id,artist,kind,slug FROM artist_entries WHERE status='published' LIMIT 1").fetchone();target='entry:'+entry['id']
jar=http.cookiejar.CookieJar();client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
def call(path,data=None,origin=True):
 headers={'Content-Type':'application/json'}
 if data is not None and origin:headers['Origin']=base
 req=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=headers)
 try:
  with client.open(req) as r:return r.status,r.read()
 except urllib.error.HTTPError as e:return e.code,e.read()
def api(path,data=None,origin=True):
 code,payload=call(path,data,origin);return code,json.loads(payload)
assert call('/top-listeler')[0]==200
assert 'Toplulukların nabzı' in call('/top-listeler')[1].decode()
page='/'+entry['artist']+'/'+entry['kind']+'/'+entry['slug'];code,html=call(page);assert code==200 and b'engagement' in html
assert api('/api/views',{'target':target},False)[0]==403
assert api('/api/views',{'target':'entry:fake'})[0]==404
before=api('/api/engagement/stats?targets='+target)[1]['stats'][target]['views']
assert api('/api/views',{'target':target})[0]==200
assert api('/api/views',{'target':target})[0]==200
assert api('/api/engagement/stats?targets='+target)[1]['stats'][target]['views']==before+2
code,stats=api('/api/artists/stats');assert code==200
s=stats['artists'][entry['artist']];assert s['views']>=1 and s['engagement']==s['likes']+s['comments']
assert all(s['rank'][metric]>=1 for metric in ('views','engagement','comments'))
print('PASS: top lists, each view counted, CSRF, published target and artist rankings')
