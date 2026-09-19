export default function handler(req, res) {
  const clientId = process.env.PATREON_CLIENT_ID;
  const redirectUri = process.env.PATREON_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({
      error: "Configuração do Patreon não encontrada."
    });
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "identity identity[email] identity.memberships"
  });

  const authUrl =
    `https://www.patreon.com/oauth2/authorize?${params.toString()}`;

  return res.redirect(authUrl);
}
