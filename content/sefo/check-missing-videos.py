import requests,re,json,urllib.parse,concurrent.futures,time
from pathlib import Path
items=json.load(open('content/sefo/match-report.json'))['unmatched']
def check(item):
 s=requests.get('https://www.youtube.com/results?'+urllib.parse.urlencode({'search_query':'Sefo '+item['name']+' resmi official video','hl':'tr'}),headers={'User-Agent':'Mozilla/5.0','Cookie':'SOCS=CAI'},timeout=20).text
 m=re.search(r'var ytInitialData = (\{.*?\});</script>',s)
 if not m:return item['slug'],[]
 j=json.loads(m.group(1));a=[]
 def walk(x):
  if isinstance(x,dict):
   if 'videoRenderer' in x:
    v=x['videoRenderer'];a.append({'id':v.get('videoId'),'title':v.get('title',{}).get('runs',[{}])[0].get('text'),'owner':v.get('ownerText',{}).get('runs',[{}])[0].get('text'),'channel':v.get('ownerText',{}).get('runs',[{}])[0].get('navigationEndpoint',{}).get('browseEndpoint',{}).get('browseId')})
   for q in x.values():walk(q)
  elif isinstance(x,list):
   for q in x:walk(q)
 walk(j)
 return item['slug'],a[:10]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:out=dict(pool.map(check,items))
Path('content/sefo/missing-video-candidates.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
for k,v in out.items():print('\n',k,[(x['id'],x['owner'],x['title']) for x in v[:4]],flush=True)
