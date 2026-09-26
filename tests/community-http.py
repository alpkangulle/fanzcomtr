"""Run against a QA server backed by a throwaway copy of the live SQLite DB."""
import os,urllib.request,urllib.error,http.cookiejar,json,secrets,re,sqlite3
base=os.environ.get('TEST_ORIGIN','http://127.0.0.1:3043');db=sqlite3.connect(os.environ['DATABASE_PATH']);db.row_factory=sqlite3.Row
jar=http.cookiejar.CookieJar();client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
def call(path,method='GET',data=None,origin=True):
 h={'Content-Type':'application/json'}
 if method!='GET' and origin:h['Origin']=base
 req=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=h,method=method)
 try:r=client.open(req);return r.status,r.read()
 except urllib.error.HTTPError as e:return e.code,e.read()
def api(path,method='GET',data=None,origin=True):
 status,body=call(path,method,data,origin);return status,json.loads(body)
artists=['semicenk','tarkan','mabel-matiz','manifest','sezen-aksu','duman','hadise','ceza']
entries=list(db.execute("SELECT artist,kind,slug FROM artist_entries WHERE status='published'"))
paths=['/','/gorsel-kaynaklari']+['/'+a+s for a in artists for s in ['','/biyografi','/galeri','/haberler','/albumler','/konserler']]+['/'+e['artist']+'/'+e['kind']+'/'+e['slug'] for e in entries]
for path in paths:
 status,body=call(path);s=body.decode();assert status==200,(path,status)
 assert ('engagement' in s)==(path in ['/'+a for a in artists] or path.count('/')>=3 and path.split('/')[2] in ('haberler','konserler','albumler')),(path,'engagement')
 if path.startswith(tuple('/'+a for a in artists)):assert 'embedded-channel' in s,path
 if path=='/' or path in ['/'+a for a in artists]:assert 'peek-rail' in s,path
 if '/albumler/' in path:assert 'entry-detail-cover' in s,path
assert '<a class="cover-link"' in call('/')[1].decode()
styles=re.findall(r'href="([^"]+\.css[^\"]*)"',call('/')[1].decode());css=''.join(call(u)[1].decode() for u in styles)
assert 'dm-sans-latin' in css and '#ddf25b' in css and '44.444' in css
for font in ['dm-sans-latin.woff2','dm-sans-latin-ext.woff2']:
 status,data=call('/fonts/'+font);assert status==200 and data[:4]==b'wOF2'
assert api('/api/engagement?target=page:home')[0]==404
entry_id=db.execute("SELECT id FROM artist_entries WHERE status='published' LIMIT 1").fetchone()['id'];target='entry:'+entry_id
assert api('/api/engagement?target='+target)[0]==200
assert api('/api/engagement/stats?targets='+target)[0]==200
assert api('/api/follows')[0]==200
assert api('/api/follows','POST',{'action':'toggle','artist':'semicenk'})[1]['counts']['semicenk']>=1
assert api('/api/engagement','POST',{'target':target,'action':'like'})[0]==401
name='Test_'+secrets.token_hex(4);password='StrongPass2026!'
assert api('/api/member/session','POST',{'action':'register','username':name,'password':password},False)[0]==403
assert api('/api/member/session','POST',{'action':'register','username':name,'password':password})[0]==201
assert api('/api/member/session')[1]['member']['username']==name
assert api('/api/engagement','POST',{'target':target,'action':'like'})[1]['liked']
assert api('/api/engagement','POST',{'target':target,'action':'comment','body':'Kaynaklı müzik haberi.'})[0]==201
comments=api('/api/engagement?target='+target+'')[1]['comments'];ours=next(c for c in comments if c['username']==name);assert ours['mine']==1
assert api('/api/engagement','POST',{'target':target,'action':'comment_like','commentId':ours['id']})[1]['liked']
assert api('/api/engagement?target='+target+'&sort=popular')[1]['comments'][0]['likes']>=1
assert api('/api/engagement?target='+target+'&sort=new')[0]==200
assert api('/api/engagement','POST',{'target':target,'action':'comment','body':'Again'})[0]==429
assert api('/api/engagement','DELETE',{'id':ours['id']})[0]==200
assert all(c['id']!=ours['id'] for c in api('/api/engagement?target='+target+'')[1]['comments'])
assert not api('/api/engagement','POST',{'target':target,'action':'like'})[1]['liked']
assert api('/api/member/session','POST',{'action':'logout'})[0]==200
assert api('/api/engagement','POST',{'target':target,'action':'like'})[0]==401
assert api('/api/member/session','POST',{'action':'login','username':name,'password':password})[0]==200
print('PASS:',len(paths),'public pages, 2 fonts, peek rails, shared channels, membership, likes, comments and deletion')
