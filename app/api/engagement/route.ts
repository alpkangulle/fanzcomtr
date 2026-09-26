import {randomUUID} from 'node:crypto';
import {channelDb} from '@/lib/channel-db';
import {memberSession} from '@/lib/member-auth';
import {sameOrigin,adminSession} from '@/lib/admin-auth';
import {validArtist} from '@/lib/site-config';
import {getSong} from '@/lib/songs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
async function validTarget(t:string){
 const song=t.match(/^song:([a-z0-9-]+):([a-z0-9-]+)$/);if(song)return !!(await getSong(song[1],song[2]));
 const artist=t.match(/^artist:([a-z0-9-]+)$/);if(artist)return validArtist(artist[1]);
 const entry=t.match(/^entry:([a-z0-9-]+)$/);if(entry)return !!(await channelDb().prepare("SELECT id FROM artist_entries WHERE id=? AND status='published'").bind(entry[1]).first());
 return false;
}
export async function GET(req:Request){const url=new URL(req.url),target=url.searchParams.get('target')??'',sort=url.searchParams.get('sort')==='new'?'new':'popular';if(!(await validTarget(target)))return json({error:'İçerik bulunamadı.'},404);
 const member=await memberSession(req);const db=channelDb();
 const [like,comments,mine,commentCount]=await Promise.all([
  db.prepare('SELECT COUNT(*) AS total FROM content_likes WHERE target=?').bind(target).first<{total:number}>(),
  db.prepare(`SELECT c.id,c.body,c.created,m.username,CASE WHEN c.member_id=? THEN 1 ELSE 0 END AS mine,COALESCE(cl.total,0) AS likes,CASE WHEN EXISTS(SELECT 1 FROM comment_likes own WHERE own.comment_id=c.id AND own.member_id=?) THEN 1 ELSE 0 END AS liked FROM content_comments c JOIN members m ON m.id=c.member_id LEFT JOIN (SELECT comment_id,COUNT(*) AS total FROM comment_likes GROUP BY comment_id) cl ON cl.comment_id=c.id WHERE c.target=? AND c.deleted=0 ORDER BY ${sort==='new'?'c.created DESC':'likes DESC,c.created DESC'} LIMIT 50`).bind(member?.id??'',member?.id??'',target).all(),
  db.prepare('SELECT COUNT(*) AS total FROM content_comments WHERE target=? AND deleted=0').bind(target).first<{total:number}>(),
  member?db.prepare('SELECT 1 FROM content_likes WHERE target=? AND member_id=?').bind(target,member.id).first():Promise.resolve(null)
 ]);
 return json({likes:like?.total??0,liked:!!mine,comments:comments.results,commentCount:commentCount?.total??0,member});
}
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'İstek doğrulanamadı.'},403);const member=await memberSession(req);if(!member)return json({error:'Beğenmek veya yorum yazmak için üye olman gerekiyor.'},401);
 const raw=await req.text();if(raw.length>2048)return json({error:'İstek çok uzun.'},413);let data:Record<string,unknown>;try{data=JSON.parse(raw)}catch{return json({error:'Geçersiz istek.'},400)}
 const target=typeof data.target==='string'?data.target:'';if(!(await validTarget(target)))return json({error:'İçerik bulunamadı.'},404);
 const db=channelDb(),now=Date.now();
 if(data.action==='comment_like'){
  const commentId=typeof data.commentId==='string'?data.commentId:'';
  const comment=await db.prepare('SELECT id FROM content_comments WHERE id=? AND target=? AND deleted=0').bind(commentId,target).first();
  if(!comment)return json({error:'Yorum bulunamadı.'},404);
  const mine=await db.prepare('SELECT 1 FROM comment_likes WHERE comment_id=? AND member_id=?').bind(commentId,member.id).first();
  if(mine)await db.prepare('DELETE FROM comment_likes WHERE comment_id=? AND member_id=?').bind(commentId,member.id).run();
  else await db.prepare('INSERT INTO comment_likes(comment_id,member_id,created) VALUES(?,?,?)').bind(commentId,member.id,now).run();
  return json({liked:!mine});
 }
 if(data.action==='like'){
  const mine=await db.prepare('SELECT 1 FROM content_likes WHERE target=? AND member_id=?').bind(target,member.id).first();
  if(mine)await db.prepare('DELETE FROM content_likes WHERE target=? AND member_id=?').bind(target,member.id).run();
  else await db.prepare('INSERT INTO content_likes(target,member_id,created) VALUES(?,?,?)').bind(target,member.id,now).run();
  return json({liked:!mine});
 }
 if(data.action==='comment'){
  const body=typeof data.body==='string'?data.body.normalize('NFC').trim():'';
  if(body.length<1||body.length>600)return json({error:'Yorum 1–600 karakter olmalı.'},400);
  const last=await db.prepare('SELECT created FROM content_comments WHERE member_id=? ORDER BY created DESC LIMIT 1').bind(member.id).first<{created:number}>();
  if(last&&now-last.created<15000)return json({error:'Yeni yorum için 15 saniye bekle.'},429);
  await db.prepare('INSERT INTO content_comments(id,target,member_id,body,created) VALUES(?,?,?,?,?)').bind(randomUUID(),target,member.id,body,now).run();
  return json({ok:true},201);
 }
 return json({error:'Geçersiz işlem.'},400);
}

export async function DELETE(req:Request){if(!sameOrigin(req))return json({error:'İstek doğrulanamadı.'},403);const member=await memberSession(req),admin=adminSession(req);if(!member&&!admin)return json({error:'Üye olman gerekiyor.'},401);let data:Record<string,unknown>;try{data=JSON.parse(await req.text())}catch{return json({error:'Geçersiz istek.'},400)}const id=typeof data.id==='string'?data.id:'';if(!/^[a-f0-9-]{36}$/.test(id))return json({error:'Geçersiz yorum.'},400);const query=admin?'UPDATE content_comments SET deleted=1 WHERE id=?':'UPDATE content_comments SET deleted=1 WHERE id=? AND member_id=?';const result=await channelDb().prepare(query).bind(...(admin?[id]:[id,member!.id])).run();return result.changes?json({ok:true}):json({error:'Yorum bulunamadı.'},404)}
