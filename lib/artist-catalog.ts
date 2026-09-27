import {channelDb} from './channel-db';
import type {ArtistCatalog,CatalogSong} from './artist-catalog-types';
export async function artistCatalog(artist:string):Promise<ArtistCatalog>{
 const db=channelDb();
 const [songs,releases,videos]=await Promise.all([
 db.prepare("SELECT slug,data,updated FROM artist_songs WHERE artist=? AND status='published'").bind(artist).all(),
 db.prepare("SELECT * FROM artist_entries WHERE artist=? AND kind='albumler' AND status='published'").bind(artist).all(),
 db.prepare("SELECT id,title,series,publisher,source,checked_at,updated FROM artist_live_videos WHERE artist=? AND status='published' ORDER BY position,id").bind(artist).all()]);
 return {songs:Object.fromEntries(songs.results.map(x=>[String(x.slug),{...JSON.parse(String(x.data)),slug:String(x.slug),updated:Number(x.updated)} as CatalogSong])),
 releases:releases.results.map(x=>({id:String(x.id),slug:String(x.slug),title:String(x.release_name||x.title),format:String(x.release_format||'Albüm'),date:String(x.date),cover:String(x.cover),url:String(x.url||x.source),artist:String(x.release_credits||artist),count:String(x.tracks).split('\n').filter(Boolean).length})),
 videos:videos.results as unknown as ArtistCatalog['videos'],
 updated:Math.max(0,...[...songs.results,...releases.results,...videos.results].map(x=>Number(x.updated)))};
}
