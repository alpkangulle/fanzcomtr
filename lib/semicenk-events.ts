import type {Entry} from './entries-types';
export function isCancelled(e:Entry){return e.event_status==='cancelled';}
export function isPostponed(e:Entry){return e.event_status==='postponed';}
export function isUnavailable(e:Entry){return isCancelled(e)||isPostponed(e);}
export function eventCountry(e:Entry){return e.event_country||'TR';}
export function eventTimeZone(e:Entry){
 const zone=e.event_timezone||'Europe/Istanbul';
 const local=Date.parse(e.date+'T'+(e.time||'12:00')+':00Z');
 const formatter=new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:'longOffset'});
 const at=(instant:number)=>formatter.formatToParts(new Date(instant)).find(x=>x.type==='timeZoneName')?.value.replace('GMT','')||'+00:00';
 let offset=at(local);
 for(let i=0;i<3;i++){
  const sign=offset[0]==='-'?-1:1,minutes=sign*(Number(offset.slice(1,3))*60+Number(offset.slice(4,6)));
  const next=at(local-minutes*60000);if(next===offset)break;offset=next;
 }
 return offset;
}
export function eventStatusSchema(e:Entry){return 'https://schema.org/'+({scheduled:'EventScheduled',cancelled:'EventCancelled',postponed:'EventPostponed',rescheduled:'EventRescheduled'}[e.event_status||'scheduled']);}
export function eventTimeLabel(e:Entry){return e.event_timezone==='Europe/Istanbul'||!e.event_timezone?'Türkiye saati':e.event_timezone;}
