import {artists} from './artists';
import {readOverride,saveOverrides} from './seo-control.mjs';
import {socialMetadata} from './seo';
export const seoSections=[{id:'',name:'Fan Topluluğu'},{id:'haberler',name:'Haberleri'},{id:'konserler',name:'Konserleri'},{id:'albumler',name:'Albümleri'},{id:'biyografi',name:'Biyografisi'},{id:'galeri',name:'Fotoğrafları'},{id:'sarkilar',name:'Şarkıları'}];
type Input={artistIds:string[];section:string;title:string;description:string;intro?:string;links?:string[]};
export function previewTemplates(input:Input){
 if(!input||!Array.isArray(input.artistIds)||!input.artistIds.length||input.artistIds.length>100||typeof input.title!=='string'||typeof input.description!=='string')throw new Error('Şablon ve sanatçı seçimi gerekli.');
 const section=seoSections.find(s=>s.id===input.section);if(!section)throw new Error('Bölüm geçersiz.');
 if(input.title.length>300||input.description.length>1000)throw new Error('Şablon çok uzun.');
 return [...new Set(input.artistIds)].map(id=>{
 const artist=artists.find(a=>a.id===id);if(!artist)throw new Error('Sanatçı bulunamadı.');
 const render=(s:string)=>s.replace(/\{sanatci\}/g,artist.name).replace(/\{bolum\}/g,section.name).replace(/\{site\}/g,'Fanz.com.tr').trim();
 if(input.intro!==undefined&&(typeof input.intro!=='string'||input.intro.length>12000))throw new Error('İçerik çok uzun.');
 const intro=render(input.intro||'');
 if(/[{}<>]/.test(intro))throw new Error('İçeriği düz metin ve desteklenen değişkenlerle yaz.');
 const links=input.links||[];
 if(!Array.isArray(links)||links.length>10||links.some(x=>typeof x!=='string'||!/^\/[a-z0-9/-]*$/.test(x)||x.startsWith('//')||/^\/(api|admin|profil|fanz|akis|takip)(\/|$)/.test(x)))throw new Error('En fazla 10 herkese açık site içi bağlantı seç.');
 const title=render(input.title).replace(/\s*\|\s*Fanz\.com\.tr$/i,''),description=render(input.description);
 if(/[{}<>]/.test(title+description)||title.length<5||title.length>140||description.length<20||description.length>320)throw new Error('Başlık 5–140, açıklama 20–320 karakter olmalı. Yalnız desteklenen değişkenleri kullan.');
 return {path:'/'+id+(section.id?'/'+section.id:''),title,description,intro,links};
 });
}
export function applyTemplates(input:Input){const rows=previewTemplates(input);saveOverrides(rows);return rows}
export function controlledMetadata(path:string,title:string,description:string,image?:string){
 const custom=readOverride(path);
 const chosenTitle=custom?.title?String(custom.title):title,chosenDescription=custom?.description?String(custom.description):description;
 return {title:chosenTitle,description:chosenDescription,...socialMetadata(chosenTitle,chosenDescription,path,image)};
}
