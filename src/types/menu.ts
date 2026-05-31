export interface Category {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_best_seller: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MenuItemWithCategory extends MenuItem {
  category_name: string | null;
}
