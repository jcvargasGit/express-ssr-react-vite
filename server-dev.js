import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("environment: Development");

async function init(app, { base }) {
   
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    try {
      
      const url = req.originalUrl.replace(base, "");
      
      const indexFilePath = path.resolve(__dirname, "./public/index.html");
      let template = await fs.readFileSync(indexFilePath, "utf-8");
      
      //This part can be replaced with any bundler like webpack, rollup, etc.
      template = await vite.transformIndexHtml(url, template);
      const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");
      const appHtml = await render(url);
      

      const html = template.replace(`<!--ssr-outlet-->`, appHtml ?? "");
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (e) {
      vite?.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
      next();
    }
  });
}

export { init };
