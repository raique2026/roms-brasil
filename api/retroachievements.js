export default async function handler(req, res) {
  // Permite somente requisições GET
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  const { user, gameId } = req.query;

  // Verifica se usuário e ID do jogo foram informados
  if (!user || !gameId) {
    return res.status(400).json({
      error: "Informe user e gameId"
    });
  }

  // Validação básica do nome de usuário
  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(user)) {
    return res.status(400).json({
      error: "Usuário inválido"
    });
  }

  // Validação do ID do jogo
  if (!/^\d+$/.test(String(gameId))) {
    return res.status(400).json({
      error: "ID do jogo inválido"
    });
  }

  // Obtém a API Key protegida na Vercel
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
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "RetroHub-BR"
      }
    });

    // Guarda a resposta como texto primeiro para facilitar diagnóstico
    const responseText = await response.text();

    console.log("RA status:", response.status);
    console.log("RA resposta recebida:", responseText.length, "caracteres");

    if (!response.ok) {
      console.error("Erro RetroAchievements:", responseText);

      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );

      return res.status(response.status).json({
        error: "Erro ao consultar o RetroAchievements",
        status: response.status
      });
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Resposta inválida do RetroAchievements:", responseText);

      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );

      return res.status(502).json({
        error: "O RetroAchievements retornou uma resposta inválida"
      });
    }

    console.log(
      "RA jogo:",
      data?.title ||
      data?.Title ||
      data?.gameTitle ||
      data?.GameTitle ||
      "sem título"
    );

    // Desativa cache durante os testes
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    return res.status(200).json(data);

  } catch (error) {
    console.error("Erro RetroAchievements API:", error);

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    return res.status(500).json({
      error: "Não foi possível consultar o RetroAchievements"
    });
  }
}
