#!/usr/bin/env python3
"""Revisioned cover and event-image updates for the 27 September 2026 Manifest audit."""
import json,os,sqlite3
from pathlib import Path
db=sqlite3.connect(os.environ['DATABASE_PATH']);db.row_factory=sqlite3.Row
media={m['slug']:m for m in json.loads(Path('content/manifest/media-20260927.json').read_text())}
source={'manifestival-yayinda':'manifestival','manifestival-deluxe-yayinda':'manifestival-deluxe','ruya-single-yayinda':'ruya','amator-single-yayinda':'amator','daha-iyi-single-yayinda':'daha-iyi','manifest-ajda-pekkan-hileli':'hileli','toz-pembe-single-yayinda':'toz-pembe','pvg-live-remix-yayinda':'pvg-manifest-live-remix'}
events={'konser-2026-06-06':'manifestival-ankara-afis','konser-2026-06-07':'konser-sahne-1','konser-2026-10-16':'londra-ovo-arena-afis'}
ops=[]
for row in db.execute("SELECT id,kind,slug,cover,body,revision FROM artist_entries WHERE artist='manifest' AND status='published'"):
 slug=row['slug'];key=slug if row['kind']=='albumler' else source.get(slug) if row['kind']=='haberler' else events.get(slug)
 assert key in media,(row['kind'],slug,key)
 path=media[key]['path'];values={'cover':path}
 if slug=='konser-2026-06-07':
  values['body']=row['body'].replace('Geçmiş etkinliğin kesin gerçekleşme teyidi','Görsel, bu etkinliğin kendi sahnesinden değil Manifest’in arşiv performanslarından seçilmiştir. Geçmiş etkinliğin kesin gerçekleşme teyidi')
 if row['cover']!=path or 'body' in values:ops.append({'type':'entry','id':row['id'],'kind':row['kind'],'slug':slug,'expectedRevision':row['revision'],'values':values})
for row in db.execute("SELECT slug,data,revision FROM artist_songs WHERE artist='manifest' AND status='published'"):
 value=json.loads(row['data']);key=value['albumSlug'];assert key in media,key
 if value['cover']!=media[key]['path']:
  value['cover']=media[key]['path']
  ops.append({'type':'song','slug':row['slug'],'expectedRevision':row['revision'],'status':'published','values':value})
Path('content/manifest/media-batch-20260927.json').write_text(json.dumps({'artist':'manifest','operations':ops},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'operations':len(ops),'entries':sum(x['type']=='entry' for x in ops),'songs':sum(x['type']=='song' for x in ops)}))
