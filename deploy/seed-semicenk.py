"""Source-checked starter content. Preserves existing editor changes; no secrets logged."""
import json,urllib.request,http.cookiejar
from pathlib import Path
base='https://fans.wai.com.tr'
client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def call(path,data=None):
 req=urllib.request.Request(base+path,data=json.dumps(data,ensure_ascii=False).encode() if data is not None else None,headers={'Origin':base,'Content-Type':'application/json'})
 with client.open(req,timeout=20) as response:return json.loads(response.read())
call('/api/admin/session',{'password':Path('/home/deploy/fans/shared/admin-initial-password.txt').read_text().strip()})
try:
 existing=call('/api/admin/content?artist=semicenk')
 if not existing['biography'].strip():
  call('/api/admin/content',{'artist':'semicenk','revision':existing['revision'],'biography':'Semicenk, Cenk Baş’ın müzik çalışmalarında kullandığı sahne adıdır. 2019’da O Ses Türkiye’ye katıldı; Hadise’nin ekibinde yarışarak yarı finale ulaştı.\n\nKendi yazıp bestelediği “Düşer Aklıma”, sanatçının tanınmasını sağlayan çalışmalarından biridir.','sources':'https://www.kralmuzik.com.tr/biyografisi/semicenk'})
  print('Semicenk biography added')
 else: print('Existing biography preserved')
 entries=call('/api/admin/entries?artist=semicenk')['entries']
 if not any(e['kind']=='albumler' and e['slug']=='karisik-kaset-ep' for e in entries):
  url='https://music.apple.com/us/album/kar%C4%B1%C5%9F%C4%B1k-kaset-ep/1722517086'
  call('/api/admin/entries',{'id':'','revision':0,'artist':'semicenk','kind':'albumler','slug':'karisik-kaset-ep','title':'Karışık Kaset — EP','summary':'Semicenk’in 2023 tarihli, altı parçadan oluşan EP çalışması.','body':'Karışık Kaset, 15 Aralık 2023’te yayımlandı. Apple Music kaydında altı parça ve yaklaşık 24 dakikalık süreyle listeleniyor. Kayıt şirketi bilgisi Eva Records & DMC olarak belirtiliyor.\n\nDinlemek için aşağıdaki Apple Music bağlantısını kullanabilirsin.','date':'2023-12-15','time':'','city':'','venue':'','url':url,'source':url,'cover':'','tracks':'','status':'published'})
  print('Source-checked EP published')
 else: print('Existing EP record preserved')
finally: call('/api/admin/session',{'action':'logout'})
