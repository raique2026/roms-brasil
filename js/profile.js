/*
 * RetroHub BR — Perfil, destaques, nível/XP e insígnias
 * Extraído do app.js na Etapa 2.
 * Mantém as funções globais chamadas pelo HTML e pelos demais módulos.
 */

async function loadRetrohubProfile(){
  if(!retrohubSession?.user) return;
  const { data, error } = await retrohubSupabase
    .from("profiles").select("*").eq("id", retrohubSession.user.id).single();
  if(!error) retrohubProfile = data;
  const savedHighlights=retrohubSession?.user?.user_metadata?.profile_highlights;
  if(savedHighlights && typeof savedHighlights === "object") localStorage.setItem("retrohub_profile_highlights",JSON.stringify(savedHighlights));
  refreshRetrohubAccountUI();
}

function avatarFallback(){
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><rect width="100%" height="100%" fill="#ffffff"/></svg>'
  );
}

function refreshRetrohubAccountUI(){
  const logged = !!retrohubSession?.user;
  document.getElementById("authView").hidden = logged;
  document.getElementById("profileView").hidden = !logged;
  const btnText = document.getElementById("accountButtonText");
  const mini = document.getElementById("accountAvatarMini");

  if(!logged){
    if(btnText) btnText.textContent = "Entrar";
    if(mini) mini.innerHTML = "👤";
    return;
  }

  const username = retrohubProfile?.username || retrohubSession.user.user_metadata?.username || "Perfil";
  if(btnText) btnText.textContent = "Perfil";
  const profileUsernameEl = document.getElementById("profileUsername");
  if(profileUsernameEl) profileUsernameEl.textContent = "@" + username;
  const profileUsernameInput=document.getElementById("profileUsernameInput");
  if(profileUsernameInput) profileUsernameInput.value=username;
  // profileEmail foi removido do novo editor. Nunca tente escrever em um elemento inexistente.
  const profileEmailEl = document.getElementById("profileEmail");
  if(profileEmailEl) profileEmailEl.textContent = retrohubSession.user.email || "";
  const profileRAInputEl = document.getElementById("profileRAInput");
  if(profileRAInputEl) profileRAInputEl.value = retrohubProfile?.retroachievements_username || "";
  const profileRAHeaderEl = document.getElementById("profileRAHeader");
  if(profileRAHeaderEl) profileRAHeaderEl.textContent =
    retrohubProfile?.retroachievements_username || "RetroAchievements";
  const avatar = retrohubProfile?.avatar_url || "";
  const profileAvatarEl=document.getElementById("profileAvatar");
  if(avatar){
    profileAvatarEl.classList.remove("avatar-empty");
    profileAvatarEl.onerror=()=>{profileAvatarEl.onerror=null;profileAvatarEl.removeAttribute("src");profileAvatarEl.classList.add("avatar-empty");};
    profileAvatarEl.src = avatar;
  }else{
    profileAvatarEl.removeAttribute("src");
    profileAvatarEl.classList.add("avatar-empty");
  }
  if(mini) mini.innerHTML = avatar ? `<img src="${avatar}" alt="" onerror="this.remove()">` : "👤";
  const wallpaperPreview=document.getElementById("wallpaperPreview");
  if(wallpaperPreview){
    const wallpaper=retrohubProfile?.wallpaper_url||"";
    wallpaperPreview.style.backgroundImage=wallpaper?`linear-gradient(rgba(8,13,27,.28),rgba(8,13,27,.28)),url("${wallpaper.replace(/"/g,"%22")}")`:"none";
    wallpaperPreview.textContent=wallpaper?"":"Nenhum papel de parede";
  }

  if(retrohubProfile?.retroachievements_username){
    localStorage.setItem("retrohub_ra_user", retrohubProfile.retroachievements_username);
  }
}

async function saveRetrohubProfile(event){
  event.preventDefault();
  if(!retrohubSession?.user){
    closeAccountPanel();
    openAccountPanel();
    return;
  }

  const submit = event.submitter || event.currentTarget?.querySelector('button[type="submit"]');
  if(submit) submit.disabled = true;

  const raInput = document.getElementById("profileRAInput");
  const ra = (raInput?.value || "").trim();
  if(ra && !/^[A-Za-z0-9_-]{1,50}$/.test(ra)){
    if(submit) submit.disabled = false;
    return setAccountMessage("profileMessage","Usuário do RetroAchievements inválido.");
  }

  const usernameInput=(document.getElementById("profileUsernameInput")?.value||"").trim();
  if(supporterCan(2) && !/^[A-Za-z0-9_]{3,24}$/.test(usernameInput)){
    if(submit) submit.disabled=false;
    return setAccountMessage("profileMessage","Nome de usuário inválido. Use 3 a 24 letras, números ou _.");
  }

  const highlights = {
    game: document.getElementById("favoriteGameSelect")?.value || "",
    achievement: document.getElementById("favoriteAchievementSelect")?.value || "",
    badge: document.getElementById("favoriteBadgeSelect")?.value || ""
  };

  try {
    setAccountMessage("profileMessage","Salvando...", true);

    const { data, error } = await retrohubSupabase
      .from("profiles")
      .update({
        retroachievements_username: ra || null,
        ...(supporterCan(2)?{username:(document.getElementById("profileUsernameInput")?.value||username).trim()}:{}),
        ...(supporterCan(1)?{profile_accent:document.getElementById("profileAccentPreset")?.value||null}:{}),
        ...(supporterCan(2)?{profile_custom_color:document.getElementById("profileCustomColor")?.value||null}:{}),
        ...(supporterCan(3)?{
          avatar_border:document.getElementById("profileAvatarBorder")?.value||"none",
          profile_effect:document.getElementById("profileEffect")?.value||"none"
        }:{})
      })
      .eq("id", retrohubSession.user.id)
      .select()
      .single();

    if(error) throw error;

    retrohubProfile = data;
    if(ra) localStorage.setItem("retrohub_ra_user", ra);
    else localStorage.removeItem("retrohub_ra_user");
    localStorage.setItem("retrohub_profile_highlights", JSON.stringify(highlights));

    // Primeiro sai do editor e mostra o perfil. O usuário não precisa apertar X.
    closeAccountPanel();
    await openFullRetrohubProfile({ replaceHistory: true });

    // Depois sincroniza as preferências na conta. Isso não bloqueia a navegação.
    try {
      const { data: authData, error: authError } =
        await retrohubSupabase.auth.updateUser({ data: { profile_highlights: highlights } });
      if(!authError && authData?.user && retrohubSession){
        retrohubSession = { ...retrohubSession, user: authData.user };
      }
    } catch(syncError) {
      console.warn("Preferências mantidas localmente; sincronização remota falhou:", syncError);
    }

    // Re-render final para refletir imediatamente jogo/conquista/insígnia escolhidos.
    if(location.hash === "#profile") await renderRetrohubProfilePage();
  } catch(error) {
    console.error("Erro ao salvar perfil RetroHub:", error);
    setAccountMessage("profileMessage", error?.message || "Não foi possível salvar o perfil.");
    // Em caso de erro real, mantenha o editor aberto para o usuário ver a mensagem.
    document.getElementById("accountModal").hidden = false;
  } finally {
    if(submit) submit.disabled = false;
  }
}

