import FansApp from '@/components/fans-app';
import {discoveryEntries} from '@/lib/discovery';
import {artistShouts} from '@/lib/shouts';
export const dynamic='force-dynamic';
export const metadata={alternates:{canonical:'/'}};
export default async function Page(){const [discovery,shouts]=await Promise.all([discoveryEntries(),artistShouts()]);return <FansApp discovery={discovery} shouts={shouts}/>}
