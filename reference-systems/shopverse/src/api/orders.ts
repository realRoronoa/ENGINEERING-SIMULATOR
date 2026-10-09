import { Router, Request, Response } from 'express';
import { createOrder, getOrderById } from '../services/orderService.js';

export const orderRouter = Router();

orderRouter.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'userId and non-empty items array are required' });
    }

    const order = await createOrder(userId, items);
    res.status(201).json({ order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Insufficient stock') || message.includes('not found')) {
      return res.status(400).json({ error: message });
    }
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to process checkout' });
  }
});

orderRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const order = await getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Failed to get order:', error);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
});
