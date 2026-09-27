#!/usr/bin/env node
import sharp from 'sharp';
import {existsSync,readdirSync,readFileSync,writeFileSync,mkdirSync,renameSync,statSync} from 'node:fs';
import {join,relative,resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {openSeo,readConfig,dbFile} from '../lib/seo-control.mjs';
export function imageKey(bytes,quality){return createHash('sha256').update(bytes).update(String(quality)).digest('hex')}
export async function optimizeImages(only=''){
 const db=openSeo(),now=Date.now();
 if(!db.prepare('UPDATE seo_image_state SET lease_until=? WHERE id=1 AND lease_until<?').run(now+900000,now).changes){db.close();return {busy:true}}
 let summary='',count=0,saved=0;try{
 const config=readConfig(db),root=resolve('public/images'),target=join(dirname(dbFile()),'seo-webp');mkdirSync(target,{recursive:true,mode:0o700});
 const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):e.isFile()&&/\.(jpe?g|png)$/i.test(e.name)?[join(p,e.name)]:[]);
 const manifestFile=join(target,'manifest.json');
 const manifest=existsSync(manifestFile)?JSON.parse(readFileSync(manifestFile,'utf8')):{};

 for(const path of walk(root)){
  if(only&&relative(root,path)!==only)continue;
  if(Date.now()-now>600000)throw new Error('Görsel işlemi süre sınırına ulaştı; tekrar çalıştır.');
  if(statSync(path).size>20000000)continue;
  const bytes=readFileSync(path),meta=await sharp(bytes,{limitInputPixels:40000000}).metadata();
  if((meta.pages||1)>1)continue;
  const key=imageKey(bytes,config.imageQuality);
  const existing=manifest[relative(root,path)];
  if(existing?.key===key&&existing.mtime===statSync(path).mtimeMs&&existsSync(join(target,key+'.webp'))){count++;saved+=existing.original-existing.optimized;continue}
  const output=await sharp(bytes,{limitInputPixels:40000000}).rotate().webp({quality:config.imageQuality,effort:4}).toBuffer();
  if(output.length>=bytes.length){delete manifest[relative(root,path)];continue;}
  const dest=join(target,key+'.webp');writeFileSync(dest+'.tmp',output,{mode:0o600});renameSync(dest+'.tmp',dest);
  manifest[relative(root,path)]={key,size:bytes.length,mtime:statSync(path).mtimeMs,original:bytes.length,optimized:output.length};
  count++;saved+=bytes.length-output.length;
 }
 const file=join(target,'manifest.json');writeFileSync(file+'.tmp',JSON.stringify(manifest),{mode:0o600});renameSync(file+'.tmp',file);
 summary=JSON.stringify({images:count,bytesSaved:saved});return {images:count,bytesSaved:saved};
 }catch(e){summary='Hata: '+e.message;throw e}finally{db.prepare('UPDATE seo_image_state SET lease_until=0,last_run=?,last_message=? WHERE id=1').run(Date.now(),summary);db.close()}
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href)optimizeImages(process.argv[2]||'').then(r=>console.log(JSON.stringify(r))).catch(e=>{console.error(e.message);process.exitCode=1});
