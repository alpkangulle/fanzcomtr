"""QA for repeat views, fan media, stories, and public profile surfaces."""
import os,json,secrets,urllib.request,urllib.error,http.cookiejar,sqlite3,re
base=os.environ.get('TEST_ORIGIN','http://127.0.0.1:3043')
client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def call(path,data=None,method='GET',headers=None):
 h={'Origin':base,'Content-Type':'application/json'};h.update(headers or {})
 raw=json.dumps(data).encode() if data is not None else None
 req=urllib.request.Request(base+path,data=raw,headers=h,method=method)
 try:
  with client.open(req) as r:return r.status,r.read(),dict(r.headers)
 except urllib.error.HTTPError as e:return e.code,e.read(),dict(e.headers)
def j(path,data=None,method='GET'):
 status,body,_=call(path,data,method);return status,json.loads(body)
db=sqlite3.connect(os.environ['DATABASE_PATH']);target='entry:'+db.execute("SELECT id FROM artist_entries WHERE status='published' LIMIT 1").fetchone()[0]
assert j('/api/views',{'target':target},'POST')[0]==200
before=j('/api/engagement/stats?targets='+target)[1]['stats'][target]['views']
assert j('/api/views',{'target':target},'POST')[0]==200
assert j('/api/views',{'target':target},'POST')[0]==200
assert j('/api/engagement/stats?targets='+target)[1]['stats'][target]['views']==before+2
assert j('/api/social/stories',{'body':'Misafir'},'POST')[0]==401
name='Fanz_'+secrets.token_hex(4);assert j('/api/member/session',{'action':'register','username':name,'password':'StrongPass2026!'},'POST')[0]==201
boundary='fans-test-'+secrets.token_hex(8)
image=b'\xff\xd8\xff\xe0JFIF\x00' # signature and URL/range protocol; UI decoding is checked separately
payload=(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\n').encode()+image+(f'\r\n--{boundary}--\r\n').encode()
req=urllib.request.Request(base+'/api/social/media',data=payload,headers={'Origin':base,'Content-Type':'multipart/form-data; boundary='+boundary},method='POST')
with client.open(req) as r:media=json.load(r)
url=media['url'];assert media['kind']=='photo' and re.fullmatch(r'/api/social/media/[a-f0-9-]{36}\.jpg',url)
status,body,_=call(url,headers={'Range':'bytes=0-2'});assert status==206 and body==image[:3]
assert j('/api/social/posts',{'body':'Fotoğraflı paylaşım','mediaUrl':url,'theme':'lime'},'POST')[0]==201
p=j('/api/social/posts?username='+name)[1]['posts'][0];assert p['mediaUrl']==url and p['mediaKind']=='photo' and p['views']==0
assert j('/api/social/views',{'id':p['id']},'POST')[1]['views']==1
assert j('/api/social/views',{'id':p['id']},'POST')[1]['views']==2
assert j('/api/social/stories',{'body':'Günümden','mediaUrl':url,'theme':'dark'},'POST')[0]==201
stories=j('/api/social/stories?username='+name)[1]['stories'];assert len(stories)==1 and stories[0]['mediaKind']=='photo'
assert stories[0]['expires']-stories[0]['created']==86400000
assert j('/api/social/stories',{'id':stories[0]['id']},'DELETE')[0]==200
assert not j('/api/social/stories?username='+name)[1]['stories']
status,html,_=call('/fanz/'+name);assert status==200 and b'noindex' in html
print('PASS: repeat views, authenticated media/range, post views, 24-hour stories, deletion and profile')
