export const entryKinds=['haberler','konserler','albumler'] as const;
export type EntryKind=typeof entryKinds[number];
export const entryLabels:Record<EntryKind,string>={haberler:'Haberler',konserler:'Konserler',albumler:'Albümler'};
export type Entry={id:string;artist:string;kind:EntryKind;slug:string;title:string;summary:string;body:string;date:string;time:string;city:string;venue:string;url:string;source:string;cover:string;tracks:string;status:'draft'|'published'|'archived';event_status?:'scheduled'|'cancelled'|'postponed'|'rescheduled';event_country?:string;event_timezone?:string;previous_date?:string;release_name?:string;release_format?:string;release_credits?:string;seo_title?:string;seo_description?:string;revision:number;updated:number};
export function isEntryKind(value:string):value is EntryKind{return entryKinds.some(k=>k===value)}
export function todayTR(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
export function dateLabel(date:string){return new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))}
export function entryHref(entry:Entry){return '/'+entry.artist+'/'+entry.kind+'/'+entry.slug}
