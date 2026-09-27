#!/usr/bin/env python3
"""Catch legacy writes during deployment; never change moderation decisions."""
import os,sqlite3
c=sqlite3.connect(os.environ['DATABASE_PATH'],timeout=15)
c.execute('PRAGMA foreign_keys=ON')
try:
 c.execute('BEGIN IMMEDIATE')
 c.execute("INSERT OR IGNORE INTO page_comments(id,target,member_id,body,created,updated,status,deleted) SELECT id,target,member_id,body,created,created,'approved',deleted FROM content_comments")
 c.execute('INSERT OR IGNORE INTO page_comment_likes SELECT comment_id,member_id,created FROM comment_likes')
 c.execute("UPDATE page_comments SET deleted=1 WHERE id IN (SELECT id FROM content_comments WHERE deleted=1)")
 c.commit()
 print('Legacy comment catch-up completed; moderation decisions preserved.')
except:
 c.rollback();raise
finally:c.close()
