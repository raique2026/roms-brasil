const SUPABASE_URL="https://cybhsinaymvmgfwrhhvt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_rlT-HHY5MTNgeBcNfLp01A_DCICFJzd";

async function getUser(req){
  const authorization=req.headers.authorization||"";
  if(!authorization.startsWith("Bearer "))return null;
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:authorization,apikey:SUPABASE_PUBLISHABLE_KEY}});
  return r.ok?r.json():null;
}

module.exports=async function handler(req,res){
  const user=await getUser(req);
  if(!user?.id)return res.status(401).json({error:"Não autenticado."});
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key)return res.status(500).json({error:"SUPABASE_SERVICE_ROLE_KEY ausente."});
  const r=await fetch(`${SUPABASE_URL}/rest/v1/patreon_connections?user_id=eq.${encodeURIComponent(user.id)}&select=full_name,image_url,patron_status,currently_entitled_amount_cents,lifetime_support_cents,last_charge_status,tiers,updated_at`,{
    headers:{apikey:key,Authorization:`Bearer ${key}`}
  });
  if(!r.ok)return res.status(500).json({error:"Falha ao consultar Patreon."});
  const rows=await r.json();
  if(!rows.length)return res.status(200).json({connected:false});
  return res.status(200).json({connected:true,...rows[0]});
};
