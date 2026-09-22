(async function(){
 try{
  const [{data:cols},{data:items}]=await Promise.all([
   retrohubSupabase.from("game_collections").select("id,title,slug").eq("status","published").order("created_at"),
   retrohubSupabase.from("game_collection_items").select("collection_id,game_slug,position").order("position")
  ]);
  if(!cols?.length)return;
  const grouped={};(items||[]).forEach(x=>(grouped[x.collection_id]??=[]).push(x.game_slug));
  function install(){
   const nav=document.getElementById("filters");if(!nav||nav.querySelector(".rh-collections-menu"))return;
   const wrap=document.createElement("div");wrap.className="main-menu-item rh-collections-menu";
   wrap.innerHTML='<button class="main-menu-btn" type="button">COLEÇÕES <span class="menu-chevron">⌄</span></button><div class="dropdown-menu">'+cols.map(c=>'<button data-col="'+c.id+'">'+c.title.replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))+'</button>').join("")+'</div>';
   wrap.querySelectorAll("[data-col]").forEach(b=>b.onclick=()=>{window.retrohubCollectionSlugs=grouped[b.dataset.col]||[];currentPlatform="Todos";currentGenre="Todos";dubbedOnly=false;renderFilters();renderHome();setTimeout(install,0)});
   nav.insertBefore(wrap,nav.lastElementChild);
  }
  window.clearRetrohubCollection=()=>{window.retrohubCollectionSlugs=null;renderHome()};
  install();new MutationObserver(()=>install()).observe(document.getElementById("filters"),{childList:true});
 }catch(e){console.warn("Coleções:",e)}
})();