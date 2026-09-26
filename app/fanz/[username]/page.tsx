import {FanProfile} from '@/components/fan-social';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{username:string}>}){const {username}=await params;return {title:`${username} Fan Profili`,robots:{index:false,follow:true}}}
export default async function Page({params}:{params:Promise<{username:string}>}){return <FanProfile username={(await params).username}/>}
