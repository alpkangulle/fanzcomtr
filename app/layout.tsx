import type {Metadata,Viewport} from 'next';
import './globals.css';
import {siteConfig} from '@/lib/site-config';
export const metadata:Metadata={metadataBase:new URL(process.env.SITE_ORIGIN??'https://fans.wai.com.tr'),title:siteConfig.name+' — Senin müziğin. Senin topluluğun.',description:'Sevdiğin sanatçıları keşfet, fan topluluklarına katıl ve müziği paylaş.',robots:{index:true,follow:true},icons:{icon:'/favicon.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,interactiveWidget:'resizes-content',themeColor:'#09090b'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body>{children}</body></html>}
