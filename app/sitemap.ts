import type {MetadataRoute} from 'next';
import {artists} from '@/lib/artists';
import {channelDb} from '@/lib/channel-db';
import {allSongs,songHref} from '@/lib/songs';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const origin=process.env.SITE_ORIGIN??'https://fans.wai.com.tr',now=new Date();const pages:MetadataRoute.Sitemap=[{url:origin+'/',lastModified:now,changeFrequency:'daily',priority:1},...artists.flatMap(a=>[{url:origin+'/'+a.id,lastModified:now,changeFrequency:'daily' as const,priority:.8},{url:origin+'/'+a.id+'/sarkilar',lastModified:now,changeFrequency:'weekly' as const,priority:.7}])];const rows=await channelDb().prepare("SELECT artist,kind,slug,updated FROM artist_entries WHERE status='published'").all();for(const r of rows.results)pages.push({url:`${origin}/${r.artist}/${r.kind}/${r.slug}`,lastModified:new Date(Number(r.updated)),changeFrequency:'weekly',priority:.7});for(const s of await allSongs())if(s.videoId)pages.push({url:origin+songHref(s),lastModified:now,changeFrequency:'monthly',priority:.65});return pages}
