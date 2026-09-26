"""Integration checks for channel profile, roles, and gated name styles."""
import os,json,secrets,urllib.request,urllib.error,http.cookiejar,sqlite3
base=os.environ.get('TEST_ORIGIN','http://127.0.0.1:3043')
db=sqlite3.connect(os.environ['DATABASE_PATH'])
def client():return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def call(c,path,data=None):
 h={'Origin':base,'Content-Type':'application/json'}
 req=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=h,method='POST' if data is not None else 'GET')
 try:
  with c.open(req) as r:return r.status,json.loads(r.read())
 except urllib.error.HTTPError as e:return e.code,json.loads(e.read())
g=client(); p='/api/channels/semicenk'
status,v=call(g,p,{'action':'join'});assert status==200,(status,v)
assert v['guest']['role']=='guest';assert call(g,p)[1]['members'][0]['role']=='guest'
status,v=call(g,p,{'action':'profile','name':'Hayran Test','avatar':''});assert status==200,(status,v)
assert v['guest']['name'].startswith('Hayran Test #')
status,v=call(g,p,{'action':'message','body':'Profil testi','id':str(__import__('uuid').uuid4())});assert status==201,(status,v)
status,v=call(g,p);assert status==200 and any(x['body']=='Profil testi' and x['role']=='guest' and x['name'].startswith('Hayran Test') for x in v['messages']),v
assert call(g,p,{'action':'set-role','username':'nobody','role':'moderator'})[0]==403
assert call(g,p,{'action':'grant-style','username':'nobody','style':'glow-lime'})[0]==403
m=client(); name='Chat_'+secrets.token_hex(4)
status,v=call(m,'/api/member/session',{'action':'register','username':name,'password':'StrongPass2026!'})
assert status==201,(status,v)
status,v=call(m,p,{'action':'join'});assert status==200 and v['guest']['role']=='member',(status,v)
mid=db.execute('SELECT id FROM members WHERE username=?',(name,)).fetchone()[0]
db.execute('INSERT INTO channel_roles(artist,member_id,role,granted) VALUES (?,?,?,?)',('semicenk',mid,'moderator',1))
db.execute('INSERT INTO channel_style_entitlements(member_id,style,expires,granted) VALUES (?,?,?,?)',(mid,'glow-lime',9999999999999,1));db.commit()
status,v=call(m,p,{'action':'join'});assert status==200 and v['guest']['role']=='moderator',(status,v)
status,v=call(m,p);assert status==200 and any(x['name']==v['guest']['name'] and x['role']=='moderator' and x['style']=='glow-lime' for x in v['members']),v
print('channel profile, messages, authorization, moderator, entitled style: OK')
