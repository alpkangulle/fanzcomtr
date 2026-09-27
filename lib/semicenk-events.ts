import type {Entry} from './entries-types';
export function isCancelled(e:Pick<Entry,'artist'|'id'>){return e.artist==='semicenk'&&e.id==='semicenk-concert-2026-09-27-oberhausen';}
export function eventCountry(e:Pick<Entry,'artist'|'id'>){return isCancelled(e)?'DE':'TR';}
export function eventTimeZone(e:Pick<Entry,'artist'|'id'>){return eventCountry(e)==='DE'?'+02:00':'+03:00';}
