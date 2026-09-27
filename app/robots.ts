import type {MetadataRoute} from 'next';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots{const origin=process.env.SITE_ORIGIN??'https://fanz.com.tr';return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin/']},sitemap:origin+'/sitemap.xml',host:origin}}
