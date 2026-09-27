import SemicenkSectionSchema from '@/components/semicenk-section-schema';
import {entryHref} from '@/lib/entries-types';
import {entryDisplayTitle} from '@/lib/semicenk-page-seo';
import {artistCatalog} from '@/lib/artist-catalog';
import {semicenkSeo} from '@/lib/semicenk-seo';
import {controlledMetadata} from '@/lib/seo-templates';
import SeoArtistContent from '@/components/seo-artist-content';
import {artistContent} from '@/lib/editorial';
import {publishedEntries} from '@/lib/entries';
import {isEntryKind,todayTR} from '@/lib/entries-types';
export const dynamic='force-dynamic';
import FansApp from '@/components/fans-app';
import {notFound} from 'next/navigation';
import {validArtist,sections} from '@/lib/site-config';
import {artistName,sectionTitles,socialMetadata} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;const valid=validArtist(artist)&&sections.some(s=>s.slug===section);if(!valid)return {robots:{index:false}};const name=artistName(artist),topic=artist==='semicenk'&&section==='sarki-sozleri'?'Şarkı Rehberi ve Resmî Kayıtları':artist==='semicenk'&&section==='albumler'?'Diskografi: Albümler, EP’ler ve Single’lar':sectionTitles[section],title=`${name} ${topic}`,description=`${name} ${topic.toLocaleLowerCase('tr-TR')}: güncel içerikleri incele ve fan topluluğunu keşfet.`;const populated=isEntryKind(section)?(await publishedEntries(artist,section)).length>0:section!=='sarki-sozleri'||artist==='semicenk';return {alternates:{canonical:`/${artist}/${section}`},robots:{index:populated,follow:true},...controlledMetadata('/'+artist+'/'+section,artist==='semicenk'?semicenkSeo[section]?.title??title:title,artist==='semicenk'?semicenkSeo[section]?.description??description:description,artist==='semicenk'?'/images/artists/semicenk.png':undefined)}}
export default async function Page({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;if(!validArtist(artist)||!sections.some(s=>s.slug===section))notFound();const [content,entries]=await Promise.all([artistContent(artist),isEntryKind(section)?publishedEntries(artist,section):Promise.resolve([])]);return <>{artist==='semicenk'&&<SemicenkSectionSchema section={section} items={entries.map(e=>({name:entryDisplayTitle(e),path:entryHref(e)}))}/>}<FansApp catalog={await artistCatalog(artist)} key={artist+'/'+section} initialArtist={artist} section={section} content={content} entries={entries} today={todayTR()}/><SeoArtistContent path={'/'+artist+'/'+section}/></>}
