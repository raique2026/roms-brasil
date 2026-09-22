const SB_URL="https://cybhsinaymvmgfwrhhvt.supabase.co",SB_KEY="sb_publishable_rlT-HHY5MTNgeBcNfLp01A_DCICFJzd",sb=window.supabase.createClient(SB_URL,SB_KEY);const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];async function adminRequired(){
  try{
    const {data:{session},error:sessionError}=await sb.auth.getSession();
    if(sessionError) throw sessionError;
    if(!session) return false;

    const {data:adminRow,error:adminError}=await sb
      .from("admin_users")
      .select("user_id")
      .eq("user_id",session.user.id)
      .maybeSingle();

    if(adminError) throw adminError;
    if(!adminRow){
      await sb.auth.signOut();
      $("#loginMsg").textContent="Esta conta não tem permissão de administrador.";
      return false;
    }

    $("#loginMsg").textContent="";
    $("#gate").hidden=true;
    $("#adminApp").hidden=false;
    $("#adminName").textContent=session.user.email||"Admin";
    loadDashboard().catch(err=>console.error("Dashboard:",err));
    return true;
  }catch(err){
    console.error("Admin auth:",err);
    $("#loginMsg").textContent="Erro ao validar o administrador. Atualize a página e tente novamente.";
    return false;
  }
}$("#loginForm").onsubmit=async e=>{
  e.preventDefault();
  const btn=$("#loginForm button");
  btn.disabled=true;
  $("#loginMsg").textContent="Entrando...";
  try{
    const {error}=await sb.auth.signInWithPassword({email:$("#email").value,password:$("#password").value});
    if(error){$("#loginMsg").textContent="E-mail ou senha inválidos.";return}
    const ok=await adminRequired();
    if(!ok && $("#loginMsg").textContent==="Entrando...") $("#loginMsg").textContent="Não foi possível abrir o painel.";
  }catch(err){
    console.error("Admin login:",err);
    $("#loginMsg").textContent="Erro ao entrar. Tente novamente.";
  }finally{btn.disabled=false}
};$("#logout").onclick=async()=>{await sb.auth.signOut();location.reload()};function showPage(id){$$(".page").forEach(x=>x.hidden=x.id!==id);$$("aside nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===id));$("#pageTitle").textContent=id==="newgame"?"Novo jogo":id[0].toUpperCase()+id.slice(1);if(id==="games")loadGames();if(id==="collections")loadCollections();if(id==="reports"||id==="broken")loadDashboard()}$$("aside nav button").forEach(b=>b.onclick=()=>showPage(b.dataset.page));$("#newGameBtn").onclick=()=>{resetForm();showPage("newgame")};async function loadDashboard(){
  const since=new Date(Date.now()-30*864e5).toISOString();
  const [views,downloads,reports,broken,panelGames]=await Promise.all([
    sb.from("site_pageviews").select("path,visitor_id").gte("created_at",since),
    sb.from("game_downloads").select("game_slug"),
    sb.from("comment_reports").select("id,comment_id,reason,status,created_at").eq("status","open"),
    sb.from("broken_link_reports").select("id,game_slug,status,created_at").eq("status","open"),
    sb.from("admin_games").select("id").eq("status","published")
  ]);
  const viewRows=views.data||[], downloadRows=downloads.data||[], reportRows=reports.data||[], brokenRows=broken.data||[];
  $("#publishedGames").textContent=gamesPublishedCount(panelGames.data||[]);
  $("#downloadsTotal").textContent=downloadRows.length;
  $("#commentReports").textContent=reportRows.length;
  $("#brokenReports").textContent=brokenRows.length;

  const dl={}; downloadRows.forEach(x=>dl[x.game_slug]=(dl[x.game_slug]||0)+1);
  $("#downloadsByGame").innerHTML=Object.entries(dl).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([g,n])=>`<div><span>${esc(g)}</span><b>${n}</b></div>`).join("")||"<p>Nenhum download registrado ainda.</p>";

  const counts={};viewRows.forEach(x=>counts[x.path]=(counts[x.path]||0)+1);
  $("#topPages").innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([p,n])=>`<div><span>${esc(p)}</span><b>${n}</b></div>`).join("")||"<p>Ainda não há pageviews registrados.</p>";
  $("#commentReportRows").innerHTML=reportRows.map(x=>`<div><b>Comentário denunciado</b><span>${esc(x.reason)}</span><button onclick="resolveCommentReport('${x.id}')">Resolver</button></div>`).join("")||"<p>Nenhuma denúncia pendente.</p>";
  $("#brokenReportRows").innerHTML=brokenRows.map(x=>`<div><b>${esc(x.game_slug)}</b><span>Link reportado como quebrado</span><button onclick="resolveBrokenReport('${x.id}')">Resolver</button></div>`).join("")||"<p>Nenhum link quebrado pendente.</p>";
}
function gamesPublishedCount(panelPublished){return panelPublished.length}
window.resolveCommentReport=async id=>{await sb.from("comment_reports").update({status:"resolved"}).eq("id",id);loadDashboard()};
window.resolveBrokenReport=async id=>{await sb.from("broken_link_reports").update({status:"resolved"}).eq("id",id);loadDashboard()};
let gameCache=[];async function loadGames(){const {data}=await sb.from("admin_games").select("*").order("updated_at",{ascending:false});gameCache=data||[];renderGames()}function renderGames(){const q=$("#gameSearch").value.toLowerCase();$("#gamesRows").innerHTML=gameCache.filter(g=>(g.title+" "+g.platform).toLowerCase().includes(q)).map(g=>`<tr><td><b>${esc(g.title)}</b><br><small>${esc(g.slug)}</small></td><td>${esc(g.platform)}</td><td><span class="badge ${g.status}">${g.status==="published"?"Publicado":"Rascunho"}</span></td><td>${new Date(g.updated_at).toLocaleDateString("pt-BR")}</td><td><button onclick="editGame('${g.id}')">Editar</button></td></tr>`).join("")}$("#gameSearch").oninput=renderGames;function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}function resetForm(){$("#gameForm").reset();$("#gameId").value="";$("#formTitle").textContent="Adicionar jogo";$("#gameMsg").textContent=""}window.editGame=id=>{const g=gameCache.find(x=>x.id===id);if(!g)return;showPage("newgame");$("#gameId").value=g.id;$("#formTitle").textContent="Editar jogo";Object.keys(g).forEach(k=>{const el=$("#gameForm").elements[k];if(el)el.value=k==="screenshots"?(g[k]||[]).join("\n"):(g[k]??"")})};function payload(status){const fd=new FormData($("#gameForm")),o=Object.fromEntries(fd.entries());o.retroachievements_game_id=o.retroachievements_game_id?Number(o.retroachievements_game_id):null;o.screenshots=(o.screenshots||"").split("\n").map(x=>x.trim()).filter(Boolean);o.featured=$("#gameForm").elements.featured.checked;o.rating=o.rating?Number(o.rating):null;o.status=status;o.updated_at=new Date().toISOString();if(status==="published")o.published_at=new Date().toISOString();return o}async function save(status){const id=$("#gameId").value,p=payload(status);const r=id?await sb.from("admin_games").update(p).eq("id",id).select().single():await sb.from("admin_games").insert(p).select().single();$("#gameMsg").textContent=r.error?r.error.message:(status==="published"?"Jogo publicado no painel.":"Rascunho salvo.");if(r.data)$("#gameId").value=r.data.id;await loadDashboard()}$("#gameForm").onsubmit=async e=>{e.preventDefault();await save("published")};$("#saveDraft").onclick=()=>save("draft");adminRequired();
window.viewGame=slug=>window.open("/game/"+encodeURIComponent(slug),"_blank");
window.deleteGame=async function(id){
 if(!confirm("Excluir este jogo do painel?"))return;
 const {error}=await sb.from("admin_games").delete().eq("id",id);
 if(error)return alert(error.message);
 await loadGames();await loadDashboard();
};
async function loadCollections(){
 const [{data:cols},{data:items}]=await Promise.all([sb.from("game_collections").select("*").order("created_at",{ascending:false}),sb.from("game_collection_items").select("*")]);
 const its=items||[];
 $("#collectionRows").innerHTML=(cols||[]).map(x=>'<div class="admin-row"><div><b>'+esc(x.title)+'</b><small>'+its.filter(i=>i.collection_id===x.id).length+' jogos · '+(x.status==="published"?"Publicada":"Rascunho")+'</small></div><button onclick="manageCollection(\''+x.id+'\')">Editar jogos</button><button class="danger" onclick="deleteCollection(\''+x.id+'\')">Excluir</button></div>').join("")||"<p>Nenhuma coleção criada.</p>";
}
$("#createCollection").onclick=async()=>{
 const title=$("#collectionTitle").value.trim();if(!title)return;
 const slug=title.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
 const {error}=await sb.from("game_collections").insert({title,slug,status:"published"});
 if(error)return alert(error.message);$("#collectionTitle").value="";loadCollections();
};
window.deleteCollection=async id=>{if(confirm("Excluir esta coleção?")){await sb.from("game_collections").delete().eq("id",id);loadCollections()}};
window.manageCollection=async id=>{
 await loadGames();
 const {data:current}=await sb.from("game_collection_items").select("game_slug").eq("collection_id",id);
 const selected=new Set((current||[]).map(x=>x.game_slug));
 const raw=prompt("Slugs dos jogos separados por vírgula:",[...selected].join(", "));
 if(raw===null)return;
 const slugs=raw.split(",").map(x=>x.trim()).filter(Boolean);
 await sb.from("game_collection_items").delete().eq("collection_id",id);
 if(slugs.length)await sb.from("game_collection_items").insert(slugs.map((game_slug,position)=>({collection_id:id,game_slug,position})));
 loadCollections();
};
