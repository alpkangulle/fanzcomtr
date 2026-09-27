'use client';
import {useEffect,useRef,useState} from 'react';

type Player={mute:()=>void;unMute:()=>void;setVolume:(volume:number)=>void;playVideo:()=>void};
type YouTubeWindow=Window&{YT?:{Player:new (element:HTMLIFrameElement,config:{events:{onReady:(event:{target:Player})=>void;onAutoplayBlocked:(event:{target:Player})=>void}})=>Player};onYouTubeIframeAPIReady?:()=>void};

export default function SongVideo({videoId,title}:{videoId:string;title:string}){
 const frame=useRef<HTMLIFrameElement>(null),player=useRef<Player|null>(null),[ready,setReady]=useState(false),[sound,setSound]=useState(false);
 useEffect(()=>{
  let active=true;const w=window as YouTubeWindow;
  const attach=()=>{if(!active||!frame.current||!w.YT?.Player||player.current)return;player.current=new w.YT.Player(frame.current,{events:{onReady:(event)=>{player.current=event.target;setReady(true)},onAutoplayBlocked:(event)=>{event.target.mute();event.target.playVideo()}}})};
  if(w.YT?.Player)attach();else{
   const previous=w.onYouTubeIframeAPIReady;
   w.onYouTubeIframeAPIReady=()=>{previous?.();attach()};
   if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){
    const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;document.head.appendChild(script);
   }
  }
  return()=>{active=false};
 },[videoId]);
 const unmute=()=>{if(!player.current)return;player.current.unMute();player.current.setVolume(100);player.current.playVideo();setSound(true)};
 return <><div className="video-frame"><iframe ref={frame} src={'https://www.youtube-nocookie.com/embed/'+videoId+'?autoplay=1&playsinline=1&enablejsapi=1&origin='+encodeURIComponent(windowOrigin())} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div><button className="song-video-sound" type="button" onClick={unmute} disabled={!ready} aria-label="Videonun sesini aç">{sound?'Ses açıldı':'🔊 Videonun sesini aç'}</button></>;
}
function windowOrigin(){return typeof window==='undefined'?'https://fanz.com.tr':window.location.origin}
