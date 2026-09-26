import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
export const runtime='nodejs';export const dynamic='force-dynamic';
const root=()=>process.env.FANS_MEDIA_PATH??resolve(process.env.DATABASE_PATH?dirname(process.env.DATABASE_PATH):'.data','media');
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[a-f0-9-]{36}\.(jpg|mp4|webm)$/.test(id))return new Response(null,{status:404});
 const path=resolve(root(),id);let size:number;try{size=(await stat(path)).size}catch{return new Response(null,{status:404})}
 const mime=id.endsWith('.jpg')?'image/jpeg':id.endsWith('.mp4')?'video/mp4':'video/webm',range=req.headers.get('range');
 const headers={'Content-Type':mime,'Cache-Control':'public, max-age=31536000, immutable','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'};
 if(range){const match=range.match(/^bytes=(\d+)-(\d*)$/);if(!match)return new Response(null,{status:416});const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),size-1):size-1;if(start> end||start>=size)return new Response(null,{status:416});const data=await readFile(path);return new Response(data.subarray(start,end+1),{status:206,headers:{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1)}})}
 return new Response(await readFile(path),{headers:{...headers,'Content-Length':String(size)}});
}
