/*
 * RetroHub BR — Central de notificações V11
 * Não altera os módulos estáveis. Usa as relações/mensagens já existentes.
 */
(function(){
  let notifTimer=null;
  let notifOpen=false;

  function esc(v){
    return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  }

  function getClient(){
    return window.retrohubSupabase || window.supabaseClient || window._supabase || null;
  }

  function ensureUI(){
    if(document.getElementById("retrohubNotificationBell")) return;
    const accountBtn =
      document.querySelector("#accountButton") ||
      document.querySelector('[onclick*="handleAccountButton"]') ||
      document.querySelector(".account-button");
    if(!accountBtn || !accountBtn.parentElement) return;

    const wrap=document.createElement("div");
    wrap.className="retrohub-notification-wrap";
    wrap.innerHTML=`
      <button id="retrohubNotificationBell" class="retrohub-notification-bell" type="button"
        aria-label="Notificações" title="Notificações">
        <span class="retrohub-notification-bell-icon">🔔</span>
        <span id="retrohubNotificationCount" class="retrohub-notification-count" hidden>0</span>
      </button>
      <div id="retrohubNotificationPanel" class="retrohub-notification-panel" hidden>
        <div class="retrohub-notification-head">
          <strong>Notificações</strong>
          <button type="button" id="retrohubNotificationClose" aria-label="Fechar">×</button>
        </div>
        <div id="retrohubNotificationList" class="retrohub-notification-list">
          <div class="retrohub-notification-empty">Carregando...</div>
        </div>
      </div>`;
    accountBtn.parentElement.insertBefore(wrap,accountBtn);

    wrap.querySelector("#retrohubNotificationBell").addEventListener("click",e=>{
      e.stopPropagation();
      togglePanel();
    });
    wrap.querySelector("#retrohubNotificationClose").addEventListener("click",()=>{
      closePanel();
    });
    document.addEventListener("click",e=>{
      if(notifOpen && !wrap.contains(e.target)) closePanel();
    });
  }

  function closePanel(){
    const p=document.getElementById("retrohubNotificationPanel");
    if(p) p.hidden=true;
    notifOpen=false;
  }

  async function togglePanel(){
    ensureUI();
    const p=document.getElementById("retrohubNotificationPanel");
    if(!p) return;
    notifOpen=p.hidden;
    p.hidden=!p.hidden;
    if(notifOpen) await refreshNotifications(true);
  }

  function setCount(n){
    const el=document.getElementById("retrohubNotificationCount");
    if(!el) return;
    el.textContent=n>99?"99+":String(n);
    el.hidden=!n;
  }

  async function currentUser(){
    const sb=getClient();
    if(!sb?.auth) return null;
    try{
      const {data}=await sb.auth.getUser();
      return data?.user||null;
    }catch(_){ return null; }
  }

  async function refreshNotifications(render=false){
    ensureUI();
    const list=document.getElementById("retrohubNotificationList");
    const user=await currentUser();
    if(!user){
      setCount(0);
      if(render && list) list.innerHTML='<div class="retrohub-notification-empty">Entre na sua conta para ver notificações.</div>';
      return;
    }

    const sb=getClient();
    const items=[];

    // Reaproveita a função já validada do módulo friends.js quando disponível.
    try{
      if(typeof window.getRetrohubRelations==="function"){
        const rels=await window.getRetrohubRelations();
        const rows=Array.isArray(rels)?rels:(rels?.data||[]);
        const pending=rows.filter(r=>{
          const status=String(r.status||"").toLowerCase();
          const receiver=r.receiver_id||r.addressee_id||r.friend_id||r.to_user_id;
          return status==="pending" && receiver===user.id;
        });
        pending.forEach(r=>items.push({
          type:"friend",
          title:"Novo pedido de amizade",
          text:"Você recebeu um pedido de amizade.",
          action:()=>typeof window.openRetrohubFriends==="function" && window.openRetrohubFriends()
        }));
      }
    }catch(e){ console.warn("RetroHub notifications/friends:",e); }

    // Mensagens não lidas: tenta as colunas usadas com mais frequência sem quebrar se a tabela variar.
    try{
      const {data,error}=await sb.from("messages")
        .select("*")
        .eq("receiver_id",user.id)
        .is("read_at",null)
        .order("created_at",{ascending:false})
        .limit(20);
      if(!error && Array.isArray(data)){
        data.forEach(m=>items.push({
          type:"message",
          title:"Nova mensagem",
          text:String(m.content||m.message||"Você recebeu uma nova mensagem.").slice(0,90),
          action:()=> {
            const other=m.sender_id||m.user_id;
            if(other && typeof window.openRetrohubChat==="function") window.openRetrohubChat(other);
          }
        }));
      }
    }catch(_){}

    setCount(items.length);

    if(render && list){
      if(!items.length){
        list.innerHTML='<div class="retrohub-notification-empty">Nenhuma notificação nova.</div>';
      }else{
        list.innerHTML=items.map((it,i)=>`
          <button type="button" class="retrohub-notification-item" data-notif-index="${i}">
            <span class="retrohub-notification-type">${it.type==="message"?"💬":"👥"}</span>
            <span><strong>${esc(it.title)}</strong><small>${esc(it.text)}</small></span>
          </button>`).join("");
        list.querySelectorAll("[data-notif-index]").forEach(btn=>{
          btn.addEventListener("click",()=>{
            const it=items[Number(btn.dataset.notifIndex)];
            closePanel();
            if(it?.action) it.action();
          });
        });
      }
    }
  }

  function start(){
    ensureUI();
    refreshNotifications(false);
    clearInterval(notifTimer);
    notifTimer=setInterval(()=>refreshNotifications(false),60000);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start);
  else start();

  window.refreshRetrohubNotifications=refreshNotifications;
})();
