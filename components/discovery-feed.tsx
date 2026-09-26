import Link from 'next/link';
import {CalendarDays,Disc3,Newspaper,ArrowUpRight} from 'lucide-react';
import {dateLabel,entryHref,type Entry,type EntryKind} from '@/lib/entries-types';
import CardRail from './card-rail';
import StatsBadge from './stats-badge';
import {artistNames as names} from '@/lib/artists';
const groups:{kind:EntryKind;title:string;kicker:string;empty:string;icon:typeof Newspaper}[]=[
 {kind:'haberler',title:'Müzik gündemi',kicker:'SON HABERLER',empty:'Sanatçılardan kaynakları doğrulanmış haberler burada buluşacak.',icon:Newspaper},
 {kind:'konserler',title:'Sıradaki buluşma nerede?',kicker:'YAKLAŞAN KONSERLER',empty:'Doğrulanmış konser tarihleri eklendiğinde takvim burada görünecek.',icon:CalendarDays},
 {kind:'albumler',title:'Bir albüm, başka bir dünya.',kicker:'ALBÜM SEÇKİSİ',empty:'Sanatçıların albümlerini ve müzik yolculuklarını burada keşfedeceksin.',icon:Disc3}
];
export default function DiscoveryFeed({entries}:{entries:Entry[]}){return <div className="discovery-feed">{groups.map(({kind,title,kicker,empty,icon:Icon})=>{const list=entries.filter(e=>e.kind===kind);return <section key={kind} className="feed-section" aria-labelledby={'feed-'+kind}><div className="feed-heading"><div><p className="eyebrow">{kicker}</p><h2 id={'feed-'+kind}>{title}</h2></div><Icon size={25}/></div>{list.length?<CardRail label={title}>{list.map(e=><article className={'feed-card feed-'+kind} key={e.id}>{e.cover?<Link className="cover-link" href={entryHref(e)} aria-label={e.title+' sayfasını aç'}><img src={e.cover} alt={e.title} loading="lazy" referrerPolicy="no-referrer"/><StatsBadge target={'entry:'+e.id}/></Link>:<div className="feed-art" aria-hidden="true"><Icon size={40}/><span>{names[e.artist]??e.artist}</span></div>}<div className="feed-card-body"><Link className="feed-artist" href={'/'+e.artist}>{names[e.artist]??e.artist}</Link><h3><Link href={entryHref(e)}>{e.title}</Link></h3><p className="feed-date">{dateLabel(e.date)}{e.time?' · '+e.time:''}</p>{e.city&&<p>{e.city} · {e.venue}</p>}{e.summary&&<p>{e.summary}</p>}<Link className="world-link" href={entryHref(e)}>Keşfet <ArrowUpRight size={17}/></Link></div></article>)}</CardRail>:<div className="feed-empty"><Icon size={22}/><p>{empty}</p></div>}</section>})}</div>}

