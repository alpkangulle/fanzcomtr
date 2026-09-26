import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{const origin=process.env.SITE_ORIGIN??'https://fans.wai.com.tr';return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin','/profil','/takip']},sitemap:origin+'/sitemap.xml',host:origin}}
