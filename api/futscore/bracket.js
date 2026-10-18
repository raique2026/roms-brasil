module.exports=async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Método não permitido"});
 const season=Number(req.query?.season);
 const allowed=new Set([26784,27897,26785]);
 if(!allowed.has(season))return res.status(400).json({error:"Temporada não permitida"});
 try{
  const base="https://mgliqdahiryxdhssybzv.supabase.co/functions/v1/sportmonks-cache";
  const fixtures=[];let page=1,hasMore=true;
  while(hasMore&&page<=8){
   const url=new URL(base);
   url.searchParams.set("path","fixtures/seasons/"+season);
   url.searchParams.set("include","participants;scores;state;stage;round;aggregate");
   url.searchParams.set("per_page","50");
   url.searchParams.set("page",String(page));
   const response=await fetch(url,{headers:{accept:"application/json"},signal:AbortSignal.timeout(10000)});
   if(!response.ok)return res.status(502).json({error:"Jogos da temporada indisponíveis",upstream_status:response.status});
   const json=await response.json();const rows=Array.isArray(json.data)?json.data:[];
   fixtures.push(...rows);
   hasMore=Boolean(json.pagination?.has_more??json.meta?.pagination?.has_more);
   page++;
  }
  res.setHeader("Cache-Control","public,max-age=120,s-maxage=900");
  return res.status(200).json({data:fixtures,complete:!hasMore});
 }catch(e){console.error("FutScore bracket:",e.message);return res.status(502).json({error:"Não foi possível consultar a temporada"})}
};