'use client';
import {usePathname} from 'next/navigation';
export default function SeoContact({phone,whatsapp}:{phone:string;whatsapp:string}){
 const path=usePathname();if(path.startsWith('/admin')||(!phone&&!whatsapp))return null;
 return <aside className="seo-contact" aria-label="İletişim">{phone&&<a href={'tel:'+phone}>Ara</a>}{whatsapp&&<a href={'https://wa.me/'+whatsapp.replace(/\D/g,'')} target="_blank" rel="noopener noreferrer">WhatsApp</a>}</aside>
}
