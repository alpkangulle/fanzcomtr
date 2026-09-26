import {validArtist} from './site-config';
import {isEntryKind,type Entry} from './entries-types';
const limits={title:160,summary:400,body:20000,city:100,venue:160,url:2000,source:2000,cover:2000,tracks:8000,time:5};
export function validateEntry(d:unknown):{data?:Omit<Entry,'id'|'updated'|'revision'>;error?:string}{
 if(!d||typeof d!=='object')return {error:'İçerik geçersiz.'};
 const v=d as Record<string,unknown>;
 if(typeof v.artist!=='string'||!validArtist(v.artist)||typeof v.kind!=='string'||!isEntryKind(v.kind))return {error:'Sanatçı veya bölüm geçersiz.'};
 for(const [key,max] of Object.entries(limits))if(typeof v[key]!=='string'||(v[key] as string).length>max)return {error:'Eksik veya çok uzun alan: '+key};
 const c=Object.fromEntries(Object.keys(limits).map(k=>[k,(v[k] as string).trim()])) as Record<keyof typeof limits,string>;
 if(!c.title)return {error:'Başlık gerekli.'};
 if(typeof v.slug!=='string'||! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug)||v.slug.length>100)return {error:'Adres yalnızca küçük harf, rakam ve tire içermeli.'};
 if(typeof v.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||!Number.isFinite(Date.parse(v.date))||new Date(v.date).toISOString().slice(0,10)!==v.date)return {error:'Geçerli bir tarih gir.'};
 if(!['draft','published','archived'].includes(String(v.status)))return {error:'Yayın durumu geçersiz.'};
 for(const key of ['url','source','cover'] as const){if(c[key])try{const u=new URL(c[key]);if(u.protocol!=='https:'||u.username||u.password)throw new Error()}catch{return {error:'Bağlantılar geçerli HTTPS adresleri olmalı.'}}}
 if(c.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(c.time))return {error:'Saat 00:00–23:59 aralığında olmalı.'};
 if(v.status==='published'){
  if(!c.source)return {error:'Yayınlamak için kaynak bağlantısı gerekli.'};
  if(v.kind==='haberler'&&!c.body)return {error:'Haber metni gerekli.'};
  if(v.kind==='konserler'&&(!c.city||!c.venue))return {error:'Konser için şehir ve mekân gerekli.'};
 }
 return {data:{...c,artist:v.artist,kind:v.kind,slug:v.slug,date:v.date,status:v.status as Entry['status']}};
}
