import {siteOrigin} from '@/lib/seo';
import {burakBulutSeo} from '@/lib/burak-bulut-seo';
type Item={name:string;path:string};
export default function BurakBulutSectionSchema({section='',items=[]}:{section?:string;items?:Item[]}){
 const path='/burak-bulut'+(section?'/'+section:''),url=siteOrigin+path;
 const meta=burakBulutSeo[section]??burakBulutSeo[''];
 const artist={'@type':'Person','@id':siteOrigin+'/burak-bulut#artist',name:'Burak Bulut',url:siteOrigin+'/burak-bulut',image:siteOrigin+'/images/artists/burak-bulut.png',sameAs:['https://music.apple.com/tr/artist/burak-bulut/841584918']};
 const label:Record<string,string>={biyografi:'Biyografi',haberler:'Haberler',konserler:'Konserler',albumler:'Diskografi',galeri:'Galeri',sarkilar:'Şarkılar','sarki-sozleri':'Şarkı rehberi'};
 const crumbs=[{name:'Fanz',item:siteOrigin+'/'},{name:'Burak Bulut',item:siteOrigin+'/burak-bulut'},...(section?[{name:label[section]??section,item:url}]:[])];
 const graph={'@context':'https://schema.org','@graph':[artist,{'@type':section==='biyografi'?'AboutPage':section==='galeri'?'ImageGallery':'CollectionPage','@id':url+'#webpage',url,name:meta.title,description:meta.description,inLanguage:'tr-TR',about:{'@id':artist['@id']},isPartOf:{'@type':'WebSite',name:'Fanz.com.tr',url:siteOrigin+'/'},primaryImageOfPage:{'@type':'ImageObject',url:artist.image},breadcrumb:{'@id':url+'#breadcrumb'},...(items.length?{mainEntity:{'@type':'ItemList',numberOfItems:items.length,itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,url:siteOrigin+item.path}))}}:{})},{'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))}]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/>;
}
