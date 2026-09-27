import {siteOrigin} from '@/lib/seo';
import {semicenkSeo} from '@/lib/semicenk-seo';
import {controlledMetadata} from '@/lib/seo-templates';
type Item={name:string;path:string};
export default function SemicenkSectionSchema({section='',items=[]}:{section?:string;items?:Item[]}){
 const path='/semicenk'+(section?'/'+section:''),url=siteOrigin+path;
 const fallback=semicenkSeo[section]??{title:'Semicenk Şarkıları ve Resmî Videoları',description:'Semicenk şarkılarının künyeleri, resmî videoları ve dinleme bağlantıları.'};
 const meta=controlledMetadata(path,fallback.title,fallback.description);
 const person={'@type':'Person','@id':siteOrigin+'/semicenk#artist',name:'Semicenk',alternateName:'Cenk Baş',jobTitle:'Şarkıcı ve söz yazarı',url:siteOrigin+'/semicenk',image:siteOrigin+'/images/artists/semicenk.png',sameAs:['https://music.apple.com/tr/artist/semicenk/1581975222']};
 const label:Record<string,string>={biyografi:'Biyografi',haberler:'Haberler',konserler:'Konserler',albumler:'Diskografi',galeri:'Galeri',sarkilar:'Şarkılar','sarki-sozleri':'Şarkı rehberi'};
 const crumbs=[{name:'Fanz',item:siteOrigin+'/'},{name:'Semicenk',item:siteOrigin+'/semicenk'},...(section?[{name:label[section]??section,item:url}]:[])];
 const graph={'@context':'https://schema.org','@graph':[person,{'@type':section==='biyografi'?'AboutPage':section==='galeri'?'ImageGallery':'CollectionPage','@id':url+'#webpage',url,name:meta.title,description:meta.description,inLanguage:'tr-TR',about:{'@id':person['@id']},isPartOf:{'@type':'WebSite',name:'Fanz.com.tr',url:siteOrigin+'/'},primaryImageOfPage:{'@type':'ImageObject',url:person.image},breadcrumb:{'@id':url+'#breadcrumb'},...(items.length?{mainEntity:{'@type':'ItemList',numberOfItems:items.length,itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,url:siteOrigin+item.path}))}}:{})},{'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))}]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/>;
}
