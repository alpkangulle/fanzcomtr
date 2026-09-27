import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
export function triggerSeoCheck(){
 if(process.env.SEO_AUTOMATION_DISABLED==='1')return;
 const child=spawn(process.execPath,[resolve('deploy/seo-worker.mjs')],{cwd:process.cwd(),env:process.env,stdio:'ignore',detached:true});
 child.on('error',()=>{});child.unref();
}
