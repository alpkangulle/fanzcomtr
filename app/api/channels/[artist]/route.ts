import {channelDb, type Statement} from '@/lib/channel-db';
import {validArtist} from '@/lib/site-config';
import {adminSession} from '@/lib/admin-auth';
import {memberSession} from '@/lib/member-auth';
export const dynamic='force-dynamic';
type Context={params:Promise<{artist:string}>};
type Role='guest'|'member'|'moderator'|'admin';type Guest={id:string;name:string;avatar:string;expires:number;last_sent:number;last_profile:number;last_renamed:number};
async function roleFor(req:Request,artist:string):Promise<{role:Role;memberId:string}>{if(adminSession(req))return {role:'admin',memberId:(await memberSession(req))?.id??''};const member=await memberSession(req);if(!member)return {role:'guest',memberId:''};const assigned=await channelDb().prepare('SELECT role FROM channel_roles WHERE artist=? AND member_id=?').bind(artist,member.id).first<{role:Role}>();return {role:assigned?.role??'member',memberId:member.id}}
const response=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
async function identity(request:Request){const token=request.headers.get('cookie')?.match(/(?:^|;\s*)fans_guest=([a-f0-9]{64})(?:;|$)/)?.[1];if(!token)return null;const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join('');return channelDb().prepare('SELECT * FROM channel_guests WHERE id = ? AND expires > ?').bind(hash,Date.now()).first<Guest>();}
export async function GET(request:Request,ctx:Context){const {artist}=await ctx.params;if(!validArtist(artist))return response({error:'Kanal bulunamadı.'},404);try{const db=channelDb(),guest=await identity(request);if(!guest)return response({error:'Misafir oturumu yenilenmeli.'},401);const now=Date.now(),actor=await roleFor(request,artist);
 const rows=await db.prepare(`SELECT m.seq,m.id,g.name,m.body,m.created,m.guest_id,m.deleted_at,COALESCE(p.role,m.role) AS role,g.avatar,COALESCE(e.style,'') AS style FROM channel_messages m LEFT JOIN channel_guests g ON g.id=m.guest_id LEFT JOIN channel_presence p ON p.artist=m.artist AND p.guest_id=m.guest_id AND p.seen>? LEFT JOIN channel_style_entitlements e ON e.member_id=m.member_id AND e.expires>? WHERE m.artist=? ORDER BY m.seq DESC LIMIT 100`).bind(now-65000,now,artist).all();
 const members=await db.prepare(`SELECT p.guest_id,p.name,p.role,g.avatar,COALESCE(e.style,'') AS style FROM channel_presence p LEFT JOIN channel_guests g ON g.id=p.guest_id LEFT JOIN channel_style_entitlements e ON e.member_id=p.member_id AND e.expires>? WHERE p.artist=? AND p.seen>? ORDER BY CASE p.role WHEN 'admin' THEN 0 WHEN 'moderator' THEN 1 WHEN 'member' THEN 2 ELSE 3 END,p.name LIMIT 100`).bind(now,artist,now-65000).all();
 const count=await db.prepare('SELECT COUNT(*) AS total FROM channel_presence WHERE artist=? AND seen>?').bind(artist,now-65000).first<{total:number}>();const muted=await db.prepare('SELECT until,reason FROM channel_mutes WHERE artist=? AND guest_id=? AND until>?').bind(artist,guest.id,now).first();let moderation=null;if(actor.role==='admin'||actor.role==='moderator'){const reportRows=await db.prepare('SELECT r.id,r.message_id,r.reason,r.created,m.name,m.body,m.deleted_at FROM channel_reports r JOIN channel_messages m ON m.id=r.message_id WHERE r.artist=? AND r.resolved=0 ORDER BY r.created DESC LIMIT 50').bind(artist).all();const muteRows=await db.prepare('SELECT guest_id,name,until,reason FROM channel_mutes WHERE artist=? AND until>? ORDER BY until DESC LIMIT 50').bind(artist,now).all();const auditRows=await db.prepare('SELECT action,target,reason,created FROM channel_audit WHERE artist=? ORDER BY created DESC LIMIT 30').bind(artist).all();moderation={reports:reportRows.results,mutes:muteRows.results,audit:auditRows.results}}return response({moderation,muted,isModerator:actor.role==='admin'||actor.role==='moderator',selfRole:actor.role,messages:rows.results.reverse().map(r=>({seq:r.seq,id:r.id,personId:r.guest_id,name:r.name??'Misafir',body:r.deleted_at?'Bu mesaj moderatör tarafından kaldırıldı.':r.body,deleted:!!r.deleted_at,created:r.created,own:r.guest_id===guest.id,role:r.role,avatar:r.avatar??'',style:r.style})),members:members.results.map(r=>({id:r.guest_id,name:r.name,own:r.guest_id===guest.id,role:r.role,avatar:r.avatar??'',style:r.style})),online:count?.total??0,guest:{name:guest.name,avatar:guest.avatar,role:actor.role}})}catch(error){console.error('channel read failed',error);return response({error:'Sohbet şu anda yüklenemiyor. Yeniden deneyebilirsin.'},503)}}

