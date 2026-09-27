import Link from 'next/link';
import {useArtistCatalog} from './artist-catalog-context';
import {ArtistPhoto} from './artist-photo';
import {dateLabel} from '@/lib/entries-types';
import manifestMedia from '@/content/manifest/media-20260927.json';

const stage=manifestMedia.filter(m=>m.slug.startsWith('konser-'));
const duplicateVisuals=new Set(['manifestival-deluxe','manifest-arem-arman-remix','zehir-arem-arman-remix']);

export function ManifestGallery(){
 const data=useArtistCatalog();
 const releases=data.releases.filter(r=>!duplicateVisuals.has(r.slug));
 const videos=Object.values(data.songs).filter(s=>s.videoId);
 return <div className="editorial-gallery">
  <p>Manifest’in grup fotoğrafı, her yayına ait kapaklar, sahne arşivi ve resmî video bağlantıları. Görsellerin kaynakları ilgili kartların altında yer alır.</p>
  <ArtistPhoto artist="manifest" name="Manifest"/>
  <h3>Yayın kapakları</h3><p>Single’ların özgün kapakları kullanılır. Aynı görseli paylaşan deluxe sürüm ve remiksleri burada tekrar göstermiyoruz; diskografide kendi kayıtları ve künyeleri bulunur.</p>
  <div className="editorial-cover-grid">{releases.map(r=><figure key={r.id}><Link href={'/manifest/albumler/'+r.slug}><img src={r.cover} alt={r.title+' yayın kapağı'} loading="lazy" width="300" height="300"/><figcaption><strong>{r.title}</strong><span>{r.format} · {dateLabel(r.date)}</span></figcaption></Link><a className="credit" href={r.url} target="_blank" rel="noreferrer">Kapak kaynağı: Apple Music ↗</a></figure>)}</div>
  <h3>Sahne fotoğrafları</h3><p>Bu fotoğraflar genel performans arşividir; Ankara veya Londra etkinliğinin gerçekleştiğine dair görsel kanıt olarak sunulmaz.</p>
  <div className="editorial-cover-grid">{stage.map((m,i)=><figure key={m.slug}><a href={m.source} target="_blank" rel="noreferrer"><img src={m.path} alt={'Manifest sahne arşivi fotoğrafı '+(i+1)} loading="lazy" width="300" height="360"/><figcaption><strong>Manifest sahnede</strong><span>Wikimedia Commons · CC0 ↗</span></figcaption></a></figure>)}</div>
  <h3>Resmî müzik videoları</h3><div className="editorial-cover-grid">{videos.map(s=><figure key={s.slug}><a href={s.videoSource} target="_blank" rel="noreferrer"><img src={'https://i.ytimg.com/vi/'+s.videoId+'/hqdefault.jpg'} alt={'Manifest – '+s.name+' resmî müzik videosu'} loading="lazy" width="480" height="360"/><figcaption><strong>{s.name}</strong><span>Resmî video · YouTube ↗</span></figcaption></a></figure>)}</div>
  <p className="credit">Görsel ve yayın kaynakları 27 Eylül 2026 itibarıyla kontrol edildi.</p>
 </div>
}
export function ManifestGuide(){const data=useArtistCatalog();const songs=Object.values(data.songs).sort((a,b)=>b.date.localeCompare(a.date)||a.name.localeCompare(b.name,'tr'));return <div className="editorial-prose"><p>Manifest’in şarkılarını yayın tarihleri, sanatçı künyeleri ve doğrulanmış resmî kayıtlarıyla keşfet. Albümün özgün parçaları ve deluxe sürümdeki remiksler ayrı listelenir.</p><h3>Nereden başlamalı?</h3><p>İlk albüm için <Link href="/manifest/albumler/manifestival"><strong>manifestival</strong></Link>, sonraki yayınlar için <Link href="/manifest/sarkilar/ruya"><strong>RÜYA</strong></Link>, <Link href="/manifest/sarkilar/amator"><strong>Amatör</strong></Link> ve <Link href="/manifest/sarkilar/toz-pembe"><strong>Toz Pembe</strong></Link> ile başlayabilirsin.</p><h3>Şarkı sözlerine nereden ulaşabilirim?</h3><p>Şarkı sayfasındaki Apple Music bağlantısı, hizmette mevcut olduğunda resmî söz ekranına götürür. Doğrulanmış video bağlantıları da ilgili şarkı sayfasında bulunur.</p><h3>Şarkı arşivi</h3><div className="editorial-song-list">{songs.map(s=><Link key={s.slug} href={'/manifest/sarkilar/'+s.slug}><strong>{s.name}</strong><span>{s.credits} · {dateLabel(s.date)}</span></Link>)}</div><p className="credit">İçerik güncellemesi: {data.updated?new Date(data.updated).toLocaleDateString('tr-TR'):''} · Künye ve tarihler: Apple Music, MusicBrainz · Videolar: resmî YouTube yayınları.</p></div>}
