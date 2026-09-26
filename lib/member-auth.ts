import {randomBytes,createHash,scryptSync,timingSafeEqual} from 'node:crypto';
import {channelDb} from './channel-db';
const COOKIE='fans_member';
const DAY=86400000;
export type Member={id:string;username:string};
function cookieToken(req:Request){return req.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)??''}
export async function memberSession(req:Request):Promise<Member|null>{
 const token=cookieToken(req);if(!/^[a-f0-9]{64}$/.test(token))return null;
 const hash=createHash('sha256').update(token).digest('hex');
 return channelDb().prepare('SELECT m.id,m.username FROM member_sessions s JOIN members m ON m.id=s.member_id WHERE s.token_hash=? AND s.expires>?').bind(hash,Date.now()).first<Member>();
}
export function passwordHash(password:string){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex')}
export function validHash(password:string,stored:string){const [salt,hash]=stored.split(':');if(!/^[a-f0-9]{32}$/.test(salt??'')||!/^[a-f0-9]{128}$/.test(hash??''))return false;const actual=scryptSync(password,salt,64);return timingSafeEqual(actual,Buffer.from(hash,'hex'))}
export async function newSession(memberId:string){const token=randomBytes(32).toString('hex');const now=Date.now();await channelDb().prepare('INSERT INTO member_sessions(token_hash,member_id,expires,created) VALUES(?,?,?,?)').bind(createHash('sha256').update(token).digest('hex'),memberId,now+30*DAY,now).run();return `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${30*86400}${process.env.SITE_ORIGIN?.startsWith('https:')?'; Secure':''}`}
export function clearSession(){return `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.SITE_ORIGIN?.startsWith('https:')?'; Secure':''}`}
export async function deleteSession(req:Request){const token=cookieToken(req);if(/^[a-f0-9]{64}$/.test(token))await channelDb().prepare('DELETE FROM member_sessions WHERE token_hash=?').bind(createHash('sha256').update(token).digest('hex')).run()}
export function memberName(name:string){const n=name.normalize('NFC').trim();return /^[\p{L}\p{N}_-]{3,24}$/u.test(n)?n:null}
