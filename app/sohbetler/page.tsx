import {Suspense} from 'react';
import ChatLobby from '@/components/chat-lobby';
export const metadata={title:'Sohbetler — En Aktif Fan Kanalları | FANZ',description:'En aktif sanatçı sohbet kanallarını keşfet. Fan topluluğuna katıl, kanalını arkadaşlarınla paylaş.'};
export default function Page(){return <Suspense fallback={<main className="social-page">Sohbetler yükleniyor…</main>}><ChatLobby/></Suspense>}