export async function POST(request:Request,ctx:Context){const {artist}=await ctx.params;if(!validArtist(artist))return response({error:'Kanal bulunamadı.'},404);const origin=request.headers.get('origin');if(!origin||origin!==(process.env.SITE_ORIGIN??new URL(request.url).origin))return response({error:'İstek doğrulanamadı.'},403);if(!request.headers.get('content-type')?.includes('application/json'))return response({error:'Geçersiz istek.'},415);const text=await request.text();if(text.length>50000)return response({error:'İstek çok uzun.'},413);let data;try{data=JSON.parse(text)}catch{return response({error:'Geçersiz istek.'},400)}if(!data||typeof data!=='object')return response({error:'Geçersiz istek.'},400);
 try{const db=channelDb();let guest=await identity(request);const now=Date.now(),actor=await roleFor(request,artist);let cookie:Record<string,string>={};if(data.action==='join'){if(!guest){const raw=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('');const id=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)))).map(x=>x.toString(16).padStart(2,'0')).join('');guest={id,name:'Misafir-'+id.slice(0,6).toUpperCase(),expires:now+86400000,last_sent:0,last_profile:0,last_renamed:0,avatar:''};await db.prepare('INSERT INTO channel_guests (id,name,expires,last_sent) VALUES (?,?,?,0)').bind(id,guest.name,guest.expires).run();cookie={'Set-Cookie':`fans_guest=${raw}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${new URL(request.url).protocol==='https:'?'; Secure':''}`};}await db.prepare('INSERT INTO channel_presence (artist,guest_id,name,seen,role,member_id) VALUES (?,?,?,?,?,?) ON CONFLICT(artist,guest_id) DO UPDATE SET seen=excluded.seen,name=excluded.name,role=excluded.role,member_id=excluded.member_id').bind(artist,guest.id,guest.name,now,actor.role,actor.memberId).run();return response({guest:{name:guest.name,avatar:guest.avatar,role:actor.role}},200,cookie);}
 if(!guest)return response({error:'Misafir oturumu sona erdi. Yeniden bağlan.'},401);

 if(data.action==='profile'){
  const nick=typeof data.name==='string'?data.name.trim().normalize('NFKC'):guest.name.split(' #')[0];const avatar=typeof data.avatar==='string'?data.avatar:'';
  if(!/^[\p{L}\p{N}_ ]{2,20}$/u.test(nick)||/(admin|moderat[oö]r|y[oö]netici|resmi|resmî)/iu.test(nick))return response({error:'Ad 2–20 karakter olmalı; yetkili unvanı kullanılamaz.'},400);
  if(avatar.length>45000||(avatar&&!/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/=]+$/.test(avatar)))return response({error:'Avatar küçük bir JPEG fotoğraf olmalı.'},400);
  const changed=nick!==guest.name.split(' #')[0],display=nick+' #'+guest.id.slice(0,6).toUpperCase();if(changed&&guest.last_renamed>now-30000)return response({error:'Adını yeniden değiştirmek için 30 saniye bekle.'},429);
  if(guest.last_profile>now-3000)return response({error:'Profilini yeniden kaydetmek için birkaç saniye bekle.'},429);
  await db.prepare('UPDATE channel_guests SET name=?,avatar=?,last_profile=?,last_renamed=CASE WHEN ? THEN ? ELSE last_renamed END WHERE id=?').bind(display,avatar,now,changed?1:0,now,guest.id).run();
  await db.prepare('UPDATE channel_presence SET name=? WHERE guest_id=?').bind(display,guest.id).run();await db.prepare('UPDATE channel_messages SET name=? WHERE guest_id=?').bind(display,guest.id).run();return response({guest:{name:display,avatar,role:actor.role}});
 }
 if(data.action==='rename'){
  const nickname=typeof data.name==='string'?data.name.trim().normalize('NFKC'):'';
  if(!/^[\p{L}\p{N}_ ]{2,20}$/u.test(nickname)||/(admin|moderat[oö]r|y[oö]netici|resmi|resmî)/iu.test(nickname))return response({error:'Adın 2–20 harf, rakam veya alt çizgi içermeli; yetkili unvanı kullanılamaz.'},400);
  const display=nickname+' #'+guest.id.slice(0,6).toUpperCase();
  const updated=await db.prepare('UPDATE channel_guests SET name=?,last_renamed=? WHERE id=? AND last_renamed<=? RETURNING id').bind(display,now,guest.id,now-30000).first();if(!updated)return response({error:'Adını yeniden değiştirmek için 30 saniye bekle.'},429);
  await db.prepare('UPDATE channel_presence SET name=? WHERE guest_id=?').bind(display,guest.id).run();await db.prepare('UPDATE channel_messages SET name=? WHERE guest_id=?').bind(display,guest.id).run();return response({renamed:true,name:display});
 }
 if(data.action==='report'){
  const reason=typeof data.reason==='string'?data.reason.trim():'';if(reason.length<5||reason.length>500||typeof data.messageId!=='string')return response({error:'5–500 karakterlik bir açıklama yaz.'},400);
  const msg=await db.prepare('SELECT id FROM channel_messages WHERE id=? AND artist=? AND deleted_at IS NULL').bind(data.messageId,artist).first();if(!msg)return response({error:'Mesaj artık raporlanamıyor.'},404);
  const duplicate=await db.prepare('SELECT id FROM channel_reports WHERE message_id=? AND reporter=?').bind(data.messageId,guest.id).first();if(duplicate)return response({reported:true});
  const allowed=await db.prepare('UPDATE channel_guests SET last_reported=? WHERE id=? AND last_reported<=? RETURNING id').bind(now,guest.id,now-10000).first();if(!allowed)return response({error:'Yeni rapor için 10 saniye bekle.'},429);
  await db.prepare('INSERT INTO channel_reports (id,artist,message_id,reporter,reason,created,resolved) VALUES (?,?,?,?,?,?,0)').bind(crypto.randomUUID(),artist,data.messageId,guest.id,reason,now).run();return response({reported:true},201);
 }
 if(data.action==='grant-style'){
  if(actor.role!=='admin')return response({error:'Bu işlem yalnızca yöneticiye açık.'},403);
  const username=typeof data.username==='string'?data.username.trim():'',style=data.style;
  if(!/^[\p{L}\p{N}_-]{3,24}$/u.test(username)||!['glow-lime','glow-ice','glow-rose','none'].includes(style))return response({error:'Geçersiz üye veya görünüm.'},400);
  const member=await db.prepare('SELECT id FROM members WHERE username=?').bind(username).first<{id:string}>();if(!member)return response({error:'Üye bulunamadı.'},404);
  if(style==='none')await db.prepare('DELETE FROM channel_style_entitlements WHERE member_id=?').bind(member.id).run();else await db.prepare('INSERT INTO channel_style_entitlements(member_id,style,expires,granted) VALUES(?,?,?,?) ON CONFLICT(member_id) DO UPDATE SET style=excluded.style,expires=excluded.expires,granted=excluded.granted').bind(member.id,style,now+30*86400000,now).run();return response({username,style});
 }
 if(data.action==='set-role'){
  if(actor.role!=='admin')return response({error:'Bu işlem yalnızca yöneticiye açık.'},403);
  const username=typeof data.username==='string'?data.username.trim():'',newRole=data.role;
  if(!/^[\p{L}\p{N}_-]{3,24}$/u.test(username)||!['member','moderator'].includes(newRole))return response({error:'Geçersiz üye veya rol.'},400);
  const member=await db.prepare('SELECT id FROM members WHERE username=?').bind(username).first<{id:string}>();if(!member)return response({error:'Üye bulunamadı.'},404);
  if(newRole==='moderator')await db.prepare('INSERT INTO channel_roles(artist,member_id,role,granted) VALUES(?,?,?,?) ON CONFLICT(artist,member_id) DO UPDATE SET role=excluded.role,granted=excluded.granted').bind(artist,member.id,'moderator',now).run();else await db.prepare('DELETE FROM channel_roles WHERE artist=? AND member_id=?').bind(artist,member.id).run();
  await db.prepare('UPDATE channel_presence SET role=? WHERE artist=? AND member_id=?').bind(newRole,artist,member.id).run();return response({role:newRole,username});
 }
 if(['delete','mute','unmute','resolve'].includes(data.action)){
  const moderator=actor.role==='admin'?'local-admin':actor.role==='moderator'?actor.memberId:null;if(!moderator)return response({error:'Bu işlem için moderatör yetkisi gerekli.'},403);
  const reason=typeof data.reason==='string'?data.reason.trim():'';if(reason.length<5||reason.length>500)return response({error:'İşlem için 5–500 karakterlik gerekçe yaz.'},400);
  let target='';const statements:Statement[]=[];
  if(data.action==='delete'||data.action==='mute'){
   if(typeof data.messageId!=='string')return response({error:'Mesaj seçilmedi.'},400);
   const msg=await db.prepare('SELECT id,guest_id,name FROM channel_messages WHERE id=? AND artist=?').bind(data.messageId,artist).first<{id:string;guest_id:string;name:string}>();if(!msg)return response({error:'Bu kanalda mesaj bulunamadı.'},404);
   target=data.action==='delete'?msg.id:msg.guest_id;
   if(data.action==='delete'){statements.push(db.prepare('UPDATE channel_messages SET deleted_at=? WHERE id=? AND artist=?').bind(now,msg.id,artist));statements.push(db.prepare('UPDATE channel_reports SET resolved=1 WHERE message_id=? AND artist=?').bind(msg.id,artist));}
   else {statements.push(db.prepare('INSERT INTO channel_mutes (artist,guest_id,name,until,reason) VALUES (?,?,?,?,?) ON CONFLICT(artist,guest_id) DO UPDATE SET until=excluded.until,reason=excluded.reason,name=excluded.name').bind(artist,msg.guest_id,msg.name,now+15*60000,reason));}
  }else if(data.action==='unmute'){
   if(typeof data.guestId!=='string')return response({error:'Misafir seçilmedi.'},400);target=data.guestId;
   const exists=await db.prepare('SELECT guest_id FROM channel_mutes WHERE artist=? AND guest_id=?').bind(artist,target).first();if(!exists)return response({error:'Susturma kaydı bulunamadı.'},404);
   statements.push(db.prepare('DELETE FROM channel_mutes WHERE artist=? AND guest_id=?').bind(artist,target));
  }else{if(typeof data.reportId!=='string')return response({error:'Rapor seçilmedi.'},400);target=data.reportId;
   const exists=await db.prepare('SELECT id FROM channel_reports WHERE id=? AND artist=?').bind(target,artist).first();if(!exists)return response({error:'Rapor bulunamadı.'},404);
   statements.push(db.prepare('UPDATE channel_reports SET resolved=1 WHERE id=? AND artist=?').bind(target,artist));
  }
  statements.push(db.prepare('INSERT INTO channel_audit (id,artist,moderator,action,target,reason,created) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),artist,moderator,data.action,target,reason,now));await db.batch(statements);return response({moderated:true});
 }
 const muted=await db.prepare('SELECT until FROM channel_mutes WHERE artist=? AND guest_id=? AND until>?').bind(artist,guest.id,now).first();if(muted)return response({error:'Bu kanalda geçici olarak susturuldun. Süre bitince tekrar yazabilirsin.'},403);
 if(data.action!=='message'||typeof data.body!=='string'||typeof data.id!=='string'||!/^[-a-f0-9]{36}$/.test(data.id))return response({error:'Geçersiz mesaj.'},400);const body=data.body.trim();if(!body||body.length>1000)return response({error:'Mesaj 1–1000 karakter olmalı.'},400);
 const existing=await db.prepare('SELECT guest_id,artist FROM channel_messages WHERE id = ?').bind(data.id).first<{guest_id:string;artist:string}>();if(existing)return existing.guest_id===guest.id&&existing.artist===artist?response({sent:true}):response({error:'Mesaj kimliği geçersiz.'},409);
 const allowed=await db.prepare('UPDATE channel_guests SET last_sent = ? WHERE id = ? AND last_sent <= ? RETURNING id').bind(now,guest.id,now-2500).first();if(!allowed)return response({error:'Yeni mesaj için birkaç saniye bekle.'},429,{'Retry-After':'3'});
 await db.prepare('INSERT INTO channel_messages (id,artist,guest_id,name,body,created,role,member_id) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(data.id,artist,guest.id,guest.name,body,now,actor.role,actor.memberId).run();return response({sent:true},201);
 }catch(error){console.error('channel write failed',error);return response({error:'Bağlantı kurulamadı. Mesajın silinmedi; yeniden deneyebilirsin.'},503)}}
