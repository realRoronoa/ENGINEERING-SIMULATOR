import { Router, Request, Response } from 'express';
import { listProducts, getProductById } from '../services/productService.js';

export const productRouter = Router();

productRouter.get('/', async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category_id
      ? parseInt(req.query.category_id as string, 10)
      : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const products = await listProducts({ categoryId, search });
    res.json({ products });
  } catch (error) {
    console.error('Failed to list products:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

productRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Failed to get product:', error);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});
