-- Seed data for Shopverse reference system

INSERT INTO categories (id, name, slug) VALUES
  (1, 'Electronics', 'electronics'),
  (2, 'Books', 'books'),
  (3, 'Home & Kitchen', 'home-kitchen')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (id, category_id, name, slug, description, price_cents, stock) VALUES
  (1, 1, 'Mechanical Keyboard', 'mechanical-keyboard', 'RGB backlight tactile switches', 8999, 50),
  (2, 1, 'Wireless Gaming Mouse', 'wireless-gaming-mouse', 'Ultra-lightweight 26K DPI sensor', 5999, 35),
  (3, 1, 'Noise Cancelling Headphones', 'noise-cancelling-headphones', 'Over-ear active noise cancelling', 14999, 20),
  (4, 2, 'Designing Data-Intensive Applications', 'ddia-book', 'The definitive guide to data architecture', 4500, 100),
  (5, 3, 'Ceramic Pour-Over Coffee Dripper', 'coffee-dripper', 'Artisan manual coffee dripper', 2400, 15)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (id, email, password_hash, full_name) VALUES
  (1, 'learner@example.com', 'hashed:password123', 'Sample Learner')
ON CONFLICT (email) DO NOTHING;
