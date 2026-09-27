import {semicenkSongSeo} from '@/lib/semicenk-page-seo';
import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getSong,allSongs,songHref} from '@/lib/songs';
import {artists} from '@/lib/artists';
import SimilarArtists from '@/components/similar-artists';
import Engagement from '@/components/engagement';
import ArtistChannel from '@/components/deferred-artist-channel';
import MobileNav from '@/components/mobile-nav';
import {siteOrigin,socialMetadata} from '@/lib/seo';
import {dateLabel} from '@/lib/entries-types';
export const dynamic='force-dynamic';
type Props={params:Promise<{artist:string;slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {artist,slug}=await params,s=await getSong(artist,slug);
 if(!s)return {title:'Şarkı bulunamadı',robots:{index:false}};
 const pilot=artist==='semicenk'?semicenkSongSeo(s):null;
 const name=artists.find(a=>a.id===artist)?.name??artist,title=pilot?.title??s.name+' — '+name+' | Şarkı Bilgileri ve Dinle',description=pilot?.description??s.info?.description.slice(0,170)??name+' sanatçısının '+s.albumTitle+' yayınındaki '+s.name+' şarkısını ve resmî kayıtlarını keşfet.';
 return {title,description,alternates:{canonical:songHref(s)},...socialMetadata(title,description,songHref(s),s.cover),robots:{index:!!(s.videoId||s.info),follow:true}}
}
export default async function Page({params}:Props){
 const {artist,slug}=await params,s=await getSong(artist,slug);if(!s)notFound();
 const artistName=artists.find(a=>a.id===artist)?.name??artist,all=await allSongs(artist),neighbors=all.filter(x=>x.albumId===s.albumId&&x.slug!==s.slug),related=neighbors.length?neighbors:all.filter(x=>x.slug!==s.slug).sort((a,b)=>Math.abs(Date.parse(a.date)-Date.parse(s.date))-Math.abs(Date.parse(b.date)-Date.parse(s.date))).slice(0,4),url=siteOrigin+songHref(s);
 const graph={'@context':'https://schema.org','@graph':[{'@type':'MusicRecording',name:s.name,byArtist:(artist==='semicenk'||artist==='manifest')&&s.info?.credits?s.info.credits.split(/\s*&\s*|,\s*/).map(name=>({'@type':'Person',name,...(name==='Semicenk'?{url:siteOrigin+'/'+artist}:{})})):{'@type':artist==='semicenk'?'Person':'MusicGroup',name:artistName,url:siteOrigin+'/'+artist},inAlbum:{'@type':'MusicAlbum',name:s.albumTitle,url:s.info?.externalAlbumUrl??siteOrigin+'/'+artist+'/albumler/'+s.albumSlug},url,image:s.cover||undefined,datePublished:s.date,description:s.info?.description,duration:s.info?'PT'+s.info.duration+'S':undefined,sameAs:[...(s.info?[s.info.url]:[]),...(s.videoId?['https://www.youtube.com/watch?v='+s.videoId]:[])]},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:artistName,item:siteOrigin+'/'+artist},{'@type':'ListItem',position:2,name:'Şarkılar',item:siteOrigin+'/'+artist+'/sarkilar'},{'@type':'ListItem',position:3,name:s.name,item:url}]}]};
 return <><main className="song-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/><nav className="song-breadcrumb" aria-label="İçerik yolu"><Link href="/">Keşfet</Link> / <Link href={'/'+artist}>{artistName}</Link> / <Link href={'/'+artist+'/sarkilar'}>Şarkılar</Link> / {s.name}</nav>
 <div className="song-hero">{s.cover&&<img src={s.cover} alt={s.cover.startsWith('/images/artists/')?artistName+' sanatçı fotoğrafı':s.albumTitle+' yayın kapağı'} width="360" height="360"/>}<div><p className="eyebrow">{artistName.toLocaleUpperCase('tr')} · ŞARKI</p><h1>{artist==='semicenk'?'Semicenk – '+s.name:s.name}</h1><p>{s.info?.credits??artistName}</p><p>{dateLabel(s.date)}{s.info?' · '+Math.floor(s.info.duration/60)+':'+String(s.info.duration%60).padStart(2,'0'):''}</p><Link href={s.info?.externalAlbumUrl??'/'+artist+'/albumler/'+s.albumSlug}>{s.albumTitle} · {s.info?.externalAlbumUrl?'Konuk sanatçı kaydı · Apple Music':'Yayını incele'} →</Link></div></div>
 {s.info&&<section className="editorial-prose"><h2>Şarkı hakkında</h2><p>{s.info.description}</p><dl className="concert-facts"><div><dt>Sanatçı künyesi</dt><dd>{s.info.credits}</dd></div><div><dt>Yayın tarihi</dt><dd>{dateLabel(s.date)}</dd></div><div><dt>Süre</dt><dd>{Math.floor(s.info.duration/60)} dk {s.info.duration%60} sn</dd></div></dl><a className="primary" href={s.info.url} target="_blank" rel="noopener noreferrer">Apple Music’te dinle ↗</a><p className="credit">Yayın ve süre bilgileri: <a href={s.info.url} target="_blank" rel="noreferrer">Apple Music</a>. Şarkı sözleri, hizmette sunulduğunda dinleme ekranından açılabilir.</p></section>}
 {s.videoId&&<section className="official-video"><h2>Resmî video / kayıt</h2><div className="video-frame"><iframe src={'https://www.youtube-nocookie.com/embed/'+s.videoId} title={artistName+' – '+s.name+' resmî kayıt'} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div><p><a href={'https://www.youtube.com/watch?v='+s.videoId} target="_blank" rel="noopener noreferrer">YouTube’da izle ↗</a>{s.info&&<> · <a href={s.info.videoSource} target="_blank" rel="noreferrer">Resmî yayın kaynağı</a></>}</p></section>}
 {!s.videoId&&!s.info&&<section className="official-video"><h2>Dinleme bilgisi</h2><Link href={'/'+artist+'/albumler/'+s.albumSlug}>Yayının dinleme bağlantısına git →</Link></section>}
 {related.length>0&&<section className="song-neighbors"><h2>{neighbors.length?'Aynı yayındaki diğer şarkılar':'Aynı dönemden şarkılar'}</h2><div>{related.map(x=><Link key={x.slug} href={songHref(x)}>{x.name} →</Link>)}</div></section>}
 <Engagement target={'song:'+artist+':'+s.slug}/><SimilarArtists artist={artist} section="sarkilar"/><ArtistChannel artist={artist} name={artistName}/></main><MobileNav active="search"/></>}
