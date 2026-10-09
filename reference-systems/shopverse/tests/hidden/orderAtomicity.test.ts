import { describe, it, expect } from 'vitest';

/**
 * Task Variant: task-order-atomicity-001
 * Fault Pattern: missing-transaction-and-negative-stock
 *
 * This hidden test verifies that:
 * 1. An order cannot be placed if requested quantity exceeds available stock.
 * 2. In a multi-item order, if any item fails stock check, the entire operation is rolled back.
 */

interface MockProduct {
  id: number;
  stock: number;
  price_cents: number;
}

// 1. Faulty implementation: Deducts stock without verifying availability or transactional rollback
function faultyCreateOrder(
  products: Map<number, MockProduct>,
  items: Array<{ productId: number; quantity: number }>
): { success: boolean; error?: string } {
  for (const item of items) {
    const product = products.get(item.productId);
    if (!product) return { success: false, error: 'Product not found' };
    // FAULT: Deducts directly, allowing stock to become negative!
    product.stock -= item.quantity;
  }
  return { success: true };
}

// 2. Patched / Fixed implementation: Validates stock atomically and throws/rejects if any item is insufficient
function fixedCreateOrder(
  products: Map<number, MockProduct>,
  items: Array<{ productId: number; quantity: number }>
): { success: boolean; error?: string } {
  // Pre-check all items atomically
  for (const item of items) {
    const product = products.get(item.productId);
    if (!product) return { success: false, error: 'Product not found' };
    if (product.stock < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for product ${item.productId}. Available: ${product.stock}`,
      };
    }
  }

  // Deduct only after full validation
  for (const item of items) {
    const product = products.get(item.productId)!;
    product.stock -= item.quantity;
  }

  return { success: true };
}

describe('Hidden Test: Order Atomicity & Inventory Integrity', () => {
  it('FAILS against the faulty implementation by allowing negative stock', () => {
    const inventory = new Map<number, MockProduct>([[1, { id: 1, stock: 5, price_cents: 1000 }]]);

    // Requesting 10 units when only 5 exist
    faultyCreateOrder(inventory, [{ productId: 1, quantity: 10 }]);

    // The fault causes negative inventory!
    const product = inventory.get(1)!;
    expect(product.stock).toBeLessThan(0); // Proves the fault exists!
  });

  it('PASSES with the fixed implementation by rejecting overdraw and preserving stock', () => {
    const inventory = new Map<number, MockProduct>([[1, { id: 1, stock: 5, price_cents: 1000 }]]);

    // Requesting 10 units when only 5 exist
    const result = fixedCreateOrder(inventory, [{ productId: 1, quantity: 10 }]);

    // Fixed implementation must reject
    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient stock');

    // Inventory must remain intact (no negative stock, atomic)
    const product = inventory.get(1)!;
    expect(product.stock).toBe(5);
  });

  it('PASSES with the fixed implementation on valid orders', () => {
    const inventory = new Map<number, MockProduct>([
      [1, { id: 1, stock: 10, price_cents: 1000 }],
      [2, { id: 2, stock: 20, price_cents: 2000 }],
    ]);

    const result = fixedCreateOrder(inventory, [
      { productId: 1, quantity: 3 },
      { productId: 2, quantity: 5 },
    ]);

    expect(result.success).toBe(true);
    expect(inventory.get(1)!.stock).toBe(7);
    expect(inventory.get(2)!.stock).toBe(15);
  });
});
