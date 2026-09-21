/* RetroHub BR V12.1 — Favoritos corrigido para a estrutura real da página */
(function(){
  let activeSlug=null;
  let isFav=false;

  function client(){
    // O app usa o cliente Supabase como variável lexical global.
    try { if(typeof supabaseClient!=="undefined") return supabaseClient; } catch(_){}
    try { if(typeof supabase!=="undefined" && supabase?.auth) return supabase; } catch(_){}
    return window.retrohubSupabase || window.supabaseClient || window._supabase || null;
  }
  async function getUser(){
    const c=client(); if(!c?.auth) return null;
    try { const {data}=await c.auth.getUser(); return data?.user||null; } catch(_){ return null; }
  }
  function slug(){
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
    const u=await getUser();
    if(!u){ isFav=false; paint(); return; }
    const c=client();
    const {data,error}=await c.from("game_favorites")
      .select("id").eq("user_id",u.id).eq("game_slug",activeSlug).maybeSingle();
    isFav=!error && !!data;
    paint();
  }
  async function toggle(){
    const b=document.getElementById("retrohubFavoriteButton");
    if(!b) return;
    const u=await getUser();
    if(!u){
      try{
        if(typeof openAccountPanel==="function") openAccountPanel();
        else if(typeof handleAccountButton==="function") handleAccountButton();
      }catch(_){}
      return;
    }
    const c=client(); if(!c) return;
    b.disabled=true;
    try{
      if(isFav){
        const {error}=await c.from("game_favorites").delete()
          .eq("user_id",u.id).eq("game_slug",activeSlug);
        if(error) throw error;
        isFav=false;
      }else{
        const {error}=await c.from("game_favorites").insert({user_id:u.id,game_slug:activeSlug});
        if(error) throw error;
        isFav=true;
      }
      paint();
    }catch(e){
      console.error("RetroHub favoritos:",e);
      alert("Não foi possível atualizar o favorito.");
    }finally{ b.disabled=false; }
  }
  function mount(){
    const s=slug();
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
      const main=hero.querySelector(".game-hero-main") || hero;
      main.appendChild(b);
    }
    sync();
  }

  // openGame troca o HTML sem disparar hashchange em todos os fluxos.
  // MutationObserver acompanha exatamente essa troca sem alterar app.js.
  const observer=new MutationObserver(()=>{
    if(document.querySelector("main.game-page section.game-hero") &&
       !document.getElementById("retrohubFavoriteButton")) mount();
  });
  function start(){
    observer.observe(document.body,{childList:true,subtree:true});
    mount();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start);
  else start();

  window.retrohubFavorites={refresh:mount};
})();
