import Link from 'next/link';
import {useArtistCatalog} from './artist-catalog-context';
import {linkParts,type EditorialLink} from '@/lib/editorial-links';
export default function EditorialText({text,artist,currentPath}:{text:string;artist?:string;currentPath?:string}){
 const catalog=useArtistCatalog(),used=new Set<string>();
 const links:EditorialLink[]=artist==='semicenk'?[
 ...catalog.releases.filter(r=>r.format!=='Single').map(r=>({label:r.title,href:'/semicenk/albumler/'+r.slug})),
 ...Object.values(catalog.songs).map(s=>({label:s.name,href:'/semicenk/sarkilar/'+s.slug})),
 {label:'Semicenk konserleri',href:'/semicenk/konserler'},{label:'Semicenk şarkıları',href:'/semicenk/sarkilar'},{label:'Cenk Baş',href:'/semicenk/biyografi'}
 ].filter(link=>link.href!==currentPath):[];
 return <div className="editorial-prose">{text.split(/\n\n+/).filter(Boolean).map((block,i)=>{
 const lines=block.split('\n'),heading=lines[0].startsWith('## ');
 return <div key={i}>{heading&&<h3>{lines[0].slice(3)}</h3>}{(heading?lines.slice(1):lines).map((line,j)=><p key={j}>{linkParts(line,links,used).map((part,k)=>typeof part==='string'?part:<Link key={k} href={part.href} prefetch={false} className="editorial-keyword"><strong>{part.label}</strong></Link>)}</p>)}</div>
 })}</div>
}
