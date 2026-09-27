#!/usr/bin/env node
// Submit the current sitemap and optionally notify Google about every public URL.
// A successful API response confirms receipt, not inclusion in Search results.
import {createSign} from 'node:crypto';
import {readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs';

const origin=(process.env.SITE_ORIGIN||'https://fanz.com.tr').replace(/\/$/,'');
const sitemapUrl=`${origin}/sitemap.xml`;
const keyFile=process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
const stateFile=process.env.GOOGLE_SUBMISSION_STATE||'.data/google-submissions.json';
const notifyAll=process.argv.includes('--notify-all');
const dryRun=process.argv.includes('--dry-run');
const force=process.argv.includes('--force');
const limit=Math.min(200,Math.max(1,Number(process.env.GOOGLE_INDEXING_DAILY_LIMIT||200)));
const day=new Date().toISOString().slice(0,10);
const state=existsSync(stateFile)?JSON.parse(readFileSync(stateFile,'utf8')):{day:'',dailyCount:0,sent:{}};
if(state.day!==day){state.day=day;state.dailyCount=0}
function persist(){const tmp=`${stateFile}.${process.pid}.tmp`;writeFileSync(tmp,JSON.stringify(state,null,2));renameSync(tmp,stateFile)}
function urlList(xml){return [...xml.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/g)].map(([,block])=>({url:block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.replace(/&amp;/g,'&'),modified:block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]||''})).filter(({url})=>{try{const parsed=new URL(url);return parsed.origin===origin&&parsed.protocol==='https:'}catch{return false}})}
const response=await fetch(sitemapUrl,{headers:{'User-Agent':'FanzSitemapSubmit/1.0'},signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error(`Sitemap HTTP ${response.status}`);
const urls=[...new Map(urlList(await response.text()).map(item=>[item.url,item])).values()];
if(!urls.length)throw new Error('Sitemap has no URLs');
console.log(JSON.stringify({sitemap:sitemapUrl,publicUrls:urls.length,notifyAll,dryRun}));
if(dryRun)process.exit(0);
if(!keyFile)throw new Error('GOOGLE_SERVICE_ACCOUNT_FILE is required');
const credentials=JSON.parse(readFileSync(keyFile,'utf8'));
if(credentials.type!=='service_account'||!credentials.client_email||!credentials.private_key)throw new Error('Invalid service account JSON');
const scopes=['https://www.googleapis.com/auth/webmasters'];
if(notifyAll)scopes.push('https://www.googleapis.com/auth/indexing');
const now=Math.floor(Date.now()/1000);
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const jwtBody=`${encode({alg:'RS256',typ:'JWT'})}.${encode({iss:credentials.client_email,scope:scopes.join(' '),aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})}`;
const signer=createSign('RSA-SHA256');signer.update(jwtBody);signer.end();
const assertion=`${jwtBody}.${signer.sign(credentials.private_key,'base64url')}`;
const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});
const token=await tokenResponse.json();
if(!tokenResponse.ok)throw new Error(`OAuth ${tokenResponse.status}: ${JSON.stringify(token)}`);
const headers={Authorization:`Bearer ${token.access_token}`};
const property=process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY||origin+'/';
const submitUrl=`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
const submit=await fetch(submitUrl,{method:'PUT',headers});
if(!submit.ok)throw new Error(`Search Console sitemap submit ${submit.status}: ${(await submit.text()).slice(0,500)}`);
console.log('Search Console sitemap submitted');
if(!notifyAll)process.exit(0);
let sent=0,failed=0;
for(const {url,modified} of urls){
 if(!force&&state.sent[url]?.modified===modified)continue;
 if(state.dailyCount>=limit){console.log(`Daily notification limit ${limit} reached`);break}
 const result=await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({url,type:'URL_UPDATED'})});
 const body=await result.text();
 if(result.ok){state.sent[url]={at:new Date().toISOString(),status:result.status,modified};state.dailyCount++;sent++;persist()}
 else {failed++;console.error(JSON.stringify({url,status:result.status,response:body.slice(0,400)}));if(result.status===429||result.status===403)break}
 }
console.log(JSON.stringify({notified:sent,failed,dailyTotal:state.dailyCount,remaining:urls.filter(({url,modified})=>state.sent[url]?.modified!==modified).length}));
if(failed)process.exitCode=1;
