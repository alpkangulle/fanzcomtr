import FansApp from '@/components/fans-app';
import {notFound} from 'next/navigation';
import {validArtist,siteConfig} from '@/lib/site-config';
import {publishedEntries} from '@/lib/entries';
import {todayTR} from '@/lib/entries-types';
import {artistContent} from '@/lib/editorial';
import {artists} from '@/lib/artists';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))return {robots:{index:false}};const name=artists.find(a=>a.id===artist)?.name??artist;return {title:`${name} fan topluluğu ve sohbet | ${siteConfig.name}`,description:`${name} haberleri, konserleri, albümleri, şarkıları ve hayran sohbet kanalı.`,alternates:{canonical:(process.env.SITE_ORIGIN??'https://fans.wai.com.tr')+'/'+artist},openGraph:{title:`${name} fan topluluğu | ${siteConfig.name}`,url:(process.env.SITE_ORIGIN??'https://fans.wai.com.tr')+'/'+artist}}}
export default async function Page({params}:{params:Promise<{artist:string}>}){const {artist}=await params;if(!validArtist(artist))notFound();const [content,entries]=await Promise.all([artistContent(artist),publishedEntries(artist)]);return <FansApp key={artist} initialArtist={artist} content={content} entries={entries} today={todayTR()}/>}
