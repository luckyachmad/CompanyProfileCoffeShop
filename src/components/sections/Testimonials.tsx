import TestimonialsClient from './TestimonialsClient';
import type { Testimonial } from '@/types/testimonial';

/**
 * Testimonials Section - Server Component
 * 
 * Renders customer testimonials with:
 * - Data fetched from /api/testimonials with 10-minute revalidation
 * - Each testimonial displayed as a card with author_name, content, and star rating
 * - Card grid layout (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
 * - Framer Motion whileInView animation with stagger
 * - Empty/error state fallback with static testimonials
 * - Uses semantic <section> element with proper structure
 * 
 * This component is a Server Component that fetches data server-side.
 * Animations are delegated to TestimonialsClient.
 * 
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 16.3**
 */

/**
 * Static fallback testimonials (used when API fails or returns empty)
 * Per requirement 6.6: section SHALL NOT render blank if API fails
 */
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    author_name: 'Sarah Johnson',
    content: 'The best coffee in town! The ambiance is cozy and perfect for working or catching up with friends. Their espresso is absolutely divine.',
    rating: 5,
    created_at: new Date('2024-01-15')
  },
  {
    id: 2,
    author_name: 'Michael Chen',
    content: 'Amazing selection of both coffee and non-coffee drinks. The staff is incredibly friendly and knowledgeable. Highly recommend the caramel latte!',
    rating: 5,
    created_at: new Date('2024-01-10')
  },
  {
    id: 3,
    author_name: 'Emma Rodriguez',
    content: 'A hidden gem! The atmosphere is warm and inviting, and their light bites pair perfectly with the coffee. Will definitely be coming back.',
    rating: 4,
    created_at: new Date('2024-01-05')
  }
];

/**
 * Fetches testimonials from the API with 10-minute revalidation
 */
async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/testimonials`, {
      next: { revalidate: 600 } // 10-minute (600 seconds) revalidation per requirement 6.1
    });

    if (!response.ok) {
      console.error('Failed to fetch testimonials:', response.statusText);
      return FALLBACK_TESTIMONIALS; // Fallback per requirement 6.6
    }

    const data = await response.json();
    
    // If API returns empty array, use fallback per requirement 6.6
    if (!data || data.length === 0) {
      return FALLBACK_TESTIMONIALS;
    }

    return data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return FALLBACK_TESTIMONIALS; // Fallback per requirement 6.6
  }
}

/**
 * Renders a star rating indicator (1-5 stars)
 * Per requirement 6.3: rating field SHALL be rendered as visual star indicator
 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const starIndex = index + 1;
        const isFilled = starIndex <= rating;
        
        return (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isFilled ? 'text-secondary fill-secondary' : 'text-border fill-border'}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      })}
    </div>
  );
}

export default async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <section id="testimonials" className="bg-background py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary text-center mb-4">
          What Our Customers Say
        </h2>
        <p className="font-body text-lg text-text-muted text-center mb-12 max-w-2xl mx-auto">
          Don't just take our word for it — hear from our valued customers about their experiences
        </p>

        {/* Testimonials Grid with Animation */}
        <TestimonialsClient>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-2xl shadow-sm bg-surface border border-border p-6 flex flex-col"
              >
                {/* Star Rating - requirement 6.2, 6.3 */}
                <div className="mb-4">
                  <StarRating rating={testimonial.rating} />
                </div>

                {/* Testimonial Content - requirement 6.2 */}
                <blockquote className="font-body text-text-primary mb-6 flex-1">
                  <p className="italic leading-relaxed">"{testimonial.content}"</p>
                </blockquote>

                {/* Author Name - requirement 6.2 */}
                <div className="border-t border-border pt-4">
                  <p className="font-heading font-semibold text-text-primary">
                    {testimonial.author_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TestimonialsClient>
      </div>
    </section>
  );
}
