import type {NextConfig} from 'next';

const publicDomain=process.env.SITE_ORIGIN==='https://fanz.com.tr';
const config:NextConfig={
 poweredByHeader:false,
 serverExternalPackages:['node:sqlite'],
 async headers(){return [{source:'/:path*',headers:[
  ...(!publicDomain?[{key:'X-Robots-Tag',value:'noindex, nofollow'}]:[]),
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}
 ]}]}
};
export default config;
