import Link from 'next/link';
import {readOverride,openSeo,readConfig} from '@/lib/seo-control.mjs';
export default function SeoArtistContent({path}:{path:string}){
 const custom=readOverride(path),db=openSeo();let config;try{config=readConfig(db)}finally{db.close()}
 const intro=String(custom?.intro||''),links:string[]=JSON.parse(String(custom?.links||'[]')),boxes=config.boxes.filter((b:{enabled:boolean})=>b.enabled);
 if(!intro&&!links.length&&!boxes.length)return null;
 return <section className="seo-artist-content" aria-label="Topluluk rehberi"><div>{intro.split(/\n\s*\n/).filter(Boolean).map((p:string,i:number)=><p key={i}>{p}</p>)}{links.length>0&&<nav aria-label="İlgili sayfalar">{links.map(link=><Link key={link} href={link}>{link.split('/').filter(Boolean).join(' · ').replace(/-/g,' ')}</Link>)}</nav>}</div>{boxes.length>0&&<aside>{boxes.map((b:{title:string;text:string},i:number)=><section key={i}><h2>{b.title}</h2><p>{b.text}</p></section>)}</aside>}</section>
}
