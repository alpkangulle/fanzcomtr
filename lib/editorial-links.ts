export type EditorialLink={label:string;href:string};
export function linkParts(text:string,links:EditorialLink[],used:Set<string>,limit=6){
 const matches:Array<{start:number;end:number;link:EditorialLink}>=[];
 for(const link of links){
  if(used.has(link.href)||link.label.length<4)continue;
  let start=text.indexOf(link.label);
  while(start!==-1){const end=start+link.label.length;
   if(!/[\p{L}\p{N}]/u.test(text[start-1]??'')&&!/[\p{L}\p{N}]/u.test(text[end]??'')){matches.push({start,end,link});break}
   start=text.indexOf(link.label,start+1);
  }
 }
 matches.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
 const result:Array<string|EditorialLink>=[];let cursor=0;
 for(const match of matches){if(match.start<cursor||used.has(match.link.href)||used.size>=limit)continue;result.push(text.slice(cursor,match.start),match.link);cursor=match.end;used.add(match.link.href)}
 result.push(text.slice(cursor));return result;
}
