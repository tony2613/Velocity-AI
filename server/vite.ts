import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { getPageSeoData } from "@shared/site-data";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Injects Route-Specific Title, Meta Description, Canonical Link, OpenGraph,
 * Structured Data (JSON-LD), and Semantic Pre-rendered HTML for search bots & AI answer engines.
 */
export function injectSeoIntoHtml(html: string, url: string): string {
  try {
    const seo = getPageSeoData(url);
    let output = html;

    // 1. Replace title
    const fullTitle = seo.title.includes("VelocityAI") ? seo.title : `${seo.title} – VelocityAI`;
    output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${fullTitle}</title>`);

    // 2. Replace meta description
    output = output.replace(
      /<meta\s+name="description"[\s\S]*?\/?>/i,
      `<meta name="description" content="${seo.description.replace(/"/g, '&quot;')}" />`
    );

    // 3. Replace canonical link
    output = output.replace(
      /<link\s+rel="canonical"[\s\S]*?\/?>/i,
      `<link rel="canonical" href="${seo.canonicalUrl}" />`
    );

    // 4. Replace og:title & twitter:title
    output = output.replace(
      /<meta\s+property="og:title"[\s\S]*?\/?>/i,
      `<meta property="og:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`
    );
    output = output.replace(
      /<meta\s+name="twitter:title"[\s\S]*?\/?>/i,
      `<meta name="twitter:title" content="${fullTitle.replace(/"/g, '&quot;')}" />`
    );

    // 5. Replace og:description & twitter:description
    output = output.replace(
      /<meta\s+property="og:description"[\s\S]*?\/?>/i,
      `<meta property="og:description" content="${seo.description.replace(/"/g, '&quot;')}" />`
    );
    output = output.replace(
      /<meta\s+name="twitter:description"[\s\S]*?\/?>/i,
      `<meta name="twitter:description" content="${seo.description.replace(/"/g, '&quot;')}" />`
    );

    // 6. Replace og:url
    output = output.replace(
      /<meta\s+property="og:url"[\s\S]*?\/?>/i,
      `<meta property="og:url" content="${seo.canonicalUrl}" />`
    );

    // 7. Inject / replace JSON-LD Structured Data
    if (seo.structuredData) {
      const jsonLdScript = `<script type="application/ld+json">\n  ${JSON.stringify(seo.structuredData, null, 2)}\n  </script>`;
      if (/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i.test(output)) {
        output = output.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i, jsonLdScript);
      } else {
        output = output.replace("</head>", `  ${jsonLdScript}\n</head>`);
      }
    }

    // 8. Pre-render semantic HTML into #root for crawlers & fast paint if route-specific markup is available
    if (seo.prerenderHtml) {
      output = output.replace(
        /<div\s+id="root">[\s\S]*?<\/div>\s*<script/i,
        `<div id="root">\n${seo.prerenderHtml}\n  </div>\n  <script`
      );
    }

    return output;
  } catch (err) {
    console.error("[SEO Renderer] Error injecting SEO into HTML:", err);
    return html;
  }
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      const renderedPage = injectSeoIntoHtml(page, url);
      res.status(200).set({ "Content-Type": "text/html" }).end(renderedPage);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve hashed assets with 1-year immutable caching
  app.use(
    "/assets",
    express.static(path.join(distPath, "assets"), {
      maxAge: "1y",
      immutable: true,
    }),
  );

  // Serve other static files (favicons, manifest, etc.)
  app.use(
    express.static(distPath, {
      maxAge: "1d",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          // Never cache HTML so new deployments take effect immediately
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    }),
  );

  const indexPath = path.resolve(distPath, "index.html");

  // Fall through to index.html with route-specific SEO & semantic pre-rendered HTML
  app.use("*", async (req, res) => {
    try {
      const baseHtml = await fs.promises.readFile(indexPath, "utf-8");
      const renderedHtml = injectSeoIntoHtml(baseHtml, req.originalUrl);
      res.setHeader("Cache-Control", "no-cache");
      res.status(200).set({ "Content-Type": "text/html" }).send(renderedHtml);
    } catch (err) {
      console.error("[serveStatic] Error serving rendered page, falling back to static index:", err);
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(indexPath);
    }
  });
}
