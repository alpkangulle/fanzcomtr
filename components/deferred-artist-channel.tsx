'use client';
import {useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
const ArtistChannel=dynamic(()=>import('./artist-channel'),{ssr:false,loading:()=> <section className="channel-placeholder"><p role="status">Sohbet yükleniyor…</p></section>});
export default function DeferredArtistChannel({artist,name}:{artist:string;name:string}){
 const [ready,setReady]=useState(false),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!ref.current)return;const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setReady(true);observer.disconnect()}},{rootMargin:'200px'});observer.observe(ref.current);return()=>observer.disconnect()},[]);
 return <div ref={ref} id="kanal" className="deferred-channel">{ready?<ArtistChannel artist={artist} name={name} anchorId={null}/>:<section className="channel-placeholder"><h2>{name} sohbet kanalı</h2><p>Diğer hayranlarla sohbet et.</p><button className="primary" onClick={()=>setReady(true)}>Sohbeti aç</button></section>}</div>;
}
