// Vercel function: recherche de metadonnees scientifiques sur OpenAlex.
// Les notices sont des pistes documentaires, non des preuves du protocole propose.
export default async function handler(req,res) {
 res.setHeader("Cache-Control","s-maxage=3600, stale-while-revalidate=86400");
 if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
 const terms=String(req.query?.q||"").trim().slice(0,160);
 if(terms.length<3) return res.status(400).json({error:"Indiquer au moins trois caractères."});
 try{
  const endpoint="https://api.openalex.org/works?search="+encodeURIComponent(terms)+"&filter=type:article&per-page=8&select=id,display_name,publication_year,doi,primary_location,authorships,open_access,cited_by_count";
  const response=await fetch(endpoint,{headers:{"Accept":"application/json","User-Agent":"DemiFondLaboEPS/0.2 (research discovery)"}});
  if(!response.ok) throw new Error("Service scientifique indisponible");
  const data=await response.json();
  const items=(data.results||[]).map(x=>({title:x.display_name||"",year:x.publication_year||null,authors:(x.authorships||[]).slice(0,3).map(a=>a.author?.display_name).filter(Boolean),doi:x.doi||null,url:x.doi||x.primary_location?.landing_page_url||x.id||null,journal:x.primary_location?.source?.display_name||"",citations:x.cited_by_count||0,verified:false})).filter(x=>x.title&&x.url);
  return res.status(200).json({query:terms,items,warning:"Résultats bibliographiques OpenAlex. Les métadonnées ne démontrent pas qu'une situation pédagogique est validée. Vérifier les articles complets avant usage."});
 }catch(err){return res.status(503).json({error:"Recherche momentanément indisponible",detail:String(err.message||err)})}
}
