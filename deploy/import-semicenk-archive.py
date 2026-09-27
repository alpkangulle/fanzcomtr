#!/usr/bin/env python3
"""Apply reviewed editorial content atomically; refuse concurrent editor changes."""
import json, os, sqlite3, time, hashlib
from pathlib import Path
root = Path(__file__).resolve().parent.parent
data = json.loads((root / 'content/semicenk-archive.json').read_text())
db = sqlite3.connect(os.environ['DATABASE_PATH'], timeout=15)
db.row_factory = sqlite3.Row
db.execute('PRAGMA foreign_keys=ON')
digest = hashlib.sha256((root / 'content/semicenk-archive.json').read_bytes()).hexdigest()
db.execute('CREATE TABLE IF NOT EXISTS editorial_imports (digest TEXT PRIMARY KEY, artist TEXT NOT NULL, applied INTEGER NOT NULL)')
if db.execute('SELECT 1 FROM editorial_imports WHERE digest=?',(digest,)).fetchone():
 print('Semicenk arşiv paketi daha önce aktarıldı; editör değişiklikleri korunuyor.')
 db.close()
 raise SystemExit(0)
now = int(time.time()*1000)
changed = 0
try:
 db.execute('BEGIN IMMEDIATE')
 for e in data['entries']:
  old = db.execute('SELECT * FROM artist_entries WHERE id=?',(e['id'],)).fetchone()
  if old and all(old[k] == v for k,v in e.items()): continue
  expected = data['baseline'].get(e['id'])
  if old and (expected is None or old['revision'] != expected or old['artist'] != 'semicenk'):
   raise RuntimeError('İçerik sonradan düzenlenmiş; üzerine yazılmadı: '+e['id'])
  if not old and expected is not None: raise RuntimeError('Beklenen kayıt silinmiş: '+e['id'])
  keys=list(e)
  if old:
   db.execute('UPDATE artist_entries SET '+','.join(k+'=?' for k in keys if k!='id')+',revision=revision+1,updated=? WHERE id=?',[e[k] for k in keys if k!='id']+[now,e['id']])
  else:
   db.execute('INSERT INTO artist_entries ('+','.join(keys)+',revision,updated) VALUES ('+','.join('?' for _ in keys)+',1,?)',list(e.values())+[now])
  changed+=1
 old=db.execute("SELECT * FROM artist_content WHERE artist='semicenk'").fetchone()
 if not old: raise RuntimeError('Semicenk biyografi kaydı bulunamadı')
 if old['biography']!=data['biography'] or old['sources']!=data['sources']:
  if old['revision']!=data['biographyRevision']: raise RuntimeError('Biyografi sonradan düzenlenmiş; üzerine yazılmadı')
  db.execute("UPDATE artist_content SET biography=?,sources=?,updated=?,revision=revision+1 WHERE artist='semicenk'",(data['biography'],data['sources'],now))
  changed+=1
 db.execute('INSERT INTO editorial_imports(digest,artist,applied) VALUES (?,?,?)',(digest,data['artist'],now))
 db.commit()
 print('Semicenk arşiv aktarımı: '+str(changed)+' kayıt güncellendi.')
except:
 db.rollback()
 raise
finally:
 db.close()
