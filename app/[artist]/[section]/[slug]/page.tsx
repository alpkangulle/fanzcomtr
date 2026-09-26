import FansApp from '@/components/fans-app';
import {notFound} from 'next/navigation';
import {validArtist} from '@/lib/site-config';
import {artistName,socialMetadata} from '@/lib/seo';
import {isEntryKind,todayTR} from '@/lib/entries-types';
import {publishedEntry} from '@/lib/entries';
export const dynamic='force-dynamic';
type Props={params:Promise<{artist:string;section:string;slug:string}>};
export async function generateMetadata({params}:Props){const {artist,section,slug}=await params;if(!validArtist(artist)||!isEntryKind(section))return {robots:{index:false}};const item=await publishedEntry(artist,section,slug);if(!item)return {robots:{index:false}};const title=`${item.title} — ${artistName(artist)}`,description=item.summary?.trim()||`${artistName(artist)} hakkında ${item.title} detayları.`;const path=`/${artist}/${section}/${slug}`;return {title,description,alternates:{canonical:path},...socialMetadata(title,description,path,item.cover)}}
export default async function Page({params}:Props){const {artist,section,slug}=await params;if(!validArtist(artist)||!isEntryKind(section))notFound();const entry=await publishedEntry(artist,section,slug);if(!entry)notFound();return <FansApp key={artist+'/'+section+'/'+slug} initialArtist={artist} section={section} entry={entry} today={todayTR()}/>}
