"""Check rising, falling and steady ranking against Istanbul midnight on QA DB."""
import os,sqlite3,uuid,json,urllib.request,datetime,zoneinfo
base=os.environ.get('TEST_ORIGIN','http://127.0.0.1:3043')
db=sqlite3.connect(os.environ['DATABASE_PATH']);day=datetime.datetime.now(zoneinfo.ZoneInfo('Europe/Istanbul')).replace(hour=0,minute=0,second=0,microsecond=0);cutoff=int(day.timestamp()*1000)
def add(artist,n,created):
 db.executemany('INSERT INTO content_view_events(target,visitor_key,window_start,created) VALUES(?,?,?,?)',[(f'artist:{artist}',str(uuid.uuid4()),created+i,created+i) for i in range(n)])
add('semicenk',500,cutoff-1000000);add('tarkan',400,cutoff-1000000);db.commit()
def get():return json.load(urllib.request.urlopen(base+'/api/artists/stats'))['artists']
before=get();assert before['semicenk']['previousRank']['views']==1 and before['tarkan']['previousRank']['views']==2
add('tarkan',300,cutoff+1000);db.commit()
after=get();assert after['tarkan']['movement']['views']=='up',after['tarkan'];assert after['semicenk']['movement']['views']=='down',after['semicenk'];assert after['ceza']['movement']['engagement']=='same',after['ceza']
print('PASS: rising, falling and steady artist positions from real timestamp comparison')
