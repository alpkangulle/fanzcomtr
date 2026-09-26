import {artists} from './artists';
import {siteConfig} from './site-config';

export const siteOrigin=(process.env.SITE_ORIGIN??'https://fans.wai.com.tr').replace(/\/$/,'');
export const siteName='Fanz.com.tr';
export function absoluteUrl(path:string){return new URL(path,siteOrigin+'/').toString()}
export function artistName(id:string){return artists.find(a=>a.id===id)?.name??id}
export function titleWithSite(title:string){return `${title} | ${siteName}`}
export function socialMetadata(title:string,description:string,path:string,image?:string){
 const url=absoluteUrl(path);
 return {openGraph:{type:'website' as const,locale:'tr_TR',siteName:siteConfig.name,title:titleWithSite(title),description,url,images:image?[{url:absoluteUrl(image)}]:undefined},twitter:{card:'summary_large_image' as const,title:titleWithSite(title),description,images:image?[absoluteUrl(image)]:undefined}};
}
