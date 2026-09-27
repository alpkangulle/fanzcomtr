import type {NextConfig} from 'next';

const publicDomain=process.env.SITE_ORIGIN==='https://fanz.com.tr';
const config:NextConfig={
 poweredByHeader:false,
 async rewrites(){return {beforeFiles:[{source:'/images/:path*',destination:'/seo-image/:path*'}]};},
 serverExternalPackages:['node:sqlite'],
 async headers(){return [{source:'/:path*',headers:[
  ...(!publicDomain?[{key:'X-Robots-Tag',value:'noindex, nofollow'}]:[]),
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}
 ]}]}
};
export default function nextConfig(phase:string){
 if(phase==='phase-production-build'&&!process.env.SITE_ORIGIN)throw new Error('SITE_ORIGIN must be explicitly set before building. Production: https://fanz.com.tr');
 return config;
}
