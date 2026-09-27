import {createHash,randomBytes} from 'node:crypto';
const COOKIE='fans_visitor';
export function visitorKey(req:Request){
 const token=req.headers.get('cookie')?.match(/(?:^|;\s*)fans_visitor=([a-f0-9]{64})(?:;|$)/)?.[1];
 return token?createHash('sha256').update(token).digest('hex'):null;
}
export function ensureVisitor(req:Request){
 const existing=visitorKey(req);if(existing)return {key:existing,cookie:undefined};
 const token=randomBytes(32).toString('hex');
 const cookie=COOKIE+'='+token+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000'+(process.env.SITE_ORIGIN?.startsWith('https:')||new URL(req.url).protocol==='https:'?'; Secure':'');
 return {key:createHash('sha256').update(token).digest('hex'),cookie};
}
