import Link from 'next/link';
import {artists} from '@/lib/artists';
import {ArtistPhoto} from '@/components/artist-photo';
export default function Page(){return <main className="media-credits"><Link href="/">← Keşfe dön</Link><h1>Fotoğraflar ve kaynaklar</h1><p>Sanatçı fotoğrafları aşağıdaki kaynaklardan alınmıştır. Kartlarda görsel kadrajı değişebilir. Albüm kapakları ilgili eseri tanıtmak için kullanılır; kaynak bağlantıları albüm ve haber detaylarında yer alır.</p>{artists.map(a=><section key={a.id}><h2>{a.name}</h2><ArtistPhoto artist={a.id} name={a.name}/></section>)}</main>}
