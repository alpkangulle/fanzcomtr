import os,sqlite3
from pathlib import Path
from datetime import datetime,timezone
source=Path(os.environ['DATABASE_PATH'])
target=source.parent/('before-members-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%f')+'.sqlite')
a=sqlite3.connect(source);b=sqlite3.connect(target);a.backup(b);b.close();a.close();target.chmod(0o600);print('Yedek:',target)
