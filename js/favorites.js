/* RetroHub BR V12.4 — Favoritos usando a sessão real do site */
(function(){
  let activeSlug=null;
  let isFav=false;

  function client(){
    try{
      if(typeof retrohubSupabase!=="undefined" && retrohubSupabase?.from) return retrohubSupabase;
    }catch(_){}
    return window.retrohubSupabase || null;
  }

  async function currentUser(){
    // O site já mantém a sessão autenticada em retrohubSession.
    try{
      if(typeof retrohubSession!=="undefined" && retrohubSession?.user){
        return retrohubSession.user;
      }
    }catch(_){}

    const c=client();
    if(!c?.auth) return null;
    try{
      const {data,error}=await c.auth.getSession();
      if(error) throw error;
      return data?.session?.user || null;
    }catch(e){
      console.error("Favoritos/sessão:",e);
      return null;
    }
  }

  function currentSlug(){
    const pathMatch=(location.pathname||"").match(/^\/game\/([^/?#]+)/);
    if(pathMatch) return decodeURIComponent(pathMatch[1]);
    const hashMatch=(location.hash||"").match(/^#game=([^&]+)/);
    return hashMatch ? decodeURIComponent(hashMatch[1]) : null;
  }

  function paint(){
    const b=document.getElementById("retrohubFavoriteButton");
    if(!b) return;
    b.classList.toggle("is-favorite",isFav);
    b.innerHTML=isFav
      ? '<span class="retrohub-favorite-heart" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 21s-7-4.35-9.33-8.36C.5 8.91 2.24 4.5 6.5 4.5A5.46 5.46 0 0 1 12 7.57 5.46 5.46 0 0 1 17.5 4.5c4.26 0 6 4.41 3.83 8.14C19 16.65 12 21 12 21Z"/></svg></span><span>Favoritado</span>'
      : '<span class="retrohub-favorite-heart" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M16.5 3.5A5.5 5.5 0 0 0 12 5.9a5.5 5.5 0 0 0-4.5-2.4C3.36 3.5 1 6.77 1 10c0 5.2 6.35 9.1 11 11.9 4.65-2.8 11-6.7 11-11.9 0-3.23-2.36-6.5-6.5-6.5ZM12 19.55C7.72 16.92 3 13.72 3 10c0-2.15 1.46-4.5 4.5-4.5 1.92 0 3.62 1.17 4.5 2.96.88-1.79 2.58-2.96 4.5-2.96 3.04 0 4.5 2.35 4.5 4.5 0 3.72-4.72 6.92-9 9.55Z"/></svg></span><span>Favoritar</span>';
  }

  async function sync(){
    const b=document.getElementById("retrohubFavoriteButton");
    if(!b || !activeSlug) return;
    const u=await currentUser();
    if(!u){ isFav=false; paint(); return; }
    const c=client();
    if(!c) return;
    const {data,error}=await c.from("game_favorites")
      .select("id")
      .eq("user_id",u.id)
      .eq("game_slug",activeSlug)
      .maybeSingle();
    if(error){
      console.error("Favoritos/leitura:",error);
      return;
    }
    isFav=!!data;
    paint();
  }

  async function toggle(){
    const b=document.getElementById("retrohubFavoriteButton");
    if(!b || b.disabled) return;

    const u=await currentUser();
    if(!u){
      try{
        if(typeof openAccountPanel==="function"){
          openAccountPanel();
          if(typeof showAuthTab==="function") showAuthTab("login");
        }
      }catch(_){}
      return;
    }

    const c=client();
    if(!c){
      console.error("Favoritos: cliente Supabase não encontrado.");
      return;
    }

    b.disabled=true;
    try{
      if(isFav){
        const {error}=await c.from("game_favorites")
          .delete()
          .eq("user_id",u.id)
          .eq("game_slug",activeSlug);
        if(error) throw error;
        isFav=false;
      }else{
        const {error}=await c.from("game_favorites")
          .insert([{user_id:u.id,game_slug:activeSlug}]);
        if(error) throw error;
        isFav=true;
      }
      paint();
      if(typeof window.loadRetrohubProfileFavorites==='function') window.loadRetrohubProfileFavorites();
    }catch(e){
      console.error("RetroHub favoritos:",e);
      const msg=e?.message ? String(e.message) : "erro desconhecido";
      alert("Não foi possível atualizar o favorito.\\n\\nDetalhe: "+msg);
    }finally{
      b.disabled=false;
    }
  }

  function mount(){
    const s=currentSlug();
    const hero=document.querySelector("main.game-page section.game-hero");
    if(!s || !hero) return;
    activeSlug=s;

    let b=document.getElementById("retrohubFavoriteButton");
    if(!b){
      b=document.createElement("button");
      b.id="retrohubFavoriteButton";
      b.type="button";
      b.className="retrohub-favorite-button";
      b.addEventListener("click",toggle);
      (hero.querySelector(".game-hero-main")||hero).appendChild(b);
    }
    sync();
  }

  const observer=new MutationObserver(()=>{
    if(document.querySelector("main.game-page section.game-hero") &&
       !document.getElementById("retrohubFavoriteButton")){
      mount();
    }
  });

  function start(){
    observer.observe(document.body,{childList:true,subtree:true});
    mount();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start);
  else start();

  window.retrohubFavorites={refresh:mount};
})();
