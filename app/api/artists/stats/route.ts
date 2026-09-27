import {channelDb} from '@/lib/channel-db';
import {artists} from '@/lib/artists';
export const runtime='nodejs';export const dynamic='force-dynamic';
type Metric='views'|'engagement'|'comments';type Stats={views:number;likes:number;comments:number;engagement:number;fans:number;rank:Record<Metric,number>;movement:Record<Metric,'up'|'down'|'same'|'new'>;previousRank:Record<Metric,number|null>};
export async function GET(){const db=channelDb();const [rows,followers,profiles,songs]=await Promise.all([
 db.prepare(`SELECT e.artist,
  COALESCE((SELECT COUNT(*) FROM content_view_events v WHERE v.target='entry:'||e.id),0) AS views,
  COALESCE((SELECT COUNT(*) FROM content_likes l WHERE l.target='entry:'||e.id),0) AS likes,
  COALESCE((SELECT COUNT(*) FROM approved_page_comments c WHERE c.target='entry:'||e.id AND c.deleted=0),0) AS comments
 FROM artist_entries e WHERE e.status='published'`).all(),
 db.prepare('SELECT artist,COUNT(*) AS total FROM artist_follows GROUP BY artist').all(),
 db.prepare("SELECT target,(SELECT COUNT(*) FROM content_view_events v WHERE v.target=t.target) AS views,(SELECT COUNT(*) FROM content_likes l WHERE l.target=t.target) AS likes,(SELECT COUNT(*) FROM approved_page_comments c WHERE c.target=t.target AND c.deleted=0) AS comments FROM (SELECT target FROM content_view_events WHERE (target LIKE 'artist:%' OR target LIKE 'section:%') UNION SELECT target FROM content_likes WHERE (target LIKE 'artist:%' OR target LIKE 'section:%') UNION SELECT target FROM approved_page_comments WHERE (target LIKE 'artist:%' OR target LIKE 'section:%')) t").all(),
 db.prepare("SELECT target,(SELECT COUNT(*) FROM content_view_events v WHERE v.target=t.target) AS views,(SELECT COUNT(*) FROM content_likes l WHERE l.target=t.target) AS likes,(SELECT COUNT(*) FROM approved_page_comments c WHERE c.target=t.target AND c.deleted=0) AS comments FROM (SELECT target FROM content_view_events WHERE target LIKE 'song:%' UNION SELECT target FROM content_likes WHERE target LIKE 'song:%' UNION SELECT target FROM approved_page_comments WHERE target LIKE 'song:%') t").all()]);
 const stats:Record<string,Stats>={};for(const a of artists)stats[a.id]={views:0,likes:0,comments:0,engagement:0,fans:0,rank:{views:1,engagement:1,comments:1},movement:{views:'new',engagement:'new',comments:'new'},previousRank:{views:null,engagement:null,comments:null}};
 for(const r of rows.results){const s=stats[String(r.artist)];if(!s)continue;s.views+=Number(r.views);s.likes+=Number(r.likes);s.comments+=Number(r.comments)}
 for(const r of profiles.results){const s=stats[String(r.target).startsWith('section:')?String(r.target).split(':')[1]:String(r.target).slice(7)];if(!s)continue;s.views+=Number(r.views);s.likes+=Number(r.likes);s.comments+=Number(r.comments)}
 for(const r of songs.results){const artist=String(r.target).split(':')[1],s=stats[artist];if(!s)continue;s.views+=Number(r.views);s.likes+=Number(r.likes);s.comments+=Number(r.comments)}
 for(const r of followers.results){const s=stats[String(r.artist)];if(s)s.fans=Number(r.total)}
 const all=Object.values(stats);for(const s of all){s.engagement=s.likes+s.comments}
 for(const s of all)for(const metric of ['views','engagement','comments'] as const)s.rank[metric]=1+all.filter(other=>other[metric]>s[metric]).length;
 // Compare current cumulative ranks with the totals before today's Istanbul midnight.
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const part=(key:string)=>Number(parts.find(p=>p.type===key)?.value);const midnightUTC=Date.UTC(part('year'),part('month')-1,part('day'));const zone=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Istanbul',timeZoneName:'shortOffset'}).formatToParts(new Date(midnightUTC)).find(p=>p.type==='timeZoneName')?.value??'GMT+3';const offset=zone.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);const minutes=offset?(offset[1]==='-'?-1:1)*(Number(offset[2])*60+Number(offset[3]??0)):180;const cutoff=midnightUTC-minutes*60000;
 const previous:Record<string,{views:number;likes:number;comments:number;engagement:number}>={};for(const a of artists)previous[a.id]={views:0,likes:0,comments:0,engagement:0};
 const entryMap=new Map<string,string>();
 const mapping=await db.prepare("SELECT id,artist FROM artist_entries WHERE status='published'").all();for(const r of mapping.results)entryMap.set(String(r.id),String(r.artist));
 const historic=await Promise.all([db.prepare('SELECT target,COUNT(*) AS total FROM content_view_events WHERE created<? GROUP BY target').bind(cutoff).all(),db.prepare('SELECT target,COUNT(*) AS total FROM content_likes WHERE created<? GROUP BY target').bind(cutoff).all(),db.prepare('SELECT target,COUNT(*) AS total FROM approved_page_comments WHERE created<? AND deleted=0 GROUP BY target').bind(cutoff).all()]);
 for(const [i,result] of historic.entries())for(const r of result.results){const t=String(r.target),artist=t.startsWith('entry:')?entryMap.get(t.slice(6)):t.startsWith('artist:')?t.slice(7):(t.startsWith('song:')||t.startsWith('section:'))?t.split(':')[1]:undefined;if(!artist||!previous[artist])continue;const key=(['views','likes','comments'] as const)[i];previous[artist][key]+=Number(r.total)}
 const allPrevious=Object.values(previous);for(const p of allPrevious)p.engagement=p.likes+p.comments;
 for(const metric of ['views','engagement','comments'] as const){const hasBaseline=allPrevious.some(p=>p[metric]>0);for(const a of artists){const before=1+allPrevious.filter(p=>p[metric]>previous[a.id][metric]).length;stats[a.id].previousRank[metric]=hasBaseline?before:null;stats[a.id].movement[metric]=!hasBaseline?'new':stats[a.id].rank[metric]<before?'up':stats[a.id].rank[metric]>before?'down':'same'}}
 return Response.json({artists:stats,comparison:'Bugün 00.00, Türkiye saati'},{headers:{'Cache-Control':'no-store'}})
}
