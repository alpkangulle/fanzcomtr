import {randomUUID} from 'node:crypto';
import {channelDb} from '@/lib/channel-db';
import {sameOrigin} from '@/lib/admin-auth';
import {validArtist} from '@/lib/site-config';
import {getSong} from '@/lib/songs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'İstek doğrulanamadı.'},{status:403});
 let data:unknown;try{data=await req.json()}catch{return Response.json({error:'Geçersiz istek.'},{status:400})}
 const target=typeof data==='object'&&data!==null&&'target' in data?String(data.target):'';
 const id=target.match(/^entry:([a-z0-9-]{1,80})$/)?.[1],artist=target.match(/^artist:([a-z0-9-]+)$/)?.[1],song=target.match(/^song:([a-z0-9-]+):([a-z0-9-]+)$/);if(!id&&!artist&&!song)return Response.json({error:'Geçersiz içerik.'},{status:400});
 const db=channelDb(),entry=id?await db.prepare("SELECT id FROM artist_entries WHERE id=? AND status='published'").bind(id).first():null;
 if((id&&!entry)||(artist&&!validArtist(artist))||(song&&!(await getSong(song[1],song[2]))))return Response.json({error:'İçerik bulunamadı.'},{status:404});
 const now=Date.now();
 await db.prepare('INSERT INTO content_view_events(target,visitor_key,window_start,created) VALUES(?,?,?,?)').bind(target,randomUUID(),now,now).run();
 const count=await db.prepare('SELECT COUNT(*) AS total FROM content_view_events WHERE target=?').bind(target).first<{total:number}>();
 return Response.json({views:count?.total??0},{headers:{'Cache-Control':'no-store'}});
}
