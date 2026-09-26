import {randomUUID} from 'node:crypto';
import {channelDb} from '@/lib/channel-db';
import {clearSession,deleteSession,memberName,memberSession,newSession,passwordHash,validHash} from '@/lib/member-auth';
import {sameOrigin} from '@/lib/admin-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200,cookie?:string)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
const attempts=new Map<string,{count:number;until:number}>();
function allowed(key:string){const now=Date.now();const a=attempts.get(key);if(!a||a.until<now){attempts.set(key,{count:1,until:now+15*60000});return true}a.count++;return a.count<=10}
export async function GET(req:Request){try{return json({member:await memberSession(req)})}catch{return json({error:'Oturum okunamadı.'},503)}}
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'İstek doğrulanamadı.'},403);
 const raw=await req.text();if(raw.length>4096)return json({error:'İstek çok uzun.'},413);
 let data:Record<string,unknown>;try{data=JSON.parse(raw)}catch{return json({error:'Geçersiz istek.'},400)}
 const action=data.action;
 if(action==='logout'){await deleteSession(req);return json({member:null},200,clearSession())}
 if(action!=='register'&&action!=='login')return json({error:'Geçersiz işlem.'},400);
 const username=typeof data.username==='string'?memberName(data.username):null;
 const password=typeof data.password==='string'?data.password:'';
 if(!username||password.length<10||password.length>128)return json({error:'Kullanıcı adı 3–24 karakter, şifre en az 10 karakter olmalı.'},400);
 if(!allowed(username.toLocaleLowerCase('tr')))return json({error:'Çok sayıda deneme. Biraz sonra tekrar dene.'},429);
 try{
  if(action==='register'){
   const id=randomUUID();await channelDb().prepare('INSERT INTO members(id,username,password_hash,created) VALUES(?,?,?,?)').bind(id,username,passwordHash(password),Date.now()).run();
   return json({member:{id,username}},201,await newSession(id));
  }
  const user=await channelDb().prepare('SELECT id,username,password_hash FROM members WHERE username=?').bind(username).first<{id:string;username:string;password_hash:string}>();
  if(!user||!validHash(password,user.password_hash))return json({error:'Kullanıcı adı veya şifre hatalı.'},401);
  return json({member:{id:user.id,username:user.username}},200,await newSession(user.id));
 }catch(e){if(String(e).includes('UNIQUE constraint failed'))return json({error:'Bu kullanıcı adı kullanılıyor.'},409);return json({error:'İşlem tamamlanamadı.'},503)}
}
