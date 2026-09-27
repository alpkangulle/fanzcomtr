'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ChevronDown} from 'lucide-react';
export default function ArtistNavigation({artist,section}:{artist:string;section?:string}){
 const [menu,setMenu]=useState<'music'|'more'|null>(null);
 const link=(slug:string,label:string)=><Link key={slug} href={'/'+artist+(slug?'/'+slug:'')} aria-current={(section??'')===slug?'page':undefined} className={(section??'')===slug?'active':''} onClick={()=>setMenu(null)}>{label}</Link>;
 return <nav className="artist-navigation section-navigation" aria-label="Sanatçı sayfaları">
 {link('','Ana sayfa')}{link('haberler','Haberler')}{link('konserler','Konserler')}
 <div className="section-menu"><button className={['albumler','sarkilar','sarki-sozleri'].includes(section??'')?'active':''} aria-expanded={menu==='music'} aria-controls="artist-music-menu" onClick={()=>setMenu(menu==='music'?null:'music')}>Müzik <ChevronDown size={13}/></button>{menu==='music'&&<div id="artist-music-menu" className="section-popover" onKeyDown={e=>{if(e.key==='Escape')setMenu(null)}}>{link('albumler',artist==='semicenk'?'Diskografi':'Albümler')}{link('sarkilar','Şarkılar')}{link('sarki-sozleri',artist==='semicenk'?'Şarkı rehberi':'Şarkı sözleri')}</div>}</div>
 <div className="section-menu"><button className={['biyografi','galeri'].includes(section??'')?'active':''} aria-expanded={menu==='more'} aria-controls="artist-more-menu" onClick={()=>setMenu(menu==='more'?null:'more')}>Daha fazla <ChevronDown size={13}/></button>{menu==='more'&&<div id="artist-more-menu" className="section-popover" onKeyDown={e=>{if(e.key==='Escape')setMenu(null)}}>{link('biyografi','Biyografi')}{link('galeri','Galeri')}</div>}</div>
 </nav>;
}

