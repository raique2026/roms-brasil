export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect("/?patreon=cancelado");
  }

  if (!code) {
    return res.status(400).json({
      error: "Código de autorização do Patreon não recebido."
    });
  }

  const clientId = process.env.PATREON_CLIENT_ID;
  const clientSecret = process.env.PATREON_CLIENT_SECRET;
  const redirectUri = process.env.PATREON_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({
      error: "Configuração do Patreon incompleta na Vercel."
    });
  }

  try {
    // Troca o código de autorização por um access token
    const tokenResponse = await fetch(
      "https://www.patreon.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Erro OAuth Patreon:", tokenData);

      return res.status(500).json({
        error: "Não foi possível conectar a conta do Patreon."
      });
    }

    // Busca os dados da conta conectada
    const identityResponse = await fetch(
      "https://www.patreon.com/api/oauth2/v2/identity?fields[user]=full_name,email,image_url&include=memberships",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    const identity = await identityResponse.json();

    if (!identityResponse.ok) {
      console.error("Erro Identity Patreon:", identity);

      return res.status(500).json({
        error: "Não foi possível obter os dados da conta Patreon."
      });
    }

    /*
      Por enquanto apenas confirmamos que a conexão funcionou.

      No próximo passo vamos vincular essa conta Patreon
      à conta do usuário do RetroHub BR.
    */

    return res.redirect("/?patreon=conectado");

  } catch (err) {
    console.error("Erro Patreon:", err);

    return res.status(500).json({
      error: "Erro interno ao conectar com o Patreon."
    });
  }
}
