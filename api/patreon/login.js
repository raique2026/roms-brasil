const crypto = require("crypto");

const SUPABASE_URL = "https://cybhsinaymvmgfwrhhvt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rlT-HHY5MTNgeBcNfLp01A_DCICFJzd";

function signState(payload, secret){
  const body=Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig=crypto.createHmac("sha256",secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

async function getRetrohubUser(req){
  const authorization=req.headers.authorization||"";
  if(!authorization.startsWith("Bearer ")) return null;
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{
    headers:{Authorization:authorization,apikey:SUPABASE_PUBLISHABLE_KEY}
  });
  if(!r.ok)return null;
  return r.json();
}

module.exports = async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Método não permitido."});
  const clientId=process.env.PATREON_CLIENT_ID;
  const clientSecret=process.env.PATREON_CLIENT_SECRET;
  const redirectUri=process.env.PATREON_REDIRECT_URI;
  if(!clientId||!clientSecret||!redirectUri) return res.status(500).json({error:"Patreon não configurado na Vercel."});

  const user=await getRetrohubUser(req);
  if(!user?.id) return res.status(401).json({error:"Entre na sua conta RetroHub BR."});

  const state=signState({uid:user.id,exp:Date.now()+10*60*1000},clientSecret);
  const params=new URLSearchParams({
    response_type:"code",
    client_id:clientId,
    redirect_uri:redirectUri,
    scope:"identity identity[email] identity.memberships",
    state
  });
  return res.status(200).json({url:`https://www.patreon.com/oauth2/authorize?${params.toString()}`});
};
