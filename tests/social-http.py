"""QA integration for member profiles, follows, posts and mixed feed."""
import os,json,secrets,urllib.request,urllib.error,http.cookiejar,sqlite3
base=os.environ.get('TEST_ORIGIN','http://127.0.0.1:3043')
def client():return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
a,b,guest=client(),client(),client()
def call(c,path,data=None,method='GET',origin=True):
 h={'Content-Type':'application/json'}
 if data is not None and origin:h['Origin']=base
 req=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=h,method=method)
 try:
  with c.open(req) as r:return r.status,json.loads(r.read())
 except urllib.error.HTTPError as e:return e.code,json.loads(e.read())
ua='Fanz_'+secrets.token_hex(4);ub='Fanz_'+secrets.token_hex(4);password='StrongPass2026!'
assert call(guest,'/api/social/posts',{'body':'Merhaba'},'POST')[0]==401
assert call(a,'/api/member/session',{'action':'register','username':ua,'password':password},'POST')[0]==201
assert call(b,'/api/member/session',{'action':'register','username':ub,'password':password},'POST')[0]==201
assert call(a,'/api/social/profile',{'bio':'Müzik severim.','avatar':''},'POST')[0]==200
assert call(b,'/api/social/follow',{'username':ua},'POST')[1]['profile']['followers']==1
status,post=call(a,'/api/social/posts',{'body':'Bugün dinlediğim şarkı çok güzel.','image':''},'POST');assert status==201,post
id=post['id']
assert call(a,'/api/social/posts',{'body':'Spam'},'POST')[0]==429
assert call(b,'/api/social/interaction',{'post':id,'action':'like'},'POST')[1]['liked']
assert call(b,'/api/social/interaction',{'post':id,'action':'comment','body':'Ben de!'},'POST')[0]==201
feed=call(b,'/api/social/feed?scope=following')[1]['items'];assert any(x['type']=='fan' and x['id']==id and x['likes']==1 for x in feed)
liked=call(b,'/api/social/feed?scope=liked')[1]['items'];assert any(x['id']==id for x in liked)
assert call(guest,'/api/social/profile?username='+ua)[1]['profile']['bio']=='Müzik severim.'
assert call(guest,'/api/social/interaction?post='+id)[1]['comments'][0]['body']=='Ben de!'
assert call(b,'/api/social/posts',{'id':id},'DELETE')[0]==404
assert call(a,'/api/social/posts',{'id':id},'DELETE')[0]==200
assert not any(x['id']==id for x in call(b,'/api/social/feed?scope=following')[1]['items'])
assert call(guest,'/api/social/profile',{'bio':'no'},'POST',False)[0]==403
assert call(guest,'/api/engagement?target=artist:semicenk')[0]==200
assert call(a,'/api/engagement',{'target':'artist:semicenk','action':'like'},'POST')[0]==200
assert call(a,'/api/views',{'target':'artist:semicenk'},'POST')[0]==200
assert call(guest,'/api/engagement/stats?targets=artist:semicenk')[1]['stats']['artist:semicenk']['likes']>=1
print('PASS: profiles, fan follow, posting, like/comment, mixed following, liked and own deletion')
