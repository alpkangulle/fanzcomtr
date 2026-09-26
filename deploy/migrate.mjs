import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readdirSync,readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const filename=process.env.DATABASE_PATH??resolve('.data/fans.sqlite');mkdirSync(dirname(filename),{recursive:true,mode:0o700});
const db=new DatabaseSync(filename);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, digest TEXT NOT NULL)');
for(const directory of ['drizzle','deploy/migrations'])for(const name of readdirSync(directory).filter(f=>f.endsWith('.sql')).sort()){
 const key=directory+'/'+name,sql=readFileSync(key,'utf8'),digest=createHash('sha256').update(sql).digest('hex');const applied=db.prepare('SELECT digest FROM schema_migrations WHERE name=?').get(key);if(applied){if(applied.digest!==digest)throw new Error('Applied migration changed: '+key);continue}
 db.exec('BEGIN IMMEDIATE');try{db.exec(sql);db.prepare('INSERT INTO schema_migrations VALUES (?,?)').run(key,digest);db.exec('COMMIT');console.log('Applied',key)}catch(e){db.exec('ROLLBACK');throw e}
}db.close();
