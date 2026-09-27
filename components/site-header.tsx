'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {artistIds,siteConfig} from '@/lib/site-config';

export default function SiteHeader(){
 const path=usePathname();
 if(path.startsWith('/admin'))return null;
 const artist=path.split('/')[1];
 const chat=artistIds.some(id=>id===artist)?`/${artist}#kanal`:'/semicenk#kanal';
 const links=[
  {href:'/akis',label:'Ana',active:path==='/akis'},
  {href:'/',label:'Keşfet',active:path==='/'||artistIds.some(id=>id===artist)},
  {href:'/top-listeler',label:'Top listeler',active:path==='/top-listeler'},
  {href:'/takip',label:'Takip',active:path==='/takip'},
  {href:chat,label:'Sohbet',active:false},
  {href:'/profil',label:'Profil',active:path==='/profil'||path.startsWith('/fanz/')}
 ];
 return <header className="global-header">
  <div className="global-header-inner">
   <Link className="global-brand" href="/" aria-label="Keşfet ana sayfası">{siteConfig.mark}<span aria-hidden="true">✳︎</span></Link>
   <nav className="global-links" aria-label="Site menüsü">{links.map(link=><Link key={link.label} href={link.href} aria-current={link.active?'page':undefined}>{link.label}</Link>)}</nav>
  </div>
 </header>;
}
