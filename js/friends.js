/*
 * RetroHub BR — Amigos e mensagens
 * Extraído do app.js na Etapa 2.
 * Mantém as funções globais usadas pelo perfil e pela interface.
 */

function retrohubFriendCard(profile, relation, mode){
  const username=profile?.username||"Usuário";
  const avatar=retrohubSocialAvatar(profile?.avatar_url);
  let buttons="";
  if(mode==="search"){
    if(!relation) buttons=`<button class="friend-action" onclick="sendRetrohubFriendRequest('${profile.id}')">Adicionar amigo</button>`;
    else if(relation.status==="accepted") buttons=`<span class="friend-status">✓ Amigo</span>`;
    else if(relation.status==="pending"&&relation.sender_id===retrohubSession.user.id) buttons=`<span class="friend-status pending">Pedido enviado</span><button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Cancelar</button>`;
    else if(relation.status==="pending") buttons=`<button class="friend-action" onclick="acceptRetrohubFriendRequest('${relation.id}')">Aceitar</button><button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Recusar</button>`;
  }else if(mode==="incoming"){
    buttons=`<button class="friend-action" onclick="acceptRetrohubFriendRequest('${relation.id}')">Aceitar</button><button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Recusar</button>`;
  }else if(mode==="outgoing"){
    buttons=`<span class="friend-status pending">Aguardando</span><button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Cancelar</button>`;
  }else if(mode==="blocked"){
    buttons=`<button class="friend-action secondary" onclick="removeRetrohubFriendship('${relation.id}')">Desbloquear</button>`;
  }else{
    buttons=`<button class="friend-chat-btn" onclick="openRetrohubChat('${profile.id}')"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style="vertical-align:-3px;margin-right:6px"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v10h4.3L9 16.1V16h11V6H4Z"/></svg>Conversar</button><span class="friend-status">Amigo</span><button class="friend-action danger" onclick="removeRetrohubFriendship('${relation.id}')">Remover</button>`;
  }
  return `<article class="friend-card">
    <div class="friend-avatar-wrap" onclick="openRetrohubPublicProfile('${profile.id}')" title="Ver perfil de @${escapeHTML(username)}"><img class="friend-avatar" src="${escapeHTML(avatar)}" alt="" onerror="this.onerror=null;this.src=avatarFallback()"><span class="friend-online-dot" title="Usuário do RetroHub"></span></div>
    <div class="friend-info">
      <strong onclick="openRetrohubPublicProfile('${profile.id}')" title="Ver perfil">@${escapeHTML(username)}</strong>
      <small>${profile?.retroachievements_username ? "RetroAchievements: "+escapeHTML(profile.retroachievements_username) : "Membro do RetroHub BR"}</small>
      <div class="friend-meta"><span class="friend-level">RetroHub</span><span>Perfil de jogador</span></div>
    </div>
    <div class="friend-actions">${buttons}</div>
  </article>`;
}
async function getRetrohubRelations(){
  if(!retrohubSession?.user) return [];
  const uid=retrohubSession.user.id;
  const {data,error}=await retrohubSupabase.from("friendships").select("*").or(`sender_id.eq.${uid},receiver_id.eq.${uid}`).order("created_at",{ascending:false});
  if(error) throw error;
  return data||[];
}
async function getRetrohubProfiles(ids){
  const unique=[...new Set((ids||[]).filter(Boolean))];
  if(!unique.length) return {};
  const {data,error}=await retrohubSupabase.from("profiles").select("id,username,avatar_url,retroachievements_username").in("id",unique);
  if(error) throw error;
  return Object.fromEntries((data||[]).map(p=>[p.id,p]));
}
async function loadRetrohubFriends(){
  const uid=retrohubSession.user.id;
  const relations=await getRetrohubRelations();
  const profiles=await getRetrohubProfiles(relations.map(r=>r.sender_id===uid?r.receiver_id:r.sender_id));
  retrohubFriendCache={friends:[],incoming:[],outgoing:[],blocked:[]};
  relations.forEach(r=>{
    const otherId=r.sender_id===uid?r.receiver_id:r.sender_id, profile=profiles[otherId];
    if(!profile)return;
    const item={profile,relation:r};
    if(r.status==="accepted") retrohubFriendCache.friends.push(item);
    else if(r.status==="blocked") retrohubFriendCache.blocked.push(item);
    else if(r.status==="pending"&&r.receiver_id===uid) retrohubFriendCache.incoming.push(item);
    else if(r.status==="pending") retrohubFriendCache.outgoing.push(item);
  });
  renderRetrohubFriendsTab(retrohubFriendsTab);
}
function setRetrohubFriendsTab(tab,button){
  retrohubFriendsTab=tab;
  document.querySelectorAll(".friends-tab").forEach(x=>x.classList.remove("active"));
  button?.classList.add("active");
  renderRetrohubFriendsTab(tab);
}
function renderRetrohubFriendsTab(tab){
  const box=document.getElementById("friendsResults"); if(!box)return;
  const list=retrohubFriendCache[tab]||[];
  const mode=tab==="incoming"?"incoming":tab==="outgoing"?"outgoing":tab==="blocked"?"blocked":"friends";
  const emptyCopy=tab==="friends"
    ?["👥","Sua lista de amigos está vazia","Pesquise um usuário acima para começar a criar sua comunidade."]
    :tab==="incoming"
      ?["📨","Nenhum pedido novo","Quando alguém adicionar você, o pedido aparecerá aqui."]
      :tab==="outgoing"
        ?["↗","Nenhum pedido enviado","Os pedidos aguardando resposta aparecerão aqui."]
        :["✓","Nenhum usuário bloqueado","Sua lista de bloqueados está vazia."];
  box.innerHTML=list.length?list.map(x=>retrohubFriendCard(x.profile,x.relation,mode)).join(""):`<div class="friends-empty"><div class="friends-empty-icon">${emptyCopy[0]}</div><strong>${emptyCopy[1]}</strong><span>${emptyCopy[2]}</span></div>`;
  const incomingCount=document.getElementById("incomingFriendCount"); if(incomingCount) incomingCount.textContent=retrohubFriendCache.incoming.length;
  const summary=document.getElementById("friendsOnlineSummary"); if(summary) summary.textContent=retrohubFriendCache.friends.length;
}
async function openRetrohubFriends(){
  window.retrohubViewingPublicProfile=false;
  if(!retrohubSession?.user){openAccountPanel();return;}
  closeAccountPanel(); retrohubHideHomeControls();
  const url=location.pathname+location.search+"#friends";
  if(location.hash!=="#friends")history.pushState({page:"friends"},"",url);
  const app=document.getElementById("app");
  app.innerHTML=`<section class="friends-page">
    <div class="friends-head">
      <div class="friends-title-row"><div class="friends-title-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="34" height="34"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"/></svg></div><div><h1>Amigos</h1><p>Sua comunidade no RetroHub BR</p><div class="friends-summary"><strong id="friendsOnlineSummary">0</strong> amigos na sua lista</div></div></div>
      <button class="friends-profile-btn" onclick="openFullRetrohubProfile()">← Meu perfil</button>
    </div>
    <form class="friends-search" onsubmit="searchRetrohubPeople(event)">
      <div class="friends-search-box"><span class="friends-search-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="22" height="22"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.7-3.7"></path></svg></span><input id="friendsSearchInput" maxlength="24" autocomplete="off" placeholder="Pesquisar usuários do RetroHub..."></div>
      <button type="submit">Pesquisar</button>
    </form>
    <div class="friends-tabs">
      <button class="friends-tab active" onclick="setRetrohubFriendsTab('friends',this)">Todos</button>
      <button class="friends-tab" onclick="setRetrohubFriendsTab('incoming',this)">Pedidos <span id="incomingFriendCount" class="friends-count">0</span></button>
      <button class="friends-tab" onclick="setRetrohubFriendsTab('outgoing',this)">Enviados</button>
      <button class="friends-tab" onclick="setRetrohubFriendsTab('blocked',this)">Bloqueados</button>
    </div>
    <div id="friendsNotice"></div>
    <div id="friendsResults" class="friends-grid"><div class="friends-empty"><div class="friends-empty-icon">👥</div><strong>Carregando seus amigos...</strong><span>Um instante.</span></div></div>
  </section>`;
  try{await loadRetrohubFriends();}catch(e){console.error(e);document.getElementById("friendsResults").innerHTML=`<div class="friends-empty friends-error"><div class="friends-empty-icon">!</div><strong>Não foi possível carregar seus amigos</strong><span>Tente novamente em alguns instantes.</span></div>`;}
  window.scrollTo({top:0,behavior:"auto"});
}
async function searchRetrohubPeople(event){
  event.preventDefault();
  const input=document.getElementById("friendsSearchInput"), term=(input?.value||"").trim();
  const box=document.getElementById("friendsResults");
  if(term.length<2){box.innerHTML=`<div class="friends-empty">Digite pelo menos 2 caracteres.</div>`;return;}
  box.innerHTML=`<div class="friends-empty">Pesquisando...</div>`;
  const uid=retrohubSession.user.id;
  try{
    const [{data:profiles,error},relations]=await Promise.all([
      retrohubSupabase.from("profiles").select("id,username,avatar_url,retroachievements_username").ilike("username",`%${term}%`).neq("id",uid).limit(30),
      getRetrohubRelations()
    ]);
    if(error)throw error;
    const relationMap={};
    relations.forEach(r=>{const other=r.sender_id===uid?r.receiver_id:r.sender_id;relationMap[other]=r;});
    box.innerHTML=(profiles||[]).length?(profiles||[]).map(p=>retrohubFriendCard(p,relationMap[p.id],"search")).join(""):`<div class="friends-empty">Nenhum usuário encontrado.</div>`;
  }catch(e){console.error(e);box.innerHTML=`<div class="friends-empty">Erro ao pesquisar usuários.</div>`;}
}
async function sendRetrohubFriendRequest(receiverId){
  const uid=retrohubSession?.user?.id;if(!uid||uid===receiverId)return;
  const {error}=await retrohubSupabase.from("friendships").insert({sender_id:uid,receiver_id:receiverId,status:"pending"});
  if(error){alert(error.code==="23505"?"Já existe uma relação com este usuário.":"Não foi possível enviar o pedido.");return;}
  await loadRetrohubFriends(); const f=document.querySelector(".friends-search"); if(f) f.requestSubmit();
}
async function acceptRetrohubFriendRequest(id){
  const {error}=await retrohubSupabase.from("friendships").update({status:"accepted",updated_at:new Date().toISOString()}).eq("id",id).eq("receiver_id",retrohubSession.user.id).eq("status","pending");
  if(error){alert("Não foi possível aceitar o pedido.");return;} await loadRetrohubFriends();
}
async function removeRetrohubFriendship(id){
  const {error}=await retrohubSupabase.from("friendships").delete().eq("id",id);
  if(error){alert("Não foi possível alterar esta amizade.");return;} await loadRetrohubFriends();
}
async function blockRetrohubUser(otherId){
  const uid=retrohubSession?.user?.id;if(!uid||uid===otherId)return;
  const relations=await getRetrohubRelations();
  const existing=relations.find(r=>(r.sender_id===uid&&r.receiver_id===otherId)||(r.sender_id===otherId&&r.receiver_id===uid));
  if(existing) await retrohubSupabase.from("friendships").delete().eq("id",existing.id);
  const {error}=await retrohubSupabase.from("friendships").insert({sender_id:uid,receiver_id:otherId,status:"blocked"});
  if(error)alert("Não foi possível bloquear este usuário."); else await loadRetrohubFriends();
}
window.addEventListener("hashchange",()=>{if(location.hash==="#friends"&&retrohubSession?.user)openRetrohubFriends();});

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · PERFIL PÚBLICO DE OUTRO USUÁRIO ===== */
async function getRetrohubRelationWith(otherId){
  if(!retrohubSession?.user)return null;
  const uid=retrohubSession.user.id;
  const {data,error}=await retrohubSupabase.from("friendships").select("*")
    .or(`and(sender_id.eq.${uid},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${uid})`)
    .maybeSingle();
  if(error){console.error(error);return null}
  return data||null;
}
function publicProfileActionHTML(profile,relation){
  if(!retrohubSession?.user)return "";
  const uid=retrohubSession.user.id;
  if(profile.id===uid)return `<button class="friend-action" onclick="openFullRetrohubProfile()">Meu perfil</button>`;
  if(!relation)return `<button class="friend-action" onclick="sendRetrohubFriendRequestFromProfile('${profile.id}')">＋ Adicionar amigo</button><button class="friend-action secondary" onclick="blockRetrohubUserFromProfile('${profile.id}')">Bloquear</button>`;
  if(relation.status==="accepted")return `<button class="friend-action" onclick="openRetrohubChat('${profile.id}')"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style="vertical-align:-3px;margin-right:6px"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v10h4.3L9 16.1V16h11V6H4Z"/></svg>Conversar</button><button class="friend-action secondary">✓ Amigos</button><button class="friend-action danger" onclick="removeRetrohubFriendshipFromProfile('${relation.id}')">Remover amigo</button>`;
  if(relation.status==="blocked")return `<button class="friend-action secondary" onclick="removeRetrohubFriendshipFromProfile('${relation.id}')">Desbloquear</button>`;
  if(relation.receiver_id===uid)return `<button class="friend-action" onclick="acceptRetrohubFriendRequestFromProfile('${relation.id}','${profile.id}')">✓ Aceitar pedido</button><button class="friend-action secondary" onclick="removeRetrohubFriendshipFromProfile('${relation.id}')">Recusar</button>`;
  return `<button class="friend-action secondary">Pedido enviado</button><button class="friend-action danger" onclick="removeRetrohubFriendshipFromProfile('${relation.id}')">Cancelar</button>`;
}
async function openRetrohubPublicProfile(userId,pushState=true){
  if(!retrohubSession?.user){openAccountPanel();return}
  if(userId===retrohubSession.user.id){openFullRetrohubProfile();return}

  window.retrohubViewingPublicProfile=true;
  window.retrohubPublicProfileUserId=userId;
  closeAccountPanel();
  retrohubHideHomeControls();

  const app=document.getElementById("app");
  app.innerHTML=`<section class="profile-page"><div class="profile-section profile-empty">Carregando perfil do jogador...</div></section>`;

  try{
    const [{data:profile,error},relation]=await Promise.all([
      retrohubSupabase.from("profiles").select("*").eq("id",userId).single(),
      getRetrohubRelationWith(userId)
    ]);
    if(error)throw error;

    if(pushState){
      history.pushState(
        {page:"public-profile",userId},
        "",
        location.pathname+location.search+"#profile/"+encodeURIComponent(profile.username||userId)
      );
    }

    const username=profile.username||"Usuário";
    const raUser=profile.retroachievements_username||"";
    const avatar=profile.avatar_url||avatarFallback();
    const wallpaper=profile.wallpaper_url||profile.cover_url||profile.banner_url||"";
    const wallpaperStyle=wallpaper?` style="--profile-wallpaper:url('${escapeHTML(wallpaper).replace(/'/g,"%27")}')"`:"";

    app.innerHTML=`<section class="profile-page">
      <button class="public-profile-back" onclick="openRetrohubFriends()">← Voltar para amigos</button>
      <div class="profile-hero ${wallpaper?"has-wallpaper":""}"${wallpaperStyle}>
        <div class="profile-hero-grid">
          <img class="profile-page-avatar${supporterAvatarClass(profile)}" src="${escapeHTML(avatar)}" alt="Avatar" onerror="this.onerror=null;this.src=avatarFallback()">
          <div class="profile-hero-main">
            <h1 class="profile-page-name">@${escapeHTML(username)}</h1>
            <div class="profile-page-ra">${raUser?escapeHTML(raUser):"RetroAchievements não vinculado"}</div>
            <div class="profile-meta-row"><div class="profile-online">Perfil RetroHub</div></div>
            <div id="profileHeroFeaturedBadge" class="profile-hero-featured-badge" hidden></div>
            <div class="profile-level-wrap">
              <div class="profile-level-line">
                <div id="profileLevelPill" class="profile-level">🎖️ Nível <b>1</b> · Novato</div>
                <span id="profileXpText" class="profile-xp-text">0 / 500 XP</span>
              </div>
              <div class="profile-xp-track"><div id="profileXpFill" class="profile-xp-fill"></div></div>
            </div>
          </div>
          <div class="profile-hero-actions">${publicProfileActionHTML(profile,relation)}</div>
        </div>
      </div>
      <div id="profileDashboard">
        <div class="profile-loading">${raUser?"Carregando conquistas, jogos, insígnias e progresso...":"Este usuário ainda não vinculou o RetroAchievements."}</div>
      </div>
    </section>`;

    if(raUser){
      await loadRetrohubFullProfile(raUser);
    }else{
      const target=document.getElementById("profileDashboard");
      if(target)target.innerHTML=`<div class="profile-section profile-empty">Quando @${escapeHTML(username)} vincular uma conta do RetroAchievements, o perfil completo aparecerá aqui.</div>`;
    }

    window.scrollTo({top:0,behavior:"auto"});
  }catch(e){
    console.error(e);
    window.retrohubViewingPublicProfile=false;
    app.innerHTML=`<section class="public-profile-page"><button class="public-profile-back" onclick="openRetrohubFriends()">← Voltar para amigos</button><div class="friends-empty friends-error"><div class="friends-empty-icon">!</div><strong>Perfil indisponível</strong><span>Não foi possível carregar este usuário.</span></div></section>`;
  }
}
async function sendRetrohubFriendRequestFromProfile(id){await sendRetrohubFriendRequest(id);await openRetrohubPublicProfile(id,false)}
async function acceptRetrohubFriendRequestFromProfile(id,userId){await acceptRetrohubFriendRequest(id);await openRetrohubPublicProfile(userId,false)}
async function removeRetrohubFriendshipFromProfile(id){await removeRetrohubFriendship(id);openRetrohubFriends()}
async function blockRetrohubUserFromProfile(id){await blockRetrohubUser(id);await openRetrohubPublicProfile(id,false)}

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · CHAT ENTRE AMIGOS V1 ===== */
let retrohubChatFriend=null;
let retrohubChatTimer=null;
let retrohubChatLastSignature="";

