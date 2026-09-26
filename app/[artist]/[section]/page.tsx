import {artistContent} from '@/lib/editorial';
import {publishedEntries} from '@/lib/entries';
import {isEntryKind,todayTR} from '@/lib/entries-types';
export const dynamic='force-dynamic';
import FansApp from '@/components/fans-app';
import {notFound} from 'next/navigation';
import {validArtist,sections} from '@/lib/site-config';
import {artistName,sectionTitles,socialMetadata} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;const valid=validArtist(artist)&&sections.some(s=>s.slug===section);if(!valid)return {robots:{index:false}};const name=artistName(artist),topic=sectionTitles[section],title=`${name} ${topic}`,description=`${name} ${topic.toLocaleLowerCase('tr-TR')}: güncel içerikleri incele ve fan topluluğunu keşfet.`;const populated=isEntryKind(section)?(await publishedEntries(artist,section)).length>0:section!=='sarki-sozleri';return {title,description,alternates:{canonical:`/${artist}/${section}`},robots:{index:populated,follow:true},...socialMetadata(title,description,`/${artist}/${section}`)}}
export default async function Page({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;if(!validArtist(artist)||!sections.some(s=>s.slug===section))notFound();const [content,entries]=await Promise.all([artistContent(artist),isEntryKind(section)?publishedEntries(artist,section):Promise.resolve([])]);return <FansApp key={artist+'/'+section} initialArtist={artist} section={section} content={content} entries={entries} today={todayTR()}/>}
