export const siteConfig={name:'Fanz',mark:'Fanz',description:'Sevdiğin sanatçının hayranlarıyla aynı kanalda buluş.'};
export const artistIds=['semicenk','blok3','tarkan','mabel-matiz','manifest','sezen-aksu','duman','hadise','ceza'] as const;
export const sections=[{slug:'haberler',label:'Haberler'},{slug:'konserler',label:'Konserler'},{slug:'albumler',label:'Albümler'},{slug:'biyografi',label:'Biyografi'},{slug:'galeri',label:'Galeri'},{slug:'sarki-sozleri',label:'Şarkı sözleri'}];
export function validArtist(id:string){return artistIds.some(a=>a===id)}
