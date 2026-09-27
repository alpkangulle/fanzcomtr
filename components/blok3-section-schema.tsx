import {siteOrigin} from '@/lib/seo';
import {blok3Seo} from '@/lib/blok3-seo';
type Item={name:string;path:string};
export default function Blok3SectionSchema({section='',items=[]}:{section?:string;items?:Item[]}){
 const path='/blok3'+(section?'/'+section:''),url=siteOrigin+path;
 const meta=blok3Seo[section]??blok3Seo[''];
 const artist={'@type':'Person','@id':siteOrigin+'/blok3#artist',name:'BLOK3',url:siteOrigin+'/blok3',image:siteOrigin+'/images/artists/blok3.jpg',sameAs:['https://music.apple.com/us/artist/blok3/1793856618']};
 const label:Record<string,string>={biyografi:'Biyografi',haberler:'Haberler',konserler:'Konserler',albumler:'Diskografi',galeri:'Galeri',sarkilar:'Şarkılar','sarki-sozleri':'Şarkı rehberi'};
 const crumbs=[{name:'Fanz',item:siteOrigin+'/'},{name:'BLOK3',item:siteOrigin+'/blok3'},...(section?[{name:label[section]??section,item:url}]:[])];
 const graph={'@context':'https://schema.org','@graph':[artist,{'@type':section==='biyografi'?'AboutPage':section==='galeri'?'ImageGallery':'CollectionPage','@id':url+'#webpage',url,name:meta.title,description:meta.description,inLanguage:'tr-TR',about:{'@id':artist['@id']},isPartOf:{'@type':'WebSite',name:'Fanz.com.tr',url:siteOrigin+'/'},primaryImageOfPage:{'@type':'ImageObject',url:artist.image},breadcrumb:{'@id':url+'#breadcrumb'},...(items.length?{mainEntity:{'@type':'ItemList',numberOfItems:items.length,itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,url:siteOrigin+item.path}))}}:{})},{'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))}]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/>;
}
