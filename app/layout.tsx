import type {Metadata,Viewport} from 'next';
import './globals.css';
import {siteOrigin,siteName,socialMetadata} from '@/lib/seo';
import SiteHeader from '@/components/site-header';
import AnnouncementBar from '@/components/announcement-bar';
export const metadata:Metadata={metadataBase:new URL(siteOrigin),title:{default:'Sanatçı Fan Toplulukları, Haberler ve Konserler | '+siteName,template:'%s | '+siteName},description:'Sanatçı fan topluluklarını keşfet; güncel haberleri, konserleri, albümleri ve şarkıları incele. Hayranlarla sanatçı sohbet kanallarında buluş.',robots:{index:true,follow:true},icons:{icon:'/favicon.svg'},...socialMetadata('Sanatçı Fan Toplulukları, Haberler ve Konserler','Sanatçı haberlerini, konserleri, albümleri ve fan topluluklarını keşfet.','/')};
export const viewport:Viewport={width:'device-width',initialScale:1,interactiveWidget:'resizes-content',themeColor:'#09090b'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body><SiteHeader/><AnnouncementBar/>{children}</body></html>}
