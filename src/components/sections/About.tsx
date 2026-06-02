import Image from 'next/image';
import AboutClient from './AboutClient';

/**
 * About Us Section - Server Component
 * 
 * Renders the coffee shop's brand story, philosophy, and unique value proposition with:
 * - Brand story text explaining the coffeeshop's origins and mission
 * - Philosophy statement about coffee craftsmanship and customer experience
 * - Unique value proposition highlighting what sets the shop apart
 * - Supporting photo at 16:9 aspect ratio showcasing the atmosphere
 * - Uses semantic <section> element for page section structure
 * 
 * This component is a Server Component that renders static content.
 * Animations are delegated to AboutClient.
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 16.3, 16.5**
 */
export default function About() {
  return (
    <section id="about" className="bg-background py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <AboutClient>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              {/* Section Heading */}
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
                About Our Coffee Shop
              </h2>

              {/* Brand Story */}
              <section className="space-y-4">
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-primary">
                  Our Story
                </h3>
                <p className="font-body text-base md:text-lg text-text-muted leading-relaxed">
                  Founded with a passion for exceptional coffee and genuine hospitality, 
                  our coffee shop has been a beloved community gathering place since day one. 
                  We believe that every cup tells a story — from the farmers who grow our beans 
                  to the baristas who craft each drink with care and precision.
                </p>
              </section>

              {/* Philosophy Statement */}
              <section className="space-y-4">
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-primary">
                  Our Philosophy
                </h3>
                <p className="font-body text-base md:text-lg text-text-muted leading-relaxed">
                  We are committed to sourcing only the finest beans, roasted to perfection, 
                  and prepared with techniques that honor both tradition and innovation. 
                  Every detail matters — from the water temperature to the smile we share 
                  with each guest. Coffee is more than a beverage; it's an experience, 
                  a moment of connection, and a daily ritual worth celebrating.
                </p>
              </section>

              {/* Value Proposition */}
              <section className="space-y-4">
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-primary">
                  What Makes Us Special
                </h3>
                <p className="font-body text-base md:text-lg text-text-muted leading-relaxed">
                  Unlike typical coffee chains, we offer a truly personalized experience. 
                  Our skilled baristas know your name, remember your favorite drink, and 
                  create a warm, inviting atmosphere where everyone feels at home. We combine 
                  artisanal coffee craftsmanship with a cozy ambiance, premium ingredients, 
                  and a genuine commitment to sustainability and community engagement.
                </p>
              </section>
            </div>

            {/* Supporting Photo */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/about-coffee-shop.webp"
                alt="Warm and inviting coffee shop interior with comfortable seating and artisanal coffee preparation"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
              />
            </div>
          </div>
        </AboutClient>
      </div>
    </section>
  );
}
