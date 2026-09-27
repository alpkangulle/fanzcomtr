import Link from 'next/link';
import {artistMedia} from './artist-photo';
import {ArrowUpRight, BookOpen, Music2, Images, MessageCircle} from 'lucide-react';

type Props = {artist:{id:string;name:string;tag:string}; biography?:string};
export default function ArtistOverview({artist,biography}:Props){
 const base='/'+artist.id;
 return <section className="artist-overview" aria-labelledby="artist-world-title">
  <div className="world-heading"><div><p className="eyebrow">MÜZİĞİN ETRAFINDA</p><h2 id="artist-world-title">{artist.name} dünyası</h2></div><span>Keşfet. Dinle. Paylaş.</span></div>
  <div className="world-grid">
   <Link href={base+'/biyografi'} className="world-card world-biography"><span className="world-icon"><BookOpen size={22}/></span><span className="world-card-label">HİKÂYESİ</span><h3>Müziğin arkasındaki isim.</h3><p>{biography?biography.slice(0,190)+(biography.length>190?'…':''):'Sanatçının hikâyesi ve müzik yolculuğu, kaynaklarıyla birlikte burada yer alacak.'}</p><span className="world-link">Biyografiye git <ArrowUpRight size={19}/></span></Link>
   <Link href={base+'/sarki-sozleri'} className="world-card world-music"><span className="world-icon"><Music2 size={22}/></span><span className="world-card-label">{artist.id==='semicenk'||artist.id==='manifest'||artist.id==='blok3'||artist.id==='burak-bulut'||artist.id==='sefo'?'ŞARKI REHBERİ':'ŞARKI SÖZLERİ'}</span><h3>{artist.tag}</h3><p>{artist.id==='semicenk'?'Düşer Aklıma’dan Tek Yürek’e: şarkı hikâyeleri, yayın künyeleri ve resmî videolar.':artist.id==='manifest'?'manifestival’dan Toz Pembe’ye: şarkı künyeleri, yayınlar ve resmî videolar.':artist.id==='sefo'?'Bilmem Mi’den SIPANBABUR’a: yayınlar, sanatçı künyeleri ve resmî videolar.':'Birlikte söylediğimiz sözler için bir yer. Şarkı sözleri seçkisi hazırlanıyor.'}</p><span className="world-link">{artist.id==='semicenk'||artist.id==='manifest'||artist.id==='blok3'||artist.id==='burak-bulut'||artist.id==='sefo'?'Şarkıları keşfet':'Şarkı sözlerine git'} <ArrowUpRight size={19}/></span></Link>
   <Link href={base+'/galeri'} className={'world-card world-gallery '+'has-photo'}>
    {<img src={artistMedia[artist.id].src} alt={artist.name+' arşiv fotoğrafı'} loading="lazy" width="450" height="300"/>}
    <span className="world-icon"><Images size={22}/></span><span className="world-card-label">GALERİ</span><h3>{artist.id==='semicenk'?'Fotoğraf ve kapak arşivi.':'Sahneden bir an.'}</h3><p>Arşiv fotoğrafını keşfet; görselin kaynağı ve lisansı galeride.</p><span className="world-link">Galeriye git <ArrowUpRight size={19}/></span>
   </Link>
  </div>
  <div className="channel-intro"><div><p className="eyebrow">AYNI ŞARKIDA BULUŞALIM</p><h2>Söz şimdi hayranlarda.</h2><p>{artist.name} dinleyenlerle tanış. Misafir olarak sohbete katıl.</p></div><a href="#kanal" aria-label={artist.name+' sohbet kanalına git'}><MessageCircle size={22}/><ArrowUpRight size={18}/></a></div>
 </section>;
}
