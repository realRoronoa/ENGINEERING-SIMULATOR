import express, { Express } from 'express';
import { productRouter } from './products.js';
import { orderRouter } from './orders.js';
import { authRouter } from './auth.js';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'shopverse', timestamp: new Date().toISOString() });
  });

  app.use('/products', productRouter);
  app.use('/orders', orderRouter);
  app.use('/users', authRouter);

  return app;
}
