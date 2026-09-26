import {createHmac,scryptSync,timingSafeEqual,randomBytes} from 'node:crypto';
const COOKIE='fans_admin';
export function adminSession(request:Request):boolean{
 const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)return false;
 const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token)return false;
 const parts=token.split('.');if(parts.length!==3)return false;const [expires,nonce,mac]=parts;if(!/^\d+$/.test(expires)||Number(expires)<Date.now()||Number(expires)>Date.now()+9*3600000||!/^[-a-f0-9]+$/.test(nonce))return false;
 const expected=createHmac('sha256',secret).update(expires+'.'+nonce).digest('hex');return mac.length===expected.length&&timingSafeEqual(Buffer.from(mac),Buffer.from(expected));
}
export function validPassword(password:string){const stored=process.env.ADMIN_PASSWORD_HASH??'';const [salt,hash]=stored.split(':');if(!salt||!hash||password.length>256)return false;const actual=scryptSync(password,salt,64).toString('hex');return actual.length===hash.length&&timingSafeEqual(Buffer.from(actual),Buffer.from(hash))}
export function sessionCookie(){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)throw new Error('Admin not configured');const payload=(Date.now()+8*3600000)+'.'+randomBytes(16).toString('hex');const signature=createHmac('sha256',secret).update(payload).digest('hex');return `${COOKIE}=${payload}.${signature}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.SITE_ORIGIN?.startsWith('https:')?'; Secure':''}`}
export function sameOrigin(request:Request){const expected=process.env.SITE_ORIGIN??new URL(request.url).origin;return request.headers.get('origin')===expected}
