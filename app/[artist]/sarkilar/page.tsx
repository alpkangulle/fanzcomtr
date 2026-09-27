import Blok3SectionSchema from '@/components/blok3-section-schema';
import {blok3Seo} from '@/lib/blok3-seo';
import SemicenkSectionSchema from '@/components/semicenk-section-schema';
import ManifestSectionSchema from '@/components/manifest-section-schema';
import {manifestSeo} from '@/lib/manifest-seo';
import {controlledMetadata} from '@/lib/seo-templates';
import SeoArtistContent from '@/components/seo-artist-content';
import Engagement from '@/components/engagement';
import ArtistChannel from '@/components/deferred-artist-channel';
import SimilarArtists from '@/components/similar-artists';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {validArtist} from '@/lib/site-config';
import {artists} from '@/lib/artists';
import {allSongs,songHref} from '@/lib/songs';
import MobileNav from '@/components/mobile-nav';
import {socialMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))return {robots:{index:false}};const name=artists.find(a=>a.id===artist)!.name,title=`${name} Şarkıları ve Resmî Videoları`,description=artist==='semicenk'?'Semicenk’in solo ve ortak şarkılarını çıkış tarihleri, sanatçı künyeleri ve resmî videolarıyla keşfet. Düşer Aklıma, Yana Yana, Üzülmedim Ki ve diğer kayıtlar.':artist==='manifest'?manifestSeo.sarkilar.description:artist==='blok3'?blok3Seo.sarkilar.description:`${name} şarkılarını, albümlerini ve doğrulanmış resmî YouTube videolarını keşfet.`;return {alternates:{canonical:`/${artist}/sarkilar`},...controlledMetadata('/'+artist+'/sarkilar',artist==='manifest'?manifestSeo.sarkilar.title:artist==='blok3'?blok3Seo.sarkilar.title:title,description,artist==='semicenk'?'/images/artists/semicenk.png':artist==='manifest'?'/images/artists/manifest.jpg':artist==='blok3'?'/images/artists/blok3.png':undefined)}}
export default async function Page({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))notFound();const songs=(await allSongs(artist)).sort((a,b)=>b.date.localeCompare(a.date)),name=artists.find(a=>a.id===artist)?.name??artist;return <>{artist==='semicenk'&&<SemicenkSectionSchema section="sarkilar" items={songs.map(s=>({name:s.name,path:songHref(s)}))}/>} {artist==='manifest'&&<ManifestSectionSchema section="sarkilar" items={songs.map(s=>({name:s.name,path:songHref(s)}))}/>}<main className="song-page"><Link className="back" href={'/'+artist}>← {name} topluluğu</Link><p className="eyebrow">MÜZİK</p><h1>{name} şarkıları</h1><p>Şarkı künyeleri, albüm ve single kayıtları, resmî videolar ve dinleme bağlantıları.</p><div className="song-list">{songs.map(s=><Link key={s.slug} href={songHref(s)}><img src={s.cover} loading="lazy" alt={s.cover.startsWith('/images/artists/')?name+' grup fotoğrafı':s.albumTitle+' albüm kapağı'}/><span><strong>{s.name}</strong><small>{s.albumTitle} · {s.videoId?'Resmî video':'Şarkı bilgisi'}</small></span></Link>)}</div><Engagement target={'section:'+artist+':sarkilar'}/><SimilarArtists artist={artist} section="sarkilar"/><ArtistChannel artist={artist} name={name}/></main><SeoArtistContent path={'/'+artist+'/sarkilar'}/><MobileNav active="search"/></>}
