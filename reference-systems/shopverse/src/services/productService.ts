import { query } from '../db/client.js';

export interface Product {
  id: number;
  category_id: number | null;
  category_name?: string | null;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  stock: number;
  created_at: Date;
}

export async function listProducts(options?: {
  categoryId?: number;
  search?: string;
}): Promise<Product[]> {
  let sql = `
    SELECT p.id, p.category_id, c.name as category_name, p.name, p.slug, p.description, p.price_cents, p.stock, p.created_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (options?.categoryId) {
    params.push(options.categoryId);
    sql += ` AND p.category_id = $${params.length}`;
  }

  if (options?.search) {
    params.push(`%${options.search}%`);
    sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
  }

  sql += ' ORDER BY p.id ASC';

  const res = await query<Product>(sql, params);
  return res.rows;
}

export async function getProductById(id: number): Promise<Product | null> {
  const sql = `
    SELECT p.id, p.category_id, c.name as category_name, p.name, p.slug, p.description, p.price_cents, p.stock, p.created_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1
  `;
  const res = await query<Product>(sql, [id]);
  return res.rows[0] || null;
}
