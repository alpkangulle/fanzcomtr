import Blok3SectionSchema from '@/components/blok3-section-schema';
import {blok3Seo} from '@/lib/blok3-seo';
import {artistCatalog} from '@/lib/artist-catalog';
import {semicenkSeo} from '@/lib/semicenk-seo';
import {controlledMetadata} from '@/lib/seo-templates';
import SeoArtistContent from '@/components/seo-artist-content';
import SemicenkProfileSchema from '@/components/semicenk-profile-schema';
import ManifestSectionSchema from '@/components/manifest-section-schema';
import {manifestSeo} from '@/lib/manifest-seo';
import FansApp from '@/components/fans-app';
import {notFound} from 'next/navigation';
import {validArtist} from '@/lib/site-config';
import {artistName,socialMetadata} from '@/lib/seo';
import {publishedEntries} from '@/lib/entries';
import {todayTR} from '@/lib/entries-types';
import {artistContent} from '@/lib/editorial';
import {artists} from '@/lib/artists';
import {artistShouts} from '@/lib/shouts';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))return {robots:{index:false}};const name=artistName(artist),title=`${name} Fan Club Topluluğu: Sohbet, Şarkılar ve Haberler`,description=`${name} Fan Club topluluğunda hayranlarla sohbet et. ${name} haberleri, konserleri, şarkıları, albümleri, biyografisi ve fotoğraflarını keşfet.`;return {alternates:{canonical:'/'+artist},...controlledMetadata('/'+artist,artist==='semicenk'?semicenkSeo[''].title:artist==='manifest'?manifestSeo[''].title:artist==='blok3'?blok3Seo[''].title:title,artist==='semicenk'?semicenkSeo[''].description:artist==='manifest'?manifestSeo[''].description:artist==='blok3'?blok3Seo[''].description:description,artist==='manifest'?'/images/artists/manifest.jpg':artist==='blok3'?'/images/artists/blok3.png':'/images/artists/'+artist+'.png')}}
export default async function Page({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))notFound();const [content,entries,shouts]=await Promise.all([artistContent(artist),publishedEntries(artist),artistShouts(artist)]);return <>{artist==='semicenk'&&<SemicenkProfileSchema/>}{artist==='manifest'&&<ManifestSectionSchema/>}{artist==='blok3'&&<Blok3SectionSchema/>}<FansApp catalog={await artistCatalog(artist)} key={artist} initialArtist={artist} content={content} entries={entries} shouts={shouts} today={todayTR()}/><SeoArtistContent path={'/'+artist}/></>}
