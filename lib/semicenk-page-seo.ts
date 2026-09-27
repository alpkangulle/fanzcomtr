import {dateLabel,type Entry} from './entries-types';
import {isCancelled} from './semicenk-events';
import catalog from './semicenk-catalog.json';
import type {Song} from './songs';
const news:Record<string,{title:string;description:string}>={
 'tek-yurek-milli-takima-destek':{title:'Semicenk Tek Yürek: Millî Takım İçin Hazırlanan Şarkı',description:'Semicenk’in millî futbol takımına destek için hazırladığı Tek Yürek, 29 Mayıs 2026’da yayımlandı. Şarkının çıkış hikâyesi ve yayın künyesi.'},
 'karisik-kaset-2-yedi-sarki':{title:'Semicenk ve Büken’den Karışık Kaset 2: Albüm Haberi',description:'Semicenk ve Büken’in Karışık Kaset 2 albümü 24 Nisan 2026’da çıktı. Yedi şarkılık albümün yayın bilgileri ve Karışık Kaset serisindeki yeri.'},
 'uzulmedim-ki-karisik-kaset-2-oncesi':{title:'Semicenk Üzülmedim Ki: Çıkış Tarihi ve Klip Künyesi',description:'Semicenk ve Büken’in Üzülmedim Ki teklisi 20 Mart 2026’da yayımlandı. Söz yazarı, besteci, klip ekibi ve Karışık Kaset 2 bağlantısı.'},
 'bilsen-de-semicenk-dogu-swag-buken':{title:'Bilsen De Haberi: Semicenk, Doğu Swag ve Büken',description:'Semicenk, Doğu Swag ve Büken’in Bilsen De teklisi 12 Aralık 2025’te yayımlandı. Üç ismin ortak çalışması ve Semicenk’in düet arşivindeki yeri.'},
 'kalpsiz-yayin-kunye':{title:'Semicenk Kalpsiz: 2025 Teklisinin Yayın ve Klip Haberi',description:'Semicenk’in Kalpsiz teklisi 13 Haziran 2025’te çıktı. Söz, müzik ve düzenleme bilgileri, klibin yönetmeni ve aynı dönemdeki diğer yayınlar.'},
 'karisik-kaset-ep-yayinda':{title:'Semicenk Karışık Kaset EP: 2023 Yayınının Hikâyesi',description:'Semicenk’in Karışık Kaset EP’si 15 Aralık 2023’te yayımlandı. Batık Gemi’den Kalleş’e altı şarkı ve Karışık Kaset serisinin ilk bölümü.'}
};
export function semicenkEntrySeo(e:Entry){
 if(e.kind==='konserler'){
  const heading='Semicenk '+e.city+' Konseri – '+dateLabel(e.date)+(isCancelled(e)?' (İptal)':'');
  if(isCancelled(e))return {title:heading,heading,description:'Semicenk’in 27 Eylül 2026 Oberhausen konseri iptal edildi. Turbinenhalle 1’in resmî iptal duyurusu ve etkinliğin arşiv bilgileri.'};
  const when=dateLabel(e.date)+(e.time?', saat '+e.time.replace(':','.'):'');
  if(e.date<new Date().toISOString().slice(0,10))return {title:heading+' | Konser Arşivi',heading,description:heading+': '+e.venue+'. Geçmiş etkinliğin tarih, mekân ve kaynak bilgileri.'};
  return {title:heading+' | Bilet ve Mekân',heading,description:'Semicenk '+e.city+' konseri '+when+': '+e.venue+'. Konser duyurusu, program bilgileri ve resmî bilet satış bağlantısı.'};
 }
 if(e.kind==='haberler'){const n=news[e.slug];return {...(n??{title:e.title.includes('Semicenk')?e.title:'Semicenk: '+e.title,description:e.summary}),heading:n?.title??e.title};}
 const r=catalog.releases.find(r=>r.id===e.id),name=r?.title??e.title,format=r?.format??'Albüm',count=e.tracks.split('\n').filter(Boolean).length,credits=r?.artist??'Semicenk';
 const title='Semicenk '+name+' ('+e.date.slice(0,4)+') – '+(format==='Single'?'Single Künyesi':format+' Şarkıları');
 const songs=e.tracks.split('\n').filter(Boolean);
 const detail=count>1?count+' şarkılık '+format.toLocaleLowerCase('tr')+'; '+songs.slice(0,2).join(', ')+' ve tüm parça listesi.':'Single künyesi, kapak görseli ve resmî dinleme bağlantısı.';
 return {title,heading:'Semicenk – '+name+' ('+format+', '+e.date.slice(0,4)+')',description:credits+' imzalı '+name+', '+dateLabel(e.date)+' tarihinde yayımlandı. '+detail};
}
export function semicenkSongSeo(s:Song){
 const credits=s.info?.credits??'Semicenk',duration=s.info?Math.floor(s.info.duration/60)+':'+String(s.info.duration%60).padStart(2,'0'):null;
 return {title:'Semicenk '+s.name+' – Şarkısı ve Resmî Video',description:credits+' – '+s.name+'. '+dateLabel(s.date)+' tarihli kaydın '+(duration?duration+' süresi, ':'')+'şarkı tanıtımı, sanatçı künyesi, resmî videosu ve dinleme bağlantısı.'};
}
export function entryDisplayTitle(e:Entry){return e.artist==='semicenk'?semicenkEntrySeo(e).heading:e.title}
export const semicenkSectionHeading:Record<string,string>={haberler:'Semicenk Haberleri',konserler:'Semicenk Konser Takvimi ve Bilet Bilgileri',albumler:'Semicenk Diskografi: Albümler, EP’ler ve Single’lar',biyografi:'Semicenk Kimdir? Cenk Baş’ın Biyografisi',galeri:'Semicenk Fotoğrafları, Kapakları ve Canlı Videoları','sarki-sozleri':'Semicenk Şarkı Rehberi'};
