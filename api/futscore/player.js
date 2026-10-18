module.exports=async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Método não permitido"});
 const id=Number(req.query?.id);
 if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:"Jogador inválido"});
 const base="https://mgliqdahiryxdhssybzv.supabase.co/functions/v1/sportmonks-cache";
 try{
  const url=new URL(base);url.searchParams.set("path","players/"+id);
  url.searchParams.set("include","position;country;nationality;teams");
  let upstream=await fetch(url,{headers:{accept:"application/json"},signal:AbortSignal.timeout(12000)});
  if(!upstream.ok){url.searchParams.delete("include");upstream=await fetch(url,{headers:{accept:"application/json"},signal:AbortSignal.timeout(12000)})}
  if(!upstream.ok)return res.status(502).json({error:"Perfil do jogador indisponível",upstream_status:upstream.status});
  const data=await upstream.json();
  res.setHeader("Cache-Control","public,max-age=300,s-maxage=1800");
  return res.status(200).json(data);
 }catch(e){console.error("FutScore player:",e.message);return res.status(502).json({error:"Não foi possível consultar o jogador"})}
};