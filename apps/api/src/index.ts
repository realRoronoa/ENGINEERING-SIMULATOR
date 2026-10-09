import { buildApp } from './app.js';

export { buildApp };

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

if (process.env.NODE_ENV !== 'test') {
  const app = buildApp();
  app.listen(port, host, () => {
    console.log(`API server running on http://${host}:${port}`);
  });
}
