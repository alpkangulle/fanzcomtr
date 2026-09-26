"""Fetch OFL licensed DM Sans font subsets for a clean build."""
from pathlib import Path
from urllib.request import Request,urlopen
root=Path(__file__).resolve().parents[1]/'public/fonts';root.mkdir(parents=True,exist_ok=True)
fonts={'dm-sans-latin-ext.woff2':'https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu6-K6h9Q.woff2','dm-sans-latin.woff2':'https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2'}
for name,url in fonts.items():
 path=root/name
 if path.exists() and path.stat().st_size>10000:continue
 data=urlopen(Request(url,headers={'User-Agent':'FansEditorial/1.0'}),timeout=30).read()
 if len(data)<10000 or data[:4]!=b'wOF2':raise RuntimeError(name+' did not download as WOFF2')
 path.write_bytes(data)
 print(name,len(data))
