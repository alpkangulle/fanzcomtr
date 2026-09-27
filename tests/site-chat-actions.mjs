import assert from 'node:assert/strict';
import {chromium} from '/home/deploy/fans/qa/node_modules/playwright-core/index.mjs';
if(process.env.CONTENT_TEST_ONLY!=='1')throw Error('Isolated QA only');
const base='http://127.0.0.1:3043';
const browser=await chromium.launch({executablePath:'/home/deploy/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell',args:['--no-sandbox'],env:{...process.env,LD_LIBRARY_PATH:'/home/deploy/fans/qa/browser-libs/extracted/usr/lib/x86_64-linux-gnu'}});
const context=await browser.newContext({viewport:{width:390,height:844}}),other=await browser.newContext();
const suffix=Date.now().toString().slice(-9),username='qatarget'+suffix;
for(const [ctx,user] of [[other,username],[context,'qaviewer'+suffix]]){
 const r=await ctx.request.post(base+'/api/member/session',{headers:{origin:base},data:{action:'register',username:user,password:'QA-only-follow-2026!'}});assert.equal(r.status(),201,await r.text());
}
let r=await context.request.post(base+'/api/social/follow',{headers:{origin:base},data:{username}});assert.equal(r.status(),200);
const page=await context.newPage();await page.goto(base+'/profil',{waitUntil:'domcontentloaded'});
await page.getByRole('button',{name:username+' takibini bırak',exact:true}).click();await page.getByRole('button',{name:username+' takibini bırak',exact:true}).waitFor({state:'hidden'});
r=await context.request.post(base+'/api/social/follow',{headers:{origin:base},data:{action:'remove',username}});assert.equal(r.status(),200);r=await context.request.get(base+'/api/social/follow');assert(!(await r.json()).members.some(m=>m.username===username));
await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.qaShared=data}})});
await page.goto(base+'/sohbetler',{waitUntil:'domcontentloaded'});
await page.getByRole('button',{name:'Tarkan kanalını paylaş',exact:true}).click();
assert.match(await page.evaluate(()=>window.qaShared.url),/\/sohbetler\?kanal=tarkan$/);
await page.getByRole('button',{name:'Tarkan sohbetini aç',exact:true}).click();await page.getByRole('dialog').waitFor();
const grip=page.locator('.lobby-channel-toolbar');await grip.evaluate(el=>{el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:el,clientY:30})]}));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:el,clientY:150})]}))});await page.getByRole('dialog').waitFor({state:'hidden'});
assert.notEqual(await page.evaluate(()=>getComputedStyle(document.body).overflow),'hidden');
await page.getByRole('button',{name:/Tarkan sohbetine dön/}).click();await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'Sohbeti küçült',exact:true}).click();
console.log('PASS member follow removal, idempotent removal, artist invitation URL, swipe minimize, reopen, scroll restore');
await browser.close();
