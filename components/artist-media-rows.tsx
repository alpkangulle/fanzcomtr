import Link from 'next/link';
import SemicenkMediaRows from './semicenk-media-rows';
import CardRail from './card-rail';
import StatsBadge from './stats-badge';
import {useArtistCatalog} from './artist-catalog-context';
import {dateLabel,entryHref,type Entry,type EntryKind} from '@/lib/entries-types';
import {songSlug} from '@/lib/song-slug';

const headings:{kind:EntryKind;title:string;eyebrow:string;all:string}[]=[
 {kind:'haberler',title:'Haberler',eyebrow:'GÜNCEL VE ARŞİV',all:'Tüm haberler'},
 {kind:'konserler',title:'Konserler',eyebrow:'SAHNE TAKVİMİ',all:'Tüm konserler'},
 {kind:'albumler',title:'Albümler',eyebrow:'DİSKOGRAFİ',all:'Tüm albümler'}
];
export default function ArtistMediaRows({artist,entries,today}:{artist:string;entries:Entry[];today:string}){
 if(artist==='semicenk')return <SemicenkMediaRows entries={entries} today={today}/>;
 const catalog=useArtistCatalog();
 const upcoming=entries.filter(e=>e.kind==='konserler'&&e.date>=today&&!['cancelled','postponed'].includes(e.event_status??'scheduled')).sort((a,b)=>a.date.localeCompare(b.date));
 const past=entries.filter(e=>e.kind==='konserler'&&e.date<today).sort((a,b)=>b.date.localeCompare(a.date));
 const songs=Object.values(catalog.songs).sort((a,b)=>b.date.localeCompare(a.date)||a.name.localeCompare(b.name,'tr')).slice(0,8);
 const fallback=entries.filter(e=>e.kind==='albumler').sort((a,b)=>b.date.localeCompare(a.date)).flatMap(album=>album.tracks.split('\n').filter(Boolean).slice(0,8).map(name=>({name,slug:songSlug(name),cover:album.cover,albumTitle:album.title,credits:album.title}))).slice(0,8);
 const shown=songs.length?songs:fallback;
 function group(kind:EntryKind){
  return kind==='konserler'?(upcoming.length?upcoming:past).slice(0,6):entries.filter(e=>e.kind===kind).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 }
 function entrySection(kind:EntryKind){
  const item=headings.find(x=>x.kind===kind)!;const list=group(kind);
  return <section key={kind}><div className="feed-heading"><div><p className="eyebrow">{item.eyebrow}</p><h2>{item.title}</h2></div><Link href={'/'+artist+'/'+kind}>{item.all} →</Link></div>
   {list.length?<CardRail label={item.title}>{list.map(e=><Link href={entryHref(e)} className="artist-media-card" key={e.id}><img src={e.cover} alt={e.title+' görseli'} loading="lazy"/><StatsBadge target={'entry:'+e.id}/><strong>{e.title}</strong><span>{dateLabel(e.date)}{e.city?' · '+e.city:''}</span></Link>)}</CardRail>:<p className="entries-note">Henüz yayımlanmış {item.title.toLocaleLowerCase('tr-TR')} kaydı yok.</p>}</section>;
 }
 return <div className="artist-media-rows editorial-home">
  {entrySection('haberler')}
  {entrySection('konserler')}
  <section><div className="feed-heading"><div><p className="eyebrow">MÜZİĞİ KEŞFET</p><h2>Şarkılar</h2></div><Link href={'/'+artist+'/sarkilar'}>Tüm şarkılar →</Link></div>
   {shown.length?<CardRail label="Şarkılar">{shown.map(s=><Link key={s.slug} className="artist-media-card" href={'/'+artist+'/sarkilar/'+s.slug}><img src={s.cover} alt={s.albumTitle+' yayın kapağı'} loading="lazy"/><strong>{s.name}</strong><span>{s.credits}</span></Link>)}</CardRail>:<p className="entries-note">Şarkı arşivi hazırlanıyor.</p>}
  </section>
  {entrySection('albumler')}
 </div>;
}
