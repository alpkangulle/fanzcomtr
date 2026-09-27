import {openSeo,readConfig} from '../lib/seo-control.mjs';
const db=openSeo();
try{
 const {revision,...config}=readConfig(db);
 if(config.imageEnabled){console.log('Görsel optimizasyonu zaten açık.');}
 else{
 const updated=db.prepare('UPDATE seo_config SET value=?,revision=revision+1 WHERE id=1 AND revision=?').run(JSON.stringify({...config,imageEnabled:true}),revision);
 if(!updated.changes)throw new Error('SEO ayarı eşzamanlı değişti; işlem tekrar denenmeli.');
 console.log('Görsel optimizasyonu açıldı. Diğer SEO ayarları korundu.');
 }
}finally{db.close()}
