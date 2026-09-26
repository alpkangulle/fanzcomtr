import {FanProfile} from '@/components/fan-social';
export const dynamic='force-dynamic';
export async function generateMetadata(){return {robots:{index:false,follow:true}}}
export default async function Page({params}:{params:Promise<{username:string}>}){return <FanProfile username={(await params).username}/>}
