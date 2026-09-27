import {isUnavailable} from '@/lib/semicenk-events';
import Link from 'next/link';
import CardRail from './card-rail';
import {dateLabel,entryHref,type Entry,type EntryKind} from '@/lib/entries-types';
import {entryDisplayTitle} from '@/lib/semicenk-page-seo';
import {useArtistCatalog} from './artist-catalog-context';

const sections:{kind:EntryKind;eyebrow:string;title:string;all:string}[]=[
 {kind:'haberler',eyebrow:'HABER ARŞİVİ',title:'Haberler',all:'Tüm haberler'},
 {kind:'konserler',eyebrow:'SAHNE TAKVİMİ',title:'Konserler',all:'Tüm konserler'},
 {kind:'albumler',eyebrow:'DİSKOGRAFİ',title:'Albümler',all:'Tüm albümler'}
];
export default function SemicenkMediaRows({entries,today}:{entries:Entry[];today:string}){
 const catalog=useArtistCatalog();const songs=Object.values(catalog.songs).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
 const upcoming=entries.filter(e=>e.kind==='konserler'&&e.date>=today&&!isUnavailable(e)).sort((a,b)=>a.date.localeCompare(b.date));
 const past=entries.filter(e=>e.kind==='konserler'&&e.date<today&&!isUnavailable(e)).sort((a,b)=>b.date.localeCompare(a.date));
 function entrySection(kind:EntryKind){
  const item=sections.find(s=>s.kind===kind)!;
  const list=(kind==='konserler'?(upcoming.length?upcoming:past):entries.filter(e=>e.kind===kind).sort((a,b)=>b.date.localeCompare(a.date))).slice(0,6);
  return <section key={kind}><div className="feed-heading"><div><p className="eyebrow">{item.eyebrow}</p><h2>{item.title}</h2></div><Link href={'/semicenk/'+kind}>{item.all} →</Link></div>
   {list.length?<CardRail label={'Semicenk '+item.title}>{list.map(e=><Link href={entryHref(e)} className="artist-media-card" key={e.id}><img src={e.cover} alt={e.title+(kind==='konserler'?' — etkinlik görseli':' — yayın görseli')} loading="lazy"/><strong>{entryDisplayTitle(e)}</strong><span>{dateLabel(e.date)}{e.city?' · '+e.city:''}</span></Link>)}</CardRail>:<p className="entries-note">Henüz yayımlanmış {item.title.toLocaleLowerCase('tr-TR')} kaydı yok.</p>}</section>;
 }
 return <div className="artist-media-rows editorial-home"><div className="editorial-stats"><Link href="/semicenk/albumler"><strong>{entries.filter(e=>e.kind==='albumler').length}</strong> müzik yayını</Link><Link href="/semicenk/sarkilar"><strong>{Object.keys(catalog.songs).length}</strong> şarkı</Link><Link href="/semicenk/biyografi">Cenk Baş’tan Semicenk’e →</Link></div>
  {entrySection('haberler')}
  {entrySection('konserler')}
  <section><div className="feed-heading"><div><p className="eyebrow">MÜZİĞİ KEŞFET</p><h2>Şarkılar</h2></div><Link href="/semicenk/sarkilar">Tüm şarkılar →</Link></div><CardRail label="Semicenk şarkıları">{songs.map(s=><Link className="artist-media-card" key={s.slug} href={'/semicenk/sarkilar/'+s.slug}><img src={s.cover} alt={s.albumTitle+' kapağı'} loading="lazy"/><strong>{s.name}</strong><span>{s.credits}</span></Link>)}</CardRail></section>
  {entrySection('albumler')}
 </div>;
}
