'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {artistIds} from '@/lib/site-config';

export default function SiteHeader(){
 const path=usePathname();
 if(path.startsWith('/admin'))return null;
 const artist=path.split('/')[1];
 const links=[
  {href:'/akis',label:'Ana',active:path==='/akis'},
  {href:'/',label:'Keşfet',active:path==='/'||artistIds.some(id=>id===artist)},
  {href:'/top-listeler',label:'Top listeler',active:path==='/top-listeler'},
  {href:'/sohbetler',label:'Sohbet',active:path==='/sohbetler'},
  {href:'/profil',label:'Profil',active:path==='/profil'||path.startsWith('/fanz/')}
 ];
 return <header className="global-header">
  <div className="global-header-inner">
   <Link className="global-brand" href="/" aria-label="Fanz ana sayfası"><img src="/images/fanz-logo.png" alt="Fanz" width="1792" height="1024" /></Link>
   <nav className="global-links" aria-label="Site menüsü">{links.map(link=><Link key={link.label} href={link.href} aria-current={link.active?'page':undefined}>{link.label}</Link>)}</nav>
  </div>
 </header>;
}