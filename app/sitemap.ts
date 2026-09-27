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
  for(const section of ['biyografi','galeri'])pages.push({url:`${siteOrigin}/${artist.id}/${section}`,lastModified:latest(own)});
  for(const kind of ['haberler','konserler','albumler'] as const){
   const section=own.filter(r=>r.kind===kind);
   if(section.length)pages.push({url:`${siteOrigin}/${artist.id}/${kind}`,lastModified:latest(section)});
  }
  const songs=await allSongs(artist.id);
  if(artist.id==='semicenk')pages.push({url:siteOrigin+'/semicenk/sarki-sozleri',lastModified:latest(own)});
  if(songs.some(s=>s.videoId||s.info))pages.push({url:`${siteOrigin}/${artist.id}/sarkilar`,lastModified:latest(own.filter(r=>r.kind==='albumler'))});
  for(const song of songs)if(song.videoId||song.info)pages.push({url:siteOrigin+songHref(song),lastModified:latest(own.filter(r=>r.id===song.albumId))});
 }
 for(const r of entries)pages.push({url:`${siteOrigin}/${r.artist}/${r.kind}/${r.slug}`,lastModified:modified(r.updated)});
 pages.push({url:siteOrigin+'/top-listeler'},{url:siteOrigin+'/gorsel-kaynaklari'});
 const bios=(await channelDb().prepare('SELECT artist,updated FROM artist_content').all()).results;
 const overrides=(await channelDb().prepare('SELECT path,updated FROM seo_overrides').all()).results;
 for(const page of pages){
  const path=new URL(page.url).pathname;
  const override=overrides.find(o=>o.path===path);
  const bio=bios.find(b=>path==='/'+b.artist||path==='/'+b.artist+'/biyografi');
  const current=page.lastModified?new Date(page.lastModified).getTime():0;
  const changed=Math.max(current,Number(override?.updated)||0,Number(bio?.updated)||0);
  if(changed)page.lastModified=new Date(changed);
 }
 return pages;
}
