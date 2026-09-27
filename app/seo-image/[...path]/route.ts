import {readFileSync,existsSync,statSync,realpathSync} from 'node:fs';
import {join,resolve,dirname,sep,extname} from 'node:path';
import {openSeo,readConfig,dbFile} from '@/lib/seo-control.mjs';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(request:Request,{params}:{params:Promise<{path:string[]}>}){
 const {path}=await params;
 if(path.some(p=>p==='.'||p==='..'||p.includes('\\')||p.includes('/')))return new Response(null,{status:404});
 const root=resolve('public/images'),source=resolve(root,...path);
 if(!source.startsWith(root+sep)||!existsSync(source)||!realpathSync(source).startsWith(realpathSync(root)+sep))return new Response(null,{status:404});
 const mime:Record<string,string>={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.gif':'image/gif'};
 const type=mime[extname(source).toLowerCase()];if(!type)return new Response(null,{status:404});
 let file=source,contentType=type;
 const db=openSeo();try{
 const c=readConfig(db),folder=join(dirname(dbFile()),'seo-webp'),manifest=join(folder,'manifest.json');
 if(c.imageEnabled&&request.headers.get('accept')?.includes('image/webp')&&existsSync(manifest)){
 const item=JSON.parse(readFileSync(manifest,'utf8'))[path.join('/')],stat=statSync(source);
 if(item&&/^[a-f0-9]{64}$/.test(item.key)&&item.size===stat.size&&item.mtime===stat.mtimeMs&&existsSync(join(folder,item.key+'.webp'))){file=join(folder,item.key+'.webp');contentType='image/webp'}
 }
 }finally{db.close()}
 return new Response(readFileSync(file),{headers:{'Content-Type':contentType,'Vary':'Accept','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
}
