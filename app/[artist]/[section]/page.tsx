import {artistContent} from '@/lib/editorial';
import {publishedEntries} from '@/lib/entries';
import {isEntryKind,todayTR} from '@/lib/entries-types';
export const dynamic='force-dynamic';
import FansApp from '@/components/fans-app';
import {notFound} from 'next/navigation';
import {validArtist,sections} from '@/lib/site-config';
import {artistName,socialMetadata} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;const valid=validArtist(artist)&&sections.some(s=>s.slug===section);if(!valid)return {robots:{index:false}};const name=artistName(artist),label=sections.find(s=>s.slug===section)!.label,title=`${name} ${label}`,description=`${name} ${label.toLocaleLowerCase('tr-TR')} sayfasını incele; güncel içerikleri ve fan topluluğunu keşfet.`;return {title,description,alternates:{canonical:`/${artist}/${section}`},robots:{index:section!=='sarki-sozleri',follow:true},...socialMetadata(title,description,`/${artist}/${section}`)}}
export default async function Page({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;if(!validArtist(artist)||!sections.some(s=>s.slug===section))notFound();const [content,entries]=await Promise.all([artistContent(artist),isEntryKind(section)?publishedEntries(artist,section):Promise.resolve([])]);return <FansApp key={artist+'/'+section} initialArtist={artist} section={section} content={content} entries={entries} today={todayTR()}/>}
