import FansApp from '@/components/fans-app';
import {notFound} from 'next/navigation';
import {validArtist,siteConfig} from '@/lib/site-config';
import {isEntryKind,todayTR} from '@/lib/entries-types';
import {publishedEntry} from '@/lib/entries';
export const dynamic='force-dynamic';
type Props={params:Promise<{artist:string;section:string;slug:string}>};
export async function generateMetadata({params}:Props){const {artist,section,slug}=await params;if(!validArtist(artist)||!isEntryKind(section))return {robots:{index:false}};const item=await publishedEntry(artist,section,slug);const url=(process.env.SITE_ORIGIN??'https://fans.wai.com.tr')+'/'+artist+'/'+section+'/'+slug;return {title:item?item.title+' | '+siteConfig.name:'İçerik bulunamadı',description:item?.summary,alternates:item?{canonical:url}:undefined,openGraph:item?{title:item.title,description:item.summary,url,images:item.cover?[{url:item.cover}]:[]}:undefined,robots:{index:!!item,follow:true}}}
export default async function Page({params}:Props){const {artist,section,slug}=await params;if(!validArtist(artist)||!isEntryKind(section))notFound();const entry=await publishedEntry(artist,section,slug);if(!entry)notFound();return <FansApp key={artist+'/'+section+'/'+slug} initialArtist={artist} section={section} entry={entry} today={todayTR()}/>}
