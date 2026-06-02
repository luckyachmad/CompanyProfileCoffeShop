import Image from 'next/image';
import MenuClient from './MenuClient';
import Badge from '@/components/ui/Badge';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import type { MenuItemWithCategory } from '@/types/menu';

/**
 * Featured Menu Section - Server Component
 * 
 * Renders the coffee shop's menu items grouped by category with:
 * - Data fetched from /api/menu with 60-second revalidation
 * - Items grouped by category (Coffee, Non-Coffee, Light Bites)
 * - Cards displaying image, title, description, price, Best Seller badge
 * - WhatsApp order button for each item
 * - Framer Motion stagger animation on card grid
 * - Empty/error state fallback messages
 * - Uses semantic <section> element with proper structure
 * 
 * This component is a Server Component that fetches data server-side.
 * Animations are delegated to MenuClient.
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 16.3, 16.5**
 */

/**
 * Fetches menu items from the API with 60-second revalidation
 */
async function getMenuItems(): Promise<MenuItemWithCategory[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/menu`, {
      next: { revalidate: 60 } // 60-second revalidation per requirement 4.1
    });

    if (!response.ok) {
      console.error('Failed to fetch menu items:', response.statusText);
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

/**
 * Groups menu items by category name
 */
function groupByCategory(items: MenuItemWithCategory[]): Record<string, MenuItemWithCategory[]> {
  return items.reduce((groups, item) => {
    const category = item.category_name || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, MenuItemWithCategory[]>);
}

/**
 * Formats price as currency string (Indonesian Rupiah)
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export default async function Menu() {
  const menuItems = await getMenuItems();
  
  // Handle empty state per requirement 4.7
  if (menuItems.length === 0) {
    return (
      <section id="menu" className="bg-background py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary text-center mb-12">
            Featured Menu
          </h2>
          <div className="text-center py-12">
            <p className="font-body text-lg text-text-muted">
              Our menu is being updated. Please check back soon or contact us via WhatsApp for our current offerings.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Group items by category per requirement 4.1
  const itemsByCategory = groupByCategory(menuItems);
  const categories = Object.keys(itemsByCategory).sort();

  return (
    <section id="menu" className="bg-background py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary text-center mb-12">
          Featured Menu
        </h2>

        {/* Category Sections */}
        <div className="space-y-16">
          {categories.map((categoryName) => (
            <div key={categoryName}>
              {/* Category Label */}
              <h3 className="font-heading text-2xl md:text-3xl font-semibold text-primary mb-8">
                {categoryName}
              </h3>

              {/* Menu Items Grid with Animation */}
              <MenuClient>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {itemsByCategory[categoryName].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl shadow-sm bg-surface border border-border p-6 flex flex-col"
                    >
                      {/* Item Image */}
                      {item.image_url && (
                        <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          {/* Best Seller Badge - requirement 4.4 */}
                          {item.is_best_seller && (
                            <div className="absolute top-3 right-3">
                              <Badge>Best Seller</Badge>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col">
                        {/* Title and Price */}
                        <div className="mb-3">
                          <h4 className="font-heading text-xl font-semibold text-text-primary mb-2">
                            {item.title}
                          </h4>
                          <p className="font-body font-medium text-lg text-primary">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Description */}
                        {item.description && (
                          <p className="font-body text-sm text-text-muted mb-4 flex-1">
                            {item.description}
                          </p>
                        )}

                        {/* WhatsApp Order Button - requirement 4.5 */}
                        <WhatsAppButton
                          variant="inline"
                          itemName={item.title}
                          className="w-full"
                        >
                          Order via WhatsApp
                        </WhatsAppButton>
                      </div>
                    </div>
                  ))}
                </div>
              </MenuClient>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
