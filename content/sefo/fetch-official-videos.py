import requests,re,json,time
from pathlib import Path
s=requests.Session();s.headers.update({'User-Agent':'Mozilla/5.0','Cookie':'SOCS=CAI'})
html=s.get('https://www.youtube.com/@sefo362/videos?hl=tr',timeout=25).text
key=re.search(r'"INNERTUBE_API_KEY":"([^"]+)',html).group(1)
data=json.loads(re.search(r'var ytInitialData = (\{.*?\});</script>',html).group(1))
items={}
def walk(x):
 if isinstance(x,dict):
  if 'richItemRenderer' in x:
   v=x['richItemRenderer'].get('content',{}).get('lockupViewModel',{})
   if v.get('contentId'):
    title=v.get('metadata',{}).get('lockupMetadataViewModel',{}).get('title',{}).get('content')
    if not title:title=v.get('rendererContext',{}).get('accessibilityContext',{}).get('label','')
    items[v['contentId']]=title
  for y in x.values():walk(y)
 elif isinstance(x,list):
  for y in x:walk(y)
def continuation(x):
 found=[]
 def rec(v):
  if isinstance(v,dict):
   c=v.get('continuationItemRenderer',{}).get('continuationEndpoint',{}).get('continuationCommand',{}).get('token')
   if c:found.append(c)
   for z in v.values():rec(z)
  elif isinstance(v,list):
   for z in v:rec(z)
 rec(x)
 return found[0] if found else None
for page in range(12):
 walk(data);token=continuation(data);print(page,len(items),bool(token),flush=True)
 if not token:break
 data=s.post('https://www.youtube.com/youtubei/v1/browse?key='+key,json={'context':{'client':{'clientName':'WEB','clientVersion':'2.20260927.00.00','hl':'tr','gl':'TR'}},'continuation':token},timeout=25).json()
 time.sleep(.2)
Path('content/sefo/official-videos.json').write_text(json.dumps([{'id':k,'title':v,'source':'https://www.youtube.com/watch?v='+k} for k,v in items.items()],ensure_ascii=False,indent=2)+'\n')
print('saved',len(items))
