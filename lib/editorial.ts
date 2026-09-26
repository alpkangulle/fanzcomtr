import {channelDb} from './channel-db';
export async function artistContent(artist:string){try{return await channelDb().prepare('SELECT biography,sources,revision FROM artist_content WHERE artist=?').bind(artist).first<{biography:string;sources:string;revision:number}>()}catch(e){console.error('Editorial content unavailable',e);return null}}
