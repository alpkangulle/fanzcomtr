import {siteOrigin} from '@/lib/seo';
import {entryHref,type Entry} from '@/lib/entries-types';
import {songSlug} from '@/lib/song-slug';
export default function EntryStructuredData({entry:e}:{entry:Entry}){
 if(e.artist!=='semicenk')return null;
 const url=siteOrigin+entryHref(e),artist={'@type':'Person',name:'Semicenk',alternateName:'Cenk Baş',url:siteOrigin+'/semicenk'};
 const common={name:e.title,description:e.summary,url,image:e.cover||undefined};
 const entity=e.kind==='albumler'?{'@type':'MusicAlbum',...common,byArtist:artist,datePublished:e.date,numTracks:e.tracks.split('\n').filter(Boolean).length,albumReleaseType:e.title.includes('Single')?'https://schema.org/SingleRelease':e.title.includes('EP')?'https://schema.org/EPRelease':'https://schema.org/AlbumRelease',sameAs:e.source,track:e.tracks.split('\n').filter(Boolean).map(name=>({'@type':'MusicRecording',name,url:siteOrigin+'/semicenk/sarkilar/'+songSlug(name)}))}:e.kind==='konserler'?{'@type':'MusicEvent',...common,startDate:e.time?e.date+'T'+e.time+':00+03:00':e.date,location:{'@type':'Place',name:e.venue,address:{'@type':'PostalAddress',addressLocality:e.city,addressCountry:'TR'}},performer:artist,sameAs:e.source}:{'@type':'Article',...common,headline:e.title,datePublished:'2026-09-27',dateModified:new Date(e.updated).toISOString(),author:{'@type':'Organization',name:'Fanz Editör',url:siteOrigin},publisher:{'@type':'Organization',name:'Fanz',url:siteOrigin},about:artist,citation:e.source,mainEntityOfPage:url};
 const graph={'@context':'https://schema.org','@graph':[entity,{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Semicenk',item:siteOrigin+'/semicenk'},{'@type':'ListItem',position:2,name:e.kind==='albumler'?'Diskografi':e.kind==='haberler'?'Haberler':'Konserler',item:siteOrigin+'/semicenk/'+e.kind},{'@type':'ListItem',position:3,name:e.title,item:url}]}]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/>
}
