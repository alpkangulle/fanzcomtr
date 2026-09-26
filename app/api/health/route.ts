import {channelDb} from '@/lib/channel-db';
export const dynamic='force-dynamic';
export async function GET(){try{await channelDb().prepare('SELECT COUNT(*) AS n FROM artist_content').first();return Response.json({status:'ok',database:'ok'},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({status:'unavailable'},{status:503})}}
