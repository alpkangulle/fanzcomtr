import BurakBulutSectionSchema from '@/components/burak-bulut-section-schema';
import {burakBulutSeo} from '@/lib/burak-bulut-seo';
import Blok3SectionSchema from '@/components/blok3-section-schema';
import {blok3Seo} from '@/lib/blok3-seo';
import SemicenkSectionSchema from '@/components/semicenk-section-schema';
import ManifestSectionSchema from '@/components/manifest-section-schema';
import {manifestSeo} from '@/lib/manifest-seo';
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
export async function generateMetadata({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;const valid=validArtist(artist)&&sections.some(s=>s.slug===section);if(!valid)return {robots:{index:false}};const name=artistName(artist),topic=artist==='semicenk'&&section==='sarki-sozleri'?'Şarkı Rehberi ve Resmî Kayıtları':artist==='semicenk'&&section==='albumler'?'Diskografi: Albümler, EP’ler ve Single’lar':sectionTitles[section],title=`${name} ${topic}`,description=`${name} ${topic.toLocaleLowerCase('tr-TR')}: güncel içerikleri incele ve fan topluluğunu keşfet.`;const populated=isEntryKind(section)?(await publishedEntries(artist,section)).length>0:section!=='sarki-sozleri'||artist==='semicenk'||artist==='manifest'||artist==='blok3'||artist==='burak-bulut';return {alternates:{canonical:`/${artist}/${section}`},robots:{index:populated,follow:true},...controlledMetadata('/'+artist+'/'+section,artist==='semicenk'?semicenkSeo[section]?.title??title:artist==='manifest'?manifestSeo[section]?.title??title:artist==='blok3'?blok3Seo[section]?.title??title:artist==='burak-bulut'?burakBulutSeo[section]?.title??title:title,artist==='semicenk'?semicenkSeo[section]?.description??description:artist==='manifest'?manifestSeo[section]?.description??description:artist==='blok3'?blok3Seo[section]?.description??description:artist==='burak-bulut'?burakBulutSeo[section]?.description??description:description,artist==='semicenk'?'/images/artists/semicenk.png':artist==='manifest'?'/images/artists/manifest.jpg':artist==='blok3'?'/images/artists/blok3.png':artist==='burak-bulut'?'/images/artists/burak-bulut.png':undefined)}}
export default async function Page({params}:{params:Promise<{artist:string;section:string}>}){const {artist,section}=await params;if(!validArtist(artist)||!sections.some(s=>s.slug===section))notFound();const [content,entries]=await Promise.all([artistContent(artist),isEntryKind(section)?publishedEntries(artist,section):Promise.resolve([])]);return <>{artist==='semicenk'&&<SemicenkSectionSchema section={section} items={entries.map(e=>({name:entryDisplayTitle(e),path:entryHref(e)}))}/>} {artist==='manifest'&&<ManifestSectionSchema section={section} items={entries.map(e=>({name:e.title,path:entryHref(e)}))}/>} {artist==='burak-bulut'&&<BurakBulutSectionSchema section={section} items={entries.map(e=>({name:e.title,path:entryHref(e)}))}/>}<FansApp catalog={await artistCatalog(artist)} key={artist+'/'+section} initialArtist={artist} section={section} content={content} entries={entries} today={todayTR()}/><SeoArtistContent path={'/'+artist+'/'+section}/></>}
