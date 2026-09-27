import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {artists} from '@/lib/artists';
import {artistMedia} from './artist-photo';
export default function SimilarArtists({artist,section}:{artist:string;section?:string}){
 const current=artists.find(a=>a.id===artist);if(!current)return null;
 const allowed=['haberler','konserler','albumler','biyografi','galeri','sarki-sozleri','sarkilar'];
 const destination=section&&allowed.includes(section)?'/'+section:'';
 const labels:Record<string,string>={sarkilar:'Şarkılarını keşfet',albumler:'Albümlerini keşfet',biyografi:'Biyografisini oku',haberler:'Haberlerini keşfet',konserler:'Konserlerine bak',galeri:'Galerisini keşfet','sarki-sozleri':'Şarkı rehberini keşfet'};
 const pool=artists.filter(a=>a.id!==artist).sort((a,b)=>Number(b.genre===current.genre)-Number(a.genre===current.genre)).slice(0,4);
 return <section className="similar-artists" aria-label="Benzer sanatçıları keşfet"><div className="feed-heading"><div><p className="eyebrow">KEŞFETMEYE DEVAM ET</p><h2>Benzer sanatçıları keşfet</h2></div></div><div className="similar-artists-grid">{pool.map(a=><Link key={a.id} href={'/'+a.id+destination}><img src={artistMedia[a.id]?.src} alt={a.name} loading="lazy" width="96" height="96"/><span><strong>{a.name}</strong><small>{a.genre} · {labels[section??'']??'Sanatçıyı keşfet'}</small></span><ArrowUpRight size={19}/></Link>)}</div></section>;
}
