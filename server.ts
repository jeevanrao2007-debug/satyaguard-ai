import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { config } from "./server/config/config";
import { requestLogger } from "./server/middleware/logger";
import { errorHandler } from "./server/middleware/errorHandler";
import healthRouter from "./server/routes/health";
import analyzeRouter from "./server/routes/analyze";
import knowledgeRouter from "./server/routes/knowledge";
import scansRouter from "./server/routes/scans";
import analyticsRouter from "./server/routes/analytics";

async function startServer() {
  const app = express();
  const PORT = config.port;

  // Request logging middleware
  app.use(requestLogger);

  // JSON and URL-encoded body parsers with limits
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS and basic security headers
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API routes mount
  app.use("/api/v1", healthRouter);
  app.use("/api/v1/analyze", analyzeRouter);
  app.use("/api/v1/knowledge", knowledgeRouter);
  app.use("/api/v1/scans", scansRouter);
  app.use("/api/v1/analytics", analyticsRouter);


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler (Must be registered last)
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[START] SatyaGuard AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});