async function uploadRetrohubAvatar(event){
  const file = event.target.files?.[0];
  if(!file || !retrohubSession?.user) return;
  if(file.size > 5 * 1024 * 1024) return setAccountMessage("profileMessage","A imagem deve ter no máximo 5 MB.");
  if(!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) return setAccountMessage("profileMessage","Use PNG, JPG, WebP ou GIF.");
  if(file.type==="image/gif" && !supporterCan(1)) return setAccountMessage("profileMessage","Avatar GIF é exclusivo para Aliado Retro ou superior.");

  const localPreview=URL.createObjectURL(file);
  const avatarEl=document.getElementById("profileAvatar"); if(avatarEl){ avatarEl.classList.remove("avatar-empty"); avatarEl.src=localPreview; }
  setAccountMessage("profileMessage","Enviando foto...", true);
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${retrohubSession.user.id}/avatar.${ext}`;
  const { error: uploadError } = await retrohubSupabase.storage.from("avatars").upload(path, file, {upsert:true, contentType:file.type});
  if(uploadError) return setAccountMessage("profileMessage", uploadError.message);

  const { data: publicData } = retrohubSupabase.storage.from("avatars").getPublicUrl(path);
  const avatar_url = publicData.publicUrl + "?v=" + Date.now();
  const { data, error } = await retrohubSupabase.from("profiles")
    .update({avatar_url}).eq("id",retrohubSession.user.id).select().single();
  if(error) return setAccountMessage("profileMessage", error.message);
  retrohubProfile = data;
  setAccountMessage("profileMessage","Foto atualizada!", true);
  refreshRetrohubAccountUI();
}

async function uploadRetrohubWallpaper(event){
  const file=event.target.files?.[0];
  if(!file||!retrohubSession?.user) return;
  if(file.size>8*1024*1024) return setAccountMessage("profileMessage","O papel de parede deve ter no máximo 8 MB.");
  if(!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) return setAccountMessage("profileMessage","Use PNG, JPG, WebP ou GIF.");
  if(file.type==="image/gif" && !supporterCan(3)) return setAccountMessage("profileMessage","Banner GIF é exclusivo para Lenda Retro.");
  const localPreview=URL.createObjectURL(file);
  const wp=document.getElementById("wallpaperPreview"); if(wp){wp.style.backgroundImage=`linear-gradient(rgba(8,13,27,.28),rgba(8,13,27,.28)),url("${localPreview}")`;wp.textContent="";}
  setAccountMessage("profileMessage","Enviando papel de parede...",true);
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
  const path=`${retrohubSession.user.id}/wallpaper.${ext}`;
  const {error:uploadError}=await retrohubSupabase.storage.from("avatars").upload(path,file,{upsert:true,contentType:file.type});
  if(uploadError) return setAccountMessage("profileMessage",uploadError.message);
  const {data:publicData}=retrohubSupabase.storage.from("avatars").getPublicUrl(path);
  const wallpaper_url=publicData.publicUrl+"?v="+Date.now();
  const {data,error}=await retrohubSupabase.from("profiles").update({wallpaper_url}).eq("id",retrohubSession.user.id).select().single();
  if(error) return setAccountMessage("profileMessage",error.message);
  retrohubProfile=data;
  setAccountMessage("profileMessage","Papel de parede atualizado!",true);
  refreshRetrohubAccountUI();
  if(location.hash==="#profile") renderRetrohubProfilePage();
}

async function removeRetrohubWallpaper(){
  if(!retrohubSession?.user) return;
  const {data,error}=await retrohubSupabase.from("profiles").update({wallpaper_url:null}).eq("id",retrohubSession.user.id).select().single();
  if(error) return setAccountMessage("profileMessage",error.message);
  retrohubProfile=data;
  setAccountMessage("profileMessage","Papel de parede removido!",true);
  refreshRetrohubAccountUI();
  if(location.hash==="#profile") renderRetrohubProfilePage();
}

retrohubSupabase.auth.onAuthStateChange((_event, session) => {
  // O callback do Auth deve ser rápido. Fazer consultas/await aqui pode disputar
  // com signIn/updateUser e deixar a interface presa no modal.
  retrohubSession = session;
  if(!session?.user){
    retrohubProfile = null;
    refreshRetrohubAccountUI();
    return;
  }
  setTimeout(async () => {
    try {
      await loadRetrohubProfile();
      // Se o usuário já estiver na rota de perfil, mantenha a tela sincronizada.
      if(location.hash === "#profile") await renderRetrohubProfilePage();
    } catch (err) {
      console.error("Falha ao atualizar perfil após mudança de autenticação:", err);
      refreshRetrohubAccountUI();
    }
  }, 0);
});

(async function initRetrohubAuth(){
  try {
    const { data, error } = await retrohubSupabase.auth.getSession();
    if(error) throw error;
    retrohubSession = data?.session || null;
    if(retrohubSession?.user) await loadRetrohubProfile();
    else refreshRetrohubAccountUI();
    if(location.hash === "#profile") await renderRetrohubProfilePage();
  } catch(error) {
    console.error("Erro ao restaurar sessão RetroHub:", error);
    retrohubSession = null;
    retrohubProfile = null;
    refreshRetrohubAccountUI();
  }
})();


/* ===== PERFIL COMPLETO RETROHUB ===== */
async function openFullRetrohubProfile(options = {}){
  window.retrohubViewingPublicProfile=false;
  if(!retrohubSession?.user){
    openAccountPanel();
    return false;
  }

  closeAccountPanel();

  const targetUrl = location.pathname + location.search + "#profile";
  if(location.hash !== "#profile"){
    if(options.replaceHistory){
      history.replaceState({page:"profile"},"",targetUrl);
    }else{
      history.pushState({page:"profile"},"",targetUrl);
    }
  }else if(options.replaceHistory){
    history.replaceState({page:"profile"},"",targetUrl);
  }

  await renderRetrohubProfilePage();
  window.scrollTo({top:0,behavior:"auto"});
  return true;
}

function profileDateValue(item){
  const raw=item?.DateEarnedHardcore||item?.DateEarned||"";
  const t=Date.parse(raw); return Number.isFinite(t)?t:0;
}
function profileDateLabel(item){
  const raw=item?.DateEarnedHardcore||item?.DateEarned;
  if(!raw) return "";
  const d=new Date(raw); if(Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
}

function toggleProfileGameAchievements(button){
  const card=button.closest(".profile-game-card");
  if(!card) return;
  const collapsed=card.classList.toggle("collapsed");
  button.setAttribute("aria-expanded",String(!collapsed));
  button.setAttribute("aria-label",collapsed?"Mostrar conquistas":"Ocultar conquistas");
  button.title=collapsed?"Mostrar conquistas":"Ocultar conquistas";
}

function getProfileHighlights(){
  const meta=retrohubSession?.user?.user_metadata?.profile_highlights;
  if(meta && typeof meta === "object") return meta;
  try{return JSON.parse(localStorage.getItem("retrohub_profile_highlights")||"{}")||{};}catch(e){return {};}
}
function updateEditorHighlightPreviews(){
  const gameSel=document.getElementById("favoriteGameSelect");
  const achSel=document.getElementById("favoriteAchievementSelect");
  const badgeSel=document.getElementById("favoriteBadgeSelect");
  const gp=document.getElementById("favoriteGamePreview"), ap=document.getElementById("favoriteAchievementPreview"), bp=document.getElementById("favoriteBadgePreview");
  if(gp&&gameSel){const g=games.find(x=>x.slug===gameSel.value);gp.classList.toggle("active",!!g);gp.innerHTML=g?`<img src="${escapeHTML(g.cover)}" alt="">${escapeHTML(g.title)} · ${escapeHTML(g.platform||"")} · ${escapeHTML(g.year||"")}`:"";}
  if(ap&&achSel){const o=achSel.options[achSel.selectedIndex];const show=!!achSel.value;ap.classList.toggle("active",show);ap.textContent=show?`🏆 ${o?.textContent||"Conquista selecionada"}`:"";}
  if(bp&&badgeSel){const o=badgeSel.options[badgeSel.selectedIndex];const show=!!badgeSel.value;bp.classList.toggle("active",show);bp.textContent=show?`🏅 ${o?.textContent||"Insígnia selecionada"}`:"";}
}
function saveProfileHighlight(type,value){
  const h={...getProfileHighlights()}; h[type]=value||"";
  localStorage.setItem("retrohub_profile_highlights",JSON.stringify(h));
  updateEditorHighlightPreviews();
}
function fillProfileHighlightSelects(valid,recent,rhBadges){
  const h=getProfileHighlights();
  const gs=document.getElementById("favoriteGameSelect"), as=document.getElementById("favoriteAchievementSelect"), bs=document.getElementById("favoriteBadgeSelect");
  if(gs){gs.innerHTML='<option value="">Automático</option>'+valid.map(({game})=>`<option value="${escapeHTML(game.slug)}">${escapeHTML(game.title)}</option>`).join('');gs.value=h.game||'';}
  if(as){as.innerHTML='<option value="">Mais recente</option>'+recent.slice(0,60).map(a=>`<option value="${escapeHTML(String(a.ID||a.BadgeName||a.Title))}">${escapeHTML(a.Title||"Conquista")} — ${escapeHTML(a._game?.title||"")}</option>`).join('');as.value=h.achievement||'';}
  if(bs){bs.innerHTML='<option value="">Automática</option>'+rhBadges.filter(b=>b[0]).map(b=>`<option value="${escapeHTML(b[2])}">${escapeHTML(b[2])}</option>`).join('');bs.value=h.badge||'';}  setTimeout(updateEditorHighlightPreviews,0);
}
function renderProfileFeatured(valid,recent,rhBadges,badgeUrl){
  const h=window.retrohubViewingPublicProfile ? {} : getProfileHighlights();
  let favGame=valid.find(({game})=>game.slug===h.game)?.game || valid[0]?.game;
  let favAch=recent.find(a=>String(a.ID||a.BadgeName||a.Title)===h.achievement) || recent[0];
  let favBadge=rhBadges.find(b=>b[0]&&b[2]===h.badge) || rhBadges.find(b=>b[0]);
  const area=document.getElementById("profileFeaturedArea");
  if(area) area.innerHTML=`
    <div class="profile-featured-card">${favGame?`<img class="profile-featured-icon" src="${escapeHTML(favGame.cover)}" alt="">`:`<div class="profile-featured-emoji">🎮</div>`}<div class="profile-featured-copy"><small>Jogo favorito</small><strong>${escapeHTML(favGame?.title||"Escolha um jogo")}</strong><span>${favGame?"Em destaque no seu perfil":"Defina em Editar perfil"}</span></div></div>
    <div class="profile-featured-card">${favAch?`<img class="profile-featured-icon" src="${escapeHTML(badgeUrl(favAch))}" alt="">`:`<div class="profile-featured-emoji">🏆</div>`}<div class="profile-featured-copy"><small>Conquista favorita</small><strong>${escapeHTML(favAch?.Title||"Escolha uma conquista")}</strong><span>${escapeHTML(favAch?`${favAch._game?.title||""} · ${Number(favAch.Points||0)} pts`:"Defina em Editar perfil")}</span></div></div>
    <div class="profile-featured-card">${favBadge && /^(?:https?:\/\/|\/|images\/|assets\/|badges\/)/i.test(String(favBadge[1]||""))?`<img class="profile-featured-icon" src="${escapeHTML(favBadge[1])}" alt="">`:`<div class="profile-featured-emoji">${favBadge?.[1]||"🏅"}</div>`}<div class="profile-featured-copy"><small>Insígnia em destaque</small><strong>${escapeHTML(favBadge?.[2]||"Nenhuma desbloqueada")}</strong><span>${escapeHTML(favBadge?.[5]||"Continue jogando para desbloquear")}</span></div></div>`;
  const hero=document.getElementById("profileHeroFeaturedBadge");
  if(hero && favBadge){
    const badgeVisual = /^(?:https?:\/\/|\/|images\/|assets\/|badges\/)/i.test(String(favBadge[1]||""))
      ? `<span class="mini"><img src="${escapeHTML(favBadge[1])}" alt=""></span>`
      : `<span class="mini">${favBadge[1]||"🏅"}</span>`;
    hero.hidden=false;
    hero.innerHTML=`${badgeVisual}<span class="profile-hero-badge-copy"><b>${escapeHTML(favBadge[2])}</b><small>${escapeHTML(favBadge[5])}</small></span>`;
  }
  if(!window.retrohubViewingPublicProfile) fillProfileHighlightSelects(valid,recent,rhBadges);
}

async function renderRetrohubProfilePage(){
  const app=document.getElementById("app");
  const q=document.getElementById("q");
  const filters=document.getElementById("filters");
  if(q){ q.style.display="none"; q.closest(".search-wrap")?.style.setProperty("display","none"); }
  if(filters) filters.style.display="none";
  if(!retrohubSession?.user){
    app.innerHTML=`<section class="profile-page${supporterProfileAttrs(retrohubProfile).cls}"${supporterProfileAttrs(retrohubProfile).style}><div class="profile-section profile-empty">Entre na sua conta para visualizar seu perfil.</div></section>`;
    return;
  }
  const username=retrohubProfile?.username||retrohubSession.user.user_metadata?.username||"Perfil";
  const raUser=retrohubProfile?.retroachievements_username||localStorage.getItem("retrohub_ra_user")||"";
  const avatar=retrohubProfile?.avatar_url||avatarFallback();
  const wallpaper=retrohubProfile?.wallpaper_url||"";
  const wallpaperStyle=wallpaper?` style="--profile-wallpaper:url('${escapeHTML(wallpaper).replace(/'/g,"%27")}')"`:"";
  const supportAttrs=supporterProfileAttrs(retrohubProfile);
  app.innerHTML=`<section class="profile-page${supportAttrs.cls}"${supportAttrs.style}>
    <div class="profile-hero ${wallpaper?"has-wallpaper":""}"${wallpaperStyle}><div class="profile-hero-grid">
      <img class="profile-page-avatar${supporterAvatarClass(retrohubProfile)}" src="${escapeHTML(avatar)}" alt="Avatar" onerror="this.onerror=null;this.src=avatarFallback()">
      <div class="profile-hero-main"><h1 class="profile-page-name">@${escapeHTML(username)}</h1>${supporterBadgeHTML(retrohubProfile)}<div class="profile-page-ra">${raUser?escapeHTML(raUser):"RetroAchievements não vinculado"}</div><div class="profile-meta-row"><div class="profile-online">Online</div></div><div id="profileHeroFeaturedBadge" class="profile-hero-featured-badge" hidden></div><div class="profile-level-wrap"><div class="profile-level-line"><div id="profileLevelPill" class="profile-level">🎖️ Nível <b>1</b> · Novato</div><span id="profileXpText" class="profile-xp-text">0 / 500 XP</span></div><div class="profile-xp-track"><div id="profileXpFill" class="profile-xp-fill"></div></div></div></div>
      <div class="profile-hero-actions"><button class="account-secondary" onclick="openRetrohubFriends()"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style="vertical-align:-3px;margin-right:6px"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"/></svg>Amigos</button><button class="account-secondary" onclick="openAccountPanel()">✏️ Editar perfil</button></div>
    </div></div>
    <div id="profileFavoritesSection" class="profile-favorites-section">
      <div class="profile-favorites-heading"><div><h2>❤️ Meus Favoritos</h2><p>Jogos que você salvou no RetroHub.</p></div><span id="profileFavoritesCount" class="profile-favorites-count">0</span></div>
      <div id="profileFavoritesGrid" class="profile-favorites-grid"><div class="profile-favorites-empty">Carregando favoritos...</div></div>
    </div>
    <div id="profileDashboard"><div class="profile-loading">${raUser?"Carregando suas conquistas...":"Vincule seu usuário do RetroAchievements em Editar perfil para sincronizar suas conquistas."}</div></div>
  </section>`;
  loadRetrohubProfileFavorites();
  if(raUser) await loadRetrohubFullProfile(raUser);
}


async function loadRetrohubProfileFavorites(){
  const grid=document.getElementById("profileFavoritesGrid");
  const count=document.getElementById("profileFavoritesCount");
  if(!grid) return;

  try{
    if(!retrohubSession?.user){
      grid.innerHTML='<div class="profile-favorites-empty">Entre na sua conta para visualizar seus favoritos.</div>';
      if(count) count.textContent="0";
      return;
    }

    const {data,error}=await retrohubSupabase
      .from("game_favorites")
      .select("game_slug,created_at")
      .eq("user_id",retrohubSession.user.id)
      .order("created_at",{ascending:false});

    if(error) throw error;

    const rows=Array.isArray(data)?data:[];
    const favoriteGames=rows.map(row=>{
      const game=games.find(g=>g.slug===row.game_slug);
      return game?{game,row}:null;
    }).filter(Boolean);

    if(count) count.textContent=String(favoriteGames.length);

    if(!favoriteGames.length){
      grid.innerHTML='<div class="profile-favorites-empty">Você ainda não favoritou nenhum jogo. Abra um jogo e clique em ♡ Favoritar.</div>';
      return;
    }

    grid.innerHTML=favoriteGames.map(({game})=>`
      <article class="profile-favorite-card" onclick="openGame('${String(game.slug).replace(/'/g,"\\'")}')">
        <div class="profile-favorite-cover"><img src="${escapeHTML(getCover(game))}" alt="${escapeHTML(game.title)}"></div>
        <div class="profile-favorite-info">
          <strong>${escapeHTML(game.title)}</strong>
          <small>${escapeHTML(game.platform||"")} ${game.year?"• "+escapeHTML(game.year):""}</small>
        </div>
        <span class="profile-favorite-heart">♥</span>
      </article>
    `).join("");
  }catch(e){
    console.error("Perfil/favoritos:",e);
    grid.innerHTML='<div class="profile-favorites-empty">Não foi possível carregar seus favoritos.</div>';
  }
}
window.loadRetrohubProfileFavorites=loadRetrohubProfileFavorites;


function getRetroHubProgression(stats,badges){
  const unlocked=badges.filter(b=>Boolean(b[0]));
  const rarityXP={Comum:50,Rara:150,"Épica":400,"Lendária":1000,Secreta:2000};
  const xp=Math.max(0,Math.round(
    unlocked.reduce((sum,b)=>sum+(rarityXP[b[5]]||50),0)+
    Number(stats.earned||0)*10+
    Number(stats.hardcore||0)*5+
    Number(stats.perfect||0)*250
  ));
  const level=Math.min(100,Math.max(1,Math.floor(Math.sqrt(xp/250))+1));
  const prevXP=(level-1)*(level-1)*250;
  const nextXP=level>=100?prevXP:level*level*250;
  const levelPct=level>=100?100:Math.max(0,Math.min(100,Math.round((xp-prevXP)/(nextXP-prevXP)*100)));
  const titles=[[1,"Novato Retro"],[5,"Explorador"],[10,"Caçador de Conquistas"],[15,"Veterano Retro"],[20,"Colecionador"],[25,"Perfeccionista"],[30,"Guerreiro Hardcore"],[40,"Mestre Retro"],[50,"Elite RetroHub"],[60,"Mestre do PS2"],[75,"Lenda Retro"],[90,"Guardião dos Clássicos"],[100,"Lenda do RetroHub"]];
  const unlockedTitles=titles.filter(t=>level>=t[0]);
  const saved=window.retrohubViewingPublicProfile ? "" : localStorage.getItem("retrohub_profile_title");
  const selected=unlockedTitles.some(t=>t[1]===saved)?saved:unlockedTitles[unlockedTitles.length-1][1];
  let nextGoal=null;
  badges.forEach(b=>{
    if(b[0]||typeof b[6]!=="function")return;
    const p=b[6](),current=Math.max(0,Number(p?.[0]||0)),target=Math.max(1,Number(p?.[1]||1));
    const pct=Math.max(0,Math.min(100,Math.round(current/target*100)));
    if(!nextGoal||pct>nextGoal.pct)nextGoal={name:b[2],desc:b[3],rarity:b[5],pct};
  });
  return {xp,level,nextXP,levelPct,unlockedTitles,selected,nextGoal,unlockedCount:unlocked.length};
}
function saveRetroHubProfileTitle(value){
  localStorage.setItem("retrohub_profile_title",value);
  document.querySelectorAll("[data-profile-selected-title]").forEach(el=>el.textContent=value);
}

async function loadRetrohubFullProfile(raUser){
  const target=document.getElementById("profileDashboard");
  if(!target) return;
  const compatible=games.filter(g=>g.retroAchievements&&g.retroAchievementsGameId);
  const results=await Promise.all(compatible.map(async game=>{
    try{
      const r=await fetch(`/api/retroachievements?user=${encodeURIComponent(raUser)}&gameId=${encodeURIComponent(game.retroAchievementsGameId)}`,{cache:"no-store"});
      const data=await r.json();
      if(!r.ok||!data||Array.isArray(data)) throw new Error(data?.error||"Erro");
      return {game,data};
    }catch(error){ return {game,error}; }
  }));
  const valid=results.filter(x=>x.data);
  let total=0,earned=0,hardcore=0,perfect=0,points=0;
  const recent=[];
  valid.forEach(({game,data})=>{
    const t=Number(data.NumAchievements??game.achievements??0), e=Number(data.NumAwardedToUser??0), h=Number(data.NumAwardedToUserHardcore??0);
    total+=t; earned+=e; hardcore+=h; if(t>0&&e>=t) perfect++;
    Object.values(data.Achievements||{}).forEach(a=>{if(a&&(a.DateEarned||a.DateEarnedHardcore)){recent.push({...a,_game:game});points+=Number(a.Points||0);}});
  });
  recent.sort((a,b)=>profileDateValue(b)-profileDateValue(a));
  const completion=total?Math.round(earned/total*100):0;
  const level=Math.max(1,Math.floor(earned/50)+1);
  const levelName=level>=10?"Lenda":level>=6?"Veterano":level>=3?"Caçador de conquistas":"Novato";
  const pill=document.getElementById("profileLevelPill"); if(pill) pill.innerHTML=`🎖️ Nível <b>${level}</b> · ${levelName}`;
  const xpPerLevel=500, xpTotal=Math.max(0,earned*10+perfect*100+hardcore*5), xpCurrent=xpTotal%xpPerLevel;
  const xpText=document.getElementById("profileXpText"); if(xpText) xpText.textContent=`${xpCurrent} / ${xpPerLevel} XP`;
  const xpFill=document.getElementById("profileXpFill"); if(xpFill) xpFill.style.width=`${Math.min(100,Math.round(xpCurrent/xpPerLevel*100))}%`;

  const badgeUrl=a=>{const raw=a?.BadgeURL||(a?.BadgeName?`https://media.retroachievements.org/Badge/${a.BadgeName}.png`:"");return raw&&raw.startsWith("/")?`https://media.retroachievements.org${raw}`:raw;};
  const showcaseHTML=recent.slice(0,4).map(a=>`<div class="profile-showcase-card" title="${escapeHTML(a.Title||"Conquista")}"><img src="${escapeHTML(badgeUrl(a))}" alt=""><strong>${escapeHTML(a.Title||"Conquista")}</strong><small>${escapeHTML(a._game?.title||"")} · ${Number(a.Points||0)} pts${a.DateEarnedHardcore?" · 🔥":""}</small></div>`).join("");
  const recentHTML=recent.slice(0,12).map(a=>`<div class="profile-achievement" title="${escapeHTML(a.Title||"Conquista")}"><img src="${escapeHTML(badgeUrl(a))}" alt=""><strong>${escapeHTML(a.Title||"Conquista")}</strong><small>${a.DateEarnedHardcore?"🔥 Hardcore • ":""}${escapeHTML(profileDateLabel(a))}</small></div>`).join("");
  const perfectHTML=valid.filter(({game,data})=>{const t=Number(data.NumAchievements??game.achievements??0),e=Number(data.NumAwardedToUser??0);return t>0&&e>=t;}).map(({game,data})=>`<div class="profile-perfect-card" onclick="openGame('${escapeHTML(game.slug)}',true)"><span>🏆 PERFEITO</span><img src="${escapeHTML(game.cover)}" alt=""><div>${escapeHTML(game.title)} · ${Number(data.NumAchievements??game.achievements??0)}/ ${Number(data.NumAchievements??game.achievements??0)}</div></div>`).join("");
  const rhBadges=[
    [earned>=1,"images/retrohub-badges/primeira-conquista.png","Primeira conquista","Desbloqueie 1 conquista","conquistas","Comum",()=>[earned,1]],
    [earned>=10,"🥉","Primeiros passos","Alcance 10 conquistas","conquistas","Comum",()=>[earned,10]],
    [earned>=25,"🥈","Caçador iniciante","Alcance 25 conquistas","conquistas","Comum",()=>[earned,25]],
    [earned>=50,"🏆","Caçador de conquistas","Alcance 50 conquistas","conquistas","Comum",()=>[earned,50]],
    [earned>=100,"🏆","Centenário","Alcance 100 conquistas","conquistas","Rara",()=>[earned,100]],
    [earned>=250,"💠","Colecionador de troféus","Alcance 250 conquistas","conquistas","Rara",()=>[earned,250]],
    [earned>=500,"💎","500 conquistas","Alcance 500 conquistas","conquistas","Épica",()=>[earned,500]],
    [earned>=750,"👑","Elite das conquistas","Alcance 750 conquistas","conquistas","Épica",()=>[earned,750]],
    [earned>=1000,"images/retrohub-badges/mil-conquistas.png","1.000 conquistas","Alcance 1.000 conquistas","conquistas","Lendária",()=>[earned,1000]],
    [earned>=2500,"🌟","Lenda das conquistas","Alcance 2.500 conquistas","conquistas","Lendária",()=>[earned,2500]],
    [perfect>=1,"⭐","Primeiro 100%","Complete seu primeiro jogo","perfeitos","Comum",()=>[perfect,1]],
    [perfect>=3,"🌟","Trinca perfeita","Complete 3 jogos em 100%","perfeitos","Comum",()=>[perfect,3]],
    [perfect>=5,"✨","Perfeccionista I","Complete 5 jogos em 100%","perfeitos","Rara",()=>[perfect,5]],
    [perfect>=10,"👑","10 jogos perfeitos","Complete 10 jogos em 100%","perfeitos","Rara",()=>[perfect,10]],
    [perfect>=15,"🏅","Mestre do 100%","Complete 15 jogos em 100%","perfeitos","Épica",()=>[perfect,15]],
    [perfect>=25,"🏰","25 jogos perfeitos","Complete 25 jogos em 100%","perfeitos","Épica",()=>[perfect,25]],
    [perfect>=50,"🐉","50 jogos perfeitos","Complete 50 jogos em 100%","perfeitos","Lendária",()=>[perfect,50]],
    [perfect>=100,"💯","Perfeição absoluta","Complete 100 jogos em 100%","perfeitos","Lendária",()=>[perfect,100]],
    [points>=500,"🔥","500 pontos","Some 500 pontos","pontos","Comum",()=>[points,500]],
    [points>=1000,"🔥","1.000 pontos","Some 1.000 pontos","pontos","Comum",()=>[points,1000]],
    [points>=2500,"🔷","2.500 pontos","Some 2.500 pontos","pontos","Rara",()=>[points,2500]],
    [points>=5000,"💠","5.000 pontos","Some 5.000 pontos","pontos","Rara",()=>[points,5000]],
    [points>=10000,"🌟","10.000 pontos","Some 10.000 pontos","pontos","Épica",()=>[points,10000]],
    [points>=25000,"💜","25.000 pontos","Some 25.000 pontos","pontos","Épica",()=>[points,25000]],
    [points>=50000,"💫","50.000 pontos","Some 50.000 pontos","pontos","Lendária",()=>[points,50000]],
    [points>=100000,"🌌","100.000 pontos","Some 100.000 pontos","pontos","Lendária",()=>[points,100000]],
    [hardcore>=10,"⚡","Hardcore 10","Consiga 10 conquistas Hardcore","hardcore","Comum",()=>[hardcore,10]],
    [hardcore>=25,"⚡","Hardcore 25","Consiga 25 conquistas Hardcore","hardcore","Comum",()=>[hardcore,25]],
    [hardcore>=50,"🔥","Hardcore 50","Consiga 50 conquistas Hardcore","hardcore","Rara",()=>[hardcore,50]],
    [hardcore>=100,"🔥","Hardcore 100","Consiga 100 conquistas Hardcore","hardcore","Rara",()=>[hardcore,100]],
    [hardcore>=250,"☠️","Hardcore 250","Consiga 250 conquistas Hardcore","hardcore","Épica",()=>[hardcore,250]],
    [hardcore>=500,"💀","Hardcore 500","Consiga 500 conquistas Hardcore","hardcore","Épica",()=>[hardcore,500]],
    [hardcore>=1000,"🏅","Mestre Hardcore","Consiga 1.000 conquistas Hardcore","hardcore","Lendária",()=>[hardcore,1000]],
    [hardcore>=2500,"👹","Lenda Hardcore","Consiga 2.500 conquistas Hardcore","hardcore","Lendária",()=>[hardcore,2500]],
    [valid.length>=3,"🎮","Começando a coleção","Jogue 3 jogos diferentes","colecao","Comum",()=>[valid.length,3]],
    [valid.length>=5,"🎮","Explorador retrô","Jogue 5 jogos diferentes","colecao","Comum",()=>[valid.length,5]],
    [valid.length>=10,"🕹️","Retro Gamer","Jogue 10 jogos diferentes","colecao","Comum",()=>[valid.length,10]],
    [valid.length>=25,"📚","Biblioteca retrô","Jogue 25 jogos diferentes","colecao","Rara",()=>[valid.length,25]],
    [valid.length>=50,"🧱","Colecionador","Jogue 50 jogos diferentes","colecao","Rara",()=>[valid.length,50]],
    [valid.length>=75,"📦","Arquivo gamer","Jogue 75 jogos diferentes","colecao","Épica",()=>[valid.length,75]],
    [valid.length>=100,"👾","Lenda Retro","Jogue 100 jogos diferentes","colecao","Lendária",()=>[valid.length,100]],
    [valid.length>=250,"🏛️","Museu dos games","Jogue 250 jogos diferentes","colecao","Lendária",()=>[valid.length,250]],
    [earned>=50&&points>=1000,"🚀","Em ascensão","50 conquistas + 1.000 pontos","especiais","Comum",()=>[Math.min(earned/50,points/1000)*100,100]],
    [valid.length>=10&&earned>=100,"🧭","Aventureiro","10 jogos + 100 conquistas","especiais","Rara",()=>[Math.min(valid.length/10,earned/100)*100,100]],
    [hardcore>=100&&perfect>=1,"💪","Sem medo","100 Hardcore + 1 jogo perfeito","especiais","Rara",()=>[Math.min(hardcore/100,perfect)*100,100]],
    [earned>=500&&perfect>=5,"🏹","Caçador veterano","500 conquistas + 5 jogos perfeitos","especiais","Épica",()=>[Math.min(earned/500,perfect/5)*100,100]],
    [perfect>=1&&total>=50,"💯","Perfeccionista","Complete em 100% um jogo com muitas conquistas","especiais","Épica",()=>[perfect,1]],
    [earned>=1000&&points>=10000&&hardcore>=250,"⚔️","Elite RetroHub","1.000 conquistas + 10.000 pontos + 250 Hardcore","especiais","Épica",()=>[Math.min(earned/1000,points/10000,hardcore/250)*100,100]],
    [perfect>=25&&points>=25000,"👑","Mestre RetroHub","25 jogos perfeitos + 25.000 pontos","especiais","Lendária",()=>[Math.min(perfect/25,points/25000)*100,100]],
    [earned>=2500&&perfect>=50&&points>=50000,"🌠","Lenda do RetroHub","2.500 conquistas + 50 perfeitos + 50.000 pontos","especiais","Lendária",()=>[Math.min(earned/2500,perfect/50,points/50000)*100,100]],

    /* ===== NOVAS INSÍGNIAS DE DESAFIO ===== */
    [earned>=5,"🌱","Aquecimento","Desbloqueie 5 conquistas","conquistas","Comum",()=>[earned,5]],
    [earned>=200,"🎖️","Duzentas na conta","Alcance 200 conquistas","conquistas","Rara",()=>[earned,200]],
    [earned>=1500,"🔱","Caçador supremo","Alcance 1.500 conquistas","conquistas","Lendária",()=>[earned,1500]],

    [perfect>=2,"🌠","Dobradinha perfeita","Complete 2 jogos em 100%","perfeitos","Comum",()=>[perfect,2]],
    [perfect>=7,"🎇","Semana perfeita","Complete 7 jogos em 100%","perfeitos","Rara",()=>[perfect,7]],
    [perfect>=75,"🏆","Mestre da perfeição","Complete 75 jogos em 100%","perfeitos","Lendária",()=>[perfect,75]],

    [points>=250,"🪙","Primeiro tesouro","Some 250 pontos","pontos","Comum",()=>[points,250]],
    [points>=7500,"💰","Cofre cheio","Some 7.500 pontos","pontos","Rara",()=>[points,7500]],
    [points>=75000,"🪐","Pontuação galáctica","Some 75.000 pontos","pontos","Lendária",()=>[points,75000]],

    [hardcore>=1,"🔥","Primeiro Hardcore","Consiga sua primeira conquista Hardcore","hardcore","Comum",()=>[hardcore,1]],
    [hardcore>=75,"⚔️","Guerreiro Hardcore","Consiga 75 conquistas Hardcore","hardcore","Rara",()=>[hardcore,75]],
    [hardcore>=750,"🩸","Implacável","Consiga 750 conquistas Hardcore","hardcore","Épica",()=>[hardcore,750]],

    [valid.length>=1,"🕹️","Primeiro jogo","Registre progresso em seu primeiro jogo","colecao","Comum",()=>[valid.length,1]],
    [valid.length>=15,"📀","Estante gamer","Jogue 15 jogos diferentes","colecao","Rara",()=>[valid.length,15]],
    [valid.length>=150,"🗃️","Arquivo RetroHub","Jogue 150 jogos diferentes","colecao","Lendária",()=>[valid.length,150]],

    [earned>=25&&hardcore>=10,"🛡️","Sem facilidades","25 conquistas e 10 em Hardcore","especiais","Comum",()=>[Math.min(earned/25,hardcore/10)*100,100]],
    [perfect>=3&&hardcore>=50,"⚔️","Perfeito e Hardcore","3 jogos perfeitos e 50 Hardcore","especiais","Rara",()=>[Math.min(perfect/3,hardcore/50)*100,100]],
    [valid.length>=25&&points>=5000,"🗺️","Explorador veterano","25 jogos e 5.000 pontos","especiais","Rara",()=>[Math.min(valid.length/25,points/5000)*100,100]],
    [earned>=750&&hardcore>=250,"🐺","Caçador implacável","750 conquistas e 250 Hardcore","especiais","Épica",()=>[Math.min(earned/750,hardcore/250)*100,100]],
    [perfect>=10&&earned>=1000,"🏛️","Hall da fama","10 jogos perfeitos e 1.000 conquistas","especiais","Épica",()=>[Math.min(perfect/10,earned/1000)*100,100]],

    /* Insígnias temáticas por plataforma, calculadas pelos jogos sincronizados */
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length>=3,"💙","Explorador do PS2","Jogue 3 títulos de PlayStation 2","especiais","Rara",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length,3]],
    [valid.filter(x=>/game boy advance|gba/i.test(String(x.game?.platform||""))).length>=3,"🟣","Explorador do GBA","Jogue 3 títulos de Game Boy Advance","especiais","Rara",()=>[valid.filter(x=>/game boy advance|gba/i.test(String(x.game?.platform||""))).length,3]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length>=3,"🏅","Mestre do PS2","Complete 3 jogos de PS2 em 100%","especiais","Épica",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length,3]],
    [valid.filter(x=>/game boy advance|gba/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length>=3,"🏅","Mestre do GBA","Complete 3 jogos de GBA em 100%","especiais","Épica",()=>[valid.filter(x=>/game boy advance|gba/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||0)).length,3]],

    /* Desafios de raridade/progressão baseados nos dados disponíveis */
    [recent.filter(a=>Number(a.Points||0)>=25).length>=5,"💎","Caçador de raridades","Conquiste 5 desafios valendo 25 pontos ou mais","especiais","Rara",()=>[recent.filter(a=>Number(a.Points||0)>=25).length,5]],
    [recent.filter(a=>Number(a.Points||0)>=50).length>=3,"👑","Caçador de relíquias","Conquiste 3 desafios valendo 50 pontos ou mais","especiais","Épica",()=>[recent.filter(a=>Number(a.Points||0)>=50).length,3]],
    [hardcore>=earned&&earned>=100,"💀","Purista Hardcore","Tenha 100 conquistas com todas registradas em Hardcore","especiais","Lendária",()=>[earned?Math.min(hardcore/earned*100,100):0,100]],

    /* Insígnias secretas: nome/objetivo ocultos até serem desbloqueadas */
    [perfect>=5&&hardcore>=250,"🔒","Insígnia secreta","???","especiais","Secreta",()=>[Math.min(perfect/5,hardcore/250)*100,100]],
    [earned>=1000&&valid.length>=50&&perfect>=10,"🔒","Insígnia secreta","???","especiais","Secreta",()=>[Math.min(earned/1000,valid.length/50,perfect/10)*100,100]],
    [earned>=2500&&points>=100000&&hardcore>=1000&&perfect>=50,"🔒","Insígnia secreta","???","especiais","Secreta",()=>[Math.min(earned/2500,points/100000,hardcore/1000,perfect/50)*100,100]],

    /* ===== 20 INSÍGNIAS EXCLUSIVAS DE PLAYSTATION 2 ===== */
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length>=1,"💙","Bem-vindo ao PS2","Jogue seu primeiro título de PlayStation 2","ps2","Comum",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length,1]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length>=3,"🎮","Explorador PS2","Jogue 3 títulos de PlayStation 2","ps2","Comum",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length,3]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length>=5,"💿","Coleção PS2","Jogue 5 títulos de PlayStation 2","ps2","Comum",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length,5]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length>=10,"🕹️","Veterano do PS2","Jogue 10 títulos de PlayStation 2","ps2","Rara",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length,10]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length>=20,"📚","Biblioteca PS2","Jogue 20 títulos de PlayStation 2","ps2","Rara",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length,20]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length>=50,"🏛️","Museu PS2","Jogue 50 títulos de PlayStation 2","ps2","Lendária",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length,50]],

    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length>=1,"⭐","Primeiro 100% no PS2","Complete 1 jogo de PS2 em 100%","ps2","Comum",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length,1]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length>=3,"🏅","Mestre do PS2","Complete 3 jogos de PS2 em 100%","ps2","Rara",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length,3]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length>=5,"🏆","Perfeccionista PS2","Complete 5 jogos de PS2 em 100%","ps2","Rara",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length,5]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length>=10,"👑","Rei do PS2","Complete 10 jogos de PS2 em 100%","ps2","Épica",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length,10]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length>=25,"🌟","Lenda do PS2","Complete 25 jogos de PS2 em 100%","ps2","Lendária",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length,25]],

    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarned||a.DateEarnedHardcore).length,0)>=50,"🥉","Caçador PS2","Desbloqueie 50 conquistas em jogos de PS2","ps2","Comum",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarned||a.DateEarnedHardcore).length,0),50]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarned||a.DateEarnedHardcore).length,0)>=100,"🥈","Centenário PS2","Desbloqueie 100 conquistas em jogos de PS2","ps2","Rara",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarned||a.DateEarnedHardcore).length,0),100]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarned||a.DateEarnedHardcore).length,0)>=250,"💎","Elite PS2","Desbloqueie 250 conquistas em jogos de PS2","ps2","Épica",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarned||a.DateEarnedHardcore).length,0),250]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarned||a.DateEarnedHardcore).length,0)>=500,"🔱","Lenda das conquistas PS2","Desbloqueie 500 conquistas em jogos de PS2","ps2","Lendária",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarned||a.DateEarnedHardcore).length,0),500]],

    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarnedHardcore).length,0)>=25,"🔥","PS2 Hardcore","Consiga 25 conquistas Hardcore em jogos de PS2","ps2","Rara",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarnedHardcore).length,0),25]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarnedHardcore).length,0)>=100,"⚡","Guerreiro PS2 Hardcore","Consiga 100 conquistas Hardcore em jogos de PS2","ps2","Épica",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarnedHardcore).length,0),100]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarnedHardcore).length,0)>=250,"💀","Mestre PS2 Hardcore","Consiga 250 conquistas Hardcore em jogos de PS2","ps2","Lendária",()=>[valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).reduce((n,x)=>n+Object.values(x.data?.Achievements||{}).filter(a=>a.DateEarnedHardcore).length,0),250]],

    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length>=25 && valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length>=10,"🦁","Veterano de uma geração","Jogue 25 jogos de PS2 e complete 10 em 100%","ps2","Lendária",()=>[Math.min(valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length/25,valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length/10)*100,100]],
    [valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length>=50 && valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length>=25,"images/retrohub-badges/platina-ps2-retrohub.png","Platina PS2 RetroHub","Jogue 50 jogos de PS2 e complete 25 em 100%","ps2","Lendária",()=>[Math.min(valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||""))).length/50,valid.filter(x=>/playstation 2|ps2/i.test(String(x.game?.platform||"")) && Number(x.data?.NumAchievements||x.game?.achievements||0)>0 && Number(x.data?.NumAwardedToUser||0)>=Number(x.data?.NumAchievements||x.game?.achievements||0)).length/25)*100,100]],

    ];
  const progression=getRetroHubProgression({earned,points,hardcore,perfect,total,games:valid.length},rhBadges);
  const nextGoal=progression.nextGoal;
  const titleOptions=progression.unlockedTitles.map(t=>`<option value="${escapeHTML(t[1])}" ${t[1]===progression.selected?"selected":""}>Nv. ${t[0]} · ${escapeHTML(t[1])}</option>`).join("");
  const progressionHTML=`<div class="profile-progression">
    <div class="profile-progression-top"><div class="profile-progression-level"><div class="profile-level-orb">${progression.level}</div><div><strong>Nível ${progression.level}</strong><small><span data-profile-selected-title>${escapeHTML(progression.selected)}</span> · ${progression.unlockedCount}/100 insígnias</small></div></div><div class="profile-xp-number">${progression.xp.toLocaleString("pt-BR")} XP${progression.level<100?` · próximo nível: ${progression.nextXP.toLocaleString("pt-BR")} XP`:" · Nível máximo"}</div></div>
    <div class="profile-xp-track"><i style="width:${progression.levelPct}%"></i></div>
    <div class="profile-progression-grid">
      <div class="profile-title-box"><span>🏷️ Título do perfil</span><strong data-profile-selected-title>${escapeHTML(progression.selected)}</strong><small>Novos títulos são liberados conforme o nível aumenta.</small>${window.retrohubViewingPublicProfile?"":`<select class="profile-title-select" onchange="saveRetroHubProfileTitle(this.value)">${titleOptions}</select>`}</div>
      <div class="profile-next-goal"><span>🎯 Próxima meta</span><strong>${nextGoal?escapeHTML(nextGoal.name):"Todas as metas concluídas"}</strong><small>${nextGoal?`${escapeHTML(nextGoal.desc)} · ${nextGoal.pct}% concluído`:"Você desbloqueou todas as insígnias disponíveis."}</small>${nextGoal?`<div class="profile-next-goal-track"><i style="width:${nextGoal.pct}%"></i></div>`:""}</div>
    </div>
  </div>`;

  window.retrohubBadgeState=rhBadges;
  const badgeClass=r=>r==="Secreta"?"secret":r==="Lendária"?"legendary":r==="Épica"?"epic":r==="Rara"?"rare":"common";
  const renderRhBadge=([ok,icon,title,desc,cat,rarity,getProgress])=>{const [curRaw,targetRaw]=getProgress?getProgress():[0,1],cur=Math.max(0,Number(curRaw||0)),goal=Math.max(1,Number(targetRaw||1)),pct=Math.max(0,Math.min(100,Math.round(cur/goal*100)));return `<div class="rh-badge ${ok?"":"locked"} ${badgeClass(rarity)}" data-badge-category="${cat}"><span class="rh-badge-rarity">${rarity}</span><div class="rh-badge-icon">${String(icon||"").includes("/")?`<img class="retrohub-badge-icon-img" src="${escapeHTML(icon)}" alt="${escapeHTML(title)}">`:escapeHTML(icon||"🏅")}</div><div class="rh-badge-info"><strong>${rarity==="Secreta"&&!ok?"???":title}</strong><small>${ok?(rarity==="Secreta"?"✦ Segredo descoberto · "+desc:"✓ Desbloqueada"):(rarity==="Secreta"?"Objetivo secreto":desc)}</small>${!ok?`<div class="rh-progress"><i style="width:${pct}%"></i></div><em>${pct}% concluído</em>`:""}</div></div>`;};
  const rhBadgesHTML=rhBadges.slice(0,10).map(renderRhBadge).join("");


  const gamesHTML=valid.map(({game,data})=>{
    const t=Number(data.NumAchievements??game.achievements??0),e=Number(data.NumAwardedToUser??0),h=Number(data.NumAwardedToUserHardcore??0),p=t?Math.round(e/t*100):0;
    const achievements=Object.values(data.Achievements||{});
    const badgesHTML=achievements.map(a=>{
      const got=!!(a?.DateEarned||a?.DateEarnedHardcore), hc=!!a?.DateEarnedHardcore, badge=badgeUrl(a);
      return `<div class="profile-game-badge ${got?"earned":"locked"} ${hc?"hardcore":""}" data-ach-title="${escapeHTML(a?.Title||"Conquista")}" data-ach-desc="${escapeHTML(a?.Description||"")}" data-ach-points="${Number(a?.Points??0)}" data-ach-game="${escapeHTML(game.title)}" data-ach-badge="${escapeHTML(badge)}" data-ach-earned="${got?"1":"0"}" data-ach-hardcore="${hc?"1":"0"}" data-ach-date="${escapeHTML(profileDateLabel(a))}"><img src="${escapeHTML(badge)}" alt="${escapeHTML(a?.Title||"Conquista")}" loading="lazy"></div>`;
    }).join("");
    return `<div class="profile-game-card collapsed"><div class="profile-game-header"><div class="profile-game-row" onclick="openGame('${escapeHTML(game.slug)}',true)"><img class="profile-game-cover" src="${escapeHTML(game.cover)}" alt=""><div><div class="profile-game-title">${escapeHTML(game.title)}</div><div class="profile-game-meta">${e} / ${t} conquistas${h?` • 🔥 ${h} Hardcore`:""}</div><div class="profile-progress-track"><div class="profile-progress-fill" style="width:${p}%"></div></div></div><div class="profile-game-percent">${p}%<small>${e>=t&&t?"🏆 Perfeito":"progresso"}</small></div></div>${badgesHTML?`<button class="profile-game-toggle" type="button" aria-label="Mostrar conquistas" aria-expanded="false" title="Mostrar conquistas" onclick="event.stopPropagation();toggleProfileGameAchievements(this)"><span class="arrow">⌃</span></button>`:""}</div>${badgesHTML?`<div class="profile-game-badges">${badgesHTML}</div>`:""}</div>`;
  }).join("");

  target.innerHTML=`
  ${progressionHTML}
  <div class="profile-stats-strip"><div class="profile-stat-inline">🎮 <strong>${valid.length}</strong> jogos</div><div class="profile-stat-inline">🏆 <strong>${earned}</strong> conquistas</div><div class="profile-stat-inline">💯 <strong>${perfect}</strong> perfeitos</div><div class="profile-stat-inline">💎 <strong>${points.toLocaleString("pt-BR")}</strong> pontos</div><div class="profile-stat-inline">⚡ <strong>${hardcore}</strong> Hardcore</div><div class="profile-stat-inline">📈 <strong>${completion}%</strong> conclusão</div></div>
  <div id="profileFeaturedArea" class="profile-featured-grid"></div>
  <div class="profile-section"><div class="profile-section-head"><h2>💎 Vitrine de conquistas</h2><span>4 conquistas em destaque</span></div>${showcaseHTML?`<div class="profile-showcase-grid">${showcaseHTML}</div>`:`<div class="profile-empty">Suas conquistas mais recentes aparecerão aqui.</div>`}</div>
  <div class="profile-section"><div class="profile-section-head"><h2>🏆 Jogos perfeitos</h2><span>${perfect} concluído${perfect===1?"":"s"} em 100%</span></div>${perfectHTML?`<div class="profile-perfect-grid">${perfectHTML}</div>`:`<div class="profile-empty">Quando você completar um jogo em 100%, ele ganhará destaque aqui.</div>`}</div>
  <div class="profile-section"><div class="profile-section-head"><h2>🏅 Insígnias RetroHub</h2><span>${rhBadges.filter(b=>b[0]).length} de ${rhBadges.length} desbloqueadas</span></div><div class="profile-retrohub-badges">${rhBadgesHTML}</div>${window.retrohubViewingPublicProfile?"":`<div class="rh-badges-actions"><button class="rh-badges-more" onclick="openRetrohubBadgesPage()">Ver todas as insígnias →</button></div>`}</div>

  <div class="profile-section"><div class="profile-section-head"><h2>🎮 ${window.retrohubViewingPublicProfile?"Jogos":"Meus jogos"}</h2><span>Progresso no RetroAchievements</span></div><div class="profile-games">${gamesHTML||'<div class="profile-empty">Nenhum jogo compatível encontrado.</div>'}</div></div>`;
  // Renderiza os destaques somente depois que #profileFeaturedArea existe no DOM.
  // Antes esta função era chamada antes do target.innerHTML, por isso a escolha
  // (ex.: Metroid Fusion) era salva, mas não aparecia visualmente no perfil.
  renderProfileFeatured(valid,recent,rhBadges,badgeUrl);
  initProfileAchievementTooltips();
}


