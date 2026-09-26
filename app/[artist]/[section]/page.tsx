import {artistContent} from '@/lib/editorial';
import {publishedEntries} from '@/lib/entries';
import {isEntryKind,todayTR} from '@/lib/entries-types';
export const dynamic='force-dynamic';
import FansApp from '@/components/fans-app';
import {notFound} from 'next/navigation';
import {validArtist,sections,siteConfig} from '@/lib/site-config';
export async function generateMetadata({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;const valid=validArtist(artist)&&sections.some(s=>s.slug===section);return {title:`${artist} — ${sections.find(s=>s.slug===section)?.label??''} | ${siteConfig.name}`,alternates:valid?{canonical:(process.env.SITE_ORIGIN??'https://fans.wai.com.tr')+'/'+artist+'/'+section}:undefined,robots:{index:valid&&section!=='sarki-sozleri',follow:true}}}
export default async function Page({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;if(!validArtist(artist)||!sections.some(s=>s.slug===section))notFound();const [content,entries]=await Promise.all([artistContent(artist),isEntryKind(section)?publishedEntries(artist,section):Promise.resolve([])]);return <FansApp key={artist+'/'+section} initialArtist={artist} section={section} content={content} entries={entries} today={todayTR()}/>}
