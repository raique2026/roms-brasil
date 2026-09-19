
const SUPABASE_URL="https://cybhsinaymvmgfwrhhvt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_rlT-HHY5MTNgeBcNfLp01A_DCICFJzd";

async function userFromRequest(req){
  const authorization=req.headers.authorization||"";
  if(!authorization.startsWith("Bearer "))return null;
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:authorization,apikey:SUPABASE_PUBLISHABLE_KEY}});
  return r.ok?r.json():null;
}
function tierKey(tiers,patronStatus){
  if(patronStatus!=="active_patron")return null;
  const names=(tiers||[]).map(t=>String(t.title||"").toLowerCase());
  if(names.some(n=>n.includes("lenda retro")))return "lenda";
  if(names.some(n=>n.includes("guardião retro")||n.includes("guardiao retro")))return "guardiao";
  if(names.some(n=>n.includes("aliado retro")))return "aliado";
  return null;
}
async function sb(path,opts={}){
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{
    ...opts,headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",...(opts.headers||{})}
  });
  if(!r.ok)throw new Error(await r.text());
  const txt=await r.text(); return txt?JSON.parse(txt):null;
}
module.exports=async function handler(req,res){
  if(req.method!=="POST")return res.status(405).json({error:"Método não permitido."});
  const user=await userFromRequest(req);
  if(!user?.id)return res.status(401).json({error:"Não autenticado."});
  try{
    const rows=await sb(`patreon_connections?user_id=eq.${encodeURIComponent(user.id)}&select=*`);
    const c=rows?.[0];
    if(!c){
      await sb(`profiles?id=eq.${encodeURIComponent(user.id)}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({supporter_tier:null})});
      return res.status(200).json({active:false,tier:null});
    }
    let access=c.access_token, refresh=c.refresh_token;
    if(c.token_expires_at && new Date(c.token_expires_at).getTime()<Date.now()+60000 && refresh){
      const tr=await fetch("https://www.patreon.com/api/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({
        grant_type:"refresh_token",refresh_token:refresh,client_id:process.env.PATREON_CLIENT_ID,client_secret:process.env.PATREON_CLIENT_SECRET
      })});
      const tj=await tr.json();
      if(tr.ok&&tj.access_token){access=tj.access_token;refresh=tj.refresh_token||refresh}
    }
    const qs=new URLSearchParams({
      "fields[member]":"patron_status,currently_entitled_amount_cents",
      "fields[tier]":"title,amount_cents",
      "include":"memberships.currently_entitled_tiers"
    });
    const pr=await fetch(`https://www.patreon.com/api/oauth2/v2/identity?${qs}`,{headers:{Authorization:`Bearer ${access}`}});
    const identity=await pr.json();
    if(!pr.ok)throw new Error("Patreon identity falhou.");
    const included=identity.included||[];
    const member=included.find(x=>x.type==="member");
    const ids=(member?.relationships?.currently_entitled_tiers?.data||[]).map(x=>x.id);
    const tiers=included.filter(x=>x.type==="tier"&&ids.includes(x.id)).map(x=>({id:x.id,title:x.attributes?.title||"",amount_cents:x.attributes?.amount_cents||0}));
    const tier=tierKey(tiers,member?.attributes?.patron_status);
    await sb(`patreon_connections?user_id=eq.${encodeURIComponent(user.id)}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({
      patron_status:member?.attributes?.patron_status||null,currently_entitled_amount_cents:member?.attributes?.currently_entitled_amount_cents||0,
      tiers,access_token:access,refresh_token:refresh,updated_at:new Date().toISOString()
    })});
    await sb(`profiles?id=eq.${encodeURIComponent(user.id)}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({supporter_tier:tier})});
    return res.status(200).json({active:!!tier,tier,tiers});
  }catch(e){console.error(e);return res.status(500).json({error:"Não foi possível sincronizar o Patreon."})}
};
