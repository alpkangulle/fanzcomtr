import {DatabaseSync} from 'node:sqlite';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
type Row=Record<string,string|number|null>;
export class Statement{
 private args:(string|number|null)[]=[];
 constructor(private db:DatabaseSync,private query:string){}
 bind(...args:(string|number|null)[]){this.args=args;return this}
 async first<T=Row>():Promise<T|null>{const row=this.db.prepare(this.query).get(...this.args);return row?({...row} as T):null}
 async all(){return {results:this.db.prepare(this.query).all(...this.args).map(row=>({...row})) as Row[]}}
 async run(){return this.db.prepare(this.query).run(...this.args)}
}
let instance:ReturnType<typeof open>|undefined;
function open(){const file=process.env.DATABASE_PATH??resolve('.data/fans.sqlite');if(!existsSync(file))throw new Error('Database migrations have not been applied');const db=new DatabaseSync(file);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON');return {prepare:(q:string)=>new Statement(db,q),async batch(statements:Statement[]){db.exec('BEGIN IMMEDIATE');try{const result=[];for(const s of statements)result.push(await s.run());db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}}}
export function channelDb(){return instance??=open()}
