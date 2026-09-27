import {randomUUID,createHmac} from 'node:crypto';
import {channelDb} from '@/lib/channel-db';
import {memberSession} from '@/lib/member-auth';
import {sameOrigin,adminSession} from '@/lib/admin-auth';
import {validTarget} from '@/lib/engagement-target';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){
 const u=new URL(req.url),target=u.searchParams.get('target')??'',sort=u.searchParams.get('sort')==='new'?'new':'popular';
 if(!(await validTarget(target)))return json({error:'İçerik bulunamadı.'},404);
 const offset=Number(u.searchParams.get('offset')??0),limit=Number(u.searchParams.get('limit')??5);
 if(!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>50)return json({error:'Geçersiz sayfa.'},400);
 const member=await memberSession(req),db=channelDb();
 const [likes,comments,count,liked]=await Promise.all([
 db.prepare('SELECT COUNT(*) AS total FROM content_likes WHERE target=?').bind(target).first<{total:number}>(),
 db.prepare("SELECT c.id,c.body,c.created,COALESCE(m.username,c.guest_name) AS username,CASE WHEN c.member_id=? THEN 1 ELSE 0 END AS mine,(SELECT COUNT(*) FROM page_comment_likes l WHERE l.comment_id=c.id) AS likes,CASE WHEN EXISTS(SELECT 1 FROM page_comment_likes l WHERE l.comment_id=c.id AND l.member_id=?) THEN 1 ELSE 0 END AS liked FROM approved_page_comments c LEFT JOIN members m ON m.id=c.member_id WHERE c.target=? ORDER BY "+(sort==='new'?'c.created DESC,c.id DESC':'likes DESC,c.created DESC,c.id DESC')+" LIMIT ? OFFSET ?").bind(member?.id??'',member?.id??'',target,limit,offset).all(),
 db.prepare('SELECT COUNT(*) AS total FROM approved_page_comments WHERE target=?').bind(target).first<{total:number}>(),
 member?db.prepare('SELECT 1 FROM content_likes WHERE target=? AND member_id=?').bind(target,member.id).first():Promise.resolve(null)]);
 return json({likes:likes?.total??0,liked:!!liked,comments:comments.results,commentCount:count?.total??0,hasMore:offset+comments.results.length<(count?.total??0),member});
}
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'İstek doğrulanamadı.'},403);
 const raw=await req.text();if(raw.length>4096)return json({error:'İstek çok uzun.'},413);
 let data:Record<string,unknown>;try{data=JSON.parse(raw)}catch{return json({error:'Geçersiz istek.'},400)}
 const target=typeof data.target==='string'?data.target:'';if(!(await validTarget(target)))return json({error:'İçerik bulunamadı.'},404);
 const member=await memberSession(req),db=channelDb(),now=Date.now();
 if(data.action==='comment'){
  const body=typeof data.body==='string'?data.body.normalize('NFC').trim():'';
  const name=member?.username??(typeof data.name==='string'?data.name.normalize('NFC').trim():'');
  if(name.length<2||name.length>50||/[<>\x00-\x1f]/.test(name))return json({error:'İsmin 2–50 karakter olmalı.'},400);
  if(body.length<1||body.length>600)return json({error:'Yorum 1–600 karakter olmalı.'},400);
  const secret=process.env.ADMIN_SESSION_SECRET;if(!secret)return json({error:'Yorum gönderimi şu anda kullanılamıyor.'},503);
  const ip=req.headers.get('x-real-ip')??req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'unknown';
  const actor=createHmac('sha256',secret).update(member?'member:'+member.id:'guest:'+ip).digest('hex');
  // One synchronous SQL statement makes rate limiting and insertion atomic.
  const result=await db.prepare("INSERT INTO page_comments(id,target,member_id,guest_name,actor_key,body,created,updated,status) SELECT ?,?,?,?,?,?,?,?,'pending' WHERE NOT EXISTS(SELECT 1 FROM page_comments WHERE actor_key=? AND created>?) AND (SELECT COUNT(*) FROM page_comments WHERE actor_key=? AND created>?)<10").bind(randomUUID(),target,member?.id??null,member?'':name,actor,body,now,now,actor,now-15000,actor,now-3600000).run();
  if(!result.changes)return json({error:'Biraz bekleyip tekrar dene. Saatlik yorum sınırına da ulaşmış olabilirsin.'},429);
  return json({ok:true,status:'pending',message:'Yorumun alındı. Onaylandıktan sonra burada görünecek.'},201);
 }
 if(!member)return json({error:'Beğenmek için giriş yapmalısın.'},401);
 if(data.action==='like'){
  const old=await db.prepare('SELECT 1 FROM content_likes WHERE target=? AND member_id=?').bind(target,member.id).first();
  if(old)await db.prepare('DELETE FROM content_likes WHERE target=? AND member_id=?').bind(target,member.id).run();
  else await db.prepare('INSERT OR IGNORE INTO content_likes(target,member_id,created) VALUES(?,?,?)').bind(target,member.id,now).run();
  return json({liked:!old});
 }
 if(data.action==='comment_like'){
  const id=typeof data.commentId==='string'?data.commentId:'';
  if(!await db.prepare('SELECT 1 FROM approved_page_comments WHERE id=? AND target=?').bind(id,target).first())return json({error:'Yorum bulunamadı.'},404);
  const old=await db.prepare('SELECT 1 FROM page_comment_likes WHERE comment_id=? AND member_id=?').bind(id,member.id).first();
  if(old)await db.prepare('DELETE FROM page_comment_likes WHERE comment_id=? AND member_id=?').bind(id,member.id).run();
  else await db.prepare('INSERT OR IGNORE INTO page_comment_likes VALUES(?,?,?)').bind(id,member.id,now).run();
  return json({liked:!old});
 }
 return json({error:'Geçersiz işlem.'},400);
}
export async function DELETE(req:Request){
 if(!sameOrigin(req))return json({error:'İstek doğrulanamadı.'},403);
 const member=await memberSession(req),admin=adminSession(req);if(!member&&!admin)return json({error:'Giriş yapmalısın.'},401);
 let data;try{data=await req.json()}catch{return json({error:'Geçersiz istek.'},400)}
 const id=typeof data.id==='string'?data.id:'';
 const query=admin?'UPDATE page_comments SET deleted=1,updated=? WHERE id=?':'UPDATE page_comments SET deleted=1,updated=? WHERE id=? AND member_id=?';
 const result=await channelDb().prepare(query).bind(...(admin?[Date.now(),id]:[Date.now(),id,member!.id])).run();
 return result.changes?json({ok:true}):json({error:'Yorum bulunamadı.'},404);
}
