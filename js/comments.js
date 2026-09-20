/*
 * RetroHub BR — Sistema de comentários
 * Extraído do app.js na Etapa 2.
 * Mantém as mesmas funções globais usadas pelo HTML.
 */

let retrohubCommentsChannel=null;

function rhEscapeComment(v){
  return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function rhCommentDate(v){
  try{return new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v))}catch{return ""}
}
async function initGameComments(gameSlug){
  const form=document.getElementById("gameCommentForm");
  const note=document.getElementById("gameCommentLoginNote");
  const text=document.getElementById("gameCommentText");
  if(!form) return;

  const logged=!!retrohubSession?.user;
  form.hidden=!logged;
  if(note){note.hidden=logged;note.textContent=logged?"":"Entre na sua conta para comentar neste jogo."}
  if(text){
    text.oninput=()=>{const c=document.getElementById("gameCommentChars");if(c)c.textContent=String(text.value.length)}
  }
  await loadGameComments(gameSlug);

  try{
    if(retrohubCommentsChannel) await retrohubSupabase.removeChannel(retrohubCommentsChannel);
    retrohubCommentsChannel=retrohubSupabase.channel("game-comments-"+gameSlug)
      .on("postgres_changes",{event:"*",schema:"public",table:"game_comments",filter:"game_slug=eq."+gameSlug},()=>loadGameComments(gameSlug))
      .subscribe();
  }catch(e){console.warn("Realtime comentários:",e)}
}
async function loadGameComments(gameSlug){
  const list=document.getElementById("gameCommentsList");
  const count=document.getElementById("gameCommentsCount");
  if(!list)return;

  const {data:comments,error}=await retrohubSupabase
    .from("game_comments")
    .select("id,user_id,game_slug,content,created_at")
    .eq("game_slug",gameSlug)
    .order("created_at",{ascending:false});

  if(error){
    console.error("Erro ao carregar comentários:",error);
    list.innerHTML='<div class="rh-comments-empty">Não foi possível carregar os comentários.</div>';
    if(count)count.textContent="—";
    return;
  }

  const rows=comments||[];
  if(count)count.textContent=rows.length===1?"1 comentário":rows.length+" comentários";

  if(!rows.length){
    list.innerHTML='<div class="rh-comments-empty">Ainda não há comentários. Seja o primeiro a comentar!</div>';
    return;
  }

  const ids=[...new Set(rows.map(c=>c.user_id).filter(Boolean))];
  let profileMap={};

  if(ids.length){
    const {data:profiles,error:profileError}=await retrohubSupabase
      .from("profiles")
      .select("id,username,avatar_url")
      .in("id",ids);

    if(profileError){
      console.warn("Não foi possível carregar os perfis dos comentários:",profileError);
    }else{
      profileMap=Object.fromEntries((profiles||[]).map(p=>[p.id,p]));
    }
  }

  const me=retrohubSession?.user?.id;
  list.innerHTML=rows.map(c=>{
    const p=profileMap[c.user_id]||{};
    const name=p.username||"Usuário RetroHub";
    const avatar=p.avatar_url
      ? `<img class="rh-comment-avatar" src="${rhEscapeComment(p.avatar_url)}" alt="">`
      : `<div class="rh-comment-avatar rh-comment-avatar-fallback">${rhEscapeComment(name.slice(0,1).toUpperCase())}</div>`;

    return `<article class="rh-comment">
      ${avatar}
      <div>
        <div class="rh-comment-head">
          <span class="rh-comment-name">@${rhEscapeComment(name)}</span>
          <span class="rh-comment-date">${rhEscapeComment(rhCommentDate(c.created_at))}</span>
        </div>
        <div class="rh-comment-text">${rhEscapeComment(c.content)}</div>
      </div>
      ${me===c.user_id?`<button class="rh-comment-delete" type="button" onclick="deleteGameComment('${rhEscapeComment(c.id)}','${rhEscapeComment(gameSlug)}')">Excluir</button>`:""}
    </article>`;
  }).join("");
}

async function submitGameComment(event,gameSlug){
  event.preventDefault();
  const user=retrohubSession?.user;
  if(!user){openAccountPanel();return}
  const input=document.getElementById("gameCommentText");
  const btn=document.getElementById("gameCommentSubmit");
  const content=(input?.value||"").trim();
  if(!content)return;
  if(content.length>1000)return alert("O comentário pode ter no máximo 1000 caracteres.");
  btn.disabled=true;btn.textContent="Publicando...";
  const {data:sessionData,error:sessionError}=await retrohubSupabase.auth.getSession();
  const activeUser=sessionData?.session?.user;
  if(sessionError || !activeUser){
    btn.disabled=false;btn.textContent="Publicar comentário";
    retrohubSession=null;
    alert("Sua sessão expirou. Entre novamente para comentar.");
    refreshRetrohubAccountUI();
    return;
  }
  retrohubSession=sessionData.session;

  const {error}=await retrohubSupabase
    .from("game_comments")
    .insert({user_id:activeUser.id,game_slug:gameSlug,content});

  btn.disabled=false;btn.textContent="Publicar comentário";
  if(error){
    console.error("Erro ao publicar comentário:",error);
    alert("Não foi possível publicar o comentário: "+(error.message||"erro desconhecido"));
    return;
  }
  input.value="";
  const chars=document.getElementById("gameCommentChars");if(chars)chars.textContent="0";
  await loadGameComments(gameSlug);
}
let rhPendingDeleteComment=null;

function openDeleteCommentModal(id,gameSlug){
  rhPendingDeleteComment={id,gameSlug};
  const modal=document.getElementById("rhDeleteCommentModal");
  if(modal) modal.hidden=false;
}

function closeDeleteCommentModal(){
  const modal=document.getElementById("rhDeleteCommentModal");
  if(modal) modal.hidden=true;
  rhPendingDeleteComment=null;
}

async function confirmDeleteGameComment(){
  if(!rhPendingDeleteComment)return;
  const {id,gameSlug}=rhPendingDeleteComment;
  const btn=document.getElementById("rhDeleteCommentConfirm");
  if(btn){btn.disabled=true;btn.textContent="Excluindo...";}
  const {error}=await retrohubSupabase.from("game_comments").delete().eq("id",id);
  if(btn){btn.disabled=false;btn.textContent="Excluir";}
  if(error){
    console.error(error);
    alert("Não foi possível excluir o comentário.");
    return;
  }
  closeDeleteCommentModal();
  await loadGameComments(gameSlug);
}

async function deleteGameComment(id,gameSlug){
  openDeleteCommentModal(id,gameSlug);
}
