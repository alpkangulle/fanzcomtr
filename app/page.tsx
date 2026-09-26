import FansApp from '@/components/fans-app';
import {discoveryEntries} from '@/lib/discovery';
export const dynamic='force-dynamic';
export const metadata={alternates:{canonical:'/'}};
export default async function Page(){return <FansApp discovery={await discoveryEntries()}/>}
