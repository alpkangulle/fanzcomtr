import {readFileSync,existsSync,statSync,realpathSync} from 'node:fs';
import {readFile,writeFile,mkdir,rename,unlink} from 'node:fs/promises';
import {join,resolve,dirname,sep,extname} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {openSeo,readConfig,dbFile} from '@/lib/seo-control.mjs';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const pending=new Map<string,Promise<Buffer>>();
const versions=new Map<string,string>();
export async function GET(request:Request,{params}:{params:Promise<{path:string[]}>}){
 const {path}=await params;
 if(path.some(p=>p==='.'||p==='..'||p.includes('\\')||p.includes('/')))return new Response(null,{status:404});
 const root=resolve('public/images'),source=resolve(root,...path);
 if(!source.startsWith(root+sep)||!existsSync(source)||!realpathSync(source).startsWith(realpathSync(root)+sep)||!statSync(source).isFile())return new Response(null,{status:404});
 const mime:Record<string,string>={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.gif':'image/gif'};
 let contentType=mime[extname(source).toLowerCase()];if(!contentType)return new Response(null,{status:404});
 const stat=statSync(source),signature=source+':'+stat.size+':'+stat.mtimeMs;
 let digest=versions.get(signature);
 if(!digest){digest=createHash('sha256').update(readFileSync(source)).digest('hex');if(versions.size>500)versions.clear();versions.set(signature,digest)}
 const db=openSeo();let enabled=false,quality=78;try{const config=readConfig(db);enabled=!!config.imageEnabled;quality=Math.min(95,Math.max(50,Number(config.imageQuality)||78))}finally{db.close()}
 const optimize=enabled&&request.headers.get('accept')?.includes('image/webp')&&['.png','.jpg','.jpeg','.webp'].includes(extname(source).toLowerCase());
 const requested=Number(new URL(request.url).searchParams.get('w')),width=[160,320,640,960,1280].includes(requested)?requested:1280;
 const key=digest+(optimize?'-w'+width+'-webp'+quality+'-v1':'-original'),etag='"'+key+'"';
 const headers={'Content-Type':optimize?'image/webp':contentType,'Vary':'Accept','Cache-Control':'public, max-age=3600, stale-while-revalidate=86400','ETag':etag,'X-Content-Type-Options':'nosniff'};
 if(request.headers.get('if-none-match')?.split(',').map(v=>v.trim()).includes(etag))return new Response(null,{status:304,headers});
 if(!optimize)return new Response(readFileSync(source),{headers});
 const folder=join(dirname(dbFile()),'seo-images-v2'),cached=join(folder,key+'.webp');
 try{
 let task=pending.get(key);
 if(!task){task=(async()=>{try{return await readFile(cached)}catch{}const data=await sharp(source).rotate().resize({width,withoutEnlargement:true}).webp({quality}).toBuffer();await mkdir(folder,{recursive:true});const temp=cached+'.'+randomUUID()+'.tmp';try{await writeFile(temp,data,{flag:'wx'});await rename(temp,cached)}finally{await unlink(temp).catch(()=>{})}return data})();pending.set(key,task)}
 try{return new Response(new Uint8Array(await task),{headers})}finally{pending.delete(key)}
 }catch{return new Response(readFileSync(source),{headers:{...headers,'Content-Type':contentType,'Cache-Control':'no-store','ETag':'"'+digest+'-original"'}})}
}
