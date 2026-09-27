'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import './seo.css';
type Config={revision:number;indexNowEnabled:boolean;googleEnabled:boolean;googleIndexingEnabled:boolean;dailyLimit:number;property:string;indexNowKey:string;imageEnabled:boolean;imageQuality:number;phone:string;whatsapp:string;phoneEnabled:boolean;whatsappEnabled:boolean;boxes:{title:string;text:string;enabled:boolean}[]};
type Row={path:string;title:string;description:string;intro:string;links:string[]};
type Data={images:string[];config:Config;googleCredentialPresent:boolean;artists:{id:string;name:string}[];sections:{id:string;name:string}[];pages:string[];overrides:Row[];worker:{last_run:number;last_message:string;lease_until:number};image:{last_run:number;last_message:string};totals:{provider:string;status:string;count:number}[];queue:{provider:string;url:string;status:string;http_status:number;message:string;attempts:number;updated:number}[];daily:{provider:string;day:string;attempts:number}[]};
const label:Record<string,string>={indexnow:'IndexNow',google:'Google URL bildirimi',sitemap:'Google site haritası',pending:'Bekliyor',accepted:'Kabul edildi',error:'Hata'};
const time=(n:number)=>n?new Date(n).toLocaleString('tr-TR'):'Henüz çalışmadı';
export default function SeoPanel(){
 const [image,setImage]=useState('');
 const [data,setData]=useState<Data|null>(null),[config,setConfig]=useState<Config|null>(null),[unauthorized,setUnauthorized]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [template,setTemplate]=useState({artistIds:[] as string[],section:'',title:'{sanatci} {bolum}',description:'{sanatci} haberlerini, konserlerini, albümlerini ve şarkılarını keşfet. Fanz.com.tr bağımsız hayran topluluğuna katıl.',intro:'',links:[] as string[]}),[preview,setPreview]=useState<Row[]>([]);
 async function refresh(){const r=await fetch('/api/admin/seo',{cache:'no-store'});if(r.status===401){setUnauthorized(true);return}const d=await r.json();if(!r.ok)throw new Error(d.error||'Panel yüklenemedi.');setData(d);setConfig({...d.config,boxes:[...d.config.boxes,...Array.from({length:Math.max(0,3-d.config.boxes.length)},()=>({title:'',text:'',enabled:false}))]});setUnauthorized(false)}
 useEffect(()=>{refresh().catch(e=>setError(e.message))},[]);
 async function action(action:string,extra:object={}){
 setBusy(true);setError('');setNotice('');
 try{const r=await fetch('/api/admin/seo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...extra})});const d=await r.json();if(!r.ok)throw new Error(d.error||'İşlem tamamlanamadı.');
 if(action==='preview')setPreview(d.preview);else{setNotice(d.message||'Kaydedildi.');if(action==='apply'||action==='restore')setPreview([]);await refresh()}
 }catch(e){setError(e instanceof Error?e.message:'İşlem tamamlanamadı.')}finally{setBusy(false)}
 }
 function changeTemplate(p:Partial<typeof template>){setTemplate({...template,...p});setPreview([])}
 function setting<K extends keyof Config>(key:K,value:Config[K]){if(config)setConfig({...config,[key]:value})}
 return <main className="seo-admin"><header><div><p>FANZ · YÖNETİM</p><h1>SEO merkezi</h1></div><Link href="/admin">← İçerik yönetimi</Link></header>
 {error&&<p className="seo-error" role="alert">{error}</p>}{notice&&<p className="seo-notice" role="status">{notice}</p>}
 {unauthorized?<p>Yönetici oturumun gerekli. <Link href="/admin">Giriş yap →</Link></p>:!data||!config?<p>Yükleniyor…</p>:<>
 <nav className="seo-tabs"><a href="#sablon">Sanatçı şablonları</a><a href="#bildirim">Arama motorları</a><a href="#gorsel">Görseller</a><a href="#iletisim">İletişim</a><a href="#kuyruk">Gönderim kayıtları</a></nav>
 <section id="sablon"><h2>Sanatçı odaklı toplu düzenleme</h2><p>Mevcut sanatçı sayfalarına başlık, açıklama ve isteğe bağlı tanıtım metni uygula. Aynı adresi yeniden uygulamak kayıt çoğaltmaz. Boş metin mevcut biyografiyi silmez.</p>
 <label>Bölüm<select value={template.section} onChange={e=>changeTemplate({section:e.target.value})}>{data.sections.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
 <div className="seo-checks">{data.artists.map(a=><label key={a.id}><input type="checkbox" checked={template.artistIds.includes(a.id)} onChange={e=>changeTemplate({artistIds:e.target.checked?[...template.artistIds,a.id]:template.artistIds.filter(x=>x!==a.id)})}/>{a.name}</label>)}</div>
 <button disabled={busy} onClick={()=>changeTemplate({artistIds:data.artists.map(a=>a.id)})}>Tüm sanatçıları seç</button>
 <p>Değişkenler: <code>{'{sanatci} · {bolum} · {site}'}</code>. Başlığa site adı otomatik eklenir.</p>
 <label>Başlık şablonu<input value={template.title} maxLength={300} onChange={e=>changeTemplate({title:e.target.value})}/></label>
 <label>Açıklama şablonu<textarea value={template.description} maxLength={1000} onChange={e=>changeTemplate({description:e.target.value})}/></label>
 <label>Sayfada gösterilecek tanıtım metni · isteğe bağlı<textarea rows={6} value={template.intro} maxLength={12000} onChange={e=>changeTemplate({intro:e.target.value})} placeholder="Doğrulanmış bilgileri ve topluluğun sunduklarını yaz. Değişkenleri burada da kullanabilirsin."/></label>
 <label>İlgili sayfalar · en fazla 10<select multiple value={template.links} onChange={e=>changeTemplate({links:Array.from(e.target.selectedOptions,o=>o.value).slice(0,10)})}>{data.pages.map(p=><option key={p} value={p}>{p}</option>)}</select></label>
 <div className="seo-actions"><button disabled={busy||!template.artistIds.length} onClick={()=>action('preview',{template})}>Önizle</button><button disabled={busy||!preview.length} onClick={()=>action('apply',{template})}>Önizlemeyi uygula</button><button disabled={busy||!template.artistIds.length} onClick={()=>action('restore',{template})}>Seçilenlerde varsayılana dön</button></div>
 {preview.map(r=><article className="seo-preview" key={r.path}><small>https://fanz.com.tr{r.path}</small><h3>{r.title} | Fanz.com.tr</h3><p>{r.description}</p><small>{r.title.length} karakter başlık · {r.description.length} karakter açıklama</small>{r.intro&&<p>{r.intro}</p>}</article>)}
 <details><summary>Özelleştirilmiş sayfalar ({data.overrides.length})</summary>{data.overrides.map(r=><p key={r.path}><a href={r.path} target="_blank" rel="noreferrer">{r.path}</a> — {r.title}</p>)}</details>
 </section>
 <section id="bildirim"><h2>Arama motorlarına bildirim</h2><p>Site haritasındaki yayın URL’leri takip edilir. Yeni, güncellenen ve kaldırılan adresler kuyruklanır. Gönderimin kabulü, dizine alındığı anlamına gelmez.</p>
 {(['indexNowEnabled','googleEnabled','googleIndexingEnabled'] as const).map((k,i)=><label className="seo-check" key={k}><input type="checkbox" checked={config[k]} onChange={e=>setting(k,e.target.checked)}/>{['IndexNow: katılımcı arama motorlarına URL bildirimi','Google Search Console: site haritası gönderimi','Google Indexing API: tüm yayın URL’lerini bildir'][i]}</label>)}
 <label>Günlük URL deneme limiti · sağlayıcı başına<input type="number" min={1} max={200} value={config.dailyLimit} onChange={e=>setting('dailyLimit',Number(e.target.value))}/></label>
 <label>Search Console mülkü<select value={config.property} onChange={e=>setting('property',e.target.value)}><option value="sc-domain:fanz.com.tr">sc-domain:fanz.com.tr</option><option value="https://fanz.com.tr/">https://fanz.com.tr/</option></select></label>
 <p>Site haritası: <a href="/sitemap.xml" target="_blank" rel="noreferrer">/sitemap.xml</a> · IndexNow doğrulaması: <a href="/indexnow.txt" target="_blank" rel="noreferrer">/indexnow.txt</a></p>
 <label>Google servis hesabı JSON dosyası<input disabled={busy} type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>24000){setError('JSON dosyası çok büyük.');return}try{await action('credentials',{credentials:JSON.parse(await file.text())})}catch{setError('JSON dosyası okunamadı.')}}}/></label>
 <p>{data.googleCredentialPresent?'Servis hesabı dosyası yüklü.':'Servis hesabı dosyası henüz yüklenmedi.'} Google API’leri açık olmalı ve servis hesabının bu Search Console mülkünde yetkisi bulunmalı.</p>
 <button disabled={busy} onClick={()=>action('settings',{config})}>Ayarları kaydet</button>
 </section>
 <section id="gorsel"><h2>Görsel optimizasyonu</h2><p>Sanatçı, albüm ve site görsellerinin WebP kopyaları hazırlanır; özgün dosyalar korunur. Yalnız daha küçük sonuçlar ve WebP destekleyen tarayıcılar için kullanılır.</p>
 <label className="seo-check"><input type="checkbox" checked={config.imageEnabled} onChange={e=>setting('imageEnabled',e.target.checked)}/>WebP görselleri sun</label>
 <label>Kalite<input type="number" min={50} max={95} value={config.imageQuality} onChange={e=>setting('imageQuality',Number(e.target.value))}/></label>
 <div className="seo-actions"><button disabled={busy} onClick={()=>action('settings',{config})}>Ayarları kaydet</button><button disabled={busy} onClick={()=>action('optimize')}>Görselleri topluca optimize et</button></div>
 <label>Tek bir görsel<select value={image} onChange={e=>setImage(e.target.value)}><option value="">Görsel seç</option>{data.images.map(p=><option key={p} value={p}>{p}</option>)}</select></label><button disabled={busy||!image} onClick={()=>action('optimize',{image})}>Seçilen görseli optimize et</button>
 <p>Son işlem: {time(data.image.last_run)} · {data.image.last_message||'Henüz işlem yok.'}</p>
 </section>
 <section id="iletisim"><h2>İletişim ve yan alanlar</h2><div className="seo-columns">
 <label>Telefon<input value={config.phone} onChange={e=>setting('phone',e.target.value)} placeholder="+90…"/></label>
 <label>WhatsApp<input value={config.whatsapp} onChange={e=>setting('whatsapp',e.target.value)} placeholder="+90…"/></label></div>
 <label className="seo-check"><input type="checkbox" checked={config.phoneEnabled} onChange={e=>setting('phoneEnabled',e.target.checked)}/>Telefon düğmesini göster</label><label className="seo-check"><input type="checkbox" checked={config.whatsappEnabled} onChange={e=>setting('whatsappEnabled',e.target.checked)}/>WhatsApp düğmesini göster</label>
 {config.boxes.map((box,i)=><fieldset key={i}><legend>Sanatçı sayfası yan alanı {i+1}</legend><label className="seo-check"><input type="checkbox" checked={box.enabled} onChange={e=>setting('boxes',config.boxes.map((b,j)=>j===i?{...b,enabled:e.target.checked}:b))}/>Göster</label><label>Başlık<input value={box.title} maxLength={80} onChange={e=>setting('boxes',config.boxes.map((b,j)=>j===i?{...b,title:e.target.value}:b))}/></label><label>Açıklama<textarea value={box.text} maxLength={300} onChange={e=>setting('boxes',config.boxes.map((b,j)=>j===i?{...b,text:e.target.value}:b))}/></label></fieldset>)}
 <button disabled={busy} onClick={()=>action('settings',{config})}>Ayarları kaydet</button>
 </section>
 <section id="kuyruk"><h2>Gönderim kayıtları</h2><p>Son çalışma: {time(data.worker.last_run)} · {data.worker.lease_until>Date.now()?'Çalışıyor':data.worker.last_message||'Henüz işlem yok.'}</p>
 <div className="seo-actions"><button disabled={busy} onClick={()=>action('run')}>Şimdi kontrol et ve gönder</button><button disabled={busy} onClick={()=>action('retry')}>Hataları yeniden kuyruğa al</button><button disabled={busy} onClick={()=>refresh().catch(e=>setError(e.message))}>Durumu yenile</button></div>
 <div className="seo-counters">{data.totals.map(r=><p key={r.provider+r.status}>{label[r.provider]} · {label[r.status]} <strong>{r.count}</strong></p>)}</div>
 {data.daily.map(r=><p key={r.provider}>{label[r.provider]}: bugün {r.attempts} deneme</p>)}
 <div className="seo-table"><table><thead><tr><th>Sağlayıcı / URL</th><th>Durum</th><th>Sonuç</th></tr></thead><tbody>{data.queue.map(r=><tr key={r.provider+r.url}><td>{label[r.provider]}<br/><a href={r.url} target="_blank" rel="noreferrer">{r.url}</a></td><td>{label[r.status]}<br/>{r.http_status||'—'}</td><td>{r.message}<br/><small>{time(r.updated)} · {r.attempts} deneme</small></td></tr>)}</tbody></table></div><p>Son 100 kayıt gösterilir. Tüm kuyruk veritabanında saklanır.</p>
 </section></>}
 </main>
}
