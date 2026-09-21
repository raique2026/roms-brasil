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
    const m=(location.hash||"").match(/^#game=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function paint(){
    const b=document.getElementById("retrohubFavoriteButton");
    if(!b) return;
    b.classList.toggle("is-favorite",isFav);
    b.innerHTML=isFav
      ? '<span class="retrohub-favorite-heart">♥</span><span>Favoritado</span>'
      : '<span class="retrohub-favorite-heart">♡</span><span>Favoritar</span>';
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
