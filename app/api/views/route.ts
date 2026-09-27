import {validTarget} from '@/lib/engagement-target';
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
 if(!(await validTarget(target)))return Response.json({error:'İçerik bulunamadı.'},{status:404});
 const db=channelDb();
 const now=Date.now();
 await db.prepare('INSERT INTO content_view_events(target,visitor_key,window_start,created) VALUES(?,?,?,?)').bind(target,randomUUID(),now,now).run();
 const count=await db.prepare('SELECT COUNT(*) AS total FROM content_view_events WHERE target=?').bind(target).first<{total:number}>();
 return Response.json({views:count?.total??0},{headers:{'Cache-Control':'no-store'}});
}
