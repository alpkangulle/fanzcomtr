'use client';
import Link from 'next/link';
import {House,Search,Trophy,Users,MessageCircle,UserRound} from 'lucide-react';
export default function MobileNav({active}:{active:string}){return <nav className="mobile-nav" aria-label="Mobil gezinme"><Link className={active==='home'?'active':''} href="/akis"><House/>Ana</Link><Link className={active==='search'?'active':''} href="/"><Search/>Ara</Link><Link className={active==='top'?'active':''} href="/top-listeler"><Trophy/>Top</Link><Link className={active==='following'?'active':''} href="/takip"><Users/>Takip</Link><Link href="/semicenk#kanal"><MessageCircle/>Sohbet</Link><Link className={active==='profile'?'active':''} href="/profil"><UserRound/>Profil</Link></nav>}
