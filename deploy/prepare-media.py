"""Download reviewed media before npm run build; sources/licences are versioned."""
import json,time,urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[1]
media=json.loads((root/'lib/artist-media.json').read_text())
assets=[(m['download'],'public'+m['src']) for m in media.values()]
for f in (root/'deploy/real-content').glob('*-album.json'):
 a=json.loads(f.read_text());assets.append((a['cover'],'public/images/albums/'+a['artist']+'.jpg'))
for url,path in assets:
 p=root/path
 if p.exists() and p.stat().st_size>1000:continue
 for attempt in range(4):
  try:
   response=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'FansEditorial/1.0'}),timeout=45)
   assert response.headers.get_content_type().startswith('image/'),url
   data=response.read();assert len(data)>1000
   p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);print(path,flush=True);break
  except Exception:
   if attempt==3:raise
   time.sleep(5*(attempt+1))
 time.sleep(2)
