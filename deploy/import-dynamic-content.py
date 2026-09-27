#!/usr/bin/env python3
import os,json,sqlite3,time
from pathlib import Path
root=Path(__file__).resolve().parent.parent
db=sqlite3.connect(os.environ['DATABASE_PATH'],timeout=15)
db.execute('PRAGMA foreign_keys=ON')
try:
 db.execute('BEGIN IMMEDIATE')
 if db.execute("SELECT 1 FROM content_seed_receipts WHERE name='semicenk-dynamic-v1'").fetchone():
  db.rollback(); print('Dynamic content seed already applied; editor changes preserved.')
 else:
  now=int(time.time()*1000)
  catalog=json.loads((root/'lib/semicenk-catalog.json').read_text())
  for slug,s in catalog['songs'].items():
   db.execute('INSERT OR IGNORE INTO artist_songs(artist,slug,data,status,updated) VALUES(?,?,?,?,?)',('semicenk',slug,json.dumps(s,ensure_ascii=False),'published',now))
  for x in catalog['releases']:
   db.execute("UPDATE artist_entries SET release_name=?,release_format=?,release_credits=? WHERE artist='semicenk' AND id=? AND release_name=''",(x['title'],x['format'],x['artist'],x['id']))
  live=json.loads((root/'lib/semicenk-live-videos.json').read_text())
  for i,x in enumerate(live['videos']):
   db.execute('INSERT OR IGNORE INTO artist_live_videos(artist,id,title,series,publisher,source,checked_at,position,status,updated) VALUES(?,?,?,?,?,?,?,?,?,?)',('semicenk',x['id'],x['title'],'Live At Harbiye',live['publisher'],'https://www.youtube.com/watch?v='+x['id'],live['checkedAt'],i,'published',now))
  db.execute("UPDATE artist_entries SET event_status='cancelled',event_country='DE',event_timezone='Europe/Berlin' WHERE artist='semicenk' AND id='semicenk-concert-2026-09-27-oberhausen'")
  db.execute('INSERT INTO content_seed_receipts VALUES(?,?)',('semicenk-dynamic-v1',now))
  db.commit(); print('Dynamic content seed: 47 songs, 4 videos and release/event fields migrated.')
except:
 db.rollback();raise
finally:db.close()
