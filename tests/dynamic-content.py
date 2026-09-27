"""Integration test against an already running QA server; never target production."""
import json,os,sqlite3,subprocess,re
from pathlib import Path
from urllib.request import urlopen
from html import unescape
root=Path(__file__).resolve().parent.parent
dbpath=Path(os.environ['DATABASE_PATH']).resolve()
assert os.environ.get('CONTENT_TEST_ONLY')=='1' and dbpath.parent==root/'.data' and 'qa' in dbpath.name
base=os.environ.get('TEST_ORIGIN','http://127.0.0.1:3043')
assert base.startswith('http://127.0.0.1:')
c=sqlite3.connect(dbpath);c.row_factory=sqlite3.Row
def fetch(path):
 with urlopen(base+path,timeout=20) as r:assert r.status==200;return r.read().decode()
def entity(html,typ):
 for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>',html):
  for item in json.loads(raw).get('@graph',[]):
   if item.get('@type')==typ:return item
 raise AssertionError(typ+' missing')
def apply(ops,dry=False,success=True):
 p=root/'.data/dynamic-test-batch.json';p.write_text(json.dumps({'artist':'semicenk','operations':ops},ensure_ascii=False))
 a=['python3',str(root/'deploy/update-artist-content.py'),str(p)]+(['--dry-run'] if dry else [])
 result=subprocess.run(a,env=os.environ,capture_output=True,text=True)
 assert (result.returncode==0)==success,result.stderr
 return result
guest=json.loads(c.execute("SELECT data FROM artist_songs WHERE artist='semicenk' AND slug='bir-anda-dusuverdim'").fetchone()[0])
video=dict(c.execute("SELECT * FROM artist_live_videos WHERE artist='semicenk' LIMIT 1").fetchone())
song={**guest,'slug':'qa-dynamic-song','name':'QA Dynamic Song','description':'QA dynamic content persistence verification.'}
eventid='semicenk-qa-dynamic-event'
eventpath='/semicenk/konserler/qa-dynamic-event'
event={'type':'entry','id':eventid,'kind':'konserler','slug':'qa-dynamic-event','expectedRevision':None,'values':{'title':'QA Test Konseri','summary':'QA test only','date':'2026-12-31','time':'21:00','city':'Berlin','venue':'QA Venue','source':'https://example.com/qa','url':'https://example.com/qa','status':'published','event_country':'DE','event_timezone':'Europe/Berlin'}}
try:
 # Snapshot of all original titles/descriptions checked separately by page audit.
 ops=[{'type':'song','slug':song['slug'],'expectedRevision':None,'values':song},event]
 apply(ops,dry=True)
 assert not c.execute("SELECT 1 FROM artist_songs WHERE slug='qa-dynamic-song'").fetchone()
 apply(ops)
 html=fetch('/semicenk/sarkilar/qa-dynamic-song')
 assert 'QA Dynamic Song' in html and 'QA dynamic content persistence verification.' in html
 assert entity(html,'MusicRecording')['inAlbum']['url']==guest['externalAlbumUrl']
 assert '/semicenk/sarkilar/qa-dynamic-song' in fetch('/sitemap.xml')
 assert 'QA Dynamic Song' in fetch('/semicenk/sarki-sozleri')
 h=fetch(eventpath);e=entity(h,'MusicEvent')
 assert e['startDate']=='2026-12-31T21:00:00+01:00',e
 assert e['location']['address']['addressCountry']=='DE'
 # Cancellation, postponement and rescheduling without build/restart.
 for revision,status in [(1,'cancelled'),(2,'postponed'),(3,'rescheduled')]:
  values={'event_status':status}
  if status=='rescheduled':values.update(date='2027-01-07',previous_date='2026-12-31')
  apply([{'type':'entry','id':eventid,'expectedRevision':revision,'values':values}])
  h=fetch(eventpath);e=entity(h,'MusicEvent')
  assert e['eventStatus'].endswith({'cancelled':'EventCancelled','postponed':'EventPostponed','rescheduled':'EventRescheduled'}[status])
  if status!='rescheduled':
   assert eventpath not in fetch('/semicenk'),'Unavailable event must not appear on upcoming homepage'
   assert 'Bilet / etkinlik sayfası' not in h
  else:assert e['previousStartDate']=='2026-12-31'
 # Stored video edits reflect in gallery without rebuild.
 v={k:video[k] for k in ['title','series','publisher','source','checked_at','position','status']}
 v['title']='QA Updated Video'
 apply([{'type':'video','id':video['id'],'expectedRevision':video['revision'],'values':v}])
 assert 'QA Updated Video' in fetch('/semicenk/galeri')
 # Conflict prevents all writes in batch.
 changed={**song,'description':'SHOULD NOT BE WRITTEN'}
 apply([{'type':'song','slug':song['slug'],'expectedRevision':1,'values':changed},{'type':'entry','id':eventid,'expectedRevision':1,'values':{'title':'CONFLICT'}}],success=False)
 assert json.loads(c.execute("SELECT data FROM artist_songs WHERE slug='qa-dynamic-song'").fetchone()[0])['description']==song['description']
 # Idempotent seed must not reset published edits.
 subprocess.run(['python3',str(root/'deploy/import-dynamic-content.py')],env=os.environ,check=True,capture_output=True)
 assert 'QA Updated Video' in fetch('/semicenk/galeri')
 print('PASS: dry-run; live DB song/video creation/update; sitemap; event cancellation/postponement/reschedule; Berlin winter offset; conflict atomicity; seed replay; no server restart')
finally:
 c.execute("DELETE FROM artist_songs WHERE artist='semicenk' AND slug='qa-dynamic-song'")
 c.execute("DELETE FROM artist_entries WHERE artist='semicenk' AND id=?",(eventid,))
 fields=[k for k in video if k not in ['artist','id']]
 c.execute('UPDATE artist_live_videos SET '+','.join(k+'=?' for k in fields)+' WHERE artist=? AND id=?',[video[k] for k in fields]+['semicenk',video['id']])
 c.commit();c.close()
