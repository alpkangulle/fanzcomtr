import {triggerSeoCheck} from '@/lib/seo-trigger';
import {adminSession,sameOrigin} from '@/lib/admin-auth';
import {listSeoImages,configStatus,saveConfig,saveCredentials,resetErrors,clearOverrides} from '@/lib/seo-control.mjs';
import {previewTemplates,applyTemplates,seoSections} from '@/lib/seo-templates';
import sitemap from '@/app/sitemap';
import {artists} from '@/lib/artists';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(request:Request){
 if(!adminSession(request))return Response.json({error:'Yönetici girişi gerekli.'},{status:401});
 return Response.json({...configStatus(),images:listSeoImages(),artists:artists.map(a=>({id:a.id,name:a.name})),sections:seoSections,pages:(await sitemap()).map(p=>new URL(p.url).pathname)},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request){
 if(!adminSession(request))return Response.json({error:'Yönetici girişi gerekli.'},{status:401});
 if(!sameOrigin(request))return Response.json({error:'İstek kaynağı geçersiz.'},{status:403});
 const raw=await request.text();if(raw.length>32000)return new Response(null,{status:413});
 try{
 const d=JSON.parse(raw);
 if(d.action==='settings')saveConfig(d.config);
 else if(d.action==='credentials')saveCredentials(d.credentials);
 else if(d.action==='preview')return Response.json({preview:previewTemplates(d.template)});
 else if(d.action==='apply'){const applied=applyTemplates(d.template);triggerSeoCheck();return Response.json({applied});}
 else if(d.action==='restore'){const rows=previewTemplates(d.template);clearOverrides(rows.map(r=>r.path));}
 else if(d.action==='retry')resetErrors();
 else if(d.action==='run'||d.action==='optimize'){
 if(d.action==='optimize'&&d.image&&!listSeoImages().includes(d.image))throw new Error('Görsel bulunamadı.');
 const child=spawn(process.execPath,[resolve(d.action==='optimize'?'deploy/optimize-seo-images.mjs':'deploy/seo-worker.mjs'),...(d.action==='optimize'&&d.image?[d.image]:[])],{cwd:process.cwd(),env:process.env,stdio:'ignore',detached:true});child.on('error',()=>{});child.unref();
 return Response.json({message:'Görev başlatıldı. Biraz sonra durumu yenile.'},{status:202});
 }else return Response.json({error:'İşlem bulunamadı.'},{status:400});
 if(['settings','credentials','restore'].includes(d.action))triggerSeoCheck();
 return Response.json({ok:true});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'İşlem tamamlanamadı.'},{status:400})}
}
