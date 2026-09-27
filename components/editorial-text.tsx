export default function EditorialText({text}:{text:string}){
 return <div className="editorial-prose">{text.split(/\n\n+/).filter(Boolean).map((block,i)=>{
 const lines=block.split('\n');const heading=lines[0].startsWith('## ');
 return <div key={i}>{heading&&<h3>{lines[0].slice(3)}</h3>}{(heading?lines.slice(1):lines).map((line,j)=><p key={j}>{line}</p>)}</div>
 })}</div>
}