function stopRetrohubChatPolling(){
  if(retrohubChatTimer){clearInterval(retrohubChatTimer);retrohubChatTimer=null}
}
function retrohubChatDate(value){
  try{return new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit"}).format(new Date(value))}
  catch{return ""}
}
async function verifyRetrohubAcceptedFriend(otherId){
  const rel=await getRetrohubRelationWith(otherId);
  return !!(rel&&rel.status==="accepted");
}
async function openRetrohubChat(friendId,pushState=true){
  if(!retrohubSession?.user){openAccountPanel();return}
  if(!friendId||friendId===retrohubSession.user.id)return;
  stopRetrohubChatPolling();
  retrohubHideHomeControls();

  const app=document.getElementById("app");
  app.innerHTML=`<section class="chat-page"><div class="friends-empty">Abrindo conversa...</div></section>`;

  try{
    const [accepted,{data:profile,error}]=await Promise.all([
      verifyRetrohubAcceptedFriend(friendId),
      retrohubSupabase.from("profiles").select("id,username,avatar_url,retroachievements_username").eq("id",friendId).single()
    ]);
    if(error)throw error;
    if(!accepted)throw new Error("CHAT_NOT_FRIEND");

    retrohubChatFriend=profile;
    retrohubChatLastSignature="";
    if(pushState)history.pushState({page:"chat",friendId},"",location.pathname+location.search+"#chat/"+encodeURIComponent(friendId));

    const avatar=retrohubSocialAvatar(profile.avatar_url);
    app.innerHTML=`<section class="chat-page">
      <div class="chat-shell">
        <header class="chat-head">
          <button class="chat-back" onclick="openRetrohubFriends()">←</button>
          <img src="${escapeHTML(avatar)}" alt="" onerror="this.onerror=null;this.src=avatarFallback()">
          <div class="chat-head-info"><strong>@${escapeHTML(profile.username||"Usuário")}</strong><small>Seu amigo no RetroHub BR</small></div>
          <button class="chat-profile chat-delete-conversation" onclick="deleteRetrohubConversationForMe('${profile.id}')">🗑️ Excluir conversa</button>
          <button class="chat-profile" onclick="openRetrohubPublicProfile('${profile.id}')">Ver perfil</button>
        </header>
        <div id="retrohubChatMessages" class="chat-messages"><div class="chat-empty"><b>Carregando mensagens...</b></div></div>
        <form class="chat-compose" onsubmit="sendRetrohubChatMessage(event)">
          <textarea id="retrohubChatInput" maxlength="1000" rows="1" placeholder="Escreva uma mensagem..." onkeydown="retrohubChatKeydown(event)"></textarea>
          <button id="retrohubChatSend" class="chat-send" type="submit">Enviar</button>
        </form>
      </div>
    </section>`;

    await loadRetrohubChatMessages(true);
    await markRetrohubChatRead(friendId);
    retrohubChatTimer=setInterval(()=>loadRetrohubChatMessages(false),3000);
    document.getElementById("retrohubChatInput")?.focus();
  }catch(e){
    console.error(e);
    app.innerHTML=`<section class="chat-page"><button class="public-profile-back" onclick="openRetrohubFriends()">← Voltar para amigos</button><div class="friends-empty friends-error"><div class="friends-empty-icon">!</div><strong>Não foi possível abrir o chat</strong><span>${e?.message==="CHAT_NOT_FRIEND"?"O chat só está disponível entre amigos aceitos.":"Verifique se a tabela de mensagens foi criada no Supabase."}</span></div></section>`;
  }
}

async function getRetrohubConversationHiddenBefore(friendId){
  if(!retrohubSession?.user||!friendId)return null;
  const {data,error}=await retrohubSupabase
    .from("conversation_hidden_state")
    .select("hidden_before")
    .eq("user_id",retrohubSession.user.id)
    .eq("other_user_id",friendId)
    .maybeSingle();
  if(error){
    console.error("Estado da conversa:",error);
    return null;
  }
  return data?.hidden_before||null;
}

async function deleteRetrohubConversationForMe(friendId){
  if(!retrohubSession?.user||!friendId)return;
  const ok=confirm("Excluir esta conversa só para você?\n\nAs mensagens continuarão visíveis para a outra pessoa. Se uma nova mensagem for enviada depois, a conversa aparecerá novamente.");
  if(!ok)return;

  const uid=retrohubSession.user.id;
  const hiddenBefore=new Date().toISOString();
  const {error}=await retrohubSupabase
    .from("conversation_hidden_state")
    .upsert({user_id:uid,other_user_id:friendId,hidden_before:hiddenBefore},{onConflict:"user_id,other_user_id"});
  if(error){
    console.error("Excluir conversa:",error);
    alert("Não foi possível excluir a conversa.");
    return;
  }

  // Remove também avisos antigos de mensagens recebidas dessa pessoa.
  const {error:readError}=await retrohubSupabase
    .from("messages")
    .update({read_at:hiddenBefore})
    .eq("sender_id",friendId)
    .eq("receiver_id",uid)
    .is("read_at",null);
  if(readError)console.error("Marcar conversa como lida:",readError);

  retrohubChatLastSignature="";
  retrohubFloatingSignature="";
  const fullBox=document.getElementById("retrohubChatMessages");
  const floatBox=document.getElementById("retrohubFloatingChatMessages");
  const empty='<div class="chat-empty"><b>Conversa excluída para você.</b>Novas mensagens aparecerão normalmente aqui.</div>';
  if(fullBox)fullBox.innerHTML=empty;
  if(floatBox)floatBox.innerHTML=empty;
  updateRetrohubMessageNotifications();
}

async function deleteRetrohubFloatingConversationForMe(){
  if(!retrohubFloatingFriend?.id)return;
  await deleteRetrohubConversationForMe(retrohubFloatingFriend.id);
}
window.deleteRetrohubConversationForMe=deleteRetrohubConversationForMe;
window.deleteRetrohubFloatingConversationForMe=deleteRetrohubFloatingConversationForMe;

async function loadRetrohubChatMessages(forceScroll=false){
  if(!retrohubChatFriend||!retrohubSession?.user)return;
  const uid=retrohubSession.user.id, fid=retrohubChatFriend.id;
  const hiddenBefore=await getRetrohubConversationHiddenBefore(fid);
  let query=retrohubSupabase.from("messages")
    .select("id,sender_id,receiver_id,content,created_at")
    .or(`and(sender_id.eq.${uid},receiver_id.eq.${fid}),and(sender_id.eq.${fid},receiver_id.eq.${uid})`);
  if(hiddenBefore)query=query.gt("created_at",hiddenBefore);
  const {data,error}=await query.order("created_at",{ascending:true}).limit(300);
  if(error){console.error(error);return}
  const rows=data||[];
  const sig=rows.length?`${rows.length}:${rows[rows.length-1].id}`:"0";
  if(sig===retrohubChatLastSignature&&!forceScroll)return;
  retrohubChatLastSignature=sig;

  const box=document.getElementById("retrohubChatMessages");if(!box)return;
  const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<120;
  box.innerHTML=rows.length?rows.map(m=>{
    const mine=m.sender_id===uid;
    return `<div class="chat-row ${mine?"mine":""}"><div class="chat-bubble">${escapeHTML(m.content||"")}<span class="chat-time">${retrohubChatDate(m.created_at)}</span></div></div>`;
  }).join(""):`<div class="chat-empty"><b>Comece a conversa 👋</b>Envie a primeira mensagem para @${escapeHTML(retrohubChatFriend.username||"seu amigo")}.</div>`;
  if(forceScroll||nearBottom)box.scrollTop=box.scrollHeight;
}
async function sendRetrohubChatMessage(event){
  event.preventDefault();
  if(!retrohubChatFriend||!retrohubSession?.user)return;
  const input=document.getElementById("retrohubChatInput");
  const button=document.getElementById("retrohubChatSend");
  const content=(input?.value||"").trim();
  if(!content)return;
  if(content.length>1000){alert("A mensagem pode ter no máximo 1000 caracteres.");return}
  if(button)button.disabled=true;
  const {error}=await retrohubSupabase.from("messages").insert({
    sender_id:retrohubSession.user.id,
    receiver_id:retrohubChatFriend.id,
    content
  });
  if(button)button.disabled=false;
  if(error){
    console.error(error);
    alert(error.code==="42501"?"O Supabase bloqueou o envio. Execute o SQL do chat que acompanha esta versão.":"Não foi possível enviar a mensagem.");
    return;
  }
  input.value="";
  retrohubChatLastSignature="";
  await loadRetrohubChatMessages(true);
  input.focus();
}
function retrohubChatKeydown(event){
  if(event.key==="Enter"&&!event.shiftKey){
    event.preventDefault();
    event.target.form?.requestSubmit();
  }
}
window.addEventListener("hashchange",()=>{
  if(!location.hash.startsWith("#chat/"))stopRetrohubChatPolling();
});

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · NOTIFICAÇÕES DE MENSAGENS ===== */
let retrohubNotifyTimer=null;

function startRetrohubMessageNotifications(){
  if(retrohubNotifyTimer)clearInterval(retrohubNotifyTimer);
  updateRetrohubMessageNotifications();
  retrohubNotifyTimer=setInterval(updateRetrohubMessageNotifications,5000);
}
function stopRetrohubMessageNotifications(){
  if(retrohubNotifyTimer){clearInterval(retrohubNotifyTimer);retrohubNotifyTimer=null}
  document.getElementById("messageNotifyWrap")?.classList.remove("show");
}
async function updateRetrohubMessageNotifications(){
  const wrap=document.getElementById("messageNotifyWrap");
  if(!wrap)return;
  if(!retrohubSession?.user){wrap.classList.remove("show");return}
  wrap.classList.add("show");
  const uid=retrohubSession.user.id;
  const {data,error}=await retrohubSupabase.from("messages")
    .select("id,sender_id,content,created_at")
    .eq("receiver_id",uid).is("read_at",null)
    .order("created_at",{ascending:false}).limit(100);
  if(error){console.error("Notificações:",error);return}
  const unread=data||[], grouped={};
  unread.forEach(m=>{
    if(!grouped[m.sender_id])grouped[m.sender_id]={count:0,last:m};
    grouped[m.sender_id].count++;
  });
  const ids=Object.keys(grouped);
  let profiles={};
  if(ids.length){
    const {data:p}=await retrohubSupabase.from("profiles").select("id,username,avatar_url").in("id",ids);
    profiles=Object.fromEntries((p||[]).map(x=>[x.id,x]));
  }
  const total=unread.length,badge=document.getElementById("messageNotifyBadge"),list=document.getElementById("messageNotifyList");
  if(badge){badge.textContent=total>99?"99+":String(total);badge.classList.toggle("show",total>0)}
  if(!list)return;
  list.innerHTML=ids.length?ids.map(id=>{
    const p=profiles[id]||{username:"Usuário",avatar_url:""};
    const g=grouped[id],avatar=retrohubSocialAvatar(p.avatar_url);
    return `<div class="message-notice" onclick="openRetrohubChatFromNotification('${id}')">
      <img src="${escapeHTML(avatar)}" alt="" onerror="this.onerror=null;this.src=avatarFallback()">
      <div><strong>@${escapeHTML(p.username||"Usuário")}</strong><span>${escapeHTML(g.last.content||"Nova mensagem")}</span></div>
      <b class="message-notice-count">${g.count}</b>
    </div>`;
  }).join(""):`<div class="message-pop-empty">Nenhuma mensagem nova.</div>`;
}
function positionRetrohubMessagePopover(){
  const pop=document.getElementById("messageNotifyPopover");
  const bell=document.getElementById("messageBell");
  if(!pop||!bell)return;

  const r=bell.getBoundingClientRect();
  const panelWidth=Math.min(350,window.innerWidth-24);
  let left=r.right-panelWidth;

  if(left<12) left=12;
  if(left+panelWidth>window.innerWidth-12) left=window.innerWidth-panelWidth-12;

  pop.style.left=left+"px";
  pop.style.right="auto";
  pop.style.top=(r.bottom+10)+"px";
}

function toggleRetrohubMessageNotifications(event){
  event?.stopPropagation();
  const pop=document.getElementById("messageNotifyPopover");
  const bell=document.getElementById("messageBell");
  const open=!pop?.classList.contains("show");

  if(open) positionRetrohubMessagePopover();

  pop?.classList.toggle("show",open);
  bell?.classList.toggle("active",open);

  if(open) updateRetrohubMessageNotifications();
}
document.addEventListener("click",()=>{
  document.getElementById("messageNotifyPopover")?.classList.remove("show");
  document.getElementById("messageBell")?.classList.remove("active");
});

window.addEventListener("resize",()=>{
  if(document.getElementById("messageNotifyPopover")?.classList.contains("show")){
    positionRetrohubMessagePopover();
  }
});
window.addEventListener("scroll",()=>{
  if(document.getElementById("messageNotifyPopover")?.classList.contains("show")){
    positionRetrohubMessagePopover();
  }
},{passive:true});

async function openRetrohubChatFromNotification(friendId){
  document.getElementById("messageNotifyPopover")?.classList.remove("show");
  await openRetrohubFloatingChat(friendId);
}
async function markRetrohubChatRead(friendId){
  if(!retrohubSession?.user||!friendId)return;
  const {error}=await retrohubSupabase.from("messages").update({read_at:new Date().toISOString()})
    .eq("sender_id",friendId).eq("receiver_id",retrohubSession.user.id).is("read_at",null);
  if(error)console.error("Marcar mensagens como lidas:",error);
  updateRetrohubMessageNotifications();
}
window.addEventListener("load",()=>setTimeout(startRetrohubMessageNotifications,1800));

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · CHAT FLUTUANTE V8 ===== */
let retrohubFloatingFriend=null;
let retrohubFloatingTimer=null;
let retrohubFloatingSignature="";

function closeRetrohubFloatingChat(){
  document.getElementById("retrohubFloatingChat")?.classList.remove("show");
  if(retrohubFloatingTimer){clearInterval(retrohubFloatingTimer);retrohubFloatingTimer=null}
  retrohubFloatingFriend=null;
}
function minimizeRetrohubFloatingChat(){
  closeRetrohubFloatingChat();
}
function openFloatingChatProfile(){
  if(!retrohubFloatingFriend)return;
  const id=retrohubFloatingFriend.id;
  closeRetrohubFloatingChat();
  openRetrohubPublicProfile(id);
}

async function openRetrohubFloatingChat(friendId){
  // O botão é garantido aqui porque o chat flutuante é controlado por friends.js.
  setTimeout(()=>{
    const tools=document.querySelector("#retrohubFloatingChat .retrohub-chat-float-tools, .retrohub-chat-float-tools");
    if(tools && !tools.querySelector(".retrohub-chat-delete-btn")){
      const btn=document.createElement("button");
      btn.className="retrohub-chat-icon-btn retrohub-chat-delete-btn";
      btn.type="button";
      btn.title="Excluir conversa só para você";
      btn.setAttribute("aria-label","Excluir conversa só para você");
      btn.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="19" height="19"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12Zm3-9h2v8H9v-8Zm4 0h2v8h-2v-8Zm2.5-6-1-1h-5l-1 1H5v2h14V4h-3.5Z"/></svg>';
      btn.onclick=()=>deleteRetrohubFloatingConversationForMe();
      tools.prepend(btn);
    }
  },80);

  if(!retrohubSession?.user){openAccountPanel();return}
  if(!friendId||friendId===retrohubSession.user.id)return;

  try{
    const [accepted,{data:profile,error}]=await Promise.all([
      verifyRetrohubAcceptedFriend(friendId),
      retrohubSupabase.from("profiles").select("id,username,avatar_url").eq("id",friendId).single()
    ]);
    if(error)throw error;
    if(!accepted){alert("O chat só está disponível entre amigos.");return}

    retrohubFloatingFriend=profile;
    retrohubFloatingSignature="";
    const panel=document.getElementById("retrohubFloatingChat");
    document.getElementById("retrohubFloatingChatAvatar").src=retrohubSocialAvatar(profile.avatar_url);
    document.getElementById("retrohubFloatingChatName").textContent="@"+(profile.username||"Usuário");
    document.getElementById("retrohubFloatingChatMessages").innerHTML='<div class="chat-empty"><b>Carregando...</b></div>';
    panel.classList.add("show");

    if(retrohubFloatingTimer)clearInterval(retrohubFloatingTimer);
    await loadRetrohubFloatingMessages(true);
    await markRetrohubChatRead(friendId);
    retrohubFloatingTimer=setInterval(()=>loadRetrohubFloatingMessages(false),3000);
    setTimeout(()=>document.getElementById("retrohubFloatingChatInput")?.focus(),100);
  }catch(e){
    console.error(e);
    alert("Não foi possível abrir a conversa.");
  }
}
async function loadRetrohubFloatingMessages(forceScroll=false){
  if(!retrohubFloatingFriend||!retrohubSession?.user)return;
  const uid=retrohubSession.user.id,fid=retrohubFloatingFriend.id;
  const hiddenBefore=await getRetrohubConversationHiddenBefore(fid);
  let query=retrohubSupabase.from("messages")
    .select("id,sender_id,receiver_id,content,created_at")
    .or(`and(sender_id.eq.${uid},receiver_id.eq.${fid}),and(sender_id.eq.${fid},receiver_id.eq.${uid})`);
  if(hiddenBefore)query=query.gt("created_at",hiddenBefore);
  const {data,error}=await query.order("created_at",{ascending:true}).limit(300);
  if(error){console.error(error);return}
  const rows=data||[];
  const sig=rows.length?`${rows.length}:${rows[rows.length-1].id}`:"0";
  if(sig===retrohubFloatingSignature&&!forceScroll)return;
  retrohubFloatingSignature=sig;
  const box=document.getElementById("retrohubFloatingChatMessages");if(!box)return;
  const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<100;
  box.innerHTML=rows.length?rows.map(m=>{
    const mine=m.sender_id===uid;
    return `<div class="chat-row ${mine?"mine":""}"><div class="chat-bubble">${escapeHTML(m.content||"")}<span class="chat-time">${retrohubChatDate(m.created_at)}</span></div></div>`;
  }).join(""):`<div class="chat-empty"><b>Comece a conversa 👋</b>Envie uma mensagem para @${escapeHTML(retrohubFloatingFriend.username||"seu amigo")}.</div>`;
  if(forceScroll||nearBottom)box.scrollTop=box.scrollHeight;
  await markRetrohubChatRead(fid);
}
async function sendRetrohubFloatingMessage(event){
  event.preventDefault();
  if(!retrohubFloatingFriend||!retrohubSession?.user)return;
  const input=document.getElementById("retrohubFloatingChatInput");
  const button=document.getElementById("retrohubFloatingChatSend");
  const content=(input?.value||"").trim();
  if(!content)return;
  button.disabled=true;
  const {error}=await retrohubSupabase.from("messages").insert({
    sender_id:retrohubSession.user.id,
    receiver_id:retrohubFloatingFriend.id,
    content
  });
  button.disabled=false;
  if(error){console.error(error);alert("Não foi possível enviar a mensagem.");return}
  input.value="";
  retrohubFloatingSignature="";
  await loadRetrohubFloatingMessages(true);
  input.focus();
}
function retrohubFloatingChatKeydown(event){
  if(event.key==="Enter"&&!event.shiftKey){
    event.preventDefault();
    event.target.form?.requestSubmit();
  }
}

/* A partir desta versão, qualquer botão antigo que chamava openRetrohubChat()
   abre a janela flutuante, sem trocar a página atual. */
window.openRetrohubChat=openRetrohubFloatingChat;

/* ===== BLOCO SEPARADO ===== */

/* ===== RETROHUB BR · PATREON OAUTH ===== */
