import {DatabaseSync} from 'node:sqlite';
import {dirname,resolve,join} from 'node:path';
import {readdirSync,existsSync,writeFileSync,renameSync,unlinkSync} from 'node:fs';
import {randomBytes,createPrivateKey} from 'node:crypto';

export const dbFile=()=>process.env.DATABASE_PATH||resolve('.data/fans.sqlite');
export const credentialsPath=()=>join(dirname(dbFile()),'google-service-account.json');
export function openSeo(){const db=new DatabaseSync(dbFile());db.exec('PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON');return db}
export function readConfig(db){const r=db.prepare('SELECT * FROM seo_config WHERE id=1').get();return {...JSON.parse(r.value),revision:r.revision}}
export function configStatus(){
 const db=openSeo();try{
 const config=readConfig(db);
 return {config,googleCredentialPresent:existsSync(credentialsPath()),worker:db.prepare('SELECT lease_until,last_run,last_message FROM seo_worker WHERE id=1').get(),
 totals:db.prepare('SELECT provider,status,COUNT(*) AS count FROM seo_queue GROUP BY provider,status').all(),
 queue:db.prepare('SELECT provider,url,status,attempts,http_status,message,updated FROM seo_queue ORDER BY updated DESC LIMIT 100').all(),
 image:db.prepare('SELECT last_run,last_message,lease_until FROM seo_image_state WHERE id=1').get(),
 daily:db.prepare('SELECT * FROM seo_daily WHERE day=?').all(trDay()),
 overrides:db.prepare('SELECT * FROM seo_overrides ORDER BY path').all()};
 }finally{db.close()}
}
export function trDay(now=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
export function saveConfig(input){
 if(!Number.isInteger(input.revision)||!Number.isInteger(input.dailyLimit)||input.dailyLimit<1||input.dailyLimit>200)throw new Error('Günlük limit 1–200 arasında olmalı.');
 for(const field of ['indexNowEnabled','googleEnabled','googleIndexingEnabled'])if(typeof input[field]!=='boolean')throw new Error('Geçersiz seçenek.');
 const origin=(process.env.SITE_ORIGIN||'https://fanz.com.tr').replace(/\/$/,'');
 if(![origin+'/', 'sc-domain:'+new URL(origin).hostname].includes(input.property))throw new Error('Search Console mülkü bu siteye ait olmalı.');
 const db=openSeo();try{
 const previous=readConfig(db);
 if(typeof input.imageEnabled!=='boolean'||!Number.isInteger(input.imageQuality)||input.imageQuality<50||input.imageQuality>95)throw new Error('Görsel kalitesi 50–95 olmalı.');
 for(const key of ['phone','whatsapp'])if(typeof input[key]!=='string'||(input[key]&&!/^\+?[0-9]{7,15}$/.test(input[key])))throw new Error('Telefon numarası ülke koduyla rakamlardan oluşmalı.');
 if(!Array.isArray(input.boxes)||input.boxes.length>3||input.boxes.some(b=>typeof b.title!=='string'||typeof b.text!=='string'||typeof b.enabled!=='boolean'||b.title.length>80||b.text.length>300))throw new Error('En fazla üç geçerli iletişim kutusu ekle.');
 const value={imageEnabled:input.imageEnabled,imageQuality:input.imageQuality,phone:input.phone,whatsapp:input.whatsapp,phoneEnabled:!!input.phoneEnabled,whatsappEnabled:!!input.whatsappEnabled,boxes:input.boxes,indexNowEnabled:input.indexNowEnabled,googleEnabled:input.googleEnabled,googleIndexingEnabled:input.googleIndexingEnabled,dailyLimit:input.dailyLimit,property:input.property,indexNowKey:previous.indexNowKey||randomBytes(24).toString('hex')};
 const result=db.prepare('UPDATE seo_config SET value=?,revision=revision+1 WHERE id=1 AND revision=?').run(JSON.stringify(value),input.revision);
 if(!result.changes)throw new Error('Ayarlar başka oturumda değişti. Sayfayı yenile.');
 return {...value,revision:input.revision+1};
 }finally{db.close()}
}
export function saveCredentials(value){
 if(!value||value.type!=='service_account'||typeof value.client_email!=='string'||!/^.+@.+\.gserviceaccount\.com$/.test(value.client_email)||typeof value.private_key!=='string'||value.private_key.length>16000)throw new Error('Geçerli bir Google servis hesabı JSON dosyası seç.');
 try{const key=createPrivateKey(value.private_key);if(key.asymmetricKeyType!=='rsa')throw new Error()}catch{throw new Error('Servis hesabı özel anahtarı geçersiz.')}
 const dest=credentialsPath(),tmp=dest+'.'+randomBytes(8).toString('hex')+'.tmp';
 try{writeFileSync(tmp,JSON.stringify({type:'service_account',client_email:value.client_email,private_key:value.private_key}),{mode:0o600,flag:'wx'});renameSync(tmp,dest)}finally{if(existsSync(tmp))unlinkSync(tmp)}
}
export function readOverride(path){const db=openSeo();try{return db.prepare('SELECT title,description,intro,links FROM seo_overrides WHERE path=?').get(path)||null}finally{db.close()}}
export function saveOverrides(rows){
 if(!Array.isArray(rows)||!rows.length||rows.length>100)throw new Error('Geçersiz sayfa seçimi.');
 const db=openSeo();try{db.exec('BEGIN IMMEDIATE');for(const r of rows)db.prepare('INSERT INTO seo_overrides VALUES(?,?,?,?,?,?) ON CONFLICT(path) DO UPDATE SET title=excluded.title,description=excluded.description,intro=excluded.intro,links=excluded.links,updated=excluded.updated').run(r.path,r.title,r.description,r.intro||'',JSON.stringify(r.links||[]),Date.now());db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}finally{db.close()}
}
export function clearOverrides(paths){const db=openSeo();try{db.exec('BEGIN IMMEDIATE');for(const path of paths)db.prepare('DELETE FROM seo_overrides WHERE path=?').run(path);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}finally{db.close()}}
export function resetErrors(){const db=openSeo();try{db.prepare("UPDATE seo_queue SET status='pending',next_attempt=0 WHERE status='error'").run()}finally{db.close()}}
export function safeUrls(xml,origin){
 const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'");
 if(!xml.includes('<urlset'))throw new Error('URL site haritası bekleniyor.');
 const list=[...xml.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)].map(([,block])=>({url:decode(block.match(/<loc>([^<]+)<\/loc>/)?.[1]||''),modified:block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]||''})).filter(r=>{try{const u=new URL(r.url);return u.origin===origin&&u.protocol==='https:'&&!u.search&&!u.hash&&!/^\/(api|admin|profil|fanz|akis|takip)(\/|$)/.test(u.pathname)}catch{return false}});
 return [...new Map(list.map(r=>[r.url,r])).values()];
}

export function listSeoImages(){const walk=(folder,prefix='')=>readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(folder,e.name),prefix+e.name+'/'):e.isFile()&&/\.(png|jpe?g)$/i.test(e.name)?[prefix+e.name]:[]);return walk(resolve('public/images'))}
