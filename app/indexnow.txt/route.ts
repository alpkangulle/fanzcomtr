import {openSeo,readConfig} from '@/lib/seo-control.mjs';
export const dynamic='force-dynamic';
export async function GET(){const db=openSeo();try{const c=readConfig(db);if(!c.indexNowEnabled||!c.indexNowKey)return new Response(null,{status:404});return new Response(c.indexNowKey,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'}})}finally{db.close()}}
