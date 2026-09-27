import {eventStatusSchema,eventCountry,eventTimeZone} from '@/lib/semicenk-events';
import {semicenkEntrySeo} from '@/lib/semicenk-page-seo';
import {siteOrigin} from '@/lib/seo';
import {entryHref,type Entry} from '@/lib/entries-types';
import {songSlug} from '@/lib/song-slug';
export default function EntryStructuredData({entry:e}:{entry:Entry}){
 if(e.artist!=='semicenk')return null;
 const url=siteOrigin+entryHref(e),artist={'@type':'Person','@id':siteOrigin+'/semicenk#artist',name:'Semicenk',alternateName:'Cenk Baş',url:siteOrigin+'/semicenk'};
 const seo=semicenkEntrySeo(e);const common={name:seo.heading,description:seo.description,url,image:e.cover||undefined};
 const entity=e.kind==='albumler'?{'@type':'MusicAlbum',...common,byArtist:artist,datePublished:e.date,numTracks:e.tracks.split('\n').filter(Boolean).length,albumReleaseType:(e.release_format||e.title).includes('Single')?'https://schema.org/SingleRelease':(e.release_format||e.title).includes('EP')?'https://schema.org/EPRelease':'https://schema.org/AlbumRelease',sameAs:e.source,track:e.tracks.split('\n').filter(Boolean).map(name=>({'@type':'MusicRecording',name,url:siteOrigin+'/semicenk/sarkilar/'+songSlug(name)}))}:e.kind==='konserler'?{'@type':'MusicEvent',...common,startDate:e.time?e.date+'T'+e.time+':00'+eventTimeZone(e):e.date,eventStatus:eventStatusSchema(e),previousStartDate:e.event_status==='rescheduled'&&e.previous_date?e.previous_date:undefined,location:{'@type':'Place',name:e.venue,address:{'@type':'PostalAddress',addressLocality:e.city,addressCountry:eventCountry(e)}},performer:artist,sameAs:e.source}:{'@type':'Article',...common,headline:seo.heading,dateModified:new Date(e.updated).toISOString(),author:{'@type':'Organization',name:'Fanz Editör',url:siteOrigin},publisher:{'@type':'Organization',name:'Fanz',url:siteOrigin},about:artist,citation:e.source,mainEntityOfPage:url};
 const graph={'@context':'https://schema.org','@graph':[entity,{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Semicenk',item:siteOrigin+'/semicenk'},{'@type':'ListItem',position:2,name:e.kind==='albumler'?'Diskografi':e.kind==='haberler'?'Haberler':'Konserler',item:siteOrigin+'/semicenk/'+e.kind},{'@type':'ListItem',position:3,name:seo.heading,item:url}]}]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/>
}
