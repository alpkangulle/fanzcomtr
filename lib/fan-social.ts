import {channelDb} from './channel-db';
export type Post={type:'fan';id:string;username:string;memberId:string;body:string;image:string;mediaUrl:string;mediaKind:string;theme:string;avatar:string;created:number;likes:number;comments:number;views:number;liked:boolean;mine:boolean};
export function validImage(value:unknown){return typeof value==='string'&&value.length<=180000&&/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/=]+$/.test(value)?value:''}
export async function posts(where:string,args:(string|number)[],viewer:string|null,limit=40):Promise<Post[]>{
 const db=channelDb();const rows=await db.prepare(`SELECT p.id,p.member_id AS memberId,m.username,p.body,p.image,p.media_url AS mediaUrl,p.media_kind AS mediaKind,p.theme,p.created,COALESCE(fp.avatar,'') AS avatar,
 (SELECT COUNT(*) FROM fan_post_likes l WHERE l.post_id=p.id) AS likes,
 (SELECT COUNT(*) FROM fan_post_comments c WHERE c.post_id=p.id AND c.deleted=0) AS comments,
 (SELECT COUNT(*) FROM fan_post_views v WHERE v.post_id=p.id) AS views,
 CASE WHEN EXISTS(SELECT 1 FROM fan_post_likes l WHERE l.post_id=p.id AND l.member_id=?) THEN 1 ELSE 0 END AS liked
 FROM fan_posts p JOIN members m ON m.id=p.member_id LEFT JOIN fan_profiles fp ON fp.member_id=m.id
 WHERE p.deleted=0 AND (${where}) ORDER BY p.created DESC LIMIT ?`).bind(viewer??'',...args,limit).all();
 return rows.results.map(r=>({type:'fan' as const,id:String(r.id),memberId:String(r.memberId),username:String(r.username),body:String(r.body),image:String(r.image),mediaUrl:String(r.mediaUrl),mediaKind:String(r.mediaKind),theme:String(r.theme),avatar:String(r.avatar),created:Number(r.created),likes:Number(r.likes),comments:Number(r.comments),views:Number(r.views),liked:!!r.liked,mine:r.memberId===viewer}));
}
export async function profile(memberId:string,viewer:string|null){const db=channelDb();const p=await db.prepare(`SELECT m.id,m.username,COALESCE(fp.bio,'') AS bio,COALESCE(fp.avatar,'') AS avatar,
 (SELECT COUNT(*) FROM fan_follows f WHERE f.followed_id=m.id) AS followers,
 (SELECT COUNT(*) FROM fan_follows f WHERE f.follower_id=m.id) AS following,
 (SELECT COUNT(*) FROM fan_posts p WHERE p.member_id=m.id AND p.deleted=0) AS posts,
 CASE WHEN EXISTS(SELECT 1 FROM fan_follows f WHERE f.follower_id=? AND f.followed_id=m.id) THEN 1 ELSE 0 END AS followed
 FROM members m LEFT JOIN fan_profiles fp ON fp.member_id=m.id WHERE m.id=?`).bind(viewer??'',memberId).first();return p?{...p,mine:memberId===viewer}:null}
