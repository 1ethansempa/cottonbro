import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? 4001);
const host = process.env.HOST ?? "0.0.0.0";

const app = buildApp();
app
  .listen({ port, host })
  .then(() => {
    app.log.info(`API listening on http://${host}:${port}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
