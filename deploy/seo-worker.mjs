#!/usr/bin/env node
import {optimizeImages} from './optimize-seo-images.mjs';
import {createSign,createHash} from 'node:crypto';
import {readFileSync,existsSync,realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {openSeo,readConfig,credentialsPath,safeUrls,trDay} from '../lib/seo-control.mjs';
export async function runWorker({transport=fetch,dryRun=false,origin=(process.env.SITE_ORIGIN||'https://fanz.com.tr').replace(/\/$/,'')}={}){
 const db=openSeo(),start=Date.now();
 const lease=db.prepare('UPDATE seo_worker SET lease_until=? WHERE id=1 AND lease_until<?').run(start+600000,start);
 if(!lease.changes){db.close();return {busy:true}}
 let summary='';const report={queued:0,sent:0,errors:0};
 const request=(url,options={})=>transport(url,{...options,signal:AbortSignal.timeout(20000),redirect:'error'});
 const transaction=fn=>{db.exec('BEGIN IMMEDIATE');try{const r=fn();db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}};
 function enqueue(provider,url,fingerprint){
  db.prepare("INSERT INTO seo_queue(provider,url,fingerprint,updated) VALUES(?,?,?,?) ON CONFLICT(provider,url) DO UPDATE SET fingerprint=excluded.fingerprint,status='pending',attempts=0,next_attempt=0,message='',updated=excluded.updated WHERE seo_queue.fingerprint<>excluded.fingerprint").run(provider,url,fingerprint,Date.now());
 }
 async function token(scopes){
  if(!existsSync(credentialsPath()))throw new Error('Google servis hesabı yüklenmedi.');
  const c=JSON.parse(readFileSync(credentialsPath(),'utf8')),now=Math.floor(Date.now()/1000),encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  const body=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:c.client_email,scope:scopes.join(' '),aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const s=createSign('RSA-SHA256');s.update(body);s.end();
  const response=await request('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:body+'.'+s.sign(c.private_key,'base64url')})});
  const data=await response.json();if(!response.ok||typeof data.access_token!=='string')throw new Error('Google yetkilendirme başarısız: HTTP '+response.status);return data.access_token;
 }
 try{
  const config=readConfig(db),sitemap=origin+'/sitemap.xml';
  const result=await request(sitemap);if(!result.ok)throw new Error('Site haritası HTTP '+result.status);
  const xml=await result.text();if(xml.length>10000000)throw new Error('Site haritası çok büyük.');
  const urls=safeUrls(xml,origin);if(!urls.length)throw new Error('Site haritasında yayın URL’si yok.');
  if(dryRun){summary=JSON.stringify({dryRun:true,urls:urls.length});return {dryRun:true,urls:urls.length}}
  const providers=[];if(config.indexNowEnabled)providers.push('indexnow');if(config.googleIndexingEnabled)providers.push('google');
  transaction(()=>{
   for(const provider of providers){
    for(const row of urls)enqueue(provider,row.url,row.modified||'published');
    const current=new Set(urls.map(r=>r.url));
    for(const old of db.prepare('SELECT url,fingerprint FROM seo_queue WHERE provider=?').all(provider))if(!current.has(old.url)&&old.fingerprint!=='removed')enqueue(provider,old.url,'removed');
   }
   if(config.googleEnabled)enqueue('sitemap',sitemap,createHash('sha256').update(config.property+'\n'+xml).digest('hex'));
  });
  report.queued=db.prepare("SELECT COUNT(*) AS n FROM seo_queue WHERE status IN ('pending','error')").get().n;
  let accessToken=null,googleProblem='';
  if(config.googleEnabled||config.googleIndexingEnabled){try{accessToken=await token(['https://www.googleapis.com/auth/webmasters','https://www.googleapis.com/auth/indexing'])}catch(e){googleProblem=e.message}}
  let indexKeyProblem='';
  if(config.indexNowEnabled){try{const key=await request(origin+'/indexnow.txt');if(!key.ok||(await key.text()).trim()!==config.indexNowKey)indexKeyProblem='IndexNow doğrulama dosyası eşleşmiyor.'}catch{indexKeyProblem='IndexNow doğrulama dosyasına erişilemedi.'}}
  for(const provider of [...providers,...(config.googleEnabled?['sitemap']:[])]){
   const rows=db.prepare("SELECT * FROM seo_queue WHERE provider=? AND status IN ('pending','error') AND next_attempt<=? ORDER BY updated,url LIMIT 200").all(provider,Date.now());
   for(const row of rows){
    if(Date.now()-start>240000)break;
    const problem=provider==='indexnow'?indexKeyProblem:googleProblem;
    if(problem){db.prepare("UPDATE seo_queue SET status='error',message=?,next_attempt=?,updated=? WHERE provider=? AND url=?").run(problem,Date.now()+3600000,Date.now(),provider,row.url);report.errors++;continue}
    const allowed=transaction(()=>{const day=trDay();db.prepare('INSERT OR IGNORE INTO seo_daily(provider,day,attempts) VALUES(?,?,0)').run(provider,day);const r=db.prepare('UPDATE seo_daily SET attempts=attempts+1 WHERE provider=? AND day=? AND attempts<?').run(provider,day,provider==='sitemap'?20:config.dailyLimit);return !!r.changes});
    if(!allowed)break;
    let status=0,message='',ok=false;
    try{
     let response;
     if(provider==='indexnow')response=await request('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({host:new URL(origin).hostname,key:config.indexNowKey,keyLocation:origin+'/indexnow.txt',urlList:[row.url]})});
     else if(provider==='sitemap')response=await request('https://www.googleapis.com/webmasters/v3/sites/'+encodeURIComponent(config.property)+'/sitemaps/'+encodeURIComponent(sitemap),{method:'PUT',headers:{Authorization:'Bearer '+accessToken}});
     else response=await request('https://indexing.googleapis.com/v3/urlNotifications:publish',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify({url:row.url,type:row.fingerprint==='removed'?'URL_DELETED':'URL_UPDATED'})});
     status=response.status;ok=provider==='indexnow'?[200,202].includes(status):response.ok;
     message=ok?(status===202?'Alındı; anahtar doğrulaması bekleniyor.':'Bildirim kabul edildi; dizine alınma sonucu değildir.'):'Sağlayıcı HTTP '+status;
    }catch{message='Ağ bağlantısı veya zaman aşımı hatası.'}
    const next=ok?0:Date.now()+Math.min(86400000,60000*2**Math.min(row.attempts,10));
    db.prepare('UPDATE seo_queue SET status=?,attempts=attempts+1,http_status=?,message=?,next_attempt=?,updated=? WHERE provider=? AND url=? AND fingerprint=?').run(ok?'accepted':'error',status,message,next,Date.now(),provider,row.url,row.fingerprint);
    if(ok)report.sent++;else report.errors++;
    if([401,403,429].includes(status))break;
   }
  }
  if(config.imageEnabled)await optimizeImages();
  summary=JSON.stringify(report);return report;
 }catch(e){summary='Hata: '+e.message;throw e}
 finally{db.prepare('UPDATE seo_worker SET lease_until=0,last_run=?,last_message=? WHERE id=1').run(Date.now(),summary);db.close()}
}
if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url))runWorker({dryRun:process.argv.includes('--dry-run')}).then(r=>console.log(JSON.stringify(r))).catch(e=>{console.error(e.message);process.exitCode=1});
