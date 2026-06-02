import ContactClient from './ContactClient';

/**
 * Contact & Location Section - Server Component
 * 
 * Renders the coffee shop's contact information and location with:
 * - Interactive Google Maps iframe showing the coffeeshop location
 * - Full street address for navigation and reference
 * - Operating hours (days and times) for visit planning
 * - Phone number for direct contact
 * - Social media links for online engagement
 * - Uses semantic <section> element with proper landmarks
 * 
 * This component is a Server Component that renders static content.
 * Animations are delegated to ContactClient.
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 16.3, 16.5**
 */
export default function Contact() {
  return (
    <section id="contact" className="bg-background py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <ContactClient>
          {/* Section Heading */}
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
              Visit Us
            </h2>
            <p className="font-body text-base md:text-lg text-text-muted max-w-2xl mx-auto">
              Come experience our warm atmosphere and exceptional coffee. We look forward to serving you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Google Maps Embed */}
            <div className="w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613!3d-6.1951484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f42f8e3e2e2f%3A0x2e2e2e2e2e2e2e2e!2sCoffee%20Shop!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Coffee Shop Location Map"
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Address */}
              <div className="space-y-3">
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-primary flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Address
                </h3>
                <p className="font-body text-base md:text-lg text-text-muted leading-relaxed pl-9">
                  Jl. Kopi Nikmat No. 123<br />
                  Menteng, Jakarta Pusat<br />
                  DKI Jakarta 10310<br />
                  Indonesia
                </p>
              </div>

              {/* Operating Hours */}
              <div className="space-y-3">
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-primary flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Operating Hours
                </h3>
                <div className="font-body text-base md:text-lg text-text-muted pl-9 space-y-1">
                  <p className="flex justify-between max-w-xs">
                    <span className="font-medium">Monday - Friday:</span>
                    <span>07:00 - 22:00</span>
                  </p>
                  <p className="flex justify-between max-w-xs">
                    <span className="font-medium">Saturday:</span>
                    <span>08:00 - 23:00</span>
                  </p>
                  <p className="flex justify-between max-w-xs">
                    <span className="font-medium">Sunday:</span>
                    <span>08:00 - 21:00</span>
                  </p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-3">
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-primary flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone
                </h3>
                <a 
                  href="tel:+622123456789"
                  className="font-body text-base md:text-lg text-text-muted hover:text-primary transition-colors duration-300 pl-9 block"
                >
                  +62 21 2345 6789
                </a>
              </div>

              {/* Social Media Links */}
              <div className="space-y-3">
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-primary flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  Follow Us
                </h3>
                <div className="flex gap-4 pl-9">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com/coffeeshop"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Instagram"
                    className="w-12 h-12 rounded-full bg-primary hover:bg-primary-hover transition-all duration-300 ease-in-out flex items-center justify-center text-white hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com/coffeeshop"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Facebook"
                    className="w-12 h-12 rounded-full bg-primary hover:bg-primary-hover transition-all duration-300 ease-in-out flex items-center justify-center text-white hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* Twitter/X */}
                  <a
                    href="https://twitter.com/coffeeshop"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Twitter"
                    className="w-12 h-12 rounded-full bg-primary hover:bg-primary-hover transition-all duration-300 ease-in-out flex items-center justify-center text-white hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ContactClient>
      </div>
    </section>
  );
}
