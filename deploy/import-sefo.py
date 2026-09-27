#!/usr/bin/env python3
"""One-time Sefo archive import with per-batch receipts; preserve editor revisions."""
import os,sqlite3,subprocess,sys
from pathlib import Path
base=Path(__file__).resolve().parent.parent
path=os.environ['DATABASE_PATH']
for index in (1,2):
 receipt=f'sefo-archive-20260927-batch-{index}'
 db=sqlite3.connect(path,timeout=15)
 applied=db.execute('SELECT 1 FROM content_seed_receipts WHERE name=?',(receipt,)).fetchone()
 if applied:
  print(receipt,'already applied; editor revisions preserved')
  db.close();continue
 if index==1 and db.execute("SELECT 1 FROM artist_entries WHERE artist='sefo' LIMIT 1").fetchone():
  sys.exit('Sefo content already exists without seed receipt; review revisions before import')
 db.close()
 batch=base/f'content/sefo/batch-{index}-20260927.json'
 for extra in (['--dry-run'],[]):
  subprocess.run([sys.executable,str(base/'deploy/update-artist-content.py'),str(batch),*extra],check=True,env={**os.environ,'SEO_AUTOMATION_DISABLED':'1'})
 db=sqlite3.connect(path,timeout=15)
 with db:db.execute("INSERT INTO content_seed_receipts(name,applied) VALUES(?,strftime('%s','now')*1000)",(receipt,))
 db.close()
