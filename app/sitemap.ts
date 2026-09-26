import type {MetadataRoute} from 'next';
import {artists} from '@/lib/artists';
import {channelDb} from '@/lib/channel-db';
import {allSongs,songHref} from '@/lib/songs';
import {siteOrigin} from '@/lib/seo';

export const dynamic='force-dynamic';

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const rows=await channelDb().prepare("SELECT id,artist,kind,slug,updated FROM artist_entries WHERE status='published'").all();
 const entries=rows.results.filter(r=>artists.some(a=>a.id===r.artist)&&['haberler','konserler','albumler'].includes(String(r.kind)));
 const modified=(value:unknown)=>{const n=Number(value);return Number.isFinite(n)&&n>0?new Date(n):undefined};
 const latest=(items:typeof entries)=>modified(Math.max(0,...items.map(r=>Number(r.updated)||0)));
 const pages:MetadataRoute.Sitemap=[{url:siteOrigin+'/',lastModified:latest(entries)}];
 for(const artist of artists){
  const own=entries.filter(r=>r.artist===artist.id);
  pages.push({url:`${siteOrigin}/${artist.id}`,lastModified:latest(own)});
  for(const kind of ['haberler','konserler','albumler'] as const){
   const section=own.filter(r=>r.kind===kind);
   if(section.length)pages.push({url:`${siteOrigin}/${artist.id}/${kind}`,lastModified:latest(section)});
  }
  const songs=await allSongs(artist.id);
  if(songs.some(s=>s.videoId))pages.push({url:`${siteOrigin}/${artist.id}/sarkilar`,lastModified:latest(own.filter(r=>r.kind==='albumler'))});
  for(const song of songs)if(song.videoId)pages.push({url:siteOrigin+songHref(song),lastModified:latest(own.filter(r=>r.id===song.albumId))});
 }
 for(const r of entries)pages.push({url:`${siteOrigin}/${r.artist}/${r.kind}/${r.slug}`,lastModified:modified(r.updated)});
 pages.push({url:siteOrigin+'/top-listeler'},{url:siteOrigin+'/gorsel-kaynaklari'});
 return pages;
}