function openRetrohubBadgesPage(){
  const badges=window.retrohubBadgeState||[];
  const app=document.getElementById("app");
  history.pushState({page:"badges"},"",location.pathname+"#badges");
  const earnedCount=badges.filter(b=>b[0]).length;
  const badgeClass=r=>r==="Secreta"?"secret":r==="Lendária"?"legendary":r==="Épica"?"epic":r==="Rara"?"rare":"common";
  const render=([ok,icon,title,desc,cat,rarity,getProgress])=>{const [curRaw,targetRaw]=getProgress?getProgress():[0,1],cur=Math.max(0,Number(curRaw||0)),goal=Math.max(1,Number(targetRaw||1)),pct=Math.max(0,Math.min(100,Math.round(cur/goal*100)));return `<div class="rh-badge ${ok?"":"locked"} ${badgeClass(rarity)}" data-badge-category="${cat}"><span class="rh-badge-rarity">${rarity}</span><div class="rh-badge-icon">${String(icon||"").includes("/")?`<img class="retrohub-badge-icon-img" src="${escapeHTML(icon)}" alt="${escapeHTML(title)}">`:escapeHTML(icon||"🏅")}</div><div class="rh-badge-info"><strong>${rarity==="Secreta"&&!ok?"???":title}</strong><small>${ok?(rarity==="Secreta"?"✦ Segredo descoberto · "+desc:"✓ Desbloqueada"):(rarity==="Secreta"?"Objetivo secreto":desc)}</small>${!ok?`<div class="rh-progress"><i style="width:${pct}%"></i></div><em>${pct}% concluído</em>`:""}</div></div>`;};
  app.innerHTML=`<section class="badge-page"><div class="badge-page-head"><div><h1>🏅 Insígnias RetroHub</h1><div class="badge-summary">${earnedCount} de ${badges.length} desbloqueadas · desafios exclusivos do seu perfil</div></div><button class="account-secondary" onclick="openFullRetrohubProfile()">← Voltar ao perfil</button></div><div class="badge-page-tabs"><button class="badge-tab active" onclick="filterRetrohubBadges('all',this)">Todas</button><button class="badge-tab" onclick="filterRetrohubBadges('conquistas',this)">Conquistas</button><button class="badge-tab" onclick="filterRetrohubBadges('perfeitos',this)">Jogos perfeitos</button><button class="badge-tab" onclick="filterRetrohubBadges('pontos',this)">Pontos</button><button class="badge-tab" onclick="filterRetrohubBadges('hardcore',this)">Hardcore</button><button class="badge-tab" onclick="filterRetrohubBadges('colecao',this)">Coleção</button><button class="badge-tab" onclick="filterRetrohubBadges('especiais',this)">Especiais</button></div><div class="badge-page-grid">${badges.map(render).join("")}</div></section>`;
  window.scrollTo({top:0,behavior:"smooth"});
}
function filterRetrohubBadges(category,button){
  document.querySelectorAll('.badge-tab').forEach(b=>b.classList.remove('active'));
  if(button) button.classList.add('active');
  document.querySelectorAll('.badge-page-grid .rh-badge').forEach(el=>{el.style.display=category==='all'||el.dataset.badgeCategory===category?'flex':'none';});
}
function initProfileAchievementTooltips(){
  let tooltip=document.getElementById("profileAchievementTooltip");
  if(!tooltip){
    tooltip=document.createElement("div");
    tooltip.id="profileAchievementTooltip";
    tooltip.className="profile-game-badge-tooltip";
    document.body.appendChild(tooltip);
  }
  const hide=()=>tooltip.classList.remove("show");
  const position=(badge)=>{
    const r=badge.getBoundingClientRect();
    const gap=12, pad=10;
    tooltip.style.visibility="hidden";
    tooltip.classList.add("show");
    const tr=tooltip.getBoundingClientRect();
    let left=r.right+gap;
    if(left+tr.width>window.innerWidth-pad) left=r.left-tr.width-gap;
    left=Math.max(pad,Math.min(left,window.innerWidth-tr.width-pad));
    let top=r.top+(r.height-tr.height)/2;
    top=Math.max(pad,Math.min(top,window.innerHeight-tr.height-pad));
    tooltip.style.left=`${Math.round(left)}px`;
    tooltip.style.top=`${Math.round(top)}px`;
    tooltip.style.visibility="visible";
  };
  document.querySelectorAll(".profile-game-badge").forEach(badge=>{
    badge.addEventListener("mouseenter",()=>{
      const d=badge.dataset;
      const earned=d.achEarned==="1", hc=d.achHardcore==="1";
      tooltip.className=`profile-game-badge-tooltip show ${earned?"earned":"locked"} ${hc?"hardcore":""}`;
      tooltip.innerHTML=`<img src="${escapeHTML(d.achBadge||"")}" alt=""><div><div class="profile-game-badge-tooltip-title">${escapeHTML(d.achTitle||"Conquista")}</div><div class="profile-game-badge-tooltip-desc">${escapeHTML(d.achDesc||"Sem descrição disponível.")}</div><div class="profile-game-badge-tooltip-meta">${escapeHTML(d.achPoints||"0")} pontos</div><div class="profile-game-badge-tooltip-game">${escapeHTML(d.achGame||"")}</div><div class="profile-game-badge-tooltip-state">${earned?(hc?"🔥 Conquistada em Hardcore":"✓ Conquistada")+(d.achDate?` • ${escapeHTML(d.achDate)}`:""):"🔒 Bloqueada"}</div></div>`;
      position(badge);
    });
    badge.addEventListener("mouseleave",hide);
  });
  window.addEventListener("scroll",hide,{passive:true});
  window.addEventListener("resize",hide);
}


