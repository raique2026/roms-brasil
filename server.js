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

  // SEO automático: lê os dados básicos diretamente do array games em js/app.js.
  // Assim, novos jogos ganham SEO no servidor sem precisar editar este arquivo.
  function readGamesSEO() {
    const appJS = fs.readFileSync(path.join(__dirname, "js", "app.js"), "utf8");
    const gamesStart = appJS.indexOf("const games = [");
    if (gamesStart < 0) return {};

    const gamesEnd = appJS.indexOf("\n];", gamesStart);
    if (gamesEnd < 0) return {};

    const block = appJS.slice(gamesStart, gamesEnd);
    const objectStarts = [];
    let depth = 0, inString = false, quote = "", escaped = false;

    for (let i = block.indexOf("[") + 1; i < block.length; i++) {
      const ch = block[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === quote) inString = false;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") { inString = true; quote = ch; continue; }
      if (ch === "{") {
        if (depth === 0) objectStarts.push(i);
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0 && objectStarts.length) {
          const begin = objectStarts.pop();
          const obj = block.slice(begin, i + 1);
          const pick = (name) => {
            const m = obj.match(new RegExp("\\b" + name + '\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"'));
            if (!m) return "";
            try { return JSON.parse('"' + m[1] + '"'); } catch { return m[1]; }
          };
          const slug = pick("slug");
          if (slug) {
            const game = {
              title: pick("title"),
              platform: pick("platform"),
              description: pick("description")
            };
            readGamesSEO.cache[slug] = game;
          }
        }
      }
    }
    return readGamesSEO.cache;
  }
  readGamesSEO.cache = {};

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  app.get("/game/:slug", (req, res, next) => {
    // Recarrega em cada requisição para que novos jogos do app.js entrem automaticamente.
    readGamesSEO.cache = {};
    const game = readGamesSEO()[req.params.slug];
    if (!game || !game.title) return next();

    try {
      const indexPath = path.join(__dirname, "index.html");
      let html = fs.readFileSync(indexPath, "utf8");

      const canonical = "https://retrohubbr.com/game/" + encodeURIComponent(req.params.slug);
      const platform = game.platform || "Jogo retrô";
      const title = game.title + " (" + platform + ") | RetroHub BR";
      const description = game.description || ("Confira detalhes, conquistas, guia e informações de " + game.title + " no RetroHub BR.");

      html = html
        .replace(/<title>[\\s\\S]*?<\\/title>/i, "<title>" + escapeHTML(title) + "</title>")
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

  // Sitemap automático: inclui todos os jogos encontrados no app.js.
  app.get("/sitemap.xml", (req, res, next) => {
    try {
      readGamesSEO.cache = {};
      const games = readGamesSEO();

      const staticUrls = [
        { loc: "https://retrohubbr.com/", changefreq: "daily", priority: "1.0" },
        { loc: "https://retrohubbr.com/privacidade.html", changefreq: "monthly", priority: "0.3" },
        { loc: "https://retrohubbr.com/termos.html", changefreq: "monthly", priority: "0.3" }
      ];

      const gameUrls = Object.keys(games).map(slug => ({
        loc: "https://retrohubbr.com/game/" + encodeURIComponent(slug),
        changefreq: "weekly",
        priority: "0.8"
      }));

      const urls = staticUrls.concat(gameUrls);
      const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map(item =>
          "  <url>\n" +
          "    <loc>" + item.loc + "</loc>\n" +
          "    <changefreq>" + item.changefreq + "</changefreq>\n" +
          "    <priority>" + item.priority + "</priority>\n" +
          "  </url>"
        ).join("\n") +
        "\n</urlset>\n";

      res.type("application/xml").send(xml);
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
