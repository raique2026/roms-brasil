export default async function handler(req, res) {
  // Permite somente requisições GET
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  const { user, gameId } = req.query;

  // Verifica os dados recebidos
  if (!user || !gameId) {
    return res.status(400).json({
      error: "Informe user e gameId"
    });
  }

  // Segurança básica
  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(user)) {
    return res.status(400).json({
      error: "Usuário inválido"
    });
  }

  if (!/^\d+$/.test(String(gameId))) {
    return res.status(400).json({
      error: "ID do jogo inválido"
    });
  }

  const apiKey = process.env.RA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "RA_API_KEY não configurada na Vercel"
    });
  }

  try {
    const url =
      "https://retroachievements.org/API/" +
      "API_GetGameInfoAndUserProgress.php" +
      "?y=" + encodeURIComponent(apiKey) +
      "&u=" + encodeURIComponent(user) +
      "&g=" + encodeURIComponent(gameId);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "RetroHub-BR"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao consultar o RetroAchievements"
      });
    }

    const data = await response.json();

    // Evita cache excessivo, mas reduz consultas desnecessárias ao RA.
    res.setHeader(
      "Cache-Control",
      "s-maxage=30, stale-while-revalidate=60"
    );

    return res.status(200).json(data);

  } catch (error) {
    console.error("RetroAchievements API:", error);

    return res.status(500).json({
      error: "Não foi possível consultar o RetroAchievements"
    });
  }
}
