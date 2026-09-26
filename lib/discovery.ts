import {channelDb} from './channel-db';
import {todayTR,type Entry} from './entries-types';
export async function discoveryEntries():Promise<Entry[]>{
 const db=channelDb();const today=todayTR();
 const groups=await Promise.all([
 db.prepare("SELECT * FROM artist_entries WHERE status='published' AND kind='haberler' ORDER BY date DESC,updated DESC LIMIT 12").all(),
 db.prepare("SELECT * FROM artist_entries WHERE status='published' AND kind='konserler' AND date>=? ORDER BY date ASC,time ASC,updated DESC LIMIT 12").bind(today).all(),
 db.prepare("SELECT * FROM artist_entries WHERE status='published' AND kind='albumler' ORDER BY date DESC,updated DESC LIMIT 12").all()
 ]);
 return groups.flatMap(g=>g.results).map(row=>({...row,body:'',tracks:''})) as unknown as Entry[];
}
