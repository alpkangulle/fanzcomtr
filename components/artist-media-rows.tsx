import Link from 'next/link';
import SemicenkMediaRows from './semicenk-media-rows';
import CardRail from './card-rail';
import StatsBadge from './stats-badge';
import {dateLabel,entryHref,type Entry} from '@/lib/entries-types';
import {songSlug} from '@/lib/song-slug';
export default function ArtistMediaRows({artist,entries}:{artist:string;entries:Entry[]}){
 if(artist==='semicenk')return <SemicenkMediaRows entries={entries}/>;
 const album=entries.find(e=>e.kind==='albumler');const songs=album?.tracks.split('\n').filter(Boolean).slice(0,5)??[];
 return <div className="artist-media-rows">
  <section><div className="feed-heading"><div><p className="eyebrow">BU SANATÇIDAN</p><h2>Haberler, konserler ve albümler</h2></div></div><CardRail label="Sanatçı içerikleri">{entries.map(e=><Link href={entryHref(e)} className="artist-media-card" key={e.id}><img src={e.cover} alt={e.title} loading="lazy"/><StatsBadge target={'entry:'+e.id}/><strong>{e.title}</strong><span>{e.kind==='konserler'?'Konser':e.kind==='albumler'?'Albüm':'Haber'} · {dateLabel(e.date)}</span></Link>)}</CardRail></section>
  <section><div className="feed-heading"><div><p className="eyebrow">MÜZİĞİN İÇİNDE</p><h2>Şarkılar ve daha fazlası</h2></div></div><CardRail label="Sanatçının müziği ve sayfaları">{[
   ...songs.map((song,i)=><Link key={'song-'+i} className="artist-media-card" href={'/'+artist+'/sarkilar/'+songSlug(song)}><img src={album?.cover??''} alt={album?.title??''} loading="lazy"/><strong>{song}</strong><span>{album?.title} · Şarkı</span></Link>),
   <Link key="albums" className="artist-media-card media-link-card" href={'/'+artist+'/albumler'}><span className="media-link-art">♪</span><strong>Albümler</strong><span>Tüm albümleri keşfet</span></Link>,
   <Link key="gallery" className="artist-media-card media-link-card" href={'/'+artist+'/galeri'}><span className="media-link-art">✳︎</span><strong>Galeri</strong><span>Fotoğraflara göz at</span></Link>
  ]}</CardRail></section>
 </div>
}
