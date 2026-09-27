import {channelDb} from './channel-db';
import {validArtist,sections} from './site-config';
import {getSong} from './songs';
export async function validTarget(t:string){
 if(t.length>220)return false;
 const song=t.match(/^song:([a-z0-9-]+):([a-z0-9-]+)$/);if(song)return validArtist(song[1])&&!!(await getSong(song[1],song[2]));
 const section=t.match(/^section:([a-z0-9-]+):([a-z0-9-]+)$/);if(section)return validArtist(section[1])&&(section[2]==='sarkilar'||sections.some(s=>s.slug===section[2]));
 const artist=t.match(/^artist:([a-z0-9-]+)$/);if(artist)return validArtist(artist[1]);
 const entry=t.match(/^entry:([a-z0-9-]+)$/);if(entry)return !!(await channelDb().prepare("SELECT id FROM artist_entries WHERE id=? AND status='published'").bind(entry[1]).first());
 return false;
}
