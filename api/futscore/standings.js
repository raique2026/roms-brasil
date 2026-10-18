module.exports = async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Método não permitido"});
 const season=Number(req.query?.season);
 if(!Number.isSafeInteger(season)||season<=0)return res.status(400).json({error:"Temporada inválida"});
 try{
  const url=new URL("https://mgliqdahiryxdhssybzv.supabase.co/functions/v1/sportmonks-cache");
  url.searchParams.set("path","standings/seasons/"+season);
  url.searchParams.set("include","participant;details;rule");
  const response=await fetch(url,{headers:{accept:"application/json"},signal:AbortSignal.timeout(10000)});
  if(!response.ok)return res.status(502).json({error:"Classificação indisponível",upstream_status:response.status});
  const data=await response.json();
  res.setHeader("Cache-Control","public, max-age=60, s-maxage=180");
  return res.status(200).json(data);
 }catch(e){console.error("FutScore standings:",e.message);return res.status(502).json({error:"Não foi possível carregar a classificação"})}
};