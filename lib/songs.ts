import {channelDb} from './channel-db';
import {artists} from './artists';
import {songSlug} from './song-slug';
import catalog from './semicenk-catalog.json';
export type SongInfo={credits:string;duration:number;url:string;description:string;videoId:string|null;videoSource:string};
const pilotSongs:Record<string,SongInfo>=catalog.songs;
export type Song={artist:string;albumId:string;albumSlug:string;albumTitle:string;cover:string;date:string;name:string;slug:string;position:number;videoId:string|null;videoKind:'klip'|'resmi-kayit'|null;info?:SongInfo};
const videos:Record<string,{id:string;kind:'klip'|'resmi-kayit'}>={
 'mabel-matiz:muphem':{id:'C2tQrIHSXho',kind:'klip'},
 'manifest:ariyo':{id:'yQ9lXHfv9Yg',kind:'klip'},
 'duman:kufi':{id:'OtQyZyIqdXs',kind:'resmi-kayit'},
 'hadise:sifir-tolerans':{id:'sui9MKrDnQk',kind:'klip'},
 'sezen-aksu:linc':{id:'_8n6d76qods',kind:'klip'},
 'semicenk:batik-gemi':{id:'E7T5p2H_U_k',kind:'resmi-kayit'}
};

export async function allSongs(artist?:string):Promise<Song[]>{const rows=artist?await channelDb().prepare("SELECT id,artist,slug,title,cover,date,tracks FROM artist_entries WHERE kind='albumler' AND status='published' AND artist=?").bind(artist).all():await channelDb().prepare("SELECT id,artist,slug,title,cover,date,tracks FROM artist_entries WHERE kind='albumler' AND status='published'").all();const result:Song[]=[],used=new Map<string,number>();for(const r of [...rows.results.filter(r=>r.artist!=='semicenk'),...rows.results.filter(r=>r.artist==='semicenk').sort((a,b)=>String(a.date).localeCompare(String(b.date)))]){if(!artists.some(a=>a.id===r.artist))continue;for(const [i,raw] of String(r.tracks??'').split('\n').entries()){const name=raw.trim();if(!name)continue;const base=songSlug(name),key=String(r.artist)+':'+base,n=(used.get(key)??0)+1;if(r.artist==='semicenk'&&n>1)continue;used.set(key,n);const slug=n===1?base:base+'-'+n;const info=r.artist==='semicenk'?pilotSongs[base]:undefined;const video=info?.videoId?{id:info.videoId,kind:'resmi-kayit' as const}:videos[key];result.push({artist:String(r.artist),albumId:String(r.id),albumSlug:String(r.slug),albumTitle:String(r.title),cover:String(r.cover),date:String(r.date),name,slug,position:i+1,videoId:video?.id??null,videoKind:video?.kind??null,info})}}return result}
export async function getSong(artist:string,slug:string){return (await allSongs(artist)).find(s=>s.slug===slug)??null}
export function songHref(song:Song){return '/'+song.artist+'/sarkilar/'+song.slug}
