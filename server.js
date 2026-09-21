const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

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
  const retroAchievements =
    await loadHandler("./api/retroachievements.js");

  const patreonLogin =
    await loadHandler("./api/patreon/login.js");

  const patreonCallback =
    await loadHandler("./api/patreon/callback.js");

  const patreonStatus =
    await loadHandler("./api/patreon/status.js");

  const patreonSync =
    await loadHandler("./api/patreon/sync.js");

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

  app.use(
    express.static(__dirname, {
      index: "index.html",
      extensions: ["html"]
    })
  );

  app.get("/{*path}", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    res.sendFile(
      path.join(__dirname, "index.html")
    );
  });

  app.use((req, res) => {
    res.status(404).json({
      error: "Rota não encontrada."
    });
  });

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
