//https://medium.com/@rishabhgupta7210012474/understanding-server-side-rendering-ssr-in-react-with-vite-fca1935e6715

import express from "express";

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
const isProduction = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 3000;
const base = process.env.BASE || '/'


const { init } = isProduction ?  await import('./server-prd.js') : await import('./server-dev.js');

let app = express();

init(app, { base });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});