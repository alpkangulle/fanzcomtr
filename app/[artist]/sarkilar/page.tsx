import Link from 'next/link';
import {notFound} from 'next/navigation';
import {validArtist} from '@/lib/site-config';
import {artists} from '@/lib/artists';
import {allSongs,songHref} from '@/lib/songs';
import MobileNav from '@/components/mobile-nav';
import {socialMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))return {robots:{index:false}};const name=artists.find(a=>a.id===artist)!.name,title=`${name} Şarkıları ve Resmî Videoları`,description=`${name} şarkılarını, albümlerini ve doğrulanmış resmî YouTube videolarını keşfet.`;return {title,description,alternates:{canonical:`/${artist}/sarkilar`},...socialMetadata(title,description,`/${artist}/sarkilar`)}}
export default async function Page({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))notFound();const songs=await allSongs(artist),name=artists.find(a=>a.id===artist)?.name??artist;return <><main className="song-page"><Link className="back" href={'/'+artist}>← {name} topluluğu</Link><p className="eyebrow">MÜZİK</p><h1>{name} şarkıları</h1><p>Albüm şarkıları ve doğrulanmış resmî videoları.</p><div className="song-list">{songs.map(s=><Link key={s.slug} href={songHref(s)}><img src={s.cover} alt={`${s.albumTitle} albüm kapağı`}/><span><strong>{s.name}</strong><small>{s.albumTitle} · {s.videoId?'Resmî video':'Şarkı bilgisi'}</small></span></Link>)}</div></main><MobileNav active="search"/></>}
