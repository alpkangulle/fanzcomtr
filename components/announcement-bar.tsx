'use client';
import {usePathname} from 'next/navigation';

const message='Fanz.com.tr | Admin: Arkadaşlar, hepiniz yeni platforma hoş geldiniz. Her sanatçının sayfasının en altındaki sohbet kanallarına admin ve yönetici alımları yapılacaktır. İletişim WhatsApp: +90 539 238 9098 | İlgilenenler bizimle iletişime geçebilir!';

export default function AnnouncementBar(){
 const path=usePathname();
 if(path.startsWith('/admin'))return null;
 return <aside className="announcement-bar" aria-label="Fanz duyurusu">
  <strong className="announcement-label">DUYURU</strong>
  <div className="announcement-window"><div className="announcement-track"><span>{message}</span><span aria-hidden="true">{message}</span></div></div>
  <a className="announcement-contact" href="https://wa.me/905392389098" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp üzerinden +90 539 238 9098 numarasıyla iletişime geç">WhatsApp <span>↗</span></a>
 </aside>;
}
