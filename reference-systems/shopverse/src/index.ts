import { createApp } from './api/app.js';

const app = createApp();
const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Shopverse reference system listening on http://${host}:${port}`);
});
