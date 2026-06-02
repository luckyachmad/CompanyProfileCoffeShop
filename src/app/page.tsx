import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Menu from '@/components/sections/Menu';
import Gallery from '@/components/sections/Gallery';
import Testimonials from '@/components/sections/Testimonials';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

/**
 * Landing Page - Root Route
 * 
 * Composes all seven sections in the required order:
 * 1. Hero / Banner
 * 2. About Us (Tentang Kami)
 * 3. Featured Menu (Menu Unggulan)
 * 4. Gallery (Galeri Foto)
 * 5. Testimonials (Testimoni)
 * 6. Contact & Location
 * 7. Footer
 * 
 * Plus: Floating WhatsApp CTA button (persistent across all scroll positions)
 * 
 * This component is a Server Component that imports and composes section components.
 * No inline JSX markup, data-fetching logic, or business logic per requirement 1.8.
 * 
 * **Validates: Requirements 1.1, 1.3, 1.4, 1.7, 1.8**
 */
export default function HomePage() {
  return (
    <main className="bg-background min-h-screen">
      {/* Section 1: Hero / Banner */}
      <Hero />
      
      {/* Section 2: About Us */}
      <About />
      
      {/* Section 3: Featured Menu */}
      <Menu />
      
      {/* Section 4: Gallery */}
      <Gallery />
      
      {/* Section 5: Testimonials */}
      <Testimonials />
      
      {/* Section 6: Contact & Location */}
      <Contact />
      
      {/* Section 7: Footer */}
      <Footer />
      
      {/* Floating WhatsApp Button (persistent across all sections) */}
      <WhatsAppButton variant="floating" />
    </main>
  );
}
