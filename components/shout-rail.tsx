'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Heart,Send} from 'lucide-react';
import {artists} from '@/lib/artists';
import type {Shout} from '@/lib/shouts';

export default function ShoutRail({artist,initialShouts}:{artist?:string;initialShouts:Shout[]}){
 const [shouts,setShouts]=useState(initialShouts),[compose,setCompose]=useState(false),[member,setMember]=useState<string|null>(null),[selected,setSelected]=useState(artist??artists[0].id),[body,setBody]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{fetch('/api/member/session',{cache:'no-store'}).then(r=>r.json()).then(v=>setMember(v.member?.username??null)).catch(()=>{})},[]);
 const name=(id:string)=>artists.find(a=>a.id===id)?.name??id;
 async function send(e:React.FormEvent){e.preventDefault();setBusy(true);setNotice('');try{
  const response=await fetch('/api/shouts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({artist:selected,body})});const result=await response.json();
  if(!response.ok)throw new Error(result.error??'Mesaj gönderilemedi.');
  const list=await fetch('/api/shouts'+(artist?'?artist='+encodeURIComponent(artist):''),{cache:'no-store'});
  if(list.ok)setShouts((await list.json()).shouts);
  setBody('');setCompose(false);setNotice('Sevgini haykırdın!');
 }catch(error){setNotice(error instanceof Error?error.message:'Mesaj gönderilemedi.')}finally{setBusy(false)}}
 const cards=(duplicate=false)=>shouts.map(shout=><article className="shout-card" key={(duplicate?'copy-':'')+shout.id} aria-hidden={duplicate||undefined}>
  <p>“{shout.body}”</p><div>{duplicate?<span>{name(shout.artist)}</span>:<Link href={'/'+shout.artist}>{name(shout.artist)}</Link>}<span>·</span>{duplicate?<span>@{shout.username}</span>:<Link href={'/fanz/'+encodeURIComponent(shout.username)}>@{shout.username}</Link>}</div>
 </article>);
 return <section className="shout-section" aria-labelledby={artist?'artist-shouts':'all-shouts'}>
  <div className="shout-heading"><div><span className="eyebrow">FANLARIN SESİ</span><h2 id={artist?'artist-shouts':'all-shouts'}><Heart size={25} aria-hidden="true"/> Sevgini Haykır</h2><p>{artist?name(artist)+' hayranlarından mesajlar.':'Bütün sanatçı topluluklarından sevgi dolu mesajlar.'}</p></div><button type="button" className="shout-open" onClick={()=>{setCompose(v=>!v);setNotice('')}}>Sen de haykır <Send size={17}/></button></div>
  {compose&&(member?<form className="shout-compose" onSubmit={send}>{!artist&&<label>Sanatçı<select value={selected} onChange={e=>setSelected(e.target.value)}>{artists.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>}<label>Mesajın<textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={180} minLength={3} required placeholder="Sanatçına sevgini birkaç cümleyle anlat…"/></label><div><small>{body.length}/180</small><button disabled={busy||body.trim().length<3} type="submit">{busy?'Gönderiliyor…':'Haykır'}</button></div></form>:<div className="shout-login">Sevgini haykırmak için üye olmalısın. <Link href="/profil">Giriş yap veya kaydol →</Link></div>)}
  {notice&&<p className="shout-notice" role="status">{notice}</p>}
  {shouts.length?<div className="shout-window" role="region" aria-label="Fan mesajları, yatay kaydırılabilir"><div className={'shout-track '+(shouts.length>1?'is-moving':'')}>{cards()}{shouts.length>1&&cards(true)}</div></div>:<p className="shout-empty">İlk mesajı sen yaz; bu toplulukta sevgini ilk sen haykır.</p>}
 </section>;
}
