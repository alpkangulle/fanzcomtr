#!/usr/bin/env python3
"""Follow-up revisioned Manifest entry leads, after the editorial batch."""
import json,os,sqlite3
from pathlib import Path
db=sqlite3.connect(os.environ['DATABASE_PATH']);db.row_factory=sqlite3.Row
# Keep one authored source of truth in the editorial builder.
namespace={}
source=Path('content/manifest/build-editorial-batch.py').read_text()
start=source.index('release_summaries={');end=source.index('\nrelease_pairs={',start)
exec(source[start:end],namespace)
summaries=namespace['release_summaries']
ops=[]
for r in db.execute("SELECT id,kind,slug,revision FROM artist_entries WHERE artist='manifest' AND kind='albumler' AND status='published'"):
 ops.append({'type':'entry','id':r['id'],'kind':r['kind'],'slug':r['slug'],'expectedRevision':r['revision'],'values':{'summary':summaries[r['slug']]}})
Path('content/manifest/leads-batch-20260927.json').write_text(json.dumps({'artist':'manifest','operations':ops},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'operations':len(ops),'minSummary':min(len(o['values']['summary']) for o in ops)}))
