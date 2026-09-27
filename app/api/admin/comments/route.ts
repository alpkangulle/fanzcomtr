import {channelDb} from '@/lib/channel-db';
import {adminSession,sameOrigin} from '@/lib/admin-auth';
export const dynamic='force-dynamic';
const json=(d:unknown,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){
 if(!adminSession(req))return json({error:'Yönetici girişi gerekli.'},401);
 const u=new URL(req.url),status=u.searchParams.get('status')??'pending',offset=Number(u.searchParams.get('offset')??0);
 if(!['pending','approved','rejected'].includes(status)||!Number.isInteger(offset)||offset<0)return json({error:'Geçersiz filtre.'},400);
 const db=channelDb();
 const rows=await db.prepare("SELECT c.id,c.target,c.body,c.created,c.updated,c.status,COALESCE(m.username,c.guest_name) AS username FROM page_comments c LEFT JOIN members m ON m.id=c.member_id WHERE c.deleted=0 AND c.status=? ORDER BY c.created DESC,c.id DESC LIMIT 31 OFFSET ?").bind(status,offset).all();
 return json({comments:rows.results.slice(0,30),hasMore:rows.results.length>30});
}
export async function PATCH(req:Request){
 if(!sameOrigin(req))return json({error:'İstek doğrulanamadı.'},403);
 if(!adminSession(req))return json({error:'Yönetici girişi gerekli.'},401);
 let d;try{d=await req.json()}catch{return json({error:'Geçersiz istek.'},400)}
 if(typeof d.id!=='string'||!['approved','rejected','pending'].includes(d.status)||!Number.isSafeInteger(d.updated))return json({error:'Geçersiz işlem.'},400);
 const result=await channelDb().prepare('UPDATE page_comments SET status=?,updated=MAX(updated+1,?) WHERE id=? AND updated=? AND deleted=0').bind(d.status,Date.now(),d.id,d.updated).run();
 return result.changes?json({ok:true}):json({error:'Yorum değişmiş. Listeyi yenile.'},409);
}
