import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {chromium} from '/home/deploy/fans/qa/node_modules/playwright-core/index.mjs';
if(process.env.CONTENT_TEST_ONLY!=='1')throw Error('Run only against an isolated QA database');
const base='http://127.0.0.1:3043';
const browser=await chromium.launch({executablePath:'/home/deploy/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox'],env:{...process.env,LD_LIBRARY_PATH:'/home/deploy/fans/qa/browser-libs/extracted/usr/lib/x86_64-linux-gnu'}});
const context=await browser.newContext(),page=await context.newPage();
const xml=await (await fetch(base+'/sitemap.xml')).text();
const paths=[...new Set([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname).concat(['/akis','/profil','/sohbetler',...['semicenk','tarkan','mabel-matiz','manifest','sezen-aksu','duman','hadise','ceza'].flatMap(a=>['','/biyografi','/galeri','/haberler','/konserler','/albumler','/sarkilar'].map(s=>'/'+a+s))]))];
const auditedPaths=process.env.QA_TARGETED==='1'?['/profil','/sohbetler','/manifest','/semicenk/biyografi']:paths;
const errors=[],checks=[];
page.on('pageerror',e=>errors.push(String(e)));
for(const width of [1440,390]){
 await page.setViewportSize({width,height:900});
 for(const path of auditedPaths){
  const r=await page.goto(base+path,{waitUntil:'domcontentloaded'});await page.locator('main').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{const hero=document.querySelector('.artist-cover'),img=hero?.querySelector('img'),nav=document.querySelector('.artist-navigation'),article=document.querySelector('.artist-content,.entries-section,.entry-detail');return {overflow:document.documentElement.scrollWidth>innerWidth+2,hero:hero?.getBoundingClientRect().height,img:img?.getBoundingClientRect().height,nav:nav?.getBoundingClientRect().bottom,article:article?.getBoundingClientRect().top,h1:document.querySelectorAll('h1').length}});
  const bad=[];if(r.status()!==200)bad.push('http '+r.status());if(result.overflow)bad.push('horizontal overflow');if(result.h1!==1)bad.push('h1 '+result.h1);if(width>700&&result.img&&Math.abs(result.hero-result.img)>3)bad.push('cover height');if(width>700&&result.nav&&result.article&&result.nav>result.article+2)bad.push('navigation overlap');
  if(bad.length)checks.push({width,path,bad,result});
 }
 console.log('AUDIT',width,auditedPaths.length,'pages, issues',checks.length);
 await page.goto(base+'/manifest',{waitUntil:'domcontentloaded'});await page.screenshot({path:'.data/manifest-'+width+'.png',fullPage:false});
 await page.goto(base+'/semicenk/biyografi',{waitUntil:'domcontentloaded'});await page.locator('.artist-content').scrollIntoViewIfNeeded();await page.screenshot({path:'.data/bio-'+width+'.png'});
 await page.goto(base+'/sohbetler',{waitUntil:'domcontentloaded'});await page.locator('.channel-open').first().waitFor();assert.equal(await page.locator('.channel-open').count(),8);assert.equal(await page.locator('nav a[href="/takip"]').count(),0);
 await page.screenshot({path:'.data/lobby-'+width+'.png'});
 await page.getByRole('button',{name:'Manifest sohbetini aç',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();
 const rect=await dialog.boundingBox();assert.equal(Math.round(rect.width),width);assert.equal(Math.round(rect.height),900);
 const input=page.getByRole('textbox',{name:'Kanala mesaj yaz'});await input.fill('Gönderilmeyen test taslağı');await page.screenshot({path:'.data/chat-'+width+'.png'});
 assert.equal(await page.locator('.lobby-channel-dialog .chat-expanded').count(),0);
 await page.getByRole('button',{name:'Sohbeti küçült',exact:true}).click();await dialog.waitFor({state:'hidden'});await page.getByRole('button',{name:/Manifest sohbetine dön/}).click();await dialog.waitFor();await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
}
await page.goto(base+'/sohbetler?kanal=tarkan',{waitUntil:'domcontentloaded'});await page.getByRole('dialog').waitFor();assert.match(await page.getByRole('dialog').innerText(),/Tarkan/);await page.keyboard.press('Escape');
await page.goto(base+'/manifest',{waitUntil:'domcontentloaded'});
await page.evaluate(async()=>{await fetch('/api/follows',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'sync',artists:['manifest']})});localStorage.setItem('fans.followed.v1',JSON.stringify(['manifest']))});
await page.goto(base+'/profil',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Manifest takibini bırak',exact:true}).click();await page.getByRole('button',{name:'Manifest takibini bırak',exact:true}).waitFor({state:'hidden'});
await page.goto(base+'/manifest',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Takip et',exact:true}).first().waitFor();
const ids=await page.evaluate(async()=> (await (await fetch('/api/follows')).json()).followed);assert(!ids.includes('manifest'));
const remove=await context.request.post(base+'/api/follows',{headers:{origin:base},data:{action:'remove',artist:'manifest'}});assert.equal(remove.status(),200);assert(!(await remove.json()).followed.includes('manifest'));
await page.goto(base+'/takip',{waitUntil:'domcontentloaded'});assert(page.url().includes('/profil'));
const data=await (await fetch(base+'/api/channels')).json();assert.equal(data.channels.length,8);for(let i=1;i<data.channels.length;i++){const a=data.channels[i-1],b=data.channels[i];assert(a.participants>b.participants||a.participants===b.participants&&(a.messages>b.messages||a.messages===b.messages&&a.online>=b.online))}
writeFileSync('.data/site-chat-audit.json',JSON.stringify({paths:auditedPaths.length,viewports:[1440,390],issues:checks,errors,ranking:data.channels},null,2));console.log('RESULT',JSON.stringify({paths:auditedPaths.length,issues:checks,errors}));
await browser.close();assert.equal(checks.length,0);assert.equal(errors.length,0);
