import { withTransaction, query } from '../db/client.js';

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'completed' | 'cancelled';
  total_cents: number;
  created_at: Date;
  items?: Array<{
    id: number;
    product_id: number;
    product_name?: string;
    quantity: number;
    unit_price_cents: number;
  }>;
}

export async function createOrder(userId: number, items: OrderItemInput[]): Promise<Order> {
  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  return withTransaction(async (client) => {
    let totalCents = 0;
    const validatedItems: Array<{
      productId: number;
      quantity: number;
      priceCents: number;
    }> = [];

    // Verify stock and calculate total price
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new Error(`Invalid item quantity: ${item.quantity}`);
      }

      const productRes = await client.query<{
        id: number;
        price_cents: number;
        stock: number;
      }>('SELECT id, price_cents, stock FROM products WHERE id = $1 FOR UPDATE', [item.productId]);

      const product = productRes.rows[0];
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.productId}. Available: ${product.stock}`
        );
      }

      // Deduct stock
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
        item.quantity,
        item.productId,
      ]);

      totalCents += product.price_cents * item.quantity;
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceCents: product.price_cents,
      });
    }

    // Insert order
    const orderRes = await client.query<Order>(
      'INSERT INTO orders (user_id, status, total_cents) VALUES ($1, $2, $3) RETURNING *',
      [userId, 'completed', totalCents]
    );
    const order = orderRes.rows[0];

    // Insert order items
    for (const item of validatedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES ($1, $2, $3, $4)',
        [order.id, item.productId, item.quantity, item.priceCents]
      );
    }

    return order;
  });
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  const orderRes = await query<Order>('SELECT * FROM orders WHERE id = $1', [orderId]);
  const order = orderRes.rows[0];
  if (!order) return null;

  const itemsRes = await query<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price_cents: number;
  }>('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

  order.items = itemsRes.rows;
  return order;
}
