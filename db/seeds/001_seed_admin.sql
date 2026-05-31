-- Insert default categories
-- These categories are used for menu item classification
INSERT INTO categories (name) VALUES 
  ('Coffee'),
  ('Non-Coffee'),
  ('Light Bites')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin account
-- Email: admin@coffeeshop.com
-- Password: admin123 (bcrypt hash with cost factor 10)
-- IMPORTANT: Change this password immediately in production!
INSERT INTO admins (email, password) VALUES 
  ('admin@coffeeshop.com', '$2b$10$cwbw7v29SQ0JhzRe/7zs4ONxvIB2C7khnznAFQVnCudNtf7fg303S')
ON CONFLICT (email) DO NOTHING;
