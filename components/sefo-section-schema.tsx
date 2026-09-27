import {siteOrigin} from '@/lib/seo';
import {sefoSeo} from '@/lib/sefo-seo';
type Item={name:string;path:string};
export default function SefoSectionSchema({section='',items=[]}:{section?:string;items?:Item[]}){
 const path='/sefo'+(section?'/'+section:''),url=siteOrigin+path,meta=sefoSeo[section]??sefoSeo[''];
 const artist={'@type':'Person','@id':siteOrigin+'/sefo#artist',name:'Sefo',url:siteOrigin+'/sefo',image:siteOrigin+'/images/artists/sefo.png',sameAs:['https://music.apple.com/tr/artist/sefo/1360733410','https://www.youtube.com/@sefo362']};
 const labels:Record<string,string>={biyografi:'Biyografi',haberler:'Haberler',konserler:'Konserler',albumler:'Diskografi',galeri:'Galeri',sarkilar:'Şarkılar','sarki-sozleri':'Şarkı rehberi'};
 const crumbs=[{name:'Fanz',item:siteOrigin+'/'},{name:'Sefo',item:siteOrigin+'/sefo'},...(section?[{name:labels[section]??section,item:url}]:[])];
 const graph={'@context':'https://schema.org','@graph':[artist,{'@type':section==='biyografi'?'AboutPage':section==='galeri'?'ImageGallery':'CollectionPage','@id':url+'#webpage',url,name:meta.title,description:meta.description,inLanguage:'tr-TR',about:{'@id':artist['@id']},isPartOf:{'@type':'WebSite',name:'Fanz.com.tr',url:siteOrigin+'/'},primaryImageOfPage:{'@type':'ImageObject',url:artist.image},breadcrumb:{'@id':url+'#breadcrumb'},...(items.length?{mainEntity:{'@type':'ItemList',numberOfItems:items.length,itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,url:siteOrigin+item.path}))}}:{})},{'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))}]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/>;
}
