#!/usr/bin/env python3
"""Apply an approved artist content-only batch with backup, optimistic revisions and rollback."""
import argparse,json,os,re,sqlite3,time,subprocess
from pathlib import Path
from datetime import date,datetime,timezone
from urllib.parse import urlparse
from zoneinfo import ZoneInfo
ap=argparse.ArgumentParser()
ap.add_argument('batch')
ap.add_argument('--dry-run',action='store_true')
args=ap.parse_args()
payload=json.loads(Path(args.batch).read_text())
artist_id=payload.get('artist')
assert artist_id in {'semicenk','manifest','blok3','burak-bulut'},'Unsupported artist'
ops=payload.get('operations',[])
assert isinstance(ops,list) and 0<len(ops)<=100,'Expected 1–100 operations'
def text(v,n=20000):
 assert isinstance(v,str) and len(v)<=n,'Invalid text'
 return v
def url(v,empty=False):
 text(v,2000)
 if empty and not v:return
 p=urlparse(v);assert p.scheme=='https' and p.hostname and not p.username and not p.password,'Expected public HTTPS source URL'
def day(v,empty=False):
 if empty and not v:return
 assert date.fromisoformat(v).isoformat()==v,'Expected YYYY-MM-DD'
def slug(v):
 assert isinstance(v,str) and re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',v),'Invalid slug'
def cover(v):
 if v.startswith('/images/'):assert '..' not in v
 else:url(v)
db=sqlite3.connect(os.environ['DATABASE_PATH'],timeout=15)
db.row_factory=sqlite3.Row
db.execute('PRAGMA foreign_keys=ON')
now=int(time.time()*1000)
entry_fields={'title','summary','body','date','time','city','venue','url','source','cover','tracks','status','event_status','event_country','event_timezone','previous_date','release_name','release_format','release_credits','seo_title','seo_description'}
prepared=[]
identities=set()
for op in ops:
 kind=op['type'];expected=op.get('expectedRevision')
 assert expected is None or (isinstance(expected,int) and expected>0),'Invalid revision'
 values=op['values'];assert isinstance(values,dict),'Expected values object'
 if kind=='song':
  key=op['slug'];slug(key);table='artist_songs';where='artist=? AND slug=?';params=[artist_id,key]
  required={'name','slug','albumId','albumSlug','albumTitle','date','cover','position','credits','duration','url','description','videoId','videoSource'}
  assert required<=values.keys() and values.keys()<=required|{'externalAlbumUrl'},'Invalid song fields'
  assert values['slug']==key
  for f in ['name','albumId','albumSlug','albumTitle','credits','description']:text(values[f])
  day(values['date']);cover(values['cover']);url(values['url'])
  assert isinstance(values['position'],int) and values['position']>0
  assert isinstance(values['duration'],int) and 0<values['duration']<86400
  if values['videoId'] is not None:assert re.fullmatch(r'[A-Za-z0-9_-]{11}',values['videoId'])
  url(values['videoSource'],empty=values['videoId'] is None)
  if values.get('externalAlbumUrl'):url(values['externalAlbumUrl'])
  else:
   slug(values['albumSlug'])
   # Also allow an album created in this same atomic batch.
   album=db.execute("SELECT 1 FROM artist_entries WHERE artist=? AND kind='albumler' AND id=? AND slug=?",(artist_id,values['albumId'],values['albumSlug'])).fetchone()
   assert album or any(o.get('type')=='entry' and o.get('id')==values['albumId'] and o.get('kind')=='albumler' and o.get('slug')==values['albumSlug'] for o in ops),'Missing album; use externalAlbumUrl for guest releases'
  status=op.get('status','published');assert status in ['draft','published','archived']
  data={'data':json.dumps(values,ensure_ascii=False),'status':status}
  keys={'artist':artist_id,'slug':key}
 elif kind=='video':
  key=op['id'];assert re.fullmatch(r'[A-Za-z0-9_-]{11}',key)
  table='artist_live_videos';where='artist=? AND id=?';params=[artist_id,key];keys={'artist':artist_id,'id':key}
  assert values.keys()<={'title','series','publisher','source','checked_at','position','status'} and {'title','publisher','source','checked_at'}<=values.keys()
  for f in ['title','publisher']:text(values[f],300)
  if 'series' in values:text(values['series'],300)
  url(values['source']);day(values['checked_at'])
  data={**values,'status':values.get('status','published')}
  assert data['status'] in ['draft','published','archived']
 elif kind=='entry':
  key=op['id'];slug(key);table='artist_entries';where='artist=? AND id=?';params=[artist_id,key];keys={'artist':artist_id,'id':key}
  assert values.keys()<=entry_fields,'Unsupported entry field'
  data=values.copy()
  for f,v in values.items():
   text(v)
   if f in ['date','previous_date']:day(v,empty=f=='previous_date')
   if f in ['url','source']:url(v,empty=True)
   if f=='cover' and v:cover(v)
  for f,n in [('title',160),('summary',400),('seo_title',160),('seo_description',400),('tracks',8000)]:
   if f in values:assert len(values[f])<=n
  if 'time' in values:assert not values['time'] or re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d',values['time'])
  if 'status' in values:assert values['status'] in ['draft','published','archived']
  if 'event_status' in values:assert values['event_status'] in ['scheduled','cancelled','postponed','rescheduled']
  if 'event_country' in values:assert re.fullmatch(r'[A-Z]{2}',values['event_country'])
  if 'event_timezone' in values:ZoneInfo(values['event_timezone'])
  if expected is None:
   assert op['kind'] in ['haberler','konserler','albumler'];slug(op['slug'])
   assert {'title','date'}<=values.keys()
   keys.update(kind=op['kind'],slug=op['slug'])
 elif kind=='biography':
  key=artist_id;table='artist_content';where='artist=?';params=[key];keys={'artist':key}
  assert values.keys()=={'biography','sources'}
  text(values['biography']);text(values['sources'])
  for source in values['sources'].splitlines():url(source)
  data=values
 else:raise ValueError('Unsupported content type')
 identity=(table,key);assert identity not in identities,'Duplicate operation';identities.add(identity)
 old=db.execute('SELECT revision FROM '+table+' WHERE '+where,params).fetchone()
 assert (old is None and expected is None) or (old is not None and old['revision']==expected),'Revision conflict: '+key
 prepared.append((table,where,params,keys,data,expected))
