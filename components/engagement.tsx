'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Dialog} from 'radix-ui';
import {Eye,Heart,MessageCircle,X,ChevronUp,ChevronDown} from 'lucide-react';
type Member={id:string;username:string};
type Comment={id:string;body:string;created:number;username:string;mine:number;likes:number;liked:number};
type Data={likes:number;liked:boolean;comments:Comment[];commentCount:number;member:Member|null;hasMore:boolean};
export default function Engagement({target,follow}:{target:string;follow?:{count:number;followed:boolean;toggle:()=>void}}){
 const [mounted,setMounted]=useState(false),[dismissed,setDismissed]=useState(true),[data,setData]=useState<Data|null>(null),[views,setViews]=useState(0);
 const [open,setOpen]=useState(false),[gate,setGate]=useState(false),[sort,setSort]=useState<'popular'|'new'>('popular');
 const [all,setAll]=useState<Comment[]>([]),[hasMore,setHasMore]=useState(false),[loading,setLoading]=useState(false);
 const [guestName,setGuestName]=useState(''),[body,setBody]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [mode,setMode]=useState<'register'|'login'>('login'),[name,setName]=useState(''),[password,setPassword]=useState(''),[loginError,setLoginError]=useState('');
 const startY=useRef<number|null>(null),[drag,setDrag]=useState(0),opener=useRef<HTMLElement|null>(null),requestVersion=useRef(0);
 const query='/api/engagement?target='+encodeURIComponent(target)+'&sort='+sort;
 const load=useCallback(async()=>{
  const version=++requestVersion.current;
  try{const [r,s]=await Promise.all([fetch(query+'&limit=5',{cache:'no-store'}),fetch('/api/engagement/stats?targets='+encodeURIComponent(target),{cache:'no-store'})]);
   if(r.ok){const v=await r.json(),count=s.ok?(await s.json()).stats?.[target]?.views??0:0;if(version!==requestVersion.current)return;setData(v);setViews(count);document.dispatchEvent(new CustomEvent('fans:stats',{detail:{target,likes:v.likes,comments:v.commentCount,views:count}}))}
  }catch{setError('Yorumlar yüklenemedi. Yeniden deneyebilirsin.')}
 },[query,target]);
 useEffect(()=>{setMounted(true);setDismissed(true);setOpen(false);setData(null);setNotice('');setBody('');void fetch('/api/views',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target})}).then(()=>load()).catch(()=>load())},[target]);
 useEffect(()=>{void load()},[load]);
 useEffect(()=>{
  if(!open)return;const controller=new AbortController();setLoading(true);setAll([]);setDrag(0);
  fetch(query+'&limit=50',{cache:'no-store',signal:controller.signal}).then(async r=>{const v=await r.json();if(!r.ok)throw Error(v.error);setAll(v.comments);setHasMore(v.hasMore)}).catch(e=>{if(!controller.signal.aborted)setError(e.message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[open,query]);
 async function more(){setLoading(true);try{const r=await fetch(query+'&limit=50&offset='+all.length,{cache:'no-store'}),v=await r.json();if(!r.ok)throw Error(v.error);setAll(old=>[...old,...v.comments.filter((c:Comment)=>!old.some(o=>o.id===c.id))]);setHasMore(v.hasMore)}catch(e){setError(e instanceof Error?e.message:'Yorumlar yüklenemedi.')}finally{setLoading(false)}}
 function show(){opener.current=document.activeElement as HTMLElement;setOpen(true)}
 async function act(action:'like'|'comment'){
  if(action==='like'&&!data?.member){setGate(true);return}
  setBusy(true);setError('');setNotice('');
  try{const r=await fetch('/api/engagement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target,action,body,name:guestName})}),v=await r.json();
   if(!r.ok)throw Error(v.error??'İşlem tamamlanamadı.');
   if(action==='comment'){setBody('');setNotice(v.message)}await load();
  }catch(e){setError(e instanceof Error?e.message:'Bağlantıyı kontrol edip tekrar dene.')}finally{setBusy(false)}
 }
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setLoginError('');try{
  const r=await fetch('/api/member/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:mode,username:name,password})}),v=await r.json();
  if(!r.ok)throw Error(v.error);setPassword('');setGate(false);await load();
 }catch(e){setLoginError(e instanceof Error?e.message:'Giriş yapılamadı.')}finally{setBusy(false)}}
 async function likeComment(id:string){
  if(!data?.member){setGate(true);return}setBusy(true);
  try{const r=await fetch('/api/engagement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({target,action:'comment_like',commentId:id})});if(!r.ok)throw Error('Beğeni kaydedilemedi.');
   setAll(old=>old.map(c=>c.id===id?{...c,liked:c.liked?0:1,likes:c.likes+(c.liked?-1:1)}:c));await load();
  }catch(e){setError(e instanceof Error?e.message:'İşlem başarısız.')}finally{setBusy(false)}
 }
 async function remove(id:string){setBusy(true);try{const r=await fetch('/api/engagement',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});if(!r.ok)throw Error('Yorum silinemedi.');setAll(old=>old.filter(c=>c.id!==id));await load()}catch(e){setError(e instanceof Error?e.message:'İşlem başarısız.')}finally{setBusy(false)}}
 const comments=(rows:Comment[],preview=false)=>rows.map(c=><article key={c.id} className={preview?'comment-preview':'comment-full'}><div className="comment-byline"><strong>{c.username}</strong><time dateTime={new Date(c.created).toISOString()}>{new Date(c.created).toLocaleDateString('tr-TR')}</time></div><p>{c.body}</p><div className="comment-tools"><button className="comment-like" aria-label={c.username+' yorumunu beğen'} aria-pressed={!!c.liked} disabled={busy} onClick={()=>void likeComment(c.id)}><Heart size={15} fill={c.liked?'currentColor':'none'}/>{c.likes}</button>{preview&&c.body.length>160&&<button onClick={show}>Devamını oku</button>}{c.mine===1&&<button disabled={busy} onClick={()=>void remove(c.id)}>Sil</button>}</div></article>);
 const composer=<form className="guest-comment-form" onSubmit={e=>{e.preventDefault();void act('comment')}}>{data?.member?<p className="comment-member">{data.member.username} olarak yorum yapıyorsun.</p>:<label>İsmin<input name="guestName" autoComplete="nickname" minLength={2} maxLength={50} required value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="Görünecek ismin"/></label>}<label>Yorumun<textarea name="comment" required maxLength={600} value={body} onChange={e=>setBody(e.target.value)} placeholder="Düşüncelerini paylaş…"/></label><div className="comment-submit-row"><span>Yorumun onaylandıktan sonra yayımlanır.</span><button className="primary" type="submit" disabled={busy||!body.trim()||(!data?.member&&guestName.trim().length<2)}>{busy?'Gönderiliyor…':'Yorumu gönder'}</button></div>{notice&&<p className="comment-success" role="status">{notice}</p>}{error&&<p className="engagement-error" role="alert">{error}</p>}</form>;
 const dock=dismissed?<button className="engagement-restore" onClick={()=>setDismissed(false)} aria-label="Beğeni kutusunu aç"><Heart size={20}/></button>:<div className="engagement-dock" aria-label="İçerik etkileşimi"><button className="engagement-dismiss" aria-label="Beğeni kutusunu kapat" onClick={()=>setDismissed(true)}><X size={15}/></button><span className="dock-views"><Eye size={18}/>{views} görüntülenme</span><button onClick={()=>void act('like')} disabled={busy} aria-pressed={!!data?.liked}><Heart size={20} fill={data?.liked?'currentColor':'none'}/>{data?.likes??0} beğeni</button><button onClick={show}><MessageCircle size={20}/>{data?.commentCount??0} yorum</button>{follow&&<button className="dock-follow" onClick={follow.toggle}>{follow.followed?'Takiptesin':'Takip et'} · {follow.count}</button>}</div>;
 return <section className="engagement comment-section" aria-label="Beğeni ve yorumlar"><div className="comment-section-heading"><h2>Yorumlar <span>({data?.commentCount??0})</span></h2><button className="all-comments-button" onClick={show}>Tüm yorumlar <ChevronUp size={18}/></button></div><div className="comment-preview-list">{data?.comments.length?comments(data.comments.slice(0,5),true):<p>{data?'Henüz onaylanmış yorum yok. İlk yorumu sen yazabilirsin.':'Yorumlar yükleniyor…'}</p>}</div>{composer}
 {mounted&&createPortal(dock,document.body)}
 <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="comments-overlay"/><Dialog.Content className="comments-drawer" style={drag?{transform:'translate(-50%,'+drag+'px)'}:undefined} onCloseAutoFocus={e=>{e.preventDefault();opener.current?.focus()}}>
 <button className="drawer-grip" aria-label="Yorumları aşağı indir" onClick={()=>setOpen(false)} onPointerDown={e=>{startY.current=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(startY.current!==null)setDrag(Math.max(0,e.clientY-startY.current))}} onPointerUp={e=>{if(startY.current!==null&&e.clientY-startY.current>70)setOpen(false);startY.current=null;setDrag(0)}} onPointerCancel={()=>{startY.current=null;setDrag(0)}}><span/></button>
 <div className="sheet-header"><Dialog.Title>Yorumlar ({data?.commentCount??0})</Dialog.Title><Dialog.Close aria-label="Yorumları kapat"><ChevronDown size={24}/></Dialog.Close></div><Dialog.Description className="drawer-description">Onaylanmış yorumları oku veya düşünceni paylaş.</Dialog.Description><div className="comment-sort"><button aria-pressed={sort==='popular'} onClick={()=>setSort('popular')}>En beğenilenler</button><button aria-pressed={sort==='new'} onClick={()=>setSort('new')}>En yeniler</button></div><div className="drawer-scroll"><div className="comments">{comments(all)}</div>{loading&&<p role="status">Yorumlar yükleniyor…</p>}{!loading&&!all.length&&<p>Henüz onaylanmış yorum yok.</p>}{hasMore&&<button className="load-comments" disabled={loading} onClick={()=>void more()}>Daha fazla yorum göster</button>}{composer}</div></Dialog.Content></Dialog.Portal></Dialog.Root>
 <Dialog.Root open={gate} onOpenChange={setGate}><Dialog.Portal><Dialog.Overlay className="comments-overlay member-gate-overlay"/><Dialog.Content className="member-dialog comment-member-dialog"><Dialog.Close className="member-close" aria-label="Girişi kapat"><X size={20}/></Dialog.Close><Dialog.Title>Beğenmek için giriş yap</Dialog.Title><Dialog.Description>Yorum yazmak için üyelik gerekmez. Beğeniler hesabına bağlıdır.</Dialog.Description><div className="member-modes"><button aria-pressed={mode==='login'} onClick={()=>setMode('login')}>Giriş yap</button><button aria-pressed={mode==='register'} onClick={()=>setMode('register')}>Üye ol</button></div><form onSubmit={login}><label>Kullanıcı adı<input autoComplete="username" required minLength={3} maxLength={24} value={name} onChange={e=>setName(e.target.value)}/></label><label>Şifre<input type="password" autoComplete={mode==='register'?'new-password':'current-password'} required minLength={10} value={password} onChange={e=>setPassword(e.target.value)}/></label>{loginError&&<p role="alert">{loginError}</p>}<button className="primary" disabled={busy}>{mode==='login'?'Giriş yap':'Hesap oluştur'}</button></form></Dialog.Content></Dialog.Portal></Dialog.Root>
 </section>;
}
