import {channelDb} from './channel-db';

export type Shout={id:string;artist:string;username:string;body:string;created:number};

export async function artistShouts(artist?:string):Promise<Shout[]>{
 const db=channelDb();
 const result=artist
  ?await db.prepare('SELECT s.id,s.artist,m.username,s.body,s.created FROM artist_shouts s JOIN members m ON m.id=s.member_id WHERE s.deleted=0 AND s.artist=? ORDER BY s.created DESC LIMIT 24').bind(artist).all()
  :await db.prepare('SELECT s.id,s.artist,m.username,s.body,s.created FROM artist_shouts s JOIN members m ON m.id=s.member_id WHERE s.deleted=0 ORDER BY s.created DESC LIMIT 80').all();
 const rows=result.results as unknown as Shout[];
 if(artist)return rows;
 const groups=new Map<string,Shout[]>();
 for(const item of rows){const group=groups.get(item.artist)??[];group.push(item);groups.set(item.artist,group)}
 const mixed:Shout[]=[];
 while(mixed.length<24){let added=false;for(const group of groups.values()){const next=group.shift();if(next){mixed.push(next);added=true}}if(!added)break}
 return mixed;
}
