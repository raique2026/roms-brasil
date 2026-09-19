const crypto = require("crypto");

const SUPABASE_URL = "https://cybhsinaymvmgfwrhhvt.supabase.co";

function verifyState(state,secret){
  try{
    const [body,sig]=String(state||"").split(".");
    if(!body||!sig)return null;
    const expected=crypto.createHmac("sha256",secret).update(body).digest("base64url");
    const a=Buffer.from(sig),b=Buffer.from(expected);
    if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;
    const data=JSON.parse(Buffer.from(body,"base64url").toString("utf8"));
    if(!data.uid||!data.exp||Date.now()>data.exp)return null;
    return data;
  }catch{return null}
}

async function supabaseUpsert(row){
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente");
  const r=await fetch(`${SUPABASE_URL}/rest/v1/patreon_connections?on_conflict=user_id`,{
    method:"POST",
    headers:{
      apikey:key,Authorization:`Bearer ${key}`,
      "Content-Type":"application/json",
      Prefer:"resolution=merge-duplicates,return=minimal"
    },
    body:JSON.stringify(row)
  });
  if(!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
}

module.exports = async function handler(req,res){
  const {code,state,error}=req.query||{};
  if(error)return res.redirect("/?patreon=erro");
  if(!code||!state)return res.redirect("/?patreon=erro");

  const clientId=process.env.PATREON_CLIENT_ID;
  const clientSecret=process.env.PATREON_CLIENT_SECRET;
  const redirectUri=process.env.PATREON_REDIRECT_URI;
  if(!clientId||!clientSecret||!redirectUri)return res.status(500).json({error:"Configuração Patreon incompleta."});

  const stateData=verifyState(state,clientSecret);
  if(!stateData)return res.status(400).json({error:"Estado OAuth inválido ou expirado."});

  try{
    const tokenResponse=await fetch("https://www.patreon.com/api/oauth2/token",{
      method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({
        code,grant_type:"authorization_code",client_id:clientId,
        client_secret:clientSecret,redirect_uri:redirectUri
      })
    });
    const token=await tokenResponse.json();
    if(!tokenResponse.ok||!token.access_token)throw new Error("Falha ao obter token Patreon.");

    const qs=new URLSearchParams({
      "fields[user]":"full_name,email,image_url",
      "fields[member]":"patron_status,currently_entitled_amount_cents,lifetime_support_cents,last_charge_status,pledge_relationship_start",
      "fields[tier]":"title,amount_cents",
      "include":"memberships.currently_entitled_tiers"
    });
    const identityResponse=await fetch(`https://www.patreon.com/api/oauth2/v2/identity?${qs}`,{
      headers:{Authorization:`Bearer ${token.access_token}`}
    });
    const identity=await identityResponse.json();
    if(!identityResponse.ok||!identity?.data?.id)throw new Error("Falha ao consultar identidade Patreon.");

    const included=identity.included||[];
    const member=included.find(x=>x.type==="member");
    const tierIds=(member?.relationships?.currently_entitled_tiers?.data||[]).map(x=>x.id);
    const tiers=included.filter(x=>x.type==="tier"&&tierIds.includes(x.id)).map(x=>({
      id:x.id,title:x.attributes?.title||"",amount_cents:x.attributes?.amount_cents||0
    }));

    await supabaseUpsert({
      user_id:stateData.uid,
      patreon_user_id:identity.data.id,
      full_name:identity.data.attributes?.full_name||null,
      email:identity.data.attributes?.email||null,
      image_url:identity.data.attributes?.image_url||null,
      patron_status:member?.attributes?.patron_status||null,
      currently_entitled_amount_cents:member?.attributes?.currently_entitled_amount_cents||0,
      lifetime_support_cents:member?.attributes?.lifetime_support_cents||0,
      last_charge_status:member?.attributes?.last_charge_status||null,
      pledge_relationship_start:member?.attributes?.pledge_relationship_start||null,
      tiers,
      access_token:token.access_token,
      refresh_token:token.refresh_token||null,
      token_expires_at:token.expires_in?new Date(Date.now()+token.expires_in*1000).toISOString():null,
      updated_at:new Date().toISOString()
    });

    return res.redirect("/?patreon=conectado");
  }catch(e){
    console.error("Patreon callback:",e);
    return res.redirect("/?patreon=erro");
  }
};
