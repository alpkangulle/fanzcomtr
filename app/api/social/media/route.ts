import {randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {memberSession} from '@/lib/member-auth';
import {sameOrigin} from '@/lib/admin-auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
const mediaRoot=()=>process.env.FANS_MEDIA_PATH??resolve(process.env.DATABASE_PATH?dirname(process.env.DATABASE_PATH):'.data','media');
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'İstek doğrulanamadı.'},{status:403});
 const member=await memberSession(req);if(!member)return Response.json({error:'Yüklemek için üye olmalısın.'},{status:401});
 if(Number(req.headers.get('content-length'))>20_000_000)return Response.json({error:'Dosya çok büyük.'},{status:413});
 let form:FormData;try{form=await req.formData()}catch{return Response.json({error:'Geçersiz dosya.'},{status:400})}
 const file=form.get('file');if(!(file instanceof File)||file.size===0||file.size>18_000_000)return Response.json({error:'Dosya en çok 18 MB olmalı.'},{status:413});
 const data=Buffer.from(await file.arrayBuffer());const photo=file.type==='image/jpeg'&&data[0]===0xff&&data[1]===0xd8&&data[2]===0xff;
 const mp4=file.type==='video/mp4'&&data.toString('ascii',4,8)==='ftyp';const webm=file.type==='video/webm'&&data.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
 if(!photo&&!mp4&&!webm)return Response.json({error:'JPEG fotoğraf veya MP4/WebM video yükle.'},{status:415});
 const id=randomUUID()+(photo?'.jpg':mp4?'.mp4':'.webm');await mkdir(mediaRoot(),{recursive:true,mode:0o700});await writeFile(resolve(mediaRoot(),id),data,{flag:'wx',mode:0o600});
 return Response.json({url:'/api/social/media/'+id,kind:photo?'photo':'video'},{status:201,headers:{'Cache-Control':'no-store'}});
}
