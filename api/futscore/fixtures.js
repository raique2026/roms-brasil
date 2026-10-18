// Endpoint serverless para a prévia na Vercel. Sem tokens SportMonks no cliente.
module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido" });
  const date = String(req.query?.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date + "T12:00:00Z"))) {
    return res.status(400).json({ error: "Data inválida" });
  }
  try {
    const upstream = new URL("https://mgliqdahiryxdhssybzv.supabase.co/functions/v1/sportmonks-cache");
    upstream.searchParams.set("path", "fixtures/date/" + date);
    upstream.searchParams.set("include", "participants;state;scores;league");
    const response = await fetch(upstream, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return res.status(502).json({ error: "Consulta indisponível", upstream_status: response.status });
    const payload = await response.json();
    res.setHeader("Cache-Control", "public, max-age=15, s-maxage=30");
    return res.status(200).json(payload);
  } catch (error) {
    console.error("FutScore proxy:", error.message);
    return res.status(502).json({ error: "Serviço temporariamente indisponível" });
  }
};
