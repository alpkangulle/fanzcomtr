import {randomUUID} from 'node:crypto';
import {channelDb} from '@/lib/channel-db';
import {memberSession} from '@/lib/member-auth';
import {adminSession,sameOrigin} from '@/lib/admin-auth';
import {validArtist} from '@/lib/site-config';
import {artistShouts} from '@/lib/shouts';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){const artist=new URL(req.url).searchParams.get('artist');if(artist&&!validArtist(artist))return json({error:'Geçersiz sanatçı.'},400);return json({shouts:await artistShouts(artist??undefined)})}
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'İstek doğrulanamadı.'},403);
 const member=await memberSession(req);if(!member)return json({error:'Sevgini haykırmak için üye olmalısın.'},401);
 const raw=await req.text();if(raw.length>1000)return json({error:'Mesaj çok uzun.'},413);
 let data:Record<string,unknown>;try{data=JSON.parse(raw)}catch{return json({error:'Geçersiz istek.'},400)}
 const artist=typeof data.artist==='string'?data.artist:'',body=typeof data.body==='string'?data.body.normalize('NFC').trim():'';
 if(!validArtist(artist)||body.length<3||body.length>180||/[\u0000-\u001f\u007f]/u.test(body))return json({error:'Sanatçı seç ve 3–180 karakterlik bir mesaj yaz.'},400);
 const db=channelDb(),now=Date.now();
 const last=await db.prepare('SELECT created FROM artist_shouts WHERE member_id=? ORDER BY created DESC LIMIT 1').bind(member.id).first<{created:number}>();
 if(last&&now-last.created<60000)return json({error:'Yeni mesaj için 1 dakika bekle.'},429);
 const id=randomUUID();await db.prepare('INSERT INTO artist_shouts(id,artist,member_id,body,created) VALUES(?,?,?,?,?)').bind(id,artist,member.id,body,now).run();
 return json({id},201);
}
export async function DELETE(req:Request){
 if(!sameOrigin(req))return json({error:'İstek doğrulanamadı.'},403);
 const member=await memberSession(req),admin=adminSession(req);if(!member&&!admin)return json({error:'Giriş gerekli.'},401);
 let data:Record<string,unknown>;try{data=await req.json()}catch{return json({error:'Geçersiz istek.'},400)}
 const id=typeof data.id==='string'?data.id:'';if(!/^[a-f0-9-]{36}$/.test(id))return json({error:'Geçersiz mesaj.'},400);
 const result=await channelDb().prepare(admin?'UPDATE artist_shouts SET deleted=1 WHERE id=?':'UPDATE artist_shouts SET deleted=1 WHERE id=? AND member_id=?').bind(...(admin?[id]:[id,member!.id])).run();
 return result.changes?json({ok:true}):json({error:'Mesaj bulunamadı.'},404);
}
