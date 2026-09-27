import urllib.request, urllib.error, json, hmac, hashlib, time, re, os
base='http://127.0.0.1:3043'
origin='https://fanz.com.tr'
secret=os.environ['ADMIN_SESSION_SECRET']
payload=str(int(time.time()*1000)+3600000)+'.'+'ab'*16
cookie='fans_admin='+payload+'.'+hmac.new(secret.encode(),payload.encode(),hashlib.sha256).hexdigest()
def request(path,body=None,authorized=True,request_origin=origin,accept=None):
 headers={'Origin':request_origin}
 if authorized:headers['Cookie']=cookie
 if body is not None:headers['Content-Type']='application/json'
 if accept:headers['Accept']=accept
 req=urllib.request.Request(base+path,data=json.dumps(body).encode() if body is not None else None,headers=headers)
 try:
  with urllib.request.urlopen(req,timeout=40) as response:return response.status,response.read(),response.headers
 except urllib.error.HTTPError as e:return e.code,e.read(),e.headers
def api(action,**extra):
 status,body,_=request('/api/admin/seo',dict(action=action,**extra));assert status==200,(status,body);return json.loads(body)
assert request('/api/admin/seo',authorized=False)[0]==401
assert request('/api/admin/seo',{'action':'settings'},request_origin='https://other.invalid')[0]==403
status,body,_=request('/api/admin/seo');assert status==200,body
data=json.loads(body);assert len(data['artists'])==8
assert 'private_key' not in body.decode()
assert request('/admin/seo')[0]==200
for path in ['/','/semicenk','/semicenk/haberler','/tarkan/sarkilar','/tarkan/sarkilar/illallah','/api/health']:
 assert request(path)[0]==200,path
config=data['config'];config['imageEnabled']=True
api('settings',config=config)
assert request('/api/admin/seo',{'action':'settings','config':config})[0]==400
key=request('/indexnow.txt')[1].decode();assert re.fullmatch('[a-f0-9]{48}',key)
template={'artistIds':['semicenk','tarkan'],'section':'','title':'{sanatci} Fan Club ve Topluluğu','description':'{sanatci} müziği, haberleri ve konserleri için bağımsız hayran topluluğunu keşfet.','intro':'{sanatci} topluluğunda müzik hakkında konuş ve yayınlanmış içerikleri keşfet.','links':['/semicenk/haberler']}
p=api('preview',template=template)['preview'];assert len(p)==2 and p[0]['title'].startswith('Semicenk')
api('apply',template=template);api('apply',template=template)
saved=json.loads(request('/api/admin/seo')[1]);assert len(saved['overrides'])==2
html=request('/semicenk')[1].decode()
assert '<title>Semicenk Fan Club ve Topluluğu | Fanz.com.tr</title>' in html
assert template['intro'].replace('{sanatci}','Semicenk') in html
assert 'https://fanz.com.tr/semicenk' in html
bad=dict(template,title='<script>alert(1)</script>')
assert request('/api/admin/seo',{'action':'apply','template':bad})[0]==400
bad=dict(template,artistIds=['missing'])
assert request('/api/admin/seo',{'action':'preview','template':bad})[0]==400
status,image,headers=request('/images/artists/semicenk.png',accept='image/webp')
assert status==200 and headers['Content-Type']=='image/webp',(status,headers)
assert image[:4]==b'RIFF'
status,image,headers=request('/images/artists/semicenk.png',accept='image/png')
assert status==200 and headers['Content-Type']=='image/png'
assert image[:4]==b'\x89PNG'
assert request('/seo-image/%2e%2e/runtime.env')[0]==404
assert request('/api/admin/seo',{'action':'credentials','credentials':{'type':'service_account','private_key':'wrong'}})[0]==400
api('restore',template=template)
assert len(json.loads(request('/api/admin/seo')[1])['overrides'])==0
assert '<title>Semicenk Fan Topluluğu, Haberleri ve Sohbeti | Fanz.com.tr</title>' in request('/semicenk')[1].decode()
sitemap=request('/sitemap.xml')[1].decode()
assert len(re.findall('<loc>',sitemap))==87
assert '/admin' not in sitemap and '/akis' not in sitemap
assert 'noindex' in request('/admin/seo')[1].decode()
print('PASS: authentication, Origin, preview/apply/dedup/restore, metadata/SSR, 87 sitemap URLs, IndexNow key, WebP and original fallback, traversal and credential rejection.')
