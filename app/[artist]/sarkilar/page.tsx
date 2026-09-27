import {controlledMetadata} from '@/lib/seo-templates';
import SeoArtistContent from '@/components/seo-artist-content';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {validArtist} from '@/lib/site-config';
import {artists} from '@/lib/artists';
import {allSongs,songHref} from '@/lib/songs';
import MobileNav from '@/components/mobile-nav';
import {socialMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))return {robots:{index:false}};const name=artists.find(a=>a.id===artist)!.name,title=`${name} Şarkıları ve Resmî Videoları`,description=artist==='semicenk'?'Semicenk’in 46 şarkısını çıkış tarihleri, sanatçı künyeleri ve resmî videolarıyla keşfet. Düşer Aklıma, Yana Yana, Üzülmedim Ki ve diğer kayıtlar.':`${name} şarkılarını, albümlerini ve doğrulanmış resmî YouTube videolarını keşfet.`;return {alternates:{canonical:`/${artist}/sarkilar`},...controlledMetadata('/'+artist+'/sarkilar',title,description)}}
export default async function Page({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))notFound();const songs=(await allSongs(artist)).sort((a,b)=>b.date.localeCompare(a.date)),name=artists.find(a=>a.id===artist)?.name??artist;return <><main className="song-page"><Link className="back" href={'/'+artist}>← {name} topluluğu</Link><p className="eyebrow">MÜZİK</p><h1>{name} şarkıları</h1><p>Şarkı künyeleri, albüm ve single kayıtları, resmî videolar ve dinleme bağlantıları.</p><div className="song-list">{songs.map(s=><Link key={s.slug} href={songHref(s)}><img src={s.cover} loading="lazy" alt={`${s.albumTitle} albüm kapağı`}/><span><strong>{s.name}</strong><small>{s.albumTitle} · {s.videoId?'Resmî video':'Şarkı bilgisi'}</small></span></Link>)}</div></main><SeoArtistContent path={'/'+artist+'/sarkilar'}/><MobileNav active="search"/></>}
