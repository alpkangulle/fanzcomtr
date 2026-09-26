import FansApp from '@/components/fans-app';
import {discoveryEntries} from '@/lib/discovery';
export const dynamic='force-dynamic';
export const metadata={alternates:{canonical:process.env.SITE_ORIGIN??'https://fans.wai.com.tr'}};
export default async function Page(){return <FansApp discovery={await discoveryEntries()}/>}

