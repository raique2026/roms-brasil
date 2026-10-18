module.exports=async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Método não permitido"});
 const id=Number(req.query?.id);
 if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({error:"Partida inválida"});
 try{
  const url=new URL("https://mgliqdahiryxdhssybzv.supabase.co/functions/v1/sportmonks-cache");
  url.searchParams.set("path","fixtures/"+id);
  url.searchParams.set("include","participants;state;scores;league;events;lineups;venue;statistics");
  const upstream=await fetch(url,{headers:{accept:"application/json"},signal:AbortSignal.timeout(12000)});
  if(!upstream.ok)return res.status(502).json({error:"Detalhes indisponíveis",upstream_status:upstream.status});
  res.setHeader("Cache-Control","public,max-age=15,s-maxage=30");
  return res.status(200).json(await upstream.json());
 }catch(e){console.error("Fixture detail:",e.message);return res.status(502).json({error:"Não foi possível consultar a partida"})}
};