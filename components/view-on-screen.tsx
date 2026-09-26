'use client';
import {useEffect,useRef} from 'react';
export default function ViewOnScreen({target}:{target:string}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;let visible=false;const observer=new IntersectionObserver(entries=>{const next=entries[0].intersectionRatio>=.55;if(next&&!visible){void fetch('/api/views',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target})}).then(r=>r.json()).then(v=>{if(typeof v.views==='number')document.dispatchEvent(new CustomEvent('fans:stats',{detail:{target,views:v.views}}))}).catch(()=>{})}visible=next},{threshold:[0,.55,1]});observer.observe(el);return()=>observer.disconnect()},[target]);return <span className="view-observer" ref={ref} aria-hidden="true"/>;
}
