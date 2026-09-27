import {artistCatalog} from '@/lib/artist-catalog';
import {semicenkSeo} from '@/lib/semicenk-seo';
import {controlledMetadata} from '@/lib/seo-templates';
import SeoArtistContent from '@/components/seo-artist-content';
import SemicenkProfileSchema from '@/components/semicenk-profile-schema';
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
export async function generateMetadata({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))return {robots:{index:false}};const name=artistName(artist),title=`${name} Fan Topluluğu, Haberleri ve Sohbeti`,description=`${name} haberleri, konserleri, albümleri ve şarkılarını keşfet. ${name} hayranlarının sohbet kanalına katıl.`;return {alternates:{canonical:'/'+artist},...controlledMetadata('/'+artist,artist==='semicenk'?semicenkSeo[''].title:title,artist==='semicenk'?semicenkSeo[''].description:description,'/images/artists/'+artist+'.png')}}
export default async function Page({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))notFound();const [content,entries,shouts]=await Promise.all([artistContent(artist),publishedEntries(artist),artistShouts(artist)]);return <>{artist==='semicenk'&&<SemicenkProfileSchema/>}<FansApp catalog={await artistCatalog(artist)} key={artist} initialArtist={artist} content={content} entries={entries} shouts={shouts} today={todayTR()}/><SeoArtistContent path={'/'+artist}/></>}
