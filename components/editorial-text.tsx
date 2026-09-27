import Link from 'next/link';
import {useArtistCatalog} from './artist-catalog-context';
import {linkParts,type EditorialLink} from '@/lib/editorial-links';
export default function EditorialText({text,artist,currentPath}:{text:string;artist?:string;currentPath?:string}){
 const catalog=useArtistCatalog(),used=new Set<string>();
 const links:EditorialLink[]=(artist==='semicenk'||artist==='manifest'||artist==='blok3'||artist==='burak-bulut')?[
 ...catalog.releases.filter(r=>artist==='manifest'||artist==='blok3'||artist==='burak-bulut'||r.format!=='Single').map(r=>({label:r.title,href:'/'+artist+'/albumler/'+r.slug})),
 ...Object.values(catalog.songs).filter(s=>artist!=='manifest'||s.name!=='Manifest').map(s=>({label:s.name,href:'/'+artist+'/sarkilar/'+s.slug})),
 {label:artist==='manifest'?'Manifest konserleri':artist==='blok3'?'BLOK3 konserleri':artist==='burak-bulut'?'Burak Bulut konserleri':'Semicenk konserleri',href:'/'+artist+'/konserler'},{label:artist==='manifest'?'Manifest şarkıları':artist==='blok3'?'BLOK3 şarkıları':artist==='burak-bulut'?'Burak Bulut şarkıları':'Semicenk şarkıları',href:'/'+artist+'/sarkilar'},{label:artist==='manifest'?'Manifest üyeleri':artist==='blok3'?'Hakan Aydın':artist==='burak-bulut'?'Burak Bulut':'Cenk Baş',href:'/'+artist+'/biyografi'}
 ].filter(link=>link.href!==currentPath):[];
 return <div className="editorial-prose">{text.split(/\n\n+/).filter(Boolean).map((block,i)=>{
 const lines=block.split('\n'),heading=lines[0].startsWith('## ');
 return <div key={i}>{heading&&<h3>{lines[0].slice(3)}</h3>}{(heading?lines.slice(1):lines).map((line,j)=><p key={j}>{linkParts(line,links,used).map((part,k)=>typeof part==='string'?part:<Link key={k} href={part.href} prefetch={false} className="editorial-keyword"><strong>{part.label}</strong></Link>)}</p>)}</div>
 })}</div>
}
