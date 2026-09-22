export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  const apiKey = process.env.RA_API_KEY;
  const { user, gameId, mode } = req.query;

  if (!apiKey) {
    return res.status(500).json({
      error: "RA_API_KEY não configurada"
    });
  }

  if (!gameId || (mode !== "game" && !user)) {
    return res.status(400).json({ error: mode === "game" ? "Informe gameId" : "Informe user e gameId" });
  }

  if (mode !== "game" && !/^[a-zA-Z0-9_-]{1,50}$/.test(user)) {
    return res.status(400).json({
      error: "Usuário inválido"
    });
  }

  if (!/^\d+$/.test(String(gameId))) {
    return res.status(400).json({
      error: "ID do jogo inválido"
    });
  }

  try {
    const infoOnly = mode === "game";
    const url = new URL(infoOnly
      ? "https://retroachievements.org/API/API_GetGameExtended.php"
      : "https://retroachievements.org/API/API_GetGameInfoAndUserProgress.php"
    );

    url.searchParams.set("y", apiKey);
    if (infoOnly) url.searchParams.set("i", gameId);
    else {
      url.searchParams.set("u", user);
      url.searchParams.set("g", gameId);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "RetroHub-BR/1.0"
      }
    });

    const text = await response.text();

    console.log("RA STATUS:", response.status);
    console.log("RA TAMANHO:", text.length);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Resposta inválida do RetroAchievements"
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro retornado pelo RetroAchievements",
        dados: data
      });
    }

    if (
      !data ||
      Array.isArray(data) ||
      (!data.ID && !data.id)
    ) {
      return res.status(404).json({
        error: "Jogo ou progresso não encontrado",
        dados: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("ERRO RETROACHIEVEMENTS:", error);

    return res.status(500).json({
      error: "Não foi possível consultar o RetroAchievements"
    });
  }
}
