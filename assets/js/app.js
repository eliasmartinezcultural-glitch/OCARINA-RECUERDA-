const state={items:[],query:"",type:"",theme:"",period:""};
const $=s=>document.querySelector(s);
const normalize=value=>(value||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function allText(item){return [item.title,item.creator,item.year,item.description,item.type,item.theme,item.period,item.sourceName,...(item.tags||[])].join(" ");}
function optionList(select,values,label){[...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es")).forEach(value=>{const o=document.createElement("option");o.value=value;o.textContent=value;select.append(o);});}
function render(){
 const filtered=state.items.filter(item=>(!state.type||item.type===state.type)&&(!state.theme||item.theme===state.theme)&&(!state.period||item.period===state.period)&&(!state.query||normalize(allText(item)).includes(normalize(state.query))));
 $("#resultCount").textContent=filtered.length+" materiales en el catálogo";
 const grid=$("#catalogGrid");grid.replaceChildren();
 if(!filtered.length){const p=document.createElement("p");p.className="empty-state";p.textContent="No encontramos materiales con esos filtros. Probá con otra palabra o quitá algún filtro.";grid.append(p);return;}
 filtered.forEach(item=>{
  const card=document.createElement("article");card.className="document-card";
  const type=document.createElement("span");type.className="doc-type";type.textContent=item.type;
  const title=document.createElement("h3");title.textContent=item.title;
  const desc=document.createElement("p");desc.textContent=item.description;
  const meta=document.createElement("div");meta.className="doc-meta";meta.textContent=[item.creator,item.year,item.theme].filter(Boolean).join(" · ");
  card.append(type,title,desc,meta);
  if(item.url){const link=document.createElement("a");link.href=item.url;link.target="_blank";link.rel="noopener";link.textContent="Consultar fuente original ↗";card.append(link);}
  grid.append(card);
 });
}
async function init(){
 try{
  const response=await fetch("data/catalogo.json");
  if(!response.ok)throw new Error("No se pudo cargar el catálogo");
  const data=await response.json();state.items=data.items||[];
  optionList($("#typeFilter"),state.items.map(x=>x.type),"Todos los formatos");
  optionList($("#themeFilter"),state.items.map(x=>x.theme),"Todos los temas");
  optionList($("#periodFilter"),state.items.map(x=>x.period),"Todas las épocas");
  render();
 }catch(error){$("#resultCount").textContent="Catálogo no disponible";$("#catalogGrid").innerHTML='<p class="empty-state">No se pudo cargar el archivo documental. Volvé a intentar más tarde.</p>';}
}
$("#searchInput").addEventListener("input",e=>{state.query=e.target.value;render();});
$("#typeFilter").addEventListener("change",e=>{state.type=e.target.value;render();});
$("#themeFilter").addEventListener("change",e=>{state.theme=e.target.value;render();});
$("#periodFilter").addEventListener("change",e=>{state.period=e.target.value;render();});
$("#clearSearch").addEventListener("click",()=>{$("#searchInput").value="";state.query="";render();});
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mainNav");const open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
document.querySelectorAll(".room-card").forEach(card=>card.addEventListener("click",()=>{const room=card.dataset.room;$("#themeFilter").value=room;state.theme=room;render();}));
init();