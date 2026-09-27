import {channelDb} from '@/lib/channel-db';
import {artists} from '@/lib/artists';
export const dynamic='force-dynamic';
export async function GET(){
 try{
 const db=channelDb(),now=Date.now();
 const activity=await db.prepare("SELECT artist,COUNT(*) AS messages,COUNT(DISTINCT CASE WHEN member_id<>'' THEN 'm:'||member_id ELSE 'g:'||guest_id END) AS participants FROM channel_messages WHERE created>? AND deleted_at IS NULL GROUP BY artist").bind(now-86400000).all();
 const presence=await db.prepare("SELECT artist,COUNT(DISTINCT CASE WHEN member_id<>'' THEN 'm:'||member_id ELSE 'g:'||guest_id END) AS online FROM channel_presence WHERE seen>? GROUP BY artist").bind(now-65000).all();
 const channels=artists.map(a=>{const stats=activity.results.find(r=>r.artist===a.id),live=presence.results.find(r=>r.artist===a.id);return {id:a.id,name:a.name,genre:a.genre,participants:Number(stats?.participants??0),messages:Number(stats?.messages??0),online:Number(live?.online??0)}});
 channels.sort((a,b)=>b.participants-a.participants||b.messages-a.messages||b.online-a.online||a.name.localeCompare(b.name,'tr'));
 return Response.json({channels,updated:now},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Kanallar yüklenemedi. Yeniden deneyebilirsin.'},{status:503})}
}
