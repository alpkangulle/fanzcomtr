import {randomBytes,createHash} from 'node:crypto';
import {channelDb} from '@/lib/channel-db';
import {sameOrigin} from '@/lib/admin-auth';
import {validArtist} from '@/lib/site-config';
export const runtime='nodejs';export const dynamic='force-dynamic';
const COOKIE='fans_visitor';
const json=(data:unknown,status=200,cookie?:string)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
function visitor(req:Request){const token=req.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)??'';return /^[a-f0-9]{64}$/.test(token)?createHash('sha256').update(token).digest('hex'):null}
async function snapshot(key:string|null){const db=channelDb();const counts=await db.prepare('SELECT artist,COUNT(*) AS count FROM artist_follows GROUP BY artist').all();const rows=key?await db.prepare('SELECT artist FROM artist_follows WHERE visitor_key=?').bind(key).all():{results:[]};return {counts:Object.fromEntries(counts.results.map(row=>[row.artist,row.count])),followed:rows.results.map(row=>row.artist)}}
export async function GET(req:Request){return json(await snapshot(visitor(req)))}
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'İstek doğrulanamadı.'},403);let data:Record<string,unknown>;try{data=JSON.parse(await req.text())}catch{return json({error:'Geçersiz istek.'},400)}
 const existing=visitor(req),token=existing?null:randomBytes(32).toString('hex'),key=existing??createHash('sha256').update(token!).digest('hex');const db=channelDb(),now=Date.now();
 if(data.action==='sync'){
  if(!Array.isArray(data.artists)||data.artists.length>20||!data.artists.every(a=>typeof a==='string'&&validArtist(a)))return json({error:'Geçersiz sanatçı.'},400);
  for(const artist of data.artists)await db.prepare('INSERT OR IGNORE INTO artist_follows(artist,visitor_key,created) VALUES(?,?,?)').bind(artist,key,now).run();
 }else if((data.action==='toggle'||data.action==='remove')){
  const artist=typeof data.artist==='string'?data.artist:'';if(!validArtist(artist))return json({error:'Geçersiz sanatçı.'},400);
  const row=await db.prepare('SELECT 1 FROM artist_follows WHERE artist=? AND visitor_key=?').bind(artist,key).first();
  if(row)await db.prepare('DELETE FROM artist_follows WHERE artist=? AND visitor_key=?').bind(artist,key).run();
  else if(data.action!=='remove')await db.prepare('INSERT INTO artist_follows(artist,visitor_key,created) VALUES(?,?,?)').bind(artist,key,now).run();
 }else return json({error:'Geçersiz işlem.'},400);
 const cookie=token?`${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${process.env.SITE_ORIGIN?.startsWith('https:')?'; Secure':''}`:undefined;
 return json(await snapshot(key),200,cookie);
}
