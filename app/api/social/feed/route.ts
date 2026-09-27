import {createHash} from 'node:crypto';
import {channelDb} from '@/lib/channel-db';
import {memberSession} from '@/lib/member-auth';
import {posts} from '@/lib/fan-social';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:Request){const url=new URL(req.url),scope=url.searchParams.get('scope')==='liked'?'liked':url.searchParams.get('scope')==='explore'?'explore':'following',member=await memberSession(req),db=channelDb();const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('fans_visitor='))?.slice(13)??'',visitor=/^[a-f0-9]{64}$/.test(token)?createHash('sha256').update(token).digest('hex'):'';
 const fanPosts=scope==='explore'?await posts('1=1',[],member?.id??null):scope==='liked'&&member?await posts('EXISTS(SELECT 1 FROM fan_post_likes fl WHERE fl.post_id=p.id AND fl.member_id=?)',[member.id],member.id):member?await posts('p.member_id=? OR EXISTS(SELECT 1 FROM fan_follows f WHERE f.follower_id=? AND f.followed_id=p.member_id)',[member.id,member.id],member.id):[];
 let where='1=1',args:string[]=[];if(scope==='following'){where='EXISTS(SELECT 1 FROM artist_follows f WHERE f.artist=e.artist AND f.visitor_key=?)';args=[visitor]}else if(scope==='liked'){where=member?'EXISTS(SELECT 1 FROM content_likes l WHERE l.target=\'entry:\'||e.id AND l.member_id=?)':'0=1';args=member?[member.id]:[]}
 const rows=await db.prepare(`SELECT e.id,e.artist,e.kind,e.slug,e.title,e.summary,substr(e.body,1,650) AS excerpt,e.cover,e.date,e.updated,
 (SELECT COUNT(*) FROM content_likes l WHERE l.target='entry:'||e.id) AS likes,
 (SELECT COUNT(*) FROM approved_page_comments c WHERE c.target='entry:'||e.id AND c.deleted=0) AS comments,
 (SELECT COUNT(*) FROM content_view_events v WHERE v.target='entry:'||e.id) AS views
 FROM artist_entries e WHERE e.status='published' AND (${where}) ORDER BY e.updated DESC LIMIT 60`).bind(...args).all();
 const entries=rows.results.map(r=>({type:'artist',id:String(r.id),artist:String(r.artist),kind:String(r.kind),slug:String(r.slug),title:String(r.title),summary:String(r.summary),excerpt:String(r.excerpt??'').replace(/\s+/g,' ').trim().slice(0,220),cover:String(r.cover),date:String(r.date),created:Number(r.updated),likes:Number(r.likes),comments:Number(r.comments),views:Number(r.views)}));
 const pool:any[]=[...fanPosts,...entries];if(scope==='explore'){const people=await db.prepare("SELECT m.id,m.username,COALESCE(fp.avatar,'') AS avatar,COALESCE(fp.bio,'') AS bio,(SELECT COUNT(*) FROM fan_follows f WHERE f.followed_id=m.id) AS followers FROM members m LEFT JOIN fan_profiles fp ON fp.member_id=m.id ORDER BY RANDOM() LIMIT 8").all();for(const p of people.results)pool.push({type:'profile',id:String(p.id),username:String(p.username),avatar:String(p.avatar),bio:String(p.bio),followers:Number(p.followers),created:Date.now(),artist:'',kind:'',slug:'',title:'',summary:'',cover:'',date:'',likes:0,comments:0,views:0});for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}}else pool.sort((a,b)=>b.created-a.created);const items=pool.slice(0,80);
 return Response.json({items,member,scope},{headers:{'Cache-Control':'no-store'}})
}