if args.dry_run:
 print(json.dumps({'valid':True,'operations':len(prepared),'writes':0}));db.close();raise SystemExit
backup_dir=Path(os.environ['DATABASE_PATH']).resolve().parent/'content-backups'
backup_dir.mkdir(exist_ok=True,mode=0o700)
backup=backup_dir/(artist_id+'-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')+'.sqlite')
dest=sqlite3.connect(backup);db.backup(dest);dest.close();backup.chmod(0o600)
try:
 db.execute('BEGIN IMMEDIATE')
 for table,where,params,keys,data,expected in prepared:
  if expected is None:
   all_data={**keys,**data,'revision':1,'updated':now}
   db.execute('INSERT INTO '+table+' ('+','.join(all_data)+') VALUES ('+','.join('?' for _ in all_data)+')',list(all_data.values()))
  else:
   result=db.execute('UPDATE '+table+' SET '+','.join(k+'=?' for k in data)+',revision=revision+1,updated=? WHERE '+where+' AND revision=?',list(data.values())+[now]+params+[expected])
   assert result.rowcount==1,'Concurrent edit; batch rolled back'
 db.commit()
 seo_triggered=False
 if os.environ.get('SEO_AUTOMATION_DISABLED')!='1':
  try:
   release=Path(__file__).resolve().parent.parent
   subprocess.Popen(['/home/deploy/.nvm/versions/node/v22.23.2/bin/node',str(release/'deploy/seo-worker.mjs')],cwd=release,env=os.environ,stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
   seo_triggered=True
  except OSError:
   pass
 print(json.dumps({'applied':len(prepared),'backup':str(backup),'updated':now,'seo_triggered':seo_triggered}))
except:
 db.rollback();raise
finally:db.close()
