import {channelDb} from './channel-db';
import type {Entry,EntryKind} from './entries-types';
export async function publishedEntries(artist:string,kind?:EntryKind):Promise<Entry[]>{
 const query='SELECT * FROM artist_entries WHERE artist=? AND status=\'published\''+(kind?' AND kind=?':'')+' ORDER BY date DESC,updated DESC';
 const result=await channelDb().prepare(query).bind(...(kind?[artist,kind]:[artist])).all();
 return result.results as unknown as Entry[];
}
export async function publishedEntry(artist:string,kind:EntryKind,slug:string){return channelDb().prepare("SELECT * FROM artist_entries WHERE artist=? AND kind=? AND slug=? AND status='published'").bind(artist,kind,slug).first<Entry>()}
