import fs from "node:fs/promises";
import compression from "compression";
import sirv from "sirv";

import { render } from "./dist/server/entry-server.js";

console.log("environment: Production");

const ssrManifest = await fs.readFile(
  "./dist/client/.vite/ssr-manifest.json",
  "utf-8"
);

function init(app, { base }) {
  app.use(compression());

  app.use(base, sirv("./dist/client", { extensions: [] }));

  app.use("*", async (req, res, next) => {
    try {
      const template = await fs.readFile("./dist/client/public/index.html", "utf-8");
      const url = req.originalUrl.replace(base, "");

      const appHtml = await render(url, ssrManifest);

      const html = template.replace(`<!--ssr-outlet-->`, appHtml ?? "");

      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (e) {
      console.log(e.stack);
      res.status(500).end(e.stack);
      next();
    }
  });
}

export { init };
