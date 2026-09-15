export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const apiKey = process.env.RA_API_KEY;
  const user = req.query.user;

  if (!apiKey) {
    return res.status(500).json({
      error: "RA_API_KEY não encontrada na Vercel"
    });
  }

  if (!user) {
    return res.status(400).json({
      error: "Informe o usuário"
    });
  }

  try {
    const url = new URL(
      "https://retroachievements.org/API/API_GetUserProfile.php"
    );

    url.searchParams.set("y", apiKey);
    url.searchParams.set("u", user);

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "User-Agent": "RetroHub-BR/1.0"
      }
    });

    const text = await response.text();

    console.log("STATUS RA:", response.status);
    console.log("TAMANHO RESPOSTA:", text.length);
    console.log("RESPOSTA RA:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Resposta inválida do RetroAchievements",
        status: response.status
      });
    }

    return res.status(200).json({
      teste: "RetroHub BR",
      retroAchievementsStatus: response.status,
      dados: data
    });

  } catch (error) {
    console.error("ERRO:", error);

    return res.status(500).json({
      error: "Falha ao conectar ao RetroAchievements"
    });
  }
}
