import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateKeyPairSync} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {runWorker} from '../deploy/seo-worker.mjs';
import {safeUrls,openSeo,readConfig,saveConfig,saveCredentials,configStatus,credentialsPath} from '../lib/seo-control.mjs';
test('SEO queue: filtering, providers, quota, retries, removals, locking and secret storage',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'fanz-seo-test-'));process.env.DATABASE_PATH=join(directory,'test.sqlite');process.env.SITE_ORIGIN='https://fanz.com.tr';
 const db=new DatabaseSync(process.env.DATABASE_PATH);db.exec(readFileSync(new URL('../deploy/migrations/012_seo_control.sql',import.meta.url),'utf8'));db.close();
 try{
 const key=generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}}).privateKey;
 saveCredentials({type:'service_account',client_email:'test@test.iam.gserviceaccount.com',private_key:key});
 assert.equal(statSync(credentialsPath()).mode&0o777,0o600);
 assert.ok(!JSON.stringify(configStatus()).includes(key));
 let c=configStatus().config;saveConfig({...c,dailyLimit:1});assert.throws(()=>saveConfig({...c,dailyLimit:2}),/başka oturum/);
 assert.throws(()=>saveConfig({...configStatus().config,dailyLimit:NaN}));
 const origin='https://fanz.com.tr';let paths=['/semicenk','/tarkan'];let fail=false;const calls=[];
 const xml=()=>'<urlset>'+paths.map(p=>'<url><loc>'+origin+p+'</loc><lastmod>2026-09-27</lastmod></url>').join('')+'<url><loc>https://evil.example/x</loc></url><url><loc>'+origin+'/admin</loc></url></urlset>';
 assert.equal(safeUrls(xml(),origin).length,2);
 const transport=async(url,options={})=>{
 calls.push({url,body:options.body});
 if(url.endsWith('/sitemap.xml')&&!url.includes('googleapis.com'))return new Response(xml());
 if(url.endsWith('/indexnow.txt'))return new Response(configStatus().config.indexNowKey);
 if(url.includes('oauth2.googleapis.com'))return Response.json({access_token:'test-only-token'});
 if(url==='https://api.indexnow.org/indexnow')return new Response('',{status:fail?429:202});
 return new Response('',{status:200});
 };
 let result=await runWorker({transport});assert.equal(result.sent,3);
 assert.equal(configStatus().queue.filter(r=>r.status==='accepted').length,3);
 const before=calls.filter(r=>r.url.includes('urlNotifications')).length;
 await runWorker({transport});assert.equal(calls.filter(r=>r.url.includes('urlNotifications')).length,before);
 let connection=openSeo();connection.prepare('DELETE FROM seo_daily').run();connection.close();
 await runWorker({transport});assert.equal(configStatus().queue.filter(r=>r.status==='accepted').length,5);
 paths=['/semicenk'];connection=openSeo();connection.prepare('DELETE FROM seo_daily').run();connection.close();
 await runWorker({transport});assert.ok(calls.some(c=>typeof c.body==='string'&&c.body.includes('URL_DELETED')));
 connection=openSeo();connection.prepare('DELETE FROM seo_daily').run();connection.prepare("UPDATE seo_queue SET status='pending',next_attempt=0 WHERE provider='indexnow'").run();connection.close();
 fail=true;await runWorker({transport});assert.ok(configStatus().queue.some(r=>r.http_status===429&&r.status==='error'));
 connection=openSeo();connection.prepare('UPDATE seo_worker SET lease_until=?').run(Date.now()+10000);connection.close();assert.deepEqual(await runWorker({transport}),{busy:true});
 connection=openSeo();connection.prepare('UPDATE seo_worker SET lease_until=0').run();connection.close();
 const count=configStatus().queue.length;await runWorker({transport,dryRun:true});assert.equal(configStatus().queue.length,count);
 }finally{rmSync(directory,{recursive:true,force:true})}
});
