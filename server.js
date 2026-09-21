const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Adapta as APIs que já eram usadas na Vercel
function vercelHandler(handler) {
  return async (req, res, next) => {
    try {
      req.query = req.query || {};
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

async function loadHandler(file) {
  const mod = await import(file);
  return mod.default || mod;
}

async function startServer() {
  // RetroAchievements
  const retroAchievements =
    await loadHandler("./api/retroachievements.js");

  // Patreon
  const patreonLogin =
    await loadHandler("./api/patreon/login.js");

  const patreonCallback =
    await loadHandler("./api/patreon/callback.js");

  const patreonStatus =
    await loadHandler("./api/patreon/status.js");

  const patreonSync =
    await loadHandler("./api/patreon/sync.js");

  // Rotas das APIs
  app.all(
    "/api/retroachievements",
    vercelHandler(retroAchievements)
  );

  app.all(
    "/api/patreon/login",
    vercelHandler(patreonLogin)
  );

  app.all(
    "/api/patreon/callback",
    vercelHandler(patreonCallback)
  );

  app.all(
    "/api/patreon/status",
    vercelHandler(patreonStatus)
  );

  app.all(
    "/api/patreon/sync",
    vercelHandler(patreonSync)
  );

  // SEO servido diretamente no HTML para as páginas dos jogos.
  // Mantém os metadados principais disponíveis antes do JavaScript do navegador.
  const gameSEO = {
    "guitar-hero-2": { title: "Guitar Hero II", platform: "PS2", description: "Guitar Hero II expande a fórmula do jogo original com novas músicas, modos cooperativos e uma carreira musical ainda maior." },
    "resident-evil-code-veronica-x": { title: "Resident Evil CODE: Veronica X", platform: "PS2", description: "Claire e Chris Redfield enfrentam um novo surto viral e os segredos da família Ashford em Resident Evil CODE: Veronica X." },
    "the-simpsons-hit-and-run": { title: "The Simpsons: Hit & Run", platform: "PS2", description: "Explore Springfield, complete missões, corridas e colecionáveis com os personagens de The Simpsons: Hit & Run." },
    "shadow-of-the-colossus": { title: "Shadow of the Colossus", platform: "PS2", description: "Acompanhe Wander pelas Terras Proibidas e enfrente dezesseis colossos em Shadow of the Colossus." },
    "black": { title: "BLACK", platform: "PS2", description: "BLACK é um jogo de tiro em primeira pessoa da Criterion Games com combates intensos, armas de grande impacto e cenários destrutíveis." },
    "need-for-speed-most-wanted-black-edition": { title: "Need for Speed: Most Wanted - Black Edition", platform: "PlayStation 2", description: "Corridas de rua, perseguições policiais e a Blacklist em Need for Speed: Most Wanted - Black Edition para PlayStation 2." },
    "midnight-club-3-dub-edition-remix": { title: "Midnight Club 3: DUB Edition Remix", platform: "PS2", description: "Corridas urbanas, personalização e desafios em Midnight Club 3: DUB Edition Remix para PlayStation 2." },
    "need-for-speed-underground": { title: "Need for Speed: Underground", platform: "PS2", description: "Corridas de rua e personalização de carros em Need for Speed: Underground para PlayStation 2." },
    "ben-10-protector-of-earth": { title: "Ben 10: Protector of Earth", platform: "PS2", description: "Use os poderes alienígenas de Ben Tennyson em Ben 10: Protector of Earth para PlayStation 2." },
    "kung-fu-panda": { title: "Kung Fu Panda", platform: "PS2", description: "Acompanhe Po em uma aventura de ação inspirada no filme Kung Fu Panda para PlayStation 2." },
    "metroid-fusion": { title: "Metroid Fusion", platform: "Game Boy Advance", description: "Explore a estação BSL com Samus Aran em Metroid Fusion para Game Boy Advance." }
  };

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  app.get("/game/:slug", (req, res, next) => {
    const game = gameSEO[req.params.slug];
    if (!game) return next();

    try {
      const indexPath = path.join(__dirname, "index.html");
      let html = fs.readFileSync(indexPath, "utf8");

      const canonical = "https://retrohubbr.com/game/" + encodeURIComponent(req.params.slug);
      const title = game.title + " (" + game.platform + ") | RetroHub BR";
      const description = game.description;

      html = html
        .replace(/<title>[\s\S]*?<\/title>/i, "<title>" + escapeHTML(title) + "</title>")
        .replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="' + escapeHTML(description) + '">')
        .replace(/<link rel="canonical" href="[^"]*">/i, '<link rel="canonical" href="' + canonical + '">')
        .replace(/<meta property="og:title" content="[^"]*">/i, '<meta property="og:title" content="' + escapeHTML(title) + '">')
        .replace(/<meta property="og:description" content="[^"]*">/i, '<meta property="og:description" content="' + escapeHTML(description) + '">')
        .replace(/<meta property="og:url" content="[^"]*">/i, '<meta property="og:url" content="' + canonical + '">')
        .replace(/<meta name="twitter:title" content="[^"]*">/i, '<meta name="twitter:title" content="' + escapeHTML(title) + '">')
        .replace(/<meta name="twitter:description" content="[^"]*">/i, '<meta name="twitter:description" content="' + escapeHTML(description) + '">');

      res.type("html").send(html);
    } catch (error) {
      next(error);
    }
  });

  // Arquivos do RetroHub
  app.use(
    express.static(__dirname, {
      index: "index.html",
      extensions: ["html"]
    })
  );

  // Mantém a navegação do RetroHub funcionando
  app.get("/{*path}", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    res.sendFile(
      path.join(__dirname, "index.html")
    );
  });

  // Rota não encontrada
  app.use((req, res) => {
    res.status(404).json({
      error: "Rota não encontrada."
    });
  });

  // Tratamento de erros
  app.use((err, req, res, next) => {
    console.error("RetroHub server:", err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      error: "Erro interno do servidor."
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `RetroHub BR rodando na porta ${PORT}`
    );
  });
}

startServer().catch((error) => {
  console.error(
    "Falha ao iniciar RetroHub BR:",
    error
  );

  process.exit(1);
});
