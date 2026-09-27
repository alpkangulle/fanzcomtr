import {channelDb} from '@/lib/channel-db';
import {validTarget} from '@/lib/engagement-target';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:Request){
 const targets=[...new Set((new URL(req.url).searchParams.get('targets')??'').split(',').filter(Boolean))];
 if(!targets.length||targets.length>40||targets.some(t=>t.length>220))return Response.json({error:'Geçersiz içerik.'},{status:400});
 const db=channelDb(),stats:Record<string,{likes:number;comments:number;views:number}>={};
 for(const t of targets)if(await validTarget(t)){
  const r=await db.prepare('SELECT (SELECT COUNT(*) FROM content_likes WHERE target=?) AS likes,(SELECT COUNT(*) FROM approved_page_comments WHERE target=?) AS comments,(SELECT COUNT(*) FROM content_view_events WHERE target=?) AS views').bind(t,t,t).first<{likes:number;comments:number;views:number}>();
  if(r)stats[t]=r;
 }
 return Response.json({stats},{headers:{'Cache-Control':'no-store'}});
}
