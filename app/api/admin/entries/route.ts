import {randomUUID} from 'node:crypto';
import {adminSession,sameOrigin} from '@/lib/admin-auth';
import {validArtist} from '@/lib/site-config';
import {channelDb} from '@/lib/channel-db';
import {validateEntry} from '@/lib/entry-validation';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!adminSession(request))return Response.json({error:'Oturum açmalısın.'},{status:401});
 const artist=new URL(request.url).searchParams.get('artist')??'';
 if(!validArtist(artist))return Response.json({error:'Sanatçı bulunamadı.'},{status:404});
 try{const rows=await channelDb().prepare('SELECT * FROM artist_entries WHERE artist=? ORDER BY updated DESC').bind(artist).all();return Response.json({entries:rows.results},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'İçerikler yüklenemedi.'},{status:503})}
}
export async function POST(request:Request){
 if(!adminSession(request)||!sameOrigin(request))return Response.json({error:'Oturum veya istek kaynağı geçersiz.'},{status:403});
 const raw=await request.text();if(raw.length>45000)return Response.json({error:'İçerik çok uzun.'},{status:413});
 let input;try{input=JSON.parse(raw)}catch{return Response.json({error:'Geçersiz istek.'},{status:400})}
 const {data,error}=validateEntry(input);if(!data)return Response.json({error},{status:400});
 if(!Number.isInteger(input.revision)||input.revision<0||typeof input.id!=='string'||input.id.length>100)return Response.json({error:'Kayıt bilgisi geçersiz.'},{status:400});
 const id=input.id||randomUUID(),now=Date.now(),keys=Object.keys(data),values=Object.values(data);
 try{
  let row;
  if(!input.id){if(input.revision!==0)return Response.json({error:'Yeni kayıt sürümü geçersiz.'},{status:400});row=await channelDb().prepare(`INSERT INTO artist_entries (id,${keys.join(',')},revision,updated) VALUES (?,${keys.map(()=>'?').join(',')},1,?) RETURNING *`).bind(id,...values,now).first()}
  else{row=await channelDb().prepare(`UPDATE artist_entries SET ${keys.map(k=>k+'=?').join(',')},revision=revision+1,updated=? WHERE id=? AND artist=? AND kind=? AND slug=? AND revision=? RETURNING *`).bind(...values,now,id,data.artist,data.kind,data.slug,input.revision).first();if(!row)return Response.json({error:'Kayıt değişmiş olabilir. Listeyi yenile. Mevcut kaydın adresi, sanatçısı ve türü değiştirilemez.'},{status:409})}
  return Response.json({entry:row},{headers:{'Cache-Control':'no-store'}});
 }catch(e){if(e instanceof Error&&e.message.includes('UNIQUE'))return Response.json({error:'Bu adres zaten kullanılıyor. Farklı bir adres seç.'},{status:409});console.error('Entry save failed',e);return Response.json({error:'Kaydedilemedi. Formdaki metin korunuyor.'},{status:503})}
}