/* ESC fecha primeiro o modal de conta, sem interferir no retorno do jogo */
document.addEventListener("keydown", function(e){
  if(e.key === "Escape"){
    const modal = document.getElementById("accountModal");
    if(modal && !modal.hidden){
      e.stopImmediatePropagation();
      closeAccountPanel();
    }
  }
}, true);

/* ===== BLOCO SEPARADO ===== */

/* ===== PREVIEW CORRIGIDO: SCREENSHOT -> BANNER ===== */
(function(){
  function cardFromThumb(thumb){
    return thumb.closest(".featured-card");
  }

  function showScreenshot(thumb){
    const card = cardFromThumb(thumb);
    if(!card) return;

    const banner = card.querySelector(".featured-main-image");
    if(!banner) return;

    if(!banner.dataset.savedBanner){
      banner.dataset.savedBanner =
        banner.dataset.originalBanner ||
        banner.getAttribute("src") ||
        "";
    }

    const preview =
      thumb.dataset.full ||
      thumb.getAttribute("src");

    if(!preview) return;

    banner.classList.add("is-previewing");
    banner.setAttribute("src", preview);
  }

  function restoreBanner(thumb){
    const card = cardFromThumb(thumb);
    if(!card) return;

    const banner = card.querySelector(".featured-main-image");
    if(!banner) return;

    const original =
      banner.dataset.savedBanner ||
      banner.dataset.originalBanner;

    if(original){
      banner.setAttribute("src", original);
    }

    banner.classList.remove("is-previewing");
  }

  document.addEventListener("pointerover", function(e){
    const thumb = e.target.closest(".featured-screenshot-thumb");
    if(!thumb) return;
    showScreenshot(thumb);
  });

  document.addEventListener("pointerout", function(e){
    const thumb = e.target.closest(".featured-screenshot-thumb");
    if(!thumb) return;

    if(e.relatedTarget && thumb.contains(e.relatedTarget)) return;
    restoreBanner(thumb);
  });

  // Também funciona por clique/toque em celular.
  document.addEventListener("click", function(e){
    const thumb = e.target.closest(".featured-screenshot-thumb");
    if(!thumb) return;

    e.preventDefault();
    e.stopPropagation();
    showScreenshot(thumb);
  });
})();

/* ===== BLOCO SEPARADO ===== */

function openRaInfoModal(){
  const el=document.getElementById("raInfoModal");
  if(el) el.classList.add("is-open");
}
function closeRaInfoModal(){
  const el=document.getElementById("raInfoModal");
  if(el) el.classList.remove("is-open");
}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape") closeRaInfoModal();
});

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · AMIZADES V1 ===== */
let retrohubFriendsTab="friends";
let retrohubFriendCache={friends:[],incoming:[],outgoing:[],blocked:[]};

function retrohubHideHomeControls(){
  const q=document.getElementById("q"), filters=document.getElementById("filters");
  if(q){q.style.display="none";q.closest(".search-wrap")?.style.setProperty("display","none");}
  if(filters) filters.style.display="none";
}
function retrohubSocialAvatar(url){
  return url || avatarFallback();
}
