-- Admin users for CMS dashboard
CREATE TABLE IF NOT EXISTS admins (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    TEXT NOT NULL,             -- bcrypt hash
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Menu categories
CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL     -- 'Coffee', 'Non-Coffee', 'Light Bites'
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id             SERIAL PRIMARY KEY,
  category_id    INT REFERENCES categories(id) ON DELETE SET NULL,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url      TEXT,                   -- URL returned by storage adapter
  is_best_seller BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_best_seller ON menu_items(is_best_seller) WHERE is_best_seller = TRUE;

-- Gallery photos
CREATE TABLE IF NOT EXISTS gallery_photos (
  id          SERIAL PRIMARY KEY,
  image_url   TEXT NOT NULL,
  alt_text    VARCHAR(255),
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_photos_sort_order ON gallery_photos(sort_order);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  author_name VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);
