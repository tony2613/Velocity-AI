// server/index.ts  (or main.ts) - corrected version
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// import { Portal } from "vaul"; // <-- remove unless you actually use it elsewhere

const app = express();

// Add this if you need rawBody for webhooks etc.
declare module "http" {
  interface IncomingMessage {
    rawBody?: unknown;
  }
}

app.use(
  express.json({
    limit: "50mb",
    verify: (req: any, _res, buf: Buffer) => {
      // save raw body if needed
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Serve uploads directory 
import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// request logger that captures JSON responses
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  // @ts-ignore - temporary override for logging
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    // @ts-ignore
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch (e) {
          // ignore stringify errors
        }
      }

      if (logLine.length > 200) {
        logLine = logLine.slice(0, 199) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log("[Node.js] Starting server startup sequence...");

  // register routes (your routes.ts should export registerRoutes)
  console.log("[Node.js] Calling registerRoutes...");
  const server = await registerRoutes(app);
  console.log("[Node.js] registerRoutes completed.");

  // Express error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    // still log error for debugging
    console.error(err);
  });

  // In development use vite middleware; in production serve static files
  console.log(`[Node.js] Environment is: ${app.get("env")}`);
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    console.log("[Node.js] Calling serveStatic...");
    serveStatic(app);
    console.log("[Node.js] serveStatic completed.");
  }

  // Always use PORT env or default 5000
  const port = parseInt(process.env.PORT || "5000", 10);
  console.log(`[Node.js] Attempting to bind to 0.0.0.0:${port}...`);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})().catch(err => {
  console.error("FATAL ERROR IN SERVER STARTUP:", err);
  process.exit(1);
});
